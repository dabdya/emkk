from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from django.http import HttpResponse

from django.core.mail import send_mail
from django.conf import settings

from typing import Union
from functools import partial

from src.jwt_auth.permissions import (
    IsReviewer, IsIssuer, IsAuthenticated, ReadOnly, IsTripOwner, IsDocumentOwner, IsSecretary)

from src.emkk_site.serializers import (
    TripDocumentSerializer, TripSerializer, TripDetailSerializer, TripForAnonymousSerializer,
    ReviewSerializer, ReviewFromIssuerSerializer, BaseReviewSerializer,
    ReviewDocumentSerializer, ReviewFromIssuerDocumentSerializer)

from src.emkk_site.services import (
    try_change_status_from_review_to_at_issuer,
    try_change_trip_status_to_issuer_result, )

from src.emkk_site.models import (
    TripDocument, Trip, ReviewFromReviewer, TripStatus,
    ReviewFromIssuer, Document, ReviewDocument,
    ReviewFromIssuerDocument, Review)

from src.emkk_site.services import get_trips_available_for_work, user_can_be_issuer, user_can_be_reviewer

from src import emails


class TripList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated | ReadOnly, ]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"user": self.request.user})
        return context

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return TripSerializer
        return TripForAnonymousSerializer

    def get_queryset(self):
        f = self.request.query_params.get('filter', 'all')

        filters = {
            "all": Trip.objects.all,
            "my": partial(Trip.objects.filter, leader=self.request.user),
            "work": partial(get_trips_available_for_work, self.request.user),
        }

        return filters[f]()

    def create(self, request, *args, **kwargs):
        response = super().create(request, args, kwargs)
        return response


class TripDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripDetailSerializer
    permission_classes = [IsTripOwner | IsReviewer | IsIssuer | IsSecretary, ]

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, args, kwargs)
        return response

    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, args, kwargs)
        return response

    def update(self, request, *args, **kwargs):
        if Trip.objects.get(pk=kwargs["pk"]).status == TripStatus.REJECTED:
            return Response(
                "Rejected trip cannot be changed",
                status=status.HTTP_400_BAD_REQUEST)
        response = super().update(request, args, kwargs)
        return response

    def get_object(self):
        self.lookup_url_kwarg = 'pk'
        return super().get_object()


class DocumentDetail(generics.RetrieveDestroyAPIView):

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [IsDocumentOwner | IsIssuer | IsReviewer | IsSecretary, ]
        else:
            self.permission_classes = [IsDocumentOwner, ]
        return super().get_permissions()

    def retrieve(self, request, *args, **kwargs):
        document = self.get_object()
        self.check_object_permissions(request, document)

        if not document:
            return Response(status=status.HTTP_404_NOT_FOUND)

        with open(document.file.path, 'rb') as file:
            doc_data = file.read()

        response = HttpResponse(doc_data, content_type=document.content_type)
        return response

    def destroy(self, request, *args, **kwargs):
        def delete_file(path):
            import os
            if os.path.isfile(path):
                os.remove(path)

        document = self.get_object()
        self.check_object_permissions(request, document)

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


