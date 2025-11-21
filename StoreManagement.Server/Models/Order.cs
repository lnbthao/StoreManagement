using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace StoreManagement.Server.Models;

public partial class Order
{
    public int OrderId { get; set; }

    public int? CustomerId { get; set; }

    public int? UserId { get; set; }

    public int? PromoId { get; set; }

    public DateTime OrderDate { get; set; }

    public string? Status { get; set; }

    public decimal? TotalAmount { get; set; }

    public decimal? DiscountAmount { get; set; }
    [JsonIgnore]
    public virtual Customer? Customer { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Promotion? Promo { get; set; }
    [JsonIgnore]
    public virtual User? User { get; set; }
}
