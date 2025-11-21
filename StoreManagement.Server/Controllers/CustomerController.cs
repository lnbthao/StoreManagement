using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;
using Microsoft.AspNetCore.Authorization;

namespace StoreManagement.Server.Controllers;

[ApiController]
[Route("/api/[controller]")]
public class CustomerController : Controller
{
    private readonly ILogger<CustomerController> _logger;
    private readonly StoreManagementContext _dbContext;

    public CustomerController(ILogger<CustomerController> logger, StoreManagementContext dbContext)
    {
        _logger = logger;
        _dbContext = dbContext;
    }

    // 🔍 Tìm theo số điện thoại
    // /api/customer/search?phone=0901234567
    [HttpGet("search")]
    public async Task<IActionResult> SearchCustomer([FromQuery] string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
        {
            return BadRequest(new { message = "Vui lòng nhập số điện thoại." });
        }

        var customer = await _dbContext.Customers
            .FirstOrDefaultAsync(c => c.Phone == phone);

        if (customer == null)
        {
            return Ok(new
            {
                isGuest = true,
                customerId = 1,
                customerName = "Khách vãng lai",
                phone = "",
                address = ""
            });
        }

        return Ok(new
        {
            isGuest = false,
            customer.CustomerId,
            customer.Name,
            customer.Phone,
            customer.Address
        });
    }

    [HttpGet]
    // [Authorize]
    public async Task<IActionResult> GetCustomers(
        [FromQuery] string? name, 
        [FromQuery] string? hasPhone,
        [FromQuery] string? hasEmail,
        [FromQuery] string? hasAddress,
        [FromQuery] DateTime? createdFrom,
        [FromQuery] DateTime? createdTo,
        [FromQuery] bool includeInactive = false)
    {
        var query = _dbContext.Customers.AsQueryable();
        
        if (!includeInactive) 
            query = query.Where(c => c.IsActive);
            
        if (!string.IsNullOrWhiteSpace(name))
        {
            string pattern = $"%{name}%";
            query = query.Where(c => 
                EF.Functions.Like(c.Name, pattern) || 
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

    [HttpGet("{id}")]
    // [Authorize]
    public async Task<IActionResult> GetCustomerById(int id)
    {
        var cus = await _dbContext.Customers.FirstOrDefaultAsync(c => c.CustomerId == id);
        return cus is null ? NotFound() : Ok(cus);
    }

    [HttpPost]
    // [Authorize]
    public async Task<IActionResult> AddCustomer([FromBody] Customer c)
    {
        c.IsActive = true;
        _dbContext.Customers.Add(c);
        return await _dbContext.SaveChangesAsync() > 0 ? StatusCode(201) : StatusCode(400);
    }

    [HttpPut("{id}")]
    // [Authorize]
    public async Task<IActionResult> UpdateCustomer([FromBody] Customer c, int id)
    {
        var cus = await _dbContext.Customers.FirstOrDefaultAsync(x => x.CustomerId == id);
        if (cus is null) return NotFound();

        cus.Name = c.Name;
        cus.Phone = c.Phone;
        cus.Email = c.Email;
        cus.Address = c.Address;
        _dbContext.Customers.Update(cus);
        return await _dbContext.SaveChangesAsync() > 0 ? Ok() : StatusCode(400);
    }

    [HttpDelete("{id}")]
    // [Authorize]
    public async Task<IActionResult> DeleteCustomer(int id)
    {
        var cus = await _dbContext.Customers.FindAsync(id);
        if (cus is null) return NotFound();
        cus.IsActive = !cus.IsActive;
        return await _dbContext.SaveChangesAsync() > 0 ? Ok() : StatusCode(400);
    }
}
