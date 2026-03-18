wp.domReady(function () {
    document.querySelectorAll('.bkbg-fsc-wrapper').forEach(function (wrapper) {
        var rows = wrapper.querySelectorAll('.bkbg-fsc-row.bkbg-fsc-anim');
        if (!rows.length) return;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry, idx) {
                if (entry.isIntersecting) {
                    setTimeout(function () {
                        entry.target.classList.add('bkbg-fsc-visible');
                    }, idx * 120);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        rows.forEach(function (row) { io.observe(row); });
    });
});
