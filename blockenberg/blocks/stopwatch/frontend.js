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

    function buildBlock(root) {
        var o;
        try { o = JSON.parse(root.getAttribute('data-opts')); } catch (e) { return; }

        // CSS vars
        root.style.setProperty('--sw-accent',       o.accentColor    || '#6366f1');
        root.style.setProperty('--sw-clock-bg',     o.clockBg        || '#1e1b4b');
        root.style.setProperty('--sw-clock-color',  o.clockColor     || '#e0e7ff');
        root.style.setProperty('--sw-title-color',  o.titleColor     || '#111827');
        root.style.setProperty('--sw-subtitle-color',o.subtitleColor || '#6b7280');
        root.style.setProperty('--sw-label-color',  o.labelColor     || '#374151');
        root.style.setProperty('--sw-card-bg',      o.cardBg         || '#ffffff');
        root.style.setProperty('--sw-max-width',    (o.contentMaxWidth||560) + 'px');
        root.style.setProperty('--sw-title-size',   (o.titleFontSize ||26)  + 'px');
        root.style.setProperty('--sw-clock-size',   (o.clockFontSize ||64)  + 'px');

        // Typography vars
        typoCssVarsForEl(root, o.titleTypo,    '--bksw-tt-');
        typoCssVarsForEl(root, o.subtitleTypo, '--bksw-st-');

        // State
        var elapsed  = 0;   // ms total elapsed
        var lapStart = 0;   // ms at last lap press
        var running  = false;
        var rafId    = null;
        var startedAt = 0;  // performance.now() snapshot
        var laps     = [];

        var maxLaps = o.maxLaps || 20;
        var showMs  = o.showMilliseconds !== false;

        // Build DOM
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-sw-wrap';
        wrap.style.background = o.sectionBg || '#f5f3ff';
        root.appendChild(wrap);

        if (o.showTitle && o.title) {
            var titleEl = document.createElement('h3');
            titleEl.className = 'bkbg-sw-title';
            titleEl.textContent = o.title;
            wrap.appendChild(titleEl);
        }
        if (o.showSubtitle && o.subtitle) {
            var subEl = document.createElement('p');
            subEl.className = 'bkbg-sw-subtitle';
            subEl.textContent = o.subtitle;
            wrap.appendChild(subEl);
        }

        // Clock
        var clockEl = document.createElement('div');
        clockEl.className = 'bkbg-sw-clock';
        wrap.appendChild(clockEl);

        // Buttons
        var btnRow = document.createElement('div');
        btnRow.className = 'bkbg-sw-btns';
        wrap.appendChild(btnRow);

        function makeBtn(label, bg, handler) {
            var btn = document.createElement('button');
            btn.className = 'bkbg-sw-btn';
            btn.textContent = label;
            btn.style.background = bg;
            btn.addEventListener('click', handler);
            btnRow.appendChild(btn);
            return btn;
        }

        var startBtn = makeBtn('▶ Start', o.startColor || '#22c55e', onStart);
        var lapBtn   = o.showLaps ? makeBtn('⏱ Lap',   o.lapColor  || '#f59e0b', onLap) : null;
        var resetBtn = makeBtn('↺ Reset', o.resetColor || '#6b7280', onReset);

        // Laps section
        var lapSection = null, lapHead = null, lapBody = null;
        if (o.showLaps) {
            lapSection = document.createElement('div');
            lapSection.className = 'bkbg-sw-laps';

            lapHead = document.createElement('div');
            lapHead.className = 'bkbg-sw-laps-head';
            lapHead.innerHTML = '<span style="width:32px">#</span><span style="flex:1">Split</span><span style="flex:1;text-align:right">Total</span>';
            lapSection.appendChild(lapHead);

            lapBody = document.createElement('div');
            lapSection.appendChild(lapBody);
            wrap.appendChild(lapSection);
        }

        // ── Format ms as MM:SS.mm or MM:SS ──
        function fmtTime(ms, withMs) {
            var totalS  = Math.floor(ms / 1000);
            var minutes = Math.floor(totalS / 60);
            var seconds = totalS % 60;
            var centis  = Math.floor((ms % 1000) / 10);
            var mm = String(minutes).padStart(2, '0');
            var ss = String(seconds).padStart(2, '0');
            if (withMs !== false) {
                var cs = String(centis).padStart(2, '0');
                return mm + ':' + ss + '.' + cs;
            }
            return mm + ':' + ss;
        }

        // ── Render clock ──
        function renderClock() {
            clockEl.textContent = fmtTime(elapsed, showMs);
        }

        // ── RAF loop ──
        function tick() {
            elapsed = (o._elapsed || 0) + (performance.now() - startedAt);
            renderClock();
            rafId = requestAnimationFrame(tick);
        }

        // ── Start / Pause toggle ──
        function onStart() {
            if (!running) {
                running = true;
                o._elapsed = elapsed;
                startedAt = performance.now();
                rafId = requestAnimationFrame(tick);
                startBtn.textContent = '⏸ Pause';
                startBtn.style.background = o.stopColor || '#ef4444';
                if (lapBtn) lapBtn.disabled = false;
            } else {
                running = false;
                cancelAnimationFrame(rafId);
                o._elapsed = elapsed;
                startBtn.textContent = '▶ Resume';
                startBtn.style.background = o.startColor || '#22c55e';
            }
        }

        // ── Lap ──
        function onLap() {
            if (!running) return;
            if (laps.length >= maxLaps) return;
            var split = elapsed - lapStart;
            lapStart  = elapsed;
            laps.unshift({ num: laps.length + 1, split: split, total: elapsed });
            renderLaps();
        }

        // ── Reset ──
        function onReset() {
            running = false;
            cancelAnimationFrame(rafId);
            elapsed  = 0;
            lapStart = 0;
            o._elapsed = 0;
            laps     = [];
            startBtn.textContent = '▶ Start';
            startBtn.style.background = o.startColor || '#22c55e';
            if (lapBtn) lapBtn.disabled = true;
            renderClock();
            if (lapBody) renderLaps();
        }

        // ── Render laps list ──
        function renderLaps() {
            if (!lapBody) return;
            lapBody.innerHTML = '';
            if (laps.length === 0) {
                var empty = document.createElement('div');
                empty.className = 'bkbg-sw-laps-empty';
                empty.textContent = 'No laps recorded yet';
                lapBody.appendChild(empty);
                return;
            }
            laps.forEach(function (lap) {
                var row = document.createElement('div');
                row.className = 'bkbg-sw-lap-row';
                row.innerHTML =
                    '<span class="bkbg-sw-lap-num">' + lap.num + '</span>' +
                    '<span class="bkbg-sw-lap-split">' + fmtTime(lap.split, showMs) + '</span>' +
                    '<span class="bkbg-sw-lap-total">' + fmtTime(lap.total, showMs) + '</span>';
                lapBody.appendChild(row);
            });
        }

        // Init
        if (lapBtn) lapBtn.disabled = true;
        renderClock();
        if (lapBody) renderLaps();
    }

    document.querySelectorAll('.bkbg-sw-app').forEach(buildBlock);
})();
