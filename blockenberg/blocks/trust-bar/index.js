(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var registerBlockType = wp.blocks.registerBlockType;
        var __ = wp.i18n.__;
        var InspectorControls = wp.blockEditor.InspectorControls;
        var PanelColorSettings = wp.blockEditor.PanelColorSettings;
        var useBlockProps = wp.blockEditor.useBlockProps;
        var MediaUpload = wp.blockEditor.MediaUpload;
        var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
        var PanelBody = wp.components.PanelBody;
        var RangeControl = wp.components.RangeControl;
        var ToggleControl = wp.components.ToggleControl;
        var TextControl = wp.components.TextControl;
        var SelectControl = wp.components.SelectControl;
        var Button = wp.components.Button;

        var _tc, _tvf;
        Object.defineProperty(window, '_tc', { get: function () { return _tc || (_tc = window.bkbgTypographyControl); } });
        Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
        function getTypoControl(p, key, label) { return _tc ? _tc(p, key, label) : null; }
        function getTypoCssVars(a) {
            if (!_tvf) return {};
            var v = {};
            Object.assign(v, _tvf(a.labelTypo || {}, '--bktb-lb-'));
            Object.assign(v, _tvf(a.sublabelTypo || {}, '--bktb-sl-'));
            return v;
        }

        var LAYOUT_OPTIONS = [
            { label: 'Single row',      value: 'row' },
            { label: '2-column grid',   value: 'grid-2' },
            { label: '3-column grid',   value: 'grid-3' },
        ];
        var CARD_STYLE_OPTIONS = [
            { label: 'Plain',    value: 'plain' },
            { label: 'Card',     value: 'card' },
            { label: 'Bordered', value: 'bordered' },
        ];
        var TEXT_ALIGN_OPTIONS = [
            { label: 'Left',   value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right',  value: 'right' },
        ];

        /* Inline SVG icons */
        var ICONS = {
            shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
            lock:   'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM12 7a3 3 0 016 0v4H6V7a3 3 0 016 0z',
            check:  'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
            bolt:   'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
            headphones: 'M3 18v-6a9 9 0 0118 0v6M3 18a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5zM21 18a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5z',
            star:   'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
            award:  'M12 15a7 7 0 100-14 7 7 0 000 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12',
            users:  'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
            cloud:  'M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z',
            eye:    'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z',
        };
        var ICON_OPTIONS = [
            { label: 'Shield',      value: 'shield' },
            { label: 'Lock',        value: 'lock' },
            { label: 'Checkmark',   value: 'check' },
            { label: 'Lightning',   value: 'bolt' },
            { label: 'Headphones',  value: 'headphones' },
            { label: 'Star',        value: 'star' },
            { label: 'Award',       value: 'award' },
            { label: 'Users',       value: 'users' },
            { label: 'Cloud',       value: 'cloud' },
            { label: 'Eye',         value: 'eye' },
            { label: 'Custom image',value: 'image' },
        ];

        function makeId() { return 'tb' + Math.random().toString(36).substr(2, 6); }

        function renderIcon(item, a) {
            if (item.icon === 'image' && item.imageUrl) {
                return el('img', { src: item.imageUrl, alt: item.label, style: { width: a.iconSize + 'px', height: a.iconSize + 'px', objectFit: 'contain', display: 'block' } });
            }
            var path = ICONS[item.icon] || ICONS.shield;
            var iconEl = el('svg', {
                viewBox: '0 0 24 24', width: a.iconSize, height: a.iconSize,
                fill: 'none', stroke: a.iconColor || '#6c3fb5', strokeWidth: 2,
                strokeLinecap: 'round', strokeLinejoin: 'round',
                style: { display: 'block', flexShrink: 0 }
            }, el('path', { d: path }));
            if (a.iconBgSize > 0) {
                return el('div', { style: { width: a.iconBgSize + 'px', height: a.iconBgSize + 'px', borderRadius: a.iconBgRadius + 'px', background: a.iconBg || 'rgba(108,63,181,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, iconEl);
            }
            return iconEl;
        }

        function gridStyle(layout, gap) {
            if (layout === 'row') return { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: gap + 'px' };
            var cols = layout === 'grid-2' ? 2 : 3;
            return { display: 'grid', gridTemplateColumns: 'repeat(' + cols + ', 1fr)', gap: gap + 'px' };
        }

        function itemBoxStyle(a) {
            var base = { display: 'flex', flexDirection: 'column', alignItems: a.textAlign === 'center' ? 'center' : (a.textAlign === 'right' ? 'flex-end' : 'flex-start'), textAlign: a.textAlign, padding: a.cardPadding + 'px', gap: '8px', borderRadius: a.cardRadius + 'px' };
            if (a.cardStyle === 'card') return Object.assign({}, base, { background: a.cardBg || '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' });
            if (a.cardStyle === 'bordered') return Object.assign({}, base, { background: a.cardBg || 'transparent', border: '1.5px solid rgba(108,63,181,0.15)' });
            return base;
        }

        registerBlockType('blockenberg/trust-bar', {
            edit: function (props) {
                var attributes = props.attributes;
                var setAttributes = props.setAttributes;
                var items = attributes.items;
                var blockProps = useBlockProps((function () {
                    var _tv = getTypoCssVars(attributes);
                    var s = { paddingTop: attributes.paddingTop + 'px', paddingBottom: attributes.paddingBottom + 'px', backgroundColor: attributes.bgColor || undefined };
                    Object.assign(s, _tv);
                    return { className: 'bkbg-trust-bar-wrap', style: s };
                })());

                function setItem(id, patch) { setAttributes({ items: items.map(function (it) { return it.id === id ? Object.assign({}, it, patch) : it; }) }); }
                function addItem() { setAttributes({ items: items.concat([{ id: makeId(), icon: 'shield', label: 'Security', sublabel: 'Grade A', imageUrl: '', imageId: 0 }]) }); }
                function removeItem(id) { if (items.length <= 1) return; setAttributes({ items: items.filter(function (it) { return it.id !== id; }) }); }

                return el(Fragment, null,
                    el(InspectorControls, null,
                        el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                            el(SelectControl, { label: __('Layout', 'blockenberg'), value: attributes.layout, options: LAYOUT_OPTIONS, onChange: function (v) { setAttributes({ layout: v }); } }),
                            el(SelectControl, { label: __('Card style', 'blockenberg'), value: attributes.cardStyle, options: CARD_STYLE_OPTIONS, onChange: function (v) { setAttributes({ cardStyle: v }); } }),
                            el(SelectControl, { label: __('Text alignment', 'blockenberg'), value: attributes.textAlign, options: TEXT_ALIGN_OPTIONS, onChange: function (v) { setAttributes({ textAlign: v }); } }),
                            el(ToggleControl, { label: __('Show sublabel', 'blockenberg'), checked: attributes.showSublabel, onChange: function (v) { setAttributes({ showSublabel: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Show divider between items', 'blockenberg'), checked: attributes.showDivider, onChange: function (v) { setAttributes({ showDivider: v }); }, __nextHasNoMarginBottom: true }),
                            el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: attributes.gap, min: 0, max: 80, onChange: function (v) { setAttributes({ gap: v }); } })
                        ),
                        el(PanelBody, { title: __('Icon', 'blockenberg'), initialOpen: false },
                            el(RangeControl, { label: __('Icon size (px)', 'blockenberg'), value: attributes.iconSize, min: 16, max: 64, onChange: function (v) { setAttributes({ iconSize: v }); } }),
                            el(RangeControl, { label: __('Icon bg size (px, 0 = none)', 'blockenberg'), value: attributes.iconBgSize, min: 0, max: 120, onChange: function (v) { setAttributes({ iconBgSize: v }); } }),
                            el(RangeControl, { label: __('Icon bg radius (px)', 'blockenberg'), value: attributes.iconBgRadius, min: 0, max: 60, onChange: function (v) { setAttributes({ iconBgRadius: v }); } })
                        ),
                        el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                            getTypoControl(props, 'labelTypo', __('Label', 'blockenberg')),
                            getTypoControl(props, 'sublabelTypo', __('Sublabel', 'blockenberg'))
                        ),
                        el(PanelBody, { title: __('Appearance', 'blockenberg'), initialOpen: false },
                            el(RangeControl, { label: __('Card radius (px)', 'blockenberg'), value: attributes.cardRadius, min: 0, max: 32, onChange: function (v) { setAttributes({ cardRadius: v }); } }),
                            el(RangeControl, { label: __('Card padding (px)', 'blockenberg'), value: attributes.cardPadding, min: 4, max: 48, onChange: function (v) { setAttributes({ cardPadding: v }); } })
                        ),
                        el(PanelColorSettings, {
                            title: __('Colors', 'blockenberg'), initialOpen: false,
                            colorSettings: [
                                { value: attributes.iconColor,    onChange: function (v) { setAttributes({ iconColor: v || '' }); },    label: __('Icon', 'blockenberg') },
                                { value: attributes.iconBg,       onChange: function (v) { setAttributes({ iconBg: v || '' }); },       label: __('Icon background', 'blockenberg') },
                                { value: attributes.labelColor,   onChange: function (v) { setAttributes({ labelColor: v || '' }); },   label: __('Label', 'blockenberg') },
                                { value: attributes.sublabelColor,onChange: function (v) { setAttributes({ sublabelColor: v || '' }); },label: __('Sublabel', 'blockenberg') },
                                { value: attributes.dividerColor, onChange: function (v) { setAttributes({ dividerColor: v || '' }); }, label: __('Divider', 'blockenberg') },
                                { value: attributes.cardBg,       onChange: function (v) { setAttributes({ cardBg: v || '' }); },       label: __('Card background', 'blockenberg') },
                                { value: attributes.bgColor,      onChange: function (v) { setAttributes({ bgColor: v || '' }); },      label: __('Section background', 'blockenberg') },
                            ]
                        }),
                        el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                            el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: attributes.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                            el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: attributes.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                        ),
                        el(PanelBody, { title: __('Items', 'blockenberg'), initialOpen: false },
                            items.map(function (item, idx) {
                                return el(PanelBody, { key: item.id, title: (item.label || 'Item') + ' #' + (idx + 1), initialOpen: false },
                                    el(SelectControl, { label: __('Icon', 'blockenberg'), value: item.icon, options: ICON_OPTIONS, onChange: function (v) { setItem(item.id, { icon: v }); } }),
                                    item.icon === 'image' && el(Fragment, null,
                                        el(MediaUploadCheck, null,
                                            el(MediaUpload, {
                                                onSelect: function (media) { setItem(item.id, { imageUrl: media.url, imageId: media.id }); },
                                                allowedTypes: ['image'],
                                                value: item.imageId,
                                                render: function (ref) { return el(Button, { onClick: ref.open, variant: 'secondary', size: 'compact', style: { marginBottom: '6px' } }, item.imageUrl ? __('Change image', 'blockenberg') : __('Upload image', 'blockenberg')); }
                                            })
                                        ),
                                        item.imageUrl && el(Button, { onClick: function () { setItem(item.id, { imageUrl: '', imageId: 0 }); }, variant: 'tertiary', size: 'compact', isDestructive: true, style: { display: 'block', marginBottom: '6px' } }, __('Remove image', 'blockenberg'))
                                    ),
                                    el(TextControl, { label: __('Label', 'blockenberg'), value: item.label, onChange: function (v) { setItem(item.id, { label: v }); } }),
                                    el(TextControl, { label: __('Sublabel', 'blockenberg'), value: item.sublabel, onChange: function (v) { setItem(item.id, { sublabel: v }); } }),
                                    items.length > 1 && el(Button, { onClick: function () { removeItem(item.id); }, variant: 'tertiary', size: 'compact', isDestructive: true }, __('Remove item', 'blockenberg'))
                                );
                            }),
                            el(Button, { onClick: addItem, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Item', 'blockenberg'))
                        )
                    ),

                    el('div', blockProps,
                        el('div', { className: 'bkbg-trust-bar', style: gridStyle(attributes.layout, attributes.gap) },
                            items.map(function (item, idx) {
                                return el(Fragment, { key: item.id },
                                    attributes.showDivider && idx > 0 && attributes.layout === 'row' && el('div', { style: { width: '1px', height: '40px', background: attributes.dividerColor || '#e5e7eb', flexShrink: 0 } }),
                                    el('div', { className: 'bkbg-trust-bar-item', style: itemBoxStyle(attributes) },
                                        renderIcon(item, attributes),
                                        el('div', null,
                                            el('p', { className: 'bkbg-tb-label', style: { margin: 0, color: attributes.labelColor || undefined } }, item.label),
                                            attributes.showSublabel && item.sublabel && el('p', { className: 'bkbg-tb-sublabel', style: { margin: 0, color: attributes.sublabelColor || undefined, opacity: 0.7 } }, item.sublabel)
                                        )
                                    )
                                );
                            })
                        )
                    )
                );
            },

            save: function (props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save((function () {
                    var _tv = getTypoCssVars(a);
                    var s = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined };
                    Object.assign(s, _tv);
                    return { className: 'bkbg-trust-bar-wrap', style: s };
                })());

                function iconSVG(item) {
                    if (item.icon === 'image' && item.imageUrl) {
                        return el('img', { src: item.imageUrl, alt: item.label, style: { width: a.iconSize + 'px', height: a.iconSize + 'px', objectFit: 'contain', display: 'block' } });
                    }
                    var path = ICONS[item.icon] || ICONS.shield;
                    var iconEl = el('svg', { viewBox: '0 0 24 24', width: a.iconSize, height: a.iconSize, fill: 'none', stroke: a.iconColor || '#6c3fb5', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true', style: { display: 'block', flexShrink: 0 } }, el('path', { d: path }));
                    if (a.iconBgSize > 0) {
                        return el('div', { style: { width: a.iconBgSize + 'px', height: a.iconBgSize + 'px', borderRadius: a.iconBgRadius + 'px', background: a.iconBg || 'rgba(108,63,181,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, iconEl);
                    }
                    return iconEl;
                }

                return el('div', blockProps,
                    el('div', { className: 'bkbg-trust-bar', style: gridStyle(a.layout, a.gap) },
                        a.items.map(function (item, idx) {
                            return el(Fragment, { key: item.id },
                                a.showDivider && idx > 0 && a.layout === 'row' && el('div', { className: 'bkbg-trust-bar-divider', style: { width: '1px', height: '40px', background: a.dividerColor || '#e5e7eb', flexShrink: 0 } }),
                                el('div', { className: 'bkbg-trust-bar-item', style: itemBoxStyle(a) },
                                    iconSVG(item),
                                    el('div', null,
                                        el('p', { className: 'bkbg-tb-label', style: { margin: 0, color: a.labelColor || undefined } }, item.label),
                                        a.showSublabel && item.sublabel && el('p', { className: 'bkbg-tb-sublabel', style: { margin: 0, color: a.sublabelColor || undefined, opacity: 0.7 } }, item.sublabel)
                                    )
                                )
                            );
                        })
                    )
                );
            }
        });
}());
