(function () {
    'use strict';

    document.querySelectorAll('.bkbg-tc-wrapper').forEach(function (wrapper) {
        if (!('IntersectionObserver' in window)) return;

        var leftCol  = wrapper.querySelector('.bkbg-tc-col--left');
        var rightCol = wrapper.querySelector('.bkbg-tc-col--right');

        if (leftCol) {
            leftCol.style.opacity  = '0';
            leftCol.style.transform = 'translateX(-28px)';
            leftCol.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
        }
        if (rightCol) {
            rightCol.style.opacity  = '0';
            rightCol.style.transform = 'translateX(28px)';
            rightCol.style.transition = 'opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s';
        }

        var observed = false;
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting || observed) return;
                observed = true;
                if (leftCol)  { leftCol.style.opacity = '1'; leftCol.style.transform = 'translateX(0)'; }
                if (rightCol) { rightCol.style.opacity = '1'; rightCol.style.transform = 'translateX(0)'; }
                io.disconnect();
            });
        }, { threshold: 0.1 });

        if (leftCol)  io.observe(leftCol);
        if (rightCol) io.observe(rightCol);
    });
})();
