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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function calcRetirement(curAge, retAge, curSavings, monthlyContrib, annualReturn, inflationRate) {
        var years          = Math.max(0, retAge - curAge);
        var monthlyRate    = annualReturn / 100 / 12;
        var months         = years * 12;
        var futureExisting = curSavings * Math.pow(1 + monthlyRate, months);
        var futureContribs = monthlyRate > 0
            ? monthlyContrib * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate
            : monthlyContrib * months;
        var total          = futureExisting + futureContribs;
        var totalContribs  = curSavings + monthlyContrib * months;
        var growth         = total - totalContribs;
        var inflFactor     = Math.pow(1 + inflationRate / 100, years);
        var inflAdjusted   = total / inflFactor;
        return { years: years, total: total, totalContribs: totalContribs, growth: growth, inflAdjusted: inflAdjusted };
    }

    function fmtM(val, cur, pos) {
        var n = parseFloat(val);
        var s;
        if (n >= 1e6)      { s = (n / 1e6).toFixed(2) + 'M'; }
        else if (n >= 1e3) { s = (n / 1e3).toFixed(1)  + 'K'; }
        else               { s = n.toFixed(0); }
        return pos === 'after' ? s + cur : cur + s;
    }
    function fmtFull(val, cur, pos) {
        var s = Number(parseFloat(val).toFixed(0)).toLocaleString();
        return pos === 'after' ? s + cur : cur + s;
    }

    function InputRow(props) {
        var label    = props.label;
        var value    = props.value;
        var suffix   = props.suffix;
        var min      = props.min  || 0;
        var max      = props.max  || 999999;
        var step     = props.step || 1;
        var onChange = props.onChange;
        var radius   = props.radius;
        var labelC   = props.labelColor;
        return el('div', { style: { marginBottom: '14px' } },
            el('label', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: labelC, marginBottom: '5px' } },
                el('span', null, label),
                el('span', { style: { fontWeight: 400, color: '#9ca3af' } }, suffix || '')
            ),
            el('input', {
                type: 'number', value: value, min: min, max: max, step: step,
                style: { width: '100%', padding: '10px 14px', borderRadius: radius, border: '1.5px solid #e5e7eb', fontSize: '16px', outline: 'none', boxSizing: 'border-box' },
                onChange: function(e) { onChange(parseFloat(e.target.value) || 0); }
            })
        );
    }

    function RetirementPreview(props) {
        var a  = props.attributes;
        var sa = props.setAttributes;

        var _curAge  = useState(a.currentAge);    var curAge  = _curAge[0];  var setCurAge  = _curAge[1];
        var _retAge  = useState(a.retirementAge); var retAge  = _retAge[0];  var setRetAge  = _retAge[1];
        var _curSav  = useState(a.currentSavings);var curSav  = _curSav[0];  var setCurSav  = _curSav[1];
        var _contrib = useState(a.monthlyContrib);var contrib = _contrib[0]; var setContrib = _contrib[1];
        var _ret     = useState(a.annualReturn);  var ret     = _ret[0];     var setRet     = _ret[1];
        var _infl    = useState(a.inflationRate); var infl    = _infl[0];    var setInfl    = _infl[1];

        var r = calcRetirement(curAge, retAge, curSav, contrib, ret, infl);

        var contribFrac = r.total > 0 ? Math.min(1, r.totalContribs / r.total) : 0;
        var growthFrac  = r.total > 0 ? Math.min(1, r.growth / r.total)        : 0;

        var containerStyle = {
            background:    a.sectionBg || undefined,
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            fontFamily:    'inherit'
        };
        var cardStyle = {
            background:   a.cardBg,
            borderRadius: a.cardRadius + 'px',
            padding:      '36px 32px',
            maxWidth:     a.maxWidth + 'px',
            margin:       '0 auto',
            boxShadow:    '0 4px 24px rgba(0,0,0,0.09)'
        };
        var inpRadius = a.inputRadius + 'px';

        return el('div', { className: 'bkbg-ret-editor', style: containerStyle },
            el('div', { style: cardStyle },

                // Title / subtitle
                (a.showTitle || a.showSubtitle) && el('div', { style: { marginBottom: '20px' } },
                    a.showTitle && el('div', {
                        className: 'bkbg-ret-title',
                        style: { color: a.titleColor, marginBottom: '6px', contentEditable: true, suppressContentEditableWarning: true, outline: 'none' },
                        onBlur: function(e) { sa({ title: e.target.innerText }); },
                        dangerouslySetInnerHTML: { __html: a.title }
                    }),
                    a.showSubtitle && el('div', {
                        className: 'bkbg-ret-subtitle',
                        style: { color: a.subtitleColor, contentEditable: true, suppressContentEditableWarning: true, outline: 'none' },
                        onBlur: function(e) { sa({ subtitle: e.target.innerText }); },
                        dangerouslySetInnerHTML: { __html: a.subtitle }
                    })
                ),

                // Input grid
                el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', marginBottom: '24px' } },
                    el(InputRow, { label: 'Current Age', value: curAge, min: 18, max: 80, step: 1, onChange: setCurAge, radius: inpRadius, labelColor: a.labelColor }),
                    el(InputRow, { label: 'Retirement Age', value: retAge, min: 40, max: 90, step: 1, onChange: setRetAge, radius: inpRadius, labelColor: a.labelColor }),
                    el(InputRow, { label: 'Current Savings', value: curSav, min: 0, max: 10000000, step: 1000, suffix: a.currency, onChange: setCurSav, radius: inpRadius, labelColor: a.labelColor }),
                    el(InputRow, { label: 'Monthly Contribution', value: contrib, min: 0, max: 100000, step: 50, suffix: a.currency + '/mo', onChange: setContrib, radius: inpRadius, labelColor: a.labelColor }),
                    el(InputRow, { label: 'Annual Return', value: ret, min: 0, max: 20, step: 0.1, suffix: '%', onChange: setRet, radius: inpRadius, labelColor: a.labelColor }),
                    a.showInflation && el(InputRow, { label: 'Inflation Rate', value: infl, min: 0, max: 15, step: 0.1, suffix: '%', onChange: setInfl, radius: inpRadius, labelColor: a.labelColor })
                ),

                // Result hero
                el('div', {
                    style: {
                        background:   a.resultBg,
                        border:       '2px solid ' + a.resultBorder,
                        borderRadius: a.cardRadius + 'px',
                        padding:      '28px 28px 22px',
                        marginBottom: '16px',
                        textAlign:    'center'
                    }
                },
                    el('div', { style: { fontSize: '13px', fontWeight: 600, color: a.labelColor, marginBottom: '6px' } },
                        'Projected savings at age ' + retAge + ' (' + r.years + ' years)'
                    ),
                    el('div', { style: { fontSize: a.totalSize + 'px', fontWeight: 800, color: a.totalColor, lineHeight: 1.1, marginBottom: '6px' } },
                        fmtM(r.total, a.currency, a.currencyPos)
                    ),
                    r.total !== 0 && el('div', { style: { fontSize: '13px', color: a.labelColor } },
                        '(' + fmtFull(r.total, a.currency, a.currencyPos) + ' total)'
                    )
                ),

                // Inflation-adjusted & breakdown
                el('div', { style: { display: 'grid', gridTemplateColumns: a.showInflation ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: a.showBreakdown ? '16px' : '0' } },
                    a.showInflation && el('div', { style: { background: a.projBgB, borderRadius: a.cardRadius + 'px', padding: '16px 18px' } },
                        el('div', { style: { fontSize: '11px', fontWeight: 700, color: a.inflationColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' } }, 'Inflation-Adjusted'),
                        el('div', { style: { fontSize: '24px', fontWeight: 800, color: a.inflationColor } }, fmtM(r.inflAdjusted, a.currency, a.currencyPos)),
                        el('div', { style: { fontSize: '11px', color: a.labelColor, marginTop: '2px' } }, 'In today\'s dollars')
                    ),
                    el('div', { style: { background: a.projBgA, borderRadius: a.cardRadius + 'px', padding: '16px 18px' } },
                        el('div', { style: { fontSize: '11px', fontWeight: 700, color: a.contribColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' } }, 'Total Contributions'),
                        el('div', { style: { fontSize: '24px', fontWeight: 800, color: a.contribColor } }, fmtM(r.totalContribs, a.currency, a.currencyPos)),
                        el('div', { style: { fontSize: '11px', color: a.labelColor, marginTop: '2px' } }, 'What you put in')
                    )
                ),

                // Breakdown bar
                a.showBreakdown && el('div', null,
                    el('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: a.labelColor, marginBottom: '6px' } },
                        el('span', null, 'Contributions'),
                        el('span', null, 'Investment Growth')
                    ),
                    el('div', { style: { height: '14px', borderRadius: '100px', background: a.barTrackBg, overflow: 'hidden', display: 'flex' } },
                        el('div', { style: { width: (contribFrac * 100).toFixed(1) + '%', background: a.contribColor, borderRadius: '100px 0 0 100px', transition: 'width .4s' } }),
                        el('div', { style: { width: (growthFrac * 100).toFixed(1) + '%', background: a.growthColor, borderRadius: '0 100px 100px 0', transition: 'width .4s' } })
                    ),
                    el('div', { style: { display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px' } },
                        el('span', null,
                            el('span', { style: { display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: a.contribColor, marginRight: '5px', verticalAlign: 'middle' } }),
                            'Contributions: ' + fmtM(r.totalContribs, a.currency, a.currencyPos)
                        ),
                        el('span', null,
                            el('span', { style: { display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: a.growthColor, marginRight: '5px', verticalAlign: 'middle' } }),
                            'Growth: ' + fmtM(r.growth, a.currency, a.currencyPos)
                        )
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/retirement-calculator', {
        edit: function(props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var TC = getTypoControl();
            var blockProps = useBlockProps((function(){
                var _tv = getTypoCssVars();
                var s = {};
                Object.assign(s, _tv(a.titleTypo, '--bkrc-tt-'));
                Object.assign(s, _tv(a.bodyTypo, '--bkrc-bt-'));
                return { style: s };
            })());

            var colorSettings = [
                { value: a.accentColor,    onChange: function(v) { set({ accentColor: v }); },    label: 'Accent Color' },
                { value: a.cardBg,         onChange: function(v) { set({ cardBg: v }); },          label: 'Card Background' },
                { value: a.resultBg,       onChange: function(v) { set({ resultBg: v }); },        label: 'Result Background' },
                { value: a.resultBorder,   onChange: function(v) { set({ resultBorder: v }); },    label: 'Result Border' },
                { value: a.totalColor,     onChange: function(v) { set({ totalColor: v }); },      label: 'Total Amount Color' },
                { value: a.inflationColor, onChange: function(v) { set({ inflationColor: v }); },  label: 'Inflation-Adjusted Color' },
                { value: a.contribColor,   onChange: function(v) { set({ contribColor: v }); },    label: 'Contributions Color' },
                { value: a.growthColor,    onChange: function(v) { set({ growthColor: v }); },     label: 'Growth Color' },
                { value: a.barTrackBg,     onChange: function(v) { set({ barTrackBg: v }); },      label: 'Bar Track Background' },
                { value: a.projBgA,        onChange: function(v) { set({ projBgA: v }); },         label: 'Contributions Card BG' },
                { value: a.projBgB,        onChange: function(v) { set({ projBgB: v }); },         label: 'Inflation Card BG' },
                { value: a.titleColor,     onChange: function(v) { set({ titleColor: v }); },      label: 'Title Color' },
                { value: a.subtitleColor,  onChange: function(v) { set({ subtitleColor: v }); },   label: 'Subtitle Color' },
                { value: a.labelColor,     onChange: function(v) { set({ labelColor: v }); },      label: 'Label Color' },
                { value: a.sectionBg,      onChange: function(v) { set({ sectionBg: v }); },       label: 'Section Background' }
            ];

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: 'Header', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Title', checked: a.showTitle, onChange: function(v) { set({ showTitle: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Subtitle', checked: a.showSubtitle, onChange: function(v) { set({ showSubtitle: v }); } }),
                        el(TextControl, { label: 'Title', value: a.title, onChange: function(v) { set({ title: v }); } }),
                        el(TextControl, { label: 'Subtitle', value: a.subtitle, onChange: function(v) { set({ subtitle: v }); } })
                    ),

                    el(PanelBody, { title: 'Calculator Defaults', initialOpen: true },
                        el(TextControl, { label: 'Currency Symbol', value: a.currency, onChange: function(v) { set({ currency: v }); } }),
                        el(SelectControl, {
                            label: 'Currency Position',
                            value: a.currencyPos,
                            options: [{ label: 'Before ($100)', value: 'before' }, { label: 'After (100$)', value: 'after' }],
                            onChange: function(v) { set({ currencyPos: v }); }
                        }),
                        el(RangeControl, { label: 'Default Current Age', value: a.currentAge, min: 18, max: 80, step: 1, onChange: function(v) { set({ currentAge: v }); } }),
                        el(RangeControl, { label: 'Default Retirement Age', value: a.retirementAge, min: 40, max: 90, step: 1, onChange: function(v) { set({ retirementAge: v }); } }),
                        el(TextControl, { label: 'Default Current Savings', type: 'number', value: String(a.currentSavings), onChange: function(v) { set({ currentSavings: parseFloat(v) || 0 }); } }),
                        el(TextControl, { label: 'Default Monthly Contribution', type: 'number', value: String(a.monthlyContrib), onChange: function(v) { set({ monthlyContrib: parseFloat(v) || 0 }); } }),
                        el(TextControl, { label: 'Default Annual Return (%)', type: 'number', value: String(a.annualReturn), onChange: function(v) { set({ annualReturn: parseFloat(v) || 0 }); } }),
                        el(TextControl, { label: 'Default Inflation Rate (%)', type: 'number', value: String(a.inflationRate), onChange: function(v) { set({ inflationRate: parseFloat(v) || 0 }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Inflation-Adjusted Result', checked: a.showInflation, onChange: function(v) { set({ showInflation: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Contributions vs Growth Bar', checked: a.showBreakdown, onChange: function(v) { set({ showBreakdown: v }); } })
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        TC && el(TC, { label: 'Title', value: a.titleTypo, onChange: function(v){ set({titleTypo:v}); } }),
                        TC && el(TC, { label: 'Body / Labels', value: a.bodyTypo, onChange: function(v){ set({bodyTypo:v}); } })
                    ),
el(PanelColorSettings, { title: 'Colors', initialOpen: false, colorSettings: colorSettings }),

                    el(PanelBody, { title: 'Sizing & Layout', initialOpen: false },
                        el(RangeControl, { label: 'Total Amount Size', value: a.totalSize, min: 28, max: 96, step: 2, onChange: function(v) { set({ totalSize: v }); } }),
                        el(RangeControl, { label: 'Card Border Radius', value: a.cardRadius, min: 0, max: 40, step: 1, onChange: function(v) { set({ cardRadius: v }); } }),
                        el(RangeControl, { label: 'Input Border Radius', value: a.inputRadius, min: 0, max: 24, step: 1, onChange: function(v) { set({ inputRadius: v }); } }),
                        el(RangeControl, { label: 'Max Width (px)', value: a.maxWidth, min: 300, max: 1000, step: 10, onChange: function(v) { set({ maxWidth: v }); } }),
                        el(RangeControl, { label: 'Padding Top (px)', value: a.paddingTop, min: 0, max: 160, step: 4, onChange: function(v) { set({ paddingTop: v }); } }),
                        el(RangeControl, { label: 'Padding Bottom (px)', value: a.paddingBottom, min: 0, max: 160, step: 4, onChange: function(v) { set({ paddingBottom: v }); } })
                    )
                ),
                el('div', blockProps,
                    el(RetirementPreview, { attributes: a, setAttributes: set })
                )
            );
        },
        save: function(props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save();
            return el('div', blockProps,
                el('div', { className: 'bkbg-ret-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
