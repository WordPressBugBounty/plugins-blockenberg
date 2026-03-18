( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl   = wp.components.TextControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    function makeId() { return 'ss' + Math.random().toString(36).substr(2,8); }

    /* ── Platform data ─────────────────────────────────────────────── */
    var PLATFORM_COLORS = {
        instagram: '#E1306C',
        youtube:   '#FF0000',
        tiktok:    '#000000',
        linkedin:  '#0A66C2',
        twitter:   '#1DA1F2',
        facebook:  '#1877F2',
        pinterest: '#E60023',
    };

    /* Inline SVG paths for each platform */
    var PLATFORM_ICONS = {
        instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
        youtube:   'M23.494 6.205a3.01 3.01 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.372.524A3.01 3.01 0 00.506 6.205 31.497 31.497 0 000 12a31.495 31.495 0 00.506 5.795 3.01 3.01 0 002.122 2.135C4.495 20.455 12 20.455 12 20.455s7.505 0 9.372-.525a3.01 3.01 0 002.122-2.135A31.495 31.495 0 0024 12a31.497 31.497 0 00-.506-5.795zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
        tiktok:    'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.5a8.15 8.15 0 004.77 1.53V6.54a4.85 4.85 0 01-1-.15z',
        linkedin:  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
        twitter:   'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
        facebook:  'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
        pinterest: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z',
    };

    var PLATFORM_LABELS = {
        instagram: 'Instagram',
        youtube:   'YouTube',
        tiktok:    'TikTok',
        linkedin:  'LinkedIn',
        twitter:   'Twitter / X',
        facebook:  'Facebook',
        pinterest: 'Pinterest',
    };

    var PLATFORM_OPTIONS = Object.keys(PLATFORM_LABELS).map(function(k){ return { label: PLATFORM_LABELS[k], value: k }; });

    var DEFAULT_PLATFORMS = [
        { id:makeId(), platform:'instagram', handle:'@yourbrand', metric1Label:'Followers', metric1Value:'124K', metric2Label:'Posts',     metric2Value:'480', url:'', customColor:'' },
        { id:makeId(), platform:'youtube',   handle:'Your Channel', metric1Label:'Subscribers', metric1Value:'86K',  metric2Label:'Videos',    metric2Value:'220', url:'', customColor:'' },
        { id:makeId(), platform:'linkedin',  handle:'Your Company', metric1Label:'Followers', metric1Value:'12K',  metric2Label:'Employees', metric2Value:'45',  url:'', customColor:'' },
        { id:makeId(), platform:'tiktok',    handle:'@yourbrand', metric1Label:'Followers', metric1Value:'310K', metric2Label:'Likes',      metric2Value:'2.1M',url:'', customColor:'' },
    ];

    /* ── Helpers ────────────────────────────────────────────────────── */
    function buildWrapStyle(a) {
        var s = {
            '--bkbg-ss-accent':       a.accentColor,
            '--bkbg-ss-title-col':    a.titleColor,
            '--bkbg-ss-subtitle-col': a.subtitleColor,
            '--bkbg-ss-card-bg':      a.cardBg,
            '--bkbg-ss-card-border':  a.cardBorder,
            '--bkbg-ss-icon-bg':      a.iconBg,
            '--bkbg-ss-metric-val':   a.metricValueColor,
            '--bkbg-ss-metric-lbl':   a.metricLabelColor,
            '--bkbg-ss-handle-col':   a.handleColor,
            '--bkbg-ss-cols':         String(a.columns),
            '--bkbg-ss-gap':          a.gap + 'px',
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        };
        var tv = getTypoCssVars();
        if (tv) {
            Object.assign(s, tv(a.titleTypo, '--bkss-tt-'));
            Object.assign(s, tv(a.metricTypo, '--bkss-mt-'));
            Object.assign(s, tv(a.labelTypo, '--bkss-lb-'));
        }
        return s;
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key:key, style:{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 0', gap:'8px' } },
            el('span', { style:{ fontSize:'12px', color:'#1e1e1e', flex:1, lineHeight:1.4 } }, label),
            el('div', { style:{ position:'relative', flexShrink:0 } },
                el('button', { type:'button', onClick:function(){ setOpenKey(isOpen ? null : key); }, style:{ width:'28px', height:'28px', borderRadius:'4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor:'pointer', padding:0, background: value||'#ccc' } }),
                isOpen && el(Popover, { position:'bottom left', onClose:function(){ setOpenKey(null); } },
                    el('div', { style:{ padding:'8px' } },
                        el(ColorPicker, { color:value, enableAlpha:true, onChange:onChange })
                    )
                )
            )
        );
    }

    /* ── SVG icon ───────────────────────────────────────────────────── */
    function PlatformIcon(props) {
        var platform = props.platform || 'instagram';
        var size = props.size || 24;
        var color = props.color || '#fff';
        var d = PLATFORM_ICONS[platform] || PLATFORM_ICONS.instagram;
        return el('svg', { xmlns:'http://www.w3.org/2000/svg', width:size, height:size, viewBox:'0 0 24 24', fill:color, style:{ display:'block', flexShrink:0 } },
            el('path', { d: d })
        );
    }

    /* ── Platform card ──────────────────────────────────────────────── */
    function PlatformCard(props) {
        var p = props.platform;
        var a = props.a;
        var platformColor = p.customColor || (a.usePlatformColors ? PLATFORM_COLORS[p.platform] : a.accentColor) || '#6c3fb5';
        var iconBg = a.iconBg || (a.usePlatformColors ? platformColor : a.accentColor) || '#6c3fb5';

        var cardStyle = {
            background: a.cardBg || '#fff',
            border: '1px solid ' + (a.cardBorder || '#e5e7eb'),
            borderRadius: a.cardRadius + 'px',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
        };

        if (a.cardStyle === 'colored') {
            cardStyle.background = a.usePlatformColors ? platformColor : (a.accentColor || '#6c3fb5');
            cardStyle.border = 'none';
        }

        var textColor = a.cardStyle === 'colored' ? '#fff' : undefined;

        return el('div', { style: cardStyle },
            /* Top colour bar */
            a.cardStyle !== 'colored' && el('div', { style:{ position:'absolute', top:0, left:0, right:0, height:'3px', background: platformColor } }),

            /* Icon */
            el('div', { style:{ width: a.iconSize+12+'px', height: a.iconSize+12+'px', borderRadius:'50%', background: a.cardStyle==='colored' ? 'rgba(255,255,255,0.22)' : iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 } },
                el(PlatformIcon, { platform:p.platform, size:a.iconSize, color:'#fff' })
            ),

            /* Platform name */
            el('div', { style:{ fontWeight:700, fontSize:'14px', color: textColor || a.metricLabelColor || '#374151' } }, PLATFORM_LABELS[p.platform]),

            /* Handle */
            a.showHandle && p.handle && el('div', { style:{ fontSize:'12px', color: textColor ? 'rgba(255,255,255,0.75)' : (a.handleColor||'#9ca3af') } }, p.handle),

            /* Metric 1 */
            el('div', { style:{ display:'flex', flexDirection:'column', gap:'2px' } },
                el('div', { className: 'bkbg-ss-metric-value', style:{ color: textColor || platformColor, lineHeight:1 } }, p.metric1Value),
                el('div', { className: 'bkbg-ss-metric-label', style:{ color: textColor ? 'rgba(255,255,255,0.75)' : (a.metricLabelColor||'#6b7280') } }, p.metric1Label)
            ),

            /* Metric 2 */
            a.showSecondMetric && p.metric2Value && el('div', { style:{ display:'flex', flexDirection:'column', gap:'2px' } },
                el('div', { className: 'bkbg-ss-metric-value-2', style:{ color: textColor || (a.metricValueColor||'#374151'), lineHeight:1 } }, p.metric2Value),
                el('div', { className: 'bkbg-ss-metric-label', style:{ color: textColor ? 'rgba(255,255,255,0.75)' : (a.metricLabelColor||'#6b7280') } }, p.metric2Label)
            )
        );
    }

    /* ── Platform inspector row ─────────────────────────────────────── */
    function PlatformEditor(props) {
        var p = props.platform;
        var onChange = props.onChange;
        var onRemove = props.onRemove;
        var openKey = props.openKey;
        var setOpenKey = props.setOpenKey;
        function upd(key, val) { var c=Object.assign({},p); c[key]=val; onChange(c); }

        return el('div', { style:{ background:'#f9f9f9', border:'1px solid #e0e0e0', borderRadius:'8px', padding:'10px 12px', marginBottom:'10px' } },
            el(SelectControl, { label:__('Platform','blockenberg'), value:p.platform, options:PLATFORM_OPTIONS, onChange:function(v){upd('platform',v);} }),
            el(TextControl, { label:__('Handle / channel name','blockenberg'), value:p.handle||'', onChange:function(v){upd('handle',v);} }),
            el(TextControl, { label:__('Primary metric label','blockenberg'), value:p.metric1Label||'', onChange:function(v){upd('metric1Label',v);} }),
            el(TextControl, { label:__('Primary metric value','blockenberg'), value:p.metric1Value||'', onChange:function(v){upd('metric1Value',v);} }),
            el(TextControl, { label:__('Secondary metric label','blockenberg'), value:p.metric2Label||'', onChange:function(v){upd('metric2Label',v);} }),
            el(TextControl, { label:__('Secondary metric value','blockenberg'), value:p.metric2Value||'', onChange:function(v){upd('metric2Value',v);} }),
            el(TextControl, { label:__('Profile URL','blockenberg'), value:p.url||'', onChange:function(v){upd('url',v);} }),
            el('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'4px' } },
                renderColorControl('pl-'+p.id, __('Custom colour override','blockenberg'), p.customColor||'', function(v){upd('customColor',v);}, openKey, setOpenKey),
                el(Button, { variant:'tertiary', size:'compact', isDestructive:true, onClick:onRemove, style:{marginLeft:'8px'} }, '✕')
            )
        );
    }

    /* ── Register ────────────────────────────────────────────────────── */
    registerBlockType('blockenberg/social-stats', {
        title: __('Social Stats','blockenberg'),
        icon: 'share',
        category: 'bkbg-business',

        attributes: {
            title:           { type:'string',  default:'Follow Along' },
            showTitle:       { type:'boolean', default:true },
            subtitle:        { type:'string',  default:'Join our growing community across platforms' },
            showSubtitle:    { type:'boolean', default:true },
            platforms:       { type:'array',   default: DEFAULT_PLATFORMS },
            layout:          { type:'string',  default:'grid' },
            columns:         { type:'number',  default:4 },
            cardStyle:       { type:'string',  default:'card' },
            usePlatformColors:{ type:'boolean', default:true },
            showHandle:      { type:'boolean', default:true },
            showSecondMetric:{ type:'boolean', default:true },
            animated:        { type:'boolean', default:true },
            accentColor:     { type:'string',  default:'#6c3fb5' },
            titleColor:      { type:'string',  default:'#1e1b4b' },
            subtitleColor:   { type:'string',  default:'#6b7280' },
            cardBg:          { type:'string',  default:'#ffffff' },
            cardBorder:      { type:'string',  default:'#e5e7eb' },
            iconBg:          { type:'string',  default:'#6c3fb5' },
            metricValueColor:{ type:'string',  default:'#1e1b4b' },
            metricLabelColor:{ type:'string',  default:'#6b7280' },
            handleColor:     { type:'string',  default:'#9ca3af' },
            bgColor:         { type:'string',  default:'' },
            titleSize:       { type:'number',  default:32 },
            metricSize:      { type:'number',  default:28 },
            labelSize:       { type:'number',  default:13 },
            iconSize:        { type:'number',  default:24 },
            cardRadius:      { type:'number',  default:16 },
            gap:             { type:'number',  default:20 },
            paddingTop:      { type:'number',  default:60 },
            paddingBottom:   { type:'number',  default:60 },
            titleTypo:       { type:'object',  default:{} },
            metricTypo:      { type:'object',  default:{} },
            labelTypo:       { type:'object',  default:{} },
        },

        edit: function(props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorState = useState(null);
            var openColorKey = openColorState[0];
            var setOpenColorKey = openColorState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, value, attrKey){
                return renderColorControl(key, label, value, function(v){ var u={}; u[attrKey]=v; setAttributes(u); }, openColorKey, setOpenColorKey);
            }
            function updatePlatform(id, upd) { setAttributes({ platforms: a.platforms.map(function(p){ return p.id===id ? upd : p; }) }); }
            function removePlatform(id)      { setAttributes({ platforms: a.platforms.filter(function(p){ return p.id!==id; }) }); }
            function addPlatform()           { setAttributes({ platforms: a.platforms.concat([{ id:makeId(), platform:'instagram', handle:'@newaccount', metric1Label:'Followers', metric1Value:'0', metric2Label:'Posts', metric2Value:'0', url:'', customColor:'' }]) }); }

            var gridStyle = {
                display: 'grid',
                gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)',
                gap: a.gap + 'px',
                marginTop: '32px',
            };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title:__('Platforms','blockenberg'), initialOpen:true },
                        (a.platforms||[]).map(function(p){
                            return el(PlatformEditor, { key:p.id, platform:p, onChange:function(upd){updatePlatform(p.id,upd);}, onRemove:function(){removePlatform(p.id);}, openKey:openColorKey, setOpenKey:setOpenColorKey });
                        }),
                        el(Button, { variant:'primary', onClick:addPlatform }, '+ ' + __('Add platform','blockenberg'))
                    ),
                    el(PanelBody, { title:__('Header','blockenberg'), initialOpen:false },
                        el(ToggleControl, { label:__('Show title','blockenberg'), checked:a.showTitle, onChange:function(v){setAttributes({showTitle:v});}, __nextHasNoMarginBottom:true }),
                        a.showTitle && el(TextControl, { label:__('Title','blockenberg'), value:a.title, onChange:function(v){setAttributes({title:v});} }),
                        el(ToggleControl, { label:__('Show subtitle','blockenberg'), checked:a.showSubtitle, onChange:function(v){setAttributes({showSubtitle:v});}, __nextHasNoMarginBottom:true }),
                        a.showSubtitle && el(TextControl, { label:__('Subtitle','blockenberg'), value:a.subtitle, onChange:function(v){setAttributes({subtitle:v});} })
                    ),
                    el(PanelBody, { title:__('Layout & Display','blockenberg'), initialOpen:false },
                        el(RangeControl, { label:__('Columns','blockenberg'), value:a.columns, min:1, max:6, onChange:function(v){setAttributes({columns:v});} }),
                        el(RangeControl, { label:__('Card gap (px)','blockenberg'), value:a.gap, min:8, max:60, onChange:function(v){setAttributes({gap:v});} }),
                        el(SelectControl, { label:__('Card style','blockenberg'), value:a.cardStyle, options:[{ label:__('Card (white)','blockenberg'), value:'card' },{ label:__('Minimal (borderless)','blockenberg'), value:'minimal' },{ label:__('Colored fill','blockenberg'), value:'colored' }], onChange:function(v){setAttributes({cardStyle:v});} }),
                        el(ToggleControl, { label:__('Use platform brand colours','blockenberg'), checked:a.usePlatformColors, onChange:function(v){setAttributes({usePlatformColors:v});}, __nextHasNoMarginBottom:true }),
                        el(ToggleControl, { label:__('Show handle / channel name','blockenberg'), checked:a.showHandle, onChange:function(v){setAttributes({showHandle:v});}, __nextHasNoMarginBottom:true }),
                        el(ToggleControl, { label:__('Show second metric','blockenberg'), checked:a.showSecondMetric, onChange:function(v){setAttributes({showSecondMetric:v});}, __nextHasNoMarginBottom:true }),
                        el(ToggleControl, { label:__('Entrance animation','blockenberg'), checked:a.animated, onChange:function(v){setAttributes({animated:v});}, __nextHasNoMarginBottom:true })
                    ),
                    el(PanelBody, { title:__('Colours','blockenberg'), initialOpen:false },
                        cc('accentColor',      __('Accent','blockenberg'),          a.accentColor,      'accentColor'),
                        cc('titleColor',       __('Title','blockenberg'),           a.titleColor,       'titleColor'),
                        cc('subtitleColor',    __('Subtitle','blockenberg'),        a.subtitleColor,    'subtitleColor'),
                        cc('cardBg',           __('Card background','blockenberg'), a.cardBg,           'cardBg'),
                        cc('cardBorder',       __('Card border','blockenberg'),     a.cardBorder,       'cardBorder'),
                        cc('iconBg',           __('Icon background','blockenberg'), a.iconBg,           'iconBg'),
                        cc('metricValueColor', __('Metric value','blockenberg'),    a.metricValueColor, 'metricValueColor'),
                        cc('metricLabelColor', __('Metric label','blockenberg'),    a.metricLabelColor, 'metricLabelColor'),
                        cc('handleColor',      __('Handle colour','blockenberg'),   a.handleColor,      'handleColor'),
                        cc('bgColor',          __('Section background','blockenberg'), a.bgColor,       'bgColor')
                    ),
                    el(PanelBody, { title:__('Appearance','blockenberg'), initialOpen:false },
                        el(RangeControl, { label:__('Icon size (px)','blockenberg'),          value:a.iconSize,   min:16, max:48, onChange:function(v){setAttributes({iconSize:v});} }),
                        el(RangeControl, { label:__('Card radius (px)','blockenberg'),        value:a.cardRadius, min:0,  max:40, onChange:function(v){setAttributes({cardRadius:v});} })
                    ),
                    el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                        el(RangeControl, { label:__('Padding top (px)','blockenberg'),    value:a.paddingTop,    min:0, max:200, onChange:function(v){setAttributes({paddingTop:v});} }),
                        el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:200, onChange:function(v){setAttributes({paddingBottom:v});} })
                    ),
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Title Typography'), value: a.titleTypo || {}, onChange: function(v){ setAttributes({ titleTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Metric Typography'), value: a.metricTypo || {}, onChange: function(v){ setAttributes({ metricTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Label Typography'), value: a.labelTypo || {}, onChange: function(v){ setAttributes({ labelTypo: v }); } })
                    )
                ),

                el('div', blockProps,
                    (a.showTitle || a.showSubtitle) && el('div', { style:{ textAlign:'center', marginBottom:'8px' } },
                        a.showTitle && el('h2', { className: 'bkbg-ss-title', style:{ margin:'0 0 8px', color:a.titleColor||'#1e1b4b' } }, a.title),
                        a.showSubtitle && el('p', { className: 'bkbg-ss-subtitle', style:{ margin:0, color:a.subtitleColor||'#6b7280' } }, a.subtitle)
                    ),
                    el('div', { style: gridStyle },
                        (a.platforms||[]).map(function(p){ return el(PlatformCard, { key:p.id, platform:p, a:a }); })
                    )
                )
            );
        },

        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({
                className: 'bkbg-ss-wrapper',
                style: buildWrapStyle(a),
            }),
                (a.showTitle || a.showSubtitle) && el('div', { className:'bkbg-ss-header' },
                    a.showTitle    && el('h2', { className:'bkbg-ss-title' },    a.title),
                    a.showSubtitle && el('p',  { className:'bkbg-ss-subtitle' }, a.subtitle)
                ),
                el('div', {
                    className: 'bkbg-ss-grid',
                    'data-platforms': JSON.stringify(a.platforms||[]),
                    'data-opts': JSON.stringify({
                        columns:          a.columns,
                        cardStyle:        a.cardStyle,
                        usePlatformColors:a.usePlatformColors,
                        showHandle:       a.showHandle,
                        showSecondMetric: a.showSecondMetric,
                        animated:         a.animated,
                        iconSize:         a.iconSize,
                        metricSize:       a.metricSize,
                        labelSize:        a.labelSize,
                        cardRadius:       a.cardRadius,
                        gap:              a.gap,
                        accentColor:      a.accentColor,
                        cardBg:           a.cardBg,
                        cardBorder:       a.cardBorder,
                        iconBg:           a.iconBg,
                        metricValueColor: a.metricValueColor,
                        metricLabelColor: a.metricLabelColor,
                        handleColor:      a.handleColor,
                    }),
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)',
                        gap: a.gap + 'px',
                        marginTop: (a.showTitle || a.showSubtitle) ? '32px' : '0',
                    }
                })
            );
        }
    });
}() );
