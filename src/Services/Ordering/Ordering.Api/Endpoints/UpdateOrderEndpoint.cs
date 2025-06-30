using BuildingBlocks.Mediator.Interfaces;
using Ordering.Application.Dtos;
using Ordering.Application.Orders.Commands.UpdateOrder;

namespace Ordering.API.Endpoints;

public record UpdateOrderRequest(OrderDto Order);

public record UpdateOrderResponse(bool IsSuccess);

public class UpdateOrderEndpoint
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPut("/orders", async (UpdateOrderRequest request, IMediator sender) =>
            {
                var command = new UpdateOrderCommand(request.Order);
                var result = await sender.Send(command);
                var response = new UpdateOrderResponse(result.IsSuccess);
                return Results.Ok(response);
            })
            .WithName("UpdateOrderEndpoint")
            .Produces<UpdateOrderResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Update Order")
            .WithDescription("Update Order");
    }
}