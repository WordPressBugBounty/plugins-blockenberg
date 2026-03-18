( function () {
    var el                 = wp.element.createElement;
    var registerBlockType  = wp.blocks.registerBlockType;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var ToggleControl      = wp.components.ToggleControl;
    var TextControl        = wp.components.TextControl;
    var SelectControl      = wp.components.SelectControl;
    var Button             = wp.components.Button;
    var GradientPicker     = wp.components.__experimentalGradientPicker;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    registerBlockType('blockenberg/liquid-glass-cards', {
        edit: function (props) {
            var a   = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.titleTypo, '--bkbg-lgc-tt-'));
                    Object.assign(s, _tvFn(a.descTypo, '--bkbg-lgc-d-'));
                }
                return { style: s };
            })());

            function updateCard(idx, field, val) {
                var nc = a.cards.map(function (c, i) {
                    return i === idx ? Object.assign({}, c, { [field]: val }) : c;
                });
                set({ cards: nc });
            }
            function addCard() {
                set({ cards: a.cards.concat([{ icon: '✨', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', title: 'New Card', description: 'Card description goes here.', linkUrl: '', linkText: 'Learn More' }]) });
            }
            function removeCard(idx) {
                set({ cards: a.cards.filter(function (_, i) { return i !== idx; }) });
            }

            var cols = a.columns || 3;
            var blur = a.blurAmount || 20;
            var gOp  = (a.glassOpacity || 18) / 100;
            var bOp  = (a.borderOpacity || 30) / 100;
            var gc   = a.glassColor || '#ffffff';
            // Parse hex to RGB for rgba
            var glassRgb = hexToRgb(gc) || '255,255,255';
            var borderRgb = hexToRgb(a.borderColor || 'rgba(255,255,255,0.3)') || '255,255,255';

            function hexToRgb(c) {
                if (!c) return null;
                var m = c.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
                return m ? parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) : null;
            }

            var wrapStyle = {
                background: a.bgGradient || 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                padding: '40px 32px',
                borderRadius: 16
            };

            var gridStyle = {
                display: 'grid',
                gridTemplateColumns: 'repeat(' + cols + ', 1fr)',
                gap: '20px'
            };

            var cardStyle = {
                background: 'rgba(' + glassRgb + ',' + gOp + ')',
                backdropFilter: 'blur(' + blur + 'px)',
                WebkitBackdropFilter: 'blur(' + blur + 'px)',
                border: '1px solid rgba(' + borderRgb + ',' + bOp + ')',
                borderRadius: (a.cardRadius || 24) + 'px',
                padding: (a.cardPadding || 32) + 'px',
                boxShadow: '0 8px 32px ' + (a.shadowColor || 'rgba(0,0,0,0.2)'),
                display: 'flex',
                flexDirection: 'column',
                gap: 12
            };

            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: 'Cards', initialOpen: true },
                        (a.cards || []).map(function (card, i) {
                            return el('div', { key: i, style: { marginBottom: 12, padding: 10,
                                background: '#f8fafc', borderRadius: 6, border: '1px solid #e5e7eb' } },
                                el('strong', { style: { display: 'block', marginBottom: 6, fontSize: 12 } }, 'Card ' + (i + 1)),
                                el(IP().IconPickerControl, {
                                    iconType: card.iconType || 'custom-char',
                                    customChar: card.icon || '',
                                    dashicon: card.iconDashicon || '',
                                    imageUrl: card.iconImageUrl || '',
                                    onChangeType: function (v) { updateCard(i, 'iconType', v); },
                                    onChangeChar: function (v) { updateCard(i, 'icon', v); },
                                    onChangeDashicon: function (v) { updateCard(i, 'iconDashicon', v); },
                                    onChangeImageUrl: function (v) { updateCard(i, 'iconImageUrl', v); },
                                    label: 'Icon'
                                }),
                                el(TextControl, { label: 'Title', value: card.title || '',
                                    onChange: function (v) { updateCard(i, 'title', v); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: 'Description', value: card.description || '',
                                    onChange: function (v) { updateCard(i, 'description', v); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: 'Link URL', value: card.linkUrl || '',
                                    onChange: function (v) { updateCard(i, 'linkUrl', v); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: 'Link text', value: card.linkText || '',
                                    onChange: function (v) { updateCard(i, 'linkText', v); }, __nextHasNoMarginBottom: true }),
                                el(Button, { isDestructive: true, isSmall: true,
                                    onClick: function () { removeCard(i); }, style: { marginTop: 4 } }, '✕ Remove')
                            );
                        }),
                        el(Button, { isPrimary: true, isSmall: true, onClick: addCard, style: { marginTop: 4 } }, '+ Add Card')
                    ),
                    el(PanelBody, { title: 'Layout', initialOpen: false },
                        el(SelectControl, { label: 'Columns', value: String(a.columns || 3),
                            options: [
                                { label: '1', value: '1' }, { label: '2', value: '2' },
                                { label: '3', value: '3' }, { label: '4', value: '4' }
                            ],
                            onChange: function (v) { set({ columns: Number(v) }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show link button', checked: a.showLink !== false,
                            onChange: function (v) { set({ showLink: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Card radius', value: a.cardRadius || 24,
                            onChange: function (v) { set({ cardRadius: v }); }, min: 0, max: 60, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Card padding', value: a.cardPadding || 32,
                            onChange: function (v) { set({ cardPadding: v }); }, min: 12, max: 72, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Icon size', value: a.iconSize || 44,
                            onChange: function (v) { set({ iconSize: v }); }, min: 24, max: 80, __nextHasNoMarginBottom: true }),
                        ),
                    el(PanelBody, { title: 'Glass Effect', initialOpen: false },
                        el(RangeControl, { label: 'Blur amount (px)', value: a.blurAmount || 20,
                            onChange: function (v) { set({ blurAmount: v }); }, min: 0, max: 60, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Glass opacity (%)', value: a.glassOpacity || 18,
                            onChange: function (v) { set({ glassOpacity: v }); }, min: 0, max: 80, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Border opacity (%)', value: a.borderOpacity || 30,
                            onChange: function (v) { set({ borderOpacity: v }); }, min: 0, max: 100, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Parallax strength', value: a.parallaxStrength || 8,
                            onChange: function (v) { set({ parallaxStrength: v }); }, min: 0, max: 30, __nextHasNoMarginBottom: true })
                    ),
                    
                    el( PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: 'Title', value: a.titleTypo || {}, onChange: function (v) { set({ titleTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: 'Description', value: a.descTypo || {}, onChange: function (v) { set({ descTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: 'Colors', initialOpen: false,
                        colorSettings: [
                            { label: 'Glass tint',   value: a.glassColor, onChange: function (v) { set({ glassColor:  v || '#ffffff' }); } },
                            { label: 'Border color', value: a.borderColor,onChange: function (v) { set({ borderColor: v || 'rgba(255,255,255,0.3)' }); } },
                            { label: 'Title',        value: a.titleColor, onChange: function (v) { set({ titleColor:  v || '#ffffff' }); } },
                            { label: 'Description',  value: a.descColor,  onChange: function (v) { set({ descColor:   v || 'rgba(255,255,255,0.8)' }); } },
                            { label: 'Icon bubble',  value: a.iconBg,     onChange: function (v) { set({ iconBg:      v || 'rgba(255,255,255,0.2)' }); } },
                            { label: 'Link text',    value: a.linkColor,  onChange: function (v) { set({ linkColor:   v || '#ffffff' }); } },
                            { label: 'Card shadow',  value: a.shadowColor,onChange: function (v) { set({ shadowColor: v || 'rgba(0,0,0,0.2)' }); } }
                        ],
                        disableCustomGradients: true
                    }),
                    el(PanelBody, { title: 'Background Gradient', initialOpen: false },
                        el(GradientPicker, {
                            value: a.bgGradient || '',
                            onChange: function (v) { set({ bgGradient: v }); }
                        })
                    )
                ),

                el('div', { style: wrapStyle },
                    el('div', { style: gridStyle },
                        (a.cards || []).map(function (card, i) {
                            return el('div', { key: i, style: cardStyle },
                                el('div', {
                                    style: {
                                        width: (a.iconSize || 44) + 'px',
                                        height: (a.iconSize || 44) + 'px',
                                        borderRadius: '50%',
                                        background: a.iconBg || 'rgba(255,255,255,0.2)',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: Math.round((a.iconSize || 44) * 0.55) + 'px',
                                        flexShrink: 0
                                    }
                                }, (function () {
                                    var _ct = card.iconType || 'custom-char';
                                    if (_ct !== 'custom-char' && IP()) {
                                        var _n = IP().buildEditorIcon(_ct, card.icon, card.iconDashicon, card.iconImageUrl, card.iconDashiconColor);
                                        if (_n) return _n;
                                    }
                                    return card.icon || '✨';
                                })()),
                                el('h3', { className: 'bkbg-lgc-title', style: { margin: 0, color: a.titleColor || '#ffffff', lineHeight: 1.3 } },
                                    card.title || ''),
                                el('p', { className: 'bkbg-lgc-desc', style: { margin: 0, color: a.descColor || 'rgba(255,255,255,0.8)', lineHeight: 1.6 } },
                                    card.description || ''),
                                a.showLink !== false && el('a', {
                                    href: card.linkUrl || '#',
                                    style: { color: a.linkColor || '#ffffff', fontSize: 14, fontWeight: 600,
                                        textDecoration: 'none', marginTop: 'auto', display: 'inline-flex',
                                        alignItems: 'center', gap: 4 }
                                }, (card.linkText || 'Learn More') + ' →')
                            );
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = useBlockProps.save();
            var opts = {
                blurAmount:      a.blurAmount      || 20,
                glassOpacity:    a.glassOpacity     || 18,
                borderOpacity:   a.borderOpacity    || 30,
                parallaxStrength: a.parallaxStrength || 8,
                glassColor:      a.glassColor       || '#ffffff',
                borderColor:     a.borderColor      || 'rgba(255,255,255,0.3)',
                shadowColor:     a.shadowColor      || 'rgba(0,0,0,0.2)',
                iconBg:          a.iconBg           || 'rgba(255,255,255,0.2)',
                titleColor:      a.titleColor       || '#ffffff',
                descColor:       a.descColor        || 'rgba(255,255,255,0.8)',
                linkColor:       a.linkColor        || '#ffffff'
            };
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-lgc-app',
                    'data-opts': JSON.stringify(opts),
                    style: (function () {
                        var _tvFn = getTypoCssVars();
                        var s = { background: a.bgGradient || 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' };
                        if (_tvFn) {
                            Object.assign(s, _tvFn(a.titleTypo, '--bkbg-lgc-tt-'));
                            Object.assign(s, _tvFn(a.descTypo, '--bkbg-lgc-d-'));
                        }
                        return s;
                    })()
                },
                    el('div', {
                        className: 'bkbg-lgc-grid',
                        style: { gridTemplateColumns: 'repeat(' + (a.columns || 3) + ',1fr)' }
                    },
                        (a.cards || []).map(function (card, i) {
                            return el('div', { key: i, className: 'bkbg-lgc-card',
                                style: {
                                    borderRadius: (a.cardRadius || 24) + 'px',
                                    padding: (a.cardPadding || 32) + 'px'
                                }
                            },
                                el('div', { className: 'bkbg-lgc-icon',
                                    style: { width: (a.iconSize || 44) + 'px', height: (a.iconSize || 44) + 'px',
                                        fontSize: Math.round((a.iconSize || 44) * 0.55) + 'px' } },
                                    (function () {
                                        var _ct = card.iconType || 'custom-char';
                                        if (_ct !== 'custom-char' && IP()) {
                                            var _n = IP().buildSaveIcon(_ct, card.icon, card.iconDashicon, card.iconImageUrl, card.iconDashiconColor);
                                            if (_n) return _n;
                                        }
                                        return card.icon || '';
                                    })()),
                                el('h3', { className: 'bkbg-lgc-title' }, card.title || ''),
                                el('p', { className: 'bkbg-lgc-desc' }, card.description || ''),
                                a.showLink !== false && el('a', {
                                    className: 'bkbg-lgc-link',
                                    href: card.linkUrl || '#',
                                    rel: 'noopener'
                                }, (card.linkText || 'Learn More') + ' →')
                            );
                        })
                    )
                )
            );
        }
    });
}() );
