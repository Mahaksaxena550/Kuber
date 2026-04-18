from django.contrib import admin
from .models import Holding, PortfolioSnapshot


@admin.register(Holding)
class HoldingAdmin(admin.ModelAdmin):
    list_display = ["user", "instrument", "quantity", "avg_buy_price", "total_invested"]
    search_fields = ["user__email", "instrument__symbol"]


@admin.register(PortfolioSnapshot)
class PortfolioSnapshotAdmin(admin.ModelAdmin):
    list_display = ["user", "date", "total_invested", "total_current_value", "total_pnl"]