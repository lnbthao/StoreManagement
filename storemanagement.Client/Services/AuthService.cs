using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.JSInterop;
using StoreManagement.Shared.DTOs;

namespace StoreManagement.Client.Services;

public class AuthService : IAuthService
{
    private readonly HttpClient _httpClient;
    private readonly IJSRuntime _jsRuntime;
    private UserInfoDto? _currentUser;

    public AuthService(HttpClient httpClient, IJSRuntime jsRuntime)
    {
        _httpClient = httpClient;
        _jsRuntime = jsRuntime;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("/api/user/login", loginRequest);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<LoginResponseDto>();

                if (result?.Success == true && result.User != null && !string.IsNullOrEmpty(result.Token))
                {
                    // Store token and user info in localStorage
                    await _jsRuntime.InvokeVoidAsync("localStorage.setItem", "authToken", result.Token);
                    await _jsRuntime.InvokeVoidAsync("localStorage.setItem", "userInfo", JsonSerializer.Serialize(result.User));
                    
                    _currentUser = result.User;
                    
                    // Set authorization header for future requests
                    _httpClient.DefaultRequestHeaders.Authorization = 
                        new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", result.Token);

                    return result;
                }
<<<<<<< HEAD
                
                // Login failed but we have a message from backend
                return result;
            }

            // HTTP error
            return new LoginResponseDto { Success = false, Message = "Lỗi kết nối máy chủ" };
        }
        catch
        {
            return new LoginResponseDto { Success = false, Message = "Không thể kết nối đến máy chủ" };
=======
            }

            return null;
        }
        catch
        {
            return null;
>>>>>>> origin/Cuoiki-dev/thao
        }
    }

    public async Task LogoutAsync()
    {
        await _jsRuntime.InvokeVoidAsync("localStorage.removeItem", "authToken");
        await _jsRuntime.InvokeVoidAsync("localStorage.removeItem", "userInfo");
        _currentUser = null;
        _httpClient.DefaultRequestHeaders.Authorization = null;
    }

    public async Task<UserInfoDto?> GetCurrentUserAsync()
    {
        if (_currentUser != null)
            return _currentUser;

        try
        {
            var userJson = await _jsRuntime.InvokeAsync<string?>("localStorage.getItem", "userInfo");
            if (!string.IsNullOrEmpty(userJson))
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                _currentUser = JsonSerializer.Deserialize<UserInfoDto>(userJson, options);
                
                // Restore authorization header
                var token = await GetTokenAsync();
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = 
                        new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                }
            }
            return _currentUser;
        }
        catch
        {
            return null;
        }
    }

    public async Task<bool> IsAuthenticatedAsync()
    {
        var token = await GetTokenAsync();
        return !string.IsNullOrEmpty(token);
    }

    public async Task<string?> GetTokenAsync()
    {
        try
        {
            return await _jsRuntime.InvokeAsync<string?>("localStorage.getItem", "authToken");
        }
        catch
        {
            return null;
        }
    }
}
