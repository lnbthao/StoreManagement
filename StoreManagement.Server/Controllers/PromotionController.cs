using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;

namespace StoreManagement.Server.Controllers;

[ApiController]
[Route("/api/[controller]")]
public class PromotionController : Controller
{
    private readonly ILogger<PromotionController> _logger;
    private readonly StoreManagementContext _dbContext;

    public PromotionController(ILogger<PromotionController> logger, StoreManagementContext dbContext)
    {
        _logger = logger;
        _dbContext = dbContext;
    }

    // GET all promotions
    [HttpGet]
    public async Task<List<Promotion>> GetPromotions(string? code)
    {
        if (!string.IsNullOrEmpty(code))
            return await _dbContext.Promotions
                .Where(p => EF.Functions.Like(p.PromoCode, $"%{code}%"))
                .ToListAsync();

        return await _dbContext.Promotions.ToListAsync();
    }

    // GET by promo_id
    [HttpGet("{id}")]
    public async Task<Promotion?> GetPromotionById(int id)
    {
        return await _dbContext.Promotions.FirstOrDefaultAsync(p => p.PromoId == id);
    }

    // GET by promo_code (với thông báo lỗi)
    [HttpGet("code/{promoCode}")]
    public async Task<IActionResult> GetPromotionByCode(string promoCode, [FromQuery] decimal? orderAmount = null)
    {
        var promo = await _dbContext.Promotions.FirstOrDefaultAsync(p => p.PromoCode == promoCode);

        if (promo == null)
        {
            return Ok(new
            {
                isValid = false,
                message = "Mã khuyến mãi không tồn tại."
            });
        }

        string message = "";
        bool isValid = true;
        DateTime today = DateTime.UtcNow.Date;

        if (promo.Status?.ToLower() != "active")
        {
            message = "Mã khuyến mãi hiện đang bị vô hiệu hóa.";
            isValid = false;
        }
        else if (today < promo.StartDate)
        {
            message = "Mã khuyến mãi chưa đến ngày áp dụng.";
            isValid = false;
        }
        else if (today > promo.EndDate)
        {
            message = "Mã khuyến mãi đã hết hạn.";
            isValid = false;
        }
        else if (promo.UsageLimit > 0 && promo.UsedCount >= promo.UsageLimit)
        {
            message = "Mã khuyến mãi đã hết lượt sử dụng.";
            isValid = false;
        }
        else if (orderAmount != null && promo.MinOrderAmount != null && orderAmount < promo.MinOrderAmount)
        {
            message = $"Đơn hàng chưa đạt giá trị tối thiểu ({promo.MinOrderAmount:N0}đ) để sử dụng mã này.";
            isValid = false;
        }

        return Ok(new
        {
            isValid,
            promo.PromoId,
            promo.PromoCode,
            promo.Description,
            promo.DiscountType,
            promo.DiscountValue,
            promo.StartDate,
            promo.EndDate,
            promo.MinOrderAmount,
            promo.UsageLimit,
            promo.UsedCount,
            promo.Status,
            message
        });
    }


    // POST - thêm mới
    [HttpPost]
    public async Task<IActionResult> AddPromotion(Promotion promo)
    {
        _dbContext.Promotions.Add(promo);
        var result = await _dbContext.SaveChangesAsync();
        return result > 0 ? StatusCode(201) : StatusCode(400);
    }

    // PUT - cập nhật
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePromotion(Promotion promo, int id)
    {
        if (promo.PromoId != id)
            return BadRequest("ID không khớp.");

        _dbContext.Promotions.Update(promo);
        var result = await _dbContext.SaveChangesAsync();
        return result > 0 ? Ok() : StatusCode(400);
    }

    // DELETE - bật/tắt trạng thái (soft delete)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePromotion(int id)
    {
        var promo = await GetPromotionById(id);
        if (promo == null)
            return NotFound();

        promo.Status = promo.Status == "active" ? "inactive" : "active";
        var result = await _dbContext.SaveChangesAsync();
        return result > 0 ? Ok() : StatusCode(400);
    }
}
