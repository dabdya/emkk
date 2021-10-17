from django.urls import path, re_path

from .views import (
    DocumentList, DocumentDetail,
    ReviewList, ReviewDetail,
    TripList, TripDetail, take_trip_on_review, change_trip_status)

urlpatterns = [
    path('trips', TripList.as_view()),
    path('trips/<int:pk>', TripDetail.as_view()),
    path('trips/<int:trip_id>/take-on-review', take_trip_on_review),
    path('trips/<int:trip_id>/change-status', change_trip_status),
    path('trips/<int:pk>/documents', DocumentList.as_view()),
    path('trips/<int:pk>/documents/<int:doc_id>', DocumentDetail.as_view()),

    path('trips/<int:pk>/reviews', ReviewList.as_view()),
    path('trips/<int:pk>/reviews/<int:rev_id>', ReviewDetail.as_view()),

    path('trips/for-review', TripsForReview.as_view())
]
"""
trips GET - get all trips
trips POST - create new trip
trips/{id} GET - concrete trip
trips/{id} PUT - concrete trip
trips/{id} DELETE - concrete trip


trips/{trip_id}/documents - GET id's array of related documents
trips/{trip_id}/documents - POST - Creating
trips/{trip_id}/documents/{doc_id} - GET, PUT - Update, DELETE

trips/{trip_id}/reviews - GET array of related review
trips/{trip_id}/reviews - POST - Creating
trips/{trip_id}/reviews/{rev_id} - GET, PUT - Update, DELETE
"""
