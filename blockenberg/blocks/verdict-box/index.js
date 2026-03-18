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
    var Button = wp.components.Button;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'nameTypo', attrs, '--bkvb-nm-');
        _tvf(v, 'bodyTypo', attrs, '--bkvb-bd-');
        _tvf(v, 'taglineTypo', attrs, '--bkvb-tl-');
        _tvf(v, 'scoreTypo', attrs, '--bkvb-sc-');
        _tvf(v, 'prosConsLabelTypo', attrs, '--bkvb-pl-');
        _tvf(v, 'ctaTypo', attrs, '--bkvb-ct-');
        return v;
    }

    var BADGE_OPTIONS = [
        { label: '⭐ Recommended', value: 'recommended'  },
        { label: '💰 Best Value',  value: 'best-value'   },
        { label: '🏆 Top Pick',    value: 'top-pick'     },
        { label: '🏅 Award Winner',value: 'award-winner' },
        { label: '👎 Skip It',     value: 'skip'         },
        { label: '(None)',         value: 'none'         }
    ];

    function badgeLabel(badge) {
        if (badge === 'recommended')  return '⭐ Recommended';
        if (badge === 'best-value')   return '💰 Best Value';
        if (badge === 'top-pick')     return '🏆 Top Pick';
        if (badge === 'award-winner') return '🏅 Award Winner';
        if (badge === 'skip')         return '👎 Skip It';
        return '';
    }

    function badgeColors(badge) {
        if (badge === 'skip') return { bg: '#fee2e2', color: '#991b1b' };
        if (badge === 'best-value') return { bg: '#dcfce7', color: '#14532d' };
        if (badge === 'top-pick') return { bg: '#eff6ff', color: '#1e40af' };
        if (badge === 'award-winner') return { bg: '#fef9c3', color: '#713f12' };
        return { bg: '#fbbf24', color: '#451a03' }; /* recommended / default */
    }

    /* ── ES5 update helpers ──────────────────────────── */
    function updateList(list, idx, val) {
        return list.map(function (item, i) { return i === idx ? val : item; });
    }
    function removeItem(list, idx) { return list.filter(function (_, i) { return i !== idx; }); }
    function addItem(list) { return list.concat(['New item']); }

    /* score fill percentage for progress-bar style */
    function scoreFill(score, max) { return Math.min(100, Math.max(0, (score / max) * 100)); }

    registerBlockType('blockenberg/verdict-box', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var s = getTypoCssVars(a);
                return { className: 'bkbg-vb-editor', style: s };
            })());

            function renderScore() {
                var pct = scoreFill(a.overallScore, a.scoreMax);
                if (a.scoreDisplay === 'circle') {
                    return el('div', {
                        className: 'bkbg-vb-score-circle',
                        style: {
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: a.scoreCircleBg, color: a.scoreCircleColor,
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0
                        }
                    },
                        el('span', { style: { fontSize: '26px', fontWeight: 800, lineHeight: 1 } }, a.overallScore.toFixed(1)),
                        el('span', { style: { fontSize: '11px', opacity: '.8' } }, '/' + a.scoreMax)
                    );
                }
                if (a.scoreDisplay === 'bar') {
                    return el('div', { style: { minWidth: '120px', flexShrink: 0 } },
                        el('div', { style: { fontSize: '28px', fontWeight: 800, color: a.scoreCircleBg, lineHeight: 1 } }, a.overallScore.toFixed(1)),
                        el('div', { style: { fontSize: '11px', color: a.headerColor, opacity: '.7', marginBottom: '6px' } }, '/ ' + a.scoreMax),
                        el('div', { style: { height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,.25)', overflow: 'hidden' } },
                            el('div', { style: { height: '100%', width: pct + '%', background: a.scoreCircleBg, borderRadius: '3px' } })
                        )
                    );
                }
                /* numeric only */
                return el('div', { style: { flexShrink: 0 } },
                    el('span', { style: { fontSize: '36px', fontWeight: 900, color: a.scoreCircleBg, lineHeight: 1 } }, a.overallScore.toFixed(1)),
                    el('span', { style: { fontSize: '18px', color: a.headerColor, opacity: '.7' } }, '/' + a.scoreMax)
                );
            }

            function renderPreview() {
                var bCol = a.badge !== 'none' ? badgeColors(a.badge) : null;
                return el('div', {
                    className: 'bkbg-vb-block',
                    style: {
                        background: a.bgColor,
                        border: '1px solid ' + a.borderColor,
                        borderRadius: a.borderRadius + 'px',
                        overflow: 'hidden', boxSizing: 'border-box'
                    }
                },
                    /* Header */
                    el('div', {
                        className: 'bkbg-vb-header',
                        style: {
                            background: a.headerBg, color: a.headerColor,
                            padding: '20px 24px', display: 'flex',
                            alignItems: 'center', gap: '20px', flexWrap: 'wrap'
                        }
                    },
                        renderScore(),
                        el('div', { style: { flex: 1 } },
                            el('h3', { className: 'bkbg-vb-product-name', style: { color: a.headerColor } }, a.productName),
                            a.showTagline && a.productTagline && el('div', { style: { fontSize: '13px', opacity: '.75', marginBottom: '8px' } }, a.productTagline),
                            a.badge !== 'none' && bCol && el('span', {
                                style: {
                                    display: 'inline-block', padding: '4px 12px', borderRadius: '100px',
                                    fontSize: '12px', fontWeight: 700, background: bCol.bg, color: bCol.color
                                }
                            }, badgeLabel(a.badge))
                        ),
                        el('div', {
                            style: { textAlign: 'right', flexShrink: 0 }
                        },
                            el('div', { style: { fontSize: '11px', opacity: '.6', textTransform: 'uppercase', letterSpacing: '.08em' } }, a.scoreLabel)
                        )
                    ),
                    /* Pros & Cons */
                    el('div', {
                        className: 'bkbg-vb-proscons',
                        style: { display: 'flex', flexWrap: 'wrap', gap: a.layout === 'split' ? '0' : '0' }
                    },
                        /* Pros */
                        el('div', {
                            className: 'bkbg-vb-pros',
                            style: {
                                flex: 1, minWidth: '220px',
                                background: a.prosBg,
                                borderRight: '1px solid ' + a.borderColor,
                                padding: '18px 22px'
                            }
                        },
                            el('div', { style: { fontWeight: 700, fontSize: '14px', color: a.prosColor, marginBottom: '12px' } }, a.prosLabel),
                            el('ul', { style: { margin: 0, padding: 0, listStyle: 'none' } },
                                a.pros.map(function (pro, idx) {
                                    return el('li', {
                                        key: idx,
                                        style: { display: 'flex', gap: '8px', marginBottom: '8px', color: a.prosColor, alignItems: 'flex-start' }
                                    },
                                        el('span', { style: { color: a.prosIconColor, flexShrink: 0, marginTop: '1px' } }, '✓'),
                                        el('span', { style: { lineHeight: 1.5 } }, pro)
                                    );
                                })
                            )
                        ),
                        /* Cons */
                        el('div', {
                            className: 'bkbg-vb-cons',
                            style: {
                                flex: 1, minWidth: '220px',
                                background: a.consBg,
                                padding: '18px 22px'
                            }
                        },
                            el('div', { style: { fontWeight: 700, fontSize: '14px', color: a.consColor, marginBottom: '12px' } }, a.consLabel),
                            el('ul', { style: { margin: 0, padding: 0, listStyle: 'none' } },
                                a.cons.map(function (con, idx) {
                                    return el('li', {
                                        key: idx,
                                        style: { display: 'flex', gap: '8px', marginBottom: '8px', color: a.consColor, alignItems: 'flex-start' }
                                    },
                                        el('span', { style: { color: a.consIconColor, flexShrink: 0, marginTop: '1px' } }, '✗'),
                                        el('span', { style: { lineHeight: 1.5 } }, con)
                                    );
                                })
                            )
                        )
                    ),
                    /* Verdict */
                    a.showVerdict && a.verdictText && el('div', {
                        className: 'bkbg-vb-verdict',
                        style: {
                            background: a.verdictBg, borderTop: '1px solid ' + a.verdictBorderColor,
                            padding: '16px 24px', display: 'flex', gap: '12px', alignItems: 'flex-start'
                        }
                    },
                        el('span', { style: { fontSize: '18px', flexShrink: 0 } }, '💬'),
                        el('p', { style: { margin: 0, color: a.verdictColor, lineHeight: 1.65 } }, a.verdictText)
                    ),
                    /* CTAs */
                    (a.showCta || a.showSecondaryCta) && el('div', {
                        className: 'bkbg-vb-ctas',
                        style: { padding: '16px 24px', borderTop: '1px solid ' + a.borderColor, display: 'flex', gap: '12px', flexWrap: 'wrap' }
                    },
                        a.showCta && a.ctaText && el('a', {
                            href: a.ctaUrl || '#', target: '_blank',
                            className: 'bkbg-vb-cta-primary',
                            style: {
                                display: 'inline-block', padding: '12px 24px',
                                background: a.ctaBg, color: a.ctaColor,
                                borderRadius: (a.borderRadius - 4) + 'px',
                                fontWeight: 700, fontSize: '15px',
                                textDecoration: 'none'
                            }
                        }, a.ctaText),
                        a.showSecondaryCta && a.ctaSecondaryText && el('a', {
                            href: a.ctaSecondaryUrl || '#', target: '_blank',
                            className: 'bkbg-vb-cta-secondary',
                            style: {
                                display: 'inline-block', padding: '12px 24px',
                                border: '2px solid ' + a.ctaSecondaryColor,
                                color: a.ctaSecondaryColor,
                                borderRadius: (a.borderRadius - 4) + 'px',
                                fontWeight: 700, fontSize: '15px',
                                textDecoration: 'none', background: 'transparent'
                            }
                        }, a.ctaSecondaryText)
                    )
                );
            }

            var inspector = el(InspectorControls, {},
                /* Product Info */
                el(PanelBody, { title: 'Product Info', initialOpen: true },
                    el(TextControl, { __nextHasNoMarginBottom: true, label: 'Product Name', value: a.productName, onChange: function (v) { set({ productName: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Tagline', checked: a.showTagline, onChange: function (v) { set({ showTagline: v }); } }),
                    a.showTagline && el(TextControl, { __nextHasNoMarginBottom: true, label: 'Tagline', value: a.productTagline, onChange: function (v) { set({ productTagline: v }); } }),
                    el('div', { style: { marginBottom: 8, fontWeight: 600, fontSize: 12 } }, 'Score'),
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Overall Score', value: a.overallScore, min: 0, max: a.scoreMax, step: 0.1, onChange: function (v) { set({ overallScore: v }); } }),
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Score Max', value: a.scoreMax, min: 5, max: 100, onChange: function (v) { set({ scoreMax: v }); } }),
                    el(TextControl, { __nextHasNoMarginBottom: true, label: 'Score Label', value: a.scoreLabel, onChange: function (v) { set({ scoreLabel: v }); } }),
                    el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Score Display', value: a.scoreDisplay, options: [{ label: 'Circle', value: 'circle' }, { label: 'Progress Bar', value: 'bar' }, { label: 'Numeric Only', value: 'numeric' }], onChange: function (v) { set({ scoreDisplay: v }); } }),
                    el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Verdict Badge', value: a.badge, options: BADGE_OPTIONS, onChange: function (v) { set({ badge: v }); } })
                ),
                /* Pros */
                el(PanelBody, { title: 'Pros (' + a.pros.length + ')', initialOpen: true },
                    el(TextControl, { __nextHasNoMarginBottom: true, label: 'Pros Label', value: a.prosLabel, onChange: function (v) { set({ prosLabel: v }); } }),
                    a.pros.map(function (pro, idx) {
                        return el('div', {
                            key: idx,
                            style: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }
                        },
                            el('input', {
                                type: 'text', value: pro,
                                style: { flex: 1, fontSize: 12, padding: '5px 7px', border: '1px solid #ddd', borderRadius: 4 },
                                onChange: function (e) { set({ pros: updateList(a.pros, idx, e.target.value) }); }
                            }),
                            el(Button, { isSmall: true, isDestructive: true, onClick: function () { set({ pros: removeItem(a.pros, idx) }); } }, '✕')
                        );
                    }),
                    el(Button, { variant: 'secondary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ pros: addItem(a.pros) }); } }, '+ Add Pro')
                ),
                /* Cons */
                el(PanelBody, { title: 'Cons (' + a.cons.length + ')', initialOpen: true },
                    el(TextControl, { __nextHasNoMarginBottom: true, label: 'Cons Label', value: a.consLabel, onChange: function (v) { set({ consLabel: v }); } }),
                    a.cons.map(function (con, idx) {
                        return el('div', {
                            key: idx,
                            style: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }
                        },
                            el('input', {
                                type: 'text', value: con,
                                style: { flex: 1, fontSize: 12, padding: '5px 7px', border: '1px solid #ddd', borderRadius: 4 },
                                onChange: function (e) { set({ cons: updateList(a.cons, idx, e.target.value) }); }
                            }),
                            el(Button, { isSmall: true, isDestructive: true, onClick: function () { set({ cons: removeItem(a.cons, idx) }); } }, '✕')
                        );
                    }),
                    el(Button, { variant: 'secondary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ cons: addItem(a.cons) }); } }, '+ Add Con')
                ),
                /* Verdict & CTAs */
                el(PanelBody, { title: 'Verdict & CTAs', initialOpen: false },
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Verdict Text', checked: a.showVerdict, onChange: function (v) { set({ showVerdict: v }); } }),
                    a.showVerdict && el('div', { style: { marginBottom: 8 } },
                        el('label', { style: { fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 } }, 'Verdict Text'),
                        el('textarea', {
                            value: a.verdictText, rows: 4,
                            style: { width: '100%', fontSize: 12, padding: '5px 7px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box', fontFamily: 'inherit' },
                            onChange: function (e) { set({ verdictText: e.target.value }); }
                        })
                    ),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Primary CTA', checked: a.showCta, onChange: function (v) { set({ showCta: v }); } }),
                    a.showCta && el(TextControl, { __nextHasNoMarginBottom: true, label: 'CTA Text', value: a.ctaText, onChange: function (v) { set({ ctaText: v }); } }),
                    a.showCta && el(TextControl, { __nextHasNoMarginBottom: true, label: 'CTA URL', value: a.ctaUrl, onChange: function (v) { set({ ctaUrl: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Secondary CTA', checked: a.showSecondaryCta, onChange: function (v) { set({ showSecondaryCta: v }); } }),
                    a.showSecondaryCta && el(TextControl, { __nextHasNoMarginBottom: true, label: 'Secondary CTA Text', value: a.ctaSecondaryText, onChange: function (v) { set({ ctaSecondaryText: v }); } }),
                    a.showSecondaryCta && el(TextControl, { __nextHasNoMarginBottom: true, label: 'Secondary CTA URL', value: a.ctaSecondaryUrl, onChange: function (v) { set({ ctaSecondaryUrl: v }); } })
                ),
                /* Display */
                el(PanelBody, { title: 'Display', initialOpen: false },
                    el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Layout', value: a.layout, options: [{ label: 'Split (side by side)', value: 'split' }, { label: 'Stacked', value: 'stacked' }], onChange: function (v) { set({ layout: v }); } }),
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Border Radius', value: a.borderRadius, min: 0, max: 24, onChange: function (v) { set({ borderRadius: v }); } })
                ),
                /* Colors */
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl(__('Product Name', 'blockenberg'), 'nameTypo', a, set),
                    getTypoControl(__('Body Text', 'blockenberg'), 'bodyTypo', a, set),
                    getTypoControl(__('Tagline', 'blockenberg'), 'taglineTypo', a, set),
                    getTypoControl(__('Score', 'blockenberg'), 'scoreTypo', a, set),
                    getTypoControl(__('Pros/Cons Label', 'blockenberg'), 'prosConsLabelTypo', a, set),
                    getTypoControl(__('CTA Button', 'blockenberg'), 'ctaTypo', a, set)
                ),
el(PanelColorSettings, {
                    title: 'Header & Score Colors', initialOpen: false,
                    colorSettings: [
                        { label: 'Header Background', value: a.headerBg, onChange: function (v) { set({ headerBg: v || '#0f172a' }); } },
                        { label: 'Header Text', value: a.headerColor, onChange: function (v) { set({ headerColor: v || '#ffffff' }); } },
                        { label: 'Score Circle Background', value: a.scoreCircleBg, onChange: function (v) { set({ scoreCircleBg: v || '#6366f1' }); } },
                        { label: 'Score Circle Text', value: a.scoreCircleColor, onChange: function (v) { set({ scoreCircleColor: v || '#ffffff' }); } },
                        { label: 'Block Background', value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                        { label: 'Border Color', value: a.borderColor, onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); } }
                    ]
                }),
                el(PanelColorSettings, {
                    title: 'Pros & Cons Colors', initialOpen: false,
                    colorSettings: [
                        { label: 'Pros Background', value: a.prosBg, onChange: function (v) { set({ prosBg: v || '#f0fdf4' }); } },
                        { label: 'Pros Text Color', value: a.prosColor, onChange: function (v) { set({ prosColor: v || '#14532d' }); } },
                        { label: 'Pros Icon Color', value: a.prosIconColor, onChange: function (v) { set({ prosIconColor: v || '#22c55e' }); } },
                        { label: 'Cons Background', value: a.consBg, onChange: function (v) { set({ consBg: v || '#fef2f2' }); } },
                        { label: 'Cons Text Color', value: a.consColor, onChange: function (v) { set({ consColor: v || '#7f1d1d' }); } },
                        { label: 'Cons Icon Color', value: a.consIconColor, onChange: function (v) { set({ consIconColor: v || '#ef4444' }); } }
                    ]
                }),
                el(PanelColorSettings, {
                    title: 'Verdict & CTA Colors', initialOpen: false,
                    colorSettings: [
                        { label: 'Verdict Background', value: a.verdictBg, onChange: function (v) { set({ verdictBg: v || '#f8fafc' }); } },
                        { label: 'Verdict Text Color', value: a.verdictColor, onChange: function (v) { set({ verdictColor: v || '#374151' }); } },
                        { label: 'CTA Background', value: a.ctaBg, onChange: function (v) { set({ ctaBg: v || '#6366f1' }); } },
                        { label: 'CTA Text Color', value: a.ctaColor, onChange: function (v) { set({ ctaColor: v || '#ffffff' }); } },
                        { label: 'Secondary CTA Color', value: a.ctaSecondaryColor, onChange: function (v) { set({ ctaSecondaryColor: v || '#6366f1' }); } }
                    ]
                })
            );

            return el(Fragment, {}, inspector, el('div', blockProps, renderPreview()));
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save((function () { var _tv = getTypoCssVars(a); return { style: _tv }; })());
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-verdict-box-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
