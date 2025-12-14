using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.JSInterop;

namespace StoreManagement.Client.Services;

/// <summary>
/// Custom AuthenticationStateProvider that decodes JWT tokens from localStorage
/// and creates ClaimsPrincipal for Blazor's authorization system.
/// </summary>
public class JwtAuthenticationStateProvider : AuthenticationStateProvider
{
    private readonly IJSRuntime _jsRuntime;
    private readonly HttpClient _httpClient;

    public JwtAuthenticationStateProvider(IJSRuntime jsRuntime, HttpClient httpClient)
    {
        _jsRuntime = jsRuntime;
        _httpClient = httpClient;
    }

    public override async Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        try
        {
            var token = await _jsRuntime.InvokeAsync<string?>("localStorage.getItem", "authToken");

            if (string.IsNullOrEmpty(token))
            {
                return new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity()));
            }

            var claims = ParseClaimsFromJwt(token);
            
            // Check if token is expired
            var expClaim = claims.FirstOrDefault(c => c.Type == "exp");
            if (expClaim != null && long.TryParse(expClaim.Value, out var exp))
            {
                var expDate = DateTimeOffset.FromUnixTimeSeconds(exp).UtcDateTime;
                if (expDate < DateTime.UtcNow)
                {
                    // Token expired - clear it and return anonymous
                    await _jsRuntime.InvokeVoidAsync("localStorage.removeItem", "authToken");
                    await _jsRuntime.InvokeVoidAsync("localStorage.removeItem", "userInfo");
                    _httpClient.DefaultRequestHeaders.Authorization = null;
                    return new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity()));
                }
            }

            // Set authorization header for HTTP client
            _httpClient.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var identity = new ClaimsIdentity(claims, "jwt");
            var user = new ClaimsPrincipal(identity);

            return new AuthenticationState(user);
        }
        catch
        {
            return new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity()));
        }
    }

    /// <summary>
    /// Notifies the authentication state has changed (call after login/logout)
    /// </summary>
    public void NotifyAuthenticationStateChanged()
    {
        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
    }

    private static IEnumerable<Claim> ParseClaimsFromJwt(string jwt)
    {
        var claims = new List<Claim>();

        try
        {
            var handler = new JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(jwt);

            foreach (var claim in token.Claims)
            {
                // Map JWT claim types to .NET claim types
                var claimType = claim.Type switch
                {
                    "sub" or JwtRegisteredClaimNames.Sub => ClaimTypes.Name,
                    "role" => ClaimTypes.Role,
                    _ => claim.Type
                };

                claims.Add(new Claim(claimType, claim.Value));
            }

            // Also add the original role claim for compatibility
            var roleClaim = token.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role");
            if (roleClaim != null && !claims.Any(c => c.Type == ClaimTypes.Role))
            {
                claims.Add(new Claim(ClaimTypes.Role, roleClaim.Value));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error parsing JWT token: " + ex.Message);   
        }

        return claims;
    }
}
