from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import NotFound
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer, MultiPartRenderer
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.parsers import BaseParser, MultiPartParser
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from django.http import Http404

from .serializers import (
    DocumentSerializer, TripSerializer, ReviewSerializer,
    DocumentDetailSerializer)

from .models import Document, Trip, Review, TripStatus


class TripList(generics.ListCreateAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    authentication_classes = [SessionAuthentication, ]

    # permission_classes = [IsAuthenticated, ]

    def list(self, request, *args, **kwargs):
        print(request.user)
        queryset = self.get_queryset()
        serializer = TripSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, excluded_fields=["status"])
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


# def create(self, request, *args, **kwargs):
#     trip_id = request.data['trip']
#
#     if not Trip.objects.filter(pk=trip_id).exists():
#         return Response(status=status.HTTP_404_NOT_FOUND,
#                         data={'error': 'related trip not found'})
#
#     file = request.FILES['file']
#     document = Document(
#         trip_id=trip_id, content=file.read(), content_type=file.content_type)
#
#     document.save()
#     return Response(status=status.HTTP_201_CREATED)


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
        except Trip.DoesNotExist as error:
            raise Http404

    # def retrieve(self, request, *args, **kwargs):
    #     document = Document.objects.get(pk=kwargs['pk'])
    #     response = HttpResponse(
    #         document.content, content_type=document.content_type)
    #     response['Content-Disposition'] = 'attachment'
    #     return response


class ReviewList(generics.ListCreateAPIView):
    """При получении ревью на заявку, вычислить кол-во ревью, привязанных к этой заявке.
        Если их стало больше необходимого кол-ва - исключение 4**
        Создаем. После создание вызов обработчика, который поменяет статус заявки, если их набролось достаточное кол-во"""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def create(self, request, *args, **kwargs):
        trip_id = kwargs["pk"]
        trip = Trip.objects.get(pk=trip_id)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            trip.try_change_status_from_review_to_at_issuer()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer