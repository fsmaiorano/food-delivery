using Basket.Api.Models;

namespace Basket.Api.Basket.StoreBasket;

public record StoreBasketRequest(ShoppingCart Cart);

public record StoreBasketResponse(string Username);

public class StoreBasketEndpoint
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/basket", async (StoreBasketRequest request, IMediator sender) =>
            {
                var command = new StoreBasketCommand(request.Cart);
                var result = await sender.Send(command);
                var response = new StoreBasketResponse(result.Username);
                return Results.Created($"/basket/{response.Username}", response);
            })
            .WithName("StoreBasket")
            .Produces<StoreBasketResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Store a basket")
            .WithDescription("Stores a basket by username");
    }
}