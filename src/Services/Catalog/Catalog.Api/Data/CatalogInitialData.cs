using Marten.Schema;

namespace Catalog.Api.Data;

public class CatalogInitialData : IInitialData
{
    public async Task Populate(IDocumentStore store, CancellationToken cancellation)
    {
        await using var session = store.LightweightSession();

        var existingProductsCount = await session.Query<Product>().CountAsync(cancellation);

        if (existingProductsCount == 0)
        {
            foreach (var product in Products)
            {
                var (objectName, _) = await MinioBucket.SendImageAsync(product.ImageUrl);
                product.ImageUrl = objectName;
                session.Store(product);
            }

            await session.SaveChangesAsync(cancellation);
        }
    }

    public static IEnumerable<Product> Products => new List<Product>
    {
        new()
        {
            Id = new Guid("5334c996-8457-4cf0-815c-ed2b77c4ff61"),
            Name = "Margherita Pizza",
            Categories = ["Pizza", "Italian", "Vegetarian"],
            Description = "Classic pizza with fresh mozzarella, tomato sauce, and basil leaves",
            ImageUrl = "https://cloudfront-us-east-1.images.arcpublishing.com/estadao/YANRMY3TBZGWBCM2UDY6LEZJMA.jpg",
            Price = 14.99m
        },
        new()
        {
            Id = new Guid("c67d6323-e8b1-4bdf-9a75-b0d0d2e7e914"),
            Name = "Pepperoni Pizza",
            Categories = ["Pizza", "Italian"],
            Description = "Traditional pizza topped with pepperoni slices and mozzarella cheese",
            ImageUrl = "https://www.cobsbread.com/us/wp-content//uploads/2022/09/Pepperoni-pizza-850x630-1.png",
            Price = 16.99m
        },
        new()
        {
            Id = new Guid("4f136e9f-ff8c-4c1f-9a33-d12f689bdab8"),
            Name = "Caesar Salad",
            Categories = ["Salad", "Healthy", "Vegetarian"],
            Description = "Fresh romaine lettuce with caesar dressing, croutons, and parmesan cheese",
            ImageUrl = "https://cdn.loveandlemons.com/wp-content/uploads/2024/12/caesar-salad.jpg",
            Price = 9.99m
        },
        new()
        {
            Id = new Guid("6ec1297b-ec0a-4aa1-be25-6726e3b51a27"),
            Name = "Chicken Burger",
            Categories = ["Burger", "Chicken"],
            Description = "Grilled chicken breast with lettuce, tomato, and mayo on a sesame bun",
            ImageUrl = "https://hips.hearstapps.com/hmg-prod/images/chicken-burgers-lead-667b185b5c64f.jpg",
            Price = 12.99m
        },
        new()
        {
            Id = new Guid("b786103c-329d-4831-8be4-3dc7d9e7f64a"),
            Name = "Beef Tacos",
            Categories = ["Mexican", "Beef"],
            Description = "Three soft tacos filled with seasoned ground beef, lettuce, and cheese",
            ImageUrl = "https://www.onceuponachef.com/images/2023/08/Beef-Tacos.jpg",
            Price = 11.99m
        },
        new()
        {
            Id = new Guid("77d15b4c-6b8a-4d95-8e4e-f35d7e3d8d1e"),
            Name = "Spaghetti Carbonara",
            Categories = ["Pasta", "Italian"],
            Description = "Creamy pasta with pancetta, eggs, and parmesan cheese",
            ImageUrl =
                "https://static01.nyt.com/images/2021/02/14/dining/carbonara-horizontal/carbonara-horizontal-mediumSquareAt3X-v2.jpg",
            Price = 15.99m
        },
        new()
        {
            Id = new Guid("8e2f4c7b-9d1a-4b6e-a3c5-6f8e2d4c9b1a"),
            Name = "Greek Salad",
            Categories = ["Salad", "Greek", "Healthy", "Vegetarian"],
            Description = "Fresh vegetables with feta cheese, olives, and olive oil dressing",
            ImageUrl =
                "https://www.simplyrecipes.com/thmb/0NrKQlJ691l6L9tZXpL06uOuWis=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Easy-Greek-Salad-LEAD-2-4601eff771fd4de38f9722e8cafc897a.jpg",
            Price = 10.99m
        },
        new()
        {
            Id = new Guid("9f3e5d8c-1a2b-4c7e-b5f9-3e8d7c2a6b4f"),
            Name = "BBQ Ribs",
            Categories = ["BBQ", "Pork"],
            Description = "Tender pork ribs with smoky BBQ sauce and coleslaw",
            ImageUrl = "https://www.onceuponachef.com/images/2022/06/baby-back-ribs-18-1200x1397.jpg",
            Price = 19.99m
        },
        new()
        {
            Id = new Guid("1a4e7f2d-5b8c-4e9f-a2d6-8c3f7e1b9d4a"),
            Name = "Fish and Chips",
            Categories = ["Seafood", "British"],
            Description = "Beer-battered fish with crispy fries and tartar sauce",
            ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/f/ff/Fish_and_chips_blackpool.jpg",
            Price = 13.99m
        },
        new()
        {
            Id = new Guid("2b5f8e3a-6c9d-4f1e-b3e7-9d4a8e2c6f1b"),
            Name = "Chocolate Cake",
            Categories = ["Dessert", "Chocolate"],
            Description = "Rich chocolate cake with chocolate frosting and berries",
            ImageUrl = "https://ichef.bbci.co.uk/food/ic/food_16x9_1600/recipes/easy_chocolate_cake_31070_16x9.jpg",
            Price = 6.99m
        }
    };
}