(function () {
    'use strict';

    function reducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function initStickyScroll(wrap) {
        if (wrap.dataset.activate !== '1') return;

        var panels   = Array.prototype.slice.call(wrap.querySelectorAll('.bkss-panel'));
        var imageWrap = wrap.querySelector('.bkss-image-wrap');

        if (!panels.length || !imageWrap) return;

        // Reduced motion: keep all panels fully visible, skip crossfade
        if (reducedMotion()) {
            panels.forEach(function (p) { p.classList.add('bkss-active'); });
            return;
        }

        var activeIdx = 0;

        function setActive(idx) {
            if (idx === activeIdx) return;
            activeIdx = idx;
            panels.forEach(function (p, i) {
                p.classList.toggle('bkss-active', i === idx);
            });

            // Swap pinned image (crossfade)
            var newUrl = panels[idx].dataset.image || '';
            var existing = imageWrap.querySelector('img, .bkss-placeholder');
            if (!newUrl) {
                if (existing && existing.tagName === 'IMG') {
                    existing.style.opacity = '0.4';
                }
                return;
            }

            // Check if same image
            if (existing && existing.tagName === 'IMG' && existing.src === newUrl) {
                existing.style.opacity = '1';
                return;
            }

            // Build new image, fade in
            var img = document.createElement('img');
            img.src = newUrl;
            img.alt = '';
            img.style.width = '100%';
            img.style.display = 'block';
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.35s ease';

            // Copy border-radius from existing image
            if (existing) {
                img.style.borderRadius = getComputedStyle(existing).borderRadius;
                img.style.boxShadow    = getComputedStyle(existing).boxShadow;
            }

            img.onload = function () {
                // Fade out old, fade in new
                if (existing) {
                    existing.style.transition = 'opacity 0.2s ease';
                    existing.style.opacity = '0';
                    setTimeout(function () {
                        if (existing.parentNode) existing.parentNode.removeChild(existing);
                    }, 220);
                }
                imageWrap.appendChild(img);
                requestAnimationFrame(function () {
                    img.style.opacity = '1';
                });
            };
        }

        // IntersectionObserver — each panel triggers when it crosses center of viewport
        var observers = [];

        panels.forEach(function (panel, idx) {
            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        setActive(idx);
                    }
                });
            }, { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' });

            obs.observe(panel);
            observers.push(obs);
        });

        // Initialise with first panel active
        panels[0] && panels[0].classList.add('bkss-active');
    }

    function init() {
        document.querySelectorAll('.bkss-wrap').forEach(initStickyScroll);
    }

    if (typeof IntersectionObserver === 'undefined') {
        // Fallback: show all panels fully
        document.querySelectorAll('.bkss-panel').forEach(function (p) {
            p.style.opacity = '1';
        });
        return;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());
