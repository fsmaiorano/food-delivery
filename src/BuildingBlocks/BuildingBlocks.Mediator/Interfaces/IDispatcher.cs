namespace BuildingBlocks.Mediator.Interfaces;

public interface IDispatcher
{
    Task<TResponse> ExecuteCommandAsync<TResponse>(ICommand<TResponse> command,
        CancellationToken cancellationToken = default);

    Task<TResponse> ExecuteQueryAsync<TResponse>(IQuery<TResponse> query,
        CancellationToken cancellationToken = default);

    Task PublishAsync<TNotification>(TNotification notification, CancellationToken cancellationToken = default)
        where TNotification : INotification;
}