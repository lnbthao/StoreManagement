using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;

namespace StoreManagement.Server.Controllers;

[ApiController]
[Route("/api/[controller]")]
public class ProductController : Controller
{
    private readonly ILogger<ProductController> _logger;
    private readonly StoreManagementContext _dbContext;

    public ProductController(ILogger<ProductController> logger, StoreManagementContext dbContext)
    {
        _logger = logger;
        _dbContext = dbContext;
    }

    // GET: /api/product
    [HttpGet]
    public async Task<IActionResult> GetProducts(string? name)
    {
        var query = _dbContext.Products
            .Include(p => p.Category)
            .Include(p => p.Inventories)
            .AsQueryable();

        if (!string.IsNullOrEmpty(name))
            query = query.Where(p => EF.Functions.Like(p.ProductName, $"%{name}%"));

        var result = await query
            .Select(p => new
            {
                p.ProductId,
                p.ProductName,
                p.Price,
                p.Unit,
                p.CategoryId,
     
                p.SupplierId,
                p.Barcode,
                p.IsActive,
                
                TotalQuantity = p.Inventories.Sum(i => (int?)i.Quantity) ?? 0,
                
                Inventories = p.Inventories.Select(i => new
                {
                    i.InventoryId,
                    i.Quantity,
                    i.UpdatedAt
                }),
               
                Category = p.Category == null ? null : new
                {
                    p.Category.CategoryId,
                    p.Category.CategoryName,
                    p.Category.IsActive
                }
            })
            .ToListAsync();

        return Ok(result);
    }


    // GET: /api/product/{id}
    [HttpGet("{id}")]
    public async Task<Product?> GetProductById(int id)
    {
        return await _dbContext.Products.FirstOrDefaultAsync(p => p.ProductId == id);
    }
}
