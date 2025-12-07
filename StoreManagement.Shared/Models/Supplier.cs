namespace StoreManagement.Shared.Models;

/// <summary>
/// Supplier model matching the backend entity
/// </summary>
public class Supplier
{
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = null!;
    public string? ContactName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;
}
