namespace Ordering.Infrastructure.Data.Seed;

internal static class InitialData
{
    public static IEnumerable<Customer> Customers =>
        new List<Customer>
        {
            Customer.Create(CustomerId.Of(new Guid("a1b2c3d4-e5f6-4a1b-9c8d-1234567890ab")), "alice", "alice@foodmail.com"),
            Customer.Create(CustomerId.Of(new Guid("b2c3d4e5-f6a1-4b2c-8d9e-2345678901bc")), "bob", "bob@foodmail.com")
        };

    public static IEnumerable<Product> Products =>
        new List<Product>
        {
            Product.Create(ProductId.Of(new Guid("f1e2d3c4-b5a6-4c3d-8e9f-3456789012cd")), "Margherita Pizza", 15),
            Product.Create(ProductId.Of(new Guid("e2d3c4b5-a6f1-4d3c-9e8f-4567890123de")), "Cheeseburger", 12),
            Product.Create(ProductId.Of(new Guid("d3c4b5a6-f1e2-4e3d-9c8f-5678901234ef")), "Caesar Salad", 10),
            Product.Create(ProductId.Of(new Guid("c4b5a6f1-e2d3-4f3d-8c9e-6789012345fa")), "Sushi Roll", 18)
        };

    public static IEnumerable<Order> OrdersWithItems
    {
        get
        {
            var address1 = Address.Of("alice", "smith", "alice@foodmail.com", "123 Food St", "Italy", "Rome", "00100");
            var address2 = Address.Of("bob", "johnson", "bob@foodmail.com", "456 Meal Ave", "USA", "New York", "10001");

            var payment1 = Payment.Of("alice", "4111111111111111", "11/27", "123", 1);
            var payment2 = Payment.Of("bob", "4222222222222222", "10/26", "456", 2);

            var order1 = Order.Create(
                OrderId.Of(Guid.NewGuid()),
                CustomerId.Of(new Guid("a1b2c3d4-e5f6-4a1b-9c8d-1234567890ab")),
                OrderName.Of("FOOD_1"),
                shippingAddress: address1,
                billingAddress: address1,
                payment1);
            order1.Add(ProductId.Of(new Guid("f1e2d3c4-b5a6-4c3d-8e9f-3456789012cd")), 1, 15); // Margherita Pizza
            order1.Add(ProductId.Of(new Guid("d3c4b5a6-f1e2-4e3d-9c8f-5678901234ef")), 2, 10); // Caesar Salad

            var order2 = Order.Create(
                OrderId.Of(Guid.NewGuid()),
                CustomerId.Of(new Guid("b2c3d4e5-f6a1-4b2c-8d9e-2345678901bc")),
                OrderName.Of("FOOD_2"),
                shippingAddress: address2,
                billingAddress: address2,
                payment2);
            order2.Add(ProductId.Of(new Guid("e2d3c4b5-a6f1-4d3c-9e8f-4567890123de")), 2, 12); // Cheeseburger
            order2.Add(ProductId.Of(new Guid("c4b5a6f1-e2d3-4f3d-8c9e-6789012345fa")), 1, 18); // Sushi Roll

            return new List<Order> { order1, order2 };
        }
    }
}