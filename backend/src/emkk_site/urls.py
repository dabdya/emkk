from django.urls import path

from src.emkk_site.views import (
    change_trip_status,
    TripDocumentList, DocumentDetail,
    ReviewerList, IssuerList, ReviewDetail,
    TripList, TripDetail, ReviewDocumentList, ReviewFromIssuerDocumentList, )


urlpatterns = [

    path('trips', TripList.as_view()),
    path('trips/<int:pk>', TripDetail.as_view()),
    path('trips/<int:pk>/change-status', change_trip_status),

    path('reviews/<int:pk>', ReviewDetail().as_view()),

    path('trips/<int:pk>/documents', TripDocumentList.as_view()),
    path('documents/<uuid:doc_uuid>', DocumentDetail.as_view()),

    path('trips/<int:pk>/reviews', ReviewerList.as_view()),
    path('trips/<int:trip_id>/reviews/<int:pk>/documents', ReviewDocumentList.as_view()),

    path('trips/<int:pk>/reviews-from-issuer', IssuerList.as_view()),
    path('trips/<int:trip_id>/reviews-from-issuer/<int:pk>/documents', ReviewFromIssuerDocumentList.as_view()),

]
