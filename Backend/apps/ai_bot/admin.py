from django.contrib import admin
from .models import TradeSuggestion, SuggestionFeedback


@admin.register(TradeSuggestion)
class TradeSuggestionAdmin(admin.ModelAdmin):
    list_display = ["instrument", "action", "confidence", "timeframe", "is_active", "created_at"]
    list_filter = ["action", "timeframe", "is_active"]
    search_fields = ["instrument__symbol"]


@admin.register(SuggestionFeedback)
class SuggestionFeedbackAdmin(admin.ModelAdmin):
    list_display = ["suggestion", "user", "rating", "acted_on", "created_at"]