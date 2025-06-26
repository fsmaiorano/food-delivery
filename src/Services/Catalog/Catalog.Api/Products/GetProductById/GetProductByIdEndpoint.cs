namespace Catalog.Api.Products.GetProductById;

public record GetProductByIdResponse(Product Product);

public class GetProductByIdEndpoint
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/products/{id:guid}",
                async (Guid id, IMediator sender, CancellationToken cancellationToken) =>
                {
                    var result = await sender.Send(new GetProductByIdQuery(id), cancellationToken);
                    return Results.Ok(new GetProductByIdResponse(result.Product));
                })
            .WithName("GetProductById")
            .Produces<GetProductByIdResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .WithSummary("Get Product By Id")
            .WithDescription("Get a product by id");
    }
}