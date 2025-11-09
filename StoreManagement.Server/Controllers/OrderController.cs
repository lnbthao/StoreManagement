using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;

namespace StoreManagement.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly StoreManagementContext _context;

        public OrderController(StoreManagementContext context)
        {
            _context = context;
        }

        // GET: api/Order
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders()
        {
            var result = await _context.Orders
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new OrderDto
                {
                    OrderId = o.OrderId,
                    OrderDate = o.OrderDate,
                    Status = o.Status ?? string.Empty,
                    TotalAmount = o.TotalAmount ?? 0,
                    DiscountAmount = o.DiscountAmount ?? 0,
                    Customer = o.Customer == null
                        ? null
                        : new IdNameDto { Id = o.Customer.CustomerId, Name = o.Customer.CustomerName },
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
                .ToListAsync();

            return Ok(result);
        }

        // GET: api/Order/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            var order = await _context.Orders
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
                        : new IdNameDto { Id = o.Customer.CustomerId, Name = o.Customer.CustomerName },
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
                var customerExists = await _context.Customers.AnyAsync(c => c.CustomerId == order.CustomerId);
                if (!customerExists)
                {
                    return BadRequest(new { message = "Khách hàng không tồn tại!" });
                }

                // Validate products and calculate totals
                decimal totalAmount = 0;
                foreach (var item in order.OrderItems)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null)
                    {
                        return BadRequest(new { message = $"Sản phẩm ID {item.ProductId} không tồn tại!" });
                    }

                    // Get inventory for this product
                    var inventory = await _context.Inventories
                        .FirstOrDefaultAsync(i => i.ProductId == item.ProductId);
                    
                    if (inventory == null)
                    {
                        return BadRequest(new { message = $"Sản phẩm '{product.ProductName}' chưa có thông tin tồn kho!" });
                    }

                    // Check stock
                    var currentStock = inventory.Quantity ?? 0;
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
                    var promo = await _context.Promotions.FindAsync(order.PromoId);
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
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

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
            var order = await _context.Orders
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
                        var inventory = await _context.Inventories
                            .FirstOrDefaultAsync(i => i.ProductId == item.ProductId.Value);
                        
                        if (inventory != null)
                        {
                            // Hoàn trả số lượng vào kho
                            inventory.Quantity = (inventory.Quantity ?? 0) + item.Quantity;
                        }
                    }
                }
            }

            order.Status = newStatus;

            try
            {
                await _context.SaveChangesAsync();
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
            var order = await _context.Orders
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
                var inventory = await _context.Inventories
                    .FirstOrDefaultAsync(i => i.ProductId == item.ProductId);
                    
                if (inventory != null)
                {
                    inventory.Quantity = (inventory.Quantity ?? 0) + item.Quantity;
                    inventory.UpdatedAt = DateTime.Now;
                }
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.OrderId == id);
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
}
