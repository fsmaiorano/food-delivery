var builder = WebApplication.CreateBuilder(args);

var assembly = typeof(Program).Assembly;

builder.Services.AddMediator(assembly);

builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));

builder.Services.AddMarten(opts =>
{
    opts.Connection(builder.Configuration.GetConnectionString("Database")!);
})
.UseLightweightSessions()
.InitializeWith(new CatalogInitialData());

builder.Services.AddExceptionHandler<CustomExceptionHandler>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// Seed data in development environment
if (app.Environment.IsDevelopment())
{
    await app.SeedDataAsync();
}

CreateProductEndpoint.MapEndpoints(app);
UpdateProductEndpoint.MapEndpoints(app);
DeleteProductEndpoint.MapEndpoints(app);
GetProductsEndpoint.MapEndpoints(app);
GetProductByIdEndpoint.MapEndpoints(app);
GetProductByCategoryEndpoint.MapEndpoints(app);

app.UseExceptionHandler(options => { });

app.UseCors(cors =>
{
    cors.AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader();
});

app.Run();