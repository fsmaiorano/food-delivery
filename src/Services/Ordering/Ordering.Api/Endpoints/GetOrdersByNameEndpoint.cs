namespace Ordering.API.Endpoints;

//public record GetOrdersByNameRequest(string Name);
public record GetOrdersByNameResponse(IEnumerable<OrderDto> Orders);

public class GetOrdersByNameEndpoint
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/orders/{orderName}", async (string orderName, IMediator sender) =>
            {
                var result = await sender.Send(new GetOrdersByNameQuery(orderName));
                var response = new GetOrdersByNameResponse(result.Orders);
                return Results.Ok(response);
            })
            .WithName("GetOrdersByNameEndpoint")
            .Produces<GetOrdersByNameResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithSummary("Get Orders By Name")
            .WithDescription("Get Orders By Name");
    }
}