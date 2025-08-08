using BuildingBlocks.Messaging.Queues;
using Ordering.Application.Orders.EventHandlers.Integration;

namespace Ordering.Application.Services.BackgroundService;

public class CheckoutConsumerService(
    IMessageConsumer consumer,
    ILogger<CheckoutConsumerService> logger,
    IServiceProvider serviceProvider)
    : Microsoft.Extensions.Hosting.BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await consumer.StartConsumingAsync<BasketCheckoutEvent>(Queues.Checkout, async message =>
        {
            logger.LogInformation(
                "Received checkout event for user: {MessageUserName}, total: {MessageTotalPrice}", message.UserName,
                message.TotalPrice);
            using var scope = serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<BasketCheckoutEventHandler>();
            await handler.HandleAsync(message);
        }, stoppingToken);
    }
}