using Ordering.Application.Services.Http;

namespace Ordering.Application.Orders.Commands.CreateOrder;

public class CreateOrderHandler(IApplicationDbContext dbContext, IKeyCloakService keyCloakService)
    : ICommandHandler<CreateOrderCommand, CreateOrderResult>
{
    public async Task<CreateOrderResult> HandleAsync(CreateOrderCommand command, CancellationToken cancellationToken)
    {
        var customer = await dbContext.Customers
            .FirstOrDefaultAsync(c => c.Id == CustomerId.Of(command.Order.CustomerId), cancellationToken);

        if (customer is null)
        {
            var storedUser = await keyCloakService.GetUserInfoAdmin(command.Order.CustomerId.ToString());

            if (storedUser is null)
                throw new NotFoundException($"Customer with ID {command.Order.CustomerId} not found in Keycloak.");

            customer = Customer.Create(
                id: CustomerId.Of(command.Order.CustomerId),
                name: storedUser.FullName ?? $"{storedUser.FirstName.Trim()} {storedUser.LastName.Trim()}",
                email: storedUser.Email
            );

            dbContext.Customers.Add(customer);
        }

        var order = CreateNewOrder(command.Order);

        dbContext.Orders.Add(order);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new CreateOrderResult(order.Id.Value);
    }

    private static Order CreateNewOrder(OrderDto orderDto)
    {
        var shippingAddress = Address.Of(orderDto.ShippingAddress.FirstName, orderDto.ShippingAddress.LastName,
            orderDto.ShippingAddress.EmailAddress, orderDto.ShippingAddress.AddressLine,
            orderDto.ShippingAddress.Country, orderDto.ShippingAddress.State, orderDto.ShippingAddress.ZipCode);

        var billingAddress = Address.Of(orderDto.BillingAddress.FirstName, orderDto.BillingAddress.LastName,
            orderDto.BillingAddress.EmailAddress, orderDto.BillingAddress.AddressLine, orderDto.BillingAddress.Country,
            orderDto.BillingAddress.State, orderDto.BillingAddress.ZipCode);

        var newOrder = Order.Create(
            id: OrderId.Of(Guid.NewGuid()),
            customerId: CustomerId.Of(orderDto.CustomerId),
            orderName: OrderName.Of(orderDto.OrderName),
            shippingAddress: shippingAddress,
            billingAddress: billingAddress,
            payment: Payment.Of(orderDto.Payment.CardName, orderDto.Payment.CardNumber, orderDto.Payment.Expiration,
                orderDto.Payment.Cvv, orderDto.Payment.PaymentMethod)
        );

        foreach (var orderItemDto in orderDto.OrderItems)
            newOrder.Add(ProductId.Of(orderItemDto.ProductId), orderItemDto.Quantity, orderItemDto.Price);

        return newOrder;
    }
}