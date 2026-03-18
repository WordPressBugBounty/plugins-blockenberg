(function () {
    'use strict';

    function buildGallery(appEl, o) {
        if (!o.images || !o.images.length) return;

        var images = o.images;
        var current = 0;
        var autoTimer = null;

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-tgal-wrap';
        wrap.style.paddingTop = (o.paddingTop || 0) + 'px';
        wrap.style.paddingBottom = (o.paddingBottom || 0) + 'px';
        if (o.bgColor) wrap.style.background = o.bgColor;

        var inner = document.createElement('div');
        inner.className = 'bkbg-tgal-inner';
        inner.style.maxWidth = (o.maxWidth || 900) + 'px';
        inner.style.margin = '0 auto';

        var pos = o.thumbPosition || 'bottom';
        var container = document.createElement('div');
        container.className = 'bkbg-tgal-container pos-' + pos;
        container.style.gap = '12px';

        /* ── main image ── */
        var main = document.createElement('div');
        main.className = 'bkbg-tgal-main';
        main.style.borderRadius = (o.mainBorderRadius || 12) + 'px';
        main.style.overflow = 'hidden';
        main.style.background = o.mainBg || '#000';
        main.style.aspectRatio = (o.mainAspect || '16/9').replace('/', ' / ');
        main.style.position = 'relative';

        var mainImg = document.createElement('img');
        mainImg.className = 'bkbg-tgal-main-img';
        mainImg.src = images[0].url || '';
        mainImg.alt = images[0].alt || '';
        mainImg.style.objectFit = o.mainObjectFit || 'cover';
        main.appendChild(mainImg);

        /* caption */
        var caption = null;
        if (o.showCaptions) {
            caption = document.createElement('div');
            caption.className = 'bkbg-tgal-caption';
            caption.style.background = o.captionBg || 'rgba(0,0,0,0.6)';
            caption.style.color = o.captionColor || '#fff';
            caption.textContent = images[0].caption || '';
            if (!images[0].caption) caption.style.display = 'none';
            main.appendChild(caption);
        }

        /* counter */
        var counter = null;
        if (o.showCounter) {
            counter = document.createElement('div');
            counter.className = 'bkbg-tgal-counter';
            counter.style.background = o.counterBg || 'rgba(0,0,0,0.55)';
            counter.style.color = o.counterColor || '#fff';
            counter.textContent = '1 / ' + images.length;
            main.appendChild(counter);
        }

        /* zoom */
        if (o.showZoom) {
            var zoom = document.createElement('button');
            zoom.className = 'bkbg-tgal-zoom';
            zoom.style.background = o.zoomIconBg || 'rgba(0,0,0,0.45)';
            zoom.style.color = o.zoomIconColor || '#fff';
            zoom.innerHTML = '&#10138;';
            zoom.setAttribute('aria-label', 'Zoom image');
            zoom.addEventListener('click', function (e) {
                e.stopPropagation();
                openLightbox(current);
            });
            main.appendChild(zoom);
        }

        /* arrows */
        if (o.showArrows && images.length > 1) {
            var prevBtn = document.createElement('button');
            prevBtn.className = 'bkbg-tgal-arrow prev';
            prevBtn.style.background = o.arrowBg || 'rgba(0,0,0,0.45)';
            prevBtn.style.color = o.arrowColor || '#fff';
            prevBtn.innerHTML = '&#8249;';
            prevBtn.setAttribute('aria-label', 'Previous image');
            prevBtn.addEventListener('click', function () { goTo((current - 1 + images.length) % images.length); });

            var nextBtn = document.createElement('button');
            nextBtn.className = 'bkbg-tgal-arrow next';
            nextBtn.style.background = o.arrowBg || 'rgba(0,0,0,0.45)';
            nextBtn.style.color = o.arrowColor || '#fff';
            nextBtn.innerHTML = '&#8250;';
            nextBtn.setAttribute('aria-label', 'Next image');
            nextBtn.addEventListener('click', function () { goTo((current + 1) % images.length); });

            main.appendChild(prevBtn);
            main.appendChild(nextBtn);
        }

        /* ── thumbnail strip ── */
        var strip = document.createElement('div');
        strip.className = 'bkbg-tgal-strip';
        strip.style.gap = (o.thumbGap || 8) + 'px';

        var thumbEls = [];
        var thumbW = (o.thumbSize || 72) * 1.4;
        var thumbH = o.thumbSize || 72;
        var isVert = pos === 'left' || pos === 'right';

        images.forEach(function (img, idx) {
            var thumb = document.createElement('div');
            thumb.className = 'bkbg-tgal-thumb' + (idx === 0 ? ' is-active' : '');
            thumb.style.width = (isVert ? thumbH : thumbW) + 'px';
            thumb.style.height = thumbH + 'px';
            thumb.style.borderRadius = (o.thumbBorderRadius || 6) + 'px';
            thumb.style.backgroundImage = img.url ? 'url(' + img.url + ')' : 'none';
            thumb.style.backgroundColor = o.thumbBg || '#e5e7eb';
            thumb.style.border = (o.thumbActiveBorderWidth || 2) + 'px solid ' + (idx === 0 ? (o.thumbActiveBorder || '#6366f1') : 'transparent');
            thumb.style.transition = 'border-color 0.15s, opacity 0.15s';
            thumb.setAttribute('role', 'button');
            thumb.setAttribute('tabindex', '0');
            thumb.setAttribute('aria-label', img.title || img.alt || 'Image ' + (idx + 1));
            thumb.addEventListener('click', function () { goTo(idx); });
            thumb.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(idx); } });
            strip.appendChild(thumb);
            thumbEls.push(thumb);
        });

        /* ── switch image ── */
        function goTo(idx) {
            if (idx === current || idx < 0 || idx >= images.length) return;
            var prev = current;
            current = idx;

            var anim = o.animationType || 'fade';

            if (anim === 'fade') {
                mainImg.style.transition = 'opacity 0.3s ease';
                mainImg.style.opacity = '0';
                setTimeout(function () {
                    mainImg.src = images[idx].url || '';
                    mainImg.alt = images[idx].alt || '';
                    mainImg.style.opacity = '1';
                }, 300);
            } else {
                /* slide */
                mainImg.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                var dir = idx > prev ? 1 : -1;
                mainImg.style.transform = 'translateX(' + (-dir * 30) + 'px)';
                mainImg.style.opacity = '0';
                setTimeout(function () {
                    mainImg.src = images[idx].url || '';
                    mainImg.alt = images[idx].alt || '';
                    mainImg.style.transition = 'none';
                    mainImg.style.transform = 'translateX(' + (dir * 30) + 'px)';
                    mainImg.style.opacity = '0';
                    requestAnimationFrame(function () {
                        requestAnimationFrame(function () {
                            mainImg.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                            mainImg.style.transform = 'translateX(0)';
                            mainImg.style.opacity = '1';
                        });
                    });
                }, 310);
            }

            if (caption) {
                caption.textContent = images[idx].caption || '';
                caption.style.display = images[idx].caption ? '' : 'none';
            }
            if (counter) {
                counter.textContent = (idx + 1) + ' / ' + images.length;
            }

            /* update thumbs */
            thumbEls.forEach(function (th, ti) {
                th.classList.toggle('is-active', ti === idx);
                th.style.border = (o.thumbActiveBorderWidth || 2) + 'px solid ' + (ti === idx ? (o.thumbActiveBorder || '#6366f1') : 'transparent');
            });

            /* scroll active thumb into view */
            var activeTh = thumbEls[idx];
            if (activeTh && activeTh.scrollIntoView) {
                activeTh.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            }

            /* reset autoplay timer */
            if (o.autoPlay && autoTimer) {
                clearTimeout(autoTimer);
                scheduleAuto();
            }
        }

        /* ── auto-play ── */
        function scheduleAuto() {
            autoTimer = setTimeout(function () {
                goTo((current + 1) % images.length);
            }, o.autoPlayDelay || 4000);
        }

        if (o.autoPlay && images.length > 1) {
            scheduleAuto();
        }

        /* ── lightbox ── */
        function openLightbox(startIdx) {
            var lb = document.createElement('div');
            lb.className = 'bkbg-tgal-lightbox';

            var lbIdx = startIdx;

            var lbImg = document.createElement('img');
            lbImg.src = images[startIdx].url || '';
            lbImg.alt = images[startIdx].alt || '';
            lb.appendChild(lbImg);

            var closeBtn = document.createElement('button');
            closeBtn.className = 'bkbg-tgal-lb-close';
            closeBtn.innerHTML = '&times;';
            closeBtn.setAttribute('aria-label', 'Close');
            closeBtn.addEventListener('click', function () { document.body.removeChild(lb); });
            lb.appendChild(closeBtn);

            if (images.length > 1) {
                var lbPrev = document.createElement('button');
                lbPrev.className = 'bkbg-tgal-lb-arrow prev';
                lbPrev.innerHTML = '&#8249;';
                lbPrev.setAttribute('aria-label', 'Previous');
                lbPrev.addEventListener('click', function () {
                    lbIdx = (lbIdx - 1 + images.length) % images.length;
                    lbImg.src = images[lbIdx].url || '';
                    lbImg.alt = images[lbIdx].alt || '';
                });

                var lbNext = document.createElement('button');
                lbNext.className = 'bkbg-tgal-lb-arrow next';
                lbNext.innerHTML = '&#8250;';
                lbNext.setAttribute('aria-label', 'Next');
                lbNext.addEventListener('click', function () {
                    lbIdx = (lbIdx + 1) % images.length;
                    lbImg.src = images[lbIdx].url || '';
                    lbImg.alt = images[lbIdx].alt || '';
                });

                lb.appendChild(lbPrev);
                lb.appendChild(lbNext);
            }

            lb.addEventListener('click', function (e) {
                if (e.target === lb) document.body.removeChild(lb);
            });

            document.addEventListener('keydown', function lbKey(e) {
                if (e.key === 'Escape') { if (document.body.contains(lb)) document.body.removeChild(lb); document.removeEventListener('keydown', lbKey); }
                if (e.key === 'ArrowLeft') { lbIdx = (lbIdx - 1 + images.length) % images.length; lbImg.src = images[lbIdx].url || ''; lbImg.alt = images[lbIdx].alt || ''; }
                if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % images.length; lbImg.src = images[lbIdx].url || ''; lbImg.alt = images[lbIdx].alt || ''; }
            });

            document.body.appendChild(lb);
        }

        /* ── assemble ── */
        if (pos === 'top') {
            container.appendChild(strip);
            container.appendChild(main);
        } else if (pos === 'left') {
            container.appendChild(strip);
            container.appendChild(main);
        } else if (pos === 'right') {
            container.appendChild(main);
            container.appendChild(strip);
        } else {
            /* bottom (default) */
            container.appendChild(main);
            container.appendChild(strip);
        }

        inner.appendChild(container);
        wrap.appendChild(inner);

        appEl.parentNode.insertBefore(wrap, appEl);
        appEl.style.display = 'none';
    }

    function init() {
        document.querySelectorAll('.bkbg-tgal-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                images: [],
                thumbPosition: 'bottom',
                thumbSize: 72,
                thumbGap: 8,
                thumbBorderRadius: 6,
                mainAspect: '16/9',
                mainBorderRadius: 12,
                mainObjectFit: 'cover',
                showCaptions: true,
                showCounter: true,
                showZoom: true,
                showArrows: true,
                animationType: 'fade',
                autoPlay: false,
                autoPlayDelay: 4000,
                thumbActiveBorderWidth: 2,
                maxWidth: 900,
                paddingTop: 0,
                paddingBottom: 0,
                bgColor: '',
                mainBg: '#000000',
                captionBg: 'rgba(0,0,0,0.6)',
                captionColor: '#ffffff',
                counterBg: 'rgba(0,0,0,0.55)',
                counterColor: '#ffffff',
                thumbActiveBorder: '#6366f1',
                thumbBg: '#e5e7eb',
                arrowBg: 'rgba(0,0,0,0.45)',
                arrowColor: '#ffffff',
                zoomIconColor: '#ffffff',
                zoomIconBg: 'rgba(0,0,0,0.45)'
            }, opts);

            buildGallery(appEl, o);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
