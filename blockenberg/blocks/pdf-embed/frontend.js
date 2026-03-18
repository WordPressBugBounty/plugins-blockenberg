/* PDF Embed – frontend.js
   The PDF viewer is a native <iframe> — no JavaScript is required.
   This file is reserved for future enhancements (e.g., lazy-load iframes,
   PDF.js integration, or responsive height adjustments). */
(function () {
    'use strict';

    /* Optional: make iframes respect aspect ratio on resize */
    function resizePdfViewers() {
        document.querySelectorAll('.bkbg-pdf-viewer').forEach(function (viewer) {
            var iframe = viewer.querySelector('.bkbg-pdf-iframe');
            if (!iframe) return;
            /* height is set via inline style — no action needed
               unless the user wants responsive height in the future */
        });
    }

    document.addEventListener('DOMContentLoaded', resizePdfViewers);
})();
