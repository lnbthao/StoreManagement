using System.Security.Claims;
using BCrypt.Net;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;

namespace StoreManagement.Server.Controllers;

[ApiController]
[Route("/api/[controller]")]
public class UserController : Controller
{
    private readonly StoreManagementContext _db;
    private readonly IConfiguration _config;

    public UserController(StoreManagementContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public record LoginRequest(string Username, string Password);

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        /*
         Không cần kiểm tra khoảng trắng, do bên frontend đảm trách rồi.
         Ở đây chỉ kiểm tra thông tin đăng nhập thôi.
        */
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user is null || !user.IsActive)
            return Unauthorized(new { message = "Tài khoản không tồn tại hoặc bị khóa!", input = "username" });

        // Chỗ này username đúng rồi, chỉ cần check password
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            return Unauthorized(new { message = "Sai mật khẩu!", input = "password" });

        // Generate Jwt Token và trả về
        var token = GenerateJwtToken(user);
        return Ok(new { token, user = new { user.UserId, user.Username, user.FullName, user.Role } });
    }

    [HttpGet]
    // [Authorize]
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
    // [Authorize]
    public async Task<IActionResult> GetUserById(int id)
    {
        var u = await _db.Users.FirstOrDefaultAsync(x => x.UserId == id);
        if (u is null) return NotFound();
        return Ok(new { u.UserId, u.Username, u.FullName, u.Role, u.CreatedAt, u.IsActive });
    }

    [HttpPost]
    // [Authorize]
    public async Task<IActionResult> CreateUser([FromBody] User u)
    {
        if (string.IsNullOrWhiteSpace(u.Username) || string.IsNullOrWhiteSpace(u.Password))
            return BadRequest(new { message = "Thiếu username hoặc password" });

        if (await _db.Users.AnyAsync(x => x.Username == u.Username))
            return Conflict(new { message = "Username đã tồn tại" });

        u.Password = BCrypt.Net.BCrypt.HashPassword(u.Password);
        u.IsActive = true;
        _db.Users.Add(u);
        return await _db.SaveChangesAsync() > 0 ? StatusCode(201) : StatusCode(400);
    }

    [HttpPut("{id}")]
    // [Authorize]
    public async Task<IActionResult> UpdateUser([FromBody] User u, int id)
    {
        var user = await _db.Users.FirstOrDefaultAsync(x => x.UserId == id);
        if (user is null) return NotFound();

        user.FullName = u.FullName;
        user.Role = u.Role;
        if (!string.IsNullOrWhiteSpace(u.Password))
        {
            user.Password = BCrypt.Net.BCrypt.HashPassword(u.Password);
        }

        _db.Users.Update(user);
        return await _db.SaveChangesAsync() > 0 ? Ok() : StatusCode(400);
    }

    [HttpDelete("{id}")]
    // [Authorize]
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
