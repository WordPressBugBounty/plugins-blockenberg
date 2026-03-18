/* Content Flip Box — frontend.js
   Handles click-trigger flip behaviour.
   Hover-trigger blocks are handled entirely in CSS.
*/
(function () {
    'use strict';

    function initFlipBoxes() {
        document.querySelectorAll('.bkbg-cfb-grid[data-trigger="click"]').forEach(function (grid) {
            grid.querySelectorAll('.bkbg-cfb-card').forEach(function (card) {
                card.addEventListener('click', function () {
                    card.classList.toggle('is-flipped');
                });
                card.style.cursor = 'pointer';
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFlipBoxes);
    } else {
        initFlipBoxes();
    }
})();
