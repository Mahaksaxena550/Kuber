"""
Orders module: buy/sell orders for stocks & crypto.
Supports market, limit, and stop-loss order types.
"""
import uuid
from django.db import models
from core.models import TimestampedModel


class Order(TimestampedModel):
    """A buy or sell order placed by a user."""
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="orders",
        null=True, blank=True,
    )

    class Side(models.TextChoices):
        BUY = "buy", "Buy"
        SELL = "sell", "Sell"

    class OrderType(models.TextChoices):
        MARKET = "market", "Market"
        LIMIT = "limit", "Limit"
        STOP_LOSS = "stop_loss", "Stop Loss"
        STOP_LOSS_LIMIT = "stop_loss_limit", "Stop Loss Limit"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        OPEN = "open", "Open"
        PARTIALLY_FILLED = "partially_filled", "Partially Filled"
        FILLED = "filled", "Filled"
        CANCELLED = "cancelled", "Cancelled"
        REJECTED = "rejected", "Rejected"
        EXPIRED = "expired", "Expired"

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey("authentication.User", on_delete=models.CASCADE, related_name="orders")
    instrument = models.ForeignKey("market.Instrument", on_delete=models.CASCADE, related_name="orders")

    side = models.CharField(max_length=4, choices=Side.choices)
    order_type = models.CharField(max_length=20, choices=OrderType.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    quantity = models.DecimalField(max_digits=18, decimal_places=8)
    price = models.DecimalField(
        max_digits=18, decimal_places=8, null=True, blank=True,
        help_text="Limit price (null for market orders)",
    )
    trigger_price = models.DecimalField(
        max_digits=18, decimal_places=8, null=True, blank=True,
        help_text="Stop-loss trigger price",
    )
    filled_quantity = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    avg_fill_price = models.DecimalField(max_digits=18, decimal_places=8, null=True, blank=True)
    total_value = models.DecimalField(max_digits=20, decimal_places=8, default=0)

    validity = models.CharField(
        max_length=10, default="day",
        choices=[("day", "Day"), ("gtc", "Good Till Cancelled"), ("ioc", "Immediate or Cancel")],
    )

    notes = models.TextField(blank=True)
    rejected_reason = models.TextField(blank=True)
    filled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["instrument", "status"]),
        ]

    def __str__(self):
        return f"{self.side.upper()} {self.quantity} {self.instrument.symbol} @ {self.price or 'MKT'}"

    @property
    def is_open(self):
        return self.status in (self.Status.PENDING, self.Status.OPEN, self.Status.PARTIALLY_FILLED)


class OrderFill(TimestampedModel):
    """Individual fill (execution) of an order — supports partial fills."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="fills")
    quantity = models.DecimalField(max_digits=18, decimal_places=8)
    price = models.DecimalField(max_digits=18, decimal_places=8)
    fee = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    executed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "order_fills"

    def __str__(self):
        return f"Fill: {self.quantity}@{self.price} for Order#{self.order_id}"