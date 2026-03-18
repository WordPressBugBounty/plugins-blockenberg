( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="280" height="160"><rect width="280" height="160" fill="%23e5e7eb"/><text x="50%25" y="50%25" font-family="sans-serif" font-size="13" fill="%239ca3af" text-anchor="middle" dy=".3em">No Image</text></svg>';

    function cloneCard(card) {
        return Object.assign({}, card);
    }

    /* ── Single card preview ───────────────────────────────────────────────── */
    function CardPreview(props) {
        var a = props.a;
        var card = props.card;

        var cardStyle = {
            width: a.cardWidth + 'px',
            borderRadius: a.cardRadius + 'px',
            border: a.cardBorderWidth + 'px solid ' + a.cardBorder,
            background: a.cardBg,
            flexShrink: 0,
            overflow: 'hidden',
            boxShadow: a.cardShadow ? '0 4px 20px rgba(0,0,0,0.10)' : 'none',
            transition: a.hoverLift ? 'transform 0.3s ease, box-shadow 0.3s ease' : 'none',
        };

        var contentStyle = {
            padding: a.cardPadding + 'px',
        };

        return el('div', { style: cardStyle, className: 'bkmc-card' },
            a.showImage ? el('div', {
                style: {
                    width: '100%',
                    height: a.imageHeight + 'px',
                    overflow: 'hidden',
                    background: '#f3f4f6',
                }
            }, el('img', {
                src: card.imageUrl || PLACEHOLDER,
                alt: card.imageAlt || '',
                style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
            })) : null,
            el('div', { style: contentStyle },
                a.showTag && card.tag ? el('span', {
                    className: 'bkmc-tag',
                    style: {
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: '20px',
                        background: a.tagBg,
                        color: a.tagColor,
                        marginBottom: '10px',
                    }
                }, card.tag) : null,
                el('h3', {
                    className: 'bkmc-heading',
                    style: {
                        margin: '0 0 8px',
                        color: a.headingColor,
                    }
                }, card.heading || __('Card Heading', 'blockenberg')),
                a.showText && card.text ? el('p', {
                    className: 'bkmc-text',
                    style: {
                        margin: '0 0 12px',
                        color: a.textColor,
                    }
                }, card.text) : null,
                a.showLink && card.linkLabel ? el('a', {
                    href: card.link || '#',
                    className: 'bkmc-link',
                    style: {
                        color: a.linkColor,
                        textDecoration: 'none',
                    }
                }, card.linkLabel) : null
            )
        );
    }

    /* ── Inspector card editor row ─────────────────────────────────────────── */
    function CardEditor(props) {
        var idx = props.idx;
        var card = props.card;
        var onChange = props.onChange;
        var onRemove = props.onRemove;
        var a = props.a;

        var open = props.openIdx === idx;
        var setOpen = props.setOpen;

        return el(PanelBody, {
            title: (card.heading || __('Card', 'blockenberg') + ' ' + (idx + 1)),
            initialOpen: false,
            opened: open,
            onToggle: function () { setOpen(open ? -1 : idx); }
        },
            el(MediaUploadCheck, null,
                el(MediaUpload, {
                    onSelect: function (media) {
                        onChange(idx, { imageUrl: media.url, imageId: media.id, imageAlt: media.alt || '' });
                    },
                    allowedTypes: ['image'],
                    value: card.imageId,
                    render: function (ref) {
                        return el(Button, {
                            onClick: ref.open,
                            variant: card.imageUrl ? 'secondary' : 'primary',
                            size: 'small',
                            style: { marginBottom: '8px' }
                        }, card.imageUrl ? __('Replace Image', 'blockenberg') : __('Add Image', 'blockenberg'));
                    }
                })
            ),
            el(TextControl, {
                label: __('Tag / Category', 'blockenberg'),
                value: card.tag || '',
                onChange: function (v) { onChange(idx, { tag: v }); }
            }),
            el(TextControl, {
                label: __('Heading', 'blockenberg'),
                value: card.heading || '',
                onChange: function (v) { onChange(idx, { heading: v }); }
            }),
            el(TextControl, {
                label: __('Description', 'blockenberg'),
                value: card.text || '',
                onChange: function (v) { onChange(idx, { text: v }); }
            }),
            el(TextControl, {
                label: __('Link URL', 'blockenberg'),
                type: 'url',
                value: card.link || '',
                onChange: function (v) { onChange(idx, { link: v }); }
            }),
            el(TextControl, {
                label: __('Link Label', 'blockenberg'),
                value: card.linkLabel || 'Learn more →',
                onChange: function (v) { onChange(idx, { linkLabel: v }); }
            }),
            el(Button, {
                variant: 'tertiary',
                isDestructive: true,
                onClick: function () { onRemove(idx); }
            }, __('Remove Card', 'blockenberg'))
        );
    }

    /* ── Register ──────────────────────────────────────────────────────────── */
    registerBlockType('blockenberg/marquee-cards', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var openIdx = useState(-1);

            function updateCard(idx, patch) {
                var newCards = a.cards.map(function (c, i) {
                    return i === idx ? Object.assign({}, c, patch) : c;
                });
                set({ cards: newCards });
            }

            function removeCard(idx) {
                set({ cards: a.cards.filter(function (_, i) { return i !== idx; }) });
            }

            function addCard() {
                set({ cards: a.cards.concat([{
                    imageUrl: '', imageId: 0, imageAlt: '',
                    tag: 'New', heading: 'New Card', text: 'Add your description here.', link: '', linkLabel: 'Learn more →'
                }]) });
                openIdx[1](a.cards.length);
            }

            var blockProps = useBlockProps((function () {
                var tv = getTypoCssVars();
                var s = {
                    paddingTop: a.paddingY + 'px',
                    paddingBottom: a.paddingY + 'px',
                    overflow: 'hidden',
                    position: 'relative',
                };
                if (a.wrapperBg) s.background = a.wrapperBg;
                Object.assign(s, tv(a.headingTypo, '--bkbg-mkc-hd-'));
                Object.assign(s, tv(a.textTypo, '--bkbg-mkc-tx-'));
                Object.assign(s, tv(a.tagTypo, '--bkbg-mkc-tg-'));
                return { className: 'bkmc-outer', style: s };
            })());

            /* Preview: show all cards in a non-scrolling row in editor */
            var trackStyle = {
                display: 'flex',
                gap: a.cardGap + 'px',
                overflowX: 'auto',
                paddingBottom: '12px',
            };

            return el(wp.element.Fragment, null,
                el(InspectorControls, null,

                    /* Cards */
                    el(PanelBody, { title: __('Cards', 'blockenberg'), initialOpen: true },
                        a.cards.map(function (card, idx) {
                            return el(CardEditor, {
                                key: idx, idx: idx, card: card, a: a,
                                onChange: updateCard,
                                onRemove: removeCard,
                                openIdx: openIdx[0],
                                setOpen: openIdx[1],
                            });
                        }),
                        el(Button, {
                            variant: 'primary',
                            onClick: addCard,
                            style: { marginTop: '12px', width: '100%', justifyContent: 'center' }
                        }, __('+ Add Card', 'blockenberg'))
                    ),

                    /* Scroll settings */
                    el(PanelBody, { title: __('Scroll', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Speed (s for full loop)', 'blockenberg'),
                            value: a.speed,
                            min: 5, max: 120,
                            onChange: function (v) { set({ speed: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Direction', 'blockenberg'),
                            value: a.direction,
                            options: [
                                { label: __('Left',  'blockenberg'), value: 'left'  },
                                { label: __('Right', 'blockenberg'), value: 'right' },
                            ],
                            onChange: function (v) { set({ direction: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Pause on Hover', 'blockenberg'),
                            checked: a.pauseOnHover,
                            onChange: function (v) { set({ pauseOnHover: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Two Rows (second row reversed)', 'blockenberg'),
                            checked: a.twoRows,
                            onChange: function (v) { set({ twoRows: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Fade Edges', 'blockenberg'),
                            checked: a.fadeEdges,
                            onChange: function (v) { set({ fadeEdges: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(RangeControl, {
                            label: __('Wrapper Padding Y (px)', 'blockenberg'),
                            value: a.paddingY,
                            min: 0, max: 120,
                            onChange: function (v) { set({ paddingY: v }); }
                        })
                    ),

                    /* Card appearance */
                    el(PanelBody, { title: __('Card Appearance', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Card Width (px)', 'blockenberg'),
                            value: a.cardWidth,
                            min: 140, max: 600,
                            onChange: function (v) { set({ cardWidth: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Card Gap (px)', 'blockenberg'),
                            value: a.cardGap,
                            min: 0, max: 60,
                            onChange: function (v) { set({ cardGap: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Card Border Radius (px)', 'blockenberg'),
                            value: a.cardRadius,
                            min: 0, max: 40,
                            onChange: function (v) { set({ cardRadius: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Card Padding (px)', 'blockenberg'),
                            value: a.cardPadding,
                            min: 8, max: 60,
                            onChange: function (v) { set({ cardPadding: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Border Width (px)', 'blockenberg'),
                            value: a.cardBorderWidth,
                            min: 0, max: 4,
                            onChange: function (v) { set({ cardBorderWidth: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Card Shadow', 'blockenberg'),
                            checked: a.cardShadow,
                            onChange: function (v) { set({ cardShadow: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Lift on Hover', 'blockenberg'),
                            checked: a.hoverLift,
                            onChange: function (v) { set({ hoverLift: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),

                    /* Image */
                    el(PanelBody, { title: __('Image', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show Image', 'blockenberg'),
                            checked: a.showImage,
                            onChange: function (v) { set({ showImage: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        a.showImage ? el(RangeControl, {
                            label: __('Image Height (px)', 'blockenberg'),
                            value: a.imageHeight,
                            min: 60, max: 400,
                            onChange: function (v) { set({ imageHeight: v }); }
                        }) : null,
                        el(ToggleControl, {
                            label: __('Show Tag', 'blockenberg'),
                            checked: a.showTag,
                            onChange: function (v) { set({ showTag: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show Description', 'blockenberg'),
                            checked: a.showText,
                            onChange: function (v) { set({ showText: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show Link', 'blockenberg'),
                            checked: a.showLink,
                            onChange: function (v) { set({ showLink: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),

                    /* Typography */
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Heading', 'blockenberg'), value: a.headingTypo || {}, onChange: function (v) { set({ headingTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Text', 'blockenberg'), value: a.textTypo || {}, onChange: function (v) { set({ textTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Tag', 'blockenberg'), value: a.tagTypo || {}, onChange: function (v) { set({ tagTypo: v }); } })
                    ),

                    /* Colors */
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.wrapperBg,   onChange: function (v) { set({ wrapperBg:   v || '' }); },       label: __('Wrapper Background', 'blockenberg') },
                            { value: a.cardBg,      onChange: function (v) { set({ cardBg:      v || '#ffffff' }); }, label: __('Card Background', 'blockenberg') },
                            { value: a.cardBorder,  onChange: function (v) { set({ cardBorder:  v || '#e5e7eb' }); }, label: __('Card Border', 'blockenberg') },
                            { value: a.tagBg,       onChange: function (v) { set({ tagBg:       v || '#ede9fe' }); }, label: __('Tag Background', 'blockenberg') },
                            { value: a.tagColor,    onChange: function (v) { set({ tagColor:    v || '#6c3fb5' }); }, label: __('Tag Text', 'blockenberg') },
                            { value: a.headingColor,onChange: function (v) { set({ headingColor:v || '#111827' }); }, label: __('Heading', 'blockenberg') },
                            { value: a.textColor,   onChange: function (v) { set({ textColor:   v || '#6b7280' }); }, label: __('Description', 'blockenberg') },
                            { value: a.linkColor,   onChange: function (v) { set({ linkColor:   v || '#6c3fb5' }); }, label: __('Link', 'blockenberg') },
                        ]
                    })
                ),

                /* Canvas */
                el('div', blockProps,
                    el('div', { style: { fontSize: '11px', color: '#9ca3af', marginBottom: '8px', textAlign: 'center' } },
                        __('Marquee Cards — preview (scrolling is frontend-only)', 'blockenberg')
                    ),
                    el('div', { style: trackStyle },
                        a.cards.map(function (card, i) {
                            return el(CardPreview, { key: i, a: a, card: card });
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            function renderCard(card, i, cloned) {
                return el('div', {
                    key: (cloned ? 'c' : '') + i,
                    className: 'bkmc-card',
                    'aria-hidden': cloned ? 'true' : undefined,
                    style: 'width:' + a.cardWidth + 'px;border-radius:' + a.cardRadius + 'px;border:' + a.cardBorderWidth + 'px solid ' + a.cardBorder + ';background:' + a.cardBg + ';flex-shrink:0;overflow:hidden;box-shadow:' + (a.cardShadow ? '0 4px 20px rgba(0,0,0,0.10)' : 'none') + ';',
                },
                    a.showImage ? el('div', {
                        style: 'width:100%;height:' + a.imageHeight + 'px;overflow:hidden;background:#f3f4f6;'
                    }, card.imageUrl ? el('img', { src: card.imageUrl, alt: card.imageAlt || '', style: 'width:100%;height:100%;object-fit:cover;display:block;' }) : null) : null,
                    el('div', { style: 'padding:' + a.cardPadding + 'px;' },
                        a.showTag && card.tag ? el('span', {
                            className: 'bkmc-tag',
                            style: 'display:inline-block;padding:2px 10px;border-radius:20px;background:' + a.tagBg + ';color:' + a.tagColor + ';margin-bottom:10px;'
                        }, card.tag) : null,
                        el('h3', { className: 'bkmc-heading', style: 'margin:0 0 8px;color:' + a.headingColor + ';' }, card.heading),
                        a.showText && card.text ? el('p', { className: 'bkmc-text', style: 'margin:0 0 12px;color:' + a.textColor + ';' }, card.text) : null,
                        a.showLink && card.link && card.linkLabel ? el('a', { href: card.link, className: 'bkmc-link', style: 'color:' + a.linkColor + ';text-decoration:none;' }, card.linkLabel) : null
                    )
                );
            }

            var blockProps = wp.blockEditor.useBlockProps.save((function () {
                var tv = getTypoCssVars();
                var s = {};
                if (a.wrapperBg) s.background = a.wrapperBg;
                s.paddingTop = a.paddingY + 'px';
                s.paddingBottom = a.paddingY + 'px';
                Object.assign(s, tv(a.headingTypo, '--bkbg-mkc-hd-'));
                Object.assign(s, tv(a.textTypo, '--bkbg-mkc-tx-'));
                Object.assign(s, tv(a.tagTypo, '--bkbg-mkc-tg-'));
                return {
                    className: 'bkmc-outer',
                    style: s,
                    'data-speed': a.speed,
                    'data-direction': a.direction,
                    'data-pause': String(a.pauseOnHover),
                    'data-card-width': a.cardWidth,
                    'data-card-gap': a.cardGap,
                    'data-hover-lift': String(a.hoverLift),
                    'data-fade': String(a.fadeEdges),
                };
            })());

            var row1 = el('div', {
                className: 'bkmc-track',
                'data-row': '1',
            },
                a.cards.map(function (card, i) { return renderCard(card, i, false); }),
                // Clone set for seamless loop
                a.cards.map(function (card, i) { return renderCard(card, i, true); })
            );

            var row2 = a.twoRows ? el('div', {
                className: 'bkmc-track',
                'data-row': '2',
                'data-reverse': 'true',
            },
                a.cards.map(function (card, i) { return renderCard(card, i, false); }),
                a.cards.map(function (card, i) { return renderCard(card, i, true); })
            ) : null;

            return el('div', blockProps, row1, row2);
        }
    });
}() );
