( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    var _fanTC, _fanTV;
    function _tc() { return _fanTC || (_fanTC = window.bkbgTypographyControl); }
    function _tv() { return _fanTV || (_fanTV = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    // ── data ──────────────────────────────────────────────────────
    var categoryOptions = [
        { label: '🆕 New Feature',  value: 'new-feature'  },
        { label: '⚡ Improvement', value: 'improvement'  },
        { label: '🐛 Bug Fix',     value: 'bugfix'       },
        { label: '⚠️ Deprecation', value: 'deprecation'  },
        { label: '🔒 Security',    value: 'security'     },
        { label: '📦 Integration', value: 'integration'  }
    ];

    var statusOptions = [
        { label: '✅ Available Now', value: 'available'    },
        { label: '🧪 Beta',          value: 'beta'         },
        { label: '🚀 Coming Soon',   value: 'coming-soon'  },
        { label: '⚠️ Deprecated',   value: 'deprecated'   }
    ];

    var layoutOptions = [
        { label: 'Card',            value: 'card'         },
        { label: 'Announcement',    value: 'announcement' },
        { label: 'Hero',            value: 'hero'         }
    ];

    var accentPositionOptions = [
        { label: 'Top stripe',  value: 'top'  },
        { label: 'Left stripe', value: 'left' },
        { label: 'None',        value: 'none' }
    ];

    function categoryLabel(cat) {
        var map = { 'new-feature': '🆕 New Feature', 'improvement': '⚡ Improvement', 'bugfix': '🐛 Bug Fix', 'deprecation': '⚠️ Deprecation', 'security': '🔒 Security', 'integration': '📦 Integration' };
        return map[cat] || cat;
    }
    function statusLabel(s) {
        var map = { 'available': '✅ Available Now', 'beta': '🧪 Beta', 'coming-soon': '🚀 Coming Soon', 'deprecated': '⚠️ Deprecated' };
        return map[s] || s;
    }

    registerBlockType('blockenberg/feature-announcement', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var blockProps = useBlockProps({ className: 'bkbg-fan-editor-wrap', style: Object.assign({}, _tv()(a.typoName, '--bkbg-fan-nm-'), _tv()(a.typoTagline, '--bkbg-fan-tl-'), _tv()(a.typoBody, '--bkbg-fan-bd-')) });

            var inner = el('div', { className: 'bkbg-fan-inner', style: { padding: '24px 28px', background: a.bgColor, position: 'relative' } },
                // Meta badges row
                el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 } },
                    a.showIcon && a.featureIcon && el('span', { className: 'bkbg-fan-icon', style: { fontSize: 28 } },
                        (!a.featureIconType || a.featureIconType === 'custom-char') ? a.featureIcon : IP().buildEditorIcon(a.featureIconType, a.featureIcon, a.featureIconDashicon, a.featureIconImageUrl, a.featureIconDashiconColor)
                    ),
                    el('span', { className: 'bkbg-fan-badge', style: { background: a.categoryBg, color: a.categoryColor } }, categoryLabel(a.category)),
                    a.showVersion && el('span', { className: 'bkbg-fan-badge', style: { background: a.versionBg, color: a.versionColor } }, a.version),
                    el('span', { className: 'bkbg-fan-badge', style: { background: a.statusBg, color: a.statusColor } }, statusLabel(a.status)),
                    a.showDate && a.releaseDate && el('span', { className: 'bkbg-fan-date', style: { color: '#64748b' } }, a.releaseDate)
                ),
                // Feature name
                el('h2', { className: 'bkbg-fan-name', style: { margin: '0 0 8px', color: a.featureNameColor } }, a.featureName),
                // Tagline
                el('p', { className: 'bkbg-fan-tagline', style: { margin: '0 0 14px', color: a.taglineColor } }, a.tagline),
                // Description
                a.showDescription && el('p', { className: 'bkbg-fan-description', style: { margin: '0 0 16px', color: a.textColor } }, a.description),
                // Highlights
                a.showHighlights && a.highlights.length > 0 && el('div', { style: { marginBottom: 16 } },
                    el('div', { className: 'bkbg-fan-highlights-label', style: { color: a.accentColor, marginBottom: 8 } }, a.highlightsLabel || "What's new"),
                    el('ul', { style: { margin: 0, padding: 0, listStyle: 'none' } },
                        a.highlights.map(function (h, i) {
                            return el('li', { key: i, className: 'bkbg-fan-highlight' },
                                el('span', { className: 'bkbg-fan-highlight-icon', style: { color: a.highlightIconColor } }, '✦'),
                                el('span', { style: { color: a.textColor } }, h)
                            );
                        })
                    )
                ),
                // Plans
                a.showPlans && a.availablePlans.length > 0 && el('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 18 } },
                    el('span', { className: 'bkbg-fan-plans-label', style: { color: '#64748b' } }, (a.plansLabel || 'Available on') + ':'),
                    a.availablePlans.map(function (plan, i) {
                        return el('span', { key: i, className: 'bkbg-fan-plan-badge', style: { background: a.planBg, color: a.planColor } }, plan);
                    })
                ),
                // CTAs
                el('div', { style: { display: 'flex', gap: 10, flexWrap: 'wrap' } },
                    a.showCta && a.ctaText && el('a', { href: a.ctaUrl || '#', className: 'bkbg-fan-cta', style: { background: a.ctaBg, color: a.ctaColor, padding: '11px 22px', borderRadius: (a.borderRadius || 12) + 'px', textDecoration: 'none', display: 'inline-block' } }, a.ctaText),
                    a.showSecondaryCta && a.ctaSecondaryText && el('a', { href: a.ctaSecondaryUrl || '#', className: 'bkbg-fan-cta is-secondary', style: { borderColor: a.ctaSecondaryColor, color: a.ctaSecondaryColor, padding: '9px 22px', borderRadius: (a.borderRadius || 12) + 'px', textDecoration: 'none', display: 'inline-block' } }, a.ctaSecondaryText)
                )
            );

            // Wrap with accent stripe
            var wrapStyle = { border: '1px solid ' + a.borderColor, borderRadius: (a.borderRadius || 12) + 'px', overflow: 'hidden' };
            var wrapContent;
            if (a.accentPosition === 'top') {
                wrapContent = el('div', { style: wrapStyle },
                    el('div', { style: { height: 5, background: a.accentStripe } }),
                    inner
                );
            } else if (a.accentPosition === 'left') {
                wrapContent = el('div', { style: Object.assign({}, wrapStyle, { display: 'flex' }) },
                    el('div', { style: { width: 5, flexShrink: 0, background: a.accentStripe } }),
                    inner
                );
            } else {
                wrapContent = el('div', { style: wrapStyle }, inner);
            }

            return el(Fragment, null,
                el('div', blockProps, wrapContent),
                el(InspectorControls, null,
                    // Feature Info
                    el(PanelBody, { title: 'Feature Info', initialOpen: true },
                        el(TextControl, { label: 'Feature Name', value: a.featureName, __nextHasNoMarginBottom: true, onChange: function (v) { set({ featureName: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Tagline', value: a.tagline, __nextHasNoMarginBottom: true, onChange: function (v) { set({ tagline: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el('p', { style: { fontSize: '11px', fontWeight: 600, marginTop: '8px' } }, 'Feature Icon'),
                            el(IP().IconPickerControl, IP().iconPickerProps(a, set, { charAttr: 'featureIcon', typeAttr: 'featureIconType', dashiconAttr: 'featureIconDashicon', imageUrlAttr: 'featureIconImageUrl', colorAttr: 'featureIconDashiconColor' }))
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(SelectControl, { label: 'Category', value: a.category, options: categoryOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ category: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(SelectControl, { label: 'Status', value: a.status, options: statusOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ status: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Version (e.g. v3.2)', value: a.version, __nextHasNoMarginBottom: true, onChange: function (v) { set({ version: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Release Date', value: a.releaseDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ releaseDate: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 } },
                            el(ToggleControl, { label: 'Show Icon', checked: a.showIcon, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showIcon: v }); } }),
                            el(ToggleControl, { label: 'Show Version', checked: a.showVersion, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showVersion: v }); } }),
                            el(ToggleControl, { label: 'Show Date', checked: a.showDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showDate: v }); } })
                        )
                    ),
                    // Description
                    el(PanelBody, { title: 'Description', initialOpen: false },
                        el(ToggleControl, { label: 'Show Description', checked: a.showDescription, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showDescription: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextareaControl, { value: a.description, rows: 4, __nextHasNoMarginBottom: true, onChange: function (v) { set({ description: v }); } })
                        )
                    ),
                    // Highlights
                    el(PanelBody, { title: 'Highlights', initialOpen: false },
                        el(ToggleControl, { label: 'Show Highlights', checked: a.showHighlights, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showHighlights: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.highlightsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ highlightsLabel: v }); } })
                        ),
                        a.highlights.map(function (h, i) {
                            return el('div', { key: i, style: { marginTop: 8, display: 'flex', gap: 4, alignItems: 'center' } },
                                el('div', { style: { flex: 1 } },
                                    el(TextControl, { value: h, __nextHasNoMarginBottom: true, onChange: function (v) { set({ highlights: a.highlights.map(function (x, j) { return j === i ? v : x; }) }); } })
                                ),
                                el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ highlights: a.highlights.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                            );
                        }),
                        el(Button, { variant: 'secondary', style: { marginTop: 8 }, onClick: function () { set({ highlights: a.highlights.concat(['New highlight point']) }); } }, '+ Add Highlight')
                    ),
                    // Plans & CTAs
                    el(PanelBody, { title: 'Plans & CTAs', initialOpen: false },
                        el(ToggleControl, { label: 'Show Plans', checked: a.showPlans, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showPlans: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Plans Label', value: a.plansLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ plansLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Plans (comma-separated)', value: a.availablePlans.join(', '), __nextHasNoMarginBottom: true, onChange: function (v) { set({ availablePlans: v.split(',').map(function (p) { return p.trim(); }).filter(Boolean) }); } })
                        ),
                        el('div', { style: { marginTop: 12, borderTop: '1px solid #e5e7eb', paddingTop: 12 } },
                            el(ToggleControl, { label: 'Show Primary CTA', checked: a.showCta, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showCta: v }); } }),
                            el('div', { style: { marginTop: 6 } },
                                el(TextControl, { label: 'CTA Text', value: a.ctaText, __nextHasNoMarginBottom: true, onChange: function (v) { set({ ctaText: v }); } })
                            ),
                            el('div', { style: { marginTop: 6 } },
                                el(TextControl, { label: 'CTA URL', value: a.ctaUrl, __nextHasNoMarginBottom: true, onChange: function (v) { set({ ctaUrl: v }); } })
                            ),
                            el('div', { style: { marginTop: 10, borderTop: '1px solid #e5e7eb', paddingTop: 10 } },
                                el(ToggleControl, { label: 'Show Secondary CTA', checked: a.showSecondaryCta, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSecondaryCta: v }); } }),
                                el('div', { style: { marginTop: 6 } },
                                    el(TextControl, { label: 'Secondary CTA Text', value: a.ctaSecondaryText, __nextHasNoMarginBottom: true, onChange: function (v) { set({ ctaSecondaryText: v }); } })
                                ),
                                el('div', { style: { marginTop: 6 } },
                                    el(TextControl, { label: 'Secondary CTA URL', value: a.ctaSecondaryUrl, __nextHasNoMarginBottom: true, onChange: function (v) { set({ ctaSecondaryUrl: v }); } })
                                )
                            )
                        )
                    ),
                    // Layout
                    el(PanelBody, { title: 'Layout & Style', initialOpen: false },
                        el(SelectControl, { label: 'Accent Stripe', value: a.accentPosition, options: accentPositionOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ accentPosition: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                        )
                    ),
                    // Colors
                    
                    el( PanelBody, { title: 'Typography', initialOpen: false },
                        _tc() && el(_tc(), { label: 'Feature Name', value: a.typoName, onChange: function (v) { set({ typoName: v }); } }),
                        _tc() && el(_tc(), { label: 'Tagline', value: a.typoTagline, onChange: function (v) { set({ typoTagline: v }); } }),
                        _tc() && el(_tc(), { label: 'Body', value: a.typoBody, onChange: function (v) { set({ typoBody: v }); } })
                    ),
el(PanelColorSettings, {
                        title: 'Block & Accent Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Background',        value: a.bgColor,          onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                            { label: 'Border',            value: a.borderColor,      onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); } },
                            { label: 'Accent Color',      value: a.accentColor,      onChange: function (v) { set({ accentColor: v || '#7c3aed' }); } },
                            { label: 'Accent Stripe',     value: a.accentStripe,     onChange: function (v) { set({ accentStripe: v || '#7c3aed' }); } },
                            { label: 'Feature Name',      value: a.featureNameColor, onChange: function (v) { set({ featureNameColor: v || '#0f172a' }); } },
                            { label: 'Tagline',           value: a.taglineColor,     onChange: function (v) { set({ taglineColor: v || '#374151' }); } },
                            { label: 'Description Text',  value: a.textColor,        onChange: function (v) { set({ textColor: v || '#4b5563' }); } },
                            { label: 'Highlight Icon',    value: a.highlightIconColor,onChange: function (v) { set({ highlightIconColor: v || '#7c3aed' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: 'Badge & CTA Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Version BG',        value: a.versionBg,         onChange: function (v) { set({ versionBg: v || '#ede9fe' }); } },
                            { label: 'Version Text',      value: a.versionColor,      onChange: function (v) { set({ versionColor: v || '#5b21b6' }); } },
                            { label: 'Category BG',       value: a.categoryBg,        onChange: function (v) { set({ categoryBg: v || '#f0fdf4' }); } },
                            { label: 'Category Text',     value: a.categoryColor,     onChange: function (v) { set({ categoryColor: v || '#14532d' }); } },
                            { label: 'Status BG',         value: a.statusBg,          onChange: function (v) { set({ statusBg: v || '#dcfce7' }); } },
                            { label: 'Status Text',       value: a.statusColor,       onChange: function (v) { set({ statusColor: v || '#14532d' }); } },
                            { label: 'Plan BG',           value: a.planBg,            onChange: function (v) { set({ planBg: v || '#f5f3ff' }); } },
                            { label: 'Plan Text',         value: a.planColor,         onChange: function (v) { set({ planColor: v || '#5b21b6' }); } },
                            { label: 'Primary CTA BG',    value: a.ctaBg,             onChange: function (v) { set({ ctaBg: v || '#7c3aed' }); } },
                            { label: 'Primary CTA Text',  value: a.ctaColor,          onChange: function (v) { set({ ctaColor: v || '#ffffff' }); } },
                            { label: 'Secondary CTA',     value: a.ctaSecondaryColor, onChange: function (v) { set({ ctaSecondaryColor: v || '#7c3aed' }); } }
                        ]
                    })
                )
            );
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return wp.element.createElement('div', useBlockProps.save(),
                wp.element.createElement('div', {
                    className: 'bkbg-feature-announcement-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
