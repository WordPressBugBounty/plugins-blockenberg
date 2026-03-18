( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
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

    function genId() {
        return 'txl_' + Math.random().toString(36).substr(2, 9);
    }

    registerBlockType('blockenberg/taxonomy-list', {
        title: __('Taxonomy List', 'blockenberg'),
        icon: 'tag',
        category: 'bkbg-blog',
        description: __('Display categories, tags or custom taxonomy as a styled list, grid, chips or cards.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var editState = useState(null);
            var editing = editState[0];
            var setEditing = editState[1];

            function updateItem(id, field, value) {
                setAttributes({
                    items: a.items.map(function (item) {
                        if (item.id === id) {
                            var updated = Object.assign({}, item);
                            updated[field] = value;
                            return updated;
                        }
                        return item;
                    })
                });
            }

            function addItem() {
                setAttributes({
                    items: a.items.concat([{ id: genId(), name: 'New Category', url: '#', icon: '📁', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', count: 0 }])
                });
            }

            function removeItem(id) {
                setAttributes({ items: a.items.filter(function (i) { return i.id !== id; }) });
            }

            function moveItem(index, dir) {
                var items = a.items.slice();
                var target = index + dir;
                if (target < 0 || target >= items.length) return;
                var temp = items[index];
                items[index] = items[target];
                items[target] = temp;
                setAttributes({ items: items });
            }

            var layoutOptions = [
                { label: __('List', 'blockenberg'), value: 'list' },
                { label: __('Grid', 'blockenberg'), value: 'grid' },
                { label: __('Chips', 'blockenberg'), value: 'chips' },
                { label: __('Pills', 'blockenberg'), value: 'pills' },
                { label: __('Cards', 'blockenberg'), value: 'cards' }
            ];

            var countPosOptions = [
                { label: __('Badge (bubble)', 'blockenberg'), value: 'badge' },
                { label: __('Inline', 'blockenberg'), value: 'inline' },
                { label: __('Bracket (23)', 'blockenberg'), value: 'bracket' }
            ];

            var fontWeightOptions = [
                { label: '300', value: 300 },
                { label: '400 — Regular', value: 400 },
                { label: '500 — Medium', value: 500 },
                { label: '600 — Semi-bold', value: 600 },
                { label: '700 — Bold', value: 700 }
            ];

            // Inspector
            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Items', 'blockenberg'), initialOpen: true },
                    a.items.map(function (item, index) {
                        var isEditing = editing === item.id;
                        return el('div', {
                            key: item.id,
                            style: { marginBottom: '8px', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }
                        },
                            el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' } },
                                el('span', { style: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 500, flex: 1, overflow: 'hidden' } },
                                    el('span', { style: { flexShrink: 0 } }, (item.iconType || 'custom-char') !== 'custom-char' && IP() ? IP().buildEditorIcon(item.iconType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor) : (item.icon || '📁')),
                                    el('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.name)
                                ),
                                el('div', { style: { display: 'flex', gap: '2px', flexShrink: 0 } },
                                    el(Button, { isSmall: true, variant: 'tertiary', onClick: function () { setEditing(isEditing ? null : item.id); } }, isEditing ? '✕' : '✏'),
                                    el(Button, { isSmall: true, variant: 'tertiary', onClick: function () { moveItem(index, -1); }, disabled: index === 0 }, '↑'),
                                    el(Button, { isSmall: true, variant: 'tertiary', onClick: function () { moveItem(index, 1); }, disabled: index === a.items.length - 1 }, '↓'),
                                    el(Button, { isSmall: true, variant: 'tertiary', isDestructive: true, onClick: function () { removeItem(item.id); }, disabled: a.items.length <= 1 }, '✕')
                                )
                            ),
                            isEditing && el('div', { style: { marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' } },
                                el(TextControl, { label: __('Name', 'blockenberg'), value: item.name, onChange: function (v) { updateItem(item.id, 'name', v); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { marginTop: '8px' } },
                                    el(TextControl, { label: __('URL', 'blockenberg'), value: item.url, onChange: function (v) { updateItem(item.id, 'url', v); }, __nextHasNoMarginBottom: true })
                                ),
                                el('div', { style: { marginTop: '8px' } },
                                    el(IP().IconPickerControl, IP().iconPickerProps(item, function(patch) { setAttributes({ items: a.items.map(function(it) { return it.id === item.id ? Object.assign({}, it, patch) : it; }) }); }, { label: __('Icon', 'blockenberg'), charAttr: 'icon', typeAttr: 'iconType', dashiconAttr: 'iconDashicon', imageUrlAttr: 'iconImageUrl' }))
                                ),
                                el('div', { style: { marginTop: '8px' } },
                                    el(TextControl, { label: __('Count', 'blockenberg'), value: String(item.count), type: 'number', onChange: function (v) { updateItem(item.id, 'count', parseInt(v, 10) || 0); }, __nextHasNoMarginBottom: true })
                                )
                            )
                        );
                    }),
                    el('div', { style: { marginTop: '8px' } },
                        el(Button, { variant: 'secondary', onClick: addItem, style: { width: '100%', justifyContent: 'center' } },
                            '+ ' + __('Add Item', 'blockenberg')
                        )
                    )
                ),

                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'),
                        value: a.layout,
                        options: layoutOptions,
                        onChange: function (v) { setAttributes({ layout: v }); }
                    }),
                    (a.layout === 'grid' || a.layout === 'cards') && el(RangeControl, {
                        label: __('Columns', 'blockenberg'),
                        value: a.columns,
                        min: 2, max: 6,
                        onChange: function (v) { setAttributes({ columns: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Icons', 'blockenberg'),
                        checked: a.showIcon,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showIcon: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Count', 'blockenberg'),
                        checked: a.showCount,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showCount: v }); }
                    }),
                    a.showCount && el(SelectControl, {
                        label: __('Count Position', 'blockenberg'),
                        value: a.countPosition,
                        options: countPosOptions,
                        onChange: function (v) { setAttributes({ countPosition: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Chevron Arrow', 'blockenberg'),
                        checked: a.showChevron,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showChevron: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Link Items', 'blockenberg'),
                        checked: a.linkItems,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ linkItems: v }); }
                    }),
                    a.linkItems && el(SelectControl, {
                        label: __('Open Links In', 'blockenberg'),
                        value: a.linkTarget,
                        options: [
                            { label: __('Same Tab', 'blockenberg'), value: '_self' },
                            { label: __('New Tab', 'blockenberg'), value: '_blank' }
                        ],
                        onChange: function (v) { setAttributes({ linkTarget: v }); }
                    })
                ),

                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Gap Between Items', 'blockenberg'),
                        value: a.gap, min: 0, max: 32,
                        onChange: function (v) { setAttributes({ gap: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Item Padding', 'blockenberg'),
                        value: a.padding, min: 6, max: 40,
                        onChange: function (v) { setAttributes({ padding: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.borderRadius, min: 0, max: 50,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Max Width (0 = full)', 'blockenberg'),
                        value: a.maxWidth, min: 0, max: 800, step: 20,
                        onChange: function (v) { setAttributes({ maxWidth: v }); }
                    })
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl()({ label: __('Item', 'blockenberg'), value: a.itemTypo, onChange: function (v) { setAttributes({ itemTypo: v }); } })
                ),

                el(PanelColorSettings, {
                    title: __('Item Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.itemBg, onChange: function (c) { setAttributes({ itemBg: c || '' }); }, label: __('Background', 'blockenberg') },
                        { value: a.itemBgHover, onChange: function (c) { setAttributes({ itemBgHover: c || '' }); }, label: __('Hover Background', 'blockenberg') },
                        { value: a.itemColor, onChange: function (c) { setAttributes({ itemColor: c || '' }); }, label: __('Text Color', 'blockenberg') },
                        { value: a.itemColorHover, onChange: function (c) { setAttributes({ itemColorHover: c || '' }); }, label: __('Hover Text', 'blockenberg') },
                        { value: a.borderColor, onChange: function (c) { setAttributes({ borderColor: c || '' }); }, label: __('Border', 'blockenberg') },
                        { value: a.accentColor, onChange: function (c) { setAttributes({ accentColor: c || '' }); }, label: __('Accent / Chevron', 'blockenberg') }
                    ]
                }),

                el(PanelColorSettings, {
                    title: __('Count & Icon', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.iconColor, onChange: function (c) { setAttributes({ iconColor: c || '' }); }, label: __('Icon Color', 'blockenberg') },
                        { value: a.countBg, onChange: function (c) { setAttributes({ countBg: c || '' }); }, label: __('Count Background', 'blockenberg') },
                        { value: a.countColor, onChange: function (c) { setAttributes({ countColor: c || '' }); }, label: __('Count Text', 'blockenberg') }
                    ]
                })
            );

            // CSS variables
            var wrapStyle = {
                '--bkbg-txl-item-bg': a.itemBg,
                '--bkbg-txl-item-bg-hover': a.itemBgHover,
                '--bkbg-txl-item-color': a.itemColor,
                '--bkbg-txl-item-color-hover': a.itemColorHover,
                '--bkbg-txl-count-bg': a.countBg,
                '--bkbg-txl-count-color': a.countColor,
                '--bkbg-txl-icon-color': a.iconColor,
                '--bkbg-txl-border-color': a.borderColor,
                '--bkbg-txl-accent-color': a.accentColor,
                '--bkbg-txl-radius': a.borderRadius + 'px',
                '--bkbg-txl-gap': a.gap + 'px',
                '--bkbg-txl-padding': a.padding + 'px',
                '--bkbg-txl-cols': a.columns
            };
            var _tvf = getTypoCssVars();
            if (_tvf) Object.assign(wrapStyle, _tvf(a.itemTypo, '--bktxl-it-'));
            if (a.maxWidth > 0) wrapStyle.maxWidth = a.maxWidth + 'px';

            function renderCount(count) {
                if (!a.showCount) return null;
                if (a.countPosition === 'bracket') {
                    return el('span', { className: 'bkbg-txl-count bkbg-txl-count--bracket' }, '(' + count + ')');
                }
                if (a.countPosition === 'inline') {
                    return el('span', { className: 'bkbg-txl-count bkbg-txl-count--inline' }, count);
                }
                return el('span', { className: 'bkbg-txl-count bkbg-txl-count--badge' }, count);
            }

            var listEls = a.items.map(function (item) {
                var _iType = item.iconType || 'custom-char';
                var _iconContent = (_iType !== 'custom-char' && IP()) ? IP().buildEditorIcon(_iType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor) : item.icon;
                return el('li', { key: item.id, className: 'bkbg-txl-item' },
                    el('a', {
                        className: 'bkbg-txl-link',
                        href: item.url,
                        onClick: function (e) { e.preventDefault(); }
                    },
                        a.showIcon && _iconContent && el('span', { className: 'bkbg-txl-icon' }, _iconContent),
                        el('span', { className: 'bkbg-txl-name' }, item.name),
                        renderCount(item.count),
                        a.showChevron && el('span', { className: 'bkbg-txl-chevron' }, '›')
                    )
                );
            });

            var blockProps = useBlockProps({
                className: 'bkbg-editor-wrap',
                'data-block-label': 'Taxonomy List'
            });

            return el('div', blockProps,
                inspector,
                el('div', {
                    className: 'bkbg-txl-wrap',
                    style: wrapStyle,
                    'data-layout': a.layout
                },
                    el('ul', { className: 'bkbg-txl-list' }, listEls)
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            var wrapStyle = {
                '--bkbg-txl-item-bg': a.itemBg,
                '--bkbg-txl-item-bg-hover': a.itemBgHover,
                '--bkbg-txl-item-color': a.itemColor,
                '--bkbg-txl-item-color-hover': a.itemColorHover,
                '--bkbg-txl-count-bg': a.countBg,
                '--bkbg-txl-count-color': a.countColor,
                '--bkbg-txl-icon-color': a.iconColor,
                '--bkbg-txl-border-color': a.borderColor,
                '--bkbg-txl-accent-color': a.accentColor,
                '--bkbg-txl-radius': a.borderRadius + 'px',
                '--bkbg-txl-gap': a.gap + 'px',
                '--bkbg-txl-padding': a.padding + 'px',
                '--bkbg-txl-cols': a.columns
            };
            var _tvf = getTypoCssVars();
            if (_tvf) Object.assign(wrapStyle, _tvf(a.itemTypo, '--bktxl-it-'));
            if (a.maxWidth > 0) wrapStyle.maxWidth = a.maxWidth + 'px';

            function renderCount(count) {
                if (!a.showCount) return null;
                if (a.countPosition === 'bracket') {
                    return el('span', { className: 'bkbg-txl-count bkbg-txl-count--bracket' }, '(' + count + ')');
                }
                if (a.countPosition === 'inline') {
                    return el('span', { className: 'bkbg-txl-count bkbg-txl-count--inline' }, count);
                }
                return el('span', { className: 'bkbg-txl-count bkbg-txl-count--badge' }, count);
            }

            var listEls = a.items.map(function (item, idx) {
                var Tag = a.linkItems ? 'a' : 'span';
                var linkProps = {
                    className: 'bkbg-txl-link'
                };
                if (a.linkItems) {
                    linkProps.href = item.url;
                    if (a.linkTarget === '_blank') {
                        linkProps.target = '_blank';
                        linkProps.rel = 'noopener noreferrer';
                    }
                }
                var _iType = item.iconType || 'custom-char';
                var _iconContent = (_iType !== 'custom-char' && IP()) ? IP().buildSaveIcon(_iType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor) : item.icon;
                return el('li', { key: idx, className: 'bkbg-txl-item' },
                    el(Tag, linkProps,
                        a.showIcon && _iconContent && el('span', { className: 'bkbg-txl-icon' }, _iconContent),
                        el('span', { className: 'bkbg-txl-name' }, item.name),
                        renderCount(item.count),
                        a.showChevron && el('span', { className: 'bkbg-txl-chevron' }, '›')
                    )
                );
            });

            return el('div', {
                className: 'bkbg-txl-wrap',
                style: wrapStyle,
                'data-layout': a.layout
            },
                el('ul', { className: 'bkbg-txl-list' }, listEls)
            );
        }
    });
}() );
