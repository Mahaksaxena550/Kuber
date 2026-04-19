from django.urls import path
from .views import (
    CryptoPairListView,
    CryptoPairDetailView,
    SwapView,
    SwapHistoryView,
    OrderBookView,
)

urlpatterns = [
    path("pairs/", CryptoPairListView.as_view(), name="crypto-pairs"),
    path("pairs/<uuid:uuid>/", CryptoPairDetailView.as_view(), name="crypto-pair-detail"),
    path("swap/", SwapView.as_view(), name="crypto-swap"),
    path("swap/history/", SwapHistoryView.as_view(), name="swap-history"),
    path("orderbook/<uuid:pair_uuid>/", OrderBookView.as_view(), name="order-book"),
]