(function () {
    'use strict';

    /* Gradient section – IntersectionObserver content entrance */
    document.querySelectorAll('.bkbg-gs-wrapper').forEach(function (wrapper) {
        var inner = wrapper.querySelector('.bkbg-gs-inner');
        if (!inner || !('IntersectionObserver' in window)) return;

        /* Animate content in when section enters viewport */
        var children = inner.children;
        Array.prototype.forEach.call(children, function (child) {
            child.style.opacity = '0';
            child.style.transform = 'translateY(22px)';
            child.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                Array.prototype.forEach.call(children, function (child, i) {
                    setTimeout(function () {
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                    }, i * 100);
                });
                io.unobserve(wrapper);
            });
        }, { threshold: 0.15 });

        io.observe(wrapper);
    });
})();
