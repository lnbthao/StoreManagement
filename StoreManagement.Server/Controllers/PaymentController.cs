using Microsoft.AspNetCore.Mvc;
using StoreManagement.Server.Models;
using StoreManagement.Server.Models.Momo;
using StoreManagement.Server.Services.Momo;

namespace StoreManagement.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private IMomoService _momoService;
        private StoreManagementContext _dbContext;

        public PaymentController(IMomoService momoService, StoreManagementContext dbContext)
        {
            _momoService = momoService;
            _dbContext = dbContext;
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
    }
}