(function () {
    'use strict';

    var _typoKeys = {
        family: '-ff', sizeDesktop: '-fs', sizeTablet: '-fs-tab', sizeMobile: '-fs-mob',
        weight: '-fw', style: '-fst', decoration: '-td', transform: '-tt',
        letterSpacing: '-ls', lineHeight: '-lh'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj) return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k]; if (v === undefined || v === '') return;
            var u = (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile')
                ? (String(v).match(/[a-z%]/i) ? v : v + 'px')
                : (k === 'lineHeight' ? String(v) : v);
            el.style.setProperty(prefix + _typoKeys[k], u);
        });
    }

    function fmtNum(n, dp) {
        if (isNaN(n) || !isFinite(n)) return '—';
        var fixed = parseFloat(n.toFixed(dp !== undefined ? dp : 4));
        return fixed.toLocaleString('en-US', { maximumFractionDigits: dp !== undefined ? dp : 4 });
    }

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var accent     = opts.accentColor     || '#6c3fb5';
        var cardBg     = opts.cardBg          || '#ffffff';
        var tabActBg   = opts.tabActiveBg     || accent;
        var tabActClr  = opts.tabActiveColor  || '#ffffff';
        var tabInaBg   = opts.tabInactiveBg   || '#f3f4f6';
        var tabInaClr  = opts.tabInactiveColor|| '#374151';
        var resultBg   = opts.resultBg        || '#f5f3ff';
        var resultBdr  = opts.resultBorder    || '#ede9fe';
        var resultClr  = opts.resultColor     || accent;
        var titleClr   = opts.titleColor      || '#1e1b4b';
        var subClr     = opts.subtitleColor   || '#6b7280';
        var labelClr   = opts.labelColor      || '#374151';
        var cRadius    = (opts.cardRadius  !== undefined ? opts.cardRadius : 16) + 'px';
        var tRadius    = (opts.tabRadius   !== undefined ? opts.tabRadius  : 99) + 'px';
        var iRadius    = (opts.inputRadius !== undefined ? opts.inputRadius: 8)  + 'px';
        var maxW       = (opts.maxWidth    || 600) + 'px';
        var ptop       = (opts.paddingTop  !== undefined ? opts.paddingTop  : 60) + 'px';
        var pbot       = (opts.paddingBottom!== undefined ? opts.paddingBottom : 60) + 'px';

        var TABS = [
            opts.mode1Label || '% of Number',
            opts.mode2Label || 'Find %',
            opts.mode3Label || '% Change',
        ];

        var currentMode = 0;

        /* Card */
        var card = document.createElement('div');
        card.className = 'bkbg-pct-card';
        card.style.cssText = [
            'background:' + cardBg,
            'border-radius:' + cRadius,
            'padding-top:' + ptop,
            'padding-bottom:' + pbot,
            'padding-left:32px',
            'padding-right:32px',
            'max-width:' + maxW,
            'margin:0 auto',
        ].join(';');
        app.innerHTML = '';
        app.appendChild(card);

        /* Title */
        if (opts.showTitle !== false && opts.title) {
            var h2 = document.createElement('h2');
            h2.className = 'bkbg-pct-title';
            h2.style.color = titleClr;
            typoCssVarsForEl(h2, opts.titleTypo, '--bkbg-pct-title');
            h2.textContent = opts.title;
            card.appendChild(h2);
        }

        /* Subtitle */
        if (opts.showSubtitle !== false && opts.subtitle) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-pct-subtitle';
            sub.style.color = subClr;
            typoCssVarsForEl(sub, opts.subtitleTypo, '--bkbg-pct-subtitle');
            sub.textContent = opts.subtitle;
            card.appendChild(sub);
        }

        /* Tabs */
        var tabsDiv = document.createElement('div');
        tabsDiv.className = 'bkbg-pct-tabs';
        card.appendChild(tabsDiv);

        /* Input area */
        var inputArea = document.createElement('div');
        card.appendChild(inputArea);

        /* Result */
        var resultBox = document.createElement('div');
        resultBox.className = 'bkbg-pct-result';
        resultBox.style.cssText = 'background:' + resultBg + ';border:1.5px solid ' + resultBdr + ';border-radius:' + cRadius;
        var resultFormula = document.createElement('div');
        resultFormula.className = 'bkbg-pct-result-formula';
        var resultNum = document.createElement('div');
        resultNum.className = 'bkbg-pct-result-num';
        resultNum.style.color = resultClr;
        typoCssVarsForEl(resultNum, opts.resultTypo, '--bkbg-pct-result');
        resultNum.textContent = '—';
        var resultDir = document.createElement('div');
        resultDir.className = 'bkbg-pct-result-dir';
        resultDir.style.display = 'none';
        resultBox.appendChild(resultFormula);
        resultBox.appendChild(resultNum);
        resultBox.appendChild(resultDir);
        card.appendChild(resultBox);

        /* ── Input builders ─────────────────────────────────────────────── */
        function mkInput(placeholder) {
            var inp = document.createElement('input');
            inp.type = 'number';
            inp.className = 'bkbg-pct-input';
            inp.placeholder = placeholder;
            inp.step = 'any';
            inp.style.cssText = 'border-radius:' + iRadius;
            return inp;
        }

        function mkLabel(text) {
            var lbl = document.createElement('label');
            lbl.className = 'bkbg-pct-label';
            lbl.style.color = labelClr;
            lbl.textContent = text;
            return lbl;
        }

        function mkSep(text) {
            var s = document.createElement('span');
            s.className = 'bkbg-pct-sep';
            s.textContent = text;
            return s;
        }

        var inputs = {};

        function buildMode0() {
            inputArea.innerHTML = '';
            var row = document.createElement('div');
            row.className = 'bkbg-pct-row';
            var f1 = document.createElement('div'); f1.className = 'bkbg-pct-field shrink';
            var pct = mkInput('25'); inputs.m0p = pct;
            f1.appendChild(mkLabel('%'));
            f1.appendChild(pct);
            var f2 = document.createElement('div'); f2.className = 'bkbg-pct-field grow';
            var num = mkInput('200'); inputs.m0n = num;
            f2.appendChild(mkLabel('Number'));
            f2.appendChild(num);
            row.appendChild(f1);
            row.appendChild(mkSep('% of'));
            row.appendChild(f2);
            inputArea.appendChild(row);
            [pct, num].forEach(function (i) { i.addEventListener('input', compute); });
        }

        function buildMode1() {
            inputArea.innerHTML = '';
            var row = document.createElement('div');
            row.className = 'bkbg-pct-row';
            var f1 = document.createElement('div'); f1.className = 'bkbg-pct-field grow';
            var x = mkInput('50'); inputs.m1x = x;
            f1.appendChild(mkLabel('Value'));
            f1.appendChild(x);
            var f2 = document.createElement('div'); f2.className = 'bkbg-pct-field grow';
            var y = mkInput('200'); inputs.m1y = y;
            f2.appendChild(mkLabel('Total'));
            f2.appendChild(y);
            row.appendChild(f1);
            row.appendChild(mkSep('is _% of'));
            row.appendChild(f2);
            inputArea.appendChild(row);
            [x, y].forEach(function (i) { i.addEventListener('input', compute); });
        }

        function buildMode2() {
            inputArea.innerHTML = '';
            var row = document.createElement('div');
            row.className = 'bkbg-pct-row';
            var f1 = document.createElement('div'); f1.className = 'bkbg-pct-field grow';
            var x = mkInput('100'); inputs.m2x = x;
            f1.appendChild(mkLabel('From'));
            f1.appendChild(x);
            var f2 = document.createElement('div'); f2.className = 'bkbg-pct-field grow';
            var y = mkInput('150'); inputs.m2y = y;
            f2.appendChild(mkLabel('To'));
            f2.appendChild(y);
            row.appendChild(f1);
            row.appendChild(mkSep('→'));
            row.appendChild(f2);
            inputArea.appendChild(row);
            [x, y].forEach(function (i) { i.addEventListener('input', compute); });
        }

        function compute() {
            var result, formula, dir = null;
            if (currentMode === 0) {
                var p = parseFloat(inputs.m0p && inputs.m0p.value) || 0;
                var n = parseFloat(inputs.m0n && inputs.m0n.value) || 0;
                result = (p / 100) * n;
                formula = p + '% of ' + n + ' =';
            } else if (currentMode === 1) {
                var x1 = parseFloat(inputs.m1x && inputs.m1x.value);
                var y1 = parseFloat(inputs.m1y && inputs.m1y.value);
                result = (x1 / y1) * 100;
                formula = x1 + ' is ___% of ' + y1;
            } else {
                var x2 = parseFloat(inputs.m2x && inputs.m2x.value);
                var y2 = parseFloat(inputs.m2y && inputs.m2y.value);
                result = ((y2 - x2) / Math.abs(x2)) * 100;
                formula = 'Change from ' + x2 + ' to ' + y2;
                if (!isNaN(result) && isFinite(result)) dir = result >= 0 ? 'increase' : 'decrease';
            }

            var valid = !isNaN(result) && isFinite(result);
            var clr = dir ? (dir === 'increase' ? '#16a34a' : '#dc2626') : resultClr;

            resultFormula.textContent = formula || '';
            if (valid) {
                if (currentMode === 0) resultNum.textContent = fmtNum(result, 4);
                else if (currentMode === 1) resultNum.textContent = fmtNum(result, 2) + '%';
                else resultNum.textContent = (result >= 0 ? '+' : '') + fmtNum(result, 2) + '%';
            } else {
                resultNum.textContent = '—';
            }
            resultNum.style.color = clr;
            if (dir) {
                resultDir.style.display = 'block';
                resultDir.style.color = clr;
                resultDir.textContent = dir === 'increase' ? '▲ Increase' : '▼ Decrease';
            } else {
                resultDir.style.display = 'none';
            }
        }

        /* ── Build tabs ─────────────────────────────────────────────────── */
        var tabBtns = [];
        TABS.forEach(function (label, idx) {
            var btn = document.createElement('button');
            btn.className = 'bkbg-pct-tab';
            btn.textContent = label;
            btn.style.cssText = 'border-radius:' + tRadius;
            btn.style.background = idx === 0 ? tabActBg : tabInaBg;
            btn.style.color      = idx === 0 ? tabActClr : tabInaClr;
            btn.addEventListener('click', function () {
                currentMode = idx;
                tabBtns.forEach(function (b, i) {
                    b.style.background = i === idx ? tabActBg : tabInaBg;
                    b.style.color      = i === idx ? tabActClr : tabInaClr;
                });
                if (idx === 0) buildMode0();
                else if (idx === 1) buildMode1();
                else buildMode2();
                compute();
            });
            tabBtns.push(btn);
            tabsDiv.appendChild(btn);
        });

        /* Init */
        buildMode0();
        compute();
    }

    document.querySelectorAll('.bkbg-pct-app').forEach(buildApp);
})();
