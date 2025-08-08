using BuildingBlocks.Messaging.Queues;

namespace Ordering.Application.Orders.EventHandlers.Domain;

public class OrderUpdatedEventHandler(
    IMessagePublisher publishEndpoint,
    IFeatureManager featureManager,
    ILogger<OrderUpdatedEventHandler> logger)
    : INotificationHandler<OrderUpdatedEvent>
{
    public async Task Handle(OrderUpdatedEvent domainEvent, CancellationToken cancellationToken)
    {
        logger.LogInformation("Domain Event handled: {DomainEvent}", domainEvent.GetType().Name);
        if (await featureManager.IsEnabledAsync("OrderFullfilment"))
        {
            var orderCreatedIntegrationEvent = domainEvent.order.ToOrderDto();

            switch (orderCreatedIntegrationEvent.Status)
            {
                // case OrderStatus.Pending:
                //     await publishEndpoint.PublishAsync(orderCreatedIntegrationEvent, Queues.Order, cancellationToken);
                //     break;
                case OrderStatus.ReadyForDelivery:
                    // TODO - looking for an delivery person
                    await publishEndpoint.PublishAsync(orderCreatedIntegrationEvent, Queues.ReadyForDelivery,
                        cancellationToken);
                    break;
                case OrderStatus.DeliveryInProgress:
                    // TODO - Notify customer that the order is being delivered
                    await publishEndpoint.PublishAsync(orderCreatedIntegrationEvent, Queues.DeliveryInProgress,
                        cancellationToken);
                    break;
                case OrderStatus.Completed:
                    // TODO - Notify the customer that the order is completed
                    await publishEndpoint.PublishAsync(orderCreatedIntegrationEvent, Queues.OrderDelivered,
                        cancellationToken);
                    break;
                case OrderStatus.Delivered:
                    // TODO - Notify the customer that the order has been delivered
                    // await publishEndpoint.PublishAsync(orderCreatedIntegrationEvent, Queues.OrderDelivered, cancellationToken);
                    break;
                case OrderStatus.Finalized:
                    // TODO - Notify the customer that the order has been finalized
                    // await publishEndpoint.PublishAsync(orderCreatedIntegrationEvent, Queues.OrderFinalized, cancellationToken);
                    break;
            }
        }
    }
}