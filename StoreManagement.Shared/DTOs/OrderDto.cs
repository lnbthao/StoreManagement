namespace StoreManagement.Shared.DTOs;

/// <summary>
/// Create/Update Order DTO
/// </summary>
public class OrderDto
{
    public int? OrderId { get; set; }
    public int? CustomerId { get; set; }
    public int? UserId { get; set; }
    public int? PromoId { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.Now;
    public string Status { get; set; } = "pending";
    public decimal? TotalAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public List<OrderItemDto>? OrderItems { get; set; }
}

/// <summary>
/// Order item for create/update
/// </summary>
public class OrderItemDto
{
    public int? ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
