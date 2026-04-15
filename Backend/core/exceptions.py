"""Custom exception classes for the Kuber platform."""
from rest_framework.exceptions import APIException
from rest_framework import status


class InsufficientFundsError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Insufficient wallet balance."
    default_code = "insufficient_funds"


class OrderNotAllowedError(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "Order placement not allowed."
    default_code = "order_not_allowed"


class SubscriptionRequiredError(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "Premium subscription required for this feature."
    default_code = "subscription_required"