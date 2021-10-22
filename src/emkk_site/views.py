import jwt
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer, MultiPartRenderer
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from src.jwt_auth.permissions import IsReviewer, IsIssuer
from rest_framework.parsers import BaseParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics, mixins
from rest_framework import status
from django.http import Http404
from django.views import View

from .serializers import (
    DocumentSerializer, TripSerializer, ReviewSerializer,
    DocumentDetailSerializer, ReviewFromIssuerSerializer)

from .services import get_trips_available_for_reviews, try_change_status_from_review_to_at_issuer

from ..jwt_auth.models import User
from .models import Document, Trip, Review, TripStatus, TripsOnReviewByUser, ReviewFromIssuer


class TripsForReview(generics.ListAPIView):
    queryset = Trip.objects.all()

    def list(self, request, *args, **kwargs):
        trips_available_for_review = get_trips_available_for_reviews()
        serializer = TripSerializer(trips_available_for_review, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TripList(generics.ListCreateAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

    permission_classes = [IsAuthenticated, ]

    def get_serializer_context(self):
        context = super(TripList, self).get_serializer_context()
        context.update({"token": self.request.headers["Authorization"]})
        return context

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = TripSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, excluded_fields=["status"], context=self.get_serializer_context())
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TripDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

    def retrieve(self, request, *args, **kwargs):
        trip = self.get_object()
        serializer = self.serializer_class(trip)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        trip = self.get_object()
        trip.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def update(self, request, *args, **kwargs):
        trip = self.get_object()
        serializer = self.serializer_class(trip, data=request.data)
        if trip.status != TripStatus.ON_REWORK:
            return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            data=f"Trip can be changed only in ON_REWORK status, but was in {trip.status} status")
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_object(self):
        try:
            return Trip.objects.get(pk=self.kwargs['pk'])
        except Trip.DoesNotExist as error:
            raise Http404


class DocumentList(generics.ListCreateAPIView):  # by trip_id
    serializer_class = DocumentSerializer
    renderer_classes = [BrowsableAPIRenderer, JSONRenderer]
    parser_classes = [MultiPartParser, ]

    def get_queryset(self):
        queryset = Document.objects.all()
        trip_id = self.request.query_params.get('trip_id')
        if not trip_id:
            return queryset
        return queryset.filter(trip_id=trip_id)

    def list(self, request, *args, **kwargs):
        trip_id = kwargs['pk']
        try:
            trip = Trip.objects.get(pk=trip_id)
        except ObjectDoesNotExist:
            return NotFound(detail='No such trip')
        docs = Document.objects.filter(trip_id=trip.pk)
        docs_ids = list(map(lambda d: d.id, docs))
        return Response(docs_ids)


class DocumentDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentDetailSerializer
    renderer_classes = [BrowsableAPIRenderer, JSONRenderer, ]
    parser_classes = [MultiPartParser, ]

    def retrieve(self, request, *args, **kwargs):
        document = self.get_object()
        serializer = self.serializer_class(document)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        document = self.get_object()
        serializer = self.serializer_class(document, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        document = self.get_object()
        document.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_object(self):
        try:
            return Document.objects.get(pk=self.kwargs['doc_id'])
        except Trip.DoesNotExist as error:  ##TODO Заменить Trip на Document
            raise Http404

    # def retrieve(self, request, *args, **kwargs):
    #     document = Document.objects.get(pk=kwargs['pk'])
    #     response = HttpResponse(
    #         document.content, content_type=document.content_type)
    #     response['Content-Disposition'] = 'attachment'
    #     return response


class ReviewList(generics.ListCreateAPIView):
    """Эндпоинт доступен только для рецензентов"""
    serializer_class = ReviewSerializer
    permission_classes = [IsReviewer, ]

    def get_queryset(self):
        return Review.objects.filter(trip_id=self.kwargs["pk"])

    def create(self, request, *args, **kwargs):
        trip_id = kwargs["pk"]
        trip = Trip.objects.get(pk=trip_id)
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            reviewer = serializer.validated_data['reviewer']
            if not TripsOnReviewByUser.objects.filter(trip=trip, user=reviewer).count():
                return Response("error", status=status.HTTP_422_UNPROCESSABLE_ENTITY)

            review = serializer.save()
            try_change_status_from_review_to_at_issuer(trip)
            TripsOnReviewByUser.objects.filter(trip=review.trip, user=review.reviewer).delete()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class ReviewFromIssuerDetail(
    generics.CreateAPIView, generics.UpdateAPIView, generics.RetrieveAPIView):
    """Эндпоинт доступен только для выпускающих"""
    queryset = ReviewFromIssuer.objects.all()
    serializer_class = ReviewFromIssuerSerializer
    permission_classes = [IsIssuer, ]

    def create(self, request, *args, **kwargs):
        trip_id = kwargs["pk"]
        trip = Trip.objects.get(pk=trip_id)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            result = serializer.validated_data['result']
            if trip.status == TripStatus.AT_ISSUER:
                trip.status = result
                trip.save()

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsReviewer | IsIssuer, ])
def take_trip_on_review(request, *args, **kwargs):
    trip_id = kwargs['trip_id']
    try:
        trip = Trip.objects.get(pk=trip_id)
    except Trip.DoesNotExist:
        raise Http404(f"No trip by id: {trip_id}")
    in_work_record = TripsOnReviewByUser(user=request.user, trip=trip)
    in_work_record.save()
    return Response(status=status.HTTP_200_OK)


@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def change_trip_status(request, *args, **kwargs):
    trip_id = kwargs['trip_id']
    try:
        trip = Trip.objects.get(pk=trip_id)
    except Trip.DoesNotExist:
        raise Http404(f"No trip by id: {trip_id}")
    new_status_str = request.query_params["new_status"]
    status_by_name = {
        "ROUTE_COMPLETED": TripStatus.ROUTE_COMPLETED,
        "ON_ROUTE": TripStatus.ON_ROUTE,
        "TAKE_PAPERS": TripStatus.TAKE_PAPERS,
        "ALARM": TripStatus.ALARM
    }
    if new_status_str in status_by_name:
        trip.status = status_by_name[new_status_str]
        trip.save()
        return Response(status=status.HTTP_200_OK)
    return Response(status=status.HTTP_400_BAD_REQUEST,
                    data=f"Status can be changed to {list(status_by_name.keys())}. But {new_status_str} found")
