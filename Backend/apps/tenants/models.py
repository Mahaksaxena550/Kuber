import uuid
from django.db import models
from core.models import TimestampedModel


class Tenant(TimestampedModel):
    """Represents an organisation/brokerage on the platform."""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100, unique=True)
    domain = models.CharField(
        max_length=255, blank=True, null=True, unique=True,
        help_text="Custom domain, e.g. trade.mybroker.com",
    )
    logo = models.ImageField(upload_to="tenants/logos/", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    settings = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "tenants"
        ordering = ["name"]

    def __str__(self):
        return self.name