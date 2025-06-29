namespace Ordering.Domain.ValueObjects;

public record Address
{
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public string EmailAddress { get; set; } = default!;
    public string AddressLine { get; set; } = default!;
    public string Country { get; set; } = default!;
    public string State { get; set; } = default!;
    public string ZipCode { get; set; } = default!;

    protected Address()
    {
    }

    private Address(string firstName, string lastName, string emailAddress, string addressLine, string country,
        string state, string zipCode)
    {
        FirstName = firstName;
        LastName = lastName;
        EmailAddress = emailAddress;
        AddressLine = addressLine;
        Country = country;
        State = state;
        ZipCode = zipCode;
    }

    public static Address Of(string firstName, string lastName, string emailAddress, string addressLine,
        string country, string state, string zipCode)
    {
        if (string.IsNullOrWhiteSpace(emailAddress))
            throw new ArgumentException("Email address cannot be empty.", nameof(emailAddress));
        if (string.IsNullOrWhiteSpace(addressLine))
            throw new ArgumentException("Address line cannot be empty.", nameof(addressLine));

        return new Address(firstName, lastName, emailAddress, addressLine, country, state, zipCode);
    }
}