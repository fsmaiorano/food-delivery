using BuildingBlocks.Storage.Minio;
using Catalog.Api.Models;
using Marten;

namespace Catalog.Api.Data;

public static class UpdateProductImages
{
    public static async Task UpdateAllProductImages(IDocumentStore store, CancellationToken cancellation = default)
    {
        Console.WriteLine("Starting image update process for all products...");
        await using var session = store.LightweightSession();

        var products = await session.Query<Product>().ToListAsync(cancellation);

        Console.WriteLine($"Found {products.Count} products to update");

        foreach (var product in products)
        {
            var originalImageUrl = product.ImageUrl;

            if (originalImageUrl.StartsWith("http"))
            {
                Console.WriteLine($"Processing product: {product.Id} - {product.Name}");
                Console.WriteLine($"Original ImageFile: {originalImageUrl}");

                try
                {
                    var (objectName, objectUrl) = await MinioBucket.SendImageAsync(originalImageUrl);
                    product.ImageUrl = objectName;

                    Console.WriteLine($"Updated ImageUrl: {product.ImageUrl}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error updating image for product {product.Id}: {ex.Message}");
                }
            }
            else
            {
                Console.WriteLine($"Product {product.Id} already has object name: {product.ImageUrl}");
                product.ImageUrl = await MinioBucket.GetImageAsync(product.ImageUrl) ?? string.Empty;
            }
        }

        await session.SaveChangesAsync(cancellation);
        Console.WriteLine("Product image update completed");
    }
}