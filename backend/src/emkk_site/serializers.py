from rest_framework import serializers
from src.emkk_site.models import (
    Document, Trip, Review, ReviewFromIssuer, WorkRegister)
from src.jwt_auth.serializers import UserSerializer


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'
        write_only_fields = ['file', ]
        read_only_fields = ['uuid', 'content_type', 'filename', ]
        extra_kwargs = {'trip': {'required': False}}


class BaseReviewSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        reviewer = self.context['reviewer']
        validated_data['reviewer'] = reviewer

        return super(BaseReviewSerializer, self).create(validated_data)


class ReviewSerializer(BaseReviewSerializer):
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['reviewer', ]


class ReviewFromIssuerSerializer(BaseReviewSerializer):
    class Meta:
        model = ReviewFromIssuer
        fields = '__all__'
        read_only_fields = ['reviewer', ]


class WorkRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkRegister
        fields = '__all__'
        read_only_fields = ['user', ]

    def validate(self, attrs):
        user = self.context['user']
        if WorkRegister.objects.filter(user=user, trip=attrs['trip']):
            raise serializers.ValidationError("Unique constraint violated")
        return attrs

    def create(self, validated_data):
        user = self.context['user']
        validated_data['user'] = user
        return super().create(validated_data)


class TripSerializer(serializers.ModelSerializer):
    leader = UserSerializer(read_only=True)

    class Meta:
        model = Trip
        depth = 1
        fields = '__all__'
        read_only_fields = ['created_at', 'status', 'leader', ]

    def create(self, validated_data):
        user = self.context['user']
        validated_data['leader'] = user
        return super(TripSerializer, self).create(validated_data)


class TripDetailSerializer(serializers.ModelSerializer):
    leader = UserSerializer(read_only=True)

    class Meta:
        model = Trip
        depth = 1
        fields = '__all__'
        read_only_fields = ['created_at', 'status', 'leader', ]
        extra_kwargs = {field.name: {'required': False} for field in Trip._meta.fields}


class TripForAnonymousSerializer(serializers.ModelSerializer):
    leader = UserSerializer()

    class Meta:
        model = Trip
        depth = 1
        fields = [
            'status', 'kind', 'leader', 'group_name', 'difficulty_category',
            'global_region', 'local_region', 'start_date', 'end_date']
