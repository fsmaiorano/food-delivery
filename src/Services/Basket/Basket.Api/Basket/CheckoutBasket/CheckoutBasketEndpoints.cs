using Basket.Api.Dtos;

namespace Basket.Api.Basket.CheckoutBasket;

public record CheckoutBasketRequest(BasketCheckoutDto BasketCheckoutDto);

public record CheckoutBasketResponse(bool IsSuccess);

public class CheckoutBasketEndpoints
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/basket/checkout", async (CheckoutBasketRequest request, IMediator sender) =>
            {
                var command = new CheckoutBasketCommand(request.BasketCheckoutDto);
                var result = await sender.Send(command);
                var response = new CheckoutBasketResponse(result.IsSuccess);
                return Results.Ok(response);
            })
            .WithName("CheckoutBasket")
            .Produces<CheckoutBasketResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Checkout Basket")
            .WithDescription("Checkout Basket");
    }
}