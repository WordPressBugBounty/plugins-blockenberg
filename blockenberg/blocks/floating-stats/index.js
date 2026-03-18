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

        var _fstTC, _fstTV;
        function _tc() { return _fstTC || (_fstTC = window.bkbgTypographyControl); }
        function _tv() { return _fstTV || (_fstTV = window.bkbgTypoCssVars); }

        var POSITION_OPTIONS = [
            { label: 'Top left', value: 'top-left' },
            { label: 'Top right', value: 'top-right' },
            { label: 'Middle left', value: 'middle-left' },
            { label: 'Middle right', value: 'middle-right' },
            { label: 'Bottom left', value: 'bottom-left' },
            { label: 'Bottom right', value: 'bottom-right' },
        ];

        var CARD_STYLE_OPTIONS = [
            { label: 'Shadow card', value: 'shadow' },
            { label: 'Glass (frosted)', value: 'glass' },
            { label: 'Solid / flat', value: 'solid' },
        ];

        var ASPECT_OPTIONS = [
            { label: '4:5 (Portrait)', value: '4:5' },
            { label: '1:1 (Square)', value: '1:1' },
            { label: '16:9 (Landscape)', value: '16:9' },
            { label: '3:4', value: '3:4' },
        ];

        var ICON_SVG = {
            star: el('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'currentColor' }, el('path', { d: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z' })),
            bolt: el('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'currentColor' }, el('path', { d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' })),
            heart: el('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'currentColor' }, el('path', { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z' })),
            check: el('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, el('polyline', { points: '20 6 9 17 4 12' })),
            chart: el('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, el('line', { x1: 18, y1: 20, x2: 18, y2: 10 }), el('line', { x1: 12, y1: 20, x2: 12, y2: 4 }), el('line', { x1: 6, y1: 20, x2: 6, y2: 14 })),
            users: el('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, el('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }), el('circle', { cx: 9, cy: 7, r: 4 }), el('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }), el('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })),
            award: el('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, el('circle', { cx: 12, cy: 8, r: 6 }), el('path', { d: 'M15.477 12.89L17 22l-5-3-5 3 1.523-9.11' })),
            shield: el('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, el('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })),
        };

        var ICON_OPTIONS = Object.keys(ICON_SVG).map(function (k) { return { label: k.charAt(0).toUpperCase() + k.slice(1), value: k }; });
        ICON_OPTIONS.unshift({ label: 'None', value: '' });

        function makeId() { return 's' + Math.random().toString(36).substr(2, 6); }

        function positionToStyle(pos, pad) {
            var OFFSET = (-pad - 8) + 'px';
            var map = {
                'top-left': { top: '10%', left: OFFSET, transform: 'translateX(-50%)' },
                'top-right': { top: '10%', right: OFFSET, transform: 'translateX(50%)' },
                'middle-left': { top: '50%', left: OFFSET, transform: 'translate(-50%, -50%)' },
                'middle-right': { top: '50%', right: OFFSET, transform: 'translate(50%, -50%)' },
                'bottom-left': { bottom: '10%', left: OFFSET, transform: 'translateX(-50%)' },
                'bottom-right': { bottom: '10%', right: OFFSET, transform: 'translateX(50%)' },
            };
            return map[pos] || map['top-right'];
        }

        function getCardBg(card, style) {
            if (style === 'glass') return 'rgba(255,255,255,0.75)';
            return card.bgColor || '#ffffff';
        }
        function getCardShadow(style) {
            if (style === 'shadow') return '0 8px 32px rgba(0,0,0,0.12)';
            if (style === 'glass') return '0 4px 24px rgba(0,0,0,0.08)';
            return 'none';
        }
        function getCardBorder(style) {
            if (style === 'glass') return '1px solid rgba(255,255,255,0.6)';
            return 'none';
        }

        registerBlockType('blockenberg/floating-stats', {
            edit: function (props) {
                var attributes = props.attributes;
                var setAttributes = props.setAttributes;
                var cards = attributes.cards;

                var blockProps = useBlockProps({
                    style: Object.assign({ paddingTop: attributes.paddingTop + 'px', paddingBottom: attributes.paddingBottom + 'px', backgroundColor: attributes.bgColor || undefined, display: 'flex', justifyContent: 'center' },
                        _tv()(attributes.typoValue, '--bkbg-fst-vl-'),
                        _tv()(attributes.typoLabel, '--bkbg-fst-lb-')
                    )
                });

                function setCard(id, patch) {
                    setAttributes({ cards: cards.map(function (c) { return c.id === id ? Object.assign({}, c, patch) : c; }) });
                }
                function addCard() {
                    setAttributes({ cards: cards.concat([{ id: makeId(), value: '1,000+', label: 'New metric', icon: 'star', position: 'bottom-right', bgColor: '#ffffff', textColor: '#111827', valueColor: '#6c3fb5' }]) });
                }
                function removeCard(id) {
                    if (cards.length <= 1) return;
                    setAttributes({ cards: cards.filter(function (c) { return c.id !== id; }) });
                }

                var aspectParts = attributes.imageAspectRatio.split(':');
                var aspectNum = parseFloat(aspectParts[1]) / parseFloat(aspectParts[0]);

                return el(Fragment, null,
                    el(InspectorControls, null,
                        el(PanelBody, { title: __('Image', 'blockenberg'), initialOpen: true },
                            el(MediaUploadCheck, null,
                                el(MediaUpload, {
                                    onSelect: function (media) { setAttributes({ imageUrl: media.url, imageId: media.id, imageAlt: media.alt || '' }); },
                                    allowedTypes: ['image'],
                                    value: attributes.imageId,
                                    render: function (ref) {
                                        return el(Button, { onClick: ref.open, variant: 'secondary', style: { marginBottom: '8px' } },
                                            attributes.imageUrl ? __('Change image', 'blockenberg') : __('Upload image', 'blockenberg')
                                        );
                                    }
                                })
                            ),
                            attributes.imageUrl && el(Button, { onClick: function () { setAttributes({ imageUrl: '', imageId: 0 }); }, variant: 'tertiary', isDestructive: true, size: 'compact', style: { display: 'block', marginBottom: '8px' } }, __('Remove image', 'blockenberg')),
                            el(SelectControl, { label: __('Aspect ratio', 'blockenberg'), value: attributes.imageAspectRatio, options: ASPECT_OPTIONS, onChange: function (v) { setAttributes({ imageAspectRatio: v }); } }),
                            el(RangeControl, { label: __('Image border radius (px)', 'blockenberg'), value: attributes.imageRadius, min: 0, max: 48, onChange: function (v) { setAttributes({ imageRadius: v }); } }),
                            el(ToggleControl, { label: __('Image drop shadow', 'blockenberg'), checked: attributes.imageShadow, onChange: function (v) { setAttributes({ imageShadow: v }); }, __nextHasNoMarginBottom: true }),
                            el(RangeControl, { label: __('Max width (px)', 'blockenberg'), value: attributes.wrapMaxWidth, min: 200, max: 900, onChange: function (v) { setAttributes({ wrapMaxWidth: v }); } })
                        ),
                        el(PanelBody, { title: __('Cards Style', 'blockenberg'), initialOpen: false },
                            el(SelectControl, { label: __('Card style preset', 'blockenberg'), value: attributes.cardStyle, options: CARD_STYLE_OPTIONS, onChange: function (v) { setAttributes({ cardStyle: v }); } }),
                            el(RangeControl, { label: __('Card padding (px)', 'blockenberg'), value: attributes.cardPadding, min: 8, max: 40, onChange: function (v) { setAttributes({ cardPadding: v }); } }),
                            el(RangeControl, { label: __('Card border radius (px)', 'blockenberg'), value: attributes.cardRadius, min: 0, max: 32, onChange: function (v) { setAttributes({ cardRadius: v }); } }),
                            el(ToggleControl, { label: __('Show icon', 'blockenberg'), checked: attributes.showIcon, onChange: function (v) { setAttributes({ showIcon: v }); }, __nextHasNoMarginBottom: true }),
                            attributes.showIcon && el(RangeControl, { label: __('Icon size (px)', 'blockenberg'), value: attributes.iconSize, min: 12, max: 48, onChange: function (v) { setAttributes({ iconSize: v }); } }),
                            el(ToggleControl, { label: __('Count-up animation', 'blockenberg'), checked: attributes.countUpAnimation, onChange: function (v) { setAttributes({ countUpAnimation: v }); }, __nextHasNoMarginBottom: true })
                        ),
                        
                        el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                            _tc()({ label: __('Value', 'blockenberg'), value: attributes.typoValue, onChange: function (v) { setAttributes({ typoValue: v }); } }),
                            _tc()({ label: __('Label', 'blockenberg'), value: attributes.typoLabel, onChange: function (v) { setAttributes({ typoLabel: v }); } })
                        ),
el(PanelColorSettings, {
                            title: __('Default card colors', 'blockenberg'),
                            initialOpen: false,
                            colorSettings: [
                                { value: attributes.globalCardBg, onChange: function (v) { setAttributes({ globalCardBg: v || '' }); }, label: __('Card background', 'blockenberg') },
                                { value: attributes.globalCardColor, onChange: function (v) { setAttributes({ globalCardColor: v || '' }); }, label: __('Card text', 'blockenberg') },
                                { value: attributes.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '' }); }, label: __('Section background', 'blockenberg') },
                            ]
                        }),
                        el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                            el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: attributes.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                            el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: attributes.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                        ),
                        el(PanelBody, { title: __('Stat Cards', 'blockenberg'), initialOpen: false },
                            cards.map(function (card, idx) {
                                return el(PanelBody, { key: card.id, title: (card.label || 'Card') + ' #' + (idx + 1), initialOpen: false },
                                    el(TextControl, { label: __('Value', 'blockenberg'), value: card.value, placeholder: '10,000+', onChange: function (v) { setCard(card.id, { value: v }); } }),
                                    el(TextControl, { label: __('Label', 'blockenberg'), value: card.label, onChange: function (v) { setCard(card.id, { label: v }); } }),
                                    el(SelectControl, { label: __('Icon', 'blockenberg'), value: card.icon, options: ICON_OPTIONS, onChange: function (v) { setCard(card.id, { icon: v }); } }),
                                    el(SelectControl, { label: __('Position', 'blockenberg'), value: card.position, options: POSITION_OPTIONS, onChange: function (v) { setCard(card.id, { position: v }); } }),
                                    el(PanelColorSettings, {
                                        title: __('Card colors', 'blockenberg'),
                                        initialOpen: false,
                                        colorSettings: [
                                            { value: card.bgColor, onChange: function (v) { setCard(card.id, { bgColor: v || '' }); }, label: __('Background', 'blockenberg') },
                                            { value: card.textColor, onChange: function (v) { setCard(card.id, { textColor: v || '' }); }, label: __('Label text', 'blockenberg') },
                                            { value: card.valueColor, onChange: function (v) { setCard(card.id, { valueColor: v || '' }); }, label: __('Value color', 'blockenberg') },
                                        ]
                                    }),
                                    el(Button, { onClick: function () { removeCard(card.id); }, variant: 'tertiary', isDestructive: true, size: 'compact' }, __('Remove card', 'blockenberg'))
                                );
                            }),
                            el(Button, { onClick: addCard, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Card', 'blockenberg'))
                        )
                    ),
                    el('div', blockProps,
                        el('div', {
                            className: 'bkbg-floating-stats',
                            style: { position: 'relative', maxWidth: attributes.wrapMaxWidth + 'px', width: '100%', margin: '0 auto' }
                        },
                            el('div', { className: 'bkbg-floating-stats__image-wrap', style: { position: 'relative', borderRadius: attributes.imageRadius + 'px', overflow: 'hidden', aspectRatio: attributes.imageAspectRatio.replace(':', '/'), boxShadow: attributes.imageShadow ? '0 32px 80px rgba(0,0,0,0.18)' : 'none', background: '#f3f4f6' } },
                                attributes.imageUrl
                                    ? el('img', { src: attributes.imageUrl, alt: attributes.imageAlt, style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } })
                                    : el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '14px', minHeight: '300px' } }, __('Upload an image ↑', 'blockenberg'))
                            ),
                            cards.map(function (card) {
                                var posStyle = positionToStyle(card.position, attributes.cardPadding);
                                var cardBg = getCardBg(card, attributes.cardStyle);
                                var cardShadow = getCardShadow(attributes.cardStyle);
                                var cardBorder = getCardBorder(attributes.cardStyle);
                                return el('div', {
                                    key: card.id,
                                    className: 'bkbg-floating-card bkbg-floating-card--' + card.position,
                                    style: Object.assign({ position: 'absolute', zIndex: 2, background: cardBg, color: card.textColor || attributes.globalCardColor, borderRadius: attributes.cardRadius + 'px', padding: attributes.cardPadding + 'px', boxShadow: cardShadow, border: cardBorder, backdropFilter: attributes.cardStyle === 'glass' ? 'blur(12px)' : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '90px', textAlign: 'center', whiteSpace: 'nowrap' }, posStyle)
                                },
                                    attributes.showIcon && card.icon && ICON_SVG[card.icon] && el('span', { style: { color: card.valueColor || '#6c3fb5', width: attributes.iconSize + 'px', height: attributes.iconSize + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, ICON_SVG[card.icon]),
                                    el('span', { className: 'bkbg-floating-card__value', style: { color: card.valueColor || '#6c3fb5' } }, card.value),
                                    el('span', { className: 'bkbg-floating-card__label', style: { color: card.textColor || attributes.globalCardColor, opacity: 0.75 } }, card.label)
                                );
                            })
                        )
                    )
                );
            },

            save: function (props) {
                var attributes = props.attributes;
                var cards = attributes.cards;
                var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-floating-stats-wrap' });

                return el('div', Object.assign({}, blockProps, { style: Object.assign({ paddingTop: attributes.paddingTop + 'px', paddingBottom: attributes.paddingBottom + 'px', backgroundColor: attributes.bgColor || undefined, display: 'flex', justifyContent: 'center' },
                    _tv()(attributes.typoValue, '--bkbg-fst-vl-'),
                    _tv()(attributes.typoLabel, '--bkbg-fst-lb-')
                ) }),
                    el('div', { className: 'bkbg-floating-stats', 'data-count-up': attributes.countUpAnimation ? '1' : '0', style: { position: 'relative', maxWidth: attributes.wrapMaxWidth + 'px', width: '100%', margin: '0 auto' } },
                        el('div', { className: 'bkbg-floating-stats__image-wrap', style: { position: 'relative', borderRadius: attributes.imageRadius + 'px', overflow: 'hidden', aspectRatio: attributes.imageAspectRatio.replace(':', '/'), boxShadow: attributes.imageShadow ? '0 32px 80px rgba(0,0,0,0.18)' : 'none', background: '#f3f4f6' } },
                            attributes.imageUrl && el('img', { src: attributes.imageUrl, alt: attributes.imageAlt, style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } })
                        ),
                        cards.map(function (card) {
                            var posStyle = positionToStyle(card.position, attributes.cardPadding);
                            var cardBg = getCardBg(card, attributes.cardStyle);
                            var cardShadow = getCardShadow(attributes.cardStyle);
                            var cardBorder = getCardBorder(attributes.cardStyle);
                            var iconEl = attributes.showIcon && card.icon && ICON_SVG[card.icon]
                                ? el('span', { className: 'bkbg-floating-card__icon', style: { color: card.valueColor || '#6c3fb5', width: attributes.iconSize + 'px', height: attributes.iconSize + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, ICON_SVG[card.icon])
                                : null;
                            return el('div', {
                                key: card.id,
                                className: 'bkbg-floating-card bkbg-floating-card--' + card.position,
                                'data-value': card.value,
                                style: Object.assign({ position: 'absolute', zIndex: 2, background: cardBg, color: card.textColor || attributes.globalCardColor, borderRadius: attributes.cardRadius + 'px', padding: attributes.cardPadding + 'px', boxShadow: cardShadow, border: cardBorder, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '90px', textAlign: 'center', whiteSpace: 'nowrap' }, posStyle)
                            },
                                iconEl,
                                el('span', { className: 'bkbg-floating-card__value', style: { color: card.valueColor || '#6c3fb5' } }, card.value),
                                el('span', { className: 'bkbg-floating-card__label', style: { color: card.textColor || attributes.globalCardColor, opacity: 0.75 } }, card.label)
                            );
                        })
                    )
                );
            }
        });
}());
