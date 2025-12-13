namespace StoreManagement.Shared.DTOs;

/// <summary>
/// Inventory update DTO
/// </summary>
public class InventoryUpdateDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string Operation { get; set; } = "set"; // "set", "add", "subtract"
}
