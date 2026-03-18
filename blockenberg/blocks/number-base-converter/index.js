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
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    var BASES = [
        {key:'binary',  label:'Binary',      base:2,  prefix:'0b', color:'binaryColor',  dfltColor:'#3b82f6', validate:/^[01]*$/,         hint:'0–1'},
        {key:'octal',   label:'Octal',       base:8,  prefix:'0o', color:'octalColor',   dfltColor:'#f59e0b', validate:/^[0-7]*$/,        hint:'0–7'},
        {key:'decimal', label:'Decimal',     base:10, prefix:'',   color:'decimalColor', dfltColor:'#6c3fb5', validate:/^[0-9]*$/,        hint:'0–9'},
        {key:'hex',     label:'Hexadecimal', base:16, prefix:'0x', color:'hexColor',     dfltColor:'#10b981', validate:/^[0-9A-Fa-f]*$/, hint:'0–9 A–F'}
    ];

    function toDecimal(str, base) { return str ? parseInt(str, base) : NaN; }
    function fromDecimal(n, base) {
        if (isNaN(n) || n < 0) return '';
        return n.toString(base).toUpperCase();
    }
    function bitLen(n, bits) { return isNaN(n) ? '—' : (n >>> 0).toString(2).padStart(bits, '0'); }

    function NBCPreview(props) {
        var a = props.attributes;
        var _vals = useState({binary:'11111111', octal:'377', decimal:'255', hex:'FF'});
        var vals = _vals[0]; var setVals = _vals[1];
        var _active = useState('decimal');
        var active = _active[0]; var setActive = _active[1];

        function handleChange(key, base, raw) {
            var clean = raw.replace(/\s/g,'').toUpperCase();
            var binfo = BASES.find(function(b){ return b.key===key; });
            if (!binfo.validate.test(clean) && clean !== '') return;
            var dec = toDecimal(clean, base);
            var next = {};
            BASES.forEach(function(b){ next[b.key] = clean===''?'':fromDecimal(dec, b.base); });
            if (clean === '') next = {binary:'',octal:'',decimal:'',hex:''};
            next[key] = clean;
            setVals(next);
        }

        var inputStyle = {flex:'1',padding:'9px 12px',borderRadius:'0 8px 8px 0',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),borderLeft:'none',fontSize:(a.valueFontSize||18)+'px',fontFamily:'monospace',outline:'none',background:'#fff',width:'1px',minWidth:0};

        function row(binfo) {
            var color = a[binfo.color] || binfo.dfltColor;
            return el('div',{key:binfo.key,style:{display:'flex',alignItems:'center',background:a.rowBg||'#f3f4f6',border:'1.5px solid '+(a.rowBorder||'#e5e7eb'),borderRadius:(a.inputRadius||8)+'px',overflow:'hidden',marginBottom:'8px'}},
                el('div',{style:{background:color,color:'#fff',padding:'0 14px',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',minWidth:'80px',height:'52px'}},
                    el('div',{style:{fontSize:'11px',fontWeight:700,opacity:.8,textTransform:'uppercase',letterSpacing:'.06em'}},binfo.hint),
                    el('div',{style:{fontSize:'13px',fontWeight:800}},binfo.label)
                ),
                el('input',{type:'text',value:vals[binfo.key],onChange:function(e){setActive(binfo.key);handleChange(binfo.key,binfo.base,e.target.value);},onFocus:function(){setActive(binfo.key);},style:inputStyle,placeholder:'—'}),
                a.showCopyButtons && el('button',{onClick:function(){if(navigator.clipboard)navigator.clipboard.writeText(vals[binfo.key]||'');},type:'button',style:{border:'none',background:color+'22',color:color,padding:'0 12px',cursor:'pointer',fontSize:'13px',fontWeight:700,height:'52px',flexShrink:0}},'Copy')
            );
        }

        var dec = toDecimal(vals.decimal, 10);

        return el('div',{style:{paddingTop:(a.paddingTop||60)+'px',paddingBottom:(a.paddingBottom||60)+'px',background:a.sectionBg||undefined}},
            el('div',{style:{background:a.cardBg||'#fff',borderRadius:(a.cardRadius||16)+'px',padding:'36px 32px',maxWidth:(a.maxWidth||560)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,.09)'}},

                (a.showTitle||a.showSubtitle) && el('div',{style:{marginBottom:'22px'}},
                    a.showTitle    && el('div',{className:'bkbg-nbc-title',style:{color:a.titleColor,marginBottom:'6px'}},a.title),
                    a.showSubtitle && el('div',{className:'bkbg-nbc-subtitle',style:{color:a.subtitleColor,opacity:.75}},a.subtitle)
                ),

                a.showDecimal && row(BASES[2]),
                a.showBinary  && row(BASES[0]),
                a.showOctal   && row(BASES[1]),
                a.showHex     && row(BASES[3]),

                a.showBitLength && !isNaN(dec) && el('div',{style:{marginTop:'16px',background:a.rowBg||'#f3f4f6',border:'1px solid '+(a.rowBorder||'#e5e7eb'),borderRadius:'10px',padding:'14px 16px'}},
                    el('div',{style:{fontSize:'12px',fontWeight:700,color:a.labelColor||'#374151',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'10px'}},'Bit Lengths'),
                    el('div',{style:{display:'flex',flexDirection:'column',gap:'6px',fontFamily:'monospace',fontSize:'13px'}},
                        [{bits:8,label:'8-bit'},{bits:16,label:'16-bit'},{bits:32,label:'32-bit'}].map(function(row){
                            return el('div',{key:row.label,style:{display:'flex',alignItems:'center',gap:'10px'}},
                                el('span',{style:{fontWeight:700,color:a.labelColor||'#374151',minWidth:'40px'}},row.label),
                                el('span',{style:{color:'#111827',wordBreak:'break-all'}},bitLen(dec, row.bits))
                            );
                        })
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/number-base-converter', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) { Object.assign(s, _tvf(a.titleTypo, '--bkbg-nbc-tt-')); Object.assign(s, _tvf(a.subtitleTypo, '--bkbg-nbc-st-')); }
                return { style: s };
            })());
            var colorSettings = [
                {value:a.binaryColor,  onChange:function(v){set({binaryColor:v});},  label:'Binary Color (row accent)'},
                {value:a.octalColor,   onChange:function(v){set({octalColor:v});},   label:'Octal Color'},
                {value:a.decimalColor, onChange:function(v){set({decimalColor:v});}, label:'Decimal Color'},
                {value:a.hexColor,     onChange:function(v){set({hexColor:v});},     label:'Hex Color'},
                {value:a.cardBg,       onChange:function(v){set({cardBg:v});},       label:'Card Background'},
                {value:a.rowBg,        onChange:function(v){set({rowBg:v});},        label:'Row Background'},
                {value:a.rowBorder,    onChange:function(v){set({rowBorder:v});},    label:'Row Border'},
                {value:a.inputBorder,  onChange:function(v){set({inputBorder:v});},  label:'Input Border'},
                {value:a.labelColor,   onChange:function(v){set({labelColor:v});},   label:'Label Color'},
                {value:a.titleColor,   onChange:function(v){set({titleColor:v});},   label:'Title Color'},
                {value:a.subtitleColor,onChange:function(v){set({subtitleColor:v});},label:'Subtitle Color'},
                {value:a.sectionBg,    onChange:function(v){set({sectionBg:v});},    label:'Section Background'}
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
                        el(TextControl,{label:'Default Value (decimal)',value:a.defaultValue,onChange:function(v){set({defaultValue:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Binary',       checked:a.showBinary,      onChange:function(v){set({showBinary:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Octal',        checked:a.showOctal,       onChange:function(v){set({showOctal:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Decimal',      checked:a.showDecimal,     onChange:function(v){set({showDecimal:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Hexadecimal',  checked:a.showHex,         onChange:function(v){set({showHex:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Bit Lengths',  checked:a.showBitLength,   onChange:function(v){set({showBitLength:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Copy Buttons', checked:a.showCopyButtons, onChange:function(v){set({showCopyButtons:v});}})
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypoControl(), {label:'Title Typography',value:a.titleTypo,onChange:function(v){set({titleTypo:v});}}),
                        el(getTypoControl(), {label:'Subtitle Typography',value:a.subtitleTypo,onChange:function(v){set({subtitleTypo:v});}}),
                        el(RangeControl,{label:'Value Font Size',    value:a.valueFontSize,    min:12,max:32,step:1,   onChange:function(v){set({valueFontSize:v});},    __nextHasNoMarginBottom:true})
                    ),
el(PanelColorSettings,{title:'Colors',initialOpen:false,colorSettings:colorSettings}),
                    el(PanelBody,{title:'Sizing & Layout',initialOpen:false},
                        el(RangeControl,{label:'Card Border Radius', value:a.cardRadius,    min:0, max:40,step:1,  onChange:function(v){set({cardRadius:v});}}),
                        el(RangeControl,{label:'Input Border Radius',value:a.inputRadius,   min:0, max:20,step:1,  onChange:function(v){set({inputRadius:v});}}),
                        el(RangeControl,{label:'Max Width (px)',     value:a.maxWidth,      min:320,max:960,step:10,onChange:function(v){set({maxWidth:v});}}),
                        el(RangeControl,{label:'Padding Top (px)',   value:a.paddingTop,    min:0, max:160,step:4, onChange:function(v){set({paddingTop:v});}}),
                        el(RangeControl,{label:'Padding Bottom (px)',value:a.paddingBottom, min:0, max:160,step:4, onChange:function(v){set({paddingBottom:v});}})
                    )
                ),
                el('div', blockProps, el(NBCPreview, {attributes:a}))
            );
        },
        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', {className:'bkbg-nbc-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
