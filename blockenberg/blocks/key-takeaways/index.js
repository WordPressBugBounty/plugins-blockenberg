( function () {
    var el                = wp.element.createElement;
    var useState          = wp.element.useState;
    var Fragment          = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __                = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;
    var Button            = wp.components.Button;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var IP = function () { return window.bkbgIconPicker; };

    /* ── Bullet symbols by style ─────────────────────────────────────────── */
    var BULLET_SYMBOLS = {
        check:   '✓',
        check2:  '✔',
        arrow:   '→',
        circle:  '●',
        star:    '★',
        diamond: '◆',
        dash:    '—',
        custom:  null,
    };

    var BULLET_STYLE_OPTIONS = [
        { value: 'check',   label: '✓ Checkmark' },
        { value: 'check2',  label: '✔ Bold Check' },
        { value: 'arrow',   label: '→ Arrow' },
        { value: 'circle',  label: '● Circle' },
        { value: 'star',    label: '★ Star' },
        { value: 'diamond', label: '◆ Diamond' },
        { value: 'dash',    label: '— Dash' },
        { value: 'custom',  label: 'Custom Symbol' },
    ];

    var BORDER_POSITION_OPTIONS = [
        { value: 'left',   label: 'Left Border' },
        { value: 'top',    label: 'Top Border' },
        { value: 'all',    label: 'All Sides' },
        { value: 'none',   label: 'No Border' },
    ];

    function getBullet(attrs) {
        if (attrs.bulletStyle === 'custom') return attrs.customBullet || '→';
        return BULLET_SYMBOLS[attrs.bulletStyle] || '✓';
    }

    /* ── Preview component ────────────────────────────────────────────────── */
    function TakeawaysPreview(props) {
        var a      = props.attrs;
        var setA   = props.setAttrs;
        var accent = a.accentColor  || '#6c3fb5';
        var cRadius= (a.cardRadius  || 12) + 'px';
        var bullet = getBullet(a);

        /* Card border style */
        var borderStyle = {};
        if (a.borderPosition === 'left') {
            borderStyle = { borderLeft: (a.borderWidth || 4) + 'px solid ' + (a.borderColor || accent) };
        } else if (a.borderPosition === 'top') {
            borderStyle = { borderTop: (a.borderWidth || 4) + 'px solid ' + (a.borderColor || accent) };
        } else if (a.borderPosition === 'all') {
            borderStyle = { border: (a.borderWidth || 4) + 'px solid ' + (a.borderColor || accent) };
        }

        var cardStyle = Object.assign({
            background:   a.cardBg   || '#f5f3ff',
            borderRadius: cRadius,
            padding:      (a.paddingV || 28) + 'px ' + (a.paddingH || 28) + 'px',
            maxWidth:     (a.maxWidth || 760) + 'px',
            margin:       '0 auto',
            boxSizing:    'border-box',
        }, borderStyle);

        var items = a.items || [];

        return el('div', { style: cardStyle },

            /* Heading row */
            a.showHeading && el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: (a.showDivider ? '16px' : '20px') } },
                a.showHeadingIcon && el('span', {
                    className: 'bkbg-kt-icon',
                    style: {
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        background: a.iconBg || accent, color: a.iconColor || '#fff',
                        fontSize: '14px', fontWeight: 700,
                    }
                }, IP().buildEditorIcon(a.headingIconType, a.headingIcon, a.headingIconDashicon, a.headingIconImageUrl, a.headingIconDashiconColor)),
                el('span', {
                    className: 'bkbg-kt-heading',
                    style: {
                        color: a.headingColor || '#1e1b4b',
                    }
                }, a.heading || __('Key Takeaways', 'blockenberg'))
            ),

            /* Divider */
            a.showHeading && a.showDivider && el('hr', { style: { border: 'none', borderTop: '1.5px solid ' + (a.borderColor || accent), opacity: 0.25, margin: '0 0 18px 0' } }),

            /* Items list */
            el('ul', { style: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: (a.itemGap || 14) + 'px' } },
                items.map(function (item, idx) {
                    return el('li', { key: idx, style: { display: 'flex', alignItems: 'flex-start', gap: '10px' } },
                        el('span', {
                            className: 'bkbg-kt-bullet',
                            style: {
                                flexShrink: 0,
                                color: a.bulletColor || accent, marginTop: '1px',
                            }
                        }, bullet),
                        el('span', {
                            className: 'bkbg-kt-text',
                            contentEditable: true,
                            suppressContentEditableWarning: true,
                            onBlur: function (e) {
                                var newItems = items.slice();
                                newItems[idx] = e.target.innerText;
                                setA({ items: newItems });
                            },
                            style: {
                                flex: 1,
                                color: a.itemColor || '#374151',
                                outline: 'none', borderBottom: '1px dashed transparent',
                                cursor: 'text',
                            },
                            'data-placeholder': 'Type takeaway…',
                        }, item)
                    );
                }),

                /* Add item button */
                el('li', { style: { display: 'flex', justifyContent: 'flex-start', marginTop: '4px' } },
                    el(Button, {
                        variant: 'tertiary',
                        onClick: function () { setA({ items: items.concat('') }); },
                        style: { fontSize: '13px', padding: '4px 8px', color: accent },
                    }, '+ ' + __('Add Item', 'blockenberg'))
                )
            )
        );
    }

    registerBlockType('blockenberg/key-takeaways', {
        edit: function (props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {};
                Object.assign(s, _tv(a.headingTypo, '--bkbg-kt-h-'));
                Object.assign(s, _tv(a.itemTypo, '--bkbg-kt-it-'));
                return { style: s };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Heading', 'blockenberg'), checked: a.showHeading, onChange: function (v) { setAttr({ showHeading: v }); }, __nextHasNoMarginBottom: true }),
                        a.showHeading && el(TextControl, { label: __('Heading Text', 'blockenberg'), value: a.heading, onChange: function (v) { setAttr({ heading: v }); } }),
                        a.showHeading && el(ToggleControl, { label: __('Show Heading Icon', 'blockenberg'), checked: a.showHeadingIcon, onChange: function (v) { setAttr({ showHeadingIcon: v }); }, __nextHasNoMarginBottom: true }),
                        a.showHeading && a.showHeadingIcon && el(IP().IconPickerControl, IP().iconPickerProps(attr, setAttr, { charAttr: 'headingIcon', typeAttr: 'headingIconType', dashiconAttr: 'headingIconDashicon', imageUrlAttr: 'headingIconImageUrl', colorAttr: 'headingIconDashiconColor' })),
                        a.showHeading && el(ToggleControl, { label: __('Divider Below Heading', 'blockenberg'), checked: a.showDivider, onChange: function (v) { setAttr({ showDivider: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    el(PanelBody, { title: __('Bullet Style', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Bullet Style', 'blockenberg'), value: a.bulletStyle, options: BULLET_STYLE_OPTIONS, onChange: function (v) { setAttr({ bulletStyle: v }); } }),
                        a.bulletStyle === 'custom' && el(TextControl, { label: __('Custom Symbol', 'blockenberg'), value: a.customBullet, onChange: function (v) { setAttr({ customBullet: v }); } })
                    ),

                    el(PanelBody, { title: __('Border', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Border Position', 'blockenberg'), value: a.borderPosition, options: BORDER_POSITION_OPTIONS, onChange: function (v) { setAttr({ borderPosition: v }); } }),
                        a.borderPosition !== 'none' && el(RangeControl, { label: __('Border Width (px)', 'blockenberg'), value: a.borderWidth, min: 1, max: 12, onChange: function (v) { setAttr({ borderWidth: v }); } })
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Heading Typography', 'blockenberg'), value: a.headingTypo, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                        el(getTypographyControl(), { label: __('Item Typography', 'blockenberg'), value: a.itemTypo, onChange: function (v) { setAttr({ itemTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Accent Color', 'blockenberg'),   value: a.accentColor,  onChange: function (v) { setAttr({ accentColor:  v || '#6c3fb5' }); } },
                            { label: __('Card Background', 'blockenberg'), value: a.cardBg,       onChange: function (v) { setAttr({ cardBg:       v || '#f5f3ff' }); } },
                            { label: __('Border Color', 'blockenberg'),    value: a.borderColor,  onChange: function (v) { setAttr({ borderColor:  v || '#6c3fb5' }); } },
                            { label: __('Heading Color', 'blockenberg'),   value: a.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#1e1b4b' }); } },
                            { label: __('Item Text Color', 'blockenberg'), value: a.itemColor,    onChange: function (v) { setAttr({ itemColor:    v || '#374151' }); } },
                            { label: __('Bullet Color', 'blockenberg'),    value: a.bulletColor,  onChange: function (v) { setAttr({ bulletColor:  v || '#6c3fb5' }); } },
                            { label: __('Icon Background', 'blockenberg'), value: a.iconBg,       onChange: function (v) { setAttr({ iconBg:       v || '#6c3fb5' }); } },
                            { label: __('Icon Text Color', 'blockenberg'), value: a.iconColor,    onChange: function (v) { setAttr({ iconColor:    v || '#ffffff' }); } },
                        ]
                    }),

                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Item Gap (px)', 'blockenberg'),       value: a.itemGap,     min: 4,  max: 40, onChange: function (v) { setAttr({ itemGap: v }); } }),
                        el(RangeControl, { label: __('Padding Vertical (px)', 'blockenberg'), value: a.paddingV,  min: 8,  max: 80, onChange: function (v) { setAttr({ paddingV: v }); } }),
                        el(RangeControl, { label: __('Padding Horizontal (px)', 'blockenberg'), value: a.paddingH,min: 8,  max: 80, onChange: function (v) { setAttr({ paddingH: v }); } }),
                        el(RangeControl, { label: __('Card Radius (px)', 'blockenberg'),    value: a.cardRadius,  min: 0,  max: 40, onChange: function (v) { setAttr({ cardRadius: v }); } }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'),      value: a.maxWidth,    min: 320,max: 1400,onChange: function (v) { setAttr({ maxWidth: v }); } })
                    )
                ),

                el('div', blockProps,
                    el(TakeawaysPreview, { attrs: a, setAttrs: setAttr })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save();
            return el('div', blockProps,
                el('div', { className: 'bkbg-kt-app', 'data-opts': JSON.stringify(a) },
                    el('p', { className: 'bkbg-kt-loading' }, '…')
                )
            );
        }
    });
}() );
