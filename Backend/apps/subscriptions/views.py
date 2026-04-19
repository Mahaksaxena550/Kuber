"""
Subscription views: browse plans, subscribe, cancel, payment history.
"""
from rest_framework import generics, views, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db import transaction as db_transaction

from .models import Plan, UserSubscription, Payment
from .serializers import (
    PlanSerializer,
    UserSubscriptionSerializer,
    SubscribeSerializer,
    PaymentSerializer,
)


class PlanListView(generics.ListAPIView):
    """List all active plans — public endpoint."""
    serializer_class = PlanSerializer
    permission_classes = [AllowAny]
    queryset = Plan.objects.filter(is_active=True)


class MySubscriptionView(views.APIView):
    """Get the current user's active subscription."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sub = (
            UserSubscription.objects.filter(user=request.user, status="active")
            .select_related("plan")
            .first()
        )
        if not sub:
            return Response({
                "success": True,
                "data": None,
                "message": "No active subscription. You are on the free tier.",
            })
        return Response({
            "success": True,
            "data": UserSubscriptionSerializer(sub).data,
        })


class SubscribeView(views.APIView):
    """
    Subscribe to a plan.
    For demo, auto-activates the subscription instantly.
    """
    permission_classes = [IsAuthenticated]

    @db_transaction.atomic
    def post(self, request):
        serializer = SubscribeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            plan = Plan.objects.get(pk=serializer.validated_data["plan_id"], is_active=True)
        except Plan.DoesNotExist:
            return Response(
                {"success": False, "message": "Plan not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        gateway = serializer.validated_data["gateway"]

        # Deactivate any current active subscription
        UserSubscription.objects.filter(
            user=request.user, status="active"
        ).update(status="cancelled")

        # Create new subscription
        sub = UserSubscription.objects.create(
            user=request.user,
            tenant=request.user.tenant,
            plan=plan,
            status="active",
        )

        # Create payment record (demo: instant success)
        payment = Payment.objects.create(
            user=request.user,
            tenant=request.user.tenant,
            subscription=sub,
            gateway=gateway,
            amount=plan.price,
            currency=plan.currency,
            status="success",
        )

        return Response({
            "success": True,
            "message": f"Subscribed to {plan.name}.",
            "data": {
                "subscription": UserSubscriptionSerializer(sub).data,
                "payment": PaymentSerializer(payment).data,
            },
        }, status=status.HTTP_201_CREATED)


class CancelSubscriptionView(views.APIView):
    """Cancel the active subscription."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sub = UserSubscription.objects.filter(
            user=request.user, status="active"
        ).first()
        if not sub:
            return Response(
                {"success": False, "message": "No active subscription to cancel."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        sub.status = "cancelled"
        sub.auto_renew = False
        sub.save(update_fields=["status", "auto_renew", "updated_at"])
        return Response({"success": True, "message": "Subscription cancelled."})


class PaymentHistoryView(generics.ListAPIView):
    """List all payment records for the user."""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)