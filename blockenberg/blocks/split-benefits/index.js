( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/split-benefits', {
        title: __('Split Benefits', 'blockenberg'),
        icon: 'layout',
        category: 'bkbg-marketing',

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var editingState = useState(null);
            var editingIdx = editingState[0];
            var setEditingIdx = editingState[1];

            function wrapStyle(a) {
                return {
                    '--bkbg-sb-bg': a.bgColor,
                    '--bkbg-sb-text': a.textColor,
                    '--bkbg-sb-heading-c': a.headingColor,
                    '--bkbg-sb-heading-sz': a.headingSize + 'px',
                    '--bkbg-sb-heading-w': a.headingWeight,
                    '--bkbg-sb-eyebrow-c': a.eyebrowColor,
                    '--bkbg-sb-eyebrow-sz': a.eyebrowSize + 'px',
                    '--bkbg-sb-sub-c': a.subColor,
                    '--bkbg-sb-sub-sz': a.subSize + 'px',
                    '--bkbg-sb-item-c': a.itemColor,
                    '--bkbg-sb-item-sz': a.itemFontSize + 'px',
                    '--bkbg-sb-item-w': a.itemFontWeight,
                    '--bkbg-sb-item-lh': a.itemLineHeight,
                    '--bkbg-sb-icon-c': a.iconColor,
                    '--bkbg-sb-icon-sz': a.iconSize + 'px',
                    '--bkbg-sb-accent': a.accentColor,
                    '--bkbg-sb-btn-bg': a.btnBg,
                    '--bkbg-sb-btn-text': a.btnText,
                    '--bkbg-sb-btn2-text': a.btn2Text,
                    '--bkbg-sb-btn-r': a.btnRadius + 'px',
                    '--bkbg-sb-btn-sz': a.btnSize + 'px',
                    '--bkbg-sb-gap': a.columnGap + 'px',
                    '--bkbg-sb-item-gap': a.itemGap + 'px',
                    '--bkbg-sb-img-r': a.imageRadius + 'px',
                    '--bkbg-sb-pt': a.paddingTop + 'px',
                    '--bkbg-sb-pb': a.paddingBottom + 'px',
                };
            }

            var ICON_CHARS = {
                'check-circle': '✓',
                'arrow': '→',
                'star': '★',
                'dot': '•',
                'lightning': '⚡',
            };

            function getIconEl(iconType) {
                var iconMap = {
                    'check-circle': 'dashicons-yes-alt',
                    'arrow': 'dashicons-arrow-right-alt2',
                    'star': 'dashicons-star-filled',
                    'dot': 'dashicons-marker',
                    'lightning': 'dashicons-bolt',
                };
                return el('span', { className: 'dashicons ' + (iconMap[iconType] || 'dashicons-yes-alt') + ' bkbg-sb-icon' });
            }

            function updateBenefit(idx, value) {
                var arr = a.benefits.slice();
                arr[idx] = Object.assign({}, arr[idx], { text: value });
                set({ benefits: arr });
            }

            function addBenefit() {
                set({ benefits: a.benefits.concat([{ text: __('Another key benefit goes here', 'blockenberg') }]) });
            }

            function removeBenefit(idx) {
                set({ benefits: a.benefits.filter(function (_, i) { return i !== idx; }) });
            }

            function moveBenefit(idx, dir) {
                var ni = idx + dir;
                if (ni < 0 || ni >= a.benefits.length) return;
                var arr = a.benefits.slice();
                var tmp = arr[idx]; arr[idx] = arr[ni]; arr[ni] = tmp;
                set({ benefits: arr });
            }

            var styleOptions = [
                { label: __('Clean (white)', 'blockenberg'), value: 'clean' },
                { label: __('Dark', 'blockenberg'), value: 'dark' },
                { label: __('Tinted', 'blockenberg'), value: 'tinted' },
                { label: __('Bordered', 'blockenberg'), value: 'bordered' },
            ];

            var ratioOptions = [
                { label: __('50 / 50', 'blockenberg'), value: '50-50' },
                { label: __('60 / 40 (content wider)', 'blockenberg'), value: '60-40' },
                { label: __('40 / 60 (image wider)', 'blockenberg'), value: '40-60' },
            ];

            var imageStyleOptions = [
                { label: __('Plain', 'blockenberg'), value: 'plain' },
                { label: __('Rounded', 'blockenberg'), value: 'rounded' },
                { label: __('Shadow', 'blockenberg'), value: 'shadow' },
                { label: __('Card (bg box)', 'blockenberg'), value: 'card' },
                { label: __('Overlapping', 'blockenberg'), value: 'overlapping' },
            ];

            var iconTypeOptions = [
                { label: __('Check Circle', 'blockenberg'), value: 'check-circle' },
                { label: __('Arrow Right', 'blockenberg'), value: 'arrow' },
                { label: __('Star', 'blockenberg'), value: 'star' },
                { label: __('Dot / Marker', 'blockenberg'), value: 'dot' },
                { label: __('Lightning Bolt', 'blockenberg'), value: 'lightning' },
            ];

            var alignOptions = [
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Top', 'blockenberg'), value: 'top' },
            ];

            var inspector = el(InspectorControls, {},

                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show Eyebrow', 'blockenberg'), checked: a.showEyebrow, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showEyebrow: v }); }
                    }),
                    a.showEyebrow && el(TextControl, { label: __('Eyebrow Text', 'blockenberg'), value: a.eyebrow, onChange: function (v) { set({ eyebrow: v }); } }),
                    el(ToggleControl, {
                        label: __('Show Subheading', 'blockenberg'), checked: a.showSubheading, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSubheading: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Benefits List', 'blockenberg'), checked: a.showBenefits, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showBenefits: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Primary CTA', 'blockenberg'), checked: a.showCta, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showCta: v }); }
                    }),
                    a.showCta && el(TextControl, { label: __('CTA Text', 'blockenberg'), value: a.ctaText, onChange: function (v) { set({ ctaText: v }); } }),
                    a.showCta && el(TextControl, { label: __('CTA URL', 'blockenberg'), value: a.ctaUrl, onChange: function (v) { set({ ctaUrl: v }); } }),
                    el(ToggleControl, {
                        label: __('Show Secondary CTA', 'blockenberg'), checked: a.showSecondaryCta, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSecondaryCta: v }); }
                    }),
                    a.showSecondaryCta && el(TextControl, { label: __('Secondary CTA Text', 'blockenberg'), value: a.ctaSecondaryText, onChange: function (v) { set({ ctaSecondaryText: v }); } }),
                    a.showSecondaryCta && el(TextControl, { label: __('Secondary CTA URL', 'blockenberg'), value: a.ctaSecondaryUrl, onChange: function (v) { set({ ctaSecondaryUrl: v }); } })
                ),

                el(PanelBody, { title: __('Image', 'blockenberg'), initialOpen: false },
                    el(MediaUpload, {
                        onSelect: function (m) { set({ imageUrl: m.url, imageId: m.id, imageAlt: m.alt || '' }); },
                        allowedTypes: ['image'],
                        value: a.imageId,
                        render: function (ref) {
                            return el('div', {},
                                a.imageUrl && el('img', { src: a.imageUrl, style: { width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 } }),
                                el(Button, { variant: 'secondary', onClick: ref.open }, a.imageUrl ? __('Change Image', 'blockenberg') : __('Upload Image', 'blockenberg')),
                                a.imageUrl && el(Button, { isDestructive: true, variant: 'link', onClick: function () { set({ imageUrl: '', imageId: 0 }); } }, __('Remove', 'blockenberg'))
                            );
                        }
                    }),
                    el(SelectControl, { label: __('Image Position', 'blockenberg'), value: a.imagePosition, options: [{ label: __('Right', 'blockenberg'), value: 'right' }, { label: __('Left', 'blockenberg'), value: 'left' }], onChange: function (v) { set({ imagePosition: v }); } }),
                    el(SelectControl, { label: __('Image Style', 'blockenberg'), value: a.imageStyle, options: imageStyleOptions, onChange: function (v) { set({ imageStyle: v }); } }),
                    el(RangeControl, { label: __('Image Border Radius', 'blockenberg'), value: a.imageRadius, onChange: function (v) { set({ imageRadius: v }); }, min: 0, max: 48 })
                ),

                el(PanelBody, { title: __('Layout & Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, { label: __('Background Style', 'blockenberg'), value: a.style, options: styleOptions, onChange: function (v) { set({ style: v }); } }),
                    el(SelectControl, { label: __('Column Ratio', 'blockenberg'), value: a.ratio, options: ratioOptions, onChange: function (v) { set({ ratio: v }); } }),
                    el(SelectControl, { label: __('Vertical Align', 'blockenberg'), value: a.verticalAlign, options: alignOptions, onChange: function (v) { set({ verticalAlign: v }); } }),
                    el(RangeControl, { label: __('Column Gap', 'blockenberg'), value: a.columnGap, onChange: function (v) { set({ columnGap: v }); }, min: 16, max: 120 }),
                    el(RangeControl, { label: __('Button Radius', 'blockenberg'), value: a.btnRadius, onChange: function (v) { set({ btnRadius: v }); }, min: 0, max: 99 })
                ),

                el(PanelBody, { title: __('Benefits List', 'blockenberg'), initialOpen: false },
                    el(SelectControl, { label: __('Icon Type', 'blockenberg'), value: a.iconType, options: iconTypeOptions, onChange: function (v) { set({ iconType: v }); } }),
                    el(RangeControl, { label: __('Icon Size', 'blockenberg'), value: a.iconSize, onChange: function (v) { set({ iconSize: v }); }, min: 12, max: 32 }),
                    el(RangeControl, { label: __('Item Gap', 'blockenberg'), value: a.itemGap, onChange: function (v) { set({ itemGap: v }); }, min: 4, max: 32 }),
                    el('br'),
                    a.benefits.map(function (b, idx) {
                        return el('div', { key: idx, className: 'bkbg-sb-benefit-ctrl' },
                            el('div', { className: 'bkbg-sb-benefit-head' },
                                el('small', { style: { fontWeight: 600 } }, (idx + 1) + '. ' + (b.text || '').substring(0, 24) + (b.text && b.text.length > 24 ? '…' : '')),
                                el('div', { style: { display: 'flex', gap: 4 } },
                                    el(Button, { icon: 'arrow-up-alt2', size: 'small', disabled: idx === 0, onClick: function () { moveBenefit(idx, -1); } }),
                                    el(Button, { icon: 'arrow-down-alt2', size: 'small', disabled: idx === a.benefits.length - 1, onClick: function () { moveBenefit(idx, 1); } }),
                                    el(Button, { icon: 'trash', size: 'small', isDestructive: true, onClick: function () { removeBenefit(idx); } })
                                )
                            ),
                            el(TextControl, { value: b.text, onChange: function (v) { updateBenefit(idx, v); } })
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: addBenefit }, __('+ Add Benefit', 'blockenberg'))
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() ? el(getTypoControl(), { label: __('Heading Typography', 'blockenberg'), value: a.headingTypo || {}, onChange: function (v) { set({ headingTypo: v }); } }) : null,
                    getTypoControl() ? el(getTypoControl(), { label: __('Eyebrow Typography', 'blockenberg'), value: a.eyebrowTypo || {}, onChange: function (v) { set({ eyebrowTypo: v }); } }) : null,
                    getTypoControl() ? el(getTypoControl(), { label: __('Subheading Typography', 'blockenberg'), value: a.subTypo || {}, onChange: function (v) { set({ subTypo: v }); } }) : null,
                    getTypoControl() ? el(getTypoControl(), { label: __('Item Typography', 'blockenberg'), value: a.itemTypo || {}, onChange: function (v) { set({ itemTypo: v }); } }) : null,
                    getTypoControl() ? el(getTypoControl(), { label: __('Button Typography', 'blockenberg'), value: a.btnTypo || {}, onChange: function (v) { set({ btnTypo: v }); } }) : null
                ),

                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: a.paddingTop, onChange: function (v) { set({ paddingTop: v }); }, min: 0, max: 240 }),
                    el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: a.paddingBottom, onChange: function (v) { set({ paddingBottom: v }); }, min: 0, max: 240 })
                ),

                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); }, label: __('Background', 'blockenberg') },
                        { value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#0f172a' }); }, label: __('Heading Color', 'blockenberg') },
                        { value: a.eyebrowColor, onChange: function (v) { set({ eyebrowColor: v || '#6c3fb5' }); }, label: __('Eyebrow Color', 'blockenberg') },
                        { value: a.subColor, onChange: function (v) { set({ subColor: v || '#64748b' }); }, label: __('Subheading Color', 'blockenberg') },
                        { value: a.itemColor, onChange: function (v) { set({ itemColor: v || '#1e293b' }); }, label: __('Item Text Color', 'blockenberg') },
                        { value: a.iconColor, onChange: function (v) { set({ iconColor: v || '#6c3fb5' }); }, label: __('Icon Color', 'blockenberg') },
                        { value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#6c3fb5' }); }, label: __('Accent Color', 'blockenberg') },
                        { value: a.btnBg, onChange: function (v) { set({ btnBg: v || '#6c3fb5' }); }, label: __('Primary Button BG', 'blockenberg') },
                        { value: a.btnText, onChange: function (v) { set({ btnText: v || '#ffffff' }); }, label: __('Primary Button Text', 'blockenberg') },
                        { value: a.btn2Text, onChange: function (v) { set({ btn2Text: v || '#6c3fb5' }); }, label: __('Secondary Button Text', 'blockenberg') },
                    ]
                })
            );

            var imgPos = a.imagePosition === 'left' ? 'bkbg-sb-img--left' : 'bkbg-sb-img--right';
            var blockProps = useBlockProps({
                className: 'bkbg-sb-wrap bkbg-sb-style--' + a.style + ' bkbg-sb-ratio--' + a.ratio + ' ' + imgPos,
                style: wrapStyle(a)
            });

            var textCol = el('div', { className: 'bkbg-sb-text-col' },
                a.showEyebrow && a.eyebrow && el('div', { className: 'bkbg-sb-eyebrow' }, a.eyebrow),
                el(RichText, {
                    tagName: 'h2', className: 'bkbg-sb-heading',
                    value: a.heading, placeholder: __('Heading…', 'blockenberg'),
                    onChange: function (v) { set({ heading: v }); }
                }),
                a.showSubheading && el(RichText, {
                    tagName: 'p', className: 'bkbg-sb-sub',
                    value: a.subheading, placeholder: __('Supporting text…', 'blockenberg'),
                    onChange: function (v) { set({ subheading: v }); }
                }),
                a.showBenefits && el('ul', { className: 'bkbg-sb-list' },
                    a.benefits.map(function (b, idx) {
                        return el('li', { key: idx, className: 'bkbg-sb-item' },
                            el('span', { className: 'bkbg-sb-item-icon' }, getIconEl(a.iconType)),
                            el('span', { className: 'bkbg-sb-item-text' }, b.text)
                        );
                    })
                ),
                (a.showCta || a.showSecondaryCta) && el('div', { className: 'bkbg-sb-ctas' },
                    a.showCta && el('a', { className: 'bkbg-sb-btn bkbg-sb-btn--primary', href: a.ctaUrl }, a.ctaText),
                    a.showSecondaryCta && el('a', { className: 'bkbg-sb-btn bkbg-sb-btn--secondary', href: a.ctaSecondaryUrl }, a.ctaSecondaryText)
                )
            );

            var imageCol = el('div', { className: 'bkbg-sb-image-col bkbg-sb-img-style--' + a.imageStyle },
                a.imageUrl ?
                    el('img', { className: 'bkbg-sb-img', src: a.imageUrl, alt: a.imageAlt }) :
                    el('div', { className: 'bkbg-sb-img-placeholder' },
                        el('span', { className: 'dashicons dashicons-format-image' }),
                        el('p', {}, __('Upload an image', 'blockenberg'))
                    )
            );

            return el('div', blockProps,
                inspector,
                el('div', { className: 'bkbg-sb-inner bkbg-sb-valign--' + a.verticalAlign },
                    a.imagePosition === 'left' ? [imageCol, textCol] : [textCol, imageCol]
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var el = wp.element.createElement;

            function wrapStyle(a) {
                var s = {
                    '--bkbg-sb-bg': a.bgColor,
                    '--bkbg-sb-text': a.textColor,
                    '--bkbg-sb-heading-c': a.headingColor,
                    '--bkbg-sb-heading-sz': a.headingSize + 'px',
                    '--bkbg-sb-heading-w': a.headingWeight,
                    '--bkbg-sb-eyebrow-c': a.eyebrowColor,
                    '--bkbg-sb-eyebrow-sz': a.eyebrowSize + 'px',
                    '--bkbg-sb-sub-c': a.subColor,
                    '--bkbg-sb-sub-sz': a.subSize + 'px',
                    '--bkbg-sb-item-c': a.itemColor,
                    '--bkbg-sb-item-sz': a.itemFontSize + 'px',
                    '--bkbg-sb-item-w': a.itemFontWeight,
                    '--bkbg-sb-icon-c': a.iconColor,
                    '--bkbg-sb-icon-sz': a.iconSize + 'px',
                    '--bkbg-sb-accent': a.accentColor,
                    '--bkbg-sb-btn-bg': a.btnBg,
                    '--bkbg-sb-btn-text': a.btnText,
                    '--bkbg-sb-btn2-text': a.btn2Text,
                    '--bkbg-sb-btn-r': a.btnRadius + 'px',
                    '--bkbg-sb-btn-sz': a.btnSize + 'px',
                    '--bkbg-sb-gap': a.columnGap + 'px',
                    '--bkbg-sb-item-gap': a.itemGap + 'px',
                    '--bkbg-sb-img-r': a.imageRadius + 'px',
                    '--bkbg-sb-pt': a.paddingTop + 'px',
                    '--bkbg-sb-pb': a.paddingBottom + 'px',
                };
                var tv = getTypoCssVars();
                if (tv) {
                    Object.assign(s, tv(a.headingTypo, '--bksb-hd-'));
                    Object.assign(s, tv(a.eyebrowTypo, '--bksb-eb-'));
                    Object.assign(s, tv(a.subTypo, '--bksb-sh-'));
                    Object.assign(s, tv(a.itemTypo, '--bksb-it-'));
                    Object.assign(s, tv(a.btnTypo, '--bksb-bt-'));
                }
                return s;
            }

            var iconMap = {
                'check-circle': 'dashicons-yes-alt',
                'arrow': 'dashicons-arrow-right-alt2',
                'star': 'dashicons-star-filled',
                'dot': 'dashicons-marker',
                'lightning': 'dashicons-bolt',
            };

            var imgPos = a.imagePosition === 'left' ? 'bkbg-sb-img--left' : 'bkbg-sb-img--right';
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-sb-wrap bkbg-sb-style--' + a.style + ' bkbg-sb-ratio--' + a.ratio + ' ' + imgPos,
                style: wrapStyle(a)
            });

            var textCol = el('div', { className: 'bkbg-sb-text-col' },
                a.showEyebrow && a.eyebrow && el('div', { className: 'bkbg-sb-eyebrow' }, a.eyebrow),
                el(RichText.Content, { tagName: 'h2', className: 'bkbg-sb-heading', value: a.heading }),
                a.showSubheading && el(RichText.Content, { tagName: 'p', className: 'bkbg-sb-sub', value: a.subheading }),
                a.showBenefits && el('ul', { className: 'bkbg-sb-list' },
                    a.benefits.map(function (b, idx) {
                        return el('li', { key: idx, className: 'bkbg-sb-item' },
                            el('span', { className: 'bkbg-sb-item-icon' },
                                el('span', { className: 'dashicons ' + (iconMap[a.iconType] || 'dashicons-yes-alt') + ' bkbg-sb-icon' })
                            ),
                            el('span', { className: 'bkbg-sb-item-text' }, b.text)
                        );
                    })
                ),
                (a.showCta || a.showSecondaryCta) && el('div', { className: 'bkbg-sb-ctas' },
                    a.showCta && el('a', { className: 'bkbg-sb-btn bkbg-sb-btn--primary', href: a.ctaUrl }, a.ctaText),
                    a.showSecondaryCta && el('a', { className: 'bkbg-sb-btn bkbg-sb-btn--secondary', href: a.ctaSecondaryUrl }, a.ctaSecondaryText)
                )
            );

            var imageCol = el('div', { className: 'bkbg-sb-image-col bkbg-sb-img-style--' + a.imageStyle },
                a.imageUrl ?
                    el('img', { className: 'bkbg-sb-img', src: a.imageUrl, alt: a.imageAlt }) :
                    el('div', { className: 'bkbg-sb-img-placeholder' })
            );

            return el('div', blockProps,
                el('div', { className: 'bkbg-sb-inner bkbg-sb-valign--' + a.verticalAlign },
                    a.imagePosition === 'left' ? [imageCol, textCol] : [textCol, imageCol]
                )
            );
        }
    });
}() );
