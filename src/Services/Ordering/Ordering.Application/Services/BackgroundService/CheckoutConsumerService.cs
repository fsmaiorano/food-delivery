using BuildingBlocks.Messaging.Queues;
using Ordering.Application.Orders.EventHandlers.Integration;

namespace Ordering.Application.Services.BackgroundService;

public class CheckoutConsumerService(
  IMessageConsumer consumer,
  ILogger<CheckoutConsumerService> logger,
  IServiceProvider serviceProvider)
  : Microsoft.Extensions.Hosting.BackgroundService
{
  private const string QueueName = Queues.Checkout;

  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    await consumer.StartConsumingAsync<BasketCheckoutEvent>(QueueName, async message =>
    {
      logger.LogInformation($"Received checkout event for user: {message.UserName}, total: {message.TotalPrice}");
      using var scope = serviceProvider.CreateScope();
      var handler = scope.ServiceProvider.GetRequiredService<BasketCheckoutEventHandler>();
      await handler.HandleAsync(message);
    }, stoppingToken);
  }
}
