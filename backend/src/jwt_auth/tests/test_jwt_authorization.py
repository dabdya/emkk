from django.test import TestCase, Client

from src.emkk_site.tests.base import TestEnvironment

"""
    Что происходит при аутентификации на приватных ресурсах с помощью jwt токенов:
    1. Клиент отправляет access_token и если он валидный, и время его жизни не истекло, то
       клиент получает доступ к запрошенному ресурсу.
    2. Если access_token не валидный или его время жизни истекло, то выбрасывается отказ в доступе.
    3. С помощью валидного refresh_token можно обновить access_token и получить его.
    4. Когда время жизни refresh_token истекает, то необходимо ввести учетные данных заново для его обновления.
"""


class TestJWTAuthorization(TestCase):

    def setUp(self):
        self.env = TestEnvironment().with_user().with_trips(1)

    def test_when_access_token_valid_user_should_be_authorized(self):
        trip = self.env.trips[0]
        private_url = f'/api/trips/{trip.id}'
        r = self.env.client_get(private_url)
        self.assertEqual(r.status_code, 200)

    def test_when_access_token_invalid_user_not_be_authorized(self):
        trip = self.env.trips[0]
        private_url = f'/api/trips/{trip.id}'
        r = self.env.client_get(private_url, set_auth_header=False)
        self.assertEqual(r.status_code, 403)

    def test_valid_refresh_token_allow_update_access_token(self):
        self.env.user.set_refresh_token()
        data = {"refresh_token": self.env.user.refresh_token}
        r = self.env.client_post('/auth/users/refresh', data=data)
        self.assertEqual(r.status_code, 200)
        self.assertTrue("access_token" in r.data)

    def test_invalid_refresh_token_not_allow_update_access_token(self):
        data = {"refresh_token": "invalid_refresh_token"}
        r = self.env.client_post('/auth/users/refresh', data=data)
        self.assertEqual(r.status_code, 400)
        self.assertFalse("access_token" in r.data)
