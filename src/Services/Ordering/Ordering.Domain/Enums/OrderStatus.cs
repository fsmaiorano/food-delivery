namespace Ordering.Domain.Enums;

public enum OrderStatus
{
    Draft = 1,
    Pending = 2,
    Processing = 3,
    Completed = 4,
    ReadyForDelivery = 5,
    DeliveryInProgress = 6,
    Delivered = 7,
    Finalized = 8,
    Cancelled = 90,
    CancelledByCustomer = 91,
}