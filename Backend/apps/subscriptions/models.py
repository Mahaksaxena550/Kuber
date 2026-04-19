"""
Subscriptions module: plans, user subscriptions, and payment records.
"""
import uuid
from django.db import models
from core.models import TimestampedModel


class Plan(TimestampedModel):
    """Subscription plan (free / premium tiers)."""

    class Tier(models.TextChoices):
        FREE = "free", "Free"
        PREMIUM = "premium", "Premium"
        ENTERPRISE = "enterprise", "Enterprise"

    class BillingCycle(models.TextChoices):
        MONTHLY = "monthly", "Monthly"
        QUARTERLY = "quarterly", "Quarterly"
        YEARLY = "yearly", "Yearly"

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=100)
    tier = models.CharField(max_length=20, choices=Tier.choices)
    billing_cycle = models.CharField(max_length=20, choices=BillingCycle.choices, default=BillingCycle.MONTHLY)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="INR")
    features = models.JSONField(
        default=dict, blank=True,
        help_text='{"ai_suggestions": true, "max_watchlists": 10}',
    )
    is_active = models.BooleanField(default=True)
    stripe_price_id = models.CharField(max_length=100, blank=True)
    razorpay_plan_id = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = "plans"
        ordering = ["price"]

    def __str__(self):
        return f"{self.name} — ₹{self.price}/{self.billing_cycle}"


class UserSubscription(TimestampedModel):
    """Active or historical subscription for a user."""

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        CANCELLED = "cancelled", "Cancelled"
        EXPIRED = "expired", "Expired"

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey("authentication.User", on_delete=models.CASCADE, related_name="subscriptions")
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name="subscriptions")
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="subscriptions",
        null=True, blank=True,
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    auto_renew = models.BooleanField(default=True)

    class Meta:
        db_table = "user_subscriptions"
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.user.email} — {self.plan.name} ({self.status})"


class Payment(TimestampedModel):
    """Payment record linked to a subscription."""

    class Gateway(models.TextChoices):
        RAZORPAY = "razorpay", "Razorpay"
        STRIPE = "stripe", "Stripe"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey("authentication.User", on_delete=models.CASCADE, related_name="payments")
    subscription = models.ForeignKey(
        UserSubscription, on_delete=models.SET_NULL, null=True, blank=True, related_name="payments",
    )
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="payments",
        null=True, blank=True,
    )
    gateway = models.CharField(max_length=20, choices=Gateway.choices)
    gateway_payment_id = models.CharField(max_length=255, blank=True)
    gateway_order_id = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="INR")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    meta = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "payments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.gateway} ₹{self.amount} — {self.status}"