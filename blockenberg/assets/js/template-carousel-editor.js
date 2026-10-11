/* Gutenberg adapter for the shared frontend carousel runtime. */
(function () {
    'use strict';
    window.bkbgTemplateCarouselEditor = function (root, behavior, positions, paused) {
        return window.bkbgTemplateCarousel(root, behavior, {
            editor: true, initialIndices: positions, paused: paused,
            onChange: function (track, page) { positions[track] = page; }
        });
    };
})();
