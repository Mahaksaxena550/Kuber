from django.urls import path
from .views import (
    PlanListView,
    MySubscriptionView,
    SubscribeView,
    CancelSubscriptionView,
    PaymentHistoryView,
)

urlpatterns = [
    path("plans/", PlanListView.as_view(), name="plans"),
    path("my-subscription/", MySubscriptionView.as_view(), name="my-subscription"),
    path("subscribe/", SubscribeView.as_view(), name="subscribe"),
    path("cancel/", CancelSubscriptionView.as_view(), name="cancel-subscription"),
    path("payments/", PaymentHistoryView.as_view(), name="payment-history"),
]