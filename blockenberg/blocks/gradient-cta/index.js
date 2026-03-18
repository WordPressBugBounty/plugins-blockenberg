/* ====================================================
   Gradient CTA — editor (index.js)
   Block: blockenberg/gradient-cta
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
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
    var GradientPicker     = wp.components.__experimentalGradientPicker;
    var __                 = wp.i18n.__;

    /* ── Typography lazy getters ── */
    function _tc() { return window.bkbgTypographyControl || null; }
    function _tv() { return window.bkbgTypoCssVars || function () { return {}; }; }

    var PRESETS = {
        purple:  'linear-gradient(135deg,#6c3fb5 0%,#4f24a0 100%)',
        ocean:   'linear-gradient(135deg,#0ea5e9 0%,#2563eb 100%)',
        sunset:  'linear-gradient(135deg,#f97316 0%,#ec4899 100%)',
        dark:    'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',
        forest:  'linear-gradient(135deg,#059669 0%,#0284c7 100%)',
        rose:    'linear-gradient(135deg,#e11d48 0%,#be123c 100%)',
    };

    function getBg(a) {
        if (a.preset === 'custom') return a.customGradient || PRESETS.purple;
        return PRESETS[a.preset] || PRESETS.purple;
    }

    function wrapStyle(a) {
        return Object.assign({
            '--bkbg-gcta-pt':      a.paddingTop  + 'px',
            '--bkbg-gcta-pb':      a.paddingBottom + 'px',
            '--bkbg-gcta-hl-c':    a.headlineColor,
            '--bkbg-gcta-sub-c':   a.subtitleColor,
            '--bkbg-gcta-badge-bg':a.badgeBg,
            '--bkbg-gcta-badge-c': a.badgeColor,
            '--bkbg-gcta-primary-bg': a.primaryBg,
            '--bkbg-gcta-primary-c':  a.primaryColor,
            '--bkbg-gcta-sec-c':   a.secondaryColor,
            '--bkbg-gcta-r':       a.btnRadius + 'px',
            '--bkbg-gcta-mw':      a.contentMaxWidth + 'px',
            background:            getBg(a),
        }, _tv()(a.typoHeadline,'--bkbg-gcta-hl-'), _tv()(a.typoSubtitle,'--bkbg-gcta-sub-'), _tv()(a.typoBadge,'--bkbg-gcta-bg-'));
    }

    registerBlockType('blockenberg/gradient-cta', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;

            var blockProps = useBlockProps({
                className: 'bkbg-gcta-wrap bkbg-gcta-align--' + a.textAlign,
                style: wrapStyle(a)
            });

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title:__('Content','blockenberg'), initialOpen:true },
                    el(ToggleControl, { label:__('Show badge','blockenberg'),     checked:a.showBadge,    onChange:function(v){ setAttr({showBadge:v}); } }),
                    el(TextControl,   { label:__('Badge text','blockenberg'),      value:a.badge,          onChange:function(v){ setAttr({badge:v}); } }),
                    el(ToggleControl, { label:__('Show subtitle','blockenberg'),  checked:a.showSubtitle, onChange:function(v){ setAttr({showSubtitle:v}); } }),
                    el(TextControl,   { label:__('Primary button label','blockenberg'), value:a.primaryLabel, onChange:function(v){ setAttr({primaryLabel:v}); } }),
                    el(TextControl,   { label:__('Primary button URL','blockenberg'),   value:a.primaryUrl,   onChange:function(v){ setAttr({primaryUrl:v}); } }),
                    el(SelectControl, { label:__('Primary target','blockenberg'), value:a.primaryTarget, options:[{label:'Same tab',value:'_self'},{label:'New tab',value:'_blank'}], onChange:function(v){ setAttr({primaryTarget:v}); } }),
                    el(ToggleControl, { label:__('Show secondary button','blockenberg'), checked:a.showSecondary, onChange:function(v){ setAttr({showSecondary:v}); } }),
                    el(TextControl,   { label:__('Secondary label','blockenberg'), value:a.secondaryLabel, onChange:function(v){ setAttr({secondaryLabel:v}); } }),
                    el(TextControl,   { label:__('Secondary URL','blockenberg'),   value:a.secondaryUrl,   onChange:function(v){ setAttr({secondaryUrl:v}); } }),
                    el(SelectControl, { label:__('Secondary target','blockenberg'), value:a.secondaryTarget, options:[{label:'Same tab',value:'_self'},{label:'New tab',value:'_blank'}], onChange:function(v){ setAttr({secondaryTarget:v}); } })
                ),
                el(PanelBody, { title:__('Style','blockenberg'), initialOpen:false },
                    el(SelectControl, { label:__('Gradient preset','blockenberg'), value:a.preset, options:[
                        {label:'Purple',         value:'purple'},
                        {label:'Ocean (blue)',    value:'ocean'},
                        {label:'Sunset',          value:'sunset'},
                        {label:'Dark',            value:'dark'},
                        {label:'Forest (green)',  value:'forest'},
                        {label:'Rose (red)',      value:'rose'},
                        {label:'Custom CSS',      value:'custom'},
                    ], onChange:function(v){ setAttr({preset:v}); } }),
                    a.preset === 'custom' ? el('div', { style:{ marginBottom:'12px' } },
                        el('p', { style:{ fontSize:'11px', fontWeight:600, margin:'0 0 6px', textTransform:'uppercase', color:'#757575' } }, __('Custom gradient','blockenberg')),
                        el(GradientPicker, { value: a.customGradient, onChange:function(v){ setAttr({customGradient:v}); } })
                    ) : null,
                    el(ToggleControl, { label:__('Show pattern overlay','blockenberg'), checked:a.showPattern, onChange:function(v){ setAttr({showPattern:v}); } }),
                    el(SelectControl, { label:__('Pattern type','blockenberg'), value:a.patternType, options:[{label:'Dots',value:'dots'},{label:'Grid',value:'grid'},{label:'Noise',value:'noise'}], onChange:function(v){ setAttr({patternType:v}); } }),
                    el(SelectControl, { label:__('Text align','blockenberg'), value:a.textAlign, options:[{label:'Center',value:'center'},{label:'Left',value:'left'}], onChange:function(v){ setAttr({textAlign:v}); } }),
                    el(RangeControl, { label:__('Content max width (px)','blockenberg'), value:a.contentMaxWidth, min:400, max:960, onChange:function(v){ setAttr({contentMaxWidth:v}); } })
                ),
                el(PanelBody, { title:__('Typography','blockenberg'), initialOpen:false },
                    _tc() && el(_tc(), { label:__('Headline','blockenberg'), value:a.typoHeadline, onChange:function(v){ setAttr({typoHeadline:v}); } }),
                    _tc() && el(_tc(), { label:__('Subtitle','blockenberg'), value:a.typoSubtitle, onChange:function(v){ setAttr({typoSubtitle:v}); } }),
                    _tc() && el(_tc(), { label:__('Badge','blockenberg'), value:a.typoBadge, onChange:function(v){ setAttr({typoBadge:v}); } })
                ),
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'),    value:a.paddingTop,    min:0, max:200, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:200, onChange:function(v){ setAttr({paddingBottom:v}); } }),
                    el(RangeControl, { label:__('Button radius (px)','blockenberg'),   value:a.btnRadius,    min:0, max:50,  onChange:function(v){ setAttr({btnRadius:v}); } })
                ),
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Headline','blockenberg'),      value:a.headlineColor,  onChange:function(v){ setAttr({headlineColor:v||''}); }},
                    {label:__('Subtitle','blockenberg'),      value:a.subtitleColor,  onChange:function(v){ setAttr({subtitleColor:v||''}); }},
                    {label:__('Badge bg','blockenberg'),      value:a.badgeBg,        onChange:function(v){ setAttr({badgeBg:v||''}); }},
                    {label:__('Badge text','blockenberg'),    value:a.badgeColor,     onChange:function(v){ setAttr({badgeColor:v||''}); }},
                    {label:__('Primary button bg','blockenberg'),   value:a.primaryBg,   onChange:function(v){ setAttr({primaryBg:v||''}); }},
                    {label:__('Primary button text','blockenberg'), value:a.primaryColor, onChange:function(v){ setAttr({primaryColor:v||''}); }},
                    {label:__('Secondary button text','blockenberg'), value:a.secondaryColor, onChange:function(v){ setAttr({secondaryColor:v||''}); }},
                ] })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    a.showPattern ? el('div', { className:'bkbg-gcta-pattern bkbg-gcta-pattern--' + a.patternType }) : null,
                    el('div', { className:'bkbg-gcta-inner' },
                        a.showBadge ? el('span', { className:'bkbg-gcta-badge' }, a.badge) : null,
                        el(RichText, { tagName:'h2', className:'bkbg-gcta-headline', value:a.headline, onChange:function(v){ setAttr({headline:v}); }, placeholder:__('Your headline…','blockenberg') }),
                        a.showSubtitle ? el(RichText, { tagName:'p', className:'bkbg-gcta-subtitle', value:a.subtitle, onChange:function(v){ setAttr({subtitle:v}); }, placeholder:__('Subtitle…','blockenberg') }) : null,
                        el('div', { className:'bkbg-gcta-buttons' },
                            el('a', { href:'#', className:'bkbg-gcta-btn bkbg-gcta-btn--primary', onClick:function(e){ e.preventDefault(); } }, a.primaryLabel),
                            a.showSecondary ? el('a', { href:'#', className:'bkbg-gcta-btn bkbg-gcta-btn--secondary', onClick:function(e){ e.preventDefault(); } }, a.secondaryLabel) : null
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-gcta-wrap bkbg-gcta-align--' + a.textAlign,
                style: Object.assign({
                    '--bkbg-gcta-pt':a.paddingTop+'px','--bkbg-gcta-pb':a.paddingBottom+'px','--bkbg-gcta-hl-c':a.headlineColor,'--bkbg-gcta-sub-c':a.subtitleColor,'--bkbg-gcta-badge-bg':a.badgeBg,'--bkbg-gcta-badge-c':a.badgeColor,'--bkbg-gcta-primary-bg':a.primaryBg,'--bkbg-gcta-primary-c':a.primaryColor,'--bkbg-gcta-sec-c':a.secondaryColor,'--bkbg-gcta-r':a.btnRadius+'px','--bkbg-gcta-mw':a.contentMaxWidth+'px',
                    background: getBg(a),
                }, _tv()(a.typoHeadline,'--bkbg-gcta-hl-'), _tv()(a.typoSubtitle,'--bkbg-gcta-sub-'), _tv()(a.typoBadge,'--bkbg-gcta-bg-'))
            });
            return el('div', blockProps,
                a.showPattern ? el('div', { className:'bkbg-gcta-pattern bkbg-gcta-pattern--' + a.patternType }) : null,
                el('div', { className:'bkbg-gcta-inner' },
                    a.showBadge ? el('span', { className:'bkbg-gcta-badge' }, a.badge) : null,
                    el(RichText.Content, { tagName:'h2', className:'bkbg-gcta-headline', value:a.headline }),
                    a.showSubtitle ? el(RichText.Content, { tagName:'p', className:'bkbg-gcta-subtitle', value:a.subtitle }) : null,
                    el('div', { className:'bkbg-gcta-buttons' },
                        el('a', { href:a.primaryUrl, className:'bkbg-gcta-btn bkbg-gcta-btn--primary', target:a.primaryTarget, rel:a.primaryTarget==='_blank'?'noopener noreferrer':undefined }, a.primaryLabel),
                        a.showSecondary ? el('a', { href:a.secondaryUrl, className:'bkbg-gcta-btn bkbg-gcta-btn--secondary', target:a.secondaryTarget, rel:a.secondaryTarget==='_blank'?'noopener noreferrer':undefined }, a.secondaryLabel) : null
                    )
                )
            );
        }
    });
}() );
