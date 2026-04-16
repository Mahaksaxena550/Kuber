from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Count
from core.permissions import IsSuperAdmin
from .models import Tenant
from .serializers import TenantSerializer, TenantListSerializer


class TenantViewSet(viewsets.ModelViewSet):
    """CRUD for tenants — Super Admin only."""
    permission_classes = [IsSuperAdmin]

    def get_queryset(self):
        return Tenant.objects.annotate(user_count=Count("users"))

    def get_serializer_class(self):
        if self.action == "list":
            return TenantListSerializer
        return TenantSerializer

    def destroy(self, request, *args, **kwargs):
        tenant = self.get_object()
        tenant.is_active = False
        tenant.save(update_fields=["is_active"])
        return Response(
            {"success": True, "message": "Tenant deactivated."},
            status=status.HTTP_200_OK,
        )