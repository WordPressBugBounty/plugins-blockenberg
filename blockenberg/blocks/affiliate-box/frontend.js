(function () {
    'use strict';

    document.querySelectorAll('.bkbg-ab-wrapper').forEach(function (wrapper) {
        /* ── Score count-up animation ────────────────────────────── */
        var scoreEl = wrapper.querySelector('.bkbg-ab-score-number');
        if (!scoreEl) return;

        var target  = parseFloat(scoreEl.textContent) || 0;
        var duration = 1200;
        var hasRun   = false;

        function animateScore() {
            if (hasRun) return;
            hasRun = true;
            var start = null;
            var isDecimal = String(target).includes('.');
            var decimals  = isDecimal ? (String(target).split('.')[1] || '').length : 0;

            function step(ts) {
                if (!start) start = ts;
                var progress = Math.min((ts - start) / duration, 1);
                var ease = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
                var val  = target * ease;
                scoreEl.textContent = isDecimal ? val.toFixed(decimals) : Math.round(val);
                if (progress < 1) requestAnimationFrame(step);
                else scoreEl.textContent = isDecimal ? target.toFixed(decimals) : target;
            }
            requestAnimationFrame(step);
        }

        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    animateScore();
                    io.unobserve(entry.target);
                });
            }, { threshold: 0.3 });
            io.observe(scoreEl);
        } else {
            animateScore();
        }

        /* ── Card entrance animation ─────────────────────────────── */
        if ('IntersectionObserver' in window) {
            var card = wrapper.querySelector('.bkbg-ab-card');
            if (card) {
                card.style.opacity = '0';
                card.style.transform = 'translateY(18px)';
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                var ioCard = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (!entry.isIntersecting) return;
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        ioCard.unobserve(entry.target);
                    });
                }, { threshold: 0.1 });
                ioCard.observe(card);
            }
        }
    });
})();
