( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var RichText = wp.blockEditor.RichText;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var Button = wp.components.Button;
    var TextControl = wp.components.TextControl;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'headlineTypo',     attrs, '--bkvp-hl-');
        _tvf(v, 'subTypo',          attrs, '--bkvp-sb-');
        _tvf(v, 'benefitTitleTypo', attrs, '--bkvp-bt-');
        _tvf(v, 'benefitTextTypo',  attrs, '--bkvp-bd-');
        return v;
    }

    function updateItem(arr, idx, field, val) {
        return arr.map(function (e, i) {
            if (i !== idx) return e;
            var u = {}; u[field] = val;
            return Object.assign({}, e, u);
        });
    }

    registerBlockType('blockenberg/value-proposition', {
        title: __('Value Proposition', 'blockenberg'),
        icon: 'star-filled',
        category: 'bkbg-marketing',
        description: __('Compelling value prop section with headline, USP benefits, proof badges, and CTA.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var layoutOptions = [
                { label: __('Centered', 'blockenberg'), value: 'center' },
                { label: __('Left aligned', 'blockenberg'), value: 'left' }
            ];
            var styleOptions = [
                { label: __('Clean', 'blockenberg'), value: 'clean' },
                { label: __('Card', 'blockenberg'), value: 'card' },
                { label: __('Bordered', 'blockenberg'), value: 'bordered' }
            ];
            var colOptions = [
                { label: '1 column', value: 1 },
                { label: '2 columns', value: 2 },
                { label: '3 columns', value: 3 }
            ];
            var fontWeightOptions = [
                { label: '400', value: 400 }, { label: '500', value: 500 },
                { label: '600', value: 600 }, { label: '700', value: 700 },
                { label: '800', value: 800 }, { label: '900', value: 900 }
            ];

            var textAlign = a.layout === 'center' ? 'center' : 'left';
            var justifyContent = a.layout === 'center' ? 'center' : 'flex-start';

            var inspector = el(InspectorControls, {},
                // Structure
                el(PanelBody, { title: __('Structure', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'),
                        value: a.layout, options: layoutOptions, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ layout: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Benefit columns', 'blockenberg'),
                        value: a.benefitColumns, options: colOptions, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ benefitColumns: parseInt(v, 10) }); }
                    }),
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'),
                        value: a.style, options: styleOptions, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ style: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show eyebrow label', 'blockenberg'),
                        checked: a.showEyebrow, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showEyebrow: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show subheadline', 'blockenberg'),
                        checked: a.showSubheadline, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSubheadline: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show proof badges', 'blockenberg'),
                        checked: a.showBadges, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showBadges: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show primary CTA', 'blockenberg'),
                        checked: a.showCta, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showCta: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show secondary CTA', 'blockenberg'),
                        checked: a.showSecondaryCta, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSecondaryCta: v }); }
                    })
                ),

                // CTA Links
                el(PanelBody, { title: __('CTA Links', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Primary CTA URL', 'blockenberg'),
                        value: a.ctaUrl, type: 'url', __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ ctaUrl: v }); }
                    }),
                    el(TextControl, {
                        label: __('Secondary CTA URL', 'blockenberg'),
                        value: a.ctaSecondaryUrl, type: 'url', __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ ctaSecondaryUrl: v }); }
                    })
                ),

                // Badges
                el(PanelBody, { title: __('Proof Badges', 'blockenberg'), initialOpen: false },
                    a.badges.map(function (badge, i) {
                        return el('div', { key: 'badge-' + i, style: { marginBottom: '12px', padding: '10px', background: '#f8fafc', borderRadius: '6px' } },
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } },
                                el('strong', {}, __('Badge', 'blockenberg') + ' ' + (i + 1)),
                                el(Button, { isDestructive: true, isSmall: true, icon: 'trash',
                                    onClick: function () { set({ badges: a.badges.filter(function (_, j) { return j !== i; }) }); }
                                })
                            ),
                            el(TextControl, {
                                label: __('Icon / Emoji', 'blockenberg'), value: badge.icon, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ badges: updateItem(a.badges, i, 'icon', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Text', 'blockenberg'), value: badge.text, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ badges: updateItem(a.badges, i, 'text', v) }); }
                            })
                        );
                    }),
                    el(Button, {
                        variant: 'secondary', isSmall: true, icon: 'plus-alt2',
                        onClick: function () { set({ badges: a.badges.concat([{ icon: '✨', text: 'New Badge' }]) }); }
                    }, __('Add Badge', 'blockenberg'))
                ),

                // Benefits (managed in sidebar for icon/description, inline for title)
                el(PanelBody, { title: __('Benefits', 'blockenberg'), initialOpen: false },
                    a.benefits.map(function (ben, i) {
                        return el('div', { key: 'ben-' + i, style: { marginBottom: '12px', padding: '10px', background: '#f8fafc', borderRadius: '6px' } },
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } },
                                el('strong', {}, __('Benefit', 'blockenberg') + ' ' + (i + 1)),
                                el(Button, { isDestructive: true, isSmall: true, icon: 'trash',
                                    onClick: function () { set({ benefits: a.benefits.filter(function (_, j) { return j !== i; }) }); }
                                })
                            ),
                            el(TextControl, {
                                label: __('Icon / Emoji', 'blockenberg'), value: ben.icon, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ benefits: updateItem(a.benefits, i, 'icon', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Title', 'blockenberg'), value: ben.title, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ benefits: updateItem(a.benefits, i, 'title', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Description', 'blockenberg'), value: ben.description, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ benefits: updateItem(a.benefits, i, 'description', v) }); }
                            })
                        );
                    }),
                    el(Button, {
                        variant: 'secondary', isSmall: true, icon: 'plus-alt2',
                        onClick: function () {
                            set({ benefits: a.benefits.concat([{ icon: '✨', title: 'New Benefit', description: 'Describe this benefit here.' }]) });
                        }
                    }, __('Add Benefit', 'blockenberg'))
                ),

                // Spacing
                el(PanelBody, { title: __('Spacing & Shape', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Section padding (vertical)', 'blockenberg'),
                        value: a.paddingV, min: 16, max: 120, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ paddingV: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Section padding (horizontal)', 'blockenberg'),
                        value: a.paddingH, min: 0, max: 80, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ paddingH: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Benefit card gap', 'blockenberg'),
                        value: a.gap, min: 8, max: 48, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ gap: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border radius', 'blockenberg'),
                        value: a.borderRadius, min: 0, max: 32, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ borderRadius: v }); }
                    })
                ),

                // Typography
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl(__('Headline', 'blockenberg'), 'headlineTypo', a, set),
                    getTypoControl(__('Subheadline', 'blockenberg'), 'subTypo', a, set),
                    getTypoControl(__('Benefit Title', 'blockenberg'), 'benefitTitleTypo', a, set),
                    getTypoControl(__('Benefit Text', 'blockenberg'), 'benefitTextTypo', a, set)
                ),

                // Colors
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Header Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.bgColor,       label: __('Section background', 'blockenberg'), onChange: function (c) { set({ bgColor: c }); } },
                            { value: a.accentColor,   label: __('Accent', 'blockenberg'),             onChange: function (c) { set({ accentColor: c }); } },
                            { value: a.eyebrowColor,  label: __('Eyebrow', 'blockenberg'),            onChange: function (c) { set({ eyebrowColor: c }); } },
                            { value: a.headlineColor, label: __('Headline', 'blockenberg'),           onChange: function (c) { set({ headlineColor: c }); } },
                            { value: a.subColor,      label: __('Subheadline', 'blockenberg'),        onChange: function (c) { set({ subColor: c }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Benefit Card Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.benefitBg,          label: __('Card background', 'blockenberg'),  onChange: function (c) { set({ benefitBg: c }); } },
                            { value: a.benefitBorderColor, label: __('Card border', 'blockenberg'),      onChange: function (c) { set({ benefitBorderColor: c }); } },
                            { value: a.iconBg,             label: __('Icon background', 'blockenberg'),  onChange: function (c) { set({ iconBg: c }); } },
                            { value: a.benefitTitleColor,  label: __('Benefit title', 'blockenberg'),   onChange: function (c) { set({ benefitTitleColor: c }); } },
                            { value: a.benefitTextColor,   label: __('Benefit text', 'blockenberg'),    onChange: function (c) { set({ benefitTextColor: c }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('CTA & Badge Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.ctaBg,             label: __('CTA background', 'blockenberg'),   onChange: function (c) { set({ ctaBg: c }); } },
                            { value: a.ctaColor,          label: __('CTA text', 'blockenberg'),         onChange: function (c) { set({ ctaColor: c }); } },
                            { value: a.ctaSecondaryColor, label: __('Secondary CTA', 'blockenberg'),    onChange: function (c) { set({ ctaSecondaryColor: c }); } },
                            { value: a.badgeBg,           label: __('Badge background', 'blockenberg'), onChange: function (c) { set({ badgeBg: c }); } },
                            { value: a.badgeColor,        label: __('Badge text', 'blockenberg'),       onChange: function (c) { set({ badgeColor: c }); } }
                        ]
                    })
                )
            );

            // ── Preview ──────────────────────────────────────────────
            var colTemplate = a.benefitColumns === 1 ? '1fr' : a.benefitColumns === 3 ? '1fr 1fr 1fr' : '1fr 1fr';

            var benefitsGrid = el('div', {
                style: {
                    display: 'grid', gridTemplateColumns: colTemplate,
                    gap: a.gap + 'px', marginTop: '32px'
                }
            },
                a.benefits.map(function (ben, i) {
                    var cardStyle = {
                        padding: '20px',
                        background: a.benefitBg,
                        borderRadius: a.borderRadius + 'px'
                    };
                    if (a.style === 'card') {
                        cardStyle.boxShadow = '0 2px 12px rgba(0,0,0,0.07)';
                        cardStyle.border = '1px solid ' + a.benefitBorderColor;
                    } else if (a.style === 'bordered') {
                        cardStyle.border = '1px solid ' + a.benefitBorderColor;
                    }

                    return el('div', { key: 'ben-' + i, style: cardStyle },
                        el('div', {
                            style: {
                                width: '44px', height: '44px', borderRadius: '10px',
                                background: a.iconBg, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '22px', marginBottom: '12px'
                            }
                        }, ben.icon),
                        el('div', {
                            className: 'bkbg-vp-benefit-title',
                            style: {
                                color: a.benefitTitleColor
                            }
                        }, ben.title),
                        el('div', {
                            className: 'bkbg-vp-benefit-text',
                            style: { color: a.benefitTextColor }
                        }, ben.description)
                    );
                })
            );

            var blockProps = useBlockProps((function () {
                var s = getTypoCssVars(a);
                return { className: 'bkbg-editor-wrap', 'data-block-label': 'Value Proposition', style: s };
            })());

            return el('div', blockProps,
                inspector,
                el('div', {
                    className: 'bkbg-vp-block',
                    style: {
                        background: a.bgColor,
                        padding: a.paddingV + 'px ' + a.paddingH + 'px',
                        textAlign: textAlign
                    }
                },
                    // Eyebrow
                    a.showEyebrow && el('div', {
                        style: {
                            display: 'inline-block', background: a.accentColor + '18',
                            color: a.eyebrowColor, fontWeight: 700, fontSize: '13px',
                            letterSpacing: '.07em', textTransform: 'uppercase',
                            padding: '4px 14px', borderRadius: '100px', marginBottom: '16px'
                        }
                    },
                        el('input', {
                            type: 'text', value: a.eyebrow,
                            style: {
                                background: 'transparent', border: 'none', outline: 'none',
                                color: 'inherit', fontWeight: 'inherit', fontSize: 'inherit',
                                letterSpacing: 'inherit', textAlign: textAlign, width: '100%'
                            },
                            onChange: function (e) { set({ eyebrow: e.target.value }); }
                        })
                    ),

                    // Headline
                    el('h2', {
                        className: 'bkbg-vp-headline',
                        style: {
                            color: a.headlineColor, maxWidth: '800px',
                            marginLeft: a.layout === 'center' ? 'auto' : '0',
                            marginRight: a.layout === 'center' ? 'auto' : '0'
                        }
                    },
                        el('textarea', {
                            value: a.headline, rows: 2,
                            style: {
                                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                                resize: 'none', font: 'inherit', letterSpacing: 'inherit', wordSpacing: 'inherit',
                                textTransform: 'inherit', fontStyle: 'inherit', textDecoration: 'inherit',
                                color: 'inherit', textAlign: textAlign
                            },
                            onChange: function (e) { set({ headline: e.target.value }); }
                        })
                    ),

                    // Subheadline
                    a.showSubheadline && el('p', {
                        className: 'bkbg-vp-sub',
                        style: {
                            color: a.subColor, maxWidth: '640px',
                            marginLeft: a.layout === 'center' ? 'auto' : '0',
                            marginRight: a.layout === 'center' ? 'auto' : '0'
                        }
                    },
                        el('textarea', {
                            value: a.subheadline, rows: 3,
                            style: {
                                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                                resize: 'none', font: 'inherit', letterSpacing: 'inherit', wordSpacing: 'inherit',
                                textTransform: 'inherit', fontStyle: 'inherit', textDecoration: 'inherit',
                                color: 'inherit', textAlign: textAlign
                            },
                            onChange: function (e) { set({ subheadline: e.target.value }); }
                        })
                    ),

                    // CTA buttons
                    (a.showCta || a.showSecondaryCta) && el('div', {
                        style: {
                            display: 'flex', gap: '12px', flexWrap: 'wrap',
                            justifyContent: justifyContent, marginBottom: '32px'
                        }
                    },
                        a.showCta && el('input', {
                            type: 'text', value: a.ctaText,
                            style: {
                                background: a.ctaBg, color: a.ctaColor, fontWeight: 700,
                                fontSize: '15px', padding: '12px 24px', borderRadius: a.borderRadius + 'px',
                                border: 'none', outline: 'none', cursor: 'text'
                            },
                            onChange: function (e) { set({ ctaText: e.target.value }); }
                        }),
                        a.showSecondaryCta && el('input', {
                            type: 'text', value: a.ctaSecondaryText,
                            style: {
                                background: 'transparent', color: a.ctaSecondaryColor, fontWeight: 600,
                                fontSize: '15px', padding: '12px 0', border: 'none', outline: 'none', cursor: 'text'
                            },
                            onChange: function (e) { set({ ctaSecondaryText: e.target.value }); }
                        })
                    ),

                    // Benefits grid
                    benefitsGrid,

                    // Badges
                    a.showBadges && el('div', {
                        style: {
                            display: 'flex', gap: '10px', flexWrap: 'wrap',
                            justifyContent: justifyContent, marginTop: '32px'
                        }
                    },
                        a.badges.map(function (badge, i) {
                            return el('div', {
                                key: 'badge-' + i,
                                style: {
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: a.badgeBg, color: a.badgeColor, fontSize: '13px',
                                    fontWeight: 600, padding: '6px 14px', borderRadius: '100px',
                                    border: '1px solid ' + a.benefitBorderColor
                                }
                            },
                                el('span', {}, badge.icon),
                                el('span', {}, badge.text)
                            );
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save((function () { var _tv = getTypoCssVars(a); return { style: _tv }; })());
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-value-proposition-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
