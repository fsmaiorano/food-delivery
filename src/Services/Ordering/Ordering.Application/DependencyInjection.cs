using BuildingBlocks.Http;
using Ordering.Application.Orders.Commands.PatchOrderStatus;
using Ordering.Application.Orders.EventHandlers.Domain;
using Ordering.Application.Orders.EventHandlers.Integration;
using Ordering.Application.Services.BackgroundService;
using Ordering.Application.Services.Http;

namespace Ordering.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddMediator(Assembly.GetExecutingAssembly());

        services.AddRabbitMq(options =>
        {
            options.HostName = configuration["MessageBroker:Host"]!;
            options.UserName = configuration["MessageBroker:UserName"]!;
            options.Password = configuration["MessageBroker:Password"]!;
        });

        services = AddServices(services, configuration);

        services.AddHttpContextAccessor();
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));

        services.AddHostedService<CheckoutConsumerService>();
        services.AddHostedService<OrderingProcessService>();
        
        services.AddTransient<PatchOrderStatusHandler>();
        services.AddTransient<BasketCheckoutEventHandler>();
        services.AddTransient<OrderCreatedEventHandler>();
        services.AddTransient<OrderUpdatedEventHandler>();
        
        return services;
    }

    private static IServiceCollection AddServices(IServiceCollection services, IConfiguration configuration)
    {
        var keycloakBaseUrl = configuration["Services:Keycloak:BaseUrl"];
        if (string.IsNullOrEmpty(keycloakBaseUrl))
            throw new ArgumentException("Keycloak BaseUrl is not configured.");

        var keycloakRealm = configuration["Services:Keycloak:Realm"];
        if (string.IsNullOrEmpty(keycloakRealm))
            throw new ArgumentException("Keycloak Realm is not configured.");

        var keycloakUserInfoUrl =
            $"{keycloakBaseUrl}{configuration["Services:Keycloak:UserInfoEndpoint"]?.Replace("{{REALM}}", keycloakRealm)}";
        if (string.IsNullOrEmpty(keycloakUserInfoUrl))
            throw new ArgumentException("Keycloak UserInfoEndpoint is not configured.");

        services.AddHttpClient<IKeyCloakService, KeyCloakService>(client =>
        {
            client.BaseAddress = new Uri(keycloakBaseUrl);
        }).AddHttpMessageHandler(() => new LoggingHandler(
            services.BuildServiceProvider().GetRequiredService<ILogger<LoggingHandler>>()));

        return services;
    }
}