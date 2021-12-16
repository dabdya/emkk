from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from rest_framework.parsers import JSONParser
from django.core.mail import send_mail
from django.conf import settings

from django.utils import timezone

from drf_yasg.utils import swagger_auto_schema
from src.jwt_auth.schemas import refresh_token_schema

from src.jwt_auth.serializers import (
    RegistrationSerializer, LoginSerializer, UserSerializer,
    RefreshTokenSerializer,
)

from src.jwt_auth.permissions import ResetPassword

from src.jwt_auth.models import User
from src.jwt_auth.renderers import UserJSONRenderer

from datetime import timedelta
import jwt

from src import emails


class RefreshTokenView(APIView):
    permission_classes = [AllowAny, ]
    authentication_classes = []
    serializer_class = RefreshTokenSerializer
    parser_classes = [JSONParser, ]

    @swagger_auto_schema(**refresh_token_schema)
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserRetrieveUpdateAPIView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated | ResetPassword, ]
    renderer_classes = [UserJSONRenderer, ]
    serializer_class = UserSerializer

    def retrieve(self, request, *args, **kwargs):
        serializer = self.serializer_class(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        user_data = request.data.get('user', {})

        if request.user.is_anonymous:
            prefix, token = request.data.get('reset_token').split()
            payload = jwt.decode(token, settings.RESET_KEY, algorithms=["HS256"])
            user = User.objects.get(username=payload['username'])
            password = user_data.get('password')
            if not password:
                return Response("Password is required", status=status.HTTP_400_BAD_REQUEST)
            user.set_password(password)
            user.save()
            return Response(status=status.HTTP_200_OK)

        serializer = self.serializer_class(
            request.user, data=user_data, partial=True
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class RegistrationAPIView(APIView):
    permission_classes = [AllowAny, ]
    authentication_classes = []
    serializer_class = RegistrationSerializer
    renderer_classes = [UserJSONRenderer, ]

    def post(self, request):
        user = request.data.get('user', {})
        serializer = self.serializer_class(data=user)

        if serializer.is_valid():
            user = serializer.save()

            send_mail(emails.REGISTRATION_HEAD, emails.REGISTRATION_BODY,
                      settings.EMAIL_HOST_USER, [user.email, ], fail_silently=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    permission_classes = [AllowAny, ]
    authentication_classes = []
    renderer_classes = [UserJSONRenderer, ]
    serializer_class = LoginSerializer

    def post(self, request):
        user = request.data.get('user', {})
        serializer = self.serializer_class(data=user)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny, ]
    authentication_classes = []

    def post(self, request):
        email = request.data.get('email', None)
        reset_url = request.data.get('reset_url', None)
        if not email or not reset_url:
            msg = "Email or url was not provided"
            return Response(msg, status=status.HTTP_400_BAD_REQUEST)

        if reset_url[-1] == '/':
            reset_url = reset_url[:-1]

        try:
            user = User.objects.get(email=email)
            dt = timezone.now() + timedelta(minutes=60)

            token = jwt.encode({
                'username': user.username,
                'exp': dt.timestamp(),
            }, settings.RESET_KEY, algorithm='HS256')

            send_mail(emails.RESET_PASSWORD_HEAD, emails.RESET_PASSWORD_BODY % (reset_url, token, ),
                      settings.EMAIL_HOST_USER, [user.email, ], fail_silently=True)
            return Response({'reset_token': token}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            msg = f"User with email {email} not found"
            return Response(msg, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
