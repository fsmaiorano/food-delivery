using Basket.Api.Dtos;
using BuildingBlocks.Messaging.Events;
using BuildingBlocks.Messaging.Interfaces;

namespace Basket.Api.Basket.CheckoutBasket;

public record CheckoutBasketCommand(BasketCheckoutDto BasketCheckoutDto)
    : ICommand<CheckoutBasketResult>;

public record CheckoutBasketResult(bool IsSuccess);

public class CheckoutBasketCommandHandler(IBasketRepository repository, IMessagePublisher messagePublisher)
    : ICommandHandler<CheckoutBasketCommand, CheckoutBasketResult>
{
    public async Task<CheckoutBasketResult> HandleAsync(CheckoutBasketCommand command,
        CancellationToken cancellationToken)
    {
        var basket = await repository.GetBasket(command.BasketCheckoutDto.UserName, cancellationToken);

        if (basket is null)
            return new CheckoutBasketResult(false);

        var eventMessage = new BasketCheckoutEvent
        {
            UserName = command.BasketCheckoutDto.UserName,
            CustomerId = command.BasketCheckoutDto.CustomerId,
            TotalPrice = basket.TotalPrice,
            FirstName = command.BasketCheckoutDto.FirstName,
            LastName = command.BasketCheckoutDto.LastName,
            EmailAddress = command.BasketCheckoutDto.EmailAddress,
            AddressLine = command.BasketCheckoutDto.AddressLine,
            Country = command.BasketCheckoutDto.Country,
            State = command.BasketCheckoutDto.State,
            ZipCode = command.BasketCheckoutDto.ZipCode,
            CardName = command.BasketCheckoutDto.CardName,
            CardNumber = command.BasketCheckoutDto.CardNumber,
            Expiration = command.BasketCheckoutDto.Expiration,
            Cvv = command.BasketCheckoutDto.Cvv,
            PaymentMethod = (int)command.BasketCheckoutDto.PaymentMethod
        };

        await messagePublisher.PublishAsync(eventMessage, "", cancellationToken);
        await repository.DeleteBasket(command.BasketCheckoutDto.UserName, cancellationToken);

        return new CheckoutBasketResult(true);
    }
}