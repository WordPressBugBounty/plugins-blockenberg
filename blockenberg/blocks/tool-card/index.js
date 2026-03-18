( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    var _tc, _tvf;
    Object.defineProperty(window, '_bkbgTypoCtrlCache', { get: function () { if (!_tc) { _tc = window.bkbgTypographyControl; } return _tc; } });
    Object.defineProperty(window, '_bkbgTypoVarsCache', { get: function () { if (!_tvf) { _tvf = window.bkbgTypoCssVars; } return _tvf; } });
    function getTypoControl(props, attrName, label) { return window._bkbgTypoCtrlCache(props, attrName, label); }

    function HalfStar(color, key) {
        return el('span', { key: key, style: { position: 'relative', display: 'inline-block', color: '#d1d5db', lineHeight: 1 } },
            '★',
            el('span', { style: { position: 'absolute', left: 0, top: 0, width: '50%', overflow: 'hidden', color: color } }, '★')
        );
    }

    function StarRow(rating, starColor) {
        var stars = [];
        for (var i = 1; i <= 5; i++) {
            if (rating >= i) {
                stars.push(el('span', { key: i, style: { color: starColor, fontSize: '16px' } }, '★'));
            } else if (rating >= i - 0.5) {
                stars.push(HalfStar(starColor, i));
            } else {
                stars.push(el('span', { key: i, style: { color: '#d1d5db', fontSize: '16px' } }, '☆'));
            }
        }
        return el('span', {}, stars);
    }

    registerBlockType('blockenberg/tool-card', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;

            var blockProps = (function () {
                var s = { background: '#f8fafc', padding: '24px' };
                Object.assign(s, window._bkbgTypoVarsCache(attr.nameTypo, '--bktlc-nt-'), window._bkbgTypoVarsCache(attr.bodyTypo, '--bktlc-bt-'));
                return useBlockProps({ style: s });
            })();

            /* Features list management */
            function FeaturesList() {
                return el('div', { style: { marginTop: '12px' } },
                    el('label', { style: { display: 'block', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', marginBottom: '8px', color: '#1e1e1e' } }, __('Key Features', 'blockenberg')),
                    (attr.features || []).map(function (f, idx) {
                        return el('div', { key: idx, style: { display: 'flex', gap: '6px', marginBottom: '6px' } },
                            el(TextControl, {
                                value: f, __nextHasNoMarginBottom: true,
                                onChange: function (v) {
                                    var feats = attr.features.slice();
                                    feats[idx] = v;
                                    set({ features: feats });
                                }
                            }),
                            el(Button, {
                                variant: 'tertiary', isDestructive: true, style: { flexShrink: 0 },
                                onClick: function () { var feats = attr.features.filter(function (_, i) { return i !== idx; }); set({ features: feats }); }
                            }, '✕')
                        );
                    }),
                    el(Button, {
                        variant: 'secondary', __nextHasNoMarginBottom: true, style: { marginTop: '6px' },
                        onClick: function () { set({ features: (attr.features || []).concat(['New feature']) }); }
                    }, __('+ Add Feature', 'blockenberg'))
                );
            }

            /* Card preview */
            var isHorizontal = attr.layout === 'horizontal';
            var cardStyle = {
                display: 'flex', gap: '24px', flexDirection: isHorizontal ? 'row' : 'column',
                background: attr.bgColor, border: '1px solid ' + attr.borderColor,
                borderRadius: attr.borderRadius + 'px', padding: '28px', position: 'relative'
            };

            var logoSection = el('div', { style: { flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minWidth: isHorizontal ? '140px' : 'auto' } },
                attr.logoUrl
                    ? el('img', { src: attr.logoUrl, alt: attr.logoAlt, style: { width: '72px', height: '72px', objectFit: 'contain', borderRadius: '12px', border: '1px solid ' + attr.borderColor } })
                    : el('div', { style: { width: '72px', height: '72px', borderRadius: '12px', background: attr.accentColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' } }, '🔧'),
                attr.showRating && el('div', { style: { textAlign: 'center' } },
                    StarRow(attr.rating, attr.starColor),
                    el('div', { style: { fontSize: '11px', color: attr.taglineColor, marginTop: '2px' } }, attr.ratingCount)
                ),
                attr.showPricing && el('div', { style: { fontSize: '11px', color: attr.pricingColor, textAlign: 'center', background: attr.bgColor === '#ffffff' ? '#f8fafc' : '#f0f0f0', borderRadius: '6px', padding: '4px 8px' } },
                    el('strong', { style: { textTransform: 'uppercase', fontSize: '10px', color: attr.accentColor } }, attr.pricing), el('br'),
                    attr.pricingNote
                ),
                el(Button, { variant: 'primary', style: { background: attr.ctaBg, color: attr.ctaColor, border: 'none', borderRadius: '6px', padding: '10px 18px', fontWeight: 600, width: '100%', justifyContent: 'center' } }, attr.ctaLabel)
            );

            var contentSection = el('div', { style: { flex: 1, minWidth: 0 } },
                el('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' } },
                    el('h3', { className: 'bkbg-tlc-name', style: { margin: 0, color: attr.nameColor } }, attr.toolName),
                    attr.showBadge && attr.badgeText && el('span', { style: { background: attr.badgeBg, color: attr.badgeColor, fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', whiteSpace: 'nowrap', flexShrink: 0 } }, attr.badgeText)
                ),
                el('p', { className: 'bkbg-tlc-tagline', style: { margin: '0 0 12px', color: attr.taglineColor } }, attr.tagline),
                el('p', { className: 'bkbg-tlc-desc', style: { margin: '0 0 16px', color: attr.descColor } }, attr.description),
                el('ul', { style: { margin: '0', paddingLeft: '0', listStyle: 'none' } },
                    (attr.features || []).slice(0, 5).map(function (f, i) {
                        return el('li', { key: i, style: { display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px', color: attr.featureColor } },
                            el('span', { style: { color: attr.accentColor, fontWeight: 700, flexShrink: 0 } }, '✓'),
                            f
                        );
                    })
                )
            );

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Tool Details', 'blockenberg'), initialOpen: true },
                    el(TextControl, { label: __('Tool Name', 'blockenberg'), value: attr.toolName, __nextHasNoMarginBottom: true, onChange: function (v) { set({ toolName: v }); } }),
                    el('div', { style: { marginTop: '12px' } },
                        el(TextControl, { label: __('Tagline', 'blockenberg'), value: attr.tagline, __nextHasNoMarginBottom: true, onChange: function (v) { set({ tagline: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(TextareaControl, { label: __('Description', 'blockenberg'), value: attr.description, __nextHasNoMarginBottom: true, onChange: function (v) { set({ description: v }); } })
                    ),
                    FeaturesList()
                ),
                el(PanelBody, { title: __('Logo', 'blockenberg'), initialOpen: false },
                    el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (m) { set({ logoUrl: m.url, logoId: m.id, logoAlt: m.alt || '' }); },
                            allowedTypes: ['image'], value: attr.logoId,
                            render: function (rp) {
                                return el('div', {},
                                    attr.logoUrl && el('img', { src: attr.logoUrl, style: { width: '72px', marginBottom: '8px', borderRadius: '8px' } }),
                                    el(Button, { onClick: rp.open, variant: 'secondary', __nextHasNoMarginBottom: true }, attr.logoUrl ? __('Replace Logo', 'blockenberg') : __('Upload Logo', 'blockenberg')),
                                    attr.logoUrl && el(Button, { onClick: function () { set({ logoUrl: '', logoId: 0, logoAlt: '' }); }, variant: 'link', isDestructive: true, style: { marginLeft: '8px' } }, __('Remove', 'blockenberg'))
                                );
                            }
                        })
                    )
                ),
                el(PanelBody, { title: __('Rating & Pricing', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Rating', 'blockenberg'), checked: attr.showRating, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showRating: v }); } }),
                    attr.showRating && el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Rating (0-5)', 'blockenberg'), value: attr.rating, min: 0, max: 5, step: 0.5, __nextHasNoMarginBottom: true, onChange: function (v) { set({ rating: v }); } }),
                        el('div', { style: { marginTop: '8px' } },
                            el(TextControl, { label: __('Review Count Label', 'blockenberg'), value: attr.ratingCount, __nextHasNoMarginBottom: true, onChange: function (v) { set({ ratingCount: v }); } })
                        )
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(ToggleControl, { label: __('Show Pricing', 'blockenberg'), checked: attr.showPricing, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showPricing: v }); } })
                    ),
                    attr.showPricing && el('div', { style: { marginTop: '8px' } },
                        el(SelectControl, {
                            label: __('Pricing Model', 'blockenberg'), value: attr.pricing, __nextHasNoMarginBottom: true,
                            options: [{ label: 'Free', value: 'free' }, { label: 'Freemium', value: 'freemium' }, { label: 'Paid', value: 'paid' }],
                            onChange: function (v) { set({ pricing: v }); }
                        }),
                        el('div', { style: { marginTop: '8px' } },
                            el(TextControl, { label: __('Pricing Note', 'blockenberg'), value: attr.pricingNote, __nextHasNoMarginBottom: true, onChange: function (v) { set({ pricingNote: v }); } })
                        )
                    )
                ),
                el(PanelBody, { title: __('Badge & CTA', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Badge', 'blockenberg'), checked: attr.showBadge, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showBadge: v }); } }),
                    attr.showBadge && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Badge Text', 'blockenberg'), value: attr.badgeText, __nextHasNoMarginBottom: true, onChange: function (v) { set({ badgeText: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(TextControl, { label: __('CTA Label', 'blockenberg'), value: attr.ctaLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ ctaLabel: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('CTA URL', 'blockenberg'), value: attr.ctaUrl, __nextHasNoMarginBottom: true, onChange: function (v) { set({ ctaUrl: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'), value: attr.layout, __nextHasNoMarginBottom: true,
                        options: [{ label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' }, { label: 'Compact', value: 'compact' }],
                        onChange: function (v) { set({ layout: v }); }
                    }),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 32, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl(props, 'nameTypo', __('Tool Name', 'blockenberg')),
                    getTypoControl(props, 'bodyTypo', __('Body', 'blockenberg'))
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Card Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                        { label: __('Card Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#6366f1' }); } },
                        { label: __('Tool Name', 'blockenberg'), value: attr.nameColor, onChange: function (v) { set({ nameColor: v || '#111827' }); } },
                        { label: __('Tagline', 'blockenberg'), value: attr.taglineColor, onChange: function (v) { set({ taglineColor: v || '#6b7280' }); } },
                        { label: __('Description', 'blockenberg'), value: attr.descColor, onChange: function (v) { set({ descColor: v || '#374151' }); } },
                        { label: __('Feature Text', 'blockenberg'), value: attr.featureColor, onChange: function (v) { set({ featureColor: v || '#374151' }); } },
                        { label: __('Stars', 'blockenberg'), value: attr.starColor, onChange: function (v) { set({ starColor: v || '#f59e0b' }); } },
                        { label: __('Pricing Text', 'blockenberg'), value: attr.pricingColor, onChange: function (v) { set({ pricingColor: v || '#374151' }); } },
                        { label: __('Badge Background', 'blockenberg'), value: attr.badgeBg, onChange: function (v) { set({ badgeBg: v || '#fef3c7' }); } },
                        { label: __('Badge Text', 'blockenberg'), value: attr.badgeColor, onChange: function (v) { set({ badgeColor: v || '#92400e' }); } },
                        { label: __('CTA Button', 'blockenberg'), value: attr.ctaBg, onChange: function (v) { set({ ctaBg: v || '#6366f1' }); } },
                        { label: __('CTA Text', 'blockenberg'), value: attr.ctaColor, onChange: function (v) { set({ ctaColor: v || '#ffffff' }); } }
                    ]
                })
            );

            return el('div', blockProps,
                controls,
                el('div', { className: 'bkbg-tlc-preview', style: cardStyle },
                    logoSection,
                    contentSection
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            var bp = (function () {
                var tv = Object.assign({}, window._bkbgTypoVarsCache(attr.nameTypo, '--bktlc-nt-'), window._bkbgTypoVarsCache(attr.bodyTypo, '--bktlc-bt-'));
                var parts = []; Object.keys(tv).forEach(function (k) { parts.push(k + ':' + tv[k]); });
                return useBlockProps.save(parts.length ? { style: parts.join(';') } : {});
            })();
            return el('div', bp,
                el('div', { className: 'bkbg-tlc-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
