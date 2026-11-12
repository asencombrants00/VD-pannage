
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page-section');

function showPage(pageId, scroll = true) {
  const targetPage = document.getElementById(pageId);

  if (!targetPage || !targetPage.classList.contains('page-section')) {
    return;
  }

  pages.forEach((page) => {
    page.classList.remove('active');
  });

  targetPage.classList.add('active');

  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${pageId}`;

    link.classList.toggle('active', isActive);

    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  if (nav) {
    nav.classList.remove('open');
  }

  if (menuButton) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Ouvrir le menu');
    menuButton.textContent = '☰';
  }

  if (scroll) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

// Navigation entre les pages

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const pageId = link.getAttribute('href').substring(1);
    const targetPage = document.getElementById(pageId);

    if (targetPage && targetPage.classList.contains('page-section')) {
      event.preventDefault();

      if (window.location.hash !== `#${pageId}`) {
        history.pushState(null, '', `#${pageId}`);
      }

      showPage(pageId);
    }
  });
});

// Menu mobile

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');

    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute(
      'aria-label',
      isOpen ? 'Fermer le menu' : 'Ouvrir le menu'
    );

    menuButton.textContent = isOpen ? '×' : '☰';
  });
}

// Boutons précédent et suivant du navigateur

window.addEventListener('popstate', () => {
  const pageId = window.location.hash.substring(1) || 'accueil';
  showPage(pageId, false);
});

// Page à afficher au chargement

const initialPage = window.location.hash.substring(1) || 'accueil';
showPage(initialPage, false);

// Année automatique dans le pied de page

const year = document.querySelector('#year');

if (year) {
  year.textContent = new Date().getFullYear();
}
