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

    var BRACKETS = {
        single: [
            { lo: 0,       hi: 11925,    rate: 0.10 },
            { lo: 11925,   hi: 48475,    rate: 0.12 },
            { lo: 48475,   hi: 103350,   rate: 0.22 },
            { lo: 103350,  hi: 197300,   rate: 0.24 },
            { lo: 197300,  hi: 250525,   rate: 0.32 },
            { lo: 250525,  hi: 626350,   rate: 0.35 },
            { lo: 626350,  hi: Infinity, rate: 0.37 }
        ],
        married: [
            { lo: 0,       hi: 23850,    rate: 0.10 },
            { lo: 23850,   hi: 96950,    rate: 0.12 },
            { lo: 96950,   hi: 206700,   rate: 0.22 },
            { lo: 206700,  hi: 394600,   rate: 0.24 },
            { lo: 394600,  hi: 501050,   rate: 0.32 },
            { lo: 501050,  hi: 751600,   rate: 0.35 },
            { lo: 751600,  hi: Infinity, rate: 0.37 }
        ],
        hoh: [
            { lo: 0,       hi: 17000,    rate: 0.10 },
            { lo: 17000,   hi: 64850,    rate: 0.12 },
            { lo: 64850,   hi: 103350,   rate: 0.22 },
            { lo: 103350,  hi: 197300,   rate: 0.24 },
            { lo: 197300,  hi: 250500,   rate: 0.32 },
            { lo: 250500,  hi: 626350,   rate: 0.35 },
            { lo: 626350,  hi: Infinity, rate: 0.37 }
        ]
    };
    var STD_DED = { single: 15000, married: 30000, hoh: 22500 };
    var SS_CAP  = 176100;

    function calcFedTax(taxable, filing) {
        var brackets = BRACKETS[filing] || BRACKETS.single;
        var tax = 0;
        for (var i = 0; i < brackets.length; i++) {
            var b = brackets[i];
            if (taxable <= b.lo) break;
            tax += (Math.min(taxable, b.hi) - b.lo) * b.rate;
        }
        return Math.max(0, tax);
    }

    function toAnnual(val, period) {
        if (period === 'monthly') return val * 12;
        if (period === 'hourly')  return val * 2080;
        return val;
    }

    function calcAll(income, period, filing, stateTaxPct, k401Pct, otherDed) {
        var gross   = toAnnual(parseFloat(income) || 0, period);
        var ded401k = gross * ((parseFloat(k401Pct) || 0) / 100);
        var other   = parseFloat(otherDed) || 0;
        var preTax  = ded401k + other;
        var taxable = Math.max(0, gross - preTax - (STD_DED[filing] || 15000));
        var fedTax  = calcFedTax(taxable, filing);
        var stateTax = (gross - preTax) * ((parseFloat(stateTaxPct) || 0) / 100);
        var ss       = Math.min(gross, SS_CAP) * 0.062;
        var medicare = gross * 0.0145;
        var totalTax = fedTax + stateTax + ss + medicare;
        var netAnnual = Math.max(0, gross - totalTax - preTax);
        return {
            gross: gross, preTax: preTax, ded401k: ded401k, otherDed: other,
            fedTax: fedTax, stateTax: stateTax, ss: ss, medicare: medicare,
            totalTax: totalTax, netAnnual: netAnnual,
            effectiveRate: gross > 0 ? (totalTax / gross) * 100 : 0
        };
    }

    function fmt(n, cur) {
        return (cur || '$') + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function pct(n, base) {
        return base > 0 ? Math.min(100, (n / base) * 100) : 0;
    }

    document.querySelectorAll('.bkbg-slc-app').forEach(function (root) {
        var opts = {};
        try { opts = JSON.parse(root.getAttribute('data-opts') || '{}'); } catch(e) {}

        var cur            = opts.currency        || '$';
        var showBreakdown  = opts.showBreakdown    !== false;
        var showAllPeriods = opts.showAllPeriods   !== false;
        var showEffective  = opts.showEffectiveRate !== false;
        var accentColor    = opts.accentColor    || '#0ea5e9';
        var taxColor       = opts.taxColor       || '#ef4444';
        var dedColor       = opts.dedColor       || '#f59e0b';
        var sectionBg      = opts.sectionBg      || '#f0f9ff';
        var cardBg         = opts.cardBg         || '#ffffff';
        var inputBg        = opts.inputBg        || '#f9fafb';
        var resultBg       = opts.resultBg       || '#e0f2fe';
        var titleColor     = opts.titleColor     || '#0c4a6e';
        var subtitleColor  = opts.subtitleColor  || '#6b7280';
        var labelColor     = opts.labelColor     || '#374151';

        var state = {
            income:    opts.defaultIncome    || 75000,
            period:    opts.defaultPeriod    || 'annual',
            filing:    opts.defaultFiling    || 'single',
            stateTax:  opts.defaultStateTax  != null ? opts.defaultStateTax : 5,
            k401:      opts.default401k      != null ? opts.default401k : 6,
            otherDed:  opts.defaultOtherDed  || 0
        };

        var FILING_LABELS = { single: 'Single', married: 'Married (Joint)', hoh: 'Head of Household' };
        var PERIOD_LABELS = { annual: 'Annual', monthly: 'Monthly', hourly: 'Hourly' };

        function brow(label, val, barPct, color) {
            return '<div class="bkbg-slc-brow">' +
                '<span class="bkbg-slc-brow-label" style="color:' + labelColor + ';">' + label + '</span>' +
                '<div class="bkbg-slc-brow-bar-wrap"><div class="bkbg-slc-brow-bar" style="width:' + barPct.toFixed(1) + '%;background:' + color + ';"></div></div>' +
                '<span class="bkbg-slc-brow-val" style="color:' + color + ';">' + val + '</span>' +
            '</div>';
        }

        function render() {
            var r = calcAll(state.income, state.period, state.filing, state.stateTax, state.k401, state.otherDed);

            root.innerHTML =
                '<div class="bkbg-slc-card" style="background:' + cardBg + ';max-width:' + (opts.contentMaxWidth || 720) + 'px;">' +
                    '<h2 class="bkbg-slc-title" style="color:' + titleColor + ';">' + (opts.title || 'Salary &amp; Take-Home Pay Calculator') + '</h2>' +
                    '<p class="bkbg-slc-subtitle" style="color:' + subtitleColor + ';">' + (opts.subtitle || 'Estimate your net pay after taxes and deductions') + '</p>' +

                    '<div class="bkbg-slc-inputs" style="background:' + sectionBg + ';">' +
                        '<div class="bkbg-slc-row">' +
                            '<div class="bkbg-slc-field">' +
                                '<label class="bkbg-slc-label" style="color:' + labelColor + ';">Income</label>' +
                                '<div class="bkbg-slc-input-wrap">' +
                                    '<span class="bkbg-slc-prefix">' + cur + '</span>' +
                                    '<input type="number" class="bkbg-slc-input" id="slc-income" value="' + state.income + '" style="background:' + inputBg + ';padding-left:28px;" min="0" step="1000">' +
                                '</div>' +
                            '</div>' +
                            '<div class="bkbg-slc-field">' +
                                '<label class="bkbg-slc-label" style="color:' + labelColor + ';">Pay Period</label>' +
                                '<select class="bkbg-slc-select" id="slc-period" style="background:' + inputBg + ';">' +
                                    '<option value="annual"'  + (state.period==='annual'  ? ' selected':'' ) + '>Annual</option>' +
                                    '<option value="monthly"' + (state.period==='monthly' ? ' selected':'' ) + '>Monthly</option>' +
                                    '<option value="hourly"'  + (state.period==='hourly'  ? ' selected':'' ) + '>Hourly</option>' +
                                '</select>' +
                            '</div>' +
                            '<div class="bkbg-slc-field">' +
                                '<label class="bkbg-slc-label" style="color:' + labelColor + ';">Filing Status</label>' +
                                '<select class="bkbg-slc-select" id="slc-filing" style="background:' + inputBg + ';">' +
                                    '<option value="single"'  + (state.filing==='single'  ? ' selected':'') + '>Single</option>' +
                                    '<option value="married"' + (state.filing==='married' ? ' selected':'') + '>Married (Joint)</option>' +
                                    '<option value="hoh"'     + (state.filing==='hoh'     ? ' selected':'') + '>Head of Household</option>' +
                                '</select>' +
                            '</div>' +
                        '</div>' +
                        '<div class="bkbg-slc-row">' +
                            '<div class="bkbg-slc-field">' +
                                '<label class="bkbg-slc-label" style="color:' + labelColor + ';">State Tax Rate (%)</label>' +
                                '<input type="number" class="bkbg-slc-input" id="slc-statetax" value="' + state.stateTax + '" style="background:' + inputBg + ';" min="0" max="20" step="0.1">' +
                            '</div>' +
                            '<div class="bkbg-slc-field">' +
                                '<label class="bkbg-slc-label" style="color:' + labelColor + ';">401(k) Contribution (%)</label>' +
                                '<input type="number" class="bkbg-slc-input" id="slc-401k" value="' + state.k401 + '" style="background:' + inputBg + ';" min="0" max="30" step="0.5">' +
                            '</div>' +
                            '<div class="bkbg-slc-field">' +
                                '<label class="bkbg-slc-label" style="color:' + labelColor + ';">Other Deductions (' + cur + ')</label>' +
                                '<input type="number" class="bkbg-slc-input" id="slc-other" value="' + state.otherDed + '" style="background:' + inputBg + ';" min="0" step="100">' +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    '<div class="bkbg-slc-net-hero" style="background:' + resultBg + ';">' +
                        '<div class="bkbg-slc-net-label" style="color:' + labelColor + ';">💵 Annual Take-Home Pay</div>' +
                        '<div class="bkbg-slc-net-val" style="color:' + accentColor + ';">' + fmt(r.netAnnual, cur) + '</div>' +
                        (showEffective ? '<div class="bkbg-slc-net-eff" style="color:' + labelColor + ';">Effective tax rate: ' + r.effectiveRate.toFixed(1) + '%</div>' : '') +
                    '</div>' +

                    (showAllPeriods ?
                    '<div class="bkbg-slc-periods">' +
                        ['Monthly','Bi-weekly','Weekly','Daily','Hourly'].map(function(lbl, i) {
                            var divisors = [12, 26, 52, 260, 2080];
                            return '<div class="bkbg-slc-period-card" style="border-color:' + accentColor + '55;background:' + accentColor + '12;">' +
                                '<div class="bkbg-slc-period-label" style="color:' + labelColor + ';">' + lbl + '</div>' +
                                '<div class="bkbg-slc-period-val" style="color:' + accentColor + ';">' + fmt(r.netAnnual / divisors[i], cur) + '</div>' +
                            '</div>';
                        }).join('') +
                    '</div>' : '') +

                    (showBreakdown ?
                    '<div class="bkbg-slc-breakdown">' +
                        '<h3 class="bkbg-slc-breakdown-title" style="color:' + labelColor + ';">📊 Annual Breakdown</h3>' +
                        brow('Gross Income',          fmt(r.gross,    cur),  100,                     accentColor) +
                        (r.ded401k > 0  ? brow('401(k) Contribution', '−'+fmt(r.ded401k,  cur), pct(r.ded401k, r.gross),  dedColor) : '') +
                        (r.otherDed > 0 ? brow('Other Deductions',    '−'+fmt(r.otherDed, cur), pct(r.otherDed,r.gross),  dedColor) : '') +
                        brow('Federal Income Tax',   '−'+fmt(r.fedTax,   cur), pct(r.fedTax,   r.gross), taxColor) +
                        brow('State Income Tax',     '−'+fmt(r.stateTax, cur), pct(r.stateTax, r.gross), taxColor) +
                        brow('Social Security',      '−'+fmt(r.ss,       cur), pct(r.ss,       r.gross), taxColor) +
                        brow('Medicare',             '−'+fmt(r.medicare, cur), pct(r.medicare, r.gross), taxColor) +
                        '<div class="bkbg-slc-divider"></div>' +
                        brow('✓ Net Take-Home Pay',  fmt(r.netAnnual, cur),  pct(r.netAnnual,r.gross), accentColor) +
                    '</div>' : '') +
                '</div>';

            bindEvents();
        }

        function bindEvents() {
            var inputs = {
                'slc-income':   function(v){ state.income   = parseFloat(v) || 0; },
                'slc-statetax': function(v){ state.stateTax = parseFloat(v) || 0; },
                'slc-401k':     function(v){ state.k401     = parseFloat(v) || 0; },
                'slc-other':    function(v){ state.otherDed = parseFloat(v) || 0; }
            };
            var selects = {
                'slc-period':  function(v){ state.period = v; },
                'slc-filing':  function(v){ state.filing = v; }
            };

            Object.keys(inputs).forEach(function(id) {
                var el = root.querySelector('#' + id);
                if (el) el.addEventListener('input', function() { inputs[id](this.value); render(); });
            });
            Object.keys(selects).forEach(function(id) {
                var el = root.querySelector('#' + id);
                if (el) el.addEventListener('change', function() { selects[id](this.value); render(); });
            });
        }

        render();
        typoCssVarsForEl(root, opts.titleTypo, '--bkslc-tt-');
        typoCssVarsForEl(root, opts.subtitleTypo, '--bkslc-st-');
    });

})();
