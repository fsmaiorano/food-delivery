namespace Catalog.Api.Products.GetProductByCategory;

public record GetProductByCategoryResponse(IEnumerable<Product> Products);

public class GetProductByCategoryEndpoint
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/products/category/{category}", async (
                string category,
                IMediator sender,
                CancellationToken cancellationToken) =>
            {
                var result =
                    await sender.Send(new GetProductByCategoryQuery(category), cancellationToken);
                return Results.Ok(result);
            })
            .WithName("GetProductByCategory")
            .Produces<GetProductByCategoryResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .WithSummary("Get products by category")
            .WithDescription("Get products by category");
    }
}