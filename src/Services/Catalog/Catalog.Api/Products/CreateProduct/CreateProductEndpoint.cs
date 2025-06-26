namespace Catalog.Api.Products.CreateProduct;

public record CreateProductRequest(
    string Name,
    List<string> Categories,
    string Description,
    string ImageUrl,
    decimal Price);

public record CreateProductResponse(Guid Id);

public static class CreateProductEndpoint
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/products",
                async (CreateProductRequest request, CancellationToken cancellationToken) => { return Results.Ok(); })
            .WithName("CreateProduct")
            .Produces<CreateProductResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Create Product")
            .WithDescription("Create a new product");
    }
}