( function () {
    var el = React.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var ToggleControl = wp.components.ToggleControl;
    var Button = wp.components.Button;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;

    /* ── lazy typography helpers ── */
    function _tc() { return window.bkbgTypographyControl || null; }
    Object.defineProperty(window, '__bkSR_tvf', { get: function () { delete window.__bkSR_tvf; return (window.__bkSR_tvf = window.bkbgTypoCssVars || function () { return {}; }); } });
    function getTypoCssVars(a) {
        var o = {};
        Object.assign(o, window.__bkSR_tvf(a.pctTypo || {}, '--bksr-pc-'));
        Object.assign(o, window.__bkSR_tvf(a.labelTypo || {}, '--bksr-lb-'));
        return o;
    }

    var LAYOUT_OPTS = [
        { value: 'row',        label: 'Row (individual rings)' },
        { value: 'concentric', label: 'Concentric (nested rings)' }
    ];
    var EASING_OPTS = [
        { value: 'ease-out', label: 'Ease Out' },
        { value: 'ease-in',  label: 'Ease In' },
        { value: 'linear',   label: 'Linear' }
    ];
    var LINECAP_OPTS = [
        { value: 'round',  label: 'Round' },
        { value: 'butt',   label: 'Flat' },
        { value: 'square', label: 'Square' }
    ];
    var LABEL_POS_OPTS = [
        { value: 'below', label: 'Below ring' },
        { value: 'inside',label: 'Inside ring' }
    ];

    /** Draw a single ring preview as inline SVG */
    function RingPreview(props) {
        var skill = props.skill;
        var a = props.attr;
        var size = a.ringSize || 140;
        var sw = a.strokeWidth || 10;
        var r = (size - sw) / 2;
        var circ = 2 * Math.PI * r;
        var cx = size / 2, cy = size / 2;
        var dashArray = circ;
        var dashOffset = circ * (1 - (skill.pct || 0) / 100);

        return el('div', { style: { textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center' } },
            el('svg', { width:size, height:size, viewBox:'0 0 '+size+' '+size, style:{display:'block'} },
                /* Track */
                el('circle', { cx:cx, cy:cy, r:r, fill:'none', stroke:a.trackColor||'#1f2937', strokeWidth:sw }),
                /* Progress */
                el('circle', {
                    cx:cx, cy:cy, r:r, fill:'none',
                    stroke: skill.color || '#7c3aed',
                    strokeWidth:sw,
                    strokeDasharray: dashArray,
                    strokeDashoffset: dashOffset,
                    strokeLinecap: a.lineCap||'round',
                    transform:'rotate(-90 '+cx+' '+cy+')'
                }),
                /* Center percentage */
                a.showPercentage && a.labelPosition === 'inside' && el('text', {
                    x:cx, y:cy, dominantBaseline:'middle', textAnchor:'middle',
                    fill: a.pctColor||'#fff', fontSize:(a.pctSize||28), fontWeight:a.pctFontWeight||700
                }, (skill.pct||0)+'%'),
                /* Small skill name inside */
                a.showLabel && a.labelPosition === 'inside' && el('text', {
                    x:cx, y:cy+(a.pctSize||28)*0.65, dominantBaseline:'middle', textAnchor:'middle',
                    fill:a.labelColor||'#fff', fontSize:a.labelSize||14, opacity:0.7
                }, skill.name)
            ),
            /* Outside labels */
            (a.showPercentage && a.labelPosition !== 'inside') && el('div', { className: 'bkbg-sr-pct-below', style: { color:a.pctColor||'#fff' } }, (skill.pct||0)+'%'),
            (a.showLabel    && a.labelPosition !== 'inside') && el('div', { className: 'bkbg-sr-name-below', style: { color:a.labelColor||'#fff' } }, skill.name)
        );
    }

    /** Concentric SVG preview */
    function ConcentricPreview(props) {
        var a = props.attr;
        var skills = a.skills || [];
        var ringGap = a.ringGap || 14;
        var sw = a.strokeWidth || 10;
        var totalSize = (a.ringSize || 140) + (skills.length - 1) * (sw + ringGap);
        var cx = totalSize / 2, cy = totalSize / 2;

        var rings = skills.map(function(skill, i) {
            var r = (totalSize / 2) - sw/2 - i*(sw + ringGap);
            if (r <= 0) return null;
            var circ = 2 * Math.PI * r;
            return el('g', { key: i },
                el('circle', {cx:cx,cy:cy,r:r,fill:'none',stroke:a.trackColor||'#1f2937',strokeWidth:sw}),
                el('circle', {
                    cx:cx,cy:cy,r:r,fill:'none',
                    stroke:skill.color||'#7c3aed',strokeWidth:sw,
                    strokeDasharray:circ,strokeDashoffset:circ*(1-(skill.pct||0)/100),
                    strokeLinecap:a.lineCap||'round',transform:'rotate(-90 '+cx+' '+cy+')'
                })
            );
        }).filter(Boolean);

        return el('div', { style: { display:'flex', flexDirection:'column', alignItems:'center', gap:16 } },
            el('svg', { width:totalSize, height:totalSize, viewBox:'0 0 '+totalSize+' '+totalSize, style:{display:'block',maxWidth:'100%'} },
                rings,
                a.centerLabel && el('text', {x:cx,y:cy,dominantBaseline:'middle',textAnchor:'middle',fill:a.centerLabelColor||'#fff',fontSize:a.centerLabelSize||18,fontWeight:700},a.centerLabel)
            ),
            /* Legend */
            el('div', { style: { display:'flex', flexDirection:'column', gap:6, minWidth:160 } },
                skills.map(function(s,i){
                    return el('div',{key:i,style:{display:'flex',alignItems:'center',gap:8}},
                        el('div',{style:{width:10,height:10,borderRadius:'50%',background:s.color||'#7c3aed',flexShrink:0}}),
                        el('span',{className:'bkbg-sr-legend-name',style:{color:a.labelColor||'#fff',flex:1}},s.name),
                        el('span',{className:'bkbg-sr-legend-pct',style:{color:s.color||'#7c3aed'}},(s.pct||0)+'%')
                    );
                })
            )
        );
    }

    registerBlockType('blockenberg/skill-rings', {
        title: 'Skill Rings',
        icon: 'chart-pie',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr = props.attributes; var setAttr = props.setAttributes;

            function updateSkill(i, key, val) {
                var s = (attr.skills||[]).map(function(x){return Object.assign({},x);}); s[i][key]=val; setAttr({skills:s});
            }
            function addSkill() { setAttr({skills:(attr.skills||[]).concat([{name:'New Skill',pct:70,color:'#7c3aed'}])}); }
            function removeSkill(i) { setAttr({skills:(attr.skills||[]).filter(function(_,j){return j!==i;})}); }

            var skillPanels = (attr.skills||[]).map(function(s,i){
                return el(PanelBody,{key:i,title:(i+1)+'. '+s.name,initialOpen:false},
                    el(TextControl,{__nextHasNoMarginBottom:true,label:'Skill Name',value:s.name,onChange:function(v){updateSkill(i,'name',v);}}),
                    el(RangeControl,{__nextHasNoMarginBottom:true,label:'Percentage',value:s.pct,min:0,max:100,onChange:function(v){updateSkill(i,'pct',v);}}),
                    el('div',{style:{marginBottom:8}},
                        el('label',{style:{display:'block',fontSize:12,marginBottom:4}},'Color'),
                        el('input',{type:'color',value:s.color||'#7c3aed',style:{width:40,height:30,cursor:'pointer',border:'1px solid #ccc',borderRadius:4},onChange:function(e){updateSkill(i,'color',e.target.value);}})
                    ),
                    el(Button,{variant:'tertiary',isDestructive:true,isSmall:true,onClick:function(){removeSkill(i);}},'Remove')
                );
            });

            var preview = attr.layout === 'concentric'
                ? el(ConcentricPreview, {attr:attr})
                : el('div', { style: { display:'flex', flexWrap:'wrap', gap:32, justifyContent:'center' } },
                    (attr.skills||[]).map(function(s,i){ return el(RingPreview,{key:i,skill:s,attr:attr}); })
                );

            return el(React.Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody,{title:'Layout & Animation',initialOpen:true},
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Layout',value:attr.layout,options:LAYOUT_OPTS,onChange:function(v){setAttr({layout:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:attr.layout==='concentric'?'Outer Ring Size (px)':'Ring Size (px)',value:attr.ringSize,min:80,max:400,onChange:function(v){setAttr({ringSize:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Stroke Width (px)',value:attr.strokeWidth,min:2,max:40,onChange:function(v){setAttr({strokeWidth:v});}}),
                        attr.layout==='concentric' && el(RangeControl,{__nextHasNoMarginBottom:true,label:'Gap Between Rings (px)',value:attr.ringGap,min:2,max:40,onChange:function(v){setAttr({ringGap:v});}}),
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Line Cap',value:attr.lineCap,options:LINECAP_OPTS,onChange:function(v){setAttr({lineCap:v});}})
                    ),
                    el(PanelBody,{title:'Animation',initialOpen:false},
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Duration (ms)',value:attr.animDuration,min:200,max:4000,step:100,onChange:function(v){setAttr({animDuration:v});}}),
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Easing',value:attr.animEasing,options:EASING_OPTS,onChange:function(v){setAttr({animEasing:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Stagger Delay (ms)',value:attr.animDelay,min:0,max:500,onChange:function(v){setAttr({animDelay:v});}})
                    ),
                    el(PanelBody,{title:'Labels',initialOpen:false},
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Percentage',checked:attr.showPercentage,onChange:function(v){setAttr({showPercentage:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Skill Name',checked:attr.showLabel,onChange:function(v){setAttr({showLabel:v});}}),
                        attr.layout === 'row' && el(SelectControl,{__nextHasNoMarginBottom:true,label:'Label Position',value:attr.labelPosition,options:LABEL_POS_OPTS,onChange:function(v){setAttr({labelPosition:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Percentage Size (px)',value:attr.pctSize,min:12,max:60,onChange:function(v){setAttr({pctSize:v});}}),
                        attr.layout === 'concentric' && el(TextControl,{__nextHasNoMarginBottom:true,label:'Center Label',value:attr.centerLabel,onChange:function(v){setAttr({centerLabel:v});}})
                    ),
                    el(PanelBody,{title:'Spacing',initialOpen:false},
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Padding Top (px)',value:attr.paddingTop,min:0,max:200,onChange:function(v){setAttr({paddingTop:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Padding Bottom (px)',value:attr.paddingBottom,min:0,max:200,onChange:function(v){setAttr({paddingBottom:v});}})
                    ),
                    
                el( PanelBody, { title: 'Typography', initialOpen: false },
                    _tc() && el(_tc(), { label: 'Percentage', value: attr.pctTypo || {}, onChange: function (v) { setAttr({ pctTypo: v }); } }),
                    _tc() && el(_tc(), { label: 'Label', value: attr.labelTypo || {}, onChange: function (v) { setAttr({ labelTypo: v }); } })
                ),
el(PanelColorSettings,{
                        title:'Colors',initialOpen:false,
                        colorSettings:[
                            {value:attr.bgColor,       onChange:function(v){setAttr({bgColor:       v||''});},label:'Background'},
                            {value:attr.trackColor,    onChange:function(v){setAttr({trackColor:    v||'#1f2937'});},label:'Track (empty arc)'},
                            {value:attr.pctColor,      onChange:function(v){setAttr({pctColor:      v||'#ffffff'});},label:'Percentage Text'},
                            {value:attr.labelColor,    onChange:function(v){setAttr({labelColor:    v||'#ffffff'});},label:'Label Text'},
                            attr.layout==='concentric' && {value:attr.centerLabelColor,onChange:function(v){setAttr({centerLabelColor:v||'#fff'});},label:'Center Label'}
                        ].filter(Boolean)
                    }),
                    el(PanelBody,{title:'Skills',initialOpen:false},
                        skillPanels,
                        el(Button,{variant:'secondary',isSmall:true,style:{marginTop:8},onClick:addSkill},'+ Add Skill')
                    )
                ),
                el('div', useBlockProps(),
                    el('div', {
                        style: Object.assign({ background:attr.bgColor||'transparent', padding:(attr.paddingTop||60)+'px clamp(20px,5vw,60px) '+(attr.paddingBottom||60)+'px' }, getTypoCssVars(attr))
                    }, preview)
                )
            );
        },

        save: function (props) {
            var sv = getTypoCssVars(props.attributes);
            return el('div', useBlockProps.save(),
                el('div', { className:'bkbg-sr-app', 'data-opts':JSON.stringify(props.attributes), style: sv })
            );
        }
    });
}() );
