
using SignalR_Api.Hubs;

namespace SignalR_Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // 1. إضافة خدمات SignalR
            builder.Services.AddSignalR();

            // 2. إعداد الـ CORS (مهم جداً للـ API)
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("SignalRPolicy", policy =>
                {
                    policy.WithOrigins("http://127.0.0.1:5500", "http://localhost:5500") // حط هنا رابط الـ Client بتاعك (غالباً Live Server بيفتح على 5500)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials(); // شرط أساسي لـ SignalR
                });
            });

            var app = builder.Build();

            // 3. تفعيل الـ CORS قبل الـ Routing والـ Authorization
            app.UseCors("SignalRPolicy");

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            // 4. عمل Map للمسار (Endpoint) الخاص بالـ Hub
            app.MapHub<ChatHub>("/chatHub");
            app.Run();
        }
    }
}
