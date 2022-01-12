from django.core.mail import send_mail

from src import emails
from django.conf import settings
from src.emkk_site.models import Trip, TripStatus, ReviewFromReviewer, ReviewFromIssuer, UserExperience, Review
from django.db.models import Q


def get_reviewers_count_by_difficulty(difficulty):
    if difficulty in (1, 2):
        return 1
    if 3 <= difficulty <= 6:
        return 2
    raise ValueError(f"difficulty must be in [1..6] but found {difficulty}")


def try_change_status_from_review_to_at_issuer(trip):
    existing_reviews_count = len(ReviewFromReviewer.objects.filter(trip=trip))
    needed_reviews_count = get_reviewers_count_by_difficulty(trip.difficulty_category)
    if trip.status == TripStatus.ON_REVIEW and existing_reviews_count + 1 == needed_reviews_count:
        trip.status = TripStatus.AT_ISSUER
        trip.save()


def try_change_trip_status_to_issuer_result(trip, result):
    if trip.status == TripStatus.AT_ISSUER:
        trip.status = result
        trip.save()


def get_trips_available_for_work(user):
    for_issue = get_trips_available_for_issue(user)
    for_review = get_trips_available_for_review(user)

    if user.ISSUER and user.REVIEWER:
        return for_review + for_issue
    elif user.ISSUER:
        return for_issue
    elif user.REVIEWER:
        return for_review


def get_trips_available_for_review(user):
    trips = Trip.objects.filter(
        Q(status=TripStatus.ON_REVIEW) | Q(status=TripStatus.AT_ISSUER))
    trips_available_for_review = [
        trip for trip in trips
        if user_can_be_reviewer(user, trip) and first_review_for(user, trip)
    ]
    return trips_available_for_review


def get_trips_available_for_issue(user):
    trips = Trip.objects.filter(status=TripStatus.AT_ISSUER)
    trips_available_for_issue = [
        trip for trip in trips
        if user_can_be_issuer(user, trip) and first_issue_for(user, trip)
    ]
    return trips_available_for_issue


def first_issue_for(user, trip):
    return ReviewFromIssuer.objects.filter(trip=trip, reviewer=user).count() == 0


def user_can_be_issuer(user, trip):
    experience = UserExperience.objects.filter(user=user, trip_kind=trip.kind)
    return bool(experience) and experience[0].is_issuer


def first_review_for(user, trip):
    return ReviewFromReviewer.objects.filter(trip=trip, reviewer=user).count() == 0


def user_can_be_reviewer(user, trip):
    experience = UserExperience.objects.filter(user=user, trip_kind=trip.kind)
    return bool(experience) and experience[0].difficulty_as_for_reviewer >= trip.difficulty_category


def notify_reviewers_on_trip_updated(trip):
    reviews = Review.objects.filter(trip=trip)
    reviewers = set(x.reviewer for x in reviews)
    for user in reviewers:
        send_mail(subject=emails.UPDATE.HEAD % (trip.id, trip.global_region, trip.local_region,),
                  message=emails.UPDATE.BODY % (trip.id, trip.global_region, trip.local_region,),
                  from_email=settings.EMAIL_HOST_USER,
                  recipient_list=[user.email, ],
                  fail_silently=True)
