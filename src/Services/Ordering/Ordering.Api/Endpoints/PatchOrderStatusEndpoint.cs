using Ordering.Application.Orders.Commands.PatchOrderStatus;
using Ordering.Domain.Enums;

namespace Ordering.API.Endpoints;

public record PatchOrderRequest(Guid OrderId, OrderStatus OrderStatus);

public record PatchOrderResponse(bool IsSuccess);

public class PatchOrderStatusEndpoint
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPatch("/orders", async (PatchOrderRequest request, IMediator sender) =>
            {
                var command = new PatchOrderStatusCommand(request.OrderId, request.OrderStatus);
                var result = await sender.Send(command);
                var response = new PatchOrderResponse(result.IsSuccess);
                return Results.Ok(response);
            })
            .WithName("PatchOrderStatusEndpoint")
            .Produces<PatchOrderResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Patch Order Status")
            .WithDescription("Patch Order Status");
    }
}