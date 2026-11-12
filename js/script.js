
document.addEventListener("DOMContentLoaded", () => {
  const pages = document.querySelectorAll(".page");
  const pageLinks = document.querySelectorAll("[data-page-link]");
  const navLinks = document.querySelectorAll(".nav-link");
  const menuToggle = document.getElementById("menu-toggle");
  const mainNav = document.getElementById("main-nav");
  const yearElement = document.getElementById("current-year");

  function showPage(pageId) {
    const targetPage = document.getElementById(pageId);

    if (!targetPage) {
      return;
    }

    pages.forEach((page) => {
      page.classList.toggle("active", page.id === pageId);
    });

    navLinks.forEach((link) => {
      const isActive = link.dataset.pageLink === pageId;
      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    if (mainNav) {
      mainNav.classList.remove("open");
    }

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  pageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showPage(link.dataset.pageLink);
    });
  });

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});
