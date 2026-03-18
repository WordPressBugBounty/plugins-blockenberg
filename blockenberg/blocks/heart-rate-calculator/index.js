( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var __                 = wp.i18n.__;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var RichText           = wp.blockEditor.RichText;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;
    var ToggleControl      = wp.components.ToggleControl;
    var TextControl        = wp.components.TextControl;

    var FORMULAS = {
        fox:    { label: 'Fox (Classic): 220 − age',      fn: function(a){ return 220 - a; } },
        tanaka: { label: 'Tanaka: 208 − (0.7 × age)',     fn: function(a){ return Math.round(208 - 0.7 * a); } },
        gellish:{ label: 'Gellish: 207 − (0.7 × age)',    fn: function(a){ return Math.round(207 - 0.7 * a); } }
    };

    var ZONES = [
        { num: 1, name: 'Recovery',      icon: '🚶', pctLo: 50, pctHi: 60, purpose: 'Rest & recovery, improve base fitness' },
        { num: 2, name: 'Fat Burn',       icon: '🔥', pctLo: 60, pctHi: 70, purpose: 'Fat burning & aerobic base endurance' },
        { num: 3, name: 'Aerobic',        icon: '🏃', pctLo: 70, pctHi: 80, purpose: 'Improve cardiovascular efficiency' },
        { num: 4, name: 'Threshold',      icon: '⚡', pctLo: 80, pctHi: 90, purpose: 'Increase speed and performance' },
        { num: 5, name: 'Max Effort',     icon: '🚀', pctLo: 90, pctHi: 100, purpose: 'Peak power — short intense bursts' }
    ];

    var ZONE_COLOR_KEYS = ['z1Color','z2Color','z3Color','z4Color','z5Color'];

    /* ── Typography lazy getters ──────────────────────────────── */
    var _ttTC, _ttTV;
    function _tc() { return _ttTC || (_ttTC = window.bkbgTypographyControl); }
    function _tv() { return _ttTV || (_ttTV = window.bkbgTypoCssVars); }

    function calcZones(age, formulaKey) {
        var maxHR = FORMULAS[formulaKey] ? FORMULAS[formulaKey].fn(age) : 220 - age;
        return { maxHR: maxHR, zones: ZONES.map(function(z) {
            return { num: z.num, name: z.name, icon: z.icon, purpose: z.purpose,
                lo: Math.round(maxHR * z.pctLo / 100),
                hi: Math.round(maxHR * z.pctHi / 100),
                pctLo: z.pctLo, pctHi: z.pctHi };
        })};
    }

    function ZoneRow(props) {
        var z = props.zone; var color = props.color; var showPurpose = props.showPurpose; var showIcon = props.showIcon;
        return el('div', { className: 'bkbg-hrc-zone-row', style: { borderLeft: '6px solid ' + color, background: color + '18' } },
            el('div', { className: 'bkbg-hrc-zone-left' },
                el('div', { className: 'bkbg-hrc-zone-badge', style: { background: color, color: '#fff' } },
                    (showIcon ? z.icon + ' ' : '') + 'Zone ' + z.num
                ),
                el('div', { className: 'bkbg-hrc-zone-name' }, z.name)
            ),
            el('div', { className: 'bkbg-hrc-zone-center' },
                showPurpose && el('div', { className: 'bkbg-hrc-zone-purpose' }, z.purpose)
            ),
            el('div', { className: 'bkbg-hrc-zone-right' },
                el('div', { className: 'bkbg-hrc-zone-bpm', style: { color: color } },
                    z.lo + ' – ' + z.hi
                ),
                el('div', { className: 'bkbg-hrc-zone-pct' }, z.pctLo + '–' + z.pctHi + '% max HR')
            )
        );
    }

    function Editor(props) {
        var attributes = props.attributes;
        var setAttributes = props.setAttributes;
        var a = attributes;

        var age     = useState(a.defaultAge || 30);
        var ageVal  = age[0]; var setAge = age[1];
        var formula = useState(a.defaultFormula || 'fox');
        var fml     = formula[0]; var setFml = formula[1];

        var data     = calcZones(ageVal, fml);
        var maxHR    = data.maxHR;
        var zones    = data.zones;
        var zColors  = [a.z1Color||'#6ee7b7',a.z2Color||'#34d399',a.z3Color||'#fbbf24',a.z4Color||'#f97316',a.z5Color||'#ef4444'];

        var blockProps = useBlockProps({ className: 'bkbg-hrc-app', style: Object.assign({}, _tv() && _tv()(a.typoTitle, '--bkbg-hrc-tt-'), _tv() && _tv()(a.typoSubtitle, '--bkbg-hrc-st-')) });

        return el(Fragment, null,
            el(InspectorControls, null,

                el(PanelBody, { title: __('Content'), initialOpen: true },
                    el(TextControl, { label: __('Title'), value: a.title || '', onChange: function(v){ setAttributes({ title: v }); } }),
                    el(TextControl, { label: __('Subtitle'), value: a.subtitle || '', onChange: function(v){ setAttributes({ subtitle: v }); } }),
                    el(RangeControl, { label: __('Default Age'), value: a.defaultAge || 30, min: 18, max: 80, onChange: function(v){ setAttributes({ defaultAge: v }); setAge(v); } }),
                    el(SelectControl, {
                        label: __('Default Formula'),
                        value: a.defaultFormula || 'fox',
                        options: [
                            { value: 'fox',     label: 'Fox (220 − age)' },
                            { value: 'tanaka',  label: 'Tanaka (208 − 0.7×age)' },
                            { value: 'gellish', label: 'Gellish (207 − 0.7×age)' }
                        ],
                        onChange: function(v){ setAttributes({ defaultFormula: v }); setFml(v); }
                    }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Zone Icon'), checked: a.showZoneIcon !== false, onChange: function(v){ setAttributes({ showZoneIcon: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Zone Purpose'), checked: a.showPurpose !== false, onChange: function(v){ setAttributes({ showPurpose: v }); } })
                ),

                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    _tc() && _tc()({ label: __('Title','blockenberg'), value: a.typoTitle, onChange: function(v){ setAttributes({ typoTitle: v }); } }),
                    _tc() && _tc()({ label: __('Subtitle','blockenberg'), value: a.typoSubtitle, onChange: function(v){ setAttributes({ typoSubtitle: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Zone Colors'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.z1Color||'#6ee7b7', onChange: function(v){ setAttributes({ z1Color: v }); }, label: 'Zone 1 — Recovery' },
                        { value: a.z2Color||'#34d399', onChange: function(v){ setAttributes({ z2Color: v }); }, label: 'Zone 2 — Fat Burn' },
                        { value: a.z3Color||'#fbbf24', onChange: function(v){ setAttributes({ z3Color: v }); }, label: 'Zone 3 — Aerobic' },
                        { value: a.z4Color||'#f97316', onChange: function(v){ setAttributes({ z4Color: v }); }, label: 'Zone 4 — Threshold' },
                        { value: a.z5Color||'#ef4444', onChange: function(v){ setAttributes({ z5Color: v }); }, label: 'Zone 5 — Max Effort' }
                    ]
                }),

                el(PanelColorSettings, {
                    title: __('Theme Colors'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.accentColor   ||'#ef4444', onChange: function(v){ setAttributes({ accentColor:    v }); }, label: 'Accent' },
                        { value: a.sectionBg     ||'#fff7f7', onChange: function(v){ setAttributes({ sectionBg:      v }); }, label: 'Section Background' },
                        { value: a.cardBg        ||'#ffffff', onChange: function(v){ setAttributes({ cardBg:         v }); }, label: 'Card Background' },
                        { value: a.inputBg       ||'#f9fafb', onChange: function(v){ setAttributes({ inputBg:        v }); }, label: 'Input Background' },
                        { value: a.titleColor    ||'#111827', onChange: function(v){ setAttributes({ titleColor:     v }); }, label: 'Title Color' },
                        { value: a.subtitleColor ||'#6b7280', onChange: function(v){ setAttributes({ subtitleColor:  v }); }, label: 'Subtitle Color' },
                        { value: a.labelColor    ||'#374151', onChange: function(v){ setAttributes({ labelColor:     v }); }, label: 'Label Color' }
                    ]
                }),

                el(PanelBody, { title: __('Sizing'), initialOpen: false },
                    el(RangeControl, { label: __('Max Width (px)'), value: a.contentMaxWidth || 760, min: 400, max: 1400, step: 10, onChange: function(v){ setAttributes({ contentMaxWidth: v }); } })
                )
            ),

            el('div', blockProps,
                el('div', { className: 'bkbg-hrc-card', style: { background: a.cardBg || '#ffffff', maxWidth: (a.contentMaxWidth || 760) + 'px' } },
                    el('h2', { className: 'bkbg-hrc-title', style: { color: a.titleColor || '#111827' } },
                        a.title || 'Heart Rate Zone Calculator'
                    ),
                    el('p', { className: 'bkbg-hrc-subtitle', style: { color: a.subtitleColor || '#6b7280' } },
                        a.subtitle || 'Find your personalized training zones based on your age'
                    ),

                    // Controls
                    el('div', { className: 'bkbg-hrc-controls', style: { background: a.sectionBg || '#fff7f7' } },
                        el('div', { className: 'bkbg-hrc-control-group' },
                            el('label', { className: 'bkbg-hrc-label', style: { color: a.labelColor || '#374151' } },
                                '🎂 Your Age: ',
                                el('strong', { style: { color: a.accentColor || '#ef4444' } }, ageVal)
                            ),
                            el('input', {
                                type: 'range', min: 18, max: 80, value: ageVal,
                                className: 'bkbg-hrc-slider',
                                style: { accentColor: a.accentColor || '#ef4444' },
                                onChange: function(e){ setAge(parseInt(e.target.value)); }
                            })
                        ),
                        el('div', { className: 'bkbg-hrc-control-group' },
                            el('label', { className: 'bkbg-hrc-label', style: { color: a.labelColor || '#374151' } }, '📐 Formula'),
                            el('select', {
                                className: 'bkbg-hrc-select',
                                style: { background: a.inputBg || '#f9fafb' },
                                value: fml,
                                onChange: function(e){ setFml(e.target.value); }
                            },
                                el('option', { value: 'fox' },     'Fox: 220 − age'),
                                el('option', { value: 'tanaka' },  'Tanaka: 208 − 0.7×age'),
                                el('option', { value: 'gellish' }, 'Gellish: 207 − 0.7×age')
                            )
                        )
                    ),

                    // Max HR Display
                    el('div', { className: 'bkbg-hrc-maxhr', style: { background: (a.accentColor || '#ef4444') + '12', borderColor: a.accentColor || '#ef4444' } },
                        el('div', { className: 'bkbg-hrc-maxhr-label', style: { color: a.labelColor || '#374151' } }, '❤️ Maximum Heart Rate'),
                        el('div', { className: 'bkbg-hrc-maxhr-val', style: { color: a.accentColor || '#ef4444' } }, maxHR),
                        el('div', { className: 'bkbg-hrc-maxhr-unit', style: { color: a.subtitleColor || '#6b7280' } }, 'beats per minute')
                    ),

                    // Zone rows
                    el('div', { className: 'bkbg-hrc-zones' },
                        zones.map(function(z, i) {
                            return el(ZoneRow, { key: z.num, zone: z, color: zColors[i], showPurpose: a.showPurpose !== false, showIcon: a.showZoneIcon !== false });
                        })
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/heart-rate-calculator', {
        edit: Editor,
        save: function(props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-hrc-app',
                    'data-opts': JSON.stringify(a)
                })
            );
        }
    });
}() );
