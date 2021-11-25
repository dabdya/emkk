from django.urls import path

from src.emkk_site.views import (
    DocumentList, DocumentDetail,
    ReviewerView, IssuerView, ReviewDetail,
    TripList, TripDetail, WorkRegisterView, )

urlpatterns = [
    path('trips', TripList.as_view()),
    path('trips/<int:pk>', TripDetail.as_view()),
    path('trips/<int:pk>/documents', DocumentList.as_view()),

    path('trips/<int:pk>/reviews', ReviewerView.as_view()),
    path('trips/<int:pk>/reviews/<int:rev_id>', ReviewDetail.as_view()),
    path('trips/<int:pk>/reviews-from-issuer', IssuerView.as_view()),
    path('trips/work', WorkRegisterView.as_view()),

    path('documents/<uuid:doc_uuid>', DocumentDetail.as_view()),
]
