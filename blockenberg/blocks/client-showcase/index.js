/* ====================================================
   Client Showcase Block — editor (index.js)
   Block: blockenberg/client-showcase
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
    var __                 = wp.i18n.__;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function _tv() { var fn = window.bkbgTypoCssVars; return fn ? fn.apply(null, arguments) : {}; }

    function uid() { return 'l' + Math.random().toString(36).slice(2,7); }
    function move(arr, from, to) { var a=arr.slice(); a.splice(to,0,a.splice(from,1)[0]); return a; }

    function buildWrapStyle(a) {
        var s = {
            '--bkbg-cshw-cols':       a.columns,
            '--bkbg-cshw-gap':        a.gap + 'px',
            '--bkbg-cshw-h-gap':      a.headerGap + 'px',
            '--bkbg-cshw-q-gap':      a.quoteGap + 'px',
            '--bkbg-cshw-logo-h':     a.logoHeight + 'px',
            '--bkbg-cshw-logo-r':     a.logoRadius + 'px',
            '--bkbg-cshw-logo-pad':   a.logoPadding + 'px',
            '--bkbg-cshw-pt':         a.paddingTop + 'px',
            '--bkbg-cshw-pb':         a.paddingBottom + 'px',
            '--bkbg-cshw-h-color':    a.headlineColor,
            '--bkbg-cshw-sub-color':  a.subColor,
            '--bkbg-cshw-logo-bg':    a.logoBgColor,
            '--bkbg-cshw-logo-brd':   a.logoBorderColor,
            '--bkbg-cshw-logo-tint':  a.logoTintColor,
            '--bkbg-cshw-q-bg':       a.quoteBg,
            '--bkbg-cshw-q-brd':      a.quoteBorder,
            '--bkbg-cshw-q-text':     a.quoteTextColor,
            '--bkbg-cshw-q-meta':     a.quoteMetaColor,
            '--bkbg-cshw-accent':     a.accentColor,
            background:               a.sectionBg || undefined,
        };
        Object.assign(s, _tv(a.typoHeadline, '--bkbg-cshw-hl'));
        Object.assign(s, _tv(a.typoSubhead,  '--bkbg-cshw-sh'));
        Object.assign(s, _tv(a.typoQuote,    '--bkbg-cshw-qt'));
        return s;
    }

    /* ── Logo item (editor) ── */
    function LogoItem(props) {
        var logo     = props.logo;
        var a        = props.a;
        var onChange = props.onChange;

        var imgEl = logo.imageUrl
            ? el('img', { src: logo.imageUrl, alt: logo.name, className: 'bkbg-cshw-logo-img' })
            : el('span', { className: 'bkbg-cshw-logo-placeholder' }, logo.name || 'Logo');

        var uploadBtn = el(MediaUploadCheck, null,
            el(MediaUpload, {
                onSelect: function(m){ onChange({ imageUrl: m.url, imageId: m.id }); },
                allowedTypes: ['image'],
                value: logo.imageId,
                render: function(o){ return el(Button, { onClick: o.open, className: 'bkbg-cshw-logo-upload-btn', isSmall: true }, logo.imageUrl ? __('Replace','blockenberg') : __('Upload','blockenberg')); }
            })
        );

        return el('div', { className: 'bkbg-cshw-logo-item' + (a.logoBg ? ' bkbg-cshw-logo-bg' : '') + (a.logoGrayscale ? ' bkbg-cshw-grayscale' : ''), title: logo.name },
            imgEl,
            uploadBtn
        );
    }

    /* ── REGISTER ── */
    registerBlockType('blockenberg/client-showcase', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;
            var logos   = a.logos;

            var _act = useState(null);
            var activeId = _act[0]; var setActiveId = _act[1];

            function updateLogo(id, patch) {
                setAttr({ logos: logos.map(function(l){ return l.id===id ? Object.assign({},l,patch) : l; }) });
            }

            var blockProps = useBlockProps({
                className: 'bkbg-cshw-wrap bkbg-cshw-layout--' + a.layout,
                style: buildWrapStyle(a)
            });

            var inspector = el(InspectorControls, null,
                /* Logos */
                el(PanelBody, { title:__('Logos','blockenberg'), initialOpen:true },
                    logos.map(function(logo, idx) {
                        var isActive = activeId === logo.id;
                        return el('div', { key: logo.id },
                            el('div', {
                                style: { display:'flex', alignItems:'center', gap:'6px', background: isActive ? '#f3f0ff' : '#f8f9fa', border: isActive ? '1px solid #6c3fb5' : '1px solid #e2e8f0', borderRadius:'6px', padding:'6px 8px', marginBottom:'4px', cursor:'pointer' },
                                onClick: function(){ setActiveId(isActive ? null : logo.id); }
                            },
                                logo.imageUrl ? el('img', { src:logo.imageUrl, style:{ height:'20px', objectFit:'contain', marginRight:'4px' } }) : null,
                                el('span', { style:{ flex:1, fontSize:'13px' } }, logo.name || '(untitled)'),
                                el(Button, { icon:'arrow-up', isSmall:true, disabled:idx===0, onClick:function(e){ e.stopPropagation(); setAttr({logos:move(logos,idx,idx-1)}); } }),
                                el(Button, { icon:'arrow-down', isSmall:true, disabled:idx===logos.length-1, onClick:function(e){ e.stopPropagation(); setAttr({logos:move(logos,idx,idx+1)}); } }),
                                el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, onClick:function(e){ e.stopPropagation(); setAttr({logos:logos.filter(function(_,i){ return i!==idx; })}); if(activeId===logo.id) setActiveId(null); } })
                            ),
                            isActive ? el('div', { style:{ padding:'8px', background:'#faf8ff', border:'1px solid #6c3fb5', borderTop:'none', borderRadius:'0 0 6px 6px', marginBottom:'4px' }},
                                el(TextControl, { label:__('Company name','blockenberg'), value:logo.name, onChange:function(v){ updateLogo(logo.id,{name:v}); } }),
                                el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function(m){ updateLogo(logo.id,{imageUrl:m.url,imageId:m.id}); },
                                        allowedTypes:['image'], value:logo.imageId,
                                        render:function(o){ return el(Button, { onClick:o.open, variant:'secondary', isSmall:true }, logo.imageUrl ? __('Change logo','blockenberg') : __('Upload logo','blockenberg')); }
                                    })
                                ),
                                logo.imageUrl ? el(Button, { isDestructive:true, variant:'tertiary', isSmall:true, style:{marginTop:'4px'}, onClick:function(){ updateLogo(logo.id,{imageUrl:'',imageId:0}); } }, __('Remove image','blockenberg')) : null
                            ) : null
                        );
                    }),
                    el(Button, { variant:'primary', style:{ marginTop:'8px', width:'100%' },
                        onClick:function(){ var n={id:uid(),name:'New Client',imageUrl:'',imageId:0}; setAttr({logos:logos.concat([n])}); setActiveId(n.id); }
                    }, __('+ Add Logo','blockenberg'))
                ),

                /* Header / layout */
                el(PanelBody, { title:__('Header & Layout','blockenberg'), initialOpen:false },
                    el(ToggleControl, { label:__('Show section header','blockenberg'), checked:a.showHeader, onChange:function(v){ setAttr({showHeader:v}); } }),
                    el(ToggleControl, { label:__('Show pull-quote','blockenberg'), checked:a.showQuote, onChange:function(v){ setAttr({showQuote:v}); } }),
                    el(SelectControl, { label:__('Layout','blockenberg'), value:a.layout, options:[
                        {label:__('Row (centered)','blockenberg'), value:'row'},
                        {label:__('Grid (fixed columns)','blockenberg'), value:'grid'},
                    ], onChange:function(v){ setAttr({layout:v}); } }),
                    el(SelectControl, { label:__('Header alignment','blockenberg'), value:a.headerAlign, options:[
                        {label:'Left',value:'left'},{label:'Center',value:'center'},{label:'Right',value:'right'}
                    ], onChange:function(v){ setAttr({headerAlign:v}); } }),
                    el(RangeControl, { label:__('Columns','blockenberg'), value:a.columns, min:2, max:8, onChange:function(v){ setAttr({columns:v}); } }),
                    el(RangeControl, { label:__('Logo gap (px)','blockenberg'), value:a.gap, min:8, max:80, onChange:function(v){ setAttr({gap:v}); } }),
                    el(RangeControl, { label:__('Logo height (px)','blockenberg'), value:a.logoHeight, min:20, max:100, onChange:function(v){ setAttr({logoHeight:v}); } }),
                    el(RangeControl, { label:__('Logo padding (px)','blockenberg'), value:a.logoPadding, min:0, max:40, onChange:function(v){ setAttr({logoPadding:v}); } }),
                    el(RangeControl, { label:__('Logo border radius (px)','blockenberg'), value:a.logoRadius, min:0, max:20, onChange:function(v){ setAttr({logoRadius:v}); } }),
                    el(ToggleControl, { label:__('Logo background box','blockenberg'), checked:a.logoBg, onChange:function(v){ setAttr({logoBg:v}); } }),
                    el(ToggleControl, { label:__('Grayscale logos','blockenberg'), checked:a.logoGrayscale, onChange:function(v){ setAttr({logoGrayscale:v}); } }),
                    el(ToggleControl, { label:__('Color on hover','blockenberg'), checked:a.logoHoverColor, onChange:function(v){ setAttr({logoHoverColor:v}); } })
                ),

                /* Quote */
                a.showQuote ? el(PanelBody, { title:__('Pull Quote','blockenberg'), initialOpen:false },
                    el(TextControl, { label:__('Quote text','blockenberg'), value:a.quoteText, onChange:function(v){ setAttr({quoteText:v}); } }),
                    el(TextControl, { label:__('Author name','blockenberg'), value:a.quoteAuthor, onChange:function(v){ setAttr({quoteAuthor:v}); } }),
                    el(TextControl, { label:__('Author role','blockenberg'), value:a.quoteRole, onChange:function(v){ setAttr({quoteRole:v}); } }),
                    el(MediaUploadCheck, null,
                        el(MediaUpload, {
                            onSelect:function(m){ setAttr({quoteAvatarUrl:m.url,quoteAvatarId:m.id}); },
                            allowedTypes:['image'], value:a.quoteAvatarId,
                            render:function(o){ return el(Button, { onClick:o.open, variant:'secondary', isSmall:true }, a.quoteAvatarUrl ? __('Change avatar','blockenberg') : __('Upload avatar','blockenberg')); }
                        })
                    )
                ) : null,

                /* Spacing */
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'),     value:a.paddingTop,    min:0, max:160, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'),  value:a.paddingBottom, min:0, max:160, onChange:function(v){ setAttr({paddingBottom:v}); } }),
                    el(RangeControl, { label:__('Header gap (px)','blockenberg'),      value:a.headerGap,     min:0, max:80, onChange:function(v){ setAttr({headerGap:v}); } }),
                    el(RangeControl, { label:__('Quote gap (px)','blockenberg'),       value:a.quoteGap,      min:0, max:80, onChange:function(v){ setAttr({quoteGap:v}); } })
                ),

                /* Typography */
                el(PanelBody, { title:__('Typography','blockenberg'), initialOpen:false },
                    el(getTypographyControl(), { label:__('Headline','blockenberg'), value:a.typoHeadline, onChange:function(v){ setAttr({typoHeadline:v}); } }),
                    el(getTypographyControl(), { label:__('Subheadline','blockenberg'), value:a.typoSubhead, onChange:function(v){ setAttr({typoSubhead:v}); } }),
                    el(getTypographyControl(), { label:__('Quote Text','blockenberg'), value:a.typoQuote, onChange:function(v){ setAttr({typoQuote:v}); } })
                ),

                /* Colors */
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Section background','blockenberg'), value:a.sectionBg,      onChange:function(v){ setAttr({sectionBg:v||''}); }},
                    {label:__('Headline color','blockenberg'),     value:a.headlineColor,  onChange:function(v){ setAttr({headlineColor:v||''}); }},
                    {label:__('Subhead color','blockenberg'),      value:a.subColor,       onChange:function(v){ setAttr({subColor:v||''}); }},
                    {label:__('Logo box bg','blockenberg'),        value:a.logoBgColor,    onChange:function(v){ setAttr({logoBgColor:v||''}); }},
                    {label:__('Logo box border','blockenberg'),    value:a.logoBorderColor,onChange:function(v){ setAttr({logoBorderColor:v||''}); }},
                    {label:__('Logo tint (grayscale)','blockenberg'), value:a.logoTintColor, onChange:function(v){ setAttr({logoTintColor:v||''}); }},
                    {label:__('Quote background','blockenberg'),   value:a.quoteBg,        onChange:function(v){ setAttr({quoteBg:v||''}); }},
                    {label:__('Quote border','blockenberg'),       value:a.quoteBorder,    onChange:function(v){ setAttr({quoteBorder:v||''}); }},
                    {label:__('Quote text','blockenberg'),         value:a.quoteTextColor, onChange:function(v){ setAttr({quoteTextColor:v||''}); }},
                    {label:__('Quote meta','blockenberg'),         value:a.quoteMetaColor, onChange:function(v){ setAttr({quoteMetaColor:v||''}); }},
                    {label:__('Accent (quote mark)','blockenberg'),value:a.accentColor,    onChange:function(v){ setAttr({accentColor:v||''}); }},
                ] })
            );

            /* Header */
            var headerEl = a.showHeader ? el('div', { className:'bkbg-cshw-header', style:{ textAlign:a.headerAlign, marginBottom: a.headerGap + 'px' } },
                el(RichText, { tagName:'p', className:'bkbg-cshw-headline', value:a.headline, onChange:function(v){ setAttr({headline:v}); }, placeholder:__('Trusted by…','blockenberg') }),
                el(RichText, { tagName:'p', className:'bkbg-cshw-subhead', value:a.subheadline, onChange:function(v){ setAttr({subheadline:v}); }, placeholder:__('Subtitle…','blockenberg') })
            ) : null;

            /* Logo grid */
            var logoGrid = el('div', { className:'bkbg-cshw-logos' + (a.logoHoverColor && a.logoGrayscale ? ' bkbg-cshw-hover-color' : '') },
                logos.map(function(logo) {
                    return el(LogoItem, { key:logo.id, logo:logo, a:a, onChange:function(patch){ updateLogo(logo.id,patch); } });
                })
            );

            /* Quote */
            var quoteEl = a.showQuote ? el('figure', { className:'bkbg-cshw-quote', style:{ marginTop: a.quoteGap + 'px' } },
                el('blockquote', { className:'bkbg-cshw-quote-text' }, el('p', null, a.quoteText)),
                el('figcaption', { className:'bkbg-cshw-quote-author' },
                    a.quoteAvatarUrl ? el('img', { src:a.quoteAvatarUrl, alt:a.quoteAuthor, className:'bkbg-cshw-quote-avatar' }) : null,
                    el('span', { className:'bkbg-cshw-quote-meta' },
                        el('strong', { className:'bkbg-cshw-quote-name' }, a.quoteAuthor),
                        el('span', { className:'bkbg-cshw-quote-role' }, a.quoteRole)
                    )
                )
            ) : null;

            return el(Fragment, null,
                inspector,
                el('div', blockProps, headerEl, logoGrid, quoteEl)
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-cshw-wrap bkbg-cshw-layout--' + a.layout,
                style: buildWrapStyle(a)
            });

            var headerEl = a.showHeader ? el('div', { className:'bkbg-cshw-header', style:{ textAlign:a.headerAlign, marginBottom:a.headerGap+'px' } },
                el(RichText.Content, { tagName:'p', className:'bkbg-cshw-headline', value:a.headline }),
                el(RichText.Content, { tagName:'p', className:'bkbg-cshw-subhead', value:a.subheadline })
            ) : null;

            var logoGrid = el('div', { className:'bkbg-cshw-logos' + (a.logoHoverColor && a.logoGrayscale ? ' bkbg-cshw-hover-color' : '') },
                a.logos.map(function(logo) {
                    return el('div', { key:logo.id, className:'bkbg-cshw-logo-item' + (a.logoBg ? ' bkbg-cshw-logo-bg' : '') + (a.logoGrayscale ? ' bkbg-cshw-grayscale' : ''), title:logo.name },
                        logo.imageUrl ? el('img', { src:logo.imageUrl, alt:logo.name, className:'bkbg-cshw-logo-img', loading:'lazy' }) : el('span', { className:'bkbg-cshw-logo-placeholder' }, logo.name)
                    );
                })
            );

            var quoteEl = a.showQuote ? el('figure', { className:'bkbg-cshw-quote', style:{ marginTop:a.quoteGap+'px' } },
                el('blockquote', { className:'bkbg-cshw-quote-text' }, el('p', null, a.quoteText)),
                el('figcaption', { className:'bkbg-cshw-quote-author' },
                    a.quoteAvatarUrl ? el('img', { src:a.quoteAvatarUrl, alt:a.quoteAuthor, className:'bkbg-cshw-quote-avatar', loading:'lazy' }) : null,
                    el('span', { className:'bkbg-cshw-quote-meta' },
                        el('strong', { className:'bkbg-cshw-quote-name' }, a.quoteAuthor),
                        el('span', { className:'bkbg-cshw-quote-role' }, a.quoteRole)
                    )
                )
            ) : null;

            return el('div', blockProps, headerEl, logoGrid, quoteEl);
        }
    });
}() );
