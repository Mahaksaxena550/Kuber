from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("users", views.AdminUserViewSet, basename="admin-users")

urlpatterns = [
    # Public endpoints
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("token/refresh/", views.TokenRefreshView_.as_view(), name="token-refresh"),

    # Protected endpoints
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("change-password/", views.ChangePasswordView.as_view(), name="change-password"),
    path("login-activity/", views.MyLoginActivityView.as_view(), name="login-activity"),

    # Admin routes
    path("", include(router.urls)),
]