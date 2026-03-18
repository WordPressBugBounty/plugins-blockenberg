(function () {
    'use strict';

    /* ── Copy to clipboard ──────────────────────────────────────── */
    function setupCopy(coupon) {
        var btn = coupon.querySelector('.bkcp-copy-btn');
        if (!btn) return;

        var code        = btn.dataset.copy || '';
        var copiedLabel = coupon.dataset.copiedLabel || 'Copied!';
        var origLabel   = btn.textContent;

        btn.addEventListener('click', function () {
            navigator.clipboard.writeText(code).then(function () {
                btn.textContent = copiedLabel;
                btn.classList.add('copied');
                setTimeout(function () {
                    btn.textContent = origLabel;
                    btn.classList.remove('copied');
                }, 2000);
            }).catch(function () {
                // Fallback
                var ta = document.createElement('textarea');
                ta.value = code;
                ta.style.position = 'fixed';
                ta.style.opacity  = '0';
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); } catch (e) {}
                document.body.removeChild(ta);
                btn.textContent = copiedLabel;
                btn.classList.add('copied');
                setTimeout(function () {
                    btn.textContent = origLabel;
                    btn.classList.remove('copied');
                }, 2000);
            });
        });
    }

    /* ── Countdown ──────────────────────────────────────────────── */
    function setupCountdown(countdown) {
        var expiryStr = countdown.dataset.expiry;
        if (!expiryStr) { countdown.style.display = 'none'; return; }

        var target = new Date(expiryStr).getTime();
        if (isNaN(target)) { countdown.style.display = 'none'; return; }

        function tick() {
            var now  = Date.now();
            var diff = target - now;
            if (diff <= 0) {
                countdown.textContent = '(expired)';
                return;
            }
            var d = Math.floor(diff / 86400000);
            var h = Math.floor((diff % 86400000) / 3600000);
            var m = Math.floor((diff % 3600000) / 60000);
            var s = Math.floor((diff % 60000) / 1000);

            var parts = [];
            if (d > 0) parts.push(d + 'd');
            if (h > 0) parts.push(h + 'h');
            if (m > 0) parts.push(m + 'm');
            parts.push(s + 's');

            countdown.textContent = '(' + parts.join(' ') + ' left)';
        }

        tick();
        setInterval(tick, 1000);
    }

    function initCoupon(coupon) {
        setupCopy(coupon);
        coupon.querySelectorAll('.bkcp-countdown[data-expiry]').forEach(setupCountdown);
    }

    function init() {
        document.querySelectorAll('.bkcp-coupon').forEach(initCoupon);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
