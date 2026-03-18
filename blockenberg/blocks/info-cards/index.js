/* ====================================================
   Info Cards Block — editor (index.js)
   Block: blockenberg/info-cards
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
    var useState           = wp.element.useState;
    var registerBlockType  = wp.blocks.registerBlockType;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelBody          = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;
    var ToggleControl      = wp.components.ToggleControl;
    var TextControl        = wp.components.TextControl;
    var Button             = wp.components.Button;
    var ColorPicker         = wp.components.ColorPicker;
    var Popover            = wp.components.Popover;
    var __                 = wp.i18n.__;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var IP = function () { return window.bkbgIconPicker; };

    function uid() { return 'i' + Math.random().toString(36).slice(2,7); }
    function move(arr, from, to) { var a=arr.slice(); a.splice(to,0,a.splice(from,1)[0]); return a; }

    function wrapStyle(a) {
        var _tv = getTypoCssVars();
        var s = {
            '--bkbg-infc-cols':    a.columns,
            '--bkbg-infc-gap':     a.gap + 'px',
            '--bkbg-infc-r':       a.cardRadius + 'px',
            '--bkbg-infc-pad':     a.cardPadding + 'px',
            '--bkbg-infc-icon-sz': a.iconSize + 'px',
            '--bkbg-infc-icon-bg-sz': a.iconBgSize + 'px',
            '--bkbg-infc-title-sz':a.titleSize + 'px',
            '--bkbg-infc-desc-sz': a.descSize + 'px',
            '--bkbg-infc-pt':      a.paddingTop + 'px',
            '--bkbg-infc-pb':      a.paddingBottom + 'px',
            '--bkbg-infc-card-bg': a.cardBg,
            '--bkbg-infc-brd':     a.cardBorderColor,
            '--bkbg-infc-title-c': a.titleColor,
            '--bkbg-infc-desc-c':  a.descColor,
            background:            a.sectionBg || undefined,
        };
        Object.assign(s, _tv(a.titleTypo, '--bkbg-infc-tt-'));
        Object.assign(s, _tv(a.descTypo, '--bkbg-infc-ds-'));
        return s;
    }

    function renderIconContent(item, size) {
        if ((item.iconType || 'custom-char') !== 'custom-char') return IP().buildEditorIcon(item.iconType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor);
        return item.icon;
    }

    function renderCard(item, a) {
        var iconEl;
        if (a.iconStyle === 'circle-bg') {
            iconEl = el('div', { className:'bkbg-infc-icon-wrap', style:{ background: item.accentColor+'22', width: a.iconBgSize+'px', height: a.iconBgSize+'px' } },
                el('span', { className:'bkbg-infc-icon', style:{ fontSize: a.iconSize+'px', color: item.accentColor } }, renderIconContent(item, a.iconSize))
            );
        } else if (a.iconStyle === 'square-bg') {
            iconEl = el('div', { className:'bkbg-infc-icon-wrap bkbg-infc-icon-wrap--square', style:{ background: item.accentColor+'22', width: a.iconBgSize+'px', height: a.iconBgSize+'px' } },
                el('span', { className:'bkbg-infc-icon', style:{ fontSize: a.iconSize+'px', color: item.accentColor } }, renderIconContent(item, a.iconSize))
            );
        } else {
            iconEl = el('span', { className:'bkbg-infc-icon bkbg-infc-icon--plain', style:{ fontSize: a.iconSize+'px' } }, renderIconContent(item, a.iconSize));
        }

        var accentBar = a.cardStyle === 'accent-left'
            ? el('div', { className:'bkbg-infc-accent-bar', style:{ background: item.accentColor } })
            : null;

        return el('div', { className:'bkbg-infc-card bkbg-infc-card--' + a.cardStyle, style:{ textAlign: a.textAlign }, 'data-id': item.id },
            accentBar,
            iconEl,
            el('h3', { className:'bkbg-infc-title' }, item.title),
            el('p',  { className:'bkbg-infc-desc'  }, item.description),
            a.showCta && item.ctaLabel ? el('a', { href:item.ctaUrl||'#', className:'bkbg-infc-cta', style:{ color:item.accentColor }, onClick:function(e){ e.preventDefault(); } }, item.ctaLabel, ' →') : null
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

    registerBlockType('blockenberg/info-cards', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;
            var items   = a.items;

            var _act = useState(null);
            var activeId = _act[0]; var setActiveId = _act[1];

            function update(id, patch) {
                setAttr({ items: items.map(function(it){ return it.id===id ? Object.assign({},it,patch) : it; }) });
            }

            var blockProps = useBlockProps({ className:'bkbg-infc-wrap', style:wrapStyle(a) });

            function itemRow(item, idx) {
                var isActive = activeId === item.id;
                return el('div', { key:item.id },
                    el('div', {
                        style:{ display:'flex', alignItems:'center', gap:'6px', background:isActive?'#f3f0ff':'#f8f9fa', border:isActive?'1px solid #6c3fb5':'1px solid #e2e8f0', borderRadius:'6px', padding:'6px 8px', marginBottom:'4px', cursor:'pointer' },
                        onClick:function(){ setActiveId(isActive?null:item.id); }
                    },
                        el('span', { style:{fontSize:'18px',marginRight:'4px'} }, item.icon),
                        el('span', { style:{flex:1,fontSize:'13px',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'} }, item.title||'(untitled)'),
                        el(Button, { icon:'arrow-up',   isSmall:true, disabled:idx===0,              onClick:function(e){ e.stopPropagation(); setAttr({items:move(items,idx,idx-1)}); } }),
                        el(Button, { icon:'arrow-down', isSmall:true, disabled:idx===items.length-1, onClick:function(e){ e.stopPropagation(); setAttr({items:move(items,idx,idx+1)}); } }),
                        el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, onClick:function(e){ e.stopPropagation(); setAttr({items:items.filter(function(_,i){ return i!==idx; })}); if(activeId===item.id) setActiveId(null); } })
                    ),
                    isActive ? el('div', { style:{padding:'10px',background:'#faf8ff',border:'1px solid #6c3fb5',borderTop:'none',borderRadius:'0 0 6px 6px',marginBottom:'4px'} },
                        el(IP().IconPickerControl, { iconType: item.iconType || 'custom-char', customChar: item.icon, dashicon: item.iconDashicon || '', imageUrl: item.iconImageUrl || '',
                            onChangeType: function(v){ update(item.id,{iconType:v}); }, onChangeChar: function(v){ update(item.id,{icon:v}); },
                            onChangeDashicon: function(v){ update(item.id,{iconDashicon:v}); }, onChangeImageUrl: function(v){ update(item.id,{iconImageUrl:v}); } }),
                        el(TextControl, { label:__('Title','blockenberg'),          value:item.title,       onChange:function(v){ update(item.id,{title:v}); } }),
                        el(TextControl, { label:__('Description','blockenberg'),    value:item.description, onChange:function(v){ update(item.id,{description:v}); } }),
                        el(BkbgColorSwatch, { label:__('Accent color','blockenberg'),   value:item.accentColor, onChange:function(v){ update(item.id,{accentColor:v}); } }),
                        a.showCta ? el(Fragment, null,
                            el(TextControl, { label:__('CTA label','blockenberg'), value:item.ctaLabel, onChange:function(v){ update(item.id,{ctaLabel:v}); } }),
                            el(TextControl, { label:__('CTA URL','blockenberg'),   value:item.ctaUrl,   onChange:function(v){ update(item.id,{ctaUrl:v}); } })
                        ) : null
                    ) : null
                );
            }

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title:__('Cards','blockenberg'), initialOpen:true },
                    items.map(function(it,i){ return itemRow(it,i); }),
                    el(Button, { variant:'primary', style:{marginTop:'8px',width:'100%'},
                        onClick:function(){
                            var n={id:uid(),icon:'✨',iconType:'custom-char',iconDashicon:'',iconImageUrl:'',title:'New Feature',description:'Describe this feature succinctly.',ctaLabel:'',ctaUrl:'#',accentColor:'#6c3fb5'};
                            setAttr({items:items.concat([n])});
                            setActiveId(n.id);
                        }
                    }, __('+ Add Card','blockenberg'))
                ),
                el(PanelBody, { title:__('Style & Layout','blockenberg'), initialOpen:false },
                    el(SelectControl, { label:__('Card style','blockenberg'), value:a.cardStyle, options:[
                        {label:'Icon top (flat)',value:'icon-top'},
                        {label:'Icon top (card)',value:'icon-top-card'},
                        {label:'Icon left (inline)',value:'icon-left'},
                        {label:'Accent left border',value:'accent-left'},
                        {label:'Dark card',value:'dark'},
                    ], onChange:function(v){ setAttr({cardStyle:v}); } }),
                    el(SelectControl, { label:__('Icon style','blockenberg'), value:a.iconStyle, options:[
                        {label:'Circle bg',value:'circle-bg'},
                        {label:'Square bg',value:'square-bg'},
                        {label:'Plain emoji',value:'plain'},
                    ], onChange:function(v){ setAttr({iconStyle:v}); } }),
                    el(SelectControl, { label:__('Text align','blockenberg'), value:a.textAlign, options:[
                        {label:'Left',value:'left'},{label:'Center',value:'center'}
                    ], onChange:function(v){ setAttr({textAlign:v}); } }),
                    el(RangeControl, { label:__('Columns','blockenberg'), value:a.columns, min:1, max:6, onChange:function(v){ setAttr({columns:v}); } }),
                    el(RangeControl, { label:__('Gap (px)','blockenberg'), value:a.gap, min:8, max:72, onChange:function(v){ setAttr({gap:v}); } }),
                    el(RangeControl, { label:__('Card radius (px)','blockenberg'), value:a.cardRadius, min:0, max:32, onChange:function(v){ setAttr({cardRadius:v}); } }),
                    el(RangeControl, { label:__('Card padding (px)','blockenberg'), value:a.cardPadding, min:12, max:60, onChange:function(v){ setAttr({cardPadding:v}); } }),
                    el(RangeControl, { label:__('Icon size (px)','blockenberg'), value:a.iconSize, min:16, max:64, onChange:function(v){ setAttr({iconSize:v}); } }),
                    el(RangeControl, { label:__('Icon bg size (px)','blockenberg'), value:a.iconBgSize, min:32, max:100, onChange:function(v){ setAttr({iconBgSize:v}); } }),
                    el(ToggleControl, { label:__('Show CTA link','blockenberg'), checked:a.showCta, onChange:function(v){ setAttr({showCta:v}); } })
                ),
                el(PanelBody, { title:__('Typography','blockenberg'), initialOpen:false },
                    el(getTypographyControl(), { label: 'Title', value: a.titleTypo, onChange: function(v){ setAttr({ titleTypo: v }); } }),
                    el(getTypographyControl(), { label: 'Description', value: a.descTypo, onChange: function(v){ setAttr({ descTypo: v }); } })
                ),
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'), value:a.paddingTop, min:0, max:160, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:160, onChange:function(v){ setAttr({paddingBottom:v}); } })
                ),
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Section bg','blockenberg'),  value:a.sectionBg,       onChange:function(v){ setAttr({sectionBg:v||''}); }},
                    {label:__('Card bg','blockenberg'),     value:a.cardBg,          onChange:function(v){ setAttr({cardBg:v||''}); }},
                    {label:__('Card border','blockenberg'), value:a.cardBorderColor, onChange:function(v){ setAttr({cardBorderColor:v||''}); }},
                    {label:__('Title','blockenberg'),       value:a.titleColor,      onChange:function(v){ setAttr({titleColor:v||''}); }},
                    {label:__('Description','blockenberg'), value:a.descColor,       onChange:function(v){ setAttr({descColor:v||''}); }},
                ] })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el('div', { className:'bkbg-infc-grid' },
                        items.map(function(item){ return renderCard(item, a); })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var _tv = getTypoCssVars();
            var saveStyle = {
                '--bkbg-infc-cols':a.columns,'--bkbg-infc-gap':a.gap+'px','--bkbg-infc-r':a.cardRadius+'px','--bkbg-infc-pad':a.cardPadding+'px','--bkbg-infc-icon-sz':a.iconSize+'px','--bkbg-infc-icon-bg-sz':a.iconBgSize+'px','--bkbg-infc-title-sz':a.titleSize+'px','--bkbg-infc-desc-sz':a.descSize+'px','--bkbg-infc-pt':a.paddingTop+'px','--bkbg-infc-pb':a.paddingBottom+'px','--bkbg-infc-card-bg':a.cardBg,'--bkbg-infc-brd':a.cardBorderColor,'--bkbg-infc-title-c':a.titleColor,'--bkbg-infc-desc-c':a.descColor,background:a.sectionBg||undefined,
            };
            Object.assign(saveStyle, _tv(a.titleTypo, '--bkbg-infc-tt-'));
            Object.assign(saveStyle, _tv(a.descTypo, '--bkbg-infc-ds-'));
            var blockProps = wp.blockEditor.useBlockProps.save({ className:'bkbg-infc-wrap', style: saveStyle });

            function saveIcon(item) {
                function saveIconContent(item) {
                    if ((item.iconType || 'custom-char') !== 'custom-char') return IP().buildSaveIcon(item.iconType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor);
                    return item.icon;
                }
                if (a.iconStyle === 'plain') return el('span', { className:'bkbg-infc-icon bkbg-infc-icon--plain', style:{ fontSize:a.iconSize+'px' } }, saveIconContent(item));
                var cls = a.iconStyle==='square-bg' ? 'bkbg-infc-icon-wrap bkbg-infc-icon-wrap--square' : 'bkbg-infc-icon-wrap';
                return el('div', { className:cls, style:{ background:item.accentColor+'22', width:a.iconBgSize+'px', height:a.iconBgSize+'px' } },
                    el('span', { className:'bkbg-infc-icon', style:{ fontSize:a.iconSize+'px', color:item.accentColor } }, saveIconContent(item))
                );
            }

            return el('div', blockProps,
                el('div', { className:'bkbg-infc-grid' },
                    a.items.map(function(item) {
                        return el('div', { key:item.id, className:'bkbg-infc-card bkbg-infc-card--'+a.cardStyle, style:{ textAlign:a.textAlign } },
                            a.cardStyle==='accent-left' ? el('div', { className:'bkbg-infc-accent-bar', style:{ background:item.accentColor } }) : null,
                            saveIcon(item),
                            el('h3', { className:'bkbg-infc-title' }, item.title),
                            el('p',  { className:'bkbg-infc-desc'  }, item.description),
                            a.showCta && item.ctaLabel ? el('a', { href:item.ctaUrl||'#', className:'bkbg-infc-cta', style:{ color:item.accentColor } }, item.ctaLabel, ' →') : null
                        );
                    })
                )
            );
        }
    });
}() );
