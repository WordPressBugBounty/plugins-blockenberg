(function () {
    'use strict';

    function initBentoGrid() {
        var grids = document.querySelectorAll('.bkbg-bento-grid[data-animate="1"]');
        if (!grids.length) return;

        if (!('IntersectionObserver' in window)) {
            grids.forEach(function (grid) {
                grid.querySelectorAll('.bkbg-bento-cell').forEach(function (cell) {
                    cell.classList.add('is-visible');
                });
            });
            return;
        }

        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        grids.forEach(function (grid) {
            grid.querySelectorAll('.bkbg-bento-cell').forEach(function (cell) {
                obs.observe(cell);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBentoGrid);
    } else {
        initBentoGrid();
    }
}());
