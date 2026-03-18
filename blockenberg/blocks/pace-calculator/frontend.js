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

    var KM_PER_MILE = 1.60934;

    function pad2(n) { return String(Math.floor(Math.max(0, n))).padStart(2, '0'); }

    function secsToHMS(s) {
        s = Math.round(Math.max(0, s));
        var h = Math.floor(s / 3600);
        var m = Math.floor((s % 3600) / 60);
        var sec = s % 60;
        return (h > 0 ? h + ':' + pad2(m) : m) + ':' + pad2(sec);
    }

    function secsToPace(s) {
        s = Math.max(0, s);
        var m = Math.floor(s / 60);
        var sec = Math.round(s % 60);
        if (sec === 60) { m++; sec = 0; }
        return m + ':' + pad2(sec);
    }

    function paceToSecs(str) {
        str = String(str || '').trim();
        var parts = str.split(':');
        if (parts.length >= 2) return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        return parseFloat(str) * 60 || 0;
    }

    function timeToSecs(str) {
        str = String(str || '').trim();
        var parts = str.split(':');
        if (parts.length === 3) return parseInt(parts[0],10)*3600 + parseInt(parts[1],10)*60 + parseInt(parts[2],10);
        if (parts.length === 2) return parseInt(parts[0],10)*60   + parseInt(parts[1],10);
        return parseFloat(str) * 60 || 0;
    }

    function initPaceCalc(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) {}

        var accent      = opts.accentColor   || '#6c3fb5';
        var cardBg      = opts.cardBg        || '#ffffff';
        var resultBg    = opts.resultBg      || '#f5f3ff';
        var resultBorder= opts.resultBorder  || '#ede9fe';
        var resultColor = opts.resultColor   || '#6c3fb5';
        var presetBg    = opts.presetBg      || '#f3f4f6';
        var presetColor = opts.presetColor   || '#374151';
        var convBg      = opts.convBg        || '#f9fafb';
        var labelColor  = opts.labelColor    || '#374151';
        var titleColor  = opts.titleColor    || '#1f2937';
        var subtitleColor = opts.subtitleColor || '#6b7280';
        var sectionBg   = opts.sectionBg     || '';
        var maxWidth    = opts.maxWidth      || 560;
        var cardRadius  = opts.cardRadius    || 16;
        var inputRadius = opts.inputRadius   || 8;
        var titleSize   = opts.titleSize     || 28;
        var resultSize  = opts.resultSize    || 52;
        var padTop      = opts.paddingTop    || 60;
        var padBot      = opts.paddingBottom || 60;
        var showTitle   = opts.showTitle     !== false;
        var showSub     = opts.showSubtitle  !== false;
        var showPresets = opts.showPresets   !== false;
        var showSpeedConv = opts.showSpeedConv !== false;
        var defMode     = opts.defaultMode   || 'find_pace';
        var defUnit     = opts.defaultUnit   || 'km';
        var presets     = opts.presets       || [{ label:'5K', dist:5 }, { label:'10K', dist:10 }, { label:'Half', dist:21.0975 }, { label:'Marathon', dist:42.195 }];

        var mode = defMode;
        var unit = defUnit;
        var distVal  = '10';
        var timeVal  = '1:00:00';
        var paceVal  = '6:00';

        // Build DOM
        app.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        if (sectionBg) app.style.background = sectionBg;
        app.style.paddingTop    = padTop    + 'px';
        app.style.paddingBottom = padBot    + 'px';

        typoCssVarsForEl(app, opts.titleTypo, '--bkbg-pace-tt-');
        typoCssVarsForEl(app, opts.resultTypo, '--bkbg-pace-rs-');

        var card = document.createElement('div');
        card.className = 'bkbg-pace-card';
        card.style.cssText = 'background:' + cardBg + ';border-radius:' + cardRadius + 'px;padding:36px 32px;max-width:' + maxWidth + 'px;margin:0 auto;';
        app.appendChild(card);

        // Title
        if (showTitle && opts.title) {
            var titleEl = document.createElement('div');
            titleEl.className = 'bkbg-pace-title';
            titleEl.style.color = titleColor;
            titleEl.style.marginBottom = '6px';
            titleEl.textContent = opts.title;
            card.appendChild(titleEl);
        }
        if (showSub && opts.subtitle) {
            var subEl = document.createElement('div');
            subEl.style.cssText = 'font-size:15px;color:' + subtitleColor + ';margin-bottom:20px;';
            subEl.textContent = opts.subtitle;
            card.appendChild(subEl);
        }

        var modes = [
            { key: 'find_pace', label: 'Find Pace' },
            { key: 'find_time', label: 'Find Time' },
            { key: 'find_dist', label: 'Find Distance' }
        ];
        var units = [{ key: 'km', label: 'Kilometers' }, { key: 'mi', label: 'Miles' }];

        // Mode tabs
        var modeTabWrap = document.createElement('div');
        modeTabWrap.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;';
        card.appendChild(modeTabWrap);

        var modeTabBtns = {};
        modes.forEach(function(m) {
            var btn = document.createElement('button');
            btn.className = 'bkbg-pace-tab-btn';
            btn.textContent = m.label;
            btn.dataset.key = m.key;
            modeTabBtns[m.key] = btn;
            btn.addEventListener('click', function() { mode = m.key; refreshMode(); refreshResult(); });
            modeTabWrap.appendChild(btn);
        });

        // Unit tabs
        var unitTabWrap = document.createElement('div');
        unitTabWrap.style.cssText = 'display:flex;gap:8px;margin-bottom:18px;';
        card.appendChild(unitTabWrap);

        var unitTabBtns = {};
        units.forEach(function(u) {
            var btn = document.createElement('button');
            btn.className = 'bkbg-pace-tab-btn';
            btn.textContent = u.label;
            btn.dataset.key = u.key;
            unitTabBtns[u.key] = btn;
            btn.addEventListener('click', function() { unit = u.key; refreshUnit(); refreshResult(); });
            unitTabWrap.appendChild(btn);
        });

        // Presets
        var presetWrap = document.createElement('div');
        presetWrap.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;';
        card.appendChild(presetWrap);

        function buildPresets() {
            presetWrap.innerHTML = '';
            if (!showPresets || mode === 'find_dist') { presetWrap.style.display = 'none'; return; }
            presetWrap.style.display = 'flex';
            presets.forEach(function(p) {
                var d = unit === 'km' ? p.dist : p.dist / KM_PER_MILE;
                var btn = document.createElement('button');
                btn.className = 'bkbg-pace-preset-btn';
                btn.style.background = presetBg;
                btn.style.color = presetColor;
                btn.textContent = p.label;
                btn.addEventListener('click', function() {
                    distVal = String(parseFloat(d.toFixed(3)));
                    distInput.value = distVal;
                    refreshResult();
                });
                presetWrap.appendChild(btn);
            });
        }

        // Input grid
        var inputGrid = document.createElement('div');
        inputGrid.className = 'bkbg-pace-input-grid';
        card.appendChild(inputGrid);

        function makeInputRow(label, hint, initVal, onChange) {
            var wrap = document.createElement('div');
            wrap.className = 'bkbg-pace-input-row';
            var lbl = document.createElement('label');
            lbl.className = 'bkbg-pace-label';
            lbl.style.color = labelColor;
            var lspan = document.createElement('span'); lspan.textContent = label;
            var hspan = document.createElement('span'); hspan.className = 'bkbg-pace-label-hint'; hspan.textContent = hint;
            lbl.appendChild(lspan); lbl.appendChild(hspan);
            var inp = document.createElement('input');
            inp.className = 'bkbg-pace-input';
            inp.type = 'text';
            inp.value = initVal;
            inp.style.borderRadius = inputRadius + 'px';
            inp.addEventListener('input', function() { onChange(inp.value); refreshResult(); });
            wrap.appendChild(lbl); wrap.appendChild(inp);
            return { el: wrap, inp: inp, hspan: hspan, lspan: lspan };
        }

        var distRow = makeInputRow('Distance', unit === 'km' ? 'km' : 'mi', distVal, function(v) { distVal = v; });
        var timeRow = makeInputRow('Time', 'H:MM:SS', timeVal, function(v) { timeVal = v; });
        var paceRow = makeInputRow('Pace', 'M:SS/' + (unit==='km'?'km':'mi'), paceVal, function(v) { paceVal = v; });

        var distInput = distRow.inp;
        var timeInput = timeRow.inp;
        var paceInput = paceRow.inp;

        inputGrid.appendChild(distRow.el);
        inputGrid.appendChild(timeRow.el);
        inputGrid.appendChild(paceRow.el);

        // Result area
        var resultBox = document.createElement('div');
        resultBox.className = 'bkbg-pace-result';
        resultBox.style.cssText = 'background:' + resultBg + ';border:2px solid ' + resultBorder + ';border-radius:' + cardRadius + 'px;padding:24px 28px;';
        card.appendChild(resultBox);

        // Speed conversion
        var convBox = document.createElement('div');
        convBox.className = 'bkbg-pace-conv';
        convBox.style.background = convBg;
        card.appendChild(convBox);

        function refreshMode() {
            Object.keys(modeTabBtns).forEach(function(k) {
                var btn = modeTabBtns[k];
                var active = k === mode;
                btn.style.background    = active ? accent : 'transparent';
                btn.style.color         = active ? '#fff' : accent;
                btn.style.border        = '2px solid ' + (active ? accent : '#e5e7eb');
            });
            distRow.el.style.display = 'block';
            timeRow.el.style.display = (mode === 'find_dist' || mode === 'find_pace') ? 'block' : 'block';
            paceRow.el.style.display = 'block';

            // update grid: for find_dist remove dist, show time+pace
            if (mode === 'find_dist') {
                distRow.el.style.display = 'none';
                timeRow.el.style.display = 'block';
                paceRow.el.style.display = 'block';
                timeRow.hspan.textContent = 'H:MM:SS';
            } else if (mode === 'find_pace') {
                distRow.el.style.display = 'block';
                timeRow.el.style.display = 'block';
                paceRow.el.style.display = 'none';
                distRow.hspan.textContent = unit === 'km' ? 'km' : 'mi';
                timeRow.hspan.textContent = 'H:MM:SS';
            } else { // find_time
                distRow.el.style.display = 'block';
                timeRow.el.style.display = 'none';
                paceRow.el.style.display = 'block';
                distRow.hspan.textContent = unit === 'km' ? 'km' : 'mi';
                paceRow.hspan.textContent = 'M:SS/' + (unit === 'km' ? 'km' : 'mi');
            }
            buildPresets();
        }

        function refreshUnit() {
            Object.keys(unitTabBtns).forEach(function(k) {
                var btn = unitTabBtns[k];
                var active = k === unit;
                btn.style.background = active ? accent : 'transparent';
                btn.style.color      = active ? '#fff' : accent;
                btn.style.border     = '2px solid ' + (active ? accent : '#e5e7eb');
            });
            distRow.hspan.textContent = unit === 'km' ? 'km' : 'mi';
            paceRow.hspan.textContent = 'M:SS/' + (unit === 'km' ? 'km' : 'mi');
            buildPresets();
        }

        function refreshResult() {
            var distN  = parseFloat(distVal) || 0;
            var timeSec = timeToSecs(timeVal);
            var paceSec = paceToSecs(paceVal);
            var pu = unit === 'km' ? 'km' : 'mi';

            var labelTxt, mainTxt, subTxt = '', extraTxt = '';
            var speedKmh, speedMph, speedMs;

            if (mode === 'find_pace') {
                if (distN <= 0 || timeSec <= 0) { resultBox.innerHTML = '<div style="color:' + labelColor + '">Enter distance and time to calculate</div>'; convBox.innerHTML = ''; return; }
                var ps = timeSec / distN;
                speedKmh = 3600 / (unit === 'km' ? ps : ps * KM_PER_MILE);
                labelTxt = 'Your Pace'; mainTxt = secsToPace(ps); subTxt = '/' + pu;
            } else if (mode === 'find_time') {
                if (distN <= 0 || paceSec <= 0) { resultBox.innerHTML = '<div style="color:' + labelColor + '">Enter distance and pace to calculate</div>'; convBox.innerHTML = ''; return; }
                var ts = distN * paceSec;
                speedKmh = 3600 / (unit === 'km' ? paceSec : paceSec * KM_PER_MILE);
                labelTxt = 'Finish Time'; mainTxt = secsToHMS(ts);
            } else {
                // find_dist
                if (timeSec <= 0 || paceSec <= 0) { resultBox.innerHTML = '<div style="color:' + labelColor + '">Enter time and pace to calculate</div>'; convBox.innerHTML = ''; return; }
                var d = timeSec / paceSec;
                speedKmh = 3600 / (unit === 'km' ? paceSec : paceSec * KM_PER_MILE);
                labelTxt = 'Distance Covered'; mainTxt = d.toFixed(2); subTxt = pu;
            }

            resultBox.innerHTML = '';
            var lbl = document.createElement('div');
            lbl.style.cssText = 'font-size:13px;font-weight:600;color:' + labelColor + ';margin-bottom:6px;';
            lbl.textContent = labelTxt;
            resultBox.appendChild(lbl);
            var mainRow = document.createElement('div');
            mainRow.style.cssText = 'display:flex;align-items:baseline;justify-content:center;gap:4px;';
            var mainSpan = document.createElement('span');
            mainSpan.className = 'bkbg-pace-result-value';
            mainSpan.style.color = resultColor;
            mainSpan.textContent = mainTxt;
            mainRow.appendChild(mainSpan);
            if (subTxt) {
                var unitSpan = document.createElement('span');
                unitSpan.style.cssText = 'font-size:22px;font-weight:600;color:' + labelColor + ';';
                unitSpan.textContent = ' ' + subTxt;
                mainRow.appendChild(unitSpan);
            }
            resultBox.appendChild(mainRow);

            // Speed conversions
            if (showSpeedConv && speedKmh) {
                speedMph = speedKmh / KM_PER_MILE;
                speedMs  = speedKmh / 3.6;
                convBox.innerHTML = '';
                convBox.style.display = 'flex';
                [
                    { val: speedKmh.toFixed(2), lbl: 'km/h' },
                    { val: speedMph.toFixed(2), lbl: 'mph' },
                    { val: speedMs.toFixed(2),  lbl: 'm/s' }
                ].forEach(function(item) {
                    var div = document.createElement('div');
                    div.className = 'bkbg-pace-conv-item';
                    div.style.color = labelColor;
                    div.innerHTML = '<span class="bkbg-pace-conv-val">' + item.val + '</span><span class="bkbg-pace-conv-lbl">' + item.lbl + '</span>';
                    convBox.appendChild(div);
                });
            } else {
                convBox.innerHTML = '';
                convBox.style.display = 'none';
            }
        }

        // Init
        refreshMode();
        refreshUnit();
        refreshResult();
    }

    document.querySelectorAll('.bkbg-pace-app').forEach(initPaceCalc);
})();
