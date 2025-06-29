namespace Ordering.Domain.ValueObjects;

public record OrderName
{
    private const int DefaultLength = 250;
    public string Value { get; }
    private OrderName(string value) => Value = value;

    public static OrderName Of(string value)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value,
            "OrderName cannot be null or whitespace.");;
        ArgumentOutOfRangeException.ThrowIfGreaterThan(value.Length, DefaultLength,
            $"OrderName must be exactly {DefaultLength} characters long.");

        return new OrderName(value);
    }
}