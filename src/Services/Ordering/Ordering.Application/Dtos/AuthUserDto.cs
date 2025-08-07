namespace Ordering.Application.Dtos;

public class AuthUserDto(string id, string username, string email, string firstName, string lastName, string[] roles)
{
    public string Id { get; set; } = id;
    public string Username { get; set; } = username;
    public string Email { get; set; } = email;
    public string FirstName { get; set; } = firstName;
    public string LastName { get; set; } = lastName;
    public string[] Roles { get; set; } = roles;
    public string FullName { get; set; } = $"{firstName} {lastName}";
}