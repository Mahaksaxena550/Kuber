from rest_framework import serializers
from .models import Holding, PortfolioSnapshot


class HoldingSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source="instrument.symbol", read_only=True)
    name = serializers.CharField(source="instrument.name", read_only=True)
    asset_type = serializers.CharField(source="instrument.asset_type", read_only=True)
    ltp = serializers.DecimalField(
        source="instrument.price.ltp", max_digits=18, decimal_places=8, read_only=True,
    )
    current_value = serializers.DecimalField(max_digits=20, decimal_places=8, read_only=True)
    pnl = serializers.DecimalField(max_digits=20, decimal_places=8, read_only=True)
    pnl_pct = serializers.DecimalField(max_digits=10, decimal_places=4, read_only=True)

    class Meta:
        model = Holding
        fields = [
            "id", "symbol", "name", "asset_type",
            "quantity", "avg_buy_price", "total_invested",
            "ltp", "current_value", "pnl", "pnl_pct",
        ]


class PortfolioSummarySerializer(serializers.Serializer):
    total_invested = serializers.DecimalField(max_digits=20, decimal_places=2)
    total_current_value = serializers.DecimalField(max_digits=20, decimal_places=2)
    total_pnl = serializers.DecimalField(max_digits=20, decimal_places=2)
    total_pnl_pct = serializers.DecimalField(max_digits=10, decimal_places=4)
    holdings_count = serializers.IntegerField()
    allocation = serializers.ListField(child=serializers.DictField())


class PortfolioSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioSnapshot
        fields = ["date", "total_invested", "total_current_value", "total_pnl"]