namespace StoreManagement.Shared.Enums;

/// <summary>
/// Promotion discount type enumeration
/// </summary>
public enum DiscountType
{
    Percent,
    Amount
}

/// <summary>
/// Extension methods for DiscountType
/// </summary>
public static class DiscountTypeExtensions
{
    public static string ToApiString(this DiscountType type)
    {
        return type.ToString().ToLower();
    }

    public static DiscountType FromString(string type)
    {
        return type?.ToLower() switch
        {
            "percent" => DiscountType.Percent,
            "amount" => DiscountType.Amount,
            _ => DiscountType.Amount
        };
    }

    public static string FormatValue(this DiscountType type, decimal value)
    {
        return type switch
        {
            DiscountType.Percent => $"{value}%",
            DiscountType.Amount => Helpers.FormatHelper.ToVNPrice(value),
            _ => value.ToString()
        };
    }
}