class DocumentList(generics.ListCreateAPIView):
    serializer_class = TripDocumentSerializer
    permission_classes = [IsTripOwner | IsReviewer | IsIssuer | IsSecretary, ]

    def __init__(self, model_class,  # TripDocument or ReviewDocument
                 related_model_class):  # Trip or Review
        super().__init__()
        self.model_class = model_class
        self.related_model_class = related_model_class

    def get_queryset(self):
        return self.model_class.get_by_related_obj_id(self.kwargs["pk"])

    def create(self, request, *args, **kwargs):
        related_model_obj = self.get_object()  # object of type Review or Trip
        self.check_object_permissions(request, related_model_obj)
        if not related_model_obj:
            return Response(status=status.HTTP_404_NOT_FOUND)
        documents = []
        for file in self.request.FILES.getlist('file'):
            document = self.model_class.create(related_model_obj)
            document.owner = self.request.user
            document.file = file
            document.content_type = file.content_type
            document.filename = file.name
            document.save()

            documents.append({
                'uuid': document.uuid,
                'filename': document.filename})
        return Response(documents, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        related_model_obj = self.get_object()
        self.check_object_permissions(request, related_model_obj)
        if not related_model_obj:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response([document.to_str_restricted() for document in self.get_queryset()],
                        status=status.HTTP_200_OK)

    def get_object(self) -> Union[Trip, ReviewFromReviewer]:
        obj_id = self.kwargs['pk']
        try:
            return self.related_model_class.objects.get(pk=obj_id)
        except self.related_model_class.DoesNotExist:
            pass


class ReviewDocumentList(DocumentList):
    serializer_class = ReviewDocumentSerializer

    def __init__(self):
        super().__init__(ReviewDocument, ReviewFromReviewer)


class ReviewFromIssuerDocumentList(DocumentList):
    serializer_class = ReviewFromIssuerDocumentSerializer

    def __init__(self):
        super().__init__(ReviewFromIssuerDocument, ReviewFromIssuer)


class TripDocumentList(DocumentList):
    serializer_class = TripDocumentSerializer

    def __init__(self):
        super().__init__(TripDocument, Trip)


class ReviewView(generics.ListCreateAPIView):
    """Basic class for IssuerReview and ReviewerReview"""

    def __init__(self, model_class):
        super().__init__()
        self.model_class = model_class

    def get_queryset(self):
        return self.model_class.objects.filter(trip_id=self.kwargs["pk"])

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({
            "reviewer": self.request.user,
            "trip_id": self.kwargs["pk"],
        })
        return context

    def get_related_trip(self):
        try:
            return Trip.objects.get(pk=self.kwargs['pk'])
        except Trip.DoesNotExist as err:
            return

    def create(self, request, *args, **kwargs):
        trip = self.get_related_trip()
        if not trip:
            msg = f"Trip with {trip.id} not found"
            return Response(msg, status=status.HTTP_404_NOT_FOUND)

        context_class = kwargs.get("context_class", None)
        if isinstance(context_class, ReviewerList):
            experience = user_can_be_reviewer
        else:
            experience = user_can_be_issuer

        if not experience(request.user, trip):
            msg = f"For trip with kind {trip.kind} " \
                  f"and difficulty {trip.difficulty_category} you are not experience"
            return Response(msg, status=status.HTTP_403_FORBIDDEN)

        serializer = self.serializer_class(
            data=request.data, context=self.get_serializer_context())

        if serializer.is_valid():
            user = request.user

            if self.model_class.objects.filter(trip=trip, reviewer=user):
                return Response(
                    "Reviewer can't create several reviewers for one trip",
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY)

            if isinstance(context_class, ReviewerList):
                try_change_status_from_review_to_at_issuer(trip)
            else:
                if trip.status != TripStatus.AT_ISSUER:
                    msg = f"Need at_issuer status, but found {trip.status}"
                    return Response(msg, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

                result = serializer.validated_data["result"]
                try_change_trip_status_to_issuer_result(trip, result)

            serializer.save()
            send_mail(emails.NEW_REVIEW_HEAD % (trip.id, trip.global_region, trip.local_region, ),
                      emails.NEW_REVIEW_BODY, settings.EMAIL_HOST_USER, [trip.leader.email, ],
                      fail_silently=True)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewerList(ReviewView):
    """Endpoint for creating reviews by reviewers"""

    def __init__(self):
        super(ReviewerList, self).__init__(ReviewFromReviewer)

    serializer_class = ReviewSerializer
    permission_classes = [IsReviewer | IsSecretary | IsAuthenticated & ReadOnly, ]

    def create(self, request, *args, **kwargs):
        kwargs.update({"context_class": self})
        return super(ReviewerList, self).create(request, *args, **kwargs)


class IssuerList(ReviewView):
    """Endpoint for creating reviews by issuers"""

    def __init__(self):
        super(IssuerList, self).__init__(ReviewFromIssuer)

    serializer_class = ReviewFromIssuerSerializer
    permission_classes = [IsSecretary | IsIssuer | IsAuthenticated & ReadOnly, ]

    def create(self, request, *args, **kwargs):
        kwargs.update({"context_class": self})
        return super(IssuerList, self).create(request, *args, **kwargs)


class ReviewDetail(generics.UpdateAPIView):
    serializer_class = BaseReviewSerializer
    permission_classes = [IsReviewer | IsIssuer | IsSecretary, ]

    def update(self, request, *args, **kwargs):
        review = self.get_object()
        self.check_object_permissions(request, review)
        serializer = self.get_serializer_class()(review, request.data)

        if serializer.is_valid():
            serializer.save()
            review_from_issuer = ReviewFromIssuer.objects.filter(pk=review.id).count() == 1
            if review_from_issuer:
                review.trip.status = review.result
                review.trip.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_object(self):
        return Review.objects.filter(pk=self.kwargs['pk']).first()


@api_view(['POST'])
@permission_classes([IsSecretary])
def change_trip_status(request, *args, **kwargs):
    trip_id = kwargs['pk']
    try:
        trip = Trip.objects.get(pk=trip_id)
    except Trip.DoesNotExist:
        raise Response(f"No trip by id: {trip_id}", status=status.HTTP_404_NOT_FOUND)
    new_status_str = request.query_params["new_status"].upper()
    status_by_name = {
        "ROUTE_COMPLETED": TripStatus.ROUTE_COMPLETED,
        "ON_ROUTE": TripStatus.ON_ROUTE,
        "TAKE_PAPERS": TripStatus.TAKE_PAPERS,
        "ALARM": TripStatus.ALARM
    }
    if new_status_str in status_by_name:
        trip.status = status_by_name[new_status_str]
        trip.save()

        status_to_email_repr = {
            'on_route': 'на маршруте',
            'route_completed': 'маршрут завершен',
            'take_papers': 'документы готовы',
            'alarm': 'аварийная ситуация',
        }

        send_mail(emails.CHANGE_STATUS_HEAD % (trip.id, trip.global_region, trip.local_region, ),
                  emails.CHANGE_STATUS_BODY % (status_to_email_repr[trip.status], ),
                  settings.EMAIL_HOST_USER, [trip.leader.email, ], fail_silently=True)
        return Response(status=status.HTTP_200_OK)

    return Response(status=status.HTTP_400_BAD_REQUEST,
                    data=f"Status can be changed to {list(status_by_name.keys())}. But {new_status_str} found")
