using Microsoft.EntityFrameworkCore;
using StoreManagement.Server.Models;

var builder = WebApplication.CreateBuilder(args);
var connectionStr = builder.Configuration.GetConnectionString("StorageManagement")!;


builder.Services.AddControllers();
builder.Services.AddDbContext<StoreManagementContext>(option => option.UseMySQL(connectionStr));

// Add Swagger
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();