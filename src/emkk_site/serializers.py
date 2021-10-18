from rest_framework import serializers
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
        fields = '__all__'
