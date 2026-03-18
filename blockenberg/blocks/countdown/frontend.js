(function () {
    'use strict';

    function isSafeRedirectUrl(url) {
        if (!url) return false;
        var u = String(url).trim();
        if (!u) return false;
        if (/^\s*(javascript|data|vbscript):/i.test(u)) return false;
        // allow absolute http(s) or relative URLs/fragments
        return /^(https?:\/\/|\/|\.|\?|#)/i.test(u);
    }

    function clearEl(el) {
        while (el && el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }

    function pad(num) {
        return num < 10 ? '0' + num : String(num);
    }

    function getTimeRemaining(targetDate) {
        var now = new Date();
        var target = new Date(targetDate);
        var total = target - now;

        if (total <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, expired: true };
        }

        return {
            days: Math.floor(total / (1000 * 60 * 60 * 24)),
            hours: Math.floor((total / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((total / (1000 * 60)) % 60),
            seconds: Math.floor((total / 1000) % 60),
            total: total,
            expired: false
        };
    }

    // Get evergreen target date from localStorage or create new one
    function getEvergreenTarget(wrap, duration) {
        var storageKey = 'bkbg_cd_evergreen_' + (wrap.id || wrap.getAttribute('data-evergreen-id') || 'default');
        var stored = localStorage.getItem(storageKey);
        
        if (stored) {
            var storedDate = new Date(stored);
            // If stored date is still in future, use it
            if (storedDate > new Date()) {
                return stored;
            }
        }
        
        // Create new target date based on duration
        var now = new Date();
        var target = new Date(now.getTime() + duration);
        var isoString = target.toISOString();
        localStorage.setItem(storageKey, isoString);
        return isoString;
    }

    function initCountdown(wrap) {
        var target = wrap.getAttribute('data-target');
        var unitsConfig = wrap.getAttribute('data-units') || '';
        var showLabels = wrap.getAttribute('data-show-labels') === '1';
        var showSeparators = wrap.getAttribute('data-show-separators') === '1';
        var expiredAction = wrap.getAttribute('data-expired-action') || 'message';
        var expiredMessage = wrap.getAttribute('data-expired-message') || "Time's up!";
        var expiredRedirect = wrap.getAttribute('data-expired-redirect') || '';
        // Evergreen mode
        var evergreenMode = wrap.getAttribute('data-evergreen') === '1';
        var evergreenDuration = parseInt(wrap.getAttribute('data-evergreen-duration') || '86400000', 10); // default 24h in ms

        if (evergreenMode) {
            target = getEvergreenTarget(wrap, evergreenDuration);
        }

        if (!target) return;

        // Parse units config
        var units = [];
        unitsConfig.split('|').forEach(function (item) {
            if (!item) return;
            var parts = item.split(':');
            if (parts.length >= 2) {
                units.push({ key: parts[0], label: parts.slice(1).join(':') });
            }
        });

        var countdownEl = wrap.querySelector('.bkbg-cd-countdown');
        if (!countdownEl) return;

        var hasExpired = false;

        function render() {
            var time = getTimeRemaining(target);

            if (time.expired && !hasExpired) {
                hasExpired = true;
                
                // For evergreen mode, restart the countdown
                if (evergreenMode) {
                    var storageKey = 'bkbg_cd_evergreen_' + (wrap.id || wrap.getAttribute('data-evergreen-id') || 'default');
                    localStorage.removeItem(storageKey);
                    target = getEvergreenTarget(wrap, evergreenDuration);
                    hasExpired = false;
                    render();
                    return;
                }
                
                handleExpiration();
                return;
            }

            if (hasExpired) return;

            // Build DOM safely (avoid innerHTML)
            clearEl(countdownEl);
            units.forEach(function (unit, index) {
                var value = time[unit.key] !== undefined ? time[unit.key] : 0;
                var isLast = index === units.length - 1;
                var valueStr = pad(value);

                var unitEl = document.createElement('div');
                unitEl.className = 'bkbg-cd-unit';

                var digitEl = document.createElement('div');
                digitEl.className = 'bkbg-cd-digit';

                var numberEl = document.createElement('span');
                numberEl.className = 'bkbg-cd-number';
                numberEl.textContent = valueStr;
                digitEl.appendChild(numberEl);
                unitEl.appendChild(digitEl);

                if (showLabels) {
                    var labelEl = document.createElement('span');
                    labelEl.className = 'bkbg-cd-label';
                    labelEl.textContent = unit.label || '';
                    unitEl.appendChild(labelEl);
                }

                countdownEl.appendChild(unitEl);

                if (showSeparators && !isLast) {
                    var sep = document.createElement('span');
                    sep.className = 'bkbg-cd-separator';
                    sep.textContent = ':';
                    countdownEl.appendChild(sep);
                }
            });
        }

        function handleExpiration() {
            switch (expiredAction) {
                case 'message':
                    clearEl(wrap);
                    var msg = document.createElement('div');
                    msg.className = 'bkbg-cd-expired';
                    msg.textContent = expiredMessage || "Time's up!";
                    wrap.appendChild(msg);
                    break;
                case 'hide':
                    wrap.style.display = 'none';
                    break;
                case 'redirect':
                    if (isSafeRedirectUrl(expiredRedirect)) {
                        window.location.href = expiredRedirect;
                    }
                    break;
                case 'keep':
                    // Do nothing, keep showing 00:00:00
                    break;
            }
        }

        // Initial render
        render();

        // Update every second
        var interval = setInterval(function () {
            if (hasExpired && expiredAction !== 'keep') {
                clearInterval(interval);
                return;
            }
            render();
        }, 1000);
    }

    function init() {
        var countdowns = document.querySelectorAll('.bkbg-cd-wrap[data-target], .bkbg-cd-wrap[data-evergreen="1"]');
        countdowns.forEach(initCountdown);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


