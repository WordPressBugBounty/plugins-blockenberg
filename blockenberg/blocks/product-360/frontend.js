(function () {
    'use strict';

    document.querySelectorAll('.bkbg-p360-app').forEach(function (app) {
        var o;
        try { o = JSON.parse(app.dataset.opts || '{}'); } catch (e) { return; }

        var frames          = Array.isArray(o.frames) ? o.frames : [];
        var viewerWidth     = o.viewerWidth    || 600;
        var viewerHeight    = o.viewerHeight   || 400;
        var viewerRadius    = o.viewerRadius   || 16;
        var autoSpin        = !!o.autoSpin;
        var autoSpeed       = o.autoSpeed      || 60;
        var dragSensitivity = o.dragSensitivity || 4;
        var showProgress    = !!o.showProgress;
        var showHint        = !!o.showHint;
        var hintText        = o.hintText       || 'Drag to rotate';
        var showControls    = !!o.showControls;
        var bgColor         = o.bgColor        || '#f1f5f9';
        var progressColor   = o.progressColor  || '#6366f1';
        var hintColor       = o.hintColor      || '#64748b';
        var controlsBg      = o.controlsBg     || '#ffffff';
        var controlsColor   = o.controlsColor  || '#0f172a';

        var _typoKeys = { hintTypo: '--bkbg-p360-hn-' };
        function typoCssVarsForEl(el) {
            Object.keys(_typoKeys).forEach(function (attr) {
                var t = o[attr]; if (!t || typeof t !== 'object') return;
                var p = _typoKeys[attr];
                if (t.family)                el.style.setProperty(p + 'font-family', t.family);
                if (t.weight)                el.style.setProperty(p + 'font-weight', t.weight);
                if (t.transform)             el.style.setProperty(p + 'text-transform', t.transform);
                if (t.style)                 el.style.setProperty(p + 'font-style', t.style);
                if (t.decoration)            el.style.setProperty(p + 'text-decoration', t.decoration);
                if (t.sizeDesktop)           el.style.setProperty(p + 'font-size-d', t.sizeDesktop + (t.sizeUnit || 'px'));
                if (t.sizeTablet)            el.style.setProperty(p + 'font-size-t', t.sizeTablet + (t.sizeUnit || 'px'));
                if (t.sizeMobile)            el.style.setProperty(p + 'font-size-m', t.sizeMobile + (t.sizeUnit || 'px'));
                if (t.lineHeightDesktop)     el.style.setProperty(p + 'line-height-d', t.lineHeightDesktop + (t.lineHeightUnit || ''));
                if (t.lineHeightTablet)      el.style.setProperty(p + 'line-height-t', t.lineHeightTablet + (t.lineHeightUnit || ''));
                if (t.lineHeightMobile)      el.style.setProperty(p + 'line-height-m', t.lineHeightMobile + (t.lineHeightUnit || ''));
                if (t.letterSpacingDesktop)  el.style.setProperty(p + 'letter-spacing-d', t.letterSpacingDesktop + (t.letterSpacingUnit || 'px'));
                if (t.letterSpacingTablet)   el.style.setProperty(p + 'letter-spacing-t', t.letterSpacingTablet + (t.letterSpacingUnit || 'px'));
                if (t.letterSpacingMobile)   el.style.setProperty(p + 'letter-spacing-m', t.letterSpacingMobile + (t.letterSpacingUnit || 'px'));
                if (t.wordSpacingDesktop)    el.style.setProperty(p + 'word-spacing-d', t.wordSpacingDesktop + (t.wordSpacingUnit || 'px'));
                if (t.wordSpacingTablet)     el.style.setProperty(p + 'word-spacing-t', t.wordSpacingTablet + (t.wordSpacingUnit || 'px'));
                if (t.wordSpacingMobile)     el.style.setProperty(p + 'word-spacing-m', t.wordSpacingMobile + (t.wordSpacingUnit || 'px'));
            });
        }

        if (frames.length === 0) return;

        typoCssVarsForEl(app);

        var total   = frames.length;
        var current = 0;

        /* ── Build DOM ── */
        var viewer = document.createElement('div');
        viewer.className = 'bkbg-p360-viewer';
        viewer.style.width        = '100%';
        viewer.style.maxWidth     = viewerWidth  + 'px';
        viewer.style.height       = viewerHeight + 'px';
        viewer.style.borderRadius = viewerRadius + 'px';
        viewer.style.background   = bgColor;
        viewer.style.setProperty('--p360-progress', progressColor);

        var img = document.createElement('img');
        img.className = 'bkbg-p360-img';
        img.alt = frames[0].alt || '';
        img.src = frames[0].url;
        viewer.appendChild(img);

        /* Progress */
        var progressEl = null;
        if (showProgress) {
            progressEl = document.createElement('div');
            progressEl.className = 'bkbg-p360-progress';
            progressEl.style.width = '0%';
            viewer.appendChild(progressEl);
        }

        /* Hint */
        var hintEl = null;
        if (showHint) {
            hintEl = document.createElement('div');
            hintEl.className = 'bkbg-p360-hint';
            hintEl.textContent = hintText;
            hintEl.style.background = 'rgba(0,0,0,0.45)';
            hintEl.style.color      = '#ffffff';
            viewer.appendChild(hintEl);
        }

        app.appendChild(viewer);

        /* Controls */
        var counterEl = null;
        if (showControls) {
            var controls = document.createElement('div');
            controls.className = 'bkbg-p360-controls';

            var btnPrev = document.createElement('button');
            btnPrev.className = 'bkbg-p360-btn';
            btnPrev.textContent = '←';
            btnPrev.style.background = controlsBg;
            btnPrev.style.color      = controlsColor;

            counterEl = document.createElement('div');
            counterEl.className = 'bkbg-p360-counter';
            counterEl.style.color = controlsColor;

            var btnNext = document.createElement('button');
            btnNext.className = 'bkbg-p360-btn';
            btnNext.textContent = '→';
            btnNext.style.background = controlsBg;
            btnNext.style.color      = controlsColor;

            controls.appendChild(btnPrev);
            controls.appendChild(counterEl);
            controls.appendChild(btnNext);
            app.appendChild(controls);

            btnPrev.addEventListener('click', function () { goTo(current - 1); stopHint(); });
            btnNext.addEventListener('click', function () { goTo(current + 1); stopHint(); });
        }

        function goTo(idx) {
            current = ((idx % total) + total) % total;
            img.src = frames[current].url;
            img.alt = frames[current].alt || '';
            if (progressEl) {
                progressEl.style.width = ((current / (total - 1)) * 100) + '%';
            }
            if (counterEl) {
                counterEl.textContent = (current + 1) + ' / ' + total;
            }
        }

        goTo(0);

        /* ── Drag interaction ── */
        var dragging     = false;
        var startX       = 0;
        var accumulated  = 0;

        function stopHint() {
            if (hintEl && !hintEl.classList.contains('bkbg-p360-fade')) {
                hintEl.classList.add('bkbg-p360-fade');
                setTimeout(function () { if (hintEl && hintEl.parentNode) hintEl.parentNode.removeChild(hintEl); hintEl = null; }, 400);
            }
        }

        function getClientX(e) {
            return e.touches ? e.touches[0].clientX : e.clientX;
        }

        viewer.addEventListener('mousedown', function (e) {
            dragging = true;
            startX   = getClientX(e);
            accumulated = 0;
            viewer.classList.add('bkbg-p360-dragging');
            stopHint();
        });

        viewer.addEventListener('touchstart', function (e) {
            dragging = true;
            startX   = getClientX(e);
            accumulated = 0;
            stopHint();
        }, { passive: true });

        document.addEventListener('mousemove', function (e) {
            if (!dragging) return;
            var dx = getClientX(e) - startX;
            accumulated += dx;
            startX = getClientX(e);
            var step = Math.round(accumulated / dragSensitivity);
            if (step !== 0) {
                goTo(current + step);
                accumulated = 0;
            }
        });

        document.addEventListener('touchmove', function (e) {
            if (!dragging) return;
            var dx = getClientX(e) - startX;
            accumulated += dx;
            startX = getClientX(e);
            var step = Math.round(accumulated / dragSensitivity);
            if (step !== 0) {
                goTo(current - step);
                accumulated = 0;
            }
        }, { passive: true });

        function endDrag() {
            dragging = false;
            viewer.classList.remove('bkbg-p360-dragging');
        }
        document.addEventListener('mouseup',  endDrag);
        document.addEventListener('touchend', endDrag);

        /* ── Auto spin ── */
        if (autoSpin && total > 1) {
            var interval = 1000 / autoSpeed;
            var spinAcc  = 0;
            var lastTime = null;
            var rafId    = null;

            function spin(ts) {
                if (!lastTime) lastTime = ts;
                var dt = ts - lastTime;
                lastTime = ts;

                if (!dragging) {
                    spinAcc += dt;
                    while (spinAcc >= interval) {
                        goTo(current + 1);
                        spinAcc -= interval;
                    }
                }
                rafId = requestAnimationFrame(spin);
            }

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        lastTime = null;
                        rafId = requestAnimationFrame(spin);
                    } else {
                        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(app);
        }
    });
}());
