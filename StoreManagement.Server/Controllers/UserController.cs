using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;

namespace StoreManagement.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly StoreManagementContext _context;

        public UserController(StoreManagementContext context)
        {
            _context = context;
        }

        // POST: api/User/login
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Username và password không được để trống!" });
            }

            // Tìm user theo username
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null)
            {
                return Unauthorized(new { message = "Tên đăng nhập không tồn tại!" });
            }

            // Kiểm tra password (trong thực tế nên dùng hash password)
            // TODO: Implement password hashing (BCrypt, Argon2, etc.)
            if (user.Password != request.Password)
            {
                return Unauthorized(new { message = "Mật khẩu không đúng!" });
            }

            // Trả về thông tin user (không bao gồm password)
            var response = new LoginResponse
            {
                UserId = user.UserId,
                Username = user.Username,
                FullName = user.FullName ?? "Unknown User",
                Role = user.Role ?? "user",
                Message = "Đăng nhập thành công!"
            };

            return Ok(response);
        }

        // GET: api/User
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var users = await _context.Users.ToListAsync();
            
            // Không trả về password
            var safeUsers = users.Select(u => new
            {
                u.UserId,
                u.Username,
                u.FullName,
                u.Role,
                u.CreatedAt
            });
            
            return Ok(safeUsers);
        }

        // GET: api/User/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            // Không trả về password
            return Ok(new
            {
                user.UserId,
                user.Username,
                user.FullName,
                user.Role,
                user.CreatedAt
            });
        }

        // POST: api/User
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            // TODO: Hash password trước khi lưu
            user.CreatedAt = DateTime.Now;
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, new
            {
                user.UserId,
                user.Username,
                user.FullName,
                user.Role,
                user.CreatedAt
            });
        }

        // PUT: api/User/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User user)
        {
            if (id != user.UserId)
            {
                return BadRequest();
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/User/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.UserId == id);
        }
    }

    // DTOs for Login
    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
