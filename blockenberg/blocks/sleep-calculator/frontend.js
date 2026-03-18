(function () {
    'use strict';

    var _typoKeys = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform'],
        ['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m'],
        ['sizeUnit','font-size-unit'],
        ['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m'],
        ['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m'],
        ['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']
    ];
    function typoCssVarsForEl(el, typo, prefix) {
        if (!typo || typeof typo !== 'object') return;
        _typoKeys.forEach(function(pair) {
            var val = typo[pair[0]];
            if (val !== undefined && val !== '' && val !== null) {
                var v = (typeof val === 'number' && pair[1].indexOf('font-size') !== -1) ? val + 'px' : String(val);
                el.style.setProperty(prefix + pair[1], v);
            }
        });
    }

    var CYCLE_MIN = 90;

    function pad2(n) { return String(n).padStart(2, '0'); }

    function addMinutes(h, m, mins) {
        var total = h * 60 + m + mins;
        total = ((total % 1440) + 1440) % 1440;
        return { h: Math.floor(total / 60), m: total % 60 };
    }
    function subMinutes(h, m, mins) {
        return addMinutes(h, m, -mins);
    }
    function fmt12(h, m) {
        var ampm = h < 12 ? 'AM' : 'PM';
        var hh   = h % 12 || 12;
        return hh + ':' + pad2(m) + ' ' + ampm;
    }

    function calcTimes(mode, h, m, onsetDelay, cMin, cMax) {
        var results = [];
        for (var c = cMax; c >= cMin; c--) {
            var totalMins = (onsetDelay || 14) + c * CYCLE_MIN;
            var t = mode === 'wake' ? addMinutes(h, m, totalMins) : subMinutes(h, m, totalMins);
            results.push({ cycles: c, h: t.h, m: t.m, totalSleep: c * CYCLE_MIN });
        }
        return results;
    }

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var o = opts;
        var mode      = o.mode       || 'wake';
        var onsetDly  = parseInt(o.onsetDelay) || 14;
        var cMin      = parseInt(o.cyclesMin)  || 4;
        var cMax      = parseInt(o.cyclesMax)  || 6;
        var timeSz    = o.timeSize   || 36;
        var radius    = (o.cardRadius || 16) + 'px';
        var accentC   = o.accentColor    || '#6c3fb5';
        var bestC     = o.bestColor      || '#6c3fb5';
        var goodC     = o.goodColor      || '#3b82f6';
        var okC       = o.okColor        || '#f59e0b';
        var tagBg     = o.cycleTagBg     || '#ede9fe';
        var tagC      = o.cycleTagColor  || '#6c3fb5';
        var labelC    = o.labelColor     || '#374151';
        var resultBg  = o.resultBg       || '#f5f3ff';
        var resultBdr = o.resultBorder   || '#ede9fe';
        var tipBg     = o.tipBg          || '#fef9c3';
        var tipC      = o.tipColor       || '#713f12';

        var now = new Date();
        var selH = now.getHours();
        var selM = Math.floor(now.getMinutes() / 5) * 5;

        app.innerHTML = '';
        app.style.fontFamily = 'inherit';
        app.style.boxSizing  = 'border-box';

        typoCssVarsForEl(app, o.titleTypo, '--bkslp-tt-');
        typoCssVarsForEl(app, o.subtitleTypo, '--bkslp-st-');

        // Section
        var section = document.createElement('div');
        section.className = 'bkbg-sleep-section';
        section.style.paddingTop    = (o.paddingTop || 60) + 'px';
        section.style.paddingBottom = (o.paddingBottom || 60) + 'px';
        section.style.background    = o.sectionBg || '';
        app.appendChild(section);

        var card = document.createElement('div');
        card.style.background   = o.cardBg || '#ffffff';
        card.style.borderRadius = radius;
        card.style.padding      = '36px 32px';
        card.style.maxWidth     = (o.maxWidth || 580) + 'px';
        card.style.margin       = '0 auto';
        card.style.boxShadow    = '0 4px 24px rgba(0,0,0,0.09)';
        card.style.boxSizing    = 'border-box';
        section.appendChild(card);

        // Title / subtitle
        if (o.showTitle || o.showSubtitle) {
            var hdr = document.createElement('div');
            hdr.style.marginBottom = '20px';
            if (o.showTitle) {
                var ttl = document.createElement('div');
                ttl.className    = 'bkbg-sleep-title';
                ttl.textContent  = o.title || 'Sleep Calculator';
                ttl.style.color      = o.titleColor || '#1e1b4b';
                ttl.style.marginBottom = '6px';
                hdr.appendChild(ttl);
            }
            if (o.showSubtitle && o.subtitle) {
                var sub = document.createElement('div');
                sub.className    = 'bkbg-sleep-subtitle';
                sub.textContent  = o.subtitle;
                sub.style.color    = o.subtitleColor || '#6b7280';
                hdr.appendChild(sub);
            }
            card.appendChild(hdr);
        }

        // Mode tab row
        var tabRow = document.createElement('div');
        tabRow.style.cssText = 'display:flex;gap:10px;margin-bottom:24px;';
        var modeLabelWake  = '🌙 I want to wake up at\u2026';
        var modeLabelSleep = '⏰ I need to wake up at\u2026';
        var modes = [['wake', modeLabelWake], ['sleep', modeLabelSleep]];
        var modeBtns = {};

        modes.forEach(function (pair) {
            var m = pair[0]; var lbl = pair[1];
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = lbl;
            btn.className = 'bkbg-sleep-mode-btn';
            btn.style.cssText = 'flex:1;padding:10px;border-radius:8px;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;';
            btn.addEventListener('click', function () {
                mode = m;
                refreshTabs();
                refreshLabel();
                renderResults();
            });
            modeBtns[m] = btn;
            tabRow.appendChild(btn);
        });
        card.appendChild(tabRow);

        function refreshTabs() {
            ['wake', 'sleep'].forEach(function (m2) {
                var btn = modeBtns[m2];
                var a2  = m2 === mode;
                btn.style.background  = a2 ? accentC : 'transparent';
                btn.style.color       = a2 ? '#fff' : accentC;
                btn.style.border      = '2px solid ' + (a2 ? accentC : '#e5e7eb');
            });
        }
        refreshTabs();

        // Label above time row
        var timeLabel = document.createElement('div');
        timeLabel.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:8px;color:' + labelC + ';';
        card.appendChild(timeLabel);

        function refreshLabel() {
            timeLabel.textContent = mode === 'wake' ? 'I plan to go to bed at:' : 'I need to wake up at:';
        }
        refreshLabel();

        // Time selector
        var timeRow = document.createElement('div');
        timeRow.className = 'bkbg-sleep-time-row';
        timeRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:24px;';

        function makeSelect(opts2, initVal, onChange) {
            var sel = document.createElement('select');
            sel.style.cssText = 'padding:10px 14px;font-size:20px;font-weight:700;border:2px solid #e5e7eb;border-radius:' + (o.inputRadius || 8) + 'px;background:#fff;cursor:pointer;';
            opts2.forEach(function (opt) {
                var op = document.createElement('option');
                op.value       = opt.value;
                op.textContent = opt.label;
                if (String(opt.value) === String(initVal)) op.selected = true;
                sel.appendChild(op);
            });
            sel.addEventListener('change', function () { onChange(sel.value); renderResults(); });
            return sel;
        }

        var hourOpts = [];
        for (var h2 = 0; h2 < 24; h2++) {
            var ampm2 = h2 < 12 ? 'AM' : 'PM';
            var hh2   = h2 % 12 || 12;
            hourOpts.push({ label: hh2 + ' ' + ampm2, value: String(h2) });
        }
        var minOpts = [];
        for (var mm = 0; mm < 60; mm += 5) { minOpts.push({ label: pad2(mm), value: String(mm) }); }

        var hSel = makeSelect(hourOpts, selH, function (v) { selH = parseInt(v, 10); });
        var sep  = document.createElement('span');
        sep.textContent  = ':';
        sep.style.cssText = 'font-size:22px;font-weight:700;color:' + labelC + ';';
        var mSel = makeSelect(minOpts, selM, function (v) { selM = parseInt(v, 10); });

        timeRow.appendChild(hSel);
        timeRow.appendChild(sep);
        timeRow.appendChild(mSel);
        card.appendChild(timeRow);

        // Results label
        var resLabel = document.createElement('div');
        resLabel.style.cssText = 'font-size:13px;font-weight:600;margin-bottom:12px;color:' + labelC + ';';
        card.appendChild(resLabel);

        // Results container
        var resContainer = document.createElement('div');
        resContainer.className = 'bkbg-sleep-results';
        resContainer.style.marginBottom = o.showTips ? '20px' : '0';
        card.appendChild(resContainer);

        // Tips
        if (o.showTips) {
            var tipBox = document.createElement('div');
            tipBox.className = 'bkbg-sleep-tip';
            tipBox.style.cssText = 'background:' + tipBg + ';color:' + tipC + ';border-radius:' + radius + ';padding:14px 18px;font-size:13px;line-height:1.6;';
            tipBox.innerHTML = '<strong>💡 Tip:</strong> Sleep comes in 90-minute cycles. Waking at the end of a cycle helps you feel more refreshed. Allow ' + onsetDly + ' minutes to fall asleep.';
            card.appendChild(tipBox);
        }

        function qualColor(c) {
            if (c >= 6) return bestC;
            if (c >= 5) return goodC;
            return okC;
        }

        function renderResults() {
            var results = calcTimes(mode, selH, selM, onsetDly, cMin, cMax);
            resLabel.textContent = mode === 'wake' ? 'Set your alarm for one of these times:' : 'Try to fall asleep at one of these times:';
            resContainer.innerHTML = '';
            results.forEach(function (r, i) {
                var qC      = qualColor(r.cycles);
                var totalH  = Math.floor(r.totalSleep / 60);
                var totalM  = r.totalSleep % 60;
                var row = document.createElement('div');
                row.className = 'bkbg-sleep-result-row';
                row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:14px 18px;margin-bottom:8px;background:' + resultBg + ';border:1.5px solid ' + resultBdr + ';border-left:4px solid ' + (i === 0 ? qC : 'transparent') + ';border-radius:' + radius + ';transition:box-shadow .18s,transform .18s;box-sizing:border-box;';

                var left = document.createElement('div');
                var timeEl = document.createElement('div');
                timeEl.textContent  = fmt12(r.h, r.m);
                timeEl.style.cssText = 'font-size:' + timeSz + 'px;font-weight:800;color:' + qC + ';line-height:1.1;';
                var durEl = document.createElement('div');
                durEl.textContent  = totalH + 'h' + (totalM ? ' ' + totalM + 'm' : '') + ' of sleep';
                durEl.style.cssText = 'font-size:12px;color:' + labelC + ';margin-top:2px;';
                left.appendChild(timeEl);
                left.appendChild(durEl);

                var right = document.createElement('div');
                right.style.textAlign = 'right';
                var tag = document.createElement('div');
                tag.textContent  = r.cycles + ' cycles';
                tag.style.cssText = 'display:inline-block;font-weight:700;font-size:12px;background:' + tagBg + ';color:' + tagC + ';padding:3px 10px;border-radius:100px;margin-bottom:3px;';
                right.appendChild(tag);
                if (i === 0) {
                    var best = document.createElement('div');
                    best.textContent  = '★ Best';
                    best.style.cssText = 'font-size:11px;color:' + qC + ';font-weight:600;margin-top:2px;';
                    right.appendChild(best);
                }

                row.appendChild(left);
                row.appendChild(right);
                resContainer.appendChild(row);
            });
        }

        renderResults();
    }

    document.querySelectorAll('.bkbg-sleep-app').forEach(buildApp);
})();
