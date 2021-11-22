from django.test import TestCase


"""
    Что происходит при входе пользователя в систему:
    1. Валидация входящих данных
    2. Аутентификация с переданными учетными данными
    3. Возвращается авторизованный объект либо ошибка
"""


class TestLogin(TestCase):

    def setUp(self):
        pass

    def test_login_error_when_data_is_invalid(self):
        pass

    def test_login_error_when_user_with_specified_credentials_not_found(self):
        pass

    def test_login_error_when_user_was_deactivated(self):
        pass

    def test_login_process_should_available_for_all(self):
        pass

    def test_when_login_success_refresh_token_should_be_updated(self):
        pass
