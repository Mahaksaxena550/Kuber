"""
AI Bot module: trade suggestions with confidence scores.
Premium-only feature gated by subscription.
"""
import uuid
from django.db import models
from core.models import TimestampedModel


class TradeSuggestion(TimestampedModel):
    """AI-generated trade suggestion."""

    class Action(models.TextChoices):
        BUY = "buy", "Buy"
        SELL = "sell", "Sell"
        HOLD = "hold", "Hold"

    class Timeframe(models.TextChoices):
        INTRADAY = "intraday", "Intraday"
        SHORT_TERM = "short_term", "Short Term (1-7 days)"
        MEDIUM_TERM = "medium_term", "Medium Term (1-3 months)"
        LONG_TERM = "long_term", "Long Term (3+ months)"

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="trade_suggestions",
        null=True, blank=True,
    )
    user = models.ForeignKey(
        "authentication.User", on_delete=models.CASCADE,
        related_name="trade_suggestions", null=True, blank=True,
        help_text="Null = global suggestion for all premium users.",
    )
    instrument = models.ForeignKey("market.Instrument", on_delete=models.CASCADE)
    action = models.CharField(max_length=4, choices=Action.choices)
    confidence = models.DecimalField(
        max_digits=5, decimal_places=2,
        help_text="Confidence score 0-100%.",
    )
    target_price = models.DecimalField(max_digits=18, decimal_places=8, null=True, blank=True)
    stop_loss_price = models.DecimalField(max_digits=18, decimal_places=8, null=True, blank=True)
    timeframe = models.CharField(max_length=20, choices=Timeframe.choices, default=Timeframe.SHORT_TERM)
    reasoning = models.TextField(help_text="AI rationale for the suggestion.")
    signals = models.JSONField(
        default=dict, blank=True,
        help_text="Technical indicators: RSI, MACD, moving averages, etc.",
    )
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "trade_suggestions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action.upper()} {self.instrument.symbol} ({self.confidence}%)"


class SuggestionFeedback(TimestampedModel):
    """User feedback on a suggestion — used to improve AI accuracy."""
    suggestion = models.ForeignKey(TradeSuggestion, on_delete=models.CASCADE, related_name="feedback")
    user = models.ForeignKey("authentication.User", on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(
        choices=[(1, "Poor"), (2, "Below Average"), (3, "Average"), (4, "Good"), (5, "Excellent")],
    )
    acted_on = models.BooleanField(default=False, help_text="Did the user place a trade based on this?")
    comment = models.TextField(blank=True)

    class Meta:
        db_table = "suggestion_feedback"
        unique_together = ["suggestion", "user"]