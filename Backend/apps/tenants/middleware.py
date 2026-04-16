"""Middleware that attaches current tenant to every request."""
from django.utils.deprecation import MiddlewareMixin


class TenantMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.tenant = None
        if hasattr(request, "user") and request.user.is_authenticated:
            request.tenant = getattr(request.user, "tenant", None)