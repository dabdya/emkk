from rest_framework import serializers

from src.emkk_site.models import (
    TripDocument, Trip, Review, ReviewFromReviewer, ReviewFromIssuer,
    ReviewDocument, ReviewFromIssuerDocument)

from src.jwt_auth.serializers import UserSerializer


class TripDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripDocument
        fields = '__all__'
        write_only_fields = ['file', ]
        read_only_fields = ['uuid', 'content_type', 'filename', ]
        extra_kwargs = {'trip': {'required': False}}


# TODO delete double repeated code
class ReviewDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewDocument
        fields = '__all__'
        write_only_fields = ['file', ]
        read_only_fields = ['uuid', 'content_type', 'filename', ]
        extra_kwargs = {'review': {'required': False}}


# TODO delete triple repeated code
class ReviewFromIssuerDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewFromIssuerDocument
        fields = '__all__'
        write_only_fields = ['file', ]
        read_only_fields = ['uuid', 'content_type', 'filename', ]
        extra_kwargs = {'review_from_issuer': {'required': False}}


class BaseReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        depth = 1
        fields = '__all__'
        read_only_fields = ['reviewer', 'trip', ]

    def create(self, validated_data):
        reviewer = self.context['reviewer']
        validated_data['reviewer'] = reviewer

        trip_id = self.context["trip_id"]
        trip = Trip.objects.get(pk=trip_id)
        validated_data['trip'] = trip

        return super(BaseReviewSerializer, self).create(validated_data)


class ReviewSerializer(BaseReviewSerializer):
    reviewer = UserSerializer(read_only=True)

    class Meta:
        model = ReviewFromReviewer
        depth = 1
        fields = '__all__'
        read_only_fields = ['reviewer', 'trip', ]


class ReviewFromIssuerSerializer(BaseReviewSerializer):
    reviewer = UserSerializer(read_only=True)

    class Meta:
        model = ReviewFromIssuer
        depth = 1
        fields = '__all__'
        read_only_fields = ['reviewer', 'trip', ]


class TripSerializer(serializers.ModelSerializer):
    leader = UserSerializer(read_only=True)

    class Meta:
        model = Trip
        depth = 1
        fields = '__all__'
        read_only_fields = ['created_at', 'status', 'leader', ]
        extra_kwargs = {'info_for_reviewer': {'required': False}}

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
        extra_kwargs = {
            field.name: {'required': False} for field in Trip._meta.fields
            if field.name != 'info_for_reviewer'}


class TripForAnonymousSerializer(serializers.ModelSerializer):
    leader = UserSerializer()

    class Meta:
        model = Trip
        depth = 1
        fields = [
            'status', 'kind', 'leader', 'group_name', 'difficulty_category',
            'global_region', 'local_region', 'start_date', 'end_date']
