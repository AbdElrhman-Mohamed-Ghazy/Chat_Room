using Microsoft.AspNetCore.Mvc;

namespace SignalR_Test.Controllers
{
    public class ChatController1 : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
