using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;

var builder = WebApplication.CreateBuilder(args);

// Lấy chuỗi kết nối
var connectionStr = builder.Configuration.GetConnectionString("StorageManagement")!;

// Thêm các dịch vụ TRƯỚC khi build app
builder.Services.AddControllers();
builder.Services.AddDbContext<StoreManagementContext>(option =>
    option.UseMySQL(connectionStr));

// Thêm Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Sau khi đã thêm hết services, mới build app
var app = builder.Build();

// Cấu hình middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
