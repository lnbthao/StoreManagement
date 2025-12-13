namespace StoreManagement.Shared.Enums;

/// <summary>
/// Payment method enumeration
/// </summary>
public enum PaymentMethod
{
    Cash,
    Card,
    Momo,
    BankTransfer
}

/// <summary>
/// Extension methods for PaymentMethod
/// </summary>
public static class PaymentMethodExtensions
{
    public static string ToDisplayString(this PaymentMethod method)
    {
        return method switch
        {
            PaymentMethod.Cash => "Tiền mặt",
            PaymentMethod.Card => "Thẻ",
            PaymentMethod.Momo => "MoMo",
            PaymentMethod.BankTransfer => "Chuyển khoản",
            _ => method.ToString()
        };
    }

    public static string ToApiString(this PaymentMethod method)
    {
        return method.ToString().ToLower();
    }

    public static PaymentMethod FromString(string method)
    {
        return method?.ToLower() switch
        {
            "cash" => PaymentMethod.Cash,
            "card" => PaymentMethod.Card,
            "momo" => PaymentMethod.Momo,
            "banktransfer" or "bank_transfer" => PaymentMethod.BankTransfer,
            _ => PaymentMethod.Cash
        };
    }
}
