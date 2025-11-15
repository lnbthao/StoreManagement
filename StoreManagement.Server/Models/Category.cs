using System;
using System.Collections.Generic;

namespace StoreManagement.Server.Models;

public partial class Category
{
    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = null!;

    public bool IsActive { get; set; } = true; // ← Sửa từ bool? thành bool

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
