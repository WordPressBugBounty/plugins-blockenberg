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

    /* ── Typography helpers (lazy) ───────────────────────────────── */
    var _tc, _tvf;
    Object.defineProperty(window, '__bkwm_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '__bkwm_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, typoObj, setAttributes, attrName) {
        var fn = window.__bkwm_tc;
        return fn ? fn({ label: label, value: typoObj || {}, onChange: function (v) { var o = {}; o[attrName] = v; setAttributes(o); } }) : null;
    }
    function getTypoCssVarsObj(a) {
        var fn = window.__bkwm_tvf;
        var s = {};
        if (fn) {
            Object.assign(s, fn(a.titleTypo || {}, '--bkwm-tt-'));
            Object.assign(s, fn(a.subtitleTypo || {}, '--bkwm-st-'));
        }
        return s;
    }

    function makeId() { return 'wm' + Math.random().toString(36).substr(2,8); }

    /* ── Helpers ───────────────────────────────────────────────────── */
    function buildWrapStyle(a) {
        var s = {
            '--bkbg-wm-accent':    a.accentColor,
            '--bkbg-wm-title':     a.titleColor,
            '--bkbg-wm-subtitle':  a.subtitleColor,
            '--bkbg-wm-map-bg':    a.mapBg,
            '--bkbg-wm-list-bg':   a.listBg,
            '--bkbg-wm-list-border': a.listBorder,
            paddingTop:    a.paddingTop    + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        };
        Object.assign(s, getTypoCssVarsObj(a));
        return s;
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 0', gap:'8px' } },
            el('span', { style: { fontSize:'12px', color:'#1e1e1e', flex:1, lineHeight:1.4 } }, label),
            el('div', { style: { position:'relative', flexShrink:0 } },
                el('button', { type:'button', onClick: function () { setOpenKey(isOpen ? null : key); }, style: { width:'28px', height:'28px', borderRadius:'4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor:'pointer', padding:0, background: value || '#ccc' } }),
                isOpen && el(Popover, { position:'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding:'8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Country editor row ─────────────────────────────────────────── */
    function CountryRow(props) {
        var item = props.item;
        var onChange = props.onChange;
        var onRemove = props.onRemove;
        var openKey = props.openKey;
        var setOpenKey = props.setOpenKey;

        function upd(key, val) {
            var copy = Object.assign({}, item);
            copy[key] = val;
            onChange(copy);
        }

        return el('div', { style: { background:'#f9f9f9', borderRadius:'8px', padding:'10px', marginBottom:'10px', border:'1px solid #e9e9e9' } },
            el('div', { style: { display:'flex', gap:'8px', marginBottom:'8px' } },
                el(TextControl, { label:__('Country name','blockenberg'), value: item.name, onChange: function(v){upd('name',v);}, style:{ flex:1 } }),
                el(TextControl, { label:__('Code (ISO)','blockenberg'), value: item.code, onChange: function(v){upd('code',v.toUpperCase().substr(0,2));}, style:{ width:'60px', flex:'none' } })
            ),
            el('div', { style: { display:'flex', gap:'8px', marginBottom:'8px', alignItems:'flex-end' } },
                el(TextControl, { label:__('Value / Count','blockenberg'), value: String(item.value), onChange: function(v){upd('value', parseFloat(v)||0);}, type:'number', style:{ flex:1 } }),
                el(TextControl, { label:__('Link URL','blockenberg'), value: item.url || '', onChange: function(v){upd('url',v);}, style:{ flex:2 } })
            ),
            el('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'4px' } },
                renderColorControl('item-'+item.id, __('Custom colour','blockenberg'), item.color, function(v){upd('color',v);}, openKey, setOpenKey),
                el(Button, { variant:'tertiary', size:'compact', isDestructive:true, onClick:onRemove, style:{marginLeft:'8px'} }, '✕')
            )
        );
    }

    /* ── Preview card ───────────────────────────────────────────────── */
    function MapPreview(props) {
        var a = props.a;
        var countries = a.countries || [];

        return el('div', { style: { display:'flex', flexDirection:'column', gap:'24px' } },
            /* Header */
            el('div', { className: 'bkbg-wm-header', style:{ textAlign:'center' } },
                a.showTitle && el('div', { className: 'bkbg-wm-title', style:{ color: a.titleColor||'#1e1b4b', marginBottom:'8px' } }, a.title || __('Global Presence','blockenberg')),
                a.showSubtitle && el('p', { className: 'bkbg-wm-subtitle', style:{ color: a.subtitleColor||'#6b7280', marginTop:0 } }, a.subtitle || __('Where our customers are','blockenberg'))
            ),

            /* Map placeholder */
            el('div', { style:{
                background: a.mapBg || '#f0f4f8',
                borderRadius: a.cardRadius+'px',
                minHeight: '220px',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexDirection:'column', gap:'8px',
                border: '2px dashed #cbd5e1'
            } },
                el('span', { style:{ fontSize:'48px' } }, '🗺️'),
                el('p', { style:{ margin:0, color:'#94a3b8', fontWeight:600, fontSize:'14px' } }, __('Interactive map renders on the frontend','blockenberg')),
                el('p', { style:{ margin:0, color:'#94a3b8', fontSize:'12px' } }, countries.length + ' ' + __('countries configured','blockenberg'))
            ),

            /* Country tags grid */
            countries.length > 0 && el('div', { style:{ display:'flex', flexWrap:'wrap', gap:'8px' } },
                countries.map(function(c) {
                    return el('div', { key:c.id, style:{
                        display:'inline-flex', alignItems:'center', gap:'6px',
                        padding:'4px 10px', borderRadius:'999px',
                        background: c.color || (a.accentColor || '#ede9fe'),
                        color: '#fff', fontSize:'13px', fontWeight:600,
                    } },
                        el('span', null, c.code || '??'),
                        el('span', { style:{ fontWeight:400 } }, c.name),
                        el('span', { style:{ background:'rgba(255,255,255,0.25)', borderRadius:'999px', padding:'1px 6px', fontSize:'11px', marginLeft:'2px' } }, c.value)
                    );
                })
            )
        );
    }

    /* ── Register ──────────────────────────────────────────────────── */
    registerBlockType('blockenberg/world-map', {
        title: __('World Map','blockenberg'),
        icon: 'location-alt',
        category: 'bkbg-charts',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorState = useState(null);
            var openColorKey = openColorState[0];
            var setOpenColorKey = openColorState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, value, attrKey) {
                return renderColorControl(key, label, value, function(v){ var u={}; u[attrKey]=v; setAttributes(u); }, openColorKey, setOpenColorKey);
            }

            function updateCountry(id, updated) {
                setAttributes({ countries: a.countries.map(function(c){ return c.id===id ? updated : c; }) });
            }

            function removeCountry(id) {
                setAttributes({ countries: a.countries.filter(function(c){ return c.id!==id; }) });
            }

            function addCountry() {
                setAttributes({ countries: a.countries.concat([{ id:makeId(), code:'XX', name:__('New Country','blockenberg'), value:100, color:'', url:'' }]) });
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title:__('Countries','blockenberg'), initialOpen:true },
                        (a.countries||[]).map(function(item) {
                            return el(CountryRow, { key:item.id, item:item, onChange:function(upd){ updateCountry(item.id, upd); }, onRemove:function(){ removeCountry(item.id); }, openKey:openColorKey, setOpenKey:setOpenColorKey });
                        }),
                        el(Button, { variant:'primary', onClick:addCountry }, '+ ' + __('Add Country','blockenberg'))
                    ),
                    el(PanelBody, { title:__('Display','blockenberg'), initialOpen:false },
                        el(ToggleControl, { label:__('Show title','blockenberg'), checked:a.showTitle, onChange:function(v){setAttributes({showTitle:v});}, __nextHasNoMarginBottom:true }),
                        a.showTitle && el(TextControl, { label:__('Title','blockenberg'), value:a.title, onChange:function(v){setAttributes({title:v});} }),
                        el(ToggleControl, { label:__('Show subtitle','blockenberg'), checked:a.showSubtitle, onChange:function(v){setAttributes({showSubtitle:v});}, __nextHasNoMarginBottom:true }),
                        a.showSubtitle && el(TextControl, { label:__('Subtitle','blockenberg'), value:a.subtitle, onChange:function(v){setAttributes({subtitle:v});} }),
                        el(ToggleControl, { label:__('Show legend','blockenberg'), checked:a.showLegend, onChange:function(v){setAttributes({showLegend:v});}, __nextHasNoMarginBottom:true }),
                        a.showLegend && el(TextControl, { label:__('Legend title','blockenberg'), value:a.legendTitle, onChange:function(v){setAttributes({legendTitle:v});} }),
                        el(ToggleControl, { label:__('Show tooltips on hover','blockenberg'), checked:a.showTooltips, onChange:function(v){setAttributes({showTooltips:v});}, __nextHasNoMarginBottom:true }),
                        el(ToggleControl, { label:__('Show country list below map','blockenberg'), checked:a.showCountryList, onChange:function(v){setAttributes({showCountryList:v});}, __nextHasNoMarginBottom:true }),
                        el(RangeControl, { label:__('Map height (px)','blockenberg'), value:a.mapHeight, min:200, max:800, onChange:function(v){setAttributes({mapHeight:v});} })
                    ),
                    el(PanelBody, { title:__('Map Style','blockenberg'), initialOpen:false },
                        el(SelectControl, { label:__('Color mode','blockenberg'), value:a.colorMode, options:[{ label:__('Gradient by value','blockenberg'), value:'gradient' },{ label:__('Uniform fill','blockenberg'), value:'uniform' },{ label:__('Per-country custom color','blockenberg'), value:'custom' }], onChange:function(v){setAttributes({colorMode:v});} }),
                        a.colorMode==='gradient' && el(Fragment, null,
                            cc('lowColor',  __('Low value colour','blockenberg'),  a.lowColor,  'lowColor'),
                            cc('highColor', __('High value colour','blockenberg'), a.highColor, 'highColor')
                        ),
                        cc('defaultFill',  __('Default country fill','blockenberg'), a.defaultFill, 'defaultFill'),
                        cc('hoverFill',    __('Hover fill','blockenberg'),          a.hoverFill,   'hoverFill'),
                        cc('borderColor',  __('Border colour','blockenberg'),       a.borderColor, 'borderColor'),
                        cc('mapBg',        __('Map background','blockenberg'),      a.mapBg,       'mapBg'),
                        el(SelectControl, { label:__('Projection','blockenberg'), value:a.projection, options:[{ label:'Natural Earth', value:'NaturalEarth1' },{ label:'Mercator', value:'Mercator' },{ label:'Equirectangular', value:'Equirectangular' },{ label:'Robinson', value:'Robinson' }], onChange:function(v){setAttributes({projection:v});} })
                    ),
                    el(PanelBody, { title:__('Tooltip Style','blockenberg'), initialOpen:false },
                        cc('tooltipBg',    __('Tooltip background','blockenberg'), a.tooltipBg,    'tooltipBg'),
                        cc('tooltipColor', __('Tooltip text','blockenberg'),       a.tooltipColor, 'tooltipColor')
                    ),
                    el(PanelBody, { title:__('Country List Style','blockenberg'), initialOpen:false },
                        cc('listBg',     __('List background','blockenberg'), a.listBg,     'listBg'),
                        cc('listBorder', __('List border','blockenberg'),     a.listBorder, 'listBorder')
                    ),
                    el(PanelBody, { title:__('Colours','blockenberg'), initialOpen:false },
                        cc('accentColor',   __('Accent','blockenberg'),   a.accentColor,   'accentColor'),
                        cc('titleColor',    __('Title','blockenberg'),    a.titleColor,    'titleColor'),
                        cc('subtitleColor', __('Subtitle','blockenberg'), a.subtitleColor, 'subtitleColor'),
                        cc('bgColor',       __('Section background','blockenberg'), a.bgColor, 'bgColor')
                    ),
                    el(PanelBody, { title:__('Appearance','blockenberg'), initialOpen:false },
                        el(RangeControl, { label:__('Card radius (px)','blockenberg'), value:a.cardRadius, min:0, max:40, onChange:function(v){setAttributes({cardRadius:v});} })
                    ),
                    el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                        el(RangeControl, { label:__('Padding top (px)','blockenberg'), value:a.paddingTop, min:0, max:200, onChange:function(v){setAttributes({paddingTop:v});} }),
                        el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:200, onChange:function(v){setAttributes({paddingBottom:v});} })
                    ),
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl('Title', a.titleTypo, setAttributes, 'titleTypo'),
                        getTypoControl('Subtitle', a.subtitleTypo, setAttributes, 'subtitleTypo')
                    )
                ),

                el('div', blockProps,
                    el(MapPreview, { a: a })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({
                className: 'bkbg-wm-wrapper',
                style: buildWrapStyle(a),
            }),
                (a.showTitle || a.showSubtitle) && el('div', { className:'bkbg-wm-header', style:{ textAlign:'center', marginBottom:'32px' } },
                    a.showTitle  && el('h2', { className:'bkbg-wm-title', style:{ margin:'0 0 8px' } }, a.title),
                    a.showSubtitle && el('p', { className:'bkbg-wm-subtitle', style:{ margin:0 } }, a.subtitle)
                ),
                el('div', {
                    className: 'bkbg-wm-map-holder',
                    'data-countries': JSON.stringify(a.countries || []),
                    'data-opts': JSON.stringify({
                        colorMode:    a.colorMode,
                        lowColor:     a.lowColor,
                        highColor:    a.highColor,
                        defaultFill:  a.defaultFill,
                        hoverFill:    a.hoverFill,
                        borderColor:  a.borderColor,
                        projection:   a.projection,
                        showLegend:   a.showLegend,
                        legendTitle:  a.legendTitle,
                        showTooltips: a.showTooltips,
                        tooltipBg:    a.tooltipBg,
                        tooltipColor: a.tooltipColor,
                        mapHeight:    a.mapHeight,
                        mapBg:        a.mapBg,
                        cardRadius:   a.cardRadius,
                    }),
                    style: { minHeight: a.mapHeight+'px', borderRadius: a.cardRadius+'px', background: a.mapBg }
                }),
                a.showCountryList && el('div', { className:'bkbg-wm-country-list', style:{ marginTop:'32px' } },
                    el('div', { style:{ display:'flex', flexWrap:'wrap', gap:'8px' } },
                        (a.countries||[]).map(function(c) {
                            return el('span', { key:c.id, className:'bkbg-wm-country-tag' },
                                el('strong', null, c.code), ' ', c.name, ' — ', c.value
                            );
                        })
                    )
                )
            );
        }
    });
}() );
