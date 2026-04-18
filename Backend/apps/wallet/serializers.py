from rest_framework import serializers
from .models import Wallet, Transaction


class WalletSerializer(serializers.ModelSerializer):
    available_balance = serializers.DecimalField(max_digits=20, decimal_places=4, read_only=True)

    class Meta:
        model = Wallet
        fields = ["id", "balance", "locked_balance", "available_balance", "updated_at"]


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id", "uuid", "txn_type", "status", "amount",
            "balance_after", "description", "reference_id",
            "created_at",
        ]


class AddFundsSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=20, decimal_places=4, min_value=1)
    payment_method = serializers.ChoiceField(
        choices=["razorpay", "stripe", "upi", "bank_transfer"],
        default="razorpay",
    )
    payment_id = serializers.CharField(
        max_length=255, required=False,
        help_text="Payment gateway transaction ID after successful payment.",
    )


class WithdrawFundsSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=20, decimal_places=4, min_value=1)
    notes = serializers.CharField(max_length=500, required=False, default="")