var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMediator(Assembly.GetExecutingAssembly());
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
builder.Services.AddMarten(opt => { opt.Connection(builder.Configuration.GetConnectionString("Database")!); })
    .UseLightweightSessions();

// if (builder.Environment.IsDevelopment())
//     builder.Services.InitializeMartenWith<CatalogInitialData>();

builder.Services.AddScoped<CreateProductEndpoint>();

var app = builder.Build();

CreateProductEndpoint.MapEndpoints(app);
GetProductsEndpoint.MapEndpoints(app);

app.Run();