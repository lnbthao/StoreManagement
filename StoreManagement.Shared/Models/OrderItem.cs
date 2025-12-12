namespace StoreManagement.Shared.Models;

/// <summary>
/// OrderItem model matching the backend entity
/// </summary>
public class OrderItem
{
    public int OrderItemId { get; set; }
    public int? OrderId { get; set; }
    public int? ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal? TotalPrice { get; set; }

    // Navigation properties
    public string? ProductName { get; set; }
    public string? ProductImageUrl { get; set; }
    public string? Unit { get; set; }
}
