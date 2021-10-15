from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User


class LoginSerializer(serializers.Serializer):
    """Сериалщиция для аутентификации пользователя"""
    username = serializers.CharField(max_length=255)
    email = serializers.CharField(max_length=255, read_only=True)
    password = serializers.CharField(max_length=128, write_only=True)
    access_token = serializers.CharField(max_length=255, read_only=True)

    def validate(self, data):
        username = data.get('username', None)
        password = data.get('password', None)

        if not username:
            raise serializers.ValidationError(
                "An username is required to log in"
            )

        if not password:
            raise serializers.ValidationError(
                "A password is required to log in"
            )

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError(
                "A user with this username and password was not found"
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "This user has been deactivated"
            )

        """Должен возвращать словарь проверенных данных, т.е. данных, которые
           передаеются затем в методы create или update"""

        return {
            'username': username,
            'email': user.email,
            'access_token': user.access_token
        }


class RegistrationSerializer(serializers.ModelSerializer):
    """Сериализация регитсрации пользователя и создания новаого"""

    password = serializers.CharField(max_length=128, min_length=8, write_only=True)
    access_token = serializers.CharField(max_length=255, read_only=True)

    class Meta:
        model = User
        fields = [
            'password', 'email', 'username', 'first_name', 'last_name', 'gender',
            'access_token',
        ]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    """Сериализация и десериализация пользовательских объектов"""
    password = serializers.CharField(max_length=128, min_length=8, write_only=True)

    class Meta:
        model = User
        fields = [
            'password', 'email', 'username',
            'first_name', 'last_name', 'gender'
        ]
        # read_only_fields = ('access_token', )

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        for key, value in validated_data.items():
            setattr(instance, key, value)

        if password is not None:
            instance.set_password(password)

        instance.save()
        return instance
