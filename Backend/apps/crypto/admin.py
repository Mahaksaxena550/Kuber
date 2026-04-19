from django.contrib import admin
from .models import CryptoPair, SwapOrder, OrderBookEntry


@admin.register(CryptoPair)
class CryptoPairAdmin(admin.ModelAdmin):
    list_display = ["symbol", "base", "quote", "is_active", "maker_fee_pct", "taker_fee_pct"]
    list_filter = ["is_active"]
    search_fields = ["symbol"]


@admin.register(SwapOrder)
class SwapOrderAdmin(admin.ModelAdmin):
    list_display = ["user", "pair", "side", "from_amount", "to_amount", "rate", "status", "created_at"]
    list_filter = ["status", "side"]
    search_fields = ["user__email", "pair__symbol"]


@admin.register(OrderBookEntry)
class OrderBookEntryAdmin(admin.ModelAdmin):
    list_display = ["pair", "side", "price", "quantity", "total"]
    list_filter = ["side"]