( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    /* ── Brand definitions ── */
    var BRANDS = {
        visa:       { label: 'Visa',        bg: '#1434CB', color: '#fff',    text: 'VISA',       font: 'italic', weight: '900', size: 15 },
        mastercard: { label: 'Mastercard',  bg: '#252525', color: '#fff',    text: 'MC',         font: 'normal', weight: '800', size: 14, circles: true },
        amex:       { label: 'Amex',        bg: '#007BC1', color: '#fff',    text: 'AMEX',       font: 'normal', weight: '700', size: 12 },
        paypal:     { label: 'PayPal',      bg: '#003087', color: '#009cde', text: 'PayPal',     font: 'normal', weight: '800', size: 11 },
        applepay:   { label: 'Apple Pay',   bg: '#000000', color: '#fff',    text: ' Pay',       font: 'normal', weight: '600', size: 11, prefix: '🍎' },
        googlepay:  { label: 'Google Pay',  bg: '#ffffff', color: '#1a73e8', text: 'G Pay',      font: 'normal', weight: '700', size: 12, border: '#dadce0' },
        discover:   { label: 'Discover',    bg: '#231F20', color: '#F76F20', text: 'DISCOVER',   font: 'normal', weight: '700', size: 9  },
        stripe:     { label: 'Stripe',      bg: '#635BFF', color: '#fff',    text: 'stripe',     font: 'normal', weight: '700', size: 12 },
        klarna:     { label: 'Klarna',      bg: '#FFB3C7', color: '#17120f', text: 'klarna',     font: 'normal', weight: '700', size: 11 },
        afterpay:   { label: 'Afterpay',    bg: '#B2FCE4', color: '#000',    text: 'afterpay',  font: 'normal', weight: '700', size: 9  },
        amazonpay:  { label: 'Amazon Pay',  bg: '#232F3E', color: '#FF9900', text: 'amazon\npay',font: 'normal', weight: '700', size: 9  },
        venmo:      { label: 'Venmo',       bg: '#3D95CE', color: '#fff',    text: 'venmo',      font: 'normal', weight: '700', size: 11 },
        maestro:    { label: 'Maestro',     bg: '#fff',    color: '#333',    text: 'maestro',    font: 'normal', weight: '600', size: 10, border: '#ccc' },
        bitcoin:    { label: 'Bitcoin',     bg: '#F7931A', color: '#fff',    text: '₿',          font: 'normal', weight: '700', size: 20 },
        shoppay:    { label: 'Shop Pay',    bg: '#5A31F4', color: '#fff',    text: 'shop\npay',  font: 'normal', weight: '700', size: 10 }
    };

    var BADGE_ICONS = {
        ssl:    '🔒',
        pci:    '🛡',
        '256bit': '🔐',
        shield: '✓'
    };

    /* ── Preview icon ── */
    function BrandIcon(props) {
        var id = props.id;
        var size = props.size || 44;
        var radius = props.radius || 8;
        var bg = props.bg;
        var border = props.border;
        var b = BRANDS[id];
        if (!b) return null;

        var brd = border || b.border || 'none';
        return el('div', {
            title: b.label,
            style: {
                width: size * 1.6 + 'px',
                height: size + 'px',
                background: bg || b.bg,
                border: brd === 'none' ? 'none' : '1px solid ' + brd,
                borderRadius: radius + 'px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                flexDirection: 'column',
                boxSizing: 'border-box'
            }
        },
            el('span', {
                style: {
                    color: b.color,
                    fontSize: b.size + 'px',
                    fontWeight: b.weight,
                    fontStyle: b.font === 'italic' ? 'italic' : 'normal',
                    fontFamily: b.font === 'italic' ? 'Georgia, serif' : 'system-ui, sans-serif',
                    lineHeight: '1.1',
                    textAlign: 'center',
                    whiteSpace: 'pre'
                }
            }, (b.prefix || '') + b.text)
        );
    }

    /* ── Payment methods preview ── */
    function PaymentPreview(props) {
        var a = props.attributes;
        var enabledMethods = (a.methods || []).filter(function (m) { return m.enabled; });

        var justifyMap = { center: 'center', left: 'flex-start', right: 'flex-end' };
        var justify = justifyMap[a.align] || 'center';

        var icons = el('div', {
            style: {
                display: 'flex',
                flexWrap: 'wrap',
                gap: a.iconGap + 'px',
                justifyContent: justify,
                alignItems: 'center'
            }
        },
            enabledMethods.length ? enabledMethods.map(function (m, idx) {
                return el('div', { key: idx, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } },
                    el(BrandIcon, { id: m.id, size: a.iconSize, radius: a.iconRadius, bg: a.iconBg || undefined, border: a.iconBorder || undefined }),
                    a.showLabels && el('span', {
                        style: {
                            fontSize: '10px',
                            color: a.labelColor || '#6b7280',
                            textAlign: 'center'
                        }
                    }, (BRANDS[m.id] || {}).label || m.id)
                );
            }) : el('span', { style: { color: '#9ca3af', fontSize: '13px' } }, 'Enable payment methods in the sidebar')
        );

        var badges = a.showSecurityBadges && el('div', {
            style: {
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                justifyContent: justify,
                alignItems: 'center',
                marginTop: a.badgePosition === 'below' ? '12px' : '0'
            }
        },
            (a.securityBadges || []).filter(function (b) { return b.enabled; }).map(function (badge, bi) {
                return el('div', { key: bi, style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                    el('span', null, BADGE_ICONS[badge.id] || '🔒'),
                    el('span', { className: 'bkbg-pmth-badge-text', style: { color: a.badgeColor || '#6b7280' } }, badge.label)
                );
            })
        );

        var outerStyle = {
            paddingTop: (a.paddingTop || 0) + 'px',
            paddingBottom: (a.paddingBottom || 0) + 'px',
            background: a.bgColor || '',
            maxWidth: a.maxWidth > 0 ? a.maxWidth + 'px' : '100%',
            margin: '0 auto'
        };

        if (a.badgePosition === 'right' && a.showSecurityBadges) {
            return el('div', { style: outerStyle },
                el('div', { style: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', justifyContent: justify } },
                    icons,
                    badges
                )
            );
        }

        return el('div', { style: outerStyle },
            icons,
            badges
        );
    }

    registerBlockType('blockenberg/payment-methods', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var blockProps = useBlockProps((function(){
                var s = { background: a.bgColor || '' };
                var tv = getTypoCssVars();
                if (tv) {
                    Object.assign(s, tv(a.badgeTypo || {}, '--bkbg-pmth-badge'));
                }
                return { style: s };
            })());

            /* ── Method toggles ── */
            var methodToggles = (a.methods || []).map(function (m, idx) {
                var b = BRANDS[m.id] || {};
                return el(ToggleControl, {
                    key: m.id,
                    label: b.label || m.id,
                    checked: m.enabled,
                    onChange: function (v) {
                        var updated = a.methods.map(function (item, i) {
                            if (i !== idx) return item;
                            return Object.assign({}, item, { enabled: v });
                        });
                        set({ methods: updated });
                    },
                    __nextHasNoMarginBottom: true
                });
            });

            /* ── Badge toggles + label edit ── */
            var badgeControls = (a.securityBadges || []).map(function (badge, bi) {
                return el('div', { key: badge.id, style: { borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '8px' } },
                    el(ToggleControl, {
                        label: BADGE_ICONS[badge.id] + ' ' + (badge.label || badge.id),
                        checked: badge.enabled,
                        onChange: function (v) {
                            var updated = a.securityBadges.map(function (item, i) {
                                if (i !== bi) return item;
                                return Object.assign({}, item, { enabled: v });
                            });
                            set({ securityBadges: updated });
                        },
                        __nextHasNoMarginBottom: true
                    }),
                    badge.enabled && el(TextControl, {
                        label: __('Badge Label', 'blockenberg'),
                        value: badge.label || '',
                        onChange: function (v) {
                            var updated = a.securityBadges.map(function (item, i) {
                                if (i !== bi) return item;
                                return Object.assign({}, item, { label: v });
                            });
                            set({ securityBadges: updated });
                        },
                        __nextHasNoMarginBottom: true
                    })
                );
            });

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Payment Methods', 'blockenberg'), initialOpen: true },
                    el('p', { style: { fontSize: '11px', color: '#6b7280', marginBottom: '8px' } }, __('Toggle which payment brands to display.', 'blockenberg')),
                    methodToggles
                ),

                el(PanelBody, { title: __('Security Badges', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Security Badges', 'blockenberg'), checked: a.showSecurityBadges, onChange: function (v) { set({ showSecurityBadges: v }); }, __nextHasNoMarginBottom: true }),
                    a.showSecurityBadges && el('div', { style: { marginTop: '8px' } }, badgeControls),
                    a.showSecurityBadges && el('div', { style: { marginTop: '8px' } },
                        el(SelectControl, {
                            label: __('Badge Position', 'blockenberg'),
                            value: a.badgePosition,
                            options: [
                                { value: 'below', label: 'Below icons' },
                                { value: 'right', label: 'Beside icons' }
                            ],
                            onChange: function (v) { set({ badgePosition: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    ),

                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Alignment', 'blockenberg'),
                        value: a.align,
                        options: [
                            { value: 'center', label: 'Center' },
                            { value: 'left', label: 'Left' },
                            { value: 'right', label: 'Right' }
                        ],
                        onChange: function (v) { set({ align: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, { label: __('Show Brand Labels', 'blockenberg'), checked: a.showLabels, onChange: function (v) { set({ showLabels: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Icon Size (px)', 'blockenberg'), value: a.iconSize, min: 24, max: 80, onChange: function (v) { set({ iconSize: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Icon Corner Radius', 'blockenberg'), value: a.iconRadius, min: 0, max: 20, onChange: function (v) { set({ iconRadius: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Gap Between Icons', 'blockenberg'), value: a.iconGap, min: 4, max: 32, onChange: function (v) { set({ iconGap: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Max Width (0 = full)', 'blockenberg'), value: a.maxWidth, min: 0, max: 1200, step: 20, onChange: function (v) { set({ maxWidth: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: a.paddingTop, min: 0, max: 120, step: 4, onChange: function (v) { set({ paddingTop: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 120, step: 4, onChange: function (v) { set({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                    )
                ),

                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    (function(){ var C = getTypoControl(); return C ? [
                        el(C, { key: 'badge', label: __('Badge Text', 'blockenberg'), value: a.badgeTypo || {}, onChange: function(v){ set({badgeTypo: v}); } })
                    ] : null; })()
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.bgColor, onChange: function (v) { set({ bgColor: v }); }, label: __('Section Background', 'blockenberg') },
                        { value: a.iconBg, onChange: function (v) { set({ iconBg: v }); }, label: __('Icon Background Override', 'blockenberg') },
                        { value: a.iconBorder, onChange: function (v) { set({ iconBorder: v }); }, label: __('Icon Border Color', 'blockenberg') },
                        { value: a.labelColor, onChange: function (v) { set({ labelColor: v }); }, label: __('Label Color', 'blockenberg') },
                        { value: a.badgeColor, onChange: function (v) { set({ badgeColor: v }); }, label: __('Badge Text Color', 'blockenberg') }
                    ]
                })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el(PaymentPreview, { attributes: a })
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-pmth-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
