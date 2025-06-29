namespace Ordering.Domain.ValueObjects;

public record Payment
{
    private const int MaxCardNumberLength = 19;
    public string CardNumber { get; init; } = default!;
    public string CardName { get; init; } = default!;
    public string Expiration { get; init; } = default!;
    public string Cvv { get; init; } = default!;
    public int PaymentMethod { get; set; } = default!;

    protected Payment()
    {
    }

    private Payment(string cardNumber, string cardName, string expiration, string cvv, int paymentMethod)
    {
        CardNumber = cardNumber;
        CardName = cardName;
        Expiration = expiration;
        Cvv = cvv;
        PaymentMethod = paymentMethod;
    }

    public static Payment Of(string cardNumber, string cardName, string expiration, string cvv, int paymentMethod)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(cardNumber, "Card number cannot be empty.");
        ArgumentException.ThrowIfNullOrWhiteSpace(cardName, "Card name cannot be empty.");
        ArgumentException.ThrowIfNullOrWhiteSpace(expiration, "Expiration date cannot be empty.");
        ArgumentOutOfRangeException.ThrowIfGreaterThan(cvv.Length, 3, "CVV must be 3 digits long.");

        return new Payment(cardNumber, cardName, expiration, cvv, paymentMethod);
    }
}