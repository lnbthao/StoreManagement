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
                    o.Customer.Name
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

    // GET: api/Order/5
    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        var order = await _dbContext.Orders
            .Where(o => o.OrderId == id)
            .Select(o => new OrderDto
            {
                OrderId = o.OrderId,
                OrderDate = o.OrderDate,
                Status = o.Status ?? string.Empty,
                TotalAmount = o.TotalAmount ?? 0,
                DiscountAmount = o.DiscountAmount ?? 0,
                Customer = o.Customer == null
                    ? null
                    : new IdNameDto { Id = o.Customer.CustomerId, Name = o.Customer.Name },
                User = o.User == null
                    ? null
                    : new IdNameDto { Id = o.User.UserId, Name = o.User.FullName },
                Promo = o.Promo == null
                    ? null
                    : new IdNameDto { Id = o.Promo.PromoId, Name = o.Promo.PromoCode },
                Items = o.OrderItems.Select(oi => new OrderItemDto
                {
                    OrderItemId = oi.OrderItemId,
                    ProductId = oi.ProductId ?? 0,
                    ProductName = oi.Product != null ? oi.Product.ProductName : null,
                    Quantity = oi.Quantity,
                    Price = oi.Price,
                    Subtotal = oi.Subtotal
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (order == null)
        {
            return NotFound();
        }

        return order;
    }

    // POST: api/Order
    [HttpPost]
    public async Task<ActionResult<object>> CreateOrder(Order order)
    {
        try
        {
            // Validate input
            if (order == null)
            {
                return BadRequest(new { message = "Dữ liệu đơn hàng không hợp lệ!" });
            }

            if (order.OrderItems == null || !order.OrderItems.Any())
            {
                return BadRequest(new { message = "Đơn hàng phải có ít nhất một sản phẩm!" });
            }

            // Set default values
            order.OrderDate = DateTime.Now;
            order.Status = order.Status ?? "pending";

            // Validate customer exists
            var customerExists = await _dbContext.Customers.AnyAsync(c => c.CustomerId == order.CustomerId);
            if (!customerExists)
            {
                return BadRequest(new { message = "Khách hàng không tồn tại!" });
            }

            // Validate products and calculate totals
            decimal totalAmount = 0;
            foreach (var item in order.OrderItems)
            {
                var product = await _dbContext.Products.FindAsync(item.ProductId);
                if (product == null)
                {
                    return BadRequest(new { message = $"Sản phẩm ID {item.ProductId} không tồn tại!" });
                }

                // Get inventory for this product
                var inventory = await _dbContext.Inventories
                    .FirstOrDefaultAsync(i => i.ProductId == item.ProductId);

                if (inventory == null)
                {
                    return BadRequest(new { message = $"Sản phẩm '{product.ProductName}' chưa có thông tin tồn kho!" });
                }

                // Check stock
                var currentStock = inventory.Quantity;
                if (currentStock < item.Quantity)
                {
                    return BadRequest(new { message = $"Sản phẩm '{product.ProductName}' không đủ hàng trong kho! Tồn kho: {currentStock}" });
                }

                // Calculate subtotal
                item.Price = product.Price;
                item.Subtotal = item.Price * item.Quantity;
                totalAmount += item.Subtotal;

                // Update inventory
                inventory.Quantity = currentStock - item.Quantity;
                inventory.UpdatedAt = DateTime.Now;
            }

            // Apply promotion discount if exists
            decimal discountAmount = 0;
            if (order.PromoId != null)
            {
                var promo = await _dbContext.Promotions.FindAsync(order.PromoId);
                if (promo != null)
                {
                    // Check if promotion is valid
                    var now = DateTime.Now;
                    if (promo.StartDate <= now && promo.EndDate >= now)
                    {
                        if (promo.DiscountType == "percentage")
                        {
                            discountAmount = totalAmount * promo.DiscountValue / 100;
                        }
                        else
                        {
                            discountAmount = promo.DiscountValue;
                        }

                        // Đảm bảo giảm giá không lớn hơn tổng tiền
                        if (discountAmount > totalAmount)
                        {
                            discountAmount = totalAmount;
                        }
                    }
                }
            }

            // Tính tổng tiền cuối cùng và đảm bảo không âm
            var finalTotal = totalAmount - discountAmount;
            if (finalTotal < 0)
            {
                return BadRequest(new { message = "Tổng tiền không được âm!" });
            }

            order.TotalAmount = finalTotal;
            order.DiscountAmount = discountAmount;

            // Add order to database
            _dbContext.Orders.Add(order);
            await _dbContext.SaveChangesAsync();

            // Trả về gọn để tránh tuần hoàn JSON
            return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, new { orderId = order.OrderId });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi tạo đơn hàng!", error = ex.Message });
        }
    }

    // PUT: api/Order/5/status
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] OrderStatusUpdate statusUpdate)
    {
        var order = await _dbContext.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.OrderId == id);

        if (order == null)
        {
            return NotFound();
        }

        var oldStatus = order.Status;
        var newStatus = statusUpdate.Status;

        // Nếu đơn hàng bị hủy, hoàn trả hàng vào kho
        if (newStatus?.ToLower() == "canceled" || newStatus?.ToLower() == "cancelled")
        {
            // Lấy tất cả các order items
            foreach (var item in order.OrderItems)
            {
                if (item.ProductId.HasValue && item.Quantity > 0)
                {
                    // Tìm inventory record của product này
                    var inventory = await _dbContext.Inventories
                        .FirstOrDefaultAsync(i => i.ProductId == item.ProductId.Value);

                    if (inventory != null)
                    {
                        // Hoàn trả số lượng vào kho
                        inventory.Quantity = inventory.Quantity + item.Quantity;
                    }
                }
            }
        }

        order.Status = newStatus;

        try
        {
            await _dbContext.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!OrderExists(id))
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

    // DELETE: api/Order/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var order = await _dbContext.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.OrderId == id);

        if (order == null)
        {
            return NotFound();
        }

        // Only allow deletion of pending orders
        if (order.Status?.ToLower() != "pending")
        {
            return BadRequest(new { message = "Chỉ có thể xóa đơn hàng đang chờ xác nhận!" });
        }

        // Restore inventory
        foreach (var item in order.OrderItems)
        {
            var inventory = await _dbContext.Inventories
                .FirstOrDefaultAsync(i => i.ProductId == item.ProductId);

            if (inventory != null)
            {
                inventory.Quantity = inventory.Quantity + item.Quantity;
                inventory.UpdatedAt = DateTime.Now;
            }
        }

        _dbContext.Orders.Remove(order);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    private bool OrderExists(int id)
    {
        return _dbContext.Orders.Any(e => e.OrderId == id);
    }
}

// DTOs
public class OrderStatusUpdate
{
    public string Status { get; set; } = string.Empty;
}

public class OrderDto
{
    public int OrderId { get; set; }
    public DateTime OrderDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public IdNameDto? Customer { get; set; }
    public IdNameDto? User { get; set; }
    public IdNameDto? Promo { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public int OrderItemId { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Subtotal { get; set; }
}

public class IdNameDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
}

