/* Scroll Reveal — frontend */
(function () {
    'use strict';

    /* map animation name → { initial transform, optional extra } */
    function getInitialTransform(animation, distance, scale, rotate) {
        var d = distance + 'px';
        switch (animation) {
            case 'fade-up':     return 'translateY(' + d + ')';
            case 'fade-down':   return 'translateY(-' + d + ')';
            case 'fade-left':   return 'translateX(' + d + ')';
            case 'fade-right':  return 'translateX(-' + d + ')';
            case 'slide-up':    return 'translateY(' + d + ')';
            case 'slide-down':  return 'translateY(-' + d + ')';
            case 'slide-left':  return 'translateX(' + d + ')';
            case 'slide-right': return 'translateX(-' + d + ')';
            case 'zoom-in':     return 'scale(' + (scale / 100) + ')';
            case 'zoom-out':    return 'scale(' + (scale > 100 ? scale / 100 : 1.1) + ')';
            case 'flip-left':   return 'perspective(600px) rotateY(-90deg)';
            case 'flip-right':  return 'perspective(600px) rotateY(90deg)';
            case 'rotate-in':   return 'rotate(' + rotate + 'deg)';
            case 'skew-up':     return 'translateY(' + d + ') skewX(' + rotate + 'deg)';
            case 'bounce-in':   return 'scale(0.8)';
            case 'fade-in':
            default:            return 'none';
        }
    }

    function getRevealTransition(animation, easing, duration) {
        var bounce = animation === 'bounce-in' ? 'cubic-bezier(0.34,1.56,0.64,1)' : easing;
        return 'opacity ' + duration + 'ms ' + bounce + ', transform ' + duration + 'ms ' + bounce;
    }

    function applyInitial(el, animation, distance, scale, rotate, opacity) {
        var transform = getInitialTransform(animation, distance, scale, rotate);
        el.style.opacity    = (opacity / 100).toString();
        el.style.transform  = transform;
        el.style.willChange = 'opacity, transform';
    }

    function applyRevealed(el, transition, delay) {
        el.style.transition = transition;
        if (delay) { el.style.transitionDelay = delay + 'ms'; }
        el.style.opacity   = '1';
        el.style.transform = 'none';
    }

    function init() {
        var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        document.querySelectorAll('.bksr-wrap[data-animation]').forEach(function (wrap) {
            if (wrap._bksrInit) { return; }
            wrap._bksrInit = true;

            var animation    = wrap.getAttribute('data-animation')    || 'fade-up';
            var duration     = parseInt(wrap.getAttribute('data-duration'),  10) || 600;
            var delay        = parseInt(wrap.getAttribute('data-delay'),      10) || 0;
            var easing       = wrap.getAttribute('data-easing')       || 'ease';
            var distance     = parseInt(wrap.getAttribute('data-distance'),   10) || 32;
            var scale        = parseInt(wrap.getAttribute('data-scale'),      10) || 95;
            var rotate       = parseInt(wrap.getAttribute('data-rotate'),     10) || 0;
            var opacity      = parseInt(wrap.getAttribute('data-opacity'),    10) || 0;
            var threshold    = (parseInt(wrap.getAttribute('data-threshold'), 10) || 15) / 100;
            var once         = wrap.getAttribute('data-once')         !== '0';
            var stagger      = wrap.getAttribute('data-stagger')      === '1';
            var staggerDelay = parseInt(wrap.getAttribute('data-stagger-delay'), 10) || 100;

            /* skip animation for reduced motion preference */
            if (prefersReduced) { return; }

            var transition = getRevealTransition(animation, easing, duration);

            if (stagger) {
                /* animate each direct child individually */
                var children = Array.prototype.slice.call(wrap.children);
                children.forEach(function (child) {
                    applyInitial(child, animation, distance, scale, rotate, opacity);
                });

                var observer = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (!entry.isIntersecting) { return; }
                        var kids = Array.prototype.slice.call(entry.target.children);
                        kids.forEach(function (child, i) {
                            applyRevealed(child, transition, delay + i * staggerDelay);
                        });
                        if (once) { observer.unobserve(entry.target); }
                    });
                }, { threshold: threshold });

                observer.observe(wrap);

            } else {
                /* animate whole wrapper */
                applyInitial(wrap, animation, distance, scale, rotate, opacity);

                var obs = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (!entry.isIntersecting) {
                            if (!once) {
                                /* reset */
                                applyInitial(entry.target, animation, distance, scale, rotate, opacity);
                                entry.target.style.transition = 'none';
                            }
                            return;
                        }
                        applyRevealed(entry.target, transition, delay);
                        if (once) { obs.unobserve(entry.target); }
                    });
                }, { threshold: threshold });

                obs.observe(wrap);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
