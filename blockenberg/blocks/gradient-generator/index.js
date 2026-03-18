( function () {
    var el                = wp.element.createElement;
    var useState          = wp.element.useState;
    var useEffect         = wp.element.useEffect;
    var Fragment          = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __                = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;
    var Button            = wp.components.Button;

    /* ── Typography lazy getters ── */
    function _tc() { return window.bkbgTypographyControl || null; }
    function _tv() { return window.bkbgTypoCssVars || function () { return {}; }; }

    var PRESETS = [
        { label:'Purple Dream',   stops:'#6c3fb5 0%,#06b6d4 100%', type:'linear', angle:135 },
        { label:'Sunset',         stops:'#f97316 0%,#ef4444 50%,#a855f7 100%', type:'linear', angle:135 },
        { label:'Ocean',          stops:'#0ea5e9 0%,#10b981 100%', type:'linear', angle:135 },
        { label:'Midnight',       stops:'#1e1b4b 0%,#6c3fb5 50%,#0ea5e9 100%', type:'linear', angle:225 },
        { label:'Peach',          stops:'#f9a8d4 0%,#fed7aa 100%', type:'linear', angle:90 },
        { label:'Radial Burst',   stops:'#fde68a 0%,#f97316 60%,#ef4444 100%', type:'radial', angle:135 },
        { label:'Forest',         stops:'#064e3b 0%,#10b981 100%', type:'linear', angle:135 },
        { label:'Rose Gold',      stops:'#fda4af 0%,#fb7185 40%,#f43f5e 100%', type:'linear', angle:135 }
    ];

    function parseStops(str) {
        return str.split(',').map(function(s) {
            var parts = s.trim().match(/^(#[\w]+|rgba?\([^)]+\))\s+(\d+%?)$/);
            if (parts) return { color: parts[1], pos: parts[2] };
            return { color: s.trim(), pos: '' };
        });
    }

    function buildCSS(type, angle, stops) {
        var stopStr = stops.map(function(s){ return s.color + (s.pos ? ' ' + s.pos : ''); }).join(', ');
        if (type === 'radial') return 'radial-gradient(circle, ' + stopStr + ')';
        if (type === 'conic')  return 'conic-gradient(from ' + angle + 'deg, ' + stopStr + ')';
        return 'linear-gradient(' + angle + 'deg, ' + stopStr + ')';
    }

    function GradientPreview(props) {
        var a = props.attributes;
        var accent = a.accentColor || '#6c3fb5';

        var _stops = useState(parseStops(a.defaultStops || '#6c3fb5 0%,#06b6d4 100%'));
        var stops = _stops[0]; var setStops = _stops[1];
        var _type  = useState(a.defaultType  || 'linear'); var type = _type[0]; var setType = _type[1];
        var _angle = useState(a.defaultAngle || 135);       var angle= _angle[0];var setAngle= _angle[1];
        var _copied= useState(false);                       var copied=_copied[0];var setCopied=_copied[1];

        var css = buildCSS(type, angle, stops);

        function updateStop(i, key, val) {
            var ns = stops.map(function(s,idx){ return idx===i ? Object.assign({},s,((function(o){o[key]=val;return o;})({}))) : s; });
            setStops(ns);
        }
        function addStop() {
            setStops(stops.concat([{color:'#ffffff',pos:stops.length?'100%':'50%'}]));
        }
        function removeStop(i) {
            if (stops.length <= 2) return;
            setStops(stops.filter(function(_,idx){return idx!==i;}));
        }

        function copyCSS() {
            var text = 'background: ' + css + ';';
            try { navigator.clipboard.writeText(text).then(function(){ setCopied(true); setTimeout(function(){setCopied(false);},1500); }); } catch(e){}
        }

        var inputStyle = {padding:'8px 10px',borderRadius:'6px',border:'1.5px solid '+(a.controlsBorder||'#e5e7eb'),fontSize:'14px',fontFamily:'inherit',outline:'none',background:'#fff'};

        var wrapS = Object.assign({paddingTop:(a.paddingTop||60)+'px',paddingBottom:(a.paddingBottom||60)+'px',background:a.sectionBg||undefined}, _tv()(a.typoTitle,'--bkbg-gg-tt-'), _tv()(a.typoBody,'--bkbg-gg-bd-'));
        return el('div', {style:wrapS},
            el('div', {style:{background:a.cardBg,borderRadius:(a.cardRadius||16)+'px',padding:'36px 32px',maxWidth:(a.maxWidth||600)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,.09)'}},

                (a.showTitle||a.showSubtitle) && el('div', {style:{marginBottom:'22px'}},
                    a.showTitle    && el('div', {className:'bkbg-gg-title',style:{color:a.titleColor,marginBottom:'6px'}}, a.title),
                    a.showSubtitle && el('div', {className:'bkbg-gg-subtitle',style:{color:a.subtitleColor}}, a.subtitle)
                ),

                // Preview swatch
                el('div', {style:{height:(a.previewHeight||200)+'px',borderRadius:(a.previewRadius||12)+'px',background:css,marginBottom:'20px',boxShadow:'0 2px 12px rgba(0,0,0,.12)',transition:'background .2s'}}),

                // Controls row
                el('div', {style:{background:a.controlsBg||'#f9fafb',border:'1.5px solid '+(a.controlsBorder||'#e5e7eb'),borderRadius:'10px',padding:'16px',marginBottom:'14px'}},
                    el('div', {style:{display:'flex',gap:'12px',flexWrap:'wrap',alignItems:'center',marginBottom:'14px'}},
                        el('div', null,
                            el('label', {style:{display:'block',fontSize:'12px',fontWeight:600,color:a.labelColor||'#374151',marginBottom:'4px'}}, 'Type'),
                            el('select', {value:type, onChange:function(e){setType(e.target.value);}, style:Object.assign({},inputStyle,{cursor:'pointer'})},
                                [{label:'Linear',value:'linear'},{label:'Radial',value:'radial'},{label:'Conic',value:'conic'}].map(function(o){return el('option',{key:o.value,value:o.value},o.label);}))
                        ),
                        (type==='linear'||type==='conic') && el('div', null,
                            el('label', {style:{display:'block',fontSize:'12px',fontWeight:600,color:a.labelColor||'#374151',marginBottom:'4px'}}, 'Angle'),
                            el('div', {style:{display:'flex',alignItems:'center',gap:'6px'}},
                                el('input', {type:'range',value:angle,min:0,max:360,step:5,style:{width:'100px',cursor:'pointer'},onChange:function(e){setAngle(parseInt(e.target.value));}}),
                                el('span', {style:{fontSize:'14px',fontWeight:600,minWidth:'40px'}}, angle+'°')
                            )
                        )
                    ),
                    // Color stops
                    el('div', {style:{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'10px'}},
                        stops.map(function(s,i){
                            return el('div', {key:i, style:{display:'flex',gap:'8px',alignItems:'center'}},
                                el('input', {type:'color',value:s.color,style:{width:'36px',height:'36px',border:'none',borderRadius:'6px',cursor:'pointer',padding:'0'},onChange:function(e){updateStop(i,'color',e.target.value);}}),
                                el('input', {type:'text',value:s.color,style:Object.assign({},inputStyle,{width:'90px'}),onChange:function(e){updateStop(i,'color',e.target.value);},placeholder:'#rrggbb'}),
                                el('input', {type:'text',value:s.pos,style:Object.assign({},inputStyle,{width:'64px'}),onChange:function(e){updateStop(i,'pos',e.target.value);},placeholder:'0%'}),
                                el('button', {onClick:function(){removeStop(i);},disabled:stops.length<=2, style:{padding:'6px 10px',borderRadius:'6px',border:'none',background:'#fee2e2',color:'#ef4444',cursor:'pointer',fontWeight:700,fontSize:'16px',lineHeight:1}}, '×')
                            );
                        })
                    ),
                    el('button', {onClick:addStop, style:{padding:'7px 14px',borderRadius:'6px',border:'1.5px dashed '+(a.controlsBorder||'#e5e7eb'),background:'transparent',color:accent,fontWeight:600,fontSize:'13px',cursor:'pointer',width:'100%',fontFamily:'inherit'}}, '+ Add Color Stop')
                ),

                // Presets
                a.showPresets && el('div', {style:{marginBottom:'14px'}},
                    el('div', {style:{fontSize:'12px',fontWeight:600,color:a.labelColor||'#374151',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'.05em'}}, 'Presets'),
                    el('div', {style:{display:'flex',flexWrap:'wrap',gap:'8px'}},
                        PRESETS.map(function(p){
                            return el('button', {key:p.label, onClick:function(){setStops(parseStops(p.stops));setType(p.type);setAngle(p.angle);},
                                style:{padding:'0 0 4px',border:'none',background:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}},
                                el('div', {style:{width:'48px',height:'32px',borderRadius:'6px',background:buildCSS(p.type,p.angle,parseStops(p.stops)),boxShadow:'0 1px 4px rgba(0,0,0,.15)'}}),
                                el('span', {style:{fontSize:'10px',color:a.labelColor||'#6b7280',fontFamily:'inherit'}}, p.label)
                            );
                        })
                    )
                ),

                // CSS output
                a.showCssOutput && el('div', {style:{position:'relative'}},
                    el('div', {style:{background:a.cssBg||'#1e1b4b',borderRadius:'8px',padding:'14px 16px',paddingRight:'100px'}},
                        el('code', {style:{fontSize:'13px',color:a.cssColor||'#c4b5fd',fontFamily:"'SFMono-Regular',Consolas,monospace",wordBreak:'break-all'}},
                            'background: ' + css + ';')
                    ),
                    el('button', {onClick:copyCSS,
                        style:{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',padding:'6px 14px',borderRadius:'6px',border:'none',background:copied?'#10b981':(a.copyBg||accent),color:a.copyColor||'#fff',fontWeight:600,fontSize:'12px',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',transition:'background .2s'}},
                        copied?'✓ Copied':'Copy CSS')
                )
            )
        );
    }

    registerBlockType('blockenberg/gradient-generator', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps();
            var colorSettings = [
                { value: a.accentColor,    onChange: function(v){set({accentColor:v});},    label: 'Accent Color' },
                { value: a.cardBg,         onChange: function(v){set({cardBg:v});},          label: 'Card Background' },
                { value: a.controlsBg,     onChange: function(v){set({controlsBg:v});},      label: 'Controls Background' },
                { value: a.controlsBorder, onChange: function(v){set({controlsBorder:v});},  label: 'Controls Border' },
                { value: a.cssBg,          onChange: function(v){set({cssBg:v});},           label: 'CSS Block Background' },
                { value: a.cssColor,       onChange: function(v){set({cssColor:v});},        label: 'CSS Code Color' },
                { value: a.copyBg,         onChange: function(v){set({copyBg:v});},          label: 'Copy Button Background' },
                { value: a.copyColor,      onChange: function(v){set({copyColor:v});},       label: 'Copy Button Text' },
                { value: a.labelColor,     onChange: function(v){set({labelColor:v});},      label: 'Label Color' },
                { value: a.titleColor,     onChange: function(v){set({titleColor:v});},      label: 'Title Color' },
                { value: a.subtitleColor,  onChange: function(v){set({subtitleColor:v});},   label: 'Subtitle Color' },
                { value: a.sectionBg,      onChange: function(v){set({sectionBg:v});},       label: 'Section Background' }
            ];
            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody,{title:'Header',initialOpen:false},
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Title',   checked:a.showTitle,   onChange:function(v){set({showTitle:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Subtitle',checked:a.showSubtitle,onChange:function(v){set({showSubtitle:v});}}),
                        el(TextControl,{label:'Title',   value:a.title,   onChange:function(v){set({title:v});}}),
                        el(TextControl,{label:'Subtitle',value:a.subtitle,onChange:function(v){set({subtitle:v});}})
                    ),
                    el(PanelBody,{title:'Generator Defaults',initialOpen:true},
                        el(TextControl,  {label:'Default Color Stops (comma-separated)',value:a.defaultStops, onChange:function(v){set({defaultStops:v});},help:'e.g. #6c3fb5 0%,#06b6d4 100%'}),
                        el(SelectControl,{label:'Default Gradient Type',value:a.defaultType, options:[{label:'Linear',value:'linear'},{label:'Radial',value:'radial'},{label:'Conic',value:'conic'}], onChange:function(v){set({defaultType:v});}}),
                        el(RangeControl, {label:'Default Angle',value:a.defaultAngle,min:0,max:360,step:5,onChange:function(v){set({defaultAngle:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Presets',   checked:a.showPresets,  onChange:function(v){set({showPresets:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show CSS Output',checked:a.showCssOutput,onChange:function(v){set({showCssOutput:v});}})
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && el(_tc(), { label:'Title', value:a.typoTitle, onChange:function(v){ set({typoTitle:v}); } }),
                        _tc() && el(_tc(), { label:'Subtitle', value:a.typoBody, onChange:function(v){ set({typoBody:v}); } })
                    ),
el(PanelColorSettings,{title:'Colors',initialOpen:false,colorSettings:colorSettings}),
                    el(PanelBody,{title:'Sizing & Layout',initialOpen:false},
                        el(RangeControl,{label:'Preview Height (px)', value:a.previewHeight,  min:80,max:400,step:10, onChange:function(v){set({previewHeight:v});}}),
                        el(RangeControl,{label:'Card Border Radius',  value:a.cardRadius,    min:0, max:40, step:1,  onChange:function(v){set({cardRadius:v});}}),
                        el(RangeControl,{label:'Preview Border Radius',value:a.previewRadius,min:0, max:40, step:1,  onChange:function(v){set({previewRadius:v});}}),
                        el(RangeControl,{label:'Max Width (px)',       value:a.maxWidth,      min:340,max:960,step:10,onChange:function(v){set({maxWidth:v});}}),
                        el(RangeControl,{label:'Padding Top (px)',     value:a.paddingTop,    min:0, max:160,step:4,  onChange:function(v){set({paddingTop:v});}}),
                        el(RangeControl,{label:'Padding Bottom (px)',  value:a.paddingBottom, min:0, max:160,step:4,  onChange:function(v){set({paddingBottom:v});}})
                    )
                ),
                el('div', blockProps, el(GradientPreview, {attributes:a, setAttributes:set}))
            );
        },
        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(), el('div', {className:'bkbg-gg-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
