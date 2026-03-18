( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var __                 = wp.i18n.__;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;
    var SelectControl      = wp.components.SelectControl;
    var __experimentalNumberControl = wp.components.__experimentalNumberControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    // 2025 Federal Tax Brackets
    var BRACKETS = {
        single: [
            { lo: 0,       hi: 11925,  rate: 0.10 },
            { lo: 11925,   hi: 48475,  rate: 0.12 },
            { lo: 48475,   hi: 103350, rate: 0.22 },
            { lo: 103350,  hi: 197300, rate: 0.24 },
            { lo: 197300,  hi: 250525, rate: 0.32 },
            { lo: 250525,  hi: 626350, rate: 0.35 },
            { lo: 626350,  hi: Infinity, rate: 0.37 }
        ],
        married: [
            { lo: 0,       hi: 23850,  rate: 0.10 },
            { lo: 23850,   hi: 96950,  rate: 0.12 },
            { lo: 96950,   hi: 206700, rate: 0.22 },
            { lo: 206700,  hi: 394600, rate: 0.24 },
            { lo: 394600,  hi: 501050, rate: 0.32 },
            { lo: 501050,  hi: 751600, rate: 0.35 },
            { lo: 751600,  hi: Infinity, rate: 0.37 }
        ],
        hoh: [
            { lo: 0,       hi: 17000,  rate: 0.10 },
            { lo: 17000,   hi: 64850,  rate: 0.12 },
            { lo: 64850,   hi: 103350, rate: 0.22 },
            { lo: 103350,  hi: 197300, rate: 0.24 },
            { lo: 197300,  hi: 250500, rate: 0.32 },
            { lo: 250500,  hi: 626350, rate: 0.35 },
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
        if (period === 'monthly')  return val * 12;
        if (period === 'hourly')   return val * 2080;
        return val; // annual
    }

    function calcAll(a) {
        var gross = toAnnual(parseFloat(a.defaultIncome) || 0, a.defaultPeriod || 'annual');
        var filing = a.defaultFiling || 'single';
        var ded401k = gross * ((parseFloat(a.default401k) || 0) / 100);
        var otherDed = parseFloat(a.defaultOtherDed) || 0;
        var preTax = ded401k + otherDed;
        var taxable = Math.max(0, gross - preTax - (STD_DED[filing] || 15000));
        var fedTax  = calcFedTax(taxable, filing);
        var stateTax = (gross - preTax) * ((parseFloat(a.defaultStateTax) || 0) / 100);
        var ss = Math.min(gross, SS_CAP) * 0.062;
        var medicare = gross * 0.0145;
        var totalTax = fedTax + stateTax + ss + medicare;
        var netAnnual = gross - totalTax - preTax;
        return {
            gross: gross, preTax: preTax, ded401k: ded401k, otherDed: otherDed,
            fedTax: fedTax, stateTax: stateTax, ss: ss, medicare: medicare,
            totalTax: totalTax, netAnnual: Math.max(0, netAnnual),
            effectiveRate: gross > 0 ? ((totalTax / gross) * 100) : 0
        };
    }

    function fmt(n, cur) { return (cur||'$') + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

    function PeriodCard(props) {
        return el('div', { className: 'bkbg-slc-period-card', style: { borderColor: props.color + '55', background: props.bg } },
            el('div', { className: 'bkbg-slc-period-label', style: { color: props.labelColor } }, props.label),
            el('div', { className: 'bkbg-slc-period-val', style: { color: props.color } }, props.val)
        );
    }

    function BreakdownRow(props) {
        return el('div', { className: 'bkbg-slc-brow' },
            el('span', { className: 'bkbg-slc-brow-label', style: { color: props.labelColor } }, props.label),
            el('div', { className: 'bkbg-slc-brow-bar-wrap' },
                el('div', { className: 'bkbg-slc-brow-bar', style: { width: props.pct + '%', background: props.color } })
            ),
            el('span', { className: 'bkbg-slc-brow-val', style: { color: props.color } }, props.val)
        );
    }

    function Editor(props) {
        var a = props.attributes;
        var sa = props.setAttributes;
        var res = calcAll(a);
        var cur = a.currency || '$';
        var lc = a.labelColor || '#374151';

        var blockProps = useBlockProps((function () {
            var _tv = getTypoCssVars();
            var s = {};
            if (_tv) {
                Object.assign(s, _tv(a.titleTypo, '--bkslc-tt-'));
                Object.assign(s, _tv(a.subtitleTypo, '--bkslc-st-'));
            }
            return { className: 'bkbg-slc-app', style: s };
        })());

        return el(Fragment, null,
            el(InspectorControls, null,

                el(PanelBody, { title: __('Content'), initialOpen: true },
                    el(TextControl, { label: __('Title'),    value: a.title    || '', onChange: function(v){ sa({ title: v }); } }),
                    el(TextControl, { label: __('Subtitle'), value: a.subtitle || '', onChange: function(v){ sa({ subtitle: v }); } }),
                    el(TextControl, { label: __('Currency Symbol'), value: cur, onChange: function(v){ sa({ currency: v }); } }),
                    el(SelectControl, {
                        label: __('Default Pay Period'),
                        value: a.defaultPeriod || 'annual',
                        options: [
                            { value: 'annual',  label: 'Annual Salary' },
                            { value: 'monthly', label: 'Monthly Salary' },
                            { value: 'hourly',  label: 'Hourly Wage' }
                        ],
                        onChange: function(v){ sa({ defaultPeriod: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Default Filing Status'),
                        value: a.defaultFiling || 'single',
                        options: [
                            { value: 'single',  label: 'Single' },
                            { value: 'married', label: 'Married Filing Jointly' },
                            { value: 'hoh',     label: 'Head of Household' }
                        ],
                        onChange: function(v){ sa({ defaultFiling: v }); }
                    }),
                    el(RangeControl, { label: __('Default Annual Income'), value: a.defaultIncome || 75000, min: 10000, max: 1000000, step: 1000, onChange: function(v){ sa({ defaultIncome: v }); } }),
                    el(RangeControl, { label: __('State Tax Rate (%)'), value: a.defaultStateTax || 5, min: 0, max: 15, step: 0.1, onChange: function(v){ sa({ defaultStateTax: v }); } }),
                    el(RangeControl, { label: __('401(k) Contribution (%)'), value: a.default401k || 6, min: 0, max: 30, step: 0.5, onChange: function(v){ sa({ default401k: v }); } }),
                    el(RangeControl, { label: __('Other Pre-tax Deductions ($)'), value: a.defaultOtherDed || 0, min: 0, max: 20000, step: 100, onChange: function(v){ sa({ defaultOtherDed: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Tax Breakdown'), checked: a.showBreakdown !== false, onChange: function(v){ sa({ showBreakdown: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show All Pay Periods'), checked: a.showAllPeriods !== false, onChange: function(v){ sa({ showAllPeriods: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Effective Tax Rate'), checked: a.showEffectiveRate !== false, onChange: function(v){ sa({ showEffectiveRate: v }); } })
                ),

                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl() && el( getTypoControl(), { label: __('Title Typography'), value: a.titleTypo || {}, onChange: function(v){ sa({ titleTypo: v }); } }),
                    getTypoControl() && el( getTypoControl(), { label: __('Subtitle Typography'), value: a.subtitleTypo || {}, onChange: function(v){ sa({ subtitleTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.accentColor    ||'#0ea5e9', onChange: function(v){ sa({ accentColor: v }); },    label: 'Accent / Net Pay' },
                        { value: a.taxColor       ||'#ef4444', onChange: function(v){ sa({ taxColor: v }); },       label: 'Tax Bars' },
                        { value: a.dedColor       ||'#f59e0b', onChange: function(v){ sa({ dedColor: v }); },       label: 'Deduction Bars' },
                        { value: a.sectionBg      ||'#f0f9ff', onChange: function(v){ sa({ sectionBg: v }); },      label: 'Section Background' },
                        { value: a.cardBg         ||'#ffffff', onChange: function(v){ sa({ cardBg: v }); },         label: 'Card Background' },
                        { value: a.inputBg        ||'#f9fafb', onChange: function(v){ sa({ inputBg: v }); },        label: 'Input Background' },
                        { value: a.resultBg       ||'#e0f2fe', onChange: function(v){ sa({ resultBg: v }); },       label: 'Result Background' },
                        { value: a.titleColor     ||'#0c4a6e', onChange: function(v){ sa({ titleColor: v }); },     label: 'Title' },
                        { value: a.subtitleColor  ||'#6b7280', onChange: function(v){ sa({ subtitleColor: v }); },  label: 'Subtitle' },
                        { value: a.labelColor     ||'#374151', onChange: function(v){ sa({ labelColor: v }); },     label: 'Labels' }
                    ]
                }),

                el(PanelBody, { title: __('Sizing'), initialOpen: false },
                    el(RangeControl, { label: __('Max Width (px)'), value: a.contentMaxWidth || 720, min: 360, max: 1400, step: 10, onChange: function(v){ sa({ contentMaxWidth: v }); } })
                )
            ),

            el('div', blockProps,
                el('div', { className: 'bkbg-slc-card', style: { background: a.cardBg||'#fff', maxWidth: (a.contentMaxWidth||720)+'px' } },
                    el('h2', { className: 'bkbg-slc-title', style: { color: a.titleColor||'#0c4a6e' } },
                        a.title || 'Salary & Take-Home Pay Calculator'
                    ),
                    el('p', { className: 'bkbg-slc-subtitle', style: { color: a.subtitleColor||'#6b7280' } },
                        a.subtitle || 'Estimate your net pay after taxes and deductions'
                    ),

                    // Inputs section
                    el('div', { className: 'bkbg-slc-inputs', style: { background: a.sectionBg||'#f0f9ff' } },
                        el('div', { className: 'bkbg-slc-row' },
                            el('div', { className: 'bkbg-slc-field' },
                                el('label', { className: 'bkbg-slc-label', style: { color: lc } }, 'Income'),
                                el('div', { className: 'bkbg-slc-input-wrap' },
                                    el('span', { className: 'bkbg-slc-prefix' }, cur),
                                    el('input', { type: 'number', className: 'bkbg-slc-input', value: a.defaultIncome||75000,
                                        style: { background: a.inputBg||'#f9fafb' },
                                        onChange: function(e){ sa({ defaultIncome: parseFloat(e.target.value)||0 }); }
                                    })
                                )
                            ),
                            el('div', { className: 'bkbg-slc-field' },
                                el('label', { className: 'bkbg-slc-label', style: { color: lc } }, 'Pay Period'),
                                el('select', { className: 'bkbg-slc-select', style: { background: a.inputBg||'#f9fafb' },
                                    value: a.defaultPeriod||'annual',
                                    onChange: function(e){ sa({ defaultPeriod: e.target.value }); }
                                },
                                    el('option', { value: 'annual' },  'Annual'),
                                    el('option', { value: 'monthly' }, 'Monthly'),
                                    el('option', { value: 'hourly' },  'Hourly')
                                )
                            ),
                            el('div', { className: 'bkbg-slc-field' },
                                el('label', { className: 'bkbg-slc-label', style: { color: lc } }, 'Filing Status'),
                                el('select', { className: 'bkbg-slc-select', style: { background: a.inputBg||'#f9fafb' },
                                    value: a.defaultFiling||'single',
                                    onChange: function(e){ sa({ defaultFiling: e.target.value }); }
                                },
                                    el('option', { value: 'single' },  'Single'),
                                    el('option', { value: 'married' }, 'Married (Joint)'),
                                    el('option', { value: 'hoh' },     'Head of Household')
                                )
                            )
                        ),
                        el('div', { className: 'bkbg-slc-row' },
                            el('div', { className: 'bkbg-slc-field' },
                                el('label', { className: 'bkbg-slc-label', style: { color: lc } }, 'State Tax Rate (%)'),
                                el('input', { type: 'number', className: 'bkbg-slc-input', value: a.defaultStateTax||5,
                                    style: { background: a.inputBg||'#f9fafb' },
                                    onChange: function(e){ sa({ defaultStateTax: parseFloat(e.target.value)||0 }); }
                                })
                            ),
                            el('div', { className: 'bkbg-slc-field' },
                                el('label', { className: 'bkbg-slc-label', style: { color: lc } }, '401(k) Contribution (%)'),
                                el('input', { type: 'number', className: 'bkbg-slc-input', value: a.default401k||6,
                                    style: { background: a.inputBg||'#f9fafb' },
                                    onChange: function(e){ sa({ default401k: parseFloat(e.target.value)||0 }); }
                                })
                            ),
                            el('div', { className: 'bkbg-slc-field' },
                                el('label', { className: 'bkbg-slc-label', style: { color: lc } }, 'Other Deductions ($)'),
                                el('input', { type: 'number', className: 'bkbg-slc-input', value: a.defaultOtherDed||0,
                                    style: { background: a.inputBg||'#f9fafb' },
                                    onChange: function(e){ sa({ defaultOtherDed: parseFloat(e.target.value)||0 }); }
                                })
                            )
                        )
                    ),

                    // Net pay hero
                    el('div', { className: 'bkbg-slc-net-hero', style: { background: a.resultBg||'#e0f2fe' } },
                        el('div', { className: 'bkbg-slc-net-label', style: { color: lc } }, '💵 Annual Take-Home Pay'),
                        el('div', { className: 'bkbg-slc-net-val', style: { color: a.accentColor||'#0ea5e9' } },
                            fmt(res.netAnnual, cur)
                        ),
                        a.showEffectiveRate !== false && el('div', { className: 'bkbg-slc-net-eff', style: { color: lc } },
                            'Effective tax rate: ' + res.effectiveRate.toFixed(1) + '%'
                        )
                    ),

                    // Period grid
                    a.showAllPeriods !== false && el('div', { className: 'bkbg-slc-periods' },
                        el(PeriodCard, { label: 'Monthly',    val: fmt(res.netAnnual/12,    cur), color: a.accentColor||'#0ea5e9', bg: (a.accentColor||'#0ea5e9')+'14', labelColor: lc }),
                        el(PeriodCard, { label: 'Bi-weekly',  val: fmt(res.netAnnual/26,    cur), color: a.accentColor||'#0ea5e9', bg: (a.accentColor||'#0ea5e9')+'14', labelColor: lc }),
                        el(PeriodCard, { label: 'Weekly',     val: fmt(res.netAnnual/52,    cur), color: a.accentColor||'#0ea5e9', bg: (a.accentColor||'#0ea5e9')+'14', labelColor: lc }),
                        el(PeriodCard, { label: 'Daily',      val: fmt(res.netAnnual/260,   cur), color: a.accentColor||'#0ea5e9', bg: (a.accentColor||'#0ea5e9')+'14', labelColor: lc }),
                        el(PeriodCard, { label: 'Hourly',     val: fmt(res.netAnnual/2080,  cur), color: a.accentColor||'#0ea5e9', bg: (a.accentColor||'#0ea5e9')+'14', labelColor: lc })
                    ),

                    // Breakdown
                    a.showBreakdown !== false && el('div', { className: 'bkbg-slc-breakdown' },
                        el('h3', { className: 'bkbg-slc-breakdown-title', style: { color: lc } }, '📊 Annual Breakdown'),
                        el(BreakdownRow, { label: 'Gross Income',      val: fmt(res.gross,     cur), pct: 100,                                    color: a.accentColor||'#0ea5e9', labelColor: lc }),
                        res.ded401k > 0 && el(BreakdownRow, { label: '401(k) Contribution', val: '−'+fmt(res.ded401k, cur), pct: Math.min(100, (res.ded401k/res.gross)*100),    color: a.dedColor||'#f59e0b', labelColor: lc }),
                        res.otherDed > 0 && el(BreakdownRow, { label: 'Other Deductions',   val: '−'+fmt(res.otherDed,cur), pct: Math.min(100, (res.otherDed/res.gross)*100),   color: a.dedColor||'#f59e0b', labelColor: lc }),
                        el(BreakdownRow, { label: 'Federal Income Tax', val: '−'+fmt(res.fedTax,   cur), pct: Math.min(100, (res.fedTax/res.gross)*100),   color: a.taxColor||'#ef4444', labelColor: lc }),
                        el(BreakdownRow, { label: 'State Income Tax',   val: '−'+fmt(res.stateTax, cur), pct: Math.min(100, (res.stateTax/res.gross)*100), color: a.taxColor||'#ef4444', labelColor: lc }),
                        el(BreakdownRow, { label: 'Social Security',    val: '−'+fmt(res.ss,       cur), pct: Math.min(100, (res.ss/res.gross)*100),       color: a.taxColor||'#ef4444', labelColor: lc }),
                        el(BreakdownRow, { label: 'Medicare',           val: '−'+fmt(res.medicare,  cur), pct: Math.min(100, (res.medicare/res.gross)*100), color: a.taxColor||'#ef4444', labelColor: lc }),
                        el('div', { className: 'bkbg-slc-divider' }),
                        el(BreakdownRow, { label: '✓ Net Take-Home Pay',val: fmt(res.netAnnual, cur), pct: Math.min(100, (res.netAnnual/res.gross)*100),  color: a.accentColor||'#0ea5e9', labelColor: lc })
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/salary-calculator', {
        edit: Editor,
        save: function(props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-slc-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
