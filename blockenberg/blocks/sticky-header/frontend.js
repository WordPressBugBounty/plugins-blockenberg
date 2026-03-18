(function () {
    'use strict';

    document.querySelectorAll('.bkbg-sth-header[data-sticky]').forEach(function (header) {
        var isSticky = header.dataset.sticky === '1';
        var shouldShrink = header.dataset.shrink === '1';

        if (!isSticky) return;

        var lastScrollY = 0;

        function handleScroll() {
            var scrollY = window.scrollY || window.pageYOffset;
            var isScrolled = scrollY > 10;

            if (isScrolled) {
                header.classList.add('bkbg-sth-is-scrolled');
            } else {
                header.classList.remove('bkbg-sth-is-scrolled');
            }

            if (shouldShrink && isScrolled) {
                header.classList.add('bkbg-sth-shrunk');
            } else {
                header.classList.remove('bkbg-sth-shrunk');
            }

            lastScrollY = scrollY;
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // init state

        /* ---- Mobile menu toggle ---- */
        var hamburger = header.querySelector('.bkbg-sth-hamburger');
        var mobileNav = header.querySelector('.bkbg-sth-mobile-nav');

        if (hamburger && mobileNav) {
            hamburger.addEventListener('click', function () {
                var expanded = hamburger.getAttribute('aria-expanded') === 'true';
                hamburger.setAttribute('aria-expanded', String(!expanded));
                mobileNav.setAttribute('aria-hidden', String(expanded));

                if (!expanded) {
                    mobileNav.removeAttribute('style');
                } else {
                    mobileNav.style.display = 'none';
                }
            });
        }
    });
})();
