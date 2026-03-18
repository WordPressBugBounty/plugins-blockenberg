/* ====================================================
   Mega Footer — editor (index.js)
   Block: blockenberg/mega-footer
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
    var useState           = wp.element.useState;
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

    function uid() { return 'mf' + Math.random().toString(36).slice(2,7); }
    function move(arr, from, to) { var a=arr.slice(); a.splice(to,0,a.splice(from,1)[0]); return a; }

    /* Social SVG icons */
    var SOCIAL_ICONS = {
        twitter:  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.737-8.858L1.256 2.25H8.08l4.214 5.578 5.95-5.578zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
        github:   'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.627 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
        linkedin: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
        instagram:'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
        youtube:  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>',
    };

    function wrapStyle(a) {
        var v = getTypoCssVars() || function () { return {}; };
        return Object.assign({
            '--bkbg-mftr-pt':         a.paddingTop+'px',
            '--bkbg-mftr-pb':         a.paddingBottom+'px',
            '--bkbg-mftr-gap':        a.gap+'px',
            '--bkbg-mftr-heading-c':  a.headingColor,
            '--bkbg-mftr-link-c':     a.linkColor,
            '--bkbg-mftr-link-hov-c': a.linkHoverColor,
            '--bkbg-mftr-tagline-c':  a.taglineColor,
            '--bkbg-mftr-div-c':      a.dividerColor,
            '--bkbg-mftr-copy-c':     a.copyrightColor,
            '--bkbg-mftr-social-c':   a.socialIconColor,
            background:               a.footerBg || undefined,
        },
        v(a.headingTypo,'--bkbg-mftr-hd-'),
        v(a.taglineTypo,'--bkbg-mftr-tl-'),
        v(a.linkTypo,'--bkbg-mftr-lk-'),
        v(a.copyrightTypo,'--bkbg-mftr-cp-')
        );
    }

    function SocialIcon(props) {
        var svgSrc = SOCIAL_ICONS[props.platform] || '';
        return svgSrc
            ? el('img', { src:svgSrc, alt:props.label, width:18, height:18, style:{display:'block',opacity:.7,filter:'invert(1)'} })
            : el('span', null, props.label);
    }

    registerBlockType('blockenberg/mega-footer', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;
            var _editCol = useState(null);
            var editColId = _editCol[0]; var setEditColId = _editCol[1];

            var blockProps = useBlockProps({
                className: 'bkbg-mftr-wrap bkbg-mftr-layout--' + a.layout,
                style: wrapStyle(a)
            });

            function updateCol(id, patch) {
                setAttr({ columns: a.columns.map(function(c){ return c.id===id ? Object.assign({},c,patch) : c; }) });
            }
            function updateLink(colId, linkId, patch) {
                setAttr({ columns: a.columns.map(function(c){ if(c.id!==colId) return c; return Object.assign({},c,{links:c.links.map(function(l){ return l.id===linkId ? Object.assign({},l,patch) : l; })}); }) });
            }
            function updateSocial(id, patch) {
                setAttr({ socialLinks: a.socialLinks.map(function(s){ return s.id===id ? Object.assign({},s,patch) : s; }) });
            }
            function updateBottomLink(id, patch) {
                setAttr({ bottomLinks: a.bottomLinks.map(function(l){ return l.id===id ? Object.assign({},l,patch) : l; }) });
            }

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title:__('Logo & Brand','blockenberg'), initialOpen:true },
                    el(MediaUploadCheck, null,
                        el(MediaUpload, {
                            onSelect:function(m){ setAttr({logoUrl:m.url,logoId:m.id}); },
                            allowedTypes:['image'], value:a.logoId,
                            render:function(o){ return el(Button, { onClick:o.open, variant:'secondary', isSmall:true }, a.logoUrl ? __('Change logo','blockenberg') : __('Upload logo','blockenberg')); }
                        })
                    ),
                    a.logoUrl ? el(Button, { isDestructive:true, variant:'tertiary', isSmall:true, style:{marginTop:'4px'}, onClick:function(){ setAttr({logoUrl:'',logoId:0}); } }, __('Remove logo','blockenberg')) : null,
                    el(RangeControl, { label:__('Logo width (px)','blockenberg'), value:a.logoWidth, min:60, max:300, onChange:function(v){ setAttr({logoWidth:v}); } }),
                    el(ToggleControl, { label:__('Show tagline','blockenberg'), checked:a.showTagline, onChange:function(v){ setAttr({showTagline:v}); } }),
                    el(TextControl, { label:__('Tagline','blockenberg'), value:a.tagline, onChange:function(v){ setAttr({tagline:v}); } })
                ),
                el(PanelBody, { title:__('Link Columns','blockenberg'), initialOpen:false },
                    a.columns.map(function(col, ci) {
                        var isOpen = editColId === col.id;
                        return el('div', { key:col.id },
                            el('div', { style:{display:'flex',alignItems:'center',gap:'6px',background:isOpen?'#f3f0ff':'#f8f9fa',border:isOpen?'1px solid #6c3fb5':'1px solid #e2e8f0',borderRadius:'6px',padding:'6px 8px',marginBottom:'4px',cursor:'pointer'}, onClick:function(){ setEditColId(isOpen?null:col.id); } },
                                el('span', { style:{flex:1,fontSize:'13px',fontWeight:500} }, col.heading || __('(Column)','blockenberg')),
                                el(Button, { icon:'arrow-up',   isSmall:true, disabled:ci===0,               onClick:function(e){ e.stopPropagation(); setAttr({columns:move(a.columns,ci,ci-1)}); } }),
                                el(Button, { icon:'arrow-down', isSmall:true, disabled:ci===a.columns.length-1, onClick:function(e){ e.stopPropagation(); setAttr({columns:move(a.columns,ci,ci+1)}); } }),
                                el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, onClick:function(e){ e.stopPropagation(); setAttr({columns:a.columns.filter(function(_,i){ return i!==ci; })}); if(editColId===col.id)setEditColId(null); } })
                            ),
                            isOpen ? el('div', { style:{padding:'10px',background:'#faf8ff',border:'1px solid #6c3fb5',borderTop:'none',borderRadius:'0 0 6px 6px',marginBottom:'4px'} },
                                el(TextControl, { label:__('Column heading','blockenberg'), value:col.heading, onChange:function(v){ updateCol(col.id,{heading:v}); } }),
                                el('p', { style:{fontSize:'11px',color:'#64748b',margin:'8px 0 4px',fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px'} }, __('Links','blockenberg')),
                                col.links.map(function(link, li) {
                                    return el('div', { key:link.id, style:{display:'grid',gridTemplateColumns:'1fr 1fr auto auto auto',gap:'4px',marginBottom:'4px',alignItems:'center'} },
                                        el(TextControl, { placeholder:__('Label','blockenberg'), value:link.label, onChange:function(v){ updateLink(col.id,link.id,{label:v}); }, style:{margin:0} }),
                                        el(TextControl, { placeholder:__('URL','blockenberg'),   value:link.url,   onChange:function(v){ updateLink(col.id,link.id,{url:v}); },   style:{margin:0} }),
                                        el(Button, { icon:'arrow-up',   isSmall:true, disabled:li===0,               onClick:function(){ updateCol(col.id,{links:move(col.links,li,li-1)}); } }),
                                        el(Button, { icon:'arrow-down', isSmall:true, disabled:li===col.links.length-1, onClick:function(){ updateCol(col.id,{links:move(col.links,li,li+1)}); } }),
                                        el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, onClick:function(){ updateCol(col.id,{links:col.links.filter(function(l){ return l.id!==link.id; })}); } })
                                    );
                                }),
                                el(Button, { variant:'secondary', isSmall:true, style:{width:'100%',marginTop:'4px'}, onClick:function(){ updateCol(col.id,{links:col.links.concat([{id:uid(),label:'New link',url:'#'}])}); } }, __('+ Add link','blockenberg'))
                            ) : null
                        );
                    }),
                    el(Button, { variant:'primary', isSmall:true, style:{marginTop:'8px',width:'100%'}, onClick:function(){ var n={id:uid(),heading:'New Column',links:[{id:uid(),label:'Link',url:'#'}]}; setAttr({columns:a.columns.concat([n])}); setEditColId(n.id); } }, __('+ Add Column','blockenberg'))
                ),
                el(PanelBody, { title:__('Social Links','blockenberg'), initialOpen:false },
                    el(ToggleControl, { label:__('Show social','blockenberg'), checked:a.showSocial, onChange:function(v){ setAttr({showSocial:v}); } }),
                    a.socialLinks.map(function(link, si) {
                        return el('div', { key:link.id, style:{display:'grid',gridTemplateColumns:'100px 1fr auto',gap:'4px',marginBottom:'4px',alignItems:'center'} },
                            el(SelectControl, { value:link.platform, options:[
                                {label:'Twitter/X',  value:'twitter'},
                                {label:'GitHub',     value:'github'},
                                {label:'LinkedIn',   value:'linkedin'},
                                {label:'Instagram',  value:'instagram'},
                                {label:'YouTube',    value:'youtube'},
                            ], onChange:function(v){ updateSocial(link.id,{platform:v,label:v}); }, style:{margin:0} }),
                            el(TextControl, { placeholder:__('URL','blockenberg'), value:link.url, onChange:function(v){ updateSocial(link.id,{url:v}); }, style:{margin:0} }),
                            el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, onClick:function(){ setAttr({socialLinks:a.socialLinks.filter(function(l){ return l.id!==link.id; })}); } })
                        );
                    }),
                    el(Button, { variant:'secondary', isSmall:true, style:{width:'100%',marginTop:'4px'}, onClick:function(){ setAttr({socialLinks:a.socialLinks.concat([{id:uid(),platform:'twitter',url:'#',label:'Twitter'}])}); } }, __('+ Add social','blockenberg'))
                ),
                el(PanelBody, { title:__('Bottom Bar','blockenberg'), initialOpen:false },
                    el(ToggleControl, { label:__('Show bottom bar','blockenberg'), checked:a.showBottomBar, onChange:function(v){ setAttr({showBottomBar:v}); } }),
                    el(TextControl, { label:__('Copyright text','blockenberg'), value:a.copyright, onChange:function(v){ setAttr({copyright:v}); } }),
                    el('p', { style:{fontSize:'11px',color:'#64748b',margin:'8px 0 4px',fontWeight:600} }, __('Bottom links','blockenberg')),
                    a.bottomLinks.map(function(link, bi) {
                        return el('div', { key:link.id, style:{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:'4px',marginBottom:'4px',alignItems:'center'} },
                            el(TextControl, { placeholder:__('Label','blockenberg'), value:link.label, onChange:function(v){ updateBottomLink(link.id,{label:v}); }, style:{margin:0} }),
                            el(TextControl, { placeholder:__('URL','blockenberg'),   value:link.url,   onChange:function(v){ updateBottomLink(link.id,{url:v}); },   style:{margin:0} }),
                            el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, onClick:function(){ setAttr({bottomLinks:a.bottomLinks.filter(function(l){ return l.id!==link.id; })}); } })
                        );
                    }),
                    el(Button, { variant:'secondary', isSmall:true, style:{width:'100%',marginTop:'4px'}, onClick:function(){ setAttr({bottomLinks:a.bottomLinks.concat([{id:uid(),label:'New link',url:'#'}])}); } }, __('+ Add bottom link','blockenberg'))
                ),
                el(PanelBody, { title:__('Style','blockenberg'), initialOpen:false },
                    el(SelectControl, { label:__('Layout','blockenberg'), value:a.layout, options:[
                        {label:'Logo left + columns',   value:'logo-left'},
                        {label:'Logo top centered',    value:'logo-top'},
                    ], onChange:function(v){ setAttr({layout:v}); } }),
                    el(RangeControl, { label:__('Gap (px)','blockenberg'),         value:a.gap,         min:16, max:80, onChange:function(v){ setAttr({gap:v}); } }),
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'),    value:a.paddingTop,    min:0, max:120, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:120, onChange:function(v){ setAttr({paddingBottom:v}); } }),
                    el(ToggleControl, { label:__('Show divider','blockenberg'), checked:a.showDivider, onChange:function(v){ setAttr({showDivider:v}); } })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: 'Column Heading', value: a.headingTypo || {}, onChange: function(v){ setAttr({ headingTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: 'Tagline', value: a.taglineTypo || {}, onChange: function(v){ setAttr({ taglineTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: 'Link', value: a.linkTypo || {}, onChange: function(v){ setAttr({ linkTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: 'Copyright', value: a.copyrightTypo || {}, onChange: function(v){ setAttr({ copyrightTypo: v }); } })
                ),
el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Footer bg','blockenberg'),      value:a.footerBg,       onChange:function(v){ setAttr({footerBg:v||''}); }},
                    {label:__('Heading color','blockenberg'),  value:a.headingColor,   onChange:function(v){ setAttr({headingColor:v||''}); }},
                    {label:__('Link color','blockenberg'),     value:a.linkColor,      onChange:function(v){ setAttr({linkColor:v||''}); }},
                    {label:__('Link hover','blockenberg'),     value:a.linkHoverColor, onChange:function(v){ setAttr({linkHoverColor:v||''}); }},
                    {label:__('Tagline','blockenberg'),        value:a.taglineColor,   onChange:function(v){ setAttr({taglineColor:v||''}); }},
                    {label:__('Divider','blockenberg'),        value:a.dividerColor,   onChange:function(v){ setAttr({dividerColor:v||''}); }},
                    {label:__('Copyright','blockenberg'),      value:a.copyrightColor, onChange:function(v){ setAttr({copyrightColor:v||''}); }},
                    {label:__('Social icons','blockenberg'),   value:a.socialIconColor,onChange:function(v){ setAttr({socialIconColor:v||''}); }},
                ] })
            );

            /* Preview render */
            var logoEl = a.logoUrl
                ? el('img', { src:a.logoUrl, alt:'Logo', style:{width:a.logoWidth+'px',height:'auto',display:'block'} })
                : el('div', { style:{width:a.logoWidth+'px',height:'40px',background:'#1e293b',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8',fontSize:'13px'} }, __('Logo','blockenberg'));

            var brandEl = el('div', { className:'bkbg-mftr-brand' },
                logoEl,
                a.showTagline ? el('p', { className:'bkbg-mftr-tagline' }, a.tagline) : null,
                a.showSocial ? el('div', { className:'bkbg-mftr-social' },
                    a.socialLinks.map(function(link) {
                        return el('a', { key:link.id, href:'#', className:'bkbg-mftr-social-link', onClick:function(e){ e.preventDefault(); } },
                            el(SocialIcon, { platform:link.platform, label:link.label })
                        );
                    })
                ) : null
            );

            var colsEl = el('div', { className:'bkbg-mftr-cols', style:{gridTemplateColumns:'repeat('+a.columns.length+',1fr)'} },
                a.columns.map(function(col) {
                    return el('div', { key:col.id, className:'bkbg-mftr-col' },
                        el('h4', { className:'bkbg-mftr-col-heading' }, col.heading),
                        el('ul', { className:'bkbg-mftr-col-list' },
                            col.links.map(function(link) {
                                return el('li', { key:link.id },
                                    el('a', { href:link.url, className:'bkbg-mftr-col-link', onClick:function(e){ e.preventDefault(); } }, link.label)
                                );
                            })
                        )
                    );
                })
            );

            var bottomEl = a.showBottomBar ? el('div', { className:'bkbg-mftr-bottom' },
                el('span', { className:'bkbg-mftr-copyright' }, a.copyright),
                a.bottomLinks.length ? el('div', { className:'bkbg-mftr-bottom-links' },
                    a.bottomLinks.map(function(link) { return el('a', { key:link.id, href:link.url, className:'bkbg-mftr-bottom-link', onClick:function(e){ e.preventDefault(); } }, link.label); })
                ) : null
            ) : null;

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el('div', { className:'bkbg-mftr-main' },
                        brandEl,
                        colsEl
                    ),
                    a.showDivider ? el('hr', { className:'bkbg-mftr-divider' }) : null,
                    bottomEl
                )
            );
        },

        deprecated: [{
            save: function (props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save({
                    className: 'bkbg-mftr-wrap bkbg-mftr-layout--' + a.layout,
                    style: {
                        '--bkbg-mftr-pt':a.paddingTop+'px','--bkbg-mftr-pb':a.paddingBottom+'px','--bkbg-mftr-gap':a.gap+'px','--bkbg-mftr-heading-sz':a.headingSize+'px','--bkbg-mftr-link-sz':a.linkSize+'px','--bkbg-mftr-tagline-sz':a.taglineSize+'px','--bkbg-mftr-heading-c':a.headingColor,'--bkbg-mftr-link-c':a.linkColor,'--bkbg-mftr-link-hov-c':a.linkHoverColor,'--bkbg-mftr-tagline-c':a.taglineColor,'--bkbg-mftr-div-c':a.dividerColor,'--bkbg-mftr-copy-c':a.copyrightColor,'--bkbg-mftr-copyright-sz':(a.copyrightFontSize||13)+'px','--bkbg-mftr-font-weight':String(a.fontWeight||400),'--bkbg-mftr-social-c':a.socialIconColor,background:a.footerBg||undefined,
                    }
                });
                return el('div', blockProps,
                    el('div', { className:'bkbg-mftr-main' },
                        el('div', { className:'bkbg-mftr-brand' },
                            a.logoUrl ? el('img', { src:a.logoUrl, alt:'Logo', className:'bkbg-mftr-logo', style:{width:a.logoWidth+'px'}, loading:'lazy' }) : null,
                            a.showTagline ? el('p', { className:'bkbg-mftr-tagline' }, a.tagline) : null,
                            a.showSocial ? el('div', { className:'bkbg-mftr-social' },
                                a.socialLinks.map(function(link) {
                                    var svgSrc = SOCIAL_ICONS[link.platform] || '';
                                    return el('a', { key:link.id, href:link.url, className:'bkbg-mftr-social-link', 'aria-label':link.label, rel:'noopener noreferrer', target:'_blank' },
                                        svgSrc ? el('img', { src:svgSrc, alt:link.label, width:18, height:18 }) : el('span', null, link.label)
                                    );
                                })
                            ) : null
                        ),
                        el('div', { className:'bkbg-mftr-cols', style:{gridTemplateColumns:'repeat('+a.columns.length+',1fr)'} },
                            a.columns.map(function(col) {
                                return el('div', { key:col.id, className:'bkbg-mftr-col' },
                                    el('h4', { className:'bkbg-mftr-col-heading' }, col.heading),
                                    el('ul', { className:'bkbg-mftr-col-list' },
                                        col.links.map(function(link) {
                                            return el('li', { key:link.id }, el('a', { href:link.url, className:'bkbg-mftr-col-link' }, link.label));
                                        })
                                    )
                                );
                            })
                        )
                    ),
                    a.showDivider ? el('hr', { className:'bkbg-mftr-divider' }) : null,
                    a.showBottomBar ? el('div', { className:'bkbg-mftr-bottom' },
                        el('span', { className:'bkbg-mftr-copyright' }, a.copyright),
                        a.bottomLinks.length ? el('div', { className:'bkbg-mftr-bottom-links' },
                            a.bottomLinks.map(function(link) { return el('a', { key:link.id, href:link.url, className:'bkbg-mftr-bottom-link' }, link.label); })
                        ) : null
                    ) : null
                );
            }
        }],

        save: function (props) {
            var a = props.attributes;
            var v = (typeof window.bkbgTypoCssVars === 'function') ? window.bkbgTypoCssVars : function () { return {}; };
            var s = Object.assign({
                '--bkbg-mftr-pt':a.paddingTop+'px','--bkbg-mftr-pb':a.paddingBottom+'px','--bkbg-mftr-gap':a.gap+'px','--bkbg-mftr-heading-c':a.headingColor,'--bkbg-mftr-link-c':a.linkColor,'--bkbg-mftr-link-hov-c':a.linkHoverColor,'--bkbg-mftr-tagline-c':a.taglineColor,'--bkbg-mftr-div-c':a.dividerColor,'--bkbg-mftr-copy-c':a.copyrightColor,'--bkbg-mftr-social-c':a.socialIconColor,background:a.footerBg||undefined
            },
            v(a.headingTypo,'--bkbg-mftr-hd-'),
            v(a.taglineTypo,'--bkbg-mftr-tl-'),
            v(a.linkTypo,'--bkbg-mftr-lk-'),
            v(a.copyrightTypo,'--bkbg-mftr-cp-')
            );
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-mftr-wrap bkbg-mftr-layout--' + a.layout,
                style: s
            });
            return el('div', blockProps,
                el('div', { className:'bkbg-mftr-main' },
                    el('div', { className:'bkbg-mftr-brand' },
                        a.logoUrl ? el('img', { src:a.logoUrl, alt:'Logo', className:'bkbg-mftr-logo', style:{width:a.logoWidth+'px'}, loading:'lazy' }) : null,
                        a.showTagline ? el('p', { className:'bkbg-mftr-tagline' }, a.tagline) : null,
                        a.showSocial ? el('div', { className:'bkbg-mftr-social' },
                            a.socialLinks.map(function(link) {
                                var svgSrc = SOCIAL_ICONS[link.platform] || '';
                                return el('a', { key:link.id, href:link.url, className:'bkbg-mftr-social-link', 'aria-label':link.label, rel:'noopener noreferrer', target:'_blank' },
                                    svgSrc ? el('img', { src:svgSrc, alt:link.label, width:18, height:18 }) : el('span', null, link.label)
                                );
                            })
                        ) : null
                    ),
                    el('div', { className:'bkbg-mftr-cols', style:{gridTemplateColumns:'repeat('+a.columns.length+',1fr)'} },
                        a.columns.map(function(col) {
                            return el('div', { key:col.id, className:'bkbg-mftr-col' },
                                el('h4', { className:'bkbg-mftr-col-heading' }, col.heading),
                                el('ul', { className:'bkbg-mftr-col-list' },
                                    col.links.map(function(link) {
                                        return el('li', { key:link.id }, el('a', { href:link.url, className:'bkbg-mftr-col-link' }, link.label));
                                    })
                                )
                            );
                        })
                    )
                ),
                a.showDivider ? el('hr', { className:'bkbg-mftr-divider' }) : null,
                a.showBottomBar ? el('div', { className:'bkbg-mftr-bottom' },
                    el('span', { className:'bkbg-mftr-copyright' }, a.copyright),
                    a.bottomLinks.length ? el('div', { className:'bkbg-mftr-bottom-links' },
                        a.bottomLinks.map(function(link) { return el('a', { key:link.id, href:link.url, className:'bkbg-mftr-bottom-link' }, link.label); })
                    ) : null
                ) : null
            );
        }
    });
}() );
