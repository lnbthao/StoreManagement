namespace StoreManagement.Shared.DTOs;

/// <summary>
/// Order filter criteria
/// </summary>
public class OrderFilterDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? UserId { get; set; }
    public int? PromoId { get; set; }
    public string? Status { get; set; } // pending, paid, canceled
    public int? CategoryId { get; set; }
}
