from django.contrib import admin
from .models import Plan, UserSubscription, Payment


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ["name", "tier", "billing_cycle", "price", "currency", "is_active"]
    list_filter = ["tier", "billing_cycle", "is_active"]


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ["user", "plan", "status", "start_date", "end_date", "auto_renew"]
    list_filter = ["status", "plan__tier"]
    search_fields = ["user__email"]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["user", "gateway", "amount", "currency", "status", "created_at"]
    list_filter = ["gateway", "status"]
    search_fields = ["user__email", "gateway_payment_id"]