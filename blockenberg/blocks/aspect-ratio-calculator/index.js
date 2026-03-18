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

    /* ── Typography lazy getters ───────────────────────────────────────── */
    var _Typo, _tv;
    Object.defineProperty(window, '__bkbgArcTypoReady', { get: function () {
        if (!_Typo) _Typo = window.bkbgTypographyControl;
        if (!_tv)   _tv   = window.bkbgTypoCssVars;
        return !!(_Typo && _tv);
    }});
    function getTypoCssVars()   { window.__bkbgArcTypoReady; return _tv;   }
    function getTypoComponent()  { window.__bkbgArcTypoReady; return _Typo; }

    var PRESETS = [
        {label:'16:9',  w:1920, h:1080, note:'HD / Widescreen'},
        {label:'4:3',   w:1024, h:768,  note:'Traditional'},
        {label:'1:1',   w:1080, h:1080, note:'Square / Instagram'},
        {label:'9:16',  w:1080, h:1920, note:'Portrait / Stories'},
        {label:'21:9',  w:2560, h:1080, note:'Ultrawide'},
        {label:'4:5',   w:1080, h:1350, note:'Portrait social'},
        {label:'3:2',   w:1500, h:1000, note:'DSLR / Photography'},
        {label:'2:1',   w:2000, h:1000, note:'Panoramic'}
    ];

    function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
    function getRatio(w, h) {
        if (!w || !h) return '—';
        var g = gcd(Math.round(w), Math.round(h));
        return (w/g) + ':' + (h/g);
    }

    function ARPreview(props) {
        var a = props.attributes;
        var accent = a.accentColor || '#6c3fb5';

        var _w = useState(a.defaultWidth  || 1920); var w = _w[0]; var setW = _w[1];
        var _h = useState(a.defaultHeight || 1080); var h = _h[0]; var setH = _h[1];
        var _lock = useState('width'); // which dimension is "free" when solving
        var lock = _lock[0]; var setLock = _lock[1];
        var _newW = useState(''); var newW = _newW[0]; var setNewW = _newW[1];
        var _newH = useState(''); var newH = _newH[0]; var setNewH = _newH[1];
        var _calcH = useState(''); var calcH = _calcH[0]; var setCalcH = _calcH[1];
        var _calcW = useState(''); var calcW = _calcW[0]; var setCalcW = _calcW[1];

        var ratio    = getRatio(w, h);
        var megapixels = ((parseFloat(w)||0) * (parseFloat(h)||0) / 1000000).toFixed(2);
        var previewW = 200; var previewH = h>0 ? Math.round(previewW * h / w) : 0;
        if (previewH > 160) { previewH = 160; previewW = w>0 ? Math.round(previewH * w / h) : 0; }

        var inputStyle = {padding:'9px 12px',borderRadius:(a.inputRadius||8)+'px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),fontSize:'14px',fontFamily:'inherit',outline:'none',width:'100%',background:'#fff'};
        var lblStyle   = {display:'block',fontSize:'12px',fontWeight:600,color:a.labelColor||'#374151',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.05em'};
        var statStyle  = {background:a.statBg||'#f3f4f6',border:'1px solid '+(a.statBorder||'#e5e7eb'),borderRadius:'10px',padding:'12px',textAlign:'center',flex:1};

        // solve for missing dimension
        function solveH(nw) { return w>0 ? Math.round((parseFloat(nw)||0) * h / w) : ''; }
        function solveW(nh) { return h>0 ? Math.round((parseFloat(nh)||0) * w / h) : ''; }

        return el('div', {style:{paddingTop:(a.paddingTop||60)+'px',paddingBottom:(a.paddingBottom||60)+'px',background:a.sectionBg||undefined}},
            el('div', {style:{background:a.cardBg,borderRadius:(a.cardRadius||16)+'px',padding:'36px 32px',maxWidth:(a.maxWidth||580)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,.09)'}},

                (a.showTitle||a.showSubtitle) && el('div',{style:{marginBottom:'22px'}},
                    a.showTitle    && el('div',{className:'bkbg-arc-title',style:{color:a.titleColor,marginBottom:'6px'}},a.title),
                    a.showSubtitle && el('div',{className:'bkbg-arc-subtitle',style:{color:a.subtitleColor,opacity:.75}},a.subtitle)
                ),

                // Presets
                a.showPresets && el('div',{style:{marginBottom:'18px'}},
                    el('label',{style:lblStyle},'Common Presets'),
                    el('div',{style:{display:'flex',flexWrap:'wrap',gap:'6px'}},
                        PRESETS.map(function(p){ return el('button',{key:p.label,onClick:function(){setW(p.w);setH(p.h);setNewW('');setNewH('');setCalcH('');setCalcW('');},
                            style:{padding:'5px 10px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),borderRadius:'6px',background:w===p.w&&h===p.h?(a.presetActiveBg||accent):'#fff',color:w===p.w&&h===p.h?(a.presetActiveColor||'#fff'):'#374151',fontWeight:600,fontSize:'12px',fontFamily:'inherit',cursor:'pointer'}},
                            p.label+' – '+p.note);
                        })
                    )
                ),

                // Source dimensions
                el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}},
                    el('div',null,
                        el('label',{style:lblStyle},'Original Width (px)'),
                        el('input',{type:'number',value:w,min:1,style:inputStyle,onChange:function(e){setW(parseFloat(e.target.value)||1);}})
                    ),
                    el('div',null,
                        el('label',{style:lblStyle},'Original Height (px)'),
                        el('input',{type:'number',value:h,min:1,style:inputStyle,onChange:function(e){setH(parseFloat(e.target.value)||1);}})
                    )
                ),

                // Ratio display
                a.showRatioDisplay && el('div',{style:{background:a.ratioBg||accent,borderRadius:'12px',padding:'18px 24px',textAlign:'center',color:a.ratioColor||'#fff',marginBottom:'16px',display:'flex',alignItems:'center',justifyContent:'center',gap:'24px'}},
                    el('div',null,
                        el('div',{className:'bkbg-arc-ratio-num'},ratio),
                        el('div',{style:{fontSize:'13px',opacity:.8,marginTop:'4px'}}, 'Aspect Ratio')
                    ),
                    el('div',{style:{width:'1px',height:'50px',background:'rgba(255,255,255,.25)'}}),
                    el('div',null,
                        el('div',{style:{fontSize:'22px',fontWeight:700}},megapixels+'MP'),
                        el('div',{style:{fontSize:'13px',opacity:.8,marginTop:'4px'}},'Megapixels')
                    )
                ),

                // Proportional resize
                el('div',{style:{background:a.statBg||'#f3f4f6',border:'1px solid '+(a.statBorder||'#e5e7eb'),borderRadius:'10px',padding:'14px 16px',marginBottom:'14px'}},
                    el('div',{style:{fontSize:'13px',fontWeight:700,color:a.labelColor||'#374151',marginBottom:'12px'}}, '🔗 Proportional Resize'),
                    el('div',{style:{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'10px',alignItems:'end'}},
                        el('div',null,
                            el('label',{style:lblStyle},'New Width'),
                            el('input',{type:'number',value:newW,min:1,placeholder:'e.g. 800',style:inputStyle,onChange:function(e){var v=e.target.value;setNewW(v);setCalcH(v?solveH(v):'');setCalcW('');setNewH('');}})),
                        el('div',{style:{textAlign:'center',fontSize:'18px',paddingBottom:'8px',color:'#9ca3af'}},'↔'),
                        el('div',null,
                            el('label',{style:lblStyle},'New Height'),
                            el('input',{type:'number',value:newH,min:1,placeholder:'e.g. 450',style:inputStyle,onChange:function(e){var v=e.target.value;setNewH(v);setCalcW(v?solveW(v):'');setCalcH('');setNewW('');}})
                        )
                    ),
                    (calcH||calcW) && el('div',{style:{marginTop:'10px',padding:'10px 12px',background:'#fff',borderRadius:'8px',border:'1.5px solid '+(a.inputBorder||'#e5e7eb'),fontSize:'14px',fontWeight:600,color:accent,textAlign:'center'}},
                        calcH ? (newW+' × '+calcH+' px') : (calcW+' × '+newH+' px')
                    )
                ),

                // Preview
                a.showPreview && el('div',{style:{display:'flex',justifyContent:'center',alignItems:'center',padding:'20px',background:a.statBg||'#f3f4f6',borderRadius:'10px',border:'1px solid '+(a.statBorder||'#e5e7eb')}},
                    el('div',{style:{width:previewW+'px',height:Math.max(4,previewH)+'px',background:a.previewBg||'#ede9fe',border:'2px solid '+(a.previewBorder||accent),borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:600,color:accent}},
                        w + '×' + h
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/aspect-ratio-calculator', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {
                    '--bkbg-arc-title-sz': (a.titleSize || 28) + 'px',
                    '--bkbg-arc-ratio-sz': (a.ratioSize || 44) + 'px'
                };
                if (_tv) {
                    Object.assign(s, _tv(a.titleTypo || {}, '--bkbg-arc-title-'));
                    Object.assign(s, _tv(a.ratioTypo || {}, '--bkbg-arc-ratio-'));
                }
                return { style: s };
            })());
            var colorSettings = [
                {value:a.accentColor,       onChange:function(v){set({accentColor:v});},       label:'Accent Color'},
                {value:a.cardBg,            onChange:function(v){set({cardBg:v});},             label:'Card Background'},
                {value:a.ratioBg,           onChange:function(v){set({ratioBg:v});},            label:'Ratio Card Background'},
                {value:a.ratioColor,        onChange:function(v){set({ratioColor:v});},         label:'Ratio Card Text'},
                {value:a.previewBg,         onChange:function(v){set({previewBg:v});},          label:'Preview Fill'},
                {value:a.previewBorder,     onChange:function(v){set({previewBorder:v});},      label:'Preview Border'},
                {value:a.presetActiveBg,    onChange:function(v){set({presetActiveBg:v});},     label:'Active Preset Background'},
                {value:a.presetActiveColor, onChange:function(v){set({presetActiveColor:v});},  label:'Active Preset Text'},
                {value:a.statBg,            onChange:function(v){set({statBg:v});},             label:'Sections Background'},
                {value:a.statBorder,        onChange:function(v){set({statBorder:v});},         label:'Sections Border'},
                {value:a.inputBorder,       onChange:function(v){set({inputBorder:v});},        label:'Input Border'},
                {value:a.labelColor,        onChange:function(v){set({labelColor:v});},         label:'Label Color'},
                {value:a.titleColor,        onChange:function(v){set({titleColor:v});},         label:'Title Color'},
                {value:a.subtitleColor,     onChange:function(v){set({subtitleColor:v});},      label:'Subtitle Color'},
                {value:a.sectionBg,         onChange:function(v){set({sectionBg:v});},          label:'Section Background'}
            ];
            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody,{title:'Header',initialOpen:false},
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Title',   checked:a.showTitle,   onChange:function(v){set({showTitle:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Subtitle',checked:a.showSubtitle,onChange:function(v){set({showSubtitle:v});}}),
                        el(TextControl,{label:'Title',   value:a.title,   onChange:function(v){set({title:v});}}),
                        el(TextControl,{label:'Subtitle',value:a.subtitle,onChange:function(v){set({subtitle:v});}})
                    ),
                    el(PanelBody,{title:'Calculator Defaults',initialOpen:true},
                        el(TextControl,{label:'Default Width',  value:String(a.defaultWidth),  type:'number',onChange:function(v){set({defaultWidth:parseInt(v)||1})}}),
                        el(TextControl,{label:'Default Height', value:String(a.defaultHeight), type:'number',onChange:function(v){set({defaultHeight:parseInt(v)||1})}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Presets',       checked:a.showPresets,      onChange:function(v){set({showPresets:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Ratio Display',  checked:a.showRatioDisplay, onChange:function(v){set({showRatioDisplay:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Visual Preview', checked:a.showPreview,      onChange:function(v){set({showPreview:v});}})
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoComponent() && el(getTypoComponent(), {
                            label: __('Title Typography', 'blockenberg'),
                            value: a.titleTypo || {},
                            onChange: function (v) { set({ titleTypo: v }); }
                        }),
                        getTypoComponent() && el(getTypoComponent(), {
                            label: __('Ratio Display Typography', 'blockenberg'),
                            value: a.ratioTypo || {},
                            onChange: function (v) { set({ ratioTypo: v }); }
                        })
                    ),
el(PanelColorSettings,{title:'Colors',initialOpen:false,colorSettings:colorSettings}),
                    el(PanelBody,{title:'Sizing & Layout',initialOpen:false},
                        el(RangeControl,{label:'Card Border Radius', value:a.cardRadius,  min:0, max:40,step:1,  onChange:function(v){set({cardRadius:v});}}),
                        el(RangeControl,{label:'Input Border Radius',value:a.inputRadius, min:0, max:20,step:1,  onChange:function(v){set({inputRadius:v});}}),
                        el(RangeControl,{label:'Max Width (px)',     value:a.maxWidth,    min:340,max:960,step:10,onChange:function(v){set({maxWidth:v});}}),
                        el(RangeControl,{label:'Padding Top (px)',   value:a.paddingTop,  min:0, max:160,step:4, onChange:function(v){set({paddingTop:v});}}),
                        el(RangeControl,{label:'Padding Bottom (px)',value:a.paddingBottom,min:0,max:160,step:4, onChange:function(v){set({paddingBottom:v});}})
                    )
                ),
                el('div', blockProps, el(ARPreview, {attributes:a}))
            );
        },
        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', {className:'bkbg-arc-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
