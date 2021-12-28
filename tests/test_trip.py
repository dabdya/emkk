from unittest import TestCase
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions

from helptools import HelpToolsManager


class TestTrip(TestCase):
    """Different cases for trip manipulations"""
    def setUp(self):
        self.manager = HelpToolsManager("Firefox", daemon_mode=False)

        self.trip_data = {
            "group_name": "Selenium", "global_region": "Норвегия", "local_region": "Осло",
            "difficulty_category": 1, "kind": "Лыжный",
            "start_date": "2222-02-22", "end_date": "2222-02-25",
            "participants_count": 6, "insurance_company_name": "ФИИТ",
            "insurance_number": 12345, "insurance_policy_validity_duration": "2222-02-26",
            "coordinator_name": "Selenium", "coordinator_phone_number": 12345,
            "control_start_region": "Пункт А", "control_start_date": "2222-02-22",
            "control_end_region": "Пункт Б", "control_end_date": "2222-02-25",
        }

    def tearDown(self):
        self.manager.driver.close()
        self.manager.driver.quit()

    def test_trip_created_if_form_data_is_valid(self):
        condition_for_success_registration = \
            expected_conditions.presence_of_element_located((By.XPATH, "//button[text()='Войти']"))
        _, registration_data = self.manager.generate_and_register_new_user(condition_for_success_registration)

        condition_for_success_login = expected_conditions \
            .presence_of_element_located((By.LINK_TEXT, "Выйти"))
        self.manager.login_user(
            registration_data["username"], registration_data["password"],
            login_condition=condition_for_success_login)

        condition_for_created_trip = expected_conditions\
            .presence_of_element_located((By.XPATH, "//p[text()='Заявка подана!']"))
        trip_was_created = self.manager.create_trip(
            trip_condition=condition_for_created_trip, **self.trip_data)
        self.assertTrue(trip_was_created)

        my_trips_url = "https://emkk-site.ru/home/applications"
        condition_for_my_trip_page = expected_conditions.url_to_be(my_trips_url)
        user_on_my_trip_page = self.manager.go_to(my_trips_url, condition_for_my_trip_page)
        self.assertTrue(user_on_my_trip_page)

    def test_trip_not_created_if_data_is_invalid(self):
        """Этот тест стоит разбить на маленькие кусочки = невалидные случаи"""
        pass

    def test_user_can_see_other_trips_in_dashboard(self):
        pass
