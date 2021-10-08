from rest_framework import serializers
from .models import Document, User, Trip, Review


class DocumentSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)

    class Meta:
        model = Document
        exclude = ['content_type', 'content', ]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'


class TripGetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'


class TripPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        exclude = ['status', ]
