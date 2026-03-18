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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    var COMPOUNDING_OPTIONS = [
        { value: 'monthly',   label: 'Monthly (12×/year)' },
        { value: 'quarterly', label: 'Quarterly (4×/year)' },
        { value: 'annually',  label: 'Annually (1×/year)' },
    ];
    var COMPOUNDING_N = { monthly: 12, quarterly: 4, annually: 1 };

    function calcSavings(initial, monthly, rate, years, compounding) {
        var n = COMPOUNDING_N[compounding] || 12;
        var r = rate / 100 / n;
        var periods = years * n;
        var monthsPerPeriod = 12 / n;

        var balance = initial;
        var rows = [];
        var totalContrib = initial;

        for (var p = 1; p <= periods; p++) {
            /* Add monthly contributions for this period */
            balance = balance * (1 + r) + monthly * monthsPerPeriod;
            totalContrib += monthly * monthsPerPeriod;

            /* Record at each full year */
            if (p % n === 0) {
                var year = p / n;
                rows.push({
                    year: year,
                    balance: balance,
                    contributed: totalContrib,
                    interest: balance - totalContrib,
                });
            }
        }

        return {
            finalBalance: balance,
            totalContributed: totalContrib,
            totalInterest: balance - totalContrib,
            rows: rows,
        };
    }

    function fmtMoney(val, currency, pos) {
        var rounded = Math.round(val).toLocaleString('en-US');
        return pos === 'after' ? rounded + ' ' + currency : currency + rounded;
    }

    /* ── Slider row helper ────────────────────────────────────────────── */
    function SliderRow(props) {
        var iRadius = (props.iRadius || 8) + 'px';
        return el('div', { style: { marginBottom: '20px' } },
            el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' } },
                el('label', { style: { fontSize: '13px', fontWeight: 600, color: props.labelColor || '#374151' } }, props.label),
                el('span', { style: { fontWeight: 700, color: props.accent || '#6c3fb5', fontSize: '15px' } }, props.displayVal)
            ),
            el('input', {
                type: 'range',
                min: props.min, max: props.max, step: props.step || 1, value: props.value,
                onChange: function (e) { props.onChange(parseFloat(e.target.value)); },
                style: { width: '100%', accentColor: props.accent || '#6c3fb5', cursor: 'pointer', height: '4px' }
            })
        );
    }

    /* ── Preview component ────────────────────────────────────────────── */
    function SavingsPreview(props) {
        var a      = props.attrs;
        var accent = a.accentColor || '#6c3fb5';
        var cRadius= (a.cardRadius  || 16) + 'px';
        var iRadius= a.inputRadius  || 8;
        var cur    = a.currency     || '$';
        var curPos = a.currencyPos  || 'before';

        var initState = useState(a.defaultInitial   || 5000);
        var initial = initState[0]; var setInitial = initState[1];
        var mthlyState= useState(a.defaultMonthly   || 200);
        var monthly = mthlyState[0]; var setMonthly = mthlyState[1];
        var rateState = useState(a.defaultRate       || 7);
        var rate    = rateState[0]; var setRate    = rateState[1];
        var yrsState  = useState(a.defaultYears      || 10);
        var years   = yrsState[0]; var setYears   = yrsState[1];
        var cmpState  = useState(a.defaultCompounding|| 'monthly');
        var compounding = cmpState[0]; var setCompounding = cmpState[1];

        var calc = calcSavings(initial, monthly, rate, years, compounding);
        var fmt  = function (v) { return fmtMoney(v, cur, curPos); };

        var cardStyle = {
            background:    a.cardBg || '#ffffff',
            borderRadius:  cRadius,
            padding:       '32px',
            boxShadow:     '0 4px 24px rgba(0,0,0,0.08)',
            maxWidth:      (a.maxWidth || 680) + 'px',
            margin:        '0 auto',
            paddingTop:    (a.paddingTop    || 60) + 'px',
            paddingBottom: (a.paddingBottom || 60) + 'px',
            boxSizing:     'border-box',
        };

        return el('div', { style: cardStyle },
            a.showTitle && el('h2', { className: 'bkbg-sav-title', style: { color: a.titleColor || '#1e1b4b', textAlign: 'center', marginTop: 0, marginBottom: 8 } }, a.title || __('Savings Calculator', 'blockenberg')),
            a.showSubtitle && el('p', { className: 'bkbg-sav-subtitle', style: { color: a.subtitleColor || '#6b7280', textAlign: 'center', marginTop: 0, marginBottom: 28 } }, a.subtitle),

            /* Sliders */
            el(SliderRow, { label: __('Initial Deposit', 'blockenberg'), value: initial, min: 0, max: 100000, step: 500, displayVal: fmt(initial), onChange: setInitial, accent: accent, labelColor: a.labelColor, iRadius: iRadius }),
            el(SliderRow, { label: __('Monthly Contribution', 'blockenberg'), value: monthly, min: 0, max: 5000, step: 50, displayVal: fmt(monthly), onChange: setMonthly, accent: accent, labelColor: a.labelColor, iRadius: iRadius }),
            el(SliderRow, { label: __('Annual Interest Rate', 'blockenberg'), value: rate, min: 0.1, max: 20, step: 0.1, displayVal: rate + '%', onChange: setRate, accent: accent, labelColor: a.labelColor, iRadius: iRadius }),
            el(SliderRow, { label: __('Time Period (Years)', 'blockenberg'), value: years, min: 1, max: 40, step: 1, displayVal: years + ' yrs', onChange: setYears, accent: accent, labelColor: a.labelColor, iRadius: iRadius }),

            /* Compounding select */
            el('div', { style: { marginBottom: '28px' } },
                el('label', { style: { display: 'block', fontSize: '13px', fontWeight: 600, color: a.labelColor || '#374151', marginBottom: '6px' } }, __('Compounding Frequency', 'blockenberg')),
                el('select', {
                    value: compounding,
                    onChange: function (e) { setCompounding(e.target.value); },
                    style: { width: '100%', padding: '10px 12px', borderRadius: iRadius + 'px', border: '1.5px solid #e5e7eb', fontSize: '14px', background: '#fff', outline: 'none' }
                }, COMPOUNDING_OPTIONS.map(function (o) { return el('option', { key: o.value, value: o.value }, o.label); }))
            ),

            /* Result box */
            el('div', {
                style: {
                    background: a.resultBg || '#f5f3ff',
                    border: '1.5px solid ' + (a.resultBorder || '#ede9fe'),
                    borderRadius: cRadius, padding: '24px', marginBottom: '20px',
                }
            },
                el('div', { style: { textAlign: 'center', marginBottom: '16px' } },
                    el('div', { style: { fontSize: '12px', color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' } }, __('Total Savings', 'blockenberg')),
                    el('div', { style: { fontSize: (a.resultSize || 44) + 'px', fontWeight: 800, color: a.totalColor || accent, lineHeight: 1.1 } }, fmt(calc.finalBalance))
                ),
                el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 0 } },
                    a.showContributedBreakdown && el('div', { style: { textAlign: 'center', padding: '12px', background: '#fff', borderRadius: '8px' } },
                        el('div', { style: { fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' } }, __('Total Contributed', 'blockenberg')),
                        el('div', { style: { fontWeight: 700, color: a.contributedColor || '#3b82f6', fontSize: '18px' } }, fmt(calc.totalContributed))
                    ),
                    a.showInterestBreakdown && el('div', { style: { textAlign: 'center', padding: '12px', background: '#fff', borderRadius: '8px' } },
                        el('div', { style: { fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' } }, __('Interest Earned', 'blockenberg')),
                        el('div', { style: { fontWeight: 700, color: a.interestColor || '#10b981', fontSize: '18px' } }, fmt(calc.totalInterest))
                    )
                )
            ),

            /* Year-by-year table */
            a.showYearTable && el('div', { style: { overflowX: 'auto' } },
                el('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' } },
                    el('thead', null,
                        el('tr', { style: { background: a.tableBg || '#fafafa', borderBottom: '2px solid #e5e7eb' } },
                            el('th', { style: { padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151' } }, __('Year', 'blockenberg')),
                            el('th', { style: { padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#374151' } }, __('Balance', 'blockenberg')),
                            el('th', { style: { padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#374151' } }, __('Contributed', 'blockenberg')),
                            el('th', { style: { padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#374151' } }, __('Interest', 'blockenberg'))
                        )
                    ),
                    el('tbody', null,
                        calc.rows.slice(0, a.tableRows || 10).map(function (row) {
                            return el('tr', { key: row.year, style: { borderBottom: '1px solid #f3f4f6' } },
                                el('td', { style: { padding: '9px 12px', color: '#374151', fontWeight: 600 } }, 'Year ' + row.year),
                                el('td', { style: { padding: '9px 12px', textAlign: 'right', color: a.totalColor || accent, fontWeight: 700 } }, fmt(row.balance)),
                                el('td', { style: { padding: '9px 12px', textAlign: 'right', color: a.contributedColor || '#3b82f6' } }, fmt(row.contributed)),
                                el('td', { style: { padding: '9px 12px', textAlign: 'right', color: a.interestColor || '#10b981' } }, fmt(row.interest))
                            );
                        })
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/savings-calculator', {
        edit: function (props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = { background: a.bgColor || undefined };
                if (_tv) {
                    Object.assign(s, _tv(a.titleTypo, '--bksav-tt-'));
                    Object.assign(s, _tv(a.subtitleTypo, '--bksav-st-'));
                }
                return { style: s };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: a.showTitle, onChange: function (v) { setAttr({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showTitle && el(TextControl, { label: __('Title', 'blockenberg'), value: a.title, onChange: function (v) { setAttr({ title: v }); } }),
                        el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: function (v) { setAttr({ showSubtitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showSubtitle && el(TextControl, { label: __('Subtitle', 'blockenberg'), value: a.subtitle, onChange: function (v) { setAttr({ subtitle: v }); } }),
                        el(TextControl, { label: __('Currency Symbol', 'blockenberg'), value: a.currency, onChange: function (v) { setAttr({ currency: v }); } }),
                        el(SelectControl, { label: __('Currency Position', 'blockenberg'), value: a.currencyPos, options: [{ value: 'before', label: 'Before' }, { value: 'after', label: 'After' }], onChange: function (v) { setAttr({ currencyPos: v }); } })
                    ),

                    el(PanelBody, { title: __('Defaults', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Initial Deposit', 'blockenberg'), value: a.defaultInitial, min: 0, max: 100000, step: 500, onChange: function (v) { setAttr({ defaultInitial: v }); } }),
                        el(RangeControl, { label: __('Monthly Contribution', 'blockenberg'), value: a.defaultMonthly, min: 0, max: 5000, step: 50, onChange: function (v) { setAttr({ defaultMonthly: v }); } }),
                        el(RangeControl, { label: __('Annual Rate (%)', 'blockenberg'), value: a.defaultRate, min: 0.1, max: 20, step: 0.1, onChange: function (v) { setAttr({ defaultRate: v }); } }),
                        el(RangeControl, { label: __('Years', 'blockenberg'), value: a.defaultYears, min: 1, max: 40, onChange: function (v) { setAttr({ defaultYears: v }); } }),
                        el(SelectControl, { label: __('Compounding Frequency', 'blockenberg'), value: a.defaultCompounding, options: COMPOUNDING_OPTIONS, onChange: function (v) { setAttr({ defaultCompounding: v }); } })
                    ),

                    el(PanelBody, { title: __('Display Options', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Contributed Breakdown', 'blockenberg'), checked: a.showContributedBreakdown, onChange: function (v) { setAttr({ showContributedBreakdown: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Interest Breakdown', 'blockenberg'), checked: a.showInterestBreakdown, onChange: function (v) { setAttr({ showInterestBreakdown: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Year-by-Year Table', 'blockenberg'), checked: a.showYearTable, onChange: function (v) { setAttr({ showYearTable: v }); }, __nextHasNoMarginBottom: true }),
                        a.showYearTable && el(RangeControl, { label: __('Max Table Rows', 'blockenberg'), value: a.tableRows, min: 1, max: 40, onChange: function (v) { setAttr({ tableRows: v }); } })
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && el( getTypoControl(), { label: __('Title Typography'), value: a.titleTypo || {}, onChange: function(v){ setAttr({ titleTypo: v }); } }),
                        getTypoControl() && el( getTypoControl(), { label: __('Subtitle Typography'), value: a.subtitleTypo || {}, onChange: function(v){ setAttr({ subtitleTypo: v }); } }),
                        el(RangeControl, { label: __('Result Size (px)', 'blockenberg'),  value: a.resultSize,  min: 24, max: 80,  onChange: function (v) { setAttr({ resultSize:  v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Accent Color', 'blockenberg'),       value: a.accentColor,       onChange: function (v) { setAttr({ accentColor:       v || '#6c3fb5' }); } },
                            { label: __('Total Balance Color', 'blockenberg'), value: a.totalColor,        onChange: function (v) { setAttr({ totalColor:        v || '#6c3fb5' }); } },
                            { label: __('Contributed Color', 'blockenberg'),  value: a.contributedColor,  onChange: function (v) { setAttr({ contributedColor:  v || '#3b82f6' }); } },
                            { label: __('Interest Earned Color', 'blockenberg'), value: a.interestColor,  onChange: function (v) { setAttr({ interestColor:     v || '#10b981' }); } },
                            { label: __('Result Background', 'blockenberg'),  value: a.resultBg,          onChange: function (v) { setAttr({ resultBg:          v || '#f5f3ff' }); } },
                            { label: __('Card Background', 'blockenberg'),    value: a.cardBg,            onChange: function (v) { setAttr({ cardBg:            v || '#ffffff' }); } },
                            { label: __('Table Background', 'blockenberg'),   value: a.tableBg,           onChange: function (v) { setAttr({ tableBg:           v || '#fafafa' }); } },
                            { label: __('Title Color', 'blockenberg'),        value: a.titleColor,        onChange: function (v) { setAttr({ titleColor:        v || '#1e1b4b' }); } },
                            { label: __('Section Background', 'blockenberg'), value: a.bgColor,           onChange: function (v) { setAttr({ bgColor:           v || '' }); } },
                        ]
                    }),

                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Card Radius (px)', 'blockenberg'), value: a.cardRadius,  min: 0,  max: 40,  onChange: function (v) { setAttr({ cardRadius:  v }); } }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'),   value: a.maxWidth,    min: 320,max: 1200, onChange: function (v) { setAttr({ maxWidth:    v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop,  min: 0,  max: 160, onChange: function (v) { setAttr({ paddingTop:  v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'),value:a.paddingBottom,min:0, max: 160, onChange: function (v) { setAttr({ paddingBottom:v }); } })
                    )
                ),

                el('div', blockProps,
                    el(SavingsPreview, { attrs: a })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ style: { background: a.bgColor || undefined } });
            return el('div', blockProps,
                el('div', { className: 'bkbg-sav-app', 'data-opts': JSON.stringify(a) },
                    el('p', { className: 'bkbg-sav-loading' }, __('Loading savings calculator…', 'blockenberg'))
                )
            );
        }
    });
}() );
