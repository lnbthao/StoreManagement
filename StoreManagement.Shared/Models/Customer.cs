namespace StoreManagement.Shared.Models;

/// <summary>
/// Customer model matching the backend entity
/// </summary>
public class Customer
{
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public DateTime? CreatedAt { get; set; }
    public bool IsActive { get; set; } = true;
}
