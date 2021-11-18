from rest_framework import authentication, exceptions
from django.conf import settings
from src.jwt_auth.models import User
import jwt


class JWTAuthentication(authentication.BaseAuthentication):
    authentication_header_prefix = 'Token'

    def authenticate(self, request):
        request.user = None
        auth_header = authentication.get_authorization_header(request).split()
        auth_header_prefix = self.authentication_header_prefix.lower()

        if not auth_header:
            """Данные для авторизации не были предоставлены"""
            return

        if len(auth_header) == 1:
            """Заголовок токена не отделен от значения токена"""
            return

        if len(auth_header) > 2:
            """Были переданы лишние данные"""
            return

        prefix = auth_header[0].decode('utf-8')
        token = auth_header[1].decode('utf-8')
        if prefix.lower() != auth_header_prefix:
            return

        return self._authenticate_credentials(request, token)

    # noinspection PyMethodMayBeStatic
    def _authenticate_credentials(self, request, token):

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError as expired_signature_error:
            raise exceptions.AuthenticationFailed(expired_signature_error)

        except jwt.InvalidSignatureError as invalid_signature_error:
            raise exceptions.AuthenticationFailed(invalid_signature_error)

        try:
            user = User.objects.get(username=payload['username'])
        except User.DoesNotExist:
            msg = 'User matching specified token was not found'
            raise exceptions.AuthenticationFailed(msg)

        if not user.is_active:
            msg = 'The specified user is deactivated'
            raise exceptions.AuthenticationFailed(msg)

        return user, token
