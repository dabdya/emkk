from django.urls import path

from src.emkk_site.views import (
    DocumentList, DocumentDetail,
    ReviewerList, IssuerList,
    TripList, TripDetail, WorkRegisterView, )


urlpatterns = [

    path('trips', TripList.as_view()),
    path('trips/<int:pk>', TripDetail.as_view()),

    path('trips/<int:pk>/documents', DocumentList.as_view()),
    path('documents/<uuid:doc_uuid>', DocumentDetail.as_view()),

    path('trips/<int:pk>/reviews', ReviewerList.as_view()),
    path('trips/<int:pk>/reviews-from-issuer', IssuerList.as_view()),

    path('trips/work', WorkRegisterView.as_view()),

]
