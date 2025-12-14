using StoreManagement.Shared.DTOs;

namespace StoreManagement.Client.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest);
    Task LogoutAsync();
    Task<UserInfoDto?> GetCurrentUserAsync();
    Task<bool> IsAuthenticatedAsync();
    Task<string?> GetTokenAsync();
}
