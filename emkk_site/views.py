from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.template import loader
from django.views import View

from .models import Trip


class TripsView(View):
    def get(self, request, *args, **kwargs):
        trips = Trip.objects.all()
        template = loader.get_template('emkk_site/trips.html')
        context = {
            'trips_list': trips,
        }
        return HttpResponse(template.render(context, request))

    def post(self, request, *args, **kwargs):
        pass


def get_trip_by_id(request, *args, **kwargs):
    trip_id = kwargs['trip_id']
    try:
        trip = Trip.objects.get(pk=int(trip_id))
    except ObjectDoesNotExist:
        trip = None
        return HttpResponse("<html><body>Trip is not Found.</body></html>") #TODO Заменить на шаблонизатор
    return HttpResponse(f"<html><body>This is trip #{trip.pk}.</body></html>")
