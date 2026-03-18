(function () {
    'use strict';

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── typography CSS-var helper ──────────────────────── */
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
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    function initBlock(root) {
        var app = root.querySelector('.bkbg-is-app');
        if (!app) return;

        var raw = app.getAttribute('data-opts') || '{}';
        var o;
        try { o = JSON.parse(raw); } catch (e) { o = {}; }

        var steps          = Array.isArray(o.steps) ? o.steps : [];
        var layout         = o.layout        || 'horizontal';
        var isHoriz        = layout !== 'vertical';
        var showConnector  = o.showConnector  !== false;
        var animateContent = o.animateContent !== false;
        var initialStep    = Number(o.initialStep) || 0;
        var stepSize       = Number(o.stepSize)       || 52;
        var stepFontSize   = Number(o.stepFontSize)   || 14;
        var headingSize    = Number(o.headingSize)     || 22;
        var bodySize       = Number(o.bodySize)        || 16;
        var connectorH     = Number(o.connectorHeight) || 3;
        var contentRadius  = Number(o.contentRadius)   || 16;
        var contentPadding = Number(o.contentPadding)  || 32;
        var activeBg       = o.activeBg       || '#6366f1';
        var activeColor    = o.activeColor    || '#ffffff';
        var inactiveBg     = o.inactiveBg     || '#e5e7eb';
        var inactiveColor  = o.inactiveColor  || '#64748b';
        var doneBg         = o.doneBg         || '#10b981';
        var doneColor      = o.doneColor      || '#ffffff';
        var connectorColor = o.connectorColor || '#e5e7eb';
        var connectorDone  = o.connectorDone  || '#10b981';
        var contentBg      = o.contentBg      || '#f8fafc';
        var contentBorder  = o.contentBorder  || '#e5e7eb';
        var headingColor   = o.headingColor   || '#0f172a';
        var bodyColor      = o.bodyColor      || '#475569';
        var labelColor     = o.labelColor     || '#0f172a';
        var sectionBg      = o.sectionBg      || 'transparent';

        if (steps.length === 0) return;

        var currentIdx = typeof initialStep === 'number' && initialStep < steps.length ? initialStep : 0;
        var total      = steps.length;

        /* ── Build root container ───────────────────────────────────── */
        var rootEl = document.createElement('div');
        rootEl.className  = 'bkbg-is-root ' + (isHoriz ? 'bkbg-is-horiz' : 'bkbg-is-vert');
        rootEl.style.cssText = 'background:' + sectionBg + ';display:flex;' +
            (isHoriz ? 'flex-direction:column' : 'flex-direction:row;gap:32px');

        typoCssVarsForEl(rootEl, o.headingTypo, '--bkbg-is-h-');
        typoCssVarsForEl(rootEl, o.bodyTypo, '--bkbg-is-bd-');

        /* ── Nav ────────────────────────────────────────────────────── */
        var navEl = document.createElement('div');
        navEl.className = 'bkbg-is-nav';
        navEl.style.cssText = 'display:flex;' +
            (isHoriz
                ? 'flex-direction:row;align-items:flex-start;margin-bottom:32px'
                : 'flex-direction:column;align-items:flex-start;flex-shrink:0');

        var bubbles     = [];
        var connectors  = [];
        var labelEls    = [];

        steps.forEach(function (step, idx) {
            /* Connector before */
            if (idx > 0 && showConnector) {
                var conn = document.createElement('div');
                conn.className = 'bkbg-is-connector';
                if (isHoriz) {
                    conn.style.cssText = 'flex:1;height:' + connectorH + 'px;background:' + connectorColor + ';align-self:center;min-width:20px;transition:background 0.4s ease';
                } else {
                    conn.style.cssText = 'height:24px;width:' + connectorH + 'px;background:' + connectorColor +
                        ';margin:0 0 0 ' + (stepSize / 2 - connectorH / 2) + 'px;transition:background 0.4s ease';
                }
                navEl.appendChild(conn);
                connectors.push({ el: conn, idx: idx });
            }

            /* Bubble + label wrapper */
            var item = document.createElement('div');
            item.className = 'bkbg-is-step-item';
            item.style.cssText = 'display:flex;' +
                (isHoriz
                    ? 'flex-direction:column;align-items:center;gap:6px'
                    : 'flex-direction:row;align-items:center;gap:10px');

            var btn = document.createElement('button');
            btn.className = 'bkbg-is-bubble';
            btn.type = 'button';
            btn.setAttribute('aria-label', 'Step ' + (idx + 1) + ': ' + (step.title || ''));
            btn.style.cssText = [
                'width:'         + stepSize     + 'px',
                'height:'        + stepSize     + 'px',
                'font-size:'     + stepFontSize + 'px',
                'background:'    + inactiveBg,
                'color:'         + inactiveColor
            ].join(';');
            var _IP = window.bkbgIconPicker;
            var _iType = step.iconType || 'custom-char';
            if (_IP && _iType !== 'custom-char') {
                var _in = _IP.buildFrontendIcon(_iType, step.icon, step.iconDashicon, step.iconImageUrl, step.iconDashiconColor);
                if (_in) { btn.textContent = ''; btn.appendChild(_in); } else { btn.textContent = step.icon || (idx + 1); }
            } else { btn.textContent = step.icon || (idx + 1); }
            btn.addEventListener('click', function () { goTo(idx); });
            item.appendChild(btn);
            bubbles.push(btn);

            var lbl = document.createElement('span');
            lbl.className = 'bkbg-is-label';
            lbl.textContent = step.title || ('Step ' + (idx + 1));
            lbl.style.cssText = 'font-size:' + stepFontSize + 'px;color:' + labelColor + ';font-weight:500;white-space:nowrap';
            item.appendChild(lbl);
            labelEls.push(lbl);

            navEl.appendChild(item);
        });

        /* ── Panel ──────────────────────────────────────────────────── */
        var panelEl = document.createElement('div');
        panelEl.className = 'bkbg-is-panel';
        panelEl.style.cssText = [
            'flex:1',
            'background:'    + contentBg,
            'border:1px solid ' + contentBorder,
            'border-radius:' + contentRadius + 'px',
            'padding:'       + contentPadding + 'px'
        ].join(';');

        var headingEl = document.createElement('div');
        headingEl.className = 'bkbg-is-heading';
        headingEl.style.cssText = 'color:' + headingColor;

        var bodyEl = document.createElement('div');
        bodyEl.className = 'bkbg-is-body';
        bodyEl.style.cssText = 'color:' + bodyColor;

        var navBtns = document.createElement('div');
        navBtns.className = 'bkbg-is-nav-btns';

        var prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'bkbg-is-btn-prev';
        prevBtn.textContent = '← Previous';
        prevBtn.style.cssText = 'padding:10px 24px;border-radius:8px;border:1px solid ' + contentBorder +
            ';background:transparent;cursor:pointer;font-size:14px;color:' + bodyColor + ';font-weight:600';
        prevBtn.addEventListener('click', function () { if (currentIdx > 0) goTo(currentIdx - 1); });

        var nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'bkbg-is-btn-next';
        nextBtn.textContent = 'Next →';
        nextBtn.style.cssText = 'padding:10px 24px;border-radius:8px;border:none;background:' + activeBg +
            ';color:' + activeColor + ';cursor:pointer;font-size:14px;font-weight:700';
        nextBtn.addEventListener('click', function () { if (currentIdx < total - 1) goTo(currentIdx + 1); });

        navBtns.appendChild(prevBtn);
        navBtns.appendChild(nextBtn);
        panelEl.appendChild(headingEl);
        panelEl.appendChild(bodyEl);
        panelEl.appendChild(navBtns);

        rootEl.appendChild(navEl);
        rootEl.appendChild(panelEl);
        app.appendChild(rootEl);

        /* ── Update UI ──────────────────────────────────────────────── */
        function updateBubbles() {
            bubbles.forEach(function (btn, i) {
                var isActive = i === currentIdx;
                var isDone   = i < currentIdx;
                btn.style.background = isActive ? activeBg : (isDone ? doneBg : inactiveBg);
                btn.style.color      = isActive ? activeColor : (isDone ? doneColor : inactiveColor);
                btn.style.transform  = isActive ? 'scale(1.12)' : 'scale(1)';
                btn.style.boxShadow  = isActive ? '0 4px 16px rgba(99,102,241,0.4)' : 'none';
                btn.textContent = '';
                while (btn.firstChild) btn.removeChild(btn.firstChild);
                if (isDone) {
                    btn.textContent = '✓';
                } else {
                    var _IP2 = window.bkbgIconPicker;
                    var _iT2 = steps[i].iconType || 'custom-char';
                    if (_IP2 && _iT2 !== 'custom-char') {
                        var _in2 = _IP2.buildFrontendIcon(_iT2, steps[i].icon, steps[i].iconDashicon, steps[i].iconImageUrl, steps[i].iconDashiconColor);
                        if (_in2) btn.appendChild(_in2); else btn.textContent = steps[i].icon || (i + 1);
                    } else { btn.textContent = steps[i].icon || (i + 1); }
                }
                btn.classList.toggle('bkbg-is-active', isActive);
                btn.classList.toggle('bkbg-is-done',   isDone);
                labelEls[i].style.fontWeight = isActive ? '700' : '500';
                labelEls[i].style.color      = isActive ? activeBg : labelColor;
            });
            connectors.forEach(function (c) {
                c.el.style.background = c.idx <= currentIdx ? connectorDone : connectorColor;
            });
            prevBtn.style.display = currentIdx > 0         ? 'inline-flex' : 'none';
            nextBtn.style.display = currentIdx < total - 1 ? 'inline-flex' : 'none';
        }

        function updatePanel() {
            var step = steps[currentIdx];
            headingEl.textContent = step.heading || '';
            bodyEl.textContent    = step.body    || '';
        }

        function goTo(idx) {
            if (idx === currentIdx) return;
            if (animateContent && !reduced) {
                panelEl.classList.add('bkbg-is-transitioning');
                setTimeout(function () {
                    currentIdx = idx;
                    updatePanel();
                    updateBubbles();
                    panelEl.classList.remove('bkbg-is-transitioning');
                }, 200);
            } else {
                currentIdx = idx;
                updatePanel();
                updateBubbles();
            }
        }

        updatePanel();
        updateBubbles();
    }

    function init() {
        document.querySelectorAll('.wp-block-blockenberg-interactive-steps').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
