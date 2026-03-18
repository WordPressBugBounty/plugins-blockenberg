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
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var EASING_OPTS = [
        { value: 'ease-out',   label: 'Ease Out' },
        { value: 'ease-in',    label: 'Ease In' },
        { value: 'linear',     label: 'Linear' },
        { value: 'spring',     label: 'Spring' }
    ];

    function EditorPreview(props) {
        var a = props.attr;
        var grad = a.useGradient
            ? 'linear-gradient(90deg, '+(a.particleColor||'#7c3aed')+', '+(a.particleColor2||'#ec4899')+')'
            : (a.particleColor||'#7c3aed');
        return el('div', {
            style: { background:a.bgColor||'#0a0a0f', padding:(a.paddingTop||80)+'px 40px '+(a.paddingBottom||80)+'px', textAlign:'center', borderRadius:8 }
        },
            el('div', {
                style: {
                    fontSize: (a.sampleFontSize||100)+'px',
                    fontWeight: a.fontWeight||'900',
                    fontFamily: a.fontFamily||'system-ui, sans-serif',
                    background: grad,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: a.useGradient ? 'transparent' : 'unset',
                    color: a.useGradient ? 'transparent' : (a.particleColor||'#7c3aed'),
                    lineHeight: 1,
                    marginBottom: 16
                }
            }, a.text || 'BLOCKENBERG'),
            a.subtext && el('p', {
                className: 'bkbg-pt-subtext',
                style: { color:a.subtextColor||'#94a3b8', margin:0 }
            }, a.subtext)
        );
    }

    registerBlockType('blockenberg/particle-text', {
        title: 'Particle Text',
        icon: 'format-quote',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr = props.attributes; var setAttr = props.setAttributes;

            return el(React.Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, {title:'Content', initialOpen:true},
                        el(TextControl,{__nextHasNoMarginBottom:true,label:'Particle Text',help:'Keep short for best effect.',value:attr.text,onChange:function(v){setAttr({text:v});}}),
                        el(TextControl,{__nextHasNoMarginBottom:true,label:'Subtext (below canvas)',value:attr.subtext,onChange:function(v){setAttr({subtext:v});}}),
                        ),
                    el(PanelBody, {title:'Particle Settings', initialOpen:true},
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Particle Size (px)',value:attr.particleSize,min:1,max:6,step:0.5,onChange:function(v){setAttr({particleSize:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Particle Gap (px)',help:'Distance between sampled pixels.',value:attr.particleGap,min:2,max:12,onChange:function(v){setAttr({particleGap:v});}})
                    ),
                    el(PanelBody, {title:'Animation', initialOpen:false},
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Scatter Radius (px)',value:attr.scatterRadius,min:50,max:2000,onChange:function(v){setAttr({scatterRadius:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Assemble Duration (ms)',value:attr.enterDuration,min:200,max:5000,step:100,onChange:function(v){setAttr({enterDuration:v});}}),
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Easing',value:attr.easing,options:EASING_OPTS,onChange:function(v){setAttr({easing:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Hover Scatter Effect',checked:attr.hoverEffect,onChange:function(v){setAttr({hoverEffect:v});}}),
                        attr.hoverEffect && el(RangeControl,{__nextHasNoMarginBottom:true,label:'Hover Radius (px)',value:attr.hoverRadius,min:20,max:300,onChange:function(v){setAttr({hoverRadius:v});}})
                    ),
                    el(PanelBody, {title:'Sizing', initialOpen:false},
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Canvas Height (px)',value:attr.canvasHeight,min:100,max:1000,onChange:function(v){setAttr({canvasHeight:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Padding Top (px)',value:attr.paddingTop,min:0,max:200,onChange:function(v){setAttr({paddingTop:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Padding Bottom (px)',value:attr.paddingBottom,min:0,max:200,onChange:function(v){setAttr({paddingBottom:v});}})
                    ),
                    el(PanelColorSettings, {
                        title:'Colors',initialOpen:false,
                        colorSettings:[
                            {value:attr.bgColor,       onChange:function(v){setAttr({bgColor:       v||'#0a0a0f'});},label:'Background'},
                            {value:attr.particleColor, onChange:function(v){setAttr({particleColor: v||'#7c3aed'});},label:'Particle Color 1'},
                            {value:attr.particleColor2,onChange:function(v){setAttr({particleColor2:v||'#ec4899'});},label:'Particle Color 2 (gradient end)'},
                            {value:attr.subtextColor,  onChange:function(v){setAttr({subtextColor:  v||'#94a3b8'});},label:'Subtext Color'}
                        ]
                    }),
                    
                    el( PanelBody, { title: 'Typography', initialOpen: false },
                        el(TextControl,{__nextHasNoMarginBottom:true,label:'Font Family',value:attr.fontFamily,onChange:function(v){setAttr({fontFamily:v});}}),
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Font Weight',value:attr.fontWeight,options:['300','400','500','600','700','800','900'].map(function(w){return{value:w,label:w};}),onChange:function(v){setAttr({fontWeight:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Sample Font Size (px)',help:'Larger = more detail with finer gap.',value:attr.sampleFontSize,min:40,max:300,onChange:function(v){setAttr({sampleFontSize:v});}}),
                        el( getTypoControl(), { label: 'Subtext', value: attr.subtextTypo, onChange: function(v){ setAttr({ subtextTypo: v }); } })
                    ),
el(PanelBody, {title:'Gradient Color', initialOpen:false},
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Use Gradient',checked:attr.useGradient,onChange:function(v){setAttr({useGradient:v});}})
                    )
                ),
                el('div', useBlockProps((function() {
                    var tv = getTypoCssVars();
                    var s = {};
                    Object.assign(s, tv(attr.subtextTypo, '--bkbg-pt-st-'));
                    return { style: s };
                })()), el(EditorPreview, {attr:attr}))
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className:'bkbg-pt-app', 'data-opts':JSON.stringify(props.attributes) })
            );
        }
    });
}() );
