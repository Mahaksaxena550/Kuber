from rest_framework import serializers
from .models import Order, OrderFill
from apps.market.serializers import InstrumentListSerializer


class OrderFillSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderFill
        fields = ["id", "quantity", "price", "fee", "executed_at"]


class OrderListSerializer(serializers.ModelSerializer):
    instrument_symbol = serializers.CharField(source="instrument.symbol", read_only=True)
    instrument_name = serializers.CharField(source="instrument.name", read_only=True)
    asset_type = serializers.CharField(source="instrument.asset_type", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "uuid", "instrument_symbol", "instrument_name", "asset_type",
            "side", "order_type", "status", "quantity", "price",
            "trigger_price", "filled_quantity", "avg_fill_price",
            "total_value", "validity", "created_at",
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    instrument = InstrumentListSerializer(read_only=True)
    fills = OrderFillSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "uuid", "instrument", "side", "order_type", "status",
            "quantity", "price", "trigger_price",
            "filled_quantity", "avg_fill_price", "total_value",
            "validity", "notes", "rejected_reason",
            "fills", "filled_at", "created_at", "updated_at",
        ]


class PlaceOrderSerializer(serializers.ModelSerializer):
    instrument_id = serializers.IntegerField()

    class Meta:
        model = Order
        fields = [
            "instrument_id", "side", "order_type",
            "quantity", "price", "trigger_price",
            "validity", "notes",
        ]

    def validate(self, attrs):
        order_type = attrs.get("order_type")
        if order_type == "limit" and not attrs.get("price"):
            raise serializers.ValidationError({"price": "Price required for limit orders."})
        if order_type in ("stop_loss", "stop_loss_limit") and not attrs.get("trigger_price"):
            raise serializers.ValidationError({"trigger_price": "Trigger price required for stop-loss orders."})
        if attrs.get("quantity", 0) <= 0:
            raise serializers.ValidationError({"quantity": "Quantity must be positive."})
        return attrs