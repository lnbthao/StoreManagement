using System.Globalization;

namespace StoreManagement.Shared.Helpers;

/// <summary>
/// Formatting utilities for Vietnamese locale
/// </summary>
public static class FormatHelper
{
    private static readonly CultureInfo VietnameseCulture = new CultureInfo("vi-VN");

    /// <summary>
    /// Format number with Vietnamese thousand separator (dots)
    /// Example: 1000000 -> "1.000.000"
    /// </summary>
    public static string ToVNNumber(decimal number)
    {
        return number.ToString("N0", VietnameseCulture);
    }

    /// <summary>
    /// Format number with Vietnamese thousand separator (dots)
    /// Example: 1000000 -> "1.000.000"
    /// </summary>
    public static string ToVNNumber(int number)
    {
        return number.ToString("N0", VietnameseCulture);
    }

    /// <summary>
    /// Format price with Vietnamese currency
    /// Example: 50000 -> "50.000 đ"
    /// </summary>
    public static string ToVNPrice(decimal price)
    {
        return $"{price.ToString("N0", VietnameseCulture)} đ";
    }

    /// <summary>
    /// Format date to DD/MM/YYYY format
    /// </summary>
    public static string ToVNDate(DateTime? date)
    {
        if (!date.HasValue) return string.Empty;
        return date.Value.ToString("dd/MM/yyyy");
    }

    /// <summary>
    /// Format date time to Vietnamese format
    /// </summary>
    public static string ToVNDateTime(DateTime? dateTime)
    {
        if (!dateTime.HasValue) return string.Empty;
        return dateTime.Value.ToString("dd/MM/yyyy HH:mm:ss", VietnameseCulture);
    }

    /// <summary>
    /// Split phone number into readable format
    /// Example: 0123456789 -> "0123 456 789"
    /// </summary>
    public static string SplitPhoneNumber(string? phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber)) return string.Empty;
        if (phoneNumber.Length < 10) return phoneNumber;

        var first = phoneNumber.Substring(0, 4);
        var second = phoneNumber.Substring(4, 3);
        var third = phoneNumber.Substring(7);

        return $"{first} {second} {third}";
    }

    /// <summary>
    /// Parse Vietnamese formatted number back to decimal
    /// Example: "1.000.000" -> 1000000
    /// </summary>
    public static decimal ParseVNNumber(string formattedNumber)
    {
        if (string.IsNullOrWhiteSpace(formattedNumber)) return 0;
        
        var cleaned = formattedNumber.Replace(".", "").Replace(",", ".");
        return decimal.TryParse(cleaned, NumberStyles.Any, CultureInfo.InvariantCulture, out var result) 
            ? result 
            : 0;
    }

    /// <summary>
    /// Format number as user types (add thousand separators)
    /// </summary>
    public static string FormatAsTyping(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;
        
        var digits = new string(input.Where(char.IsDigit).ToArray());
        if (string.IsNullOrEmpty(digits)) return string.Empty;
        
        if (decimal.TryParse(digits, out var number))
        {
            return ToVNNumber(number);
        }
        
        return digits;
    }
}
