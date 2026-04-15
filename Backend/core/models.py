import uuid
from django.db import models


class TimestampedModel(models.Model):
    """Abstract model with created/updated timestamps."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]


class TenantAwareModel(TimestampedModel):
    """Abstract model that ties every row to a tenant for data isolation."""
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="%(app_label)s_%(class)s_set",
    )

    class Meta:
        abstract = True


class UUIDModel(models.Model):
    """Mixin that adds a public-facing UUID field."""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    class Meta:
        abstract = True