using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;

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
            customer.CustomerName,
            customer.Phone,
            customer.Address
        });
    }

    // 🔍 Lấy khách theo ID
    // Lưu ý: để tránh đụng vào /search → dùng ràng buộc int
    [HttpGet("{id:int}")]
    public async Task<Customer?> GetCustomerById(int id)
    {
        return await _dbContext.Customers.FirstOrDefaultAsync(c => c.CustomerId == id);
    }
}
