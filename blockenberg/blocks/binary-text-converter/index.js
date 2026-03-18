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
    var ToggleControl      = wp.components.ToggleControl;

    function getTypographyControl() { return window.bkbgTypographyControl; }
    function getTypoCssVars() { return window.bkbgTypoCssVars; }

    var TABS = [
        {id:'binary', label:'Binary'},
        {id:'hex',    label:'Hex'},
        {id:'octal',  label:'Octal'}
    ];

    registerBlockType('blockenberg/binary-text-converter', {
        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var activeTab = useState(attributes.defaultTab || 'binary');
            var tab = activeTab[0]; var setTab = activeTab[1];

            var _tv = getTypoCssVars();
            var bpStyle = {
                background: attributes.sectionBg,
                padding: attributes.paddingTop+'px 24px '+attributes.paddingBottom+'px'
            };
            if (_tv) {
                Object.assign(bpStyle, _tv(attributes.titleTypo || {}, '--bkbg-btc-title-'));
                Object.assign(bpStyle, _tv(attributes.subtitleTypo || {}, '--bkbg-btc-sub-'));
            }
            var blockProps = useBlockProps({ style: bpStyle });

            function toggle(key){ return el(ToggleControl,{__nextHasNoMarginBottom:true,label:key,checked:attributes[key],onChange:function(v){var o={};o[key]=v;setAttributes(o);}}); }
            function range(label,key,min,max,step){ return el(RangeControl,{__nextHasNoMarginBottom:true,label:label,value:attributes[key],min:min,max:max,step:step||1,onChange:function(v){var o={};o[key]=v;setAttributes(o);}}); }

            var tabColors = { binary: attributes.binaryColor, hex: attributes.hexColor, octal: attributes.octalColor };

            var colors = [
                {label:'Accent',          value:attributes.accentColor,   onChange:function(v){setAttributes({accentColor:v});}},
                {label:'Binary Tab',      value:attributes.binaryColor,   onChange:function(v){setAttributes({binaryColor:v});}},
                {label:'Hex Tab',         value:attributes.hexColor,      onChange:function(v){setAttributes({hexColor:v});}},
                {label:'Octal Tab',       value:attributes.octalColor,    onChange:function(v){setAttributes({octalColor:v});}},
                {label:'ASCII Tab',       value:attributes.asciiColor,    onChange:function(v){setAttributes({asciiColor:v});}},
                {label:'Section Background', value:attributes.sectionBg,  onChange:function(v){setAttributes({sectionBg:v});}},
                {label:'Card Background', value:attributes.cardBg,        onChange:function(v){setAttributes({cardBg:v});}},
                {label:'Title',           value:attributes.titleColor,    onChange:function(v){setAttributes({titleColor:v});}},
                {label:'Subtitle',        value:attributes.subtitleColor, onChange:function(v){setAttributes({subtitleColor:v});}},
                {label:'Label',           value:attributes.labelColor,    onChange:function(v){setAttributes({labelColor:v});}},
                {label:'Input Background',value:attributes.inputBg,       onChange:function(v){setAttributes({inputBg:v});}},
                {label:'Input Border',    value:attributes.inputBorder,   onChange:function(v){setAttributes({inputBorder:v});}},
                {label:'Output Background',value:attributes.outputBg,     onChange:function(v){setAttributes({outputBg:v});}},
                {label:'Output Border',   value:attributes.outputBorder,  onChange:function(v){setAttributes({outputBorder:v});}},
                {label:'Error Text',      value:attributes.errorColor,    onChange:function(v){setAttributes({errorColor:v})}},
            ];

            var activeColor = tabColors[tab] || attributes.accentColor;

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, {title:'Content', initialOpen:true},
                        toggle('showTitle'),
                        attributes.showTitle && el(TextControl,{__nextHasNoMarginBottom:true,label:'Title',value:attributes.title,onChange:function(v){setAttributes({title:v});}}),
                        toggle('showSubtitle'),
                        attributes.showSubtitle && el(TextControl,{__nextHasNoMarginBottom:true,label:'Subtitle',value:attributes.subtitle,onChange:function(v){setAttributes({subtitle:v});}}),
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Default Tab',value:attributes.defaultTab,
                            options:TABS.map(function(t){return {label:t.label,value:t.id};}),
                            onChange:function(v){setAttributes({defaultTab:v});}}),
                        el(SelectControl,{__nextHasNoMarginBottom:true,label:'Default Mode',value:attributes.defaultMode,
                            options:[{label:'Encode (Text → Code)',value:'encode'},{label:'Decode (Code → Text)',value:'decode'}],
                            onChange:function(v){setAttributes({defaultMode:v});}})
                    ),
                    el(PanelBody, {title:'ASCII Table', initialOpen:false},
                        toggle('showAsciiTable'),
                        range('Group by (columns)', 'groupAscii', 4, 16)
                    ),
                    el(PanelColorSettings, {title:'Colors', initialOpen:false, colorSettings:colors}),
                    el(PanelBody, {title:'Sizing', initialOpen:false},
                        range('Max Width (px)', 'maxWidth', 400, 1200, 10),
                        range('Card Radius (px)', 'cardRadius', 0, 32),
                        range('Tab Radius (px)', 'tabRadius', 0, 24),
                        range('Input Radius (px)', 'inputRadius', 0, 24),
                        range('Padding Top (px)', 'paddingTop', 0, 120, 4),
                        range('Padding Bottom (px)', 'paddingBottom', 0, 120, 4)
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        (function () { var TC = getTypographyControl(); return TC ? el(TC, { label: __('Title', 'blockenberg'), value: attributes.titleTypo || {}, onChange: function (v) { setAttributes({ titleTypo: v }); } }) : null; })(),
                        (function () { var TC = getTypographyControl(); return TC ? el(TC, { label: __('Subtitle', 'blockenberg'), value: attributes.subtitleTypo || {}, onChange: function (v) { setAttributes({ subtitleTypo: v }); } }) : null; })()
                    )
                ),
                el('div', blockProps,
                    el('div', {
                        style:{
                            background:attributes.cardBg, borderRadius:attributes.cardRadius+'px',
                            padding:'40px', maxWidth:attributes.maxWidth+'px',
                            margin:'0 auto', boxShadow:'0 4px 24px rgba(0,0,0,0.08)'
                        }
                    },
                        attributes.showTitle && el('div',{className:'bkbg-btc-title',style:{color:attributes.titleColor}},attributes.title),
                        attributes.showSubtitle && el('div',{className:'bkbg-btc-subtitle',style:{color:attributes.subtitleColor}},attributes.subtitle),
                        // Tabs row
                        el('div',{style:{display:'flex',gap:'8px',marginBottom:'24px'}},
                            TABS.map(function(t){
                                var isActive=t.id===tab;
                                var c=tabColors[t.id]||activeColor;
                                return el('button',{
                                    key:t.id,
                                    onClick:function(){setTab(t.id);},
                                    style:{
                                        flex:'1',padding:'10px',fontSize:'14px',fontWeight:'700',
                                        border:'2px solid '+(isActive?c:attributes.inputBorder),
                                        borderRadius:attributes.tabRadius+'px',
                                        background:isActive?c:'transparent',
                                        color:isActive?'#fff':c,cursor:'pointer',transition:'all 0.2s'
                                    }
                                },t.label);
                            })
                        ),
                        // Preview areas
                        el('div',{style:{background:attributes.inputBg,border:'1.5px solid '+attributes.inputBorder,borderRadius:attributes.inputRadius+'px',padding:'14px',marginBottom:'12px',fontFamily:'monospace',fontSize:'14px',color:'#9ca3af',minHeight:'60px'}},
                            'Input text will appear here…'),
                        el('div',{style:{textAlign:'center',color:activeColor,fontWeight:'700',fontSize:'14px',marginBottom:'12px'}},'↓  '+tab.toUpperCase()),
                        el('div',{style:{background:attributes.outputBg,border:'1.5px solid '+attributes.outputBorder,borderRadius:attributes.inputRadius+'px',padding:'14px',fontFamily:'monospace',fontSize:'13px',color:'#6b7280',minHeight:'60px'}},
                            'Encoded/decoded result will appear here…')
                    )
                )
            );
        },
        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', {
                    className: 'bkbg-btc-app',
                    'data-opts': JSON.stringify(a)
                })
            );
        }
    });
}() );
