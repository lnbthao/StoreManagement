namespace StoreManagement.Shared.Models;

/// <summary>
/// Order model matching the backend entity
/// </summary>
public class Order
{
    public int OrderId { get; set; }
    public int? CustomerId { get; set; }
    public int? UserId { get; set; }
    public int? PromoId { get; set; }
    public DateTime OrderDate { get; set; }
    public string? Status { get; set; }
    public decimal? TotalAmount { get; set; }
    public decimal? DiscountAmount { get; set; }

    // Navigation properties
    public string? CustomerName { get; set; }
    public string? UserName { get; set; }
    public string? PromoCode { get; set; }
    public List<OrderItem>? OrderItems { get; set; }
    public List<Payment>? Payments { get; set; }
}
