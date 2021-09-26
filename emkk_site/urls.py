from django.urls import path

from . import views

urlpatterns = [
    path('trips/', views.index, name='index'),
    path('trips/<int:trip_id>/', views.index, name='index'),
    path('trips/<int:trip_id>/<int:document_id>/', views.index, name='index'),
]