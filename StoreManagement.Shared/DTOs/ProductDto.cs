namespace StoreManagement.Shared.DTOs;

/// <summary>
/// Create/Update Product DTO
/// </summary>
public class ProductDto
{
    public int? ProductId { get; set; }
    public int? CategoryId { get; set; }
    public int? SupplierId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public string? Barcode { get; set; }
    public decimal Price { get; set; }
    public string? Unit { get; set; }
    public bool IsActive { get; set; } = true;
}
