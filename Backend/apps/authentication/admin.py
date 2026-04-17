from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, LoginActivity


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines = [UserProfileInline]
    list_display = ["email", "first_name", "last_name", "role", "tenant", "is_active", "created_at"]
    list_filter = ["role", "is_active", "is_email_verified", "tenant"]
    search_fields = ["email", "first_name", "last_name"]
    ordering = ["-created_at"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal", {"fields": ("first_name", "last_name", "phone", "avatar")}),
        ("Platform", {"fields": ("role", "tenant", "default_order_type", "risk_profile")}),
        ("Status", {"fields": ("is_active", "is_staff", "is_superuser", "is_email_verified", "is_kyc_verified")}),
        ("Permissions", {"fields": ("groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "first_name", "password1", "password2", "role", "tenant")}),
    )


@admin.register(LoginActivity)
class LoginActivityAdmin(admin.ModelAdmin):
    list_display = ["user", "ip_address", "status", "created_at"]
    list_filter = ["status"]
    search_fields = ["user__email"]