namespace Ordering.Infrastructure.Data.Extensions;

public static class DatabaseExtencions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await WaitForDatabaseAsync(context);

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

    private static async Task WaitForDatabaseAsync(ApplicationDbContext context)
    {
        var maxRetries = 10;
        var delay = TimeSpan.FromSeconds(2);

        for (int i = 0; i < maxRetries; i++)
        {
            try
            {
                await context.Database.CanConnectAsync();
                Console.WriteLine("Database connection successful!");
                return;
            }
            catch (Exception ex) when (i < maxRetries - 1)
            {
                Console.WriteLine($"Database connection attempt {i + 1} failed: {ex.Message}. Retrying in {delay.TotalSeconds} seconds...");
                await Task.Delay(delay);
            }
        }

        Console.WriteLine("Failed to connect to database after all retries. Proceeding anyway...");
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