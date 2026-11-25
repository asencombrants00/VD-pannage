
/* Toggle navigation latérale sur toutes les pages qui chargent ce fichier */
(() => {
  const init = () => {
    const header = document.querySelector('.site-header');
    const toggle = document.getElementById('menu-toggle');
    if (!header || !toggle || toggle.dataset.sidebarReady === '1') return;
    toggle.dataset.sidebarReady = '1';
    const sync = () => {
      const closed = document.body.classList.contains('nav-collapsed');
      toggle.setAttribute('aria-expanded', String(!closed));
      toggle.setAttribute('aria-label', closed ? 'Ouvrir la navigation' : 'Fermer la navigation');
      toggle.title = closed ? 'Ouvrir la navigation' : 'Fermer la navigation';
    };
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      document.body.classList.toggle('nav-collapsed');
      sync();
    }, true);
    sync();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
