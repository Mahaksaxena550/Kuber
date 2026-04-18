from django.contrib import admin
from .models import Wallet, Transaction


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ["user", "balance", "locked_balance", "updated_at"]
    search_fields = ["user__email"]


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ["wallet", "txn_type", "status", "amount", "balance_after", "created_at"]
    list_filter = ["txn_type", "status"]
    search_fields = ["wallet__user__email", "reference_id"]