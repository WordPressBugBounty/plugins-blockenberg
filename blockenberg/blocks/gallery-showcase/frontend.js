(function () {
    'use strict';

    document.querySelectorAll('.bkbg-gs-wrapper').forEach(function (wrap) {
        var mainEl    = wrap.querySelector('.bkbg-gs-main');
        if (!mainEl) return;

        var slides    = [].slice.call(wrap.querySelectorAll('.bkbg-gs-slide'));
        var thumbBtns = [].slice.call(wrap.querySelectorAll('.bkbg-gs-thumb'));
        var prevBtn   = wrap.querySelector('.bkbg-gs-arrow--prev');
        var nextBtn   = wrap.querySelector('.bkbg-gs-arrow--next');
        var counter   = wrap.querySelector('.bkbg-gs-counter');
        var caption   = wrap.querySelector('.bkbg-gs-caption');
        var belowCap  = wrap.querySelector('.bkbg-gs-below-caption');
        var lbTrigger = wrap.querySelector('.bkbg-gs-lightbox-trigger');
        var enableLb  = wrap.getAttribute('data-lightbox') === '1';
        var enableKbd = wrap.getAttribute('data-keyboard') === '1';
        var transition= mainEl.getAttribute('data-transition') || 'fade';
        var duration  = parseInt(mainEl.getAttribute('data-duration') || '320', 10);

        var current = 0;
        var total   = slides.length;
        if (!total) return;

        /* Caption data: pull from slide img alt or dedicated attribute if present */
        var captions = slides.map(function (s) {
            var img = s.querySelector('img');
            return (img && img.getAttribute('data-caption')) || (img && img.alt) || '';
        });

        function goTo(idx, animate) {
            idx = ((idx % total) + total) % total;
            if (idx === current && animate !== false) return;

            var prev = slides[current];
            var next = slides[idx];
            current = idx;

            if (transition === 'slide' && animate !== false) {
                var dir = idx > (current < idx ? current : idx) ? 1 : -1;
                prev.style.transition = 'none';
                next.style.transition = 'none';
                next.style.display    = '';
                next.style.position   = 'absolute';
                next.style.top = '0'; next.style.left = '0'; next.style.width = '100%';
                next.style.transform  = 'translateX(' + (100) + '%)';
                requestAnimationFrame(function () {
                    prev.style.transition = 'transform ' + duration + 'ms ease';
                    next.style.transition = 'transform ' + duration + 'ms ease';
                    prev.style.transform  = 'translateX(-100%)';
                    next.style.transform  = 'translateX(0)';
                    setTimeout(function () {
                        prev.style.display = 'none';
                        prev.style.transform = '';
                        prev.style.position = '';
                        next.style.position = '';
                        slides.forEach(function (s, i) { s.classList.toggle('is-active', i === current); });
                    }, duration);
                });
            } else {
                slides.forEach(function (s, i) {
                    s.style.display = i === idx ? '' : 'none';
                    s.classList.toggle('is-active', i === idx);
                });
            }

            /* Thumbs */
            thumbBtns.forEach(function (t, i) { t.classList.toggle('is-active', i === current); });

            /* Counter */
            if (counter) counter.textContent = (current + 1) + ' / ' + total;

            /* Caption */
            var capText = captions[current] || '';
            if (caption) caption.textContent = capText;
            if (belowCap) belowCap.textContent = capText;
        }

        /* Thumb clicks */
        thumbBtns.forEach(function (btn, i) {
            btn.addEventListener('click', function () { goTo(i); });
        });

        /* Arrows */
        if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });

        /* Keyboard */
        if (enableKbd) {
            document.addEventListener('keydown', function (e) {
                /* Only react when no lightbox is open, or when lightbox is open */
                if (e.key === 'ArrowLeft')  goTo(current - 1);
                if (e.key === 'ArrowRight') goTo(current + 1);
                if (e.key === 'Escape' && enableLb) closeLightbox();
            });
        }

        /* Lightbox */
        var lbEl = null;
        function openLightbox() {
            if (lbEl) return;
            lbEl = document.createElement('div');
            lbEl.className = 'bkbg-gs-lightbox';
            var img = document.createElement('img');
            var src = (slides[current] && slides[current].querySelector('img') && slides[current].querySelector('img').src) || '';
            img.src = src;
            img.alt = captions[current] || '';
            var closeBtn = document.createElement('button');
            closeBtn.className = 'bkbg-gs-lightbox-close';
            closeBtn.textContent = '×';
            closeBtn.addEventListener('click', closeLightbox);
            var prevLb = document.createElement('button');
            prevLb.className = 'bkbg-gs-arrow bkbg-gs-arrow--prev bkbg-gs-arrow--circle';
            prevLb.textContent = '‹';
            prevLb.addEventListener('click', function () { goTo(current - 1); updateLbImg(); });
            var nextLb = document.createElement('button');
            nextLb.className = 'bkbg-gs-arrow bkbg-gs-arrow--next bkbg-gs-arrow--circle';
            nextLb.textContent = '›';
            nextLb.addEventListener('click', function () { goTo(current + 1); updateLbImg(); });
            lbEl.appendChild(img);
            lbEl.appendChild(closeBtn);
            lbEl.appendChild(prevLb);
            lbEl.appendChild(nextLb);
            lbEl.addEventListener('click', function (e) { if (e.target === lbEl) closeLightbox(); });
            document.body.appendChild(lbEl);
            document.body.style.overflow = 'hidden';

            function updateLbImg() {
                var s = slides[current] && slides[current].querySelector('img');
                img.src = s ? s.src : '';
                img.alt = captions[current] || '';
            }
            lbEl._updateLbImg = updateLbImg;
        }
        function closeLightbox() {
            if (lbEl) { lbEl.remove(); lbEl = null; document.body.style.overflow = ''; }
        }
        if (enableLb && lbTrigger) {
            lbTrigger.addEventListener('click', openLightbox);
        }

        /* Swipe support */
        var touchStartX = 0;
        mainEl.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
        mainEl.addEventListener('touchend', function (e) {
            var dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
        }, { passive: true });

        /* Init */
        goTo(0, false);
    });
})();
