(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var useState = wp.element.useState;
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
        var TextareaControl = wp.components.TextareaControl;
        var SelectControl = wp.components.SelectControl;
        var Button = wp.components.Button;

        function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
        function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
        function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

        var STACK_STYLE_OPTIONS = [
            { label: 'Fan (cards rotate on hover)', value: 'fan' },
            { label: 'Pile (offset vertically)', value: 'pile' },
            { label: 'Spread (horizontal fan)',   value: 'spread' },
        ];

        function makeId() { return 'c' + Math.random().toString(36).substr(2, 6); }

        /* Compute inline transform for each visible ghost card */
        function ghostTransform(idx, style, rotSpread, offsetX, offsetY) {
            if (style === 'fan') {
                var angle = (idx + 1) * (rotSpread / 2);
                var flip = idx % 2 === 0 ? 1 : -1;
                return 'rotate(' + (flip * angle) + 'deg) translateY(' + ((idx + 1) * offsetY) + 'px)';
            }
            if (style === 'spread') {
                return 'translateX(' + ((idx + 1) * offsetX * 1.5) + 'px) rotate(' + ((idx + 1) * (rotSpread * 0.6)) + 'deg)';
            }
            /* pile */
            return 'translateX(' + ((idx + 1) * offsetX * 0.5) + 'px) translateY(' + ((idx + 1) * offsetY) + 'px)';
        }

        function QuoteSVG() {
            return el('svg', { width: 28, height: 20, viewBox: '0 0 28 20', fill: 'currentColor', style: { opacity: 0.15, marginBottom: '6px' } },
                el('path', { d: 'M0 20V12C0 5.333 2.667 1.333 8 0l1.6 2.4C6.933 3.467 5.467 5.2 5.2 7.6H9V20H0zm14 0V12c0-6.667 2.667-10.667 8-12l1.6 2.4c-2.667 1.067-4.133 2.8-4.4 5.2H23V20H14z' })
            );
        }

        function CardFace(props) {
            var card = props.card;
            var a = props.a;
            var isActive = props.isActive;
            return el('div', {
                className: 'bkbg-cardstack-face',
                style: {
                    width: a.cardWidth + 'px',
                    minHeight: a.cardMinHeight + 'px',
                    background: card.bgColor || a.globalCardBg,
                    color: card.textColor || a.globalTextColor,
                    borderRadius: a.cardRadius + 'px',
                    padding: a.cardPadding + 'px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                    position: 'relative',
                }
            },
                card.imageUrl && el('div', { style: { position: 'absolute', inset: 0, backgroundImage: 'url(' + card.imageUrl + ')', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, borderRadius: 'inherit' } }),
                el('div', { style: { position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' } },
                    a.showTag && card.tag && el('span', { style: { display: 'inline-block', alignSelf: 'flex-start', background: card.tagBg || card.accentColor || '#6c3fb5', color: card.tagColor || '#fff', borderRadius: '4px', padding: '2px 10px', fontSize: a.tagSize + 'px', fontWeight: 700, marginBottom: '12px', letterSpacing: '0.04em' } }, card.tag),
                    a.showQuoteMark && card.quote && el(QuoteSVG),
                    el('h3', { className: 'bkbg-cardstack-title', style: { margin: '0 0 10px' } }, card.title),
                    el('p', { className: 'bkbg-cardstack-desc', style: { margin: '0 0 auto', opacity: 0.85 } }, card.desc),
                    a.showAuthor && card.author && el('div', { style: { marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid rgba(128,128,128,0.15)', paddingTop: '14px' } },
                        el('div', { style: { width: '34px', height: '34px', borderRadius: '50%', background: card.accentColor || '#6c3fb5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden' } },
                            card.avatarUrl ? el('img', { src: card.avatarUrl, alt: card.author, style: { width: '100%', height: '100%', objectFit: 'cover' } }) : (card.author || 'A').charAt(0).toUpperCase()
                        ),
                        el('div', null,
                            el('p', { style: { margin: 0, fontWeight: 700, fontSize: (a.authorSize) + 'px' } }, card.author),
                            card.role && el('p', { style: { margin: 0, fontSize: (a.authorSize - 1) + 'px', opacity: 0.65 } }, card.role)
                        )
                    )
                )
            );
        }

        registerBlockType('blockenberg/card-stack', {
            edit: function (props) {
                var attributes = props.attributes;
                var setAttributes = props.setAttributes;
                var cards = attributes.cards;
                var activeIdx = useState(0);
                var currentIdx = activeIdx[0];
                var setCurrentIdx = activeIdx[1];

                var blockProps = useBlockProps({
                    style: Object.assign({ paddingTop: attributes.paddingTop + 'px', paddingBottom: attributes.paddingBottom + 'px', backgroundColor: attributes.bgColor || undefined }, _tv(attributes.typoTitle, '--bkbg-cst-tt-'), _tv(attributes.typoDesc, '--bkbg-cst-td-'))
                });

                function setCard(id, patch) {
                    setAttributes({ cards: cards.map(function (c) { return c.id === id ? Object.assign({}, c, patch) : c; }) });
                }
                function addCard() {
                    setAttributes({ cards: cards.concat([{ id: makeId(), title: 'New card', desc: 'Add your content here.', quote: false, author: '', role: '', avatarUrl: '', avatarId: 0, imageUrl: '', imageId: 0, imageAlt: '', tag: 'New', tagColor: '#ffffff', tagBg: '#6c3fb5', accentColor: '#6c3fb5', bgColor: '#ffffff', textColor: '#111827' }]) });
                }
                function removeCard(id) {
                    if (cards.length <= 1) return;
                    setAttributes({ cards: cards.filter(function (c) { return c.id !== id; }) });
                    if (currentIdx >= cards.length - 1) setCurrentIdx(Math.max(0, cards.length - 2));
                }

                var visibleBehind = Math.min(attributes.maxVisibleBehind, cards.length - 1);

                return el(Fragment, null,
                    el(InspectorControls, null,
                        el(PanelBody, { title: __('Stack', 'blockenberg'), initialOpen: true },
                            el(SelectControl, { label: __('Stack style', 'blockenberg'), value: attributes.stackStyle, options: STACK_STYLE_OPTIONS, onChange: function (v) { setAttributes({ stackStyle: v }); } }),
                            el(RangeControl, { label: __('Card width (px)', 'blockenberg'), value: attributes.cardWidth, min: 240, max: 600, onChange: function (v) { setAttributes({ cardWidth: v }); } }),
                            el(RangeControl, { label: __('Card min height (px)', 'blockenberg'), value: attributes.cardMinHeight, min: 160, max: 600, onChange: function (v) { setAttributes({ cardMinHeight: v }); } }),
                            el(RangeControl, { label: __('Card border radius (px)', 'blockenberg'), value: attributes.cardRadius, min: 0, max: 40, onChange: function (v) { setAttributes({ cardRadius: v }); } }),
                            el(RangeControl, { label: __('Card padding (px)', 'blockenberg'), value: attributes.cardPadding, min: 12, max: 64, onChange: function (v) { setAttributes({ cardPadding: v }); } }),
                            el(RangeControl, { label: __('Rotation spread (°)', 'blockenberg'), value: attributes.rotationSpread, min: 0, max: 20, onChange: function (v) { setAttributes({ rotationSpread: v }); } }),
                            el(RangeControl, { label: __('Offset X (px)', 'blockenberg'), value: attributes.offsetX, min: 0, max: 40, onChange: function (v) { setAttributes({ offsetX: v }); } }),
                            el(RangeControl, { label: __('Offset Y (px)', 'blockenberg'), value: attributes.offsetY, min: 0, max: 40, onChange: function (v) { setAttributes({ offsetY: v }); } }),
                            el(RangeControl, { label: __('Cards visible behind', 'blockenberg'), value: attributes.maxVisibleBehind, min: 1, max: 4, onChange: function (v) { setAttributes({ maxVisibleBehind: v }); } })
                        ),
                        el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                            el(ToggleControl, { label: __('Show quote mark', 'blockenberg'), checked: attributes.showQuoteMark, onChange: function (v) { setAttributes({ showQuoteMark: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Show tag', 'blockenberg'), checked: attributes.showTag, onChange: function (v) { setAttributes({ showTag: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Show author', 'blockenberg'), checked: attributes.showAuthor, onChange: function (v) { setAttributes({ showAuthor: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Show nav dots', 'blockenberg'), checked: attributes.showNavDots, onChange: function (v) { setAttributes({ showNavDots: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Animate in on scroll', 'blockenberg'), checked: attributes.animateIn, onChange: function (v) { setAttributes({ animateIn: v }); }, __nextHasNoMarginBottom: true })
                        ),
                        el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                            el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: attributes.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                            el(getTypographyControl(), { label: __('Description', 'blockenberg'), value: attributes.typoDesc, onChange: function (v) { setAttributes({ typoDesc: v }); } }),
                            el(RangeControl, { label: __('Tag size (px)', 'blockenberg'), value: attributes.tagSize, min: 9, max: 16, onChange: function (v) { setAttributes({ tagSize: v }); } }),
                            el(RangeControl, { label: __('Author size (px)', 'blockenberg'), value: attributes.authorSize, min: 11, max: 18, onChange: function (v) { setAttributes({ authorSize: v }); } })
                        ),
                        el(PanelColorSettings, {
                            title: __('Default Colors', 'blockenberg'),
                            initialOpen: false,
                            colorSettings: [
                                { value: attributes.globalCardBg,    onChange: function (v) { setAttributes({ globalCardBg: v || '' }); },    label: __('Card background', 'blockenberg') },
                                { value: attributes.globalTextColor, onChange: function (v) { setAttributes({ globalTextColor: v || '' }); }, label: __('Card text', 'blockenberg') },
                                { value: attributes.bgColor,         onChange: function (v) { setAttributes({ bgColor: v || '' }); },         label: __('Section background', 'blockenberg') },
                            ]
                        }),
                        el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                            el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: attributes.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                            el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: attributes.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                        ),
                        el(PanelBody, { title: __('Cards', 'blockenberg'), initialOpen: false },
                            cards.map(function (card, idx) {
                                return el(PanelBody, { key: card.id, title: (card.title || 'Card') + ' #' + (idx + 1), initialOpen: false },
                                    el(TextControl, { label: __('Title', 'blockenberg'), value: card.title, onChange: function (v) { setCard(card.id, { title: v }); } }),
                                    el(TextareaControl, { label: __('Description', 'blockenberg'), value: card.desc, rows: 3, onChange: function (v) { setCard(card.id, { desc: v }); } }),
                                    el(ToggleControl, { label: __('Show as quote', 'blockenberg'), checked: card.quote, onChange: function (v) { setCard(card.id, { quote: v }); }, __nextHasNoMarginBottom: true }),
                                    el(TextControl, { label: __('Tag', 'blockenberg'), value: card.tag, onChange: function (v) { setCard(card.id, { tag: v }); } }),
                                    el(TextControl, { label: __('Author name', 'blockenberg'), value: card.author, onChange: function (v) { setCard(card.id, { author: v }); } }),
                                    el(TextControl, { label: __('Author role', 'blockenberg'), value: card.role, onChange: function (v) { setCard(card.id, { role: v }); } }),
                                    el('p', { style: { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' } }, __('Card / Background Image', 'blockenberg')),
                                    el(MediaUploadCheck, null,
                                        el(MediaUpload, {
                                            onSelect: function (media) { setCard(card.id, { imageUrl: media.url, imageId: media.id, imageAlt: media.alt || '' }); },
                                            allowedTypes: ['image'],
                                            value: card.imageId,
                                            render: function (ref) {
                                                return el(Button, { onClick: ref.open, variant: 'secondary', size: 'compact', style: { marginBottom: '6px' } },
                                                    card.imageUrl ? __('Change image', 'blockenberg') : __('Add image', 'blockenberg')
                                                );
                                            }
                                        })
                                    ),
                                    card.imageUrl && el(Button, { onClick: function () { setCard(card.id, { imageUrl: '', imageId: 0 }); }, variant: 'tertiary', size: 'compact', isDestructive: true, style: { display: 'block', marginBottom: '6px' } }, __('Remove image', 'blockenberg')),
                                    el('p', { style: { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' } }, __('Author Avatar', 'blockenberg')),
                                    el(MediaUploadCheck, null,
                                        el(MediaUpload, {
                                            onSelect: function (media) { setCard(card.id, { avatarUrl: media.url, avatarId: media.id }); },
                                            allowedTypes: ['image'],
                                            value: card.avatarId,
                                            render: function (ref) {
                                                return el(Button, { onClick: ref.open, variant: 'secondary', size: 'compact', style: { marginBottom: '6px' } },
                                                    card.avatarUrl ? __('Change avatar', 'blockenberg') : __('Upload avatar', 'blockenberg')
                                                );
                                            }
                                        })
                                    ),
                                    card.avatarUrl && el(Button, { onClick: function () { setCard(card.id, { avatarUrl: '', avatarId: 0 }); }, variant: 'tertiary', size: 'compact', isDestructive: true, style: { display: 'block', marginBottom: '6px' } }, __('Remove avatar', 'blockenberg')),
                                    el(PanelColorSettings, {
                                        title: __('Card Colors', 'blockenberg'),
                                        initialOpen: false,
                                        colorSettings: [
                                            { value: card.bgColor,    onChange: function (v) { setCard(card.id, { bgColor: v || '' }); },    label: __('Background', 'blockenberg') },
                                            { value: card.textColor,  onChange: function (v) { setCard(card.id, { textColor: v || '' }); },  label: __('Text', 'blockenberg') },
                                            { value: card.accentColor,onChange: function (v) { setCard(card.id, { accentColor: v || '' }); },label: __('Accent', 'blockenberg') },
                                            { value: card.tagBg,      onChange: function (v) { setCard(card.id, { tagBg: v || '' }); },      label: __('Tag background', 'blockenberg') },
                                            { value: card.tagColor,   onChange: function (v) { setCard(card.id, { tagColor: v || '' }); },   label: __('Tag text', 'blockenberg') },
                                        ]
                                    }),
                                    cards.length > 1 && el(Button, { onClick: function () { removeCard(card.id); }, variant: 'tertiary', size: 'compact', isDestructive: true }, __('Remove card', 'blockenberg'))
                                );
                            }),
                            el(Button, { onClick: addCard, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Card', 'blockenberg'))
                        )
                    ),

                    el('div', blockProps,
                        el('div', { className: 'bkbg-cardstack-editor', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' } },
                            /* Editor preview: show active card + ghost cards behind */
                            el('div', { className: 'bkbg-cardstack', 'data-style': attributes.stackStyle, 'data-animate': attributes.animateIn ? '1' : '0', style: { position: 'relative', width: attributes.cardWidth + 'px', minHeight: attributes.cardMinHeight + 'px' } },
                                /* Ghost cards */
                                Array.from({ length: visibleBehind }).map(function (_, i) {
                                    var ghostIdx = (currentIdx + i + 1) % cards.length;
                                    return el('div', {
                                        key: 'ghost-' + i,
                                        className: 'bkbg-cardstack-ghost',
                                        style: {
                                            position: 'absolute', inset: 0, zIndex: visibleBehind - i,
                                            transform: ghostTransform(i, attributes.stackStyle, attributes.rotationSpread, attributes.offsetX, attributes.offsetY),
                                            opacity: 1 - (i + 1) * 0.2,
                                            transition: 'all 0.3s ease',
                                            borderRadius: attributes.cardRadius + 'px',
                                            background: cards[ghostIdx].bgColor || attributes.globalCardBg,
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                        }
                                    });
                                }),
                                /* Active card */
                                el('div', { style: { position: 'relative', zIndex: cards.length } },
                                    el(CardFace, { card: cards[currentIdx], a: attributes })
                                )
                            ),
                            /* Nav dots */
                            attributes.showNavDots && el('div', { style: { display: 'flex', gap: '8px' } },
                                cards.map(function (card, idx) {
                                    return el('button', {
                                        key: card.id,
                                        onClick: function () { setCurrentIdx(idx); },
                                        style: { width: '8px', height: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, background: idx === currentIdx ? '#6c3fb5' : '#d1d5db', transition: 'all 0.2s ease' }
                                    });
                                })
                            )
                        )
                    )
                );
            },

            save: function (props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-card-stack-wrap' });
                var visibleBehind = Math.min(a.maxVisibleBehind, a.cards.length - 1);

                return el('div', Object.assign({}, blockProps, { style: Object.assign({ paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined }, _tv(a.typoTitle, '--bkbg-cst-tt-'), _tv(a.typoDesc, '--bkbg-cst-td-')) }),
                    el('div', { className: 'bkbg-cardstack-outer', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' } },
                        el('div', {
                            className: 'bkbg-cardstack',
                            'data-style': a.stackStyle,
                            'data-animate': a.animateIn ? '1' : '0',
                            'data-rotation': a.rotationSpread,
                            'data-offset-x': a.offsetX,
                            'data-offset-y': a.offsetY,
                            'data-behind': a.maxVisibleBehind,
                            style: { position: 'relative', width: a.cardWidth + 'px', minHeight: a.cardMinHeight + 'px', cursor: 'pointer' }
                        },
                            a.cards.map(function (card, idx) {
                                var cardStyle = {
                                    width: a.cardWidth + 'px',
                                    minHeight: a.cardMinHeight + 'px',
                                    background: card.bgColor || a.globalCardBg,
                                    color: card.textColor || a.globalTextColor,
                                    borderRadius: a.cardRadius + 'px',
                                    padding: a.cardPadding + 'px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                    overflow: 'hidden',
                                    position: idx === 0 ? 'relative' : 'absolute',
                                    inset: idx === 0 ? undefined : '0',
                                    zIndex: a.cards.length - idx,
                                    transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                                };
                                return el('div', { key: card.id, className: 'bkbg-cardstack-card' + (idx === 0 ? ' is-active' : ''), style: cardStyle, 'data-index': idx },
                                    card.imageUrl && el('div', { style: { position: 'absolute', inset: 0, backgroundImage: 'url(' + card.imageUrl + ')', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, borderRadius: 'inherit' } }),
                                    el('div', { className: 'bkbg-cardstack-inner', style: { position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' } },
                                        a.showTag && card.tag && el('span', { className: 'bkbg-cardstack-tag', style: { display: 'inline-block', alignSelf: 'flex-start', background: card.tagBg || card.accentColor || '#6c3fb5', color: card.tagColor || '#fff', borderRadius: '4px', padding: '2px 10px', fontSize: a.tagSize + 'px', fontWeight: 700, marginBottom: '12px', letterSpacing: '0.04em' } }, card.tag),
                                        a.showQuoteMark && card.quote && el('svg', { width: 28, height: 20, viewBox: '0 0 28 20', fill: 'currentColor', style: { opacity: 0.15, marginBottom: '6px' } }, el('path', { d: 'M0 20V12C0 5.333 2.667 1.333 8 0l1.6 2.4C6.933 3.467 5.467 5.2 5.2 7.6H9V20H0zm14 0V12c0-6.667 2.667-10.667 8-12l1.6 2.4c-2.667 1.067-4.133 2.8-4.4 5.2H23V20H14z' })),
                                        el('h3', { className: 'bkbg-cardstack-title', style: { margin: '0 0 10px' } }, card.title),
                                        el('p', { className: 'bkbg-cardstack-desc', style: { margin: '0 0 auto', opacity: 0.85 } }, card.desc),
                                        a.showAuthor && card.author && el('div', { className: 'bkbg-cardstack-author', style: { marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid rgba(128,128,128,0.15)', paddingTop: '14px' } },
                                            el('div', { className: 'bkbg-cardstack-avatar', style: { width: '34px', height: '34px', borderRadius: '50%', background: card.accentColor || '#6c3fb5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden' } },
                                                card.avatarUrl ? el('img', { src: card.avatarUrl, alt: card.author, style: { width: '100%', height: '100%', objectFit: 'cover' } }) : (card.author || 'A').charAt(0).toUpperCase()
                                            ),
                                            el('div', null,
                                                el('p', { style: { margin: 0, fontWeight: 700, fontSize: a.authorSize + 'px' } }, card.author),
                                                card.role && el('p', { style: { margin: 0, fontSize: (a.authorSize - 1) + 'px', opacity: 0.65 } }, card.role)
                                            )
                                        )
                                    )
                                );
                            })
                        ),
                        a.showNavDots && el('div', { className: 'bkbg-cardstack-dots', style: { display: 'flex', gap: '8px' } },
                            a.cards.map(function (card, idx) {
                                return el('button', { key: card.id, className: 'bkbg-cardstack-dot' + (idx === 0 ? ' is-active' : ''), 'aria-label': __('Card', 'blockenberg') + ' ' + (idx + 1), style: { width: '8px', height: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, background: idx === 0 ? '#6c3fb5' : '#d1d5db' } });
                            })
                        )
                    )
                );
            }
        });
}());
