namespace BuildingBlocks.Mediator.Implementation;

public class Mediator : IMediator
{
    private readonly IServiceProvider _provider;

    public Mediator(IServiceProvider provider)
    {
        _provider = provider ?? throw new ArgumentNullException(nameof(provider));
    }

    public async Task<TResponse> Send<TResponse>(ICommand<TResponse> command,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        var handlerType = typeof(ICommandHandler<,>).MakeGenericType(command.GetType(), typeof(TResponse));
        var handler = _provider.GetService(handlerType);

        if (handler == null)
            throw new InvalidOperationException($"Handler not found for {command.GetType().Name}");

        var behaviorType = typeof(IPipelineBehavior<,>).MakeGenericType(command.GetType(), typeof(TResponse));
        var behaviors = _provider.GetServices(behaviorType).Reverse().ToList();

        Task<TResponse> HandlerDelegate() =>
            ((Task<TResponse>)handlerType.GetMethod("HandleAsync")!.Invoke(handler,
                new object[] { command, cancellationToken })!);

        var pipeline = HandlerDelegate;

        foreach (var behavior in behaviors)
        {
            var next = pipeline;
            pipeline = () =>
            {
                if (behavior == null) throw new InvalidOperationException("Pipeline behavior is null.");
                if (next == null) throw new InvalidOperationException("Next delegate in pipeline is null.");
                return ((dynamic)behavior).Handle((dynamic)command, cancellationToken, next);
            };
        }

        return await pipeline();
    }

    public async Task<TResponse> Send<TResponse>(IQuery<TResponse> query, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(query);

        var handlerType = typeof(IQueryHandler<,>).MakeGenericType(query.GetType(), typeof(TResponse));
        var handler = _provider.GetService(handlerType);

        if (handler == null)
            throw new InvalidOperationException($"Handler not found for {query.GetType().Name}");

        var behaviorType = typeof(IPipelineBehavior<,>).MakeGenericType(query.GetType(), typeof(TResponse));
        var behaviors = _provider.GetServices(behaviorType).Reverse().ToList();

        Task<TResponse> HandlerDelegate() =>
            ((Task<TResponse>)handlerType.GetMethod("HandleAsync")!.Invoke(handler,
                new object[] { query, cancellationToken })!);

        var pipeline = HandlerDelegate;

        foreach (var behavior in behaviors)
        {
            var next = pipeline;
            pipeline = () =>
            {
                if (behavior == null) throw new InvalidOperationException("Pipeline behavior is null.");
                if (next == null) throw new InvalidOperationException("Next delegate in pipeline is null.");
                return ((dynamic)behavior).Handle((dynamic)query, cancellationToken, next);
            };
        }

        return await pipeline();
    }

    public async Task Publish<TNotification>(TNotification notification, CancellationToken cancellationToken = default)
        where TNotification : INotification
    {
        if (notification == null) throw new ArgumentNullException(nameof(notification));

        var handlerType = typeof(INotificationHandler<>).MakeGenericType(notification.GetType());
        var handlers = _provider.GetServices(handlerType);

        foreach (var handler in handlers)
        {
            await (Task)handlerType.GetMethod("Handle")!.Invoke(handler,
                new object[] { notification, cancellationToken })!;
        }
    }
}