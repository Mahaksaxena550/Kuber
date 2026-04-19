from rest_framework import serializers
from .models import TradeSuggestion, SuggestionFeedback


class TradeSuggestionSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source="instrument.symbol", read_only=True)
    instrument_name = serializers.CharField(source="instrument.name", read_only=True)
    asset_type = serializers.CharField(source="instrument.asset_type", read_only=True)
    ltp = serializers.DecimalField(
        source="instrument.price.ltp", max_digits=18, decimal_places=8, read_only=True,
    )

    class Meta:
        model = TradeSuggestion
        fields = [
            "id", "uuid", "symbol", "instrument_name", "asset_type", "ltp",
            "action", "confidence", "target_price", "stop_loss_price",
            "timeframe", "reasoning", "signals",
            "is_active", "expires_at", "created_at",
        ]


class SuggestionFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuggestionFeedback
        fields = ["id", "suggestion", "rating", "acted_on", "comment", "created_at"]
        read_only_fields = ["id", "created_at"]