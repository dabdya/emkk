from django.test import TestCase, Client
from django.core import mail

from src.jwt_auth.models import User
import json


"""

    Что происходит при регистрации нового пользователя:
    1. Валидация входящих данных и сохранение в базу данных
    2. Возвращается созданный объект с токенами доступа
    3. Уведомление на почту в случае успеха. Подтверждение не требуется.
    
"""


class RegistrationTest(TestCase):

    def setUp(self):
        self.client = Client()
        self.user_data = {
            "user": {
                "first_name": "First",
                "last_name": "Last",
                "username": "user",
                "email": "email@mail.com",
                "password": "password"
            }
        }

    def test_user_should_created_when_data_is_valid(self):
        r = self.client.post(
            '/auth/users', data=json.dumps(self.user_data),
            content_type="application/json")
        self.assertEqual(r.status_code, 201)
        self.assertEqual(User.objects.count(), 1)

    def test_user_not_created_when_data_is_invalid(self):
        data_without_email = self.user_data.copy()
        data_without_email["user"].pop("email")
        r = self.client.post(
            '/auth/users', data=json.dumps(data_without_email),
            content_type='application/json')
        self.assertEqual(r.status_code, 400)
        self.assertNotEqual(User.objects.count(), 1)

    def test_user_not_created_when_username_contains_unacceptable_symbols(self):
        data = dict(self.user_data)
        data["user"]["username"] = "login@with"
        r = self.client.post('/auth/users', data=json.dumps(data), content_type="application/json")
        self.assertEqual(r.status_code, 422)
        self.assertEqual(User.objects.count(), 0)

    def test_user_not_created_when_data_contains_exist_username_or_email(self):
        r1 = self.client.post(
            '/auth/users', data=json.dumps(self.user_data),
            content_type='application/json')

        r2 = self.client.post(
            '/auth/users', data=json.dumps(self.user_data),
            content_type='application/json')

        self.assertEqual(r2.status_code, 400)
        self.assertNotEqual(User.objects.count(), 2)

    def test_when_user_was_created_password_should_hashed(self):
        r = self.client.post(
            '/auth/users', data=json.dumps(self.user_data),
            content_type='application/json')

        username = self.user_data["user"]["username"]
        password = self.user_data["user"]["password"]
        self.assertNotEqual(User.objects.get(username=username).password, password)

    def test_when_user_was_created_refresh_token_should_be_generated(self):
        r = self.client.post(
            '/auth/users', data=json.dumps(self.user_data),
            content_type='application/json')

        self.assertTrue("refresh_token" in r.data and r.data["refresh_token"])

    def test_when_user_was_created_email_notify_should_be_sent(self):
        r = self.client.post(
            '/auth/users', data=json.dumps(self.user_data),
            content_type='application/json')
        self.assertEqual(r.status_code, 201)
        email = self.user_data["user"]["email"]
        self.assertEqual(len(mail.outbox), 1)
        self.assertTrue(email in mail.outbox[0].to)
