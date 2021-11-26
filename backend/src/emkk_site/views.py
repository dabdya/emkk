from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from django.http import HttpResponse, FileResponse

import uuid

from src.jwt_auth.permissions import (
    IsReviewer, IsIssuer, IsAuthenticated, ReadOnly, IsTripOwner, IsDocumentOwner)

from src.emkk_site.serializers import (
    DocumentSerializer, TripSerializer, TripDetailSerializer, TripForAnonymousSerializer,
    ReviewSerializer, ReviewFromIssuerSerializer,
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
        context = super().get_serializer_context()
        context.update({"user": self.request.user})
        return context

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return TripSerializer
        return WorkRegisterSerializer

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

        return super().create(request, *args, **kwargs)


class TripList(generics.ListCreateAPIView):
    queryset = Trip.objects.all()
    permission_classes = [IsAuthenticated | ReadOnly, ]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"user": self.request.user})
        return context

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return TripSerializer
        return TripForAnonymousSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, args, kwargs)
        return response


class TripDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripDetailSerializer
    permission_classes = [IsAuthenticated & ReadOnly | IsTripOwner]

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, args, kwargs)
        return response

    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, args, kwargs)
        return response

    def update(self, request, *args, **kwargs):
        response = super().update(request, args, kwargs)
        return response

    def get_object(self):
        self.lookup_url_kwarg = 'pk'
        return super().get_object()


class DocumentDetail(generics.RetrieveDestroyAPIView):
    permission_classes = [IsDocumentOwner | IsIssuer | IsReviewer, ]

    def retrieve(self, request, *args, **kwargs):
        document = self.get_object()
        if document:
            with open(document.file.path, 'r') as file:
                doc_data = file.read()
            response = HttpResponse(doc_data, content_type=document.content_type)
            return response
        rev = get_review(self.kwargs['doc_uuid'])
        if rev.file:
            with open(rev.file.path, 'rb') as file:
                return HttpResponse(file.read(), content_type=rev.content_type)
        return Response(status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, *args, **kwargs):
        def delete_file(path):
            import os
            if os.path.isfile(path):
                os.remove(path)

        document = self.get_object()
        if not document:
            return Response(status=status.HTTP_404_NOT_FOUND)
        delete_file(document.file.path)
        document.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_object(self):
        doc_uuid = self.kwargs['doc_uuid']
        try:
            document = Document.objects.get(uuid=doc_uuid)
            return document
        except Document.DoesNotExist:
            pass


def get_review(doc_uuid):
    try:
        review = Review.objects.get(file_uuid=doc_uuid)
    except Review.DoesNotExist:
        return None
    return review


class DocumentList(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsDocumentOwner | IsReviewer | IsIssuer, ]

    def get_related_trip(self):
        trip_id = self.kwargs['pk']
        try:
            return Trip.objects.get(pk=trip_id)
        except Document.DoesNotExist:
            pass

    def list(self, request, *args, **kwargs):
        trip = self.get_related_trip()
        if not trip:
            return Response(status=status.HTTP_404_NOT_FOUND)

        response_data = []

        for document in Document.objects.filter(trip_id=trip.pk):
            response_data.append({
                'uuid': document.uuid,
                'filename': document.filename
            })

        return Response(response_data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        trip = self.get_related_trip()
        if not trip:
            return Response(status=status.HTTP_404_NOT_FOUND)

        documents = []
        for file in self.request.FILES.getlist('file'):
            document = Document(
                trip=trip, file=file, uuid=uuid.uuid4(),
                content_type=file.content_type, filename=file.name)
            document.save()

            documents.append({
                'uuid': document.uuid,
                'filename': document.filename})

        return Response(documents, status=status.HTTP_201_CREATED)

    def get_queryset(self):  # for fix
        return Document.objects.all()


class ReviewView(generics.ListCreateAPIView):
    """Basic class for IssuerReview and ReviewerReview"""

    def __init__(self, model_class):
        super().__init__()
        self.model_class = model_class

    def get_queryset(self):
        return self.model_class.objects.filter(trip_id=self.kwargs["pk"])

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"reviewer": self.request.user})
        return context

    def create(self, request, *args, **kwargs):
        trip_id = kwargs["pk"]
        trip = Trip.objects.get(pk=trip_id)
        data = request.data
        serializer = self.serializer_class(
            data=data, context=self.get_serializer_context())

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

            if isinstance(context_class, ReviewerList):
                try_change_status_from_review_to_at_issuer(trip)
            elif isinstance(context_class, IssuerList):
                result = serializer.validated_data["result"]
                try_change_trip_status_to_issuer_result(trip, result)

            WorkRegister.objects.filter(trip=trip, user=user).delete()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewerList(ReviewView):
    """Endpoint for creating reviews by reviewers"""

    def __init__(self):
        super(ReviewerList, self).__init__(Review)

    serializer_class = ReviewSerializer
    permission_classes = [IsReviewer | IsIssuer | IsAuthenticated & ReadOnly, ]

    def create(self, request, *args, **kwargs):
        kwargs.update({"context_class": self})
        data = request.data
        # for file in self.request.FILES.getlist('file'):
        #     document = ReviewDocument(trip=data.get())
        #     document.save()
        return super(ReviewerList, self).create(request, *args, **kwargs)


class IssuerList(ReviewView):
    """Endpoint for creating reviews by issuers"""

    def __init__(self):
        super(IssuerList, self).__init__(ReviewFromIssuer)

    serializer_class = ReviewFromIssuerSerializer
    permission_classes = [IsIssuer | IsAuthenticated & ReadOnly, ]

    def create(self, request, *args, **kwargs):
        kwargs.update({"context_class": self})
        return super(IssuerList, self).create(request, *args, **kwargs)

# @api_view(['POST'])
# # @permission_classes([IsAuthenticated])
# def change_trip_status(request, *args, **kwargs):
#     trip_id = kwargs['trip_id']
#     try:
#         trip = Trip.objects.get(pk=trip_id)
#     except Trip.DoesNotExist:
#         raise Http404(f"No trip by id: {trip_id}")
#     new_status_str = request.query_params["new_status"]
#     status_by_name = {
#         "ROUTE_COMPLETED": TripStatus.ROUTE_COMPLETED,
#         "ON_ROUTE": TripStatus.ON_ROUTE,
#         "TAKE_PAPERS": TripStatus.TAKE_PAPERS,
#         "ALARM": TripStatus.ALARM
#     }
#     if new_status_str in status_by_name:
#         trip.status = status_by_name[new_status_str]
#         trip.save()
#         return Response(status=status.HTTP_200_OK)
#     return Response(status=status.HTTP_400_BAD_REQUEST,
#                     data=f"Status can be changed to {list(status_by_name.keys())}. But {new_status_str} found")
