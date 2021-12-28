from selenium.webdriver import Firefox, Chrome
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.firefox.options import Options
from selenium.common.exceptions import TimeoutException

from uuid import uuid4


class HelpToolsManager:
    def __init__(self, driver_engine, delay=20, daemon_mode=False):
        available_drivers = {
            'Firefox': Firefox,
            'Chrome': Chrome
        }

        self.delay = delay

        if driver_engine not in available_drivers:
            message = f"Expected {available_drivers}, but found {driver_engine}"
            raise ValueError(message)

        options = Options()
        if daemon_mode:
            options.add_argument('--headless')
        self.driver = available_drivers[driver_engine](options=options)

    def _wait_response(self, condition):
        try:
            WebDriverWait(self.driver, self.delay).until(condition)
            return True
        except TimeoutException as timeout:
            return False

    def go_to(self, url, condition):
        self.driver.get(url)
        try:
            WebDriverWait(self.driver, self.delay).until(condition)
            return True
        except TimeoutException as timeout:
            return False

    def generate_and_register_new_user(self, condition):
        password_str = str(uuid4())
        registration_data = {
            "username": str(uuid4()),
            "email": f"{str(uuid4())}@mail.ru",
            "first_name": "Selenium",
            "second_name": "Selenium",
            "password": password_str,
            "repeat_password": password_str,
        }
        return self.register_new_user(
            **registration_data, registration_condition=condition), registration_data

    def register_new_user(
            self, username, email, first_name, second_name,
            password, repeat_password, registration_condition, patronymic=""):

        registration_url = "https://emkk-site.ru/signup"
        if self.driver.current_url != registration_url:
            condition_for_registration_page = condition = expected_conditions \
                .presence_of_element_located((By.NAME, "password2"))
            if not self.go_to(url=registration_url, condition=condition_for_registration_page):
                return False

        self.driver.find_element(By.NAME, "username").send_keys(username)
        self.driver.find_element(By.NAME, "email").send_keys(email)
        self.driver.find_element(By.NAME, "firstName").send_keys(first_name)
        self.driver.find_element(By.NAME, "secondName").send_keys(second_name)
        self.driver.find_element(By.NAME, "password").send_keys(password)
        self.driver.find_element(By.NAME, "password2").send_keys(repeat_password)

        if patronymic:
            self.driver.find_element(By.NAME, "patronymic").send_keys(patronymic)

        signup_button = self.driver.find_element(
            By.XPATH, "//button[text()='Зарегистрироваться']")

        signup_button.click()
        return self._wait_response(condition=registration_condition)

    def login_user(self, login, password, login_condition):
        login_url = "https://emkk-site.ru/login"
        if self.driver.current_url != login_url:
            condition_for_login_page = condition = expected_conditions \
                .presence_of_element_located((By.NAME, "password2"))
            if not self.go_to(url=login_url, condition=condition_for_login_page):
                return False

        self.driver.find_element(By.NAME, "login").send_keys(login)
        self.driver.find_element(By.NAME, "password").send_keys(password)

        login_button = self.driver.find_element(
            By.XPATH, "//button[text()='Войти']")

        login_button.click()
        return self._wait_response(condition=login_condition)

    def create_trip(self, trip_condition, **trip_data):
        trip_form_url = "https://emkk-site.ru/home/form"
        if self.driver.current_url != trip_form_url:
            condition_for_trip_page = expected_conditions.\
                presence_of_element_located((By.XPATH, "//button[text()='Отправить заявку']"))
            if not self.go_to(url=trip_form_url, condition=condition_for_trip_page):
                return False

        for i, field in enumerate(trip_data):
            form_field = self.driver.find_element(By.XPATH, f"//input[@tabindex={i+1}]")
            form_field.send_keys(trip_data.get(field, uuid4()))
            if field in ["global_region", "difficulty_category", "kind"]:
                form_field.send_keys(Keys.DOWN)
                form_field.send_keys(Keys.ENTER)

            if "date" in field:
                self.driver.execute_script("$('#start_date').value = '2222-02-22'")

        create_trip_button = self.driver.find_element(
            By.XPATH, "//button[text()='Отправить заявку']")
        create_trip_button.click()
        return self._wait_response(condition=trip_condition)
