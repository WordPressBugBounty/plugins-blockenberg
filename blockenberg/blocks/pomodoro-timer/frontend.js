(function () {
    'use strict';

    var MODES = { WORK: 'work', SHORT: 'short', LONG: 'long' };

    function pad2(n) { return String(Math.floor(Math.max(0, n))).padStart(2, '0'); }
    function fmtTime(s) { return pad2(Math.floor(s / 60)) + ':' + pad2(s % 60); }

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

    function initPomodoro(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) {}

        var accentColor    = opts.accentColor    || '#6c3fb5';
        var breakColor     = opts.breakColor     || '#10b981';
        var longBreakColor = opts.longBreakColor || '#3b82f6';
        var ringBg         = opts.ringBg         || '#e5e7eb';
        var cardBg         = opts.cardBg         || '#ffffff';
        var timerColor     = opts.TimerColor     || '#1f2937';
        var labelColor     = opts.labelColor     || '#6b7280';
        var btnStartBg     = opts.btnStartBg     || '#6c3fb5';
        var btnStartColor  = opts.btnStartColor  || '#ffffff';
        var btnSecBg       = opts.btnSecBg       || '#f3f4f6';
        var btnSecColor    = opts.btnSecColor    || '#374151';
        var titleColor     = opts.titleColor     || '#1f2937';
        var subtitleColor  = opts.subtitleColor  || '#6b7280';
        var sectionBg      = opts.sectionBg      || '';
        var maxWidth       = opts.maxWidth       || 440;
        var cardRadius     = opts.cardRadius     || 20;
        var btnRadius      = opts.btnRadius      || 100;
        var titleSize      = opts.titleSize      || 28;
        var timerSize      = opts.timerSize      || 56;
        var ringSize       = opts.ringSize       || 220;
        var ringThick      = opts.ringThickness  || 14;
        var padTop         = opts.paddingTop     || 60;
        var padBot         = opts.paddingBottom  || 60;
        var showTitle      = opts.showTitle      !== false;
        var showSub        = opts.showSubtitle   !== false;
        var showCycles     = opts.showCycleCount !== false;
        var showModeLabel  = opts.showModeLabel  !== false;
        var workMinutes    = opts.workMinutes    || 25;
        var shortBreak     = opts.shortBreak     || 5;
        var longBreak      = opts.longBreak      || 15;
        var cyclesBeforeLong = opts.cyclesBeforeLong || 4;

        var workSecs  = workMinutes * 60;
        var shortSecs = shortBreak  * 60;
        var longSecs  = longBreak   * 60;

        var mode = MODES.WORK;
        var secs = workSecs;
        var totalForMode = workSecs;
        var running = false;
        var cycles = 0;
        var interval = null;

        var modeLabels = { work: 'Focus Time', short: 'Short Break', long: 'Long Break' };
        var modeColors = function() {
            return { work: accentColor, short: breakColor, long: longBreakColor };
        };

        // --- DOM build ---
        app.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        if (sectionBg) app.style.background = sectionBg;
        app.style.paddingTop    = padTop + 'px';
        app.style.paddingBottom = padBot + 'px';

        var card = document.createElement('div');
        card.className = 'bkbg-pom-card';
        card.style.cssText = 'background:' + cardBg + ';border-radius:' + cardRadius + 'px;padding:40px 32px;max-width:' + maxWidth + 'px;margin:0 auto;';
        typoCssVarsForEl(card, opts.titleTypo, '--bkbg-pom-tt-');
        typoCssVarsForEl(card, opts.subtitleTypo, '--bkbg-pom-st-');
        app.appendChild(card);

        // Header
        if (showTitle && opts.title) {
            var titleEl = document.createElement('div');
            titleEl.className = 'bkbg-pom-title';
            titleEl.style.cssText = 'color:' + titleColor + ';margin-bottom:6px;';
            titleEl.textContent = opts.title;
            card.appendChild(titleEl);
        }
        if (showSub && opts.subtitle) {
            var subEl = document.createElement('div');
            subEl.className = 'bkbg-pom-subtitle';
            subEl.style.cssText = 'color:' + subtitleColor + ';margin-bottom:20px;';
            subEl.textContent = opts.subtitle;
            card.appendChild(subEl);
        }

        // Mode tabs
        var tabWrap = document.createElement('div');
        tabWrap.className = 'bkbg-pom-mode-tabs';
        card.appendChild(tabWrap);
        var tabBtns = {};
        Object.values(MODES).forEach(function(m) {
            var btn = document.createElement('button');
            btn.className = 'bkbg-pom-tab-btn';
            btn.textContent = modeLabels[m];
            btn.addEventListener('click', function() { switchMode(m); });
            tabBtns[m] = btn;
            tabWrap.appendChild(btn);
        });

        // SVG Ring
        var NS = 'http://www.w3.org/2000/svg';
        var r   = (ringSize - ringThick) / 2;
        var circ = 2 * Math.PI * r;

        var ringWrap = document.createElement('div');
        ringWrap.className = 'bkbg-pom-ring-wrap';
        ringWrap.style.cssText = 'width:' + ringSize + 'px;height:' + ringSize + 'px;';
        card.appendChild(ringWrap);

        var svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('width', ringSize);
        svg.setAttribute('height', ringSize);
        svg.style.transform = 'rotate(-90deg)';
        svg.style.display = 'block';
        ringWrap.appendChild(svg);

        var trackCircle = document.createElementNS(NS, 'circle');
        trackCircle.setAttribute('cx', ringSize / 2);
        trackCircle.setAttribute('cy', ringSize / 2);
        trackCircle.setAttribute('r', r);
        trackCircle.setAttribute('fill', 'none');
        trackCircle.setAttribute('stroke', ringBg);
        trackCircle.setAttribute('stroke-width', ringThick);
        svg.appendChild(trackCircle);

        var progressCircle = document.createElementNS(NS, 'circle');
        progressCircle.setAttribute('cx', ringSize / 2);
        progressCircle.setAttribute('cy', ringSize / 2);
        progressCircle.setAttribute('r', r);
        progressCircle.setAttribute('fill', 'none');
        progressCircle.setAttribute('stroke-width', ringThick);
        progressCircle.setAttribute('stroke-linecap', 'round');
        progressCircle.setAttribute('stroke-dasharray', circ);
        progressCircle.style.transition = 'stroke-dashoffset 0.5s linear, stroke 0.3s';
        svg.appendChild(progressCircle);

        var ringInner = document.createElement('div');
        ringInner.className = 'bkbg-pom-ring-inner';
        ringWrap.style.position = 'relative';
        var timeDisplay = document.createElement('div');
        timeDisplay.className = 'bkbg-pom-time';
        timeDisplay.style.cssText = 'font-size:' + timerSize + 'px;font-weight:800;color:' + timerColor + ';line-height:1;font-variant-numeric:tabular-nums;font-family:\'SF Mono\',\'Roboto Mono\',monospace;';
        var modeLbl = document.createElement('div');
        modeLbl.className = 'bkbg-pom-mode-label';
        ringInner.appendChild(timeDisplay);
        if (showModeLabel) ringInner.appendChild(modeLbl);
        ringWrap.appendChild(ringInner);

        // Controls
        var controls = document.createElement('div');
        controls.className = 'bkbg-pom-controls';
        card.appendChild(controls);

        var startBtn = document.createElement('button');
        startBtn.className = 'bkbg-pom-btn-start';
        startBtn.style.cssText = 'background:' + btnStartBg + ';color:' + btnStartColor + ';border-radius:' + btnRadius + 'px;';
        controls.appendChild(startBtn);

        var resetBtn = document.createElement('button');
        resetBtn.className = 'bkbg-pom-btn-reset';
        resetBtn.textContent = '↺ Reset';
        resetBtn.style.cssText = 'background:' + btnSecBg + ';color:' + btnSecColor + ';border-radius:' + btnRadius + 'px;';
        resetBtn.addEventListener('click', function() { switchMode(mode); });
        controls.appendChild(resetBtn);

        // Cycles
        var cyclesWrap;
        var cycleDots = [];
        var cycleCountEl;
        if (showCycles) {
            cyclesWrap = document.createElement('div');
            cyclesWrap.className = 'bkbg-pom-cycles';
            var cycleLbl = document.createElement('span');
            cycleLbl.className = 'bkbg-pom-cycle-label';
            cycleLbl.style.color = labelColor;
            cycleLbl.textContent = 'Sessions:';
            cyclesWrap.appendChild(cycleLbl);
            for (var i = 0; i < cyclesBeforeLong; i++) {
                var dot = document.createElement('div');
                dot.className = 'bkbg-pom-cycle-dot';
                dot.style.background = '#e5e7eb';
                cycleDots.push(dot);
                cyclesWrap.appendChild(dot);
            }
            cycleCountEl = document.createElement('span');
            cycleCountEl.className = 'bkbg-pom-cycle-count';
            cycleCountEl.style.color = labelColor;
            cyclesWrap.appendChild(cycleCountEl);
            card.appendChild(cyclesWrap);
        }

        function getModeColor() { return modeColors()[mode]; }
        function getTotalFor(m) { return m===MODES.WORK?workSecs:m===MODES.SHORT?shortSecs:longSecs; }

        function render() {
            var mc = getModeColor();
            // tabs
            Object.values(MODES).forEach(function(m) {
                var active = m === mode;
                var c = modeColors()[m];
                tabBtns[m].style.background    = active ? c : 'transparent';
                tabBtns[m].style.color         = active ? '#fff' : c;
                tabBtns[m].style.border        = '2px solid ' + (active ? c : '#e5e7eb');
            });
            // ring
            var progress = 1 - secs / totalForMode;
            progressCircle.setAttribute('stroke', mc);
            progressCircle.setAttribute('stroke-dashoffset', circ * (1 - progress));
            // timer
            timeDisplay.textContent = fmtTime(secs);
            if (showModeLabel) { modeLbl.textContent = modeLabels[mode]; modeLbl.style.color = mc; }
            // button
            startBtn.textContent = running ? '⏸ Pause' : (secs < totalForMode ? '▶ Resume' : '▶ Start');
            // dots
            if (showCycles) {
                var inCycle = cycles % cyclesBeforeLong;
                cycleDots.forEach(function(d, i) {
                    d.style.background = i < inCycle ? accentColor : '#e5e7eb';
                });
                cycleCountEl.textContent = '(' + cycles + ' done)';
            }
        }

        function switchMode(m) {
            if (interval) clearInterval(interval);
            interval = null;
            running = false;
            mode = m;
            totalForMode = getTotalFor(m);
            secs = totalForMode;
            render();
        }

        startBtn.addEventListener('click', function() {
            running = !running;
            if (running) {
                interval = setInterval(function() {
                    secs--;
                    if (secs <= 0) {
                        secs = 0;
                        clearInterval(interval);
                        interval = null;
                        running = false;
                        if (mode === MODES.WORK) {
                            cycles++;
                            if (cycles % cyclesBeforeLong === 0) switchMode(MODES.LONG);
                            else switchMode(MODES.SHORT);
                        } else {
                            switchMode(MODES.WORK);
                        }
                        return;
                    }
                    render();
                }, 1000);
            } else {
                if (interval) clearInterval(interval);
                interval = null;
            }
            render();
        });

        Object.values(MODES).forEach(function(m) {
            tabBtns[m].addEventListener('click', function() { switchMode(m); });
        });

        switchMode(MODES.WORK);
    }

    document.querySelectorAll('.bkbg-pom-app').forEach(initPomodoro);
})();
