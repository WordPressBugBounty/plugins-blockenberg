/* Scroll To Top — frontend */
( function () {
  function init() {
    document.querySelectorAll('.bkstt-wrap[data-trigger]').forEach(function(wrap) {
      if (wrap._bksttInit) return;
      wrap._bksttInit = true;

      var btn = wrap.querySelector('.bkstt-btn');
      if (!btn) return;

      var trigger = parseInt(wrap.getAttribute('data-trigger'),10) || 400;
      var smooth = wrap.getAttribute('data-smooth') !== '0';
      var ticking = false;

      function update() {
        var scrollY = window.scrollY || window.pageYOffset;
        if (scrollY > trigger) {
          wrap.classList.add('bkstt-visible');
        } else {
          wrap.classList.remove('bkstt-visible');
        }
        ticking = false;
      }

      window.addEventListener('scroll', function() {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      }, {passive:true});

      btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
      });

      // Initial check
      update();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}() );
