(function () {
    'use strict';

    function initBusinessHours(wrap) {
        var highlightToday = wrap.getAttribute('data-highlight-today') === '1';
        var showStatus = wrap.getAttribute('data-show-status') === '1';
        var openText = wrap.getAttribute('data-open-text') || 'Open Now';
        var closedText = wrap.getAttribute('data-closed-text') || 'Closed Now';

        var rows = wrap.querySelectorAll('.bkbg-bh-row');
        var statusEl = wrap.querySelector('.bkbg-bh-status');

        // Get current day index (0 = Monday, 6 = Sunday)
        var now = new Date();
        var jsDay = now.getDay(); // 0 = Sunday
        var todayIndex = jsDay === 0 ? 6 : jsDay - 1;

        // Highlight today
        if (highlightToday) {
            rows.forEach(function (row, index) {
                if (index === todayIndex) {
                    row.classList.add('is-today');
                    // Add today badge if not exists
                    var dayEl = row.querySelector('.bkbg-bh-day');
                    if (dayEl && !dayEl.querySelector('.bkbg-bh-today-badge')) {
                        var badge = document.createElement('span');
                        badge.className = 'bkbg-bh-today-badge';
                        badge.textContent = 'Today';
                        dayEl.appendChild(badge);
                    }
                }
            });
        }

        // Check if currently open
        if (showStatus && statusEl) {
            var todayRow = rows[todayIndex];
            if (todayRow) {
                var isClosed = todayRow.getAttribute('data-closed') === '1';
                var openTime = todayRow.getAttribute('data-open');
                var closeTime = todayRow.getAttribute('data-close');

                var isOpen = false;

                if (!isClosed && openTime && closeTime) {
                    var currentMinutes = now.getHours() * 60 + now.getMinutes();
                    
                    var openParts = openTime.split(':');
                    var openMinutes = parseInt(openParts[0], 10) * 60 + parseInt(openParts[1], 10);
                    
                    var closeParts = closeTime.split(':');
                    var closeMinutes = parseInt(closeParts[0], 10) * 60 + parseInt(closeParts[1], 10);

                    // Handle overnight hours (close time < open time)
                    if (closeMinutes < openMinutes) {
                        isOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
                    } else {
                        isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
                    }
                }

                var statusTextEl = statusEl.querySelector('.bkbg-bh-status-text');
                if (statusTextEl) {
                    if (isOpen) {
                        statusEl.classList.remove('is-closed');
                        statusEl.classList.add('is-open');
                        statusTextEl.textContent = openText;
                    } else {
                        statusEl.classList.remove('is-open');
                        statusEl.classList.add('is-closed');
                        statusTextEl.textContent = closedText;
                    }
                }
            }
        }
    }

    function init() {
        var blocks = document.querySelectorAll('.bkbg-bh-wrap:not([data-initialized])');
        blocks.forEach(function (block) {
            block.setAttribute('data-initialized', '1');
            initBusinessHours(block);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('load', init);
})();
