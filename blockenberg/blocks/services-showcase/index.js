/* ====================================================
   Services Showcase Block — editor (index.js)
   Block: blockenberg/services-showcase
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

    function uid() { return 's' + Math.random().toString(36).slice(2,7); }
    function move(arr, from, to) { var a=arr.slice(); a.splice(to,0,a.splice(from,1)[0]); return a; }

    var _tc, _tv;
    function getTC() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTV() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    function buildWrapStyle(a) {
        return {
            '--bkbg-sshw-cols':          a.columns,
            '--bkbg-sshw-gap':           a.gap + 'px',
            '--bkbg-sshw-r':             a.cardRadius + 'px',
            '--bkbg-sshw-pad':           a.cardPadding + 'px',
            '--bkbg-sshw-icon-sz':       a.iconSize + 'px',
            '--bkbg-sshw-icon-bg-sz':    a.iconBgSize + 'px',
            '--bkbg-sshw-pt':            a.paddingTop + 'px',
            '--bkbg-sshw-pb':            a.paddingBottom + 'px',
            '--bkbg-sshw-h-gap':         a.headerGap + 'px',
            '--bkbg-sshw-title-sz':      a.titleSize + 'px',
            '--bkbg-sshw-desc-sz':       a.descSize + 'px',
            '--bkbg-sshw-feat-sz':       a.featureSize + 'px',
            '--bkbg-sshw-card-bg':       a.cardBg,
            '--bkbg-sshw-card-brd':      a.cardBorderColor,
            '--bkbg-sshw-icon-bg':       a.iconBg,
            '--bkbg-sshw-icon-color':    a.iconColor,
            '--bkbg-sshw-title-color':   a.titleColor,
            '--bkbg-sshw-desc-color':    a.descColor,
            '--bkbg-sshw-feat-color':    a.featureColor,
            '--bkbg-sshw-feat-chk':      a.featureCheckColor,
            '--bkbg-sshw-cta-color':     a.ctaColor,
            '--bkbg-sshw-eyebrow-bg':    a.eyebrowBg,
            '--bkbg-sshw-eyebrow-color': a.eyebrowColor,
            '--bkbg-sshw-title2-color':  a.sectionTitleColor,
            '--bkbg-sshw-sub-color':     a.sectionSubColor,
            background:                  a.sectionBg || undefined,
        };
    }

    /* ── Service card preview (editor) ── */
    function ServiceCard(props) {
        var svc  = props.svc;
        var a    = props.a;
        var idx  = props.idx;
        var total = props.total;
        var onChange = props.onChange;

        var badge = a.showBadges && svc.showBadge && svc.badgeLabel
            ? el('span', { className:'bkbg-sshw-badge' }, svc.badgeLabel)
            : null;

        var iconEl = a.showImages && svc.imageUrl
            ? el('div', { className:'bkbg-sshw-card-image' },
                el('img', { src:svc.imageUrl, alt:svc.title })
              )
            : el('div', { className:'bkbg-sshw-icon-wrap', style:{ background:svc.accentColor+'22' } },
                el('span', { className:'bkbg-sshw-icon', style:{ color:svc.accentColor } }, (svc.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(svc.iconType, svc.icon, svc.iconDashicon, svc.iconImageUrl, svc.iconDashiconColor) : svc.icon)
              );

        var featureList = a.showFeatures && svc.features && svc.features.length > 0
            ? el('ul', { className:'bkbg-sshw-features' },
                svc.features.map(function(f, fi) {
                    return el('li', { key:fi, className:'bkbg-sshw-feature-item' },
                        el('span', { className:'bkbg-sshw-feat-check', style:{ color:svc.accentColor } }, (a.featureIconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(a.featureIconType, a.featureIcon, a.featureIconDashicon, a.featureIconImageUrl, a.featureIconDashiconColor) : a.featureIcon),
                        f
                    );
                })
              )
            : null;

        var ctaEl = a.showCta && svc.ctaLabel
            ? el('a', { href:svc.ctaUrl||'#', className:'bkbg-sshw-cta bkbg-sshw-cta--'+(a.ctaStyle), style:{ color:svc.accentColor }, onClick:function(e){ e.preventDefault(); } },
                svc.ctaLabel,
                a.ctaStyle === 'link-arrow' ? el('span', { className:'bkbg-sshw-cta-arrow' }, ' →') : null
              )
            : null;

        var accentTopBar = el('div', { className:'bkbg-sshw-accent-bar', style:{ background:svc.accentColor } });

        return el('div', { className:'bkbg-sshw-card bkbg-sshw-card--' + a.cardStyle },
            a.cardStyle === 'accent-top' ? accentTopBar : null,
            badge,
            iconEl,
            el('h3', { className:'bkbg-sshw-card-title' }, svc.title),
            el('p',  { className:'bkbg-sshw-card-desc' },  svc.description),
            featureList,
            ctaEl
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

    /* ── REGISTER ── */
    registerBlockType('blockenberg/services-showcase', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;
            var services = a.services;

            var _act = useState(null);
            var activeId = _act[0]; var setActiveId = _act[1];

            function updateSvc(id, patch) {
                setAttr({ services: services.map(function(s){ return s.id===id ? Object.assign({},s,patch) : s; }) });
            }
            function updateSvcFeature(id, fi, val) {
                var svc = services.find(function(s){ return s.id===id; });
                if (!svc) return;
                var feats = svc.features.slice();
                feats[fi] = val;
                updateSvc(id, { features: feats });
            }
            function addFeature(id) {
                var svc = services.find(function(s){ return s.id===id; });
                if (!svc) return;
                updateSvc(id, { features: svc.features.concat(['']) });
            }
            function removeFeature(id, fi) {
                var svc = services.find(function(s){ return s.id===id; });
                if (!svc) return;
                updateSvc(id, { features: svc.features.filter(function(_,i){ return i!==fi; }) });
            }

            var blockProps = useBlockProps((function () {
                var _tv = getTV();
                var s = buildWrapStyle(a);
                Object.assign(s, _tv(a.sectionTitleTypo, '--bkshw-stt-'));
                Object.assign(s, _tv(a.cardTitleTypo, '--bkshw-ctt-'));
                Object.assign(s, _tv(a.cardDescTypo, '--bkshw-cdt-'));
                return {
                    className: 'bkbg-sshw-wrap bkbg-sshw-style--' + a.cardStyle,
                    style: s
                };
            })());

            /* Service row in inspector */
            function svcRow(svc, idx) {
                var isActive = activeId === svc.id;
                return el('div', { key:svc.id },
                    el('div', {
                        style:{ display:'flex', alignItems:'center', gap:'6px', background: isActive?'#f3f0ff':'#f8f9fa', border: isActive?'1px solid #6c3fb5':'1px solid #e2e8f0', borderRadius:'6px', padding:'6px 8px', marginBottom:'4px', cursor:'pointer' },
                        onClick: function(){ setActiveId(isActive ? null : svc.id); }
                    },
                        el('span', { style:{ fontSize:'18px', marginRight:'4px' } }, (svc.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(svc.iconType, svc.icon, svc.iconDashicon, svc.iconImageUrl, svc.iconDashiconColor) : svc.icon),
                        el('span', { style:{ flex:1, fontSize:'13px', fontWeight:500 } }, svc.title || '(untitled)'),
                        el(Button, { icon:'arrow-up', isSmall:true, disabled:idx===0, onClick:function(e){ e.stopPropagation(); setAttr({services:move(services,idx,idx-1)}); } }),
                        el(Button, { icon:'arrow-down', isSmall:true, disabled:idx===services.length-1, onClick:function(e){ e.stopPropagation(); setAttr({services:move(services,idx,idx+1)}); } }),
                        el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, onClick:function(e){ e.stopPropagation(); setAttr({services:services.filter(function(_,i){ return i!==idx; })}); if(activeId===svc.id) setActiveId(null); } })
                    ),
                    isActive ? el('div', { style:{ padding:'10px', background:'#faf8ff', border:'1px solid #6c3fb5', borderTop:'none', borderRadius:'0 0 6px 6px', marginBottom:'4px' } },
                        el(IP().IconPickerControl, IP().iconPickerProps(svc, function (patch) { updateSvc(svc.id, patch); }, { label: __('Icon', 'blockenberg'), charAttr: 'icon', typeAttr: 'iconType', dashiconAttr: 'iconDashicon', imageUrlAttr: 'iconImageUrl' })),
                        el(TextControl, { label:__('Title','blockenberg'), value:svc.title, onChange:function(v){ updateSvc(svc.id,{title:v}); } }),
                        el(TextControl, { label:__('Description','blockenberg'), value:svc.description, onChange:function(v){ updateSvc(svc.id,{description:v}); } }),
                        el(BkbgColorSwatch, { label:__('Accent color','blockenberg'), value:svc.accentColor, onChange:function(v){ updateSvc(svc.id,{accentColor:v}); } }),
                        /* Badge */
                        el(ToggleControl, { label:__('Show badge','blockenberg'), checked:svc.showBadge, onChange:function(v){ updateSvc(svc.id,{showBadge:v}); } }),
                        svc.showBadge ? el(TextControl, { label:__('Badge label','blockenberg'), value:svc.badgeLabel, onChange:function(v){ updateSvc(svc.id,{badgeLabel:v}); } }) : null,
                        /* CTA */
                        el(TextControl, { label:__('CTA label','blockenberg'), value:svc.ctaLabel, onChange:function(v){ updateSvc(svc.id,{ctaLabel:v}); } }),
                        el(TextControl, { label:__('CTA URL','blockenberg'), value:svc.ctaUrl, onChange:function(v){ updateSvc(svc.id,{ctaUrl:v}); } }),
                        /* Image */
                        el('p', { style:{ fontWeight:600, fontSize:'12px', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'6px' } }, __('Card image','blockenberg')),
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect:function(m){ updateSvc(svc.id,{imageUrl:m.url,imageId:m.id,useImage:true}); },
                                allowedTypes:['image'], value:svc.imageId,
                                render:function(o){ return el(Button, { onClick:o.open, variant:'secondary', isSmall:true }, svc.imageUrl ? __('Change image','blockenberg') : __('Upload image','blockenberg')); }
                            })
                        ),
                        svc.imageUrl ? el(Button, { isDestructive:true, variant:'tertiary', isSmall:true, style:{marginTop:'4px'}, onClick:function(){ updateSvc(svc.id,{imageUrl:'',imageId:0,useImage:false}); } }, __('Remove image','blockenberg')) : null,
                        /* Features */
                        el('p', { style:{ fontWeight:600, fontSize:'12px', textTransform:'uppercase', letterSpacing:'.06em', margin:'12px 0 6px' } }, __('Feature list','blockenberg')),
                        svc.features.map(function(f, fi) {
                            return el('div', { key:fi, style:{ display:'flex', gap:'4px', marginBottom:'4px' } },
                                el(TextControl, { value:f, onChange:function(v){ updateSvcFeature(svc.id,fi,v); }, style:{ flex:1 } }),
                                el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, onClick:function(){ removeFeature(svc.id,fi); } })
                            );
                        }),
                        el(Button, { variant:'secondary', isSmall:true, style:{ width:'100%' }, onClick:function(){ addFeature(svc.id); } }, __('+ Add feature','blockenberg'))
                    ) : null
                );
            }

            var inspector = el(InspectorControls, null,
                /* Services items */
                el(PanelBody, { title:__('Services','blockenberg'), initialOpen:true },
                    services.map(function(svc, idx) { return svcRow(svc, idx); }),
                    el(Button, { variant:'primary', style:{ marginTop:'8px', width:'100%' },
                        onClick:function(){
                            var n = { id:uid(), icon:'🔧', iconType:'custom-char', iconDashicon:'', iconImageUrl:'', imageUrl:'', imageId:0, useImage:false, title:'New Service', description:'Describe your service here.', features:['Feature one','Feature two'], ctaLabel:'Learn more', ctaUrl:'#', badgeLabel:'', showBadge:false, accentColor:'#6c3fb5' };
                            setAttr({ services: services.concat([n]) });
                            setActiveId(n.id);
                        }
                    }, __('+ Add Service','blockenberg'))
                ),

                /* Layout & Style */
                el(PanelBody, { title:__('Layout & Style','blockenberg'), initialOpen:false },
                    el(SelectControl, { label:__('Card style','blockenberg'), value:a.cardStyle, options:[
                        {label:'Clean (flat)',value:'clean'},
                        {label:'Bordered',value:'bordered'},
                        {label:'Shadowed card',value:'shadow'},
                        {label:'Accent top bar',value:'accent-top'},
                        {label:'Gradient bg',value:'gradient'},
                    ], onChange:function(v){ setAttr({cardStyle:v}); } }),
                    el(SelectControl, { label:__('CTA style','blockenberg'), value:a.ctaStyle, options:[
                        {label:'Link with arrow →',value:'link-arrow'},
                        {label:'Solid button',value:'btn-solid'},
                        {label:'Outline button',value:'btn-outline'},
                    ], onChange:function(v){ setAttr({ctaStyle:v}); } }),
                    el(SelectControl, { label:__('Header alignment','blockenberg'), value:a.headerAlign, options:[
                        {label:'Left',value:'left'},{label:'Center',value:'center'},{label:'Right',value:'right'}
                    ], onChange:function(v){ setAttr({headerAlign:v}); } }),
                    el(RangeControl, { label:__('Columns','blockenberg'), value:a.columns, min:1, max:4, onChange:function(v){ setAttr({columns:v}); } }),
                    el(RangeControl, { label:__('Gap (px)','blockenberg'), value:a.gap, min:8, max:80, onChange:function(v){ setAttr({gap:v}); } }),
                    el(RangeControl, { label:__('Card radius (px)','blockenberg'), value:a.cardRadius, min:0, max:32, onChange:function(v){ setAttr({cardRadius:v}); } }),
                    el(RangeControl, { label:__('Card padding (px)','blockenberg'), value:a.cardPadding, min:12, max:60, onChange:function(v){ setAttr({cardPadding:v}); } }),
                    el(RangeControl, { label:__('Icon size (px)','blockenberg'), value:a.iconSize, min:20, max:64, onChange:function(v){ setAttr({iconSize:v}); } }),
                    el(RangeControl, { label:__('Icon bg size (px)','blockenberg'), value:a.iconBgSize, min:40, max:120, onChange:function(v){ setAttr({iconBgSize:v}); } })
                ),

                /* Section header */
                el(PanelBody, { title:__('Section Header','blockenberg'), initialOpen:false },
                    el(ToggleControl, { label:__('Show section header','blockenberg'), checked:a.showSectionHeader, onChange:function(v){ setAttr({showSectionHeader:v}); } }),
                    el(ToggleControl, { label:__('Show eyebrow label','blockenberg'), checked:a.showEyebrow, onChange:function(v){ setAttr({showEyebrow:v}); } }),
                    el(TextControl, { label:__('Eyebrow text','blockenberg'), value:a.eyebrowLabel, onChange:function(v){ setAttr({eyebrowLabel:v}); } }),
                    el('p', { style:{ fontSize:'12px', color:'#6b7280', marginTop:'8px' } }, __('Edit title & subtitle in the block preview.','blockenberg'))
                ),

                /* Toggles */
                el(PanelBody, { title:__('Content Toggles','blockenberg'), initialOpen:false },
                    el(ToggleControl, { label:__('Show feature list','blockenberg'), checked:a.showFeatures, onChange:function(v){ setAttr({showFeatures:v}); } }),
                    el(ToggleControl, { label:__('Show CTA links','blockenberg'), checked:a.showCta, onChange:function(v){ setAttr({showCta:v}); } }),
                    el(ToggleControl, { label:__('Show badges','blockenberg'), checked:a.showBadges, onChange:function(v){ setAttr({showBadges:v}); } }),
                    el(ToggleControl, { label:__('Show card images (if uploaded)','blockenberg'), checked:a.showImages, onChange:function(v){ setAttr({showImages:v}); } }),
                    el(IP().IconPickerControl, IP().iconPickerProps(a, setAttr, { charAttr: 'featureIcon', typeAttr: 'featureIconType', dashiconAttr: 'featureIconDashicon', imageUrlAttr: 'featureIconImageUrl', colorAttr: 'featureIconDashiconColor' }))
                ),

                /* Typography */
                el(PanelBody, { title:__('Typography','blockenberg'), initialOpen:false },
                    el(getTC(), { label: __('Section Title', 'blockenberg'), value: a.sectionTitleTypo, onChange: function (v) { setAttr({ sectionTitleTypo: v }); } }),
                    el(getTC(), { label: __('Card Title', 'blockenberg'), value: a.cardTitleTypo, onChange: function (v) { setAttr({ cardTitleTypo: v }); } }),
                    el(getTC(), { label: __('Card Description', 'blockenberg'), value: a.cardDescTypo, onChange: function (v) { setAttr({ cardDescTypo: v }); } }),
                    el(RangeControl, { label:__('Feature size (px)','blockenberg'), value:a.featureSize, min:11, max:20, onChange:function(v){ setAttr({featureSize:v}); } }),
                    el(RangeControl, { label:__('Feature weight','blockenberg'), value:a.featureFontWeight, min:300, max:900, step:100, onChange:function(v){ setAttr({featureFontWeight:v}); } })
                ),

                /* Spacing */
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'), value:a.paddingTop, min:0, max:160, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:160, onChange:function(v){ setAttr({paddingBottom:v}); } }),
                    el(RangeControl, { label:__('Header gap (px)','blockenberg'), value:a.headerGap, min:0, max:80, onChange:function(v){ setAttr({headerGap:v}); } })
                ),

                /* Colors */
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Section bg','blockenberg'),     value:a.sectionBg,         onChange:function(v){ setAttr({sectionBg:v||''}); }},
                    {label:__('Card bg','blockenberg'),        value:a.cardBg,             onChange:function(v){ setAttr({cardBg:v||''}); }},
                    {label:__('Card border','blockenberg'),    value:a.cardBorderColor,    onChange:function(v){ setAttr({cardBorderColor:v||''}); }},
                    {label:__('Icon bg','blockenberg'),        value:a.iconBg,             onChange:function(v){ setAttr({iconBg:v||''}); }},
                    {label:__('Icon color','blockenberg'),     value:a.iconColor,          onChange:function(v){ setAttr({iconColor:v||''}); }},
                    {label:__('Title color','blockenberg'),    value:a.titleColor,         onChange:function(v){ setAttr({titleColor:v||''}); }},
                    {label:__('Description color','blockenberg'), value:a.descColor,       onChange:function(v){ setAttr({descColor:v||''}); }},
                    {label:__('Feature text','blockenberg'),   value:a.featureColor,       onChange:function(v){ setAttr({featureColor:v||''}); }},
                    {label:__('Feature check','blockenberg'),  value:a.featureCheckColor,  onChange:function(v){ setAttr({featureCheckColor:v||''}); }},
                    {label:__('CTA color','blockenberg'),      value:a.ctaColor,           onChange:function(v){ setAttr({ctaColor:v||''}); }},
                    {label:__('Eyebrow bg','blockenberg'),     value:a.eyebrowBg,          onChange:function(v){ setAttr({eyebrowBg:v||''}); }},
                    {label:__('Eyebrow text','blockenberg'),   value:a.eyebrowColor,       onChange:function(v){ setAttr({eyebrowColor:v||''}); }},
                    {label:__('Section title','blockenberg'),  value:a.sectionTitleColor,  onChange:function(v){ setAttr({sectionTitleColor:v||''}); }},
                    {label:__('Section subtitle','blockenberg'), value:a.sectionSubColor,  onChange:function(v){ setAttr({sectionSubColor:v||''}); }},
                ] })
            );

            /* Section header preview */
            var headerEl = a.showSectionHeader ? el('div', { className:'bkbg-sshw-header', style:{ textAlign:a.headerAlign, marginBottom:a.headerGap+'px' } },
                a.showEyebrow ? el('div', { className:'bkbg-sshw-eyebrow' }, a.eyebrowLabel) : null,
                el(RichText, { tagName:'h2', className:'bkbg-sshw-section-title', value:a.sectionTitle, onChange:function(v){ setAttr({sectionTitle:v}); }, placeholder:__('Section title…','blockenberg') }),
                el(RichText, { tagName:'p', className:'bkbg-sshw-section-sub', value:a.sectionSubtitle, onChange:function(v){ setAttr({sectionSubtitle:v}); }, placeholder:__('Subtitle…','blockenberg') })
            ) : null;

            /* Grid of cards */
            var grid = el('div', { className:'bkbg-sshw-grid' },
                services.map(function(svc, idx) {
                    return el(ServiceCard, { key:svc.id, svc:svc, a:a, idx:idx, total:services.length });
                })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps, headerEl, grid)
            );
        },

        save: function (props) {
            var a = props.attributes;
            var _tv = window.bkbgTypoCssVars || function () { return {}; };
            var s = buildWrapStyle(a);
            Object.assign(s, _tv(a.sectionTitleTypo, '--bkshw-stt-'));
            Object.assign(s, _tv(a.cardTitleTypo, '--bkshw-ctt-'));
            Object.assign(s, _tv(a.cardDescTypo, '--bkshw-cdt-'));
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-sshw-wrap bkbg-sshw-style--' + a.cardStyle,
                style: s
            });

            var headerEl = a.showSectionHeader ? el('div', { className:'bkbg-sshw-header', style:{ textAlign:a.headerAlign, marginBottom:a.headerGap+'px' } },
                a.showEyebrow ? el('span', { className:'bkbg-sshw-eyebrow' }, a.eyebrowLabel) : null,
                el(RichText.Content, { tagName:'h2', className:'bkbg-sshw-section-title', value:a.sectionTitle }),
                el(RichText.Content, { tagName:'p', className:'bkbg-sshw-section-sub', value:a.sectionSubtitle })
            ) : null;

            var grid = el('div', { className:'bkbg-sshw-grid' },
                a.services.map(function(svc) {
                    var badge = a.showBadges && svc.showBadge && svc.badgeLabel
                        ? el('span', { className:'bkbg-sshw-badge' }, svc.badgeLabel)
                        : null;

                    var iconEl = a.showImages && svc.imageUrl
                        ? el('div', { className:'bkbg-sshw-card-image' }, el('img', { src:svc.imageUrl, alt:svc.title, loading:'lazy' }))
                        : el('div', { className:'bkbg-sshw-icon-wrap', style:{ background:svc.accentColor+'22' } },
                            el('span', { className:'bkbg-sshw-icon', style:{ color:svc.accentColor } }, (svc.iconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(svc.iconType, svc.icon, svc.iconDashicon, svc.iconImageUrl, svc.iconDashiconColor) : svc.icon)
                          );

                    var featureList = a.showFeatures && svc.features && svc.features.length > 0
                        ? el('ul', { className:'bkbg-sshw-features' },
                            svc.features.map(function(f, fi) {
                                return el('li', { key:fi, className:'bkbg-sshw-feature-item' },
                                    el('span', { className:'bkbg-sshw-feat-check', style:{ color:svc.accentColor } }, (a.featureIconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(a.featureIconType, a.featureIcon, a.featureIconDashicon, a.featureIconImageUrl, a.featureIconDashiconColor) : a.featureIcon),
                                    f
                                );
                            })
                          )
                        : null;

                    var ctaEl = a.showCta && svc.ctaLabel
                        ? el('a', { href:svc.ctaUrl||'#', className:'bkbg-sshw-cta bkbg-sshw-cta--'+a.ctaStyle, style:{ color:svc.accentColor } },
                            svc.ctaLabel,
                            a.ctaStyle==='link-arrow' ? el('span', { className:'bkbg-sshw-cta-arrow' }, ' →') : null
                          )
                        : null;

                    return el('div', { key:svc.id, className:'bkbg-sshw-card bkbg-sshw-card--'+a.cardStyle },
                        a.cardStyle==='accent-top' ? el('div', { className:'bkbg-sshw-accent-bar', style:{ background:svc.accentColor } }) : null,
                        badge,
                        iconEl,
                        el('h3', { className:'bkbg-sshw-card-title' }, svc.title),
                        el('p',  { className:'bkbg-sshw-card-desc' },  svc.description),
                        featureList,
                        ctaEl
                    );
                })
            );

            return el('div', blockProps, headerEl, grid);
        },

        deprecated: [{
            attributes: Object.assign({},
                {
                    titleSize: { type: 'number', default: 21 },
                    descSize: { type: 'number', default: 15 },
                    featureSize: { type: 'number', default: 14 },
                    titleFontWeight: { type: 'number', default: 500 },
                    featureFontWeight: { type: 'number', default: 600 }
                }
            ),
            save: function (props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save({
                    className: 'bkbg-sshw-wrap bkbg-sshw-style--' + a.cardStyle,
                    style: buildWrapStyle(a)
                });

                var headerEl = a.showSectionHeader ? el('div', { className:'bkbg-sshw-header', style:{ textAlign:a.headerAlign, marginBottom:a.headerGap+'px' } },
                    a.showEyebrow ? el('span', { className:'bkbg-sshw-eyebrow' }, a.eyebrowLabel) : null,
                    el(RichText.Content, { tagName:'h2', className:'bkbg-sshw-section-title', value:a.sectionTitle }),
                    el(RichText.Content, { tagName:'p', className:'bkbg-sshw-section-sub', value:a.sectionSubtitle })
                ) : null;

                var grid = el('div', { className:'bkbg-sshw-grid' },
                    (a.services || []).map(function(svc) {
                        var badge = a.showBadges && svc.showBadge && svc.badgeLabel
                            ? el('span', { className:'bkbg-sshw-badge' }, svc.badgeLabel)
                            : null;

                        var iconEl = a.showImages && svc.imageUrl
                            ? el('div', { className:'bkbg-sshw-card-image' }, el('img', { src:svc.imageUrl, alt:svc.title, loading:'lazy' }))
                            : el('div', { className:'bkbg-sshw-icon-wrap', style:{ background:svc.accentColor+'22' } },
                                el('span', { className:'bkbg-sshw-icon', style:{ color:svc.accentColor } }, svc.icon)
                              );

                        var featureList = a.showFeatures && svc.features && svc.features.length > 0
                            ? el('ul', { className:'bkbg-sshw-features' },
                                svc.features.map(function(f, fi) {
                                    return el('li', { key:fi, className:'bkbg-sshw-feature-item' },
                                        el('span', { className:'bkbg-sshw-feat-check', style:{ color:svc.accentColor } }, (a.featureIconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(a.featureIconType, a.featureIcon, a.featureIconDashicon, a.featureIconImageUrl, a.featureIconDashiconColor) : a.featureIcon),
                                        f
                                    );
                                })
                              )
                            : null;

                        var ctaEl = a.showCta && svc.ctaLabel
                            ? el('a', { href:svc.ctaUrl||'#', className:'bkbg-sshw-cta bkbg-sshw-cta--'+a.ctaStyle, style:{ color:svc.accentColor } },
                                svc.ctaLabel,
                                a.ctaStyle==='link-arrow' ? el('span', { className:'bkbg-sshw-cta-arrow' }, ' \u2192') : null
                              )
                            : null;

                        return el('div', { key:svc.id, className:'bkbg-sshw-card bkbg-sshw-card--'+a.cardStyle },
                            a.cardStyle==='accent-top' ? el('div', { className:'bkbg-sshw-accent-bar', style:{ background:svc.accentColor } }) : null,
                            badge,
                            iconEl,
                            el('h3', { className:'bkbg-sshw-card-title' }, svc.title),
                            el('p',  { className:'bkbg-sshw-card-desc' },  svc.description),
                            featureList,
                            ctaEl
                        );
                    })
                );

                return el('div', blockProps, headerEl, grid);
            }
        }]
    });
}() );
