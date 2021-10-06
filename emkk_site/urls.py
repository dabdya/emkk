from django.urls import path

from .views import DocumentList, ReviewView, TripView, UserView, DocumentDetail, index

urlpatterns = [
    path('api/documents', DocumentList.as_view()),
    path('api/documents/<int:pk>', DocumentDetail.as_view()),
    path('api/reviews', ReviewView.as_view()),
    path('api/trips', TripView.as_view()),
    path('api/users', UserView.as_view()),
    path('rand', index)
]
