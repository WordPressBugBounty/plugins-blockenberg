/* Masonry Grid — frontend */
( function () {
  function normalizeColumns() {
    document.querySelectorAll('.bkmg-wrap').forEach(function (wrap) {
      var grid = wrap.querySelector('.bkmg-grid');
      if (!grid) return;

      // React inline styles for `columns` can serialize numbers as px (e.g. "3px"),
      // which makes the layout effectively invisible. Use unitless columnCount instead.
      var cols = wrap.style.getPropertyValue('--bkmg-cols');
      var gap = wrap.style.getPropertyValue('--bkmg-gap');
      var colCount = parseInt(cols, 10);
      if (!isNaN(colCount) && colCount > 0) {
        grid.style.columnCount = String(colCount);
        grid.style.removeProperty('columns');
        grid.style.columnWidth = 'auto';
        grid.style.removeProperty('column-width');
      }
      if (gap && String(gap).trim()) {
        grid.style.columnGap = String(gap).trim();
      }
    });
  }

  function initLightbox() {
    normalizeColumns();
    document.querySelectorAll('.bkmg-wrap[data-lightbox="1"]').forEach(function(wrap) {
      if (wrap._bkmgInit) return;
      wrap._bkmgInit = true;

      var lb = null;

      function openLightbox(src, alt) {
        if (lb) return;
        lb = document.createElement('div');
        lb.className = 'bkmg-lightbox';
        lb.setAttribute('role','dialog');
        lb.setAttribute('aria-modal','true');
        lb.setAttribute('aria-label',alt||'Image');

        var img = document.createElement('img');
        img.src = src;
        img.alt = alt||'';

        var closeBtn = document.createElement('button');
        closeBtn.className = 'bkmg-lightbox-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label','Close lightbox');

        lb.appendChild(img);
        lb.appendChild(closeBtn);
        document.body.appendChild(lb);
        document.body.style.overflow = 'hidden';

        function close() {
          if (lb) { document.body.removeChild(lb); lb=null; }
          document.body.style.overflow = '';
          document.removeEventListener('keydown', escHandler);
        }
        function escHandler(e) { if (e.key==='Escape') close(); }

        closeBtn.addEventListener('click', close);
        lb.addEventListener('click', function(e){ if (e.target===lb) close(); });
        document.addEventListener('keydown', escHandler);
      }

      wrap.querySelectorAll('.bkmg-item img, .bkmg-link img').forEach(function(img) {
        img.parentElement.style.cursor = 'zoom-in';
        img.parentElement.addEventListener('click', function(e) {
          e.preventDefault();
          openLightbox(img.src, img.alt);
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      normalizeColumns();
      initLightbox();
    });
  } else {
    normalizeColumns();
    initLightbox();
  }
}() );
