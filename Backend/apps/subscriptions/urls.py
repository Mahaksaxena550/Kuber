from django.urls import path
from .views import (
    PlanListView,
    MySubscriptionView,
    CreateRazorpayOrderView,
    VerifyRazorpayPaymentView,
    CancelSubscriptionView,
    PaymentHistoryView,
)

urlpatterns = [
    path("plans/", PlanListView.as_view(), name="plans"),
    path("my-subscription/", MySubscriptionView.as_view(), name="my-subscription"),
    path("create-order/", CreateRazorpayOrderView.as_view(), name="create-razorpay-order"),
    path("verify-payment/", VerifyRazorpayPaymentView.as_view(), name="verify-razorpay-payment"),
    path("cancel/", CancelSubscriptionView.as_view(), name="cancel-subscription"),
    path("payments/", PaymentHistoryView.as_view(), name="payment-history"),
]