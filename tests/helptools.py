from selenium.webdriver import Firefox, Chrome
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.firefox.options import Options
from selenium.common.exceptions import TimeoutException


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

    def go_to(self, url, condition):
        self.driver.get(url)
        try:
            WebDriverWait(self.driver, self.delay).until(condition)
            return True
        except TimeoutException as timeout:
            return False

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
        try:
            WebDriverWait(self.driver, self.delay).until(registration_condition)
            return True
        except TimeoutException as timeout:
            return False

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
        try:
            WebDriverWait(self.driver, self.delay).until(login_condition)
            return True
        except TimeoutException as timeout:
            return False
