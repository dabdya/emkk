from rest_framework import serializers
from .models import Document, Trip, Review, ReviewFromIssuer, WorkRegister


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'


class DocumentDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'


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
            raise serializers.ValidationError("pair user and trip already exists")
        return attrs

    def create(self, validated_data):
        user = self.context['user']
        validated_data['user'] = user
        return super(WorkRegisterSerializer, self).create(validated_data)


class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'
        read_only_fields = ['created_at', 'status', 'leader', ]

    def create(self, validated_data):
        user = self.context['user']
        validated_data['leader'] = user
        return super(TripSerializer, self).create(validated_data)


class TripForAnonymousSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        exclude = [
            'insurance_info', 'coordinator_info', 'participants_count',
            'actual_start_date', 'actual_end_date',
        ]

