from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InstrumentViewSet, WatchlistViewSet

router = DefaultRouter()
router.register("instruments", InstrumentViewSet, basename="instrument")
router.register("watchlists", WatchlistViewSet, basename="watchlist")

urlpatterns = [
    path("", include(router.urls)),
]