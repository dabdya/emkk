from src.emkk_site.models import Trip, TripStatus, ReviewFromReviewer, ReviewFromIssuer


def get_reviewers_count_by_difficulty(difficulty):
    if difficulty in (1, 2):
        return 1
    if 3 <= difficulty <= 6:
        return 2
    raise ValueError(f"difficulty must be in [1..6] but found {difficulty}")


def try_change_status_from_review_to_at_issuer(trip):
    existing_reviews_count = len(ReviewFromReviewer.objects.filter(trip=trip))
    needed_reviews_count = get_reviewers_count_by_difficulty(trip.difficulty_category)
    if trip.status == TripStatus.ON_REVIEW and existing_reviews_count + 1 >= needed_reviews_count:
        trip.status = TripStatus.AT_ISSUER
        trip.save()


def try_change_trip_status_to_issuer_result(trip, result):
    if trip.status == TripStatus.AT_ISSUER:
        trip.status = result
        trip.save()


def get_trips_available_for_work(user):
    for_issue = _get_trips_available_for_issuers(user)
    for_review = _get_trips_available_for_reviewers(user)

    if user.ISSUER and user.REVIEWER:
        return for_review + for_issue
    elif user.ISSUER:
        return for_issue
    elif user.REVIEWER:
        return for_review


def _get_trips_available_for_reviewers(user):
    trips = Trip.objects.filter(status=TripStatus.ON_REVIEW)
    trips_available_for_review = []

    for trip in trips:
        needed_reviews_count = get_reviewers_count_by_difficulty(trip.difficulty_category)
        actual_reviews = len(ReviewFromReviewer.objects.filter(trip=trip))

        reviews_count_for_trip = ReviewFromReviewer.objects.filter(trip=trip, reviewer=user).count()

        if actual_reviews < needed_reviews_count and reviews_count_for_trip == 0:
            trips_available_for_review.append(trip)

    return trips_available_for_review


def _get_trips_available_for_issuers(user):
    trips = Trip.objects.filter(status=TripStatus.AT_ISSUER)
    trips_for_issuer = []

    for trip in trips:
        issues_count_for_trip = ReviewFromIssuer.objects.filter(trip=trip, reviewer=user).count()
        if issues_count_for_trip == 0:
            trips_for_issuer.append(trip)

    return trips_for_issuer
