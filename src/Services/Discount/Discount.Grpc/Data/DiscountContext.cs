namespace Discount.Grpc.Data;

public class DiscountContext : DbContext
{
    public DbSet<Coupon> Coupons { get; set; }

    public DiscountContext(DbContextOptions<DiscountContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Coupon>().HasData(
            new Coupon
            {
                Id = 1,
                ProductName = "Margherita Pizza",
                Description = "Pizza Discount",
                Amount = 2.5m.ToString("F4")
            },
            new Coupon
            {
                Id = 2,
                ProductName = "Cheeseburger",
                Description = "Burger Discount",
                Amount = 1.5m.ToString("F4")
            },
            new Coupon
            {
                Id = 3,
                ProductName = "Caesar Salad",
                Description = "Salad Discount",
                Amount = 1.0m.ToString("F4")
            },
            new Coupon
            {
                Id = 4,
                ProductName = "Sushi Roll",
                Description = "Sushi Discount",
                Amount = 3.0m.ToString("F4")
            }
        );
    }
}