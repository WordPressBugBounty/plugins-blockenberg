( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;

    var _tc, _tv;
    function getTC() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTV() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    /* ─── helpers ─── */
    function updateItem(arr, idx, field, val) {
        return arr.map(function (item, i) {
            if (i !== idx) return item;
            var p = {}; p[field] = val;
            return Object.assign({}, item, p);
        });
    }

    function moveItem(arr, from, to) {
        var a = arr.slice();
        var item = a.splice(from, 1)[0];
        a.splice(to, 0, item);
        return a;
    }

    /* ─── ItemEditor ─── */
    function ItemEditor(props) {
        var items = props.items;
        var onChange = props.onChange;
        var activeIdx = props.activeIdx;
        var setActiveIdx = props.setActiveIdx;

        var levelLabels = ['Level 0 — Section heading', 'Level 1 — Nav item', 'Level 2 — Nested item'];

        function addItem() {
            onChange(items.concat([{
                label: 'New Item', url: '#', icon: '', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', level: 1,
                badge: '', badgeColor: '#6366f1', dividerBefore: false
            }]));
        }

        return el(Fragment, null,
            items.map(function (item, idx) {
                var isActive = idx === activeIdx;
                var indent = item.level * 12;

                return el('div', {
                    key: idx,
                    style: {
                        marginBottom: '4px',
                        border: '1px solid ' + (isActive ? '#6366f1' : '#e5e7eb'),
                        borderRadius: '6px',
                        overflow: 'hidden'
                    }
                },
                    /* header row */
                    el('div', {
                        style: {
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 8px', cursor: 'pointer',
                            background: isActive ? '#f0f0ff' : '#f9fafb',
                            paddingLeft: (8 + indent) + 'px'
                        },
                        onClick: function () { setActiveIdx(isActive ? -1 : idx); }
                    },
                        el('span', { style: { flex: 1, fontSize: '12px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                            (item.icon && (item.iconType || 'custom-char') === 'custom-char' ? item.icon + ' ' : '') + (item.label || 'Item ' + (idx + 1))
                        ),
                        el('span', { style: { fontSize: '10px', color: '#9ca3af', flexShrink: 0 } }, 'L' + item.level),
                        el(Button, { icon: 'arrow-up-alt2', isSmall: true, disabled: idx === 0, onClick: function (e) { e.stopPropagation(); onChange(moveItem(items, idx, idx - 1)); setActiveIdx(idx - 1); } }),
                        el(Button, { icon: 'arrow-down-alt2', isSmall: true, disabled: idx === items.length - 1, onClick: function (e) { e.stopPropagation(); onChange(moveItem(items, idx, idx + 1)); setActiveIdx(idx + 1); } }),
                        el(Button, { icon: 'no-alt', isSmall: true, isDestructive: true, onClick: function (e) { e.stopPropagation(); var a = items.slice(); a.splice(idx, 1); onChange(a); setActiveIdx(-1); } })
                    ),

                    /* expanded fields */
                    isActive && el('div', { style: { padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#fff' } },
                        el(TextControl, { label: __('Label', 'blockenberg'), value: item.label, onChange: function (v) { onChange(updateItem(items, idx, 'label', v)); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('URL', 'blockenberg'), value: item.url, onChange: function (v) { onChange(updateItem(items, idx, 'url', v)); }, __nextHasNoMarginBottom: true }),
                        el(IP().IconPickerControl, IP().iconPickerProps(item, function (patch) { var newItems = items.slice(); newItems[idx] = Object.assign({}, item, patch); onChange(newItems); }, { label: __('Icon', 'blockenberg'), charAttr: 'icon', typeAttr: 'iconType', dashiconAttr: 'iconDashicon', imageUrlAttr: 'iconImageUrl' })),
                        el(SelectControl, {
                            label: __('Level', 'blockenberg'),
                            value: String(item.level),
                            options: [
                                { value: '0', label: 'Level 0 — Section heading' },
                                { value: '1', label: 'Level 1 — Nav item' },
                                { value: '2', label: 'Level 2 — Nested item' }
                            ],
                            onChange: function (v) { onChange(updateItem(items, idx, 'level', parseInt(v, 10))); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(TextControl, { label: __('Badge Text', 'blockenberg'), value: item.badge || '', onChange: function (v) { onChange(updateItem(items, idx, 'badge', v)); }, __nextHasNoMarginBottom: true }),
                        item.badge && el(BkbgColorSwatch, { label: __('Badge Color', 'blockenberg'), value: item.badgeColor || '#6366f1', onChange: function (v) { onChange(updateItem(items, idx, 'badgeColor', v)); } }),
                        el(ToggleControl, { label: __('Divider Before', 'blockenberg'), checked: !!item.dividerBefore, onChange: function (v) { onChange(updateItem(items, idx, 'dividerBefore', v)); }, __nextHasNoMarginBottom: true })
                    )
                );
            }),

            el(Button, {
                variant: 'secondary',
                onClick: addItem,
                style: { marginTop: '8px', width: '100%', justifyContent: 'center' }
            }, __('+ Add Item', 'blockenberg'))
        );
    }

    /* ─── MenuPreview ─── */
    function MenuPreview(props) {
        var a = props.attributes;
        var onSetActive = props.onSetActive;
        var openSectionsState = useState(function () {
            var s = {};
            a.items.forEach(function (item, idx) { if (item.level === 0 && a.defaultExpanded) s[idx] = true; });
            return s;
        });
        var openSections = openSectionsState[0];
        var setOpenSections = openSectionsState[1];

        function toggleSection(idx) {
            var ns = Object.assign({}, openSections);
            ns[idx] = !ns[idx];
            setOpenSections(ns);
        }

        /* find the most recent L0 section for each item */
        var sectionMap = {};
        var lastL0 = -1;
        a.items.forEach(function (item, idx) {
            if (item.level === 0) { lastL0 = idx; sectionMap[idx] = idx; }
            else { sectionMap[idx] = lastL0; }
        });

        function isVisible(idx) {
            var item = a.items[idx];
            if (item.level === 0) return true;
            var secIdx = sectionMap[idx];
            if (secIdx < 0) return true;
            if (!a.collapsible) return true;
            return !!openSections[secIdx];
        }

        var menuStyle = {
            width: '100%',
            background: a.menuBg || '#fff',
            border: '1px solid ' + (a.menuBorder || '#e5e7eb'),
            borderRadius: (a.borderRadius || 8) + 'px',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
        };

        return el('div', { style: menuStyle },
            /* heading */
            a.showHeading && a.headingText && el('div', {
                style: {
                    padding: (a.itemPaddingV || 8) + 'px ' + (a.itemPaddingH || 14) + 'px',
                    fontWeight: a.headingFontWeight||700,
                    fontSize: (a.headingSize || 11) + 'px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: a.headingColor || '#9ca3af',
                    borderBottom: '1px solid ' + (a.dividerColor || '#e5e7eb')
                }
            }, a.headingText),

            /* items */
            el('nav', { style: { padding: '6px 0' } },
                a.items.map(function (item, idx) {
                    if (!isVisible(idx)) return null;

                    var isSection = item.level === 0;
                    var isActive = idx === a.activeIndex;
                    var indent = item.level * 12;
                    var hasChildren = !isSection && false; /* computed below */

                    /* check if this L0 has children to show collapse arrow */
                    var hasChildItems = isSection && a.items.some(function (it, i) { return i > idx && it.level > 0 && sectionMap[i] === idx; });

                    var itemStyle = {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: (a.itemPaddingV || 8) + 'px ' + (a.itemPaddingH || 14) + 'px',
                        paddingLeft: ((a.itemPaddingH || 14) + indent) + 'px',
                        fontSize: (a.fontSize || 14) + 'px',
                        color: isActive ? (a.activeItemColor || '#6366f1') : (isSection ? (a.sectionHeadingColor || '#111827') : (a.itemColor || '#374151')),
                        background: isActive ? (a.activeItemBg || '#ede9fe') : 'transparent',
                        fontWeight: isSection ? String(a.fontWeight||700) : (isActive ? '600' : '400'),
                        cursor: 'pointer',
                        transition: 'background 0.15s, color 0.15s',
                        textDecoration: 'none',
                        borderLeft: isActive ? '3px solid ' + (a.activeIndicatorColor || '#6366f1') : '3px solid transparent',
                        boxSizing: 'border-box'
                    };

                    return el(Fragment, { key: idx },
                        item.dividerBefore && a.showDividers && el('div', {
                            style: {
                                height: '1px',
                                background: a.dividerColor || '#e5e7eb',
                                margin: '6px ' + (a.itemPaddingH || 14) + 'px'
                            }
                        }),

                        el('a', {
                            href: item.url || '#',
                            style: itemStyle,
                            onClick: function (e) { e.preventDefault(); if (onSetActive) onSetActive(idx); if (isSection && hasChildItems && a.collapsible) toggleSection(idx); }
                        },
                            a.showIcons && item.icon && el('span', { style: { flexShrink: 0, fontSize: '14px' } }, (item.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(item.iconType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor) : item.icon),
                            el('span', { style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.label),
                            a.showBadges && item.badge && el('span', {
                                style: {
                                    flexShrink: 0,
                                    background: item.badgeColor || (a.badgeBg || '#6366f1'),
                                    color: a.badgeColor || '#fff',
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    padding: '1px 7px',
                                    borderRadius: '20px',
                                    lineHeight: '1.5'
                                }
                            }, item.badge),
                            isSection && hasChildItems && a.collapsible && el('span', {
                                style: {
                                    flexShrink: 0,
                                    color: a.arrowColor || '#9ca3af',
                                    fontSize: '10px',
                                    transition: 'transform 0.2s',
                                    transform: openSections[idx] ? 'rotate(180deg)' : 'rotate(0deg)',
                                    display: 'inline-block'
                                }
                            }, '▾')
                        )
                    );
                })
            )
        );
    }

    /* ─── register ─── */
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

    registerBlockType('blockenberg/side-menu', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var itemIdxState = useState(-1);
            var itemIdx = itemIdxState[0];
            var setItemIdx = itemIdxState[1];

            var blockProps = useBlockProps((function () {
                var _tvf = getTV();
                var s = {
                    paddingTop: (a.paddingTop || 0) + 'px',
                    paddingBottom: (a.paddingBottom || 0) + 'px',
                    background: a.bgColor
                };
                if (_tvf) {
                    Object.assign(s, _tvf(a.headingTypo, '--bksmnu-ht-'));
                    Object.assign(s, _tvf(a.itemTypo, '--bksmnu-it-'));
                }
                return { style: s };
            })());

            var inspector = el(InspectorControls, null,
                /* Items */
                el(PanelBody, { title: __('Menu Items', 'blockenberg'), initialOpen: true },
                    el(ItemEditor, {
                        items: a.items,
                        onChange: function (v) { set({ items: v }); },
                        activeIdx: itemIdx,
                        setActiveIdx: setItemIdx
                    })
                ),

                /* Options */
                el(PanelBody, { title: __('Options', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Heading', 'blockenberg'), checked: a.showHeading, onChange: function (v) { set({ showHeading: v }); }, __nextHasNoMarginBottom: true }),
                    a.showHeading && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Heading Text', 'blockenberg'), value: a.headingText, onChange: function (v) { set({ headingText: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(SelectControl, {
                            label: __('Style', 'blockenberg'),
                            value: a.menuStyle,
                            options: [
                                { value: 'default', label: 'Default' },
                                { value: 'pills', label: 'Pills' },
                                { value: 'bordered', label: 'Bordered' },
                                { value: 'minimal', label: 'Minimal' }
                            ],
                            onChange: function (v) { set({ menuStyle: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el(ToggleControl, { label: __('Collapsible Sections', 'blockenberg'), checked: a.collapsible, onChange: function (v) { set({ collapsible: v }); }, __nextHasNoMarginBottom: true }),
                    a.collapsible && el(ToggleControl, { label: __('Default Expanded', 'blockenberg'), checked: a.defaultExpanded, onChange: function (v) { set({ defaultExpanded: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Icons', 'blockenberg'), checked: a.showIcons, onChange: function (v) { set({ showIcons: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Badges', 'blockenberg'), checked: a.showBadges, onChange: function (v) { set({ showBadges: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Dividers', 'blockenberg'), checked: a.showDividers, onChange: function (v) { set({ showDividers: v }); }, __nextHasNoMarginBottom: true })
                ),

                /* Appearance */
                el(PanelBody, { title: __('Appearance', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Menu Width (px)', 'blockenberg'), value: a.width, min: 160, max: 480, step: 10, onChange: function (v) { set({ width: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Item Padding Vertical', 'blockenberg'), value: a.itemPaddingV, min: 4, max: 24, onChange: function (v) { set({ itemPaddingV: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Item Padding Horizontal', 'blockenberg'), value: a.itemPaddingH, min: 8, max: 32, onChange: function (v) { set({ itemPaddingH: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: a.borderRadius, min: 0, max: 24, onChange: function (v) { set({ borderRadius: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 120, step: 4, onChange: function (v) { set({ paddingTop: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 120, step: 4, onChange: function (v) { set({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                    )
                ),

                /* Colors */
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTC(), { label: 'Heading', value: a.headingTypo, onChange: function (v) { set({ headingTypo: v }); } }),
                    el(getTC(), { label: 'Menu Items', value: a.itemTypo, onChange: function (v) { set({ itemTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.bgColor, onChange: function (v) { set({ bgColor: v }); }, label: __('Page Background', 'blockenberg') },
                        { value: a.menuBg, onChange: function (v) { set({ menuBg: v }); }, label: __('Menu Background', 'blockenberg') },
                        { value: a.menuBorder, onChange: function (v) { set({ menuBorder: v }); }, label: __('Menu Border', 'blockenberg') },
                        { value: a.headingColor, onChange: function (v) { set({ headingColor: v }); }, label: __('Heading Text', 'blockenberg') },
                        { value: a.itemColor, onChange: function (v) { set({ itemColor: v }); }, label: __('Item Text', 'blockenberg') },
                        { value: a.itemHoverBg, onChange: function (v) { set({ itemHoverBg: v }); }, label: __('Item Hover Background', 'blockenberg') },
                        { value: a.activeItemBg, onChange: function (v) { set({ activeItemBg: v }); }, label: __('Active Item Background', 'blockenberg') },
                        { value: a.activeItemColor, onChange: function (v) { set({ activeItemColor: v }); }, label: __('Active Item Text', 'blockenberg') },
                        { value: a.activeIndicatorColor, onChange: function (v) { set({ activeIndicatorColor: v }); }, label: __('Active Indicator', 'blockenberg') },
                        { value: a.sectionHeadingColor, onChange: function (v) { set({ sectionHeadingColor: v }); }, label: __('Section Heading', 'blockenberg') },
                        { value: a.dividerColor, onChange: function (v) { set({ dividerColor: v }); }, label: __('Divider', 'blockenberg') },
                        { value: a.badgeBg, onChange: function (v) { set({ badgeBg: v }); }, label: __('Badge Background', 'blockenberg') },
                        { value: a.badgeColor, onChange: function (v) { set({ badgeColor: v }); }, label: __('Badge Text', 'blockenberg') },
                        { value: a.arrowColor, onChange: function (v) { set({ arrowColor: v }); }, label: __('Arrow Icon', 'blockenberg') }
                    ]
                })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el('div', { style: { maxWidth: (a.width || 260) + 'px' } },
                        el(MenuPreview, {
                            attributes: a,
                            onSetActive: function (idx) { set({ activeIndex: idx }); }
                        })
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-smnu-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
