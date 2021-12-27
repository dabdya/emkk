from unittest import TestCase
from selenium.webdriver import Firefox
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.firefox.options import Options

from uuid import uuid4


class TestRegistration(TestCase):
    """Check that registration work correctly"""
    def setUp(self):

        options = Options()
        # options.add_argument('--headless')
        self.driver = Firefox(options=options)

        self.registration_url = "https://emkk-site.ru/signup"
        self.driver.get(self.registration_url)
        self.find_all_form_fields()

        self.dashboard_url = "https://emkk-site.ru/home/dashboard"
        self.login_url = "https://emkk-site.ru/login"

        self.domain_name = str(uuid4())
        self.password_str = str(uuid4())

    def tearDown(self):
        self.driver.close()
        self.driver.quit()

    def find_all_form_fields(self):
        self.username = self.driver.find_element(By.NAME, "username")
        self.email = self.driver.find_element(By.NAME, "email")
        self.first_name = self.driver.find_element(By.NAME, "firstName")
        self.second_name = self.driver.find_element(By.NAME, "secondName")
        self.password = self.driver.find_element(By.NAME, "password")
        self.password_repeat = self.driver.find_element(By.NAME, "password2")

        self.signup_button = self.driver.find_element(
            By.XPATH, "//button[text()='Зарегистрироваться']")

    def set_correct_form_data(self):
        self.username.send_keys(self.domain_name)
        self.email.send_keys(f"{self.domain_name}@mail.ru")
        self.first_name.send_keys("Selenium")
        self.second_name.send_keys("Selenium")

        self.password.send_keys(self.password_str)
        self.password_repeat.send_keys(self.password_str)

    def test_should_work_if_data_is_valid(self):
        self.set_correct_form_data()
        self.signup_button.click()
        condition = expected_conditions\
            .presence_of_element_located((By.XPATH, "//button[text()='Войти']"))
        WebDriverWait(self.driver, 20).until(condition)
        self.assertEqual(self.driver.current_url, self.login_url)

        login = self.driver.find_element(By.NAME, "login")
        password = self.driver.find_element(By.NAME, "password")
        login.send_keys(self.domain_name)
        password.send_keys(self.password_str)

        login_button = self.driver.find_element(
            By.XPATH, "//button[text()='Войти']")

        login_button.click()
        condition = expected_conditions \
            .presence_of_element_located((By.LINK_TEXT, "Выйти"))
        WebDriverWait(self.driver, 20).until(condition)

        self.assertEqual(self.driver.current_url, self.dashboard_url)

    def test_email_cant_end_with_dot(self):
        self.set_correct_form_data()
        self.email.send_keys("invalidDomain@mail.ru.")

        self.signup_button.click()
        condition = expected_conditions \
            .presence_of_element_located((By.XPATH, "//p[text()='Введите валидный Email']"))
        WebDriverWait(self.driver, 20).until(condition)

        self.assertNotEqual(self.driver.current_url, self.login_url)

    def test_password_and_repeat_password_should_be_equals(self):
        self.set_correct_form_data()
        self.password_repeat.send_keys("ups")

        self.signup_button.click()
        condition = expected_conditions \
            .presence_of_element_located((By.XPATH, "//p[text()='Пароли не совпадают']"))
        WebDriverWait(self.driver, 20).until(condition)

        self.assertNotEqual(self.driver.current_url, self.login_url)

    def test_registration_should_not_work_if_specified_username_or_email_exist(self):
        self.set_correct_form_data()
        self.signup_button.click()

        condition = expected_conditions\
            .presence_of_element_located((By.XPATH, "//button[text()='Войти']"))
        WebDriverWait(self.driver, 20).until(condition)

        self.driver.get(self.registration_url)
        condition = expected_conditions \
            .presence_of_element_located((By.NAME, "password2"))
        WebDriverWait(self.driver, 20).until(condition)
        self.assertEqual(self.driver.current_url, self.registration_url)

        self.find_all_form_fields()
        self.set_correct_form_data()
        self.signup_button.click()
        condition = expected_conditions \
            .presence_of_element_located((By.XPATH, "//span[text()='user with this username already exists.']"))
        WebDriverWait(self.driver, 20).until(condition)

        self.assertNotEqual(self.driver.current_url, self.login_url)
