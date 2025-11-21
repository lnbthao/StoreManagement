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
                Stock = p.Inventories.Sum(i => (int?)i.Quantity) ?? 0, // Alias cho frontend

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

    // GET: api/Product/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<object>> GetProduct(int id)
    {
        var product = await _dbContext.Products
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .Include(p => p.Inventories)
            .Where(p => p.ProductId == id && p.IsActive)
            .Select(p => new
            {
                p.ProductId,
                p.ProductName,
                p.Barcode,
                p.Price,
                p.Unit,
                p.IsActive,
                p.CategoryId,
                CategoryName = p.Category == null ? null : p.Category.CategoryName,
                SupplierName = p.Supplier == null ? null : p.Supplier.SupplierName,
                p.ImageUrl,
                quantity = p.Inventories.Sum(i => i.Quantity) // ← ĐỔI TÊN TỪ Stock → quantity
            })
            .FirstOrDefaultAsync();

        if (product == null) return NotFound();
        return Ok(product);
    }

    // POST: api/Product
    [HttpPost]
    public async Task<ActionResult<object>> CreateProduct([FromBody] Product product)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        product.IsActive = true;

        _dbContext.Products.Add(product);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId },
            new { productId = product.ProductId });
    }

    // PUT: api/Product/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product product)
    {
        if (id != product.ProductId) return BadRequest();

        var existing = await _dbContext.Products.FindAsync(id);
        if (existing == null || !existing.IsActive) return NotFound();

        existing.ProductName = product.ProductName;
        existing.Barcode = product.Barcode;
        existing.Price = product.Price;
        existing.Unit = product.Unit;
        existing.CategoryId = product.CategoryId;
        existing.SupplierId = product.SupplierId;

        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    // THAY THẾ [HttpDelete("{id:int}")]
    [HttpPut("{id:int}/delete")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _dbContext.Products.FindAsync(id);
        if (product == null) return NotFound();
        product.IsActive = false;
        await _dbContext.SaveChangesAsync();
        return Ok(new { message = "Đã xóa sản phẩm" }); // thêm message cho đẹp
    }

    // UPLOAD IMAGE
    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadProductImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Vui lòng chọn ảnh!" });

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "Ảnh không được quá 5MB!" });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!new[] { ".jpg", ".jpeg", ".png", ".webp" }.Contains(ext))
            return BadRequest(new { message = "Chỉ chấp nhận JPG, PNG, WEBP!" });

        var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "products");
        Directory.CreateDirectory(folder);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(folder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var url = $"/uploads/products/{fileName}";
        return Ok(new { url });
    }

    // POST: api/Product/import-inventory
    [HttpPost("import-inventory")]
    public async Task<IActionResult> ImportInventory([FromBody] ImportInventoryRequest request)
    {
        if (request.Quantity <= 0)
            return BadRequest(new { message = "Số lượng phải lớn hơn 0" });

        var product = await _dbContext.Products
            .Include(p => p.Inventories)
            .FirstOrDefaultAsync(p => p.ProductId == request.ProductId && p.IsActive);

        if (product == null) return NotFound();

        var inventory = product.Inventories.FirstOrDefault();
        if (inventory == null)
        {
            inventory = new Inventory
            {
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                UpdatedAt = DateTime.Now
            };
            _dbContext.Inventories.Add(inventory);
        }
        else
        {
            inventory.Quantity += request.Quantity;
            inventory.UpdatedAt = DateTime.Now;
        }

        await _dbContext.SaveChangesAsync();
        return Ok(new { message = "Nhập kho thành công", newStock = inventory.Quantity });
    }

    public class ImportInventoryRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    // PUT: api/Product/5/restore
    [HttpPut("{id:int}/restore")]
    public async Task<IActionResult> RestoreProduct(int id)
    {
        var product = await _dbContext.Products.FindAsync(id);
        if (product == null) return NotFound();

        product.IsActive = true;
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    private bool ProductExists(int id) => _dbContext.Products.Any(e => e.ProductId == id);

    // DTO – SỬA IsActive thành bool (không nullable)
    public class ProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? Barcode { get; set; }
        public decimal Price { get; set; }
        public string? Unit { get; set; }
        public bool IsActive { get; set; } = true; // SỬA TỪ bool? → bool
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public int? SupplierId { get; set; }
        public string? SupplierName { get; set; }
        public int Stock { get; set; }
    }
}

