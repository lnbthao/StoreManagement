using System.Security.Claims;
using BCrypt.Net;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;
using StoreManagement.Shared.DTOs;

namespace StoreManagement.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class UserController : Controller
{
    private readonly StoreManagementContext _db;
    private readonly IConfiguration _config;

    public UserController(StoreManagementContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        /*
         Không cần kiểm tra khoảng trắng, do bên frontend đảm trách rồi.
         Ở đây chỉ kiểm tra thông tin đăng nhập thôi.
        */
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user is null)
            return Ok(new LoginResponseDto 
            { 
                Success = false, 
                Message = "Tài khoản không tồn tại!" 
            });

        if (!user.IsActive)
            return Ok(new LoginResponseDto 
            { 
                Success = false, 
                Message = "Tài khoản đã bị khóa!" 
            });

        // Chỗ này username đúng rồi, chỉ cần check password
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            return Ok(new LoginResponseDto 
            { 
                Success = false, 
                Message = "Sai mật khẩu!" 
            });

        // Generate Jwt Token và trả về
        var token = GenerateJwtToken(user);
        
        return Ok(new LoginResponseDto 
        { 
            Success = true,
            Message = "Đăng nhập thành công",
            Token = token,
            User = new UserInfoDto
            {
                UserId = user.UserId,
                Username = user.Username,
                FullName = user.FullName,
                Role = user.Role
            }
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? name, 
        [FromQuery] string? role,
        [FromQuery] DateTime? createdFrom,
        [FromQuery] DateTime? createdTo,
        [FromQuery] bool includeInactive = false)
    {
        var query = _db.Users.AsQueryable();
        
        if (!includeInactive)
            query = query.Where(u => u.IsActive);
            
        if (!string.IsNullOrWhiteSpace(name))
        {
            query = query.Where(u => EF.Functions.Like(u.Username, $"%{name}%") || EF.Functions.Like(u.FullName, $"%{name}%"));
        }
        
        if (!string.IsNullOrWhiteSpace(role))
        {
            query = query.Where(u => u.Role == role);
        }
        
        if (createdFrom.HasValue)
        {
            query = query.Where(u => u.CreatedAt >= createdFrom.Value);
        }
        
        if (createdTo.HasValue)
        {
            var endDate = createdTo.Value.Date.AddDays(1);
            query = query.Where(u => u.CreatedAt < endDate);
        }
        
        var list = await query
            .Select(u => new
            {
                u.UserId,
                u.Username,
                u.FullName,
                u.Role,
                u.CreatedAt,
                u.IsActive
            })
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var u = await _db.Users.FirstOrDefaultAsync(x => x.UserId == id);
        if (u is null) return NotFound();
        return Ok(new { u.UserId, u.Username, u.FullName, u.Role, u.CreatedAt, u.IsActive });
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] User u)
    {
        if (string.IsNullOrWhiteSpace(u.FullName))
            return BadRequest(new { field = "fullName", message = "Vui lòng nhập họ tên" });
        if (string.IsNullOrWhiteSpace(u.Username))
            return BadRequest(new { field = "username", message = "Vui lòng nhập username" });
        if (string.IsNullOrWhiteSpace(u.Password))
            return BadRequest(new { field = "password", message = "Vui lòng nhập mật khẩu" });

        if (await _db.Users.AnyAsync(x => x.Username == u.Username))
            return Conflict(new { field = "username", message = "Username đã tồn tại" });

        u.Password = BCrypt.Net.BCrypt.HashPassword(u.Password);
        u.IsActive = true;
        _db.Users.Add(u);
        return await _db.SaveChangesAsync() > 0
            ? StatusCode(201)
            : StatusCode(400, new { field = (string?)null, message = "Không thể tạo người dùng" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser([FromBody] User u, int id)
    {
        var user = await _db.Users.FirstOrDefaultAsync(x => x.UserId == id);
        if (user is null) return NotFound();

        if (string.IsNullOrWhiteSpace(u.FullName))
            return BadRequest(new { field = "fullName", message = "Vui lòng nhập họ tên" });

        user.FullName = u.FullName;
        user.Role = u.Role;
        user.IsActive = u.IsActive;

        if (!string.IsNullOrWhiteSpace(u.Password))
        {
            if (u.Password.Length < 6)
                return BadRequest(new { field = "password", message = "Mật khẩu tối thiểu 6 ký tự" });
            user.Password = BCrypt.Net.BCrypt.HashPassword(u.Password);
        }

        _db.Users.Update(user);
        return await _db.SaveChangesAsync() > 0
            ? Ok()
            : StatusCode(400, new { field = (string?)null, message = "Không thể cập nhật người dùng" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound();

        user.IsActive = !user.IsActive;
        return await _db.SaveChangesAsync() > 0 ? Ok() : StatusCode(400);
    }

    private string GenerateJwtToken(User user)
    {
        var jwtKey = _config["Jwt:Key"] ?? "dev-secret-please-change";
        var issuer = _config["Jwt:Issuer"] ?? "StoreManagement";
        var audience = _config["Jwt:Audience"] ?? "StoreManagementClients";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Username),
            new Claim("uid", user.UserId.ToString()),
            new Claim(ClaimTypes.Role, user.Role ?? "staff")
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(4),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
