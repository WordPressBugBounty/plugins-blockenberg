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
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;
    var SelectControl      = wp.components.SelectControl;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var SPEED_UNITS = ['km/h','mph','m/s','knots'];
    var DIST_UNITS  = ['km','miles','m','feet','nautical miles'];
    var TIME_UNITS  = ['seconds','minutes','hours','days'];

    function EditorPreview(props) {
        var a = props.attributes;
        var solveFor = a.defaultSolveFor;

        var wrapStyle = {
            background:   a.sectionBg, borderRadius:'14px', padding:'32px 24px',
            maxWidth:     a.contentMaxWidth+'px', margin:'0 auto', fontFamily:'inherit', boxSizing:'border-box'
        };

        var VARS = [
            { key:'speed', label:'Speed',    color:a.speedColor, icon:'⚡', unit:a.defaultSpeedUnit,   units:SPEED_UNITS },
            { key:'dist',  label:'Distance', color:a.distColor,  icon:'📏', unit:a.defaultDistUnit,    units:DIST_UNITS  },
            { key:'time',  label:'Time',     color:a.timeColor,  icon:'⏱️', unit:a.defaultTimeUnit,    units:TIME_UNITS  }
        ];

        var tabStyle = function(k) {
            var active = k === solveFor;
            return {
                padding:'7px 16px', borderRadius:'8px', border:'2px solid '+(active?a.accentColor:'#e5e7eb'),
                background:active?a.accentColor:'transparent', color:active?'#fff':a.labelColor,
                fontWeight:active?'700':'500', fontSize:'13px', cursor:'pointer'
            };
        };

        var inputBlockStyle = function(v) {
            var disabled = v.key === solveFor;
            return {
                background:   disabled?a.resultBg:a.cardBg, borderRadius:'12px', padding:'16px',
                border:       '2px solid '+(disabled?v.color:'#e5e7eb'), opacity: disabled?0.85:1
            };
        };

        return el('div', { className: 'bkbg-spd-wrap', style: { background: a.sectionBg, maxWidth: a.contentMaxWidth+'px', margin:'0 auto' } },
            el(RichText, { tagName:'h3', value:a.title, onChange:function(v){ props.setAttributes({title:v}); },
                className: 'bkbg-spd-title', style:{ color:a.titleColor, margin:'0 0 6px 0' }, placeholder:'Block title...' }),
            el(RichText, { tagName:'p', value:a.subtitle, onChange:function(V){ props.setAttributes({subtitle:V}); },
                className: 'bkbg-spd-subtitle', style:{ color:a.subtitleColor, margin:'0 0 22px 0' }, placeholder:'Subtitle...' }),

            // Solve-for tabs
            el('div', { style:{ marginBottom:'10px', fontSize:'12px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.06em', color:a.labelColor } }, 'Solve for…'),
            el('div', { style:{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'22px' } },
                VARS.map(function(v) {
                    return el('button', { key:v.key, style:tabStyle(v.key) }, v.icon + ' ' + v.label);
                })
            ),

            // 3 input/result blocks
            el('div', { style:{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'12px', marginBottom:'22px' } },
                VARS.map(function(v) {
                    var isResult = v.key === solveFor;
                    return el('div', { key:v.key, style:inputBlockStyle(v) },
                        el('div', { style:{ fontSize:'11px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.06em', color:v.color, marginBottom:'6px' } },
                            v.icon + ' ' + v.label + (isResult?' (Result)':'')
                        ),
                        isResult ?
                            el('div', { style:{ fontSize:'28px', fontWeight:'700', color:v.color, margin:'4px 0 8px' } }, '—') :
                            el('input', { type:'number', readOnly:true, style:{ width:'100%', boxSizing:'border-box', border:'1.5px solid #e5e7eb', borderRadius:'8px', padding:'8px 10px', fontSize:'16px', background:a.inputBg, color:a.labelColor, marginBottom:'8px' }, placeholder:'Enter value…' }),
                        el('select', { readOnly:true, style:{ width:'100%', border:'1.5px solid #e5e7eb', borderRadius:'7px', padding:'6px 8px', fontSize:'13px', background:a.inputBg, color:a.labelColor } },
                            v.units.map(function(u){ return el('option', { key:u, selected:u===v.unit }, u); })
                        )
                    );
                })
            ),

            // Formula display
            a.showFormula && el('div', { style:{ background:a.cardBg, borderRadius:'10px', padding:'12px 16px', border:'1.5px solid #e5e7eb', display:'flex', gap:'20px', flexWrap:'wrap', justifyContent:'center' } },
                el('span', { style:{ fontSize:'13px', fontWeight:'600', color:a.speedColor } }, '⚡ Speed = Distance ÷ Time'),
                el('span', { style:{ fontSize:'13px', fontWeight:'600', color:a.distColor  } }, '📏 Distance = Speed × Time'),
                el('span', { style:{ fontSize:'13px', fontWeight:'600', color:a.timeColor  } }, '⏱️ Time = Distance ÷ Speed')
            ),

            // Unit conversions preview
            a.showUnitConversions && el('div', { style:{ marginTop:'16px', background:a.cardBg, borderRadius:'10px', padding:'12px 16px', border:'1.5px solid #e5e7eb' } },
                el('div', { style:{ fontSize:'12px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.06em', color:a.labelColor, marginBottom:'8px' } }, 'Speed Conversions'),
                el('div', { style:{ display:'flex', gap:'14px', flexWrap:'wrap' } },
                    ['1 km/h = 0.621 mph','1 mph = 1.609 km/h','1 m/s = 3.6 km/h','1 knot = 1.852 km/h'].map(function(s) {
                        return el('span', { key:s, style:{ fontSize:'12px', color:a.labelColor, background:'#f3f4f6', borderRadius:'6px', padding:'3px 9px' } }, s);
                    })
                )
            )
        );
    }

    registerBlockType('blockenberg/speed-calculator', {
        edit: function(props) {
            var a   = props.attributes;
            var set = props.setAttributes;

            var colorSettings = [
                { value:a.accentColor,   onChange:function(v){ set({accentColor:  v||'#3b82f6'}); }, label:'Accent / tab color'  },
                { value:a.speedColor,    onChange:function(v){ set({speedColor:   v||'#8b5cf6'}); }, label:'Speed field color'   },
                { value:a.distColor,     onChange:function(v){ set({distColor:    v||'#0ea5e9'}); }, label:'Distance field color'},
                { value:a.timeColor,     onChange:function(v){ set({timeColor:    v||'#22c55e'}); }, label:'Time field color'    },
                { value:a.sectionBg,     onChange:function(v){ set({sectionBg:   v||'#eff6ff'}); }, label:'Section background'  },
                { value:a.cardBg,        onChange:function(v){ set({cardBg:      v||'#ffffff'}); }, label:'Card background'     },
                { value:a.inputBg,       onChange:function(v){ set({inputBg:     v||'#f8fafc'}); }, label:'Input background'    },
                { value:a.resultBg,      onChange:function(v){ set({resultBg:    v||'#dbeafe'}); }, label:'Result background'   },
                { value:a.titleColor,    onChange:function(v){ set({titleColor:  v||'#111827'}); }, label:'Title color'         },
                { value:a.subtitleColor, onChange:function(v){ set({subtitleColor:v||'#6b7280'}); }, label:'Subtitle color'      },
                { value:a.labelColor,    onChange:function(v){ set({labelColor:  v||'#374151'}); }, label:'Label color'         }
            ];

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title:'Calculator Settings', initialOpen:true },
                        el(SelectControl, { label:'Default: Solve for', value:a.defaultSolveFor,
                            options:[{label:'Speed',value:'speed'},{label:'Distance',value:'dist'},{label:'Time',value:'time'}],
                            onChange:function(v){ set({defaultSolveFor:v}); } }),
                        el(SelectControl, { label:'Default Speed Unit', value:a.defaultSpeedUnit,
                            options:SPEED_UNITS.map(function(u){ return {label:u,value:u}; }),
                            onChange:function(v){ set({defaultSpeedUnit:v}); } }),
                        el(SelectControl, { label:'Default Distance Unit', value:a.defaultDistUnit,
                            options:DIST_UNITS.map(function(u){ return {label:u,value:u}; }),
                            onChange:function(v){ set({defaultDistUnit:v}); } }),
                        el(SelectControl, { label:'Default Time Unit', value:a.defaultTimeUnit,
                            options:TIME_UNITS.map(function(u){ return {label:u,value:u}; }),
                            onChange:function(v){ set({defaultTimeUnit:v}); } })
                    ),
                    el(PanelBody, { title:'Display Options', initialOpen:false },
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show formula reference', checked:a.showFormula,        onChange:function(v){ set({showFormula:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show unit conversions',  checked:a.showUnitConversions, onChange:function(v){ set({showUnitConversions:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show real-world examples', checked:a.showExamples,    onChange:function(v){ set({showExamples:v}); } })
                    ),
                    el(PanelBody, { title:'Sizing', initialOpen:false },
                        el(RangeControl, { label:'Max Width (px)',  value:a.contentMaxWidth, min:400, max:1100, step:20, onChange:function(v){ set({contentMaxWidth:v}); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() ? el(getTypoControl(), { label: __('Title Typography', 'blockenberg'), value: a.titleTypo || {}, onChange: function (v) { set({ titleTypo: v }); } }) : null,
                        getTypoControl() ? el(getTypoControl(), { label: __('Subtitle Typography', 'blockenberg'), value: a.subtitleTypo || {}, onChange: function (v) { set({ subtitleTypo: v }); } }) : null
                    ),
el(PanelColorSettings, { title:'Colors', initialOpen:false, disableCustomGradients:true, colorSettings:colorSettings })
                ),
                el('div', useBlockProps((function () {
                    var s = {};
                    var tv = getTypoCssVars();
                    if (tv) {
                        Object.assign(s, tv(a.titleTypo, '--bkspd-tt-'));
                        Object.assign(s, tv(a.subtitleTypo, '--bkspd-st-'));
                    }
                    return { style: s };
                })()),
                    el(EditorPreview, { attributes:a, setAttributes:set })
                )
            );
        },

        save: function(props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', {
                    className:   'bkbg-spd-app',
                    'data-opts': JSON.stringify({
                        title:               a.title,
                        subtitle:            a.subtitle,
                        defaultSolveFor:     a.defaultSolveFor,
                        defaultSpeedUnit:    a.defaultSpeedUnit,
                        defaultDistUnit:     a.defaultDistUnit,
                        defaultTimeUnit:     a.defaultTimeUnit,
                        showUnitConversions: a.showUnitConversions,
                        showFormula:         a.showFormula,
                        showExamples:        a.showExamples,
                        accentColor:         a.accentColor,
                        speedColor:          a.speedColor,
                        distColor:           a.distColor,
                        timeColor:           a.timeColor,
                        sectionBg:           a.sectionBg,
                        cardBg:              a.cardBg,
                        inputBg:             a.inputBg,
                        resultBg:            a.resultBg,
                        titleColor:          a.titleColor,
                        subtitleColor:       a.subtitleColor,
                        labelColor:          a.labelColor,
                        titleTypo:           a.titleTypo,
                        subtitleTypo:        a.subtitleTypo,
                        contentMaxWidth:     a.contentMaxWidth
                    })
                })
            );
        }
    });
}() );
