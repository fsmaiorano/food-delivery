using BuildingBlocks.Mediator.Interfaces;
using Ordering.Application.Dtos;

namespace Ordering.Application.Orders.Commands.CreateOrder;

public record CreateOrderCommand(OrderDto Order) : ICommand<CreateOrderResult>
{
}

public record CreateOrderResult(Guid Id);
