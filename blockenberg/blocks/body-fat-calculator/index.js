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

    /* ── US Navy body fat formula ─────────────────────────────────────────── */
    // metric: cm  |  imperial: inches
    function calcBodyFat(gender, unit, height, waist, neck, hip) {
        var h = parseFloat(height) || 0;
        var w = parseFloat(waist)  || 0;
        var n = parseFloat(neck)   || 0;
        var hi= parseFloat(hip)    || 0;
        if (h <= 0 || w <= 0 || n <= 0) return null;
        // Convert to cm if metric
        if (unit === 'imperial') { h *= 2.54; w *= 2.54; n *= 2.54; hi *= 2.54; }
        // US Navy formula (metric)
        var bf;
        if (gender === 'male') {
            bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
        } else {
            if (hi <= 0) return null;
            bf = 495 / (1.29579 - 0.35004 * Math.log10(w + hi - n) + 0.22100 * Math.log10(h)) - 450;
        }
        return Math.max(0, Math.min(70, parseFloat(bf.toFixed(1))));
    }

    function getCategory(bf, gender) {
        if (gender === 'male') {
            if (bf < 6)  return { label: 'Essential Fat', color: '#3b82f6' };
            if (bf < 14) return { label: 'Athletes',      color: '#10b981' };
            if (bf < 18) return { label: 'Fitness',       color: '#6c3fb5' };
            if (bf < 25) return { label: 'Average',       color: '#f59e0b' };
            return              { label: 'Obese',          color: '#ef4444' };
        } else {
            if (bf < 14) return { label: 'Essential Fat', color: '#3b82f6' };
            if (bf < 21) return { label: 'Athletes',      color: '#10b981' };
            if (bf < 25) return { label: 'Fitness',       color: '#6c3fb5' };
            if (bf < 32) return { label: 'Average',       color: '#f59e0b' };
            return              { label: 'Obese',          color: '#ef4444' };
        }
    }

    // Category ranges for chart
    function getMaleRanges()   { return [[0,6,'Essential',  '#3b82f6'],[6,14,'Athletes','#10b981'],[14,18,'Fitness','#6c3fb5'],[18,25,'Average','#f59e0b'],[25,50,'Obese','#ef4444']]; }
    function getFemaleRanges() { return [[0,14,'Essential', '#3b82f6'],[14,21,'Athletes','#10b981'],[21,25,'Fitness','#6c3fb5'],[25,32,'Average','#f59e0b'],[32,50,'Obese','#ef4444']]; }

    function BodyFatPreview(props) {
        var a  = props.attributes;
        var sa = props.setAttributes;

        var _gender = useState(a.defaultGender || 'male'); var gender = _gender[0]; var setGender = _gender[1];
        var _unit   = useState(a.defaultUnit   || 'metric'); var unit = _unit[0]; var setUnit = _unit[1];
        var _height = useState(unit === 'metric' ? '170' : '67'); var height = _height[0]; var setHeight = _height[1];
        var _waist  = useState(unit === 'metric' ? '85' : '33'); var waist = _waist[0]; var setWaist = _waist[1];
        var _neck   = useState(unit === 'metric' ? '37' : '15'); var neck = _neck[0]; var setNeck = _neck[1];
        var _hip    = useState(unit === 'metric' ? '95' : '37'); var hip = _hip[0]; var setHip = _hip[1];

        var bf  = calcBodyFat(gender, 'metric', height, waist, neck, gender === 'female' ? hip : 0);
        var cat = bf !== null ? getCategory(bf, gender) : null;
        var ranges = gender === 'male' ? getMaleRanges() : getFemaleRanges();

        var accent  = a.accentColor || '#6c3fb5';
        var lbl_u   = unit === 'metric' ? 'cm' : 'in';

        var containerStyle = {
            background:    a.sectionBg || undefined,
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            fontFamily: 'inherit'
        };
        var cardStyle = {
            background:   a.cardBg,
            borderRadius: a.cardRadius + 'px',
            padding:      '36px 32px',
            maxWidth:     a.maxWidth + 'px',
            margin:       '0 auto',
            boxShadow:    '0 4px 24px rgba(0,0,0,0.09)'
        };

        function inputStyle() {
            return { width: '100%', padding: '9px 12px', borderRadius: a.inputRadius + 'px', border: '1.5px solid #e5e7eb', fontSize: '16px', outline: 'none', boxSizing: 'border-box' };
        }
        function labelStyle() {
            return { display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: a.labelColor, marginBottom: '5px' };
        }
        function rowEl(lbl, suffix, val, setVal) {
            return el('div', { style: { marginBottom: '14px' } },
                el('label', { style: labelStyle() },
                    el('span', null, lbl),
                    el('span', { style: { fontWeight: 400, color: '#9ca3af' } }, suffix)
                ),
                el('input', {
                    type: 'number', value: val, min: 0, style: inputStyle(),
                    onChange: function(e) { setVal(e.target.value); }
                })
            );
        }

        function TabBtn(lbl, active, onClick) {
            return el('button', {
                style: {
                    flex: 1, padding: '9px 16px', borderRadius: '8px', cursor: 'pointer',
                    border: '2px solid ' + (active ? accent : '#e5e7eb'),
                    background: active ? accent : 'transparent',
                    color: active ? '#fff' : accent,
                    fontWeight: 700, fontSize: '14px', transition: 'all .15s'
                },
                onClick: onClick
            }, lbl);
        }

        return el('div', { className: 'bkbg-bfc-editor', style: containerStyle },
            el('div', { style: cardStyle },

                // Title / subtitle
                (a.showTitle || a.showSubtitle) && el('div', { style: { marginBottom: '20px' } },
                    a.showTitle && el('div', {
                        className: 'bkbg-bfc-title',
                        style: { color: a.titleColor, marginBottom: '6px', contentEditable: true, suppressContentEditableWarning: true, outline: 'none' },
                        onBlur: function(e) { sa({ title: e.target.innerText }); },
                        dangerouslySetInnerHTML: { __html: a.title }
                    }),
                    a.showSubtitle && el('div', {
                        style: { fontSize: '15px', color: a.subtitleColor, contentEditable: true, suppressContentEditableWarning: true, outline: 'none' },
                        onBlur: function(e) { sa({ subtitle: e.target.innerText }); },
                        dangerouslySetInnerHTML: { __html: a.subtitle }
                    })
                ),

                // Gender + Unit tabs
                el('div', { style: { display: 'flex', gap: '10px', marginBottom: '20px' } },
                    TabBtn('♂ Male',   gender === 'male',    function() { setGender('male'); }),
                    TabBtn('♀ Female', gender === 'female',  function() { setGender('female'); })
                ),
                el('div', { style: { display: 'flex', gap: '10px', marginBottom: '24px' } },
                    TabBtn('Metric (cm)', unit === 'metric',   function() { setUnit('metric'); }),
                    TabBtn('Imperial (in)', unit === 'imperial', function() { setUnit('imperial'); })
                ),

                // Inputs
                el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' } },
                    rowEl('Height', lbl_u, height, setHeight),
                    rowEl('Waist (at navel)', lbl_u, waist, setWaist),
                    rowEl('Neck', lbl_u, neck, setNeck),
                    gender === 'female' && rowEl('Hips', lbl_u, hip, setHip)
                ),

                // Result
                el('div', {
                    style: {
                        background: a.resultBg, border: '2px solid ' + a.resultBorder,
                        borderRadius: a.cardRadius + 'px', padding: '24px 28px',
                        textAlign: 'center', marginTop: '20px', marginBottom: '16px'
                    }
                },
                    bf !== null
                        ? el(Fragment, null,
                            el('div', { className: 'bkbg-bfc-bf-value', style: { color: cat ? cat.color : a.resultColor } }, bf + '%'),
                            cat && el('div', { style: { marginTop: '6px', fontWeight: 700, fontSize: '16px', color: cat.color } }, cat.label),
                            el('div', { style: { marginTop: '4px', fontSize: '13px', color: a.labelColor } }, 'Body Fat Percentage')
                          )
                        : el('div', { style: { color: a.labelColor, fontSize: '15px' } }, 'Enter measurements above')
                ),

                // Category bar
                a.showChart && el('div', { style: { marginBottom: '16px' } },
                    el('div', { style: { display: 'flex', height: '14px', borderRadius: '100px', overflow: 'hidden', marginBottom: '8px' } },
                        ranges.map(function(r) {
                            var width = ((r[1] - r[0]) / 50 * 100).toFixed(1) + '%';
                            return el('div', { key: r[2], title: r[2] + ': ' + r[0] + '-' + r[1] + '%', style: { width: width, background: r[3] } });
                        })
                    ),
                    a.showCategories && el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } },
                        ranges.map(function(r) {
                            return el('span', { key: r[2], style: { fontSize: '11px', fontWeight: 700, background: r[3] + '22', color: r[3], padding: '2px 8px', borderRadius: '100px' } },
                                r[2] + ' (' + r[0] + (r[1] < 50 ? '-' + r[1] : '+') + '%)'
                            );
                        })
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/body-fat-calculator', {
        edit: function(props) {
            var a   = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ style: Object.assign({}, _tv(a.typoTitle, '--bkbg-bfc-title-'), _tv(a.typoResult, '--bkbg-bfc-result-')) });

            var colorSettings = [
                { value: a.accentColor,   onChange: function(v) { set({ accentColor: v }); },   label: 'Accent / Tabs' },
                { value: a.cardBg,        onChange: function(v) { set({ cardBg: v }); },         label: 'Card Background' },
                { value: a.resultBg,      onChange: function(v) { set({ resultBg: v }); },       label: 'Result Background' },
                { value: a.resultBorder,  onChange: function(v) { set({ resultBorder: v }); },   label: 'Result Border' },
                { value: a.resultColor,   onChange: function(v) { set({ resultColor: v }); },    label: 'Result Value Color' },
                { value: a.gaugeEssential,onChange: function(v) { set({ gaugeEssential: v }); }, label: 'Category: Essential Fat' },
                { value: a.gaugeAthletes, onChange: function(v) { set({ gaugeAthletes: v }); },  label: 'Category: Athletes' },
                { value: a.gaugeFitness,  onChange: function(v) { set({ gaugeFitness: v }); },   label: 'Category: Fitness' },
                { value: a.gaugeAverage,  onChange: function(v) { set({ gaugeAverage: v }); },   label: 'Category: Average' },
                { value: a.gaugeObese,    onChange: function(v) { set({ gaugeObese: v }); },     label: 'Category: Obese' },
                { value: a.titleColor,    onChange: function(v) { set({ titleColor: v }); },     label: 'Title Color' },
                { value: a.subtitleColor, onChange: function(v) { set({ subtitleColor: v }); },  label: 'Subtitle Color' },
                { value: a.labelColor,    onChange: function(v) { set({ labelColor: v }); },     label: 'Label Color' },
                { value: a.sectionBg,     onChange: function(v) { set({ sectionBg: v }); },      label: 'Section Background' }
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
                        el(SelectControl, { label: 'Default Unit', value: a.defaultUnit, options: [{ label: 'Metric (cm)', value: 'metric' }, { label: 'Imperial (inches)', value: 'imperial' }], onChange: function(v) { set({ defaultUnit: v }); } }),
                        el(SelectControl, { label: 'Default Gender', value: a.defaultGender, options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }], onChange: function(v) { set({ defaultGender: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Category Bar', checked: a.showChart, onChange: function(v) { set({ showChart: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Category Legend', checked: a.showCategories, onChange: function(v) { set({ showCategories: v }); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function(v) { set({ typoTitle: v }); } }),
                        el(getTypographyControl(), { label: __('Result Value', 'blockenberg'), value: a.typoResult, onChange: function(v) { set({ typoResult: v }); } })
                    ),
el(PanelColorSettings, { title: 'Colors', initialOpen: false, colorSettings: colorSettings }),
                    el(PanelBody, { title: 'Sizing & Layout', initialOpen: false },
                        el(RangeControl, { label: 'Card Border Radius', value: a.cardRadius, min: 0, max: 40, step: 1, onChange: function(v) { set({ cardRadius: v }); } }),
                        el(RangeControl, { label: 'Input Border Radius', value: a.inputRadius, min: 0, max: 24, step: 1, onChange: function(v) { set({ inputRadius: v }); } }),
                        el(RangeControl, { label: 'Max Width (px)', value: a.maxWidth, min: 300, max: 900, step: 10, onChange: function(v) { set({ maxWidth: v }); } }),
                        el(RangeControl, { label: 'Padding Top (px)', value: a.paddingTop, min: 0, max: 160, step: 4, onChange: function(v) { set({ paddingTop: v }); } }),
                        el(RangeControl, { label: 'Padding Bottom (px)', value: a.paddingBottom, min: 0, max: 160, step: 4, onChange: function(v) { set({ paddingBottom: v }); } })
                    )
                ),
                el('div', blockProps,
                    el(BodyFatPreview, { attributes: a, setAttributes: set })
                )
            );
        },
        save: function(props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save();
            return el('div', blockProps,
                el('div', { className: 'bkbg-bfc-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
