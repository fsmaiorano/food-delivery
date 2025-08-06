namespace BuildingBlocks.Messaging.Queues;

public static class Queues
{
  public const string Checkout = "checkout";
  public const string OrderCreated = "order_created";
  public const string OrderCancelled = "order_cancelled";
  public const string PaymentProcessed = "payment_processed";
  public const string InventoryUpdated = "inventory_updated";
}