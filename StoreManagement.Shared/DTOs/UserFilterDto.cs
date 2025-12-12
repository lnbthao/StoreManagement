namespace StoreManagement.Shared.DTOs;

/// <summary>
/// User filter criteria
/// </summary>
public class UserFilterDto
{
    public string? Role { get; set; } // admin, staff
    public string Status { get; set; } = string.Empty; // empty, active, inactive
    public string? CreatedFrom { get; set; }
    public string? CreatedTo { get; set; }
}
