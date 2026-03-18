/* ====================================================
   Announcement Strip — frontend.js
   Handles: dismissal (localStorage) + countdown timer
   ==================================================== */
(function () {
    'use strict';

    document.querySelectorAll('.bkbg-anst-wrap[data-close-id]').forEach(function (bar) {
        var closeId  = bar.dataset.closeId;
        var closeDays = parseInt(bar.dataset.closeDays || '7', 10);
        var storageKey = 'bkbg-anst-dismissed-' + closeId;

        /* Check if already dismissed and still within expiry */
        try {
            var expiry = localStorage.getItem(storageKey);
            if (expiry && Date.now() < parseInt(expiry, 10)) {
                bar.style.display = 'none';
                return; /* skip this bar entirely */
            }
        } catch(e) { /* localStorage might be blocked */ }

        /* Wire close button */
        var closeBtn = bar.querySelector('.bkbg-anst-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                bar.style.display = 'none';
                try {
                    var expireAt = closeDays > 0
                        ? Date.now() + closeDays * 86400000
                        : Date.now() + 9999 * 86400000; /* "forever" */
                    localStorage.setItem(storageKey, String(expireAt));
                } catch(e) { /* ignore */ }
            });
        }

        /* Countdown timer */
        var cdWrap = bar.querySelector('.bkbg-anst-countdown');
        if (cdWrap) {
            var endDateStr = cdWrap.dataset.countdown;
            if (!endDateStr) return;
            var endDate = new Date(endDateStr).getTime();
            var timerEl = cdWrap.querySelector('.bkbg-anst-cd-timer');
            if (!timerEl || isNaN(endDate)) return;

            function formatCountdown() {
                var diff = endDate - Date.now();
                if (diff <= 0) {
                    timerEl.textContent = 'Expired';
                    return;
                }
                var d = Math.floor(diff / 86400000);
                var h = Math.floor(diff % 86400000 / 3600000);
                var m = Math.floor(diff % 3600000  / 60000);
                var s = Math.floor(diff % 60000    / 1000);
                var hStr = String(h).padStart(2, '0');
                var mStr = String(m).padStart(2, '0');
                var sStr = String(s).padStart(2, '0');
                timerEl.textContent = (d ? d + 'd ' : '') + hStr + ':' + mStr + ':' + sStr;
            }

            formatCountdown(); /* immediate render */
            setInterval(formatCountdown, 1000);
        }
    });
})();
