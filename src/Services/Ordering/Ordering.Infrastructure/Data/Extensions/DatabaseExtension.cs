namespace Ordering.Infrastructure.Data.Extensions;

public static class DatabaseExtencions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        try
        {
            var created = await context.Database.EnsureCreatedAsync();

            if (!created)
            {
                try
                {
                    await context.Database.MigrateAsync();
                    Console.WriteLine("Database migration completed successfully.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Migration failed, but continuing: {ex.Message}");
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                }
            }
            else
            {
                Console.WriteLine("Database was created successfully.");
            }

            await Task.Delay(1000);

            await SeedAsync(context);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Database initialization failed: {ex.Message}");
            Console.WriteLine("Application will continue without database initialization.");
        }
    }

    private static async Task SeedAsync(ApplicationDbContext context)
    {
        try
        {
            Console.WriteLine("Starting database seeding...");
            await SeedCustomerAsync(context);
            await SeedProductAsync(context);
            await SeedOrdersWithItemsAsync(context);
            Console.WriteLine("Database seeding completed successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Seeding failed: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            throw;
        }
    }

    private static async Task SeedCustomerAsync(ApplicationDbContext context)
    {
        if (!await context.Customers.AnyAsync())
        {
            await context.Customers.AddRangeAsync(InitialData.Customers);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedProductAsync(ApplicationDbContext context)
    {
        if (!await context.Products.AnyAsync())
        {
            await context.Products.AddRangeAsync(InitialData.Products);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedOrdersWithItemsAsync(ApplicationDbContext context)
    {
        if (!await context.Orders.AnyAsync())
        {
            await context.Orders.AddRangeAsync(InitialData.OrdersWithItems);
            await context.SaveChangesAsync();
        }
    }
}