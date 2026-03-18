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

    // ── Helpers ──────────────────────────────────────────────────────────
    function qs(el, sel) { return el.querySelector(sel); }
    function fmt(n, d)   { return Number(n).toFixed(d !== undefined ? d : 2); }
    function fmtCur(n, cur) { return cur + fmt(n, 2); }

    function calcMarginMode(cost, margin) {
        if (cost <= 0 || margin >= 100) return null;
        var sp     = cost / (1 - margin / 100);
        var profit = sp - cost;
        return { sellingPrice: sp, profit: profit, margin: margin, markup: cost > 0 ? (profit / cost) * 100 : 0 };
    }
    function calcMarkupMode(cost, markup) {
        if (cost <= 0) return null;
        var sp     = cost * (1 + markup / 100);
        var profit = sp - cost;
        return { sellingPrice: sp, profit: profit, margin: sp > 0 ? (profit / sp) * 100 : 0, markup: markup };
    }
    function calcRevenueMode(revenue, cost) {
        if (revenue <= 0) return null;
        var profit = revenue - cost;
        return { sellingPrice: revenue, profit: profit, margin: (profit / revenue) * 100, markup: cost > 0 ? (profit / cost) * 100 : 0 };
    }

    function scaleColor(m) {
        if (m < 10)  return '#ef4444';
        if (m < 25)  return '#f59e0b';
        if (m < 50)  return '#10b981';
        return '#6c3fb5';
    }
    function scaleLabel(m) {
        if (m < 10)  return 'Low margin';
        if (m < 25)  return 'Moderate margin';
        if (m < 50)  return 'Healthy margin';
        return 'High margin';
    }

    // ── Bootstrap ────────────────────────────────────────────────────────
    document.querySelectorAll('.bkbg-mgc-app').forEach(function (root) {
        var opts;
        try { opts = JSON.parse(root.getAttribute('data-opts') || '{}'); }
        catch (e) { return; }

        var o = {
            title:          opts.title          || 'Profit Margin Calculator',
            subtitle:       opts.subtitle       || 'Calculate selling price, markup and gross profit instantly',
            currency:       opts.currency       || '$',
            defaultMode:    opts.defaultMode    || 'margin',
            defaultCost:    parseFloat(opts.defaultCost)    || 50,
            defaultMargin:  parseFloat(opts.defaultMargin)  || 40,
            defaultRevenue: parseFloat(opts.defaultRevenue) || 100,
            showMarkup:     opts.showMarkup     !== false,
            showBar:        opts.showBar        !== false,
            showMarginScale: opts.showMarginScale !== false,
            accentColor:    opts.accentColor    || '#10b981',
            profitColor:    opts.profitColor    || '#10b981',
            costColor:      opts.costColor      || '#f43f5e',
            sectionBg:      opts.sectionBg      || '#f0fdf4',
            cardBg:         opts.cardBg         || '#ffffff',
            inputBg:        opts.inputBg        || '#f9fafb',
            resultBg:       opts.resultBg       || '#dcfce7',
            titleColor:     opts.titleColor     || '#111827',
            subtitleColor:  opts.subtitleColor  || '#6b7280',
            labelColor:     opts.labelColor     || '#374151',
            titleTypo:      opts.titleTypo,
            subtitleTypo:   opts.subtitleTypo,
            contentMaxWidth: parseInt(opts.contentMaxWidth) || 680
        };

        var mode = o.defaultMode;

        // ── Build HTML ─────────────────────────────────────────────────
        root.innerHTML = [
            '<div class="bkbg-mgc-wrap" style="background:' + o.sectionBg + ';max-width:' + o.contentMaxWidth + 'px;--mgc-accent:' + o.accentColor + '">',

            o.title    ? '<h3 class="bkbg-mgc-title" style="color:' + o.titleColor + '">' + o.title    + '</h3>' : '',
            o.subtitle ? '<p  class="bkbg-mgc-subtitle" style="color:' + o.subtitleColor + '">' + o.subtitle + '</p>' : '',

            // tabs
            '<div class="bkbg-mgc-tabs">',
            '<button class="bkbg-mgc-tab" data-mode="margin">'  , 'Margin %',  '</button>',
            '<button class="bkbg-mgc-tab" data-mode="markup">'  , 'Markup %',  '</button>',
            '<button class="bkbg-mgc-tab" data-mode="revenue">' , 'Revenue',   '</button>',
            '</div>',

            // inputs — rendered dynamically
            '<div class="bkbg-mgc-inputs" id="mgc-inputs-grid"></div>',

            // result area
            '<div id="mgc-results"></div>',

            '</div>'
        ].join('');

        var wrap      = qs(root, '.bkbg-mgc-wrap');

        // Apply typography CSS vars on root
        typoCssVarsForEl(root, o.titleTypo, '--bkbg-mgc-tt-');
        typoCssVarsForEl(root, o.subtitleTypo, '--bkbg-mgc-st-');

        var inputGrid = qs(root, '#mgc-inputs-grid');
        var resultsEl = qs(root, '#mgc-results');
        var tabs      = root.querySelectorAll('.bkbg-mgc-tab');

        // ── Input state ────────────────────────────────────────────────
        var state = {
            cost:    o.defaultCost,
            margin:  o.defaultMargin,
            markup:  o.defaultMargin, // shared default for both %
            revenue: o.defaultRevenue
        };

        // ── Build inputs for active mode ───────────────────────────────
        function buildInputs() {
            var fields = [];
            if (mode === 'margin') {
                fields = [
                    { key:'cost',   label:'Cost Price (' + o.currency + ')',  val: state.cost,   min:0,   step:0.01 },
                    { key:'margin', label:'Target Margin (%)',                 val: state.margin, min:0.1, max:99.9, step:0.1 }
                ];
            } else if (mode === 'markup') {
                fields = [
                    { key:'cost',   label:'Cost Price (' + o.currency + ')', val: state.cost,   min:0, step:0.01 },
                    { key:'markup', label:'Markup (%)',                        val: state.markup, min:0, step:0.1  }
                ];
            } else {
                fields = [
                    { key:'revenue', label:'Revenue (' + o.currency + ')', val: state.revenue, min:0.01, step:0.01 },
                    { key:'cost',    label:'Cost (' + o.currency + ')',     val: state.cost,    min:0,    step:0.01 }
                ];
            }

            inputGrid.innerHTML = fields.map(function (f) {
                var maxAttr = f.max !== undefined ? ' max="' + f.max + '"' : '';
                return '<div class="bkbg-mgc-field">' +
                    '<label style="color:' + o.labelColor + '">' + f.label + '</label>' +
                    '<input class="bkbg-mgc-input" type="number" data-key="' + f.key + '" value="' + fmt(f.val, 2) + '" min="' + (f.min||0) + '"' + maxAttr + ' step="' + (f.step||1) + '" style="background:' + o.inputBg + ';color:' + o.labelColor + '">' +
                    '</div>';
            }).join('');

            inputGrid.querySelectorAll('.bkbg-mgc-input').forEach(function (inp) {
                inp.addEventListener('input', function () {
                    var key = inp.getAttribute('data-key');
                    var val = parseFloat(inp.value);
                    if (!isNaN(val)) { state[key] = val; }
                    renderResults();
                });
            });
        }

        // ── Render results ─────────────────────────────────────────────
        function renderResults() {
            var result;
            if      (mode === 'margin')  result = calcMarginMode(state.cost, state.margin);
            else if (mode === 'markup')  result = calcMarkupMode(state.cost, state.markup);
            else                          result = calcRevenueMode(state.revenue, state.cost);

            if (!result) {
                resultsEl.innerHTML = '<div class="bkbg-mgc-error">Please enter valid positive values (margin must be &lt; 100%).</div>';
                return;
            }

            // cards
            var cards = [
                { label:'Selling Price', value: fmtCur(result.sellingPrice, o.currency), color: o.accentColor, bg: o.resultBg },
                { label:'Gross Profit',  value: fmtCur(result.profit,       o.currency), color: o.profitColor, bg: o.resultBg },
                { label:'Margin %',      value: fmt(result.margin, 1) + '%',             color: o.profitColor, bg: '#f0fdf4'  }
            ];
            if (o.showMarkup) {
                cards.push({ label:'Markup %', value: fmt(result.markup, 1) + '%', color: o.accentColor, bg: '#f0fdf4' });
            }

            var cardsHtml = '<div class="bkbg-mgc-cards">' +
                cards.map(function (c) {
                    return '<div class="bkbg-mgc-card" style="background:' + c.bg + ';border-left-color:' + c.color + '">' +
                        '<div class="bkbg-mgc-card-label">' + c.label + '</div>' +
                        '<div class="bkbg-mgc-card-value" style="color:' + c.color + '">' + c.value + '</div>' +
                        '</div>';
                }).join('') +
                '</div>';

            // bar
            var barHtml = '';
            if (o.showBar && result.sellingPrice > 0) {
                var costAmt   = result.sellingPrice - result.profit;
                var costPct   = Math.max(0, Math.min(100, (costAmt / result.sellingPrice) * 100));
                var profitPct = 100 - costPct;
                barHtml = '<div class="bkbg-mgc-bar-section">' +
                    '<div class="bkbg-mgc-bar-heading" style="color:' + o.labelColor + '">Price Breakdown</div>' +
                    '<div class="bkbg-mgc-bar-track">' +
                    '<div class="bkbg-mgc-bar-cost"   style="width:' + fmt(costPct,2)   + '%;background:' + o.costColor   + '">' + (costPct   > 15 ? fmt(costPct,0)   + '% Cost'   : '') + '</div>' +
                    '<div class="bkbg-mgc-bar-profit" style="width:' + fmt(profitPct,2) + '%;background:' + o.profitColor + '">' + (profitPct > 15 ? fmt(profitPct,0) + '% Profit' : '') + '</div>' +
                    '</div>' +
                    '<div class="bkbg-mgc-bar-legend">' +
                    '<span style="color:' + o.costColor   + '">● Cost: '   + fmtCur(costAmt,        o.currency) + '</span>' +
                    '<span style="color:' + o.profitColor + '">● Profit: ' + fmtCur(result.profit,  o.currency) + '</span>' +
                    '</div>' +
                    '</div>';
            }

            // margin scale
            var scaleHtml = '';
            if (o.showMarginScale) {
                var m       = result.margin;
                var sColor  = scaleColor(m);
                var sLabel  = scaleLabel(m);
                var fillPct = Math.max(0, Math.min(100, m));
                scaleHtml = '<div class="bkbg-mgc-scale" style="background:' + o.cardBg + '">' +
                    '<div class="bkbg-mgc-scale-header">' +
                    '<span class="bkbg-mgc-scale-label" style="color:' + o.labelColor + '">Margin Health</span>' +
                    '<span class="bkbg-mgc-scale-status" style="color:' + sColor + '">' + sLabel + '</span>' +
                    '</div>' +
                    '<div class="bkbg-mgc-scale-track">' +
                    '<div class="bkbg-mgc-scale-fill" style="width:' + fmt(fillPct,2) + '%;background:' + sColor + '"></div>' +
                    '</div>' +
                    '<div class="bkbg-mgc-scale-ticks"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>' +
                    '</div>';
            }

            resultsEl.innerHTML = cardsHtml + barHtml + scaleHtml;
        }

        // ── Tab switching ──────────────────────────────────────────────
        function activateTab(newMode) {
            mode = newMode;
            tabs.forEach(function (t) {
                t.classList.toggle('active', t.getAttribute('data-mode') === mode);
                t.style.background   = t.classList.contains('active') ? o.accentColor : o.cardBg;
                t.style.borderColor  = t.classList.contains('active') ? o.accentColor : '#d1d5db';
                t.style.color        = t.classList.contains('active') ? '#ffffff'     : o.labelColor;
            });
            buildInputs();
            renderResults();
        }

        tabs.forEach(function (t) {
            t.addEventListener('click', function () {
                activateTab(t.getAttribute('data-mode'));
            });
        });

        // ── Initial render ─────────────────────────────────────────────
        activateTab(mode);
    });
})();
