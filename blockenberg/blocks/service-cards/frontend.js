(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        initServiceCards();
    });

    function initServiceCards() {
        if (!('IntersectionObserver' in window)) return;

        document.querySelectorAll('.bkbg-sk-wrapper').forEach(function (wrapper) {
            /* Responsive column CSS vars from data attributes */
            var colsTablet = wrapper.dataset.colsTablet;
            var colsMobile = wrapper.dataset.colsMobile;

            if (colsTablet) wrapper.style.setProperty('--bkbg-sk-cols-tablet', colsTablet);
            if (colsMobile) wrapper.style.setProperty('--bkbg-sk-cols-mobile', colsMobile);

            /* Staggered card entrance animation */
            var cards = Array.from(wrapper.querySelectorAll('.bkbg-sk-card'));
            if (!cards.length) return;

            /* Hide cards initially */
            cards.forEach(function (card) {
                card.classList.add('bkbg-sk--hidden');
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
            });

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var card = entry.target;
                        var idx = cards.indexOf(card);
                        var delay = idx * 80; /* ms stagger */

                        setTimeout(function () {
                            card.style.opacity = '';
                            card.style.transform = '';
                            card.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
                            card.classList.remove('bkbg-sk--hidden');
                            card.classList.add('bkbg-sk--visible');
                        }, delay);

                        observer.unobserve(card);
                    }
                });
            }, { threshold: 0.12 });

            cards.forEach(function (card) {
                observer.observe(card);
            });
        });
    }
})();
