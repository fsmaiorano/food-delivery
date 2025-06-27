using System.Text;
using System.Text.Json;
using BuildingBlocks.Messaging.Interfaces;
using BuildingBlocks.Messaging.Models;
using RabbitMQ.Client;

namespace BuildingBlocks.Messaging.Implementations;

public class RabbitMqPublisher(RabbitMQOptions options) : IMessagePublisher
{
    private readonly ConnectionFactory _factory = new()
    {
        HostName = options.HostName,
        UserName = options.UserName,
        Password = options.Password
    };

    public async Task PublishAsync<T>(T message, string queueName, CancellationToken cancellationToken = default)
    {
        await using var connection = await _factory.CreateConnectionAsync(cancellationToken);
        await using var channel = await connection.CreateChannelAsync(cancellationToken: cancellationToken);

        if (cancellationToken.IsCancellationRequested)
            return;

        await channel.QueueDeclareAsync(queue: queueName, durable: true, exclusive: false, autoDelete: false,
            cancellationToken: cancellationToken);

        var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));
        await channel.BasicPublishAsync(string.Empty, queueName, body, cancellationToken: cancellationToken);
    }
}