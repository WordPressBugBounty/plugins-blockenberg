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
        var motionPreference = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
        // Content stays readable when motion is unwanted or observers are unavailable.
        if ((motionPreference && motionPreference.matches) || typeof window.IntersectionObserver !== 'function') { return; }
        var animated = [];
        var observers = [];

        function revealWithoutMotion() {
            if (!motionPreference.matches) { return; }
            observers.forEach(function (observer) { observer.disconnect(); });
            animated.forEach(function (element) {
                element.style.transition = 'none';
                element.style.transitionDelay = '0ms';
                element.style.opacity = '1';
                element.style.transform = 'none';
                element.style.willChange = '';
            });
        }

        function option(wrap, name, fallback, min, max) {
            var n = parseFloat(wrap.getAttribute('data-' + name));
            return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
        }

        document.querySelectorAll('.bksr-wrap[data-animation]').forEach(function (wrap) {
            if (wrap._bksrInit) { return; }
            wrap._bksrInit = true;

            var animation    = wrap.getAttribute('data-animation')    || 'fade-up';
            var duration     = option(wrap, 'duration', 600, 0, 10000);
            var delay        = option(wrap, 'delay', 0, 0, 10000);
            var easing       = wrap.getAttribute('data-easing')       || 'ease';
            var distance     = option(wrap, 'distance', 32, 0, 1000);
            var scale        = option(wrap, 'scale', 95, 0, 300);
            var rotate       = option(wrap, 'rotate', 0, -360, 360);
            var opacity      = option(wrap, 'opacity', 0, 0, 100);
            var threshold    = option(wrap, 'threshold', 15, 0, 100) / 100;
            var once         = wrap.getAttribute('data-once')         !== '0';
            var stagger      = wrap.getAttribute('data-stagger')      === '1';
            var staggerDelay = option(wrap, 'stagger-delay', 100, 0, 10000);
            // A long composition cannot fit its requested intersection ratio in
            // the viewport. Cap it to a reachable ratio so it can still reveal.
            threshold = Math.min(threshold, window.innerHeight / Math.max(1, wrap.getBoundingClientRect().height) * 0.9);

            var transition = getRevealTransition(animation, easing, duration);

            if (stagger) {
                /* animate each direct child individually */
                var children = Array.prototype.slice.call(wrap.children);
                children.forEach(function (child) {
                    child.classList.add('bksr-child-reveal');
                    animated.push(child);
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
                observers.push(observer);

            } else {
                /* animate whole wrapper */
                applyInitial(wrap, animation, distance, scale, rotate, opacity);
                animated.push(wrap);

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
                observers.push(obs);
            }
        });
        if (motionPreference && animated.length) {
            if (motionPreference.addEventListener) { motionPreference.addEventListener('change', revealWithoutMotion); }
            else if (motionPreference.addListener) { motionPreference.addListener(revealWithoutMotion); }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
