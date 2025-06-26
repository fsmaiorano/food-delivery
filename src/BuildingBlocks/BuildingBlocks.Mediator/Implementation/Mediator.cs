namespace BuildingBlocks.Mediator.Implementation;

public class Mediator(IServiceProvider provider) : IMediator
{
    public async Task<TResponse> Send<TResponse>(ICommand<TResponse> command,
        CancellationToken cancellationToken = default)
    {
        var handlerType = typeof(ICommandHandler<,>).MakeGenericType(command.GetType(), typeof(TResponse));
        var handler = provider.GetService(handlerType);
        if (handler == null)
            throw new InvalidOperationException($"Handler not found for {command.GetType().Name}");

        return await (Task<TResponse>)handlerType
            .GetMethod("Handle")!
            .Invoke(handler, new object[] { command, cancellationToken })!;
    }

    public async Task Publish<TNotification>(TNotification notification, CancellationToken cancellationToken = default)
        where TNotification : INotification
    {
        var handlerType = typeof(INotificationHandler<>).MakeGenericType(notification.GetType());
        var handlers = provider.GetServices(handlerType);

        foreach (var handler in handlers)
        {
            await (Task)handlerType
                .GetMethod("Handle")!
                .Invoke(handler, new object[] { notification, cancellationToken })!;
        }
    }
}