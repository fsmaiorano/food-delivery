using BuildingBlocks.Http;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace Ordering.Application.Services.Http;

public interface IKeyCloakService
{
    public Task<AuthUserDto> GetUserInfo(string userId);
    public Task<AuthUserDto> GetUserInfoAdmin(string userId);
}

public class KeyCloakService(HttpClient httpClient, IHttpContextAccessor httpContext, IConfiguration configuration)
    : BaseHttpService(httpClient), IKeyCloakService
{
    public async Task<AuthUserDto> GetUserInfo(string userId)
    {
        var keycloakRealm = configuration["Services:Keycloak:Realm"];
        if (string.IsNullOrEmpty(keycloakRealm))
            throw new ArgumentException("Keycloak Realm is not configured.");

        var keycloakUserInfoUrl =
            $"{configuration["Services:Keycloak:UserInfoEndpoint"]?.Replace("{{REALM}}", keycloakRealm)}";
        if (string.IsNullOrEmpty(keycloakUserInfoUrl))
            throw new ArgumentException("Keycloak UserInfoEndpoint is not configured.");

        var response = await DoGet($"{keycloakUserInfoUrl}/{userId}",
            httpContext.HttpContext?.Request.Headers["Authorization"].ToString());

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"Failed to get user info from Keycloak: {response.ReasonPhrase}");
        }

        return null;
    }

    public async Task<AuthUserDto> GetUserInfoAdmin(string userId)
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
        // Parse and map the response to AuthUserDto
        return JsonSerializer.Deserialize<AuthUserDto>(content);
    }

    private async Task<string> GetAdminAccessTokenAsync()
    {
        var keycloakRealm = configuration["Services:Keycloak:Realm"];
        var keycloakUrl = configuration["Services:Keycloak:BaseUrl"];
        var clientId = configuration["Services:Keycloak:AdminClientId"];
        var clientSecret = configuration["Services:Keycloak:AdminClientSecret"];

        var tokenEndpoint = $"{keycloakUrl}/realms/{keycloakRealm}/protocol/openid-connect/token";

        var requestBody = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("grant_type", "client_credentials"),
            new KeyValuePair<string, string>("client_id", clientId),
            new KeyValuePair<string, string>("client_secret", clientSecret)
        });

        var response = await httpClient.PostAsync(tokenEndpoint, requestBody);
        var responseContent = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"Failed to get admin access token: {response.ReasonPhrase}");
        }

        var tokenResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
        return tokenResponse.GetProperty("access_token").GetString();
    }
}