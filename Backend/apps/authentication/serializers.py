"""
Serializers for Authentication module.
Covers registration, login (JWT), profile, and admin user management.
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import User, UserProfile, LoginActivity


# =============================================================================
# JWT CUSTOMISATION
# =============================================================================
class KuberTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds custom claims to the JWT payload."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["role"] = user.role
        token["name"] = user.full_name
        if user.tenant:
            token["tenant_id"] = str(user.tenant.uuid)
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserMinimalSerializer(self.user).data
        return data


# =============================================================================
# REGISTRATION
# =============================================================================
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, min_length=8, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True)
    tenant_slug = serializers.SlugField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "email", "phone", "first_name", "last_name",
            "password", "password_confirm", "tenant_slug",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        tenant_slug = validated_data.pop("tenant_slug", None)
        tenant = None

        if tenant_slug:
            from apps.tenants.models import Tenant
            try:
                tenant = Tenant.objects.get(slug=tenant_slug, is_active=True)
            except Tenant.DoesNotExist:
                raise serializers.ValidationError({"tenant_slug": "Invalid or inactive tenant."})

        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data.get("last_name", ""),
            phone=validated_data.get("phone", ""),
            tenant=tenant,
            role="end_user",
        )
        return user


# =============================================================================
# PROFILE
# =============================================================================
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "pan_number", "aadhaar_number", "date_of_birth",
            "address", "city", "state", "pincode",
            "nominee_name", "nominee_relation",
        ]


class UserMinimalSerializer(serializers.ModelSerializer):
    """Lightweight user representation."""

    class Meta:
        model = User
        fields = [
            "id", "uuid", "email", "first_name", "last_name",
            "role", "is_email_verified", "is_kyc_verified",
        ]


class UserDetailSerializer(serializers.ModelSerializer):
    """Full user detail with profile."""
    profile = UserProfileSerializer(read_only=True)
    tenant_name = serializers.CharField(source="tenant.name", read_only=True, default=None)

    class Meta:
        model = User
        fields = [
            "id", "uuid", "email", "phone", "first_name", "last_name",
            "avatar", "role", "tenant_name",
            "is_active", "is_email_verified", "is_kyc_verified",
            "default_order_type", "risk_profile",
            "profile", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "uuid", "email", "role",
            "is_email_verified", "is_kyc_verified",
            "created_at", "updated_at",
        ]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Update basic user fields + nested profile."""
    profile = UserProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            "first_name", "last_name", "phone", "avatar",
            "default_order_type", "risk_profile", "profile",
        ]

    @transaction.atomic
    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if profile_data:
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


# =============================================================================
# ADMIN — USER MANAGEMENT
# =============================================================================
class AdminUserListSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source="tenant.name", read_only=True, default=None)

    class Meta:
        model = User
        fields = [
            "id", "uuid", "email", "first_name", "last_name",
            "role", "tenant_name", "is_active",
            "is_email_verified", "is_kyc_verified", "created_at",
        ]


class LoginActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginActivity
        fields = ["id", "ip_address", "user_agent", "status", "created_at"]