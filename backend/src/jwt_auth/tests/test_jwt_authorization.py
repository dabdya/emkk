from django.test import TestCase


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
        pass

    def test_when_access_token_valid_user_should_be_authorized(self):
        pass

    def test_when_access_token_invalid_user_not_be_authorized(self):
        pass

    def test_valid_refresh_token_allow_update_access_token(self):
        pass

    def test_invalid_refresh_token_not_allow_update_access_token(self):
        pass
