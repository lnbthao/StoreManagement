namespace StoreManagement.Shared.Models;

/// <summary>
/// User model matching the backend entity
/// </summary>
public class User
{
    public int UserId { get; set; }
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string? Phone { get; set; }
    public string Role { get; set; } = null!; // "admin" or "staff"
    public DateTime? CreatedAt { get; set; }
    public bool IsActive { get; set; } = true;
}
