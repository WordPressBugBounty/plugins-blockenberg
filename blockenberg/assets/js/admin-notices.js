(function ($) {
    'use strict';
    $(function () {
        var body = document.getElementById('wpbody-content');
        if (!body) return;
        var roots = '#bkbg-template-catalog,#bkbg-dashboard,.bkbg-ai-settings';
        var headers = '.bkbg-catalog-header,.bkbg-header,.bkbg-ai-settings-header';
        var notices = '.notice,.updated,.error,.update-nag,.fs-notice';
        var slot = document.createElement('div');
        slot.className = 'bkbg-admin-notices';
        slot.setAttribute('role', 'region');
        slot.setAttribute('aria-label', bkbgAdminNotices.label);
        slot.hidden = true;
        var queued = false;

        function placeNotices() {
            queued = false;
            var root = body.querySelector(roots);
            var header = root && root.querySelector(headers);
            if (!header) return;
            // Retain the original nodes and their dismissal handlers when catalog
            // navigation replaces the entire root through AJAX.
            if (header.nextElementSibling !== slot) header.after(slot);
            body.querySelectorAll(notices).forEach(function (notice) {
                if (slot.contains(notice)) return;
                var parent = notice.parentElement;
                if (!parent || parent.closest(notices)) return;
                if (header.contains(notice) || parent === root || parent === body) {
                    slot.appendChild(notice);
                }
            });
            slot.hidden = !slot.children.length;
        }
        function schedule() {
            if (queued) return;
            queued = true;
            window.requestAnimationFrame(placeNotices);
        }
        placeNotices();
        // Only child changes matter: no attribute polling or recurring timer.
        new MutationObserver(schedule).observe(body, { childList: true, subtree: true });
    });
})(jQuery);
