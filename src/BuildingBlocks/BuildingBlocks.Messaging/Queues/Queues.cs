namespace BuildingBlocks.Messaging.Queues;

public static class Queues
{
    public const string Checkout = "checkout";
    public const string Order = "order";
    public const string ReadyForDelivery = "ready_for_delivery";
    public const string DeliveryInProgress = "delivery_in_progress";
    public const string OrderDelivered = "order_delivered";
    public const string PaymentProcessed = "payment_processed";
    public const string PaymentCancelled = "payment_cancelled";
}