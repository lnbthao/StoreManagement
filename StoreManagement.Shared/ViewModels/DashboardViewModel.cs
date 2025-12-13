namespace StoreManagement.Shared.ViewModels;

/// <summary>
/// Dashboard statistics view model
/// </summary>
public class DashboardViewModel
{
    public decimal TodayRevenue { get; set; }
    public decimal MonthRevenue { get; set; }
    public int TodayOrders { get; set; }
    public int MonthOrders { get; set; }
    public int TotalProducts { get; set; }
    public int LowStockProducts { get; set; }
    public int TotalCustomers { get; set; }
    public int ActivePromotions { get; set; }
    
    public List<RecentOrder> RecentOrders { get; set; } = new();
    public List<TopProduct> TopProducts { get; set; } = new();
    public List<RevenueByDate> RevenueChart { get; set; } = new();
}

public class RecentOrder
{
    public int OrderId { get; set; }
    public DateTime OrderDate { get; set; }
    public string? CustomerName { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = null!;
}

public class TopProduct
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public int TotalSold { get; set; }
    public decimal Revenue { get; set; }
}

public class RevenueByDate
{
    public DateTime Date { get; set; }
    public decimal Revenue { get; set; }
    public int OrderCount { get; set; }
}
