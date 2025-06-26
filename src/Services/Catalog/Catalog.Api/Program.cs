var builder = WebApplication.CreateBuilder(args);

var assembly = typeof(Program).Assembly;

builder.Services.AddMediator(assembly);

builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));

builder.Services.AddMarten(opt => { opt.Connection(builder.Configuration.GetConnectionString("Database")!); })
    .UseLightweightSessions();

// if (builder.Environment.IsDevelopment())
//     builder.Services.InitializeMartenWith<CatalogInitialData>();

builder.Services.AddScoped<CreateProductEndpoint>();
builder.Services.AddExceptionHandler<CustomExceptionHandler>();

var app = builder.Build();

CreateProductEndpoint.MapEndpoints(app);
GetProductsEndpoint.MapEndpoints(app);

app.UseExceptionHandler(options => { });

app.Run();