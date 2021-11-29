from django.urls import path

from src.emkk_site.views import (
    TripDocumentList, DocumentDetail,
    ReviewerList, IssuerList,
    TripList, TripDetail, WorkRegisterView, ReviewDocumentList, ReviewFromIssuerDocumentList, )


urlpatterns = [

    path('trips', TripList.as_view()),
    path('trips/<int:pk>', TripDetail.as_view()),

    path('trips/<int:pk>/documents', TripDocumentList.as_view()),
    path('documents/<uuid:doc_uuid>', DocumentDetail.as_view()),

    path('trips/<int:pk>/reviews', ReviewerList.as_view()),
    path('trips/<int:trip_id>/reviews/<int:pk>/documents', ReviewDocumentList.as_view()),

    path('trips/<int:pk>/reviews-from-issuer', IssuerList.as_view()),
    path('trips/<int:trip_id>/reviews-from-issuer/<int:pk>/documents', ReviewFromIssuerDocumentList.as_view()),

    path('trips/work', WorkRegisterView.as_view()),

]
