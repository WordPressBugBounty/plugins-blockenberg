(function () {
    function initVideoGrid(wrapper) {
        var filterBtns = wrapper.querySelectorAll('.bkbg-vg-filter-btn');
        var cards      = wrapper.querySelectorAll('.bkbg-vg-card');
        var modal      = wrapper.querySelector('.bkbg-vg-modal');
        var modalClose = modal ? modal.querySelector('.bkbg-vg-modal-close') : null;
        var iframeWrap = modal ? modal.querySelector('.bkbg-vg-modal-iframe-wrap') : null;
        var overlay    = modal ? modal.querySelector('.bkbg-vg-modal-overlay') : null;

        /* ── Filter ─────────────────────────────────────────────────── */
        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var cat = btn.dataset.category || '';

                filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
                btn.classList.add('is-active');

                cards.forEach(function (card) {
                    if (!cat || card.dataset.category === cat) {
                        card.classList.remove('is-hidden');
                    } else {
                        card.classList.add('is-hidden');
                    }
                });
            });
        });

        /* ── Staggered entrance animation ───────────────────────────── */
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var card = entry.target;
                var delay = parseInt(card.dataset.animDelay, 10) || 0;
                setTimeout(function () {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, delay);
                observer.unobserve(card);
            });
        }, { threshold: 0.1 });

        cards.forEach(function (card, idx) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.dataset.animDelay = idx * 60;
            observer.observe(card);
        });

        /* ── Lightbox ───────────────────────────────────────────────── */
        if (!modal) return;

        function openModal(embedUrl) {
            if (!iframeWrap) return;
            iframeWrap.innerHTML = '<iframe src="' + embedUrl + '" allow="autoplay; fullscreen" allowfullscreen></iframe>';
            modal.removeAttribute('hidden');
            document.body.style.overflow = 'hidden';
            if (modalClose) modalClose.focus();
        }

        function closeModal() {
            modal.setAttribute('hidden', '');
            document.body.style.overflow = '';
            if (iframeWrap) iframeWrap.innerHTML = '';
        }

        cards.forEach(function (card) {
            var playBtn = card.querySelector('.bkbg-vg-play-btn');
            if (!playBtn) return;
            playBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                var embedUrl = card.dataset.embedUrl;
                if (embedUrl) openModal(embedUrl);
            });
            card.addEventListener('click', function () {
                var embedUrl = card.dataset.embedUrl;
                if (embedUrl) openModal(embedUrl);
            });
        });

        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }
        if (overlay) {
            overlay.addEventListener('click', closeModal);
        }
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
                closeModal();
            }
        });
    }

    function init() {
        var wrappers = document.querySelectorAll('.bkbg-vg-wrapper');
        wrappers.forEach(initVideoGrid);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
