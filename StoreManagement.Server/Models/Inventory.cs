using System;
using System.Collections.Generic;

namespace StoreManagement.Server.Models;

public partial class Inventory
{
    public int InventoryId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; } = 0;

    public DateTime? UpdatedAt { get; set; }

    public virtual Product Product { get; set; } = null!;
}