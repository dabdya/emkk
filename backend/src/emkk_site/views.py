from django.core.exceptions import ObjectDoesNotExist
from rest_framework.decorators import api_view

from rest_framework.renderers import (
    JSONRenderer, BrowsableAPIRenderer, MultiPartRenderer)

from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from django.http import Http404, HttpResponse

import uuid

from src.jwt_auth.permissions import (
    IsReviewer, IsIssuer, IsAuthenticatedOrReadOnly)

from src.emkk_site.serializers import (
    DocumentSerializer, TripSerializer, TripDetailSerializer, TripForAnonymousSerializer,
    ReviewSerializer, DocumentDetailSerializer, ReviewFromIssuerSerializer,
    WorkRegisterSerializer)

from src.emkk_site.services import (
    get_trips_available_for_work,
    try_change_status_from_review_to_at_issuer,
    try_change_trip_status_to_issuer_result, )

from src.emkk_site.models import (
    Document, Trip, Review, TripStatus, WorkRegister, ReviewFromIssuer)


class WorkRegisterView(generics.ListCreateAPIView):
    permission_classes = [IsReviewer | IsIssuer, ]

    def get_serializer_context(self):
        context = super(WorkRegisterView, self).get_serializer_context()
        context.update({"user": self.request.user})
        return context

    def get_serializer(self, *args, **kwargs):
        if self.request.method == 'GET':
            return TripSerializer(self.get_queryset(), many=True)

        return WorkRegisterSerializer(
            data=self.request.data, context=self.get_serializer_context())

    def get_queryset(self):
        return get_trips_available_for_work(self.request.user)

    def create(self, request, *args, **kwargs):

        trip = self.request.data.get('trip', None)
        if not trip:
            return Response('Trip required', status=status.HTTP_400_BAD_REQUEST)

        if Review.objects.filter(reviewer=self.request.user, trip=trip):
            return Response(
                'Review already exist for this trip. Cant take trip in work again',
                status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        return super(WorkRegisterView, self).create(request, *args, **kwargs)


class TripList(generics.ListCreateAPIView):
    queryset = Trip.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly, ]

    def get_serializer_context(self):
        context = super(TripList, self).get_serializer_context()
        context.update({"user": self.request.user})
        return context

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return TripSerializer
        return TripForAnonymousSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer_class()(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer_class()(
            data=request.data, context=self.get_serializer_context())
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TripDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripDetailSerializer

    # сделать пермишен для владельца заявки и работников МКК, остальным нет
    permission_classes = [IsAuthenticated, ]

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
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_object(self):
        try:
            return Trip.objects.get(pk=self.kwargs['pk'])
        except Trip.DoesNotExist as error:
            raise Http404


class DocumentProxyView(generics.ListAPIView):

    def list(self, request, *args, **kwargs):
        doc_uuid = kwargs['doc_uuid']
        try:
            document = Document.objects.get(uuid=doc_uuid)
        except Document.DoesNotExist as err:
            return Response(status=status.HTTP_404_NOT_FOUND)

        with open(document.file.path, 'rb') as file:
            doc_data = file.read()

        response = HttpResponse(doc_data, content_type=document.content_type)
        return response


class DocumentList(generics.ListCreateAPIView):  # by trip_id
    serializer_class = DocumentSerializer
    renderer_classes = [BrowsableAPIRenderer, JSONRenderer]
    parser_classes = [MultiPartParser, ]

    permission_classes = [IsAuthenticated, ]

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
            return Response(status=status.HTTP_404_NOT_FOUND)
        docs = Document.objects.filter(trip_id=trip.pk)
        docs_ids = list(map(lambda d: d.id, docs))
        return Response(docs_ids)

    def create(self, request, *args, **kwargs):
        trip_id = kwargs['pk']
        try:
            trip = Trip.objects.get(id=trip_id)
        except Trip.DoesNotExist as err:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        documents = []
        for file in self.request.FILES.getlist('file'):
            doc_uuid = uuid.uuid4()

            document = Document(
                trip=trip, file=file, uuid=doc_uuid,
                content_type=file.content_type, filename=file.name)
            document.save()

            documents.append({
                'uuid': document.uuid,
                'id': document.id,
                'filename': document.filename})

        return Response(documents, status=status.HTTP_201_CREATED)


class DocumentDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentDetailSerializer
    renderer_classes = [BrowsableAPIRenderer, JSONRenderer, ]
    parser_classes = [MultiPartParser, ]
    permission_classes = [IsAuthenticated, ]

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


class ReviewView(generics.ListCreateAPIView):
    """Basic class for IssuerReview and ReviewerReview"""

    def __init__(self, model_class):
        super(ReviewView, self).__init__()
        self.model_class = model_class

    def get_queryset(self):
        return self.model_class.objects.filter(trip_id=self.kwargs["pk"])

    def get_serializer_context(self):
        context = super(ReviewView, self).get_serializer_context()
        context.update({"reviewer": self.request.user})
        return context

    def create(self, request, *args, **kwargs):
        trip_id = kwargs["pk"]
        trip = Trip.objects.get(pk=trip_id)
        serializer = self.serializer_class(
            data=request.data, context=self.get_serializer_context())

        context_class = kwargs.get("context_class", None)

        if serializer.is_valid():
            user = request.user

            if not WorkRegister.objects.filter(trip=trip, user=user).count():
                return Response(
                    "Reviewer should take trip on work before create review",
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY)

            if Review.objects.filter(trip=trip, reviewer=user):
                return Response(
                    "Reviewer can't create several reviewers for one trip",
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY)

            serializer.save()

            if isinstance(context_class, ReviewerView):
                try_change_status_from_review_to_at_issuer(trip)
            elif isinstance(context_class, IssuerView):
                result = serializer.validated_data["result"]
                try_change_trip_status_to_issuer_result(trip, result)

            WorkRegister.objects.filter(trip=trip, user=user).delete()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewerView(ReviewView):
    """Endpoint for creating reviews by reviewers"""
    def __init__(self):
        super(ReviewerView, self).__init__(Review)

    serializer_class = ReviewSerializer
    permission_classes = [IsReviewer | IsAuthenticatedOrReadOnly, ]

    def create(self, request, *args, **kwargs):
        kwargs.update({"context_class": self})
        return super(ReviewerView, self).create(request, *args, **kwargs)


class ReviewDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated, ]


class IssuerView(ReviewView):
    """Endpoint for creating reviews by issuers"""
    def __init__(self):
        super(IssuerView, self).__init__(ReviewFromIssuer)

    serializer_class = ReviewFromIssuerSerializer
    permission_classes = [IsIssuer, ]

    def create(self, request, *args, **kwargs):
        kwargs.update({"context_class": self})
        return super(IssuerView, self).create(request, *args, **kwargs)


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
