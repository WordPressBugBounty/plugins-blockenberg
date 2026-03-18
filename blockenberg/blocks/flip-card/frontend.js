/* Flip Card — frontend.js
   Handles click-to-flip and keyboard (Enter/Space) for click-trigger cards. */
(function () {
    document.querySelectorAll('.bkbg-fc-outer[data-flip-trigger="click"]').forEach(function (card) {
        card.addEventListener('click', function () {
            var flipped = card.getAttribute('data-flipped') === 'true';
            card.setAttribute('data-flipped', flipped ? 'false' : 'true');
        });
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
})();
