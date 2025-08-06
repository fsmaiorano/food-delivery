namespace Ordering.Application.Orders.EventHandlers.Integration;

public class BasketCheckoutEventHandler(IMediator sender, ILogger<BasketCheckoutEventHandler> logger)
{
    public async Task HandleAsync(BasketCheckoutEvent message)
    {
        logger.LogInformation("Integration Event handled: {IntegrationEvent}", nameof(BasketCheckoutEvent));

        var command = MapToCreateOrderCommand(message);
        await sender.Send(command);
    }

    private static CreateOrderCommand MapToCreateOrderCommand(BasketCheckoutEvent message)
    {
        var addressDto = new AddressDto(message.FirstName, message.LastName, message.EmailAddress, message.AddressLine,
            message.Country, message.State, message.ZipCode);

        var paymentDto = new PaymentDto(message.CardName, message.CardNumber, message.Expiration, message.Cvv,
            message.PaymentMethod);

        var orderId = Guid.NewGuid();

        var orderDto = new OrderDto(
            Id: orderId,
            CustomerId: message.CustomerId,
            OrderName: message.UserName,
            ShippingAddress: addressDto,
            BillingAddress: addressDto,
            Payment: paymentDto,
            Status: OrderStatus.Pending,
            OrderItems: []
        );

        return new CreateOrderCommand(orderDto);
    }
}