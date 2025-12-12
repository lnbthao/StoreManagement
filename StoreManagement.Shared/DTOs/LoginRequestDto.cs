namespace StoreManagement.Shared.DTOs;

/// <summary>
/// Login request DTO
/// </summary>
public class LoginRequestDto
{
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
}
