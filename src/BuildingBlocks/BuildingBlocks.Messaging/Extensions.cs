using BuildingBlocks.Messaging.Implementations;
using BuildingBlocks.Messaging.Interfaces;
using BuildingBlocks.Messaging.Models;
using Microsoft.Extensions.DependencyInjection;

namespace BuildingBlocks.Messaging;

public static class Extensions
{
    public static IServiceCollection AddRabbitMq(this IServiceCollection services, Action<RabbitMqOptions> setup)
    {
        var options = new RabbitMqOptions();
        setup(options);

        services.AddSingleton(options);
        services.AddSingleton<IMessagePublisher, RabbitMqPublisher>();
        services.AddSingleton<IMessageConsumer, RabbitMqConsumer>();

        return services;
    }
}