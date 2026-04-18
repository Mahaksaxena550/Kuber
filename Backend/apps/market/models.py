"""
Market module models.
- Instrument: tradable asset (stock or crypto)
- PriceSnapshot: cached price data
- Watchlist / WatchlistItem: user watchlists
"""
import uuid
from django.db import models
from core.models import TimestampedModel, TenantAwareModel, UUIDModel


class Instrument(TimestampedModel, UUIDModel):
    """A tradable asset — stock or crypto coin."""

    class AssetType(models.TextChoices):
        STOCK = "stock", "Stock"
        CRYPTO = "crypto", "Crypto"

    symbol = models.CharField(max_length=20, db_index=True)
    name = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=10, choices=AssetType.choices)
    exchange = models.CharField(max_length=50, blank=True)
    logo_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    sector = models.CharField(max_length=100, blank=True)
    market_cap = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    meta = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "instruments"
        unique_together = ["symbol", "exchange"]
        ordering = ["symbol"]

    def __str__(self):
        return f"{self.symbol} ({self.exchange})"


class PriceSnapshot(models.Model):
    """Cached latest price for an instrument."""
    instrument = models.OneToOneField(Instrument, on_delete=models.CASCADE, related_name="price")
    ltp = models.DecimalField(max_digits=18, decimal_places=8, help_text="Last traded price")
    open_price = models.DecimalField(max_digits=18, decimal_places=8, null=True)
    high = models.DecimalField(max_digits=18, decimal_places=8, null=True)
    low = models.DecimalField(max_digits=18, decimal_places=8, null=True)
    close = models.DecimalField(max_digits=18, decimal_places=8, null=True)
    prev_close = models.DecimalField(max_digits=18, decimal_places=8, null=True)
    volume = models.BigIntegerField(default=0)
    change = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    change_pct = models.DecimalField(max_digits=8, decimal_places=4, default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "price_snapshots"

    def __str__(self):
        return f"{self.instrument.symbol}: {self.ltp}"


class Watchlist(TenantAwareModel, UUIDModel):
    """User-created watchlist."""
    user = models.ForeignKey("authentication.User", on_delete=models.CASCADE, related_name="watchlists")
    name = models.CharField(max_length=100, default="My Watchlist")

    class Meta:
        db_table = "watchlists"
        unique_together = ["user", "name"]

    def __str__(self):
        return f"{self.user.email} — {self.name}"


class WatchlistItem(TimestampedModel):
    """An instrument pinned to a watchlist."""
    watchlist = models.ForeignKey(Watchlist, on_delete=models.CASCADE, related_name="items")
    instrument = models.ForeignKey(Instrument, on_delete=models.CASCADE)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "watchlist_items"
        unique_together = ["watchlist", "instrument"]
        ordering = ["sort_order"]