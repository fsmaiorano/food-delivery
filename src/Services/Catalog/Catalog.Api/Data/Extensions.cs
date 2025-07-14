using Marten;

namespace Catalog.Api.Data;

public static class Extensions
{
  public static async Task<WebApplication> SeedDataAsync(this WebApplication app)
  {
    using var scope = app.Services.CreateScope();
    var store = scope.ServiceProvider.GetRequiredService<IDocumentStore>();

    await using var session = store.LightweightSession();

    // Check if we already have products to avoid duplicates
    var existingProductsCount = await session.Query<Product>().CountAsync();

    if (existingProductsCount == 0)
    {
      Console.WriteLine("Seeding catalog with initial data...");

      session.Store(CatalogInitialData.Products.ToArray());
      await session.SaveChangesAsync();

      Console.WriteLine($"Seeded {CatalogInitialData.Products.Count()} products");
    }
    else
    {
      Console.WriteLine($"Database already contains {existingProductsCount} products. Skipping seed.");
    }

    return app;
  }
}
