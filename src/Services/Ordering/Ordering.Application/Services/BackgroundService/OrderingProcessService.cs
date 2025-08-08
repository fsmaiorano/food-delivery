using BuildingBlocks.Messaging.Queues;
using Ordering.Application.Orders.Commands.PatchOrderStatus;
using Ordering.Application.Orders.EventHandlers.Domain;

namespace Ordering.Application.Services.BackgroundService;

public class OrderingProcessService(
    IMessageConsumer consumer,
    IMessagePublisher producer,
    ILogger<OrderingProcessService> logger,
    IServiceProvider serviceProvider,
    IServiceScopeFactory scopeFactory
) : Microsoft.Extensions.Hosting.BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            using var scope = scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

            var pendingOrders = await dbContext.Orders
                .Where(o => o.Status.Equals(OrderStatus.Pending)).Take(10).ToListAsync(cancellationToken: cancellationToken);
            
            var processingOrders = await dbContext.Orders
                .Where(o => o.Status.Equals(OrderStatus.Processing)).Take(10).ToListAsync(cancellationToken: cancellationToken);
            
            var completedOrders = await dbContext.Orders
                .Where(o => o.Status.Equals(OrderStatus.Completed)).Take(10).ToListAsync(cancellationToken: cancellationToken);
            
            var readyToDeliverOrders = await dbContext.Orders
                .Where(o => o.Status.Equals(OrderStatus.ReadyForDelivery)).Take(10).ToListAsync(cancellationToken: cancellationToken);
            
            var deliveringOrders = await dbContext.Orders
                .Where(o => o.Status.Equals(OrderStatus.DeliveryInProgress)).Take(10).ToListAsync(cancellationToken: cancellationToken);
            
            var deliveredOrders = await dbContext.Orders
                .Where(o => o.Status.Equals(OrderStatus.Delivered)).Take(10).ToListAsync(cancellationToken: cancellationToken);
            
            // var finalizedOrders = await dbContext.Orders
            //     .Where(o => o.Status.Equals(OrderStatus.Finalized)).Take(10).ToListAsync(cancellationToken: cancellationToken);

            foreach (var order in pendingOrders)
            {
                try
                {
                    await ProcessPendingOrderAsync(order, cancellationToken);
                    logger.LogInformation("Processed order with ID: {OrderId}", order.Id.Value);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error processing order with ID: {OrderId}", order.Id.Value);
                }
            }
            
            foreach (var order in processingOrders)
            {
                try
                {
                    await ProcessProcessingOrderAsync(order, cancellationToken);
                    logger.LogInformation("Processed processing order with ID: {OrderId}", order.Id.Value);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error processing processing order with ID: {OrderId}", order.Id.Value);
                }
            }
            
            foreach (var order in completedOrders)
            {
                try
                {
                    await ProcessCompletedOrderAsync(order, cancellationToken);
                    logger.LogInformation("Processed completed order with ID: {OrderId}", order.Id.Value);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error processing completed order with ID: {OrderId}", order.Id.Value);
                }
            }
            
            foreach (var order in readyToDeliverOrders)
            {
                try
                {
                    await ProcessReadyToDeliverOrderAsync(order, cancellationToken);
                    logger.LogInformation("Processed ready to deliver order with ID: {OrderId}", order.Id.Value);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error processing ready to deliver order with ID: {OrderId}", order.Id.Value);
                }
            }
            
            foreach (var order in deliveringOrders)
            {
                try
                {
                    await ProcessDeliveringOrderAsync(order, cancellationToken);
                    logger.LogInformation("Order with ID: {OrderId} is in delivery progress.", order.Id.Value);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error processing order in delivery progress with ID: {OrderId}", order.Id.Value);
                }
            }
            
            foreach (var order in deliveredOrders)
            {
                try
                {
                    await ProcessDeliveredOrderAsync(order, cancellationToken);
                    logger.LogInformation("Order with ID: {OrderId} is already delivered.", order.Id.Value);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error processing delivered order with ID: {OrderId}", order.Id.Value);
                }
            }
            
            // foreach (var order in finalizedOrders)
            // {
            //     try
            //     {
            //         await ProcessFinalizedOrderAsync(order, cancellationToken);
            //         logger.LogInformation("Order with ID: {OrderId} is finalized.", order.Id.Value);
            //     }
            //     catch (Exception ex)
            //     {
            //         logger.LogError(ex, "Error processing finalized order with ID: {OrderId}", order.Id.Value);
            //     }
            // }
            await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
        }
    }
    
    private async Task ProcessPendingOrderAsync(Order order, CancellationToken cancellationToken)
    {
        var command = new PatchOrderStatusCommand
        (
            OrderId: order.Id.Value,
            OrderStatus: OrderStatus.Processing 
        );

        using var scope = scopeFactory.CreateScope();
        var handler = scope.ServiceProvider.GetRequiredService<PatchOrderStatusHandler>();
        await handler.HandleAsync(command, cancellationToken);
    }
    
    private async Task ProcessProcessingOrderAsync(Order order, CancellationToken cancellationToken)
    {
        var command = new PatchOrderStatusCommand
        (
            OrderId: order.Id.Value,
            OrderStatus: OrderStatus.Completed 
        );

        using var scope = scopeFactory.CreateScope();
        var handler = scope.ServiceProvider.GetRequiredService<PatchOrderStatusHandler>();
        await handler.HandleAsync(command, cancellationToken);
    }
    
    private async Task ProcessCompletedOrderAsync(Order order, CancellationToken cancellationToken)
    {
        var command = new PatchOrderStatusCommand
        (
            OrderId: order.Id.Value,
            OrderStatus: OrderStatus.ReadyForDelivery
        );

        using var scope = scopeFactory.CreateScope();
        var handler = scope.ServiceProvider.GetRequiredService<PatchOrderStatusHandler>();
        await handler.HandleAsync(command, cancellationToken);
    }
    
    private async Task ProcessReadyToDeliverOrderAsync(Order order, CancellationToken cancellationToken)
    {
        var command = new PatchOrderStatusCommand
        (
            OrderId: order.Id.Value,
            OrderStatus: OrderStatus.DeliveryInProgress
        );

        using var scope = scopeFactory.CreateScope();
        var handler = scope.ServiceProvider.GetRequiredService<PatchOrderStatusHandler>();
        await handler.HandleAsync(command, cancellationToken);
    }
    
    private async Task ProcessDeliveringOrderAsync(Order order, CancellationToken cancellationToken)
    {
        var command = new PatchOrderStatusCommand
        (
            OrderId: order.Id.Value,
            OrderStatus: OrderStatus.Delivered
        );

        using var scope = scopeFactory.CreateScope();
        var handler = scope.ServiceProvider.GetRequiredService<PatchOrderStatusHandler>();
        await handler.HandleAsync(command, cancellationToken);
    }
    
    private async Task ProcessDeliveredOrderAsync(Order order, CancellationToken cancellationToken)
    {
        var command = new PatchOrderStatusCommand
        (
            OrderId: order.Id.Value,
            OrderStatus: OrderStatus.Finalized
        );

        using var scope = scopeFactory.CreateScope();
        var handler = scope.ServiceProvider.GetRequiredService<PatchOrderStatusHandler>();
        await handler.HandleAsync(command, cancellationToken);
    }
    
    // private async Task ProcessFinalizedOrderAsync(Order order, CancellationToken cancellationToken)
    // {
    //     var command = new PatchOrderStatusCommand
    //     (
    //         OrderId: order.Id.Value,
    //         OrderStatus: OrderStatus.Finalized // 8
    //     );
    //
    //     using var scope = scopeFactory.CreateScope();
    //     var handler = scope.ServiceProvider.GetRequiredService<PatchOrderStatusHandler>();
    //     await handler.HandleAsync(command, cancellationToken);
    // }
    
    public override Task StopAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Stopping OrderingProcessService...");
        return base.StopAsync(cancellationToken);
    }
}