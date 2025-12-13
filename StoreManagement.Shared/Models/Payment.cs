namespace StoreManagement.Shared.Models;

/// <summary>
/// Payment model matching the backend entity
/// </summary>
public class Payment
{
    public int PaymentId { get; set; }
    public int? OrderId { get; set; }
    public string PaymentMethod { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? Status { get; set; }
}
