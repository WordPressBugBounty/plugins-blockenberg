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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    var LAYOUT_OPTS = [
        { value: 'left-sticky',  label: 'Sticky panel — Left' },
        { value: 'right-sticky', label: 'Sticky panel — Right' }
    ];

    function FeatureCard(props) {
        var f = props.feature; var a = props.attr; var active = props.active;
        return el('div', {
            style: {
                display:'flex', gap:20, padding:'28px 28px', borderRadius:16,
                border: '1px solid ' + (active ? a.accentColor : (a.cardBorder||'#1f2937')),
                background: active ? (a.activeCardBg||'#1e1b4b') : (a.cardBg||'#111827'),
                transition:'all 0.35s ease', marginBottom:16,
                boxShadow: active ? '0 0 0 1px '+(a.accentColor||'#7c3aed')+'33' : 'none',
                opacity: active ? 1 : 0.65
            }
        },
            el('div', { style: { fontSize:(a.cardIconSize||36)+'px', lineHeight:1, flexShrink:0, marginTop:2, color:a.accentColor||'#7c3aed' } }, IP().buildEditorIcon(f.iconType || 'custom-char', f.icon, f.iconDashicon, f.iconImageUrl, f.iconDashiconColor)),
            el('div', null,
                el('div', { className:'bkbg-ssc-card-title', style: { color:a.headingColor||'#fff', marginBottom:6 } }, f.title),
                el('div', { className:'bkbg-ssc-card-desc', style: { color:a.textColor||'#e2e8f0' } }, f.desc)
            )
        );
    }

    function StickyPanel(props) {
        var a = props.attr;
        return el('div', {
            style: { background: a.panelBg||'transparent', padding:'0 0 40px' }
        },
            el('div', { className:'bkbg-ssc-heading', style: { color:a.headingColor||'#fff', marginBottom:20 } }, a.sectionTitle),
            el('div', { className:'bkbg-ssc-subtitle', style: { color:a.textColor||'#e2e8f0', marginBottom:32, maxWidth:380 } }, a.sectionSubtitle),
            a.showCta && el('a', { href:a.ctaUrl||'#', style: { display:'inline-block', background:a.ctaBg||'#7c3aed', color:a.ctaColor||'#fff', padding:'12px 28px', borderRadius:8, fontWeight:700, fontSize:15, textDecoration:'none' } }, a.ctaLabel||'Get Started')
        );
    }

    function EditorPreview(props) {
        var a = props.attr;
        var activeIdx = props.activeIdx;
        var features = a.features || [];
        var isLeft = a.layout !== 'right-sticky';

        var stickyPanel = el(StickyPanel, {attr:a});
        var cardsPanel  = el('div', {style:{flex:1}}, features.map(function(f,i){ return el(FeatureCard,{key:i,feature:f,attr:a,active:i===activeIdx}); }));

        return el('div', {
            style: { display:'flex', gap:64, flexDirection: isLeft ? 'row' : 'row-reverse', background:a.sectionBg||'#0a0a0f', borderRadius:12, padding:'48px', color:a.textColor||'#e2e8f0' }
        },
            el('div', { style: { flex:'0 0 340px' } }, stickyPanel),
            cardsPanel
        );
    }

    registerBlockType('blockenberg/scroll-sticky-content', {
        title: 'Scroll Sticky Content',
        icon: 'columns',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr = props.attributes; var setAttr = props.setAttributes;
            var activeIdx = 0;

            function updateFeature(i, key, val) {
                var f = attr.features.map(function(x){return Object.assign({},x);});
                f[i][key] = val; setAttr({features:f});
            }
            function addFeature() {
                setAttr({features:attr.features.concat([{icon:'💡',iconType:'custom-char',iconDashicon:'',iconImageUrl:'',title:'New Feature',desc:'Describe this feature.'}])});
            }
            function removeFeature(i) {
                var f = attr.features.filter(function(_,j){return j!==i;});
                setAttr({features:f});
            }

            var featurePanels = (attr.features||[]).map(function(f,i){
                return el(PanelBody, { key:i, title:'Item '+(i+1)+': '+f.title, initialOpen:false },
                    el(IP().IconPickerControl, IP().iconPickerProps(f, function (key, val) { updateFeature(i, key, val); }, { label: 'Icon', typeAttr: 'iconType', dashiconAttr: 'iconDashicon', imageUrlAttr: 'iconImageUrl' })),
                    el(TextControl,{__nextHasNoMarginBottom:true,label:'Title',value:f.title,onChange:function(v){updateFeature(i,'title',v);}}),
                    el(TextareaControl,{__nextHasNoMarginBottom:true,label:'Description',value:f.desc,onChange:function(v){updateFeature(i,'desc',v);}}),
                    el(Button,{variant:'tertiary',isDestructive:true,isSmall:true,onClick:function(){removeFeature(i);}},'Remove Item')
                );
            });

            return el(React.Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, {title:'Panel Content', initialOpen:true},
                        el(TextControl,{__nextHasNoMarginBottom:true,label:'Heading',value:attr.sectionTitle,onChange:function(v){setAttr({sectionTitle:v});}}),
                        el(TextareaControl,{__nextHasNoMarginBottom:true,label:'Subtext',value:attr.sectionSubtitle,onChange:function(v){setAttr({sectionSubtitle:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show CTA Button',checked:attr.showCta,onChange:function(v){setAttr({showCta:v});}}),
                        attr.showCta && el(TextControl,{__nextHasNoMarginBottom:true,label:'CTA Label',value:attr.ctaLabel,onChange:function(v){setAttr({ctaLabel:v});}}),
                        attr.showCta && el(TextControl,{__nextHasNoMarginBottom:true,label:'CTA URL',value:attr.ctaUrl,onChange:function(v){setAttr({ctaUrl:v});}})
                    ),
                    el(PanelBody, {title:'Layout & Scroll',initialOpen:false},
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Sticky Panel Position',value:attr.layout,options:LAYOUT_OPTS,onChange:function(v){setAttr({layout:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Sticky Top Offset (px)',value:attr.stickyOffset,min:0,max:200,onChange:function(v){setAttr({stickyOffset:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Line Connector',checked:attr.lineConnector,onChange:function(v){setAttr({lineConnector:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Animate Cards on Scroll',checked:attr.animateCards,onChange:function(v){setAttr({animateCards:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Intersection Threshold',value:attr.threshold,min:0.1,max:0.9,step:0.05,onChange:function(v){setAttr({threshold:v});}})
                    ),
                    el(PanelBody, {title:'Spacing & Sizes',initialOpen:false},
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Padding Top (px)',value:attr.paddingTop,min:0,max:200,onChange:function(v){setAttr({paddingTop:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Padding Bottom (px)',value:attr.paddingBottom,min:0,max:200,onChange:function(v){setAttr({paddingBottom:v});}}),
                        el(RangeControl,{__nextHasNoMarginBottom:true,label:'Card Icon Size (px)',value:attr.cardIconSize,min:16,max:80,onChange:function(v){setAttr({cardIconSize:v});}}),
                        ),
                    
                el( PanelBody, { title: 'Typography', initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: 'Heading Typography', value: attr.headingTypo||{}, onChange: function(v){ setAttr({headingTypo:v}); } }),
                    getTypoControl() && el(getTypoControl(), { label: 'Subtitle Typography', value: attr.subtitleTypo||{}, onChange: function(v){ setAttr({subtitleTypo:v}); } }),
                    getTypoControl() && el(getTypoControl(), { label: 'Card Title Typography', value: attr.cardTitleTypo||{}, onChange: function(v){ setAttr({cardTitleTypo:v}); } }),
                    getTypoControl() && el(getTypoControl(), { label: 'Card Desc Typography', value: attr.cardDescTypo||{}, onChange: function(v){ setAttr({cardDescTypo:v}); } })
                ),
el(PanelColorSettings, {
                        title:'Colors', initialOpen:false,
                        colorSettings:[
                            {value:attr.sectionBg,    onChange:function(v){setAttr({sectionBg:    v||'#0a0a0f'});},label:'Section Background'},
                            {value:attr.headingColor,  onChange:function(v){setAttr({headingColor: v||'#ffffff'});},label:'Heading'},
                            {value:attr.textColor,     onChange:function(v){setAttr({textColor:    v||'#e2e8f0'});},label:'Body Text'},
                            {value:attr.accentColor,   onChange:function(v){setAttr({accentColor:  v||'#7c3aed'});},label:'Accent'},
                            {value:attr.cardBg,        onChange:function(v){setAttr({cardBg:        v||'#111827'});},label:'Card Background'},
                            {value:attr.activeCardBg,  onChange:function(v){setAttr({activeCardBg: v||'#1e1b4b'});},label:'Active Card Bg'},
                            {value:attr.cardBorder,    onChange:function(v){setAttr({cardBorder:   v||'#1f2937'});},label:'Card Border'},
                            attr.showCta && {value:attr.ctaBg,   onChange:function(v){setAttr({ctaBg:     v||'#7c3aed'});},label:'CTA Background'},
                            attr.showCta && {value:attr.ctaColor,onChange:function(v){setAttr({ctaColor:  v||'#ffffff'});},label:'CTA Text'}
                        ].filter(Boolean)
                    }),
                    el(PanelBody, {title:'Features', initialOpen:false},
                        featurePanels,
                        el(Button,{variant:'secondary',isSmall:true,style:{marginTop:8},onClick:addFeature},'+ Add Feature')
                    )
                ),
                el('div', useBlockProps((function(){
                    var _tv = getTypoCssVars();
                    var s = {};
                    if(_tv) Object.assign(s, _tv(attr.headingTypo||{}, '--bkssc-ht-'));
                    if(_tv) Object.assign(s, _tv(attr.subtitleTypo||{}, '--bkssc-st-'));
                    if(_tv) Object.assign(s, _tv(attr.cardTitleTypo||{}, '--bkssc-ct-'));
                    if(_tv) Object.assign(s, _tv(attr.cardDescTypo||{}, '--bkssc-cd-'));
                    return { style: s };
                })()), el(EditorPreview, {attr:attr, activeIdx:activeIdx}))
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className:'bkbg-ssc-app', 'data-opts':JSON.stringify(props.attributes) })
            );
        }
    });
}() );
