/* Lightbox Gallery — frontend.js */
( function () {
  function initGallery( wrap ) {
    const items  = Array.from( wrap.querySelectorAll( '.bklg-item[data-src]' ) );
    const showCaptions = wrap.dataset.captions === '1';
    if ( ! items.length ) return;

    const images = items.map( item => ({ src: item.dataset.src, caption: item.dataset.caption || '' }) );
    let current = 0;
    let lb = null;

    function openLightbox( idx ) {
      current = idx;
      lb = document.createElement('div');
      lb.className = 'bklg-lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');

      const inner   = document.createElement('div'); inner.className = 'bklg-lb-inner';
      const img     = document.createElement('img'); img.className = 'bklg-lb-img';
      const counter = document.createElement('div'); counter.className = 'bklg-lb-counter';
      const close   = document.createElement('button'); close.className = 'bklg-lb-close'; close.innerHTML = '&times;'; close.setAttribute('aria-label', 'Close');
      const prev    = document.createElement('button'); prev.className = 'bklg-lb-prev'; prev.innerHTML = '&#8249;'; prev.setAttribute('aria-label', 'Previous');
      const next    = document.createElement('button'); next.className = 'bklg-lb-next'; next.innerHTML = '&#8250;'; next.setAttribute('aria-label', 'Next');

      function show( i ) {
        current = ( i + images.length ) % images.length;
        img.src = images[current].src;
        counter.textContent = ( current + 1 ) + ' / ' + images.length;
        caption.textContent = images[current].caption || '';
      }

      const caption = document.createElement('p'); caption.className = 'bklg-lb-caption';

      inner.appendChild(img);
      if ( showCaptions ) inner.appendChild(caption);
      lb.appendChild(inner);
      lb.appendChild(close);
      if ( images.length > 1 ) { lb.appendChild(prev); lb.appendChild(next); }
      lb.appendChild(counter);
      document.body.appendChild(lb);
      document.body.style.overflow = 'hidden';
      show(idx);

      close.addEventListener('click', closeLightbox);
      lb.addEventListener('click', function(e){ if(e.target===lb) closeLightbox(); });
      prev.addEventListener('click', function(e){ e.stopPropagation(); show(current-1); });
      next.addEventListener('click', function(e){ e.stopPropagation(); show(current+1); });

      document.addEventListener('keydown', onKey);

      // Touch swipe
      let tx = 0;
      lb.addEventListener('touchstart', e=>{ tx=e.changedTouches[0].clientX; }, {passive:true});
      lb.addEventListener('touchend',   e=>{ const dx=e.changedTouches[0].clientX-tx; if(Math.abs(dx)>50) show(dx<0?current+1:current-1); }, {passive:true});
    }

    function closeLightbox() {
      if (lb) { lb.remove(); lb=null; }
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    }

    function onKey(e) {
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  { const p = lb && lb.querySelector('.bklg-lb-prev'); p && p.click(); }
      if (e.key === 'ArrowRight') { const n = lb && lb.querySelector('.bklg-lb-next'); n && n.click(); }
    }

    items.forEach( function(item, i) {
      item.querySelector('.bklg-thumb').addEventListener('click', function() { openLightbox(i); });
      item.querySelector('.bklg-thumb').style.cursor = 'zoom-in';
    });
  }

  function init() {
    document.querySelectorAll('.bklg-wrap[data-lightbox]').forEach(initGallery);
  }

  if ( document.readyState === 'loading' ) {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}() );
