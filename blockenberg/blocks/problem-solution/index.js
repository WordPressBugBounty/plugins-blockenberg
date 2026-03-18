/* ====================================================
   Problem / Solution Block — editor (index.js)
   Block: blockenberg/problem-solution
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

    function buildTypoVars(a) {
        var fn = getTypoCssVars();
        if (!fn) return {};
        var v = {};
        Object.assign(v, fn(a.titleTypo || {}, '--bkbg-psol-tt-'));
        Object.assign(v, fn(a.itemTypo || {}, '--bkbg-psol-it-'));
        Object.assign(v, fn(a.labelTypo || {}, '--bkbg-psol-lb-'));
        return v;
    }

    function uid() { return 'p' + Math.random().toString(36).slice(2, 7); }

    function buildWrapStyle(a) {
        return {
            '--bkbg-psol-gap':       a.gap + 'px',
            '--bkbg-psol-radius':    a.borderRadius + 'px',
            '--bkbg-psol-icon-size': a.iconSize + 'px',
            '--bkbg-psol-pv':        a.paddingV + 'px',
            '--bkbg-psol-ph':        a.paddingH + 'px',
            '--bkbg-psol-spacing':   a.itemSpacing + 'px',
            '--bkbg-psol-prob-bg':   a.problemBg,
            '--bkbg-psol-prob-color':a.problemColor,
            '--bkbg-psol-prob-icbg': a.problemIconBg,
            '--bkbg-psol-sol-bg':    a.solutionBg,
            '--bkbg-psol-sol-color': a.solutionColor,
            '--bkbg-psol-sol-icbg':  a.solutionIconBg,
            '--bkbg-psol-div-bg':    a.dividerBg,
            '--bkbg-psol-div-text':  a.dividerTextColor,
        };
    }

    /* ── Items editor inside inspector ── */
    function ItemsEditor(props) {
        var items    = props.items;
        var onChange = props.onChange;
        var label    = props.label;
        return el('div', null,
            el('strong', { style:{ display:'block', marginBottom:'6px', fontSize:'12px' }}, label),
            items.map(function(item, i) {
                return el('div', { key: item.id, style:{ display:'flex', gap:'4px', marginBottom:'4px', alignItems:'center' } },
                    el(TextControl, { value: item.text, onChange:function(v){ var n=items.slice(); n[i]=Object.assign({},item,{text:v}); onChange(n); }, style:{ flex:1 } }),
                    el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, label:__('Remove','blockenberg'), onClick:function(){ onChange(items.filter(function(_,j){ return j!==i; })); } })
                );
            }),
            el(Button, { variant:'secondary', isSmall:true, style:{ marginTop:'4px', width:'100%' },
                onClick:function(){ onChange(items.concat([{id:uid(),text:'New item'}])); }
            }, __('+ Add item','blockenberg'))
        );
    }

    /* ── Column render ── */
    function PanelCol(props) {
        var a        = props.a;
        var side     = props.side; /* 'problem' | 'solution' */
        var isEdit   = props.isEdit;
        var setAttr  = props.setAttr;

        var icon     = side === 'problem' ? a.problemIcon  : a.solutionIcon;
        var iconType = side === 'problem' ? (a.problemIconType || 'custom-char') : (a.solutionIconType || 'custom-char');
        var iconDash = side === 'problem' ? a.problemIconDashicon : a.solutionIconDashicon;
        var iconImg  = side === 'problem' ? a.problemIconImageUrl : a.solutionIconImageUrl;
        var label    = side === 'problem' ? a.problemLabel : a.solutionLabel;
        var title    = side === 'problem' ? a.problemTitle : a.solutionTitle;
        var items    = side === 'problem' ? a.problemItems : a.solutionItems;
        var itemIcon = side === 'problem' ? a.problemItemIcon : a.solutionItemIcon;
        var itemIconType = side === 'problem' ? (a.problemItemIconType || 'custom-char') : (a.solutionItemIconType || 'custom-char');
        var itemIconDash = side === 'problem' ? a.problemItemIconDashicon : a.solutionItemIconDashicon;
        var itemIconImg  = side === 'problem' ? a.problemItemIconImageUrl : a.solutionItemIconImageUrl;
        var iconDashColor = side === 'problem' ? a.problemIconDashiconColor : a.solutionIconDashiconColor;
        var itemIconDashColor = side === 'problem' ? a.problemItemIconDashiconColor : a.solutionItemIconDashiconColor;
        var colorCls = 'bkbg-psol-col bkbg-psol-col--' + side;

        var itemEls = items.map(function(item) {
            return el('li', { key: item.id, className: 'bkbg-psol-item' },
                el('span', { className: 'bkbg-psol-item-icon' }, itemIconType !== 'custom-char' ? IP().buildEditorIcon(itemIconType, itemIcon, itemIconDash, itemIconImg, itemIconDashColor) : itemIcon),
                el('span', { className: 'bkbg-psol-item-text' }, item.text)
            );
        });

        var labelEl  = a.showLabels ? el('span', { className: 'bkbg-psol-label' }, label) : null;
        var iconEl   = el('span', { className: 'bkbg-psol-col-icon' }, iconType !== 'custom-char' ? IP().buildEditorIcon(iconType, icon, iconDash, iconImg, iconDashColor) : icon);
        var titleEl  = isEdit
            ? el(RichText, { tagName:'h3', className:'bkbg-psol-title', value:title, onChange:function(v){ var p={}; p[side==='problem'?'problemTitle':'solutionTitle']=v; setAttr(p); }, placeholder:__('Title…','blockenberg') })
            : el(RichText.Content, { tagName:'h3', className:'bkbg-psol-title', value:title });

        return el('div', { className: colorCls },
            el('div', { className: 'bkbg-psol-col-header' },
                iconEl,
                el('div', { className: 'bkbg-psol-col-meta' },
                    labelEl,
                    titleEl
                )
            ),
            el('ul', { className: 'bkbg-psol-list' }, itemEls)
        );
    }

    /* ── REGISTER ── */
    registerBlockType('blockenberg/problem-solution', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;
            var style   = buildWrapStyle(a);
            var blockProps = useBlockProps({ className:'bkbg-psol-wrap bkbg-psol-style--' + a.style, style: Object.assign({}, style, buildTypoVars(a)) });

            var inspector = el(InspectorControls, null,
                /* Style */
                el(PanelBody, { title:__('Style','blockenberg'), initialOpen:true },
                    el(SelectControl, { label:__('Visual style','blockenberg'), value:a.style, options:[
                        {label:__('Split (full-color columns)','blockenberg'), value:'split'},
                        {label:__('Cards (white bg + border)','blockenberg'), value:'cards'},
                        {label:__('Bordered (outline only)','blockenberg'), value:'bordered'},
                        {label:__('Minimal (subtle tint)','blockenberg'), value:'minimal'},
                    ], onChange:function(v){ setAttr({style:v}); } }),
                    el(ToggleControl, { label:__('Show column labels','blockenberg'), checked:a.showLabels, onChange:function(v){ setAttr({showLabels:v}); } }),
                    el(ToggleControl, { label:__('Show "vs" divider','blockenberg'), checked:a.showDivider, onChange:function(v){ setAttr({showDivider:v}); } }),
                    a.showDivider ? el(TextControl, { label:__('Divider label','blockenberg'), value:a.dividerLabel, onChange:function(v){ setAttr({dividerLabel:v}); } }) : null,
                    a.showDivider ? el(ToggleControl, { label:__('Rotate divider text vertically','blockenberg'), checked:a.dividerVertical, onChange:function(v){ setAttr({dividerVertical:v}); } }) : null,
                    a.showDivider ? el(ToggleControl, { label:__('Rotate divider on mobile only','blockenberg'), checked:a.dividerMobileRotate, onChange:function(v){ setAttr({dividerMobileRotate:v}); } }) : null
                ),

                /* Problem column */
                el(PanelBody, { title:__('Problem column','blockenberg'), initialOpen:false },
                    el(IP().IconPickerControl, IP().iconPickerProps(attr, setAttr, { charAttr: 'problemIcon', typeAttr: 'problemIconType', dashiconAttr: 'problemIconDashicon', imageUrlAttr: 'problemIconImageUrl', colorAttr: 'problemIconDashiconColor' })),
                    el(TextControl, { label:__('Label text','blockenberg'),  value:a.problemLabel,    onChange:function(v){ setAttr({problemLabel:v}); } }),
                    el(IP().IconPickerControl, IP().iconPickerProps(attr, setAttr, { charAttr: 'problemItemIcon', typeAttr: 'problemItemIconType', dashiconAttr: 'problemItemIconDashicon', imageUrlAttr: 'problemItemIconImageUrl', colorAttr: 'problemItemIconDashiconColor' })),
                    el(ItemsEditor, { items:a.problemItems, onChange:function(v){ setAttr({problemItems:v}); }, label:__('Problem items','blockenberg') })
                ),

                /* Solution column */
                el(PanelBody, { title:__('Solution column','blockenberg'), initialOpen:false },
                    el(IP().IconPickerControl, IP().iconPickerProps(attr, setAttr, { charAttr: 'solutionIcon', typeAttr: 'solutionIconType', dashiconAttr: 'solutionIconDashicon', imageUrlAttr: 'solutionIconImageUrl', colorAttr: 'solutionIconDashiconColor' })),
                    el(TextControl, { label:__('Label text','blockenberg'),  value:a.solutionLabel,    onChange:function(v){ setAttr({solutionLabel:v}); } }),
                    el(IP().IconPickerControl, IP().iconPickerProps(attr, setAttr, { charAttr: 'solutionItemIcon', typeAttr: 'solutionItemIconType', dashiconAttr: 'solutionItemIconDashicon', imageUrlAttr: 'solutionItemIconImageUrl', colorAttr: 'solutionItemIconDashiconColor' })),
                    el(ItemsEditor, { items:a.solutionItems, onChange:function(v){ setAttr({solutionItems:v}); }, label:__('Solution items','blockenberg') })
                ),

                /* Spacing */
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Column gap (px)','blockenberg'),     value:a.gap,          min:0, max:60, onChange:function(v){ setAttr({gap:v}); } }),
                    el(RangeControl, { label:__('Column padding V (px)','blockenberg'), value:a.paddingV,   min:0, max:80, onChange:function(v){ setAttr({paddingV:v}); } }),
                    el(RangeControl, { label:__('Column padding H (px)','blockenberg'), value:a.paddingH,   min:0, max:80, onChange:function(v){ setAttr({paddingH:v}); } }),
                    el(RangeControl, { label:__('Item spacing (px)','blockenberg'),   value:a.itemSpacing,  min:4, max:32, onChange:function(v){ setAttr({itemSpacing:v}); } }),
                    el(RangeControl, { label:__('Border radius (px)','blockenberg'),  value:a.borderRadius, min:0, max:40, onChange:function(v){ setAttr({borderRadius:v}); } })
                ),

                /* Typography */
                el(PanelBody, { title:__('Typography','blockenberg'), initialOpen:false },
                    (function () {
                        var TC = getTypoControl();
                        if (!TC) return el('p', null, 'Loading…');
                        return el(Fragment, null,
                            el(TC, { label: 'Title', value: a.titleTypo, onChange: function (v) { setAttr({ titleTypo: v }); } }),
                            el(TC, { label: 'Item', value: a.itemTypo, onChange: function (v) { setAttr({ itemTypo: v }); } }),
                            el(TC, { label: 'Label', value: a.labelTypo, onChange: function (v) { setAttr({ labelTypo: v }); } })
                        );
                    })(),
                    el(RangeControl, { label:__('Icon size (px)','blockenberg'), value:a.iconSize, min:20, max:80, onChange:function(v){ setAttr({iconSize:v}); } })
                ),

                /* Colors */
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Problem bg','blockenberg'),         value:a.problemBg,       onChange:function(v){ setAttr({problemBg:v||''}); }},
                    {label:__('Problem text','blockenberg'),       value:a.problemColor,    onChange:function(v){ setAttr({problemColor:v||''}); }},
                    {label:__('Problem icon bg','blockenberg'),    value:a.problemIconBg,   onChange:function(v){ setAttr({problemIconBg:v||''}); }},
                    {label:__('Solution bg','blockenberg'),        value:a.solutionBg,      onChange:function(v){ setAttr({solutionBg:v||''}); }},
                    {label:__('Solution text','blockenberg'),      value:a.solutionColor,   onChange:function(v){ setAttr({solutionColor:v||''}); }},
                    {label:__('Solution icon bg','blockenberg'),   value:a.solutionIconBg,  onChange:function(v){ setAttr({solutionIconBg:v||''}); }},
                    {label:__('Divider bg','blockenberg'),         value:a.dividerBg,       onChange:function(v){ setAttr({dividerBg:v||''}); }},
                    {label:__('Divider text','blockenberg'),       value:a.dividerTextColor,onChange:function(v){ setAttr({dividerTextColor:v||''}); }},
                ] })
            );

            var dividerCls = 'bkbg-psol-divider' + (a.dividerVertical ? ' bkbg-psol-divider--vertical' : '') + (a.dividerMobileRotate ? ' bkbg-psol-divider--mobile-rotate' : '');
            var dividerEl = a.showDivider ? el('div', { className: dividerCls },
                el('span', { className:'bkbg-psol-divider-label', style: a.dividerVertical ? { writingMode:'vertical-rl', textOrientation:'mixed' } : {} }, a.dividerLabel)
            ) : null;

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el(PanelCol, { a:a, side:'problem', isEdit:true, setAttr:setAttr }),
                    dividerEl,
                    el(PanelCol, { a:a, side:'solution', isEdit:true, setAttr:setAttr })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ className:'bkbg-psol-wrap bkbg-psol-style--' + a.style, style: Object.assign({}, buildWrapStyle(a), buildTypoVars(a)) });

            function saveCol(side) {
                var icon     = side === 'problem' ? a.problemIcon  : a.solutionIcon;
                var iconType = side === 'problem' ? (a.problemIconType || 'custom-char') : (a.solutionIconType || 'custom-char');
                var iconDash = side === 'problem' ? a.problemIconDashicon : a.solutionIconDashicon;
                var iconImg  = side === 'problem' ? a.problemIconImageUrl : a.solutionIconImageUrl;
                var iconDashColor = side === 'problem' ? a.problemIconDashiconColor : a.solutionIconDashiconColor;
                var label    = side === 'problem' ? a.problemLabel : a.solutionLabel;
                var title    = side === 'problem' ? a.problemTitle : a.solutionTitle;
                var items    = side === 'problem' ? a.problemItems : a.solutionItems;
                var itemIcon = side === 'problem' ? a.problemItemIcon : a.solutionItemIcon;
                var itemIconType = side === 'problem' ? (a.problemItemIconType || 'custom-char') : (a.solutionItemIconType || 'custom-char');
                var itemIconDash = side === 'problem' ? a.problemItemIconDashicon : a.solutionItemIconDashicon;
                var itemIconImg  = side === 'problem' ? a.problemItemIconImageUrl : a.solutionItemIconImageUrl;
                var itemIconDashColor = side === 'problem' ? a.problemItemIconDashiconColor : a.solutionItemIconDashiconColor;
                return el('div', { className:'bkbg-psol-col bkbg-psol-col--' + side },
                    el('div', { className:'bkbg-psol-col-header' },
                        el('span', { className:'bkbg-psol-col-icon' }, iconType !== 'custom-char' ? IP().buildSaveIcon(iconType, icon, iconDash, iconImg, iconDashColor) : icon),
                        el('div', { className:'bkbg-psol-col-meta' },
                            a.showLabels ? el('span', { className:'bkbg-psol-label' }, label) : null,
                            el(RichText.Content, { tagName:'h3', className:'bkbg-psol-title', value:title })
                        )
                    ),
                    el('ul', { className:'bkbg-psol-list' },
                        items.map(function(item) {
                            return el('li', { key:item.id, className:'bkbg-psol-item' },
                                el('span', { className:'bkbg-psol-item-icon' }, itemIconType !== 'custom-char' ? IP().buildSaveIcon(itemIconType, itemIcon, itemIconDash, itemIconImg, itemIconDashColor) : itemIcon),
                                el('span', { className:'bkbg-psol-item-text' }, item.text)
                            );
                        })
                    )
                );
            }

            return el('div', blockProps,
                saveCol('problem'),
                a.showDivider ? el('div', { className:'bkbg-psol-divider' + (a.dividerVertical ? ' bkbg-psol-divider--vertical' : '') + (a.dividerMobileRotate ? ' bkbg-psol-divider--mobile-rotate' : '') }, el('span', { className:'bkbg-psol-divider-label', style: a.dividerVertical ? { writingMode:'vertical-rl', textOrientation:'mixed' } : {} }, a.dividerLabel)) : null,
                saveCol('solution')
            );
        },

        deprecated: [{
            attributes: {
                style: { type: "string", default: "split" },
                problemIcon: { type: "string", default: "😩" },
                problemLabel: { type: "string", default: "The Problem" },
                problemTitle: { type: "string", default: "Struggling with the old way?" },
                problemItems: { type: "array", default: [
                    { id: "pi1", text: "Wasted hours on repetitive manual tasks" },
                    { id: "pi2", text: "Disconnected tools that don't work together" },
                    { id: "pi3", text: "Teams burned out from context-switching" },
                    { id: "pi4", text: "Unreliable results and missed deadlines" },
                    { id: "pi5", text: "No clear visibility into project status" }
                ]},
                problemBg: { type: "string", default: "#fff1f2" },
                problemColor: { type: "string", default: "#9f1239" },
                problemIconBg: { type: "string", default: "#fecdd3" },
                problemItemIcon: { type: "string", default: "✕" },
                solutionIcon: { type: "string", default: "🎯" },
                solutionLabel: { type: "string", default: "The Solution" },
                solutionTitle: { type: "string", default: "Meet a smarter way forward." },
                solutionItems: { type: "array", default: [
                    { id: "si1", text: "Automate workflows in minutes, not months" },
                    { id: "si2", text: "All your tools, unified in one platform" },
                    { id: "si3", text: "Teams focus on what actually moves the needle" },
                    { id: "si4", text: "Consistent, predictable results every time" },
                    { id: "si5", text: "Real-time dashboards with full transparency" }
                ]},
                solutionBg: { type: "string", default: "#f0fdf4" },
                solutionColor: { type: "string", default: "#14532d" },
                solutionIconBg: { type: "string", default: "#bbf7d0" },
                solutionItemIcon: { type: "string", default: "✓" },
                dividerLabel: { type: "string", default: "vs" },
                dividerVertical: { type: "boolean", default: false },
                dividerMobileRotate: { type: "boolean", default: true },
                showDivider: { type: "boolean", default: true },
                showLabels: { type: "boolean", default: true },
                gap: { type: "number", default: 24 },
                borderRadius: { type: "number", default: 20 },
                itemFontSize: { type: "number", default: 15 },
                titleFontSize: { type: "number", default: 22 },
                labelFontSize: { type: "number", default: 11 },
                iconSize: { type: "number", default: 40 },
                paddingV: { type: "number", default: 40 },
                paddingH: { type: "number", default: 40 },
                itemSpacing: { type: "number", default: 12 },
                dividerBg: { type: "string", default: "#ffffff" },
                dividerTextColor: { type: "string", default: "#334155" },
                titleFontWeight: { type: "string", default: "700" },
                itemFontWeight: { type: "string", default: "400" },
                labelFontWeight: { type: "string", default: "700" }
            },
            save: function (props) {
                var a = props.attributes;
                function oldBuildWrapStyle(a) {
                    return {
                        '--bkbg-psol-gap':       a.gap + 'px',
                        '--bkbg-psol-radius':    a.borderRadius + 'px',
                        '--bkbg-psol-item-font': a.itemFontSize + 'px',
                        '--bkbg-psol-title-font':a.titleFontSize + 'px',
                        '--bkbg-psol-label-font':a.labelFontSize + 'px',
                        '--bkbg-psol-icon-size': a.iconSize + 'px',
                        '--bkbg-psol-pv':        a.paddingV + 'px',
                        '--bkbg-psol-ph':        a.paddingH + 'px',
                        '--bkbg-psol-spacing':   a.itemSpacing + 'px',
                        '--bkbg-psol-prob-bg':   a.problemBg,
                        '--bkbg-psol-prob-color':a.problemColor,
                        '--bkbg-psol-prob-icbg': a.problemIconBg,
                        '--bkbg-psol-sol-bg':    a.solutionBg,
                        '--bkbg-psol-sol-color': a.solutionColor,
                        '--bkbg-psol-sol-icbg':  a.solutionIconBg,
                        '--bkbg-psol-div-bg':    a.dividerBg,
                        '--bkbg-psol-div-text':  a.dividerTextColor,
                    };
                }
                var blockProps = wp.blockEditor.useBlockProps.save({ className:'bkbg-psol-wrap bkbg-psol-style--' + a.style, style: oldBuildWrapStyle(a) });
                function saveCol(side) {
                    var icon     = side === 'problem' ? a.problemIcon  : a.solutionIcon;
                    var label    = side === 'problem' ? a.problemLabel : a.solutionLabel;
                    var title    = side === 'problem' ? a.problemTitle : a.solutionTitle;
                    var items    = side === 'problem' ? a.problemItems : a.solutionItems;
                    var itemIcon = side === 'problem' ? a.problemItemIcon : a.solutionItemIcon;
                    return el('div', { className:'bkbg-psol-col bkbg-psol-col--' + side },
                        el('div', { className:'bkbg-psol-col-header' },
                            el('span', { className:'bkbg-psol-col-icon' }, icon),
                            el('div', { className:'bkbg-psol-col-meta' },
                                a.showLabels ? el('span', { className:'bkbg-psol-label' }, label) : null,
                                el(RichText.Content, { tagName:'h3', className:'bkbg-psol-title', value:title })
                            )
                        ),
                        el('ul', { className:'bkbg-psol-list' },
                            items.map(function(item) {
                                return el('li', { key:item.id, className:'bkbg-psol-item' },
                                    el('span', { className:'bkbg-psol-item-icon' }, itemIcon),
                                    el('span', { className:'bkbg-psol-item-text' }, item.text)
                                );
                            })
                        )
                    );
                }
                return el('div', blockProps,
                    saveCol('problem'),
                    a.showDivider ? el('div', { className:'bkbg-psol-divider' + (a.dividerVertical ? ' bkbg-psol-divider--vertical' : '') + (a.dividerMobileRotate ? ' bkbg-psol-divider--mobile-rotate' : '') }, el('span', { className:'bkbg-psol-divider-label', style: a.dividerVertical ? { writingMode:'vertical-rl', textOrientation:'mixed' } : {} }, a.dividerLabel)) : null,
                    saveCol('solution')
                );
            },
            migrate: function (attrs) {
                var n = Object.assign({}, attrs);
                n.titleTypo = { sizeDesktop: attrs.titleFontSize || 22, weight: attrs.titleFontWeight || '700' };
                n.itemTypo = { sizeDesktop: attrs.itemFontSize || 15, weight: attrs.itemFontWeight || '400' };
                n.labelTypo = { sizeDesktop: attrs.labelFontSize || 11, weight: attrs.labelFontWeight || '700' };
                delete n.titleFontSize; delete n.titleFontWeight;
                delete n.itemFontSize; delete n.itemFontWeight;
                delete n.labelFontSize; delete n.labelFontWeight;
                return n;
            }
        }]
    });
}() );
