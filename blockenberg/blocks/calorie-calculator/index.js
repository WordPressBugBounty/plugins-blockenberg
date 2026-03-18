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

    // ── Typography helpers ──────────────────────────────────────────────────
    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    function _tv(typo, prefix) {
        if (!typo) return {};
        var s = {};
        if (typo.family)     s[prefix + 'font-family'] = "'" + typo.family + "', sans-serif";
        if (typo.weight)     s[prefix + 'font-weight'] = typo.weight;
        if (typo.transform)  s[prefix + 'text-transform'] = typo.transform;
        if (typo.style)      s[prefix + 'font-style'] = typo.style;
        if (typo.decoration) s[prefix + 'text-decoration'] = typo.decoration;
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) s[prefix + 'font-size-d'] = typo.sizeDesktop + su;
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) s[prefix + 'font-size-t'] = typo.sizeTablet + su;
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) s[prefix + 'font-size-m'] = typo.sizeMobile + su;
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) s[prefix + 'line-height-d'] = typo.lineHeightDesktop + lhu;
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) s[prefix + 'line-height-t'] = typo.lineHeightTablet + lhu;
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) s[prefix + 'line-height-m'] = typo.lineHeightMobile + lhu;
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) s[prefix + 'letter-spacing-d'] = typo.letterSpacingDesktop + lsu;
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) s[prefix + 'letter-spacing-t'] = typo.letterSpacingTablet + lsu;
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) s[prefix + 'letter-spacing-m'] = typo.letterSpacingMobile + lsu;
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) s[prefix + 'word-spacing-d'] = typo.wordSpacingDesktop + wsu;
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) s[prefix + 'word-spacing-t'] = typo.wordSpacingTablet + wsu;
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) s[prefix + 'word-spacing-m'] = typo.wordSpacingMobile + wsu;
        return s;
    }

    var ACTIVITY_OPTIONS = [
        { value: 'sedentary',    label: 'Sedentary (little/no exercise)',       mult: 1.200 },
        { value: 'light',        label: 'Lightly active (1–3 days/week)',        mult: 1.375 },
        { value: 'moderate',     label: 'Moderately active (3–5 days/week)',     mult: 1.550 },
        { value: 'very',         label: 'Very active (6–7 days/week)',           mult: 1.725 },
        { value: 'extra',        label: 'Extra active (physical job + hard ex)', mult: 1.900 },
    ];

    var GOAL_OPTIONS = [
        { value: 'lose2',   label: 'Lose weight fast (−1000 kcal)',  adj: -1000 },
        { value: 'lose1',   label: 'Lose weight (−500 kcal)',        adj: -500  },
        { value: 'maintain',label: 'Maintain weight',                adj: 0     },
        { value: 'gain1',   label: 'Gain weight (+300 kcal)',        adj: +300  },
        { value: 'gain2',   label: 'Build muscle (+500 kcal)',       adj: +500  },
    ];

    function calcBMR(gender, weight, height, age) {
        // Mifflin-St Jeor
        var base = 10 * weight + 6.25 * height - 5 * age;
        return gender === 'female' ? base - 161 : base + 5;
    }

    function actMult(activity) {
        var opt = ACTIVITY_OPTIONS.find(function (o) { return o.value === activity; });
        return opt ? opt.mult : 1.55;
    }

    function CalcPreview(props) {
        var a       = props.attributes;
        var setAttr = props.setAttributes;

        var _s      = useState({ gender: a.defaultGender, age: a.defaultAge, weight: a.defaultWeight, height: a.defaultHeight, activity: a.defaultActivity, units: a.defaultUnits, goal: 'maintain' });
        var state   = _s[0];
        var setState= _s[1];

        function set(key, val) { setState(function (prev) { var o = Object.assign({}, prev); o[key] = val; return o; }); }

        /* Convert to metric for calculation */
        var weightKg = state.units === 'imperial' ? state.weight * 0.453592 : state.weight;
        var heightCm = state.units === 'imperial' ? state.height * 2.54      : state.height;
        var bmr      = Math.round(calcBMR(state.gender, weightKg, heightCm, state.age));
        var tdee     = Math.round(bmr * actMult(state.activity));
        var goalAdj  = (GOAL_OPTIONS.find(function (o) { return o.value === state.goal; }) || { adj: 0 }).adj;
        var target   = tdee + goalAdj;
        var proteinG = Math.round(target * (a.proteinPct / 100) / 4);
        var carbG    = Math.round(target * (a.carbPct    / 100) / 4);
        var fatG     = Math.round(target * (a.fatPct     / 100) / 9);

        var accent   = a.accentColor  || '#6c3fb5';
        var maxW     = (a.maxWidth    || 620) + 'px';
        var cRadius  = (a.cardRadius  || 16) + 'px';
        var iRadius  = (a.inputRadius || 8)  + 'px';
        var ptop     = (a.paddingTop  || 60) + 'px';
        var pbot     = (a.paddingBottom || 60) + 'px';
        var tdeeSize = (a.tdeeSize    || 52) + 'px';

        /* Shared input style */
        var inpStyle = { width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: iRadius, fontSize: '15px', boxSizing: 'border-box', outline: 'none', background: '#fff', color: a.labelColor || '#374151' };
        var selStyle = Object.assign({}, inpStyle);
        var lblStyle = { fontSize: '13px', fontWeight: 600, color: a.labelColor || '#374151', display: 'block', marginBottom: '4px' };
        var fldStyle = { marginBottom: '14px' };

        function field(label, input) {
            return el('div', { style: fldStyle },
                el('label', { style: lblStyle }, label),
                input
            );
        }

        /* Gender row */
        var genderRow = el('div', { style: { display:'flex', gap:'10px', marginBottom:'14px' } },
            ['male','female'].map(function (g) {
                var active = state.gender === g;
                return el('button', {
                    key: g,
                    onClick: function () { set('gender', g); },
                    style: { flex:1, padding:'10px', border:'2px solid '+(active? accent:'#e5e7eb'), borderRadius: iRadius, background: active? accent: '#fff', color: active?'#fff': (a.labelColor||'#374151'), fontWeight:600, cursor:'pointer', fontSize:'14px' }
                }, g === 'male' ? '♂ Male' : '♀ Female');
            })
        );

        /* Units row */
        var unitsRow = el('div', { style: { display:'flex', gap:'10px', marginBottom:'14px' } },
            ['metric','imperial'].map(function (u) {
                var active = state.units === u;
                return el('button', {
                    key: u,
                    onClick: function () { set('units', u); },
                    style: { flex:1, padding:'8px', border:'2px solid '+(active? accent:'#e5e7eb'), borderRadius: iRadius, background: active? accent:'#fff', color: active?'#fff':(a.labelColor||'#374151'), fontWeight:600, cursor:'pointer', fontSize:'13px' }
                }, u === 'metric' ? 'Metric (kg/cm)' : 'Imperial (lbs/in)');
            })
        );

        var weightUnit = state.units === 'imperial' ? 'lbs' : 'kg';
        var heightUnit = state.units === 'imperial' ? 'in'  : 'cm';

        /* Macro bar */
        var macroBar = el('div', { style: { display:'flex', borderRadius:'8px', overflow:'hidden', height:'12px', marginBottom:'16px' } },
            el('div', { style: { flex: a.proteinPct, background: a.proColor  || '#ef4444' } }),
            el('div', { style: { flex: a.carbPct,    background: a.carbColor || '#f59e0b' } }),
            el('div', { style: { flex: a.fatPct,     background: a.fatColor  || '#3b82f6' } })
        );

        function macroCard(label, grams, pct, color) {
            return el('div', { style: { textAlign:'center', background: '#fff', borderRadius:'10px', padding:'12px 8px', border:'1.5px solid #e5e7eb' } },
                el('div', { style: { fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.05em', color:'#9ca3af', marginBottom:'4px' } }, label),
                el('div', { style: { fontSize:'24px', fontWeight:800, color: color, lineHeight:1 } }, grams + 'g'),
                el('div', { style: { fontSize:'12px', color:'#9ca3af', marginTop:'2px' } }, pct + '%')
            );
        }

        return el('div', { style: Object.assign({ background: a.cardBg||'#fff', borderRadius: cRadius, maxWidth: maxW, margin: '0 auto', paddingTop: ptop, paddingBottom: pbot, paddingLeft:'32px', paddingRight:'32px' }, _tv(a.typoTitle, '--bkbg-cal-tt-'), _tv(a.typoSub, '--bkbg-cal-ts-')) },
            /* Title / subtitle */
            a.showTitle !== false && a.title && el('h2', { className: 'bkbg-cal-title', style: { color: a.titleColor||'#1e1b4b', textAlign:'center', marginTop:0, marginBottom:'8px' } }, a.title),
            a.showSubtitle !== false && a.subtitle && el('p', { className: 'bkbg-cal-subtitle', style: { color: a.subtitleColor||'#6b7280', textAlign:'center', marginTop:0, marginBottom:'24px' } }, a.subtitle),

            /* Units toggle */
            unitsRow,

            /* Inputs */
            el('label', { style: lblStyle }, 'Gender'),
            genderRow,
            field('Age (years)', el('input', { type:'number', min:10, max:100, value: state.age, style: inpStyle, onChange: function (e) { set('age', parseInt(e.target.value)||30); } })),
            field('Height (' + heightUnit + ')', el('input', { type:'number', min:50, max:300, value: state.height, style: inpStyle, onChange: function (e) { set('height', parseFloat(e.target.value)||170); } })),
            field('Weight (' + weightUnit + ')', el('input', { type:'number', min:20, max:500, value: state.weight, style: inpStyle, onChange: function (e) { set('weight', parseFloat(e.target.value)||70); } })),
            field('Activity level', el('select', { value: state.activity, style: selStyle, onChange: function (e) { set('activity', e.target.value); } },
                ACTIVITY_OPTIONS.map(function (o) { return el('option', { key: o.value, value: o.value }, o.label); })
            )),

            /* Goal */
            a.showGoalCalc !== false && field('Goal', el('select', { value: state.goal, style: selStyle, onChange: function (e) { set('goal', e.target.value); } },
                GOAL_OPTIONS.map(function (o) { return el('option', { key: o.value, value: o.value }, o.label); })
            )),

            /* Result box */
            el('div', { style: { background: a.resultBg||'#f5f3ff', border:'1.5px solid '+(a.resultBorder||'#ede9fe'), borderRadius: cRadius, padding:'24px', textAlign:'center', marginBottom: a.showMacros!==false?'20px':'0' } },
                el('div', { style: { fontSize:'13px', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px' } }, 'Daily Calories (TDEE)'),
                el('div', { style: { fontSize: tdeeSize, fontWeight:800, color: a.tdeeColor||accent, lineHeight:1, marginBottom:'4px' } }, target.toLocaleString()),
                el('div', { style: { fontSize:'13px', color:'#9ca3af' } }, 'kcal / day'),
                a.showBMR !== false && el('div', { style: { marginTop:'12px', fontSize:'13px', color: a.bmrColor||'#8b5cf6' } },
                    'Basal Metabolic Rate (BMR): ' + bmr.toLocaleString() + ' kcal/day'
                )
            ),

            /* Macros */
            a.showMacros !== false && el(Fragment, null,
                macroBar,
                el('div', { style: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' } },
                    macroCard('Protein', proteinG, a.proteinPct, a.proColor||'#ef4444'),
                    macroCard('Carbs',   carbG,    a.carbPct,    a.carbColor||'#f59e0b'),
                    macroCard('Fat',     fatG,      a.fatPct,     a.fatColor||'#3b82f6')
                )
            )
        );
    }

    registerBlockType('blockenberg/calorie-calculator', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-calorie-calculator-block' });

            return el('div', blockProps,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(TextControl, { label: 'Title',    value: a.title,    onChange: function (v) { setAttr({ title: v }); } }),
                        el(ToggleControl, { label: 'Show title',    checked: a.showTitle,    onChange: function (v) { setAttr({ showTitle: v }); },    __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Subtitle', value: a.subtitle, onChange: function (v) { setAttr({ subtitle: v }); } }),
                        el(ToggleControl, { label: 'Show subtitle', checked: a.showSubtitle, onChange: function (v) { setAttr({ showSubtitle: v }); }, __nextHasNoMarginBottom: true }),
                    ),
                    el(PanelBody, { title: __('Defaults', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: 'Default units',    value: a.defaultUnits,    options: [{label:'Metric',value:'metric'},{label:'Imperial',value:'imperial'}], onChange: function (v) { setAttr({ defaultUnits: v }); } }),
                        el(SelectControl, { label: 'Default gender',   value: a.defaultGender,   options: [{label:'Male',value:'male'},{label:'Female',value:'female'}], onChange: function (v) { setAttr({ defaultGender: v }); } }),
                        el(RangeControl, { label: 'Default age',       value: a.defaultAge,      min:10, max:100, onChange: function (v) { setAttr({ defaultAge: v }); } }),
                        el(RangeControl, { label: 'Default weight (metric kg)', value: a.defaultWeight, min:20, max:300, onChange: function (v) { setAttr({ defaultWeight: v }); } }),
                        el(RangeControl, { label: 'Default height (metric cm)', value: a.defaultHeight, min:100, max:250, onChange: function (v) { setAttr({ defaultHeight: v }); } }),
                        el(SelectControl, { label: 'Default activity', value: a.defaultActivity, options: ACTIVITY_OPTIONS.map(function(o){return{label:o.label,value:o.value};}), onChange: function (v) { setAttr({ defaultActivity: v }); } }),
                    ),
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: 'Show macros',    checked: a.showMacros,   onChange: function (v) { setAttr({ showMacros: v }); },   __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show goal calc', checked: a.showGoalCalc, onChange: function (v) { setAttr({ showGoalCalc: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show BMR',       checked: a.showBMR,      onChange: function (v) { setAttr({ showBMR: v }); },      __nextHasNoMarginBottom: true }),
                    ),
                    el(PanelBody, { title: __('Macro Ratios (%)', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: 'Protein %', value: a.proteinPct, min:10, max:60, onChange: function (v) { setAttr({ proteinPct: v }); } }),
                        el(RangeControl, { label: 'Carbs %',   value: a.carbPct,    min:10, max:70, onChange: function (v) { setAttr({ carbPct: v }); } }),
                        el(RangeControl, { label: 'Fat %',     value: a.fatPct,     min:10, max:60, onChange: function (v) { setAttr({ fatPct: v }); } }),
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el( 'p', { style: { margin: '0 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __( 'Title', 'blockenberg' ) ),
                        el( getTypographyControl(), {
                            label: __( 'Title Typography', 'blockenberg' ),
                            value: a.typoTitle,
                            onChange: function (v) { setAttr({ typoTitle: v }); }
                        }),
                        el( 'hr', {} ),
                        el( 'p', { style: { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __( 'Subtitle', 'blockenberg' ) ),
                        el( getTypographyControl(), {
                            label: __( 'Subtitle Typography', 'blockenberg' ),
                            value: a.typoSub,
                            onChange: function (v) { setAttr({ typoSub: v }); }
                        }),
                        el( 'hr', {} ),
                        el(RangeControl, { label: 'TDEE number size (px)', value: a.tdeeSize, min: 24, max: 80, onChange: function (v) { setAttr({ tdeeSize: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false, colorSettings: [
                            { label: 'Accent',          value: a.accentColor,   onChange: function (v) { setAttr({ accentColor: v }); } },
                            { label: 'Card background', value: a.cardBg,        onChange: function (v) { setAttr({ cardBg: v }); } },
                            { label: 'Result background',value: a.resultBg,     onChange: function (v) { setAttr({ resultBg: v }); } },
                            { label: 'Result border',   value: a.resultBorder,  onChange: function (v) { setAttr({ resultBorder: v }); } },
                            { label: 'TDEE number',     value: a.tdeeColor,     onChange: function (v) { setAttr({ tdeeColor: v }); } },
                            { label: 'BMR label',       value: a.bmrColor,      onChange: function (v) { setAttr({ bmrColor: v }); } },
                            { label: 'Protein macro',   value: a.proColor,      onChange: function (v) { setAttr({ proColor: v }); } },
                            { label: 'Carbs macro',     value: a.carbColor,     onChange: function (v) { setAttr({ carbColor: v }); } },
                            { label: 'Fat macro',       value: a.fatColor,      onChange: function (v) { setAttr({ fatColor: v }); } },
                            { label: 'Title',           value: a.titleColor,    onChange: function (v) { setAttr({ titleColor: v }); } },
                            { label: 'Subtitle',        value: a.subtitleColor, onChange: function (v) { setAttr({ subtitleColor: v }); } },
                        ],
                    }),
                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: 'Max width (px)',   value: a.maxWidth,      min:300,  max:900, step:10, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: 'Padding top',      value: a.paddingTop,    min:0,    max:120, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: 'Padding bottom',   value: a.paddingBottom, min:0,    max:120, onChange: function (v) { setAttr({ paddingBottom: v }); } }),
                        el(RangeControl, { label: 'Card radius (px)', value: a.cardRadius,    min:0,    max:32,  onChange: function (v) { setAttr({ cardRadius: v }); } }),
                        el(RangeControl, { label: 'Input radius (px)',value: a.inputRadius,   min:0,    max:20,  onChange: function (v) { setAttr({ inputRadius: v }); } }),
                    )
                ),
                el(CalcPreview, { attributes: a, setAttributes: setAttr })
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-calorie-calculator-block' });
            return el('div', Object.assign({}, blockProps, {
                className: (blockProps.className || '') + ' bkbg-cal-app',
                'data-opts': JSON.stringify(a),
            }));
        },
    });
}() );
