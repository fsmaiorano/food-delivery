using Microsoft.AspNetCore.Mvc;
using WebApp.Models;

namespace WebApp.Controllers;

public class AuthenticationController : Controller
{
    public IActionResult Index()
    {
        return View();
    }

    public IActionResult DoLogin(AuthenticationViewModel model)
    {
        if (ModelState.IsValid)
        {
            return RedirectToAction("Index", "Home");
        }

        return View("Index", model);
    }
}