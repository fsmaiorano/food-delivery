using Basket.Api.Basket.CheckoutBasket;
using Basket.Api.Basket.DeleteBasket;
using Basket.Api.Basket.GetBasket;
using Basket.Api.Basket.StoreBasket;
using Basket.Api.Data;
using Discount.Grpc;
using Microsoft.Extensions.Caching.Distributed;

var builder = WebApplication.CreateBuilder(args);

var assembly = typeof(Program).Assembly;

builder.Services.AddMediator(assembly);

builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));

builder.Services.AddMarten(opt => { opt.Connection(builder.Configuration.GetConnectionString("Database")!); })
    .UseLightweightSessions();

builder.Services.AddDistributedMemoryCache();

builder.Services.AddScoped<BasketRepository>();
builder.Services.AddScoped<IBasketRepository>(sp =>
    new CachedBasketRepository(
        sp.GetRequiredService<BasketRepository>(),
        sp.GetRequiredService<IDistributedCache>()
    )
);

builder.Services.AddGrpcClient<DiscountProtoService.DiscountProtoServiceClient>(options =>
{
    options.Address = new Uri(builder.Configuration["GrpcSettings:DiscountUrl"]!);
}).ConfigurePrimaryHttpMessageHandler(() =>
{
    var handler = new HttpClientHandler
    {
        // ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
        ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
    };

    return handler;
});

builder.Services.AddExceptionHandler<CustomExceptionHandler>();

var app = builder.Build();

StoreBasketEndpoint.MapEndpoints(app);
GetBasketEndpoint.MapEndpoints(app);
DeleteBasketEndpoint.MapEndpoints(app);
CheckoutBasketEndpoints.MapEndpoints(app);

app.Run();