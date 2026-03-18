(function () {
    'use strict';

    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function(k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    document.querySelectorAll('.bkbg-rsc-app').forEach(function (app) {
        var o;
        try { o = JSON.parse(app.dataset.opts || '{}'); } catch (e) { return; }

        var cards        = Array.isArray(o.cards) ? o.cards : [];
        var columns      = o.columns      || 2;
        var cardHeight   = o.cardHeight   || 360;
        var cardRadius   = o.cardRadius   || 16;
        var gap          = o.gap          || 24;
        var dividerWidth = o.dividerWidth || 3;
        var handleSize   = o.handleSize   || 44;
        var showLabels   = !!o.showLabels;
        var labelSize    = o.labelSize    || 13;
        var orientation  = o.orientation  || 'horizontal';
        var dividerColor = o.dividerColor || '#ffffff';
        var handleBg     = o.handleBg     || '#ffffff';
        var handleColor  = o.handleColor  || '#0f172a';
        var labelBg      = o.labelBg      || 'rgba(0,0,0,0.55)';
        var labelColor   = o.labelColor   || '#ffffff';

        var isVertical = orientation === 'vertical';

        /* ── Apply typography CSS vars ── */
        typoCssVarsForEl(app, o.labelTypo, '--bksc-lb-');

        /* ── Build grid ── */
        var grid = document.createElement('div');
        grid.className = 'bkbg-rsc-grid';
        grid.style.gridTemplateColumns = 'repeat(' + columns + ', 1fr)';
        grid.style.gap = gap + 'px';

        cards.forEach(function (card) {
            var pos = (card.initialPosition != null ? card.initialPosition : 50);

            /* card wrapper */
            var wrapper = document.createElement('div');
            wrapper.className = 'bkbg-rsc-card' + (isVertical ? ' bkbg-rsc-vertical' : '');
            wrapper.style.height       = cardHeight + 'px';
            wrapper.style.borderRadius = cardRadius + 'px';
            wrapper.style.setProperty('--rsc-divider',   dividerColor);
            wrapper.style.setProperty('--rsc-divider-w', dividerWidth + 'px');

            /* back */
            var back = document.createElement('div');
            back.className = 'bkbg-rsc-back';
            if (card.backUrl) {
                back.style.backgroundImage = 'url(' + card.backUrl + ')';
            } else {
                back.style.background = card.backBg || '#6366f1';
            }

            /* front */
            var front = document.createElement('div');
            front.className = 'bkbg-rsc-front';
            if (card.frontUrl) {
                front.style.backgroundImage = 'url(' + card.frontUrl + ')';
            } else {
                front.style.background = card.frontBg || '#94a3b8';
            }

            /* divider */
            var divider = document.createElement('div');
            divider.className = 'bkbg-rsc-divider';

            /* handle */
            var handle = document.createElement('div');
            handle.className = 'bkbg-rsc-handle';
            handle.textContent = isVertical ? '↕' : '↔';
            handle.style.width      = handleSize + 'px';
            handle.style.height     = handleSize + 'px';
            handle.style.background = handleBg;
            handle.style.color      = handleColor;
            handle.style.fontSize   = Math.round(handleSize * 0.35) + 'px';
            handle.style.top        = isVertical ? pos + '%' : '50%';
            handle.style.left       = isVertical ? '50%'    : pos + '%';

            /* labels */
            if (showLabels) {
                if (card.frontLabel) {
                    var lf = document.createElement('div');
                    lf.className = 'bkbg-rsc-label bkbg-rsc-label-front';
                    lf.textContent = card.frontLabel;
                    lf.style.color      = labelColor;
                    lf.style.background = labelBg;
                    wrapper.appendChild(lf);
                }
                if (card.backLabel) {
                    var lb = document.createElement('div');
                    lb.className = 'bkbg-rsc-label bkbg-rsc-label-back';
                    lb.textContent = card.backLabel;
                    lb.style.color      = labelColor;
                    lb.style.background = labelBg;
                    wrapper.appendChild(lb);
                }
            }

            wrapper.appendChild(back);
            wrapper.appendChild(front);
            wrapper.appendChild(divider);
            wrapper.appendChild(handle);
            grid.appendChild(wrapper);

            /* ── Drag logic ── */
            function setPos(p) {
                p = Math.max(2, Math.min(98, p));
                pos = p;

                if (isVertical) {
                    front.style.clipPath = 'inset(0 0 ' + (100 - p) + '% 0)';
                    divider.style.top   = p + '%';
                    handle.style.top    = p + '%';
                } else {
                    front.style.clipPath = 'inset(0 ' + (100 - p) + '% 0 0)';
                    divider.style.left  = p + '%';
                    handle.style.left   = p + '%';
                }
            }

            setPos(pos); /* initial */

            var dragging = false;
            var startVal, startClient;

            function getClient(e) {
                return isVertical
                    ? (e.touches ? e.touches[0].clientY : e.clientY)
                    : (e.touches ? e.touches[0].clientX : e.clientX);
            }

            function onStart(e) {
                e.preventDefault();
                dragging   = true;
                startClient = getClient(e);
                startVal   = pos;

                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup',   onEnd);
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('touchend',  onEnd);
            }

            function onMove(e) {
                if (!dragging) return;
                var rect  = wrapper.getBoundingClientRect();
                var size  = isVertical ? rect.height : rect.width;
                var delta = getClient(e) - (isVertical ? rect.top : rect.left);
                setPos((delta / size) * 100);
            }

            function onEnd() {
                dragging = false;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup',   onEnd);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend',  onEnd);
            }

            handle.addEventListener('mousedown',  onStart);
            handle.addEventListener('touchstart', onStart, { passive: false });
            wrapper.addEventListener('mousedown',  onStart);
            wrapper.addEventListener('touchstart', onStart, { passive: false });
        });

        app.appendChild(grid);
    });
}());
