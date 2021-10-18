import jwt
from django.conf import settings
from rest_framework import serializers
from src.jwt_auth.models import User

from .models import Document, Trip, Review


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'


class DocumentDetailSerializer(serializers.ModelSerializer):
    # file = serializers.FileField()

    class Meta:
        model = Document
        fields = '__all__'
        # fields = ['id', 'file', 'trip', 'content_type', 'content']
        # extra_kwargs = {
        #     'content_type': {'read_only': True},
        #     'trip': {'read_only': True}
        # }

    # def update(self, instance, validated_data):
    #     file = validated_data['file']
    #     instance.content_type = file.content_type
    #     instance.content = file.read()


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'


class DynamicTripSerializer(serializers.ModelSerializer):

    def __init__(self, *args, **kwargs):
        excluded_fields = kwargs.pop('excluded_fields', None)
        super(DynamicTripSerializer, self).__init__(*args, **kwargs)

        if excluded_fields:
            for field in excluded_fields:
                self.fields.pop(field)


# Можно было бы добиться такого же результата, если просто указать что status read only?


class TripSerializer(DynamicTripSerializer):
    class Meta:
        model = Trip
        exclude = ['leader', ]

    def create(self, validated_data):
        token = self.context['token']
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user = User.objects.get(username=payload['username'])
        validated_data['leader'] = user
        return super(TripSerializer, self).create(validated_data)
