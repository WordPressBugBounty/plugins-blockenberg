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
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var _tvf = function (typo, prefix) { var fn = getTypoCssVars(); return fn ? fn(typo, prefix) : {}; };

    var UNIT_OPTS = [
        { value: 'word', label: 'Word by word' },
        { value: 'char', label: 'Character by character' },
        { value: 'line', label: 'Line by line' }
    ];
    var ANIM_OPTS = [
        { value: 'slide-up',  label: 'Slide Up' },
        { value: 'fade',      label: 'Fade In' },
        { value: 'blur',      label: 'Blur In' },
        { value: 'clip',      label: 'Clip (curtain)' },
        { value: 'scale',     label: 'Scale Up' }
    ];
    var TAG_OPTS = ['h1','h2','h3','h4','p'].map(function(t){return{value:t,label:t.toUpperCase()};});
    var ALIGN_OPTS = [
        {value:'left',   label:'Left'},
        {value:'center', label:'Center'},
        {value:'right',  label:'Right'}
    ];

    /* Split text into chunks for preview */
    function renderPreview(a, revealed) {
        var text = a.text || '';
        var units = a.revealUnit === 'char' ? text.split('') : text.split(/\s+/);
        var accentSet = {};
        (a.accentWords||'').split(',').forEach(function(w){ accentSet[w.trim().toLowerCase()] = true; });

        var spans = units.map(function(unit, i) {
            var pct = Math.min(1, i / Math.max(units.length - 1, 1));
            var isAccent = accentSet[unit.toLowerCase()];
            var color = isAccent
                ? (a.useGradient ? 'transparent' : a.accentColor)
                : a.textColor;
            var style = {
                opacity: revealed ? 1 : 0.08,
                transition: 'all '+(a.duration||600)+'ms ease '+(i*(a.stagger||60))+'ms',
                color: color,
                display: 'inline-block',
                marginRight: a.revealUnit === 'char' ? '0' : '0.25em'
            };
            if (isAccent && a.useGradient) {
                style.background = 'linear-gradient(90deg, '+(a.gradFrom||'#7c3aed')+', '+(a.gradTo||'#ec4899')+')';
                style.WebkitBackgroundClip = 'text';
                style.backgroundClip = 'text';
                style.WebkitTextFillColor = 'transparent';
            }
            return el('span', {key:i, style:style}, unit + (a.revealUnit === 'char' ? '' : ' '));
        });

        return el(a.tag||'h2', {
            className: 'bkbg-trs-heading',
            style: {
                textAlign:a.textAlign||'center',
                color:a.textColor||'#0f172a',
                margin:0
            }
        }, spans);
    }

    registerBlockType('blockenberg/text-reveal-scroll', {
        title: 'Text Reveal on Scroll',
        icon: 'editor-paragraph',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr = props.attributes; var setAttr = props.setAttributes;
            var revealed = true; /* always shown in editor */

            return el(React.Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, {title:'Content', initialOpen:true},
                        el(TextareaControl,{__nextHasNoMarginBottom:true,label:'Main Text',value:attr.text,onChange:function(v){setAttr({text:v});}}),
                        el(TextControl,{__nextHasNoMarginBottom:true,label:'Subtext (optional)',value:attr.subtext,onChange:function(v){setAttr({subtext:v});}}),
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Heading Tag',value:attr.tag,options:TAG_OPTS,onChange:function(v){setAttr({tag:v});}}),
                        el(TextControl,{__nextHasNoMarginBottom:true,label:'Accent Words (comma-separated)',help:'These words get the accent color.',value:attr.accentWords,onChange:function(v){setAttr({accentWords:v});}})
                    ),
                    el(PanelBody, {title:'Reveal Animation', initialOpen:true},
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Reveal Unit',value:attr.revealUnit,options:UNIT_OPTS,onChange:function(v){setAttr({revealUnit:v});}}),
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Animation Style',value:attr.revealAnim,options:ANIM_OPTS,onChange:function(v){setAttr({revealAnim:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Stagger Delay (ms)',value:attr.stagger,min:0,max:300,onChange:function(v){setAttr({stagger:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Transition Duration (ms)',value:attr.duration,min:100,max:2000,step:50,onChange:function(v){setAttr({duration:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Trigger Offset (%)',value:attr.triggerOffset,min:0,max:50,onChange:function(v){setAttr({triggerOffset:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Animate Once',checked:attr.once,onChange:function(v){setAttr({once:v});}})
                    ),
                    el(PanelBody, {title:'Typography', initialOpen:false},
                        getTypoControl() && getTypoControl()({
                            label: 'Title',
                            value: attr.titleTypo || {},
                            onChange: function (v) { setAttr({ titleTypo: v }); }
                        }),
                        getTypoControl() && getTypoControl()({
                            label: 'Subtext',
                            value: attr.subtextTypo || {},
                            onChange: function (v) { setAttr({ subtextTypo: v }); }
                        }),
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Text Align',value:attr.textAlign,options:ALIGN_OPTS,onChange:function(v){setAttr({textAlign:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Max Width (px)',value:attr.maxWidth,min:400,max:1600,onChange:function(v){setAttr({maxWidth:v});}})
                    ),
                    el(PanelBody, {title:'Spacing', initialOpen:false},
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Padding Top (px)',value:attr.paddingTop,min:0,max:200,onChange:function(v){setAttr({paddingTop:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Padding Bottom (px)',value:attr.paddingBottom,min:0,max:200,onChange:function(v){setAttr({paddingBottom:v});}})
                    ),
                    el(PanelBody, {title:'Accent Color', initialOpen:false},
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Gradient Accent',checked:attr.useGradient,onChange:function(v){setAttr({useGradient:v});}})
                    ),
                    el(PanelColorSettings, {
                        title:'Colors',initialOpen:false,
                        colorSettings:[
                            {value:attr.bgColor,      onChange:function(v){setAttr({bgColor:v||''});},     label:'Background'},
                            {value:attr.textColor,    onChange:function(v){setAttr({textColor:v||'#0f172a'});},label:'Text'},
                            {value:attr.accentColor,  onChange:function(v){setAttr({accentColor:v||'#7c3aed'});},label:'Accent Words'},
                            {value:attr.subtextColor, onChange:function(v){setAttr({subtextColor:v||'#64748b'});},label:'Subtext'},
                            attr.useGradient && {value:attr.gradFrom,onChange:function(v){setAttr({gradFrom:v||'#7c3aed'});},label:'Gradient From'},
                            attr.useGradient && {value:attr.gradTo,  onChange:function(v){setAttr({gradTo:  v||'#ec4899'});},label:'Gradient To'}
                        ].filter(Boolean)
                    })
                ),
                el('div', useBlockProps((function () {
                    var s = {};
                    Object.assign(s, _tvf(attr.titleTypo, '--bktrs-tt-'));
                    Object.assign(s, _tvf(attr.subtextTypo, '--bktrs-st-'));
                    return { className: 'bkbg-trs-section', style: s };
                })()),
                    el('div', {
                        style: {
                            background:attr.bgColor||'transparent',
                            padding:(attr.paddingTop||80)+'px clamp(20px,5vw,60px) '+(attr.paddingBottom||80)+'px',
                            textAlign:attr.textAlign||'center'
                        }
                    },
                        el('div', {style:{maxWidth:(attr.maxWidth||900)+'px', margin:'0 auto'}},
                            renderPreview(attr, revealed),
                            attr.subtext && el('p', {
                                className: 'bkbg-trs-subtext',
                                style: {
                                    color:attr.subtextColor||'#64748b',
                                    marginTop:24
                                }
                            }, attr.subtext)
                        )
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save((function () {
                var s = {};
                Object.assign(s, _tvf(props.attributes.titleTypo, '--bktrs-tt-'));
                Object.assign(s, _tvf(props.attributes.subtextTypo, '--bktrs-st-'));
                return { style: s };
            })()),
                el('div', { className:'bkbg-trs-app', 'data-opts':JSON.stringify(props.attributes) })
            );
        }
    });
}() );
