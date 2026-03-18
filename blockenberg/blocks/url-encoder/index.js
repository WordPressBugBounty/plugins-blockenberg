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
    var TextareaControl    = wp.components.TextareaControl;
    var ToggleControl      = wp.components.ToggleControl;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'titleTypo', attrs, '--bkue-tt-');
        _tvf(v, 'subtitleTypo', attrs, '--bkue-st-');
        return v;
    }

    var TABS = [
        {id:'encode', label:'URL Encode'},
        {id:'decode', label:'URL Decode'},
        {id:'b64',    label:'Base64'}
    ];

    function urlEncode(text)   { return encodeURIComponent(text); }
    function urlDecode(text)   { try { return decodeURIComponent(text); } catch(e){ return null; } }
    function b64Encode(text)   { try { return btoa(unescape(encodeURIComponent(text))); } catch(e){ return null; } }
    function b64Decode(text)   { try { return decodeURIComponent(escape(atob(text))); } catch(e){ return null; } }

    function process(mode, text) {
        if (!text) return {result:'', error:''};
        if (mode === 'encode') return {result: urlEncode(text), error:''};
        if (mode === 'decode') {
            var r = urlDecode(text);
            return r === null ? {result:'', error:'Invalid URI sequence — cannot decode.'} : {result:r, error:''};
        }
        if (mode === 'b64') {
            var enc = b64Encode(text);
            return enc === null ? {result:'', error:'Encoding failed.'} : {result:enc, error:''};
        }
        if (mode === 'b64dec') {
            var dec = b64Decode(text);
            return dec === null ? {result:'', error:'Invalid Base64 string — cannot decode.'} : {result:dec, error:''};
        }
        return {result:'', error:''};
    }

    function UEPreview(props) {
        var a = props.attributes;
        var accent = a.accentColor || '#6c3fb5';

        var _tab = useState(a.defaultMode || 'encode');
        var tab = _tab[0]; var setTab = _tab[1];

        var _sub = useState('enc');    // enc | dec (for b64 sub-mode)
        var b64Sub = _sub[0]; var setB64Sub = _sub[1];

        var _txt = useState(a.defaultText || '');
        var text = _txt[0]; var setText = _txt[1];

        var activeMode = tab === 'b64' ? (b64Sub === 'enc' ? 'b64' : 'b64dec') : tab;
        var proc = process(activeMode, text);

        var tabs = a.showBase64Tab ? TABS : TABS.slice(0,2);

        var tabBarStyle = {display:'flex',gap:'4px',marginBottom:'18px',background:a.tabInactiveBg||'#f3f4f6',borderRadius:(a.tabRadius||8)+'px',padding:'4px'};
        var inpStyle    = {width:'100%',padding:'10px 12px',borderRadius:(a.inputRadius||10)+'px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),background:a.inputBg||'#f9fafb',color:a.inputColor||'#1f2937',fontSize:'14px',fontFamily:'ui-monospace,monospace',resize:'vertical',minHeight:((a.textareaRows||5)*1.6+2.5)+'em',boxSizing:'border-box',outline:'none',lineHeight:1.6};
        var outStyle    = Object.assign({},inpStyle,{background:a.outputBg||'#f3f4f6',border:'1.5px solid '+(a.outputBorder||'#e5e7eb'),color:a.outputColor||'#1f2937',cursor:'text',userSelect:'all'});
        var lblStyle    = {display:'block',fontSize:'12px',fontWeight:600,color:a.labelColor||'#374151',marginBottom:'5px'};
        var btnStyle    = {padding:'8px 18px',background:accent,color:a.btnColor||'#fff',border:'none',borderRadius:(a.inputRadius||10)+'px',fontWeight:700,cursor:'pointer',fontSize:'13px',fontFamily:'inherit'};

        return el('div',{style:{paddingTop:(a.paddingTop||60)+'px',paddingBottom:(a.paddingBottom||60)+'px',background:a.sectionBg||undefined}},
            el('div',{style:{background:a.cardBg||'#fff',borderRadius:(a.cardRadius||16)+'px',padding:'32px',maxWidth:(a.maxWidth||680)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,.09)'}},

                (a.showTitle || a.showSubtitle) && el('div',{style:{marginBottom:'22px'}},
                    a.showTitle    && el('div',{className:'bkbg-ue-title',style:{color:a.titleColor||'#1e1b4b'}},a.title),
                    a.showSubtitle && el('div',{className:'bkbg-ue-subtitle',style:{color:a.subtitleColor||'#6b7280'}},a.subtitle)
                ),

                // Tab bar
                el('div',{style:tabBarStyle},
                    tabs.map(function(t){
                        var active = tab===t.id;
                        return el('button',{key:t.id,onClick:function(){setTab(t.id);setText('');},style:{flex:1,padding:'8px',borderRadius:(a.tabRadius||8)+'px',border:'none',cursor:'pointer',fontWeight:active?700:500,fontSize:'14px',fontFamily:'inherit',background:active?(a.tabActiveBg||accent):(a.tabInactiveBg||'transparent'),color:active?(a.tabActiveColor||'#fff'):(a.tabInactiveColor||'#6b7280'),transition:'all .2s'}},t.label);
                    })
                ),

                // Base64 sub-mode
                tab==='b64' && el('div',{style:{display:'flex',gap:'6px',marginBottom:'14px'}},
                    el('button',{onClick:function(){setB64Sub('enc');setText('');},style:{padding:'5px 14px',borderRadius:'6px',border:'1.5px solid '+(b64Sub==='enc'?accent:'#d1d5db'),background:b64Sub==='enc'?accent+'18':'#fff',color:b64Sub==='enc'?accent:'#6b7280',fontWeight:b64Sub==='enc'?700:400,cursor:'pointer',fontSize:'13px',fontFamily:'inherit'}},'Encode'),
                    el('button',{onClick:function(){setB64Sub('dec');setText('');},style:{padding:'5px 14px',borderRadius:'6px',border:'1.5px solid '+(b64Sub==='dec'?accent:'#d1d5db'),background:b64Sub==='dec'?accent+'18':'#fff',color:b64Sub==='dec'?accent:'#6b7280',fontWeight:b64Sub==='dec'?700:400,cursor:'pointer',fontSize:'13px',fontFamily:'inherit'}},'Decode')
                ),

                // Input
                el('div',{style:{marginBottom:'16px'}},
                    el('label',{style:lblStyle},tab==='b64'?'Input Text':(tab==='encode'?'Text to Encode':'Encoded URL')),
                    el('textarea',{value:text,onChange:function(e){setText(e.target.value);},placeholder:a.defaultText,rows:a.textareaRows||5,style:inpStyle})
                ),

                // Char count
                a.showCharCount && el('div',{style:{textAlign:'right',fontSize:'12px',color:'#9ca3af',marginTop:'-12px',marginBottom:'12px'}},
                    (text||'').length,' characters'
                ),

                // Error
                proc.error && el('div',{style:{background:a.errorBg||'#fef2f2',border:'1px solid '+(a.errorColor||'#ef4444'),color:a.errorColor||'#ef4444',padding:'10px 14px',borderRadius:'8px',fontSize:'14px',marginBottom:'12px'}},proc.error),

                // Output
                el('div',{style:{marginBottom:'14px'}},
                    el('label',{style:lblStyle},'Result'),
                    el('textarea',{readOnly:true,value:proc.result,rows:a.textareaRows||5,style:outStyle})
                ),

                a.showCharCount && el('div',{style:{textAlign:'right',fontSize:'12px',color:'#9ca3af',marginTop:'-10px',marginBottom:'12px'}},
                    (proc.result||'').length,' characters'
                ),

                // Buttons row
                el('div',{style:{display:'flex',gap:'8px',flexWrap:'wrap'}},
                    a.showCopyButton && el('button',{style:btnStyle},'Copy Result'),
                    a.showClearButton && el('button',{onClick:function(){setText('');},style:{...btnStyle,background:'#f3f4f6',color:'#374151'}},'Clear')
                )
            )
        );
    }

    registerBlockType('blockenberg/url-encoder', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps((function () { var _tv = getTypoCssVars(a); return { style: _tv }; })());
            var colorSettings = [
                {value:a.accentColor,      onChange:function(v){set({accentColor:v});},      label:'Accent Color'},
                {value:a.cardBg,           onChange:function(v){set({cardBg:v});},            label:'Card Background'},
                {value:a.tabActiveBg,      onChange:function(v){set({tabActiveBg:v});},       label:'Active Tab Background'},
                {value:a.tabActiveColor,   onChange:function(v){set({tabActiveColor:v});},    label:'Active Tab Text'},
                {value:a.tabInactiveBg,    onChange:function(v){set({tabInactiveBg:v});},     label:'Inactive Tab Background'},
                {value:a.tabInactiveColor, onChange:function(v){set({tabInactiveColor:v});},  label:'Inactive Tab Text'},
                {value:a.inputBg,          onChange:function(v){set({inputBg:v});},           label:'Input Background'},
                {value:a.inputBorder,      onChange:function(v){set({inputBorder:v});},       label:'Input Border'},
                {value:a.inputColor,       onChange:function(v){set({inputColor:v});},        label:'Input Text Color'},
                {value:a.outputBg,         onChange:function(v){set({outputBg:v});},          label:'Output Background'},
                {value:a.outputBorder,     onChange:function(v){set({outputBorder:v});},      label:'Output Border'},
                {value:a.outputColor,      onChange:function(v){set({outputColor:v});},       label:'Output Text Color'},
                {value:a.errorColor,       onChange:function(v){set({errorColor:v});},        label:'Error Text Color'},
                {value:a.errorBg,          onChange:function(v){set({errorBg:v});},           label:'Error Background'},
                {value:a.btnBg,            onChange:function(v){set({btnBg:v});},             label:'Button Background'},
                {value:a.btnColor,         onChange:function(v){set({btnColor:v});},          label:'Button Text'},
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
                    el(PanelBody,{title:'Encoder Settings',initialOpen:true},
                        el(SelectControl,{label:'Default Tab',value:a.defaultMode,options:[{label:'URL Encode',value:'encode'},{label:'URL Decode',value:'decode'},{label:'Base64',value:'b64'}],onChange:function(v){set({defaultMode:v});}}),
                        el(TextareaControl,{label:'Default Input Text',value:a.defaultText,onChange:function(v){set({defaultText:v});},rows:3}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Base64 Tab',    checked:a.showBase64Tab,  onChange:function(v){set({showBase64Tab:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Copy Button',  checked:a.showCopyButton, onChange:function(v){set({showCopyButton:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Clear Button', checked:a.showClearButton,onChange:function(v){set({showClearButton:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Char Count',   checked:a.showCharCount,  onChange:function(v){set({showCharCount:v});}})
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl(__('Title', 'blockenberg'), 'titleTypo', a, set),
                        getTypoControl(__('Subtitle', 'blockenberg'), 'subtitleTypo', a, set)
                    ),
el(PanelColorSettings,{title:'Colors',initialOpen:false,colorSettings:colorSettings}),
                    el(PanelBody,{title:'Sizing & Layout',initialOpen:false},
                        el(RangeControl,{label:'Textarea Rows',     value:a.textareaRows, min:3, max:16,step:1,  onChange:function(v){set({textareaRows:v});}}),
                        el(RangeControl,{label:'Card Border Radius',value:a.cardRadius,   min:0, max:40,step:1,  onChange:function(v){set({cardRadius:v});}}),
                        el(RangeControl,{label:'Input Border Radius',value:a.inputRadius, min:0, max:20,step:1,  onChange:function(v){set({inputRadius:v});}}),
                        el(RangeControl,{label:'Tab Border Radius', value:a.tabRadius,    min:0, max:20,step:1,  onChange:function(v){set({tabRadius:v});}}),
                        el(RangeControl,{label:'Max Width (px)',    value:a.maxWidth,     min:360,max:1100,step:10,onChange:function(v){set({maxWidth:v});}}),
                        el(RangeControl,{label:'Padding Top',       value:a.paddingTop,   min:0, max:160,step:4, onChange:function(v){set({paddingTop:v});}}),
                        el(RangeControl,{label:'Padding Bottom',    value:a.paddingBottom,min:0, max:160,step:4, onChange:function(v){set({paddingBottom:v});}})
                    )
                ),
                el('div', blockProps, el(UEPreview, {attributes:a}))
            );
        },
        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save((function () { var _tv = getTypoCssVars(a); return { style: _tv }; })()),
                el('div',{className:'bkbg-ue-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
