from django.urls import path

from .views import DocumentList, ReviewList, TripView, UserView, DocumentDetail

urlpatterns = [
    path('api/documents', DocumentList.as_view()),
    path('api/documents/<int:pk>', DocumentDetail.as_view()),
    path('api/reviews', ReviewList.as_view()),
    path('api/trips', TripView.as_view()),
    path('api/users', UserView.as_view()),
]
