"""
Wallet views: balance check, deposit, withdrawal, transaction history.
"""
from django.db import transaction as db_transaction
from rest_framework import views, generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.pagination import KuberPagination
from .models import Wallet, Transaction
from .serializers import (
    WalletSerializer,
    TransactionSerializer,
    AddFundsSerializer,
    WithdrawFundsSerializer,
)


class WalletBalanceView(views.APIView):
    """Get the authenticated user's wallet balance."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(
            user=request.user,
            defaults={"tenant": request.user.tenant},
        )
        return Response({
            "success": True,
            "data": WalletSerializer(wallet).data,
        })


class AddFundsView(views.APIView):
    """
    Add funds to wallet.
    In production, this is called after payment gateway confirms the payment.
    For demo, it credits instantly.
    """
    permission_classes = [IsAuthenticated]

    @db_transaction.atomic
    def post(self, request):
        serializer = AddFundsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        amount = serializer.validated_data["amount"]
        payment_id = serializer.validated_data.get("payment_id", "")

        wallet, _ = Wallet.objects.select_for_update().get_or_create(
            user=request.user,
            defaults={"tenant": request.user.tenant},
        )
        wallet.balance += amount
        wallet.save(update_fields=["balance", "updated_at"])

        Transaction.objects.create(
            wallet=wallet,
            tenant=request.user.tenant,
            txn_type="deposit",
            status="completed",
            amount=amount,
            balance_after=wallet.balance,
            description=f"Deposit via {serializer.validated_data['payment_method']}",
            reference_id=payment_id,
        )

        return Response({
            "success": True,
            "message": f"₹{amount} added to wallet.",
            "data": WalletSerializer(wallet).data,
        })


class WithdrawFundsView(views.APIView):
    """Request a withdrawal from wallet."""
    permission_classes = [IsAuthenticated]

    @db_transaction.atomic
    def post(self, request):
        serializer = WithdrawFundsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        amount = serializer.validated_data["amount"]

        wallet = Wallet.objects.select_for_update().get(user=request.user)

        if wallet.available_balance < amount:
            return Response(
                {"success": False, "message": "Insufficient available balance."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        wallet.balance -= amount
        wallet.save(update_fields=["balance", "updated_at"])

        Transaction.objects.create(
            wallet=wallet,
            tenant=request.user.tenant,
            txn_type="withdrawal",
            status="pending",
            amount=amount,
            balance_after=wallet.balance,
            description=serializer.validated_data.get("notes", "Withdrawal request"),
        )

        return Response({
            "success": True,
            "message": f"Withdrawal of ₹{amount} initiated.",
            "data": WalletSerializer(wallet).data,
        })


class TransactionHistoryView(generics.ListAPIView):
    """Paginated transaction history for the authenticated user."""
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = KuberPagination

    def get_queryset(self):
        qs = Transaction.objects.filter(wallet__user=self.request.user)
        txn_type = self.request.query_params.get("type")
        if txn_type:
            qs = qs.filter(txn_type=txn_type)
        return qs