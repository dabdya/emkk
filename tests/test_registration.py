from unittest import TestCase
from selenium.webdriver import Firefox
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions

from uuid import uuid4


class TestRegistration(TestCase):
    """Check that registration work correctly"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.driver = Firefox()
        self.driver.get("https://emkk-site.ru/signup")
        self.username = self.driver.find_element(By.NAME, "username")
        self.email = self.driver.find_element(By.NAME, "email")
        self.first_name = self.driver.find_element(By.NAME, "firstName")
        self.second_name = self.driver.find_element(By.NAME, "secondName")
        self.password = self.driver.find_element(By.NAME, "password")
        self.password_repeat = self.driver.find_element(By.NAME, "password2")

        self.signup_button = self.driver.find_element(
            By.XPATH, "//button[text()='Зарегистрироваться']")

        self.dashboard_url = "https://emkk-site.ru/home/dashboard"
        self.login_url = "https://emkk-site.ru/login"

    def test_should_work_if_data_is_valid(self):
        domain_name = str(uuid4())
        self.username.send_keys(domain_name)
        self.email.send_keys(f"{domain_name}@mail.ru")
        self.first_name.send_keys("Selenium")
        self.second_name.send_keys("Selenium")

        password_str = str(uuid4())
        self.password.send_keys(password_str)
        self.password_repeat.send_keys(password_str)

        self.signup_button.click()
        condition = expected_conditions\
            .presence_of_element_located((By.XPATH, "//button[text()='Войти']"))
        WebDriverWait(self.driver, 20).until(condition)
        self.assertEqual(self.driver.current_url, self.login_url)

        login = self.driver.find_element(By.NAME, "login")
        password = self.driver.find_element(By.NAME, "password")
        login.send_keys(domain_name)
        password.send_keys(password_str)

        login_button = self.driver.find_element(
            By.XPATH, "//button[text()='Войти']")

        login_button.click()
        condition = expected_conditions \
            .presence_of_element_located((By.LINK_TEXT, "Выйти"))
        WebDriverWait(self.driver, 20).until(condition)
        self.assertEqual(self.driver.current_url, self.dashboard_url)

        self.driver.quit()

    def test_should_not_work_if_data_is_invalid(self):
        pass
        """Should check invalid email, repeat password not match, exist username or email"""
