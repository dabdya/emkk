from rest_framework.renderers import JSONRenderer, BaseRenderer, BrowsableAPIRenderer, MultiPartRenderer
from rest_framework.parsers import BaseParser, MultiPartParser, FileUploadParser
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from django.http import Http404

from .serializers import (
    DocumentSerializer, TripGetSerializer, TripPostSerializer,
    UserSerializer, ReviewSerializer)

from .models import Document, Trip, Review, User


class TripList(generics.ListCreateAPIView):
    queryset = Trip.objects.all()
    serializer_classes = {
        'GET': TripGetSerializer,
        'POST': TripPostSerializer,
    }

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer_class()(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer_class()(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_class(self):
        return self.serializer_classes.get(self.request.method)


class TripDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripGetSerializer

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
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_object(self):
        try:
            return Trip.objects.get(pk=self.kwargs['pk'])
        except Trip.DoesNotExist as error:
            raise Http404


# class PDFRenderer(BaseRenderer):
#     media_type = 'application/pdf'
#     format = 'pdf'
#     charset = None
#     render_style = 'binary'
#
#     def render(self, data, media_type=None, renderer_context=None):
#         return data


class DocumentList(generics.ListCreateAPIView):
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
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        trip_id = request.data['trip']

        if not Trip.objects.filter(pk=trip_id).exists():
            return Response(status=status.HTTP_404_NOT_FOUND,
                            data={'error': 'related trip not found'})

        file = request.FILES['file']
        document = Document(
            trip_id=trip_id, content=file.read(), content_type=file.content_type)

        document.save()
        return Response(status=status.HTTP_201_CREATED)


class DocumentDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    # def retrieve(self, request, *args, **kwargs):
    #     document = Document.objects.get(pk=kwargs['pk'])
    #     response = HttpResponse(
    #         document.content, content_type=document.content_type)
    #     response['Content-Disposition'] = 'attachment'
    #     return response


class UserList(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class ReviewList(generics.ListCreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class ReviewDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
