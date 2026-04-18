from django.contrib import admin
from .models import Order, OrderFill


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["uuid", "user", "instrument", "side", "order_type", "status", "quantity", "price", "created_at"]
    list_filter = ["side", "order_type", "status"]
    search_fields = ["user__email", "instrument__symbol"]


@admin.register(OrderFill)
class OrderFillAdmin(admin.ModelAdmin):
    list_display = ["order", "quantity", "price", "fee", "executed_at"]