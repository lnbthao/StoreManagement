using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace StoreManagement.Server.Models;

public partial class Customer
{
    public int CustomerId { get; set; }

    public string Name { get; set; } = null!;

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Address { get; set; }

    public DateTime? CreatedAt { get; set; }

    [JsonIgnore]
    public bool IsActive { get; set; } = true;

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
