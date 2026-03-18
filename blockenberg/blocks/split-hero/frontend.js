wp.domReady(function () {
    /* Split Hero layout is driven entirely by CSS.
       This file initialises any runtime enhancements. */

    document.querySelectorAll('.bkbg-sh-wrapper').forEach(function (wrapper) {
        /* ── Smooth entrance for content column ─────────────────────────── */
        var inner = wrapper.querySelector('.bkbg-sh-inner');
        if (!inner) return;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('bkbg-sh-ready');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        io.observe(inner);
    });
});
