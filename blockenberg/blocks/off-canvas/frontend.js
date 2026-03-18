/* Off-Canvas Drawer — frontend */
( function () {
  function init() {
    document.querySelectorAll('.bkoc-wrap[data-position]').forEach(function(wrap) {
      if (wrap._bkocInit) return;
      wrap._bkocInit = true;

      var trigger = wrap.querySelector('.bkoc-trigger');
      var drawer = wrap.querySelector('.bkoc-drawer');
      var overlay = wrap.querySelector('.bkoc-overlay');
      var closeBtn = wrap.querySelector('.bkoc-close');
      if (!trigger || !drawer) return;

      var closeOnOverlay = wrap.getAttribute('data-close-overlay') === '1';
      var closeOnEscape = wrap.getAttribute('data-close-escape') === '1';
      var overlayEnabled = wrap.getAttribute('data-overlay') === '1';

      function open() {
        wrap.classList.add('bkoc-open');
        trigger.setAttribute('aria-expanded','true');
        drawer.removeAttribute('aria-hidden');
        document.body.style.overflow = 'hidden';
        // focus first focusable element in drawer
        var firstFocusable = drawer.querySelector('button,a,input,[tabindex]:not([tabindex="-1"])');
        if (firstFocusable) setTimeout(function(){firstFocusable.focus();},50);
      }

      function close() {
        wrap.classList.remove('bkoc-open');
        trigger.setAttribute('aria-expanded','false');
        drawer.setAttribute('aria-hidden','true');
        document.body.style.overflow = '';
        trigger.focus();
      }

      trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        if (wrap.classList.contains('bkoc-open')) { close(); } else { open(); }
      });

      if (closeBtn) { closeBtn.addEventListener('click', close); }

      if (overlayEnabled && closeOnOverlay && overlay) {
        overlay.addEventListener('click', close);
      }

      if (closeOnEscape) {
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape' && wrap.classList.contains('bkoc-open')) { close(); }
        });
      }

      // trap focus within drawer when open
      drawer.addEventListener('keydown', function(e) {
        if (e.key !== 'Tab') return;
        var focusableEls = drawer.querySelectorAll('button,a,[tabindex]:not([tabindex="-1"]),input,textarea,select');
        if (!focusableEls.length) return;
        var first = focusableEls[0], last = focusableEls[focusableEls.length-1];
        if (e.shiftKey) { if (document.activeElement===first) { e.preventDefault(); last.focus(); } }
        else { if (document.activeElement===last) { e.preventDefault(); first.focus(); } }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}() );
