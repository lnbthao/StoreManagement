using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;

namespace StoreManagement.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly StoreManagementContext _context;
        public ProductController(StoreManagementContext context)
        {
            _context = context;
        }

        // GET: api/Product
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts([FromQuery] string? search)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.Inventories)
                .Where(p => p.IsActive);

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(p =>
                    p.ProductName.Contains(search) ||
                    (p.Barcode != null && p.Barcode.Contains(search))
                );
            }

            var result = await query
                .Select(p => new // ← DÙNG ANONYMOUS OBJECT (không cần DTO)
                {
                    p.ProductId,
                    p.ProductName,
                    p.Barcode,
                    p.Price,
                    p.Unit,
                    p.IsActive,
                    p.CategoryId,
                    CategoryName = p.Category == null ? null : p.Category.CategoryName,
                    p.SupplierId,
                    SupplierName = p.Supplier == null ? null : p.Supplier.SupplierName,
                    p.ImageUrl, // ← TRẢ ẢNH
                    Stock = p.Inventories.Sum(i => i.Quantity)
                })
                .ToListAsync();

            return Ok(result);
        }

        // GET: api/Product/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<object>> GetProduct(int id)
        {
            var product = await _context.Products
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
                    CategoryName = p.Category?.CategoryName,
                    p.SupplierId,
                    SupplierName = p.Supplier?.SupplierName,
                    p.ImageUrl, // ← TRẢ ẢNH
                    Stock = p.Inventories.Sum(i => i.Quantity)
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

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId },
                new { productId = product.ProductId });
        }

        // PUT: api/Product/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product product)
        {
            if (id != product.ProductId) return BadRequest();

            var existing = await _context.Products.FindAsync(id);
            if (existing == null || !existing.IsActive) return NotFound();

            existing.ProductName = product.ProductName;
            existing.Barcode = product.Barcode;
            existing.Price = product.Price;
            existing.Unit = product.Unit;
            existing.CategoryId = product.CategoryId;
            existing.SupplierId = product.SupplierId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Product/5 (soft delete)
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.IsActive = false; // SOFT DELETE
            await _context.SaveChangesAsync();
            return NoContent();
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

        private bool ProductExists(int id) => _context.Products.Any(e => e.ProductId == id);

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
}