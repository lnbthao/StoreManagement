namespace StoreManagement.Shared.ViewModels;

public class DashboardViewModel
{
    public DashboardOverviewDto Overview { get; set; } = new();
    public List<RevenueChartDto> RevenueData { get; set; } = new();
    public OrderStatsDto OrderStats { get; set; } = new();
    public List<TopProductDto> TopProducts { get; set; } = new();
    public List<RecentOrderDto> RecentOrders { get; set; } = new();
}

public class DashboardOverviewDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public int TotalProducts { get; set; }
    public int TotalCustomers { get; set; }
}

public class RevenueChartDto
{
    public string Date { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
}

public class OrderStatsDto
{
    public int Pending { get; set; }
    public int Paid { get; set; }
    public int Canceled { get; set; }
}

public class TopProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int TotalQuantity { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class RecentOrderDto
{
    public int OrderId { get; set; }
    public DateTime OrderDate { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
}

