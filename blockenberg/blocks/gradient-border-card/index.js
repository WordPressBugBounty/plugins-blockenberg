( function () {
    var el = React.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var Button = wp.components.Button;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;

    /* ── Typography lazy getters ── */
    function _tc() { return window.bkbgTypographyControl || null; }
    function _tv() { return window.bkbgTypoCssVars || function () { return {}; }; }
    var IP = function () { return window.bkbgIconPicker; };

    var ANIM_TYPES = [
        { value: 'rotate',  label: 'Rotate — border spins' },
        { value: 'shift',   label: 'Shift — gradient slides' },
        { value: 'pulse',   label: 'Pulse — opacity breathes' },
        { value: 'static',  label: 'Static — no animation' }
    ];

    function CardPreview(props) {
        var a = props.attr;
        var colors = a.borderColors || ['#7c3aed','#ec4899','#06b6d4','#f59e0b'];
        var gradient = 'conic-gradient(' + colors.join(', ') + ', ' + colors[0] + ')';

        var wrapS = Object.assign({ maxWidth: (a.maxWidth || 420) + 'px', margin: '0 auto', position: 'relative', padding: (a.borderWidth || 2) + 'px', borderRadius: (a.borderRadius || 20) + 'px', background: gradient }, _tv()(a.typoTitle,'--bkbg-gbc-tt-'), _tv()(a.typoBody,'--bkbg-gbc-bd-'), _tv()(a.typoBadge,'--bkbg-gbc-bg-'));

        return el('div', { style: wrapS },
            el('div', {
                style: { background: a.cardBg || '#0f172a', borderRadius: Math.max(0, (a.borderRadius||20) - (a.borderWidth||2)) + 'px', padding: (a.paddingV||32)+'px '+(a.paddingH||28)+'px', textAlign: a.textAlign||'left', color: a.textColor||'#e2e8f0', position: 'relative', zIndex: 1 }
            },
                a.showBadge && a.badge && el('div', { className:'bkbg-gbc-badge', style: { background:a.badgeBg||'#7c3aed', color:a.badgeColor||'#fff', borderRadius:'50px', padding:'2px 12px', marginBottom:12 } }, a.badge),
                a.showIcon && el('div', { className: 'bkbg-gbc-icon', style: { fontSize:(a.iconSize||36)+'px', color:a.iconColor||'#a78bfa', marginBottom:12 } },
                    (!a.iconType || a.iconType === 'custom-char') ? (a.icon || '✦') : IP().buildEditorIcon(a.iconType, a.icon, a.iconDashicon, a.iconImageUrl, a.iconDashiconColor)
                ),
                el(a.titleTag||'h3', { className:'bkbg-gbc-title', style: { margin:'0 0 10px', color:a.titleColor||'#fff' } }, a.title),
                el('p', { className:'bkbg-gbc-desc', style: { margin:0, color:a.textColor||'#e2e8f0' } }, a.description)
            )
        );
    }

    registerBlockType('blockenberg/gradient-border-card', {
        title: 'Gradient Border Card',
        icon: 'tagcloud',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr = props.attributes; var setAttr = props.setAttributes;

            function updateColor(i, val) { var c = (attr.borderColors||[]).slice(); c[i] = val; setAttr({borderColors:c}); }
            function addColor() { setAttr({borderColors:(attr.borderColors||['#7c3aed']).concat(['#ffffff'])}); }
            function removeColor(i) { var c = (attr.borderColors||[]).slice(); c.splice(i,1); setAttr({borderColors:c}); }

            return el(React.Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title:'Content', initialOpen:true },
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Badge',checked:attr.showBadge,onChange:function(v){setAttr({showBadge:v});}}),
                        attr.showBadge && el(TextControl,{__nextHasNoMarginBottom:true,label:'Badge Text',value:attr.badge,onChange:function(v){setAttr({badge:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Icon',checked:attr.showIcon,onChange:function(v){setAttr({showIcon:v});}}),
                        attr.showIcon && el('p', { style: { fontSize: '11px', fontWeight: 600, marginTop: '8px' } }, 'Icon'),
                        attr.showIcon && el(IP().IconPickerControl, IP().iconPickerProps(attr, setAttr)),
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Title Tag',value:attr.titleTag,options:['h2','h3','h4','h5'].map(function(t){return{value:t,label:t.toUpperCase()};}),onChange:function(v){setAttr({titleTag:v});}}),
                        el(TextControl,{__nextHasNoMarginBottom:true,label:'Title',value:attr.title,onChange:function(v){setAttr({title:v});}}),
                        el(TextareaControl,{__nextHasNoMarginBottom:true,label:'Description',value:attr.description,onChange:function(v){setAttr({description:v});}})
                    ),
                    el(PanelBody, { title:'Border Gradient', initialOpen:true },
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Animation Type',value:attr.animType,options:ANIM_TYPES,onChange:function(v){setAttr({animType:v});}}),
                        attr.animType !== 'static' && el(RangeControl,{__nextHasNoMarginBottom:true,label:'Animation Speed (s)',value:attr.animSpeed,min:0.5,max:20,step:0.5,onChange:function(v){setAttr({animSpeed:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Border Width (px)',value:attr.borderWidth,min:1,max:12,onChange:function(v){setAttr({borderWidth:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Glow Blur (px)',value:attr.glowBlur,min:0,max:60,onChange:function(v){setAttr({glowBlur:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Glow Opacity',value:attr.glowOpacity,min:0,max:1,step:0.05,onChange:function(v){setAttr({glowOpacity:v});}}),
                        el('div', { style:{marginTop:8} },
                            el('strong',{style:{display:'block',fontSize:12,marginBottom:6}},'Border Colors'),
                            (attr.borderColors||[]).map(function(c,i){
                                return el('div',{key:i,style:{display:'flex',gap:8,marginBottom:4,alignItems:'center'}},
                                    el('input',{type:'color',value:c,style:{width:32,height:28,cursor:'pointer',border:'1px solid #ccc',borderRadius:4},onChange:function(e){updateColor(i,e.target.value);}}),
                                    el('span',{style:{flex:1,fontFamily:'monospace',fontSize:12}},c),
                                    el(Button,{variant:'tertiary',isSmall:true,isDestructive:true,onClick:function(){removeColor(i);},disabled:(attr.borderColors||[]).length<=2},'✕')
                                );
                            }),
                            el(Button,{variant:'secondary',isSmall:true,style:{marginTop:4},onClick:addColor},'+ Add Color')
                        ),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Pause on Hover',checked:attr.pauseOnHover,onChange:function(v){setAttr({pauseOnHover:v});}})
                    ),
                    el(PanelBody, { title:'Card Style', initialOpen:false },
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Border Radius (px)',value:attr.borderRadius,min:0,max:60,onChange:function(v){setAttr({borderRadius:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Padding Vertical (px)',value:attr.paddingV,min:8,max:80,onChange:function(v){setAttr({paddingV:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Padding Horizontal (px)',value:attr.paddingH,min:8,max:80,onChange:function(v){setAttr({paddingH:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Max Width (px)',value:attr.maxWidth,min:200,max:1200,onChange:function(v){setAttr({maxWidth:v});}}),
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Text Align',value:attr.textAlign,options:[{value:'left',label:'Left'},{value:'center',label:'Center'},{value:'right',label:'Right'}],onChange:function(v){setAttr({textAlign:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Scale on Hover',checked:attr.hoverScale,onChange:function(v){setAttr({hoverScale:v});}})
                    ),
                    el(PanelBody, { title:'Typography', initialOpen:false },
                        _tc() && el(_tc(), { label:'Title', value:attr.typoTitle, onChange:function(v){ setAttr({typoTitle:v}); } }),
                        _tc() && el(_tc(), { label:'Body', value:attr.typoBody, onChange:function(v){ setAttr({typoBody:v}); } }),
                        _tc() && el(_tc(), { label:'Badge', value:attr.typoBadge, onChange:function(v){ setAttr({typoBadge:v}); } }),
                        attr.showIcon && el(RangeControl,{__nextHasNoMarginBottom:true,label:'Icon Size (px)',value:attr.iconSize,min:16,max:100,onChange:function(v){setAttr({iconSize:v});}})
                    ),
                    el(PanelColorSettings, {
                        title:'Colors',initialOpen:false,
                        colorSettings:[
                            {value:attr.cardBg,    onChange:function(v){setAttr({cardBg:    v||'#0f172a'});},label:'Card Background'},
                            {value:attr.titleColor,onChange:function(v){setAttr({titleColor:v||'#ffffff'});},label:'Title Color'},
                            {value:attr.textColor, onChange:function(v){setAttr({textColor: v||'#e2e8f0'});},label:'Body Text'},
                            {value:attr.iconColor, onChange:function(v){setAttr({iconColor: v||'#a78bfa'});},label:'Icon Color'},
                            attr.showBadge && {value:attr.badgeBg,   onChange:function(v){setAttr({badgeBg:   v||'#7c3aed'});},label:'Badge Background'},
                            attr.showBadge && {value:attr.badgeColor,onChange:function(v){setAttr({badgeColor:v||'#ffffff'});},label:'Badge Text'}
                        ].filter(Boolean)
                    })
                ),
                el('div', useBlockProps(), el(CardPreview, {attr:attr}))
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className:'bkbg-gbc-app', 'data-opts':JSON.stringify(props.attributes) })
            );
        }
    });
}() );
