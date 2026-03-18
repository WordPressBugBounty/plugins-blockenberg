( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
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

    var BADGE_STYLES = {
        hot:     { bg: '#fef2f2', color: '#b91c1c', icon: '🔥' },
        sale:    { bg: '#fef9c3', color: '#854d0e', icon: '💸' },
        limited: { bg: '#fff7ed', color: '#c2410c', icon: '⏳' },
        new:     { bg: '#f0fdf4', color: '#15803d', icon: '✨' }
    };

    registerBlockType('blockenberg/offer-card', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = (function () {
                var bp = useBlockProps({ className: 'bkbg-ofr-editor bkbg-ofr-wrap' });
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) {
                    Object.assign(s, _tvf(attr.headingTypo, '--bkbg-ofr-hd-'));
                    Object.assign(s, _tvf(attr.descTypo, '--bkbg-ofr-ds-'));
                    Object.assign(s, _tvf(attr.ctaTypo, '--bkbg-ofr-ct-'));
                }
                bp.style = Object.assign(s, bp.style || {});
                return bp;
            }());

            var isBanner = attr.layout === 'banner';
            var isMinimal = attr.layout === 'minimal';

            function updateInclude(idx, val) {
                var next = attr.includes.map(function (it, i) { return i === idx ? { text: val } : it; });
                setAttr({ includes: next });
            }

            var bs = BADGE_STYLES[attr.badgeStyle] || BADGE_STYLES.hot;

            var card = el('div', {
                style: {
                    background: attr.cardBg,
                    border: '1px solid ' + attr.borderColor,
                    borderRadius: attr.borderRadius + 'px',
                    padding: '32px',
                    maxWidth: attr.maxWidth + 'px',
                    margin: '0 auto',
                    boxShadow: isMinimal ? 'none' : '0 4px 32px rgba(0,0,0,0.08)',
                    display: isBanner ? 'flex' : 'block',
                    gap: isBanner ? '40px' : undefined,
                    alignItems: isBanner ? 'center' : undefined
                }
            },
                /* Left / top section */
                el('div', { style: { flex: isBanner ? '1' : undefined } },
                    attr.showBadge && el('div', { style: { marginBottom: '16px' } },
                        el('span', { style: { background: attr.badgeBg, color: attr.badgeColor, fontSize: '12px', fontWeight: '700', padding: '5px 14px', borderRadius: '999px' } },
                            el(RichText, { tagName: 'span', value: attr.badge, onChange: function (v) { setAttr({ badge: v }); } })
                        )
                    ),
                    el(RichText, {
                        tagName: 'h3', value: attr.heading,
                        className: 'bkbg-ofr-heading',
                        style: { color: attr.headingColor, margin: '0 0 10px' },
                        onChange: function (v) { setAttr({ heading: v }); }
                    }),
                    el(RichText, {
                        tagName: 'p', value: attr.description,
                        className: 'bkbg-ofr-desc',
                        style: { color: attr.descColor, margin: '0 0 20px' },
                        onChange: function (v) { setAttr({ description: v }); }
                    }),
                    attr.showPrice && el('div', { style: { display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px' } },
                        el('span', { style: { fontSize: '40px', fontWeight: '800', color: attr.priceColor } }, attr.currency + attr.salePrice),
                        attr.originalPrice && el('span', { style: { fontSize: '20px', color: attr.strikethroughColor, textDecoration: 'line-through' } }, attr.currency + attr.originalPrice)
                    ),
                    attr.showCountdown && el('div', { className: 'bkbg-ofr-countdown-preview', style: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' } },
                        ['HH', 'MM', 'SS'].map(function (lbl, i) {
                            return el('div', { key: i, style: { background: '#111827', color: '#fff', borderRadius: '8px', padding: '8px 14px', textAlign: 'center', minWidth: '60px' } },
                                el('div', { style: { fontSize: '22px', fontWeight: '700', lineHeight: 1 } }, '00'),
                                el('div', { style: { fontSize: '10px', opacity: 0.6, marginTop: '2px', textTransform: 'uppercase' } }, lbl)
                            );
                        }),
                        el('div', { style: { flex: 1, display: 'flex', alignItems: 'center' } },
                            el(TextControl, { label: __('Countdown end (ISO date)', 'blockenberg'), value: attr.countdownEnd, placeholder: '2025-12-31T23:59:00', onChange: function (v) { setAttr({ countdownEnd: v }); }, __nextHasNoMarginBottom: true })
                        )
                    )
                ),
                /* Right / bottom section */
                el('div', { style: { flex: isBanner ? '0 0 300px' : undefined } },
                    attr.showIncludes && el('ul', { style: { listStyle: 'none', margin: '0 0 20px', padding: 0 } },
                        attr.includes.map(function (item, idx) {
                            return el('li', { key: idx, style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '15px', color: attr.includeColor } },
                                el('span', { style: { color: attr.checkColor, fontSize: '16px', fontWeight: '700', flexShrink: 0 } }, '✓'),
                                el(TextControl, {
                                    value: item.text,
                                    onChange: function (v) { updateInclude(idx, v); },
                                    style: { margin: 0, flex: 1 },
                                    __nextHasNoMarginBottom: true
                                }),
                                el(Button, { isSmall: true, isDestructive: true, onClick: function () { setAttr({ includes: attr.includes.filter(function (_, i) { return i !== idx; }) }); } }, '✕')
                            );
                        }),
                        el(Button, { isSecondary: true, isSmall: true, onClick: function () { setAttr({ includes: attr.includes.concat([{ text: 'New benefit' }]) }); } }, '+ Add item')
                    ),
                    el('a', {
                        href: '#editor',
                        className: 'bkbg-ofr-cta',
                        style: { display: 'block', background: attr.ctaBg, color: attr.ctaColor, padding: '16px', borderRadius: '8px', textAlign: 'center', textDecoration: 'none' }
                    }, attr.ctaLabel),
                    attr.showDisclaimer && el(RichText, {
                        tagName: 'p', value: attr.disclaimer,
                        style: { fontSize: '12px', color: attr.disclaimerColor, textAlign: 'center', marginTop: '12px', marginBottom: 0 },
                        onChange: function (v) { setAttr({ disclaimer: v }); }
                    })
                )
            );

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Badge & Pricing', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: __('Show Badge', 'blockenberg'), checked: attr.showBadge, onChange: function (v) { setAttr({ showBadge: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showBadge && el(SelectControl, {
                        label: __('Badge Style', 'blockenberg'), value: attr.badgeStyle,
                        options: [{ label: '🔥 Hot', value: 'hot' }, { label: '💸 Sale', value: 'sale' }, { label: '⏳ Limited', value: 'limited' }, { label: '✨ New', value: 'new' }],
                        onChange: function (v) { setAttr({ badgeStyle: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, { label: __('Show Price', 'blockenberg'), checked: attr.showPrice, onChange: function (v) { setAttr({ showPrice: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showPrice && el(TextControl, { label: __('Currency Symbol', 'blockenberg'), value: attr.currency, onChange: function (v) { setAttr({ currency: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showPrice && el(TextControl, { label: __('Sale Price', 'blockenberg'), value: attr.salePrice, onChange: function (v) { setAttr({ salePrice: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showPrice && el(TextControl, { label: __('Original Price (strikethrough)', 'blockenberg'), value: attr.originalPrice, onChange: function (v) { setAttr({ originalPrice: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Countdown Timer', 'blockenberg'), checked: attr.showCountdown, onChange: function (v) { setAttr({ showCountdown: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Includes List', 'blockenberg'), checked: attr.showIncludes, onChange: function (v) { setAttr({ showIncludes: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('CTA Label', 'blockenberg'), value: attr.ctaLabel, onChange: function (v) { setAttr({ ctaLabel: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('CTA URL', 'blockenberg'), value: attr.ctaUrl, onChange: function (v) { setAttr({ ctaUrl: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Open CTA in new tab', 'blockenberg'), checked: attr.ctaOpenNewTab, onChange: function (v) { setAttr({ ctaOpenNewTab: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Disclaimer', 'blockenberg'), checked: attr.showDisclaimer, onChange: function (v) { setAttr({ showDisclaimer: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Card Layout', 'blockenberg'), value: attr.layout,
                        options: [{ label: 'Card (stacked)', value: 'card' }, { label: 'Banner (side-by-side)', value: 'banner' }, { label: 'Minimal', value: 'minimal' }],
                        onChange: function (v) { setAttr({ layout: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: attr.borderRadius, min: 0, max: 32, onChange: function (v) { setAttr({ borderRadius: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: attr.maxWidth, min: 300, max: 1400, onChange: function (v) { setAttr({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 160, onChange: function (v) { setAttr({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 160, onChange: function (v) { setAttr({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Section BG', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                        { label: __('Card BG', 'blockenberg'), value: attr.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#ffffff' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { setAttr({ borderColor: v || '#e5e7eb' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { setAttr({ accentColor: v || '#7c3aed' }); } },
                        { label: __('Badge BG', 'blockenberg'), value: attr.badgeBg, onChange: function (v) { setAttr({ badgeBg: v || '#fef2f2' }); } },
                        { label: __('Badge Text', 'blockenberg'), value: attr.badgeColor, onChange: function (v) { setAttr({ badgeColor: v || '#b91c1c' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); } },
                        { label: __('Description', 'blockenberg'), value: attr.descColor, onChange: function (v) { setAttr({ descColor: v || '#6b7280' }); } },
                        { label: __('Sale Price', 'blockenberg'), value: attr.priceColor, onChange: function (v) { setAttr({ priceColor: v || '#111827' }); } },
                        { label: __('Strikethrough', 'blockenberg'), value: attr.strikethroughColor, onChange: function (v) { setAttr({ strikethroughColor: v || '#9ca3af' }); } },
                        { label: __('CTA BG', 'blockenberg'), value: attr.ctaBg, onChange: function (v) { setAttr({ ctaBg: v || '#7c3aed' }); } },
                        { label: __('CTA Text', 'blockenberg'), value: attr.ctaColor, onChange: function (v) { setAttr({ ctaColor: v || '#ffffff' }); } },
                        { label: __('Checkmark', 'blockenberg'), value: attr.checkColor, onChange: function (v) { setAttr({ checkColor: v || '#16a34a' }); } }
                    ]
                }),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(getTypoControl(), { label: __('Heading'), value: attr.headingTypo, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                    el(getTypoControl(), { label: __('Description'), value: attr.descTypo, onChange: function (v) { setAttr({ descTypo: v }); } }),
                    el(getTypoControl(), { label: __('CTA Button'), value: attr.ctaTypo, onChange: function (v) { setAttr({ ctaTypo: v }); } })
                )
            );

            return el('div', blockProps, controls,
                el('div', { style: { background: attr.bgColor, paddingTop: attr.paddingTop + 'px', paddingBottom: attr.paddingBottom + 'px' } }, card)
            );
        },

        save: function (props) {
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', { className: 'bkbg-ofr-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
