namespace BuildingBlocks.Messaging.Models;

public class RabbitMqOptions
{
    public string HostName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
