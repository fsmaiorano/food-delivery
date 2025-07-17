var builder = WebApplication.CreateBuilder(args);

var assembly = typeof(Program).Assembly;

builder.Services.AddMediator(assembly);

builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));

builder.Services.AddMarten(opt =>
    {
        opt.Connection(builder.Configuration.GetConnectionString("Database")!);
        opt.Schema.For<ShoppingCart>().Identity(x => x.Username);
    })
    .UseLightweightSessions();

builder.Services.AddDistributedMemoryCache();

builder.Services.AddScoped<BasketRepository>();
builder.Services.AddScoped<IBasketRepository>(sp =>
    new CachedBasketRepository(
        sp.GetRequiredService<BasketRepository>(),
        sp.GetRequiredService<IDistributedCache>()
    )
);

builder.Services.AddRabbitMq(options =>
{
    options.HostName = builder.Configuration["MessageBroker:Host"]!;
    options.UserName = builder.Configuration["MessageBroker:UserName"]!;
    options.Password = builder.Configuration["MessageBroker:Password"]!;
});

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

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
    {
        builder.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("CorsPolicy");

StoreBasketEndpoint.MapEndpoints(app);
GetBasketEndpoint.MapEndpoints(app);
DeleteBasketEndpoint.MapEndpoints(app);
CheckoutBasketEndpoint.MapEndpoints(app);

app.Run();