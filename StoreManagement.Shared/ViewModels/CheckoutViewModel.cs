namespace StoreManagement.Shared.ViewModels;

/// <summary>
/// View model for checkout/order creation
/// </summary>
public class CheckoutViewModel
{
    public List<CartItem> CartItems { get; set; } = new();
    public int? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public int? PromoId { get; set; }
    public string? PromoCode { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = "cash";
    public decimal? CashReceived { get; set; }
    public decimal? Change { get; set; }
}

/// <summary>
/// Cart item for checkout
/// </summary>
public class CartItem
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public string? Unit { get; set; }
    public decimal TotalPrice => UnitPrice * Quantity;
}
