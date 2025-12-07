namespace StoreManagement.Shared.DTOs;

/// <summary>
/// Login response DTO
/// </summary>
public class LoginResponseDto
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? Token { get; set; }
    public UserInfoDto? User { get; set; }
}

/// <summary>
/// User information returned after login
/// </summary>
public class UserInfoDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Role { get; set; } = null!;
}
