using StoreManagement.Server.Models.Momo;

namespace StoreManagement.Server.Services.Momo
{
    public interface IMomoService
    {
        // Define methods for Momo payment processing
        Task<MomoCreatePaymentResponseModel> CreatePaymentAsync(OrderInfoModel model);
        MomoExecuteResponseModel ExecutePaymentAsync(IQueryCollection collection);
    }
}