namespace StoreManagement.Shared.Constants;

/// <summary>
/// Application-wide constants
/// </summary>
public static class AppConstants
{
    public const string DefaultImagePath = "/images/avatars/default-product.png";
    public const string DefaultAvatarPath = "/images/avatars/default-avatar.png";
    
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 100;
    
    public const decimal MinPrice = 0;
    public const decimal MaxPrice = 999999999;
    
    public const int LowStockThreshold = 10;
}

/// <summary>
/// API endpoints constants
/// </summary>
public static class ApiEndpoints
{
    public const string BaseUrl = "https://localhost:7064";
    
    public const string Login = "/api/user/login";
    
    public const string Products = "/api/product";
    public const string Categories = "/api/category";
    public const string Customers = "/api/customer";
    public const string Orders = "/api/order";
    public const string Payments = "/api/payment";
    public const string Promotions = "/api/promotion";
    public const string Suppliers = "/api/supplier";
    public const string Users = "/api/user";
    public const string Inventory = "/api/inventory";
}

/// <summary>
/// Local storage keys
/// </summary>
public static class StorageKeys
{
    public const string AuthToken = "authToken";
    public const string UserInfo = "userInfo";
    public const string CartItems = "cartItems";
}
