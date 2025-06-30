using System.Reflection;
using BuildingBlocks.Mediator.Behaviors;
using BuildingBlocks.Mediator.Extensions;
using BuildingBlocks.Mediator.Interfaces;
using BuildingBlocks.Messaging;

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


        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        return services;
    }
}