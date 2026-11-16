
document.addEventListener('DOMContentLoaded', () => {
  const pages = [...document.querySelectorAll('.page')];
  const pageLinks = document.querySelectorAll('[data-page-link]');
  const navLinks = document.querySelectorAll('.nav-link');
  const menuToggle = document.getElementById('menu-toggle');
  const sidePanel = document.getElementById('side-panel');
  const sidebarToggle = document.getElementById('sidebar-toggle');

  function closeMobileMenu() {
    sidePanel?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Ouvrir le menu');
  }

  function showPage(pageId) {
    if (!document.getElementById(pageId)) return;

    pages.forEach(page => {
      page.classList.toggle('active', page.id === pageId);
    });

    navLinks.forEach(link => {
      const active = link.dataset.pageLink === pageId;
      link.classList.toggle('active', active);

      if (active) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  pageLinks.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      showPage(link.dataset.pageLink);
    });
  });

  sidebarToggle?.addEventListener('click', () => {
    const collapsed = document.body.classList.toggle('sidebar-collapsed');

    sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
    sidebarToggle.setAttribute(
      'aria-label',
      collapsed ? 'Ouvrir la navigation' : 'Fermer la navigation'
    );
    sidebarToggle.title = collapsed
      ? 'Ouvrir la navigation'
      : 'Rétracter la navigation';

    const arrow = sidebarToggle.querySelector('span');
    if (arrow) arrow.textContent = collapsed ? '›' : '‹';

    if (window.matchMedia('(max-width: 650px)').matches && collapsed) {
      closeMobileMenu();
    }
  });

  menuToggle?.addEventListener('click', () => {
    const open = sidePanel.classList.toggle('open');

    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute(
      'aria-label',
      open ? 'Fermer le menu' : 'Ouvrir le menu'
    );
  });

  document.querySelectorAll('.footer-track span').forEach(span => {
    span.textContent =
      `© ${new Date().getFullYear()} V Dépannage — Tous droits réservés.`;
  });
});
