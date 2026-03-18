(function () {
    'use strict';

    /* ---- Typography CSS-var helper ---- */
    var _typoKeys = {family:'font-family',weight:'font-weight',style:'font-style',decoration:'text-decoration',transform:'text-transform'};
    var _respKeys = {sizeDesktop:'font-size-d',sizeTablet:'font-size-t',sizeMobile:'font-size-m',lineHeightDesktop:'line-height-d',lineHeightTablet:'line-height-t',lineHeightMobile:'line-height-m',letterSpacingDesktop:'letter-spacing-d',letterSpacingTablet:'letter-spacing-t',letterSpacingMobile:'letter-spacing-m',wordSpacingDesktop:'word-spacing-d',wordSpacingTablet:'word-spacing-t',wordSpacingMobile:'word-spacing-m'};
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        var k;
        for (k in _typoKeys) { if (obj[k]) el.style.setProperty(prefix + _typoKeys[k], obj[k]); }
        for (k in _respKeys) { if (obj[k] !== undefined && obj[k] !== '') el.style.setProperty(prefix + _respKeys[k], obj[k]); }
    }

    /* ---- Math helpers ---- */
    function parseNums(raw) {
        var parts = raw.trim().split(/[\s,;]+/);
        var nums = [];
        for (var i = 0; i < parts.length; i++) {
            var p = parts[i].trim();
            if (p === '') continue;
            var n = parseFloat(p);
            if (isNaN(n)) throw new Error('Invalid number: "' + p + '"');
            nums.push(n);
        }
        if (nums.length < 2) throw new Error('Enter at least 2 numbers.');
        return nums;
    }

    function mean(arr) { return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length; }

    function median(sorted) {
        var n = sorted.length;
        return n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    }

    function mode(arr) {
        var freq = {};
        arr.forEach(function (n) { freq[n] = (freq[n] || 0) + 1; });
        var maxF = Math.max.apply(null, Object.values(freq));
        if (maxF === 1) return { values: [], label: 'No mode' };
        var modes = Object.keys(freq).filter(function (k) { return freq[k] === maxF; })
                          .map(Number).sort(function (a, b) { return a - b; });
        return { values: modes, label: modes.join(', '), freq: maxF };
    }

    function stdDev(arr, mn) {
        var variance = arr.reduce(function (s, v) { return s + Math.pow(v - mn, 2); }, 0) / arr.length;
        return { variance: variance, stdDev: Math.sqrt(variance) };
    }

    function quartiles(sorted) {
        var n = sorted.length;
        var lo = sorted.slice(0, Math.floor(n / 2));
        var hi = n % 2 === 0 ? sorted.slice(n / 2) : sorted.slice(Math.floor(n / 2) + 1);
        return { q1: median(lo), q3: median(hi) };
    }

    function skewness(arr, mn, sd) {
        if (sd === 0) return 0;
        var n = arr.length;
        var s = arr.reduce(function (a, v) { return a + Math.pow((v - mn) / sd, 3); }, 0);
        return (n / ((n - 1) * (n - 2))) * s;
    }

    function histogram(arr, bins) {
        var mn  = Math.min.apply(null, arr);
        var mx  = Math.max.apply(null, arr);
        var rng = mx - mn;
        if (rng === 0) { return [{ label: mn.toString(), count: arr.length, lo: mn, hi: mn }]; }
        bins = bins || Math.max(4, Math.min(12, Math.ceil(Math.sqrt(arr.length))));
        var w = rng / bins;
        var buckets = [];
        for (var i = 0; i < bins; i++) {
            var lo = mn + i * w;
            var hi = lo + w;
            var count = arr.filter(function (v) { return v >= lo && (i === bins - 1 ? v <= hi : v < hi); }).length;
            buckets.push({ lo: lo, hi: hi, count: count });
        }
        return buckets;
    }

    /* ---- DOM build ---- */
    function initApp(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) { return; }

        var accent   = opts.accentColor   || '#6c3fb5';
        var meanC    = opts.meanColor     || '#6c3fb5';
        var medianC  = opts.medianColor   || '#0ea5e9';
        var modeC    = opts.modeColor     || '#10b981';
        var stdC     = opts.stdDevColor   || '#f59e0b';
        var barC     = opts.barColor      || accent;
        var cardR    = (opts.cardRadius   || 16) + 'px';
        var statR    = (opts.statRadius   || 12) + 'px';
        var inpR     = (opts.inputRadius  || 8)  + 'px';
        var maxW     = (opts.maxWidth     || 680) + 'px';
        var dp       = opts.decimalPlaces !== undefined ? opts.decimalPlaces : 4;
        var lblClr   = opts.labelColor    || '#374151';

        app.style.paddingTop    = (opts.paddingTop    || 60) + 'px';
        app.style.paddingBottom = (opts.paddingBottom || 60) + 'px';
        if (opts.sectionBg) app.style.background = opts.sectionBg;

        /* Typography CSS vars */
        if (opts.titleSize)      app.style.setProperty('--bkstc-tt-sz', opts.titleSize + 'px');
        if (opts.titleFontWeight) app.style.setProperty('--bkstc-tt-wt', opts.titleFontWeight);
        if (opts.titleLineHeight !== undefined) app.style.setProperty('--bkstc-tt-lh', opts.titleLineHeight);
        if (opts.subtitleFontSize) app.style.setProperty('--bkstc-st-sz', opts.subtitleFontSize + 'px');
        if (opts.subtitleLineHeight !== undefined) app.style.setProperty('--bkstc-st-lh', opts.subtitleLineHeight);
        typoCssVarsForEl(app, opts.titleTypo, '--bkstc-tt-');
        typoCssVarsForEl(app, opts.subtitleTypo, '--bkstc-st-');

        /* Card */
        var card = document.createElement('div');
        card.className = 'bkbg-stc-card';
        Object.assign(card.style, { background: opts.cardBg || '#fff', borderRadius: cardR, maxWidth: maxW });
        app.appendChild(card);

        if (opts.showTitle && opts.title) {
            var ttl = document.createElement('div'); ttl.className = 'bkbg-stc-title';
            ttl.textContent = opts.title;
            if (opts.titleColor) ttl.style.color = opts.titleColor;
            card.appendChild(ttl);
        }
        if (opts.showSubtitle && opts.subtitle) {
            var sub = document.createElement('div'); sub.className = 'bkbg-stc-subtitle';
            sub.textContent = opts.subtitle;
            if (opts.subtitleColor) sub.style.color = opts.subtitleColor;
            card.appendChild(sub);
        }

        /* Input */
        var lbl = document.createElement('label'); lbl.className = 'bkbg-stc-lbl'; lbl.textContent = 'Dataset';
        if (lblClr) lbl.style.color = lblClr; card.appendChild(lbl);
        var ta = document.createElement('textarea'); ta.className = 'bkbg-stc-textarea';
        ta.value = opts.defaultData || '4, 8, 15, 16, 23, 42';
        ta.placeholder = 'e.g. 4, 8, 15, 16, 23, 42';
        ta.style.borderRadius = inpR; ta.style.background = opts.inputBg || '#f9fafb';
        ta.style.borderColor  = opts.inputBorder || '#d1d5db';
        card.appendChild(ta);

        /* Buttons row */
        var row = document.createElement('div'); row.className = 'bkbg-stc-row'; card.appendChild(row);
        var btn = document.createElement('button'); btn.className = 'bkbg-stc-calc-btn';
        btn.textContent = '⚡ Calculate'; btn.style.background = accent; row.appendChild(btn);
        var clr = document.createElement('button'); clr.className = 'bkbg-stc-clear-btn';
        clr.textContent = 'Clear'; row.appendChild(clr);
        var errEl = document.createElement('div'); errEl.className = 'bkbg-stc-error'; card.appendChild(errEl);

        /* Results area */
        var resultsArea = document.createElement('div'); card.appendChild(resultsArea);

        function fmt(n) { return parseFloat(n.toFixed(dp)).toString(); }

        function STAT_CARDS(mn, med, mod, sd, v, rng, knt, min, max) {
            return [
                { label: 'Mean',      val: fmt(mn),  color: meanC  },
                { label: 'Median',    val: fmt(med), color: medianC },
                { label: 'Mode',      val: mod.label,color: modeC   },
                { label: 'Std Dev',   val: fmt(sd),  color: stdC    },
                { label: 'Variance',  val: fmt(v),   color: stdC    },
                { label: 'Range',     val: fmt(rng), color: accent  },
                { label: 'Count',     val: knt,      color: accent  },
                { label: 'Min',       val: fmt(min), color: '#6b7280' },
                { label: 'Max',       val: fmt(max), color: '#6b7280' }
            ];
        }

        function render(nums) {
            resultsArea.innerHTML = '';
            var sorted = nums.slice().sort(function (a, b) { return a - b; });
            var mn   = mean(nums);
            var med  = median(sorted);
            var mod  = mode(nums);
            var sv   = stdDev(nums, mn);
            var sd   = sv.stdDev; var variance = sv.variance;
            var rng  = sorted[sorted.length - 1] - sorted[0];
            var qs   = quartiles(sorted);
            var iqr  = qs.q3 - qs.q1;
            var skew = skewness(nums, mn, sd);
            var min  = sorted[0]; var max = sorted[sorted.length - 1];

            /* ---- Stat grid ---- */
            var grid = document.createElement('div'); grid.className = 'bkbg-stc-grid';
            STAT_CARDS(mn, med, mod, sd, variance, rng, nums.length, min, max).forEach(function (s) {
                var sc = document.createElement('div'); sc.className = 'bkbg-stc-stat-card';
                sc.style.background  = opts.statCardBg || '#fafafa';
                sc.style.borderTopColor = s.color;
                sc.style.borderRadius   = statR;
                var sl = document.createElement('div'); sl.className = 'bkbg-stc-stat-lbl'; sl.textContent = s.label;
                var sv2 = document.createElement('div'); sv2.className = 'bkbg-stc-stat-val'; sv2.textContent = s.val; sv2.style.color = s.color;
                sc.appendChild(sl); sc.appendChild(sv2); grid.appendChild(sc);
            });
            /* Extra single-row stats */
            [
                { label: 'Q1',  val: fmt(qs.q1) },
                { label: 'Q3',  val: fmt(qs.q3) },
                { label: 'IQR', val: fmt(iqr)   },
                { label: 'Skewness', val: fmt(skew) }
            ].forEach(function (s) {
                var sc = document.createElement('div'); sc.className = 'bkbg-stc-stat-card';
                sc.style.background = opts.statCardBg || '#fafafa'; sc.style.borderTopColor = '#9ca3af';
                sc.style.borderRadius = statR;
                var sl = document.createElement('div'); sl.className = 'bkbg-stc-stat-lbl'; sl.textContent = s.label;
                var sv2 = document.createElement('div'); sv2.className = 'bkbg-stc-stat-val'; sv2.textContent = s.val; sv2.style.color = '#6b7280';
                sc.appendChild(sl); sc.appendChild(sv2); grid.appendChild(sc);
            });
            resultsArea.appendChild(grid);

            /* ---- Histogram ---- */
            if (opts.showHistogram !== false) {
                var sep1 = document.createElement('div'); sep1.className = 'bkbg-stc-sep'; resultsArea.appendChild(sep1);
                var ht = document.createElement('div'); ht.className = 'bkbg-stc-section-title'; ht.textContent = 'Frequency Histogram'; resultsArea.appendChild(ht);
                var buckets = histogram(nums);
                var maxCt = Math.max.apply(null, buckets.map(function (b) { return b.count; }));
                var hWrap = document.createElement('div'); hWrap.className = 'bkbg-stc-histogram'; resultsArea.appendChild(hWrap);
                buckets.forEach(function (b) {
                    var col = document.createElement('div'); col.className = 'bkbg-stc-hist-col';
                    var bar = document.createElement('div'); bar.className = 'bkbg-stc-hist-bar';
                    var h = maxCt > 0 ? Math.max(4, (b.count / maxCt) * 90) : 4;
                    bar.style.height = h + 'px'; bar.style.background = barC; bar.title = 'Count: ' + b.count;
                    var lbl2 = document.createElement('div'); lbl2.className = 'bkbg-stc-hist-lbl';
                    lbl2.textContent = parseFloat(b.lo.toFixed(2));
                    col.appendChild(bar); col.appendChild(lbl2); hWrap.appendChild(col);
                });
            }

            /* ---- Box plot ---- */
            if (opts.showBoxPlot !== false && max > min) {
                var sep2 = document.createElement('div'); sep2.className = 'bkbg-stc-sep'; resultsArea.appendChild(sep2);
                var bt2 = document.createElement('div'); bt2.className = 'bkbg-stc-section-title'; bt2.textContent = 'Box Plot'; resultsArea.appendChild(bt2);
                var bpw = document.createElement('div'); bpw.className = 'bkbg-stc-boxplot-wrap';
                var bpt = document.createElement('div'); bpt.className = 'bkbg-stc-boxplot-track';
                var span = max - min;
                var q1pct  = ((qs.q1  - min) / span) * 100;
                var q3pct  = ((qs.q3  - min) / span) * 100;
                var medpct = ((med    - min) / span) * 100;
                var iqrEl = document.createElement('div'); iqrEl.className = 'bkbg-stc-boxplot-iqr';
                iqrEl.style.left = q1pct + '%'; iqrEl.style.width = (q3pct - q1pct) + '%';
                iqrEl.style.background = barC + '66';
                var medEl = document.createElement('div'); medEl.className = 'bkbg-stc-boxplot-median';
                medEl.style.left = medpct + '%'; medEl.style.background = medianC;
                bpt.appendChild(iqrEl); bpt.appendChild(medEl);
                var bpl = document.createElement('div'); bpl.className = 'bkbg-stc-boxplot-labels';
                [
                    { label: 'Min ' + fmt(min), left: '0%' },
                    { label: 'Q1 ' + fmt(qs.q1), left: q1pct + '%' },
                    { label: 'Med ' + fmt(med), left: medpct + '%' },
                    { label: 'Q3 ' + fmt(qs.q3), left: q3pct + '%' },
                    { label: 'Max ' + fmt(max), left: '100%' }
                ].forEach(function (p) {
                    var s = document.createElement('span'); s.textContent = p.label; bpl.appendChild(s);
                });
                bpw.appendChild(bpt); bpw.appendChild(bpl); resultsArea.appendChild(bpw);
            }

            /* ---- Sorted list ---- */
            if (opts.showSortedList !== false) {
                var sep3 = document.createElement('div'); sep3.className = 'bkbg-stc-sep'; resultsArea.appendChild(sep3);
                var st = document.createElement('div'); st.className = 'bkbg-stc-section-title'; st.textContent = 'Sorted Values'; resultsArea.appendChild(st);
                var sw = document.createElement('div'); sw.className = 'bkbg-stc-sorted';
                var lowerFence = qs.q1 - 1.5 * iqr;
                var upperFence = qs.q3 + 1.5 * iqr;
                sorted.forEach(function (n) {
                    var pill = document.createElement('span'); pill.className = 'bkbg-stc-pill';
                    var isMode = mod.values.indexOf(n) !== -1;
                    var isOut  = n < lowerFence || n > upperFence;
                    if (isMode) { pill.classList.add('bkbg-stc-pill-mode'); pill.style.background = modeC; }
                    else if (isOut) { pill.classList.add('bkbg-stc-pill-outlier'); }
                    pill.textContent = fmt(n); if (isMode) pill.title = 'Mode'; if (isOut) pill.title = 'Outlier';
                    sw.appendChild(pill);
                });
                resultsArea.appendChild(sw);
                var legend = document.createElement('div'); legend.style.cssText = 'font-size:11px;color:#9ca3af;margin-top:8px;display:flex;gap:16px;flex-wrap:wrap;';
                [{ bg: modeC, label: '● Mode' }, { bg: '#fee2e2', label: '● Outlier (IQR×1.5)' }].forEach(function (l) {
                    var s = document.createElement('span'); s.style.color = l.bg; s.textContent = l.label; legend.appendChild(s);
                });
                resultsArea.appendChild(legend);
            }
        }

        /* Trigger initial calculation */
        function calculate() {
            errEl.textContent = '';
            try {
                var nums = parseNums(ta.value);
                render(nums);
            } catch (e) {
                resultsArea.innerHTML = '';
                errEl.textContent = '❗ ' + e.message;
            }
        }

        btn.addEventListener('click', calculate);
        clr.addEventListener('click', function () { ta.value = ''; resultsArea.innerHTML = ''; errEl.textContent = ''; });
        ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); calculate(); } });

        calculate(); /* auto-run on load */
    }

    document.querySelectorAll('.bkbg-stc-app').forEach(initApp);
})();
