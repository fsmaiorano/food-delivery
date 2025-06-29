using System.Reflection;
using BuildingBlocks.Mediator.Behaviors;
using BuildingBlocks.Mediator.Extensions;
using BuildingBlocks.Mediator.Interfaces;

namespace Ordering.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddMediator(Assembly.GetExecutingAssembly());
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        return services;
    }
}