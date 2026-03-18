( function () {
    var el                = wp.element.createElement;
    var useState          = wp.element.useState;
    var useEffect         = wp.element.useEffect;
    var useRef            = wp.element.useRef;
    var Fragment          = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __                = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;
    var Button            = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    /* ── Modes ─────────────────────────────────────────────────────────── */
    var MODES = { WORK: 'work', SHORT: 'short', LONG: 'long' };

    function pad2(n) { return String(Math.floor(n)).padStart(2, '0'); }
    function fmtTime(s) { return pad2(Math.floor(s / 60)) + ':' + pad2(s % 60); }

    function PomodoroPreview(props) {
        var a  = props.attributes;

        var workSecs  = (a.workMinutes || 25) * 60;
        var shortSecs = (a.shortBreak  || 5)  * 60;
        var longSecs  = (a.longBreak   || 15) * 60;

        var _mode    = useState(MODES.WORK);   var mode = _mode[0];    var setMode = _mode[1];
        var _secs    = useState(workSecs);     var secs = _secs[0];    var setSecs = _secs[1];
        var _running = useState(false);        var running = _running[0]; var setRunning = _running[1];
        var _cycles  = useState(0);            var cycles = _cycles[0]; var setCycles = _cycles[1];
        var totalRef = useRef(workSecs);
        var intervalRef = useRef(null);

        var modeColor = mode === MODES.WORK ? (a.accentColor||'#6c3fb5') : mode === MODES.SHORT ? (a.breakColor||'#10b981') : (a.longBreakColor||'#3b82f6');

        function getTotalFor(m) {
            return m === MODES.WORK ? workSecs : m === MODES.SHORT ? shortSecs : longSecs;
        }

        function switchMode(m) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setRunning(false);
            setMode(m);
            var t = getTotalFor(m);
            totalRef.current = t;
            setSecs(t);
        }

        useEffect(function() {
            if (running) {
                intervalRef.current = setInterval(function() {
                    setSecs(function(s) {
                        if (s <= 1) {
                            clearInterval(intervalRef.current);
                            setRunning(false);
                            if (mode === MODES.WORK) {
                                var newCycles = cycles + 1;
                                setCycles(newCycles);
                                if (newCycles % (a.cyclesBeforeLong || 4) === 0) {
                                    switchMode(MODES.LONG);
                                } else {
                                    switchMode(MODES.SHORT);
                                }
                            } else {
                                switchMode(MODES.WORK);
                            }
                            return 0;
                        }
                        return s - 1;
                    });
                }, 1000);
            } else {
                clearInterval(intervalRef.current);
            }
            return function() { clearInterval(intervalRef.current); };
        }, [running, mode]);

        var progress = 1 - secs / (totalRef.current || workSecs);
        var size     = a.ringSize || 220;
        var thick    = a.ringThickness || 14;
        var r        = (size - thick) / 2;
        var circ     = 2 * Math.PI * r;
        var offset   = circ * (1 - progress);

        var modeLabels = { work: 'Focus Time', short: 'Short Break', long: 'Long Break' };

        return el('div', { style: { paddingTop: a.paddingTop+'px', paddingBottom: a.paddingBottom+'px', background: a.sectionBg||undefined } },
            el('div', { style: { background: a.cardBg, borderRadius: a.cardRadius+'px', padding: '40px 32px', maxWidth: a.maxWidth+'px', margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.09)', textAlign: 'center' } },

                (a.showTitle || a.showSubtitle) && el('div', { style: { marginBottom: '24px' } },
                    a.showTitle    && el('div', { className: 'bkbg-pom-title', style: { color: a.titleColor, marginBottom: '6px' } }, a.title),
                    a.showSubtitle && el('div', { className: 'bkbg-pom-subtitle', style: { color: a.subtitleColor } }, a.subtitle)
                ),

                // Mode tabs
                el('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '28px' } },
                    Object.values(MODES).map(function(m) {
                        var active = m === mode;
                        var mc = m === MODES.WORK ? (a.accentColor||'#6c3fb5') : m === MODES.SHORT ? (a.breakColor||'#10b981') : (a.longBreakColor||'#3b82f6');
                        return el('button', { key: m, onClick: function(){ switchMode(m); }, style: { padding: '7px 16px', borderRadius: '100px', border: '2px solid ' + (active ? mc : '#e5e7eb'), background: active ? mc : 'transparent', color: active ? '#fff' : mc, fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' } },
                            modeLabels[m]
                        );
                    })
                ),

                // SVG ring
                el('div', { style: { position: 'relative', width: size+'px', height: size+'px', margin: '0 auto 24px' } },
                    el('svg', { width: size, height: size, style: { transform: 'rotate(-90deg)' } },
                        el('circle', { cx: size/2, cy: size/2, r: r, fill: 'none', stroke: a.ringBg||'#e5e7eb', strokeWidth: thick }),
                        el('circle', { cx: size/2, cy: size/2, r: r, fill: 'none', stroke: modeColor, strokeWidth: thick, strokeLinecap: 'round', strokeDasharray: circ, strokeDashoffset: offset, style: { transition: 'stroke-dashoffset .5s linear, stroke .3s' } })
                    ),
                    el('div', { style: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' } },
                        el('div', { style: { fontSize: a.timerSize+'px', fontWeight: 800, color: a.TimerColor||'#1f2937', lineHeight: 1, fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' } }, fmtTime(secs)),
                        a.showModeLabel && el('div', { style: { fontSize: '13px', fontWeight: 600, color: modeColor, marginTop: '4px' } }, modeLabels[mode])
                    )
                ),

                // Controls
                el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' } },
                    el('button', { onClick: function(){ setRunning(function(r){ return !r; }); }, style: { padding: '12px 32px', borderRadius: a.btnRadius+'px', border: 'none', background: a.btnStartBg||'#6c3fb5', color: a.btnStartColor||'#fff', fontWeight: 700, fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit', minWidth: '120px' } },
                        running ? '⏸ Pause' : (secs < getTotalFor(mode) ? '▶ Resume' : '▶ Start')
                    ),
                    el('button', { onClick: function(){ switchMode(mode); }, style: { padding: '12px 20px', borderRadius: a.btnRadius+'px', border: 'none', background: a.btnSecBg||'#f3f4f6', color: a.btnSecColor||'#374151', fontWeight: 600, fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit' } }, '↺ Reset')
                ),

                // Cycle counter
                a.showCycleCount && el('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' } },
                    el('span', { style: { fontSize: '13px', color: a.labelColor, fontWeight: 500, marginRight: '4px' } }, 'Sessions:'),
                    [1,2,3,4].map(function(i) {
                        return el('div', { key: i, style: { width: '12px', height: '12px', borderRadius: '50%', background: i <= (cycles % ((a.cyclesBeforeLong||4))) || (cycles > 0 && cycles % (a.cyclesBeforeLong||4) === 0 && i <= (a.cyclesBeforeLong||4)) ? (a.accentColor||'#6c3fb5') : '#e5e7eb', transition: 'background .2s' } });
                    }),
                    el('span', { style: { fontSize: '12px', color: a.labelColor, marginLeft: '4px' } }, '(' + cycles + ' done)')
                )
            )
        );
    }

    registerBlockType('blockenberg/pomodoro-timer', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {};
                Object.assign(s, _tv(a.titleTypo, '--bkbg-pom-tt-'));
                Object.assign(s, _tv(a.subtitleTypo, '--bkbg-pom-st-'));
                return { className: 'bkbg-pom-editor', style: s };
            })());
            var colorSettings = [
                { value: a.accentColor,    onChange: function(v){ set({accentColor:v}); },    label: 'Work / Accent Color' },
                { value: a.breakColor,     onChange: function(v){ set({breakColor:v}); },     label: 'Short Break Color' },
                { value: a.longBreakColor, onChange: function(v){ set({longBreakColor:v}); }, label: 'Long Break Color' },
                { value: a.ringBg,         onChange: function(v){ set({ringBg:v}); },         label: 'Ring Track Background' },
                { value: a.cardBg,         onChange: function(v){ set({cardBg:v}); },         label: 'Card Background' },
                { value: a.TimerColor,     onChange: function(v){ set({TimerColor:v}); },     label: 'Timer Text Color' },
                { value: a.labelColor,     onChange: function(v){ set({labelColor:v}); },     label: 'Label Color' },
                { value: a.btnStartBg,     onChange: function(v){ set({btnStartBg:v}); },     label: 'Start Button Background' },
                { value: a.btnStartColor,  onChange: function(v){ set({btnStartColor:v}); },  label: 'Start Button Text' },
                { value: a.btnSecBg,       onChange: function(v){ set({btnSecBg:v}); },       label: 'Reset Button Background' },
                { value: a.btnSecColor,    onChange: function(v){ set({btnSecColor:v}); },    label: 'Reset Button Text' },
                { value: a.titleColor,     onChange: function(v){ set({titleColor:v}); },     label: 'Title Color' },
                { value: a.subtitleColor,  onChange: function(v){ set({subtitleColor:v}); },  label: 'Subtitle Color' },
                { value: a.sectionBg,      onChange: function(v){ set({sectionBg:v}); },      label: 'Section Background' }
            ];
            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Header', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Title',    checked: a.showTitle,    onChange: function(v){ set({showTitle:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Subtitle', checked: a.showSubtitle, onChange: function(v){ set({showSubtitle:v}); } }),
                        el(TextControl,   { label: 'Title',    value: a.title,    onChange: function(v){ set({title:v}); } }),
                        el(TextControl,   { label: 'Subtitle', value: a.subtitle, onChange: function(v){ set({subtitle:v}); } })
                    ),
                    el(PanelBody, { title: 'Timer Settings', initialOpen: true },
                        el(RangeControl, { label: 'Work Duration (min)',      value: a.workMinutes,      min: 1,  max: 90, step: 1, onChange: function(v){ set({workMinutes:v}); } }),
                        el(RangeControl, { label: 'Short Break (min)',        value: a.shortBreak,       min: 1,  max: 30, step: 1, onChange: function(v){ set({shortBreak:v}); } }),
                        el(RangeControl, { label: 'Long Break (min)',         value: a.longBreak,        min: 5,  max: 60, step: 1, onChange: function(v){ set({longBreak:v}); } }),
                        el(RangeControl, { label: 'Cycles Before Long Break', value: a.cyclesBeforeLong, min: 2,  max: 8,  step: 1, onChange: function(v){ set({cyclesBeforeLong:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Mode Label',  checked: a.showModeLabel,  onChange: function(v){ set({showModeLabel:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Cycle Count', checked: a.showCycleCount, onChange: function(v){ set({showCycleCount:v}); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function () {
                            var TC = getTypoControl();
                            if (!TC) return el('p', null, 'Loading…');
                            return el(wp.element.Fragment, null,
                                el(TC, { label: 'Title Typography', value: a.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }),
                                el(TC, { label: 'Subtitle Typography', value: a.subtitleTypo, onChange: function (v) { set({ subtitleTypo: v }); } })
                            );
                        })(),
                        el(RangeControl, { label: 'Timer Font Size', value: a.timerSize, min: 28, max: 96, step: 2, onChange: function(v){ set({timerSize:v}); } })
                    ),
el(PanelColorSettings, { title: 'Colors', initialOpen: false, colorSettings: colorSettings }),
                    el(PanelBody, { title: 'Sizing & Layout', initialOpen: false },
                        el(RangeControl, { label: 'Ring Size (px)',    value: a.ringSize,      min: 120,max: 400, step: 10, onChange: function(v){ set({ringSize:v}); } }),
                        el(RangeControl, { label: 'Ring Thickness',    value: a.ringThickness, min: 4,  max: 40,  step: 1,  onChange: function(v){ set({ringThickness:v}); } }),
                        el(RangeControl, { label: 'Card Border Radius',value: a.cardRadius,    min: 0,  max: 48,  step: 1,  onChange: function(v){ set({cardRadius:v}); } }),
                        el(RangeControl, { label: 'Button Radius',     value: a.btnRadius,     min: 0,  max: 100, step: 2,  onChange: function(v){ set({btnRadius:v}); } }),
                        el(RangeControl, { label: 'Max Width (px)',    value: a.maxWidth,      min: 280,max: 700, step: 10, onChange: function(v){ set({maxWidth:v}); } }),
                        el(RangeControl, { label: 'Padding Top (px)', value: a.paddingTop,    min: 0,  max: 160, step: 4,  onChange: function(v){ set({paddingTop:v}); } }),
                        el(RangeControl, { label: 'Padding Bottom (px)',value:a.paddingBottom, min: 0,  max: 160, step: 4,  onChange: function(v){ set({paddingBottom:v}); } })
                    )
                ),
                el('div', blockProps, el(PomodoroPreview, { attributes: a }))
            );
        },
        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(), el('div', { className: 'bkbg-pom-app', 'data-opts': JSON.stringify(a) }));
        },
        deprecated: [{
            attributes: {
                title:            { type: 'string',  default: 'Pomodoro Timer' },
                subtitle:         { type: 'string',  default: 'Stay focused. Work smarter.' },
                showTitle:        { type: 'boolean', default: true },
                showSubtitle:     { type: 'boolean', default: true },
                workMinutes:      { type: 'number',  default: 25 },
                shortBreak:       { type: 'number',  default: 5 },
                longBreak:        { type: 'number',  default: 15 },
                cyclesBeforeLong: { type: 'number',  default: 4 },
                showCycleCount:   { type: 'boolean', default: true },
                showModeLabel:    { type: 'boolean', default: true },
                autoStartBreak:   { type: 'boolean', default: false },
                accentColor:      { type: 'string',  default: '#6c3fb5' },
                breakColor:       { type: 'string',  default: '#10b981' },
                longBreakColor:   { type: 'string',  default: '#3b82f6' },
                ringBg:           { type: 'string',  default: '#e5e7eb' },
                cardBg:           { type: 'string',  default: '#ffffff' },
                TimerColor:       { type: 'string',  default: '#1f2937' },
                labelColor:       { type: 'string',  default: '#6b7280' },
                btnStartBg:       { type: 'string',  default: '#6c3fb5' },
                btnStartColor:    { type: 'string',  default: '#ffffff' },
                btnSecBg:         { type: 'string',  default: '#f3f4f6' },
                btnSecColor:      { type: 'string',  default: '#374151' },
                titleColor:       { type: 'string',  default: '#1f2937' },
                subtitleColor:    { type: 'string',  default: '#6b7280' },
                sectionBg:        { type: 'string',  default: '' },
                titleSize:        { type: 'number',  default: 28 },
                timerSize:        { type: 'number',  default: 56 },
                ringSize:         { type: 'number',  default: 220 },
                ringThickness:    { type: 'number',  default: 14 },
                cardRadius:       { type: 'number',  default: 20 },
                btnRadius:        { type: 'number',  default: 100 },
                maxWidth:         { type: 'number',  default: 440 },
                paddingTop:       { type: 'number',  default: 60 },
                paddingBottom:    { type: 'number',  default: 60 },
                titleFontWeight:  { type: 'string',  default: '700' }
            },
            save: function(props) {
                var a = props.attributes;
                return wp.element.createElement('div', wp.blockEditor.useBlockProps.save(), wp.element.createElement('div', { className: 'bkbg-pom-app', 'data-opts': JSON.stringify(a) }));
            }
        }]
    });
}() );
