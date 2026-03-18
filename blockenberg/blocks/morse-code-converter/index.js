( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var __                 = wp.i18n.__;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var MORSE_MAP = {
        'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---',
        'K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-',
        'U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..',
        '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
        ' ':'/'
    };
    var REVERSE_MAP = {};
    Object.keys(MORSE_MAP).forEach(function(k){ REVERSE_MAP[MORSE_MAP[k]] = k; });

    function toMorse(text) {
        return text.toUpperCase().split('').map(function(c){
            return MORSE_MAP[c] || '';
        }).join(' ').replace(/  +/g,' ');
    }

    function fromMorse(morse) {
        return morse.trim().split(' / ').map(function(word){
            return word.trim().split(' ').map(function(code){
                return REVERSE_MAP[code.trim()] || '';
            }).join('');
        }).join(' ');
    }

    function MCPreview(props) {
        var a = props.attributes;
        var accent = a.accentColor || '#6c3fb5';
        var _mode = useState(a.defaultMode || 'encode'); var mode = _mode[0]; var setMode = _mode[1];
        var _input = useState(a.defaultText || 'Hello World'); var input = _input[0]; var setInput = _input[1];

        var output = mode === 'encode' ? toMorse(input) : fromMorse(input);

        var tabStyle = function(active) { return {
            padding: '8px 22px', border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '14px', fontFamily: 'inherit',
            transition: 'all .15s',
            background: active ? (a.tabActiveBg || accent) : (a.tabInactiveBg || '#f3f4f6'),
            color:      active ? (a.tabActiveColor || '#fff') : (a.tabInactiveColor || '#374151')
        }; };

        var CHARS = Object.keys(MORSE_MAP).filter(function(k){ return k !== ' '; });

        return el('div', {style:{paddingTop:(a.paddingTop||60)+'px',paddingBottom:(a.paddingBottom||60)+'px',background:a.sectionBg||undefined}},
            el('div', {style:{background:a.cardBg,borderRadius:(a.cardRadius||16)+'px',padding:'32px',maxWidth:(a.maxWidth||620)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,.09)'}},

                (a.showTitle||a.showSubtitle) && el('div',{className:'bkbg-mcc-header'},
                    a.showTitle    && el('div',{className:'bkbg-mcc-title',style:{color:a.titleColor}},a.title),
                    a.showSubtitle && el('div',{className:'bkbg-mcc-subtitle',style:{color:a.subtitleColor}},a.subtitle)
                ),

                // Mode tabs
                el('div',{style:{display:'flex',borderRadius:'10px',overflow:'hidden',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),marginBottom:'16px',width:'fit-content'}},
                    el('button',{style:tabStyle(mode==='encode'),onClick:function(){setMode('encode');setInput(a.defaultText||'Hello World');}}, 'Text → Morse'),
                    el('button',{style:tabStyle(mode==='decode'),onClick:function(){setMode('decode');setInput(toMorse(a.defaultText||'Hello World'));}}, 'Morse → Text')
                ),

                // Input
                el('div',{style:{marginBottom:'12px'}},
                    el('label',{style:{display:'block',fontSize:'12px',fontWeight:600,color:a.labelColor||'#374151',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'5px'}},
                        mode==='encode' ? 'Enter Text' : 'Enter Morse Code (use / between words)'),
                    el('textarea',{
                        value:input, rows:3,
                        onChange:function(e){setInput(e.target.value);},
                        style:{width:'100%',padding:'10px 12px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),borderRadius:(a.inputRadius||8)+'px',fontSize:'15px',fontFamily:'inherit',resize:'vertical',outline:'none',boxSizing:'border-box'}
                    })
                ),

                // Output
                el('div',{style:{background:a.outputBg||'#f5f3ff',border:'1.5px solid '+(a.outputBorder||'#ede9fe'),borderRadius:(a.inputRadius||8)+'px',padding:'14px 16px',marginBottom:'14px',minHeight:'60px'}},
                    el('div',{style:{fontSize:'11px',fontWeight:700,color:a.labelColor||'#374151',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'6px'}},mode==='encode'?'Morse Code':'Decoded Text'),
                    el('div',{className:'bkbg-mcc-output-text',style:{color:a.outputColor||'#3b0764'}},
                        output || el('span',{style:{opacity:.4,fontStyle:'italic',fontFamily:'inherit'}},'Output will appear here…'))
                ),

                // Action buttons row
                (a.showCopyButton || a.showPlayButton) && el('div',{style:{display:'flex',gap:'8px',marginBottom:'20px'}},
                    a.showCopyButton && el('button',{onClick:function(){},style:{padding:'8px 18px',background:accent,color:'#fff',border:'none',borderRadius:'8px',fontWeight:700,cursor:'pointer',fontSize:'13px',fontFamily:'inherit'}}, '📋 Copy'),
                    a.showPlayButton && el('button',{onClick:function(){},style:{padding:'8px 18px',background:'#f3f4f6',color:'#374151',border:'1.5px solid #e5e7eb',borderRadius:'8px',fontWeight:700,cursor:'pointer',fontSize:'13px',fontFamily:'inherit'}}, '🔊 Play Audio')
                ),

                // Reference table
                a.showReference && el('details',{style:{border:'1px solid '+(a.refBorder||'#e5e7eb'),borderRadius:'10px',overflow:'hidden'}},
                    el('summary',{style:{padding:'10px 16px',fontWeight:700,fontSize:'13px',color:a.labelColor||'#374151',cursor:'pointer',background:a.refBg||'#f9fafb',userSelect:'none'}}, 'Morse Code Reference (A–Z, 0–9)'),
                    el('div',{style:{padding:'12px 16px',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))',gap:'5px',background:a.refBg||'#f9fafb'}},
                        CHARS.map(function(c){
                            return el('div',{key:c,style:{textAlign:'center',padding:'5px 2px',borderRadius:'6px',background:'#fff',border:'1px solid '+(a.refBorder||'#e5e7eb')}},
                                el('div',{style:{fontWeight:800,fontSize:'14px',color:accent}},c),
                                el('div',{style:{fontFamily:'monospace',fontSize:'11px',color:'#6b7280',marginTop:'2px'}},MORSE_MAP[c])
                            );
                        })
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/morse-code-converter', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                Object.assign(s, _tvf(a.titleTypo, '--bkbg-mcc-tt-'));
                Object.assign(s, _tvf(a.subtitleTypo, '--bkbg-mcc-st-'));
                Object.assign(s, _tvf(a.outputTypo, '--bkbg-mcc-ot-'));
                return { style: s };
            })());
            var colorSettings = [
                {value:a.accentColor,      onChange:function(v){set({accentColor:v});},      label:'Accent Color'},
                {value:a.cardBg,           onChange:function(v){set({cardBg:v});},            label:'Card Background'},
                {value:a.outputBg,         onChange:function(v){set({outputBg:v});},          label:'Output Background'},
                {value:a.outputBorder,     onChange:function(v){set({outputBorder:v});},      label:'Output Border'},
                {value:a.outputColor,      onChange:function(v){set({outputColor:v});},       label:'Output Text Color'},
                {value:a.tabActiveBg,      onChange:function(v){set({tabActiveBg:v});},       label:'Active Tab Background'},
                {value:a.tabActiveColor,   onChange:function(v){set({tabActiveColor:v});},    label:'Active Tab Text'},
                {value:a.tabInactiveBg,    onChange:function(v){set({tabInactiveBg:v});},     label:'Inactive Tab Background'},
                {value:a.tabInactiveColor, onChange:function(v){set({tabInactiveColor:v});},  label:'Inactive Tab Text'},
                {value:a.refBg,            onChange:function(v){set({refBg:v});},             label:'Reference Background'},
                {value:a.refBorder,        onChange:function(v){set({refBorder:v});},         label:'Reference Border'},
                {value:a.inputBorder,      onChange:function(v){set({inputBorder:v});},       label:'Input Border'},
                {value:a.labelColor,       onChange:function(v){set({labelColor:v});},        label:'Label Color'},
                {value:a.titleColor,       onChange:function(v){set({titleColor:v});},        label:'Title Color'},
                {value:a.subtitleColor,    onChange:function(v){set({subtitleColor:v});},     label:'Subtitle Color'},
                {value:a.sectionBg,        onChange:function(v){set({sectionBg:v});},         label:'Section Background'}
            ];
            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody,{title:'Header',initialOpen:false},
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Title',   checked:a.showTitle,   onChange:function(v){set({showTitle:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Subtitle',checked:a.showSubtitle,onChange:function(v){set({showSubtitle:v});}}),
                        el(TextControl,{label:'Title',   value:a.title,   onChange:function(v){set({title:v});}}),
                        el(TextControl,{label:'Subtitle',value:a.subtitle,onChange:function(v){set({subtitle:v});}})
                    ),
                    el(PanelBody,{title:'Converter Settings',initialOpen:true},
                        el(SelectControl,{label:'Default Mode',value:a.defaultMode,options:[{label:'Text → Morse (Encode)',value:'encode'},{label:'Morse → Text (Decode)',value:'decode'}],onChange:function(v){set({defaultMode:v});}}),
                        el(TextControl,{label:'Default Input Text',value:a.defaultText,onChange:function(v){set({defaultText:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Copy Button', checked:a.showCopyButton, onChange:function(v){set({showCopyButton:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Play Audio Button',checked:a.showPlayButton,onChange:function(v){set({showPlayButton:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Reference Table',  checked:a.showReference,  onChange:function(v){set({showReference:v});}})
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypoControl(), { label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }),
                        el(getTypoControl(), { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo, onChange: function (v) { set({ subtitleTypo: v }); } }),
                        el(getTypoControl(), { label: __('Output', 'blockenberg'), value: a.outputTypo, onChange: function (v) { set({ outputTypo: v }); } })
                    ),
el(PanelColorSettings,{title:'Colors',initialOpen:false,colorSettings:colorSettings}),
                    el(PanelBody,{title:'Sizing & Layout',initialOpen:false},
                        el(RangeControl,{label:'Card Border Radius',value:a.cardRadius,    min:0, max:40,step:1,  onChange:function(v){set({cardRadius:v});}}),
                        el(RangeControl,{label:'Input Border Radius',value:a.inputRadius,  min:0, max:20,step:1,  onChange:function(v){set({inputRadius:v});}}),
                        el(RangeControl,{label:'Max Width (px)',    value:a.maxWidth,       min:360,max:1000,step:10,onChange:function(v){set({maxWidth:v});}}),
                        el(RangeControl,{label:'Padding Top',       value:a.paddingTop,     min:0, max:160,step:4, onChange:function(v){set({paddingTop:v});}}),
                        el(RangeControl,{label:'Padding Bottom',    value:a.paddingBottom,  min:0, max:160,step:4, onChange:function(v){set({paddingBottom:v});}})
                    )
                ),
                el('div', blockProps, el(MCPreview, {attributes:a}))
            );
        },
        deprecated: [{
            save: function(props) {
                var a = props.attributes;
                return el('div', wp.blockEditor.useBlockProps.save(),
                    el('div',{className:'bkbg-mcc-app','data-opts':JSON.stringify(a)}));
            }
        }],

        save: function(props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                Object.assign(s, _tvf(a.titleTypo, '--bkbg-mcc-tt-'));
                Object.assign(s, _tvf(a.subtitleTypo, '--bkbg-mcc-st-'));
                Object.assign(s, _tvf(a.outputTypo, '--bkbg-mcc-ot-'));
                return { style: s };
            })());
            return el('div', blockProps,
                el('div',{className:'bkbg-mcc-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
