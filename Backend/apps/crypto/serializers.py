from rest_framework import serializers
from .models import CryptoPair, SwapOrder, OrderBookEntry


class CryptoPairSerializer(serializers.ModelSerializer):
    base_symbol = serializers.CharField(source="base.symbol", read_only=True)
    base_name = serializers.CharField(source="base.name", read_only=True)
    quote_symbol = serializers.CharField(source="quote.symbol", read_only=True)

    class Meta:
        model = CryptoPair
        fields = [
            "id", "uuid", "symbol", "base_symbol", "base_name",
            "quote_symbol", "is_active",
            "min_quantity", "max_quantity", "tick_size",
            "maker_fee_pct", "taker_fee_pct",
        ]


class SwapOrderSerializer(serializers.ModelSerializer):
    pair_symbol = serializers.CharField(source="pair.symbol", read_only=True)

    class Meta:
        model = SwapOrder
        fields = [
            "id", "uuid", "pair_symbol", "side",
            "from_amount", "to_amount", "rate", "fee",
            "status", "created_at",
        ]


class CreateSwapSerializer(serializers.Serializer):
    pair_id = serializers.IntegerField()
    side = serializers.ChoiceField(choices=["buy", "sell"])
    from_amount = serializers.DecimalField(max_digits=18, decimal_places=8, min_value=0.00000001)


class OrderBookEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderBookEntry
        fields = ["side", "price", "quantity", "total"]