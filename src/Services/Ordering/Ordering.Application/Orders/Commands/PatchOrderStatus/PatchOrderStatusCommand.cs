namespace Ordering.Application.Orders.Commands.PatchOrderStatus;

public record PatchOrderStatusCommand(Guid OrderId,OrderStatus OrderStatus)
    : ICommand<PatchOrderStatusResult>;

public record PatchOrderStatusResult(bool IsSuccess);