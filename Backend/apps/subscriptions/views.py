"""
Subscription views with Razorpay payment integration.
"""
import razorpay
from django.conf import settings
from django.db import transaction as db_transaction
from rest_framework import generics, views, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import Plan, UserSubscription, Payment
from .serializers import (
    PlanSerializer,
    UserSubscriptionSerializer,
    SubscribeSerializer,
    PaymentSerializer,
)

# Initialize Razorpay client
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
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


class CreateRazorpayOrderView(views.APIView):
    """Create a Razorpay order for subscription payment."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")
        try:
            plan = Plan.objects.get(pk=plan_id, is_active=True)
        except Plan.DoesNotExist:
            return Response(
                {"success": False, "message": "Plan not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if plan.price == 0:
            return Response(
                {"success": False, "message": "Free plan does not require payment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create Razorpay order
        amount_in_paise = int(plan.price * 100)  # Razorpay uses paise
        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1,  # Auto capture payment
            "notes": {
                "plan_id": str(plan.id),
                "plan_name": plan.name,
                "user_email": request.user.email,
            },
        })

        # Save payment record with pending status
        payment = Payment.objects.create(
            user=request.user,
            tenant=request.user.tenant,
            gateway="razorpay",
            gateway_order_id=razorpay_order["id"],
            amount=plan.price,
            currency="INR",
            status="pending",
            meta={"plan_id": plan.id},
        )

        return Response({
            "success": True,
            "data": {
                "order_id": razorpay_order["id"],
                "amount": amount_in_paise,
                "currency": "INR",
                "key_id": settings.RAZORPAY_KEY_ID,
                "plan_name": plan.name,
                "payment_id": str(payment.uuid),
            },
        })


class VerifyRazorpayPaymentView(views.APIView):
    """Verify Razorpay payment and activate subscription."""
    permission_classes = [IsAuthenticated]

    @db_transaction.atomic
    def post(self, request):
        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature = request.data.get("razorpay_signature")

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response(
                {"success": False, "message": "Missing payment details."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify signature
        try:
            razorpay_client.utility.verify_payment_signature({
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            })
        except razorpay.errors.SignatureVerificationError:
            return Response(
                {"success": False, "message": "Payment verification failed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find the payment record
        try:
            payment = Payment.objects.get(
                gateway_order_id=razorpay_order_id,
                user=request.user,
            )
        except Payment.DoesNotExist:
            return Response(
                {"success": False, "message": "Payment record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Update payment
        payment.gateway_payment_id = razorpay_payment_id
        payment.status = "success"
        payment.save(update_fields=["gateway_payment_id", "status", "updated_at"])

        # Get plan from payment meta
        plan_id = payment.meta.get("plan_id")
        plan = Plan.objects.get(pk=plan_id)

        # Deactivate current subscription
        UserSubscription.objects.filter(
            user=request.user, status="active"
        ).update(status="cancelled")

        # Create new active subscription
        sub = UserSubscription.objects.create(
            user=request.user,
            tenant=request.user.tenant,
            plan=plan,
            status="active",
        )
        payment.subscription = sub
        payment.save(update_fields=["subscription"])

        return Response({
            "success": True,
            "message": f"Payment successful! Subscribed to {plan.name}.",
            "data": {
                "subscription": UserSubscriptionSerializer(sub).data,
                "payment": PaymentSerializer(payment).data,
            },
        })


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