"""
Order views: place, list, detail, cancel.
Simulates order matching for demo.
"""
from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.pagination import KuberPagination
from .models import Order, OrderFill
from .serializers import OrderListSerializer, OrderDetailSerializer, PlaceOrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    """Place, list, and manage trading orders."""
    permission_classes = [IsAuthenticated]
    pagination_class = KuberPagination
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        qs = Order.objects.filter(user=self.request.user).select_related("instrument__price")

        # Filters
        side = self.request.query_params.get("side")
        status_filter = self.request.query_params.get("status")
        asset_type = self.request.query_params.get("asset_type")

        if side:
            qs = qs.filter(side=side)
        if status_filter:
            qs = qs.filter(status=status_filter)
        if asset_type:
            qs = qs.filter(instrument__asset_type=asset_type)

        return qs

    def get_serializer_class(self):
        if self.action in ("create",):
            return PlaceOrderSerializer
        if self.action == "retrieve":
            return OrderDetailSerializer
        return OrderListSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Place a new order."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        from apps.market.models import Instrument
        try:
            instrument = Instrument.objects.select_related("price").get(pk=data["instrument_id"])
        except Instrument.DoesNotExist:
            return Response(
                {"success": False, "message": "Instrument not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Create the order
        order = Order.objects.create(
            user=request.user,
            tenant=request.user.tenant,
            instrument=instrument,
            side=data["side"],
            order_type=data["order_type"],
            quantity=data["quantity"],
            price=data.get("price"),
            trigger_price=data.get("trigger_price"),
            validity=data.get("validity", "day"),
            notes=data.get("notes", ""),
            status="pending",
        )

        # Simulate instant fill for market orders
        if data["order_type"] == "market" and hasattr(instrument, "price"):
            fill_price = instrument.price.ltp
            self._fill_order(order, data["quantity"], fill_price)

        return Response(
            {
                "success": True,
                "message": f"Order placed: {order.side.upper()} {order.quantity} {instrument.symbol}",
                "data": OrderDetailSerializer(order).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel an open order."""
        order = self.get_object()
        if not order.is_open:
            return Response(
                {"success": False, "message": f"Cannot cancel order in '{order.status}' state."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.status = "cancelled"
        order.save(update_fields=["status", "updated_at"])
        return Response({"success": True, "message": "Order cancelled."})

    @action(detail=False, methods=["get"])
    def open_orders(self, request):
        """List only open/pending orders."""
        qs = self.get_queryset().filter(status__in=["pending", "open", "partially_filled"])
        serializer = OrderListSerializer(qs, many=True)
        return Response({"success": True, "data": serializer.data})

    @action(detail=False, methods=["get"])
    def order_history(self, request):
        """List completed/cancelled orders."""
        qs = self.get_queryset().filter(status__in=["filled", "cancelled", "rejected", "expired"])
        page = self.paginate_queryset(qs)
        serializer = OrderListSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    @staticmethod
    def _fill_order(order, quantity, price):
        """Simulate filling an order (demo logic)."""
        OrderFill.objects.create(order=order, quantity=quantity, price=price, fee=Decimal("0"))
        order.filled_quantity = quantity
        order.avg_fill_price = price
        order.total_value = quantity * price
        order.status = "filled"
        order.filled_at = timezone.now()
        order.save()