/* ====================================================
   Use Case Section — editor (index.js)
   Block: blockenberg/use-case-section
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
    var Button             = wp.components.Button;
    var ColorPicker         = wp.components.ColorPicker;
    var Popover            = wp.components.Popover;
    var __                 = wp.i18n.__;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'titleTypo', attrs, '--bkusec-tt-');
        _tvf(v, 'descTypo', attrs, '--bkusec-ds-');
        return v;
    }
    var IP = function () { return window.bkbgIconPicker; };

    function uid() { return Math.random().toString(36).slice(2,9); }

    function wrapStyle(a) {
        var s = {
            '--bkbg-usec-pt':     a.paddingTop  + 'px',
            '--bkbg-usec-pb':     a.paddingBottom + 'px',
            '--bkbg-usec-sec-bg': a.sectionBg,
            '--bkbg-usec-card-bg':a.cardBg,
            '--bkbg-usec-card-bd':a.cardBorder,
            '--bkbg-usec-title-c':a.titleColor,
            '--bkbg-usec-desc-c': a.descColor,
            '--bkbg-usec-feat-c': a.featureColor,
            '--bkbg-usec-chk-c':  a.checkColor,
            '--bkbg-usec-ey-bg':  a.eyebrowBg,
            '--bkbg-usec-ey-c':   a.eyebrowColor,
            '--bkbg-usec-sec-ttl':a.sectionTitleColor,
            '--bkbg-usec-sec-sub':a.sectionSubColor,
            '--bkbg-usec-icon-sz':a.iconSize + 'px',
            '--bkbg-usec-r':       a.cardRadius + 'px',
            '--bkbg-usec-p':       a.cardPadding + 'px',
            '--bkbg-usec-gap':     a.gap + 'px',
            '--bkbg-usec-cols':    a.columns,
            '--bkbg-usec-header-gap': a.headerGap + 'px',
        };
        var _tv = getTypoCssVars(a);
        Object.assign(s, _tv);
        return s;
    }

    /* ----- Inspector: one expandable case row ----- */
    function CaseRow(props) {
        var c     = props.caseItem;
        var idx   = props.index;
        var total = props.total;
        var onUpdate  = props.onUpdate;
        var onDelete  = props.onDelete;
        var onMove    = props.onMove;
        var open = useState(idx === 0);
        var isOpen = open[0]; var setOpen = open[1];

        return el('div', { className:'bkbg-inspector-row', style:{ borderBottom:'1px solid #e2e8f0', marginBottom:4 } },
            el('div', { style:{ display:'flex', alignItems:'center', cursor:'pointer', padding:'6px 0' }, onClick:function(){ setOpen(!isOpen); } },
                el('span', { style:{ flex:1, fontWeight:600, fontSize:12 } }, '#'+(idx+1)+' '+((c.iconType || 'custom-char') === 'custom-char' ? c.icon : '●')+' '+(c.title||'Case')),
                el('span', null, isOpen ? '▲' : '▼')
            ),
            !isOpen ? null : el('div', { style:{ paddingBottom:8 } },
                el(IP().IconPickerControl, IP().iconPickerProps(c, function(patch) { onUpdate(idx, patch); }, { label:__('Icon (emoji or symbol)','blockenberg'), charAttr:'icon', typeAttr:'iconType', dashiconAttr:'iconDashicon', imageUrlAttr:'iconImageUrl' })),
                el(TextControl, { label:__('Title','blockenberg'),                  value:c.title, onChange:function(v){ onUpdate(idx,{title:v}); } }),
                el(TextControl, { label:__('Description','blockenberg'),            value:c.description, onChange:function(v){ onUpdate(idx,{description:v}); }, __nextHasNoMarginBottom:false }),
                el(BkbgColorSwatch, { label:__('Accent color','blockenberg'),           value:c.accentColor, onChange:function(v){ onUpdate(idx,{accentColor:v}); } }),
                el('p', { style:{ fontWeight:600, fontSize:11, margin:'8px 0 4px' } }, __('Features','blockenberg')),
                c.features.map(function(f, fi) {
                    return el('div', { key:f.id, style:{ display:'flex', gap:4, marginBottom:4 } },
                        el(TextControl, { value:f.text, onChange:function(v){ var feats=[].concat(c.features); feats[fi]=Object.assign({},f,{text:v}); onUpdate(idx,{features:feats}); }, placeholder:'Feature…' }),
                        el(Button, { isSmall:true, isDestructive:true, onClick:function(){ var feats=c.features.filter(function(_,i){ return i!==fi; }); onUpdate(idx,{features:feats}); } }, '✕')
                    );
                }),
                el(Button, { isSmall:true, variant:'tertiary', onClick:function(){ onUpdate(idx,{features:c.features.concat([{id:uid(),text:''}])}); } }, __('+ Feature','blockenberg')),
                el(TextControl, { label:__('CTA label','blockenberg'), value:c.ctaLabel, onChange:function(v){ onUpdate(idx,{ctaLabel:v}); } }),
                el(TextControl, { label:__('CTA URL','blockenberg'),   value:c.ctaUrl,   onChange:function(v){ onUpdate(idx,{ctaUrl:v}); } }),
                el('div', { style:{ display:'flex', gap:4, marginTop:8 } },
                    el(Button, { isSmall:true, variant:'secondary', disabled:idx===0,       onClick:function(){ onMove(idx,idx-1); } }, '↑'),
                    el(Button, { isSmall:true, variant:'secondary', disabled:idx===total-1, onClick:function(){ onMove(idx,idx+1); } }, '↓'),
                    el(Button, { isSmall:true, isDestructive:true,                           onClick:function(){ onDelete(idx); }   }, __('Delete','blockenberg'))
                )
            )
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

    registerBlockType('blockenberg/use-case-section', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;

            function updateCase(idx, patch) {
                var arr = a.cases.map(function(c,i){ return i===idx ? Object.assign({},c,patch) : c; });
                setAttr({ cases: arr });
            }
            function deleteCase(idx) { setAttr({ cases: a.cases.filter(function(_,i){ return i!==idx; }) }); }
            function moveCase(from, to) {
                var arr = a.cases.slice();
                arr.splice(to, 0, arr.splice(from, 1)[0]);
                setAttr({ cases: arr });
            }
            function addCase() {
                setAttr({ cases: a.cases.concat([{ id:uid(), icon:'⚡', iconType:'custom-char', iconDashicon:'', iconImageUrl:'', title:'New Use Case', description:'Describe who benefits from this.', features:[{id:uid(),text:'Key feature'}], ctaLabel:'Learn more', ctaUrl:'#', accentColor:'#6c3fb5' }]) });
            }

            var blockProps = useBlockProps({ className:'bkbg-usec-wrap', style:wrapStyle(a) });

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title:__('Cases','blockenberg'), initialOpen:true },
                    a.cases.map(function(c,i){ return el(CaseRow, { key:c.id, caseItem:c, index:i, total:a.cases.length, onUpdate:updateCase, onDelete:deleteCase, onMove:moveCase }); }),
                    el(Button, { variant:'primary', onClick:addCase, style:{marginTop:8} }, __('+ Add case','blockenberg'))
                ),
                el(PanelBody, { title:__('Display','blockenberg'), initialOpen:false },
                    el(SelectControl, { label:__('Display style','blockenberg'), value:a.displayStyle, options:[{label:'Cards',value:'cards'},{label:'Tabs',value:'tabs'}], onChange:function(v){ setAttr({displayStyle:v}); } }),
                    el(RangeControl, { label:__('Columns','blockenberg'),       value:a.columns,    min:1, max:4, onChange:function(v){ setAttr({columns:v}); } }),
                    el(RangeControl, { label:__('Gap (px)','blockenberg'),      value:a.gap,        min:0, max:64, onChange:function(v){ setAttr({gap:v}); } }),
                    el(RangeControl, { label:__('Card radius (px)','blockenberg'),  value:a.cardRadius,  min:0, max:32, onChange:function(v){ setAttr({cardRadius:v}); } }),
                    el(RangeControl, { label:__('Card padding (px)','blockenberg'), value:a.cardPadding, min:0, max:64, onChange:function(v){ setAttr({cardPadding:v}); } }),
                    el(RangeControl, { label:__('Icon size (px)','blockenberg'),    value:a.iconSize,    min:16, max:72, onChange:function(v){ setAttr({iconSize:v}); } }),
                    el(ToggleControl, { label:__('Show features','blockenberg'),  checked:a.showFeatures, onChange:function(v){ setAttr({showFeatures:v}); } }),
                    el(ToggleControl, { label:__('Show CTA links','blockenberg'), checked:a.showCta,      onChange:function(v){ setAttr({showCta:v}); } })
                ),
                el(PanelBody, { title:__('Section header','blockenberg'), initialOpen:false },
                    el(ToggleControl, { label:__('Show header','blockenberg'),   checked:a.showHeader,   onChange:function(v){ setAttr({showHeader:v}); } }),
                    el(ToggleControl, { label:__('Show eyebrow','blockenberg'), checked:a.showEyebrow,  onChange:function(v){ setAttr({showEyebrow:v}); } }),
                    el(TextControl,   { label:__('Eyebrow text','blockenberg'), value:a.eyebrow,        onChange:function(v){ setAttr({eyebrow:v}); } }),
                    el(SelectControl, { label:__('Header align','blockenberg'), value:a.headerAlign, options:[{label:'Center',value:'center'},{label:'Left',value:'left'}], onChange:function(v){ setAttr({headerAlign:v}); } }),
                    el(RangeControl, { label:__('Header gap (px)','blockenberg'), value:a.headerGap, min:8, max:96, onChange:function(v){ setAttr({headerGap:v}); } })
                ),
                el(PanelBody, { title:__('Typography','blockenberg'), initialOpen:false },
                    getTypoControl(__('Card Title', 'blockenberg'), 'titleTypo', a, setAttr),
                    getTypoControl(__('Card Description', 'blockenberg'), 'descTypo', a, setAttr)
                ),
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'),    value:a.paddingTop,    min:0, max:200, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:200, onChange:function(v){ setAttr({paddingBottom:v}); } })
                ),
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Section bg','blockenberg'),        value:a.sectionBg,       onChange:function(v){ setAttr({sectionBg:v||''}); }},
                    {label:__('Card bg','blockenberg'),           value:a.cardBg,          onChange:function(v){ setAttr({cardBg:v||''}); }},
                    {label:__('Card border','blockenberg'),       value:a.cardBorder,      onChange:function(v){ setAttr({cardBorder:v||''}); }},
                    {label:__('Title','blockenberg'),             value:a.titleColor,      onChange:function(v){ setAttr({titleColor:v||''}); }},
                    {label:__('Description','blockenberg'),       value:a.descColor,       onChange:function(v){ setAttr({descColor:v||''}); }},
                    {label:__('Feature text','blockenberg'),      value:a.featureColor,    onChange:function(v){ setAttr({featureColor:v||''}); }},
                    {label:__('Check icon','blockenberg'),        value:a.checkColor,      onChange:function(v){ setAttr({checkColor:v||''}); }},
                    {label:__('Eyebrow bg','blockenberg'),        value:a.eyebrowBg,       onChange:function(v){ setAttr({eyebrowBg:v||''}); }},
                    {label:__('Eyebrow text','blockenberg'),      value:a.eyebrowColor,    onChange:function(v){ setAttr({eyebrowColor:v||''}); }},
                    {label:__('Section title','blockenberg'),     value:a.sectionTitleColor,onChange:function(v){ setAttr({sectionTitleColor:v||''}); }},
                    {label:__('Section subtitle','blockenberg'),  value:a.sectionSubColor,  onChange:function(v){ setAttr({sectionSubColor:v||''}); }},
                ] })
            );

            /* render a single card in the editor canvas */
            function renderCard(c) {
                var _iType = c.iconType || 'custom-char';
                var _iconContent = (_iType !== 'custom-char' && IP()) ? IP().buildEditorIcon(_iType, c.icon, c.iconDashicon, c.iconImageUrl, c.iconDashiconColor) : c.icon;
                return el('div', { key:c.id, className:'bkbg-usec-card', style:{'--bkbg-usec-accent': c.accentColor} },
                    el('div', { className:'bkbg-usec-icon-wrap' }, el('span', { className:'bkbg-usec-icon' }, _iconContent)),
                    el('div', { className:'bkbg-usec-title' }, c.title),
                    el('div', { className:'bkbg-usec-desc' }, c.description),
                    a.showFeatures && c.features.length ? el('ul', { className:'bkbg-usec-features' },
                        c.features.map(function(f){ return el('li', { key:f.id }, el('span', { className:'bkbg-usec-check' }, '✓'), f.text); })
                    ) : null,
                    a.showCta ? el('span', { className:'bkbg-usec-cta' }, c.ctaLabel, el('span', { className:'bkbg-usec-cta-arrow' }, ' →')) : null
                );
            }

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    a.showHeader ? el('div', { className:'bkbg-usec-header bkbg-usec-header--' + a.headerAlign },
                        a.showEyebrow ? el('span', { className:'bkbg-usec-eyebrow' }, a.eyebrow) : null,
                        el(RichText, { tagName:'h2', className:'bkbg-usec-section-title', value:a.sectionTitle, onChange:function(v){ setAttr({sectionTitle:v}); }, placeholder:__('Section title…','blockenberg') }),
                        el(RichText, { tagName:'p', className:'bkbg-usec-section-sub', value:a.sectionSubtitle, onChange:function(v){ setAttr({sectionSubtitle:v}); }, placeholder:__('Section subtitle…','blockenberg') })
                    ) : null,
                    el('div', { className:'bkbg-usec-grid' },
                        a.cases.map(renderCard)
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-usec-wrap',
                style: wrapStyle(a),
                'data-display-style': a.displayStyle
            });
            return el('div', blockProps,
                a.showHeader ? el('div', { className:'bkbg-usec-header bkbg-usec-header--' + a.headerAlign },
                    a.showEyebrow ? el('span', { className:'bkbg-usec-eyebrow' }, a.eyebrow) : null,
                    el(RichText.Content, { tagName:'h2', className:'bkbg-usec-section-title', value:a.sectionTitle }),
                    el(RichText.Content, { tagName:'p',  className:'bkbg-usec-section-sub',    value:a.sectionSubtitle })
                ) : null,
                el('div', { className:'bkbg-usec-grid' + (a.displayStyle === 'tabs' ? ' bkbg-usec-grid--tabs' : '') },
                    a.cases.map(function(c) {
                        var _iType = c.iconType || 'custom-char';
                        var _iconContent = (_iType !== 'custom-char' && IP()) ? IP().buildSaveIcon(_iType, c.icon, c.iconDashicon, c.iconImageUrl, c.iconDashiconColor) : c.icon;
                        return el('div', { key:c.id, className:'bkbg-usec-card', style:{'--bkbg-usec-accent': c.accentColor}, 'data-tab-label': c.title },
                            el('div', { className:'bkbg-usec-icon-wrap' }, el('span', { className:'bkbg-usec-icon' }, _iconContent)),
                            el('div', { className:'bkbg-usec-title' }, c.title),
                            el('div', { className:'bkbg-usec-desc' }, c.description),
                            a.showFeatures && c.features.length ? el('ul', { className:'bkbg-usec-features' },
                                c.features.map(function(f){ return el('li', { key:f.id }, el('span', { className:'bkbg-usec-check' }, '✓'), f.text); })
                            ) : null,
                            a.showCta ? el('a', { href:c.ctaUrl, className:'bkbg-usec-cta' }, c.ctaLabel, el('span', { className:'bkbg-usec-cta-arrow' }, ' →')) : null
                        );
                    })
                )
            );
        }
    });
}() );
