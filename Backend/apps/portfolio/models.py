"""
Portfolio module: tracks user holdings and P&L.
Holdings are updated when orders are filled.
"""
from django.db import models
from core.models import TimestampedModel


class Holding(TimestampedModel):
    """Aggregated position for a user in an instrument."""
    user = models.ForeignKey("authentication.User", on_delete=models.CASCADE, related_name="holdings")
    instrument = models.ForeignKey("market.Instrument", on_delete=models.CASCADE, related_name="holdings")
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="holdings",
        null=True, blank=True,
    )
    quantity = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    avg_buy_price = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    total_invested = models.DecimalField(max_digits=20, decimal_places=8, default=0)

    class Meta:
        db_table = "holdings"
        unique_together = ["user", "instrument"]

    def __str__(self):
        return f"{self.user.email}: {self.quantity} {self.instrument.symbol}"

    @property
    def current_value(self):
        """Current market value of the holding."""
        if hasattr(self.instrument, "price") and self.instrument.price:
            return self.quantity * self.instrument.price.ltp
        return self.total_invested

    @property
    def pnl(self):
        """Profit or Loss = current value - invested amount."""
        return self.current_value - self.total_invested

    @property
    def pnl_pct(self):
        """P&L as percentage."""
        if self.total_invested == 0:
            return 0
        return (self.pnl / self.total_invested) * 100


class PortfolioSnapshot(models.Model):
    """Daily snapshot for historical P&L tracking."""
    user = models.ForeignKey("authentication.User", on_delete=models.CASCADE, related_name="portfolio_snapshots")
    date = models.DateField(db_index=True)
    total_invested = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    total_current_value = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    total_pnl = models.DecimalField(max_digits=20, decimal_places=2, default=0)

    class Meta:
        db_table = "portfolio_snapshots"
        unique_together = ["user", "date"]
        ordering = ["-date"]