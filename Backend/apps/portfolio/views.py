"""
Portfolio views: holdings list, summary with allocation, P&L history.
"""
from decimal import Decimal
from rest_framework import generics, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Holding, PortfolioSnapshot
from .serializers import HoldingSerializer, PortfolioSnapshotSerializer


class HoldingsListView(generics.ListAPIView):
    """List all holdings for the authenticated user."""
    serializer_class = HoldingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Holding.objects.filter(user=self.request.user, quantity__gt=0)
            .select_related("instrument__price")
        )


class PortfolioSummaryView(views.APIView):
    """Aggregated portfolio summary with allocation breakdown."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        holdings = (
            Holding.objects.filter(user=request.user, quantity__gt=0)
            .select_related("instrument__price")
        )

        total_invested = Decimal("0")
        total_current = Decimal("0")
        allocation = []

        for h in holdings:
            total_invested += h.total_invested
            cv = h.current_value
            total_current += cv
            allocation.append({
                "symbol": h.instrument.symbol,
                "asset_type": h.instrument.asset_type,
                "value": float(cv),
                "quantity": float(h.quantity),
            })

        # Compute allocation percentages
        for item in allocation:
            item["pct"] = round(item["value"] / float(total_current) * 100, 2) if total_current else 0

        total_pnl = total_current - total_invested
        total_pnl_pct = (total_pnl / total_invested * 100) if total_invested else 0

        data = {
            "total_invested": total_invested,
            "total_current_value": total_current,
            "total_pnl": total_pnl,
            "total_pnl_pct": total_pnl_pct,
            "holdings_count": len(allocation),
            "allocation": allocation,
        }
        return Response({"success": True, "data": data})


class PortfolioHistoryView(generics.ListAPIView):
    """Historical daily portfolio snapshots (for P&L chart)."""
    serializer_class = PortfolioSnapshotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PortfolioSnapshot.objects.filter(user=self.request.user)[:90]