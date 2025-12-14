namespace StoreManagement.Shared.Models;

/// <summary>
/// Category model matching the backend entity
/// </summary>
public class Category
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}
