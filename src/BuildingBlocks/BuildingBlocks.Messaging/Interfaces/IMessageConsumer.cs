namespace BuildingBlocks.Messaging.Interfaces;

public interface IMessageConsumer
{
    Task StartConsumingAsync<T>(
        string queueName,
        Func<T, Task> onMessageReceived,
        CancellationToken cancellationToken = default
    );
}