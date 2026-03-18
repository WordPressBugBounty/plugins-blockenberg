( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;
    var useState = wp.element.useState;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

    /* ── Card preview in editor ── */
    function CardPreview(props) {
        var card = props.card;
        var attr = props.attr;
        var isActive = props.isActive;

        var cardStyle = {
            width: attr.cardWidth + 'px',
            height: attr.cardHeight + 'px',
            borderRadius: attr.cardRadius + 'px',
            background: card.imageUrl ? 'none' : attr.cardBg,
            backgroundColor: attr.cardBg,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            boxShadow: isActive ? '0 32px 64px rgba(0,0,0,0.4)' : '0 16px 32px rgba(0,0,0,0.2)',
            transition: 'all 0.3s'
        };

        var overlayStyle = {
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(to top, rgba(0,0,0,' + (attr.overlayStrength / 100) + ') 40%, transparent 100%)'
        };

        var contentStyle = {
            position: 'relative', zIndex: 2,
            padding: '24px'
        };

        return el('div', { style: cardStyle },
            card.imageUrl && el('img', {
                src: card.imageUrl, alt: card.imageAlt,
                style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: attr.imageFit }
            }),
            el('div', { style: overlayStyle }),
            el('div', { style: contentStyle },
                attr.showTag && card.tag && el('span', {
                    style: {
                        display: 'inline-block', background: attr.tagBg, color: attr.tagColor,
                        fontSize: attr.tagSize + 'px', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.08em', padding: '3px 10px', borderRadius: '100px',
                        marginBottom: '10px'
                    }
                }, card.tag),
                attr.showTitle && card.title && el('div', {
                    className: 'bkbg-cds-title',
                    style: { color: attr.titleColor, marginBottom: '10px' }
                }, card.title),
                attr.showDescription && card.description && el('div', {
                    className: 'bkbg-cds-desc',
                    style: { color: attr.descColor, marginBottom: '14px' }
                }, card.description),
                attr.showLink && card.linkLabel && el('span', {
                    style: { color: attr.linkColor, fontWeight: 600, fontSize: '14px' }
                }, card.linkLabel + ' →')
            )
        );
    }

    registerBlockType('blockenberg/card-deck-slider', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var cards = attr.cards;
            var blockProps = useBlockProps({ style: Object.assign({ background: attr.sectionBg || undefined }, _tv(attr.typoTitle, '--bkbg-cds-tt-'), _tv(attr.typoDesc, '--bkbg-cds-td-')) });
            var previewIdx = useState(0);
            var activeIdx = previewIdx[0];
            var setActiveIdx = previewIdx[1];

            function updateCard(idx, key, val) {
                var next = cards.map(function (c, i) {
                    if (i !== idx) return c;
                    var updated = {};
                    Object.keys(c).forEach(function (k) { updated[k] = c[k]; });
                    updated[key] = val;
                    return updated;
                });
                setAttr({ cards: next });
            }

            function addCard() {
                setAttr({
                    cards: cards.concat([{ imageUrl: '', imageAlt: '', tag: 'New', title: 'Card Title', description: 'Card description text goes here.', linkUrl: '', linkLabel: 'Learn More' }])
                });
            }

            function removeCard(idx) {
                if (cards.length <= 2) return;
                var next = cards.filter(function (_, i) { return i !== idx; });
                setAttr({ cards: next });
                if (activeIdx >= next.length) setActiveIdx(next.length - 1);
            }

            /* Editor deck preview — show active card with stacked cards behind */
            var deckPreview = el('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '60px 20px',
                    background: attr.sectionBg || '#f8fafc',
                    borderRadius: '16px'
                }
            },
                el('div', { style: { position: 'relative', width: attr.cardWidth + 'px', height: attr.cardHeight + 'px' } },
                    /* stacked cards behind */
                    cards.slice(1, Math.min(attr.stackCount + 1, cards.length)).map(function (card, i) {
                        var depth = i + 1;
                        var angle = attr.deckStyle === 'fan' ? (depth % 2 === 0 ? 1 : -1) * attr.stackAngle * depth / 2 : 0;
                        var offsetY = attr.deckStyle === 'stack' ? -depth * attr.stackOffset : 0;
                        var scale = 1 - depth * attr.stackScale;
                        return el('div', {
                            key: i,
                            style: {
                                position: 'absolute', inset: 0,
                                transform: 'rotate(' + angle + 'deg) translateY(' + offsetY + 'px) scale(' + scale + ')',
                                transformOrigin: 'bottom center',
                                zIndex: cards.length - depth
                            }
                        }, el(CardPreview, { card: card, attr: attr, isActive: false }));
                    }),
                    /* active card on top */
                    el('div', { style: { position: 'absolute', inset: 0, zIndex: cards.length } },
                        el(CardPreview, { card: cards[activeIdx] || cards[0], attr: attr, isActive: true })
                    )
                ),
                attr.showArrows && el('div', { style: { display: 'flex', gap: '12px', marginTop: '28px' } },
                    el('button', {
                        style: { width: '44px', height: '44px', borderRadius: '50%', border: 'none', background: attr.arrowBg, color: attr.arrowColor, cursor: 'pointer', fontSize: '18px' },
                        onClick: function () { setActiveIdx((activeIdx - 1 + cards.length) % cards.length); }
                    }, '←'),
                    el('button', {
                        style: { width: '44px', height: '44px', borderRadius: '50%', border: 'none', background: attr.arrowBg, color: attr.arrowColor, cursor: 'pointer', fontSize: '18px' },
                        onClick: function () { setActiveIdx((activeIdx + 1) % cards.length); }
                    }, '→')
                ),
                attr.showDots && el('div', { style: { display: 'flex', gap: '8px', marginTop: '16px' } },
                    cards.map(function (_, i) {
                        return el('div', {
                            key: i,
                            style: {
                                width: i === activeIdx ? '24px' : '8px',
                                height: '8px', borderRadius: '100px',
                                background: i === activeIdx ? attr.dotColor : '#cbd5e1',
                                transition: 'all 0.3s', cursor: 'pointer'
                            },
                            onClick: function () { setActiveIdx(i); }
                        });
                    })
                )
            );

            /* Inspector */
            var inspector = el(InspectorControls, {},
                /* Cards Panel */
                el(PanelBody, { title: __('Cards', 'blockenberg'), initialOpen: true },
                    cards.map(function (card, idx) {
                        return el(PanelBody, {
                            key: idx,
                            title: (card.title || 'Card ' + (idx + 1)).substring(0, 30),
                            initialOpen: idx === 0
                        },
                            el(MediaUploadCheck, {},
                                el(MediaUpload, {
                                    onSelect: function (media) { setAttr({ cards: cards.map(function (c, i) { return i !== idx ? c : Object.assign({}, c, { imageUrl: media.url, imageAlt: media.alt || '' }); }) }); },
                                    allowedTypes: ['image'],
                                    value: card.imageId,
                                    render: function (ref) {
                                        return el('div', { style: { marginBottom: '12px' } },
                                            card.imageUrl && el('img', { src: card.imageUrl, style: { width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' } }),
                                            el(Button, { onClick: ref.open, variant: 'secondary', __nextHasNoMarginBottom: true, style: { width: '100%' } },
                                                card.imageUrl ? __('Change Image', 'blockenberg') : __('Upload Image', 'blockenberg')
                                            ),
                                            card.imageUrl && el(Button, {
                                                onClick: function () { updateCard(idx, 'imageUrl', ''); },
                                                variant: 'tertiary', isDestructive: true, style: { width: '100%', marginTop: '4px' }
                                            }, __('Remove Image', 'blockenberg'))
                                        );
                                    }
                                })
                            ),
                            el(TextControl, { label: __('Tag / Category', 'blockenberg'), value: card.tag, onChange: function (v) { updateCard(idx, 'tag', v); }, __nextHasNoMarginBottom: true }),
                            el('div', { style: { marginTop: '8px' } }),
                            el(TextControl, { label: __('Title', 'blockenberg'), value: card.title, onChange: function (v) { updateCard(idx, 'title', v); }, __nextHasNoMarginBottom: true }),
                            el('div', { style: { marginTop: '8px' } }),
                            el(TextareaControl, { label: __('Description', 'blockenberg'), value: card.description, onChange: function (v) { updateCard(idx, 'description', v); }, rows: 3, __nextHasNoMarginBottom: true }),
                            el('div', { style: { marginTop: '8px' } }),
                            el(TextControl, { label: __('Link URL', 'blockenberg'), value: card.linkUrl, onChange: function (v) { updateCard(idx, 'linkUrl', v); }, type: 'url', __nextHasNoMarginBottom: true }),
                            el('div', { style: { marginTop: '8px' } }),
                            el(TextControl, { label: __('Link Label', 'blockenberg'), value: card.linkLabel, onChange: function (v) { updateCard(idx, 'linkLabel', v); }, __nextHasNoMarginBottom: true }),
                            cards.length > 2 && el(Button, {
                                onClick: function () { removeCard(idx); },
                                variant: 'tertiary', isDestructive: true, style: { marginTop: '12px' }
                            }, __('Remove Card', 'blockenberg'))
                        );
                    }),
                    el(Button, { onClick: addCard, variant: 'secondary', style: { width: '100%', marginTop: '8px' } }, __('+ Add Card', 'blockenberg'))
                ),
                /* Layout Panel */
                el(PanelBody, { title: __('Layout & Deck Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Deck Style', 'blockenberg'),
                        value: attr.deckStyle,
                        options: [
                            { label: 'Fan (rotated arc)', value: 'fan' },
                            { label: 'Stack (offset depth)', value: 'stack' },
                            { label: 'Cascade (angled left)', value: 'cascade' }
                        ],
                        onChange: function (v) { setAttr({ deckStyle: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el('div', { style: { marginTop: '16px' } }),
                    el(RangeControl, { label: __('Card Width (px)', 'blockenberg'), value: attr.cardWidth, min: 200, max: 600, onChange: function (v) { setAttr({ cardWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('Card Height (px)', 'blockenberg'), value: attr.cardHeight, min: 200, max: 700, onChange: function (v) { setAttr({ cardHeight: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('Corner Radius (px)', 'blockenberg'), value: attr.cardRadius, min: 0, max: 48, onChange: function (v) { setAttr({ cardRadius: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('Stacked Cards Visible', 'blockenberg'), value: attr.stackCount, min: 1, max: 4, onChange: function (v) { setAttr({ stackCount: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('Stack Angle (°)', 'blockenberg'), value: attr.stackAngle, min: 0, max: 30, onChange: function (v) { setAttr({ stackAngle: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('Stack Offset (px)', 'blockenberg'), value: attr.stackOffset, min: 0, max: 60, onChange: function (v) { setAttr({ stackOffset: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('Image Overlay Strength (%)', 'blockenberg'), value: attr.overlayStrength, min: 0, max: 100, onChange: function (v) { setAttr({ overlayStrength: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(SelectControl, {
                        label: __('Image Fit', 'blockenberg'),
                        value: attr.imageFit,
                        options: [{ label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' }],
                        onChange: function (v) { setAttr({ imageFit: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                /* Content Panel */
                el(PanelBody, { title: __('Content Display', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Tag / Category', 'blockenberg'), checked: attr.showTag, onChange: function (v) { setAttr({ showTag: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: attr.showTitle, onChange: function (v) { setAttr({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Description', 'blockenberg'), checked: attr.showDescription, onChange: function (v) { setAttr({ showDescription: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Link', 'blockenberg'), checked: attr.showLink, onChange: function (v) { setAttr({ showLink: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el('div', { style: { marginTop: '8px' } }),
                    el('div', { style: { marginTop: '8px' } }),
                    ),
                /* Animation Panel */
                el(PanelBody, { title: __('Animation & Controls', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Arrows', 'blockenberg'), checked: attr.showArrows, onChange: function (v) { setAttr({ showArrows: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Dots', 'blockenberg'), checked: attr.showDots, onChange: function (v) { setAttr({ showDots: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Auto Play', 'blockenberg'), checked: attr.autoPlay, onChange: function (v) { setAttr({ autoPlay: v }); }, __nextHasNoMarginBottom: true }),
                    attr.autoPlay && el(RangeControl, { label: __('Auto Interval (ms)', 'blockenberg'), value: attr.autoInterval, min: 1000, max: 8000, step: 500, onChange: function (v) { setAttr({ autoInterval: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } }),
                    el(RangeControl, { label: __('Transition Duration (ms)', 'blockenberg'), value: attr.transitionDuration, min: 200, max: 1200, step: 50, onChange: function (v) { setAttr({ transitionDuration: v }); }, __nextHasNoMarginBottom: true })
                ),
                /* Colors */
                
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: attr.typoTitle, onChange: function (v) { setAttr({ typoTitle: v }); } }),
                    el(getTypographyControl(), { label: __('Description', 'blockenberg'), value: attr.typoDesc, onChange: function (v) { setAttr({ typoDesc: v }); } }),
                    el(RangeControl, { label: __('Tag Size (px)', 'blockenberg'), value: attr.tagSize, min: 9, max: 18, onChange: function (v) { setAttr({ tagSize: v }); }, __nextHasNoMarginBottom: true })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#1e293b' }); } },
                        { label: __('Title Color', 'blockenberg'), value: attr.titleColor, onChange: function (v) { setAttr({ titleColor: v || '#ffffff' }); } },
                        { label: __('Description Color', 'blockenberg'), value: attr.descColor, onChange: function (v) { setAttr({ descColor: v || '#94a3b8' }); } },
                        { label: __('Tag Background', 'blockenberg'), value: attr.tagBg, onChange: function (v) { setAttr({ tagBg: v || '#6366f1' }); } },
                        { label: __('Tag Text', 'blockenberg'), value: attr.tagColor, onChange: function (v) { setAttr({ tagColor: v || '#ffffff' }); } },
                        { label: __('Link Color', 'blockenberg'), value: attr.linkColor, onChange: function (v) { setAttr({ linkColor: v || '#818cf8' }); } },
                        { label: __('Dot / Active Color', 'blockenberg'), value: attr.dotColor, onChange: function (v) { setAttr({ dotColor: v || '#6366f1' }); } },
                        { label: __('Arrow Background', 'blockenberg'), value: attr.arrowBg, onChange: function (v) { setAttr({ arrowBg: v || '#ffffff' }); } },
                        { label: __('Arrow Icon', 'blockenberg'), value: attr.arrowColor, onChange: function (v) { setAttr({ arrowColor: v || '#0f172a' }); } },
                        { label: __('Section Background', 'blockenberg'), value: attr.sectionBg, onChange: function (v) { setAttr({ sectionBg: v || '' }); } }
                    ]
                })
            );

            return el('div', blockProps, inspector, deckPreview);
        },

        save: function (props) {
            var attr = props.attributes;
            var blockProps = useBlockProps.save();
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-cds-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
