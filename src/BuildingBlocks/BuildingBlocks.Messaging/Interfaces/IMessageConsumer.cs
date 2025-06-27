namespace BuildingBlocks.Messaging.Interfaces;

public interface IMessageConsumer
{
    void StartConsuming<T>(string queueName, Func<T, Task> onMessageReceived,
        CancellationToken cancellationToken = default);
}