(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo) return;
        if (typo.family)     el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', sans-serif");
        if (typo.weight)     el.style.setProperty(prefix + 'font-weight', typo.weight);
        if (typo.transform)  el.style.setProperty(prefix + 'text-transform', typo.transform);
        if (typo.style)      el.style.setProperty(prefix + 'font-style', typo.style);
        if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) el.style.setProperty(prefix + 'font-size-d', typo.sizeDesktop + su);
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) el.style.setProperty(prefix + 'font-size-t', typo.sizeTablet + su);
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) el.style.setProperty(prefix + 'font-size-m', typo.sizeMobile + su);
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    function diffDates(from, to) {
        var d1 = new Date(from), d2 = new Date(to);
        if (isNaN(d1) || isNaN(d2)) return null;
        var swapped = false;
        if (d1 > d2) { var t = d1; d1 = d2; d2 = t; swapped = true; }
        var totalMs    = d2 - d1;
        var totalDays  = Math.floor(totalMs / 86400000);
        var totalWeeks = Math.floor(totalDays / 7);
        var totalHours = Math.floor(totalMs / 3600000);
        var totalMins  = Math.floor(totalMs / 60000);

        /* Calendar years/months/days */
        var y = d2.getFullYear() - d1.getFullYear();
        var m = d2.getMonth()    - d1.getMonth();
        var d = d2.getDate()     - d1.getDate();
        if (d < 0) { m--; var prev = new Date(d2.getFullYear(), d2.getMonth(), 0); d += prev.getDate(); }
        if (m < 0) { y--; m += 12; }

        /* Working days */
        var wdays = 0, cur = new Date(d1);
        while (cur < d2) { var dow = cur.getDay(); if (dow !== 0 && dow !== 6) wdays++; cur.setDate(cur.getDate()+1); }

        return { years:y, months:m, days:d, totalDays:totalDays, totalWeeks:totalWeeks, totalHours:totalHours, totalMins:totalMins, workingDays:wdays, swapped:swapped };
    }

    function todayStr() {
        var d = new Date(), month = d.getMonth()+1, day = d.getDate();
        return d.getFullYear() + '-' + (month<10?'0'+month:month) + '-' + (day<10?'0'+day:day);
    }

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var accent   = opts.accentColor   || '#6c3fb5';
        var cardBg   = opts.cardBg        || '#ffffff';
        var resultBg = opts.resultBg      || '#f5f3ff';
        var resultBdr= opts.resultBorder  || '#ede9fe';
        var cRadius  = (opts.cardRadius   || 16) + 'px';
        var iRadius  = (opts.inputRadius  || 8)  + 'px';
        var maxW     = (opts.maxWidth     || 620) + 'px';
        var ptop     = (opts.paddingTop   || 60) + 'px';
        var pbot     = (opts.paddingBottom|| 60) + 'px';
        var numSz    = (opts.numSize      || 40) + 'px';
        var titleSz  = (opts.titleSize    || 26) + 'px';
        var lclr     = opts.labelColor    || '#374151';

        var state = { from: todayStr(), to: todayStr() };

        /* Set typography CSS vars on wrapper */
        app.style.setProperty('--bkbg-dd-ttl-fs', titleSz);
        app.style.setProperty('--bkbg-dd-sub-fs', '14px');
        app.style.setProperty('--bkbg-dd-num-fs', numSz);
        typoCssVarsForEl(opts.typoTitle,    '--bkbg-dd-ttl-', app);
        typoCssVarsForEl(opts.typoSubtitle, '--bkbg-dd-sub-', app);
        typoCssVarsForEl(opts.typoNumber,   '--bkbg-dd-num-', app);

        /* Card */
        var card = document.createElement('div');
        card.className = 'bkbg-dd-card';
        card.style.cssText = 'background:' + cardBg + ';border-radius:' + cRadius + ';max-width:' + maxW + ';margin:0 auto;padding:' + ptop + ' 32px ' + pbot;
        app.innerHTML = '';
        app.appendChild(card);

        /* Title */
        if (opts.showTitle !== false && opts.title) {
            var h2 = document.createElement('h2');
            h2.className = 'bkbg-dd-title';
            h2.style.cssText = 'color:' + (opts.titleColor||'#1e1b4b');
            h2.textContent = opts.title;
            card.appendChild(h2);
        }
        if (opts.showSubtitle !== false && opts.subtitle) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-dd-subtitle';
            sub.style.cssText = 'color:' + (opts.subtitleColor||'#6b7280');
            sub.textContent = opts.subtitle;
            card.appendChild(sub);
        }

        var inpCSS = 'width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:' + iRadius + ';font-size:15px;box-sizing:border-box;outline:none;background:#fff;color:' + lclr;

        /* Date pickers row */
        var pickers = document.createElement('div');
        pickers.className = 'bkbg-dd-pickers';
        pickers.style.cssText = 'display:flex;gap:12px;align-items:flex-end;margin-bottom:20px;flex-wrap:wrap';

        function mkPicker(labelTxt, val, onCh) {
            var col = document.createElement('div');
            col.style.cssText = 'flex:1;min-width:120px';
            var lbl = document.createElement('label');
            lbl.className = 'bkbg-dd-label';
            lbl.style.cssText = 'font-size:13px;font-weight:600;color:' + lclr + ';display:block;margin-bottom:4px';
            lbl.textContent = labelTxt;
            var inp = document.createElement('input');
            inp.type = 'date'; inp.value = val; inp.className = 'bkbg-dd-input'; inp.style.cssText = inpCSS;
            inp.addEventListener('change', function () { onCh(inp.value); });
            col.appendChild(lbl); col.appendChild(inp);
            return { col: col, inp: inp };
        }

        var fromPicker = mkPicker(opts.labelFrom || 'From Date', state.from, function (v) { state.from = v; update(); });
        var toPicker   = mkPicker(opts.labelTo   || 'To Date',   state.to,   function (v) { state.to   = v; update(); });

        pickers.appendChild(fromPicker.col);

        if (opts.showSwapBtn !== false) {
            var swapBtn = document.createElement('button');
            swapBtn.className = 'bkbg-dd-swap';
            swapBtn.style.cssText = 'padding:10px 14px;border:1.5px solid ' + accent + ';border-radius:' + iRadius + ';background:#fff;color:' + accent + ';cursor:pointer;font-weight:600;font-size:18px;flex-shrink:0';
            swapBtn.textContent = '⇄';
            swapBtn.title = 'Swap dates';
            swapBtn.addEventListener('click', function () {
                var tmp = state.from;
                state.from = state.to;
                state.to   = tmp;
                fromPicker.inp.value = state.from;
                toPicker.inp.value   = state.to;
                update();
            });
            pickers.appendChild(swapBtn);
        }

        pickers.appendChild(toPicker.col);
        card.appendChild(pickers);

        /* Results area */
        var resultsArea = document.createElement('div');
        card.appendChild(resultsArea);

        /* Stat configs */
        function getStats(diff) {
            var list = [];
            if (opts.showTotalDays   !== false) list.push({ label:'Total Days',     val:diff.totalDays.toLocaleString(),  unit:'days',    color:opts.daysColor  ||'#3b82f6' });
            if (opts.showWeeks       !== false) list.push({ label:'Total Weeks',    val:diff.totalWeeks.toLocaleString(), unit:'weeks',   color:opts.weeksColor ||'#10b981' });
            if (opts.showHours       !== false) list.push({ label:'Total Hours',    val:diff.totalHours.toLocaleString(), unit:'hours',   color:opts.hoursColor ||'#f59e0b' });
            if (opts.showMinutes     !== false) list.push({ label:'Total Minutes',  val:diff.totalMins.toLocaleString(),  unit:'minutes', color:'#8b5cf6' });
            if (opts.showWorkingDays !== false) list.push({ label:'Working Days',   val:diff.workingDays.toLocaleString(),unit:'Mon–Fri', color:opts.wdaysColor ||'#ef4444' });
            return list;
        }

        function update() {
            resultsArea.innerHTML = '';
            var diff = diffDates(state.from, state.to);
            var sameDay = state.from === state.to;

            if (!diff || sameDay) {
                var empty = document.createElement('div');
                empty.className = 'bkbg-dd-empty';
                empty.style.cssText = 'text-align:center;padding:32px;color:#9ca3af;background:' + resultBg + ';border-radius:' + cRadius + ';border:1.5px solid ' + resultBdr;
                empty.textContent = 'Select two different dates to see the difference.';
                resultsArea.appendChild(empty);
                return;
            }

            /* YMD summary */
            if (opts.showYMD !== false) {
                var box = document.createElement('div');
                box.className = 'bkbg-dd-result-box';
                box.style.cssText = 'background:' + resultBg + ';border:1.5px solid ' + resultBdr + ';border-radius:' + cRadius + ';padding:20px;text-align:center;margin-bottom:16px';

                var rlbl = document.createElement('div');
                rlbl.className = 'bkbg-dd-result-label';
                rlbl.style.cssText = 'font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px';
                rlbl.textContent = 'Duration';
                box.appendChild(rlbl);

                var ymdParts = [];
                if (diff.years  > 0) ymdParts.push(diff.years  + ' yr');
                if (diff.months > 0) ymdParts.push(diff.months + ' mo');
                if (diff.days   > 0) ymdParts.push(diff.days   + ' day');
                if (ymdParts.length === 0) ymdParts.push('0 days');

                var ymdEl = document.createElement('div');
                ymdEl.className = 'bkbg-dd-ymd';
                ymdEl.style.cssText = 'font-size:22px;font-weight:800;color:' + (opts.ymdColor||accent) + ';line-height:1.3';
                ymdEl.textContent = ymdParts.join('  ');
                box.appendChild(ymdEl);

                if (diff.swapped) {
                    var note = document.createElement('div');
                    note.className = 'bkbg-dd-swapped-note';
                    note.style.cssText = 'font-size:12px;color:#9ca3af;margin-top:8px';
                    note.textContent = '(dates swapped — showing absolute difference)';
                    box.appendChild(note);
                }

                resultsArea.appendChild(box);
            }

            /* Stat cards */
            var stats = getStats(diff);
            if (stats.length > 0) {
                var cols = stats.length <= 2 ? '1fr '.repeat(stats.length).trim()
                         : stats.length <= 4 ? '1fr 1fr'
                         : '1fr 1fr 1fr';

                var grid = document.createElement('div');
                grid.className = 'bkbg-dd-stats';
                grid.style.cssText = 'display:grid;grid-template-columns:' + cols + ';gap:10px';

                stats.forEach(function (s) {
                    var sc = document.createElement('div');
                    sc.className = 'bkbg-dd-stat';
                    sc.style.cssText = 'text-align:center;background:#fff;border-radius:10px;padding:16px 8px;border:1.5px solid #e5e7eb';
                    sc.innerHTML = '<div class="bkbg-dd-stat-label" style="font-size:' + (opts.statLabelFontSize || 11) + 'px;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;margin-bottom:4px">' + s.label + '</div>' +
                        '<div class="bkbg-dd-stat-num" style="color:' + s.color + '">' + s.val + '</div>' +
                        '<div class="bkbg-dd-stat-unit" style="font-size:' + (opts.statUnitFontSize || 12) + 'px;color:#9ca3af">' + s.unit + '</div>';
                    grid.appendChild(sc);
                });

                resultsArea.appendChild(grid);
            }
        }

        update();
    }

    document.querySelectorAll('.bkbg-dd-app').forEach(buildApp);
})();
