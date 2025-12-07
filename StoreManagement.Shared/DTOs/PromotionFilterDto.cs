namespace StoreManagement.Shared.DTOs
{
    public class PromotionFilterDto
    {
        public string? Status { get; set; }
        public string? DiscountType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
