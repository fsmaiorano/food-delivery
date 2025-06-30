using System.Text;
using System.Text.Json;
using BuildingBlocks.Messaging.Interfaces;
using BuildingBlocks.Messaging.Models;
using RabbitMQ.Client.Events;
using RabbitMQ.Client;

namespace BuildingBlocks.Messaging.Implementations;

public class RabbitMqConsumer(RabbitMqOptions options) : IMessageConsumer
{
    private readonly ConnectionFactory _factory = new()
    {
        HostName = options.HostName,
        UserName = options.UserName,
        Password = options.Password,
    };

    public async Task StartConsumingAsync<T>(
        string queueName,
        Func<T, Task> onMessageReceived,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await using var connection = await _factory.CreateConnectionAsync(cancellationToken);
            await using var channel = await connection.CreateChannelAsync(cancellationToken: cancellationToken);

            await channel.QueueDeclareAsync(
                queue: queueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                cancellationToken: cancellationToken
            );

            var consumer = new AsyncEventingBasicConsumer(channel);

            consumer.ReceivedAsync += async (_, ea) =>
            {
                if (cancellationToken.IsCancellationRequested)
                    return;

                try
                {
                    var body = ea.Body.ToArray();
                    var json = Encoding.UTF8.GetString(body);
                    var message = JsonSerializer.Deserialize<T>(json);

                    if (message != null)
                        await onMessageReceived(message);
                }
                catch (Exception ex)
                {
                    // TODO: log da falha ao processar a mensagem
                    Console.WriteLine($"Erro ao processar mensagem: {ex.Message}");
                }
            };

            var consumerTag = await channel.BasicConsumeAsync(
                queue: queueName,
                autoAck: true,
                consumer: consumer,
                cancellationToken: cancellationToken
            );

            await Task.Run(() =>
            {
                cancellationToken.WaitHandle.WaitOne();
                channel.BasicCancelAsync(consumerTag, cancellationToken: cancellationToken);
                channel.CloseAsync(cancellationToken: cancellationToken);
                connection.CloseAsync(cancellationToken: cancellationToken);
            }, cancellationToken);
        }
        catch (OperationCanceledException)
        {
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erro geral no consumidor: {ex.Message}");
            throw;
        }
    }
}