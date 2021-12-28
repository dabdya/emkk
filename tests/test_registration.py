from unittest import TestCase
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions

from helptools import HelpToolsManager
from uuid import uuid4


class TestRegistration(TestCase):
    """Check that registration work correctly"""
    def setUp(self):
        self.manager = HelpToolsManager("Firefox", daemon_mode=False)

        self.dashboard_url = "https://emkk-site.ru/home/dashboard"
        self.registration_url = "https://emkk-site.ru/signup"
        self.login_url = "https://emkk-site.ru/login"

        self.password_str = str(uuid4())
        self.registration_data = {
            "username": str(uuid4()),
            "email": f"{str(uuid4())}@mail.ru",
            "first_name": "Selenium",
            "second_name": "Selenium",
            "password": self.password_str,
            "repeat_password": self.password_str,
        }

    def tearDown(self):
        self.manager.driver.close()
        self.manager.driver.quit()

    def test_should_work_if_data_is_valid(self):
        condition_for_success_registration = \
            expected_conditions.presence_of_element_located((By.XPATH, "//button[text()='Войти']"))
        user_was_created = self.manager.register_new_user(
            **self.registration_data, registration_condition=condition_for_success_registration)
        self.assertTrue(user_was_created)
        self.assertEqual(self.manager.driver.current_url, self.login_url)

        condition_for_success_login = expected_conditions \
            .presence_of_element_located((By.LINK_TEXT, "Выйти"))
        user_was_logged = self.manager.login_user(
            self.registration_data["username"], self.registration_data["password"],
            login_condition=condition_for_success_login)
        self.assertTrue(user_was_logged)
        self.assertEqual(self.manager.driver.current_url, self.dashboard_url)

    def test_email_cant_end_with_dot(self):
        invalid_data = dict(self.registration_data)
        invalid_data["email"] = "invalidemail@mail."
        condition_for_invalid_email = expected_conditions \
            .presence_of_element_located((By.XPATH, "//p[text()='Введите валидный Email']"))
        invalid_email_raised = self.manager.register_new_user(
            **invalid_data, registration_condition=condition_for_invalid_email)
        self.assertTrue(invalid_email_raised)
        self.assertNotEqual(self.manager.driver.current_url, self.login_url)

    def test_password_and_repeat_password_should_be_equals(self):
        invalid_data = dict(self.registration_data)
        invalid_data["repeat_password"] = "other password"
        condition_for_different_passwords = expected_conditions \
            .presence_of_element_located((By.XPATH, "//p[text()='Пароли не совпадают']"))
        different_password_raised = self.manager.register_new_user(
            **invalid_data, registration_condition=condition_for_different_passwords)
        self.assertTrue(different_password_raised)
        self.assertNotEqual(self.manager.driver.current_url, self.login_url)

    def test_registration_should_not_work_if_specified_username_or_email_exist(self):
        condition_for_success_registration = \
            expected_conditions.presence_of_element_located((By.XPATH, "//button[text()='Войти']"))
        self.manager.register_new_user(
            **self.registration_data, registration_condition=condition_for_success_registration)

        condition_for_already_exist_user = expected_conditions \
            .presence_of_element_located((By.XPATH, "//span[text()='user with this username already exists.']"))
        user_already_exist = self.manager.register_new_user(
            **self.registration_data, registration_condition=condition_for_already_exist_user)
        self.assertTrue(user_already_exist)
        self.assertNotEqual(self.manager.driver.current_url, self.login_url)
