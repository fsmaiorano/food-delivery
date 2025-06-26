namespace Catalog.Api.Products.DeleteProduct;

public record DeleteProductResponse(bool IsSuccess);

public class DeleteProductEndpoint
{
    public static void MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapDelete("/products/{id:guid}",
                async (IMediator sender, Guid id, CancellationToken cancellationToken) =>
                {
                    var command = new DeleteProductCommand(id);
                    var result = await sender.Send(command, cancellationToken);
                    return result.IsSuccess ? Results.NoContent() : Results.NotFound();
                })
            .WithName("DeleteProduct")
            .Produces<DeleteProductResponse>(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithSummary("Delete Product")
            .WithDescription("Delete a product by its ID");
    }
}