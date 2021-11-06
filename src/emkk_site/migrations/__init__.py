import random

from ..models import TripKind, Trip
from ...jwt_auth.models import User

user_count = User.objects.all().count()
if not user_count:
    u = User(username="LeoMessi(Staff)",
             email="a@a.ru", is_staff=True).save()
    u1 = User(username="Sam Johnstone",
              email="SamJohnstone@a.ru").save()
    u2 = User(username="Kalvin Phillips",
              email="KalvinPhillips@a.ru").save()

if not Trip.objects.all().count():
    for i in range(5):
        difficulty = list(range(6))[i % 6]
        trip = Trip(
            kind=TripKind.CYCLING, group_name="TestGroup",
            difficulty_category=difficulty, global_region="Russia",
            local_region="City", participants_count=12,
            start_date='2021-10-08', end_date='2021-10-28',
            coordinator_info="Info", insurance_info="Info",
            leader=random.choice(list(User.objects.all())))
        trip.save()
