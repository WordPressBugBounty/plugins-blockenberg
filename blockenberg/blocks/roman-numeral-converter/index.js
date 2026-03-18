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
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    var VALS = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
    var SYMS = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];

    function toRoman(n) {
        n = parseInt(n);
        if (isNaN(n) || n < 1 || n > 3999) return '';
        var result = '';
        for (var i = 0; i < VALS.length; i++) {
            while (n >= VALS[i]) { result += SYMS[i]; n -= VALS[i]; }
        }
        return result;
    }

    function fromRoman(s) {
        s = s.toUpperCase().trim();
        if (!s) return NaN;
        var romanRe = /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
        if (!romanRe.test(s)) return NaN;
        var val = 0;
        var map = {M:1000,D:500,C:100,L:50,X:10,V:5,I:1};
        for (var i = 0; i < s.length; i++) {
            var cur = map[s[i]], next = map[s[i+1]];
            if (next && cur < next) { val -= cur; } else { val += cur; }
        }
        return val || NaN;
    }

    var REF = [{s:'I',v:1},{s:'V',v:5},{s:'X',v:10},{s:'L',v:50},{s:'C',v:100},{s:'D',v:500},{s:'M',v:1000}];

    function RNCPreview(props) {
        var a = props.attributes;
        var accent = a.accentColor || '#6c3fb5';
        var _mode = useState(a.defaultMode || 'toRoman'); var mode = _mode[0]; var setMode = _mode[1];
        var _val = useState(a.defaultValue || '2024'); var val = _val[0]; var setVal = _val[1];

        var output, error;
        if (mode === 'toRoman') {
            var n = parseInt(val);
            if (!val) { output = ''; }
            else if (isNaN(n) || n < 1 || n > 3999) { output = ''; error = 'Enter a number between 1 and 3,999'; }
            else { output = toRoman(n); }
        } else {
            if (!val) { output = ''; }
            else {
                var dec = fromRoman(val);
                if (isNaN(dec)) { output = ''; error = 'Invalid Roman numeral'; }
                else { output = String(dec); }
            }
        }

        var tabStyle = function(active) { return {
            padding:'8px 22px',border:'none',cursor:'pointer',fontWeight:700,fontSize:'14px',fontFamily:'inherit',transition:'all .15s',
            background: active ? (a.tabActiveBg||accent) : (a.tabInactiveBg||'#f3f4f6'),
            color:      active ? (a.tabActiveColor||'#fff') : (a.tabInactiveColor||'#374151')
        }; };

        return el('div',{style:{paddingTop:(a.paddingTop||60)+'px',paddingBottom:(a.paddingBottom||60)+'px',background:a.sectionBg||undefined}},
            el('div',{style:{background:a.cardBg||'#fff',borderRadius:(a.cardRadius||16)+'px',padding:'32px',maxWidth:(a.maxWidth||560)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,.09)'}},

                (a.showTitle||a.showSubtitle) && el('div',{style:{marginBottom:'22px'}},
                    a.showTitle    && el('div',{className:'bkbg-rnc-title',style:{color:a.titleColor,marginBottom:'6px'}},a.title),
                    a.showSubtitle && el('div',{className:'bkbg-rnc-subtitle',style:{color:a.subtitleColor}},a.subtitle)
                ),

                el('div',{style:{display:'flex',borderRadius:'10px',overflow:'hidden',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),marginBottom:'18px',width:'fit-content'}},
                    el('button',{style:tabStyle(mode==='toRoman'),onClick:function(){setMode('toRoman');setVal(a.defaultValue||'2024');}}, 'Number → Roman'),
                    el('button',{style:tabStyle(mode==='fromRoman'),onClick:function(){setMode('fromRoman');setVal(toRoman(parseInt(a.defaultValue||'2024')));}},'Roman → Number')
                ),

                el('div',{style:{marginBottom:'16px'}},
                    el('label',{style:{display:'block',fontSize:'12px',fontWeight:600,color:a.labelColor||'#374151',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'6px'}},
                        mode==='toRoman' ? 'Enter Integer (1 – 3,999)' : 'Enter Roman Numeral'),
                    el('input',{type:'text',value:val,onChange:function(e){setVal(e.target.value);},
                        style:{width:'100%',padding:'12px 14px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),borderRadius:(a.inputRadius||8)+'px',fontSize:'22px',fontFamily:'inherit',outline:'none',boxSizing:'border-box',textAlign:'center',fontWeight:700}})
                ),

                error && el('div',{style:{color:'#ef4444',fontSize:'13px',marginBottom:'10px',textAlign:'center'}},error),

                el('div',{style:{background:a.outputBg||'#f5f3ff',border:'1.5px solid '+(a.outputBorder||'#ede9fe'),borderRadius:(a.inputRadius||8)+'px',padding:'20px 16px',textAlign:'center',marginBottom:'16px',minHeight:'80px',display:'flex',flexDirection:'column',justifyContent:'center'}},
                    el('div',{style:{fontSize:'11px',fontWeight:700,color:a.labelColor||'#374151',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'8px'}},
                        mode==='toRoman' ? 'Roman Numeral' : 'Integer'),
                    output
                        ? el('div',{style:{fontSize:(a.outputFontSize||52)+'px',fontWeight:800,color:a.outputColor||'#3b0764',lineHeight:1,letterSpacing:'.06em',fontFamily:'serif'}},output)
                        : el('div',{style:{fontSize:'15px',color:'#9ca3af',fontStyle:'italic'}},'Result will appear here…')
                ),

                a.showCopyButton && output && el('div',{style:{marginBottom:'18px',textAlign:'center'}},
                    el('button',{onClick:function(){if(navigator.clipboard)navigator.clipboard.writeText(output);},style:{padding:'9px 24px',background:accent,color:'#fff',border:'none',borderRadius:'8px',fontWeight:700,cursor:'pointer',fontSize:'14px',fontFamily:'inherit'}},'📋 Copy Result')
                ),

                a.showReferenceTable && el('div',{style:{background:a.refBg||'#f9fafb',border:'1px solid '+(a.refBorder||'#e5e7eb'),borderRadius:'10px',padding:'14px 16px',marginBottom:'14px'}},
                    el('div',{style:{fontSize:'12px',fontWeight:700,color:a.labelColor||'#374151',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'10px'}},'Roman Numerals Reference'),
                    el('div',{style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'6px',textAlign:'center'}},
                        REF.map(function(r){
                            return el('div',{key:r.s,style:{background:'#fff',border:'1px solid '+(a.refBorder||'#e5e7eb'),borderRadius:'8px',padding:'8px 4px'}},
                                el('div',{style:{fontSize:'20px',fontWeight:800,color:accent,fontFamily:'serif'}},r.s),
                                el('div',{style:{fontSize:'12px',color:'#6b7280',marginTop:'2px'}},r.v.toLocaleString())
                            );
                        })
                    )
                ),

                a.showFunFact && el('div',{style:{fontSize:'13px',color:'#6b7280',textAlign:'center',fontStyle:'italic'}},
                    'Romans used these 7 symbols for numbers 1–3,999. Zero and negatives were not represented.')
            )
        );
    }

    registerBlockType('blockenberg/roman-numeral-converter', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {};
                if (_tv) {
                    Object.assign(s, _tv(a.titleTypo, '--bkrnc-tt-'));
                    Object.assign(s, _tv(a.subtitleTypo, '--bkrnc-st-'));
                }
                return { className: 'bkbg-rnc-wrap', style: s };
            })());
            var colorSettings = [
                {value:a.accentColor,     onChange:function(v){set({accentColor:v});},     label:'Accent Color'},
                {value:a.cardBg,          onChange:function(v){set({cardBg:v});},           label:'Card Background'},
                {value:a.outputBg,        onChange:function(v){set({outputBg:v});},         label:'Output Background'},
                {value:a.outputBorder,    onChange:function(v){set({outputBorder:v});},     label:'Output Border'},
                {value:a.outputColor,     onChange:function(v){set({outputColor:v});},      label:'Output Text Color'},
                {value:a.tabActiveBg,     onChange:function(v){set({tabActiveBg:v});},      label:'Active Tab Background'},
                {value:a.tabActiveColor,  onChange:function(v){set({tabActiveColor:v});},   label:'Active Tab Text'},
                {value:a.tabInactiveBg,   onChange:function(v){set({tabInactiveBg:v});},    label:'Inactive Tab Background'},
                {value:a.tabInactiveColor,onChange:function(v){set({tabInactiveColor:v});}, label:'Inactive Tab Text'},
                {value:a.refBg,           onChange:function(v){set({refBg:v});},            label:'Reference Background'},
                {value:a.refBorder,       onChange:function(v){set({refBorder:v});},        label:'Reference Border'},
                {value:a.inputBorder,     onChange:function(v){set({inputBorder:v});},      label:'Input Border'},
                {value:a.labelColor,      onChange:function(v){set({labelColor:v});},       label:'Label Color'},
                {value:a.titleColor,      onChange:function(v){set({titleColor:v});},       label:'Title Color'},
                {value:a.subtitleColor,   onChange:function(v){set({subtitleColor:v});},    label:'Subtitle Color'},
                {value:a.sectionBg,       onChange:function(v){set({sectionBg:v});},        label:'Section Background'}
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
                        el(SelectControl,{label:'Default Mode',value:a.defaultMode,options:[{label:'Number → Roman',value:'toRoman'},{label:'Roman → Number',value:'fromRoman'}],onChange:function(v){set({defaultMode:v});}}),
                        el(TextControl,{label:'Default Value',value:a.defaultValue,onChange:function(v){set({defaultValue:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Copy Button',     checked:a.showCopyButton,    onChange:function(v){set({showCopyButton:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Reference Table', checked:a.showReferenceTable,onChange:function(v){set({showReferenceTable:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Fun Fact',        checked:a.showFunFact,       onChange:function(v){set({showFunFact:v});}})
                    ),
                    
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Title Typography', 'blockenberg'),
                            value: a.titleTypo || {},
                            onChange: function (v) { set({ titleTypo: v }); }
                        }),
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Subtitle Typography', 'blockenberg'),
                            value: a.subtitleTypo || {},
                            onChange: function (v) { set({ subtitleTypo: v }); }
                        }),
                        el(RangeControl, { label: 'Output Font Size', value: a.outputFontSize, min: 20, max: 96, step: 2, onChange: function (v) { set({ outputFontSize: v }); } })
                    ),
el(PanelColorSettings,{title:'Colors',initialOpen:false,colorSettings:colorSettings}),
                    el(PanelBody,{title:'Sizing & Layout',initialOpen:false},
                        el(RangeControl,{label:'Card Border Radius',value:a.cardRadius,    min:0, max:40,step:1,  onChange:function(v){set({cardRadius:v});}}),
                        el(RangeControl,{label:'Input Border Radius',value:a.inputRadius,  min:0, max:20,step:1,  onChange:function(v){set({inputRadius:v});}}),
                        el(RangeControl,{label:'Max Width (px)',    value:a.maxWidth,       min:300,max:900,step:10,onChange:function(v){set({maxWidth:v});}}),
                        el(RangeControl,{label:'Padding Top',       value:a.paddingTop,     min:0, max:160,step:4, onChange:function(v){set({paddingTop:v});}}),
                        el(RangeControl,{label:'Padding Bottom',    value:a.paddingBottom,  min:0, max:160,step:4, onChange:function(v){set({paddingBottom:v});}})
                    )
                ),
                el('div', blockProps, el(RNCPreview, {attributes:a}))
            );
        },
        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div',{className:'bkbg-rnc-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
