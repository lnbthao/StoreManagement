namespace StoreManagement.Shared.DTOs;

/// <summary>
/// Payment request DTO for processing payments
/// </summary>
public class PaymentRequestDto
{
    public int OrderId { get; set; }
    public string PaymentMethod { get; set; } = null!; // "cash", "card", "momo", etc.
    public decimal Amount { get; set; }
    public decimal? CashReceived { get; set; }
}

/// <summary>
/// Payment response DTO
/// </summary>
public class PaymentResponseDto
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public decimal? Change { get; set; }
    public int? PaymentId { get; set; }
}
