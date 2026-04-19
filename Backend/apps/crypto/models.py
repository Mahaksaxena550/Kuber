"""
Crypto module: swap/convert between crypto pairs,
order book entries, and crypto-specific operations.
"""
import uuid
from django.db import models
from core.models import TimestampedModel


class CryptoPair(TimestampedModel):
    """Tradable crypto pair, e.g. BTC/USDT."""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    base = models.ForeignKey(
        "market.Instrument", on_delete=models.CASCADE, related_name="base_pairs",
        help_text="Base asset (e.g. BTC)",
    )
    quote = models.ForeignKey(
        "market.Instrument", on_delete=models.CASCADE, related_name="quote_pairs",
        help_text="Quote asset (e.g. USDT)",
    )
    symbol = models.CharField(max_length=30, unique=True, help_text="e.g. BTC/USDT")
    is_active = models.BooleanField(default=True)
    min_quantity = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    max_quantity = models.DecimalField(max_digits=18, decimal_places=8, null=True, blank=True)
    tick_size = models.DecimalField(max_digits=18, decimal_places=8, default=0.01)
    maker_fee_pct = models.DecimalField(max_digits=5, decimal_places=4, default=0.1)
    taker_fee_pct = models.DecimalField(max_digits=5, decimal_places=4, default=0.1)

    class Meta:
        db_table = "crypto_pairs"
        ordering = ["symbol"]

    def __str__(self):
        return self.symbol


class SwapOrder(TimestampedModel):
    """Instant swap/convert between two crypto assets."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey("authentication.User", on_delete=models.CASCADE, related_name="swap_orders")
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="swap_orders",
        null=True, blank=True,
    )
    pair = models.ForeignKey(CryptoPair, on_delete=models.CASCADE, related_name="swaps")
    side = models.CharField(max_length=4, choices=[("buy", "Buy"), ("sell", "Sell")])
    from_amount = models.DecimalField(max_digits=18, decimal_places=8)
    to_amount = models.DecimalField(max_digits=18, decimal_places=8)
    rate = models.DecimalField(max_digits=18, decimal_places=8, help_text="Exchange rate at execution")
    fee = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    class Meta:
        db_table = "swap_orders"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Swap {self.from_amount} → {self.to_amount} ({self.pair.symbol})"


class OrderBookEntry(TimestampedModel):
    """Simulated order book — aggregated price levels."""
    pair = models.ForeignKey(CryptoPair, on_delete=models.CASCADE, related_name="order_book")
    side = models.CharField(max_length=3, choices=[("bid", "Bid"), ("ask", "Ask")])
    price = models.DecimalField(max_digits=18, decimal_places=8)
    quantity = models.DecimalField(max_digits=18, decimal_places=8)
    total = models.DecimalField(max_digits=20, decimal_places=8, default=0)

    class Meta:
        db_table = "order_book_entries"
        ordering = ["price"]