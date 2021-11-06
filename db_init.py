from src.emkk_site.models import *
from src.jwt_auth.models import *

u = User(username="LeoMessi(Staff)",
         email="a@a.ru", is_staff=True)
u.save()
u1 = User(username="Sam Johnstone",
          email="SamJohnstone@a.ru")
u1.save()

u2 = User(username="Kalvin Phillips",
          email="KalvinPhillips@a.ru")
users = [u, u1, u2]

for i in range(5):
    difficulty = list(range(6))[i % 6]
    trip = Trip(
        kind=TripKind.CYCLING, group_name="TestGroup",
        difficulty_category=difficulty, global_region="Russia",
        local_region="City", participants_count=12,
        start_date='2021-10-08', end_date='2021-10-28',
        coordinator_info="Info", insurance_info="Info", leader=users[i % (len(users))])
    trip.save()


