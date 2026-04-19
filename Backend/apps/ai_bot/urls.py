from django.urls import path
from .views import SuggestionListView, SuggestionDetailView, SuggestionFeedbackView

urlpatterns = [
    path("suggestions/", SuggestionListView.as_view(), name="ai-suggestions"),
    path("suggestions/<uuid:uuid>/", SuggestionDetailView.as_view(), name="ai-suggestion-detail"),
    path("feedback/", SuggestionFeedbackView.as_view(), name="ai-feedback"),
]