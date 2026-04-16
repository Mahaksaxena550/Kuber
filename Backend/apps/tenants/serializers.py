from rest_framework import serializers
from .models import Tenant


class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = [
            "id", "uuid", "name", "slug", "domain",
            "logo", "is_active", "settings", "created_at",
        ]
        read_only_fields = ["id", "uuid", "created_at"]


class TenantListSerializer(serializers.ModelSerializer):
    user_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Tenant
        fields = ["id", "uuid", "name", "slug", "is_active", "user_count", "created_at"]