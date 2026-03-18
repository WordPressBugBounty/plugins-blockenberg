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
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    /* ── Calculation helpers ─────────────────────────────────────────────── */
    function pad2(n) { return String(Math.floor(n)).padStart(2, '0'); }
    function secsToHMS(s) {
        s = Math.round(Math.max(0, s));
        var h = Math.floor(s / 3600); var m = Math.floor((s % 3600) / 60); var sec = s % 60;
        return (h > 0 ? h + ':' : '') + (h > 0 ? pad2(m) : m) + ':' + pad2(sec);
    }
    function secsToPace(s) {
        var m = Math.floor(s / 60); var sec = Math.round(s % 60);
        return m + ':' + pad2(sec);
    }
    // pace string "M:SS" -> seconds
    function paceToSecs(str) {
        var parts = String(str).split(':');
        if (parts.length < 2) return parseFloat(parts[0]) * 60 || 0;
        return parseInt(parts[0],10) * 60 + parseInt(parts[1],10);
    }
    // time "H:MM:SS" or "M:SS" -> seconds
    function timeToSecs(str) {
        var parts = String(str).split(':');
        if (parts.length === 3) return parseInt(parts[0])*3600 + parseInt(parts[1])*60 + parseInt(parts[2]);
        if (parts.length === 2) return parseInt(parts[0])*60   + parseInt(parts[1]);
        return parseFloat(str) * 60 || 0;
    }

    var KM_PER_MILE = 1.60934;

    /* find pace (min/unit) given distance (units) and time (secs) */
    function findPace(dist, secs) {
        if (dist <= 0) return null;
        return secs / dist; // secs per unit
    }
    /* find total time given dist and pace (secs/unit) */
    function findTime(dist, paceSecs) {
        return dist * paceSecs;
    }
    /* find distance given time and pace */
    function findDist(timeSecs, paceSecs) {
        if (paceSecs <= 0) return null;
        return timeSecs / paceSecs;
    }

    function PacePreview(props) {
        var a  = props.attributes;
        var sa = props.setAttributes;

        var _mode = useState(a.defaultMode || 'find_pace'); var mode = _mode[0]; var setMode = _mode[1];
        var _unit = useState(a.defaultUnit || 'km');         var unit = _unit[0]; var setUnit = _unit[1];
        // inputs
        var _dist  = useState('10');     var dist = _dist[0];  var setDist = _dist[1];
        var _time  = useState('1:00:00');var time = _time[0];  var setTime = _time[1];
        var _pace  = useState('6:00');   var pace = _pace[0];  var setPace = _pace[1];

        var pu     = unit === 'km' ? 'km' : 'mi';
        var accent = a.accentColor || '#6c3fb5';

        function computeResult() {
            var distN  = parseFloat(dist) || 0;
            var timeSec= timeToSecs(time);
            var paceSec= paceToSecs(pace);
            if (mode === 'find_pace') {
                var ps = findPace(distN, timeSec);
                if (!ps) return null;
                var speedKmh = unit === 'km' ? 3600 / ps : 3600 / ps / KM_PER_MILE;
                return { label: 'Your Pace', main: secsToPace(ps), sub: '/' + pu, extra: 'Speed: ' + speedKmh.toFixed(2) + ' km/h' };
            }
            if (mode === 'find_time') {
                var ts = findTime(distN, paceSec);
                var spd2 = unit === 'km' ? 3600 / paceSec : 3600 / paceSec / KM_PER_MILE;
                return { label: 'Finish Time', main: secsToHMS(ts), sub: '', extra: 'Speed: ' + spd2.toFixed(2) + ' km/h' };
            }
            // find_dist
            var d = findDist(timeSec, paceSec);
            if (!d) return null;
            return { label: 'Distance', main: d.toFixed(2), sub: pu, extra: '' };
        }
        var result = computeResult();

        var modes = [
            { key: 'find_pace', label: 'Find Pace' },
            { key: 'find_time', label: 'Find Time' },
            { key: 'find_dist', label: 'Find Distance' }
        ];
        var units = [{ key: 'km', label: 'Kilometers' }, { key: 'mi', label: 'Miles' }];

        function tabBtn(label, active, onClick) {
            return el('button', {
                style: {
                    flex: 1, padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
                    border: '2px solid ' + (active ? accent : '#e5e7eb'),
                    background: active ? accent : 'transparent',
                    color: active ? '#fff' : accent,
                    fontWeight: 700, fontSize: '13px', transition: 'all .15s', fontFamily: 'inherit'
                },
                onClick: onClick
            }, label);
        }

        var presets = a.presets || [{ label: '5K', dist: 5 }, { label: '10K', dist: 10 }, { label: 'Half', dist: 21.0975 }, { label: 'Marathon', dist: 42.195 }];

        function inputRow(lbl, val, setVal, hint) {
            return el('div', { style: { marginBottom: '14px' } },
                el('label', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: a.labelColor, marginBottom: '5px' } },
                    el('span', null, lbl),
                    hint && el('span', { style: { fontWeight: 400, color: '#9ca3af', fontSize: '12px' } }, hint)
                ),
                el('input', {
                    type: 'text', value: val,
                    style: { width: '100%', padding: '10px 14px', borderRadius: a.inputRadius + 'px', border: '1.5px solid #e5e7eb', fontSize: '16px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
                    onChange: function(e) { setVal(e.target.value); }
                })
            );
        }

        return el('div', { className: 'bkbg-pace-editor', style: { background: a.sectionBg || undefined, paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', fontFamily: 'inherit' } },
            el('div', { style: { background: a.cardBg, borderRadius: a.cardRadius + 'px', padding: '36px 32px', maxWidth: a.maxWidth + 'px', margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.09)' } },

                // Title/subtitle
                (a.showTitle || a.showSubtitle) && el('div', { style: { marginBottom: '20px' } },
                    a.showTitle && el('div', { className: 'bkbg-pace-title', style: { color: a.titleColor, marginBottom: '6px', contentEditable: true, suppressContentEditableWarning: true, outline: 'none' }, onBlur: function(e) { sa({ title: e.target.innerText }); }, dangerouslySetInnerHTML: { __html: a.title } }),
                    a.showSubtitle && el('div', { style: { fontSize: '15px', color: a.subtitleColor, contentEditable: true, suppressContentEditableWarning: true, outline: 'none' }, onBlur: function(e) { sa({ subtitle: e.target.innerText }); }, dangerouslySetInnerHTML: { __html: a.subtitle } })
                ),

                // Mode tabs
                el('div', { style: { display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' } },
                    modes.map(function(m) { return tabBtn(m.label, mode === m.key, function() { setMode(m.key); }); })
                ),

                // Unit tabs
                el('div', { style: { display: 'flex', gap: '8px', marginBottom: '20px' } },
                    units.map(function(u) { return tabBtn(u.label, unit === u.key, function() { setUnit(u.key); }); })
                ),

                // Preset distance chips
                a.showPresets && (mode === 'find_pace' || mode === 'find_time') && el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' } },
                    presets.map(function(p) {
                        var d = unit === 'km' ? p.dist : p.dist / KM_PER_MILE;
                        return el('button', {
                            key: p.label,
                            style: { padding: '6px 14px', borderRadius: '100px', border: '1.5px solid #e5e7eb', background: a.presetBg, color: a.presetColor, fontWeight: 600, fontSize: '13px', cursor: 'pointer' },
                            onClick: function() { setDist(String(parseFloat(d.toFixed(3)))); }
                        }, p.label);
                    })
                ),

                // Inputs
                mode !== 'find_dist' && el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' } },
                    inputRow('Distance', dist, setDist, pu),
                    mode === 'find_pace' ? inputRow('Time', time, setTime, 'H:MM:SS') : inputRow('Pace', pace, setPace, 'M:SS/' + pu)
                ),
                mode === 'find_dist' && el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' } },
                    inputRow('Time', time, setTime, 'H:MM:SS'),
                    inputRow('Pace', pace, setPace, 'M:SS/' + pu)
                ),

                // Result card
                el('div', { style: { background: a.resultBg, border: '2px solid ' + a.resultBorder, borderRadius: a.cardRadius + 'px', padding: '24px 28px', textAlign: 'center', marginTop: '20px' } },
                    result ? el(Fragment, null,
                        el('div', { style: { fontSize: '13px', fontWeight: 600, color: a.labelColor, marginBottom: '6px' } }, result.label),
                        el('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' } },
                            el('span', { className: 'bkbg-pace-result-value', style: { color: a.resultColor } }, result.main),
                            result.sub && el('span', { style: { fontSize: '22px', fontWeight: 600, color: a.labelColor } }, ' ' + result.sub)
                        ),
                        result.extra && a.showSpeedConv && el('div', { style: { marginTop: '8px', fontSize: '14px', color: a.labelColor } }, result.extra)
                    ) : el('div', { style: { color: a.labelColor } }, 'Enter values above to calculate')
                )
            )
        );
    }

    registerBlockType('blockenberg/pace-calculator', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var tv = getTypoCssVars();
                var s = {};
                Object.assign(s, tv(a.titleTypo, '--bkbg-pace-tt-'));
                Object.assign(s, tv(a.resultTypo, '--bkbg-pace-rs-'));
                return { style: s };
            })());
            var colorSettings = [
                { value: a.accentColor,   onChange: function(v) { set({ accentColor: v }); },   label: 'Accent / Tabs' },
                { value: a.cardBg,        onChange: function(v) { set({ cardBg: v }); },         label: 'Card Background' },
                { value: a.resultBg,      onChange: function(v) { set({ resultBg: v }); },       label: 'Result Background' },
                { value: a.resultBorder,  onChange: function(v) { set({ resultBorder: v }); },   label: 'Result Border' },
                { value: a.resultColor,   onChange: function(v) { set({ resultColor: v }); },    label: 'Result Value Color' },
                { value: a.presetBg,      onChange: function(v) { set({ presetBg: v }); },       label: 'Preset Chip Background' },
                { value: a.presetColor,   onChange: function(v) { set({ presetColor: v }); },    label: 'Preset Chip Text' },
                { value: a.convBg,        onChange: function(v) { set({ convBg: v }); },         label: 'Conversion Card Background' },
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
                    el(PanelBody, { title: 'Calculator Settings', initialOpen: true },
                        el(SelectControl, { label: 'Default Mode', value: a.defaultMode, options: [{ label: 'Find Pace', value: 'find_pace' }, { label: 'Find Finish Time', value: 'find_time' }, { label: 'Find Distance', value: 'find_dist' }], onChange: function(v) { set({ defaultMode: v }); } }),
                        el(SelectControl, { label: 'Default Unit', value: a.defaultUnit, options: [{ label: 'Kilometers (km)', value: 'km' }, { label: 'Miles (mi)', value: 'mi' }], onChange: function(v) { set({ defaultUnit: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Race Distance Presets', checked: a.showPresets, onChange: function(v) { set({ showPresets: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Speed Conversion', checked: a.showSpeedConv, onChange: function(v) { set({ showSpeedConv: v }); } })
                    ),
                    
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(getTypoControl(), { label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }),
                        el(getTypoControl(), { label: __('Result', 'blockenberg'), value: a.resultTypo, onChange: function (v) { set({ resultTypo: v }); } })
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
                el('div', blockProps, el(PacePreview, { attributes: a, setAttributes: set }))
            );
        },
        save: function(props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save();
            return el('div', blockProps, el('div', { className: 'bkbg-pace-app', 'data-opts': JSON.stringify(a) }));
        }
    });
}() );
