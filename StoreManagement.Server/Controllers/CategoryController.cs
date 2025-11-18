using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;
using Microsoft.AspNetCore.Authorization; // nếu cần

namespace StoreManagement.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
// [Authorize] // ← Tạm bỏ nếu không cần login
public class CategoryController : ControllerBase // ← Dùng ControllerBase
{
    private readonly ILogger<CategoryController> _logger;
    private readonly StoreManagementContext _dbContext;

    public CategoryController(ILogger<CategoryController> logger, StoreManagementContext dbContext)
    {
        _logger = logger;
        _dbContext = dbContext;
    }

    // GET: api/category
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories([FromQuery] string? name)
    {
        IQueryable<Category> query = _dbContext.Categories.Where(c => c.IsActive); // Chỉ lấy active

        if (!string.IsNullOrWhiteSpace(name))
        {
            query = query.Where(c => EF.Functions.Like(c.CategoryName, $"%{name}%"));
        }

        var categories = await query
            .Select(c => new Category
            {
                CategoryId = c.CategoryId,
                CategoryName = c.CategoryName,
                IsActive = c.IsActive
                // Không trả các field nhạy cảm như CreatedAt nếu không cần
            })
            .ToListAsync();

        return Ok(categories); // ← Trả JSON đúng chuẩn
    }

    // GET: api/category/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Category>> GetCategoryById(int id)
    {
        var category = await _dbContext.Categories
            .FirstOrDefaultAsync(c => c.CategoryId == id && c.IsActive);

        if (category == null) return NotFound();

        return Ok(category);
    }

    // POST: api/category
    [HttpPost]
    public async Task<ActionResult<Category>> AddCategory([FromBody] Category c)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        c.IsActive = true;
        _dbContext.Categories.Add(c);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategoryById), new { id = c.CategoryId }, c);
    }

    // PUT: api/category/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category c)
    {
        if (id != c.CategoryId) return BadRequest("ID không khớp");

        var existing = await _dbContext.Categories.FindAsync(id);
        if (existing == null) return NotFound();

        existing.CategoryName = c.CategoryName;
        // existing.IsActive = c.IsActive; // nếu cho phép thay đổi

        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/category/5 (soft delete)
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _dbContext.Categories.FindAsync(id);
        if (category == null) return NotFound();

        category.IsActive = false;
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }
}