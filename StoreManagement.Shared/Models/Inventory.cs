namespace StoreManagement.Shared.Models;

/// <summary>
/// Inventory model matching the backend entity
/// </summary>
public class Inventory
{
    public int InventoryId { get; set; }
    public int? ProductId { get; set; }
    public int Quantity { get; set; }
    public DateTime? LastUpdated { get; set; }

    // Navigation properties
    public string? ProductName { get; set; }
}
