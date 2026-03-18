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
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;
    var useState = wp.element.useState;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var IP = function () { return window.bkbgIconPicker; };

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

    registerBlockType('blockenberg/icon-list', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-il-editor' });

            function updateItem(i, key, val) {
                var next = attr.items.map(function (item, j) {
                    return j === i ? Object.assign({}, item, { [key]: val }) : item;
                });
                setAttr({ items: next });
            }

            function removeItem(i) {
                setAttr({ items: attr.items.filter(function (_, j) { return j !== i; }) });
            }

            var isGrid = attr.layout === 'grid';
            var listStyle = isGrid
                ? { display: 'grid', gridTemplateColumns: 'repeat(' + attr.columns + ', 1fr)', gap: attr.gap + 'px' }
                : { display: 'flex', flexDirection: 'column', gap: attr.gap + 'px' };

            function itemEl(item, i) {
                var isBoxed = attr.itemStyle === 'boxed';
                var isBordered = attr.itemStyle === 'bordered';
                var itemStyle = {
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: isBoxed || isBordered ? '16px 20px' : '8px 0',
                    background: isBoxed ? attr.itemBg : 'transparent',
                    borderRadius: isBoxed ? attr.borderRadius + 'px' : 0,
                    border: isBordered ? ('1px solid ' + attr.borderColor) : (isBoxed ? '1px solid ' + attr.borderColor : (attr.showDivider && i < attr.items.length - 1 ? ('0 0 1px 0 solid ' + attr.dividerColor) : 'none')),
                    borderBottom: attr.showDivider && !isGrid && !isBoxed && !isBordered && i < attr.items.length - 1 ? ('1px solid ' + attr.dividerColor) : undefined
                };
                var iconStyle = {
                    fontSize: attr.iconSize + 'px',
                    lineHeight: 1,
                    flexShrink: 0,
                    color: item.iconColor || attr.iconColor,
                    marginTop: 2
                };
                return el('div', { key: i, style: itemStyle },
                    el('span', { style: iconStyle },
                        (item.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(item.iconType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor) : item.icon
                    ),
                    el('div', { style: { flex: 1, minWidth: 0 } },
                        el('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 } },
                            el(RichText, { tagName: 'strong', className: 'bkbg-il-title', value: item.title, onChange: function (v) { updateItem(i, 'title', v); },
                                style: { color: attr.titleColor },
                                placeholder: __('Feature title…', 'blockenberg') }),
                            attr.showBadge && item.badge && el('span', { style: { background: attr.badgeBg, color: attr.badgeColor, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 } }, item.badge)
                        ),
                        attr.showDesc && el(RichText, { tagName: 'p', className: 'bkbg-il-desc', value: item.description, onChange: function (v) { updateItem(i, 'description', v); },
                            style: { color: attr.descColor, margin: 0 },
                            placeholder: __('Description…', 'blockenberg') })
                    )
                );
            }

            var wrapStyle = {
                background: attr.bgColor,
                paddingTop: attr.paddingTop + 'px',
                paddingBottom: attr.paddingBottom + 'px',
                '--bkbg-il-heading-sz': (attr.headingSize || 32) + 'px',
                '--bkbg-il-title-sz': (attr.titleSize || 17) + 'px',
                '--bkbg-il-desc-sz': (attr.descSize || 14) + 'px'
            };
            var _tv = getTypoCssVars();
            if (_tv) {
                Object.assign(wrapStyle, _tv(attr.headingTypo, '--bkbg-il-hd-'));
                Object.assign(wrapStyle, _tv(attr.titleTypo, '--bkbg-il-tt-'));
                Object.assign(wrapStyle, _tv(attr.descTypo, '--bkbg-il-ds-'));
            }
            var innerStyle = { maxWidth: attr.maxWidth + 'px', margin: '0 auto', padding: '0 20px' };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Layout', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.layout,
                            options: [{ label: __('List (vertical)', 'blockenberg'), value: 'list' }, { label: __('Grid', 'blockenberg'), value: 'grid' }],
                            onChange: function (v) { setAttr({ layout: v }); } }),
                        isGrid && el(RangeControl, { label: __('Columns', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.columns, min: 1, max: 4, onChange: function (v) { setAttr({ columns: v }); } }),
                        el(SelectControl, { label: __('Item Style', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.itemStyle,
                            options: [{ label: __('Boxed (card)', 'blockenberg'), value: 'boxed' }, { label: __('Bordered', 'blockenberg'), value: 'bordered' }, { label: __('Plain', 'blockenberg'), value: 'plain' }],
                            onChange: function (v) { setAttr({ itemStyle: v }); } }),
                        el(ToggleControl, { label: __('Show Heading', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showHeading, onChange: function (v) { setAttr({ showHeading: v }); } }),
                        el(ToggleControl, { label: __('Show Subtext', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showSubtext, onChange: function (v) { setAttr({ showSubtext: v }); } }),
                        el(ToggleControl, { label: __('Show Badges', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showBadge, onChange: function (v) { setAttr({ showBadge: v }); } }),
                        el(ToggleControl, { label: __('Show Descriptions', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showDesc, onChange: function (v) { setAttr({ showDesc: v }); } }),
                        !isGrid && attr.itemStyle === 'plain' && el(ToggleControl, { label: __('Dividers Between Items', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showDivider, onChange: function (v) { setAttr({ showDivider: v }); } })
                    ),
                    el(PanelBody, { title: __('Items', 'blockenberg'), initialOpen: false },
                        attr.items.map(function (item, i) {
                            return el('div', { key: i, style: { borderLeft: '3px solid ' + attr.iconColor, paddingLeft: 8, marginBottom: 12 } },
                                el(IP().IconPickerControl, { iconType: item.iconType || 'custom-char', customChar: item.icon, dashicon: item.iconDashicon || '', imageUrl: item.iconImageUrl || '',
                                    onChangeType: function (v) { updateItem(i, 'iconType', v); }, onChangeChar: function (v) { updateItem(i, 'icon', v); },
                                    onChangeDashicon: function (v) { updateItem(i, 'iconDashicon', v); }, onChangeImageUrl: function (v) { updateItem(i, 'iconImageUrl', v); } }),
                                el(TextControl, { label: __('Title'), __nextHasNoMarginBottom: true, value: item.title, onChange: function (v) { updateItem(i, 'title', v); } }),
                                el(TextControl, { label: __('Description'), __nextHasNoMarginBottom: true, value: item.description, onChange: function (v) { updateItem(i, 'description', v); } }),
                                el(TextControl, { label: __('Badge/Tag'), __nextHasNoMarginBottom: true, value: item.badge, onChange: function (v) { updateItem(i, 'badge', v); } }),
                                el(BkbgColorSwatch, { label: __('Custom Icon Color (hex)'), value: item.iconColor, onChange: function (v) { updateItem(i, 'iconColor', v); } }),
                                attr.items.length > 1 && el(Button, { onClick: function () { removeItem(i); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true }, __('Remove', 'blockenberg'))
                            );
                        }),
                        el(Button, { onClick: function () { setAttr({ items: attr.items.concat([{ icon: '✨', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', title: 'New Feature', description: 'Describe this feature here.', badge: 'New', iconColor: '' }]) }); }, variant: 'secondary', __nextHasNoMarginBottom: true }, __('+ Add Item', 'blockenberg'))
                    ),
                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Icon Size (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.iconSize, min: 14, max: 56, onChange: function (v) { setAttr({ iconSize: v }); } }),
                        el(RangeControl, { label: __('Item Gap (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.gap, min: 0, max: 48, onChange: function (v) { setAttr({ gap: v }); } }),
                        el(RangeControl, { label: __('Card Radius (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.borderRadius, min: 0, max: 24, onChange: function (v) { setAttr({ borderRadius: v }); } }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.maxWidth, min: 400, max: 1400, step: 10, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypographyControl() && el(getTypographyControl(), { label: __('Heading', 'blockenberg'), typo: attr.headingTypo || {}, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                        getTypographyControl() && el(getTypographyControl(), { label: __('Title', 'blockenberg'), typo: attr.titleTypo || {}, onChange: function (v) { setAttr({ titleTypo: v }); } }),
                        getTypographyControl() && el(getTypographyControl(), { label: __('Description', 'blockenberg'), typo: attr.descTypo || {}, onChange: function (v) { setAttr({ descTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: attr.bgColor,      onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); },      label: __('Background', 'blockenberg') },
                            { value: attr.itemBg,       onChange: function (v) { setAttr({ itemBg: v || '#f9fafb' }); },       label: __('Item Background', 'blockenberg') },
                            { value: attr.borderColor,  onChange: function (v) { setAttr({ borderColor: v || '#e5e7eb' }); },  label: __('Border', 'blockenberg') },
                            { value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); }, label: __('Section Heading', 'blockenberg') },
                            { value: attr.subtextColor, onChange: function (v) { setAttr({ subtextColor: v || '#6b7280' }); }, label: __('Section Subtext', 'blockenberg') },
                            { value: attr.titleColor,   onChange: function (v) { setAttr({ titleColor: v || '#111827' }); },   label: __('Item Title', 'blockenberg') },
                            { value: attr.descColor,    onChange: function (v) { setAttr({ descColor: v || '#6b7280' }); },    label: __('Item Description', 'blockenberg') },
                            { value: attr.iconColor,    onChange: function (v) { setAttr({ iconColor: v || '#7c3aed' }); },    label: __('Icon (default)', 'blockenberg') },
                            { value: attr.badgeBg,      onChange: function (v) { setAttr({ badgeBg: v || '#ede9fe' }); },      label: __('Badge Background', 'blockenberg') },
                            { value: attr.badgeColor,   onChange: function (v) { setAttr({ badgeColor: v || '#7c3aed' }); },   label: __('Badge Text', 'blockenberg') },
                            { value: attr.dividerColor, onChange: function (v) { setAttr({ dividerColor: v || '#e5e7eb' }); }, label: __('Divider', 'blockenberg') }
                        ]
                    })
                ),
                el('div', blockProps,
                    el('div', { className: 'bkbg-il-wrap', style: wrapStyle },
                        el('div', { style: innerStyle },
                            attr.showHeading && el(RichText, { tagName: 'h2', className: 'bkbg-il-heading', value: attr.heading, onChange: function (v) { setAttr({ heading: v }); },
                                style: { color: attr.headingColor, margin: '0 0 8px' },
                                placeholder: __('Section heading…', 'blockenberg') }),
                            attr.showSubtext && el(RichText, { tagName: 'p', value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); },
                                style: { fontSize: 16 + 'px', color: attr.subtextColor, margin: '0 0 32px', lineHeight: 1.6 },
                                placeholder: __('Subtitle…', 'blockenberg') }),
                            el('div', { style: listStyle },
                                attr.items.map(function (item, i) { return itemEl(item, i); })
                            )
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-icon-list-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
