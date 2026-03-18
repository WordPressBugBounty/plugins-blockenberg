( function () {
    var el                = wp.element.createElement;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var MediaUpload       = wp.blockEditor.MediaUpload;
    var MediaUploadCheck  = wp.blockEditor.MediaUploadCheck;
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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function CardPreview(card, a) {
        var pos = (card.initialPosition || 50);
        return el('div', {
            style: {
                position: 'relative', overflow: 'hidden',
                height: a.cardHeight + 'px',
                borderRadius: a.cardRadius + 'px',
                width: '100%'
            }
        },
            /* back */
            el('div', { style: {
                position: 'absolute', inset: 0,
                background: card.backUrl ? 'url(' + card.backUrl + ') center/cover' : card.backBg,
                borderRadius: a.cardRadius + 'px'
            }}),
            /* front clipped */
            el('div', { style: {
                position: 'absolute', inset: 0,
                background: card.frontUrl ? 'url(' + card.frontUrl + ') center/cover' : card.frontBg,
                borderRadius: a.cardRadius + 'px',
                clipPath: a.orientation === 'vertical'
                    ? 'inset(0 0 ' + (100 - pos) + '% 0)'
                    : 'inset(0 ' + (100 - pos) + '% 0 0)'
            }}),
            /* divider */
            el('div', { style: {
                position: 'absolute',
                [a.orientation === 'vertical' ? 'top' : 'left']: pos + '%',
                [a.orientation === 'vertical' ? 'left' : 'top']: 0,
                [a.orientation === 'vertical' ? 'width' : 'height']: '100%',
                [a.orientation === 'vertical' ? 'height' : 'width']: a.dividerWidth + 'px',
                background: a.dividerColor,
                transform: a.orientation === 'vertical' ? 'translateY(-50%)' : 'translateX(-50%)',
                zIndex: 2
            }}),
            /* handle */
            el('div', { style: {
                position: 'absolute',
                [a.orientation === 'vertical' ? 'top' : 'left']: pos + '%',
                [a.orientation === 'vertical' ? 'left' : 'top']: '50%',
                transform: 'translate(-50%, -50%)',
                width: a.handleSize + 'px', height: a.handleSize + 'px',
                borderRadius: '50%',
                background: a.handleBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: a.handleColor,
                fontWeight: 900, fontSize: 14,
                zIndex: 3, cursor: 'ew-resize',
                boxShadow: '0 2px 8px rgba(0,0,0,.25)'
            }}, a.orientation === 'vertical' ? '↕' : '↔'),
            /* labels */
            a.showLabels && card.frontLabel && el('div', {
                className: 'bkbg-rsc-label bkbg-rsc-label-front',
                style: { background: a.labelBg, color: a.labelColor }
            }, card.frontLabel),
            a.showLabels && card.backLabel && el('div', {
                className: 'bkbg-rsc-label bkbg-rsc-label-back',
                style: { background: a.labelBg, color: a.labelColor }
            }, card.backLabel)
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

    registerBlockType('blockenberg/reveal-swipe-cards', {
        title:    __('Reveal Swipe Cards'),
        icon:     'slides',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr    = props.attributes;
            var setAttr = props.setAttributes;
            var TC      = getTypoControl();
            var bp      = useBlockProps((function(){
                var _tv = getTypoCssVars();
                var s = {};
                if (_tv) {
                    Object.assign(s, _tv(attr.labelTypo || {}, '--bksc-lb-'));
                }
                return { className: 'bkbg-rsc-wrap', style: s };
            })());

            function updateCard(idx, field, val) {
                var cards = attr.cards.map(function (c, i) {
                    return i === idx ? Object.assign({}, c, { [field]: val }) : c;
                });
                setAttr({ cards: cards });
            }
            function addCard() {
                setAttr({ cards: attr.cards.concat([{
                    frontUrl: '', frontAlt: 'Before', frontLabel: 'Before',
                    backUrl: '', backAlt: 'After', backLabel: 'After',
                    frontBg: '#64748b', backBg: '#6366f1', initialPosition: 50
                }]) });
            }
            function removeCard(idx) {
                if (attr.cards.length <= 1) return;
                setAttr({ cards: attr.cards.filter(function (_, i) { return i !== idx; }) });
            }

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Cards'), initialOpen: true },
                    attr.cards.map(function (card, idx) {
                        return el(PanelBody, { key: idx, title: 'Card ' + (idx + 1), initialOpen: false },
                            el('p', { style: { margin: '0 0 6px', fontWeight: 600 } }, __('Front (Before)')),
                            el(MediaUploadCheck, {},
                                el(MediaUpload, {
                                    onSelect: function (m) { updateCard(idx, 'frontUrl', m.url); },
                                    allowedTypes: ['image'], value: card.frontUrl,
                                    render: function (ref) {
                                        return el(Button, { variant: card.frontUrl ? 'secondary' : 'primary', onClick: ref.open },
                                            card.frontUrl ? __('Change Front Image') : __('Choose Front Image'));
                                    }
                                })
                            ),
                            el(BkbgColorSwatch, { label: __('Front BG Color'), value: card.frontBg || '',
                                onChange: function (v) { updateCard(idx, 'frontBg', v); } }),
                            el(TextControl, { label: __('Front Label'), value: card.frontLabel || '',
                                onChange: function (v) { updateCard(idx, 'frontLabel', v); },
                                __nextHasNoMarginBottom: true }),
                            el('p', { style: { margin: '10px 0 6px', fontWeight: 600 } }, __('Back (After)')),
                            el(MediaUploadCheck, {},
                                el(MediaUpload, {
                                    onSelect: function (m) { updateCard(idx, 'backUrl', m.url); },
                                    allowedTypes: ['image'], value: card.backUrl,
                                    render: function (ref) {
                                        return el(Button, { variant: card.backUrl ? 'secondary' : 'primary', onClick: ref.open },
                                            card.backUrl ? __('Change Back Image') : __('Choose Back Image'));
                                    }
                                })
                            ),
                            el(BkbgColorSwatch, { label: __('Back BG Color'), value: card.backBg || '',
                                onChange: function (v) { updateCard(idx, 'backBg', v); } }),
                            el(TextControl, { label: __('Back Label'), value: card.backLabel || '',
                                onChange: function (v) { updateCard(idx, 'backLabel', v); },
                                __nextHasNoMarginBottom: true }),
                            el(RangeControl, { label: __('Initial Divider Position (%)'), value: card.initialPosition || 50,
                                min: 5, max: 95,
                                onChange: function (v) { updateCard(idx, 'initialPosition', v); },
                                __nextHasNoMarginBottom: true }),
                            attr.cards.length > 1 && el(Button, {
                                isDestructive: true, variant: 'secondary',
                                onClick: function () { removeCard(idx); },
                                style: { marginTop: 8 }
                            }, __('Remove Card'))
                        );
                    }),
                    el(Button, { variant: 'primary', onClick: addCard,
                        style: { marginTop: 8, width: '100%' }
                    }, __('+ Add Card'))
                ),

                el(PanelBody, { title: __('Layout'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Columns'),
                        value: String(attr.columns),
                        options: ['1','2','3'].map(function (v) { return { label: v, value: v }; }),
                        onChange: function (v) { setAttr({ columns: Number(v) }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Swipe Orientation'),
                        value: attr.orientation,
                        options: [
                            { label: __('Horizontal'), value: 'horizontal' },
                            { label: __('Vertical'),   value: 'vertical' }
                        ],
                        onChange: function (v) { setAttr({ orientation: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Card Height (px)'), value: attr.cardHeight,
                        min: 160, max: 700,
                        onChange: function (v) { setAttr({ cardHeight: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Card Radius (px)'), value: attr.cardRadius,
                        min: 0, max: 40,
                        onChange: function (v) { setAttr({ cardRadius: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Gap (px)'), value: attr.gap,
                        min: 0, max: 60,
                        onChange: function (v) { setAttr({ gap: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                el(PanelBody, { title: __('Divider & Handle'), initialOpen: false },
                    el(RangeControl, { label: __('Divider Width (px)'), value: attr.dividerWidth,
                        min: 1, max: 8,
                        onChange: function (v) { setAttr({ dividerWidth: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Handle Size (px)'), value: attr.handleSize,
                        min: 24, max: 80,
                        onChange: function (v) { setAttr({ handleSize: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                el(PanelBody, { title: __('Labels'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Labels'), checked: attr.showLabels,
                        onChange: function (v) { setAttr({ showLabels: v }); },
                        __nextHasNoMarginBottom: true }),
                    ),

                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    TC && el(TC, { label: __('Labels', 'blockenberg'), value: attr.labelTypo, onChange: function(v){ setAttr({labelTypo:v}); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors'), initialOpen: false,
                    colorSettings: [
                        { label: __('Divider'), value: attr.dividerColor,
                          onChange: function (v) { setAttr({ dividerColor: v || '#ffffff' }); } },
                        { label: __('Handle BG'), value: attr.handleBg,
                          onChange: function (v) { setAttr({ handleBg: v || '#ffffff' }); } },
                        { label: __('Handle Icon'), value: attr.handleColor,
                          onChange: function (v) { setAttr({ handleColor: v || '#0f172a' }); } },
                        { label: __('Label Text'), value: attr.labelColor,
                          onChange: function (v) { setAttr({ labelColor: v || '#ffffff' }); } }
                    ]
                })
            );

            return el(wp.element.Fragment, {}, inspector,
                el('div', bp,
                    el('div', {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(' + attr.columns + ', 1fr)',
                            gap: attr.gap + 'px'
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
            return el('div', bp,
                el('div', { className: 'bkbg-rsc-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
