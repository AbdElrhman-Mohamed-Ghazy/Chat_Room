using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace SignalR_Api.Hubs
{
    public class ChatHub : Hub
    {
        // قاموس لحفظ المستخدمين المتصلين (Key: ConnectionId, Value: Username)
        // استخدمنا ConcurrentDictionary لأنه الآمن مع الـ Threads في الـ Real-time
        private static readonly ConcurrentDictionary<string, string> Users = new ConcurrentDictionary<string, string>();

        // 1. دالة يطلبها الـ Client أول ما يفتح ويدخل اسمه
        public async Task RegisterUser(string username)
        {
            string connectionId = Context.ConnectionId;
            Users[connectionId] = username;

            // إرسال قائمة المستخدمين الحالية لكل الناس لتحديث قائمة المتصلين
            await Clients.All.SendAsync("UpdateUserList", Users.Values.Distinct().ToList());

            // إرسال رسالة نظام إن اليوزر دخل الشات
            await Clients.Others.SendAsync("ReceiveMessage", "System", $"{username} joined the chat.");
        }

        // 2. دالة إرسال الرسائل العادية
        public async Task SendMessage(string message)
        {
            string connectionId = Context.ConnectionId;
            // نجيب اسم اليوزر بناءً على الـ ConnectionId بتاعه لمنع التزوير
            if (Users.TryGetValue(connectionId, out string? username))
            {
                await Clients.All.SendAsync("ReceiveMessage", username, message);
            }
        }

        // 3. عند قطع الاتصال (قفل الصفحة مثلاً)
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            string connectionId = Context.ConnectionId;
            if (Users.TryRemove(connectionId, out string? username))
            {
                // تحديث القائمة عند باقي الناس
                await Clients.All.SendAsync("UpdateUserList", Users.Values.Distinct().ToList());
                await Clients.All.SendAsync("ReceiveMessage", "System", $"{username} left the chat.");
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}