namespace StoreManagement.Shared.DTOs;

/// <summary>
/// Customer filter criteria
/// </summary>
public class CustomerFilterDto
{
    public string? HasPhone { get; set; }
    public string? HasEmail { get; set; }
    public string? HasAddress { get; set; }
    public string Status { get; set; } = string.Empty; // empty, active, inactive
    public DateTime? CreatedFrom { get; set; }
    public DateTime? CreatedTo { get; set; }
}
