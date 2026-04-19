from rest_framework import serializers
from .models import Plan, UserSubscription, Payment


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = [
            "id", "uuid", "name", "tier", "billing_cycle",
            "price", "currency", "features", "is_active",
        ]


class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)

    class Meta:
        model = UserSubscription
        fields = [
            "id", "uuid", "plan", "status",
            "start_date", "end_date", "auto_renew", "created_at",
        ]


class SubscribeSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField()
    gateway = serializers.ChoiceField(choices=["razorpay", "stripe"], default="razorpay")


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id", "uuid", "gateway", "gateway_payment_id",
            "amount", "currency", "status", "created_at",
        ]