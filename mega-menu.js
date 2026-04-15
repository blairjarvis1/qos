/* ── Mega Menu — header state ───────────────────────────────────── */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var header   = document.getElementById('site-header') || document.querySelector('.site-header');
    var megaItem = document.querySelector('.nav-item--mega');
    var megaMenu = document.querySelector('.mega-menu');
    if (!header || !megaItem) return;

    function open()  { header.classList.add('mega-open'); }
    function close() { header.classList.remove('mega-open'); }

    megaItem.addEventListener('mouseenter', open);
    megaItem.addEventListener('mouseleave', close);

    // Keep header white when mouse moves onto the fixed panel
    if (megaMenu) {
      megaMenu.addEventListener('mouseenter', open);
      megaMenu.addEventListener('mouseleave', close);
    }
  });
})();
