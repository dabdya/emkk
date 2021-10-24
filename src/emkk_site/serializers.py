import jwt
from django.conf import settings
from rest_framework import serializers
from src.jwt_auth.models import User
from .models import Document, Trip, Review, ReviewFromIssuer


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


class ReviewFromIssuerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewFromIssuer
        fields = '__all__'


class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'
        read_only_fields = ['created_at', 'status', 'leader', ]

    def create(self, validated_data):
        token = self.context['token']
        """Посколько доступ на эндпоинт только авторизованным, то токен уже проверен
           и ошибки при декодировании не будет."""
        payload = jwt.decode(token.split()[1], settings.SECRET_KEY, algorithms=["HS256"])
        user = User.objects.get(username=payload['username'])
        validated_data['leader'] = user
        return super(TripSerializer, self).create(validated_data)


class TripForAnonymousSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        exclude = [
            'insurance_info', 'coordinator_info', 'participants_count',
            'actual_start_date', 'actual_end_date',
        ]

