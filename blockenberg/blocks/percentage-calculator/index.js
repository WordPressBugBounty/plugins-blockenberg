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
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function fmtNum(n, dp) {
        if (isNaN(n) || !isFinite(n)) return '—';
        dp = dp !== undefined ? dp : 4;
        var fixed = parseFloat(n.toFixed(dp));
        return fixed.toLocaleString('en-US', { maximumFractionDigits: dp });
    }

    /* ── Input field helper ───────────────────────────────────────────── */
    function NumInput(props) {
        return el('input', {
            type:        'number',
            value:       props.value,
            placeholder: props.placeholder || '0',
            step:        'any',
            onChange:    function (e) { props.onChange(e.target.value); },
            style: {
                width: '100%', padding: '12px 14px', borderRadius: props.radius + 'px',
                border: '1.5px solid #e5e7eb', fontSize: '16px', boxSizing: 'border-box',
                outline: 'none', fontFamily: 'inherit',
            }
        });
    }

    /* ── Preview component ────────────────────────────────────────────── */
    function PctPreview(props) {
        var a      = props.attrs;
        var accent = a.accentColor || '#6c3fb5';
        var cRadius= (a.cardRadius  || 16) + 'px';
        var iRadius= a.inputRadius  || 8;
        var tRadius= (a.tabRadius   || 99) + 'px';

        var modeState = useState(0);
        var mode = modeState[0]; var setMode = modeState[1];

        /* Mode 1: What is X% of Y */
        var m1pState = useState(''); var m1p = m1pState[0]; var setM1p = m1pState[1];
        var m1nState = useState(''); var m1n = m1nState[0]; var setM1n = m1nState[1];

        /* Mode 2: X is what % of Y */
        var m2xState = useState(''); var m2x = m2xState[0]; var setM2x = m2xState[1];
        var m2yState = useState(''); var m2y = m2yState[0]; var setM2y = m2yState[1];

        /* Mode 3: % change from X to Y */
        var m3xState = useState(''); var m3x = m3xState[0]; var setM3x = m3xState[1];
        var m3yState = useState(''); var m3y = m3yState[0]; var setM3y = m3yState[1];

        /* Compute results */
        var result, formula, changeDir;
        if (mode === 0) {
            result  = (parseFloat(m1p) / 100) * parseFloat(m1n);
            formula = m1p + '% of ' + m1n + ' =';
        } else if (mode === 1) {
            result  = (parseFloat(m2x) / parseFloat(m2y)) * 100;
            formula = m2x + ' is ___% of ' + m2y;
        } else {
            var x3 = parseFloat(m3x), y3 = parseFloat(m3y);
            result  = ((y3 - x3) / Math.abs(x3)) * 100;
            changeDir = !isNaN(result) && isFinite(result) ? (result >= 0 ? 'increase' : 'decrease') : null;
            formula = 'Change from ' + m3x + ' to ' + m3y;
        }

        var resultValid = !isNaN(result) && isFinite(result);
        var resultColor = mode === 2 && changeDir
            ? (changeDir === 'increase' ? '#16a34a' : '#dc2626')
            : (a.resultColor || accent);

        var TABS = [
            a.mode1Label || '% of Number',
            a.mode2Label || 'Find %',
            a.mode3Label || '% Change',
        ];

        var cardStyle = {
            background:    a.cardBg || '#ffffff',
            borderRadius:  cRadius,
            padding:       '32px',
            boxShadow:     '0 4px 24px rgba(0,0,0,0.08)',
            maxWidth:      (a.maxWidth || 600) + 'px',
            margin:        '0 auto',
            paddingTop:    (a.paddingTop    || 60) + 'px',
            paddingBottom: (a.paddingBottom || 60) + 'px',
            boxSizing:     'border-box',
        };

        return el('div', { style: cardStyle },
            a.showTitle && el('h2', { className: 'bkbg-pct-title', style: { color: a.titleColor || '#1e1b4b', textAlign: 'center', marginTop: 0, marginBottom: 8 } }, a.title || __('Percentage Calculator', 'blockenberg')),
            a.showSubtitle && el('p', { className: 'bkbg-pct-subtitle', style: { color: a.subtitleColor || '#6b7280', textAlign: 'center', marginTop: 0, marginBottom: 24 } }, a.subtitle),

            /* Tabs */
            el('div', { style: { display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' } },
                TABS.map(function (label, idx) {
                    var active = mode === idx;
                    return el('button', {
                        key: idx,
                        onClick: function () { setMode(idx); },
                        style: {
                            flex: '1', padding: '9px 16px', borderRadius: tRadius,
                            border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                            background: active ? (a.tabActiveBg || accent) : (a.tabInactiveBg || '#f3f4f6'),
                            color:      active ? (a.tabActiveColor || '#fff') : (a.tabInactiveColor || '#374151'),
                            transition: 'background 0.15s, color 0.15s',
                        }
                    }, label);
                })
            ),

            /* Mode 0: X% of Y */
            mode === 0 && el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' } },
                el('div', { style: { flex: 1, minWidth: '60px' } },
                    el('label', { style: { display: 'block', fontSize: '12px', fontWeight: 600, color: a.labelColor || '#374151', marginBottom: '4px' } }, '%'),
                    el(NumInput, { value: m1p, onChange: setM1p, placeholder: '25', radius: iRadius })
                ),
                el('span', { style: { fontWeight: 700, color: '#9ca3af', fontSize: '18px', paddingTop: '20px' } }, '% of'),
                el('div', { style: { flex: 2, minWidth: '100px' } },
                    el('label', { style: { display: 'block', fontSize: '12px', fontWeight: 600, color: a.labelColor || '#374151', marginBottom: '4px' } }, __('Number', 'blockenberg')),
                    el(NumInput, { value: m1n, onChange: setM1n, placeholder: '200', radius: iRadius })
                )
            ),

            /* Mode 1: X is what% of Y */
            mode === 1 && el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' } },
                el('div', { style: { flex: 2, minWidth: '100px' } },
                    el('label', { style: { display: 'block', fontSize: '12px', fontWeight: 600, color: a.labelColor || '#374151', marginBottom: '4px' } }, __('Value', 'blockenberg')),
                    el(NumInput, { value: m2x, onChange: setM2x, placeholder: '50', radius: iRadius })
                ),
                el('span', { style: { fontWeight: 700, color: '#9ca3af', fontSize: '14px', paddingTop: '20px', whiteSpace: 'nowrap' } }, __('is _% of', 'blockenberg')),
                el('div', { style: { flex: 2, minWidth: '100px' } },
                    el('label', { style: { display: 'block', fontSize: '12px', fontWeight: 600, color: a.labelColor || '#374151', marginBottom: '4px' } }, __('Total', 'blockenberg')),
                    el(NumInput, { value: m2y, onChange: setM2y, placeholder: '200', radius: iRadius })
                )
            ),

            /* Mode 2: % change */
            mode === 2 && el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' } },
                el('div', { style: { flex: 2, minWidth: '100px' } },
                    el('label', { style: { display: 'block', fontSize: '12px', fontWeight: 600, color: a.labelColor || '#374151', marginBottom: '4px' } }, __('From', 'blockenberg')),
                    el(NumInput, { value: m3x, onChange: setM3x, placeholder: '100', radius: iRadius })
                ),
                el('span', { style: { fontWeight: 700, color: '#9ca3af', fontSize: '18px', paddingTop: '20px' } }, '→'),
                el('div', { style: { flex: 2, minWidth: '100px' } },
                    el('label', { style: { display: 'block', fontSize: '12px', fontWeight: 600, color: a.labelColor || '#374151', marginBottom: '4px' } }, __('To', 'blockenberg')),
                    el(NumInput, { value: m3y, onChange: setM3y, placeholder: '150', radius: iRadius })
                )
            ),

            /* Result box */
            el('div', {
                style: {
                    background: a.resultBg || '#f5f3ff',
                    border: '1.5px solid ' + (a.resultBorder || '#ede9fe'),
                    borderRadius: (a.cardRadius || 16) + 'px',
                    padding: '24px', textAlign: 'center',
                }
            },
                el('div', { style: { fontSize: '12px', color: '#9ca3af', marginBottom: '6px' } }, formula),
                el('div', { className: 'bkbg-pct-result-num', style: { color: resultColor } },
                    resultValid
                        ? (mode === 0 ? fmtNum(result, 4) : (mode === 1 ? fmtNum(result, 2) + '%' : (result >= 0 ? '+' : '') + fmtNum(result, 2) + '%'))
                        : '—'
                ),
                mode === 2 && resultValid && changeDir && el('div', { style: { fontSize: '13px', color: resultColor, marginTop: '6px', fontWeight: 600 } },
                    changeDir === 'increase' ? '▲ Increase' : '▼ Decrease'
                )
            )
        );
    }

    registerBlockType('blockenberg/percentage-calculator', {
        edit: function (props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps((function(){
                var s = { background: a.bgColor || undefined };
                var tv = getTypoCssVars();
                if (tv) {
                    Object.assign(s, tv(a.titleTypo || {}, '--bkbg-pct-title'));
                    Object.assign(s, tv(a.subtitleTypo || {}, '--bkbg-pct-subtitle'));
                    Object.assign(s, tv(a.resultTypo || {}, '--bkbg-pct-result'));
                }
                return { style: s };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: a.showTitle, onChange: function (v) { setAttr({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showTitle && el(TextControl, { label: __('Title', 'blockenberg'), value: a.title, onChange: function (v) { setAttr({ title: v }); } }),
                        el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: function (v) { setAttr({ showSubtitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showSubtitle && el(TextControl, { label: __('Subtitle', 'blockenberg'), value: a.subtitle, onChange: function (v) { setAttr({ subtitle: v }); } }),
                        el(TextControl, { label: __('Mode 1 Tab Label', 'blockenberg'), value: a.mode1Label, onChange: function (v) { setAttr({ mode1Label: v }); } }),
                        el(TextControl, { label: __('Mode 2 Tab Label', 'blockenberg'), value: a.mode2Label, onChange: function (v) { setAttr({ mode2Label: v }); } }),
                        el(TextControl, { label: __('Mode 3 Tab Label', 'blockenberg'), value: a.mode3Label, onChange: function (v) { setAttr({ mode3Label: v }); } })
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function(){ var C = getTypoControl(); return C ? [
                            el(C, { key: 'title', label: __('Title', 'blockenberg'), value: a.titleTypo || {}, onChange: function(v){ setAttr({titleTypo: v}); } }),
                            el(C, { key: 'subtitle', label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo || {}, onChange: function(v){ setAttr({subtitleTypo: v}); } }),
                            el(C, { key: 'result', label: __('Result Number', 'blockenberg'), value: a.resultTypo || {}, onChange: function(v){ setAttr({resultTypo: v}); } })
                        ] : null; })()
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Accent Color', 'blockenberg'),       value: a.accentColor,     onChange: function (v) { setAttr({ accentColor:     v || '#6c3fb5' }); } },
                            { label: __('Active Tab Background', 'blockenberg'), value: a.tabActiveBg,  onChange: function (v) { setAttr({ tabActiveBg:     v || '#6c3fb5' }); } },
                            { label: __('Active Tab Text', 'blockenberg'),    value: a.tabActiveColor,  onChange: function (v) { setAttr({ tabActiveColor:  v || '#ffffff' }); } },
                            { label: __('Inactive Tab Background', 'blockenberg'), value: a.tabInactiveBg, onChange: function (v) { setAttr({ tabInactiveBg: v || '#f3f4f6' }); } },
                            { label: __('Inactive Tab Text', 'blockenberg'),  value: a.tabInactiveColor,onChange: function (v) { setAttr({ tabInactiveColor:v || '#374151' }); } },
                            { label: __('Result Color', 'blockenberg'),       value: a.resultColor,     onChange: function (v) { setAttr({ resultColor:     v || '#6c3fb5' }); } },
                            { label: __('Result Background', 'blockenberg'),  value: a.resultBg,        onChange: function (v) { setAttr({ resultBg:        v || '#f5f3ff' }); } },
                            { label: __('Card Background', 'blockenberg'),    value: a.cardBg,          onChange: function (v) { setAttr({ cardBg:          v || '#ffffff' }); } },
                            { label: __('Section Background', 'blockenberg'), value: a.bgColor,         onChange: function (v) { setAttr({ bgColor:         v || '' }); } },
                        ]
                    }),

                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Card Radius (px)', 'blockenberg'),  value: a.cardRadius, min: 0,  max: 40, onChange: function (v) { setAttr({ cardRadius: v }); } }),
                        el(RangeControl, { label: __('Tab Radius (px)', 'blockenberg'),   value: a.tabRadius,  min: 0,  max: 99, onChange: function (v) { setAttr({ tabRadius:  v }); } }),
                        el(RangeControl, { label: __('Input Radius (px)', 'blockenberg'), value: a.inputRadius,min: 0, max: 24, onChange: function (v) { setAttr({ inputRadius:v }); } }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'),    value: a.maxWidth,   min: 320,max: 1200,onChange: function (v) { setAttr({ maxWidth:   v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'),  value: a.paddingTop, min: 0, max: 160,onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'),value: a.paddingBottom,min:0,max:160,onChange: function (v) { setAttr({ paddingBottom:v }); } })
                    )
                ),

                el('div', blockProps,
                    el(PctPreview, { attrs: a })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ style: { background: a.bgColor || undefined } });
            return el('div', blockProps,
                el('div', { className: 'bkbg-pct-app', 'data-opts': JSON.stringify(a) },
                    el('p', { className: 'bkbg-pct-loading' }, __('Loading calculator…', 'blockenberg'))
                )
            );
        }
    });
}() );
