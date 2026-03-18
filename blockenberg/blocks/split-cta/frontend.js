(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        /* Animate panels in when they scroll into view */
        if (!('IntersectionObserver' in window)) return;

        document.querySelectorAll('.bkbg-sct-section').forEach(function (section) {
            var panels = section.querySelectorAll('.bkbg-sct-panel');
            if (!panels.length) return;

            var observed = false;
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && !observed) {
                        observed = true;
                        panels.forEach(function (panel, i) {
                            panel.style.opacity = '0';
                            panel.style.transform = 'translateY(18px)';
                            panel.style.transition = 'opacity 0.45s ease ' + (i * 0.12) + 's, transform 0.45s ease ' + (i * 0.12) + 's';
                            requestAnimationFrame(function () {
                                requestAnimationFrame(function () {
                                    panel.style.opacity = '1';
                                    panel.style.transform = 'translateY(0)';
                                });
                            });
                        });
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.15 });

            observer.observe(section);
        });
    });
})();
