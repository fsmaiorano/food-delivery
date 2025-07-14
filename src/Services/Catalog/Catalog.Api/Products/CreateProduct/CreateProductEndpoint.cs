namespace Catalog.Api.Products.CreateProduct;

public record CreateProductRequest(
    string Name,
    List<string> Categories,
    string Description,
    string ImageUrl,
    long Price);

public record CreateProductResponse(Guid Id);

public class CreateProductEndpoint
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/products",
                async (CreateProductRequest request, IMediator sender, CancellationToken cancellationToken) =>
                {
                    var command = new CreateProductCommand(
                        request.Name,
                        request.Categories,
                        request.Description,
                        request.ImageUrl,
                        request.Price);

                    var result = await sender.Send(command, cancellationToken);

                    return Results.Ok(result);
                })
            .WithName("CreateProduct")
            .Produces<CreateProductResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Create Product")
            .WithDescription("Create a new product");
    }
}