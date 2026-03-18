( function () {
    var el                = wp.element.createElement;
    var useState          = wp.element.useState;
    var Fragment          = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __                = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;
    var Button            = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    /* ── Affordability math ─────────────────────────── */
    function calcAffordability(income, monthlyDebts, rate, years, downPct, feRatio, beRatio, incomeShare, paymentMode) {
        var monthlyIncome = income / 12;
        var maxFront = monthlyIncome * (feRatio / 100);
        var maxBack  = monthlyIncome * (beRatio / 100) - monthlyDebts;
        var maxDti   = Math.max(0, Math.min(maxFront, maxBack));
        var maxShare = Math.max(0, monthlyIncome * ((incomeShare || 30) / 100));
        var mode = paymentMode || 'min';
        var maxPmt;

        if (mode === 'incomeShare') {
            maxPmt = maxShare;
        } else if (mode === 'dti') {
            maxPmt = maxDti;
        } else {
            maxPmt = Math.min(maxDti, maxShare);
        }

        /* Reverse mortgage: P = pmt × ((1-(1+r)^-n)/r) */
        var r = rate / 100 / 12;
        var n = years * 12;
        var maxLoan;
        if (r === 0) {
            maxLoan = maxPmt * n;
        } else {
            maxLoan = maxPmt * ((1 - Math.pow(1 + r, -n)) / r);
        }
        var downAmount = maxLoan > 0 ? maxLoan / (1 - downPct / 100) * (downPct / 100) : 0;
        var maxHome    = maxLoan + downAmount;
        var dti        = monthlyIncome > 0 ? ((maxPmt + monthlyDebts) / monthlyIncome) * 100 : 0;

        return {
            maxHome:    Math.max(0, maxHome),
            maxLoan:    Math.max(0, maxLoan),
            maxMonthly: maxPmt,
            downAmount: Math.max(0, downAmount),
            dti:        dti
        };
    }

    function fmtMoney(val, cur, pos) {
        var s = Math.round(val).toLocaleString('en-US');
        return pos === 'after' ? s + cur : cur + s;
    }

    /* ── Editor Preview ──────────────────────────────── */
    function AffordPreview(props) {
        var a = props.attrs;
        var res = calcAffordability(
            a.defaultIncome,
            a.defaultDebts,
            a.defaultRate,
            a.defaultTerm,
            a.defaultDown,
            a.frontEndRatio,
            a.backEndRatio,
            a.incomeShareLimit,
            a.monthlyPaymentMode
        );

        var wrapStyle = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', background: a.sectionBg || undefined };
        var cardStyle = { background: a.cardBg, borderRadius: a.cardRadius + 'px', padding: '32px', maxWidth: a.maxWidth + 'px', margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' };

        function inputRow(label, val, pfx, sfx) {
            return el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' } },
                el('label', { style: { color: a.labelColor, fontSize: 14 } }, label),
                el('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                    pfx ? el('span', { style: { color: a.subtitleColor, fontSize: 13 } }, pfx) : null,
                    el('input', { readOnly: true, value: val, type: 'number', style: { width: 100, textAlign: 'right', border: '1px solid #d1d5db', borderRadius: a.inputRadius + 'px', padding: '4px 8px', fontSize: 14 } }),
                    sfx ? el('span', { style: { color: a.subtitleColor, fontSize: 13 } }, sfx) : null
                )
            );
        }

        function statCard(label, val, color) {
            return el('div', { style: { background: a.statCardBg, borderRadius: 12, padding: '20px 16px', textAlign: 'center', flex: 1, minWidth: 120 } },
                el('div', { style: { fontWeight: 700, color: color || a.labelColor, lineHeight: 1.2 } }, val),
                el('div', { style: { fontSize: 12, color: a.subtitleColor, marginTop: 6 } }, label)
            );
        }

        return el('div', { style: wrapStyle },
            (a.showTitle || a.showSubtitle) ? el('div', { style: { textAlign: 'center', maxWidth: a.maxWidth + 'px', margin: '0 auto 32px' } },
                a.showTitle    ? el('h3', { className: 'bkbg-la-title', style: { color: a.titleColor } }, a.title) : null,
                a.showSubtitle ? el('p',  { className: 'bkbg-la-subtitle', style: { color: a.subtitleColor } }, a.subtitle) : null
            ) : null,
            el('div', { style: cardStyle },

                /* Max home hero */
                el('div', { style: { background: a.resultBg, border: '2px solid ' + a.resultBorder, borderRadius: a.cardRadius + 'px', padding: '28px 32px', textAlign: 'center', marginBottom: 24 } },
                    el('div', { style: { fontSize: 12, color: a.subtitleColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' } }, 'Maximum Home Price'),
                    el('div', { className: 'bkbg-la-result-hero', style: { color: a.maxHomeColor } }, fmtMoney(res.maxHome, a.currency, a.currencyPos)),
                    el('div', { style: { fontSize: 13, color: a.subtitleColor } }, 'with ' + a.defaultDown + '% down · ' + a.defaultRate + '% rate · ' + a.defaultTerm + ' yr term')
                ),

                /* Inputs */
                inputRow('Annual Gross Income', a.defaultIncome, a.currency),
                inputRow('Monthly Existing Debts', a.defaultDebts, a.currency),
                inputRow('Interest Rate (%)', a.defaultRate, null, '%'),
                inputRow('Loan Term', a.defaultTerm, null, 'years'),
                inputRow('Down Payment (%)', a.defaultDown, null, '%'),

                /* Stat cards */
                el('div', { style: { display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' } },
                    a.showMaxLoan     ? statCard('Max Loan', fmtMoney(res.maxLoan, a.currency, a.currencyPos), a.maxLoanColor) : null,
                    a.showMonthly     ? statCard('Max Monthly', fmtMoney(res.maxMonthly, a.currency, a.currencyPos), a.monthlyColor) : null,
                    a.showDTI         ? statCard('DTI Ratio', res.dti.toFixed(1) + '%', a.dtiColor) : null,
                    a.showDownPayment ? statCard('Down Payment', fmtMoney(res.downAmount, a.currency, a.currencyPos), a.labelColor) : null
                )
            )
        );
    }

    /* ── Edit ────────────────────────────────────────── */
    function AffordEdit(props) {
        var a = props.attributes;
        var set = props.setAttributes;
        var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.titleTypo,  '--bkbg-la-tt-'));
                    Object.assign(s, _tvFn(a.resultTypo, '--bkbg-la-rt-'));
                }
                return { className: 'bkbg-la-editor', style: s };
            })());

        function s(key) { return function (v) { var o = {}; o[key] = v; set(o); }; }
        function n(key) { return function (v) { var o = {}; o[key] = Number(v) || 0; set(o); }; }
        function nf(key){ return function (v) { var o = {}; o[key] = parseFloat(v) || 0; set(o); }; }
        function t(key) { return function (v) { var o = {}; o[key] = v; set(o); }; }

        return el(Fragment, null,
            el(InspectorControls, null,

                /* Header */
                el(PanelBody, { title: __('Header', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: a.showTitle, onChange: t('showTitle'), __nextHasNoMarginBottom: true }),
                    a.showTitle    ? el(TextControl, { label: __('Title', 'blockenberg'), value: a.title, onChange: s('title') }) : null,
                    el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: t('showSubtitle'), __nextHasNoMarginBottom: true }),
                    a.showSubtitle ? el(TextControl, { label: __('Subtitle', 'blockenberg'), value: a.subtitle, onChange: s('subtitle') }) : null
                ),

                /* Defaults */
                el(PanelBody, { title: __('Calculator Defaults', 'blockenberg'), initialOpen: true },
                    el(TextControl, { label: __('Currency Symbol', 'blockenberg'), value: a.currency, onChange: s('currency') }),
                    el(SelectControl, { label: __('Currency Position', 'blockenberg'), value: a.currencyPos, options: [{ label: 'Before ($100)', value: 'before' }, { label: 'After (100$)', value: 'after' }], onChange: s('currencyPos') }),
                    el(TextControl, { label: __('Default Annual Income', 'blockenberg'), value: String(a.defaultIncome), onChange: n('defaultIncome'), type: 'number' }),
                    el(TextControl, { label: __('Default Monthly Debts', 'blockenberg'), value: String(a.defaultDebts), onChange: n('defaultDebts'), type: 'number', help: __('Existing monthly debt payments (car, student loan, etc.)', 'blockenberg') }),
                    el(TextControl, { label: __('Default Interest Rate (%)', 'blockenberg'), value: String(a.defaultRate), onChange: nf('defaultRate'), type: 'number', step: '0.1' }),
                    el(TextControl, { label: __('Default Loan Term (years)', 'blockenberg'), value: String(a.defaultTerm), onChange: n('defaultTerm'), type: 'number' }),
                    el(TextControl, { label: __('Default Down Payment (%)', 'blockenberg'), value: String(a.defaultDown), onChange: n('defaultDown'), type: 'number' })
                ),

                /* DTI Ratios */
                el(PanelBody, { title: __('DTI Ratio Limits', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Front-End Ratio (%)', 'blockenberg'), value: a.frontEndRatio, onChange: n('frontEndRatio'), min: 20, max: 45, help: __('Max % of income for housing costs (default 28%)', 'blockenberg') }),
                    el(RangeControl, { label: __('Back-End Ratio (%)', 'blockenberg'), value: a.backEndRatio, onChange: n('backEndRatio'), min: 30, max: 55, help: __('Max % of income for all debts (default 43%)', 'blockenberg') }),
                    el(SelectControl, {
                        label: __('Max Monthly Payment Rule', 'blockenberg'),
                        value: a.monthlyPaymentMode,
                        options: [
                            { label: __('Conservative: min(DTI limit, income share)', 'blockenberg'), value: 'min' },
                            { label: __('DTI ratios only', 'blockenberg'), value: 'dti' },
                            { label: __('Income share only', 'blockenberg'), value: 'incomeShare' }
                        ],
                        onChange: s('monthlyPaymentMode')
                    }),
                    el(RangeControl, {
                        label: __('Income Share Limit (%)', 'blockenberg'),
                        value: a.incomeShareLimit,
                        onChange: n('incomeShareLimit'),
                        min: 10,
                        max: 60,
                        help: __('Cap max monthly payment to this % of gross monthly income.', 'blockenberg')
                    })
                ),

                /* Display */
                el(PanelBody, { title: __('Display Options', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Max Loan Amount', 'blockenberg'), checked: a.showMaxLoan, onChange: t('showMaxLoan'), __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Max Monthly Payment', 'blockenberg'), checked: a.showMonthly, onChange: t('showMonthly'), __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show DTI Ratio', 'blockenberg'), checked: a.showDTI, onChange: t('showDTI'), __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Down Payment Amount', 'blockenberg'), checked: a.showDownPayment, onChange: t('showDownPayment'), __nextHasNoMarginBottom: true })
                ),

                /* Colors */
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: __('Title', 'blockenberg'), value: a.titleTypo || {}, onChange: function (v) { set({ titleTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: __('Result', 'blockenberg'), value: a.resultTypo || {}, onChange: function (v) { set({ resultTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.accentColor,   onChange: s('accentColor'),   label: __('Accent', 'blockenberg') },
                        { value: a.cardBg,         onChange: s('cardBg'),         label: __('Card Background', 'blockenberg') },
                        { value: a.resultBg,       onChange: s('resultBg'),       label: __('Result Box BG', 'blockenberg') },
                        { value: a.resultBorder,   onChange: s('resultBorder'),   label: __('Result Box Border', 'blockenberg') },
                        { value: a.maxHomeColor,   onChange: s('maxHomeColor'),   label: __('Max Home Price', 'blockenberg') },
                        { value: a.maxLoanColor,   onChange: s('maxLoanColor'),   label: __('Max Loan', 'blockenberg') },
                        { value: a.monthlyColor,   onChange: s('monthlyColor'),   label: __('Monthly Payment', 'blockenberg') },
                        { value: a.dtiColor,       onChange: s('dtiColor'),       label: __('DTI Ratio', 'blockenberg') },
                        { value: a.statCardBg,     onChange: s('statCardBg'),     label: __('Stat Card BG', 'blockenberg') },
                        { value: a.titleColor,     onChange: s('titleColor'),     label: __('Title Color', 'blockenberg') },
                        { value: a.subtitleColor,  onChange: s('subtitleColor'),  label: __('Subtitle Color', 'blockenberg') },
                        { value: a.labelColor,     onChange: s('labelColor'),     label: __('Label Color', 'blockenberg') },
                        { value: a.sectionBg,      onChange: s('sectionBg'),      label: __('Section Background', 'blockenberg') }
                    ]
                }),

                /* Sizing */
                el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Card Radius (px)', 'blockenberg'), value: a.cardRadius, onChange: n('cardRadius'), min: 0, max: 32 }),
                    el(RangeControl, { label: __('Input Radius (px)', 'blockenberg'), value: a.inputRadius, onChange: n('inputRadius'), min: 0, max: 20 }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, onChange: n('maxWidth'), min: 360, max: 1000, step: 20 }),
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, onChange: n('paddingTop'), min: 0, max: 160 }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, onChange: n('paddingBottom'), min: 0, max: 160 })
                )
            ),

            el('div', blockProps,
                el(AffordPreview, { attrs: a })
            )
        );
    }

    registerBlockType('blockenberg/loan-affordability', {
        edit: AffordEdit,
        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({
                className: 'bkbg-la-app',
                'data-opts': JSON.stringify(a)
            }));
        }
    });
}() );
