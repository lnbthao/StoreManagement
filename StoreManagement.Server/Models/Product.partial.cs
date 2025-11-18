using System.ComponentModel.DataAnnotations.Schema;

namespace StoreManagement.Server.Models
{
    public partial class Product
    {
        [Column("image_url")]
        public string? ImageUrl { get; set; }
    }
}
