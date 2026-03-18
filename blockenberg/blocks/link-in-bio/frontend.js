(function () {
    'use strict';

    /* Link in Bio — minimal frontend: hover is CSS only; this script
       adds optional click analytics hook and keyboard accessibility.  */

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-lib-wrapper').forEach(function (wrapper) {
            var links = wrapper.querySelectorAll('.bkbg-lib-btn');

            links.forEach(function (link) {
                /* Keyboard: Enter / Space already works for <a> natively.
                   This is a safety net for any edge cases.               */
                link.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        link.click();
                    }
                });

                /* Fire custom event so developers can hook analytics     */
                link.addEventListener('click', function () {
                    var event = new CustomEvent('bkbg:lib:click', {
                        bubbles: true,
                        detail: { label: link.textContent.trim(), href: link.href }
                    });
                    link.dispatchEvent(event);
                });
            });
        });
    });
})();
