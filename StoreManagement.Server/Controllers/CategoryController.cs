using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using StoreManagement.Server.Models;

namespace StoreManagement.Server.Controllers;

[ApiController]
[Route("/api/[controller]")]
[Authorize]
public class CategoryController : Controller
{
    private readonly StoreManagementContext _context;

    public CategoryController(StoreManagementContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<List<Category>> GetCategories(string? name)
    {
        if (!string.IsNullOrEmpty(name))
            return await _context.Categories.Where(c => EF.Functions.Like(c.CategoryName, $"%{name}%")).ToListAsync();
        return await _context.Categories.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<Category?> GetCategoryById(int id)
    {
        return await _context.Categories.FirstOrDefaultAsync(c => c.CategoryId == id);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> AddCategory(Category c)
    {
        // Log dữ liệu nhận được
        Console.WriteLine("=== AddCategory called ===");
        Console.WriteLine($"CategoryId: {c.CategoryId}");
        Console.WriteLine($"CategoryName: {c.CategoryName}");
        Console.WriteLine($"IsActive: {c.IsActive}");

        _context.Categories.Add(c);
        var result = await _context.SaveChangesAsync();

        Console.WriteLine(result > 0
            ? "Category added successfully!"
            : "Failed to add category.");

        return result > 0 ? StatusCode(201) : StatusCode(400);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category c)
    {
        var existing = await _context.Categories.FindAsync(id);
        if (existing == null)
            return NotFound($"Category with ID {id} not found.");

        existing.CategoryName = c.CategoryName;
        existing.IsActive = c.IsActive;
        await _context.SaveChangesAsync();
        return Ok(existing);
    }

  
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> ToggleCategory(int id)
    {
        var existing = await _context.Categories.FindAsync(id);
        if (existing == null)
            return NotFound($"Category with ID {id} not found.");

        existing.IsActive = !existing.IsActive; // ✅ TOGGLE
        await _context.SaveChangesAsync();

        return Ok();
    }


    // PUT: api/Category/{id}/restore -> phục hồi
    [HttpPut("{id:int}/restore")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> RestoreCategory(int id)
    {
        var Category = await _context.Categories.FindAsync(id);
        if (Category == null) return NotFound();

        Category.IsActive = true;
        await _context.SaveChangesAsync();
        return Ok();
    }
}
