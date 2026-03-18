/* ====================================================
   Stats Section Block — editor (index.js)
   Block: blockenberg/stats-section
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
    var useState           = wp.element.useState;
    var RichText           = wp.blockEditor.RichText;
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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    /* ── helpers ── */
    function uid() { return 's' + Math.random().toString(36).slice(2, 7); }
    function move(arr, from, to) { var a = arr.slice(); a.splice(to, 0, a.splice(from, 1)[0]); return a; }

    function buildWrapStyle(a) {
        var tv = getTypoCssVars();
        var s = {
            '--bkbg-sts-num-color':  a.numberColor,
            '--bkbg-sts-label-color':a.labelColor,
            '--bkbg-sts-desc-color': a.descColor,
            '--bkbg-sts-icon-color': a.iconColor,
            '--bkbg-sts-div-color':  a.dividerColor,
            '--bkbg-sts-card-bg':    a.cardBg,
            '--bkbg-sts-card-border':a.cardBorder,
            '--bkbg-sts-num-size':   a.numberSize + 'px',
            '--bkbg-sts-label-size': a.labelSize + 'px',
            '--bkbg-sts-desc-size':  a.descSize + 'px',
            '--bkbg-sts-icon-size':  a.iconSize + 'px',
            '--bkbg-sts-weight':     a.fontWeight,
            '--bkbg-sts-lh':         a.lineHeight,
            '--bkbg-sts-radius':     a.borderRadius + 'px',
            '--bkbg-sts-pad':        a.cardPadding + 'px',
            '--bkbg-sts-cols':       a.columns,
            '--bkbg-sts-gap':        a.gap + 'px',
            '--bkbg-sts-pt':         a.paddingTop + 'px',
            '--bkbg-sts-pb':         a.paddingBottom + 'px',
            '--bkbg-sts-grad-from':  a.gradientFrom,
            '--bkbg-sts-grad-to':    a.gradientTo,
            '--bkbg-sts-title-color':a.titleColor,
            '--bkbg-sts-sub-color':  a.subtitleColor,
            textAlign:               a.textAlign,
            background:              a.sectionBg || undefined,
        };
        Object.assign(s, tv(a.titleTypo, '--bksts-tt-'));
        Object.assign(s, tv(a.subtitleTypo, '--bksts-st-'));
        Object.assign(s, tv(a.numberTypo, '--bksts-nm-'));
        Object.assign(s, tv(a.labelTypo, '--bksts-lb-'));
        Object.assign(s, tv(a.descTypo, '--bksts-ds-'));
        return s;
    }

    function StatCard(props) {
        var stat   = props.stat;
        var a      = props.a;
        var isEdit = props.isEdit;

        var iconEl = a.showIcons && stat.icon
            ? el('span', { className: 'bkbg-sts-icon' }, (stat.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(stat.iconType, stat.icon, stat.iconDashicon, stat.iconImageUrl, stat.iconDashiconColor) : stat.icon)
            : null;

        var numEl = el('span', { className: 'bkbg-sts-number' },
            stat.prefix ? el('span', { className: 'bkbg-sts-prefix' }, stat.prefix) : null,
            el('span', { className: 'bkbg-sts-num-value' }, stat.number),
            stat.suffix ? el('span', { className: 'bkbg-sts-suffix' }, stat.suffix) : null
        );

        var labelEl = el('span', { className: 'bkbg-sts-label' }, stat.label);
        var descEl  = a.showDescription && stat.description
            ? el('span', { className: 'bkbg-sts-desc' }, stat.description)
            : null;

        return el('div', { className: 'bkbg-sts-item' },
            iconEl, numEl, labelEl, descEl
        );
    }

    /* ── REGISTER ── */
    registerBlockType('blockenberg/stats-section', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;
            var stats   = a.stats;

            var _act = useState(null);
            var activeId = _act[0], setActiveId = _act[1];

            function updateStat(id, patch) {
                setAttr({ stats: stats.map(function(s){ return s.id === id ? Object.assign({}, s, patch) : s; }) });
            }

            var wrapStyle  = buildWrapStyle(a);
            var blockProps = useBlockProps({ className: 'bkbg-sts-wrap bkbg-sts-layout--' + a.layout + ' bkbg-sts-style--' + a.cardStyle, style: wrapStyle });

            var activeItem = stats.find(function(s){ return s.id === activeId; });

            var inspector = el(InspectorControls, null,
                /* Stats list */
                el(PanelBody, { title: __('Stats', 'blockenberg'), initialOpen: true },
                    stats.map(function(stat, idx) {
                        var isActive = activeId === stat.id;
                        return el('div', { key: stat.id },
                            el('div', {
                                style: { display:'flex', alignItems:'center', gap:'6px', background: isActive ? '#f3f0ff' : '#f8f9fa', border: isActive ? '1px solid #6c3fb5' : '1px solid #e2e8f0', borderRadius:'6px', padding:'6px 8px', marginBottom:'4px', cursor:'pointer' },
                                onClick: function(){ setActiveId(isActive ? null : stat.id); }
                            },
                                el('span', { style:{ flex:1, fontWeight:600, fontSize:'14px' } }, (stat.icon ? stat.icon + ' ' : '') + stat.number + ' ' + stat.label),
                                el(Button, { icon:'arrow-up', isSmall:true, disabled:idx===0, onClick:function(e){ e.stopPropagation(); setAttr({ stats: move(stats,idx,idx-1) }); } }),
                                el(Button, { icon:'arrow-down', isSmall:true, disabled:idx===stats.length-1, onClick:function(e){ e.stopPropagation(); setAttr({ stats: move(stats,idx,idx+1) }); } }),
                                el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, onClick:function(e){ e.stopPropagation(); setAttr({ stats: stats.filter(function(_,i){ return i!==idx; }) }); if(activeId===stat.id) setActiveId(null); } })
                            ),
                            isActive ? el('div', { style:{ padding:'8px', background:'#faf8ff', borderRadius:'0 0 6px 6px', border:'1px solid #6c3fb5', borderTop:'none', marginBottom:'4px' } },
                                el(IP().IconPickerControl, IP().iconPickerProps(stat, function (patch) { updateStat(stat.id, patch); }, { label: __('Icon', 'blockenberg'), charAttr: 'icon', typeAttr: 'iconType', dashiconAttr: 'iconDashicon', imageUrlAttr: 'iconImageUrl' })),
                                el(TextControl, { label:__('Prefix (e.g. $)', 'blockenberg'), value:stat.prefix, onChange:function(v){ updateStat(stat.id,{prefix:v}); } }),
                                el(TextControl, { label:__('Number / Value', 'blockenberg'), value:stat.number, onChange:function(v){ updateStat(stat.id,{number:v}); } }),
                                el(TextControl, { label:__('Suffix (e.g. /5)', 'blockenberg'), value:stat.suffix, onChange:function(v){ updateStat(stat.id,{suffix:v}); } }),
                                el(TextControl, { label:__('Label', 'blockenberg'), value:stat.label, onChange:function(v){ updateStat(stat.id,{label:v}); } }),
                                el(TextControl, { label:__('Description', 'blockenberg'), value:stat.description, onChange:function(v){ updateStat(stat.id,{description:v}); } })
                            ) : null
                        );
                    }),
                    el(Button, { variant:'primary', style:{ marginTop:'8px', width:'100%' },
                        onClick:function(){ var n = { id:uid(), icon:'✨', iconType:'custom-char', iconDashicon:'', iconImageUrl:'', prefix:'', number:'0', suffix:'', label:'Stat Label', description:'Supporting detail' }; setAttr({ stats: stats.concat([n]) }); setActiveId(n.id); }
                    }, __('+ Add Stat', 'blockenberg'))
                ),

                /* Section header */
                el(PanelBody, { title:__('Section Header', 'blockenberg'), initialOpen:false },
                    el(ToggleControl, { label:__('Show section header', 'blockenberg'), checked:a.showSectionHeader, onChange:function(v){ setAttr({showSectionHeader:v}); } }),
                    a.showSectionHeader ? el(Fragment, null,
                        el(TextControl, { label:__('Title', 'blockenberg'), value:a.sectionTitle, onChange:function(v){ setAttr({sectionTitle:v}); } }),
                        el(TextControl, { label:__('Subtitle', 'blockenberg'), value:a.sectionSubtitle, onChange:function(v){ setAttr({sectionSubtitle:v}); } }),
                        el(SelectControl, { label:__('Text alignment', 'blockenberg'), value:a.headerAlign, options:[
                            {label:'Left', value:'left'}, {label:'Center', value:'center'}, {label:'Right', value:'right'}
                        ], onChange:function(v){ setAttr({headerAlign:v}); } })
                    ) : null
                ),

                /* Layout */
                el(PanelBody, { title:__('Layout & Style', 'blockenberg'), initialOpen:false },
                    el(SelectControl, { label:__('Layout', 'blockenberg'), value:a.layout, options:[
                        {label:__('Row (horizontal)','blockenberg'), value:'row'},
                        {label:__('Grid','blockenberg'), value:'grid'},
                        {label:__('Centered column','blockenberg'), value:'centered'},
                    ], onChange:function(v){ setAttr({layout:v}); } }),
                    el(SelectControl, { label:__('Card style', 'blockenberg'), value:a.cardStyle, options:[
                        {label:__('Plain (no background)','blockenberg'), value:'plain'},
                        {label:__('Card (white bg + shadow)','blockenberg'), value:'card'},
                        {label:__('Bordered','blockenberg'), value:'bordered'},
                        {label:__('Gradient number','blockenberg'), value:'gradient'},
                    ], onChange:function(v){ setAttr({cardStyle:v}); } }),
                    el(RangeControl, { label:__('Columns','blockenberg'), value:a.columns, min:1, max:6, onChange:function(v){ setAttr({columns:v}); } }),
                    el(RangeControl, { label:__('Gap (px)','blockenberg'), value:a.gap, min:0, max:80, onChange:function(v){ setAttr({gap:v}); } }),
                    el(SelectControl, { label:__('Text alignment','blockenberg'), value:a.textAlign, options:[
                        {label:'Left',value:'left'},{label:'Center',value:'center'},{label:'Right',value:'right'}
                    ], onChange:function(v){ setAttr({textAlign:v}); } }),
                    el(ToggleControl, { label:__('Show icons','blockenberg'), checked:a.showIcons, onChange:function(v){ setAttr({showIcons:v}); } }),
                    el(ToggleControl, { label:__('Show dividers between stats','blockenberg'), checked:a.showDividers, onChange:function(v){ setAttr({showDividers:v}); } }),
                    el(ToggleControl, { label:__('Show descriptions','blockenberg'), checked:a.showDescription, onChange:function(v){ setAttr({showDescription:v}); } })
                ),

                /* Spacing */
                el(PanelBody, { title:__('Spacing', 'blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Section padding top (px)', 'blockenberg'),    value:a.paddingTop,    min:0, max:160, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Section padding bottom (px)', 'blockenberg'), value:a.paddingBottom, min:0, max:160, onChange:function(v){ setAttr({paddingBottom:v}); } }),
                    el(RangeControl, { label:__('Card padding (px)', 'blockenberg'),           value:a.cardPadding,   min:0, max:80,  onChange:function(v){ setAttr({cardPadding:v}); } }),
                    el(RangeControl, { label:__('Border radius (px)', 'blockenberg'),          value:a.borderRadius,  min:0, max:40,  onChange:function(v){ setAttr({borderRadius:v}); } })
                ),

                /* Typography */
                el(PanelBody, { title:__('Typography', 'blockenberg'), initialOpen:false },
                    a.showSectionHeader && getTypoControl()({ label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { setAttr({ titleTypo: v }); } }),
                    a.showSectionHeader && getTypoControl()({ label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo, onChange: function (v) { setAttr({ subtitleTypo: v }); } }),
                    getTypoControl()({ label: __('Number', 'blockenberg'), value: a.numberTypo, onChange: function (v) { setAttr({ numberTypo: v }); } }),
                    getTypoControl()({ label: __('Label', 'blockenberg'), value: a.labelTypo, onChange: function (v) { setAttr({ labelTypo: v }); } }),
                    a.showDescription && getTypoControl()({ label: __('Description', 'blockenberg'), value: a.descTypo, onChange: function (v) { setAttr({ descTypo: v }); } }),
                    el(RangeControl, { label:__('Icon size (px)','blockenberg'), value:a.iconSize, min:16, max:64, onChange:function(v){ setAttr({iconSize:v}); } })
                ),

                /* Colors */
                el(PanelColorSettings, { title:__('Colors', 'blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Number color','blockenberg'),   value:a.numberColor,  onChange:function(v){ setAttr({numberColor:v||''}); }},
                    {label:__('Label color','blockenberg'),    value:a.labelColor,   onChange:function(v){ setAttr({labelColor:v||''}); }},
                    {label:__('Description color','blockenberg'), value:a.descColor, onChange:function(v){ setAttr({descColor:v||''}); }},
                    {label:__('Icon color','blockenberg'),     value:a.iconColor,    onChange:function(v){ setAttr({iconColor:v||''}); }},
                    {label:__('Divider color','blockenberg'),  value:a.dividerColor, onChange:function(v){ setAttr({dividerColor:v||''}); }},
                    {label:__('Card background','blockenberg'),value:a.cardBg,       onChange:function(v){ setAttr({cardBg:v||''}); }},
                    {label:__('Card border','blockenberg'),    value:a.cardBorder,   onChange:function(v){ setAttr({cardBorder:v||''}); }},
                    {label:__('Section background','blockenberg'),value:a.sectionBg, onChange:function(v){ setAttr({sectionBg:v||''}); }},
                    {label:__('Title color','blockenberg'),    value:a.titleColor,   onChange:function(v){ setAttr({titleColor:v||''}); }},
                    {label:__('Subtitle color','blockenberg'), value:a.subtitleColor,onChange:function(v){ setAttr({subtitleColor:v||''}); }},
                    {label:__('Gradient from','blockenberg'),  value:a.gradientFrom, onChange:function(v){ setAttr({gradientFrom:v||''}); }},
                    {label:__('Gradient to','blockenberg'),    value:a.gradientTo,   onChange:function(v){ setAttr({gradientTo:v||''}); }},
                ] })
            );

            /* Preview */
            var headerEl = a.showSectionHeader ? el('div', { className: 'bkbg-sts-header', style:{ textAlign: a.headerAlign } },
                el(RichText, { tagName:'h2', className:'bkbg-sts-title', value:a.sectionTitle, onChange:function(v){ setAttr({sectionTitle:v}); }, placeholder:__('Section title…','blockenberg') }),
                el(RichText, { tagName:'p', className:'bkbg-sts-subtitle', value:a.sectionSubtitle, onChange:function(v){ setAttr({sectionSubtitle:v}); }, placeholder:__('Section subtitle…','blockenberg') })
            ) : null;

            var gridEl = el('div', {
                className: 'bkbg-sts-grid' + (a.showDividers ? ' bkbg-sts-dividers' : '')
            },
                stats.map(function(stat) {
                    return el(StatCard, { key: stat.id, stat:stat, a:a, isEdit:true });
                })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    headerEl,
                    gridEl
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-sts-wrap bkbg-sts-layout--' + a.layout + ' bkbg-sts-style--' + a.cardStyle,
                style: buildWrapStyle(a)
            });

            var headerEl = a.showSectionHeader ? el('div', { className: 'bkbg-sts-header', style:{ textAlign: a.headerAlign } },
                el(RichText.Content, { tagName:'h2', className:'bkbg-sts-title', value:a.sectionTitle }),
                el(RichText.Content, { tagName:'p', className:'bkbg-sts-subtitle', value:a.sectionSubtitle })
            ) : null;

            return el('div', blockProps,
                headerEl,
                el('div', { className: 'bkbg-sts-grid' + (a.showDividers ? ' bkbg-sts-dividers' : '') },
                    a.stats.map(function(stat) {
                        return el('div', { key: stat.id, className: 'bkbg-sts-item' },
                            a.showIcons && stat.icon ? el('span', { className: 'bkbg-sts-icon' }, (stat.iconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(stat.iconType, stat.icon, stat.iconDashicon, stat.iconImageUrl, stat.iconDashiconColor) : stat.icon) : null,
                            el('span', { className: 'bkbg-sts-number' },
                                stat.prefix ? el('span', { className: 'bkbg-sts-prefix' }, stat.prefix) : null,
                                el('span', { className: 'bkbg-sts-num-value' }, stat.number),
                                stat.suffix ? el('span', { className: 'bkbg-sts-suffix' }, stat.suffix) : null
                            ),
                            el('span', { className: 'bkbg-sts-label' }, stat.label),
                            a.showDescription && stat.description ? el('span', { className: 'bkbg-sts-desc' }, stat.description) : null
                        );
                    })
                )
            );
        }
    });
}() );
