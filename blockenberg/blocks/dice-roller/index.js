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
    var ToggleControl      = wp.components.ToggleControl;
    var SelectControl      = wp.components.SelectControl;

    var _drTC, _drTV;
    function _tc() { return _drTC || (_drTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_drTV || (_drTV = window.bkbgTypoCssVars)) ? _drTV(t, p) : {}; }

    var DICE_TYPES = ['d4','d6','d8','d10','d12','d20','d100'];

    var DIE_SYMBOLS = { d4:'▲', d6:'⬡', d8:'◆', d10:'◈', d12:'⬟', d20:'⬡', d100:'●' };

    function EditorPreview(props) {
        var a = props.attributes;

        var wrapStyle = {
            background:  a.sectionBg,
            borderRadius:'16px',
            padding:     '32px 24px',
            maxWidth:    a.contentMaxWidth + 'px',
            margin:      '0 auto',
            fontFamily:  'inherit',
            boxSizing:   'border-box',
            textAlign:   'center'
        };

        // Fake dice
        var fakeDice = Array.from({ length: a.defaultCount }, function (_, i) { return i + 1; });

        return el('div', { style: wrapStyle },
            a.showTitle && el(RichText, {
                tagName:'h3', value:a.title,
                className:'bkbg-dr-title',
                onChange:function(v){ props.setAttributes({title:v}); },
                style:{ color:a.titleColor, margin:'0 0 5px 0' },
                placeholder:'Title…'
            }),
            a.showSubtitle && el(RichText, {
                tagName:'p', value:a.subtitle,
                className:'bkbg-dr-subtitle',
                onChange:function(v){ props.setAttributes({subtitle:v}); },
                style:{ color:a.subtitleColor, margin:'0 0 18px 0' },
                placeholder:'Subtitle…'
            }),

            // Controls row
            el('div', { style:{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap', marginBottom:'16px', alignItems:'center' } },
                el('div', { style:{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'3px' } },
                    el('label', { style:{ fontSize:'11px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'.06em', color:a.labelColor } }, 'Die Type'),
                    el('select', { style:{ padding:'7px 12px', borderRadius:'8px', border:'1.5px solid #e5e7eb', fontSize:'14px', fontWeight:'700', color:a.labelColor, background:'#fff' } },
                        DICE_TYPES.map(function (d) {
                            return el('option', { key:d, selected:d===a.defaultDie }, d);
                        })
                    )
                ),
                el('div', { style:{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'3px' } },
                    el('label', { style:{ fontSize:'11px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'.06em', color:a.labelColor } }, 'Number'),
                    el('div', { style:{ display:'flex', gap:'6px', alignItems:'center' } },
                        el('button', { style:{ width:'30px', height:'30px', borderRadius:'7px', border:'1.5px solid #e5e7eb', background:'#f9fafb', fontWeight:'700', fontSize:'16px', cursor:'pointer' } }, '−'),
                        el('span', { style:{ fontWeight:'700', fontSize:'16px', color:a.labelColor, width:'24px', textAlign:'center' } }, a.defaultCount),
                        el('button', { style:{ width:'30px', height:'30px', borderRadius:'7px', border:'1.5px solid #e5e7eb', background:'#f9fafb', fontWeight:'700', fontSize:'16px', cursor:'pointer' } }, '+')
                    )
                ),
                a.showModifier && el('div', { style:{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'3px' } },
                    el('label', { style:{ fontSize:'11px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'.06em', color:a.labelColor } }, 'Modifier'),
                    el('input', { type:'number', readOnly:true, style:{ width:'60px', padding:'7px 8px', borderRadius:'8px', border:'1.5px solid #e5e7eb', fontSize:'14px', textAlign:'center' }, defaultValue:'0' })
                )
            ),

            // Roll button
            el('button', {
                style:{ padding:'13px 36px', borderRadius:'12px', border:'none', background:a.accentColor, color:'#fff', fontWeight:'800', fontSize:'16px', cursor:'pointer', marginBottom:'18px', letterSpacing:'.02em', boxShadow:'0 4px 12px rgba(220,38,38,.3)' }
            }, '🎲 Roll ' + a.defaultDie),

            // Dice display
            el('div', { style:{ display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'center', marginBottom:'16px' } },
                fakeDice.map(function (v) {
                    return el('div', { key:v,
                        style:{ width:'64px', height:'64px', borderRadius:'14px', background:a.dieColor, color:a.dieFace, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:'800', boxShadow:'0 4px 10px rgba(0,0,0,.25)', fontFamily:"'Courier New', monospace" }
                    }, v);
                })
            ),

            // Total
            a.showTotal && el('div', { style:{ background:a.totalBg, borderRadius:'12px', padding:'14px 20px', display:'inline-flex', gap:'16px', alignItems:'center', marginBottom:'16px' } },
                el('span', { style:{ fontSize:'13px', fontWeight:'600', color:a.labelColor } }, 'Total'),
                el('span', { style:{ fontSize:'32px', fontWeight:'800', color:a.totalColor } }, fakeDice.reduce(function (s,v){ return s+v; }, 0))
            ),

            // History
            a.showHistory && el('div', { style:{ background:a.histBg, borderRadius:'10px', border:'1.5px solid #e5e7eb', padding:'0', overflow:'hidden' } },
                el('div', { style:{ padding:'8px 14px', fontSize:'11px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'.06em', color:a.labelColor, background:'#f3f4f6', display:'flex', justifyContent:'space-between' } },
                    el('span', null, 'Roll History'),
                    el('span', null, '3 rolls')
                ),
                ['Roll 3 — 2d6 — [4, 6] = 10','Roll 2 — 2d6 — [2, 5] = 7','Roll 1 — 2d6 — [3, 3] = 6'].map(function (row, i) {
                    return el('div', { key:i, style:{ padding:'7px 14px', fontSize:'13px', color:a.labelColor, borderTop:'1px solid #e5e7eb', display:'flex', justifyContent:'space-between' } },
                        el('span', null, row),
                        el('button', { style:{ background:'none', border:'none', color:a.accentColor, fontSize:'11px', fontWeight:'600', cursor:'pointer' } }, '↺ reroll')
                    );
                })
            )
        );
    }

    registerBlockType('blockenberg/dice-roller', {
        edit: function (props) {
            var a   = props.attributes;
            var set = props.setAttributes;

            var colorSettings = [
                { value:a.accentColor,   onChange:function(v){set({accentColor:  v||'#dc2626'});}, label:'Accent / roll button'   },
                { value:a.dieColor,      onChange:function(v){set({dieColor:     v||'#1e1b4b'});}, label:'Die face background'    },
                { value:a.dieFace,       onChange:function(v){set({dieFace:      v||'#ffffff'});}, label:'Die number color'       },
                { value:a.totalBg,       onChange:function(v){set({totalBg:      v||'#fef2f2'});}, label:'Total background'       },
                { value:a.totalColor,    onChange:function(v){set({totalColor:   v||'#dc2626'});}, label:'Total number color'     },
                { value:a.histBg,        onChange:function(v){set({histBg:       v||'#f9fafb'});}, label:'History background'     },
                { value:a.sectionBg,     onChange:function(v){set({sectionBg:    v||'#fff1f2'});}, label:'Section background'     },
                { value:a.cardBg,        onChange:function(v){set({cardBg:       v||'#ffffff'});}, label:'Card background'        },
                { value:a.titleColor,    onChange:function(v){set({titleColor:   v||'#111827'});}, label:'Title color'            },
                { value:a.subtitleColor, onChange:function(v){set({subtitleColor:v||'#6b7280'});}, label:'Subtitle color'         },
                { value:a.labelColor,    onChange:function(v){set({labelColor:   v||'#374151'});}, label:'Label color'            }
            ];

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title:'Dice Settings', initialOpen:true },
                        el(SelectControl, {
                            label:'Default die type',
                            value:a.defaultDie,
                            options:DICE_TYPES.map(function(d){ return {label:d,value:d}; }),
                            onChange:function(v){set({defaultDie:v});}
                        }),
                        el(RangeControl, { label:'Default die count', value:a.defaultCount, min:1, max:10, onChange:function(v){set({defaultCount:v});} }),
                        el(RangeControl, { label:'History shown',      value:a.historySize, min:3, max:20, onChange:function(v){set({historySize:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show title',      checked:a.showTitle,    onChange:function(v){set({showTitle:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show subtitle',   checked:a.showSubtitle, onChange:function(v){set({showSubtitle:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show total',      checked:a.showTotal,    onChange:function(v){set({showTotal:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show modifier',   checked:a.showModifier, onChange:function(v){set({showModifier:v});} }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show roll history',checked:a.showHistory, onChange:function(v){set({showHistory:v});} })
                    ),
                    el(PanelBody, { title:'Sizing', initialOpen:false },
                        el(RangeControl, { label:'Max width (px)',  value:a.contentMaxWidth, min:320, max:900, step:20, onChange:function(v){set({contentMaxWidth:v});} })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Title'), typo: a.typoTitle || {}, onChange: function(v) { set({ typoTitle: v }); }, defaultSize: a.titleFontSize || 26 }),
                        _tc() && el(_tc(), { label: __('Subtitle'), typo: a.typoSubtitle || {}, onChange: function(v) { set({ typoSubtitle: v }); }, defaultSize: a.subtitleFontSize || 14 })
                    ),
el(PanelColorSettings, { title:'Colors', initialOpen:false, disableCustomGradients:true, colorSettings:colorSettings })
                ),
                el('div', useBlockProps({ style: Object.assign(
                    { '--bkbg-dr-ttl-fs': (a.titleFontSize || 26) + 'px',
                      '--bkbg-dr-sub-fs': (a.subtitleFontSize || 14) + 'px' },
                    _tv(a.typoTitle || {}, '--bkbg-dr-ttl-'),
                    _tv(a.typoSubtitle || {}, '--bkbg-dr-sub-')
                ) }),
                    el(EditorPreview, { attributes:a, setAttributes:set })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', {
                    className:   'bkbg-dr-app',
                    'data-opts': JSON.stringify({
                        title:          a.title,
                        subtitle:       a.subtitle,
                        showTitle:      a.showTitle,
                        showSubtitle:   a.showSubtitle,
                        showHistory:    a.showHistory,
                        showTotal:      a.showTotal,
                        showModifier:   a.showModifier,
                        defaultDie:     a.defaultDie,
                        defaultCount:   a.defaultCount,
                        historySize:    a.historySize,
                        accentColor:    a.accentColor,
                        dieColor:       a.dieColor,
                        dieFace:        a.dieFace,
                        totalBg:        a.totalBg,
                        totalColor:     a.totalColor,
                        histBg:         a.histBg,
                        sectionBg:      a.sectionBg,
                        cardBg:         a.cardBg,
                        titleColor:     a.titleColor,
                        subtitleColor:  a.subtitleColor,
                        labelColor:     a.labelColor,
                        titleFontSize:  a.titleFontSize,
                        titleFontWeight: a.titleFontWeight,
                        titleLineHeight: a.titleLineHeight,
                        subtitleFontSize: a.subtitleFontSize,
                        subtitleFontWeight: a.subtitleFontWeight,
                        subtitleLineHeight: a.subtitleLineHeight,
                        contentMaxWidth:a.contentMaxWidth,
                        typoTitle:      a.typoTitle,
                        typoSubtitle:   a.typoSubtitle
                    })
                })
            );
        }
    });
}() );
