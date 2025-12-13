namespace StoreManagement.Shared.Enums;

/// <summary>
/// Order status enumeration
/// </summary>
public enum OrderStatus
{
    Pending,
    Paid,
    Canceled
}

/// <summary>
/// Extension methods for OrderStatus
/// </summary>
public static class OrderStatusExtensions
{
    public static string ToDisplayString(this OrderStatus status)
    {
        return status switch
        {
            OrderStatus.Pending => "Chờ thanh toán",
            OrderStatus.Paid => "Đã thanh toán",
            OrderStatus.Canceled => "Đã hủy",
            _ => status.ToString()
        };
    }

    public static string ToApiString(this OrderStatus status)
    {
        return status.ToString().ToLower();
    }

    public static OrderStatus FromString(string status)
    {
        return status?.ToLower() switch
        {
            "pending" => OrderStatus.Pending,
            "paid" => OrderStatus.Paid,
            "canceled" or "cancelled" => OrderStatus.Canceled,
            _ => OrderStatus.Pending
        };
    }

    public static string GetBadgeClass(this OrderStatus status)
    {
        return status switch
        {
            OrderStatus.Pending => "warning",
            OrderStatus.Paid => "success",
            OrderStatus.Canceled => "danger",
            _ => "secondary"
        };
    }
}
