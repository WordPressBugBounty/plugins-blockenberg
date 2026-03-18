/* ====================================================
   Card CTA Grid — editor (index.js)
   Block: blockenberg/card-cta-grid
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;
    var ToggleControl      = wp.components.ToggleControl;
    var TextControl        = wp.components.TextControl;
    var Button             = wp.components.Button;
    var ColorPicker         = wp.components.ColorPicker;
    var Popover            = wp.components.Popover;
    var __                 = wp.i18n.__;
    var IP = function () { return window.bkbgIconPicker; };

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

    function uid() { return Math.random().toString(36).slice(2,9); }

    function wrapStyle(a) {
        return Object.assign({
            '--bkbg-ccg-pt':         a.paddingTop  + 'px',
            '--bkbg-ccg-pb':         a.paddingBottom + 'px',
            '--bkbg-ccg-sec-bg':     a.sectionBg || 'transparent',
            '--bkbg-ccg-card-bg':    a.cardBg,
            '--bkbg-ccg-card-bd':    a.cardBorder,
            '--bkbg-ccg-title-c':    a.titleColor,
            '--bkbg-ccg-desc-c':     a.descColor,
            '--bkbg-ccg-icon-sz':    a.iconSize + 'px',
            '--bkbg-ccg-r':          a.cardRadius + 'px',
            '--bkbg-ccg-gap':        a.gap + 'px',
            '--bkbg-ccg-cols':       a.columns,
        }, _tv(a.typoTitle, '--bkbg-ccg-tt-'), _tv(a.typoDesc, '--bkbg-ccg-td-'), _tv(a.typoCta, '--bkbg-ccg-tc-'));
    }

    /* Inspector row for one card */
    function CardRow(props) {
        var c  = props.card; var idx = props.index; var total = props.total;
        var onUpdate = props.onUpdate; var onDelete = props.onDelete; var onMove = props.onMove;
        var open = useState(idx === 0); var isOpen = open[0]; var setOpen = open[1];
        return el('div', { style:{ borderBottom:'1px solid #e2e8f0', marginBottom:4 } },
            el('div', { style:{ display:'flex', alignItems:'center', cursor:'pointer', padding:'6px 0' }, onClick:function(){ setOpen(!isOpen); } },
                el('span', { style:{ flex:1, fontWeight:600, fontSize:12 } }, '#'+(idx+1)+' '+c.icon+' '+(c.title||'Card')),
                el('span', null, isOpen ? '▲' : '▼')
            ),
            !isOpen ? null : el('div', { style:{ paddingBottom:8 } },
                el(IP().IconPickerControl, {
                    iconType: c.iconType, customChar: c.icon, dashicon: c.iconDashicon, imageUrl: c.iconImageUrl,
                    onChangeType: function(v){ onUpdate(idx,{iconType:v}); },
                    onChangeChar: function(v){ onUpdate(idx,{icon:v}); },
                    onChangeDashicon: function(v){ onUpdate(idx,{iconDashicon:v}); },
                    onChangeImageUrl: function(v){ onUpdate(idx,{iconImageUrl:v}); }
                }),
                el(TextControl, { label:__('Title','blockenberg'),             value:c.title,       onChange:function(v){ onUpdate(idx,{title:v}); } }),
                el(TextControl, { label:__('Description','blockenberg'),       value:c.description, onChange:function(v){ onUpdate(idx,{description:v}); } }),
                el(TextControl, { label:__('CTA label','blockenberg'),         value:c.ctaLabel,    onChange:function(v){ onUpdate(idx,{ctaLabel:v}); } }),
                el(TextControl, { label:__('CTA URL','blockenberg'),           value:c.ctaUrl,      onChange:function(v){ onUpdate(idx,{ctaUrl:v}); } }),
                el(SelectControl, { label:__('CTA target','blockenberg'), value:c.ctaTarget, options:[{label:'Same tab',value:'_self'},{label:'New tab',value:'_blank'}], onChange:function(v){ onUpdate(idx,{ctaTarget:v}); } }),
                el(BkbgColorSwatch, { label:__('Accent color','blockenberg'),     value:c.accentColor, onChange:function(v){ onUpdate(idx,{accentColor:v}); } }),
                el('div', { style:{ display:'flex', gap:4, marginTop:8 } },
                    el(Button, { isSmall:true, variant:'secondary', disabled:idx===0,       onClick:function(){ onMove(idx,idx-1); } }, '↑'),
                    el(Button, { isSmall:true, variant:'secondary', disabled:idx===total-1, onClick:function(){ onMove(idx,idx+1); } }, '↓'),
                    el(Button, { isSmall:true, isDestructive:true,                           onClick:function(){ onDelete(idx); }   }, __('Delete','blockenberg'))
                )
            )
        );
    }

    var BkbgColorSwatch = function (props) {
        var _st = useState(false); var isOpen = _st[0]; var setOpen = _st[1];
        return el(Fragment, {},
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                el('span', { style: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: '#1e1e1e' } }, props.label),
                el('button', {
                    type: 'button',
                    onClick: function () { setOpen(!isOpen); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #ccc', background: props.value || '#ffffff', cursor: 'pointer', padding: 0 }
                })
            ),
            isOpen && el(Popover, { onClose: function () { setOpen(false); } },
                el('div', { style: { padding: '8px' } },
                    el(ColorPicker, { color: props.value, onChangeComplete: function (c) { props.onChange(c.hex); }, enableAlpha: true })
                )
            )
        );
    };

    registerBlockType('blockenberg/card-cta-grid', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;

            function updateCard(idx, patch) {
                setAttr({ cards: a.cards.map(function(c,i){ return i===idx ? Object.assign({},c,patch) : c; }) });
            }
            function deleteCard(idx) { setAttr({ cards: a.cards.filter(function(_,i){ return i!==idx; }) }); }
            function moveCard(from, to) {
                var arr = a.cards.slice(); arr.splice(to, 0, arr.splice(from, 1)[0]); setAttr({ cards: arr });
            }
            function addCard() {
                setAttr({ cards: a.cards.concat([{ id:uid(), icon:'⭐', iconType:'custom-char', iconDashicon:'', iconImageUrl:'', title:'New card', description:'Describe what happens when someone clicks this.', ctaLabel:'Learn more →', ctaUrl:'#', ctaTarget:'_self', accentColor:'#6c3fb5' }]) });
            }

            var blockProps = useBlockProps({ className:'bkbg-ccg-wrap bkbg-ccg-layout--' + a.layout + ' bkbg-ccg-style--' + a.cardStyle, style:wrapStyle(a) });

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title:__('Cards','blockenberg'), initialOpen:true },
                    a.cards.map(function(c,i){ return el(CardRow, { key:c.id, card:c, index:i, total:a.cards.length, onUpdate:updateCard, onDelete:deleteCard, onMove:moveCard }); }),
                    el(Button, { variant:'primary', onClick:addCard, style:{marginTop:8} }, __('+ Add card','blockenberg'))
                ),
                el(PanelBody, { title:__('Layout','blockenberg'), initialOpen:false },
                    el(SelectControl, { label:__('Layout','blockenberg'), value:a.layout, options:[{label:'Grid',value:'grid'},{label:'Flex row',value:'flex'}], onChange:function(v){ setAttr({layout:v}); } }),
                    el(SelectControl, { label:__('Card style','blockenberg'), value:a.cardStyle, options:[{label:'Border',value:'border'},{label:'Shadow',value:'shadow'},{label:'Filled accent',value:'filled'},{label:'Flat',value:'flat'}], onChange:function(v){ setAttr({cardStyle:v}); } }),
                    el(RangeControl, { label:__('Columns','blockenberg'),      value:a.columns,    min:1, max:5, onChange:function(v){ setAttr({columns:v}); } }),
                    el(RangeControl, { label:__('Gap (px)','blockenberg'),     value:a.gap,        min:0, max:64, onChange:function(v){ setAttr({gap:v}); } }),
                    el(RangeControl, { label:__('Card radius (px)','blockenberg'), value:a.cardRadius, min:0, max:32, onChange:function(v){ setAttr({cardRadius:v}); } }),
                    el(RangeControl, { label:__('Icon size (px)','blockenberg'),   value:a.iconSize,   min:16, max:72, onChange:function(v){ setAttr({iconSize:v}); } }),
                    el(ToggleControl, { label:__('Show icon','blockenberg'),  checked:a.showIcon, onChange:function(v){ setAttr({showIcon:v}); } }),
                    el(ToggleControl, { label:__('Show description','blockenberg'), checked:a.showDesc, onChange:function(v){ setAttr({showDesc:v}); } })
                ),
                el(PanelBody, { title:__('Typography','blockenberg'), initialOpen:false },
                    el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttr({ typoTitle: v }); } }),
                    el(getTypographyControl(), { label: __('Description', 'blockenberg'), value: a.typoDesc, onChange: function (v) { setAttr({ typoDesc: v }); } }),
                    el(getTypographyControl(), { label: __('CTA', 'blockenberg'), value: a.typoCta, onChange: function (v) { setAttr({ typoCta: v }); } })
                ),
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'),    value:a.paddingTop,    min:0, max:160, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:160, onChange:function(v){ setAttr({paddingBottom:v}); } })
                ),
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Section bg','blockenberg'),  value:a.sectionBg,   onChange:function(v){ setAttr({sectionBg:v||''}); }},
                    {label:__('Card bg','blockenberg'),     value:a.cardBg,      onChange:function(v){ setAttr({cardBg:v||''}); }},
                    {label:__('Card border','blockenberg'), value:a.cardBorder,  onChange:function(v){ setAttr({cardBorder:v||''}); }},
                    {label:__('Title','blockenberg'),       value:a.titleColor,  onChange:function(v){ setAttr({titleColor:v||''}); }},
                    {label:__('Description','blockenberg'), value:a.descColor,   onChange:function(v){ setAttr({descColor:v||''}); }},
                ] })
            );

            function renderCard(c) {
                return el('div', { key:c.id, className:'bkbg-ccg-card', style:{'--bkbg-ccg-accent': c.accentColor} },
                    a.showIcon ? el('div', { className:'bkbg-ccg-icon' }, (c.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(c.iconType, c.icon, c.iconDashicon, c.iconImageUrl, c.iconDashiconColor) : c.icon) : null,
                    el('div', { className:'bkbg-ccg-body' },
                        el('div', { className:'bkbg-ccg-title' }, c.title),
                        a.showDesc ? el('div', { className:'bkbg-ccg-desc' }, c.description) : null
                    ),
                    el('span', { className:'bkbg-ccg-cta' }, c.ctaLabel)
                );
            }

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el('div', { className:'bkbg-ccg-grid' },
                        a.cards.map(renderCard)
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-ccg-wrap bkbg-ccg-layout--' + a.layout + ' bkbg-ccg-style--' + a.cardStyle,
                style: wrapStyle(a)
            });
            return el('div', blockProps,
                el('div', { className:'bkbg-ccg-grid' },
                    a.cards.map(function(c) {
                        return el('a', { key:c.id, href:c.ctaUrl, target:c.ctaTarget, rel:c.ctaTarget==='_blank'?'noopener noreferrer':undefined, className:'bkbg-ccg-card', style:{'--bkbg-ccg-accent': c.accentColor} },
                            a.showIcon ? el('div', { className:'bkbg-ccg-icon' }, (c.iconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(c.iconType, c.icon, c.iconDashicon, c.iconImageUrl, c.iconDashiconColor) : c.icon) : null,
                            el('div', { className:'bkbg-ccg-body' },
                                el('div', { className:'bkbg-ccg-title' }, c.title),
                                a.showDesc ? el('div', { className:'bkbg-ccg-desc' }, c.description) : null
                            ),
                            el('span', { className:'bkbg-ccg-cta' }, c.ctaLabel)
                        );
                    })
                )
            );
        }
    });
}() );
