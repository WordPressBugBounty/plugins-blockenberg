(function () {
    'use strict';

    function clamp(n, min, max) {
        n = parseFloat(n);
        if (isNaN(n)) n = min;
        return Math.max(min, Math.min(max, n));
    }

    function getPosFromEvent(e, wrap, orientation) {
        var rect = wrap.getBoundingClientRect();
        var point = e.touches && e.touches[0] ? e.touches[0] : e;
        var x = point.clientX - rect.left;
        var y = point.clientY - rect.top;
        if (orientation === 'vertical') {
            return clamp((y / rect.height) * 100, 0, 100);
        }
        return clamp((x / rect.width) * 100, 0, 100);
    }

    function setCssPos(root, pos) {
        root.style.setProperty('--bkbg-ba-pos', pos + '%');
    }

    function initOne(root) {
        var inner = root.querySelector('.bkbg-ba-inner');
        if (!inner) return;

        var range = root.querySelector('.bkbg-ba-range');
        var orientation = root.getAttribute('data-orientation') || 'horizontal';
        var start = clamp(root.getAttribute('data-pos') || 50, 0, 100);

        setCssPos(root, start);
        if (range) range.value = String(start);

        var dragging = false;

        function onDown(e) {
            dragging = true;
            try { e.preventDefault(); } catch (_) {}
            var pos = getPosFromEvent(e, inner, orientation);
            setCssPos(root, pos);
            if (range) range.value = String(Math.round(pos));
        }

        function onMove(e) {
            if (!dragging) return;
            try { e.preventDefault(); } catch (_) {}
            var pos = getPosFromEvent(e, inner, orientation);
            setCssPos(root, pos);
            if (range) range.value = String(Math.round(pos));
        }

        function onUp() {
            dragging = false;
        }

        // Prefer pointer events when available
        if (window.PointerEvent) {
            inner.addEventListener('pointerdown', onDown, { passive: false });
            window.addEventListener('pointermove', onMove, { passive: false });
            window.addEventListener('pointerup', onUp);
            window.addEventListener('pointercancel', onUp);
        } else {
            inner.addEventListener('mousedown', onDown);
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);

            inner.addEventListener('touchstart', onDown, { passive: false });
            window.addEventListener('touchmove', onMove, { passive: false });
            window.addEventListener('touchend', onUp);
            window.addEventListener('touchcancel', onUp);
        }

        if (range) {
            range.addEventListener('input', function () {
                var pos = clamp(range.value, 0, 100);
                setCssPos(root, pos);
            });
        }
    }

    function initAll() {
        var nodes = document.querySelectorAll('.bkbg-ba-wrap');
        for (var i = 0; i < nodes.length; i++) initOne(nodes[i]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
