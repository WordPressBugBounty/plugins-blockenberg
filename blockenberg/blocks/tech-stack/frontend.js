wp.domReady(function () {
    document.querySelectorAll('.bkbg-ts-wrapper').forEach(function (wrapper) {
        /* ── Color-on-hover: grayscale toggle ─────────────────────────────── */
        if (wrapper.classList.contains('bkbg-ts-color-on-hover')) {
            wrapper.querySelectorAll('.bkbg-ts-item img').forEach(function (img) {
                var parent = img.closest('.bkbg-ts-item');
                parent.addEventListener('mouseenter', function () { img.style.filter = 'none'; });
                parent.addEventListener('mouseleave', function () { img.style.filter = 'grayscale(100%)'; });
            });
        }

        /* ── Animate on scroll ──────────────────────────────────────────────── */
        var items = wrapper.querySelectorAll('.bkbg-ts-item.bkbg-ts-anim');
        if (!items.length) return;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry, idx) {
                if (entry.isIntersecting) {
                    setTimeout(function () {
                        entry.target.classList.add('bkbg-ts-visible');
                    }, idx * 60);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        items.forEach(function (item) { io.observe(item); });
    });
});
