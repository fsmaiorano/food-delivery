using Ordering.Api;
using Ordering.API.Endpoints;
using Ordering.Application;
using Ordering.Infrastructure;
using Ordering.Infrastructure.Data.Extensions;

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
    await app.InitialiseDatabaseAsync();
}

app.Run();