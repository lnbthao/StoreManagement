using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;
using Microsoft.AspNetCore.Authorization;

namespace StoreManagement.Server.Controllers;

[ApiController]
[Route("/api/[controller]")]
public class CustomerController : Controller
{
    private readonly StoreManagementContext _db;

    public CustomerController(StoreManagementContext db)
    {
        _db = db;
    }

    [HttpGet]
    // [Authorize]
    public async Task<IActionResult> GetCustomers(
        [FromQuery] string? name,
        [FromQuery] string? phone,
        [FromQuery] string? hasPhone,
        [FromQuery] string? hasEmail,
        [FromQuery] string? hasAddress,
        [FromQuery] DateTime? createdFrom,
        [FromQuery] DateTime? createdTo,
        [FromQuery] bool includeInactive = false)
    {
        var query = _db.Customers.AsQueryable();
        
        if (!includeInactive) 
            query = query.Where(c => c.IsActive);
        
        // Tìm theo số điện thoại chính xác
        if (!string.IsNullOrWhiteSpace(phone))
        {
            query = query.Where(c => c.Phone == phone);
        }
        // Tìm theo tên/địa chỉ/email
        else if (!string.IsNullOrWhiteSpace(name))
        {
            string pattern = $"%{name}%";
            query = query.Where(c => 
                EF.Functions.Like(c.CustomerName, pattern) || 
                EF.Functions.Like(c.Address, pattern) || 
                EF.Functions.Like(c.Email, pattern) || 
                EF.Functions.Like(c.Phone, pattern)
            );
        }
            
        if (!string.IsNullOrWhiteSpace(hasPhone))
        {
            if (hasPhone == "true")
                query = query.Where(c => !string.IsNullOrEmpty(c.Phone));
            else if (hasPhone == "false")
                query = query.Where(c => string.IsNullOrEmpty(c.Phone));
        }
        
        if (!string.IsNullOrWhiteSpace(hasEmail))
        {
            if (hasEmail == "true")
                query = query.Where(c => !string.IsNullOrEmpty(c.Email));
            else if (hasEmail == "false")
                query = query.Where(c => string.IsNullOrEmpty(c.Email));
        }
        
        if (!string.IsNullOrWhiteSpace(hasAddress))
        {
            if (hasAddress == "true")
                query = query.Where(c => !string.IsNullOrEmpty(c.Address));
            else if (hasAddress == "false")
                query = query.Where(c => string.IsNullOrEmpty(c.Address));
        }
        
        if (createdFrom.HasValue)
        {
            query = query.Where(c => c.CreatedAt >= createdFrom.Value);
        }
        
        if (createdTo.HasValue)
        {
            var endDate = createdTo.Value.Date.AddDays(1);
            query = query.Where(c => c.CreatedAt < endDate);
        }
        
        var list = await query.ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    // [Authorize]
    public async Task<IActionResult> GetCustomerById(int id)
    {
        var cus = await _db.Customers.FirstOrDefaultAsync(c => c.CustomerId == id);
        return cus is null ? NotFound() : Ok(cus);
    }

    [HttpGet("phone/{phone}")]
    public async Task<IActionResult> SearchCustomer(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
        {
            return BadRequest(new { field = "phone", message = "Vui lòng nhập số điện thoại." });
        }

        if (!System.Text.RegularExpressions.Regex.IsMatch(phone, @"^0\d{9}$"))
        {
            return BadRequest(new { field = "phone", message = "SĐT không hợp lệ" });
        }

        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Phone == phone);

        if (customer == null)
            return Ok(new
            {
                isGuest = true,
                customerId = 0,
                customerName = "Khách vãng lai"
            });

        return Ok(new
        {
            isGuest = false,
            customer.CustomerId,
            customer.CustomerName,
            customer.Phone,
            customer.Address
        });
    }

    [HttpPost]
    // [Authorize]
    public async Task<IActionResult> AddCustomer([FromBody] Customer c)
    {
        if (string.IsNullOrWhiteSpace(c.CustomerName))
        {
            return BadRequest(new { field = "customerName", message = "Vui lòng nhập tên khách hàng." });
        }

        if (string.IsNullOrWhiteSpace(c.Phone))
        {
            return BadRequest(new { field = "phone", message = "Vui lòng nhập số điện thoại." });
        }

        if (!System.Text.RegularExpressions.Regex.IsMatch(c.Phone, @"^0\d{9}$"))
        {
            return BadRequest(new { field = "phone", message = "SĐT không hợp lệ." });
        }

        if (await _db.Customers.AnyAsync(x => x.Phone == c.Phone))
        {
            return Conflict(new { field = "phone", message = "SĐT đã tồn tại." });
        }

        if (!string.IsNullOrWhiteSpace(c.Email) && !System.Text.RegularExpressions.Regex.IsMatch(c.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
        {
            return BadRequest(new { field = "email", message = "Email không hợp lệ." });
        }

        c.IsActive = true;
        _db.Customers.Add(c);
        return await _db.SaveChangesAsync() > 0
            ? StatusCode(201)
            : StatusCode(400, new { field = (string?)null, message = "Không thể tạo khách hàng." });
    }

    [HttpPut("{id}")]
    // [Authorize]
    public async Task<IActionResult> UpdateCustomer([FromBody] Customer c, int id)
    {
        var cus = await _db.Customers.FirstOrDefaultAsync(x => x.CustomerId == id);
        if (cus is null) return NotFound();

        if (string.IsNullOrWhiteSpace(c.CustomerName))
        {
            return BadRequest(new { field = "customerName", message = "Vui lòng nhập tên khách hàng." });
        }

        if (string.IsNullOrWhiteSpace(c.Phone))
        {
            return BadRequest(new { field = "phone", message = "Vui lòng nhập số điện thoại." });
        }

        if (!System.Text.RegularExpressions.Regex.IsMatch(c.Phone, @"^0\d{9}$"))
        {
            return BadRequest(new { field = "phone", message = "SĐT không hợp lệ." });
        }

        if (await _db.Customers.AnyAsync(x => x.Phone == c.Phone && x.CustomerId != id))
        {
            return Conflict(new { field = "phone", message = "SĐT đã tồn tại." });
        }

        if (!string.IsNullOrWhiteSpace(c.Email) && !System.Text.RegularExpressions.Regex.IsMatch(c.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
        {
            return BadRequest(new { field = "email", message = "Email không hợp lệ." });
        }

        cus.CustomerName = c.CustomerName;
        cus.Phone = c.Phone;
        cus.Email = c.Email;
        cus.Address = c.Address;
        _db.Customers.Update(cus);
        return await _db.SaveChangesAsync() > 0
            ? Ok()
            : StatusCode(400, new { field = (string?)null, message = "Không thể cập nhật khách hàng." });
    }

    [HttpDelete("{id}")]
    // [Authorize]
    public async Task<IActionResult> DeleteCustomer(int id)
    {
        var cus = await _db.Customers.FindAsync(id);
        if (cus is null) return NotFound();
        cus.IsActive = !cus.IsActive;
        return await _db.SaveChangesAsync() > 0 ? Ok() : StatusCode(400);
    }
}
