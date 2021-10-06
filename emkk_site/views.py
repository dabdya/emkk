from django.http import HttpResponse, HttpResponseRedirect
from .serializers import DocumentSerializer, TripSerializer, UserSerializer, ReviewSerializer
from rest_framework import generics
from rest_framework.views import APIView
from .models import Document, Trip, Review, User

import random
import json


def index(request):
    ans = random.randint(0,1)
    ans = "ДА!" if ans else "Нет :("
    return HttpResponse(json.dumps({"Можно ли пойти в поход?": f"{ans}"}))


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

    # def retrieve(self, request, *args, **kwargs):
    #     document = Document.objects.get(pk=kwargs['pk'])
    #     response = HttpResponse(
    #         document.content, content_type=document.content_type)
    #     response['Content-Disposition'] = 'attachment'
    #     return response


class UserView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class TripView(generics.ListCreateAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer


class ReviewView(generics.ListCreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
