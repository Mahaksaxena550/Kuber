from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from core.pagination import KuberPagination
from .models import Instrument, Watchlist, WatchlistItem
from .serializers import (
    InstrumentListSerializer,
    InstrumentDetailSerializer,
    WatchlistSerializer,
    WatchlistItemSerializer,
    AddToWatchlistSerializer,
)


class InstrumentViewSet(viewsets.ReadOnlyModelViewSet):
    """Browse and search tradable instruments (stocks + crypto)."""
    permission_classes = [IsAuthenticated]
    pagination_class = KuberPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["asset_type", "exchange", "sector", "is_active"]
    search_fields = ["symbol", "name"]
    ordering_fields = ["symbol", "name", "market_cap"]

    def get_queryset(self):
        return Instrument.objects.filter(is_active=True).select_related("price")

    def get_serializer_class(self):
        if self.action == "retrieve":
            return InstrumentDetailSerializer
        return InstrumentListSerializer

    @action(detail=False, methods=["get"])
    def top_gainers(self, request):
        """Top 10 instruments by positive % change today."""
        qs = self.get_queryset().filter(
            price__change_pct__gt=0
        ).order_by("-price__change_pct")[:10]
        return Response(InstrumentListSerializer(qs, many=True).data)

    @action(detail=False, methods=["get"])
    def top_losers(self, request):
        """Top 10 instruments by negative % change today."""
        qs = self.get_queryset().filter(
            price__change_pct__lt=0
        ).order_by("price__change_pct")[:10]
        return Response(InstrumentListSerializer(qs, many=True).data)


class WatchlistViewSet(viewsets.ModelViewSet):
    """CRUD for user watchlists."""
    serializer_class = WatchlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Watchlist.objects.filter(user=self.request.user).prefetch_related("items__instrument__price")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, tenant=self.request.user.tenant)

    @action(detail=True, methods=["post"])
    def add_item(self, request, pk=None):
        """Add an instrument to this watchlist."""
        watchlist = self.get_object()
        ser = AddToWatchlistSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        instrument_id = ser.validated_data["instrument_id"]
        if watchlist.items.filter(instrument_id=instrument_id).exists():
            return Response(
                {"success": False, "message": "Already in watchlist."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item = WatchlistItem.objects.create(
            watchlist=watchlist,
            instrument_id=instrument_id,
            sort_order=ser.validated_data.get("sort_order", 0),
        )
        return Response(
            {"success": True, "data": WatchlistItemSerializer(item).data},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["delete"], url_path="remove_item/(?P<instrument_id>[0-9]+)")
    def remove_item(self, request, pk=None, instrument_id=None):
        """Remove an instrument from this watchlist."""
        deleted, _ = watchlist.items.filter(instrument_id=instrument_id).delete()
        if not deleted:
            return Response(
                {"success": False, "message": "Item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response({"success": True, "message": "Removed."})