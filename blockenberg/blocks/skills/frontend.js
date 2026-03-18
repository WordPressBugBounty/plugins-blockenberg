(function () {
    'use strict';

    function animateSkills() {
        var wraps = document.querySelectorAll('.bkbg-skills[data-animate="1"]');
        if (!wraps.length) return;

        /* -- bars -- */
        var bars = document.querySelectorAll('.bkbg-skills[data-animate="1"] .bkbg-skills-fill');
        bars.forEach(function (el) { el.style.width = '0%'; });

        /* -- circles -- */
        var arcs = document.querySelectorAll('.bkbg-skills[data-animate="1"] .bkbg-skills-arc');
        arcs.forEach(function (el) {
            var circ = parseFloat(el.getAttribute('data-circ')) || 0;
            el.style.strokeDashoffset = circ;
        });

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var wrap = entry.target;

                /* animate bars within this wrap */
                var wrapBars = wrap.querySelectorAll('.bkbg-skills-fill');
                wrapBars.forEach(function (fill) {
                    var pct = parseFloat(fill.getAttribute('data-pct')) || 0;
                    fill.style.transition = 'width 0.9s ease';
                    fill.style.width = pct + '%';
                });

                /* animate circle arcs within this wrap */
                var wrapArcs = wrap.querySelectorAll('.bkbg-skills-arc');
                wrapArcs.forEach(function (arc) {
                    var pct = parseFloat(arc.getAttribute('data-pct')) || 0;
                    var circ = parseFloat(arc.getAttribute('data-circ')) || 0;
                    var target = circ - (pct / 100) * circ;
                    arc.style.transition = 'stroke-dashoffset 1.2s ease';
                    arc.style.strokeDashoffset = target;
                });

                io.unobserve(wrap);
            });
        }, { threshold: 0.2 });

        wraps.forEach(function (wrap) { io.observe(wrap); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', animateSkills);
    } else {
        animateSkills();
    }
}());
