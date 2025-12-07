namespace StoreManagement.Shared.Models;

/// <summary>
/// Promotion model matching the backend entity
/// </summary>
public class Promotion
{
    public int PromoId { get; set; }
    public string PromoCode { get; set; } = null!;
    public string? Description { get; set; }
    public string DiscountType { get; set; } = null!; // "percent" or "amount"
    public decimal DiscountValue { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? MinPurchase { get; set; }
    public int? UsageLimit { get; set; }
    public string? Status { get; set; } // "active" or "inactive"
}
