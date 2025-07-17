using Basket.Api.Data;
using Basket.Api.Models;
using Discount.Grpc;

namespace Basket.Api.Basket.StoreBasket;

public record StoreBasketCommand(ShoppingCart Cart) : ICommand<StoreBasketResult>;

public record StoreBasketResult(ShoppingCart Cart);

public class StoreBasketCommandHandler(
    IBasketRepository repository,
    DiscountProtoService.DiscountProtoServiceClient discountProtoServiceClient
)
    : ICommandHandler<StoreBasketCommand, StoreBasketResult>
{
    public async Task<StoreBasketResult> HandleAsync(StoreBasketCommand command, CancellationToken cancellationToken)
    {
        await DeductDiscounts(command.Cart, cancellationToken);
        await repository.StoreBasket(command.Cart, cancellationToken);
        return new StoreBasketResult(command.Cart);
    }

    private async Task DeductDiscounts(ShoppingCart cart, CancellationToken cancellationToken)
    {
        foreach (var item in cart.Items)
        {
            var coupon = await discountProtoServiceClient.GetDiscountAsync(
                new GetDiscountRequest { ProductName = item.ProductName },
                cancellationToken: cancellationToken
            );

            if (decimal.TryParse(coupon.Amount?.Trim(), System.Globalization.NumberStyles.AllowDecimalPoint,
                    System.Globalization.CultureInfo.InvariantCulture, out var discountAmount))
                item.Price -= discountAmount;
            else
                throw new InvalidOperationException(
                    $"Invalid discount amount for product {item.ProductName}: {coupon.Amount}");
        }
    }
}