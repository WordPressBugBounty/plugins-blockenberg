/* ====================================================
   Image Cards Block — editor (index.js)
   Block: blockenberg/image-cards
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
    var useState           = wp.element.useState;
    var RichText           = wp.blockEditor.RichText;
    var MediaUpload        = wp.blockEditor.MediaUpload;
    var MediaUploadCheck   = wp.blockEditor.MediaUploadCheck;
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

    function uid() { return 'c' + Math.random().toString(36).slice(2,7); }
    function move(arr, from, to) { var a=arr.slice(); a.splice(to,0,a.splice(from,1)[0]); return a; }

    function buildWrapStyle(a) {
        var s = {
            '--bkbg-imgc-cols':    a.columns,
            '--bkbg-imgc-gap':     a.gap + 'px',
            '--bkbg-imgc-r':       a.cardRadius + 'px',
            '--bkbg-imgc-img-r':   a.imageRadius + 'px',
            '--bkbg-imgc-aspect':  a.imageAspect,
            '--bkbg-imgc-pt':      a.paddingTop + 'px',
            '--bkbg-imgc-pb':      a.paddingBottom + 'px',
            '--bkbg-imgc-card-bg': a.cardBg,
            '--bkbg-imgc-brd':     a.cardBorderColor,
            '--bkbg-imgc-title-c': a.titleColor,
            '--bkbg-imgc-desc-c':  a.descColor,
            '--bkbg-imgc-cta-c':   a.ctaColor,
            '--bkbg-imgc-ph-bg':   a.imagePlaceholderBg,
            '--bkbg-imgc-title-sz':a.titleSize + 'px',
            '--bkbg-imgc-title-w': a.titleFontWeight || '700',
            '--bkbg-imgc-title-lh':a.titleLineHeight || 1.3,
            '--bkbg-imgc-desc-sz': a.descSize + 'px',
            '--bkbg-imgc-desc-w':  a.descFontWeight || '400',
            '--bkbg-imgc-desc-lh': a.descLineHeight || 1.6,
            background:            a.sectionBg || undefined,
        };
        var _tv2 = getTypoCssVars();
        if (_tv2) {
            Object.assign(s, _tv2(a.titleTypo, '--bkbg-imgc-tt-'));
            Object.assign(s, _tv2(a.descTypo, '--bkbg-imgc-ds-'));
        }
        return s;
    }

    /* ── Single card preview ── */
    function ImageCard(props) {
        var card  = props.card;
        var a     = props.a;
        var onChange = props.onChange;

        var imgEl = el('div', { className: 'bkbg-imgc-image-wrap' },
            card.imageUrl
                ? el('img', { src: card.imageUrl, alt: card.title, className: 'bkbg-imgc-img' })
                : el('div', { className: 'bkbg-imgc-img-placeholder' },
                    el(MediaUploadCheck, null,
                        el(MediaUpload, {
                            onSelect: function(m){ onChange({ imageUrl:m.url, imageId:m.id }); },
                            allowedTypes: ['image'], value: card.imageId,
                            render: function(o){ return el(Button, { onClick:o.open, variant:'secondary', isSmall:true, className:'bkbg-imgc-upload-btn' }, __('Upload image','blockenberg')); }
                        })
                    )
                )
        );

        return el('article', { className: 'bkbg-imgc-card bkbg-imgc-card--' + a.cardStyle + (a.hoverEffect !== 'none' ? ' bkbg-imgc-hover--' + a.hoverEffect : '') },
            imgEl,
            el('div', { className: 'bkbg-imgc-body' },
                a.showTag && card.tag ? el('span', { className: 'bkbg-imgc-tag', style: { background: card.accentColor + '22', color: card.accentColor } }, card.tag) : null,
                el('h3', { className: 'bkbg-imgc-title' }, card.title),
                a.showDescription ? el('p', { className: 'bkbg-imgc-desc' }, card.description) : null,
                a.showCta && card.ctaLabel ? el('a', { href: card.ctaUrl||'#', className: 'bkbg-imgc-cta bkbg-imgc-cta--' + a.ctaStyle, style: { color: card.accentColor || a.ctaColor }, onClick: function(e){ e.preventDefault(); } },
                    card.ctaLabel,
                    a.ctaStyle === 'link-arrow' ? el('span', { className: 'bkbg-imgc-arrow' }, ' →') : null
                ) : null
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

    registerBlockType('blockenberg/image-cards', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;
            var cards   = a.cards;

            var _act = useState(null);
            var activeId = _act[0]; var setActiveId = _act[1];

            function updateCard(id, patch) {
                setAttr({ cards: cards.map(function(c){ return c.id===id ? Object.assign({},c,patch) : c; }) });
            }

            var blockProps = useBlockProps({
                className: 'bkbg-imgc-wrap',
                style: buildWrapStyle(a)
            });

            function cardRow(card, idx) {
                var isActive = activeId === card.id;
                return el('div', { key: card.id },
                    el('div', {
                        style: { display:'flex', alignItems:'center', gap:'6px', background: isActive?'#f3f0ff':'#f8f9fa', border: isActive?'1px solid #6c3fb5':'1px solid #e2e8f0', borderRadius:'6px', padding:'6px 8px', marginBottom:'4px', cursor:'pointer' },
                        onClick: function(){ setActiveId(isActive ? null : card.id); }
                    },
                        card.imageUrl ? el('img', { src:card.imageUrl, style:{ height:'24px', width:'36px', objectFit:'cover', borderRadius:'3px', flexShrink:0 } }) : el('span', { style:{ fontSize:'16px' } }, '🖼️'),
                        el('span', { style:{ flex:1, fontSize:'13px', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, card.title || '(untitled)'),
                        el(Button, { icon:'arrow-up', isSmall:true, disabled:idx===0, onClick:function(e){ e.stopPropagation(); setAttr({cards:move(cards,idx,idx-1)}); } }),
                        el(Button, { icon:'arrow-down', isSmall:true, disabled:idx===cards.length-1, onClick:function(e){ e.stopPropagation(); setAttr({cards:move(cards,idx,idx+1)}); } }),
                        el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, onClick:function(e){ e.stopPropagation(); setAttr({cards:cards.filter(function(_,i){ return i!==idx; })}); if(activeId===card.id) setActiveId(null); } })
                    ),
                    isActive ? el('div', { style:{ padding:'10px', background:'#faf8ff', border:'1px solid #6c3fb5', borderTop:'none', borderRadius:'0 0 6px 6px', marginBottom:'4px' } },
                        el(TextControl, { label:__('Title','blockenberg'), value:card.title, onChange:function(v){ updateCard(card.id,{title:v}); } }),
                        el(TextControl, { label:__('Description','blockenberg'), value:card.description, onChange:function(v){ updateCard(card.id,{description:v}); } }),
                        el(TextControl, { label:__('Tag/category','blockenberg'), value:card.tag, onChange:function(v){ updateCard(card.id,{tag:v}); } }),
                        el(TextControl, { label:__('CTA label','blockenberg'), value:card.ctaLabel, onChange:function(v){ updateCard(card.id,{ctaLabel:v}); } }),
                        el(TextControl, { label:__('CTA URL','blockenberg'), value:card.ctaUrl, onChange:function(v){ updateCard(card.id,{ctaUrl:v}); } }),
                        el(BkbgColorSwatch, { label:__('Accent color','blockenberg'), value:card.accentColor, onChange:function(v){ updateCard(card.id,{accentColor:v}); } }),
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect:function(m){ updateCard(card.id,{imageUrl:m.url,imageId:m.id}); },
                                allowedTypes:['image'], value:card.imageId,
                                render:function(o){ return el(Button, { onClick:o.open, variant:'secondary', isSmall:true }, card.imageUrl ? __('Change image','blockenberg') : __('Upload image','blockenberg')); }
                            })
                        ),
                        card.imageUrl ? el(Button, { isDestructive:true, variant:'tertiary', isSmall:true, style:{marginTop:'4px'}, onClick:function(){ updateCard(card.id,{imageUrl:'',imageId:0}); } }, __('Remove image','blockenberg')) : null
                    ) : null
                );
            }

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title:__('Cards','blockenberg'), initialOpen:true },
                    cards.map(function(c,i){ return cardRow(c,i); }),
                    el(Button, { variant:'primary', style:{ marginTop:'8px', width:'100%' },
                        onClick:function(){
                            var n = { id:uid(), imageUrl:'', imageId:0, tag:'Category', title:'New Card Title', description:'Card description goes here.', ctaLabel:'Read more', ctaUrl:'#', accentColor:'#6c3fb5' };
                            setAttr({ cards: cards.concat([n]) });
                            setActiveId(n.id);
                        }
                    }, __('+ Add Card','blockenberg'))
                ),
                el(PanelBody, { title:__('Layout & Style','blockenberg'), initialOpen:false },
                    el(SelectControl, { label:__('Card style','blockenberg'), value:a.cardStyle, options:[
                        {label:'Shadow card',value:'shadow'},
                        {label:'Bordered',value:'bordered'},
                        {label:'Flat',value:'flat'},
                        {label:'Overlay (image bg)',value:'overlay'},
                    ], onChange:function(v){ setAttr({cardStyle:v}); } }),
                    el(SelectControl, { label:__('Hover effect','blockenberg'), value:a.hoverEffect, options:[
                        {label:'Lift',value:'lift'},
                        {label:'Scale image',value:'scale'},
                        {label:'None',value:'none'},
                    ], onChange:function(v){ setAttr({hoverEffect:v}); } }),
                    el(SelectControl, { label:__('CTA style','blockenberg'), value:a.ctaStyle, options:[
                        {label:'Link + arrow',value:'link-arrow'},
                        {label:'Solid button',value:'btn'},
                    ], onChange:function(v){ setAttr({ctaStyle:v}); } }),
                    el(SelectControl, { label:__('Image aspect ratio','blockenberg'), value:a.imageAspect, options:[
                        {label:'16:9',value:'16/9'},
                        {label:'4:3',value:'4/3'},
                        {label:'3:2',value:'3/2'},
                        {label:'1:1 (square)',value:'1/1'},
                        {label:'2:3 (portrait)',value:'2/3'},
                    ], onChange:function(v){ setAttr({imageAspect:v}); } }),
                    el(RangeControl, { label:__('Columns','blockenberg'), value:a.columns, min:1, max:4, onChange:function(v){ setAttr({columns:v}); } }),
                    el(RangeControl, { label:__('Gap (px)','blockenberg'), value:a.gap, min:8, max:80, onChange:function(v){ setAttr({gap:v}); } }),
                    el(RangeControl, { label:__('Card radius (px)','blockenberg'), value:a.cardRadius, min:0, max:32, onChange:function(v){ setAttr({cardRadius:v}); } }),
                    el(RangeControl, { label:__('Image radius (px)','blockenberg'), value:a.imageRadius, min:0, max:24, onChange:function(v){ setAttr({imageRadius:v}); } }),
                    el(ToggleControl, { label:__('Equal height cards','blockenberg'), checked:a.equalHeight, onChange:function(v){ setAttr({equalHeight:v}); } }),
                    el(ToggleControl, { label:__('Show tag/category','blockenberg'), checked:a.showTag, onChange:function(v){ setAttr({showTag:v}); } }),
                    el(ToggleControl, { label:__('Show description','blockenberg'), checked:a.showDescription, onChange:function(v){ setAttr({showDescription:v}); } }),
                    el(ToggleControl, { label:__('Show CTA','blockenberg'), checked:a.showCta, onChange:function(v){ setAttr({showCta:v}); } })
                ),
                el(PanelBody, { title:__('Typography','blockenberg'), initialOpen:false },
                    getTypographyControl() && el( getTypographyControl(), { label: __( 'Title', 'blockenberg' ), value: a.titleTypo || {}, onChange: function(v){ setAttr({ titleTypo: v }); } }),
                    getTypographyControl() && el( getTypographyControl(), { label: __( 'Description', 'blockenberg' ), value: a.descTypo || {}, onChange: function(v){ setAttr({ descTypo: v }); } })
                ),
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'), value:a.paddingTop, min:0, max:160, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:160, onChange:function(v){ setAttr({paddingBottom:v}); } })
                ),
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Section bg','blockenberg'),  value:a.sectionBg,    onChange:function(v){ setAttr({sectionBg:v||''}); }},
                    {label:__('Card bg','blockenberg'),     value:a.cardBg,       onChange:function(v){ setAttr({cardBg:v||''}); }},
                    {label:__('Card border','blockenberg'), value:a.cardBorderColor, onChange:function(v){ setAttr({cardBorderColor:v||''}); }},
                    {label:__('Title','blockenberg'),       value:a.titleColor,   onChange:function(v){ setAttr({titleColor:v||''}); }},
                    {label:__('Description','blockenberg'),value:a.descColor,    onChange:function(v){ setAttr({descColor:v||''}); }},
                    {label:__('CTA default','blockenberg'),value:a.ctaColor,     onChange:function(v){ setAttr({ctaColor:v||''}); }},
                    {label:__('Image placeholder','blockenberg'),value:a.imagePlaceholderBg, onChange:function(v){ setAttr({imagePlaceholderBg:v||''}); }},
                ] })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-imgc-grid' + (a.equalHeight ? ' bkbg-imgc-equal-h' : '') },
                        cards.map(function(card) {
                            return el(ImageCard, { key:card.id, card:card, a:a, onChange:function(patch){ updateCard(card.id,patch); } });
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-imgc-wrap',
                style: (function(){
                    var s = {
                        '--bkbg-imgc-cols':    a.columns, '--bkbg-imgc-gap': a.gap+'px', '--bkbg-imgc-r': a.cardRadius+'px', '--bkbg-imgc-img-r': a.imageRadius+'px', '--bkbg-imgc-aspect': a.imageAspect, '--bkbg-imgc-pt': a.paddingTop+'px', '--bkbg-imgc-pb': a.paddingBottom+'px', '--bkbg-imgc-card-bg': a.cardBg, '--bkbg-imgc-brd': a.cardBorderColor, '--bkbg-imgc-title-c': a.titleColor, '--bkbg-imgc-desc-c': a.descColor, '--bkbg-imgc-cta-c': a.ctaColor, '--bkbg-imgc-ph-bg': a.imagePlaceholderBg, '--bkbg-imgc-title-sz': a.titleSize+'px', '--bkbg-imgc-title-w': a.titleFontWeight||'700', '--bkbg-imgc-title-lh': a.titleLineHeight||1.3, '--bkbg-imgc-desc-sz': a.descSize+'px', '--bkbg-imgc-desc-w': a.descFontWeight||'400', '--bkbg-imgc-desc-lh': a.descLineHeight||1.6, background: a.sectionBg||undefined,
                    };
                    var _tv2 = getTypoCssVars();
                    if (_tv2) {
                        Object.assign(s, _tv2(a.titleTypo, '--bkbg-imgc-tt-'));
                        Object.assign(s, _tv2(a.descTypo, '--bkbg-imgc-ds-'));
                    }
                    return s;
                })()
            });
            return el('div', blockProps,
                el('div', { className: 'bkbg-imgc-grid' + (a.equalHeight ? ' bkbg-imgc-equal-h' : '') },
                    a.cards.map(function(card) {
                        return el('article', { key:card.id, className:'bkbg-imgc-card bkbg-imgc-card--'+a.cardStyle+(a.hoverEffect!=='none'?' bkbg-imgc-hover--'+a.hoverEffect:'') },
                            el('div', { className:'bkbg-imgc-image-wrap' },
                                card.imageUrl ? el('img', { src:card.imageUrl, alt:card.title, className:'bkbg-imgc-img', loading:'lazy' }) : null
                            ),
                            el('div', { className:'bkbg-imgc-body' },
                                a.showTag && card.tag ? el('span', { className:'bkbg-imgc-tag', style:{ background:card.accentColor+'22', color:card.accentColor } }, card.tag) : null,
                                el('h3', { className:'bkbg-imgc-title' }, card.title),
                                a.showDescription ? el('p', { className:'bkbg-imgc-desc' }, card.description) : null,
                                a.showCta && card.ctaLabel ? el('a', { href:card.ctaUrl||'#', className:'bkbg-imgc-cta bkbg-imgc-cta--'+a.ctaStyle, style:{ color:card.accentColor||a.ctaColor } },
                                    card.ctaLabel,
                                    a.ctaStyle==='link-arrow' ? el('span', { className:'bkbg-imgc-arrow' }, ' →') : null
                                ) : null
                            )
                        );
                    })
                )
            );
        }
    });
}() );
