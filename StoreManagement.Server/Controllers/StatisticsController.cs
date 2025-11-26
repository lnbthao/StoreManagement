using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;

namespace StoreManagement.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : ControllerBase
    {
        private readonly StoreManagementContext _context;

        public StatisticsController(StoreManagementContext context)
        {
            _context = context;
        }

        // GET: api/statistics/overview
        [HttpGet("overview")]
        public async Task<ActionResult<object>> GetOverview()
        {
            try
            {
                var totalRevenue = await _context.Orders
                    .Where(o => o.Status == "paid")
                    .SumAsync(o => o.TotalAmount - o.DiscountAmount);

                var totalOrders = await _context.Orders.CountAsync();
                var totalProducts = await _context.Products.Where(p => p.IsActive).CountAsync();
                var totalCustomers = await _context.Customers.Where(c => c.IsActive).CountAsync();

                return Ok(new
                {
                    totalRevenue,
                    totalOrders,
                    totalProducts,
                    totalCustomers
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thống kê tổng quan", error = ex.Message });
            }
        }

        // GET: api/statistics/revenue?period=daily|monthly|yearly
        [HttpGet("revenue")]
        public async Task<ActionResult<object>> GetRevenue([FromQuery] string period = "daily")
        {
            try
            {
                var now = DateTime.Now;
                var data = new List<object>();

                if (period == "daily")
                {
                    // 7 ngày
                    for (int i = 6; i >= 0; i--)
                    {
                        var date = now.AddDays(-i).Date;
                        var revenue = await _context.Orders
                            .Where(o => o.Status == "paid" && o.OrderDate.Date == date)
                            .SumAsync(o => o.TotalAmount - o.DiscountAmount);

                        data.Add(new
                        {
                            date = date.ToString("dd/MM"),
                            revenue
                        });
                    }
                }
                else if (period == "monthly")
                {
                    // 1 tháng
                    for (int i = 29; i >= 0; i--)
                    {
                        var date = now.AddDays(-i).Date;
                        var revenue = await _context.Orders
                            .Where(o => o.Status == "paid" && o.OrderDate.Date == date)
                            .SumAsync(o => o.TotalAmount - o.DiscountAmount);

                        data.Add(new
                        {
                            date = date.ToString("dd/MM"),
                            revenue
                        });
                    }
                }
                else if (period == "yearly")
                {
                    // 1 năm 
                    for (int i = 11; i >= 0; i--)
                    {
                        var month = now.AddMonths(-i);
                        var revenue = await _context.Orders
                            .Where(o => o.Status == "paid" && 
                                   o.OrderDate.Year == month.Year && 
                                   o.OrderDate.Month == month.Month)
                            .SumAsync(o => o.TotalAmount - o.DiscountAmount);

                        data.Add(new
                        {
                            date = month.ToString("MM/yyyy"),
                            revenue
                        });
                    }
                }

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thống kê doanh thu", error = ex.Message });
            }
        }

        // GET: api/statistics/orders
        [HttpGet("orders")]
        public async Task<ActionResult<object>> GetOrderStatistics()
        {
            try
            {
                var pending = await _context.Orders.CountAsync(o => o.Status == "pending");
                var paid = await _context.Orders.CountAsync(o => o.Status == "paid");
                var canceled = await _context.Orders.CountAsync(o => o.Status == "canceled");

                return Ok(new
                {
                    pending,
                    paid,
                    canceled
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thống kê đơn hàng", error = ex.Message });
            }
        }

        // GET: api/statistics/top-products?limit=10
        [HttpGet("top-products")]
        public async Task<ActionResult<object>> GetTopProducts([FromQuery] int limit = 10)
        {
            try
            {
                var topProducts = await _context.OrderItems
                    .GroupBy(oi => new { oi.ProductId, oi.Product.ProductName })
                    .Select(g => new
                    {
                        productId = g.Key.ProductId,
                        productName = g.Key.ProductName,
                        totalQuantity = g.Sum(oi => oi.Quantity),
                        totalRevenue = g.Sum(oi => oi.Subtotal)
                    })
                    .OrderByDescending(p => p.totalQuantity)
                    .Take(limit)
                    .ToListAsync();

                return Ok(topProducts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy sản phẩm bán chạy", error = ex.Message });
            }
        }

        // GET: api/statistics/recent-orders?limit=10
        [HttpGet("recent-orders")]
        public async Task<ActionResult<object>> GetRecentOrders([FromQuery] int limit = 10)
        {
            try
            {
                var recentOrders = await _context.Orders
                    .Include(o => o.Customer)
                    .Include(o => o.User)
                    .OrderByDescending(o => o.OrderDate)
                    .Take(limit)
                    .Select(o => new
                    {
                        orderId = o.OrderId,
                        orderDate = o.OrderDate,
                        customerName = o.Customer != null ? o.Customer.CustomerName : "Khách vãng lai",
                        userName = o.User.FullName,
                        status = o.Status,
                        totalAmount = o.TotalAmount,
                        discountAmount = o.DiscountAmount,
                        finalAmount = o.TotalAmount - o.DiscountAmount
                    })
                    .ToListAsync();

                return Ok(recentOrders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy đơn hàng gần đây", error = ex.Message });
            }
    }
}
