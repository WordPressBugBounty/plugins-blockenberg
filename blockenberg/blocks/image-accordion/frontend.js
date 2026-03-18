(function () {
    'use strict';

    function parseColor(hex, opacity) {
        if (!hex) return 'rgba(0,0,0,' + (opacity / 100) + ')';
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + (opacity / 100) + ')';
    }

    function reducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function initAccordion(container) {
        var panels      = Array.prototype.slice.call(container.querySelectorAll('.bkia-panel'));
        var trigger     = container.dataset.trigger     || 'hover';
        var defaultOpen = parseInt(container.dataset.default, 10) || 0;
        var expFlex     = parseFloat(container.dataset.expFlex)   || 4;
        var colFlex     = parseFloat(container.dataset.colFlex)   || 1;
        var duration    = parseInt(container.dataset.duration, 10) || 500;
        var easing      = container.dataset.easing     || 'ease';
        var ovOpacity   = parseFloat(container.dataset.overlay)   || 40;
        var ovHover     = parseFloat(container.dataset.ovHover)   || 20;
        var ovColor     = container.dataset.ovColor    || '#000000';
        var doScale     = container.dataset.scale      !== 'false';
        var textVis     = container.dataset.textVis    || 'always';

        // Apply CSS transition timing to panels
        var dur = reducedMotion() ? '0ms' : duration + 'ms';
        panels.forEach(function (panel) {
            panel.style.transition = 'flex ' + dur + ' ' + easing;
        });

        function activate(index) {
            panels.forEach(function (panel, i) {
                var isActive  = (i === index);
                var img       = panel.querySelector('.bkia-img');
                var overlay   = panel.querySelector('.bkia-overlay');
                var textEl    = panel.querySelector('.bkia-text');

                panel.style.flex = isActive ? String(expFlex) : String(colFlex);

                if (overlay) {
                    overlay.style.background = parseColor(ovColor, isActive ? ovHover : ovOpacity);
                }

                if (img && doScale) {
                    img.style.transition = 'transform ' + dur + ' ' + easing;
                    img.style.transform  = isActive ? 'scale(1.05)' : 'scale(1)';
                }

                if (textEl) {
                    if (textVis === 'always') {
                        textEl.style.opacity = '1';
                    } else if (textVis === 'expanded') {
                        textEl.style.opacity = isActive ? '1' : '0';
                    } else if (textVis === 'collapsed') {
                        textEl.style.opacity = isActive ? '0' : '1';
                    }
                }

                if (isActive) {
                    panel.classList.add('bkia-active');
                } else {
                    panel.classList.remove('bkia-active');
                }
            });
        }

        // Set initial state
        activate(defaultOpen);

        // Bind events
        if (trigger === 'hover') {
            panels.forEach(function (panel, i) {
                panel.addEventListener('mouseenter', function () { activate(i); });
            });
        } else {
            panels.forEach(function (panel, i) {
                panel.addEventListener('click', function () { activate(i); });
            });
        }
    }

    function init() {
        var containers = document.querySelectorAll('.bkia-container[data-trigger]');
        containers.forEach(function (container) {
            initAccordion(container);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());
