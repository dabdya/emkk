from django.test import TestCase, Client

from src.emkk_site.utils import EntityGenerator
from src.jwt_auth.models import User

import json


"""
    Что происходит при входе пользователя в систему:
    1. Валидация входящих данных
    2. Аутентификация с переданными учетными данными
    3. Возвращается авторизованный объект либо ошибка
"""


class TestLogin(TestCase):

    def setUp(self):
        self.client = Client()
        self.login_data = {
            "user": {
                "username": "test",
                "password": "Cfj64%324Fd"
            }
        }

        eg = EntityGenerator()
        self.user = eg.generate_instance_by_model(
            User, **self.login_data["user"], is_active=True)
        self.user.set_password(self.login_data["user"]["password"])
        self.user.save()

    def test_login_success_when_data_is_valid(self):
        r = self.client.post(
            '/auth/users/login',
            data=json.dumps(self.login_data), content_type="application/json"
        )

        self.assertEqual(r.status_code, 200)
        self.assertTrue("access_token" in r.data)

    def test_login_error_when_user_with_specified_credentials_not_found(self):
        data_with_invalid_pass = self.login_data.copy()
        data_with_invalid_pass["user"]["password"] = "invalid"
        r = self.client.post(
            '/auth/users/login',
            data=json.dumps(data_with_invalid_pass), content_type="application/json"
        )

        self.assertEqual(r.status_code, 400)
        self.assertFalse("access_token" in r.data)

    def test_login_error_when_user_was_deactivated(self):
        self.user.is_active = False
        self.user.save()

        r = self.client.post(
            '/auth/users/login',
            data=json.dumps(self.login_data), content_type="application/json"
        )

        self.assertEqual(r.status_code, 400)
        self.assertFalse("access_token" in r.data)

    def test_when_login_success_refresh_token_should_be_updated(self):
        r1 = self.client.post(
            '/auth/users/login',
            data=json.dumps(self.login_data), content_type="application/json"
        )

        old_value = r1.data["refresh_token"]

        r2 = self.client.post(
            '/auth/users/login',
            data=json.dumps(self.login_data), content_type="application/json"
        )

        actual_value = r2.data["refresh_token"]
        self.assertNotEqual(old_value, actual_value)
