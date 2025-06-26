namespace Catalog.Api.Products.UpdateProduct;

public record UpdateProductRequest(
    Guid Id,
    string Name,
    List<string> Categories,
    string Description,
    decimal Price,
    string ImageUrl
);

public record UpdateProductResponse(bool IsSuccess);

public class UpdateProductEndpoint
{
    public static void MapEndpoints(IEndpointRouteBuilder app)
    {
        app.MapPut("/products", async (UpdateProductRequest request,
                IMediator sender,
                CancellationToken cancellationToken) =>
            {
                var command = new UpdateProductCommand(
                    request.Id,
                    request.Name,
                    request.Categories,
                    request.Description,
                    request.Price,
                    request.ImageUrl);

                var result = await sender.Send(command, cancellationToken);

                var response = new UpdateProductResponse(result.IsSuccess);

                return Results.Ok(response);
            })
            .WithName("UpdateProduct")
            .Produces<UpdateProductResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .WithSummary("Update a product")
            .WithDescription("Update a product by id");
    }
}