"""
Wallet module: user balance management and transaction ledger.
Every user gets one wallet (auto-created via signal).
"""
import uuid
from django.db import models
from core.models import TimestampedModel


class Wallet(TimestampedModel):
    """Single wallet per user — holds available and locked balance."""
    user = models.OneToOneField("authentication.User", on_delete=models.CASCADE, related_name="wallet")
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="wallets",
        null=True, blank=True,
    )
    balance = models.DecimalField(max_digits=20, decimal_places=4, default=0)
    locked_balance = models.DecimalField(
        max_digits=20, decimal_places=4, default=0,
        help_text="Funds reserved for open orders.",
    )

    class Meta:
        db_table = "wallets"

    def __str__(self):
        return f"{self.user.email}: ₹{self.balance}"

    @property
    def available_balance(self):
        """Balance minus locked funds."""
        return self.balance - self.locked_balance


class Transaction(TimestampedModel):
    """Immutable ledger entry for every wallet movement."""

    class TxnType(models.TextChoices):
        DEPOSIT = "deposit", "Deposit"
        WITHDRAWAL = "withdrawal", "Withdrawal"
        BUY = "buy", "Buy"
        SELL = "sell", "Sell"
        FEE = "fee", "Fee"
        REFUND = "refund", "Refund"
        SUBSCRIPTION = "subscription", "Subscription"

    class TxnStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        REVERSED = "reversed", "Reversed"

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="transactions",
        null=True, blank=True,
    )
    txn_type = models.CharField(max_length=20, choices=TxnType.choices)
    status = models.CharField(max_length=20, choices=TxnStatus.choices, default=TxnStatus.PENDING)
    amount = models.DecimalField(max_digits=20, decimal_places=4)
    balance_after = models.DecimalField(max_digits=20, decimal_places=4, help_text="Wallet balance after this txn.")
    description = models.CharField(max_length=500, blank=True)
    reference_id = models.CharField(
        max_length=255, blank=True,
        help_text="External ref: payment gateway ID, order UUID, etc.",
    )
    meta = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "transactions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.txn_type} ₹{self.amount} — {self.status}"