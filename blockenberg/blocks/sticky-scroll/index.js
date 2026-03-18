( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var Button = wp.components.Button;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;
    var useState = wp.element.useState;
    var Fragment = wp.element.Fragment;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function uid() { return 'id-' + Math.random().toString(36).slice(2, 8); }

    // Image panel with placeholder
    function ImagePanel(props) {
        var imageUrl = props.imageUrl;
        var radius = props.radius;
        var shadow = props.shadow;
        var placeholderColor = props.placeholderColor;

        var imgStyle = {
            width: '100%',
            borderRadius: radius + 'px',
            boxShadow: shadow ? '0 24px 60px rgba(0,0,0,0.15)' : 'none',
            display: 'block'
        };

        if (imageUrl) {
            return el('img', { src: imageUrl, alt: '', style: imgStyle });
        }

        return el('div', {
            style: {
                width: '100%',
                aspectRatio: '16 / 10',
                borderRadius: radius + 'px',
                background: placeholderColor || '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: shadow ? '0 24px 60px rgba(0,0,0,0.15)' : 'none'
            }
        },
            el('svg', { width: '48', height: '48', viewBox: '0 0 24 24', style: { opacity: 0.3 } },
                el('path', { d: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-2 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z', fill: '#9ca3af' })
            )
        );
    }

    // Single text panel (scrolling side)
    function TextPanel(props) {
        var item = props.item;
        var attrs = props.attrs;
        var isActive = props.isActive;

        var panelStyle = {
            paddingTop: attrs.panelPaddingY + 'px',
            paddingBottom: attrs.panelPaddingY + 'px',
            opacity: isActive ? 1 : 0.4,
            transition: 'opacity 0.3s'
        };

        return el('div', { className: 'bkss-panel' + (isActive ? ' bkss-active' : ''), style: panelStyle },
            // Accent dot
            attrs.showAccentDot && el('div', {
                style: {
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: isActive ? (item.accentColor || attrs.eyebrowColor) : (attrs.dotColor || '#e5e7eb'),
                    marginBottom: '16px',
                    transition: 'background 0.3s',
                    flexShrink: 0
                }
            }),
            // Eyebrow
            attrs.showEyebrow && item.eyebrow && el('div', {
                className: 'bkss-eyebrow',
                style: { color: item.accentColor || attrs.eyebrowColor, marginBottom: '8px' }
            }, item.eyebrow),
            // Title
            el('h3', {
                className: 'bkss-title',
                style: { margin: '0 0 12px' }
            }, item.title || __('Feature title', 'blockenberg')),
            // Description
            el('p', {
                className: 'bkss-desc',
                style: { margin: 0 }
            }, item.desc || __('Describe this feature in a sentence or two…', 'blockenberg'))
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

    registerBlockType('blockenberg/sticky-scroll', {

        edit: function (props) {
            var attrs = props.attributes;
            var setAttr = props.setAttributes;
            var items = attrs.items || [];

            function updateItem(i, key, val) {
                var next = items.map(function (it, j) {
                    if (j !== i) return it;
                    var u = Object.assign({}, it); u[key] = val; return u;
                });
                setAttr({ items: next });
            }

            function removeItem(i) {
                setAttr({ items: items.filter(function (_, j) { return j !== i; }) });
            }

            function addItem() {
                setAttr({ items: items.concat([{
                    id: uid(), eyebrow: 'Step 0' + (items.length + 1),
                    title: 'New feature', desc: 'Describe this feature.',
                    imageUrl: '', imageId: 0, imageAlt: '', accentColor: '#6c3fb5'
                }]) });
            }

            var blockProps = useBlockProps((function() {
                var _tvf = getTypoCssVars();
                var s = {
                    paddingTop: attrs.paddingTop + 'px',
                    paddingBottom: attrs.paddingBottom + 'px',
                    '--bkss-title-color': attrs.titleColor || '#111827',
                    '--bkss-desc-color': attrs.descColor || '#4b5563',
                    '--bkss-title-fw': attrs.titleFontWeight || '700',
                    '--bkss-desc-fw': attrs.descFontWeight || '400',
                    '--bkss-eb-fw': attrs.eyebrowFontWeight || '600',
                    '--bkss-title-lh': attrs.titleLineHeight || 1.2,
                    '--bkss-desc-lh': attrs.descLineHeight || 1.6
                };
                if (attrs.bgColor) s.background = attrs.bgColor;
                if (_tvf) {
                    Object.assign(s, _tvf(attrs.eyebrowTypo, '--bkss-eb-'));
                    Object.assign(s, _tvf(attrs.titleTypo, '--bkss-tt-'));
                    Object.assign(s, _tvf(attrs.descTypo, '--bkss-ds-'));
                }
                return { className: 'bkss-wrap', style: s };
            })());
            var isPinnedLeft = attrs.pinnedSide !== 'right';
            var pw = attrs.pinnedWidth;

            // Editor: static stacked preview (not actually sticky in editor)
            var pinnedColStyle = {
                width: pw + '%',
                flexShrink: 0
            };
            var scrollColStyle = {
                flex: 1
            };
            var rowStyle = {
                display: 'flex',
                gap: attrs.columnGap + 'px',
                alignItems: 'flex-start'
            };

            // Show first item's image in pinned column in editor
            var firstItem = items[0] || {};

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                        el(SelectControl, {
                            label: __('Pinned side', 'blockenberg'),
                            value: attrs.pinnedSide,
                            options: [
                                { label: 'Left (image pinned)', value: 'left' },
                                { label: 'Right (image pinned)', value: 'right' }
                            ],
                            onChange: function (v) { setAttr({ pinnedSide: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Pinned column width (%)', 'blockenberg'),
                            value: attrs.pinnedWidth, min: 30, max: 70,
                            onChange: function (v) { setAttr({ pinnedWidth: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Column gap (px)', 'blockenberg'),
                            value: attrs.columnGap, min: 16, max: 120,
                            onChange: function (v) { setAttr({ columnGap: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Panel vertical padding (px)', 'blockenberg'),
                            value: attrs.panelPaddingY, min: 16, max: 200,
                            onChange: function (v) { setAttr({ panelPaddingY: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Sticky top offset (px)', 'blockenberg'),
                            value: attrs.stickyTop, min: 0, max: 200,
                            onChange: function (v) { setAttr({ stickyTop: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Section padding top (px)', 'blockenberg'),
                            value: attrs.paddingTop, min: 0, max: 200,
                            onChange: function (v) { setAttr({ paddingTop: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Section padding bottom (px)', 'blockenberg'),
                            value: attrs.paddingBottom, min: 0, max: 200,
                            onChange: function (v) { setAttr({ paddingBottom: v }); }
                        })
                    ),

                    el(PanelBody, { title: __('Visual', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show eyebrow text', 'blockenberg'),
                            checked: attrs.showEyebrow,
                            onChange: function (v) { setAttr({ showEyebrow: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show accent dot', 'blockenberg'),
                            checked: attrs.showAccentDot,
                            onChange: function (v) { setAttr({ showAccentDot: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Image shadow', 'blockenberg'),
                            checked: attrs.imageShadow,
                            onChange: function (v) { setAttr({ imageShadow: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(RangeControl, {
                            label: __('Image border radius (px)', 'blockenberg'),
                            value: attrs.imageRadius, min: 0, max: 48,
                            onChange: function (v) { setAttr({ imageRadius: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Highlight active panel on scroll', 'blockenberg'),
                            checked: attrs.activateOnScroll,
                            onChange: function (v) { setAttr({ activateOnScroll: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),

                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl() && getTypoControl()({ label: __('Eyebrow', 'blockenberg'), value: attrs.eyebrowTypo, onChange: function (v) { setAttr({ eyebrowTypo: v }); } }),
                        getTypoControl() && getTypoControl()({ label: __('Title', 'blockenberg'), value: attrs.titleTypo, onChange: function (v) { setAttr({ titleTypo: v }); } }),
                        getTypoControl() && getTypoControl()({ label: __('Description', 'blockenberg'), value: attrs.descTypo, onChange: function (v) { setAttr({ descTypo: v }); } })
                    ),

                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Eyebrow / Accent', 'blockenberg'), value: attrs.eyebrowColor, onChange: function (v) { setAttr({ eyebrowColor: v || '#6c3fb5' }); } },
                            { label: __('Title', 'blockenberg'), value: attrs.titleColor, onChange: function (v) { setAttr({ titleColor: v || '#111827' }); } },
                            { label: __('Description', 'blockenberg'), value: attrs.descColor, onChange: function (v) { setAttr({ descColor: v || '#4b5563' }); } },
                            { label: __('Dot (inactive)', 'blockenberg'), value: attrs.dotColor, onChange: function (v) { setAttr({ dotColor: v || '#e5e7eb' }); } },
                            { label: __('Dot (active)', 'blockenberg'), value: attrs.dotActiveColor, onChange: function (v) { setAttr({ dotActiveColor: v || '#6c3fb5' }); } },
                            { label: __('Image placeholder', 'blockenberg'), value: attrs.imagePlaceholderColor, onChange: function (v) { setAttr({ imagePlaceholderColor: v || '#e5e7eb' }); } },
                            { label: __('Background', 'blockenberg'), value: attrs.bgColor, onChange: function (v) { setAttr({ bgColor: v || '' }); } }
                        ]
                    }),

                    // Items editor
                    el(PanelBody, { title: __('Panels (' + items.length + ')', 'blockenberg'), initialOpen: false },
                        items.map(function (item, i) {
                            return el(PanelBody, {
                                key: item.id,
                                title: item.title || (__('Panel', 'blockenberg') + ' ' + (i + 1)),
                                initialOpen: i === 0
                            },
                                el(TextControl, {
                                    label: __('Eyebrow', 'blockenberg'),
                                    value: item.eyebrow,
                                    onChange: function (v) { updateItem(i, 'eyebrow', v); }
                                }),
                                el(TextControl, {
                                    label: __('Title', 'blockenberg'),
                                    value: item.title,
                                    onChange: function (v) { updateItem(i, 'title', v); }
                                }),
                                el(TextareaControl, {
                                    label: __('Description', 'blockenberg'),
                                    rows: 3,
                                    value: item.desc,
                                    onChange: function (v) { updateItem(i, 'desc', v); }
                                }),
                                el(BkbgColorSwatch, {
                                    label: __('Accent color (hex)', 'blockenberg'),
                                    value: item.accentColor,
                                    onChange: function (v) { updateItem(i, 'accentColor', v); }
                                }),
                                el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function (media) {
                                            updateItem(i, 'imageUrl', media.url);
                                            updateItem(i, 'imageId', media.id);
                                            updateItem(i, 'imageAlt', media.alt || '');
                                        },
                                        allowedTypes: ['image'],
                                        value: item.imageId,
                                        render: function (rp) {
                                            return el('div', null,
                                                item.imageUrl && el('img', { src: item.imageUrl, style: { width: '100%', borderRadius: '6px', marginBottom: '8px' } }),
                                                el(Button, { variant: 'secondary', isSmall: true, onClick: rp.open },
                                                    item.imageUrl ? __('Change image', 'blockenberg') : __('Upload image', 'blockenberg')
                                                ),
                                                item.imageUrl && el(Button, {
                                                    variant: 'secondary', isDestructive: true, isSmall: true, style: { marginLeft: '6px' },
                                                    onClick: function () { updateItem(i, 'imageUrl', ''); updateItem(i, 'imageId', 0); }
                                                }, __('Remove', 'blockenberg'))
                                            );
                                        }
                                    })
                                ),
                                items.length > 1 && el(Button, {
                                    variant: 'secondary', isDestructive: true, isSmall: true, style: { marginTop: '8px' },
                                    onClick: function () { removeItem(i); }
                                }, __('Remove panel', 'blockenberg'))
                            );
                        }),
                        el(Button, {
                            variant: 'primary', isSmall: true,
                            style: { marginTop: '12px', width: '100%', justifyContent: 'center' },
                            onClick: addItem
                        }, __('+ Add panel', 'blockenberg'))
                    )
                ),

                el('div', blockProps,
                    el('div', { className: 'bkss-layout', style: rowStyle },
                        // Pinned column (image)
                        isPinnedLeft && el('div', { className: 'bkss-pinned', style: pinnedColStyle },
                            el(ImagePanel, { imageUrl: firstItem.imageUrl, radius: attrs.imageRadius, shadow: attrs.imageShadow, placeholderColor: attrs.imagePlaceholderColor })
                        ),

                        // Scrolling column (text panels)
                        el('div', { className: 'bkss-scroll-col', style: scrollColStyle },
                            items.map(function (item, i) {
                                return el(TextPanel, { key: item.id, item: item, attrs: attrs, isActive: i === 0 });
                            })
                        ),

                        // Pinned column right
                        !isPinnedLeft && el('div', { className: 'bkss-pinned', style: pinnedColStyle },
                            el(ImagePanel, { imageUrl: firstItem.imageUrl, radius: attrs.imageRadius, shadow: attrs.imageShadow, placeholderColor: attrs.imagePlaceholderColor })
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var items = a.items || [];
            var isPinnedLeft = a.pinnedSide !== 'right';
            var pw = a.pinnedWidth;

            var wrapStyle = (function() {
                var _tvf = getTypoCssVars();
                var s = {
                    paddingTop: a.paddingTop + 'px',
                    paddingBottom: a.paddingBottom + 'px',
                    '--bkss-sticky-top': a.stickyTop + 'px',
                    '--bkss-pinned-w': pw + '%',
                    '--bkss-gap': a.columnGap + 'px',
                    '--bkss-panel-py': a.panelPaddingY + 'px',
                    '--bkss-dot-c': a.dotColor || '#e5e7eb',
                    '--bkss-dot-active': a.dotActiveColor || '#6c3fb5',
                    '--bkss-title-color': a.titleColor || '#111827',
                    '--bkss-desc-color': a.descColor || '#4b5563',
                    '--bkss-title-fw': a.titleFontWeight || '700',
                    '--bkss-desc-fw': a.descFontWeight || '400',
                    '--bkss-eb-fw': a.eyebrowFontWeight || '600',
                    '--bkss-title-lh': a.titleLineHeight || 1.2,
                    '--bkss-desc-lh': a.descLineHeight || 1.6
                };
                if (a.bgColor) s.background = a.bgColor;
                if (_tvf) {
                    Object.assign(s, _tvf(a.eyebrowTypo, '--bkss-eb-'));
                    Object.assign(s, _tvf(a.titleTypo, '--bkss-tt-'));
                    Object.assign(s, _tvf(a.descTypo, '--bkss-ds-'));
                }
                return s;
            })();

            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkss-wrap',
                style: wrapStyle,
                'data-activate': a.activateOnScroll ? '1' : '0',
                'data-pinned': a.pinnedSide
            });

            function renderImage(item) {
                if (item.imageUrl) {
                    return el('img', {
                        src: item.imageUrl, alt: item.imageAlt || '',
                        style: { width: '100%', borderRadius: a.imageRadius + 'px', boxShadow: a.imageShadow ? '0 24px 60px rgba(0,0,0,0.15)' : 'none', display: 'block' }
                    });
                }
                return el('div', {
                    style: {
                        width: '100%', aspectRatio: '16 / 10',
                        borderRadius: a.imageRadius + 'px',
                        background: a.imagePlaceholderColor || '#e5e7eb',
                        boxShadow: a.imageShadow ? '0 24px 60px rgba(0,0,0,0.15)' : 'none'
                    }
                });
            }

            return el('div', blockProps,
                el('div', {
                    className: 'bkss-layout',
                    style: { display: 'flex', gap: a.columnGap + 'px', alignItems: 'flex-start' }
                },
                    // Pinned (image) column
                    isPinnedLeft && el('div', {
                        className: 'bkss-pinned',
                        style: { width: pw + '%', flexShrink: 0, position: 'sticky', top: a.stickyTop + 'px' }
                    },
                        el('div', { className: 'bkss-image-wrap' },
                            renderImage(items[0] || {})
                        )
                    ),

                    // Scrolling column (panels)
                    el('div', { className: 'bkss-scroll-col', style: { flex: 1 } },
                        items.map(function (item, i) {
                            var panelStyle = {
                                paddingTop: a.panelPaddingY + 'px',
                                paddingBottom: a.panelPaddingY + 'px'
                            };
                            return el('div', {
                                key: item.id,
                                className: 'bkss-panel' + (i === 0 ? ' bkss-active' : ''),
                                style: panelStyle,
                                'data-image': item.imageUrl || '',
                                'data-idx': i
                            },
                                // The image for this panel (hidden, JS swaps it in)
                                a.showAccentDot && el('div', {
                                    className: 'bkss-dot',
                                    style: { width: '10px', height: '10px', borderRadius: '50%', background: i === 0 ? (item.accentColor || a.dotActiveColor) : (a.dotColor || '#e5e7eb'), marginBottom: '16px', transition: 'background 0.3s', '--bkss-accent': item.accentColor || a.dotActiveColor }
                                }),
                                a.showEyebrow && item.eyebrow && el('div', {
                                    className: 'bkss-eyebrow',
                                    style: { color: item.accentColor || a.eyebrowColor, marginBottom: '8px' }
                                }, item.eyebrow),
                                el('h3', {
                                    className: 'bkss-title',
                                    style: { margin: '0 0 12px' }
                                }, item.title),
                                el('p', {
                                    className: 'bkss-desc',
                                    style: { margin: 0 }
                                }, item.desc)
                            );
                        })
                    ),

                    // Pinned right
                    !isPinnedLeft && el('div', {
                        className: 'bkss-pinned',
                        style: { width: pw + '%', flexShrink: 0, position: 'sticky', top: a.stickyTop + 'px' }
                    },
                        el('div', { className: 'bkss-image-wrap' },
                            renderImage(items[0] || {})
                        )
                    )
                )
            );
        }
    });
}() );
