(function () {
    'use strict';

    document.querySelectorAll('.bkbg-ps-wrapper').forEach(function (wrapper) {
        /* ── Gallery thumbnails → main image swap ─────────────────── */
        var mainImg  = wrapper.querySelector('.bkbg-ps-main-img');
        var thumbBtns = wrapper.querySelectorAll('.bkbg-ps-thumb-btn');

        thumbBtns.forEach(function (btn, idx) {
            btn.addEventListener('click', function () {
                var src = btn.getAttribute('data-src');
                if (mainImg && src) {
                    mainImg.src = src;
                    mainImg.alt = btn.getAttribute('data-alt') || '';
                }
                thumbBtns.forEach(function (b, i) {
                    b.classList.toggle('is-active', i === idx);
                });
            });
        });

        /* ── Variant pills ────────────────────────────────────────── */
        var variantPills = wrapper.querySelectorAll('.bkbg-ps-variant-pill');
        variantPills.forEach(function (pill) {
            pill.addEventListener('click', function () {
                variantPills.forEach(function (p) { p.classList.remove('is-active'); });
                pill.classList.add('is-active');
            });
        });

        /* ── Size pills ───────────────────────────────────────────── */
        var sizePills = wrapper.querySelectorAll('.bkbg-ps-size-pill');
        sizePills.forEach(function (pill) {
            pill.addEventListener('click', function () {
                sizePills.forEach(function (p) { p.classList.remove('is-active'); });
                pill.classList.add('is-active');
            });
        });

        /* ── Description / Specs / Reviews tabs ──────────────────── */
        var tabNav    = wrapper.querySelector('.bkbg-ps-tab-nav');
        var tabBtns   = wrapper.querySelectorAll('.bkbg-ps-tab-btn');
        var tabPanels = wrapper.querySelectorAll('.bkbg-ps-tab-panel');

        function showTab(idx) {
            tabBtns.forEach(function (b, i) {
                b.classList.toggle('is-active', i === idx);
                b.setAttribute('aria-selected', i === idx ? 'true' : 'false');
            });
            tabPanels.forEach(function (p, i) {
                p.classList.toggle('is-active', i === idx);
                p.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
            });
        }

        tabBtns.forEach(function (btn, idx) {
            btn.addEventListener('click', function () { showTab(idx); });
        });

        if (tabNav) {
            tabNav.addEventListener('keydown', function (e) {
                var active = tabNav.querySelector('[aria-selected="true"]');
                var idx = Array.prototype.indexOf.call(tabBtns, active);
                if (e.key === 'ArrowRight') {
                    showTab((idx + 1) % tabBtns.length);
                    tabBtns[(idx + 1) % tabBtns.length].focus();
                    e.preventDefault();
                } else if (e.key === 'ArrowLeft') {
                    showTab((idx - 1 + tabBtns.length) % tabBtns.length);
                    tabBtns[(idx - 1 + tabBtns.length) % tabBtns.length].focus();
                    e.preventDefault();
                }
            });
        }

        /* ── Entrance animation ───────────────────────────────────── */
        if ('IntersectionObserver' in window) {
            var galleryCol = wrapper.querySelector('.bkbg-ps-gallery-col');
            var infoCol    = wrapper.querySelector('.bkbg-ps-info-col');
            [galleryCol, infoCol].forEach(function (el, i) {
                if (!el) return;
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.5s ease ' + (i * 0.12) + 's, transform 0.5s ease ' + (i * 0.12) + 's';
            });
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    io.unobserve(entry.target);
                });
            }, { threshold: 0.08 });
            [galleryCol, infoCol].forEach(function (el) { if (el) io.observe(el); });
        }
    });
})();
