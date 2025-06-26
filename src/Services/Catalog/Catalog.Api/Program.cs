using System.Reflection;
using Catalog.Api.Products.CreateProduct;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMediator(Assembly.GetExecutingAssembly());

builder.Services.AddMarten(opt => { opt.Connection(builder.Configuration.GetConnectionString("Database")!); })
    .UseLightweightSessions();

var app = builder.Build();

CreateProductEndpoint.MapEndpoints(app);

app.Run();