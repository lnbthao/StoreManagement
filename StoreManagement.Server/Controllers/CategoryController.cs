using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;

namespace StoreManagement.Server.Controllers;

[ApiController]
[Route("/api/[controller]")]
public class CategoryController : Controller
{
    private readonly ILogger<CategoryController> _logger;
    private readonly StoreManagementContext _dbContext;

    public CategoryController(ILogger<CategoryController> logger, StoreManagementContext dbContext)
    {
        _logger = logger;
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<List<Category>> GetCategories(string? name)
    {
        if (!string.IsNullOrEmpty(name))
            return await _dbContext.Categories.Where(c => EF.Functions.Like(c.CategoryName, $"%{name}%")).ToListAsync();
        return await _dbContext.Categories.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<Category?> GetCategoryById(int id)
    {
        return await _dbContext.Categories.FirstOrDefaultAsync(c => c.CategoryId == id);
    }

    [HttpPost]
    public async Task<IActionResult> AddCategory(Category c)
    {
        _dbContext.Categories.Add(c);
        return await _dbContext.SaveChangesAsync() > 0 ? StatusCode(201) : StatusCode(400);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(Category c, int id)
    {
        _dbContext.Categories.Update(c);
        return await _dbContext.SaveChangesAsync() > 0 ? StatusCode(200) : StatusCode(400);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var deleteCategory = await GetCategoryById(id);
        deleteCategory.IsActive = !deleteCategory.IsActive;
        return await _dbContext.SaveChangesAsync() > 0 ? StatusCode(200) : StatusCode(400);
    }
}
