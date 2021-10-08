from django.urls import path, re_path

from .views import (
    DocumentList, DocumentDetail,
    ReviewList, ReviewDetail,
    TripList, TripDetail,
    UserList, UserDetail)


urlpatterns = [
    path('api/documents', DocumentList.as_view()),
    path('api/documents/<int:pk>', DocumentDetail.as_view()),
    path('api/trips', TripList.as_view()),
    path('api/trips/<int:pk>', TripDetail.as_view()),
    path('api/reviews', ReviewList.as_view()),
    path('api/reviews/<int:pk>', ReviewDetail.as_view()),
    path('api/users', UserList.as_view()),
    path('api/users/<int:pk>', UserDetail.as_view())
]
