from django.contrib import admin
from .models import Instrument, PriceSnapshot, Watchlist, WatchlistItem


@admin.register(Instrument)
class InstrumentAdmin(admin.ModelAdmin):
    list_display = ["symbol", "name", "asset_type", "exchange", "is_active"]
    list_filter = ["asset_type", "exchange", "is_active"]
    search_fields = ["symbol", "name"]


@admin.register(PriceSnapshot)
class PriceSnapshotAdmin(admin.ModelAdmin):
    list_display = ["instrument", "ltp", "change_pct", "volume", "updated_at"]


@admin.register(Watchlist)
class WatchlistAdmin(admin.ModelAdmin):
    list_display = ["user", "name", "tenant", "created_at"]