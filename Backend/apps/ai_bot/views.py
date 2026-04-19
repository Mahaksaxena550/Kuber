"""
AI Bot views: list suggestions, get detail, submit feedback.
Gated to premium subscribers only.
"""
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone

from core.pagination import KuberPagination
from .models import TradeSuggestion, SuggestionFeedback
from .serializers import TradeSuggestionSerializer, SuggestionFeedbackSerializer


def check_premium(user):
    """Check if user has active premium subscription."""
    from apps.subscriptions.models import UserSubscription
    return UserSubscription.objects.filter(
        user=user,
        plan__tier="premium",
        status="active",
    ).exists()


class SuggestionListView(generics.ListAPIView):
    """Active AI trade suggestions — premium only."""
    serializer_class = TradeSuggestionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = KuberPagination

    def list(self, request, *args, **kwargs):
        if not check_premium(request.user):
            return Response(
                {"success": False, "message": "Premium subscription required for AI suggestions."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        now = timezone.now()
        return (
            TradeSuggestion.objects.filter(
                Q(user=self.request.user) | Q(user__isnull=True),
                is_active=True,
            )
            .filter(Q(expires_at__isnull=True) | Q(expires_at__gt=now))
            .select_related("instrument__price")
        )


class SuggestionDetailView(generics.RetrieveAPIView):
    """Single suggestion detail — premium only."""
    serializer_class = TradeSuggestionSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "uuid"

    def retrieve(self, request, *args, **kwargs):
        if not check_premium(request.user):
            return Response(
                {"success": False, "message": "Premium subscription required."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().retrieve(request, *args, **kwargs)

    def get_queryset(self):
        return TradeSuggestion.objects.filter(
            Q(user=self.request.user) | Q(user__isnull=True),
        ).select_related("instrument__price")


class SuggestionFeedbackView(generics.CreateAPIView):
    """Submit feedback / rating for a suggestion."""
    serializer_class = SuggestionFeedbackSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)