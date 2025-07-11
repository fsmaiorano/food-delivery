using Microsoft.AspNetCore.Mvc;

namespace WebApp.Controllers;

public class AuthenticationController : Controller
{
    // GET
    public IActionResult Index()
    {
        return View();
    }
}