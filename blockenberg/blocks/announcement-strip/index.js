/* ====================================================
   Announcement Strip — editor (index.js)
   Block: blockenberg/announcement-strip
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
    var ColorPicker        = wp.components.ColorPicker;
    var Popover            = wp.components.Popover;
    var Button             = wp.components.Button;
    var GradientPicker     = wp.components.__experimentalGradientPicker;
    var __                 = wp.i18n.__;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    /* Preset backgrounds */
    var PRESETS = {
        gradient: 'linear-gradient(90deg,#6c3fb5 0%,#2563eb 100%)',
        dark:     '#0f172a',
        promo:    '#6c3fb5',
        info:     '#0ea5e9',
        warning:  '#f59e0b',
        success:  '#059669',
    };

    function getBg(a) {
        if (a.style === 'gradient') return a.bgGradient || PRESETS.gradient;
        if (a.style === 'custom')   return a.bgColor;
        return PRESETS[a.style] || PRESETS.promo;
    }

    function wrapStyle(a) {
        var _tv = getTypoCssVars();
        var s = {
            '--bkbg-anst-text-c':  a.textColor,
            '--bkbg-anst-link-c':  a.linkColor,
            '--bkbg-anst-py':      a.paddingY + 'px',
            '--bkbg-anst-fs':      a.fontSize + 'px',
            '--bkbg-anst-badge-bg':a.badgeBg,
            '--bkbg-anst-badge-c': a.badgeColor,
            background:            getBg(a),
        };
        Object.assign(s, _tv(a.textTypo || {}, '--bkbg-anst-'));
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

    registerBlockType('blockenberg/announcement-strip', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;

            var blockProps = useBlockProps({
                className: 'bkbg-anst-wrap bkbg-anst-style--' + a.style + ' bkbg-anst-align--' + a.textAlign,
                style: wrapStyle(a)
            });

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Content','blockenberg'), initialOpen: true },
                    el(ToggleControl, { label:__('Show badge','blockenberg'),    checked:a.showBadge,   onChange:function(v){ setAttr({showBadge:v}); } }),
                    el(TextControl,   { label:__('Badge text','blockenberg'),    value:a.badgeText,     onChange:function(v){ setAttr({badgeText:v}); } }),
                    el(ToggleControl, { label:__('Show link','blockenberg'),     checked:a.showLink,    onChange:function(v){ setAttr({showLink:v}); } }),
                    el(TextControl,   { label:__('Link label','blockenberg'),    value:a.linkLabel,     onChange:function(v){ setAttr({linkLabel:v}); } }),
                    el(TextControl,   { label:__('Link URL','blockenberg'),      value:a.linkUrl,       onChange:function(v){ setAttr({linkUrl:v}); } }),
                    el(SelectControl, { label:__('Link target','blockenberg'),   value:a.linkTarget,    options:[{label:'Same tab',value:'_self'},{label:'New tab',value:'_blank'}], onChange:function(v){ setAttr({linkTarget:v}); } }),
                    el(ToggleControl, { label:__('Show close button','blockenberg'), checked:a.showClose, onChange:function(v){ setAttr({showClose:v}); } }),
                    el(TextControl,   { label:__('Close ID (unique per bar)','blockenberg'), value:a.closeId, onChange:function(v){ setAttr({closeId:v}); } }),
                    el(RangeControl,  { label:__('Remember close (days)','blockenberg'), value:a.closeDays, min:0, max:365, onChange:function(v){ setAttr({closeDays:v}); } })
                ),
                el(PanelBody, { title: __('Countdown'), initialOpen: false },
                    el(ToggleControl, { label:__('Show countdown','blockenberg'), checked:a.showCountdown, onChange:function(v){ setAttr({showCountdown:v}); } }),
                    el(TextControl,   { label:__('End date (YYYY-MM-DD HH:MM)','blockenberg'), value:a.countdownDate, onChange:function(v){ setAttr({countdownDate:v}); }, help:__('e.g. 2026-12-31 23:59','blockenberg') })
                ),
                el(PanelBody, { title: __('Style','blockenberg'), initialOpen: false },
                    el(SelectControl, { label:__('Preset style','blockenberg'), value:a.style, options:[
                        {label:'Gradient (purple→blue)',  value:'gradient'},
                        {label:'Purple',                  value:'promo'},
                        {label:'Dark',                    value:'dark'},
                        {label:'Info (blue)',              value:'info'},
                        {label:'Warning (amber)',          value:'warning'},
                        {label:'Success (green)',          value:'success'},
                        {label:'Custom color',            value:'custom'},
                    ], onChange:function(v){ setAttr({style:v}); } }),
                    a.style === 'gradient' ? el('div', { style:{ marginBottom:'12px' } },
                        el('p', { style:{ fontSize:'11px', fontWeight:600, margin:'0 0 6px', textTransform:'uppercase', color:'#757575' } }, __('Custom gradient','blockenberg')),
                        el(GradientPicker, { value: a.bgGradient, onChange:function(v){ setAttr({bgGradient:v}); } })
                    ) : null,
                    a.style === 'custom'   ? el(BkbgColorSwatch, { label:__('Background color','blockenberg'), value:a.bgColor, onChange:function(v){ setAttr({bgColor:v}); } }) : null,
                    el(SelectControl, { label:__('Text align','blockenberg'), value:a.textAlign, options:[{label:'Center',value:'center'},{label:'Left',value:'left'}], onChange:function(v){ setAttr({textAlign:v}); } }),
                    el(RangeControl,  { label:__('Vertical padding (px)','blockenberg'), value:a.paddingY,  min:4, max:32, onChange:function(v){ setAttr({paddingY:v}); } }),
                    ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: __('Text Typography', 'blockenberg'), value: a.textTypo || {}, onChange: function (v) { setAttr({ textTypo: v }); } })
                ),
