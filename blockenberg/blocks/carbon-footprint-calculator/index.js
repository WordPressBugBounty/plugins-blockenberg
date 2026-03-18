( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var __                 = wp.i18n.__;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var RichText           = wp.blockEditor.RichText;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;

    // ── Typography helpers ──────────────────────────────────────────────────
    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    function _tv(typo, prefix) {
        if (!typo) return {};
        var s = {};
        if (typo.family)     s[prefix + 'font-family'] = "'" + typo.family + "', sans-serif";
        if (typo.weight)     s[prefix + 'font-weight'] = typo.weight;
        if (typo.transform)  s[prefix + 'text-transform'] = typo.transform;
        if (typo.style)      s[prefix + 'font-style'] = typo.style;
        if (typo.decoration) s[prefix + 'text-decoration'] = typo.decoration;
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) s[prefix + 'font-size-d'] = typo.sizeDesktop + su;
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) s[prefix + 'font-size-t'] = typo.sizeTablet + su;
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) s[prefix + 'font-size-m'] = typo.sizeMobile + su;
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) s[prefix + 'line-height-d'] = typo.lineHeightDesktop + lhu;
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) s[prefix + 'line-height-t'] = typo.lineHeightTablet + lhu;
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) s[prefix + 'line-height-m'] = typo.lineHeightMobile + lhu;
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) s[prefix + 'letter-spacing-d'] = typo.letterSpacingDesktop + lsu;
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) s[prefix + 'letter-spacing-t'] = typo.letterSpacingTablet + lsu;
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) s[prefix + 'letter-spacing-m'] = typo.letterSpacingMobile + lsu;
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) s[prefix + 'word-spacing-d'] = typo.wordSpacingDesktop + wsu;
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) s[prefix + 'word-spacing-t'] = typo.wordSpacingTablet + wsu;
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) s[prefix + 'word-spacing-m'] = typo.wordSpacingMobile + wsu;
        return s;
    }

    registerBlockType('blockenberg/carbon-footprint-calculator', {
        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            var blockProps = useBlockProps({ style: Object.assign({
                background: attributes.sectionBg,
                padding: attributes.paddingTop+'px 24px '+attributes.paddingBottom+'px'
            }, _tv(attributes.typoTitle, '--bkbg-cfc-tt-'), _tv(attributes.typoSub, '--bkbg-cfc-ts-'))});

            function toggle(key){ return el(ToggleControl,{__nextHasNoMarginBottom:true, label:key, checked:attributes[key], onChange:function(v){var o={};o[key]=v;setAttributes(o);}}); }
            function range(label,key,min,max,step){ return el(RangeControl,{__nextHasNoMarginBottom:true, label:label, value:attributes[key], min:min, max:max, step:step||1, onChange:function(v){var o={};o[key]=v;setAttributes(o);}}); }

            var colors = [
                {label:'Accent / Result',     value:attributes.accentColor,    onChange:function(v){setAttributes({accentColor:v});}},
                {label:'Transport',           value:attributes.transportColor, onChange:function(v){setAttributes({transportColor:v});}},
                {label:'Home Energy',         value:attributes.energyColor,    onChange:function(v){setAttributes({energyColor:v});}},
                {label:'Diet',                value:attributes.dietColor,      onChange:function(v){setAttributes({dietColor:v});}},
                {label:'Shopping',            value:attributes.shoppingColor,  onChange:function(v){setAttributes({shoppingColor:v});}},
                {label:'Good Result',         value:attributes.goodColor,      onChange:function(v){setAttributes({goodColor:v});}},
                {label:'Average Result',      value:attributes.avgColor,       onChange:function(v){setAttributes({avgColor:v});}},
                {label:'High Result',         value:attributes.badColor,       onChange:function(v){setAttributes({badColor:v});}},
                {label:'Section Background',  value:attributes.sectionBg,      onChange:function(v){setAttributes({sectionBg:v});}},
                {label:'Card Background',     value:attributes.cardBg,         onChange:function(v){setAttributes({cardBg:v});}},
                {label:'Title',               value:attributes.titleColor,     onChange:function(v){setAttributes({titleColor:v});}},
                {label:'Subtitle',            value:attributes.subtitleColor,  onChange:function(v){setAttributes({subtitleColor:v});}},
                {label:'Label',               value:attributes.labelColor,     onChange:function(v){setAttributes({labelColor:v});}},
                {label:'Input Border',        value:attributes.inputBorder,    onChange:function(v){setAttributes({inputBorder:v})}},
            ];

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, {title:'Content', initialOpen:true},
                        toggle('showTitle'),
                        attributes.showTitle && el(TextControl,{__nextHasNoMarginBottom:true, label:'Title', value:attributes.title, onChange:function(v){setAttributes({title:v});}}),
                        toggle('showSubtitle'),
                        attributes.showSubtitle && el(TextControl,{__nextHasNoMarginBottom:true, label:'Subtitle', value:attributes.subtitle, onChange:function(v){setAttributes({subtitle:v});}}),
                        el(SelectControl,{__nextHasNoMarginBottom:true, label:'Default Unit',value:attributes.defaultUnit,
                            options:[{label:'Metric (km, kWh, m³)',value:'metric'},{label:'Imperial (mi, kWh, therms)',value:'imperial'}],
                            onChange:function(v){setAttributes({defaultUnit:v});}})
                    ),
                    el(PanelBody, {title:'Display', initialOpen:false},
                        toggle('showComparison'),
                        toggle('showTips')
                    ),
                    el(PanelColorSettings, {title:'Colors', initialOpen:false, colorSettings:colors}),
                    el(PanelBody, {title:'Typography', initialOpen:false},
                        el('p', {style:{margin:'0 0 4px',fontWeight:600,fontSize:'11px',textTransform:'uppercase',color:'#888'}}, 'Title'),
                        el(getTypographyControl(), {
                            label: 'Title Typography',
                            value: attributes.typoTitle,
                            onChange: function(v){setAttributes({typoTitle:v});}
                        }),
                        el('hr', {}),
                        el('p', {style:{margin:'8px 0 4px',fontWeight:600,fontSize:'11px',textTransform:'uppercase',color:'#888'}}, 'Subtitle'),
                        el(getTypographyControl(), {
                            label: 'Subtitle Typography',
                            value: attributes.typoSub,
                            onChange: function(v){setAttributes({typoSub:v});}
                        })
                    ),
                    el(PanelBody, {title:'Sizing', initialOpen:false},
                        range('Max Width (px)','maxWidth',400,1200,10),
                        range('Card Radius (px)','cardRadius',0,32),
                        range('Input Radius (px)','inputRadius',0,24),
                        range('Padding Top (px)','paddingTop',0,120,4),
                        range('Padding Bottom (px)','paddingBottom',0,120,4)
                    )
                ),
                el('div', blockProps,
                    el('div', {
                        style:{
                            background:attributes.cardBg,
                            borderRadius:attributes.cardRadius+'px',
                            padding:'40px',
                            maxWidth:attributes.maxWidth+'px',
                            margin:'0 auto',
                            boxShadow:'0 4px 24px rgba(0,0,0,0.08)'
                        }
                    },
                        el('div', {style:{textAlign:'center'}},
                            attributes.showTitle && el('div', {className:'bkbg-cfc-title', style:{color:attributes.titleColor,marginBottom:'8px'}}, attributes.title),
                            attributes.showSubtitle && el('div', {className:'bkbg-cfc-subtitle', style:{color:attributes.subtitleColor,marginBottom:'32px'}}, attributes.subtitle)
                        ),
                        // Category cards preview
                        el('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'24px'}},
                            [
                                {icon:'🚗',label:'Transport',color:attributes.transportColor},
                                {icon:'🏠',label:'Home Energy',color:attributes.energyColor},
                                {icon:'🥩',label:'Diet',color:attributes.dietColor},
                                {icon:'🛍',label:'Shopping',color:attributes.shoppingColor}
                            ].map(function(cat){
                                return el('div',{key:cat.label, style:{background:cat.color+'15',border:'2px solid '+cat.color+'44',borderRadius:'12px',padding:'16px',textAlign:'center'}},
                                    el('div',{style:{fontSize:'28px',marginBottom:'4px'}},cat.icon),
                                    el('div',{style:{fontSize:'14px',fontWeight:'700',color:cat.color}},cat.label)
                                );
                            })
                        ),
                        el('div', {style:{background:attributes.accentColor+'15',border:'2px solid '+attributes.accentColor+'44',borderRadius:'12px',padding:'24px',textAlign:'center'}},
                            el('div',{style:{fontSize:'13px',fontWeight:'600',color:attributes.accentColor,marginBottom:'4px'}},'Total Annual Footprint'),
                            el('div',{style:{fontSize:'36px',fontWeight:'900',color:attributes.accentColor}},'— tCO₂e/yr'),
                            el('div',{style:{fontSize:'12px',color:attributes.subtitleColor,marginTop:'4px'}},'Fill in your details on the frontend')
                        )
                    )
                )
            );
        },
        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', {
                    className: 'bkbg-cfc-app',
                    'data-opts': JSON.stringify(a)
                })
            );
        }
    });
}() );
