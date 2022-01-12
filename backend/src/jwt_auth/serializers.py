from django.contrib.auth import authenticate
from rest_framework import serializers

from src.jwt_auth.models import User
from django.conf import settings
import jwt


class LoginSerializer(serializers.Serializer):
    """Сериализация для аутентификации пользователя"""
    username = serializers.CharField(max_length=255)
    email = serializers.CharField(max_length=255, read_only=True)
    password = serializers.CharField(max_length=128, write_only=True)
    access_token = serializers.CharField(max_length=1024, read_only=True)
    refresh_token = serializers.CharField(max_length=1024, read_only=True)

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

        "If email provided instead of username"
        if "@" in username:
            try:
                user = User.objects.get(email=username)
                if user.check_password(password):
                    return user
            except User.DoesNotExist as err:
                raise serializers.ValidationError("User with this email not found")

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError(
                "User with this username and password was not found"
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "This user has been deactivated"
            )

        user.set_refresh_token()
        return {
            'username': username,
            'email': user.email,
            'access_token': user.access_token,
            'refresh_token': user.refresh_token
        }


class RegistrationSerializer(serializers.ModelSerializer):
    """Сериализация регистрации пользователя и создания новаого"""

    password = serializers.CharField(max_length=128, min_length=8, write_only=True)
    access_token = serializers.CharField(max_length=1024, read_only=True)
    refresh_token = serializers.CharField(max_length=1024, read_only=True)

    class Meta:
        model = User
        fields = [
            'password', 'email', 'username', 'first_name', 'last_name', 'gender',
            'access_token', 'refresh_token', 'patronymic',
        ]
        extra_kwargs = {'patronymic': {'required': False}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    """Сериализация и десериализация пользователей"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.Meta.fields = ['password', 'email', 'username', 'first_name', 'last_name', 'patronymic',
                            'access_token', 'refresh_token']
    password = serializers.CharField(max_length=128, min_length=8, write_only=True)

    class Meta:
        model = User
        write_only_fields = ['password', ]

    def without_fields(self, fields=None):
        self.Meta.fields = list(set(self.Meta.fields) - set(fields))
        print(self.Meta.fields)
        return self

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        for key, value in validated_data.items():
            setattr(instance, key, value)

        if password is not None:
            instance.set_password(password)

        instance.save()
        return instance


class RefreshTokenSerializer(serializers.Serializer):
    refresh_token = serializers.CharField(max_length=1024, write_only=True)
    access_token = serializers.CharField(max_length=1024, read_only=True)

    def validate(self, data):
        refresh_token = data.get('refresh_token', None)
        if not refresh_token:
            raise serializers.ValidationError("""Refresh token was not provided""")

        try:
            payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
            user = User.objects.get(username=payload['username'])
            return {
                'access_token': user.access_token
            }

        except jwt.ExpiredSignatureError as expired_signature_error:
            """В случае если и сам refresh токен истек, тогда придется перелогиниться"""
            raise serializers.ValidationError(expired_signature_error)

        except jwt.InvalidSignatureError as invalid_signature_error:
            raise serializers.ValidationError(invalid_signature_error)

        except jwt.DecodeError as decode_error:
            raise serializers.ValidationError(decode_error)
