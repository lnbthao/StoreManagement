using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;
using StoreManagement.Server.Models.Momo;
using StoreManagement.Server.Services.Momo;

namespace StoreManagement.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly StoreManagementContext _context;
    private IMomoService _momoService;

    public PaymentController(StoreManagementContext context, IMomoService momoService)
    {
        _context = context;
        _momoService = momoService;
    }

    // ============================
    // 🔥 Thanh toán bằng TIỀN MẶT
    // ============================
    [HttpPost("cash")]
    public async Task<IActionResult> PayWithCash([FromBody] CashCheckoutRequest request)
    {
        if (request.Items == null || !request.Items.Any())
            return BadRequest("Giỏ hàng trống!");

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // 1️⃣ Tạo đơn hàng
            var order = new Order
            {
                OrderDate = DateTime.Now,
                Status = "paid",
                TotalAmount = 0,
                UserId = request.userId, // có thể lấy từ token nếu có
                CustomerId = request.customerId,
                PromoId = request.promotionId,
                DiscountAmount = request.discountValue
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync(); // cần để có OrderId

            decimal total = 0;


            // 2️⃣ Tạo order items + kiểm tra kho + trừ kho
            foreach (var item in request.Items)
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == item.ProductId);

                if (product == null)

                    return BadRequest(new { message = $"Sản phẩm ID {item.ProductId} không tồn tại." });


                // 🔥 Thay thế đoạn kiểm tra + trừ kho đơn để dùng FIFO
                var inventories = await _context.Inventories
                    .Where(i => i.ProductId == item.ProductId && i.Quantity > 0)
                    .OrderBy(i => i.UpdatedAt)
                    .ToListAsync();

                if (!inventories.Any())

                    return BadRequest(new { message = $"Không tìm thấy kho cho sản phẩm {product.ProductName}" });


                int totalAvailable = (int)inventories.Sum(i => i.Quantity);
                int qtyNeeded = item.Quantity;

                if (totalAvailable < qtyNeeded)
                    return BadRequest(new { message = $"Không đủ tồn kho cho sản phẩm {product.ProductName}" });


                // 🔥 Trừ kho theo FIFO (KHÔNG ĐỔI GÌ KHÁC)
                foreach (var inv in inventories)
                {
                    if (qtyNeeded <= 0) break;

                    int deduction = (int)Math.Min((decimal)inv.Quantity, qtyNeeded);
                    inv.Quantity -= deduction;
                    qtyNeeded -= deduction;

                    _context.Inventories.Update(inv);
                }

                // Tính tiền
                var subtotal = item.Quantity * product.Price;
                total += subtotal;

                // Tạo OrderItem
                var orderItem = new OrderItem
                {
                    OrderId = order.OrderId,
                    ProductId = product.ProductId,
                    Quantity = item.Quantity,
                    Price = product.Price,
                    Subtotal = subtotal
                };

                _context.OrderItems.Add(orderItem);

            }
            //  Nếu order có dùng mã khuyến mãi → tăng UsageCount
            if (request.promotionId != null)
            {
                var promo = await _context.Promotions
                    .FirstOrDefaultAsync(p => p.PromoId == request.promotionId);

                if (promo != null)
                {
                    if (promo.UsedCount != -1)
                    {
                        promo.UsedCount = (promo.UsedCount ?? 0) + 1;
                        _context.Promotions.Update(promo);
                    }

                }
            }

            // 3️⃣ Cập nhật tổng tiền vào order
            order.TotalAmount = total;
            _context.Orders.Update(order);

            // 4️⃣ Tạo Payment
            var payment = new Payment
            {
                OrderId = order.OrderId,
                Amount = total,
                PaymentMethod = "cash",
                PaymentDate = DateTime.Now
            };

            _context.Payments.Add(payment);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new
            {
                Message = "Thanh toán thành công!",
                OrderId = order.OrderId,
                Total = total
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    [Route("CreatePaymentMomo")]
    public async Task<IActionResult> CreatePaymentMomo([FromForm] OrderInfoModel model)
    {
        var response = await _momoService.CreatePaymentAsync(model);
        return Redirect(response.PayUrl);
    }

    [HttpGet]
    [Route("ExecutePayment")]
    public IActionResult ExecutePayment(IQueryCollection collection)
    {
        var response = _momoService.ExecutePaymentAsync(collection);
        return Ok(response);
    }

    public class CashCheckoutRequest
    {
        public List<CartItem> Items { get; set; } = new();
        public int? customerId { get; set; }
        public int? userId { get; set; }
        public int? promotionId { get; set; }
        public decimal? discountValue { get; set; }
    }

    public class CartItem
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}


