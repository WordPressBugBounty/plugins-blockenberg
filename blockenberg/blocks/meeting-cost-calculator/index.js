( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var useEffect          = wp.element.useEffect;
    var useRef             = wp.element.useRef;
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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var FREQ_MULT = { once: 1, daily: 250, weekly: 52, biweekly: 26, monthly: 12 };
    var FREQ_LABELS = { once: 'One-time', daily: 'Daily (250×/yr)', weekly: 'Weekly (52×/yr)', biweekly: 'Bi-weekly (26×/yr)', monthly: 'Monthly (12×/yr)' };
    var EQUIV = [
        { icon: '☕', label: 'Specialty coffees', price: 6 },
        { icon: '🍕', label: 'Pizza slices',      price: 4 },
        { icon: '📚', label: 'Books',             price: 18 },
        { icon: '🎬', label: 'Movie tickets',      price: 15 }
    ];

    function calcCost(attendees, rate, hours, minutes) {
        var durationHrs = hours + minutes / 60;
        return attendees * rate * durationHrs;
    }

    function fmt(n, cur) {
        return (cur||'$') + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function fmtShort(n, cur) {
        if (n >= 1000000) return (cur||'$') + (n/1000000).toFixed(2) + 'M';
        if (n >= 1000)    return (cur||'$') + (n/1000).toFixed(1) + 'K';
        return fmt(n, cur||'$');
    }

    function EquivCard(props) {
        var img = props.equiv; var count = props.cost / img.price;
        return el('div', { className: 'bkbg-mcc-equiv-card', style: { borderColor: props.color + '44', background: props.color + '10' } },
            el('div', { className: 'bkbg-mcc-equiv-icon' }, img.icon),
            el('div', { className: 'bkbg-mcc-equiv-val', style: { color: props.color } }, Math.round(count).toLocaleString()),
            el('div', { className: 'bkbg-mcc-equiv-label', style: { color: props.labelColor } }, img.label)
        );
    }

    function Editor(props) {
        var a = props.attributes, sa = props.setAttributes;
        var lc = a.labelColor || '#374151';
        var cur = a.currency || '$';

        var attendees = a.defaultAttendees || 5;
        var rate      = a.defaultHourlyRate || 75;
        var hours     = a.defaultHours || 1;
        var minutes   = a.defaultMinutes || 0;
        var freq      = a.defaultFrequency || 'weekly';

        var singleCost = calcCost(attendees, rate, hours, minutes);
        var annual     = singleCost * (FREQ_MULT[freq] || 1);
        var perMinute  = attendees * rate / 60;

        var blockProps = (function(p){
            var vf = getTypoCssVars() || function () { return {}; };
            p.style = Object.assign(p.style||{},
                vf(a.titleTypo,'--bkbg-mcc-tt-'),
                vf(a.subtitleTypo,'--bkbg-mcc-st-')
            ); return p;
        })(useBlockProps({ className: 'bkbg-mcc-app' }));

        return el(Fragment, null,
            el(InspectorControls, null,
                el(PanelBody, { title: __('Content'), initialOpen: true },
                    el(TextControl, { label: __('Title'),    value: a.title    || '', onChange: function(v){ sa({ title: v }); } }),
                    el(TextControl, { label: __('Subtitle'), value: a.subtitle || '', onChange: function(v){ sa({ subtitle: v }); } }),
                    el(TextControl, { label: __('Currency Symbol'), value: cur, onChange: function(v){ sa({ currency: v }); } }),
                    el(RangeControl, { label: __('Default Attendees'), value: a.defaultAttendees||5, min: 1, max: 100, onChange: function(v){ sa({ defaultAttendees: v }); } }),
                    el(RangeControl, { label: __('Default Hourly Rate'), value: a.defaultHourlyRate||75, min: 10, max: 500, step: 5, onChange: function(v){ sa({ defaultHourlyRate: v }); } }),
                    el(RangeControl, { label: __('Default Duration (hours)'), value: a.defaultHours||1, min: 0, max: 8, onChange: function(v){ sa({ defaultHours: v }); } }),
                    el(SelectControl, {
                        label: __('Default Duration (minutes)'),
                        value: String(a.defaultMinutes||0),
                        options: [0,15,30,45].map(function(m){ return { value: String(m), label: m + ' min' }; }),
                        onChange: function(v){ sa({ defaultMinutes: parseInt(v)||0 }); }
                    }),
                    el(SelectControl, {
                        label: __('Default Frequency'),
                        value: a.defaultFrequency || 'weekly',
                        options: Object.keys(FREQ_LABELS).map(function(k){ return { value: k, label: FREQ_LABELS[k] }; }),
                        onChange: function(v){ sa({ defaultFrequency: v }); }
                    }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Recurring Projections'), checked: a.showRecurring !== false, onChange: function(v){ sa({ showRecurring: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Fun Equivalents'), checked: a.showEquivalents !== false, onChange: function(v){ sa({ showEquivalents: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Live Timer'), checked: a.showTimer !== false, onChange: function(v){ sa({ showTimer: v }); } })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: __('Title','blockenberg'), value: a.titleTypo || {}, onChange: function(v){ sa({ titleTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: __('Subtitle','blockenberg'), value: a.subtitleTypo || {}, onChange: function(v){ sa({ subtitleTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.accentColor    ||'#f43f5e', onChange: function(v){ sa({ accentColor: v }); },    label: 'Accent / Cost' },
                        { value: a.recurringColor ||'#7c3aed', onChange: function(v){ sa({ recurringColor: v }); }, label: 'Recurring' },
                        { value: a.sectionBg      ||'#fff1f2', onChange: function(v){ sa({ sectionBg: v }); },      label: 'Section Background' },
                        { value: a.cardBg         ||'#ffffff', onChange: function(v){ sa({ cardBg: v }); },         label: 'Card Background' },
                        { value: a.inputBg        ||'#f9fafb', onChange: function(v){ sa({ inputBg: v }); },        label: 'Input Background' },
                        { value: a.resultBg       ||'#ffe4e6', onChange: function(v){ sa({ resultBg: v }); },       label: 'Result Background' },
                        { value: a.titleColor     ||'#111827', onChange: function(v){ sa({ titleColor: v }); },     label: 'Title' },
                        { value: a.subtitleColor  ||'#6b7280', onChange: function(v){ sa({ subtitleColor: v }); },  label: 'Subtitle' },
                        { value: a.labelColor     ||'#374151', onChange: function(v){ sa({ labelColor: v }); },     label: 'Labels' }
                    ]
                }),
                el(PanelBody, { title: __('Sizing'), initialOpen: false },
                    el(RangeControl, { label: __('Max Width (px)'), value: a.contentMaxWidth||680, min: 360, max: 1400, step: 10, onChange: function(v){ sa({ contentMaxWidth: v }); } })
                )
            ),

            el('div', blockProps,
                el('div', { className: 'bkbg-mcc-card', style: { background: a.cardBg||'#fff', maxWidth:(a.contentMaxWidth||680)+'px' } },
                    el('h2', { className: 'bkbg-mcc-title', style: { color: a.titleColor||'#111827' } },
                        a.title || 'Meeting Cost Calculator'
                    ),
                    el('p', { className: 'bkbg-mcc-subtitle', style: { color: a.subtitleColor||'#6b7280' } },
                        a.subtitle || 'Discover the true cost of your meetings in real time'
                    ),

                    // Inputs
                    el('div', { className: 'bkbg-mcc-inputs', style: { background: a.sectionBg||'#fff1f2' } },
                        el('div', { className: 'bkbg-mcc-field' },
                            el('div', { className: 'bkbg-mcc-field-header' },
                                el('label', { className: 'bkbg-mcc-label', style: { color: lc } }, '👥 Attendees'),
                                el('span', { className: 'bkbg-mcc-field-val', style: { color: a.accentColor||'#f43f5e' } }, attendees)
                            ),
                            el('input', { type: 'range', className: 'bkbg-mcc-slider', min: 1, max: 100, value: attendees,
                                style: { accentColor: a.accentColor||'#f43f5e' },
                                onChange: function(e){ sa({ defaultAttendees: parseInt(e.target.value)||1 }); }
                            })
                        ),
                        el('div', { className: 'bkbg-mcc-field' },
                            el('div', { className: 'bkbg-mcc-field-header' },
                                el('label', { className: 'bkbg-mcc-label', style: { color: lc } }, '💰 Avg Hourly Rate'),
                                el('span', { className: 'bkbg-mcc-field-val', style: { color: a.accentColor||'#f43f5e' } }, cur + rate + '/hr')
                            ),
                            el('input', { type: 'range', className: 'bkbg-mcc-slider', min: 10, max: 500, step: 5, value: rate,
                                style: { accentColor: a.accentColor||'#f43f5e' },
                                onChange: function(e){ sa({ defaultHourlyRate: parseFloat(e.target.value)||75 }); }
                            })
                        ),
                        el('div', { className: 'bkbg-mcc-row' },
                            el('div', { className: 'bkbg-mcc-field' },
                                el('label', { className: 'bkbg-mcc-label', style: { color: lc } }, '⏱ Hours'),
                                el('select', { className: 'bkbg-mcc-select', style: { background: a.inputBg||'#f9fafb' },
                                    value: hours,
                                    onChange: function(e){ sa({ defaultHours: parseInt(e.target.value)||0 }); }
                                },
                                    [0,1,2,3,4,5,6,7,8].map(function(h){ return el('option', { key: h, value: h }, h + 'h'); })
                                )
                            ),
                            el('div', { className: 'bkbg-mcc-field' },
                                el('label', { className: 'bkbg-mcc-label', style: { color: lc } }, '⏱ Minutes'),
                                el('select', { className: 'bkbg-mcc-select', style: { background: a.inputBg||'#f9fafb' },
                                    value: minutes,
                                    onChange: function(e){ sa({ defaultMinutes: parseInt(e.target.value)||0 }); }
                                },
                                    [0,15,30,45].map(function(m){ return el('option', { key: m, value: m }, m + 'm'); })
                                )
                            ),
                            el('div', { className: 'bkbg-mcc-field' },
                                el('label', { className: 'bkbg-mcc-label', style: { color: lc } }, '🔄 Frequency'),
                                el('select', { className: 'bkbg-mcc-select', style: { background: a.inputBg||'#f9fafb' },
                                    value: freq,
                                    onChange: function(e){ sa({ defaultFrequency: e.target.value }); }
                                },
                                    Object.keys(FREQ_LABELS).map(function(k){ return el('option', { key: k, value: k }, FREQ_LABELS[k]); })
                                )
                            )
                        )
                    ),

                    // Result hero
                    el('div', { className: 'bkbg-mcc-result', style: { background: a.resultBg||'#ffe4e6' } },
                        el('div', { className: 'bkbg-mcc-result-label', style: { color: lc } }, '💸 This meeting costs'),
                        el('div', { className: 'bkbg-mcc-result-val', style: { color: a.accentColor||'#f43f5e' } }, fmt(singleCost, cur)),
                        el('div', { className: 'bkbg-mcc-result-sub', style: { color: '#9ca3af' } }, fmt(perMinute, cur) + ' per minute')
                    ),

                    // Recurring
                    a.showRecurring !== false && freq !== 'once' && el('div', { className: 'bkbg-mcc-recurring', style: { border: '2px solid ' + (a.recurringColor||'#7c3aed') + '33', background: (a.recurringColor||'#7c3aed') + '0d' } },
                        el('div', { className: 'bkbg-mcc-rec-title', style: { color: lc } }, '📅 Annual Cost Projection (' + FREQ_LABELS[freq] + ')'),
                        el('div', { className: 'bkbg-mcc-rec-val', style: { color: a.recurringColor||'#7c3aed' } }, fmtShort(annual, cur)),
                        el('div', { className: 'bkbg-mcc-rec-sub', style: { color: '#9ca3af' } }, (FREQ_MULT[freq]||1) + ' meetings × ' + fmt(singleCost, cur) + ' each')
                    ),

                    // Fun equivalents
                    a.showEquivalents !== false && el('div', { className: 'bkbg-mcc-equivs' },
                        el('div', { className: 'bkbg-mcc-equiv-title', style: { color: lc } }, '💡 This meeting is equivalent to…'),
                        el('div', { className: 'bkbg-mcc-equiv-grid' },
                            EQUIV.map(function(eq) {
                                return el(EquivCard, { key: eq.label, equiv: eq, cost: singleCost, color: a.accentColor||'#f43f5e', labelColor: lc });
                            })
                        )
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/meeting-cost-calculator', {
        edit: Editor,
        save: function(props) {
            var a = props.attributes;
            var v = (typeof window.bkbgTypoCssVars === 'function') ? window.bkbgTypoCssVars : function () { return {}; };
            var s = Object.assign({},
                v(a.titleTypo,'--bkbg-mcc-tt-'),
                v(a.subtitleTypo,'--bkbg-mcc-st-')
            );
            return el('div', (function(p){p.style=Object.assign(p.style||{},s);return p;})(useBlockProps.save()),
                el('div', { className: 'bkbg-mcc-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
