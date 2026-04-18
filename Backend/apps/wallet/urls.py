from django.urls import path
from .views import WalletBalanceView, AddFundsView, WithdrawFundsView, TransactionHistoryView

urlpatterns = [
    path("balance/", WalletBalanceView.as_view(), name="wallet-balance"),
    path("add-funds/", AddFundsView.as_view(), name="add-funds"),
    path("withdraw/", WithdrawFundsView.as_view(), name="withdraw"),
    path("transactions/", TransactionHistoryView.as_view(), name="transactions"),
]