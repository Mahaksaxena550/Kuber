"""
Custom User model for Kuber.
- Roles: super_admin, host_admin, end_user
- Every user (except super_admin) belongs to exactly one Tenant.
"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from core.models import TimestampedModel


class UserManager(BaseUserManager):
    """Custom manager — uses email as the unique identifier."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "super_admin")
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, TimestampedModel):
    class Role(models.TextChoices):
        SUPER_ADMIN = "super_admin", "Super Admin"
        HOST_ADMIN = "host_admin", "Host Admin"
        END_USER = "end_user", "End User"

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150, blank=True)
    avatar = models.ImageField(upload_to="users/avatars/", blank=True, null=True)

    role = models.CharField(
        max_length=20, choices=Role.choices, default=Role.END_USER
    )
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="users",
        null=True, blank=True,
        help_text="Null only for super_admin.",
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_kyc_verified = models.BooleanField(default=False)

    # Trading preferences
    default_order_type = models.CharField(
        max_length=20, default="market",
        choices=[("market", "Market"), ("limit", "Limit")],
    )
    risk_profile = models.CharField(
        max_length=20, default="moderate",
        choices=[
            ("conservative", "Conservative"),
            ("moderate", "Moderate"),
            ("aggressive", "Aggressive"),
        ],
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name"]

    class Meta:
        db_table = "users"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} ({self.email})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def is_super_admin(self):
        return self.role == self.Role.SUPER_ADMIN


class UserProfile(TimestampedModel):
    """Extended profile info — KYC, PAN, Aadhaar, etc."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    pan_number = models.CharField(max_length=10, blank=True)
    aadhaar_number = models.CharField(max_length=12, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    nominee_name = models.CharField(max_length=255, blank=True)
    nominee_relation = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = "user_profiles"

    def __str__(self):
        return f"Profile: {self.user.email}"


