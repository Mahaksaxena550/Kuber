from rest_framework import serializers
from .models import Instrument, PriceSnapshot, Watchlist, WatchlistItem


class PriceSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceSnapshot
        fields = [
            "ltp", "open_price", "high", "low", "close",
            "prev_close", "volume", "change", "change_pct", "updated_at",
        ]


class InstrumentListSerializer(serializers.ModelSerializer):
    price = PriceSnapshotSerializer(read_only=True)

    class Meta:
        model = Instrument
        fields = [
            "id", "uuid", "symbol", "name", "asset_type",
            "exchange", "logo_url", "sector", "market_cap", "price",
        ]


class InstrumentDetailSerializer(serializers.ModelSerializer):
    price = PriceSnapshotSerializer(read_only=True)

    class Meta:
        model = Instrument
        fields = "__all__"


class WatchlistItemSerializer(serializers.ModelSerializer):
    instrument = InstrumentListSerializer(read_only=True)
    instrument_id = serializers.PrimaryKeyRelatedField(
        queryset=Instrument.objects.filter(is_active=True),
        source="instrument", write_only=True,
    )

    class Meta:
        model = WatchlistItem
        fields = ["id", "instrument", "instrument_id", "sort_order", "created_at"]


class WatchlistSerializer(serializers.ModelSerializer):
    items = WatchlistItemSerializer(many=True, read_only=True)
    item_count = serializers.IntegerField(source="items.count", read_only=True)

    class Meta:
        model = Watchlist
        fields = ["id", "uuid", "name", "item_count", "items", "created_at"]
        read_only_fields = ["id", "uuid", "created_at"]


class AddToWatchlistSerializer(serializers.Serializer):
    instrument_id = serializers.IntegerField()
    sort_order = serializers.IntegerField(default=0)