wp.domReady(function () {
    document.querySelectorAll('.bkbg-vt-wrapper').forEach(function (wrapper) {
        /* ── Video click → iframe inject ──────────────────────────────────── */
        wrapper.querySelectorAll('.bkbg-vt-video-wrap').forEach(function (wrap) {
            wrap.addEventListener('click', function () {
                var embedUrl = wrap.getAttribute('data-embed');
                if (!embedUrl) return;

                var iframe = document.createElement('iframe');
                iframe.src = embedUrl;
                iframe.allow = 'autoplay; fullscreen';
                iframe.allowFullscreen = true;

                /* clear thumbnail + overlay, inject iframe */
                while (wrap.firstChild) { wrap.removeChild(wrap.firstChild); }
                wrap.appendChild(iframe);
                wrap.style.cursor = 'default';
            });
        });

        /* ── Animate on scroll ──────────────────────────────────────────────── */
        var cards = wrapper.querySelectorAll('.bkbg-vt-card.bkbg-vt-anim');
        if (!cards.length) return;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry, idx) {
                if (entry.isIntersecting) {
                    setTimeout(function () {
                        entry.target.classList.add('bkbg-vt-visible');
                    }, idx * 90);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(function (card) { io.observe(card); });
    });
});
