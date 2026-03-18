( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var Button = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function uid() {
        return Math.random().toString(36).slice(2, 8);
    }

    function defaultItem() {
        return { id: uid(), name: 'New Item', description: '', price: '$0.00', badge: '', imageUrl: '', imageId: 0 };
    }

    function defaultSection() {
        return { id: uid(), title: 'New Section', items: [defaultItem()] };
    }

    registerBlockType('blockenberg/price-list', {
        title: __('Price List', 'blockenberg'),
        description: __('Restaurant menu / service pricing with category sections.', 'blockenberg'),
        category: 'bkbg-marketing',
        icon: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z' })
        ),
        attributes: {
            sections:         { type: 'array',   default: [] },
            layout:           { type: 'string',  default: 'list' },
            columns:          { type: 'number',  default: 2 },
            showImage:        { type: 'boolean', default: false },
            showBadge:        { type: 'boolean', default: true },
            imageSize:        { type: 'number',  default: 72 },
            imageRadius:      { type: 'number',  default: 8 },
            sectionSpacing:   { type: 'number',  default: 40 },
            itemSpacing:      { type: 'number',  default: 16 },
            dividerEnabled:   { type: 'boolean', default: true },
            sectionTypo:      { type: 'object',  default: {} },
            nameTypo:         { type: 'object',  default: {} },
            descTypo:         { type: 'object',  default: {} },
            priceTypo:        { type: 'object',  default: {} },
            sectionColor:     { type: 'string',  default: '#111827' },
            nameColor:        { type: 'string',  default: '#111827' },
            descColor:        { type: 'string',  default: '#6b7280' },
            priceColor:       { type: 'string',  default: '#2563eb' },
            dividerColor:     { type: 'string',  default: '#f3f4f6' },
            badgeBg:          { type: 'string',  default: '#fef3c7' },
            badgeColor:       { type: 'string',  default: '#92400e' },
            bgColor:          { type: 'string',  default: '' }
        },

        edit: function (props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;

            /* default sections on first render */
            var sections = a.sections.length ? a.sections : [];

            /* ── helpers ── */
            function updateSection(si, field, val) {
                var next = sections.map(function (s, i) {
                    return i === si ? Object.assign({}, s, { [field]: val }) : s;
                });
                setAttr({ sections: next });
            }
            function addSection() {
                setAttr({ sections: sections.concat(defaultSection()) });
            }
            function removeSection(si) {
                setAttr({ sections: sections.filter(function (_, i) { return i !== si; }) });
            }
            function moveSection(si, dir) {
                var arr = sections.slice();
                var target = si + dir;
                if (target < 0 || target >= arr.length) return;
                var tmp = arr[si]; arr[si] = arr[target]; arr[target] = tmp;
                setAttr({ sections: arr });
            }
            function updateItem(si, ii, field, val) {
                var next = sections.map(function (s, i) {
                    if (i !== si) return s;
                    return Object.assign({}, s, {
                        items: s.items.map(function (it, j) {
                            return j === ii ? Object.assign({}, it, { [field]: val }) : it;
                        })
                    });
                });
                setAttr({ sections: next });
            }
            function addItem(si) {
                var next = sections.map(function (s, i) {
                    return i === si ? Object.assign({}, s, { items: s.items.concat(defaultItem()) }) : s;
                });
                setAttr({ sections: next });
            }
            function removeItem(si, ii) {
                var next = sections.map(function (s, i) {
                    return i === si ? Object.assign({}, s, { items: s.items.filter(function (_, j) { return j !== ii; }) }) : s;
                });
                setAttr({ sections: next });
            }

            /* --- open/close state for sections --- */
            var _open = useState({});
            var openMap = _open[0]; var setOpenMap = _open[1];
            function toggleOpen(id) {
                setOpenMap(function (prev) {
                    var n = Object.assign({}, prev);
                    n[id] = !n[id];
                    return n;
                });
            }

            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {
                    '--bkbg-pl-sec-gap':     a.sectionSpacing + 'px',
                    '--bkbg-pl-item-gap':    a.itemSpacing + 'px',
                    '--bkbg-pl-img-size':    a.imageSize + 'px',
                    '--bkbg-pl-img-radius':  a.imageRadius + 'px',
                    '--bkbg-pl-sec-color':   a.sectionColor,
                    '--bkbg-pl-name-color':  a.nameColor,
                    '--bkbg-pl-desc-color':  a.descColor,
                    '--bkbg-pl-price-color': a.priceColor,
                    '--bkbg-pl-divider':     a.dividerColor,
                    '--bkbg-pl-badge-bg':    a.badgeBg,
                    '--bkbg-pl-badge-color': a.badgeColor,
                    '--bkbg-pl-cols':        a.columns,
                    background:              a.bgColor || undefined
                };
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.sectionTypo, '--bkbg-pl-sec-'));
                    Object.assign(s, _tvFn(a.nameTypo, '--bkbg-pl-nm-'));
                    Object.assign(s, _tvFn(a.descTypo, '--bkbg-pl-ds-'));
                    Object.assign(s, _tvFn(a.priceTypo, '--bkbg-pl-pr-'));
                }
                return { style: s };
            })());

            var inspector = el(InspectorControls, null,

                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('List style', 'blockenberg'),
                        value: a.layout,
                        options: [
                            { label: 'Vertical list', value: 'list' },
                            { label: 'Two-column grid', value: 'grid' },
                            { label: 'Horizontal card', value: 'horizontal' }
                        ],
                        onChange: function (v) { setAttr({ layout: v }); }
                    }),
                    a.layout === 'grid' && el(RangeControl, {
                        label: __('Columns', 'blockenberg'),
                        value: a.columns, min: 2, max: 4,
                        onChange: function (v) { setAttr({ columns: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Section spacing (px)', 'blockenberg'),
                        value: a.sectionSpacing, min: 16, max: 80,
                        onChange: function (v) { setAttr({ sectionSpacing: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Item spacing (px)', 'blockenberg'),
                        value: a.itemSpacing, min: 8, max: 48,
                        onChange: function (v) { setAttr({ itemSpacing: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show dividers between items', 'blockenberg'),
                        checked: a.dividerEnabled,
                        onChange: function (v) { setAttr({ dividerEnabled: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show badges', 'blockenberg'),
                        checked: a.showBadge,
                        onChange: function (v) { setAttr({ showBadge: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show images', 'blockenberg'),
                        checked: a.showImage,
                        onChange: function (v) { setAttr({ showImage: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    a.showImage && el(Fragment, null,
                        el(RangeControl, {
                            label: __('Image size (px)', 'blockenberg'),
                            value: a.imageSize, min: 40, max: 200,
                            onChange: function (v) { setAttr({ imageSize: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Image radius (px)', 'blockenberg'),
                            value: a.imageRadius, min: 0, max: 50,
                            onChange: function (v) { setAttr({ imageRadius: v }); }
                        })
                    )
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    (function () {
                        var TC = getTypoControl();
                        if (!TC) return el('p', null, 'Loading…');
                        return el(Fragment, null,
                            el(TC, { label: __('Section Title', 'blockenberg'), value: a.sectionTypo, onChange: function (v) { setAttr({ sectionTypo: v }); } }),
                            el(TC, { label: __('Item Name', 'blockenberg'), value: a.nameTypo, onChange: function (v) { setAttr({ nameTypo: v }); } }),
                            el(TC, { label: __('Description', 'blockenberg'), value: a.descTypo, onChange: function (v) { setAttr({ descTypo: v }); } }),
                            el(TC, { label: __('Price', 'blockenberg'), value: a.priceTypo, onChange: function (v) { setAttr({ priceTypo: v }); } })
                        );
                    })()
                ),

                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background', 'blockenberg'),       value: a.bgColor,       onChange: function(v){ setAttr({ bgColor: v||'' }); } },
                            { label: __('Section title', 'blockenberg'),    value: a.sectionColor,  onChange: function(v){ setAttr({ sectionColor: v||'#111827' }); } },
                            { label: __('Item name', 'blockenberg'),        value: a.nameColor,     onChange: function(v){ setAttr({ nameColor: v||'#111827' }); } },
                            { label: __('Description', 'blockenberg'),      value: a.descColor,     onChange: function(v){ setAttr({ descColor: v||'#6b7280' }); } },
                            { label: __('Price', 'blockenberg'),            value: a.priceColor,    onChange: function(v){ setAttr({ priceColor: v||'#2563eb' }); } },
                            { label: __('Divider', 'blockenberg'),          value: a.dividerColor,  onChange: function(v){ setAttr({ dividerColor: v||'#f3f4f6' }); } },
                            { label: __('Badge background', 'blockenberg'), value: a.badgeBg,       onChange: function(v){ setAttr({ badgeBg: v||'#fef3c7' }); } },
                            { label: __('Badge text', 'blockenberg'),       value: a.badgeColor,    onChange: function(v){ setAttr({ badgeColor: v||'#92400e' }); } }
                        ]
                    })
                )
            );

            /* ── Editor: sections preview ── */
            var editorSections = sections.map(function (sec, si) {
                var isOpen = openMap[sec.id] !== false; /* default open */
                return el('div', { className: 'bkbg-pl-section', key: sec.id },

                    /* section header */
                    el('div', { className: 'bkbg-pl-sec-hd' },
                        el('h3', { className: 'bkbg-pl-sec-title', style: { flex: 1 } }, sec.title),
                        el('div', { className: 'bkbg-pl-sec-actions' },
                            si > 0 && el(Button, {
                                variant: 'tertiary', isSmall: true,
                                onClick: function () { moveSection(si, -1); }
                            }, '↑'),
                            si < sections.length - 1 && el(Button, {
                                variant: 'tertiary', isSmall: true,
                                onClick: function () { moveSection(si, 1); }
                            }, '↓'),
                            el(Button, {
                                variant: 'tertiary', isSmall: true,
                                onClick: function () { toggleOpen(sec.id); }
                            }, isOpen ? '▲' : '▼'),
                            el(Button, {
                                variant: 'tertiary', isSmall: true, isDestructive: true,
                                onClick: function () { removeSection(si); }
                            }, '✕')
                        )
                    ),

                    isOpen && el(Fragment, null,
                        el(TextControl, {
                            label: __('Section Title', 'blockenberg'),
                            value: sec.title,
                            onChange: function (v) { updateSection(si, 'title', v); }
                        }),

                        /* items */
                        el('div', { className: 'bkbg-pl-items-' + a.layout },
                            sec.items.map(function (item, ii) {
                                return el('div', { className: 'bkbg-pl-item bkbg-pl-item--editor', key: item.id },
                                    el('div', { className: 'bkbg-pl-item-row' },

                                        /* image */
                                        a.showImage && el(MediaUpload, {
                                            onSelect: function (m) { updateItem(si, ii, 'imageUrl', m.url); updateItem(si, ii, 'imageId', m.id); },
                                            type: 'image', value: item.imageId,
                                            render: function (p) {
                                                return item.imageUrl
                                                    ? el('img', { src: item.imageUrl, className: 'bkbg-pl-item-img', onClick: p.open, style: { cursor: 'pointer' } })
                                                    : el(Button, { variant: 'secondary', isSmall: true, onClick: p.open }, '+IMG');
                                            }
                                        }),

                                        el('div', { style: { flex: 1 } },
                                            el(TextControl, {
                                                label: __('Name', 'blockenberg'),
                                                value: item.name,
                                                onChange: function (v) { updateItem(si, ii, 'name', v); }
                                            }),
                                            el(TextControl, {
                                                label: __('Description', 'blockenberg'),
                                                value: item.description,
                                                onChange: function (v) { updateItem(si, ii, 'description', v); }
                                            }),
                                            el('div', { style: { display: 'flex', gap: 8 } },
                                                el(TextControl, {
                                                    label: __('Price', 'blockenberg'),
                                                    value: item.price,
                                                    onChange: function (v) { updateItem(si, ii, 'price', v); },
                                                    style: { flex: 1 }
                                                }),
                                                a.showBadge && el(TextControl, {
                                                    label: __('Badge', 'blockenberg'),
                                                    value: item.badge,
                                                    onChange: function (v) { updateItem(si, ii, 'badge', v); },
                                                    style: { flex: 1 }
                                                })
                                            )
                                        ),

                                        el(Button, {
                                            variant: 'tertiary', isSmall: true, isDestructive: true,
                                            onClick: function () { removeItem(si, ii); }
                                        }, '✕')
                                    )
                                );
                            })
                        ),

                        el(Button, {
                            variant: 'secondary', isSmall: true,
                            onClick: function () { addItem(si); },
                            style: { marginTop: 8 }
                        }, __('+ Add Item', 'blockenberg'))
                    )
                );
            });

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-pl-wrap' },
                        editorSections,
                        el(Button, {
                            variant: 'primary', isSmall: true,
                            onClick: addSection,
                            style: { marginTop: 16 }
                        }, __('+ Add Section', 'blockenberg'))
                    )
                )
            );
        },

        deprecated: [{
            attributes: {
                sections:         { type: 'array',   default: [] },
                layout:           { type: 'string',  default: 'list' },
                columns:          { type: 'number',  default: 2 },
                showImage:        { type: 'boolean', default: false },
                showBadge:        { type: 'boolean', default: true },
                imageSize:        { type: 'number',  default: 72 },
                imageRadius:      { type: 'number',  default: 8 },
                sectionSpacing:   { type: 'number',  default: 40 },
                itemSpacing:      { type: 'number',  default: 16 },
                dividerEnabled:   { type: 'boolean', default: true },
                sectionFontSize:  { type: 'number',  default: 20 },
                sectionFontWeight:{ type: 'number',  default: 700 },
                nameFontSize:     { type: 'number',  default: 16 },
                nameFontWeight:   { type: 'number',  default: 600 },
                descFontSize:     { type: 'number',  default: 14 },
                priceFontSize:    { type: 'number',  default: 16 },
                priceFontWeight:  { type: 'number',  default: 700 },
                sectionColor:     { type: 'string',  default: '#111827' },
                nameColor:        { type: 'string',  default: '#111827' },
                descColor:        { type: 'string',  default: '#6b7280' },
                priceColor:       { type: 'string',  default: '#2563eb' },
                dividerColor:     { type: 'string',  default: '#f3f4f6' },
                badgeBg:          { type: 'string',  default: '#fef3c7' },
                badgeColor:       { type: 'string',  default: '#92400e' },
                bgColor:          { type: 'string',  default: '' }
            },
            save: function (props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save({
                    style: {
                        '--bkbg-pl-sec-gap':     a.sectionSpacing + 'px',
                        '--bkbg-pl-item-gap':    a.itemSpacing + 'px',
                        '--bkbg-pl-img-size':    a.imageSize + 'px',
                        '--bkbg-pl-img-radius':  a.imageRadius + 'px',
                        '--bkbg-pl-sec-size':    a.sectionFontSize + 'px',
                        '--bkbg-pl-sec-weight':  a.sectionFontWeight,
                        '--bkbg-pl-name-size':   a.nameFontSize + 'px',
                        '--bkbg-pl-name-weight': a.nameFontWeight,
                        '--bkbg-pl-desc-size':   a.descFontSize + 'px',
                        '--bkbg-pl-price-size':  a.priceFontSize + 'px',
                        '--bkbg-pl-price-weight':a.priceFontWeight,
                        '--bkbg-pl-sec-color':   a.sectionColor,
                        '--bkbg-pl-name-color':  a.nameColor,
                        '--bkbg-pl-desc-color':  a.descColor,
                        '--bkbg-pl-price-color': a.priceColor,
                        '--bkbg-pl-divider':     a.dividerColor,
                        '--bkbg-pl-badge-bg':    a.badgeBg,
                        '--bkbg-pl-badge-color': a.badgeColor,
                        '--bkbg-pl-cols':        a.columns,
                        background:              a.bgColor || undefined
                    }
                });
                return el('div', blockProps,
                    el('div', { className: 'bkbg-pl-wrap' },
                        a.sections.map(function (sec) {
                            return el('div', { className: 'bkbg-pl-section', key: sec.id },
                                el('h3', { className: 'bkbg-pl-sec-title' }, sec.title),
                                el('div', { className: 'bkbg-pl-items-' + a.layout + (a.dividerEnabled ? ' bkbg-pl-dividers' : '') },
                                    sec.items.map(function (item) {
                                        return el('div', { className: 'bkbg-pl-item', key: item.id },
                                            a.showImage && item.imageUrl && el('img', {
                                                className: 'bkbg-pl-item-img',
                                                src: item.imageUrl, alt: item.name, loading: 'lazy'
                                            }),
                                            el('div', { className: 'bkbg-pl-item-body' },
                                                el('div', { className: 'bkbg-pl-item-top' },
                                                    el('span', { className: 'bkbg-pl-item-name' }, item.name),
                                                    el('span', { className: 'bkbg-pl-item-dots' }),
                                                    el('span', { className: 'bkbg-pl-item-price' }, item.price)
                                                ),
                                                item.description && el('p', { className: 'bkbg-pl-item-desc' }, item.description),
                                                a.showBadge && item.badge && el('span', { className: 'bkbg-pl-badge' }, item.badge)
                                            )
                                        );
                                    })
                                )
                            );
                        })
                    )
                );
            }
        }],

        save: function (props) {
            var a = props.attributes;
            var _tvFn = getTypoCssVars();
            var s = {
                '--bkbg-pl-sec-gap':     a.sectionSpacing + 'px',
                '--bkbg-pl-item-gap':    a.itemSpacing + 'px',
                '--bkbg-pl-img-size':    a.imageSize + 'px',
                '--bkbg-pl-img-radius':  a.imageRadius + 'px',
                '--bkbg-pl-sec-color':   a.sectionColor,
                '--bkbg-pl-name-color':  a.nameColor,
                '--bkbg-pl-desc-color':  a.descColor,
                '--bkbg-pl-price-color': a.priceColor,
                '--bkbg-pl-divider':     a.dividerColor,
                '--bkbg-pl-badge-bg':    a.badgeBg,
                '--bkbg-pl-badge-color': a.badgeColor,
                '--bkbg-pl-cols':        a.columns,
                background:              a.bgColor || undefined
            };
            if (_tvFn) {
                Object.assign(s, _tvFn(a.sectionTypo, '--bkbg-pl-sec-'));
                Object.assign(s, _tvFn(a.nameTypo, '--bkbg-pl-nm-'));
                Object.assign(s, _tvFn(a.descTypo, '--bkbg-pl-ds-'));
                Object.assign(s, _tvFn(a.priceTypo, '--bkbg-pl-pr-'));
            }
            var blockProps = wp.blockEditor.useBlockProps.save({ style: s });

            return el('div', blockProps,
                el('div', { className: 'bkbg-pl-wrap' },
                    a.sections.map(function (sec) {
                        return el('div', { className: 'bkbg-pl-section', key: sec.id },
                            el('h3', { className: 'bkbg-pl-sec-title' }, sec.title),
                            el('div', { className: 'bkbg-pl-items-' + a.layout + (a.dividerEnabled ? ' bkbg-pl-dividers' : '') },
                                sec.items.map(function (item) {
                                    return el('div', { className: 'bkbg-pl-item', key: item.id },
                                        a.showImage && item.imageUrl && el('img', {
                                            className: 'bkbg-pl-item-img',
                                            src: item.imageUrl, alt: item.name, loading: 'lazy'
                                        }),
                                        el('div', { className: 'bkbg-pl-item-body' },
                                            el('div', { className: 'bkbg-pl-item-top' },
                                                el('span', { className: 'bkbg-pl-item-name' }, item.name),
                                                el('span', { className: 'bkbg-pl-item-dots' }),
                                                el('span', { className: 'bkbg-pl-item-price' }, item.price)
                                            ),
                                            item.description && el('p', { className: 'bkbg-pl-item-desc' }, item.description),
                                            a.showBadge && item.badge && el('span', { className: 'bkbg-pl-badge' }, item.badge)
                                        )
                                    );
                                })
                            )
                        );
                    })
                )
            );
        }
    });
}() );