el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Text color','blockenberg'),  value:a.textColor,  onChange:function(v){ setAttr({textColor:v||''}); }},
                    {label:__('Link color','blockenberg'),  value:a.linkColor,  onChange:function(v){ setAttr({linkColor:v||''}); }},
                    {label:__('Badge bg','blockenberg'),    value:a.badgeBg,    onChange:function(v){ setAttr({badgeBg:v||''}); }},
                    {label:__('Badge text','blockenberg'),  value:a.badgeColor, onChange:function(v){ setAttr({badgeColor:v||''}); }},
                ] })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el('div', { className:'bkbg-anst-inner' },
                        a.showBadge ? el('span', { className:'bkbg-anst-badge' }, a.badgeText) : null,
                        el(RichText, {
                            tagName: 'span',
                            className: 'bkbg-anst-text',
                            value: a.text,
                            onChange: function(v){ setAttr({text:v}); },
                            placeholder: __('Announcement message…','blockenberg'),
                            allowedFormats: ['core/bold','core/italic'],
                        }),
                        a.showLink ? el('a', { href:'#', className:'bkbg-anst-link', onClick:function(e){ e.preventDefault(); } }, a.linkLabel) : null,
                        a.showCountdown ? el('span', { className:'bkbg-anst-countdown', 'data-countdown':a.countdownDate }, el('span', { className:'bkbg-anst-cd-timer' }, '0d 00:00:00')) : null
                    ),
                    a.showClose ? el('button', { className:'bkbg-anst-close', type:'button', 'aria-label':__('Close','blockenberg'), disabled:true }, '×') : null
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-anst-wrap bkbg-anst-style--' + a.style + ' bkbg-anst-align--' + a.textAlign,
                style: wrapStyle(a),
                'data-close-id':   a.showClose   ? a.closeId    : undefined,
                'data-close-days': a.showClose   ? a.closeDays  : undefined,
            });
            return el('div', blockProps,
                el('div', { className:'bkbg-anst-inner' },
                    a.showBadge ? el('span', { className:'bkbg-anst-badge' }, a.badgeText) : null,
                    el(RichText.Content, { tagName:'span', className:'bkbg-anst-text', value:a.text }),
                    a.showLink ? el('a', { href:a.linkUrl, className:'bkbg-anst-link', target:a.linkTarget, rel:a.linkTarget==='_blank'?'noopener noreferrer':undefined }, a.linkLabel) : null,
                    a.showCountdown ? el('span', { className:'bkbg-anst-countdown', 'data-countdown':a.countdownDate }, el('span', { className:'bkbg-anst-cd-timer' }, '…')) : null
                ),
                a.showClose ? el('button', { className:'bkbg-anst-close', type:'button', 'aria-label':'Close' }, '×') : null
            );
        }
    });
}() );
