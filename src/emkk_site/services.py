from .models import Trip, Review, TripsOnReviewByUser
from .utils.reviewers_count_by_difficulty import get_reviewers_count_by_difficulty  # перенести сюда же?


def get_trips_available_for_reviews():
    all_trips = Trip.objects.all()
    trips_available_for_review = []
    for trip in all_trips:
        on_review_now = len(TripsOnReviewByUser.objects.filter(trip=trip))
        existing_reviews_count = len(Review.objects.filter(trip=trip))
        needed_reviews_count = get_reviewers_count_by_difficulty(trip.difficulty_category)
        if on_review_now + existing_reviews_count < needed_reviews_count:
            trips_available_for_review.append(trip)

    return trips_available_for_review
