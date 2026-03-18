( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

    var CARD_LAYOUT_OPTIONS = [
        { label: 'Stacked (Image top)', value: 'stacked' },
        { label: 'Overlay (Image bg)', value: 'overlay' },
        { label: 'Horizontal',         value: 'horizontal' },
        { label: 'Text only',          value: 'text' },
    ];

    var ASPECT_OPTIONS = [
        { label: '1:1 Square',  value: '1-1' },
        { label: '4:3',         value: '4-3' },
        { label: '3:2',         value: '3-2' },
        { label: '16:9',        value: '16-9' },
        { label: '21:9',        value: '21-9' },
    ];

    var SHADOW_OPTIONS = [
        { label: 'None',   value: 'none' },
        { label: 'Small',  value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large',  value: 'lg' },
    ];

    var LINK_STYLE_OPTIONS = [
        { label: 'Arrow link →',  value: 'arrow' },
        { label: 'Button',        value: 'button' },
        { label: 'Underline',     value: 'underline' },
    ];

    var ASPECT_PADDING = {
        '1-1': '100%', '4-3': '75%', '3-2': '66.67%', '16-9': '56.25%', '21-9': '42.86%',
    };

    var SHADOWS = {
        none: 'none',
        sm:   '0 1px 6px rgba(0,0,0,0.08)',
        md:   '0 4px 16px rgba(0,0,0,0.12)',
        lg:   '0 8px 32px rgba(0,0,0,0.16)',
    };

    function updateItem(items, idx, field, val) {
        return items.map(function (it, i) {
            if (i !== idx) return it;
            var p = {}; p[field] = val;
            return Object.assign({}, it, p);
        });
    }

    function renderCardPreview(item, a, idx) {
        var shadow = SHADOWS[a.cardShadow] || SHADOWS.sm;
        var pt = ASPECT_PADDING[a.imageAspect] || '56.25%';

        var cardStyle = {
            background: a.cardLayout === 'overlay' ? 'transparent' : a.cardBg,
            borderRadius: a.cardBorderRadius + 'px',
            boxShadow: a.cardLayout === 'overlay' ? 'none' : shadow,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: a.cardLayout === 'horizontal' ? 'row' : 'column',
            minHeight: a.cardMinHeight > 0 ? a.cardMinHeight + 'px' : 'auto',
            position: 'relative',
            flex: '0 0 calc(' + (100 / a.desktopCols) + '% - ' + (a.gap * (a.desktopCols - 1) / a.desktopCols) + 'px)',
        };

        var hasImage = item.imageUrl;
        var accentColor = item.accentColor || a.eyebrowColor;

        var imageSection = (a.cardLayout !== 'text' && hasImage) ? el('div', {
            style: {
                position: 'relative',
                paddingTop: a.cardLayout === 'horizontal' ? '0' : pt,
                height: a.cardLayout === 'horizontal' ? '100%' : '0',
                width: a.cardLayout === 'horizontal' ? '40%' : '100%',
                flexShrink: a.cardLayout === 'horizontal' ? 0 : 1,
                overflow: 'hidden',
            }
        },
            el('img', {
                src: item.imageUrl,
                alt: item.imageAlt || '',
                style: {
                    position: a.cardLayout === 'horizontal' ? 'static' : 'absolute',
                    inset: '0',
                    width: '100%',
                    height: a.cardLayout === 'horizontal' ? '140px' : '100%',
                    objectFit: a.imageFit || 'cover',
                    display: 'block',
                }
            })
        ) : (a.cardLayout !== 'text' && !hasImage && a.cardLayout !== 'overlay') ? el('div', {
            style: {
                paddingTop: a.cardLayout === 'horizontal' ? '0' : pt,
                height: a.cardLayout === 'horizontal' ? '120px' : '0',
                width: a.cardLayout === 'horizontal' ? '40%' : '100%',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: 12,
                flexShrink: 0,
                overflow: 'hidden',
            }
        }, a.cardLayout !== 'horizontal' ? null : '🖼') : null;

        var bodyStyle = {
            padding: a.cardPadding + 'px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flex: '1',
        };

        if (a.cardLayout === 'overlay' && hasImage) {
            bodyStyle.position = 'absolute';
            bodyStyle.inset = '0';
            bodyStyle.background = 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.75) 100%)';
            bodyStyle.justifyContent = 'flex-end';
            bodyStyle.borderRadius = a.cardBorderRadius + 'px';
        }

        var body = el('div', { className: 'bkbg-cc-body', style: bodyStyle },
            a.showBadge && item.badge && el('span', {
                style: {
                    display: 'inline-block',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: a.badgeBg,
                    color: a.badgeColor,
                    alignSelf: 'flex-start',
                }
            }, item.badge),
            a.showEyebrow && item.eyebrow && el('div', {
                className: 'bkbg-cc-eyebrow',
                style: {
                    color: a.cardLayout === 'overlay' ? 'rgba(255,255,255,0.75)' : accentColor,
                }
            }, item.eyebrow),
            el('h3', {
                className: 'bkbg-cc-heading',
                style: {
                    margin: 0,
                    color: a.cardLayout === 'overlay' ? '#fff' : a.headingColor,
                }
            }, item.heading || 'Card Title'),
            a.showDescription && item.description && el('p', {
                className: 'bkbg-cc-desc',
                style: {
                    margin: 0,
                    color: a.cardLayout === 'overlay' ? 'rgba(255,255,255,0.8)' : a.textColor,
                    flexGrow: 1,
                }
            }, item.description),
            a.showLink && item.link && el('a', {
                href: '#',
                style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 14,
                    fontWeight: 600,
                    color: a.cardLayout === 'overlay' ? '#fff' : a.linkColor,
                    textDecoration: a.linkStyle === 'underline' ? 'underline' : 'none',
                    marginTop: 4,
                }
            }, (item.linkLabel || 'Learn more'), a.linkStyle === 'arrow' ? ' →' : '')
        );

        var cardContent = [];
        if (a.cardLayout === 'overlay' && hasImage) {
            cardContent = [
                el('img', {
                    src: item.imageUrl,
                    alt: item.imageAlt || '',
                    style: {
                        position: 'absolute',
                        inset: '0',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                    }
                }),
                body
            ];
        } else if (a.cardLayout === 'horizontal') {
            cardContent = [imageSection, body].filter(Boolean);
        } else {
            cardContent = [imageSection, body].filter(Boolean);
        }

        return el('div', { key: idx, className: 'bkbg-cc-card shadow-' + a.cardShadow + ' layout-' + a.cardLayout, style: cardStyle }, ...cardContent);
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

    registerBlockType('blockenberg/card-carousel', {
        title: __('Card Carousel', 'blockenberg'),
        icon: 'slides',
        category: 'bkbg-effects',
        description: __('Horizontal drag-to-scroll card carousel with rich cards, autoplay, arrows, dots, and responsive columns.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var activeState = useState(0);
            var activeCard = activeState[0];
            var setActiveCard = activeState[1];
            var blockProps = useBlockProps({ style: Object.assign({ background: a.containerBg || '', padding: a.padding + 'px' }, _tv(a.typoHeading, '--bkbg-cc-h-'), _tv(a.typoDesc, '--bkbg-cc-d-'), _tv(a.typoEyebrow, '--bkbg-cc-e-')) });

            function addItem() {
                var newItem = {
                    eyebrow: 'Category',
                    heading: 'New Card Title',
                    description: 'Write a short description for this card.',
                    imageUrl: '', imageId: 0, imageAlt: '',
                    link: '', linkLabel: 'Learn more',
                    badge: '',
                    accentColor: '#6366f1',
                };
                set({ items: a.items.concat([newItem]) });
            }

            function removeItem(i) {
                if (a.items.length <= 1) return;
                set({ items: a.items.filter(function (_, idx) { return idx !== i; }) });
                setActiveCard(Math.max(0, activeCard - 1));
            }

            function moveItem(i, dir) {
                var items = a.items.slice();
                var j = i + dir;
                if (j < 0 || j >= items.length) return;
                var tmp = items[i]; items[i] = items[j]; items[j] = tmp;
                set({ items: items });
                setActiveCard(j);
            }

            var activeItem = a.items[activeCard] || a.items[0];

            return el(Fragment, null,
                el(InspectorControls, null,
                    // Items Panel
                    el(PanelBody, { title: 'Cards (' + a.items.length + ')', initialOpen: true },
                        a.items.map(function (item, i) {
                            return el('div', {
                                key: i,
                                style: {
                                    border: i === activeCard ? '2px solid #6366f1' : '1px solid #e5e7eb',
                                    borderRadius: 8,
                                    padding: '8px',
                                    marginBottom: 8,
                                    background: i === activeCard ? '#f5f3ff' : '#fff',
                                    cursor: 'pointer',
                                }
                            },
                                el('div', {
                                    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i === activeCard ? 8 : 0 },
                                    onClick: function () { setActiveCard(i); }
                                },
                                    el('span', { style: { fontWeight: 600, fontSize: 13, color: '#374151' } }, (i + 1) + '. ' + (item.heading || 'Card')),
                                    el('div', { style: { display: 'flex', gap: 3 } },
                                        el(Button, { onClick: function (e) { e.stopPropagation(); moveItem(i, -1); }, variant: 'tertiary', size: 'small', disabled: i === 0, __nextHasNoMarginBottom: true }, '↑'),
                                        el(Button, { onClick: function (e) { e.stopPropagation(); moveItem(i, 1); }, variant: 'tertiary', size: 'small', disabled: i === a.items.length - 1, __nextHasNoMarginBottom: true }, '↓'),
                                        el(Button, { onClick: function (e) { e.stopPropagation(); removeItem(i); }, isDestructive: true, variant: 'tertiary', size: 'small', __nextHasNoMarginBottom: true }, '✕')
                                    )
                                ),
                                i === activeCard && el(Fragment, null,
                                    el(TextControl, {
                                        label: 'Eyebrow',
                                        value: item.eyebrow,
                                        onChange: function (v) { set({ items: updateItem(a.items, i, 'eyebrow', v) }); },
                                        __nextHasNoMarginBottom: true,
                                    }),
                                    el('div', { style: { height: 8 } }),
                                    el(TextControl, {
                                        label: 'Heading',
                                        value: item.heading,
                                        onChange: function (v) { set({ items: updateItem(a.items, i, 'heading', v) }); },
                                        __nextHasNoMarginBottom: true,
                                    }),
                                    el('div', { style: { height: 8 } }),
                                    el(TextControl, {
                                        label: 'Description',
                                        value: item.description,
                                        onChange: function (v) { set({ items: updateItem(a.items, i, 'description', v) }); },
                                        __nextHasNoMarginBottom: true,
                                    }),
                                    el('div', { style: { height: 8 } }),
                                    el(TextControl, {
                                        label: 'Badge',
                                        value: item.badge,
                                        onChange: function (v) { set({ items: updateItem(a.items, i, 'badge', v) }); },
                                        __nextHasNoMarginBottom: true,
                                    }),
                                    el('div', { style: { height: 8 } }),
                                    el(TextControl, {
                                        label: 'Link URL',
                                        value: item.link,
                                        placeholder: 'https://',
                                        onChange: function (v) { set({ items: updateItem(a.items, i, 'link', v) }); },
                                        __nextHasNoMarginBottom: true,
                                    }),
                                    el('div', { style: { height: 8 } }),
                                    el(TextControl, {
                                        label: 'Link Label',
                                        value: item.linkLabel,
                                        onChange: function (v) { set({ items: updateItem(a.items, i, 'linkLabel', v) }); },
                                        __nextHasNoMarginBottom: true,
                                    }),
                                    el('div', { style: { height: 8 } }),
                                    el(BkbgColorSwatch, {
                                        label: 'Accent Color (hex)',
                                        value: item.accentColor,
                                        onChange: function (v) { set({ items: updateItem(a.items, i, 'accentColor', v) }); },
                                    }),
                                    el('div', { style: { height: 8 } }),
                                    el('div', { style: { marginBottom: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.5px' } }, 'Image'),
                                    el(MediaUploadCheck, null,
                                        el(MediaUpload, {
                                            onSelect: function (media) {
                                                var items2 = updateItem(a.items, i, 'imageUrl', media.url);
                                                items2 = updateItem(items2, i, 'imageId', media.id);
                                                items2 = updateItem(items2, i, 'imageAlt', media.alt || '');
                                                set({ items: items2 });
                                            },
                                            allowedTypes: ['image'],
                                            value: item.imageId,
                                            render: function (ref) {
                                                return el(Button, {
                                                    onClick: ref.open,
                                                    variant: item.imageUrl ? 'secondary' : 'primary',
                                                    size: 'small',
                                                    __nextHasNoMarginBottom: true,
                                                }, item.imageUrl ? 'Change Image' : 'Add Image');
                                            }
                                        })
                                    ),
                                    item.imageUrl && el(Button, {
                                        onClick: function () {
                                            var items2 = updateItem(a.items, i, 'imageUrl', '');
                                            items2 = updateItem(items2, i, 'imageId', 0);
                                            set({ items: items2 });
                                        },
                                        isDestructive: true, variant: 'link', size: 'small',
                                        style: { display: 'block', marginTop: 4 },
                                        __nextHasNoMarginBottom: true,
                                    }, 'Remove Image')
                                )
                            );
                        }),
                        el(Button, {
                            onClick: addItem,
                            variant: 'secondary',
                            style: { width: '100%', justifyContent: 'center', marginTop: 4 },
                            __nextHasNoMarginBottom: true,
                        }, '+ Add Card')
                    ),

                    // Layout Panel
                    el(PanelBody, { title: 'Layout & Columns', initialOpen: false },
                        el(SelectControl, {
                            label: 'Card Layout',
                            value: a.cardLayout,
                            options: CARD_LAYOUT_OPTIONS,
                            onChange: function (v) { set({ cardLayout: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.cardLayout !== 'text' && el(Fragment, null,
                            el('div', { style: { height: 12 } }),
                            el(SelectControl, {
                                label: 'Image Aspect Ratio',
                                value: a.imageAspect,
                                options: ASPECT_OPTIONS,
                                onChange: function (v) { set({ imageAspect: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        ),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Desktop Columns',
                            value: a.desktopCols,
                            min: 1, max: 6,
                            onChange: function (v) { set({ desktopCols: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Tablet Columns',
                            value: a.tabletCols,
                            min: 1, max: 4,
                            onChange: function (v) { set({ tabletCols: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Mobile Columns',
                            value: a.mobileCols,
                            min: 1, max: 2,
                            onChange: function (v) { set({ mobileCols: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Gap (px)',
                            value: a.gap,
                            min: 0, max: 60,
                            onChange: function (v) { set({ gap: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Min Card Height (0 = auto)',
                            value: a.cardMinHeight,
                            min: 0, max: 600,
                            onChange: function (v) { set({ cardMinHeight: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Card Border Radius (px)',
                            value: a.cardBorderRadius,
                            min: 0, max: 32,
                            onChange: function (v) { set({ cardBorderRadius: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(SelectControl, {
                            label: 'Card Shadow',
                            value: a.cardShadow,
                            options: SHADOW_OPTIONS,
                            onChange: function (v) { set({ cardShadow: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Card Inner Padding (px)',
                            value: a.cardPadding,
                            min: 8, max: 48,
                            onChange: function (v) { set({ cardPadding: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Outer Padding (px)',
                            value: a.padding,
                            min: 0, max: 80,
                            onChange: function (v) { set({ padding: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),

                    // Navigation Panel
                    el(PanelBody, { title: 'Navigation & Autoplay', initialOpen: false },
                        el(ToggleControl, {
                            label: 'Show Arrows',
                            checked: a.showArrows,
                            onChange: function (v) { set({ showArrows: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, {
                            label: 'Show Dots',
                            checked: a.showDots,
                            onChange: function (v) { set({ showDots: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, {
                            label: 'Loop (infinite)',
                            checked: a.loop,
                            onChange: function (v) { set({ loop: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, {
                            label: 'Autoplay',
                            checked: a.autoplay,
                            onChange: function (v) { set({ autoplay: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.autoplay && el(Fragment, null,
                            el('div', { style: { height: 8 } }),
                            el(RangeControl, {
                                label: 'Autoplay Speed (ms)',
                                value: a.autoplaySpeed,
                                min: 1000, max: 10000, step: 500,
                                onChange: function (v) { set({ autoplaySpeed: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(ToggleControl, {
                                label: 'Pause on Hover',
                                checked: a.pauseOnHover,
                                onChange: function (v) { set({ pauseOnHover: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        )
                    ),

                    // Content Toggles Panel
                    el(PanelBody, { title: 'Card Content', initialOpen: false },
                        el(ToggleControl, {
                            label: 'Show Badge',
                            checked: a.showBadge,
                            onChange: function (v) { set({ showBadge: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, {
                            label: 'Show Eyebrow',
                            checked: a.showEyebrow,
                            onChange: function (v) { set({ showEyebrow: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, {
                            label: 'Show Description',
                            checked: a.showDescription,
                            onChange: function (v) { set({ showDescription: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, {
                            label: 'Show Link',
                            checked: a.showLink,
                            onChange: function (v) { set({ showLink: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showLink && el(Fragment, null,
                            el('div', { style: { height: 8 } }),
                            el(SelectControl, {
                                label: 'Link Style',
                                value: a.linkStyle,
                                options: LINK_STYLE_OPTIONS,
                                onChange: function (v) { set({ linkStyle: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        ),
                        el('div', { style: { height: 12 } }),
                        el('div', { style: { height: 8 } }),
                        el('div', { style: { height: 8 } }),
                        ),

                    // Colors Panel
                    
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(getTypographyControl(), { label: __('Heading', 'blockenberg'), value: a.typoHeading, onChange: function (v) { set({ typoHeading: v }); } }),
                        el(getTypographyControl(), { label: __('Description', 'blockenberg'), value: a.typoDesc, onChange: function (v) { set({ typoDesc: v }); } }),
                        el(getTypographyControl(), { label: __('Eyebrow', 'blockenberg'), value: a.typoEyebrow, onChange: function (v) { set({ typoEyebrow: v }); } })
                    ),
el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Container Background', value: a.containerBg, onChange: function (v) { set({ containerBg: v || '' }); } },
                            { label: 'Card Background', value: a.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                            { label: 'Eyebrow Color', value: a.eyebrowColor, onChange: function (v) { set({ eyebrowColor: v || '#6366f1' }); } },
                            { label: 'Heading Color', value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#111827' }); } },
                            { label: 'Text Color', value: a.textColor, onChange: function (v) { set({ textColor: v || '#6b7280' }); } },
                            { label: 'Link Color', value: a.linkColor, onChange: function (v) { set({ linkColor: v || '#6366f1' }); } },
                            { label: 'Badge Background', value: a.badgeBg, onChange: function (v) { set({ badgeBg: v || '#ede9fe' }); } },
                            { label: 'Badge Text', value: a.badgeColor, onChange: function (v) { set({ badgeColor: v || '#6366f1' }); } },
                            { label: 'Arrow Background', value: a.arrowBg, onChange: function (v) { set({ arrowBg: v || '#ffffff' }); } },
                            { label: 'Arrow Color', value: a.arrowColor, onChange: function (v) { set({ arrowColor: v || '#111827' }); } },
                            { label: 'Active Dot Color', value: a.dotActiveColor, onChange: function (v) { set({ dotActiveColor: v || '#6366f1' }); } },
                            { label: 'Inactive Dot Color', value: a.dotInactiveColor, onChange: function (v) { set({ dotInactiveColor: v || '#d1d5db' }); } },
                        ]
                    })
                ),

                // Editor Preview
                el('div', blockProps,
                    // Cards strip (horizontal scroll preview)
                    el('div', {
                        style: {
                            display: 'flex',
                            gap: a.gap + 'px',
                            overflowX: 'auto',
                            paddingBottom: 8,
                        }
                    },
                        a.items.map(function (item, i) {
                            return renderCardPreview(item, a, i);
                        })
                    ),
                    // Navigation preview
                    el('div', { style: { marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 } },
                        a.showArrows && el('button', {
                            disabled: true,
                            style: {
                                width: 36, height: 36, borderRadius: '50%',
                                background: a.arrowBg, border: '1px solid #e5e7eb',
                                color: a.arrowColor, cursor: 'not-allowed', fontSize: 16,
                            }
                        }, '←'),
                        a.showDots && el('div', { style: { display: 'flex', gap: 6 } },
                            a.items.map(function (_, i) {
                                return el('div', {
                                    key: i,
                                    style: {
                                        width: i === 0 ? 20 : 8,
                                        height: 8,
                                        borderRadius: 999,
                                        background: i === 0 ? a.dotActiveColor : a.dotInactiveColor,
                                        transition: 'all 0.3s',
                                    }
                                });
                            })
                        ),
                        a.showArrows && el('button', {
                            disabled: true,
                            style: {
                                width: 36, height: 36, borderRadius: '50%',
                                background: a.arrowBg, border: '1px solid #e5e7eb',
                                color: a.arrowColor, cursor: 'not-allowed', fontSize: 16,
                            }
                        }, '→')
                    ),
                    // Info strip
                    el('div', { style: { marginTop: 8, fontSize: 11, color: '#9ca3af', textAlign: 'center' } },
                        '🎠 ' + a.items.length + ' cards | Desktop: ' + a.desktopCols + ' cols | Autoplay: ' + (a.autoplay ? 'on' : 'off') + ' | Drag enabled on frontend'
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-cc-app',
                    'data-opts': JSON.stringify(props.attributes),
                })
            );
        }
    });
}() );
