/* ====================================================
   Comparison Wall — editor (index.js)
   Block: blockenberg/comparison-swipe-wall
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
    var useState           = wp.element.useState;
    var RichText           = wp.blockEditor.RichText;
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
    var __                 = wp.i18n.__;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }
    var IP = function () { return window.bkbgIconPicker; };

    function uid() { return 'cmp' + Math.random().toString(36).slice(2,7); }
    function move(arr, from, to) { var a=arr.slice(); a.splice(to,0,a.splice(from,1)[0]); return a; }

    function wrapStyle(a) {
        return Object.assign({
            '--bkbg-cmp-pt':         a.paddingTop+'px',
            '--bkbg-cmp-pb':         a.paddingBottom+'px',
            '--bkbg-cmp-gap':        a.gap+'px',
            '--bkbg-cmp-r':          a.cardRadius+'px',
            '--bkbg-cmp-item-sz':    a.itemSize+'px',
            '--bkbg-cmp-sec-title-sz': a.sectionTitleSize+'px',
            '--bkbg-cmp-sec-sub-sz':   a.sectionSubSize+'px',
            '--bkbg-cmp-left-bg':    a.leftCardBg,
            '--bkbg-cmp-right-bg':   a.rightCardBg,
            '--bkbg-cmp-left-title': a.leftTitleColor,
            '--bkbg-cmp-right-title':a.rightTitleColor,
            '--bkbg-cmp-left-icon':  a.leftIconColor,
            '--bkbg-cmp-right-icon': a.rightIconColor,
            '--bkbg-cmp-left-item':  a.leftItemColor,
            '--bkbg-cmp-right-item': a.rightItemColor,
            '--bkbg-cmp-ey-bg':      a.eyebrowBg,
            '--bkbg-cmp-ey-c':       a.eyebrowColor,
            '--bkbg-cmp-sec-title-c':a.sectionTitleColor || undefined,
            '--bkbg-cmp-sec-sub-c':  a.sectionSubColor || undefined,
            background:              a.sectionBg || undefined,
        }, _tv(a.typoTitle, '--bkcw-title-'), _tv(a.typoSubtitle, '--bkcw-sub-'), _tv(a.typoItem, '--bkcw-item-'));
    }

    function itemsPanel(title, items, side, setItems, iconProp, iconColor) {
        return el(PanelBody, { title:title, initialOpen:false },
            items.map(function(item, idx) {
                return el('div', { key:item.id, style:{display:'flex',alignItems:'center',gap:'6px',marginBottom:'4px'} },
                    el(TextControl, { value:item.text, onChange:function(v){ setItems(items.map(function(it){ return it.id===item.id ? Object.assign({},it,{text:v}) : it; })); }, style:{flex:1,margin:0} }),
                    el(Button, { icon:'arrow-up',   isSmall:true, disabled:idx===0,              onClick:function(){ setItems(move(items,idx,idx-1)); } }),
                    el(Button, { icon:'arrow-down', isSmall:true, disabled:idx===items.length-1, onClick:function(){ setItems(move(items,idx,idx+1)); } }),
                    el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, onClick:function(){ setItems(items.filter(function(it){ return it.id!==item.id; })); } })
                );
            }),
            el(Button, { variant:'secondary', isSmall:true, style:{marginTop:'4px',width:'100%'},
                onClick:function(){ setItems(items.concat([{id:uid(),text:'New item'}])); }
            }, __('+ Add Item','blockenberg'))
        );
    }

    registerBlockType('blockenberg/comparison-swipe-wall', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;

            var blockProps = useBlockProps({
                className: 'bkbg-cmp-wrap bkbg-cmp-style--' + a.cardStyle,
                style: wrapStyle(a)
            });

            var headerEl = a.showHeader ? el('div', { className:'bkbg-cmp-header', style:{textAlign:a.headerAlign,marginBottom:'48px'} },
                a.showEyebrow ? el('span', { className:'bkbg-cmp-eyebrow' }, a.eyebrow) : null,
                el(RichText, { tagName:'h2', className:'bkbg-cmp-section-title', value:a.sectionTitle, onChange:function(v){ setAttr({sectionTitle:v}); }, placeholder:__('Section title…','blockenberg') }),
                el(RichText, { tagName:'p', className:'bkbg-cmp-section-sub', value:a.sectionSubtitle, onChange:function(v){ setAttr({sectionSubtitle:v}); }, placeholder:__('Subtitle…','blockenberg') })
            ) : null;

            function renderCol(side) {
                var isLeft = side === 'left';
                var items  = isLeft ? a.leftItems : a.rightItems;
                var title  = isLeft ? a.leftTitle : a.rightTitle;
                var emoji  = isLeft ? a.leftEmoji : a.rightEmoji;
                var icon   = isLeft ? a.leftIcon  : a.rightIcon;
                var emojiType = isLeft ? (a.leftEmojiType || 'custom-char') : (a.rightEmojiType || 'custom-char');
                var emojiDash = isLeft ? a.leftEmojiDashicon : a.rightEmojiDashicon;
                var emojiImg  = isLeft ? a.leftEmojiImageUrl : a.rightEmojiImageUrl;
                var iconType  = isLeft ? (a.leftIconType || 'custom-char') : (a.rightIconType || 'custom-char');
                var iconDash  = isLeft ? a.leftIconDashicon : a.rightIconDashicon;
                var iconImg   = isLeft ? a.leftIconImageUrl : a.rightIconImageUrl;
                var emojiDashColor = isLeft ? a.leftEmojiDashiconColor : a.rightEmojiDashiconColor;
                var iconDashColor  = isLeft ? a.leftIconDashiconColor : a.rightIconDashiconColor;
                return el('div', { className:'bkbg-cmp-col bkbg-cmp-col--'+side },
                    el('div', { className:'bkbg-cmp-col-header' },
                        el('span', { className:'bkbg-cmp-col-emoji' },
                            emojiType !== 'custom-char' ? IP().buildEditorIcon(emojiType, emoji, emojiDash, emojiImg, emojiDashColor) : emoji
                        ),
                        el('h3', { className:'bkbg-cmp-col-title' }, title)
                    ),
                    el('ul', { className:'bkbg-cmp-list' },
                        items.map(function(item) {
                            return el('li', { key:item.id, className:'bkbg-cmp-item' },
                                a.showIcons ? el('span', { className:'bkbg-cmp-item-icon' },
                                    iconType !== 'custom-char' ? IP().buildEditorIcon(iconType, icon, iconDash, iconImg, iconDashColor) : icon
                                ) : null,
                                el('span', { className:'bkbg-cmp-item-text' }, item.text)
                            );
                        })
                    )
                );
            }

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title:__('Left Column','blockenberg'), initialOpen:true },
                    el(TextControl, { label:__('Title','blockenberg'), value:a.leftTitle, onChange:function(v){ setAttr({leftTitle:v}); } }),
                    el('p', { style:{fontSize:'11px',fontWeight:600,marginTop:'12px'} }, __('Column Emoji','blockenberg')),
                    el(IP().IconPickerControl, IP().iconPickerProps(a, setAttr, { charAttr:'leftEmoji', typeAttr:'leftEmojiType', dashiconAttr:'leftEmojiDashicon', imageUrlAttr:'leftEmojiImageUrl', colorAttr: 'leftEmojiDashiconColor' })),
                    el('p', { style:{fontSize:'11px',fontWeight:600,marginTop:'12px'} }, __('Row Icon','blockenberg')),
                    el(IP().IconPickerControl, IP().iconPickerProps(a, setAttr, { charAttr:'leftIcon', typeAttr:'leftIconType', dashiconAttr:'leftIconDashicon', imageUrlAttr:'leftIconImageUrl', colorAttr: 'leftIconDashiconColor' })),
                    el('p', { style:{fontSize:'12px',color:'#64748b',margin:'4px 0 8px'} }, __('Items:','blockenberg')),
                    a.leftItems.map(function(item, idx) {
                        return el('div', { key:item.id, style:{display:'flex',alignItems:'center',gap:'4px',marginBottom:'4px'} },
                            el(TextControl, { value:item.text, onChange:function(v){ setAttr({leftItems:a.leftItems.map(function(it){ return it.id===item.id ? Object.assign({},it,{text:v}) : it; })}); }, style:{flex:1,margin:0} }),
                            el(Button, { icon:'arrow-up',   isSmall:true, disabled:idx===0,                     onClick:function(){ setAttr({leftItems:move(a.leftItems,idx,idx-1)}); } }),
                            el(Button, { icon:'arrow-down', isSmall:true, disabled:idx===a.leftItems.length-1,  onClick:function(){ setAttr({leftItems:move(a.leftItems,idx,idx+1)}); } }),
                            el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, onClick:function(){ setAttr({leftItems:a.leftItems.filter(function(it){ return it.id!==item.id; })}); } })
                        );
                    }),
                    el(Button, { variant:'secondary', isSmall:true, style:{marginTop:'4px',width:'100%'}, onClick:function(){ setAttr({leftItems:a.leftItems.concat([{id:uid(),text:'New item'}])}); } }, __('+ Add left item','blockenberg'))
                ),
                el(PanelBody, { title:__('Right Column','blockenberg'), initialOpen:false },
                    el(TextControl, { label:__('Title','blockenberg'), value:a.rightTitle, onChange:function(v){ setAttr({rightTitle:v}); } }),
                    el('p', { style:{fontSize:'11px',fontWeight:600,marginTop:'12px'} }, __('Column Emoji','blockenberg')),
                    el(IP().IconPickerControl, IP().iconPickerProps(a, setAttr, { charAttr:'rightEmoji', typeAttr:'rightEmojiType', dashiconAttr:'rightEmojiDashicon', imageUrlAttr:'rightEmojiImageUrl', colorAttr: 'rightEmojiDashiconColor' })),
                    el('p', { style:{fontSize:'11px',fontWeight:600,marginTop:'12px'} }, __('Row Icon','blockenberg')),
                    el(IP().IconPickerControl, IP().iconPickerProps(a, setAttr, { charAttr:'rightIcon', typeAttr:'rightIconType', dashiconAttr:'rightIconDashicon', imageUrlAttr:'rightIconImageUrl', colorAttr: 'rightIconDashiconColor' })),
                    el('p', { style:{fontSize:'12px',color:'#64748b',margin:'4px 0 8px'} }, __('Items:','blockenberg')),
                    a.rightItems.map(function(item, idx) {
                        return el('div', { key:item.id, style:{display:'flex',alignItems:'center',gap:'4px',marginBottom:'4px'} },
                            el(TextControl, { value:item.text, onChange:function(v){ setAttr({rightItems:a.rightItems.map(function(it){ return it.id===item.id ? Object.assign({},it,{text:v}) : it; })}); }, style:{flex:1,margin:0} }),
                            el(Button, { icon:'arrow-up',   isSmall:true, disabled:idx===0,                     onClick:function(){ setAttr({rightItems:move(a.rightItems,idx,idx-1)}); } }),
                            el(Button, { icon:'arrow-down', isSmall:true, disabled:idx===a.rightItems.length-1, onClick:function(){ setAttr({rightItems:move(a.rightItems,idx,idx+1)}); } }),
                            el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, onClick:function(){ setAttr({rightItems:a.rightItems.filter(function(it){ return it.id!==item.id; })}); } })
                        );
                    }),
                    el(Button, { variant:'secondary', isSmall:true, style:{marginTop:'4px',width:'100%'}, onClick:function(){ setAttr({rightItems:a.rightItems.concat([{id:uid(),text:'New item'}])}); } }, __('+ Add right item','blockenberg'))
                ),
                el(PanelBody, { title:__('Style & Layout','blockenberg'), initialOpen:false },
                    el(SelectControl, { label:__('Card style','blockenberg'), value:a.cardStyle, options:[
                        {label:'Split cards',           value:'split-card'},
                        {label:'Flat (no card bg)',      value:'flat'},
                        {label:'Dark right column',      value:'dark-right'},
                        {label:'Table comparison',       value:'table'},
                    ], onChange:function(v){ setAttr({cardStyle:v}); } }),
                    el(ToggleControl, { label:__('Show row icons','blockenberg'), checked:a.showIcons, onChange:function(v){ setAttr({showIcons:v}); } }),
                    el(RangeControl, { label:__('Card radius (px)','blockenberg'), value:a.cardRadius, min:0, max:32, onChange:function(v){ setAttr({cardRadius:v}); } }),
                    el(RangeControl, { label:__('Gap (px)','blockenberg'),         value:a.gap,        min:0, max:80, onChange:function(v){ setAttr({gap:v}); } })
                ),
                el(PanelBody, { title:__('Typography','blockenberg'), initialOpen:false },
                    el(getTypographyControl(), { label: __('Title Typography', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttr({ typoTitle: v }); } }),
                    el(getTypographyControl(), { label: __('Subtitle Typography', 'blockenberg'), value: a.typoSubtitle, onChange: function (v) { setAttr({ typoSubtitle: v }); } }),
                    el(getTypographyControl(), { label: __('Item Typography', 'blockenberg'), value: a.typoItem, onChange: function (v) { setAttr({ typoItem: v }); } })
                ),
                el(PanelBody, { title:__('Header','blockenberg'), initialOpen:false },
                    el(ToggleControl, { label:__('Show header','blockenberg'), checked:a.showHeader, onChange:function(v){ setAttr({showHeader:v}); } }),
                    el(ToggleControl, { label:__('Show eyebrow','blockenberg'), checked:a.showEyebrow, onChange:function(v){ setAttr({showEyebrow:v}); } }),
                    el(TextControl, { label:__('Eyebrow text','blockenberg'), value:a.eyebrow, onChange:function(v){ setAttr({eyebrow:v}); } }),
                    el(SelectControl, { label:__('Header align','blockenberg'), value:a.headerAlign, options:[{label:'Left',value:'left'},{label:'Center',value:'center'}], onChange:function(v){ setAttr({headerAlign:v}); } }),
                    el(ToggleControl, { label:__('Show CTA button','blockenberg'), checked:a.showCta, onChange:function(v){ setAttr({showCta:v}); } }),
                    el(TextControl, { label:__('CTA label','blockenberg'), value:a.ctaLabel, onChange:function(v){ setAttr({ctaLabel:v}); } }),
                    el(TextControl, { label:__('CTA URL','blockenberg'),   value:a.ctaUrl,   onChange:function(v){ setAttr({ctaUrl:v}); } })
                ),
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'),    value:a.paddingTop,    min:0, max:160, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:160, onChange:function(v){ setAttr({paddingBottom:v}); } })
                ),
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Section bg','blockenberg'),       value:a.sectionBg,         onChange:function(v){ setAttr({sectionBg:v||''}); }},
                    {label:__('Left card bg','blockenberg'),     value:a.leftCardBg,        onChange:function(v){ setAttr({leftCardBg:v||''}); }},
                    {label:__('Right card bg','blockenberg'),    value:a.rightCardBg,       onChange:function(v){ setAttr({rightCardBg:v||''}); }},
                    {label:__('Left title','blockenberg'),       value:a.leftTitleColor,    onChange:function(v){ setAttr({leftTitleColor:v||''}); }},
                    {label:__('Right title','blockenberg'),      value:a.rightTitleColor,   onChange:function(v){ setAttr({rightTitleColor:v||''}); }},
                    {label:__('Left icon color','blockenberg'),  value:a.leftIconColor,     onChange:function(v){ setAttr({leftIconColor:v||''}); }},
                    {label:__('Right icon color','blockenberg'), value:a.rightIconColor,    onChange:function(v){ setAttr({rightIconColor:v||''}); }},
                    {label:__('Left item text','blockenberg'),   value:a.leftItemColor,     onChange:function(v){ setAttr({leftItemColor:v||''}); }},
                    {label:__('Right item text','blockenberg'),  value:a.rightItemColor,    onChange:function(v){ setAttr({rightItemColor:v||''}); }},
                    {label:__('Eyebrow bg','blockenberg'),       value:a.eyebrowBg,         onChange:function(v){ setAttr({eyebrowBg:v||''}); }},
                    {label:__('Eyebrow text','blockenberg'),     value:a.eyebrowColor,      onChange:function(v){ setAttr({eyebrowColor:v||''}); }},
                    {label:__('Section title','blockenberg'),    value:a.sectionTitleColor, onChange:function(v){ setAttr({sectionTitleColor:v||''}); }},
                    {label:__('Section subtitle','blockenberg'), value:a.sectionSubColor,   onChange:function(v){ setAttr({sectionSubColor:v||''}); }},
                ] })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    headerEl,
                    el('div', { className:'bkbg-cmp-grid' },
                        renderCol('left'),
                        renderCol('right')
                    ),
                    a.showCta ? el('div', { className:'bkbg-cmp-cta-wrap' },
                        el('a', { href:a.ctaUrl, className:'bkbg-cmp-cta', onClick:function(e){ e.preventDefault(); } }, a.ctaLabel)
                    ) : null
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({
                className:'bkbg-cmp-wrap bkbg-cmp-style--'+a.cardStyle,
                style: Object.assign({
                    '--bkbg-cmp-pt':a.paddingTop+'px','--bkbg-cmp-pb':a.paddingBottom+'px','--bkbg-cmp-gap':a.gap+'px','--bkbg-cmp-r':a.cardRadius+'px','--bkbg-cmp-item-sz':a.itemSize+'px','--bkbg-cmp-left-bg':a.leftCardBg,'--bkbg-cmp-right-bg':a.rightCardBg,'--bkbg-cmp-left-title':a.leftTitleColor,'--bkbg-cmp-right-title':a.rightTitleColor,'--bkbg-cmp-left-icon':a.leftIconColor,'--bkbg-cmp-right-icon':a.rightIconColor,'--bkbg-cmp-left-item':a.leftItemColor,'--bkbg-cmp-right-item':a.rightItemColor,'--bkbg-cmp-ey-bg':a.eyebrowBg,'--bkbg-cmp-ey-c':a.eyebrowColor,'--bkbg-cmp-sec-title-c':a.sectionTitleColor||undefined,'--bkbg-cmp-sec-sub-c':a.sectionSubColor||undefined,background:a.sectionBg||undefined,
                }, _tv(a.typoTitle, '--bkcw-title-'), _tv(a.typoSubtitle, '--bkcw-sub-'), _tv(a.typoItem, '--bkcw-item-'))
            });

            function colEl(side) {
                var isLeft = side==='left';
                var items  = isLeft ? a.leftItems  : a.rightItems;
                var title  = isLeft ? a.leftTitle  : a.rightTitle;
                var emoji  = isLeft ? a.leftEmoji  : a.rightEmoji;
                var icon   = isLeft ? a.leftIcon   : a.rightIcon;
                var emojiType = isLeft ? (a.leftEmojiType || 'custom-char') : (a.rightEmojiType || 'custom-char');
                var emojiDash = isLeft ? a.leftEmojiDashicon : a.rightEmojiDashicon;
                var emojiImg  = isLeft ? a.leftEmojiImageUrl : a.rightEmojiImageUrl;
                var iconType  = isLeft ? (a.leftIconType || 'custom-char') : (a.rightIconType || 'custom-char');
                var iconDash  = isLeft ? a.leftIconDashicon : a.rightIconDashicon;
                var iconImg   = isLeft ? a.leftIconImageUrl : a.rightIconImageUrl;
                var emojiDashColor = isLeft ? a.leftEmojiDashiconColor : a.rightEmojiDashiconColor;
                var iconDashColor  = isLeft ? a.leftIconDashiconColor : a.rightIconDashiconColor;
                return el('div', { className:'bkbg-cmp-col bkbg-cmp-col--'+side },
                    el('div', { className:'bkbg-cmp-col-header' },
                        el('span', { className:'bkbg-cmp-col-emoji' },
                            emojiType !== 'custom-char'
                                ? IP().buildSaveIcon(emojiType, emoji, emojiDash, emojiImg, emojiDashColor)
                                : emoji
                        ),
                        el('h3', { className:'bkbg-cmp-col-title' }, title)
                    ),
                    el('ul', { className:'bkbg-cmp-list' },
                        items.map(function(item) {
                            return el('li', { key:item.id, className:'bkbg-cmp-item' },
                                a.showIcons ? el('span', { className:'bkbg-cmp-item-icon' },
                                    iconType !== 'custom-char'
                                        ? IP().buildSaveIcon(iconType, icon, iconDash, iconImg, iconDashColor)
                                        : icon
                                ) : null,
                                el('span', { className:'bkbg-cmp-item-text' }, item.text)
                            );
                        })
                    )
                );
            }

            return el('div', blockProps,
                a.showHeader ? el('div', { className:'bkbg-cmp-header', style:{textAlign:a.headerAlign,marginBottom:'48px'} },
                    a.showEyebrow ? el('span', { className:'bkbg-cmp-eyebrow' }, a.eyebrow) : null,
                    el(RichText.Content, { tagName:'h2', className:'bkbg-cmp-section-title', value:a.sectionTitle }),
                    el(RichText.Content, { tagName:'p', className:'bkbg-cmp-section-sub', value:a.sectionSubtitle })
                ) : null,
                el('div', { className:'bkbg-cmp-grid' }, colEl('left'), colEl('right')),
                a.showCta ? el('div', { className:'bkbg-cmp-cta-wrap' },
                    el('a', { href:a.ctaUrl, className:'bkbg-cmp-cta' }, a.ctaLabel)
                ) : null
            );
        }
    });
}() );
