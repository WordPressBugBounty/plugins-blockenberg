(function () {
    'use strict';

    // Embed Block — lazy-load iframes on scroll for performance
    function initEmbeds() {
        var iframes = document.querySelectorAll('.bkbg-embed-iframe[loading="lazy"]');
        if (!iframes.length) return;

        // Modern browsers handle loading="lazy" natively on iframes
        // This is a fallback for older browsers
        if ('loading' in HTMLIFrameElement.prototype) return;

        if (!('IntersectionObserver' in window)) return;

        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var iframe = entry.target;
                var dataSrc = iframe.getAttribute('data-src');
                if (dataSrc) {
                    iframe.src = dataSrc;
                    iframe.removeAttribute('data-src');
                }
                obs.unobserve(iframe);
            });
        }, { rootMargin: '200px 0px' });

        iframes.forEach(function (iframe) {
            if (iframe.src && !iframe.getAttribute('data-src')) {
                iframe.setAttribute('data-src', iframe.src);
                iframe.removeAttribute('src');
            }
            obs.observe(iframe);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEmbeds);
    } else {
        initEmbeds();
    }
}());
