namespace Catalog.Api.Products.GetProducts;

public class GetProductsEndpoint
{
    public static void MapEndpoints(IEndpointRouteBuilder  endpoints) 
    {
        endpoints.MapGet("/products",
                async (IMediator sender, CancellationToken cancellationToken) =>
                {
                    var query = new GetProductsQuery();
                    var result = await sender.Send(query, cancellationToken);
                    return Results.Ok(result);
                })
            .WithName("GetProducts")
            .Produces<GetProductsResult>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Get Products")
            .WithDescription("Retrieve a list of products");
    }
}