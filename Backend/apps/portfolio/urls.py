from django.urls import path
from .views import HoldingsListView, PortfolioSummaryView, PortfolioHistoryView

urlpatterns = [
    path("holdings/", HoldingsListView.as_view(), name="holdings"),
    path("summary/", PortfolioSummaryView.as_view(), name="portfolio-summary"),
    path("history/", PortfolioHistoryView.as_view(), name="portfolio-history"),
]