using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;

namespace StoreManagement.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SupplierController : ControllerBase
{
    private readonly StoreManagementContext _dbContext;
    private readonly ILogger<SupplierController> _logger;

    public SupplierController(StoreManagementContext dbContext, ILogger<SupplierController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    // GET: api/supplier
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetSuppliers([FromQuery] string? name)
    {
        IQueryable<Supplier> query = _dbContext.Suppliers
            .Where(s => s.IsActive); // Chỉ lấy nhà cung cấp đang hoạt động

        if (!string.IsNullOrWhiteSpace(name))
        {
            query = query.Where(s => EF.Functions.Like(s.SupplierName, $"%{name}%"));
        }

        var suppliers = await query
            .Select(s => new
            {
                supplierId = s.SupplierId,
                name = s.SupplierName,
                phone = s.Phone,
                email = s.Email,
                address = s.Address
                // Chỉ trả những field cần thiết cho frontend
            })
            .OrderBy(s => s.name)
            .ToListAsync();

        return Ok(suppliers);
    }

    // GET: api/supplier/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<object>> GetSupplierById(int id)
    {
        var supplier = await _dbContext.Suppliers
            .Where(s => s.SupplierId == id && s.IsActive)
            .Select(s => new
            {
                supplierId = s.SupplierId,
                name = s.SupplierName,
                phone = s.Phone,
                email = s.Email,
                address = s.Address
            })
            .FirstOrDefaultAsync();

        if (supplier == null) return NotFound();

        return Ok(supplier);
    }

    // POST: api/supplier
    [HttpPost]
    public async Task<ActionResult> AddSupplier([FromBody] Supplier supplier)
    {
        if (string.IsNullOrWhiteSpace(supplier.SupplierName))
            return BadRequest("Tên nhà cung cấp không được để trống.");

        supplier.IsActive = true;
        _dbContext.Suppliers.Add(supplier);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSupplierById), new { id = supplier.SupplierId }, supplier);
    }

    // PUT: api/supplier/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateSupplier(int id, [FromBody] Supplier supplier)
    {
        if (id != supplier.SupplierId) return BadRequest("ID không khớp.");

        var existing = await _dbContext.Suppliers.FindAsync(id);
        if (existing == null || existing.IsActive == false) return NotFound();

        existing.SupplierName = supplier.SupplierName;
        existing.Phone = supplier.Phone;
        existing.Email = supplier.Email;
        existing.Address = supplier.Address;

        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/supplier/5 (soft delete)
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteSupplier(int id)
    {
        var supplier = await _dbContext.Suppliers.FindAsync(id);
        if (supplier == null) return NotFound();

        supplier.IsActive = false;
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }
}