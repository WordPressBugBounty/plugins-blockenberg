( function () {
  /**
   * Pricing Switcher frontend script.
   *
   * Toggles .bkpsw-monthly-active / .bkpsw-yearly-active on each switcher wrap,
   * and also toggles body.bkpsw-page-monthly / body.bkpsw-page-yearly so that
   * pricing-table blocks anywhere on the page can react via CSS.
   */

  function setActive( wrap, target ) {
    var btns   = wrap.querySelectorAll('.bkpsw-btn');
    btns.forEach(function(btn){
      var t = btn.dataset.target;
      btn.classList.toggle('bkpsw-active', t === target);
    });
    wrap.classList.toggle('bkpsw-monthly-active', target === 'monthly');
    wrap.classList.toggle('bkpsw-yearly-active',  target === 'yearly');

    // Body class for global CSS hooks
    document.body.classList.toggle('bkpsw-page-monthly', target === 'monthly');
    document.body.classList.toggle('bkpsw-page-yearly',  target === 'yearly');

    // Also update any same-page pricing-table blocks that have explicit price spans
    // They should mark their monthly/yearly spans with class "bkpsw-monthly" / "bkpsw-yearly"
    document.querySelectorAll('[class*="blockenberg-pricing"] .bkpsw-monthly, .bkpsw-price-monthly').forEach(function(el){
      el.style.display = (target === 'monthly') ? '' : 'none';
    });
    document.querySelectorAll('[class*="blockenberg-pricing"] .bkpsw-yearly, .bkpsw-price-yearly').forEach(function(el){
      el.style.display = (target === 'yearly') ? '' : 'none';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var switchers = document.querySelectorAll('.bkpsw-wrap[data-switcher]');
    if (!switchers.length) return;

    switchers.forEach(function(wrap){
      var defaultActive = wrap.dataset.default || 'monthly';

      // Apply default state
      setActive(wrap, defaultActive);

      // Listen for button clicks
      var btns = wrap.querySelectorAll('.bkpsw-btn');
      btns.forEach(function(btn){
        btn.addEventListener('click', function(){
          setActive(wrap, btn.dataset.target);
        });
      });
    });
  });
}() );
