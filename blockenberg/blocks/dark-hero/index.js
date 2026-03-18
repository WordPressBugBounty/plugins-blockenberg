/* ====================================================
   Dark Hero — editor (index.js)
   Block: blockenberg/dark-hero
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
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
    var ColorPicker        = wp.components.ColorPicker;
    var Popover            = wp.components.Popover;
    var Button             = wp.components.Button;
    var __                 = wp.i18n.__;

    var _dhTC, _dhTV;
    function _tc() { return _dhTC || (_dhTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _dhTV || (_dhTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    function uid() { return Math.random().toString(36).slice(2,9); }

    var BG_PRESETS = {
        'dark-purple': '#0d0a1e',
        'dark-blue':   '#060c1f',
        'dark-gray':   '#0a0a0a',
        'dark-green':  '#060f0d',
        'dark-rose':   '#120810',
        'custom':      null,
    };

    function getBg(a) {
        return a.bgStyle === 'custom' ? (a.customBg || '#0a0a0f') : (BG_PRESETS[a.bgStyle] || '#0d0a1e');
    }

    function headlineStyle(a) {
        if (a.headlineStyle === 'gradient') {
            return {
                backgroundImage: 'linear-gradient(' + a.gradientAngle + 'deg,' + a.gradientFrom + ',' + a.gradientTo + ')',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                display: 'inline-block',
            };
        }
        if (a.headlineStyle === 'white') return { color: '#ffffff' };
        return { color: a.gradientFrom };
    }

    function wrapStyle(a) {
        var s = {
            background: getBg(a),
            '--bkbg-dh-pt':       a.paddingTop  + 'px',
            '--bkbg-dh-pb':       a.paddingBottom + 'px',
            '--bkbg-dh-mh':       a.minHeight + 'px',
            '--bkbg-dh-mw':       a.contentMaxWidth + 'px',
            '--bkbg-dh-sub-c':    a.subtitleColor,
            '--bkbg-dh-primary-bg': a.primaryBg,
            '--bkbg-dh-primary-c':  a.primaryColor,
            '--bkbg-dh-glow-c':   a.glowColor,
            '--bkbg-dh-glow-sz':  a.glowSize + 'px',
            '--bkbg-dh-r':        a.btnRadius + 'px',
            '--bkbg-dh-stats-c':  a.statsColor,
            /* legacy fallback vars */
            '--bkbg-dh-hl-sz':    a.headingSize + 'px',
            '--bkbg-dh-sub-sz':   a.subtitleSize + 'px',
        };
        Object.assign(s, _tv(a.typoHeading  || {}, '--bkbg-dh-hdg-'));
        Object.assign(s, _tv(a.typoSubtitle || {}, '--bkbg-dh-sub2-'));
        return s;
    }

    /* ── colour-swatch + popover ─────────────────────────────── */
    function BkbgColorSwatch(p) {
        var st  = useState(false);
        var open = st[0], setOpen = st[1];
        return el('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 0', gap:'8px' } },
            el('span', { style:{ fontSize:'12px', color:'#1e1e1e', flex:1, lineHeight:1.4 } }, p.label),
            el('div', { style:{ position:'relative', flexShrink:0 } },
                el('button', {
                    type:'button', title: p.value || 'none',
                    onClick: function(){ setOpen(!open); },
                    style:{ width:'28px', height:'28px', borderRadius:'4px',
                        border: open ? '2px solid #007cba' : '2px solid #ddd',
                        cursor:'pointer', padding:0, display:'block',
                        background: p.value || '#ffffff', flexShrink:0 }
                }),
                open && el(Popover, { position:'bottom left', onClose:function(){ setOpen(false); } },
                    el('div', { style:{ padding:'8px' }, onMouseDown:function(e){ e.stopPropagation(); } },
                        el('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' } },
                            el('strong', { style:{ fontSize:'12px' } }, p.label),
                            el(Button, { icon:'no-alt', isSmall:true, onClick:function(){ setOpen(false); } })
                        ),
                        el(ColorPicker, { color: p.value, enableAlpha:true, onChange: p.onChange })
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/dark-hero', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;

            function updateStat(idx, patch) {
                var arr = a.stats.map(function(s,i){ return i===idx ? Object.assign({},s,patch) : s; });
                setAttr({ stats: arr });
            }
            function deleteStat(idx) { setAttr({ stats: a.stats.filter(function(_,i){ return i!==idx; }) }); }
            function addStat() { setAttr({ stats: a.stats.concat([{id:uid(), value:'0', label:'Label'}]) }); }

            var blockProps = useBlockProps({
                className: 'bkbg-dh-wrap bkbg-dh-align--' + a.textAlign,
                style: wrapStyle(a)
            });

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title:__('Content','blockenberg'), initialOpen:true },
                    el(ToggleControl, { label:__('Show badge','blockenberg'),       checked:a.showBadge,    onChange:function(v){ setAttr({showBadge:v}); } }),
                    el(TextControl,   { label:__('Badge text','blockenberg'),        value:a.badgeText,      onChange:function(v){ setAttr({badgeText:v}); } }),
                    el(SelectControl, { label:__('Badge style','blockenberg'), value:a.badgeStyle, options:[{label:'Glow pill',value:'glow'},{label:'Border pill',value:'border'},{label:'Subtle',value:'subtle'}], onChange:function(v){ setAttr({badgeStyle:v}); } }),
                    el(ToggleControl, { label:__('Show subtitle','blockenberg'),    checked:a.showSubtitle, onChange:function(v){ setAttr({showSubtitle:v}); } }),
                    el(TextControl,   { label:__('Primary button','blockenberg'),   value:a.primaryLabel,   onChange:function(v){ setAttr({primaryLabel:v}); } }),
                    el(TextControl,   { label:__('Primary URL','blockenberg'),      value:a.primaryUrl,     onChange:function(v){ setAttr({primaryUrl:v}); } }),
                    el(ToggleControl, { label:__('Show secondary button','blockenberg'), checked:a.showSecondary, onChange:function(v){ setAttr({showSecondary:v}); } }),
                    el(TextControl,   { label:__('Secondary button','blockenberg'), value:a.secondaryLabel, onChange:function(v){ setAttr({secondaryLabel:v}); } }),
                    el(TextControl,   { label:__('Secondary URL','blockenberg'),    value:a.secondaryUrl,   onChange:function(v){ setAttr({secondaryUrl:v}); } })
                ),
                el(PanelBody, { title:__('Stats','blockenberg'), initialOpen:false },
                    el(ToggleControl, { label:__('Show stats row','blockenberg'), checked:a.showStats, onChange:function(v){ setAttr({showStats:v}); } }),
                    a.stats.map(function(s, i) {
                        return el('div', { key:s.id, style:{ display:'flex', gap:6, marginBottom:8 } },
                            el(TextControl, { value:s.value, onChange:function(v){ updateStat(i,{value:v}); }, placeholder:'Value' }),
                            el(TextControl, { value:s.label, onChange:function(v){ updateStat(i,{label:v}); }, placeholder:'Label' }),
                            el(Button, { isSmall:true, isDestructive:true, onClick:function(){ deleteStat(i); } }, '✕')
                        );
                    }),
                    el(Button, { isSmall:true, variant:'tertiary', onClick:addStat, style:{marginTop:4} }, __('+ Add stat','blockenberg'))
                ),
                el(PanelBody, { title:__('Background & Effects','blockenberg'), initialOpen:false },
                    el(SelectControl, { label:__('Background preset','blockenberg'), value:a.bgStyle, options:[
                        {label:'Dark purple',value:'dark-purple'},
                        {label:'Dark blue',  value:'dark-blue'},
                        {label:'Dark gray',  value:'dark-gray'},
                        {label:'Dark green', value:'dark-green'},
                        {label:'Dark rose',  value:'dark-rose'},
                        {label:'Custom',     value:'custom'},
                    ], onChange:function(v){ setAttr({bgStyle:v}); } }),
                    a.bgStyle === 'custom' ? el(BkbgColorSwatch, { label:__('Custom background color','blockenberg'), value:a.customBg, onChange:function(v){ setAttr({customBg:v}); } }) : null,
                    el(ToggleControl, { label:__('Radial glow','blockenberg'),   checked:a.showGlow,  onChange:function(v){ setAttr({showGlow:v}); } }),
                    el(ToggleControl, { label:__('Grid lines','blockenberg'),    checked:a.showGrid,  onChange:function(v){ setAttr({showGrid:v}); } }),
                    el(ToggleControl, { label:__('Noise texture','blockenberg'), checked:a.showNoise, onChange:function(v){ setAttr({showNoise:v}); } }),
                    el(RangeControl, { label:__('Glow size (px)','blockenberg'), value:a.glowSize, min:100, max:1200, onChange:function(v){ setAttr({glowSize:v}); } })
                ),
                el(PanelBody, { title:__('Headline style','blockenberg'), initialOpen:false },
                    el(SelectControl, { label:__('Style','blockenberg'), value:a.headlineStyle, options:[{label:'Gradient text',value:'gradient'},{label:'White',value:'white'},{label:'Custom color',value:'custom'}], onChange:function(v){ setAttr({headlineStyle:v}); } }),
                    el(BkbgColorSwatch, { label:__('Gradient from','blockenberg'), value:a.gradientFrom, onChange:function(v){ setAttr({gradientFrom:v}); } }),
                    el(BkbgColorSwatch, { label:__('Gradient to','blockenberg'),   value:a.gradientTo,   onChange:function(v){ setAttr({gradientTo:v}); } }),
                    el(RangeControl, { label:__('Gradient angle','blockenberg'), value:a.gradientAngle, min:0, max:360, onChange:function(v){ setAttr({gradientAngle:v}); } }),
                    el(SelectControl, { label:__('Text align','blockenberg'), value:a.textAlign, options:[{label:'Center',value:'center'},{label:'Left',value:'left'}], onChange:function(v){ setAttr({textAlign:v}); } })
                ),
                el(PanelBody, { title:__('Typography','blockenberg'), initialOpen:false },
                    _tc() && el(_tc(), { label:__('Heading','blockenberg'),  value:a.typoHeading,  onChange:function(v){ setAttr({typoHeading:v}); } }),
                    _tc() && el(_tc(), { label:__('Subtitle','blockenberg'), value:a.typoSubtitle, onChange:function(v){ setAttr({typoSubtitle:v}); } })
                ),
                el(PanelBody, { title:__('Appearance','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Min height (px)','blockenberg'),    value:a.minHeight,    min:300, max:1000, onChange:function(v){ setAttr({minHeight:v}); } }),
                    el(RangeControl, { label:__('Content max width (px)','blockenberg'), value:a.contentMaxWidth, min:400, max:1100, onChange:function(v){ setAttr({contentMaxWidth:v}); } }),
                    el(RangeControl, { label:__('Button radius (px)','blockenberg'), value:a.btnRadius, min:0, max:50, onChange:function(v){ setAttr({btnRadius:v}); } })
                ),
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'),    value:a.paddingTop,    min:0, max:240, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:240, onChange:function(v){ setAttr({paddingBottom:v}); } })
                ),
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Glow color','blockenberg'),       value:a.glowColor,    onChange:function(v){ setAttr({glowColor:v||''}); }},
                    {label:__('Subtitle','blockenberg'),         value:a.subtitleColor,onChange:function(v){ setAttr({subtitleColor:v||''}); }},
                    {label:__('Primary button bg','blockenberg'),value:a.primaryBg,    onChange:function(v){ setAttr({primaryBg:v||''}); }},
                    {label:__('Primary button text','blockenberg'),value:a.primaryColor,onChange:function(v){ setAttr({primaryColor:v||''}); }},
                    {label:__('Stats text','blockenberg'),       value:a.statsColor,   onChange:function(v){ setAttr({statsColor:v||''}); }},
                ] })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    a.showGlow  ? el('div', { className:'bkbg-dh-glow' })  : null,
                    a.showGrid  ? el('div', { className:'bkbg-dh-grid' })  : null,
                    a.showNoise ? el('div', { className:'bkbg-dh-noise' }) : null,
                    el('div', { className:'bkbg-dh-inner' },
                        a.showBadge ? el('div', { className:'bkbg-dh-badge bkbg-dh-badge--' + a.badgeStyle },
                            el('span', { className:'bkbg-dh-badge-dot' }),
                            a.badgeText
                        ) : null,
                        el(RichText, { tagName:'h1', className:'bkbg-dh-headline', value:a.headline,
                            style: headlineStyle(a),
                            onChange:function(v){ setAttr({headline:v}); },
                            placeholder:__('Your headline…','blockenberg')
                        }),
                        a.showSubtitle ? el(RichText, { tagName:'p', className:'bkbg-dh-subtitle', value:a.subtitle, onChange:function(v){ setAttr({subtitle:v}); }, placeholder:__('Subtitle…','blockenberg') }) : null,
                        el('div', { className:'bkbg-dh-buttons' },
                            el('a', { href:'#', className:'bkbg-dh-btn bkbg-dh-btn--primary', onClick:function(e){ e.preventDefault(); } }, a.primaryLabel),
                            a.showSecondary ? el('a', { href:'#', className:'bkbg-dh-btn bkbg-dh-btn--ghost', onClick:function(e){ e.preventDefault(); } }, a.secondaryLabel, el('span', null,' →')) : null
                        ),
                        a.showStats && a.stats.length ? el('div', { className:'bkbg-dh-stats' },
                            a.stats.map(function(s) {
                                return el('div', { key:s.id, className:'bkbg-dh-stat' },
                                    el('span', { className:'bkbg-dh-stat-value' }, s.value),
                                    el('span', { className:'bkbg-dh-stat-label' }, s.label)
                                );
                            })
                        ) : null
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-dh-wrap bkbg-dh-align--' + a.textAlign,
                style: wrapStyle(a)
            });
            return el('div', blockProps,
                a.showGlow  ? el('div', { className:'bkbg-dh-glow' })  : null,
                a.showGrid  ? el('div', { className:'bkbg-dh-grid' })  : null,
                a.showNoise ? el('div', { className:'bkbg-dh-noise' }) : null,
                el('div', { className:'bkbg-dh-inner' },
                    a.showBadge ? el('div', { className:'bkbg-dh-badge bkbg-dh-badge--' + a.badgeStyle },
                        el('span', { className:'bkbg-dh-badge-dot' }),
                        a.badgeText
                    ) : null,
                    el(RichText.Content, { tagName:'h1', className:'bkbg-dh-headline', value:a.headline,
                        style: {
                            backgroundImage: a.headlineStyle === 'gradient' ? 'linear-gradient(' + a.gradientAngle + 'deg,' + a.gradientFrom + ',' + a.gradientTo + ')' : undefined,
                            WebkitBackgroundClip: a.headlineStyle === 'gradient' ? 'text' : undefined,
                            WebkitTextFillColor:  a.headlineStyle === 'gradient' ? 'transparent' : undefined,
                            backgroundClip:       a.headlineStyle === 'gradient' ? 'text' : undefined,
                            color: a.headlineStyle !== 'gradient' ? (a.headlineStyle === 'white' ? '#fff' : a.gradientFrom) : undefined,
                        }
                    }),
                    a.showSubtitle ? el(RichText.Content, { tagName:'p', className:'bkbg-dh-subtitle', value:a.subtitle }) : null,
                    el('div', { className:'bkbg-dh-buttons' },
                        el('a', { href:a.primaryUrl, className:'bkbg-dh-btn bkbg-dh-btn--primary', target:a.primaryTarget, rel:a.primaryTarget==='_blank'?'noopener noreferrer':undefined }, a.primaryLabel),
                        a.showSecondary ? el('a', { href:a.secondaryUrl, className:'bkbg-dh-btn bkbg-dh-btn--ghost', target:a.secondaryTarget, rel:a.secondaryTarget==='_blank'?'noopener noreferrer':undefined }, a.secondaryLabel, el('span', null,' →')) : null
                    ),
                    a.showStats && a.stats.length ? el('div', { className:'bkbg-dh-stats' },
                        a.stats.map(function(s) {
                            return el('div', { key:s.id, className:'bkbg-dh-stat' },
                                el('span', { className:'bkbg-dh-stat-value' }, s.value),
                                el('span', { className:'bkbg-dh-stat-label' }, s.label)
                            );
                        })
                    ) : null
                )
            );
        }
    });
}() );
