"""Role-based permission classes used across all modules."""
from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    """Only platform-level super admins."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "super_admin"
        )


class IsHostAdmin(BasePermission):
    """Tenant admins or super admins."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ("host_admin", "super_admin")
        )


class IsOwnerOrAdmin(BasePermission):
    """Object owner, tenant admin, or super admin."""
    def has_object_permission(self, request, view, obj):
        if request.user.role in ("super_admin", "host_admin"):
            return True
        return getattr(obj, "user", None) == request.user