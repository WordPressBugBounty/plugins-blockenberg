(function () {
    'use strict';

    /* ── Lightbox ──────────────────────────────────────────────────────────── */
    var lb = null;
    var lbImages = [];
    var lbIndex  = 0;

    function createLightbox() {
        if (lb) return lb;

        var overlay = document.createElement('div');
        overlay.className = 'bkbg-ig-lightbox';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Image lightbox');

        var inner = document.createElement('div');
        inner.className = 'bkbg-ig-lb-inner';

        var img = document.createElement('img');
        img.className = 'bkbg-ig-lb-img';
        img.alt = '';

        var caption = document.createElement('div');
        caption.className = 'bkbg-ig-lb-caption';

        var closeBtn = document.createElement('button');
        closeBtn.className = 'bkbg-ig-lb-close';
        closeBtn.setAttribute('aria-label', 'Close lightbox');
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', closeLightbox);

        var prevBtn = document.createElement('button');
        prevBtn.className = 'bkbg-ig-lb-prev';
        prevBtn.setAttribute('aria-label', 'Previous image');
        prevBtn.innerHTML = '&#8249;';
        prevBtn.addEventListener('click', function () { navigate(-1); });

        var nextBtn = document.createElement('button');
        nextBtn.className = 'bkbg-ig-lb-next';
        nextBtn.setAttribute('aria-label', 'Next image');
        nextBtn.innerHTML = '&#8250;';
        nextBtn.addEventListener('click', function () { navigate(1); });

        var counter = document.createElement('div');
        counter.className = 'bkbg-ig-lb-counter';

        inner.appendChild(img);
        inner.appendChild(caption);
        overlay.appendChild(inner);
        overlay.appendChild(closeBtn);
        overlay.appendChild(prevBtn);
        overlay.appendChild(nextBtn);
        overlay.appendChild(counter);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeLightbox();
        });

        document.addEventListener('keydown', function (e) {
            if (!overlay.classList.contains('is-open')) return;
            if (e.key === 'Escape')      closeLightbox();
            if (e.key === 'ArrowLeft')   navigate(-1);
            if (e.key === 'ArrowRight')  navigate(1);
        });

        lb = { overlay: overlay, img: img, caption: caption, counter: counter, prevBtn: prevBtn, nextBtn: nextBtn };
        return lb;
    }

    function openLightbox(images, index) {
        lbImages = images;
        lbIndex  = index;
        var l = createLightbox();
        showImage(l);
        l.overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        l.overlay.querySelector('.bkbg-ig-lb-close').focus();
    }

    function closeLightbox() {
        if (!lb) return;
        lb.overlay.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    function navigate(dir) {
        lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
        showImage(lb);
    }

    function showImage(l) {
        var entry = lbImages[lbIndex];
        l.img.style.opacity = '0';
        l.img.onload = function () { l.img.style.opacity = '1'; };
        l.img.src = entry.url;
        l.img.alt = entry.alt || '';
        l.caption.textContent = entry.caption || '';
        l.counter.textContent = (lbIndex + 1) + ' / ' + lbImages.length;
        l.prevBtn.style.display = lbImages.length < 2 ? 'none' : '';
        l.nextBtn.style.display = lbImages.length < 2 ? 'none' : '';
    }

    /* ── Init one gallery ──────────────────────────────────────────────────── */
    function initGallery(wrapper) {
        var grid = wrapper.querySelector('.bkbg-ig-grid');
        if (!grid) return;

        var useLightbox = grid.dataset.lightbox === '1';
        var items = Array.from(wrapper.querySelectorAll('.bkbg-ig-item'));

        /* Build image list for lightbox */
        var imageList = items.map(function (item) {
            var link = item.querySelector('.bkbg-ig-link');
            var img  = item.querySelector('.bkbg-ig-img');
            var cap  = item.querySelector('.bkbg-ig-caption');
            return {
                url    : link ? link.href : (img ? img.src : ''),
                alt    : img ? (img.alt || '') : '',
                caption: cap ? cap.textContent : ''
            };
        });

        /* Attach lightbox click handlers */
        if (useLightbox) {
            items.forEach(function (item, idx) {
                var link = item.querySelector('.bkbg-ig-lb-trigger');
                if (!link) return;
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    openLightbox(imageList, idx);
                });
            });
        }

        /* Filter bar */
        var filterBtns = Array.from(wrapper.querySelectorAll('.bkbg-ig-filter-btn'));
        if (filterBtns.length === 0) return;

        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var filter = btn.dataset.filter;
                filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
                btn.classList.add('is-active');

                items.forEach(function (item) {
                    if (filter === 'all' || item.dataset.category === filter) {
                        item.classList.remove('is-hidden');
                    } else {
                        item.classList.add('is-hidden');
                    }
                });
            });
        });
    }

    /* ── Init all ────────────────────────────────────────────────────────── */
    function initAll() {
        var galleries = document.querySelectorAll('.bkbg-ig-wrapper');
        galleries.forEach(initGallery);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
