"""
Crypto views: list pairs, execute swap, view order book.
"""
from decimal import Decimal
from django.db import transaction as db_transaction
from rest_framework import generics, views, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.pagination import KuberPagination
from .models import CryptoPair, SwapOrder, OrderBookEntry
from .serializers import (
    CryptoPairSerializer,
    SwapOrderSerializer,
    CreateSwapSerializer,
    OrderBookEntrySerializer,
)


class CryptoPairListView(generics.ListAPIView):
    """List all active crypto trading pairs."""
    serializer_class = CryptoPairSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CryptoPair.objects.filter(is_active=True).select_related("base", "quote")


class CryptoPairDetailView(generics.RetrieveAPIView):
    """Detail for a single crypto pair."""
    serializer_class = CryptoPairSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "uuid"

    def get_queryset(self):
        return CryptoPair.objects.select_related("base", "quote")


class SwapView(views.APIView):
    """
    Execute an instant crypto swap/convert.
    Calculates rate from current prices, deducts fee, returns converted amount.
    """
    permission_classes = [IsAuthenticated]

    @db_transaction.atomic
    def post(self, request):
        serializer = CreateSwapSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            pair = CryptoPair.objects.select_related("base__price", "quote__price").get(
                pk=data["pair_id"], is_active=True
            )
        except CryptoPair.DoesNotExist:
            return Response(
                {"success": False, "message": "Pair not found or inactive."},
                status=status.HTTP_404_NOT_FOUND,
            )

        from_amount = data["from_amount"]

        # Calculate rate from current LTP
        base_price = pair.base.price.ltp if hasattr(pair.base, "price") else Decimal("1")
        quote_price = pair.quote.price.ltp if hasattr(pair.quote, "price") else Decimal("1")
        rate = base_price / quote_price if quote_price else Decimal("1")

        if data["side"] == "buy":
            to_amount = from_amount / rate
        else:
            to_amount = from_amount * rate

        # Apply fee
        fee_pct = pair.taker_fee_pct / Decimal("100")
        fee = to_amount * fee_pct
        to_amount_after_fee = to_amount - fee

        # Create swap order
        swap = SwapOrder.objects.create(
            user=request.user,
            tenant=request.user.tenant,
            pair=pair,
            side=data["side"],
            from_amount=from_amount,
            to_amount=to_amount_after_fee,
            rate=rate,
            fee=fee,
            status="completed",
        )

        return Response({
            "success": True,
            "message": f"Swap completed: {from_amount} → {to_amount_after_fee} ({pair.symbol})",
            "data": SwapOrderSerializer(swap).data,
        }, status=status.HTTP_201_CREATED)


class SwapHistoryView(generics.ListAPIView):
    """List user's swap/convert history."""
    serializer_class = SwapOrderSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = KuberPagination

    def get_queryset(self):
        return SwapOrder.objects.filter(user=self.request.user).select_related("pair")


class OrderBookView(views.APIView):
    """Get the order book (bid/ask levels) for a crypto pair."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pair_uuid):
        try:
            pair = CryptoPair.objects.get(uuid=pair_uuid)
        except CryptoPair.DoesNotExist:
            return Response(
                {"success": False, "message": "Pair not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        bids = OrderBookEntry.objects.filter(pair=pair, side="bid").order_by("-price")[:20]
        asks = OrderBookEntry.objects.filter(pair=pair, side="ask").order_by("price")[:20]

        best_bid = bids.first()
        best_ask = asks.first()
        spread = (best_ask.price - best_bid.price) if (best_bid and best_ask) else Decimal("0")

        return Response({
            "success": True,
            "data": {
                "pair": CryptoPairSerializer(pair).data,
                "bids": OrderBookEntrySerializer(bids, many=True).data,
                "asks": OrderBookEntrySerializer(asks, many=True).data,
                "spread": str(spread),
            },
        })