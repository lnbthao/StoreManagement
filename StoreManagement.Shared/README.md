# StoreManagement.Shared

This project contains shared models, DTOs, enums, helpers, and constants used across the Blazor WebAssembly client and .NET API server.

## Project Structure

```
StoreManagement.Shared/
├── Models/                 # Domain models matching backend entities
│   ├── Category.cs
│   ├── Customer.cs
│   ├── Inventory.cs
│   ├── Order.cs
│   ├── OrderItem.cs
│   ├── Payment.cs
│   ├── Product.cs
│   ├── Promotion.cs
│   ├── Supplier.cs
│   └── User.cs
├── DTOs/                   # Data Transfer Objects for API communication
│   ├── CustomerFilterDto.cs
│   ├── InventoryDto.cs
│   ├── LoginRequestDto.cs
│   ├── LoginResponseDto.cs
│   ├── OrderDto.cs
│   ├── OrderFilterDto.cs
│   ├── PaymentDto.cs
│   ├── ProductDto.cs
│   ├── ProductFilterDto.cs
│   └── UserFilterDto.cs
├── ViewModels/            # Complex view models for UI
│   ├── CheckoutViewModel.cs
│   ├── DashboardViewModel.cs
│   ├── OrderDetailViewModel.cs
│   └── ProductDetailViewModel.cs
├── Enums/                 # Enumerations with extension methods
│   ├── DiscountType.cs
│   ├── OrderStatus.cs
│   ├── PaymentMethod.cs
│   └── UserRole.cs
├── Helpers/               # Utility classes
│   └── FormatHelper.cs
└── Constants/             # Application constants
    └── AppConstants.cs
```

## Usage

### 1. Models
Domain entities that match your database structure. Include navigation properties for related data.

```csharp
using StoreManagement.Shared.Models;

var product = new Product
{
    ProductName = "Sample Product",
    Price = 100000,
    CategoryId = 1
};
```

### 2. DTOs
Used for API requests and responses. Lighter than full models.

```csharp
using StoreManagement.Shared.DTOs;

var loginRequest = new LoginRequestDto
{
    Username = "admin",
    Password = "password123"
};

var productFilter = new ProductFilterDto
{
    Category = "Electronics",
    Status = "active"
};
```

### 3. ViewModels
Complex objects for UI rendering with aggregated data.

```csharp
using StoreManagement.Shared.ViewModels;

var checkout = new CheckoutViewModel
{
    CartItems = cartItems,
    CustomerId = 1,
    PaymentMethod = "cash"
};
```

### 4. Enums
Type-safe enumerations with helpful extension methods.

```csharp
using StoreManagement.Shared.Enums;

var status = OrderStatus.Pending;
string display = status.ToDisplayString(); // "Chờ thanh toán"
string api = status.ToApiString();        // "pending"
string badge = status.GetBadgeClass();    // "warning"

var role = UserRole.Admin;
string roleDisplay = role.ToDisplayString(); // "Quản trị viên"
```

### 5. Helpers
Utility methods for common operations.

```csharp
using StoreManagement.Shared.Helpers;

// Vietnamese number formatting
string formatted = FormatHelper.ToVNNumber(1000000);    // "1.000.000"
string price = FormatHelper.ToVNPrice(50000);           // "50.000 đ"
string date = FormatHelper.ToVNDate(DateTime.Now);      // "02/12/2025"
string phone = FormatHelper.SplitPhoneNumber("0123456789"); // "0123 456 789"

// Parsing
decimal number = FormatHelper.ParseVNNumber("1.000.000"); // 1000000
```

### 6. Constants
Application-wide constants for consistency.

```csharp
using StoreManagement.Shared.Constants;

string apiUrl = ApiEndpoints.Products;
int pageSize = AppConstants.DefaultPageSize;
string tokenKey = StorageKeys.AuthToken;
```

## Integration with Blazor

### In Blazor Client Project (.csproj)

Add reference to the shared project:

```xml
<ItemGroup>
  <ProjectReference Include="..\StoreManagement.Shared\StoreManagement.Shared.csproj" />
</ItemGroup>
```

### In Razor Components

```razor
@using StoreManagement.Shared.Models
@using StoreManagement.Shared.DTOs
@using StoreManagement.Shared.Helpers
@using StoreManagement.Shared.Enums

<MudText>@FormatHelper.ToVNPrice(product.Price)</MudText>
<MudChip Color="Color.Success">@OrderStatus.Paid.ToDisplayString()</MudChip>
```

### In Code-Behind or Services

```csharp
using StoreManagement.Shared.Models;
using StoreManagement.Shared.DTOs;
using StoreManagement.Shared.Helpers;

public class ProductService
{
    private readonly HttpClient _httpClient;
    
    public async Task<List<Product>> GetProductsAsync(ProductFilterDto filter)
    {
        var response = await _httpClient.PostAsJsonAsync("/api/product/filter", filter);
        return await response.Content.ReadFromJsonAsync<List<Product>>();
    }
}
```

## Benefits

1. **Type Safety**: Strong typing across client and server
2. **Code Reuse**: Single source of truth for models and DTOs
3. **Maintainability**: Changes in one place reflect everywhere
4. **IntelliSense**: Full IDE support in both projects
5. **Consistency**: Same validation and business logic
6. **Vietnamese Localization**: Built-in formatting helpers for VN locale

## Notes

- All models use nullable reference types (`string?`) for optional fields
- DateTime fields use nullable `DateTime?` for consistency with backend
- Enums include extension methods for display and conversion
- Format helpers support Vietnamese number and currency formatting
- Constants provide single source of truth for API endpoints and keys
