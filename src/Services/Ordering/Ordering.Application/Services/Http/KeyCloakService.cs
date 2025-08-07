using BuildingBlocks.Http;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace Ordering.Application.Services.Http;

public interface IKeyCloakService
{
    public Task<AuthUserDto?> GetUserInfo(string userId);
    public Task<AuthUserDto?> GetUserInfoAdmin(string userId);
    public Task<List<AuthUserDto>> GetUsersByQuery(string query);
}

public class KeyCloakService(HttpClient httpClient, IHttpContextAccessor httpContext, IConfiguration configuration)
    : BaseHttpService(httpClient), IKeyCloakService
{
    private string? _cachedAdminToken;
    private DateTime _tokenExpiry = DateTime.MinValue;
    private readonly HttpClient _httpClient = httpClient;

    public async Task<AuthUserDto?> GetUserInfo(string userId)
    {
        var keycloakRealm = configuration["Services:Keycloak:Realm"];
        if (string.IsNullOrEmpty(keycloakRealm))
            throw new ArgumentException("Keycloak Realm is not configured.");

        var keycloakUserInfoUrl =
            $"{configuration["Services:Keycloak:UserInfoEndpoint"]?.Replace("{{REALM}}", keycloakRealm)}";
        if (string.IsNullOrEmpty(keycloakUserInfoUrl))
            throw new ArgumentException("Keycloak UserInfoEndpoint is not configured.");

        var response = await DoGet($"{keycloakUserInfoUrl}/{userId}",
            httpContext.HttpContext?.Request.Headers.Authorization.ToString() ?? string.Empty);

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"Failed to get user info from Keycloak: {response.ReasonPhrase}");
        }

        return null;
    }

    public async Task<AuthUserDto?> GetUserInfoAdmin(string userId)
    {
        var adminToken = await GetAdminAccessTokenAsync();
        var keycloakRealm = configuration["Services:Keycloak:Realm"];
        var keycloakAdminUrl = configuration["Services:Keycloak:AdminUrl"];

        var adminUserInfoUrl = $"{keycloakAdminUrl}/admin/realms/{keycloakRealm}/users/{userId}";

        var response = await DoGet(adminUserInfoUrl, $"Bearer {adminToken}");

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"Failed to get user info from Keycloak Admin API: {response.ReasonPhrase}");
        }

        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<AuthUserDto>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }

    public async Task<List<AuthUserDto>> GetUsersByQuery(string query)
    {
        var adminToken = await GetAdminAccessTokenAsync();
        var keycloakRealm = configuration["Services:Keycloak:Realm"];
        var keycloakAdminUrl = configuration["Services:Keycloak:AdminUrl"];

        // Query users by username, email, firstName, or lastName
        var queryParams = $"search={Uri.EscapeDataString(query)}&max=100";
        var usersUrl = $"{keycloakAdminUrl}/admin/realms/{keycloakRealm}/users?{queryParams}";

        var response = await DoGet(usersUrl, $"Bearer {adminToken}");

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"Failed to query users from Keycloak Admin API: {response.ReasonPhrase}");
        }

        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<List<AuthUserDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        }) ?? [];
    }

    private async Task<string?> GetAdminAccessTokenAsync()
    {
        if (!string.IsNullOrEmpty(_cachedAdminToken) && DateTime.UtcNow < _tokenExpiry)
            return _cachedAdminToken;

        var keycloakRealm = configuration["Services:Keycloak:Realm"];
        var keycloakUrl = configuration["Services:Keycloak:BaseUrl"];
        var clientId = configuration["Services:Keycloak:AdminClientId"];
        var clientSecret = configuration["Services:Keycloak:AdminClientSecret"];

        var tokenEndpoint = $"{keycloakUrl}/realms/{keycloakRealm}/protocol/openid-connect/token";

        var requestBody = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("grant_type", "client_credentials"),
            new KeyValuePair<string, string>("client_id", clientId ?? throw new ArgumentException("Client ID is not configured.")),
            new KeyValuePair<string, string>("client_secret", clientSecret ?? throw new ArgumentException("Client Secret is not configured."))
        ]);

        var response = await _httpClient.PostAsync(tokenEndpoint, requestBody);
        var responseContent = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException(
                $"Failed to get admin access token: {response.StatusCode} - {responseContent}");
        }

        var tokenResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
        _cachedAdminToken = tokenResponse.GetProperty("access_token").GetString();

        // Set expiry time (subtract 30 seconds for safety)
        var expiresIn = tokenResponse.GetProperty("expires_in").GetInt32();
        _tokenExpiry = DateTime.UtcNow.AddSeconds(expiresIn - 30);

        return _cachedAdminToken;
    }
}