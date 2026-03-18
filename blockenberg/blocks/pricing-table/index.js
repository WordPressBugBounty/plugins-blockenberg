( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var Button = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function buildTypoVars(a) {
        var fn = getTypoCssVars();
        if (!fn) return {};
        var v = {};
        Object.assign(v, fn(a.nameTypo || {}, '--bkbg-pt-nm-'));
        Object.assign(v, fn(a.descTypo || {}, '--bkbg-pt-ds-'));
        Object.assign(v, fn(a.priceTypo || {}, '--bkbg-pt-pr-'));
        Object.assign(v, fn(a.featureTypo || {}, '--bkbg-pt-ft-'));
        Object.assign(v, fn(a.btnTypo || {}, '--bkbg-pt-bt-'));
        return v;
    }

    // ── CSS vars ──────────────────────────────────────────────────────────────
    function buildWrapStyle(a) {
        var shadow = a.cardStyle === 'shadow' ? '0 8px 32px rgba(0,0,0,0.10)' :
                     a.cardStyle === 'shadow-lg' ? '0 20px 60px rgba(0,0,0,0.16)' :
                     a.cardStyle === 'flat' ? 'none' : 'none';
        return {
            '--bkbg-pt-accent'            : a.accentColor,
            '--bkbg-pt-accent2'           : a.accentColorSecondary,
            '--bkbg-pt-card-bg'           : a.cardBg,
            '--bkbg-pt-card-border-color' : a.cardBorderColor,
            '--bkbg-pt-card-border-w'     : a.cardBorderWidth + 'px',
            '--bkbg-pt-card-radius'       : a.cardBorderRadius + 'px',
            '--bkbg-pt-card-pad'          : a.cardPaddingTop + 'px ' + a.cardPaddingRight + 'px ' + a.cardPaddingBottom + 'px ' + a.cardPaddingLeft + 'px',
            '--bkbg-pt-card-shadow'       : shadow,
            '--bkbg-pt-plan-name-color'   : a.planNameColor,
            '--bkbg-pt-desc-color'        : a.descriptionColor,
            '--bkbg-pt-price-color'       : a.priceColor,
            '--bkbg-pt-currency-size'     : a.currencySize + 'px',
            '--bkbg-pt-period-size'       : a.periodSize + 'px',
            '--bkbg-pt-period-color'      : a.periodColor,
            '--bkbg-pt-subtext-size'      : a.priceSubtextSize + 'px',
            '--bkbg-pt-subtext-color'     : a.priceSubtextColor,
            '--bkbg-pt-feature-color'     : a.featureColor,
            '--bkbg-pt-feature-excl-color': a.featureExcludedColor,
            '--bkbg-pt-feature-incl-icon-color': a.featureIncludedIconColor,
            '--bkbg-pt-feature-excl-icon-color': a.featureExcludedIconColor,
            '--bkbg-pt-feature-gap'       : a.featureGap + 'px',
            '--bkbg-pt-btn-bg'            : a.btnBg,
            '--bkbg-pt-btn-color'         : a.btnColor,
            '--bkbg-pt-btn-bg-hover'      : a.btnBgHover,
            '--bkbg-pt-btn-color-hover'   : a.btnColorHover,
            '--bkbg-pt-btn-border-color'  : a.btnBorderColor,
            '--bkbg-pt-btn-border-w'      : a.btnBorderWidth + 'px',
            '--bkbg-pt-btn-radius'        : a.btnBorderRadius + 'px',
            '--bkbg-pt-btn-pad-v'         : a.btnPaddingV + 'px',
            '--bkbg-pt-badge-bg'          : a.badgeBg,
            '--bkbg-pt-badge-color'       : a.badgeColor,
            '--bkbg-pt-badge-size'        : a.badgeSize + 'px',
            '--bkbg-pt-badge-radius'      : a.badgeBorderRadius + 'px',
            '--bkbg-pt-header-bg'         : a.headerBg,
            '--bkbg-pt-section-gap'       : a.sectionGap + 'px'
        };
    }

    // ── Color swatch ──────────────────────────────────────────────────────────
    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', {
                    type: 'button',
                    title: value || 'none',
                    onClick: function () { setOpenKey(isOpen ? null : key); },
                    style: {
                        width: '28px', height: '28px', borderRadius: '4px',
                        border: isOpen ? '2px solid #007cba' : '2px solid #ddd',
                        cursor: 'pointer', padding: 0, display: 'block',
                        background: value || '#fff'
                    }
                }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    function updateFeature(features, index, field, value, setAttributes) {
        var newFeatures = features.map(function (f, i) {
            if (i !== index) return f;
            var updated = {};
            for (var k in f) { updated[k] = f[k]; }
            updated[field] = value;
            return updated;
        });
        setAttributes({ features: newFeatures });
    }

    // ── Register ──────────────────────────────────────────────────────────────
    registerBlockType('blockenberg/pricing-table', {
        title: __('Pricing Table', 'blockenberg'),
        icon: 'products',
        category: 'bkbg-marketing',
        description: __('Pricing card with plan name, price, features list, and CTA button.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function addFeature() {
                setAttributes({
                    features: a.features.concat([{ text: __('New feature', 'blockenberg'), included: true, icon: 'dashicons-yes-alt' }])
                });
            }

            function removeFeature(i) {
                setAttributes({ features: a.features.filter(function (_, idx) { return idx !== i; }) });
            }

            function moveFeature(i, dir) {
                var ni = i + dir;
                if (ni < 0 || ni >= a.features.length) return;
                var arr = a.features.slice();
                var tmp = arr[i]; arr[i] = arr[ni]; arr[ni] = tmp;
                setAttributes({ features: arr });
            }

            var cardClass = 'bkbg-pt-card bkbg-pt-style-' + a.cardStyle + (a.isPopular ? ' is-popular' : '') + ' bkbg-pt-header-' + a.headerStyle;
            var blockProps = useBlockProps({ className: cardClass, style: Object.assign({}, buildWrapStyle(a), buildTypoVars(a)) });

            // ── Inspector ─────────────────────────────────────────────────────
            var inspector = el(InspectorControls, {},
                // Plan Info
                el(PanelBody, { title: __('Plan Info', 'blockenberg'), initialOpen: true },
                    el(TextControl, {
                        label: __('Plan Name', 'blockenberg'), value: a.planName,
                        onChange: function (v) { setAttributes({ planName: v }); }
                    }),
                    el(TextControl, {
                        label: __('Description', 'blockenberg'), value: a.planDescription,
                        onChange: function (v) { setAttributes({ planDescription: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Description', 'blockenberg'), checked: a.showDescription,
                        onChange: function (v) { setAttributes({ showDescription: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Mark as Popular', 'blockenberg'), checked: a.isPopular,
                        onChange: function (v) { setAttributes({ isPopular: v }); }
                    }),
                    a.isPopular && el(TextControl, {
                        label: __('Popular Badge Label', 'blockenberg'), value: a.popularLabel,
                        onChange: function (v) { setAttributes({ popularLabel: v }); }
                    })
                ),

                // Pricing
                el(PanelBody, { title: __('Price', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Currency Symbol', 'blockenberg'), value: a.currency,
                        onChange: function (v) { setAttributes({ currency: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Currency Position', 'blockenberg'), value: a.currencyPosition,
                        options: [{ label: __('Before', 'blockenberg'), value: 'before' }, { label: __('After', 'blockenberg'), value: 'after' }],
                        onChange: function (v) { setAttributes({ currencyPosition: v }); }
                    }),
                    el(TextControl, {
                        label: __('Price', 'blockenberg'), value: a.price,
                        onChange: function (v) { setAttributes({ price: v }); }
                    }),
                    el(TextControl, {
                        label: __('Period (e.g. /month)', 'blockenberg'), value: a.pricePeriod,
                        onChange: function (v) { setAttributes({ pricePeriod: v }); }
                    }),
                    el(TextControl, {
                        label: __('Price Subtext', 'blockenberg'), value: a.priceSubtext,
                        onChange: function (v) { setAttributes({ priceSubtext: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Price Subtext', 'blockenberg'), checked: a.showPriceSubtext,
                        onChange: function (v) { setAttributes({ showPriceSubtext: v }); }
                    })
                ),

                // Features
                el(PanelBody, { title: __('Features', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Feature List Style', 'blockenberg'), value: a.featureListStyle,
                        options: [
                            { label: __('Icons', 'blockenberg'), value: 'icon' },
                            { label: __('Bullet', 'blockenberg'), value: 'bullet' },
                            { label: __('Checkmark (CSS)', 'blockenberg'), value: 'check' },
                            { label: __('None', 'blockenberg'), value: 'none' }
                        ],
                        onChange: function (v) { setAttributes({ featureListStyle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Divider between Features and Button', 'blockenberg'), checked: a.showFeatureDivider,
                        onChange: function (v) { setAttributes({ showFeatureDivider: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap Between Features (px)', 'blockenberg'), value: a.featureGap, min: 4, max: 32,
                        onChange: function (v) { setAttributes({ featureGap: v }); }
                    }),
                    a.features.map(function (feat, i) {
                        return el('div', {
                            key: i,
                            style: { border: '1px solid #e0e0e0', borderRadius: '6px', padding: '10px', marginBottom: '8px', background: '#fafafa' }
                        },
                            el('div', { style: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' } },
                                el('span', { style: { fontSize: '11px', fontWeight: '600', flex: 1, color: feat.included ? '#15803d' : '#94a3b8' } },
                                    (i + 1) + '. ' + (feat.included ? __('Included', 'blockenberg') : __('Excluded', 'blockenberg'))
                                ),
                                el(Button, { isSmall: true, variant: 'tertiary', onClick: function () { moveFeature(i, -1); }, disabled: i === 0 }, '↑'),
                                el(Button, { isSmall: true, variant: 'tertiary', onClick: function () { moveFeature(i, 1); }, disabled: i === a.features.length - 1 }, '↓'),
                                el(Button, { isSmall: true, isDestructive: true, variant: 'tertiary', onClick: function () { removeFeature(i); } }, '✕')
                            ),
                            el(TextControl, {
                                label: __('Feature Text', 'blockenberg'), value: feat.text,
                                onChange: function (v) { updateFeature(a.features, i, 'text', v, setAttributes); }
                            }),
                            el(ToggleControl, {
                                label: __('Included', 'blockenberg'), checked: feat.included,
                                onChange: function (v) {
                                    updateFeature(a.features, i, 'included', v, setAttributes);
                                    updateFeature(a.features, i, 'icon', v ? 'dashicons-yes-alt' : 'dashicons-no-alt', setAttributes);
                                }
                            })
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: addFeature, style: { width: '100%', justifyContent: 'center' } },
                        '+ ' + __('Add Feature', 'blockenberg')
                    )
                ),

                // Button
                el(PanelBody, { title: __('Button', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Button Text', 'blockenberg'), value: a.buttonText,
                        onChange: function (v) { setAttributes({ buttonText: v }); }
                    }),
                    el(TextControl, {
                        label: __('Button URL', 'blockenberg'), value: a.buttonUrl,
                        onChange: function (v) { setAttributes({ buttonUrl: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Open in New Tab', 'blockenberg'), checked: a.buttonTarget,
                        onChange: function (v) { setAttributes({ buttonTarget: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Button Width', 'blockenberg'), value: a.btnWidth,
                        options: [
                            { label: __('Full Width', 'blockenberg'), value: 'full' },
                            { label: __('Auto', 'blockenberg'), value: 'auto' }
                        ],
                        onChange: function (v) { setAttributes({ btnWidth: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Vertical Padding (px)', 'blockenberg'), value: a.btnPaddingV, min: 8, max: 32,
                        onChange: function (v) { setAttributes({ btnPaddingV: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Width (px)', 'blockenberg'), value: a.btnBorderWidth, min: 0, max: 6,
                        onChange: function (v) { setAttributes({ btnBorderWidth: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'), value: a.btnBorderRadius, min: 0, max: 60,
                        onChange: function (v) { setAttributes({ btnBorderRadius: v }); }
                    }),
                    cc('btnBg', __('Button Background', 'blockenberg'), 'btnBg'),
                    cc('btnColor', __('Button Text Color', 'blockenberg'), 'btnColor'),
                    cc('btnBgHover', __('Button Hover Background', 'blockenberg'), 'btnBgHover'),
                    cc('btnColorHover', __('Button Hover Text Color', 'blockenberg'), 'btnColorHover'),
                    cc('btnBorderColor', __('Button Border Color', 'blockenberg'), 'btnBorderColor')
                ),

                // Card design
                el(PanelBody, { title: __('Card Design', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Card Style', 'blockenberg'), value: a.cardStyle,
                        options: [
                            { label: __('Shadow', 'blockenberg'), value: 'shadow' },
                            { label: __('Large Shadow', 'blockenberg'), value: 'shadow-lg' },
                            { label: __('Flat + Border', 'blockenberg'), value: 'flat' },
                            { label: __('Gradient Header', 'blockenberg'), value: 'gradient' },
                            { label: __('Colored Header', 'blockenberg'), value: 'colored-header' }
                        ],
                        onChange: function (v) { setAttributes({ cardStyle: v }); }
                    }),
                    (a.cardStyle === 'colored-header' || a.cardStyle === 'gradient') && el(SelectControl, {
                        label: __('Header Style', 'blockenberg'), value: a.headerStyle,
                        options: [
                            { label: __('Accent Color', 'blockenberg'), value: 'accent' },
                            { label: __('Dark', 'blockenberg'), value: 'dark' },
                            { label: __('Light', 'blockenberg'), value: 'light' }
                        ],
                        onChange: function (v) { setAttributes({ headerStyle: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'), value: a.cardBorderRadius, min: 0, max: 40,
                        onChange: function (v) { setAttributes({ cardBorderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Width (px)', 'blockenberg'), value: a.cardBorderWidth, min: 0, max: 6,
                        onChange: function (v) { setAttributes({ cardBorderWidth: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Section Gap (px)', 'blockenberg'), value: a.sectionGap, min: 8, max: 60,
                        onChange: function (v) { setAttributes({ sectionGap: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'), value: a.cardPaddingTop, min: 0, max: 80,
                        onChange: function (v) { setAttributes({ cardPaddingTop: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding Right (px)', 'blockenberg'), value: a.cardPaddingRight, min: 0, max: 80,
                        onChange: function (v) { setAttributes({ cardPaddingRight: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'), value: a.cardPaddingBottom, min: 0, max: 80,
                        onChange: function (v) { setAttributes({ cardPaddingBottom: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding Left (px)', 'blockenberg'), value: a.cardPaddingLeft, min: 0, max: 80,
                        onChange: function (v) { setAttributes({ cardPaddingLeft: v }); }
                    }),
                    cc('accentColor', __('Accent Color', 'blockenberg'), 'accentColor'),
                    cc('accentColorSecondary', __('Accent Color 2 (gradient end)', 'blockenberg'), 'accentColorSecondary'),
                    cc('cardBg', __('Card Background', 'blockenberg'), 'cardBg'),
                    cc('cardBorderColor', __('Card Border Color', 'blockenberg'), 'cardBorderColor'),
                    cc('headerBg', __('Header Background', 'blockenberg'), 'headerBg')
                ),

                // Typography
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    (function () {
                        var TC = getTypoControl();
                        if (!TC) return el('p', null, 'Loading\u2026');
                        return el(Fragment, null,
                            el(TC, { label: 'Plan Name', value: a.nameTypo, onChange: function (v) { setAttributes({ nameTypo: v }); } }),
                            el(TC, { label: 'Description', value: a.descTypo, onChange: function (v) { setAttributes({ descTypo: v }); } }),
                            el(TC, { label: 'Price', value: a.priceTypo, onChange: function (v) { setAttributes({ priceTypo: v }); } }),
                            el(TC, { label: 'Feature', value: a.featureTypo, onChange: function (v) { setAttributes({ featureTypo: v }); } }),
                            el(TC, { label: 'Button', value: a.btnTypo, onChange: function (v) { setAttributes({ btnTypo: v }); } })
                        );
                    })(),
                    el(RangeControl, { label: __('Currency Size (px)', 'blockenberg'), value: a.currencySize, min: 12, max: 48, onChange: function (v) { setAttributes({ currencySize: v }); } }),
                    el(RangeControl, { label: __('Period Size (px)', 'blockenberg'), value: a.periodSize, min: 11, max: 24, onChange: function (v) { setAttributes({ periodSize: v }); } }),
                    el(RangeControl, { label: __('Subtext Size (px)', 'blockenberg'), value: a.priceSubtextSize, min: 10, max: 18, onChange: function (v) { setAttributes({ priceSubtextSize: v }); } }),
                    el(RangeControl, { label: __('Badge Size (px)', 'blockenberg'), value: a.badgeSize, min: 10, max: 18, onChange: function (v) { setAttributes({ badgeSize: v }); } }),
                    cc('planNameColor', __('Plan Name Color', 'blockenberg'), 'planNameColor'),
                    cc('descriptionColor', __('Description Color', 'blockenberg'), 'descriptionColor'),
                    cc('priceColor', __('Price Color', 'blockenberg'), 'priceColor'),
                    cc('periodColor', __('Period Color', 'blockenberg'), 'periodColor'),
                    cc('priceSubtextColor', __('Subtext Color', 'blockenberg'), 'priceSubtextColor'),
                    cc('featureColor', __('Feature (included) Color', 'blockenberg'), 'featureColor'),
                    cc('featureExcludedColor', __('Feature (excluded) Color', 'blockenberg'), 'featureExcludedColor'),
                    cc('featureIncludedIconColor', __('Included Icon Color', 'blockenberg'), 'featureIncludedIconColor'),
                    cc('featureExcludedIconColor', __('Excluded Icon Color', 'blockenberg'), 'featureExcludedIconColor')
                ),

                // Badge
                el(PanelBody, { title: __('Popular Badge', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: a.badgeBorderRadius, min: 0, max: 50, onChange: function (v) { setAttributes({ badgeBorderRadius: v }); } }),
                    cc('badgeBg', __('Badge Background', 'blockenberg'), 'badgeBg'),
                    cc('badgeColor', __('Badge Text Color', 'blockenberg'), 'badgeColor')
                )
            );

            // ── Preview render ─────────────────────────────────────────────────
            function renderFeatureIcon(feat) {
                if (a.featureListStyle === 'none') return null;
                if (a.featureListStyle === 'bullet') return el('span', { className: 'bkbg-pt-feat-bullet' });
                if (a.featureListStyle === 'check') return el('span', { className: 'bkbg-pt-feat-check' + (feat.included ? ' is-included' : ' is-excluded') });
                // dashicons
                var icon = feat.included ? 'dashicons-yes-alt' : 'dashicons-no-alt';
                return el('span', { className: 'dashicons ' + icon + ' bkbg-pt-feat-icon' + (feat.included ? ' is-included' : ' is-excluded') });
            }

            function renderPriceArea() {
                var currencyEl = el('span', { className: 'bkbg-pt-currency' }, a.currency);
                var priceEl = el('span', { className: 'bkbg-pt-price-amount' }, a.price);
                var periodEl = el('span', { className: 'bkbg-pt-period' }, a.pricePeriod);
                return el('div', { className: 'bkbg-pt-price-row' },
                    el('div', { className: 'bkbg-pt-price-main' },
                        a.currencyPosition === 'before' ? el(Fragment, {}, currencyEl, priceEl) : el(Fragment, {}, priceEl, currencyEl),
                        periodEl
                    ),
                    a.showPriceSubtext && a.priceSubtext && el('div', { className: 'bkbg-pt-subtext' }, a.priceSubtext)
                );
            }

            var headerChildren = [
                a.isPopular && el('div', { key: 'badge', className: 'bkbg-pt-badge' }, a.popularLabel),
                el(RichText, {
                    key: 'name', tagName: 'div', className: 'bkbg-pt-plan-name',
                    value: a.planName, onChange: function (v) { setAttributes({ planName: v }); }
                }),
                a.showDescription && el(RichText, {
                    key: 'desc', tagName: 'div', className: 'bkbg-pt-description',
                    value: a.planDescription, onChange: function (v) { setAttributes({ planDescription: v }); },
                    placeholder: __('Plan description…', 'blockenberg')
                })
            ];

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-pt-header' }, headerChildren),
                    el('div', { className: 'bkbg-pt-pricing' }, renderPriceArea()),
                    el('ul', { className: 'bkbg-pt-features bkbg-pt-feat-style-' + a.featureListStyle },
                        a.features.map(function (feat, i) {
                            return el('li', { key: i, className: 'bkbg-pt-feat-item' + (feat.included ? ' is-included' : ' is-excluded') },
                                renderFeatureIcon(feat),
                                el('span', { className: 'bkbg-pt-feat-text' }, feat.text)
                            );
                        })
                    ),
                    a.showFeatureDivider && el('hr', { className: 'bkbg-pt-divider' }),
                    el('div', { className: 'bkbg-pt-cta' },
                        el('a', {
                            href: a.buttonUrl || '#',
                            className: 'bkbg-pt-btn bkbg-pt-btn-' + a.btnWidth,
                            onClick: function (e) { e.preventDefault(); }
                        }, a.buttonText)
                    )
                )
            );
        },

        // ── Save ─────────────────────────────────────────────────────────────
        save: function (props) {
            var a = props.attributes;
            var cardClass = 'bkbg-pt-card bkbg-pt-style-' + a.cardStyle + (a.isPopular ? ' is-popular' : '') + ' bkbg-pt-header-' + a.headerStyle;

            function saveFeatureIcon(feat) {
                if (a.featureListStyle === 'none') return null;
                if (a.featureListStyle === 'bullet') return el('span', { className: 'bkbg-pt-feat-bullet', 'aria-hidden': 'true' });
                if (a.featureListStyle === 'check') return el('span', { className: 'bkbg-pt-feat-check' + (feat.included ? ' is-included' : ' is-excluded'), 'aria-hidden': 'true' });
                var icon = feat.included ? 'dashicons-yes-alt' : 'dashicons-no-alt';
                return el('span', { className: 'dashicons ' + icon + ' bkbg-pt-feat-icon' + (feat.included ? ' is-included' : ' is-excluded'), 'aria-hidden': 'true' });
            }

            var currencyEl = el('span', { className: 'bkbg-pt-currency' }, a.currency);
            var priceEl = el('span', { className: 'bkbg-pt-price-amount' }, a.price);
            var periodEl = el('span', { className: 'bkbg-pt-period' }, a.pricePeriod);

            return el('div', wp.blockEditor.useBlockProps.save({ className: cardClass, style: Object.assign({}, buildWrapStyle(a), buildTypoVars(a)) }),
                el('div', { className: 'bkbg-pt-header' },
                    a.isPopular && el('div', { className: 'bkbg-pt-badge' }, a.popularLabel),
                    el(RichText.Content, { tagName: 'div', className: 'bkbg-pt-plan-name', value: a.planName }),
                    a.showDescription && el(RichText.Content, { tagName: 'div', className: 'bkbg-pt-description', value: a.planDescription })
                ),
                el('div', { className: 'bkbg-pt-pricing' },
                    el('div', { className: 'bkbg-pt-price-row' },
                        el('div', { className: 'bkbg-pt-price-main' },
                            a.currencyPosition === 'before' ? el(Fragment, {}, currencyEl, priceEl) : el(Fragment, {}, priceEl, currencyEl),
                            periodEl
                        ),
                        a.showPriceSubtext && a.priceSubtext && el('div', { className: 'bkbg-pt-subtext' }, a.priceSubtext)
                    )
                ),
                el('ul', { className: 'bkbg-pt-features bkbg-pt-feat-style-' + a.featureListStyle },
                    a.features.map(function (feat, i) {
                        return el('li', { key: i, className: 'bkbg-pt-feat-item' + (feat.included ? ' is-included' : ' is-excluded') },
                            saveFeatureIcon(feat),
                            el('span', { className: 'bkbg-pt-feat-text' }, feat.text)
                        );
                    })
                ),
                a.showFeatureDivider && el('hr', { className: 'bkbg-pt-divider' }),
                el('div', { className: 'bkbg-pt-cta' },
                    el('a', {
                        href: a.buttonUrl || '#',
                        className: 'bkbg-pt-btn bkbg-pt-btn-' + a.btnWidth,
                        target: a.buttonTarget ? '_blank' : undefined,
                        rel: a.buttonTarget ? 'noopener noreferrer' : undefined
                    }, a.buttonText)
                )
            );
        },

        deprecated: [{
            attributes: {
                planName: { type: "string", default: "Professional" },
                planDescription: { type: "string", default: "Perfect for growing teams and projects" },
                currency: { type: "string", default: "$" },
                currencyPosition: { type: "string", default: "before" },
                price: { type: "string", default: "49" },
                pricePeriod: { type: "string", default: "/month" },
                priceSubtext: { type: "string", default: "Billed annually" },
                features: { type: "array", default: [
                    { text: "Unlimited projects", included: true, icon: "dashicons-yes-alt" },
                    { text: "Advanced analytics", included: true, icon: "dashicons-yes-alt" },
                    { text: "Priority support", included: true, icon: "dashicons-yes-alt" },
                    { text: "Custom integrations", included: true, icon: "dashicons-yes-alt" },
                    { text: "White label exports", included: false, icon: "dashicons-no-alt" },
                    { text: "Dedicated manager", included: false, icon: "dashicons-no-alt" }
                ]},
                buttonText: { type: "string", default: "Get Started" },
                buttonUrl: { type: "string", default: "#" },
                buttonTarget: { type: "boolean", default: false },
                isPopular: { type: "boolean", default: true },
                popularLabel: { type: "string", default: "Most Popular" },
                cardStyle: { type: "string", default: "shadow" },
                layout: { type: "string", default: "vertical" },
                iconStyle: { type: "string", default: "dashicons" },
                showDescription: { type: "boolean", default: true },
                showPriceSubtext: { type: "boolean", default: true },
                showFeatureDivider: { type: "boolean", default: true },
                featureListStyle: { type: "string", default: "icon" },
                accentColor: { type: "string", default: "#2563eb" },
                accentColorSecondary: { type: "string", default: "#1e40af" },
                cardBg: { type: "string", default: "#ffffff" },
                cardBorderColor: { type: "string", default: "#e2e8f0" },
                cardBorderWidth: { type: "number", default: 2 },
                cardBorderRadius: { type: "number", default: 16 },
                cardPaddingTop: { type: "number", default: 36 },
                cardPaddingRight: { type: "number", default: 32 },
                cardPaddingBottom: { type: "number", default: 36 },
                cardPaddingLeft: { type: "number", default: 32 },
                planNameSize: { type: "number", default: 20 },
                planNameWeight: { type: "string", default: "700" },
                planNameColor: { type: "string", default: "#0f172a" },
                descriptionSize: { type: "number", default: 14 },
                descriptionColor: { type: "string", default: "#64748b" },
                priceSize: { type: "number", default: 52 },
                priceColor: { type: "string", default: "#0f172a" },
                currencySize: { type: "number", default: 24 },
                periodSize: { type: "number", default: 16 },
                periodColor: { type: "string", default: "#64748b" },
                priceSubtextSize: { type: "number", default: 13 },
                priceSubtextColor: { type: "string", default: "#94a3b8" },
                featureSize: { type: "number", default: 15 },
                featureColor: { type: "string", default: "#334155" },
                featureExcludedColor: { type: "string", default: "#94a3b8" },
                featureIncludedIconColor: { type: "string", default: "#22c55e" },
                featureExcludedIconColor: { type: "string", default: "#cbd5e1" },
                featureGap: { type: "number", default: 12 },
                btnBg: { type: "string", default: "#2563eb" },
                btnColor: { type: "string", default: "#ffffff" },
                btnBgHover: { type: "string", default: "#1d4ed8" },
                btnColorHover: { type: "string", default: "#ffffff" },
                btnBorderColor: { type: "string", default: "#2563eb" },
                btnBorderWidth: { type: "number", default: 2 },
                btnBorderRadius: { type: "number", default: 8 },
                btnFontSize: { type: "number", default: 16 },
                btnFontWeight: { type: "string", default: "600" },
                btnPaddingV: { type: "number", default: 14 },
                btnWidth: { type: "string", default: "full" },
                badgeBg: { type: "string", default: "#2563eb" },
                badgeColor: { type: "string", default: "#ffffff" },
                badgeSize: { type: "number", default: 12 },
                badgeBorderRadius: { type: "number", default: 50 },
                headerBg: { type: "string", default: "transparent" },
                headerStyle: { type: "string", default: "default" },
                sectionGap: { type: "number", default: 24 }
            },
            save: function (props) {
                var a = props.attributes;
                function oldBuildWrapStyle(a) {
                    var shadow = a.cardStyle === 'shadow' ? '0 8px 32px rgba(0,0,0,0.10)' :
                                 a.cardStyle === 'shadow-lg' ? '0 20px 60px rgba(0,0,0,0.16)' :
                                 a.cardStyle === 'flat' ? 'none' : 'none';
                    return {
                        '--bkbg-pt-accent': a.accentColor,
                        '--bkbg-pt-accent2': a.accentColorSecondary,
                        '--bkbg-pt-card-bg': a.cardBg,
                        '--bkbg-pt-card-border-color': a.cardBorderColor,
                        '--bkbg-pt-card-border-w': a.cardBorderWidth + 'px',
                        '--bkbg-pt-card-radius': a.cardBorderRadius + 'px',
                        '--bkbg-pt-card-pad': a.cardPaddingTop + 'px ' + a.cardPaddingRight + 'px ' + a.cardPaddingBottom + 'px ' + a.cardPaddingLeft + 'px',
                        '--bkbg-pt-card-shadow': shadow,
                        '--bkbg-pt-plan-name-size': a.planNameSize + 'px',
                        '--bkbg-pt-plan-name-weight': a.planNameWeight,
                        '--bkbg-pt-plan-name-color': a.planNameColor,
                        '--bkbg-pt-desc-size': a.descriptionSize + 'px',
                        '--bkbg-pt-desc-color': a.descriptionColor,
                        '--bkbg-pt-price-size': a.priceSize + 'px',
                        '--bkbg-pt-price-color': a.priceColor,
                        '--bkbg-pt-currency-size': a.currencySize + 'px',
                        '--bkbg-pt-period-size': a.periodSize + 'px',
                        '--bkbg-pt-period-color': a.periodColor,
                        '--bkbg-pt-subtext-size': a.priceSubtextSize + 'px',
                        '--bkbg-pt-subtext-color': a.priceSubtextColor,
                        '--bkbg-pt-feature-size': a.featureSize + 'px',
                        '--bkbg-pt-feature-color': a.featureColor,
                        '--bkbg-pt-feature-excl-color': a.featureExcludedColor,
                        '--bkbg-pt-feature-incl-icon-color': a.featureIncludedIconColor,
                        '--bkbg-pt-feature-excl-icon-color': a.featureExcludedIconColor,
                        '--bkbg-pt-feature-gap': a.featureGap + 'px',
                        '--bkbg-pt-btn-bg': a.btnBg,
                        '--bkbg-pt-btn-color': a.btnColor,
                        '--bkbg-pt-btn-bg-hover': a.btnBgHover,
                        '--bkbg-pt-btn-color-hover': a.btnColorHover,
                        '--bkbg-pt-btn-border-color': a.btnBorderColor,
                        '--bkbg-pt-btn-border-w': a.btnBorderWidth + 'px',
                        '--bkbg-pt-btn-radius': a.btnBorderRadius + 'px',
                        '--bkbg-pt-btn-font-size': a.btnFontSize + 'px',
                        '--bkbg-pt-btn-font-weight': a.btnFontWeight,
                        '--bkbg-pt-btn-pad-v': a.btnPaddingV + 'px',
                        '--bkbg-pt-badge-bg': a.badgeBg,
                        '--bkbg-pt-badge-color': a.badgeColor,
                        '--bkbg-pt-badge-size': a.badgeSize + 'px',
                        '--bkbg-pt-badge-radius': a.badgeBorderRadius + 'px',
                        '--bkbg-pt-header-bg': a.headerBg,
                        '--bkbg-pt-section-gap': a.sectionGap + 'px'
                    };
                }
                var cardClass = 'bkbg-pt-card bkbg-pt-style-' + a.cardStyle + (a.isPopular ? ' is-popular' : '') + ' bkbg-pt-header-' + a.headerStyle;
                function saveFeatureIcon(feat) {
                    if (a.featureListStyle === 'none') return null;
                    if (a.featureListStyle === 'bullet') return el('span', { className: 'bkbg-pt-feat-bullet', 'aria-hidden': 'true' });
                    if (a.featureListStyle === 'check') return el('span', { className: 'bkbg-pt-feat-check' + (feat.included ? ' is-included' : ' is-excluded'), 'aria-hidden': 'true' });
                    var icon = feat.included ? 'dashicons-yes-alt' : 'dashicons-no-alt';
                    return el('span', { className: 'dashicons ' + icon + ' bkbg-pt-feat-icon' + (feat.included ? ' is-included' : ' is-excluded'), 'aria-hidden': 'true' });
                }
                var currencyEl = el('span', { className: 'bkbg-pt-currency' }, a.currency);
                var priceEl = el('span', { className: 'bkbg-pt-price-amount' }, a.price);
                var periodEl = el('span', { className: 'bkbg-pt-period' }, a.pricePeriod);
                return el('div', wp.blockEditor.useBlockProps.save({ className: cardClass, style: oldBuildWrapStyle(a) }),
                    el('div', { className: 'bkbg-pt-header' },
                        a.isPopular && el('div', { className: 'bkbg-pt-badge' }, a.popularLabel),
                        el(RichText.Content, { tagName: 'div', className: 'bkbg-pt-plan-name', value: a.planName }),
                        a.showDescription && el(RichText.Content, { tagName: 'div', className: 'bkbg-pt-description', value: a.planDescription })
                    ),
                    el('div', { className: 'bkbg-pt-pricing' },
                        el('div', { className: 'bkbg-pt-price-row' },
                            el('div', { className: 'bkbg-pt-price-main' },
                                a.currencyPosition === 'before' ? el(Fragment, {}, currencyEl, priceEl) : el(Fragment, {}, priceEl, currencyEl),
                                periodEl
                            ),
                            a.showPriceSubtext && a.priceSubtext && el('div', { className: 'bkbg-pt-subtext' }, a.priceSubtext)
                        )
                    ),
                    el('ul', { className: 'bkbg-pt-features bkbg-pt-feat-style-' + a.featureListStyle },
                        a.features.map(function (feat, i) {
                            return el('li', { key: i, className: 'bkbg-pt-feat-item' + (feat.included ? ' is-included' : ' is-excluded') },
                                saveFeatureIcon(feat),
                                el('span', { className: 'bkbg-pt-feat-text' }, feat.text)
                            );
                        })
                    ),
                    a.showFeatureDivider && el('hr', { className: 'bkbg-pt-divider' }),
                    el('div', { className: 'bkbg-pt-cta' },
                        el('a', {
                            href: a.buttonUrl || '#',
                            className: 'bkbg-pt-btn bkbg-pt-btn-' + a.btnWidth,
                            target: a.buttonTarget ? '_blank' : undefined,
                            rel: a.buttonTarget ? 'noopener noreferrer' : undefined
                        }, a.buttonText)
                    )
                );
            },
            migrate: function (attrs) {
                var n = Object.assign({}, attrs);
                n.nameTypo = { sizeDesktop: attrs.planNameSize || 20, weight: attrs.planNameWeight || '700' };
                n.descTypo = { sizeDesktop: attrs.descriptionSize || 14 };
                n.priceTypo = { sizeDesktop: attrs.priceSize || 52 };
                n.featureTypo = { sizeDesktop: attrs.featureSize || 15 };
                n.btnTypo = { sizeDesktop: attrs.btnFontSize || 16, weight: attrs.btnFontWeight || '600' };
                delete n.planNameSize; delete n.planNameWeight; delete n.descriptionSize;
                delete n.priceSize; delete n.featureSize; delete n.btnFontSize; delete n.btnFontWeight;
                return n;
            }
        }]
    });
}() );
