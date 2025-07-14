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
            string originalImageUrl = product.ImageFile;
            
            // Check if ImageFile looks like a URL rather than a GUID-based object name
            if (originalImageUrl.StartsWith("http"))
            {
                Console.WriteLine($"Processing product: {product.Id} - {product.Name}");
                Console.WriteLine($"Original ImageFile: {originalImageUrl}");
                
                try
                {
                    // Upload to MinIO and get the object name and URL
                    var storedImage = await MinioBucket.SendImageAsync(originalImageUrl);
                    product.ImageFile = storedImage.objectName;
                    product.ImageUrl = storedImage.objectUrl;
                    
                    Console.WriteLine($"Updated ImageFile: {product.ImageFile}");
                    Console.WriteLine($"Updated ImageUrl: {product.ImageUrl}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error updating image for product {product.Id}: {ex.Message}");
                }
            }
            else
            {
                // ImageFile is already an object name, just update the ImageUrl
                Console.WriteLine($"Product {product.Id} already has object name: {product.ImageFile}");
                product.ImageUrl = await MinioBucket.GetImageAsync(product.ImageFile) ?? string.Empty;
            }
        }
        
        await session.SaveChangesAsync(cancellation);
        Console.WriteLine("Product image update completed");
    }
}
