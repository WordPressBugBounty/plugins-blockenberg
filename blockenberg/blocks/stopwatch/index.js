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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    function EditorPreview(props) {
        var a = props.attributes;

        var wrapStyle = {
            background:  a.sectionBg,
            borderRadius: '16px',
            padding:     '32px 24px',
            maxWidth:    a.contentMaxWidth + 'px',
            margin:      '0 auto',
            fontFamily:  'inherit',
            boxSizing:   'border-box',
            textAlign:   'center'
        };

        var clockStyle = {
            background:    a.clockBg,
            borderRadius:  '20px',
            padding:       '28px 20px',
            margin:        '20px auto',
            fontFamily:    "'Courier New', Courier, monospace",
            fontSize:      a.clockFontSize + 'px',
            fontWeight:    '700',
            color:         a.clockColor,
            letterSpacing: '0.06em',
            lineHeight:    '1'
        };

        var btnRowStyle = { display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap', marginBottom:'18px' };

        function actionBtn(label, bg) {
            return el('button', {
                style: { padding:'10px 22px', borderRadius:'10px', border:'none', background:bg, color:'#fff', fontWeight:'700', fontSize:'14px', cursor:'pointer' }
            }, label);
        }

        var SAMPLE_LAPS = [
            { num:1, split:'00:05.32', total:'00:05.32' },
            { num:2, split:'00:04.87', total:'00:10.19' },
            { num:3, split:'00:06.01', total:'00:16.20' }
        ];

        return el('div', { style: wrapStyle },
            a.showTitle && el(RichText, {
                tagName: 'h3',
                className: 'bkbg-sw-title',
                value:   a.title,
                onChange: function (v) { props.setAttributes({ title: v }); },
                style:   { color: a.titleColor, margin: '0 0 5px 0' },
                placeholder: 'Title…'
            }),
            a.showSubtitle && el(RichText, {
                tagName: 'p',
                className: 'bkbg-sw-subtitle',
                value:   a.subtitle,
                onChange: function (v) { props.setAttributes({ subtitle: v }); },
                style:   { color: a.subtitleColor, margin: '0 0 2px 0' },
                placeholder: 'Subtitle…'
            }),

            el('div', { style: clockStyle },
                a.showMilliseconds ? '00:00.00' : '00:00'
            ),

            el('div', { style: btnRowStyle },
                actionBtn('▶ Start', a.startColor),
                actionBtn('⏸ Pause', a.stopColor),
                a.showLaps && actionBtn('⏱ Lap', a.lapColor),
                actionBtn('↺ Reset', a.resetColor)
            ),

            a.showLaps && el('div', {
                style: { background: a.cardBg, borderRadius:'12px', overflow:'hidden', border:'1.5px solid #e5e7eb', textAlign:'left' }
            },
                el('div', { style:{ display:'flex', fontWeight:'700', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.06em', color:a.labelColor, background:'#f9fafb', padding:'8px 14px', gap:'10px' } },
                    el('span', { style:{ width:'32px' } }, '#'),
                    el('span', { style:{ flex:'1' } }, 'Split'),
                    el('span', { style:{ flex:'1', textAlign:'right' } }, 'Total')
                ),
                SAMPLE_LAPS.map(function (lap) {
                    return el('div', { key: lap.num, style:{ display:'flex', padding:'8px 14px', gap:'10px', fontSize:'13px', color:a.labelColor, borderTop:'1px solid #f3f4f6', fontFamily:"'Courier New', monospace" } },
                        el('span', { style:{ width:'32px', fontWeight:'700', color:a.accentColor } }, lap.num),
                        el('span', { style:{ flex:'1' } }, lap.split),
                        el('span', { style:{ flex:'1', textAlign:'right', color:a.accentColor } }, lap.total)
                    );
                })
            )
        );
    }

    registerBlockType('blockenberg/stopwatch', {
        edit: function (props) {
            var a   = props.attributes;
            var set = props.setAttributes;

            var colorSettings = [
                { value:a.accentColor,    onChange:function(v){set({accentColor:   v||'#6366f1'});}, label:'Accent / lap number' },
                { value:a.startColor,     onChange:function(v){set({startColor:    v||'#22c55e'});}, label:'Start button'        },
                { value:a.stopColor,      onChange:function(v){set({stopColor:     v||'#ef4444'});}, label:'Pause/Stop button'   },
                { value:a.resetColor,     onChange:function(v){set({resetColor:    v||'#6b7280'});}, label:'Reset button'        },
                { value:a.lapColor,       onChange:function(v){set({lapColor:      v||'#f59e0b'});}, label:'Lap button'          },
                { value:a.clockBg,        onChange:function(v){set({clockBg:       v||'#1e1b4b'});}, label:'Clock background'    },
                { value:a.clockColor,     onChange:function(v){set({clockColor:    v||'#e0e7ff'});}, label:'Clock digits color'  },
                { value:a.sectionBg,      onChange:function(v){set({sectionBg:     v||'#f5f3ff'});}, label:'Section background'  },
                { value:a.cardBg,         onChange:function(v){set({cardBg:        v||'#ffffff'});}, label:'Lap table background'},
                { value:a.titleColor,     onChange:function(v){set({titleColor:    v||'#111827'});}, label:'Title color'         },
                { value:a.subtitleColor,  onChange:function(v){set({subtitleColor: v||'#6b7280'});}, label:'Subtitle color'      },
                { value:a.labelColor,     onChange:function(v){set({labelColor:    v||'#374151'});}, label:'Label color'         }
            ];

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title:'Stopwatch Settings', initialOpen:true },
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show title',        checked:a.showTitle,        onChange:function(v){set({showTitle:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show subtitle',     checked:a.showSubtitle,     onChange:function(v){set({showSubtitle:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show lap recorder', checked:a.showLaps,         onChange:function(v){set({showLaps:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show milliseconds', checked:a.showMilliseconds, onChange:function(v){set({showMilliseconds:v});} }),
                        a.showLaps && el(RangeControl, { label:'Max laps to show', value:a.maxLaps, min:5, max:50, onChange:function(v){set({maxLaps:v});} })
                    ),
                    el(PanelBody, { title:'Sizing', initialOpen:false },
                        el(RangeControl, { label:'Max width (px)',   value:a.contentMaxWidth, min:320, max:900, step:20, onChange:function(v){set({contentMaxWidth:v});} })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl()({ label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }),
                        getTypoControl()({ label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo, onChange: function (v) { set({ subtitleTypo: v }); } }),
                        el(RangeControl, { label:'Clock font size',  value:a.clockFontSize,   min:32, max:120,  onChange:function(v){set({clockFontSize:v});} })
                    ),
el(PanelColorSettings, { title:'Colors', initialOpen:false, disableCustomGradients:true, colorSettings:colorSettings })
                ),
                el('div', useBlockProps((function () {
                    var _tvf = getTypoCssVars();
                    var s = {};
                    Object.assign(s, _tvf(a.titleTypo,    '--bksw-tt-'));
                    Object.assign(s, _tvf(a.subtitleTypo, '--bksw-st-'));
                    return { className: 'bkbg-sw-editor-wrap', style: s };
                })()),
                    el(EditorPreview, { attributes:a, setAttributes:set })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', {
                    className:   'bkbg-sw-app',
                    'data-opts': JSON.stringify({
                        title:            a.title,
                        subtitle:         a.subtitle,
                        showTitle:        a.showTitle,
                        showSubtitle:     a.showSubtitle,
                        showLaps:         a.showLaps,
                        showMilliseconds: a.showMilliseconds,
                        maxLaps:          a.maxLaps,
                        accentColor:      a.accentColor,
                        startColor:       a.startColor,
                        stopColor:        a.stopColor,
                        resetColor:       a.resetColor,
                        lapColor:         a.lapColor,
                        clockBg:          a.clockBg,
                        clockColor:       a.clockColor,
                        sectionBg:        a.sectionBg,
                        cardBg:           a.cardBg,
                        titleColor:       a.titleColor,
                        subtitleColor:    a.subtitleColor,
                        labelColor:       a.labelColor,
                        titleFontSize:    a.titleFontSize,
                        clockFontSize:    a.clockFontSize,
                        contentMaxWidth:  a.contentMaxWidth,
                        titleTypo:        a.titleTypo,
                        subtitleTypo:     a.subtitleTypo
                    })
                })
            );
        }
    });
}() );
