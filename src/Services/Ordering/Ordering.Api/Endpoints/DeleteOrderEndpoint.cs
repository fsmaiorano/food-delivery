using BuildingBlocks.Mediator.Interfaces;
using Ordering.Application.Orders.Commands.DeleteOrder;

namespace Ordering.API.Endpoints;

//public record DeleteOrderRequest(Guid Id);
public record DeleteOrderResponse(bool IsSuccess);

public class DeleteOrderEndpoint
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapDelete("/orders/{id}", async (Guid Id, IMediator sender) =>
            {
                var result = await sender.Send(new DeleteOrderCommand(Id));
                var response = new DeleteOrderResponse(result.IsSuccess);
                return Results.Ok(response);
            })
            .WithName("DeleteOrderEndpoint")
            .Produces<DeleteOrderResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithSummary("Delete Order")
            .WithDescription("Delete Order");
    }
}