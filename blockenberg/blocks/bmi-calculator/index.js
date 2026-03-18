( function () {
    var el               = wp.element.createElement;
    var useState         = wp.element.useState;
    var Fragment         = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __               = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps    = wp.blockEditor.useBlockProps;
    var PanelBody        = wp.components.PanelBody;
    var RangeControl     = wp.components.RangeControl;
    var SelectControl    = wp.components.SelectControl;
    var TextControl      = wp.components.TextControl;
    var TextareaControl  = wp.components.TextareaControl;
    var ToggleControl    = wp.components.ToggleControl;
    var Button           = wp.components.Button;

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

    /* ── BMI calculation helpers ───────────────────────────────────────────── */
    function calcBMI(system, weightKg, heightCm, weightLbs, heightFt, heightIn) {
        var bmi;
        if (system === 'metric') {
            var hM = heightCm / 100;
            bmi = hM > 0 ? weightKg / (hM * hM) : 0;
        } else {
            var totalIn = heightFt * 12 + heightIn;
            bmi = totalIn > 0 ? (703 * weightLbs) / (totalIn * totalIn) : 0;
        }
        return Math.round(bmi * 10) / 10;
    }

    function bmiCategory(bmi) {
        if (bmi < 18.5) return 'underweight';
        if (bmi < 25)   return 'normal';
        if (bmi < 30)   return 'overweight';
        return 'obese';
    }

    function bmiNeedle(bmi) {
        // Maps bmi 10-40+ to 0-100%
        var clamped = Math.min(Math.max(bmi, 10), 40);
        return ((clamped - 10) / 30) * 100;
    }

    /* ── BMI Preview Component ──────────────────────────────────────────────── */
    function BMIPreview(props) {
        var a   = props.attrs;
        var sys = useState(a.unitSystem || 'metric');
        var system = sys[0]; var setSystem = sys[1];

        var wkg  = useState(a.weightDefaultKg  || 70);
        var weightKg = wkg[0]; var setWeightKg = wkg[1];
        var hcm  = useState(a.heightDefaultCm  || 170);
        var heightCm = hcm[0]; var setHeightCm = hcm[1];
        var wlbs = useState(a.weightDefaultLbs || 154);
        var weightLbs = wlbs[0]; var setWeightLbs = wlbs[1];
        var hft  = useState(a.heightDefaultFt  || 5);
        var heightFt = hft[0]; var setHeightFt = hft[1];
        var hin  = useState(a.heightDefaultIn  || 7);
        var heightIn = hin[0]; var setHeightIn = hin[1];

        var bmi  = calcBMI(system, weightKg, heightCm, weightLbs, heightFt, heightIn);
        var cat  = bmiCategory(bmi);
        var pct  = bmiNeedle(bmi);

        var catColors = {
            underweight: a.underweightColor || '#3b82f6',
            normal:      a.normalColor      || '#10b981',
            overweight:  a.overweightColor  || '#f59e0b',
            obese:       a.obeseColor       || '#ef4444',
        };
        var catLabels = {
            underweight: __('Underweight', 'blockenberg'),
            normal:      __('Normal', 'blockenberg'),
            overweight:  __('Overweight', 'blockenberg'),
            obese:       __('Obese', 'blockenberg'),
        };
        var catColor = catColors[cat];

        var idealMin = system === 'metric'
            ? (18.5 * Math.pow(heightCm / 100, 2)).toFixed(1)
            : ((18.5 * Math.pow(heightFt * 12 + heightIn, 2)) / 703).toFixed(1);
        var idealMax = system === 'metric'
            ? (24.9 * Math.pow(heightCm / 100, 2)).toFixed(1)
            : ((24.9 * Math.pow(heightFt * 12 + heightIn, 2)) / 703).toFixed(1);

        var cardStyle = {
            background:   a.cardBg    || '#ffffff',
            borderRadius: (a.cardRadius || 16) + 'px',
            padding:      '32px',
            boxShadow:    '0 4px 24px rgba(0,0,0,0.08)',
            maxWidth:     (a.maxWidth || 680) + 'px',
            margin:       '0 auto',
            paddingTop:   (a.paddingTop    || 60) + 'px',
            paddingBottom:(a.paddingBottom || 60) + 'px',
            boxSizing:    'border-box',
        };
        if (a.bgColor) cardStyle.background = a.bgColor;

        return el(Fragment, null,
            el('div', { style: cardStyle },

                /* title */
                a.showTitle && el('h2', {
                    className: 'bkbg-bmi-title',
                    style: { color: a.titleColor || '#1e1b4b', textAlign: 'center', marginTop: 0, marginBottom: 8 }
                }, a.title || __('BMI Calculator', 'blockenberg')),
                a.showSubtitle && el('p', {
                    style: { color: a.subtitleColor || '#6b7280', textAlign: 'center', marginTop: 0, marginBottom: 28 }
                }, a.subtitle || ''),

                /* unit toggle */
                a.showUnitToggle && el('div', { style: { display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' } },
                    ['metric', 'imperial'].map(function(s) {
                        return el('button', {
                            key: s,
                            onClick: function() { setSystem(s); },
                            style: {
                                padding: '6px 18px',
                                borderRadius: (a.btnRadius || 8) + 'px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '14px',
                                background: system === s ? (a.accentColor || '#6c3fb5') : '#f3f4f6',
                                color: system === s ? '#ffffff' : '#374151',
                                transition: 'all 0.2s',
                            }
                        }, s === 'metric' ? __('Metric (kg/cm)', 'blockenberg') : __('Imperial (lbs/ft)', 'blockenberg'));
                    })
                ),

                /* inputs */
                el('div', { style: { display: 'grid', gridTemplateColumns: system === 'imperial' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '16px', marginBottom: '24px' } },
                    system === 'metric'
                        ? el(Fragment, null,
                            el('div', null,
                                el('label', { style: { display: 'block', color: a.labelColor || '#374151', fontSize: '13px', fontWeight: 600, marginBottom: '6px' } }, __('Weight (kg)', 'blockenberg')),
                                el('input', { type: 'number', className: 'bkbg-bmi-input', value: weightKg, min: a.weightMinKg || 20, max: a.weightMaxKg || 200,
                                    onChange: function(e) { setWeightKg(Number(e.target.value)); },
                                    style: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '16px', boxSizing: 'border-box' }
                                })
                            ),
                            el('div', null,
                                el('label', { style: { display: 'block', color: a.labelColor || '#374151', fontSize: '13px', fontWeight: 600, marginBottom: '6px' } }, __('Height (cm)', 'blockenberg')),
                                el('input', { type: 'number', className: 'bkbg-bmi-input', value: heightCm, min: a.heightMinCm || 100, max: a.heightMaxCm || 220,
                                    onChange: function(e) { setHeightCm(Number(e.target.value)); },
                                    style: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '16px', boxSizing: 'border-box' }
                                })
                            )
                        )
                        : el(Fragment, null,
                            el('div', null,
                                el('label', { style: { display: 'block', color: a.labelColor || '#374151', fontSize: '13px', fontWeight: 600, marginBottom: '6px' } }, __('Weight (lbs)', 'blockenberg')),
                                el('input', { type: 'number', className: 'bkbg-bmi-input', value: weightLbs, min: a.weightMinLbs || 44, max: a.weightMaxLbs || 440,
                                    onChange: function(e) { setWeightLbs(Number(e.target.value)); },
                                    style: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '16px', boxSizing: 'border-box' }
                                })
                            ),
                            el('div', null,
                                el('label', { style: { display: 'block', color: a.labelColor || '#374151', fontSize: '13px', fontWeight: 600, marginBottom: '6px' } }, __('Height (ft)', 'blockenberg')),
                                el('input', { type: 'number', className: 'bkbg-bmi-input', value: heightFt, min: 3, max: 8,
                                    onChange: function(e) { setHeightFt(Number(e.target.value)); },
                                    style: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '16px', boxSizing: 'border-box' }
                                })
                            ),
                            el('div', null,
                                el('label', { style: { display: 'block', color: a.labelColor || '#374151', fontSize: '13px', fontWeight: 600, marginBottom: '6px' } }, __('Height (in)', 'blockenberg')),
                                el('input', { type: 'number', className: 'bkbg-bmi-input', value: heightIn, min: 0, max: 11,
                                    onChange: function(e) { setHeightIn(Number(e.target.value)); },
                                    style: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '16px', boxSizing: 'border-box' }
                                })
                            )
                        )
                ),

                /* Result */
                el('div', {
                    style: {
                        background: a.resultBg || '#f5f3ff',
                        border: '1.5px solid ' + (a.resultBorder || '#ede9fe'),
                        borderRadius: (a.cardRadius || 16) + 'px',
                        padding: '24px',
                        textAlign: 'center',
                    }
                },
                    /* Large BMI number */
                    el('div', { className: 'bkbg-bmi-number', style: { color: catColor, marginBottom: '4px' } }, bmi.toFixed(1)),
                    el('div', { style: { fontSize: '18px', fontWeight: 700, color: catColor, marginBottom: '16px' } }, catLabels[cat]),

                    /* Gauge bar */
                    a.showGauge && el('div', { style: { margin: '0 auto 16px', maxWidth: '380px' } },
                        el('div', { style: { position: 'relative', height: '16px', borderRadius: '99px', overflow: 'hidden', background: 'linear-gradient(to right, ' + (a.underweightColor || '#3b82f6') + ' 0%, ' + (a.normalColor || '#10b981') + ' 30%, ' + (a.overweightColor || '#f59e0b') + ' 60%, ' + (a.obeseColor || '#ef4444') + ' 100%)' } },
                            el('div', {
                                style: {
                                    position: 'absolute',
                                    left: pct + '%',
                                    top: '-2px',
                                    transform: 'translateX(-50%)',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    background: '#fff',
                                    border: '3px solid ' + catColor,
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                    transition: 'left 0.4s ease',
                                }
                            })
                        ),
                        el('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginTop: '4px' } },
                            el('span', null, '10'),
                            el('span', null, '18.5'),
                            el('span', null, '25'),
                            el('span', null, '30'),
                            el('span', null, '40+')
                        )
                    ),

                    /* Category legend */
                    a.showCategories && el('div', { style: { display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' } },
                        Object.entries(catColors).map(function(entry) {
                            return el('div', { key: entry[0], style: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' } },
                                el('span', { style: { width: '10px', height: '10px', borderRadius: '50%', background: entry[1], display: 'inline-block' } }),
                                el('span', null, catLabels[entry[0]])
                            );
                        })
                    ),

                    /* Ideal weight */
                    a.showIdealWeight && el('p', { style: { margin: '12px 0 0', color: '#6b7280', fontSize: '13px' } },
                        __('Ideal weight range: ', 'blockenberg'),
                        el('strong', null, system === 'metric' ? idealMin + '–' + idealMax + ' kg' : idealMin + '–' + idealMax + ' lbs')
                    ),

                    /* Interpretation */
                    a.showInterpretation && el('p', { style: { margin: '8px 0 0', color: catColor, fontWeight: 600, fontSize: '14px' } },
                        cat === 'underweight' ? __('Consider speaking with a healthcare professional about healthy weight gain.', 'blockenberg')
                      : cat === 'normal'      ? __('Great job! You are in a healthy weight range.', 'blockenberg')
                      : cat === 'overweight'  ? __('Small lifestyle changes can bring you into a healthy range.', 'blockenberg')
                      :                         __('Consult a healthcare professional for personalized guidance.', 'blockenberg')
                    )
                ),

                /* Disclaimer */
                a.showDisclaimer && el('p', { style: { color: '#9ca3af', fontSize: '12px', textAlign: 'center', marginTop: '16px', marginBottom: 0 } }, a.disclaimer)
            )
        );
    }

    registerBlockType('blockenberg/bmi-calculator', {
        edit: function(props) {
            var a   = props.attributes;
            var setAttr = props.setAttributes;

            var blockProps = useBlockProps({ style: Object.assign({ background: a.bgColor || undefined }, _tv(a.typoTitle, '--bkbg-bmi-title-'), _tv(a.typoBmi, '--bkbg-bmi-number-')) });

            return el(Fragment, null,
                el(InspectorControls, null,

                    /* Content */
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: a.showTitle, onChange: function(v) { setAttr({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showTitle && el(TextControl, { label: __('Title', 'blockenberg'), value: a.title, onChange: function(v) { setAttr({ title: v }); } }),
                        el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: function(v) { setAttr({ showSubtitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showSubtitle && el(TextControl, { label: __('Subtitle', 'blockenberg'), value: a.subtitle, onChange: function(v) { setAttr({ subtitle: v }); } }),
                        el(SelectControl, { label: __('Default Unit System', 'blockenberg'), value: a.unitSystem, options: [{ label: __('Metric (kg / cm)', 'blockenberg'), value: 'metric' }, { label: __('Imperial (lbs / ft-in)', 'blockenberg'), value: 'imperial' }], onChange: function(v) { setAttr({ unitSystem: v }); } }),
                        el(ToggleControl, { label: __('Show Unit Toggle', 'blockenberg'), checked: a.showUnitToggle, onChange: function(v) { setAttr({ showUnitToggle: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    /* Defaults metric */
                    el(PanelBody, { title: __('Metric Defaults', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Default Weight (kg)', 'blockenberg'), value: a.weightDefaultKg, min: 20, max: 200, onChange: function(v) { setAttr({ weightDefaultKg: v }); } }),
                        el(RangeControl, { label: __('Default Height (cm)', 'blockenberg'), value: a.heightDefaultCm, min: 100, max: 220, onChange: function(v) { setAttr({ heightDefaultCm: v }); } })
                    ),

                    /* Defaults imperial */
                    el(PanelBody, { title: __('Imperial Defaults', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Default Weight (lbs)', 'blockenberg'), value: a.weightDefaultLbs, min: 44, max: 440, onChange: function(v) { setAttr({ weightDefaultLbs: v }); } }),
                        el(RangeControl, { label: __('Default Height (ft)', 'blockenberg'), value: a.heightDefaultFt, min: 3, max: 8, onChange: function(v) { setAttr({ heightDefaultFt: v }); } }),
                        el(RangeControl, { label: __('Default Height (in)', 'blockenberg'), value: a.heightDefaultIn, min: 0, max: 11, onChange: function(v) { setAttr({ heightDefaultIn: v }); } })
                    ),

                    /* Display options */
                    el(PanelBody, { title: __('Display Options', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Gauge Bar', 'blockenberg'), checked: a.showGauge, onChange: function(v) { setAttr({ showGauge: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Category Legend', 'blockenberg'), checked: a.showCategories, onChange: function(v) { setAttr({ showCategories: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Interpretation Text', 'blockenberg'), checked: a.showInterpretation, onChange: function(v) { setAttr({ showInterpretation: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Ideal Weight Range', 'blockenberg'), checked: a.showIdealWeight, onChange: function(v) { setAttr({ showIdealWeight: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Disclaimer', 'blockenberg'), checked: a.showDisclaimer, onChange: function(v) { setAttr({ showDisclaimer: v }); }, __nextHasNoMarginBottom: true }),
                        a.showDisclaimer && el(TextareaControl, { label: __('Disclaimer Text', 'blockenberg'), value: a.disclaimer, onChange: function(v) { setAttr({ disclaimer: v }); } })
                    ),

                    /* Colors */
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Accent Color', 'blockenberg'),      value: a.accentColor,      onChange: function(v) { setAttr({ accentColor: v || '#6c3fb5' }); } },
                            { label: __('Underweight Color', 'blockenberg'), value: a.underweightColor, onChange: function(v) { setAttr({ underweightColor: v || '#3b82f6' }); } },
                            { label: __('Normal Color', 'blockenberg'),      value: a.normalColor,      onChange: function(v) { setAttr({ normalColor: v || '#10b981' }); } },
                            { label: __('Overweight Color', 'blockenberg'),  value: a.overweightColor,  onChange: function(v) { setAttr({ overweightColor: v || '#f59e0b' }); } },
                            { label: __('Obese Color', 'blockenberg'),       value: a.obeseColor,       onChange: function(v) { setAttr({ obeseColor: v || '#ef4444' }); } },
                            { label: __('Card Background', 'blockenberg'),   value: a.cardBg,           onChange: function(v) { setAttr({ cardBg: v || '#ffffff' }); } },
                            { label: __('Result Background', 'blockenberg'), value: a.resultBg,         onChange: function(v) { setAttr({ resultBg: v || '#f5f3ff' }); } },
                            { label: __('Section Background', 'blockenberg'), value: a.bgColor,         onChange: function(v) { setAttr({ bgColor: v || '' }); } },
                        ]
                    }),
                    /* Typography */
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function(v) { setAttr({ typoTitle: v }); } }),
                        el(getTypographyControl(), { label: __('BMI Number', 'blockenberg'), value: a.typoBmi, onChange: function(v) { setAttr({ typoBmi: v }); } })
                    ),
                    el(PanelBody, { title: __('Appearance', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Card Radius (px)', 'blockenberg'), value: a.cardRadius, min: 0, max: 40, onChange: function(v) { setAttr({ cardRadius: v }); } }),
                        el(RangeControl, { label: __('Button Radius (px)', 'blockenberg'), value: a.btnRadius, min: 0, max: 40, onChange: function(v) { setAttr({ btnRadius: v }); } }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, min: 400, max: 1200, onChange: function(v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 160, onChange: function(v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 160, onChange: function(v) { setAttr({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    el(BMIPreview, { attrs: a })
                )
            );
        },

        save: function(props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ style: { background: a.bgColor || undefined } });

            var opts = JSON.stringify({
                unitSystem:         a.unitSystem,
                showUnitToggle:     a.showUnitToggle,
                weightDefaultKg:    a.weightDefaultKg,
                weightMinKg:        a.weightMinKg,
                weightMaxKg:        a.weightMaxKg,
                heightDefaultCm:    a.heightDefaultCm,
                heightMinCm:        a.heightMinCm,
                heightMaxCm:        a.heightMaxCm,
                weightDefaultLbs:   a.weightDefaultLbs,
                weightMinLbs:       a.weightMinLbs,
                weightMaxLbs:       a.weightMaxLbs,
                heightDefaultFt:    a.heightDefaultFt,
                heightDefaultIn:    a.heightDefaultIn,
                showGauge:          a.showGauge,
                showCategories:     a.showCategories,
                showInterpretation: a.showInterpretation,
                showIdealWeight:    a.showIdealWeight,
                showDisclaimer:     a.showDisclaimer,
                disclaimer:         a.disclaimer,
                underweightColor:   a.underweightColor,
                normalColor:        a.normalColor,
                overweightColor:    a.overweightColor,
                obeseColor:         a.obeseColor,
                accentColor:        a.accentColor,
                cardBg:             a.cardBg,
                resultBg:           a.resultBg,
                resultBorder:       a.resultBorder,
                titleColor:         a.titleColor,
                subtitleColor:      a.subtitleColor,
                labelColor:         a.labelColor,
                titleSize:          a.titleSize,
                bmiSize:            a.bmiSize,
                cardRadius:         a.cardRadius,
                btnRadius:          a.btnRadius,
                maxWidth:           a.maxWidth,
                paddingTop:         a.paddingTop,
                paddingBottom:      a.paddingBottom,
                typoTitle:          a.typoTitle,
                typoBmi:            a.typoBmi,
            });

            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-bmi-app',
                    'data-opts': opts,
                },
                    a.showTitle && el('h2', { className: 'bkbg-bmi-title', style: { color: a.titleColor } }, a.title),
                    a.showSubtitle && el('p', { className: 'bkbg-bmi-subtitle', style: { color: a.subtitleColor } }, a.subtitle),
                    el('p', { className: 'bkbg-bmi-loading' }, __('Loading calculator…', 'blockenberg'))
                )
            );
        }
    });
}() );
