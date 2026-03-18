(function () {
    'use strict';

    function ghostTransform(idx, style, rot, ox, oy) {
        if (style === 'fan') {
            var angle = (idx + 1) * (rot / 2);
            var flip = idx % 2 === 0 ? 1 : -1;
            return 'rotate(' + (flip * angle) + 'deg) translateY(' + ((idx + 1) * oy) + 'px)';
        }
        if (style === 'spread') {
            return 'translateX(' + ((idx + 1) * ox * 1.5) + 'px) rotate(' + ((idx + 1) * (rot * 0.6)) + 'deg)';
        }
        /* pile */
        return 'translateX(' + ((idx + 1) * ox * 0.5) + 'px) translateY(' + ((idx + 1) * oy) + 'px)';
    }

    function initStack(wrap) {
        var stackEl = wrap.querySelector('.bkbg-cardstack');
        if (!stackEl) return;

        var cards = Array.from(wrap.querySelectorAll('.bkbg-cardstack-card'));
        var dots = Array.from(wrap.querySelectorAll('.bkbg-cardstack-dot'));
        if (cards.length < 2) return;

        var style = stackEl.dataset.style || 'fan';
        var rot = parseFloat(stackEl.dataset.rotation) || 5;
        var ox = parseFloat(stackEl.dataset.offsetX) || 8;
        var oy = parseFloat(stackEl.dataset.offsetY) || 8;
        var behind = parseInt(stackEl.dataset.behind, 10) || 2;

        var current = 0;

        /* Position all cards as a stack */
        function layout() {
            cards.forEach(function (card, i) {
                if (i === current) {
                    card.style.position = 'relative';
                    card.style.zIndex = cards.length;
                    card.style.transform = '';
                    card.style.opacity = '1';
                    card.style.pointerEvents = '';
                    card.classList.add('is-active');
                } else {
                    var offset = (i - current + cards.length) % cards.length;
                    if (offset > behind) {
                        card.style.opacity = '0';
                        card.style.zIndex = '0';
                    } else {
                        card.style.position = 'absolute';
                        card.style.inset = '0';
                        card.style.zIndex = String(cards.length - offset);
                        card.style.transform = ghostTransform(offset - 1, style, rot, ox, oy);
                        card.style.opacity = String(1 - offset * 0.2);
                        card.style.pointerEvents = 'none';
                    }
                    card.classList.remove('is-active');
                }
            });

            dots.forEach(function (dot, i) {
                if (i === current) {
                    dot.classList.add('is-active');
                    dot.style.background = dot.dataset.activeColor || '#6c3fb5';
                } else {
                    dot.classList.remove('is-active');
                    dot.style.background = '#d1d5db';
                }
            });
        }

        function advance() {
            cards[current].classList.add('is-exit');
            var prev = current;
            current = (current + 1) % cards.length;

            setTimeout(function () {
                cards[prev].classList.remove('is-exit');
                layout();
                cards[current].classList.add('is-enter');
                setTimeout(function () { cards[current].classList.remove('is-enter'); }, 350);
            }, 240);
        }

        /* Click / touch on stack = cycle */
        stackEl.addEventListener('click', advance);
        stackEl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); }
        });
        stackEl.setAttribute('tabindex', '0');
        stackEl.setAttribute('role', 'button');
        stackEl.setAttribute('aria-label', 'Next card');

        /* Dot nav */
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function (e) {
                e.stopPropagation();
                if (i === current) return;
                current = i;
                layout();
            });
        });

        layout();

        /* Animate in on scroll */
        if (stackEl.dataset.animate === '1') {
            if ('IntersectionObserver' in window) {
                var io = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            io.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.15 });
                io.observe(stackEl);
            } else {
                stackEl.classList.add('is-visible');
            }
        }

        /* Hover: fan cards outward on hover */
        if (style === 'fan') {
            stackEl.addEventListener('mouseenter', function () {
                cards.forEach(function (card, i) {
                    if (i !== current) {
                        var offset = (i - current + cards.length) % cards.length;
                        if (offset <= behind) {
                            card.style.transform = ghostTransform(offset - 1, 'spread', rot * 0.7, ox * 1.8, oy * 0.5);
                            card.style.opacity = String(1 - offset * 0.15);
                        }
                    }
                });
            });
            stackEl.addEventListener('mouseleave', function () {
                layout(); /* reset to normal arrangement */
            });
        }
    }

    document.querySelectorAll('.bkbg-cardstack-outer').forEach(initStack);
}());
