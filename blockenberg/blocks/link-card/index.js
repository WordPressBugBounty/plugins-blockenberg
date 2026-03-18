( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    function CardItem(props) {
        var card = props.card;
        var idx = props.idx;
        var set = props.onChange;
        var attr = props.attr;

        return el('div', {
            style: {
                border: '1px solid ' + attr.borderColor,
                borderRadius: attr.cardRadius + 'px',
                padding: attr.cardPadding + 'px',
                background: attr.cardBg,
                position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px'
            }
        },
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                attr.showIcon && el('span', { className: 'bkbg-lkc-icon', style: { fontSize: attr.iconSize + 'px', lineHeight: 1 } }, (card.iconType || 'custom-char') !== 'custom-char' && IP() ? IP().buildEditorIcon(card.iconType, card.icon, card.iconDashicon, card.iconImageUrl, card.iconDashiconColor) : (card.icon || '📄')),
                el(TextControl, {
                    value: card.title, placeholder: __('Card title', 'blockenberg'),
                    style: { fontWeight: '700', margin: 0 },
                    onChange: function (v) { set('title', v); }, __nextHasNoMarginBottom: true
                })
            ),
            el(TextControl, {
                value: card.description, placeholder: __('Short description', 'blockenberg'),
                style: { color: attr.descColor, margin: 0 },
                onChange: function (v) { set('description', v); }, __nextHasNoMarginBottom: true
            }),
            el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' } },
                IP() && el(IP().IconPickerControl, {
                    iconType: card.iconType || 'custom-char',
                    customChar: card.icon || '',
                    dashicon: card.iconDashicon || '',
                    imageUrl: card.iconImageUrl || '',
                    onChangeType: function (v) { set('iconType', v); },
                    onChangeChar: function (v) { set('icon', v); },
                    onChangeDashicon: function (v) { set('iconDashicon', v); },
                    onChangeImageUrl: function (v) { set('iconImageUrl', v); }
                }),
                el(TextControl, { label: __('URL', 'blockenberg'), value: card.url, onChange: function (v) { set('url', v); }, __nextHasNoMarginBottom: true })
            ),
            el(ToggleControl, { label: __('Open in new tab', 'blockenberg'), checked: card.isExternal, onChange: function (v) { set('isExternal', v); }, __nextHasNoMarginBottom: true }),
            el(Button, { isSmall: true, isDestructive: true, onClick: props.onRemove, style: { alignSelf: 'flex-end' } }, __('Remove card', 'blockenberg'))
        );
    }

    registerBlockType('blockenberg/link-card', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(attr.titleTypo, '--bkbg-lkc-tt-'));
                    Object.assign(s, _tvFn(attr.descTypo, '--bkbg-lkc-d-'));
                }
                return { className: 'bkbg-lkc-editor', style: s };
            })());

            function updateCard(idx, key, value) {
                var next = attr.cards.map(function (c, i) {
                    if (i !== idx) return c;
                    var obj = {};
                    Object.keys(c).forEach(function (k) { obj[k] = c[k]; });
                    obj[key] = value;
                    return obj;
                });
                setAttr({ cards: next });
            }

            function removeCard(idx) {
                setAttr({ cards: attr.cards.filter(function (_, i) { return i !== idx; }) });
            }

            function addCard() {
                setAttr({ cards: attr.cards.concat([{ icon: '✨', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', title: 'New Card', description: 'Add a short description.', url: '#', isExternal: false, accentColor: '' }]) });
            }

            var gridStyle = {
                display: 'grid',
                gridTemplateColumns: 'repeat(' + attr.columns + ', 1fr)',
                gap: attr.gap + 'px'
            };
            if (attr.columns > 2) gridStyle.gridTemplateColumns = 'repeat(' + attr.columns + ', 1fr)';

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Grid Settings', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Columns', 'blockenberg'), value: attr.columns,
                        options: [{ label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }],
                        onChange: function (v) { setAttr({ columns: parseInt(v) }); }, __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: attr.gap, min: 8, max: 48, onChange: function (v) { setAttr({ gap: v }); }, __nextHasNoMarginBottom: true }),
                    el(SelectControl, {
                        label: __('Card Style', 'blockenberg'), value: attr.cardStyle,
                        options: [
                            { label: 'Bordered', value: 'bordered' },
                            { label: 'Filled', value: 'filled' },
                            { label: 'Gradient', value: 'gradient' },
                            { label: 'Minimal', value: 'minimal' }
                        ],
                        onChange: function (v) { setAttr({ cardStyle: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Hover Effect', 'blockenberg'), value: attr.hoverEffect,
                        options: [
                            { label: 'Lift (shadow)', value: 'lift' },
                            { label: 'Glow (accent shadow)', value: 'glow' },
                            { label: 'Slide accent bar', value: 'slide' },
                            { label: 'None', value: 'none' }
                        ],
                        onChange: function (v) { setAttr({ hoverEffect: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, { label: __('Show Arrow', 'blockenberg'), checked: attr.showArrow, onChange: function (v) { setAttr({ showArrow: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Icon', 'blockenberg'), checked: attr.showIcon, onChange: function (v) { setAttr({ showIcon: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Icon Size (px)', 'blockenberg'), value: attr.iconSize, min: 16, max: 64, onChange: function (v) { setAttr({ iconSize: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Card Border Radius (px)', 'blockenberg'), value: attr.cardRadius, min: 0, max: 32, onChange: function (v) { setAttr({ cardRadius: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Card Padding (px)', 'blockenberg'), value: attr.cardPadding, min: 8, max: 64, onChange: function (v) { setAttr({ cardPadding: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: attr.maxWidth, min: 400, max: 1600, onChange: function (v) { setAttr({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 120, onChange: function (v) { setAttr({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 120, onChange: function (v) { setAttr({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: __('Title'), value: attr.titleTypo || {}, onChange: function (v) { setAttr({ titleTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: __('Description'), value: attr.descTypo || {}, onChange: function (v) { setAttr({ descTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Section Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                        { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#ffffff' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { setAttr({ borderColor: v || '#e5e7eb' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { setAttr({ accentColor: v || '#7c3aed' }); } },
                        { label: __('Title', 'blockenberg'), value: attr.titleColor, onChange: function (v) { setAttr({ titleColor: v || '#111827' }); } },
                        { label: __('Description', 'blockenberg'), value: attr.descColor, onChange: function (v) { setAttr({ descColor: v || '#6b7280' }); } },
                        { label: __('Arrow', 'blockenberg'), value: attr.arrowColor, onChange: function (v) { setAttr({ arrowColor: v || '#7c3aed' }); } }
                    ]
                })
            );

            return el('div', blockProps, controls,
                el('div', { style: { background: attr.bgColor, paddingTop: attr.paddingTop + 'px', paddingBottom: attr.paddingBottom + 'px' } },
                    el('div', { style: { maxWidth: attr.maxWidth + 'px', margin: '0 auto' } },
                        el('div', { style: gridStyle },
                            attr.cards.map(function (card, idx) {
                                return el(CardItem, {
                                    key: idx, card: card, idx: idx, attr: attr,
                                    onChange: function (key, val) { updateCard(idx, key, val); },
                                    onRemove: function () { removeCard(idx); }
                                });
                            })
                        ),
                        el('div', { style: { textAlign: 'center', marginTop: '16px' } },
                            el(Button, { isSecondary: true, onClick: addCard }, __('+ Add Card', 'blockenberg'))
                        )
                    )
                )
            );
        },

        save: function (props) {
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', { className: 'bkbg-lkc-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
