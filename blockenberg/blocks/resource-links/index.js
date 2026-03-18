( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    function ResourceCard(item, attr, i, updateItem, removeItem, showArrow) {
        var cardStyle = {
            display:       'flex',
            alignItems:    'center',
            gap:           16,
            background:    attr.cardBg,
            border:        '1px solid ' + attr.cardBorder,
            borderRadius:  attr.borderRadius + 'px',
            padding:       '16px 20px',
            textDecoration: 'none'
        };
        return el('div', { key: i, style: Object.assign({ marginBottom: 12 }, attr.layout === 'grid' ? {} : {}) },
            el('div', { style: cardStyle },
                el('span', { className: 'bkbg-rl-icon', style: { fontSize: attr.iconSize + 'px', flexShrink: 0 } },
                    IP().buildEditorIcon(item.iconType || 'custom-char', item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor)
                ),
                el('div', { style: { flex: 1, minWidth: 0 } },
                    el('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 } },
                        el(RichText, { tagName: 'strong', value: item.title, onChange: function (v) { updateItem(i, 'title', v); }, className: 'bkbg-rl-title', style: { color: attr.titleColor }, placeholder: __('Title', 'blockenberg') }),
                        item.tag && el('span', { style: { background: attr.tagBg, color: attr.tagColor, borderRadius: 4, padding: '1px 8px', fontSize: 11, fontWeight: 600 } }, item.tag)
                    ),
                    el(RichText, { tagName: 'p', value: item.description, onChange: function (v) { updateItem(i, 'description', v); }, className: 'bkbg-rl-desc', style: { color: attr.descColor, margin: 0 }, placeholder: __('Description', 'blockenberg') })
                ),
                showArrow && el('span', { style: { color: attr.arrowColor, fontSize: 20, flexShrink: 0 } }, '→')
            )
        );
    }

    registerBlockType('blockenberg/resource-links', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var TC = getTypoControl();
            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(attr.headingTypo || {}, '--bkrl-ht-'));
                    Object.assign(s, _tvFn(attr.titleTypo || {}, '--bkrl-tt-'));
                    Object.assign(s, _tvFn(attr.bodyTypo || {}, '--bkrl-bt-'));
                }
                return { className: 'bkbg-rl-editor', style: s };
            })());

            function updateItem(i, key, val) {
                var next = attr.items.map(function (item, j) { return j === i ? Object.assign({}, item, { [key]: val }) : item; });
                setAttr({ items: next });
            }

            function removeItem(i) {
                setAttr({ items: attr.items.filter(function (_, j) { return j !== i; }) });
            }

            var previewStyle = { background: attr.bgColor, padding: attr.paddingTop + 'px 40px ' + attr.paddingBottom + 'px' };
            var innerStyle = { maxWidth: attr.maxWidth + 'px', margin: '0 auto' };
            var gridStyle = attr.layout === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(' + attr.columns + ', 1fr)', gap: 16 } : {};

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Section', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Heading', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showHeading, onChange: function (v) { setAttr({ showHeading: v }); } }),
                        el(ToggleControl, { label: __('Show Subtext', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showSubtext, onChange: function (v) { setAttr({ showSubtext: v }); } }),
                        el(SelectControl, { label: __('Layout', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.layout,
                            options: [{ label: 'List', value: 'list' }, { label: 'Grid', value: 'grid' }],
                            onChange: function (v) { setAttr({ layout: v }); } }),
                        attr.layout === 'grid' && el(RangeControl, { label: __('Columns', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.columns, min: 1, max: 4, onChange: function (v) { setAttr({ columns: v }); } }),
                        el(ToggleControl, { label: __('Open Links in New Tab', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.openNewTab, onChange: function (v) { setAttr({ openNewTab: v }); } }),
                        el(ToggleControl, { label: __('Show Arrow →', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showArrow, onChange: function (v) { setAttr({ showArrow: v }); } })
                    ),
                    el(PanelBody, { title: __('Items', 'blockenberg'), initialOpen: false },
                        attr.items.map(function (item, i) {
                            return el('div', { key: i, style: { borderLeft: '3px solid #7c3aed', paddingLeft: 8, marginBottom: 12 } },
                                el(IP().IconPickerControl, IP().iconPickerProps(item, function (key, val) { updateItem(i, key, val); }, { label: __('Icon', 'blockenberg') + ' ' + (i + 1), typeAttr: 'iconType', dashiconAttr: 'iconDashicon', imageUrlAttr: 'iconImageUrl' })),
                                el(TextControl, { label: __('Title', 'blockenberg'), __nextHasNoMarginBottom: true, value: item.title, onChange: function (v) { updateItem(i, 'title', v); } }),
                                el(TextControl, { label: __('Description', 'blockenberg'), __nextHasNoMarginBottom: true, value: item.description, onChange: function (v) { updateItem(i, 'description', v); } }),
                                el(TextControl, { label: __('URL', 'blockenberg'), __nextHasNoMarginBottom: true, value: item.url, onChange: function (v) { updateItem(i, 'url', v); } }),
                                el(TextControl, { label: __('Type Tag', 'blockenberg'), __nextHasNoMarginBottom: true, value: item.tag, onChange: function (v) { updateItem(i, 'tag', v); } }),
                                attr.items.length > 1 && el(Button, { onClick: function () { removeItem(i); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true }, __('Remove', 'blockenberg'))
                            );
                        }),
                        el(Button, { onClick: function () { setAttr({ items: attr.items.concat([{ icon: '🔗', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', title: 'New Resource', description: '', url: '#', tag: 'Link' }]) }); }, variant: 'secondary', __nextHasNoMarginBottom: true }, __('+ Add Item', 'blockenberg'))
                    ),
                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Icon Size (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.iconSize, min: 14, max: 48, onChange: function (v) { setAttr({ iconSize: v }); } }),
                        el(RangeControl, { label: __('Card Radius (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.borderRadius, min: 0, max: 24, onChange: function (v) { setAttr({ borderRadius: v }); } }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.maxWidth, min: 400, max: 1400, step: 10, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); } })
                    ),
                    
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        TC && el(TC, { label: __('Heading', 'blockenberg'), value: attr.headingTypo || {}, onChange: function(v) { setAttr({ headingTypo: v }); } }),
                        TC && el(TC, { label: __('Item Title', 'blockenberg'), value: attr.titleTypo || {}, onChange: function(v) { setAttr({ titleTypo: v }); } }),
                        TC && el(TC, { label: __('Description', 'blockenberg'), value: attr.bodyTypo || {}, onChange: function(v) { setAttr({ bodyTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: attr.bgColor,      onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); },      label: __('Page Background', 'blockenberg') },
                            { value: attr.cardBg,       onChange: function (v) { setAttr({ cardBg: v || '#f9fafb' }); },       label: __('Card Background', 'blockenberg') },
                            { value: attr.cardBorder,   onChange: function (v) { setAttr({ cardBorder: v || '#e5e7eb' }); },   label: __('Card Border', 'blockenberg') },
                            { value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); }, label: __('Heading', 'blockenberg') },
                            { value: attr.subtextColor, onChange: function (v) { setAttr({ subtextColor: v || '#6b7280' }); }, label: __('Subtext', 'blockenberg') },
                            { value: attr.titleColor,   onChange: function (v) { setAttr({ titleColor: v || '#111827' }); },   label: __('Item Title', 'blockenberg') },
                            { value: attr.descColor,    onChange: function (v) { setAttr({ descColor: v || '#6b7280' }); },    label: __('Item Desc', 'blockenberg') },
                            { value: attr.tagBg,        onChange: function (v) { setAttr({ tagBg: v || '#ede9fe' }); },        label: __('Tag Background', 'blockenberg') },
                            { value: attr.tagColor,     onChange: function (v) { setAttr({ tagColor: v || '#7c3aed' }); },     label: __('Tag Text', 'blockenberg') },
                            { value: attr.arrowColor,   onChange: function (v) { setAttr({ arrowColor: v || '#9ca3af' }); },   label: __('Arrow', 'blockenberg') },
                            { value: attr.hoverBg,      onChange: function (v) { setAttr({ hoverBg: v || '#f3f0ff' }); },      label: __('Card Hover BG', 'blockenberg') }
                        ]
                    })
                ),
                el('div', blockProps,
                    el('div', { style: previewStyle },
                        el('div', { style: innerStyle },
                            attr.showHeading && el(RichText, { tagName: 'h2', value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, className: 'bkbg-rl-heading', style: { color: attr.headingColor, margin: '0 0 8px' }, placeholder: __('Section heading…', 'blockenberg') }),
                            attr.showSubtext && el(RichText, { tagName: 'p', value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, style: { fontSize: 16 + 'px', color: attr.subtextColor, margin: '0 0 32px', lineHeight: 1.6 }, placeholder: __('Subtitle…', 'blockenberg') }),
                            el('div', { style: gridStyle },
                                attr.items.map(function (item, i) { return ResourceCard(item, attr, i, updateItem, removeItem, attr.showArrow); })
                            )
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-resource-links-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
