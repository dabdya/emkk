from rest_framework import authentication, exceptions
from django.conf import settings
from .models import User
import jwt


class JWTAuthentication(authentication.BaseAuthentication):
    authentication_header_prefix = 'Token'

    def authenticate(self, request):
        """Должны передаваться данные для авторизации в заголовках запроса
           в виде [Token 1q2w3e4r5tzaxscdvfbg]"""
        request.user = None
        auth_header = authentication.get_authorization_header(request).split()
        print(request.headers)
        print(auth_header)
        auth_header_prefix = self.authentication_header_prefix.lower()

        if not auth_header:
            """Данные для авторизации не были предоставлены"""
            return

        if len(auth_header) == 1:
            """Нет пробелов совсем"""
            return

        if len(auth_header) > 2:
            """Слишком много элементов, должно быть всего два"""
            return

        prefix = auth_header[0].decode('utf-8')
        token = auth_header[1].decode('utf-8')
        if prefix.lower() != auth_header_prefix:
            return

        return self._authenticate_credentials(request, token)

    def _authenticate_credentials(self, request, token):

        try:
            """Токен в базу не сохраняется, т.к. удобно декодируется"""
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except Exception as error:
            msg = "Ошибка аутентификации. Невозможно декодировать токен"
            raise exceptions.AuthenticationFailed(msg)

        try:
            user = User.objects.get(pk=payload['id'])
        except User.DoesNotExist:
            msg = 'Пользователь соответствующий данному токену не найден'
            raise exceptions.AuthenticationFailed(msg)

        if not user.is_active:
            msg = 'Данный пользователь деактивирован'
            raise exceptions.AuthenticationFailed(msg)

        return user, token
