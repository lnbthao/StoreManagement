namespace StoreManagement.Shared.DTOs;

/// <summary>
/// Product filter criteria
/// </summary>
public class ProductFilterDto
{
    public string? Category { get; set; }
    public string Status { get; set; } = "all"; // all, active, inactive
}
