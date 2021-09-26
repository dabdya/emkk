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
