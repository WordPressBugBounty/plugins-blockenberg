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

    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
    }

    function EditorPreview(props) {
        var a    = props.attributes;
        var mode = a.defaultMode;

        var _tv = getTypoCssVars();
        var wrapStyle = {
            background:   a.sectionBg,
            borderRadius: '14px',
            padding:      '32px 24px',
            maxWidth:     a.contentMaxWidth + 'px',
            margin:       '0 auto',
            fontFamily:   'inherit',
            boxSizing:    'border-box'
        };
        Object.assign(wrapStyle, _tv(a.titleTypo || {}, '--bkbg-b64-title-'));
        Object.assign(wrapStyle, _tv(a.subtitleTypo || {}, '--bkbg-b64-sub-'));

        var tabStyle = function(m) {
            var active = m === mode;
            return {
                padding: '8px 22px', borderRadius: '8px',
                border:  '2px solid ' + (active ? a.accentColor : '#e5e7eb'),
                background: active ? a.accentColor : a.cardBg,
                color:   active ? '#fff' : a.labelColor,
                fontWeight: active ? '700' : '500', fontSize:'14px', cursor:'pointer'
            };
        };

        var textareaStyle = {
            width:'100%', boxSizing:'border-box', border:'1.5px solid #e5e7eb',
            borderRadius:'10px', padding:'12px 14px', fontSize:'14px',
            background: a.inputBg, color: a.labelColor,
            resize:'vertical', minHeight:'100px', fontFamily:'inherit', marginBottom:'14px'
        };

        var outputStyle = {
            background:   a.outputBg,
            borderRadius: '10px',
            padding:      '14px 16px',
            fontFamily:   'monospace',
            fontSize:     '13px',
            color:        a.outputColor,
            wordBreak:    'break-all',
            lineHeight:   '1.7',
            minHeight:    '70px'
        };

        return el('div', { style: wrapStyle },
            el(RichText, { tagName:'h3', className:'bkbg-b64-title', value:a.title, onChange:function(v){ props.setAttributes({title:v}); },
                style:{ color:a.titleColor, margin:'0 0 6px 0' }, placeholder:'Block title...' }),
            el(RichText, { tagName:'p', className:'bkbg-b64-subtitle', value:a.subtitle, onChange:function(v){ props.setAttributes({subtitle:v}); },
                style:{ color:a.subtitleColor, margin:'0 0 20px 0' }, placeholder:'Subtitle...' }),

            // Mode tabs
            el('div', { style:{ display:'flex', gap:'8px', marginBottom:'20px' } },
                el('button', { style: tabStyle('encode') }, '⬆ Encode'),
                el('button', { style: tabStyle('decode') }, '⬇ Decode')
            ),

            // Input
            el('label', { style:{ display:'block', fontSize:'13px', fontWeight:'600', color:a.labelColor, marginBottom:'6px' } },
                mode === 'encode' ? 'Plain Text' : 'Base64 String'),
            el('textarea', { style: textareaStyle, readOnly:true, placeholder: mode==='encode' ? 'Enter text to encode…' : 'Enter Base64 to decode…' }),

            // Options row
            el('div', { style:{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'16px', alignItems:'center' } },
                a.showUrlSafe && el('label', { style:{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', color:a.labelColor, cursor:'pointer' } },
                    el('input', { type:'checkbox', readOnly:true, style:{ accentColor:a.accentColor } }),
                    'URL-safe Base64'
                ),
                a.showLineBreaks && el('label', { style:{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', color:a.labelColor, cursor:'pointer' } },
                    el('input', { type:'checkbox', readOnly:true, defaultChecked:false, style:{ accentColor:a.accentColor } }),
                    'Add line breaks (76 chars)'
                )
            ),

            // Output
            el('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' } },
                el('span', { style:{ fontSize:'13px', fontWeight:'600', color:a.labelColor } }, mode==='encode' ? 'Base64 Output' : 'Decoded Text'),
                el('button', { style:{ background:'none', border:'1.5px solid '+a.accentColor, borderRadius:'7px', padding:'4px 12px', color:a.accentColor, fontSize:'12px', cursor:'pointer', fontWeight:'600' } }, '⧉ Copy')
            ),
            el('div', { style: outputStyle }, mode==='encode' ? 'Base64 output will appear here…' : 'Decoded text will appear here…'),

            // Stats
            a.showStats && el('div', { style:{ display:'flex', gap:'20px', marginTop:'14px', flexWrap:'wrap' } },
                el('span', { style:{ fontSize:'12px', color:a.labelColor } }, 'Input length: 0 chars'),
                el('span', { style:{ fontSize:'12px', color:a.labelColor } }, 'Output length: 0 chars'),
                el('span', { style:{ fontSize:'12px', color:a.labelColor } }, 'Size ratio: —')
            )
        );
    }

    registerBlockType('blockenberg/base64-encoder', {
        edit: function(props) {
            var a   = props.attributes;
            var set = props.setAttributes;
            var TC  = getTypographyControl();

            var colorSettings = [
                { value:a.accentColor,   onChange:function(v){ set({accentColor:   v||'#0ea5e9'}); }, label:'Accent color'        },
                { value:a.sectionBg,     onChange:function(v){ set({sectionBg:     v||'#f0f9ff'}); }, label:'Section background'  },
                { value:a.cardBg,        onChange:function(v){ set({cardBg:        v||'#ffffff'}); }, label:'Card background'     },
                { value:a.inputBg,       onChange:function(v){ set({inputBg:       v||'#f8fafc'}); }, label:'Input background'    },
                { value:a.outputBg,      onChange:function(v){ set({outputBg:      v||'#0f172a'}); }, label:'Output background'   },
                { value:a.outputColor,   onChange:function(v){ set({outputColor:   v||'#7dd3fc'}); }, label:'Output text color'   },
                { value:a.titleColor,    onChange:function(v){ set({titleColor:    v||'#0c4a6e'}); }, label:'Title color'         },
                { value:a.subtitleColor, onChange:function(v){ set({subtitleColor: v||'#6b7280'}); }, label:'Subtitle color'      },
                { value:a.labelColor,    onChange:function(v){ set({labelColor:    v||'#374151'}); }, label:'Label color'         }
            ];

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title:'Tool Settings', initialOpen:true },
                        el(SelectControl, {
                            label:'Default Mode', value:a.defaultMode,
                            options:[ {label:'Encode (Text → Base64)', value:'encode'}, {label:'Decode (Base64 → Text)', value:'decode'} ],
                            onChange:function(v){ set({defaultMode:v}); }
                        }),
                        el(TextControl, { label:'Prefilled Input', value:a.defaultInput, onChange:function(v){ set({defaultInput:v}); } })
                    ),
                    el(PanelBody, { title:'Display Options', initialOpen:false },
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show URL-safe option',      checked:a.showUrlSafe,    onChange:function(v){ set({showUrlSafe:   v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show line-break option',    checked:a.showLineBreaks, onChange:function(v){ set({showLineBreaks:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom:true, label:'Show character stats',      checked:a.showStats,      onChange:function(v){ set({showStats:     v}); } })
                    ),
                    el(PanelBody, { title:'Sizing', initialOpen:false },
                        el(RangeControl, { label:'Max Width (px)',  value:a.contentMaxWidth, min:400, max:1100, step:20, onChange:function(v){ set({contentMaxWidth:v}); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        TC && el(TC, { label: __('Title', 'blockenberg'), value: a.titleTypo || {}, onChange: function(v){ set({titleTypo: v}); } }),
                        TC && el(TC, { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo || {}, onChange: function(v){ set({subtitleTypo: v}); } })
                    ),
el(PanelColorSettings, { title:'Colors', initialOpen:false, disableCustomGradients:true, colorSettings:colorSettings })
                ),
                el('div', useBlockProps(),
                    el(EditorPreview, { attributes:a, setAttributes:set })
                )
            );
        },

        save: function(props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', {
                    className:   'bkbg-b64-app',
                    'data-opts': JSON.stringify({
                        title:          a.title,
                        subtitle:       a.subtitle,
                        defaultMode:    a.defaultMode,
                        defaultInput:   a.defaultInput,
                        showUrlSafe:    a.showUrlSafe,
                        showLineBreaks: a.showLineBreaks,
                        showStats:      a.showStats,
                        accentColor:    a.accentColor,
                        sectionBg:      a.sectionBg,
                        cardBg:         a.cardBg,
                        inputBg:        a.inputBg,
                        outputBg:       a.outputBg,
                        outputColor:    a.outputColor,
                        titleColor:     a.titleColor,
                        subtitleColor:  a.subtitleColor,
                        labelColor:     a.labelColor,
                        titleFontSize:  a.titleFontSize,
                        contentMaxWidth:a.contentMaxWidth,
                        titleTypo:      a.titleTypo || {},
                        subtitleTypo:   a.subtitleTypo || {}
                    })
                })
            );
        }
    });
}() );
