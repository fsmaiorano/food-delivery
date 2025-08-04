var builder = WebApplication.CreateBuilder(args);


builder.Services
    .AddApplicationServices(builder.Configuration)
    .AddInfrastructureServices(builder.Configuration)
    .AddApiServices(builder.Configuration);

var app = builder.Build();

app.UseApiServices();

CreateOrderEndpoint.MapEndpoints(app);
DeleteOrderEndpoint.MapEndpoints(app);
UpdateOrderEndpoint.MapEndpoints(app);
GetOrdersByCustomerEndpoint.MapEndpoints(app);
GetOrdersByNameEndpoint.MapEndpoints(app);
GetOrdersEndpoint.MapEndpoints(app);

if (app.Environment.IsDevelopment())
{
    await Task.Delay(TimeSpan.FromSeconds(5));
    await app.InitialiseDatabaseAsync();
}

app.Run();