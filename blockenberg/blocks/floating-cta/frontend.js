( function () {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.bkfcta-wrap').forEach(function (wrap) {
      var trigger  = parseInt(wrap.dataset.scrollTrigger, 10) || 0;
      var dismiss  = wrap.dataset.dismiss === '1';

      // Show immediately if no scroll trigger
      if (!trigger) {
        wrap.classList.add('bkfcta-visible');
      }

      // Handle scroll trigger
      if (trigger > 0) {
        function onScroll() {
          var scrolled = window.pageYOffset || document.documentElement.scrollTop;
          if (scrolled >= trigger) {
            wrap.classList.add('bkfcta-visible');
          } else {
            wrap.classList.remove('bkfcta-visible');
          }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      }

      // Handle dismiss button
      if (dismiss) {
        var dismissBtn = wrap.querySelector('.bkfcta-dismiss');
        if (dismissBtn) {
          dismissBtn.addEventListener('click', function (e) {
            e.preventDefault();
            wrap.classList.add('bkfcta-hidden');
          });
        }
      }
    });
  });
}() );
