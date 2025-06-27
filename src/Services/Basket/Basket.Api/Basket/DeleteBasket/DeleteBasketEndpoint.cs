namespace Basket.Api.Basket.DeleteBasket;

public record DeleteBasketResponse(bool IsSuccess);

public class DeleteBasketEndpoint
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapDelete("/basket/{username}",
                async (string username, IMediator sender) =>
                {
                    var result = await sender.Send(new DeleteBasketCommand(username));
                    var response = new DeleteBasketResponse(result.IsSuccess);
                    return Results.Ok(response);
                })
            .WithName("DeleteBasket")
            .Produces<DeleteBasketResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithSummary("Delete a basket")
            .WithDescription("Deletes a basket by username");
    }
}