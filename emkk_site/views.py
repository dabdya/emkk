from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
import random

from emkk_site.models import Trip


def index(request):
    ans = random.randint(0, 1)
    ans = "ДА!" if ans else "Нет :("
    return HttpResponse(f"""
    <h1>Можно ли пойти в поход? (пожалуйста)</h1>
    <h1>{ans}</h1>""")


def get_trip_by_id(request, *args, **kwargs):
    trip_id = kwargs['trip_id']
    try:
        trip = Trip.objects.get(pk=int(trip_id))
    except ObjectDoesNotExist:
        trip = None
        return HttpResponse("<html><body>Trip is not Found.</body></html>") #TODO Заменить на шаблонизатор
    return HttpResponse(f"<html><body>This is trip #{trip.pk}.</body></html>")
