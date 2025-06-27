using Basket.Api.Models;

namespace Basket.Api.Basket.GetBasket;

public record GetBasketResponse(ShoppingCart Cart);

public class GetBasketEndpoint
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/basket/{username}", async (string username, IMediator sender) =>
            {
                var result = await sender.Send(new GetBasketQuery(username));
                var response = new GetBasketResponse(result.Cart);
                return Results.Ok(response);
            })
            .WithName("GetBasket")
            .Produces<GetBasketResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithSummary("Get a basket")
            .WithDescription("Gets a basket by username");
    }
}