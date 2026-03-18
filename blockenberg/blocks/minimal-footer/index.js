/* ====================================================
   Minimal Footer — editor (index.js)
   Block: blockenberg/minimal-footer
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var MediaUpload        = wp.blockEditor.MediaUpload;
    var MediaUploadCheck   = wp.blockEditor.MediaUploadCheck;
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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function uid() { return Math.random().toString(36).slice(2,9); }

    /* SVG icons for social platforms */
    var SOCIAL_ICONS = {
        twitter:   '𝕏',
        github:    '⌥',
        linkedin:  'in',
        facebook:  'f',
        instagram: '⊡',
        youtube:   '▶',
        tiktok:    '♪',
        discord:   '◎',
        other:     '↗',
    };

    function wrapStyle(a) {
        return {
            '--bkbg-mf-pt':       a.paddingTop  + 'px',
            '--bkbg-mf-pb':       a.paddingBottom + 'px',
            '--bkbg-mf-bg':       a.footerBg,
            '--bkbg-mf-logo-c':   a.logoColor,
            '--bkbg-mf-tag-c':    a.taglineColor,
            '--bkbg-mf-hdg-c':    a.headingColor,
            '--bkbg-mf-link-c':   a.linkColor,
            '--bkbg-mf-soc-c':    a.socialColor,
            '--bkbg-mf-div-c':    a.dividerColor,
            '--bkbg-mf-copy-c':   a.copyrightColor,
            '--bkbg-mf-logo-sz':  a.logoSize + 'px',
            '--bkbg-mf-link-sz':  a.linkSize + 'px',
            '--bkbg-mf-hdg-sz':   a.headingSize + 'px',
        };
    }

    /* Inspector: nav column editor */
    function NavColumnEditor(props) {
        var col = props.col; var idx = props.index; var total = props.total;
        var onUpdate = props.onUpdate; var onDelete = props.onDelete; var onMove = props.onMove;
        var open = useState(idx === 0); var isOpen = open[0]; var setOpen = open[1];

        function updateLink(li, patch) {
            var links = col.links.map(function(l,i){ return i===li ? Object.assign({},l,patch) : l; });
            onUpdate(idx, { links: links });
        }
        function deleteLink(li) { onUpdate(idx, { links: col.links.filter(function(_,i){ return i!==li; }) }); }
        function addLink() { onUpdate(idx, { links: col.links.concat([{id:uid(), label:'Link', url:'#'}]) }); }

        return el('div', { style:{ borderBottom:'1px solid #e2e8f0', marginBottom:4 } },
            el('div', { style:{ display:'flex', alignItems:'center', cursor:'pointer', padding:'6px 0' }, onClick:function(){ setOpen(!isOpen); } },
                el('span', { style:{ flex:1, fontWeight:600, fontSize:12 } }, col.heading || 'Column ' + (idx+1)),
                el('span', null, isOpen ? '▲' : '▼')
            ),
            !isOpen ? null : el('div', { style:{ paddingBottom:8 } },
                el(TextControl, { label:__('Column heading','blockenberg'), value:col.heading, onChange:function(v){ onUpdate(idx,{heading:v}); } }),
                el('p', { style:{ fontWeight:600, fontSize:11, margin:'6px 0 4px' } }, __('Links','blockenberg')),
                col.links.map(function(l, li) {
                    return el('div', { key:l.id, style:{ display:'flex', gap:4, marginBottom:4 } },
                        el(TextControl, { value:l.label, onChange:function(v){ updateLink(li,{label:v}); }, placeholder:'Label' }),
                        el(TextControl, { value:l.url,   onChange:function(v){ updateLink(li,{url:v}); },   placeholder:'URL' }),
                        el(Button, { isSmall:true, isDestructive:true, onClick:function(){ deleteLink(li); } }, '✕')
                    );
                }),
                el(Button, { isSmall:true, variant:'tertiary', onClick:addLink, style:{marginBottom:8} }, __('+ Link','blockenberg')),
                el('div', { style:{ display:'flex', gap:4 } },
                    el(Button, { isSmall:true, variant:'secondary', disabled:idx===0,       onClick:function(){ onMove(idx,idx-1); } }, '↑'),
                    el(Button, { isSmall:true, variant:'secondary', disabled:idx===total-1, onClick:function(){ onMove(idx,idx+1); } }, '↓'),
                    el(Button, { isSmall:true, isDestructive:true,                           onClick:function(){ onDelete(idx); }   }, __('Delete','blockenberg'))
                )
            )
        );
    }

    registerBlockType('blockenberg/minimal-footer', {
        deprecated: [{
            save: function (props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save({ className:'bkbg-mf-wrap bkbg-mf-layout--' + a.layout, style:wrapStyle(a) });
                function renderLogoSave() {
                    if (a.logoType === 'image' && a.logoImageUrl) {
                        return el('img', { src:a.logoImageUrl, alt:a.logoText, className:'bkbg-mf-logo-img', style:{width:a.logoWidth+'px'} });
                    }
                    return el('span', { className:'bkbg-mf-logo-text' }, a.logoText);
                }
                return el('footer', blockProps,
                    el('div', { className:'bkbg-mf-main' },
                        el('div', { className:'bkbg-mf-brand' },
                            el('a', { href:a.logoUrl || '/', className:'bkbg-mf-logo' }, renderLogoSave()),
                            a.showTagline ? el('p', { className:'bkbg-mf-tagline', style:{ fontSize:(a.taglineSize||14)+'px', fontWeight:(a.fontWeight||400) } }, a.tagline) : null
                        ),
                        el('div', { className:'bkbg-mf-nav' },
                            a.navColumns.map(function(col) {
                                return el('div', { key:col.id, className:'bkbg-mf-col' },
                                    el('p', { className:'bkbg-mf-col-heading' }, col.heading),
                                    el('ul', { className:'bkbg-mf-col-links' },
                                        col.links.map(function(l){ return el('li', { key:l.id }, el('a', { href:l.url }, l.label)); })
                                    )
                                );
                            })
                        )
                    ),
                    a.dividerStyle === 'line' ? el('hr', { className:'bkbg-mf-divider' }) : null,
                    el('div', { className:'bkbg-mf-bottom' },
                        a.showCopyright ? el('span', { className:'bkbg-mf-copy', style:{ fontSize:(a.copyrightFontSize||13)+'px', fontWeight:(a.fontWeight||400) } }, a.copyright) : null,
                        el('div', { className:'bkbg-mf-bottom-right' },
                            a.showLegalLinks ? el('div', { className:'bkbg-mf-legal' },
                                a.legalLinks.map(function(l){ return el('a', { key:l.id, href:l.url, className:'bkbg-mf-legal-link' }, l.label); })
                            ) : null,
                            a.showSocials ? el('div', { className:'bkbg-mf-socials' },
                                a.socials.map(function(s){ return el('a', { key:s.id, href:s.url, className:'bkbg-mf-social bkbg-mf-social--'+s.platform, title:s.label, target:'_blank', rel:'noopener noreferrer' }, SOCIAL_ICONS[s.platform] || '↗'); })
                            ) : null
                        )
                    )
                );
            }
        }],
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;

            /* Nav columns */
            function updateCol(idx, patch) {
                setAttr({ navColumns: a.navColumns.map(function(c,i){ return i===idx ? Object.assign({},c,patch) : c; }) });
            }
            function deleteCol(idx) { setAttr({ navColumns: a.navColumns.filter(function(_,i){ return i!==idx; }) }); }
            function moveCol(from, to) {
                var arr = a.navColumns.slice(); arr.splice(to, 0, arr.splice(from, 1)[0]); setAttr({ navColumns: arr });
            }
            function addCol() { setAttr({ navColumns: a.navColumns.concat([{id:uid(), heading:'New Column', links:[{id:uid(), label:'Link', url:'#'}]}]) }); }

            /* Socials */
            function updateSocial(idx, patch) {
                setAttr({ socials: a.socials.map(function(s,i){ return i===idx ? Object.assign({},s,patch) : s; }) });
            }
            function deleteSocial(idx) { setAttr({ socials: a.socials.filter(function(_,i){ return i!==idx; }) }); }
            function addSocial() { setAttr({ socials: a.socials.concat([{id:uid(), platform:'other', url:'#', label:'Other'}]) }); }

            /* Legal links */
            function updateLegal(idx, patch) {
                setAttr({ legalLinks: a.legalLinks.map(function(l,i){ return i===idx ? Object.assign({},l,patch) : l; }) });
            }
            function deleteLegal(idx) { setAttr({ legalLinks: a.legalLinks.filter(function(_,i){ return i!==idx; }) }); }

            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = wrapStyle(a);
                Object.assign(s, _tvf(a.logoTypo, '--bkbg-mf-lg-'));
                Object.assign(s, _tvf(a.taglineTypo, '--bkbg-mf-tg-'));
                Object.assign(s, _tvf(a.headingTypo, '--bkbg-mf-hd-'));
                Object.assign(s, _tvf(a.linkTypo, '--bkbg-mf-lk-'));
                Object.assign(s, _tvf(a.copyrightTypo, '--bkbg-mf-cp-'));
                return { className:'bkbg-mf-wrap bkbg-mf-layout--' + a.layout, style: s };
            })());

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title:__('Logo','blockenberg'), initialOpen:true },
                    el(SelectControl, { label:__('Logo type','blockenberg'), value:a.logoType, options:[{label:'Text',value:'text'},{label:'Image',value:'image'}], onChange:function(v){ setAttr({logoType:v}); } }),
                    a.logoType === 'text' ? el(TextControl, { label:__('Logo text','blockenberg'), value:a.logoText, onChange:function(v){ setAttr({logoText:v}); } }) :
                        el(MediaUploadCheck, null, el(MediaUpload, {
                            onSelect:function(m){ setAttr({logoImageUrl:m.url, logoImageId:m.id}); },
                            allowedTypes:['image'], value:a.logoImageId,
                            render:function(p){ return el(Button, { variant:'secondary', isSmall:true, onClick:p.open }, a.logoImageUrl ? __('Change logo','blockenberg') : __('Select logo','blockenberg')); }
                        })),
                    el(TextControl, { label:__('Logo link URL','blockenberg'), value:a.logoUrl, onChange:function(v){ setAttr({logoUrl:v}); } }),
                    a.logoType === 'image' ? el(RangeControl, { label:__('Logo width (px)','blockenberg'), value:a.logoWidth, min:60, max:300, onChange:function(v){ setAttr({logoWidth:v}); } }) : null,
                    el(ToggleControl, { label:__('Show tagline','blockenberg'), checked:a.showTagline, onChange:function(v){ setAttr({showTagline:v}); } }),
                    a.showTagline ? el(TextControl, { label:__('Tagline','blockenberg'), value:a.tagline, onChange:function(v){ setAttr({tagline:v}); } }) : null
                ),
                el(PanelBody, { title:__('Navigation columns','blockenberg'), initialOpen:false },
                    a.navColumns.map(function(c,i){ return el(NavColumnEditor, { key:c.id, col:c, index:i, total:a.navColumns.length, onUpdate:updateCol, onDelete:deleteCol, onMove:moveCol }); }),
                    el(Button, { variant:'primary', onClick:addCol, style:{marginTop:8} }, __('+ Add column','blockenberg'))
                ),
                el(PanelBody, { title:__('Social links','blockenberg'), initialOpen:false },
                    el(ToggleControl, { label:__('Show socials','blockenberg'), checked:a.showSocials, onChange:function(v){ setAttr({showSocials:v}); } }),
                    a.socials.map(function(s, i) {
                        return el('div', { key:s.id, style:{ borderBottom:'1px solid #eee', paddingBottom:8, marginBottom:4 } },
                            el(SelectControl, { label:__('Platform','blockenberg'), value:s.platform, options:[
                                {label:'Twitter / X',value:'twitter'},{label:'GitHub',value:'github'},{label:'LinkedIn',value:'linkedin'},
                                {label:'Facebook',value:'facebook'},{label:'Instagram',value:'instagram'},{label:'YouTube',value:'youtube'},
                                {label:'TikTok',value:'tiktok'},{label:'Discord',value:'discord'},{label:'Other',value:'other'},
                            ], onChange:function(v){ updateSocial(i,{platform:v}); } }),
                            el(TextControl, { label:__('URL','blockenberg'),   value:s.url,   onChange:function(v){ updateSocial(i,{url:v}); } }),
                            el(TextControl, { label:__('Label','blockenberg'), value:s.label, onChange:function(v){ updateSocial(i,{label:v}); } }),
                            el(Button, { isSmall:true, isDestructive:true, onClick:function(){ deleteSocial(i); } }, __('Delete','blockenberg'))
                        );
                    }),
                    el(Button, { isSmall:true, variant:'tertiary', onClick:addSocial }, __('+ Add social','blockenberg'))
                ),
                el(PanelBody, { title:__('Bottom bar','blockenberg'), initialOpen:false },
                    el(ToggleControl, { label:__('Show copyright','blockenberg'),    checked:a.showCopyright,  onChange:function(v){ setAttr({showCopyright:v}); } }),
                    a.showCopyright ? el(TextControl, { label:__('Copyright text','blockenberg'), value:a.copyright, onChange:function(v){ setAttr({copyright:v}); } }) : null,
                    el(ToggleControl, { label:__('Show legal links','blockenberg'),  checked:a.showLegalLinks, onChange:function(v){ setAttr({showLegalLinks:v}); } }),
                    a.legalLinks.map(function(l, i) {
                        return el('div', { key:l.id, style:{ display:'flex', gap:4, marginBottom:4 } },
                            el(TextControl, { value:l.label, onChange:function(v){ updateLegal(i,{label:v}); }, placeholder:'Label' }),
                            el(TextControl, { value:l.url,   onChange:function(v){ updateLegal(i,{url:v}); },   placeholder:'URL' }),
                            el(Button, { isSmall:true, isDestructive:true, onClick:function(){ deleteLegal(i); } }, '✕')
                        );
                    }),
                    el(Button, { isSmall:true, variant:'tertiary', onClick:function(){ setAttr({ legalLinks: a.legalLinks.concat([{id:uid(), label:'New link', url:'#'}]) }); } }, __('+ Legal link','blockenberg')),
                    el(SelectControl, { label:__('Divider style','blockenberg'), value:a.dividerStyle, options:[{label:'Line',value:'line'},{label:'None',value:'none'}], onChange:function(v){ setAttr({dividerStyle:v}); } }),
                    el(SelectControl, { label:__('Layout','blockenberg'), value:a.layout, options:[{label:'Logo left, nav right',value:'logo-left-nav-right'},{label:'Logo centered',value:'logo-center'},{label:'Stacked',value:'stacked'}], onChange:function(v){ setAttr({layout:v}); } })
                ),
                el(PanelBody, { title:__('Typography','blockenberg'), initialOpen:false },
                    el( getTypoControl(), { label: __( 'Logo Text', 'blockenberg' ), value: a.logoTypo, onChange: function (v) { setAttr({ logoTypo: v }); } }),
                    el( getTypoControl(), { label: __( 'Tagline', 'blockenberg' ), value: a.taglineTypo, onChange: function (v) { setAttr({ taglineTypo: v }); } }),
                    el( getTypoControl(), { label: __( 'Column Heading', 'blockenberg' ), value: a.headingTypo, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                    el( getTypoControl(), { label: __( 'Nav Link', 'blockenberg' ), value: a.linkTypo, onChange: function (v) { setAttr({ linkTypo: v }); } }),
                    el( getTypoControl(), { label: __( 'Copyright', 'blockenberg' ), value: a.copyrightTypo, onChange: function (v) { setAttr({ copyrightTypo: v }); } })
                ),
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'),    value:a.paddingTop,    min:0, max:160, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:160, onChange:function(v){ setAttr({paddingBottom:v}); } })
                ),
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Footer bg','blockenberg'),       value:a.footerBg,      onChange:function(v){ setAttr({footerBg:v||''}); }},
                    {label:__('Logo color','blockenberg'),      value:a.logoColor,     onChange:function(v){ setAttr({logoColor:v||''}); }},
                    {label:__('Tagline','blockenberg'),         value:a.taglineColor,  onChange:function(v){ setAttr({taglineColor:v||''}); }},
                    {label:__('Column headings','blockenberg'), value:a.headingColor,  onChange:function(v){ setAttr({headingColor:v||''}); }},
                    {label:__('Nav links','blockenberg'),       value:a.linkColor,     onChange:function(v){ setAttr({linkColor:v||''}); }},
                    {label:__('Social icons','blockenberg'),    value:a.socialColor,   onChange:function(v){ setAttr({socialColor:v||''}); }},
                    {label:__('Divider','blockenberg'),         value:a.dividerColor,  onChange:function(v){ setAttr({dividerColor:v||''}); }},
                    {label:__('Copyright','blockenberg'),       value:a.copyrightColor,onChange:function(v){ setAttr({copyrightColor:v||''}); }},
                ] })
            );

            /* Render logo */
            function renderLogo() {
                if (a.logoType === 'image' && a.logoImageUrl) {
                    return el('img', { src:a.logoImageUrl, alt:a.logoText, className:'bkbg-mf-logo-img', style:{ width:a.logoWidth + 'px' } });
                }
                return el('span', { className:'bkbg-mf-logo-text' }, a.logoText);
            }

            return el(Fragment, null,
                inspector,
                el('footer', blockProps,
                    el('div', { className:'bkbg-mf-main' },
                        /* Logo + tagline */
                        el('div', { className:'bkbg-mf-brand' },
                            el('a', { href:'#', className:'bkbg-mf-logo', onClick:function(e){ e.preventDefault(); } }, renderLogo()),
                            a.showTagline ? el('p', { className:'bkbg-mf-tagline' }, a.tagline) : null
                        ),
                        /* Nav columns */
                        el('div', { className:'bkbg-mf-nav' },
                            a.navColumns.map(function(col) {
                                return el('div', { key:col.id, className:'bkbg-mf-col' },
                                    el('p', { className:'bkbg-mf-col-heading' }, col.heading),
                                    el('ul', { className:'bkbg-mf-col-links' },
                                        col.links.map(function(l) {
                                            return el('li', { key:l.id }, el('a', { href:'#', onClick:function(e){ e.preventDefault(); } }, l.label));
                                        })
                                    )
                                );
                            })
                        )
                    ),
                    a.dividerStyle === 'line' ? el('hr', { className:'bkbg-mf-divider' }) : null,
                    el('div', { className:'bkbg-mf-bottom' },
                        a.showCopyright ? el('span', { className:'bkbg-mf-copy' }, a.copyright) : null,
                        el('div', { className:'bkbg-mf-bottom-right' },
                            a.showLegalLinks ? el('div', { className:'bkbg-mf-legal' },
                                a.legalLinks.map(function(l){ return el('a', { key:l.id, href:'#', className:'bkbg-mf-legal-link', onClick:function(e){ e.preventDefault(); } }, l.label); })
                            ) : null,
                            a.showSocials ? el('div', { className:'bkbg-mf-socials' },
                                a.socials.map(function(s){ return el('a', { key:s.id, href:'#', className:'bkbg-mf-social bkbg-mf-social--'+s.platform, title:s.label, onClick:function(e){ e.preventDefault(); } }, SOCIAL_ICONS[s.platform] || '↗'); })
                            ) : null
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save((function () {
                var _tvf = getTypoCssVars();
                var s = wrapStyle(a);
                Object.assign(s, _tvf(a.logoTypo, '--bkbg-mf-lg-'));
                Object.assign(s, _tvf(a.taglineTypo, '--bkbg-mf-tg-'));
                Object.assign(s, _tvf(a.headingTypo, '--bkbg-mf-hd-'));
                Object.assign(s, _tvf(a.linkTypo, '--bkbg-mf-lk-'));
                Object.assign(s, _tvf(a.copyrightTypo, '--bkbg-mf-cp-'));
                return { className:'bkbg-mf-wrap bkbg-mf-layout--' + a.layout, style: s };
            })());

            function renderLogoSave() {
                if (a.logoType === 'image' && a.logoImageUrl) {
                    return el('img', { src:a.logoImageUrl, alt:a.logoText, className:'bkbg-mf-logo-img', style:{width:a.logoWidth+'px'} });
                }
                return el('span', { className:'bkbg-mf-logo-text' }, a.logoText);
            }

            return el('footer', blockProps,
                el('div', { className:'bkbg-mf-main' },
                    el('div', { className:'bkbg-mf-brand' },
                        el('a', { href:a.logoUrl || '/', className:'bkbg-mf-logo' }, renderLogoSave()),
                        a.showTagline ? el('p', { className:'bkbg-mf-tagline' }, a.tagline) : null
                    ),
                    el('div', { className:'bkbg-mf-nav' },
                        a.navColumns.map(function(col) {
                            return el('div', { key:col.id, className:'bkbg-mf-col' },
                                el('p', { className:'bkbg-mf-col-heading' }, col.heading),
                                el('ul', { className:'bkbg-mf-col-links' },
                                    col.links.map(function(l){ return el('li', { key:l.id }, el('a', { href:l.url }, l.label)); })
                                )
                            );
                        })
                    )
                ),
                a.dividerStyle === 'line' ? el('hr', { className:'bkbg-mf-divider' }) : null,
                el('div', { className:'bkbg-mf-bottom' },
                    a.showCopyright ? el('span', { className:'bkbg-mf-copy' }, a.copyright) : null,
                    el('div', { className:'bkbg-mf-bottom-right' },
                        a.showLegalLinks ? el('div', { className:'bkbg-mf-legal' },
                            a.legalLinks.map(function(l){ return el('a', { key:l.id, href:l.url, className:'bkbg-mf-legal-link' }, l.label); })
                        ) : null,
                        a.showSocials ? el('div', { className:'bkbg-mf-socials' },
                            a.socials.map(function(s){ return el('a', { key:s.id, href:s.url, className:'bkbg-mf-social bkbg-mf-social--'+s.platform, title:s.label, target:'_blank', rel:'noopener noreferrer' }, SOCIAL_ICONS[s.platform] || '↗'); })
                        ) : null
                    )
                )
            );
        }
    });
}() );
