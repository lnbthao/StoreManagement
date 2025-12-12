namespace StoreManagement.Shared.ViewModels;

/// <summary>
/// Product detail view model with inventory information
/// </summary>
public class ProductDetailViewModel
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public string? Barcode { get; set; }
    public decimal Price { get; set; }
    public string? Unit { get; set; }
    public bool IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
    
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    
    public int? SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public string? SupplierPhone { get; set; }
    
    public int StockQuantity { get; set; }
    public DateTime? LastStockUpdate { get; set; }
    
    public int TotalSold { get; set; }
    public decimal TotalRevenue { get; set; }
}
