( function () {
    var el                = wp.element.createElement;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var Button            = wp.components.Button;
    var ColorPicker        = wp.components.ColorPicker;
    var Popover           = wp.components.Popover;
    var useState          = wp.element.useState;
    var Fragment          = wp.element.Fragment;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    function CardPreview(card, a) {
        return el('div', {
            className: 'bkbg-pdc-card',
            style: {
                width:        a.cardWidth  + 'px',
                height:       a.cardHeight + 'px',
                borderRadius: a.cardRadius + 'px',
                background:   card.bgImage
                    ? 'url(' + card.bgImage + ') center/cover no-repeat, ' + (card.bgColor || '#1a1035')
                    : (card.bgColor || '#1a1035'),
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0
            }
        },
            /* overlay layer */
            el('div', {
                className: 'bkbg-pdc-overlay',
                style: {
                    position: 'absolute', inset: 0,
                    background: a.overlayColor || 'rgba(0,0,0,0.25)',
                    borderRadius: a.cardRadius + 'px'
                }
            }),
            /* glow orb layer — depth 1 */
            el('div', {
                className: 'bkbg-pdc-layer bkbg-pdc-glow',
                'data-depth': '1',
                style: {
                    position: 'absolute',
                    width: '180px', height: '180px',
                    borderRadius: '50%',
                    background: a.glowColor || 'rgba(99,102,241,0.5)',
                    filter: 'blur(60px)',
                    top: '10%', left: '60%',
                    pointerEvents: 'none'
                }
            }),
            /* badge layer — depth 2 */
            a.showBadge !== false && card.badge && el('div', {
                className: 'bkbg-pdc-layer bkbg-pdc-badge',
                'data-depth': '2',
                style: {
                    position: 'absolute',
                    top: '20px', left: '20px',
                    background: a.badgeBg || '#6366f1',
                    color: a.badgeColor || '#ffffff',
                    fontSize: a.badgeFontSize + 'px',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '99px',
                    letterSpacing: '0.08em'
                }
            }, card.badge),
            /* icon layer — depth 3 */
            a.showIcon !== false && card.icon && el('div', {
                className: 'bkbg-pdc-layer bkbg-pdc-icon',
                'data-depth': '3',
                style: {
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    fontSize: a.iconSize + 'px',
                    lineHeight: 1,
                    filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))'
                }
            }, (card.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(card.iconType, card.icon, card.iconDashicon, card.iconImageUrl, card.iconDashiconColor) : card.icon),
            /* text content layer — depth 1.5 */
            el('div', {
                className: 'bkbg-pdc-layer bkbg-pdc-content',
                'data-depth': '1.5',
                style: {
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    padding: '24px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)'
                }
            },
                a.showTag !== false && card.tag && el('div', {
                    style: {
                        display: 'inline-block',
                        background: a.tagBg || 'rgba(255,255,255,0.15)',
                        color: a.tagColor || '#ffffff',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 10px',
                        borderRadius: '99px',
                        marginBottom: '8px',
                        backdropFilter: 'blur(4px)'
                    }
                }, card.tag),
                el('div', {
                    className: 'bkbg-pdc-title',
                    style: {
                        color: a.titleColor || '#ffffff',
                        marginBottom: '4px'
                    }
                }, card.title || 'Card Title'),
                el('div', {
                    className: 'bkbg-pdc-subtitle',
                    style: {
                        color: a.subtitleColor || 'rgba(255,255,255,0.7)'
                    }
                }, card.subtitle || '')
            )
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

    registerBlockType('blockenberg/parallax-depth-cards', {
        title:    __('Parallax Depth Cards'),
        icon:     'move',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr    = props.attributes;
            var setAttr = props.setAttributes;
            var bp      = useBlockProps((function() {
                var tv = getTypoCssVars();
                var s = {};
                Object.assign(s, tv(attr.titleTypo, '--bkbg-pdc-tt-'));
                Object.assign(s, tv(attr.subtitleTypo, '--bkbg-pdc-st-'));
                return { className: 'bkbg-pdc-wrap', style: s };
            })());

            function updateCard(idx, field, val) {
                var cards = attr.cards.map(function (c, i) {
                    return i === idx ? Object.assign({}, c, { [field]: val }) : c;
                });
                setAttr({ cards: cards });
            }
            function addCard() {
                setAttr({ cards: attr.cards.concat([{
                    title: 'New Card', subtitle: 'Subtitle', badge: 'NEW',
                    bgImage: '', bgColor: '#1e1b4b', icon: '✨', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', tag: 'Tag'
                }]) });
            }
            function removeCard(idx) {
                setAttr({ cards: attr.cards.filter(function (_, i) { return i !== idx; }) });
            }

            var inspector = el(InspectorControls, {},
                /* Cards */
                el(PanelBody, { title: __('Cards'), initialOpen: true },
                    attr.cards.map(function (card, idx) {
                        return el(PanelBody, { key: idx, title: card.title || 'Card ' + (idx + 1), initialOpen: false },
                            el(TextControl, { label: __('Title'), value: card.title || '',
                                onChange: function (v) { updateCard(idx, 'title', v); },
                                __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Subtitle'), value: card.subtitle || '',
                                onChange: function (v) { updateCard(idx, 'subtitle', v); },
                                __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Badge Text'), value: card.badge || '',
                                onChange: function (v) { updateCard(idx, 'badge', v); },
                                __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Tag'), value: card.tag || '',
                                onChange: function (v) { updateCard(idx, 'tag', v); },
                                __nextHasNoMarginBottom: true }),
            el(IP().IconPickerControl, { iconType: card.iconType || 'custom-char', customChar: card.icon || '', dashicon: card.iconDashicon || '', imageUrl: card.iconImageUrl || '', onChangeType: function (v) { updateCard(idx, 'iconType', v); }, onChangeChar: function (v) { updateCard(idx, 'icon', v); }, onChangeDashicon: function (v) { updateCard(idx, 'iconDashicon', v); }, onChangeImageUrl: function (v) { updateCard(idx, 'iconImageUrl', v); } }),
                            el(TextControl, { label: __('Background Image URL'), value: card.bgImage || '',
                                onChange: function (v) { updateCard(idx, 'bgImage', v); },
                                __nextHasNoMarginBottom: true }),
                            el(BkbgColorSwatch, { label: __('Background Color'), value: card.bgColor || '',
                                onChange: function (v) { updateCard(idx, 'bgColor', v); } }),
                            attr.cards.length > 1 && el(Button, {
                                isDestructive: true, variant: 'secondary',
                                onClick: function () { removeCard(idx); },
                                style: { marginTop: '8px' }
                            }, __('Remove Card'))
                        );
                    }),
                    el(Button, { variant: 'primary', onClick: addCard,
                        style: { marginTop: '8px', width: '100%' }
                    }, __('+ Add Card'))
                ),

                /* Layout */
                el(PanelBody, { title: __('Layout'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Columns'),
                        value: String(attr.columns),
                        options: [
                            { label: '1', value: '1' },
                            { label: '2', value: '2' },
                            { label: '3', value: '3' }
                        ],
                        onChange: function (v) { setAttr({ columns: Number(v) }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Card Width (px)'), value: attr.cardWidth,
                        min: 240, max: 520,
                        onChange: function (v) { setAttr({ cardWidth: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Card Height (px)'), value: attr.cardHeight,
                        min: 280, max: 700,
                        onChange: function (v) { setAttr({ cardHeight: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Card Radius (px)'), value: attr.cardRadius,
                        min: 0, max: 40,
                        onChange: function (v) { setAttr({ cardRadius: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                /* Interaction */
                el(PanelBody, { title: __('Parallax Settings'), initialOpen: false },
                    el(RangeControl, { label: __('Tilt Strength (°)'), value: attr.tiltStrength,
                        min: 0, max: 40,
                        onChange: function (v) { setAttr({ tiltStrength: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Depth Layer Shift (px)'), value: attr.depthStrength,
                        min: 0, max: 80,
                        onChange: function (v) { setAttr({ depthStrength: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Badge'), checked: attr.showBadge,
                        onChange: function (v) { setAttr({ showBadge: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Tag'), checked: attr.showTag,
                        onChange: function (v) { setAttr({ showTag: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Icon'), checked: attr.showIcon,
                        onChange: function (v) { setAttr({ showIcon: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Icon Size (px)'), value: attr.iconSize,
                        min: 24, max: 96,
                        onChange: function (v) { setAttr({ iconSize: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                /* Colors */
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el( getTypoControl(), { label: __('Title','blockenberg'), value: attr.titleTypo, onChange: function(v){ setAttr({ titleTypo: v }); } }),
                    el( getTypoControl(), { label: __('Subtitle','blockenberg'), value: attr.subtitleTypo, onChange: function(v){ setAttr({ subtitleTypo: v }); } }),
                    el(RangeControl, { label: __('Badge Font Size (px)', 'blockenberg'), value: attr.badgeFontSize, min: 8, max: 18, __nextHasNoMarginBottom: true, onChange: function (v) { setAttr({ badgeFontSize: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors'), initialOpen: false,
                    colorSettings: [
                        { label: __('Title'), value: attr.titleColor,
                          onChange: function (v) { setAttr({ titleColor: v || '#ffffff' }); } },
                        { label: __('Subtitle'), value: attr.subtitleColor,
                          onChange: function (v) { setAttr({ subtitleColor: v || 'rgba(255,255,255,0.7)' }); } },
                        { label: __('Badge BG'), value: attr.badgeBg,
                          onChange: function (v) { setAttr({ badgeBg: v || '#6366f1' }); } },
                        { label: __('Badge Text'), value: attr.badgeColor,
                          onChange: function (v) { setAttr({ badgeColor: v || '#ffffff' }); } },
                        { label: __('Tag BG'), value: attr.tagBg,
                          onChange: function (v) { setAttr({ tagBg: v || 'rgba(255,255,255,0.15)' }); } },
                        { label: __('Tag Text'), value: attr.tagColor,
                          onChange: function (v) { setAttr({ tagColor: v || '#ffffff' }); } },
                        { label: __('Overlay'), value: attr.overlayColor,
                          onChange: function (v) { setAttr({ overlayColor: v || 'rgba(0,0,0,0.25)' }); } },
                        { label: __('Glow Orb'), value: attr.glowColor,
                          onChange: function (v) { setAttr({ glowColor: v || 'rgba(99,102,241,0.5)' }); } }
                    ]
                })
            );

            return el(wp.element.Fragment, {}, inspector,
                el('div', bp,
                    el('div', {
                        className: 'bkbg-pdc-grid',
                        style: {
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '24px',
                            justifyContent: 'center'
                        }
                    },
                        attr.cards.map(function (card, i) {
                            return el('div', { key: i }, CardPreview(card, attr));
                        })
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var bp   = useBlockProps.save();
            var opts = {
                cards:          attr.cards,
                columns:        attr.columns,
                cardWidth:      attr.cardWidth,
                cardHeight:     attr.cardHeight,
                cardRadius:     attr.cardRadius,
                tiltStrength:   attr.tiltStrength,
                depthStrength:  attr.depthStrength,
                showBadge:      attr.showBadge,
                showTag:        attr.showTag,
                showIcon:       attr.showIcon,
                titleSize:      attr.titleSize,
                subtitleSize:   attr.subtitleSize,
                badgeFontSize:  attr.badgeFontSize,
                iconSize:       attr.iconSize,
                titleColor:     attr.titleColor,
                subtitleColor:  attr.subtitleColor,
                badgeBg:        attr.badgeBg,
                badgeColor:     attr.badgeColor,
                tagBg:          attr.tagBg,
                tagColor:       attr.tagColor,
                overlayColor:   attr.overlayColor,
                glowColor:      attr.glowColor,
                titleTypo:      attr.titleTypo,
                subtitleTypo:   attr.subtitleTypo
            };
            return el('div', bp,
                el('div', { className: 'bkbg-pdc-app', 'data-opts': JSON.stringify(opts) })
            );
        }
    });
}() );
