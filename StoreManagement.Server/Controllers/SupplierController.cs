using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;

namespace StoreManagement.Server.Controllers;

[ApiController]
[Route("/api/[controller]")]
public class SupplierController : Controller
{
    private readonly ILogger<SupplierController> _logger;
    private readonly StoreManagementContext _dbContext;

    public SupplierController(ILogger<SupplierController> logger, StoreManagementContext dbContext)
    {
        _logger = logger;
        _dbContext = dbContext;
    }

    // GET: /api/supplier?name=abc
    [HttpGet]
    public async Task<List<Supplier>> GetSuppliers(string? name)
    {
        var query = _dbContext.Suppliers.AsQueryable();

        if (!string.IsNullOrEmpty(name))
            query = query.Where(s => EF.Functions.Like(s.SupplierName, $"%{name}%"));

        return await query.ToListAsync();
    }

    // GET: /api/supplier/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSupplierById(int id)
    {
        var supplier = await _dbContext.Suppliers
            .Where(s => s.SupplierId == id)
            .Select(s => new {
                s.SupplierId,
                s.SupplierName,
                s.Phone,
                s.Email,
                s.Address,
                s.IsActive
            })
            .FirstOrDefaultAsync();

        if (supplier == null) return NotFound();

        return Ok(supplier);
    }

    // POST: /api/supplier
    [HttpPost]
    public async Task<IActionResult> AddSupplier(Supplier s)
    {
        s.IsActive ??= true; // mặc định true nếu null

        _dbContext.Suppliers.Add(s);
        var result = await _dbContext.SaveChangesAsync();

        return result > 0 ? StatusCode(201) : StatusCode(400);
    }

    // PUT: /api/supplier/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSupplier(int id, [FromBody] Supplier s)
    {
        var existing = await _dbContext.Suppliers.FindAsync(id);
        if (existing == null)
            return NotFound($"Supplier with ID {id} not found.");

        existing.SupplierName = s.SupplierName;
        existing.Phone = s.Phone;
        existing.Email = s.Email;
        existing.Address = s.Address;
        existing.IsActive = s.IsActive ?? true;

        await _dbContext.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE: /api/supplier/{id} → xóa mềm
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSupplier(int id)
    {
        var existing = await _dbContext.Suppliers.FindAsync(id);
        if (existing == null)
            return NotFound($"Supplier with ID {id} not found.");

        existing.IsActive = false;
        await _dbContext.SaveChangesAsync();
        return Ok();
    }
}

