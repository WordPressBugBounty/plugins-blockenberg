/* ====================================================
   Page Header Block — editor (index.js)
   Block: blockenberg/page-header
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function buildStyle(a) {
        var bg = '';
        if (a.bgType === 'gradient') bg = a.bgGradient;
        else if (a.bgType === 'image' && a.bgImageUrl) bg = 'url(' + a.bgImageUrl + ') center/cover no-repeat';
        else bg = a.bgColor;
        return {
            '--bkbg-pghd-pt':          a.paddingTop + 'px',
            '--bkbg-pghd-pb':          a.paddingBottom + 'px',
            '--bkbg-pghd-mw':          a.contentMaxWidth + 'px',
            '--bkbg-pghd-h-sz':        a.headlineSize + 'px',
            '--bkbg-pghd-sub-sz':      a.subtitleSize + 'px',
            '--bkbg-pghd-ey-sz':       a.eyebrowSize + 'px',
            '--bkbg-pghd-btn-r':       a.btnRadius + 'px',
            '--bkbg-pghd-eyebrow-bg':  a.eyebrowBg,
            '--bkbg-pghd-eyebrow-c':   a.eyebrowColor,
            '--bkbg-pghd-h-c':         a.headlineColor,
            '--bkbg-pghd-sub-c':       a.subtitleColor,
            '--bkbg-pghd-pbtn-bg':     a.primaryBtnBg,
            '--bkbg-pghd-pbtn-c':      a.primaryBtnColor,
            '--bkbg-pghd-sbtn-c':      a.secBtnColor,
            '--bkbg-pghd-bc-c':        a.breadcrumbColor,
            background: bg || undefined,
        };
    }

    function buildOverlayStyle(a) {
        if (a.bgType !== 'image' || !a.bgImageUrl) return { display: 'none' };
        return { background: a.bgOverlayColor, opacity: a.bgOverlayOpacity / 100 };
    }

    registerBlockType('blockenberg/page-header', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;

            var blockProps = useBlockProps((function () {
                var tv = getTypoCssVars();
                var bg = '';
                if (a.bgType === 'gradient') bg = a.bgGradient;
                else if (a.bgType === 'image' && a.bgImageUrl) bg = 'url(' + a.bgImageUrl + ') center/cover no-repeat';
                else bg = a.bgColor;
                var s = {
                    '--bkbg-pghd-pt':          a.paddingTop + 'px',
                    '--bkbg-pghd-pb':          a.paddingBottom + 'px',
                    '--bkbg-pghd-mw':          a.contentMaxWidth + 'px',
                    '--bkbg-pghd-btn-r':       a.btnRadius + 'px',
                    '--bkbg-pghd-eyebrow-bg':  a.eyebrowBg,
                    '--bkbg-pghd-eyebrow-c':   a.eyebrowColor,
                    '--bkbg-pghd-h-c':         a.headlineColor,
                    '--bkbg-pghd-sub-c':       a.subtitleColor,
                    '--bkbg-pghd-pbtn-bg':     a.primaryBtnBg,
                    '--bkbg-pghd-pbtn-c':      a.primaryBtnColor,
                    '--bkbg-pghd-sbtn-c':      a.secBtnColor,
                    '--bkbg-pghd-bc-c':        a.breadcrumbColor,
                    background: bg || undefined,
                };
                Object.assign(s, tv(a.headlineTypo, '--bkbg-pghd-hl-'));
                Object.assign(s, tv(a.subtitleTypo, '--bkbg-pghd-st-'));
                Object.assign(s, tv(a.eyebrowTypo,  '--bkbg-pghd-eb-'));
                return { className: 'bkbg-pghd-wrap bkbg-pghd-style--' + a.style, style: s };
            })());

            var inspector = el(InspectorControls, null,
                /* Style */
                el(PanelBody, { title: __('Style & Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, { label: __('Style', 'blockenberg'), value: a.style, options: [
                        { label: 'Centered',       value: 'centered' },
                        { label: 'Left-aligned',   value: 'left' },
                        { label: 'Split (text+bg)',value: 'split' },
                        { label: 'Minimal',        value: 'minimal' },
                        { label: 'Dark hero',      value: 'dark' },
                    ], onChange: function(v){ setAttr({style:v}); } }),
                    el(SelectControl, { label: __('Background type', 'blockenberg'), value: a.bgType, options: [
                        { label: 'Solid color',  value: 'color' },
                        { label: 'Gradient',     value: 'gradient' },
                        { label: 'Image',        value: 'image' },
                    ], onChange: function(v){ setAttr({bgType:v}); } }),
                    a.bgType === 'image' ? el(Fragment, null,
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function(m){ setAttr({bgImageUrl:m.url,bgImageId:m.id}); },
                                allowedTypes: ['image'], value: a.bgImageId,
                                render: function(o){ return el(Button, { onClick:o.open, variant:'secondary', isSmall:true }, a.bgImageUrl ? __('Change image','blockenberg') : __('Upload bg image','blockenberg')); }
                            })
                        ),
                        el(RangeControl, { label: __('Overlay opacity (%)', 'blockenberg'), value: a.bgOverlayOpacity, min: 0, max: 100, onChange: function(v){ setAttr({bgOverlayOpacity:v}); } })
                    ) : null,
                    el(SelectControl, { label: __('Text alignment', 'blockenberg'), value: a.textAlign, options: [
                        {label:'Left',value:'left'},{label:'Center',value:'center'},{label:'Right',value:'right'}
                    ], onChange: function(v){ setAttr({textAlign:v}); } }),
                    el(RangeControl, { label: __('Content max-width (px)', 'blockenberg'), value: a.contentMaxWidth, min: 400, max: 1400, onChange: function(v){ setAttr({contentMaxWidth:v}); } })
                ),
                /* Content toggles */
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show eyebrow', 'blockenberg'), checked: a.showEyebrow, onChange: function(v){ setAttr({showEyebrow:v}); } }),
                    el(ToggleControl, { label: __('Show subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: function(v){ setAttr({showSubtitle:v}); } }),
                    el(ToggleControl, { label: __('Show breadcrumbs', 'blockenberg'), checked: a.showBreadcrumbs, onChange: function(v){ setAttr({showBreadcrumbs:v}); } }),
                    el(ToggleControl, { label: __('Primary button', 'blockenberg'), checked: a.showPrimaryBtn, onChange: function(v){ setAttr({showPrimaryBtn:v}); } }),
                    a.showPrimaryBtn ? el(Fragment, null,
                        el(TextControl, { label: __('Primary label', 'blockenberg'), value: a.primaryLabel, onChange: function(v){ setAttr({primaryLabel:v}); } }),
                        el(TextControl, { label: __('Primary URL', 'blockenberg'), value: a.primaryUrl, onChange: function(v){ setAttr({primaryUrl:v}); } })
                    ) : null,
                    el(ToggleControl, { label: __('Secondary button', 'blockenberg'), checked: a.showSecondaryBtn, onChange: function(v){ setAttr({showSecondaryBtn:v}); } }),
                    a.showSecondaryBtn ? el(Fragment, null,
                        el(TextControl, { label: __('Secondary label', 'blockenberg'), value: a.secondaryLabel, onChange: function(v){ setAttr({secondaryLabel:v}); } }),
                        el(TextControl, { label: __('Secondary URL', 'blockenberg'), value: a.secondaryUrl, onChange: function(v){ setAttr({secondaryUrl:v}); } })
                    ) : null
                ),
                /* Spacing & Typography */
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(getTypoControl(), { label: __('Headline', 'blockenberg'), value: a.headlineTypo, onChange: function (v) { setAttr({ headlineTypo: v }); } }),
                    el(getTypoControl(), { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo, onChange: function (v) { setAttr({ subtitleTypo: v }); } }),
                    el(getTypoControl(), { label: __('Eyebrow', 'blockenberg'), value: a.eyebrowTypo, onChange: function (v) { setAttr({ eyebrowTypo: v }); } })
                ),
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 240, onChange: function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 240, onChange: function(v){ setAttr({paddingBottom:v}); } }),
                    el(RangeControl, { label: __('Button radius (px)', 'blockenberg'), value: a.btnRadius, min: 0, max: 50, onChange: function(v){ setAttr({btnRadius:v}); } })
                ),
                /* Colors */
                el(PanelColorSettings, { title: __('Colors', 'blockenberg'), initialOpen: false, colorSettings: [
                    {label: __('Background color','blockenberg'), value: a.bgColor, onChange: function(v){ setAttr({bgColor:v||''}); }},
                    {label: __('Overlay color','blockenberg'),    value: a.bgOverlayColor, onChange: function(v){ setAttr({bgOverlayColor:v||''}); }},
                    {label: __('Eyebrow bg','blockenberg'),       value: a.eyebrowBg, onChange: function(v){ setAttr({eyebrowBg:v||''}); }},
                    {label: __('Eyebrow text','blockenberg'),     value: a.eyebrowColor, onChange: function(v){ setAttr({eyebrowColor:v||''}); }},
                    {label: __('Headline','blockenberg'),         value: a.headlineColor, onChange: function(v){ setAttr({headlineColor:v||''}); }},
                    {label: __('Subtitle','blockenberg'),         value: a.subtitleColor, onChange: function(v){ setAttr({subtitleColor:v||''}); }},
                    {label: __('Primary btn bg','blockenberg'),   value: a.primaryBtnBg, onChange: function(v){ setAttr({primaryBtnBg:v||''}); }},
                    {label: __('Primary btn text','blockenberg'), value: a.primaryBtnColor, onChange: function(v){ setAttr({primaryBtnColor:v||''}); }},
                    {label: __('Secondary btn text','blockenberg'),value: a.secBtnColor, onChange: function(v){ setAttr({secBtnColor:v||''}); }},
                    {label: __('Breadcrumb color','blockenberg'), value: a.breadcrumbColor, onChange: function(v){ setAttr({breadcrumbColor:v||''}); }},
                ] })
            );

            /* Breadcrumbs */
            var bcEl = a.showBreadcrumbs ? el('nav', { className: 'bkbg-pghd-breadcrumbs', style: { textAlign: a.textAlign } },
                a.breadcrumbs.map(function(bc, i) {
                    return el('span', { key: i },
                        el('span', { className: 'bkbg-pghd-bc-item' }, bc.label),
                        i < a.breadcrumbs.length - 1 ? el('span', { className: 'bkbg-pghd-bc-sep' }, ' / ') : null
                    );
                })
            ) : null;

            var eyebrowEl = a.showEyebrow ? el('div', { className: 'bkbg-pghd-eyebrow' }, a.eyebrow) : null;

            var buttons = (a.showPrimaryBtn || a.showSecondaryBtn) ? el('div', { className: 'bkbg-pghd-buttons' },
                a.showPrimaryBtn ? el('a', { href: a.primaryUrl, className: 'bkbg-pghd-btn bkbg-pghd-btn--primary', onClick: function(e){ e.preventDefault(); } }, a.primaryLabel) : null,
                a.showSecondaryBtn ? el('a', { href: a.secondaryUrl, className: 'bkbg-pghd-btn bkbg-pghd-btn--secondary', onClick: function(e){ e.preventDefault(); } }, a.secondaryLabel) : null
            ) : null;

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-pghd-overlay', style: buildOverlayStyle(a) }),
                    el('div', { className: 'bkbg-pghd-inner', style: { textAlign: a.textAlign } },
                        bcEl,
                        eyebrowEl,
                        el(RichText, { tagName: 'h1', className: 'bkbg-pghd-headline', value: a.headline, onChange: function(v){ setAttr({headline:v}); }, placeholder: __('Page headline…','blockenberg') }),
                        a.showSubtitle ? el(RichText, { tagName: 'p', className: 'bkbg-pghd-subtitle', value: a.subtitle, onChange: function(v){ setAttr({subtitle:v}); }, placeholder: __('Subtitle…','blockenberg') }) : null,
                        buttons
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-pghd-wrap bkbg-pghd-style--' + a.style,
                style: (function(){
                    var tv = getTypoCssVars();
                    var s = { '--bkbg-pghd-pt': a.paddingTop+'px', '--bkbg-pghd-pb': a.paddingBottom+'px', '--bkbg-pghd-mw': a.contentMaxWidth+'px', '--bkbg-pghd-btn-r': a.btnRadius+'px', '--bkbg-pghd-eyebrow-bg': a.eyebrowBg, '--bkbg-pghd-eyebrow-c': a.eyebrowColor, '--bkbg-pghd-h-c': a.headlineColor, '--bkbg-pghd-sub-c': a.subtitleColor, '--bkbg-pghd-pbtn-bg': a.primaryBtnBg, '--bkbg-pghd-pbtn-c': a.primaryBtnColor, '--bkbg-pghd-sbtn-c': a.secBtnColor, '--bkbg-pghd-bc-c': a.breadcrumbColor };
                    Object.assign(s, tv(a.headlineTypo, '--bkbg-pghd-hl-'));
                    Object.assign(s, tv(a.subtitleTypo, '--bkbg-pghd-st-'));
                    Object.assign(s, tv(a.eyebrowTypo,  '--bkbg-pghd-eb-'));
                    if (a.bgType === 'gradient') s.background = a.bgGradient;
                    else if (a.bgType === 'image' && a.bgImageUrl) s.background = 'url('+a.bgImageUrl+') center/cover no-repeat';
                    else s.background = a.bgColor;
                    return s;
                })()
            });

            return el('div', blockProps,
                (a.bgType === 'image' && a.bgImageUrl) ? el('div', { className: 'bkbg-pghd-overlay', style: { background: a.bgOverlayColor, opacity: a.bgOverlayOpacity/100 } }) : null,
                el('div', { className: 'bkbg-pghd-inner', style: { textAlign: a.textAlign } },
                    a.showBreadcrumbs ? el('nav', { className: 'bkbg-pghd-breadcrumbs', 'aria-label': 'Breadcrumb' },
                        a.breadcrumbs.map(function(bc, i) {
                            return el('span', { key: i },
                                bc.url ? el('a', { href: bc.url, className: 'bkbg-pghd-bc-item' }, bc.label) : el('span', { className: 'bkbg-pghd-bc-item bkbg-pghd-bc-current' }, bc.label),
                                i < a.breadcrumbs.length - 1 ? el('span', { className: 'bkbg-pghd-bc-sep' }, ' / ') : null
                            );
                        })
                    ) : null,
                    a.showEyebrow ? el('div', { className: 'bkbg-pghd-eyebrow' }, a.eyebrow) : null,
                    el(RichText.Content, { tagName: 'h1', className: 'bkbg-pghd-headline', value: a.headline }),
                    a.showSubtitle ? el(RichText.Content, { tagName: 'p', className: 'bkbg-pghd-subtitle', value: a.subtitle }) : null,
                    (a.showPrimaryBtn || a.showSecondaryBtn) ? el('div', { className: 'bkbg-pghd-buttons' },
                        a.showPrimaryBtn ? el('a', { href: a.primaryUrl, className: 'bkbg-pghd-btn bkbg-pghd-btn--primary', target: a.primaryTarget ? '_blank' : undefined, rel: a.primaryTarget ? 'noopener noreferrer' : undefined }, a.primaryLabel) : null,
                        a.showSecondaryBtn ? el('a', { href: a.secondaryUrl, className: 'bkbg-pghd-btn bkbg-pghd-btn--secondary' }, a.secondaryLabel) : null
                    ) : null
                )
            );
        },

        deprecated: [{
            save: function (props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save({
                    className: 'bkbg-pghd-wrap bkbg-pghd-style--' + a.style,
                    style: (function(){
                        var s = { '--bkbg-pghd-pt': a.paddingTop+'px', '--bkbg-pghd-pb': a.paddingBottom+'px', '--bkbg-pghd-mw': a.contentMaxWidth+'px', '--bkbg-pghd-h-sz': a.headlineSize+'px', '--bkbg-pghd-sub-sz': a.subtitleSize+'px', '--bkbg-pghd-ey-sz': a.eyebrowSize+'px', '--bkbg-pghd-btn-r': a.btnRadius+'px', '--bkbg-pghd-eyebrow-bg': a.eyebrowBg, '--bkbg-pghd-eyebrow-c': a.eyebrowColor, '--bkbg-pghd-h-c': a.headlineColor, '--bkbg-pghd-sub-c': a.subtitleColor, '--bkbg-pghd-pbtn-bg': a.primaryBtnBg, '--bkbg-pghd-pbtn-c': a.primaryBtnColor, '--bkbg-pghd-sbtn-c': a.secBtnColor, '--bkbg-pghd-bc-c': a.breadcrumbColor };
                        if (a.bgType === 'gradient') s.background = a.bgGradient;
                        else if (a.bgType === 'image' && a.bgImageUrl) s.background = 'url('+a.bgImageUrl+') center/cover no-repeat';
                        else s.background = a.bgColor;
                        return s;
                    })()
                });
                return el('div', blockProps,
                    (a.bgType === 'image' && a.bgImageUrl) ? el('div', { className: 'bkbg-pghd-overlay', style: { background: a.bgOverlayColor, opacity: a.bgOverlayOpacity/100 } }) : null,
                    el('div', { className: 'bkbg-pghd-inner', style: { textAlign: a.textAlign } },
                        a.showBreadcrumbs ? el('nav', { className: 'bkbg-pghd-breadcrumbs', 'aria-label': 'Breadcrumb' },
                            a.breadcrumbs.map(function(bc, i) {
                                return el('span', { key: i },
                                    bc.url ? el('a', { href: bc.url, className: 'bkbg-pghd-bc-item' }, bc.label) : el('span', { className: 'bkbg-pghd-bc-item bkbg-pghd-bc-current' }, bc.label),
                                    i < a.breadcrumbs.length - 1 ? el('span', { className: 'bkbg-pghd-bc-sep' }, ' / ') : null
                                );
                            })
                        ) : null,
                        a.showEyebrow ? el('div', { className: 'bkbg-pghd-eyebrow' }, a.eyebrow) : null,
                        el(RichText.Content, { tagName: 'h1', className: 'bkbg-pghd-headline', value: a.headline }),
                        a.showSubtitle ? el(RichText.Content, { tagName: 'p', className: 'bkbg-pghd-subtitle', value: a.subtitle }) : null,
                        (a.showPrimaryBtn || a.showSecondaryBtn) ? el('div', { className: 'bkbg-pghd-buttons' },
                            a.showPrimaryBtn ? el('a', { href: a.primaryUrl, className: 'bkbg-pghd-btn bkbg-pghd-btn--primary', target: a.primaryTarget ? '_blank' : undefined, rel: a.primaryTarget ? 'noopener noreferrer' : undefined }, a.primaryLabel) : null,
                            a.showSecondaryBtn ? el('a', { href: a.secondaryUrl, className: 'bkbg-pghd-btn bkbg-pghd-btn--secondary' }, a.secondaryLabel) : null
                        ) : null
                    )
                );
            }
        }]
}() );
