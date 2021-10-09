from django.urls import path, re_path

from .views import (
    DocumentList, DocumentDetail,
    ReviewList, ReviewDetail,
    TripList, TripDetail)


urlpatterns = [
    path('documents', DocumentList.as_view()),
    path('documents/<int:pk>', DocumentDetail.as_view()),
    path('trips', TripList.as_view()),
    path('trips/<int:pk>', TripDetail.as_view()),
    path('reviews', ReviewList.as_view()),
    path('reviews/<int:pk>', ReviewDetail.as_view()),
    # path('users', UserList.as_view()),
    # path('users/<int:pk>', UserDetail.as_view())
]
