using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;

namespace StoreManagement.Server.Controllers;

[ApiController]
[Route("/api/[controller]")]
public class OrderController : Controller
{
    private readonly ILogger<OrderController> _logger;
    private readonly StoreManagementContext _dbContext;

    public OrderController(ILogger<OrderController> logger, StoreManagementContext dbContext)
    {
        _logger = logger;
        _dbContext = dbContext;
    }

    // ----------------------------------------------------------
    // 🔥 GET ALL ORDERS — sắp xếp theo đơn mới nhất
    // GET /api/order
    // ----------------------------------------------------------
    [HttpGet]
    public async Task<ActionResult> GetOrders()
    {
        var orders = await _dbContext.Orders
            .Include(o => o.Customer)
            .Include(o => o.User)
            .Include(o => o.Promo)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new
            {
                o.OrderId,
                o.OrderDate,
                o.Status,
                o.TotalAmount,
                o.DiscountAmount,

                // --- STAFF ---
                User = o.User == null ? null : new
                {
                    o.User.UserId,
                    o.User.FullName
                },

                // --- CUSTOMER ---
                Customer = o.Customer == null ? null : new
                {
                    o.Customer.CustomerId,
                    o.Customer.CustomerName
                },

                // --- PROMOTION ---
                Promotion = o.Promo == null ? null : new
                {
                    o.Promo.PromoId,
                    o.Promo.PromoCode
                },

                // --- ITEMS ---
                OrderItems = o.OrderItems.Select(oi => new
                {
                    oi.ProductId,
                    oi.Quantity,
                    oi.Price,
                    SubTotal = oi.Price * oi.Quantity,

                    Product = oi.Product == null ? null : new
                    {
                        oi.Product.ProductId,
                        oi.Product.ProductName,
                        oi.Product.Unit
                    }
                })
            })
            .ToListAsync();

        return Ok(orders);
    }


}
