namespace StoreManagement.Shared.ViewModels;

/// <summary>
/// Order detail view model with full information
/// </summary>
public class OrderDetailViewModel
{
    public int OrderId { get; set; }
    public DateTime OrderDate { get; set; }
    public string Status { get; set; } = null!;
    
    public int? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }
    
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    
    public int? PromoId { get; set; }
    public string? PromoCode { get; set; }
    public decimal? DiscountAmount { get; set; }
    
    public decimal? TotalAmount { get; set; }
    
    public List<OrderItemDetail> OrderItems { get; set; } = new();
    public List<PaymentDetail> Payments { get; set; } = new();
}

public class OrderItemDetail
{
    public int OrderItemId { get; set; }
    public int? ProductId { get; set; }
    public string? ProductName { get; set; }
    public string? ProductImageUrl { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string? Unit { get; set; }
}

public class PaymentDetail
{
    public int PaymentId { get; set; }
    public string PaymentMethod { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? Status { get; set; }
}
