from django.http import HttpResponse, HttpResponseRedirect
from .serializers import DocumentSerializer, TripSerializer, UserSerializer, ReviewSerializer
from rest_framework import generics
from rest_framework.views import APIView
from .models import Document, Trip, Review, User


class DocumentList(generics.ListCreateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    def create(self, request, *args, **kwargs):
        trip_id = request.data['trip']
        file = request.FILES['file']
        document = Document(
            trip_id=trip_id,
            content=file.read(),
            content_type=file.content_type)
        document.save()
        return HttpResponse(status=201)


class DocumentDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    def retrieve(self, request, *args, **kwargs):
        document = Document.objects.get(pk=kwargs['pk'])
        response = HttpResponse(
            document.content, content_type=document.content_type)
        response['Content-Disposition'] = 'attachment'
        return response


class UserView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class TripView(generics.ListCreateAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer


# class ReviewView(generics.ListCreateAPIView):
#     queryset = Review.objects.all()
#     serializer_class = ReviewSerializer

class ReviewList(APIView):
    """Возвращает список всех рецензий при GET /reviews,
    либо создает наовую рецензию при POST /reviews"""

    def get(self, request):
        reviews = Review.objects.all()
        serializer = ReviewSerializer(reviews, many=True)
        return HttpResponse(serializer.data, status=200)

    def post(self, request):
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return HttpResponse(serializer.data, status=201)
        return HttpResponse(serializer.errors, status=400)
