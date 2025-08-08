namespace Ordering.Application.Orders.Commands.PatchOrderStatus;

public class PatchOrderStatusHandler(IApplicationDbContext dbContext)
    : ICommandHandler<PatchOrderStatusCommand, PatchOrderStatusResult>
{
    public async Task<PatchOrderStatusResult> HandleAsync(PatchOrderStatusCommand command,
        CancellationToken cancellationToken = default)
    {
        var orderId = OrderId.Of(command.OrderId);
        var order = await dbContext.Orders.FindAsync([orderId], cancellationToken);

        if (order is null)
            throw new OrderNotFoundException(command.OrderId);

        order.UpdateStatus(command.OrderStatus);
        dbContext.Orders.Update(order);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new PatchOrderStatusResult(true);
    }
}