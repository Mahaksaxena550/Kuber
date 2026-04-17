"""
Authentication Views
- Register, Login, Logout
- Profile (get, update, change password)
- Admin user management
"""
from rest_framework import generics, status, views, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.db.models import Q

from core.permissions import IsSuperAdmin, IsHostAdmin
from core.pagination import KuberPagination
from .models import User, LoginActivity
from .serializers import (
    KuberTokenObtainPairSerializer,
    RegisterSerializer,
    UserDetailSerializer,
    UserMinimalSerializer,
    UpdateProfileSerializer,
    ChangePasswordSerializer,
    AdminUserListSerializer,
    LoginActivitySerializer,
)


# =============================================================================
# REGISTRATION
# =============================================================================
class RegisterView(generics.CreateAPIView):
    """Register a new end user."""
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = RefreshToken.for_user(user)
        return Response(
            {
                "success": True,
                "message": "Registration successful.",
                "data": {
                    "user": UserMinimalSerializer(user).data,
                    "tokens": {
                        "access": str(tokens.access_token),
                        "refresh": str(tokens),
                    },
                },
            },
            status=status.HTTP_201_CREATED,
        )


# =============================================================================
# LOGIN / LOGOUT
# =============================================================================
class LoginView(TokenObtainPairView):
    """Obtain JWT access + refresh tokens."""
    serializer_class = KuberTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            try:
                user = User.objects.get(email=request.data.get("email"))
                LoginActivity.objects.create(
                    user=user,
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get("HTTP_USER_AGENT", ""),
                    status="success",
                )
            except User.DoesNotExist:
                pass
        return response

    @staticmethod
    def _get_client_ip(request):
        x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
        return x_forwarded.split(",")[0].strip() if x_forwarded else request.META.get("REMOTE_ADDR")


class LogoutView(views.APIView):
    """Blacklist the refresh token to log out."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"success": False, "message": "Refresh token is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"success": True, "message": "Logged out."})
        except TokenError:
            return Response(
                {"success": False, "message": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class TokenRefreshView_(TokenRefreshView):
    """Refresh an expired access token using a valid refresh token."""
    pass


# =============================================================================
# PROFILE
# =============================================================================
class ProfileView(generics.RetrieveUpdateAPIView):
    """Get or update the authenticated user's profile."""
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UpdateProfileSerializer
        return UserDetailSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(views.APIView):
    """Change the authenticated user's password."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"success": True, "message": "Password changed."})


class MyLoginActivityView(generics.ListAPIView):
    """Paginated login history for the current user."""
    serializer_class = LoginActivitySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = KuberPagination

    def get_queryset(self):
        return LoginActivity.objects.filter(user=self.request.user)


# =============================================================================
# ADMIN — USER MANAGEMENT
# =============================================================================
class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Admin user management.
    - Super Admin: sees all users.
    - Host Admin: sees only users within their tenant.
    """
    http_method_names = ["get", "patch", "head", "options"]
    pagination_class = KuberPagination
    permission_classes = [IsHostAdmin]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return UserDetailSerializer
        return AdminUserListSerializer

    def get_queryset(self):
        user = self.request.user
        qs = User.objects.select_related("tenant")

        if user.role == "host_admin":
            qs = qs.filter(tenant=user.tenant)

        role = self.request.query_params.get("role")
        is_active = self.request.query_params.get("is_active")
        search = self.request.query_params.get("search")

        if role:
            qs = qs.filter(role=role)
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == "true")
        if search:
            qs = qs.filter(
                Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )

        return qs

    @action(detail=True, methods=["patch"])
    def toggle_active(self, request, pk=None):
        """Activate / deactivate a user."""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])
        state = "activated" if user.is_active else "deactivated"
        return Response({"success": True, "message": f"User {state}."})