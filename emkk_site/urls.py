from django.urls import path

from .views import DocumentView,ReviewView, TripView, UserView

urlpatterns = [
    path('api/documents', DocumentView.as_view()),
    path('api/reviews', ReviewView.as_view()),
    path('api/trips', TripView.as_view()),
    path('api/users',UserView.as_view())
    #path('trips/', views.TripsView.as_view(), name='trips_get'),
    #path('trips/<int:trip_id>/', views.get_trip_by_id, name='index'),
    #path('trips/<int:trip_id>/<int:document_id>/', views.index, name='index'),
]
