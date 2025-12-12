namespace StoreManagement.Shared.Enums;

/// <summary>
/// User role enumeration
/// </summary>
public enum UserRole
{
    Admin,
    Staff
}

/// <summary>
/// Extension methods for UserRole
/// </summary>
public static class UserRoleExtensions
{
    public static string ToDisplayString(this UserRole role)
    {
        return role switch
        {
            UserRole.Admin => "Quản trị viên",
            UserRole.Staff => "Nhân viên",
            _ => role.ToString()
        };
    }

    public static string ToApiString(this UserRole role)
    {
        return role.ToString().ToLower();
    }

    public static UserRole FromString(string role)
    {
        return role?.ToLower() switch
        {
            "admin" => UserRole.Admin,
            "staff" => UserRole.Staff,
            _ => UserRole.Staff
        };
    }
}
