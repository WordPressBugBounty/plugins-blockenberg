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

    var _tc; function getTC() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTV() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var CYCLE_MIN = 90; // minutes

    function pad2(n) { return String(n).padStart(2, '0'); }

    function addMinutes(h, m, mins) {
        var total = h * 60 + m + mins;
        total = ((total % 1440) + 1440) % 1440;
        return { h: Math.floor(total / 60), m: total % 60 };
    }
    function subMinutes(h, m, mins) {
        return addMinutes(h, m, -mins);
    }

    function fmt12(h, m) {
        var ampm = h < 12 ? 'AM' : 'PM';
        var hh   = h % 12 || 12;
        return hh + ':' + pad2(m) + ' ' + ampm;
    }

    // mode=wake: user sets bedtime → output wake times
    // mode=sleep: user sets wake time → output bedtimes
    function calcTimes(mode, h, m, onsetDelay, cMin, cMax) {
        var results = [];
        for (var c = cMax; c >= cMin; c--) {
            var totalMins = onsetDelay + c * CYCLE_MIN;
            var t;
            if (mode === 'wake') {
                t = addMinutes(h, m, totalMins);
            } else {
                t = subMinutes(h, m, totalMins);
            }
            results.push({ cycles: c, h: t.h, m: t.m, totalSleep: c * CYCLE_MIN });
        }
        return results;
    }

    function cycleQuality(c) {
        if (c >= 6) return 'best';
        if (c >= 5) return 'good';
        return 'ok';
    }

    function SleepPreview(props) {
        var a  = props.attributes;
        var sa = props.setAttributes;

        var nowH = new Date().getHours();
        var nowM = new Date().getMinutes();

        var _mode = useState(a.mode); var mode = _mode[0]; var setMode = _mode[1];
        var _h    = useState(nowH);   var selH = _h[0];   var setH = _h[1];
        var _m    = useState(Math.floor(nowM / 5) * 5); var selM = _m[0]; var setM = _m[1];

        var results = calcTimes(mode, selH, selM, a.onsetDelay, a.cyclesMin, a.cyclesMax);

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

        function qualColor(q) {
            if (q === 'best') return a.bestColor;
            if (q === 'good') return a.goodColor;
            return a.okColor;
        }

        // Hour options 0-23
        var hourOpts = [];
        for (var i = 0; i < 24; i++) { hourOpts.push({ label: fmt12(i, 0).replace(/:\d\d /, ' '), value: String(i) }); }
        // Minute options 0-55 step 5
        var minOpts = [];
        for (var j = 0; j < 60; j += 5) { minOpts.push({ label: pad2(j), value: String(j) }); }

        return el('div', { className: 'bkbg-sleep-editor', style: containerStyle },
            el('div', { style: cardStyle },

                // Title / subtitle
                (a.showTitle || a.showSubtitle) && el('div', { style: { marginBottom: '20px' } },
                    a.showTitle && el('div', {
                        className: 'bkbg-sleep-title',
                        style: { color: a.titleColor, marginBottom: '6px', contentEditable: true, suppressContentEditableWarning: true, outline: 'none' },
                        onBlur: function(e) { sa({ title: e.target.innerText }); },
                        dangerouslySetInnerHTML: { __html: a.title }
                    }),
                    a.showSubtitle && el('div', {
                        className: 'bkbg-sleep-subtitle',
                        style: { color: a.subtitleColor, contentEditable: true, suppressContentEditableWarning: true, outline: 'none' },
                        onBlur: function(e) { sa({ subtitle: e.target.innerText }); },
                        dangerouslySetInnerHTML: { __html: a.subtitle }
                    })
                ),

                // Mode tabs
                el('div', { style: { display: 'flex', gap: '10px', marginBottom: '24px' } },
                    el('button', {
                        className: 'bkbg-sleep-mode-btn' + (mode === 'wake' ? ' active' : ''),
                        style: { flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid ' + (mode === 'wake' ? a.accentColor : '#e5e7eb'), background: mode === 'wake' ? a.accentColor : 'transparent', color: mode === 'wake' ? '#fff' : a.accentColor, fontWeight: 700, fontSize: '14px', cursor: 'pointer' },
                        onClick: function() { setMode('wake'); }
                    }, '🌙 I want to wake up at…'),
                    el('button', {
                        className: 'bkbg-sleep-mode-btn' + (mode === 'sleep' ? ' active' : ''),
                        style: { flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid ' + (mode === 'sleep' ? a.accentColor : '#e5e7eb'), background: mode === 'sleep' ? a.accentColor : 'transparent', color: mode === 'sleep' ? '#fff' : a.accentColor, fontWeight: 700, fontSize: '14px', cursor: 'pointer' },
                        onClick: function() { setMode('sleep'); }
                    }, '⏰ I need to wake up at…')
                ),

                // Time picker
                el('div', { style: { marginBottom: '24px' } },
                    el('div', { style: { fontSize: '13px', fontWeight: 600, color: a.labelColor, marginBottom: '8px' } },
                        mode === 'wake' ? 'I plan to go to bed at:' : 'I need to wake up at:'
                    ),
                    el('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } },
                        el(SelectControl, {
                            value: String(selH),
                            options: hourOpts,
                            onChange: function(v) { setH(parseInt(v, 10)); },
                            style: { fontSize: '18px', padding: '10px' }
                        }),
                        el('span', { style: { fontSize: '22px', fontWeight: 700, color: a.labelColor } }, ':'),
                        el(SelectControl, {
                            value: String(selM),
                            options: minOpts,
                            onChange: function(v) { setM(parseInt(v, 10)); },
                            style: { fontSize: '18px', padding: '10px' }
                        })
                    )
                ),

                // Results
                el('div', { className: 'bkbg-sleep-results', style: { marginBottom: a.showTips ? '20px' : '0' } },
                    el('div', { style: { fontSize: '13px', fontWeight: 600, color: a.labelColor, marginBottom: '12px' } },
                        mode === 'wake' ? 'Set your alarm for one of these times:' : 'Try to fall asleep at one of these times:'
                    ),
                    results.map(function(r, i) {
                        var q = cycleQuality(r.cycles);
                        var borderL = i === 0 ? '4px solid ' + qualColor(q) : '4px solid transparent';
                        var totalH  = Math.floor(r.totalSleep / 60);
                        var totalM  = r.totalSleep % 60;
                        return el('div', {
                            key: r.cycles,
                            className: 'bkbg-sleep-result-row',
                            style: {
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 18px', marginBottom: '8px',
                                background: a.resultBg, border: '1.5px solid ' + a.resultBorder,
                                borderLeft: borderL,
                                borderRadius: a.cardRadius + 'px'
                            }
                        },
                            el('div', null,
                                el('div', { style: { fontSize: a.timeSize + 'px', fontWeight: 800, color: qualColor(q), lineHeight: 1.1 } }, fmt12(r.h, r.m)),
                                el('div', { style: { fontSize: '12px', color: a.labelColor, marginTop: '2px' } },
                                    totalH + 'h ' + (totalM ? totalM + 'm ' : '') + 'of sleep'
                                )
                            ),
                            el('div', { style: { textAlign: 'right' } },
                                el('div', { style: { fontWeight: 700, fontSize: '12px', background: a.cycleTagBg, color: a.cycleTagColor, padding: '3px 10px', borderRadius: '100px', marginBottom: '3px' } },
                                    r.cycles + ' cycles'
                                ),
                                i === 0 && el('div', { style: { fontSize: '11px', color: qualColor(q), fontWeight: 600 } }, '★ Best')
                            )
                        ) })
                ),

                // Tips
                a.showTips && el('div', { style: {
                    background: a.tipBg, color: a.tipColor,
                    borderRadius: a.cardRadius + 'px',
                    padding: '14px 18px', fontSize: '13px', lineHeight: 1.6
                }},
                    el('strong', null, '💡 Tip: '),
                    'Sleep comes in 90-minute cycles. Waking at the end of a cycle helps you feel more refreshed. Allow ' + a.onsetDelay + ' minutes to fall asleep.'
                )
            )
        );
    }

    registerBlockType('blockenberg/sleep-calculator', {
        edit: function(props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var fn = getTV();
                var s = {};
                if (fn) {
                    Object.assign(s, fn(a.titleTypo || {}, '--bkslp-tt-'));
                    Object.assign(s, fn(a.subtitleTypo || {}, '--bkslp-st-'));
                }
                return { style: s };
            })());

            var colorSettings = [
                { value: a.accentColor,   onChange: function(v) { set({ accentColor: v }); },   label: 'Accent / Mode Tabs' },
                { value: a.cardBg,        onChange: function(v) { set({ cardBg: v }); },         label: 'Card Background' },
                { value: a.resultBg,      onChange: function(v) { set({ resultBg: v }); },       label: 'Result Row Background' },
                { value: a.resultBorder,  onChange: function(v) { set({ resultBorder: v }); },   label: 'Result Row Border' },
                { value: a.bestColor,     onChange: function(v) { set({ bestColor: v }); },      label: 'Best Time Color (6 cycles)' },
                { value: a.goodColor,     onChange: function(v) { set({ goodColor: v }); },      label: 'Good Time Color (5 cycles)' },
                { value: a.okColor,       onChange: function(v) { set({ okColor: v }); },        label: 'OK Time Color (4 cycles)' },
                { value: a.cycleTagBg,    onChange: function(v) { set({ cycleTagBg: v }); },     label: 'Cycle Tag Background' },
                { value: a.cycleTagColor, onChange: function(v) { set({ cycleTagColor: v }); },  label: 'Cycle Tag Text' },
                { value: a.tipBg,         onChange: function(v) { set({ tipBg: v }); },          label: 'Tip Background' },
                { value: a.tipColor,      onChange: function(v) { set({ tipColor: v }); },       label: 'Tip Text' },
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

                    el(PanelBody, { title: 'Sleep Settings', initialOpen: true },
                        el(SelectControl, {
                            label: 'Default Mode',
                            value: a.mode,
                            options: [
                                { label: 'Find wake time (set bedtime)',  value: 'wake' },
                                { label: 'Find bedtime (set wake time)',  value: 'sleep' }
                            ],
                            onChange: function(v) { set({ mode: v }); }
                        }),
                        el(RangeControl, { label: 'Sleep Onset Delay (minutes)', value: a.onsetDelay, min: 0, max: 60, step: 1, onChange: function(v) { set({ onsetDelay: v }); } }),
                        el(RangeControl, { label: 'Minimum Cycles to Show', value: a.cyclesMin, min: 2, max: 5, step: 1, onChange: function(v) { set({ cyclesMin: Math.min(v, a.cyclesMax) }); } }),
                        el(RangeControl, { label: 'Maximum Cycles to Show', value: a.cyclesMax, min: 4, max: 8, step: 1, onChange: function(v) { set({ cyclesMax: Math.max(v, a.cyclesMin) }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Sleep Tips', checked: a.showTips, onChange: function(v) { set({ showTips: v }); } })
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el( getTC(), { label: __( 'Title', 'blockenberg' ), value: a.titleTypo || {}, onChange: function( v ) { set({ titleTypo: v }); } } ),
                        el( getTC(), { label: __( 'Subtitle', 'blockenberg' ), value: a.subtitleTypo || {}, onChange: function( v ) { set({ subtitleTypo: v }); } } ),
                    ),
el(PanelColorSettings, { title: 'Colors', initialOpen: false, colorSettings: colorSettings }),

                    el(PanelBody, { title: 'Sizing & Layout', initialOpen: false },
                        el(RangeControl, { label: 'Time Display Size', value: a.timeSize, min: 20, max: 72, step: 2, onChange: function(v) { set({ timeSize: v }); } }),
                        el(RangeControl, { label: 'Card Border Radius', value: a.cardRadius, min: 0, max: 40, step: 1, onChange: function(v) { set({ cardRadius: v }); } }),
                        el(RangeControl, { label: 'Input Border Radius', value: a.inputRadius, min: 0, max: 24, step: 1, onChange: function(v) { set({ inputRadius: v }); } }),
                        el(RangeControl, { label: 'Max Width (px)', value: a.maxWidth, min: 300, max: 900, step: 10, onChange: function(v) { set({ maxWidth: v }); } }),
                        el(RangeControl, { label: 'Padding Top (px)', value: a.paddingTop, min: 0, max: 160, step: 4, onChange: function(v) { set({ paddingTop: v }); } }),
                        el(RangeControl, { label: 'Padding Bottom (px)', value: a.paddingBottom, min: 0, max: 160, step: 4, onChange: function(v) { set({ paddingBottom: v }); } })
                    )
                ),
                el('div', blockProps,
                    el(SleepPreview, { attributes: a, setAttributes: set })
                )
            );
        },
        save: function(props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save();
            return el('div', blockProps,
                el('div', { className: 'bkbg-sleep-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
