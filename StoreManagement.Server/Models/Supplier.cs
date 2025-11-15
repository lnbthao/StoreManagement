using System;
using System.Collections.Generic;

namespace StoreManagement.Server.Models;

public partial class Supplier
{
    public int SupplierId { get; set; }

    public string SupplierName { get; set; } = null!;

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Address { get; set; }

    public bool IsActive { get; set; } = true; // ← Sửa từ bool? thành bool

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
