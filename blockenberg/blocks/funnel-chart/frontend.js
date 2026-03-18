(function () {
    function animateFunnel(wrap) {
        var stages = wrap.querySelectorAll('.bkbg-fn-stage-bar');
        stages.forEach(function (stage) {
            var targetWidth = stage.dataset.targetWidth;
            if (!targetWidth) return;
            stage.style.width = '0%';
            stage.style.opacity = '0';
            stage.style.transition = 'none';
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    stage.style.transition = 'width 0.55s cubic-bezier(0.25,0.8,0.25,1), opacity 0.3s';
                    stage.style.width = targetWidth;
                    stage.style.opacity = '1';
                });
            });
        });
    }

    function init() {
        var wraps = document.querySelectorAll('.bkbg-fn-card');
        if (!wraps.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                animateFunnel(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.15 });

        wraps.forEach(function (wrap) {
            /* Prepare target widths from inline style, then reset to 0 for animation */
            var stages = wrap.querySelectorAll('.bkbg-fn-stage-bar');
            stages.forEach(function (stage) {
                var currentW = stage.style.width || '100%';
                stage.dataset.targetWidth = currentW;
                stage.style.width = '0%';
                stage.style.opacity = '0';
            });
            observer.observe(wrap);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
