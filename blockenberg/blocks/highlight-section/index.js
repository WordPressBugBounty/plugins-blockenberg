( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/highlight-section', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            var blockProps = useBlockProps({ className: 'bkbg-hs-editor' });

            var _tv = getTypoCssVars();
            var sectionStyle = {
                background: attr.bgColor || '#fff',
                paddingTop: attr.paddingTop + 'px',
                paddingBottom: attr.paddingBottom + 'px',
                position: 'relative',
                overflow: 'hidden',
                textAlign: attr.textAlign
            };
            Object.assign(sectionStyle, _tv(attr.headingTypo || {}, '--bkbg-hs-h-'));
            Object.assign(sectionStyle, _tv(attr.subtextTypo || {}, '--bkbg-hs-st-'));
            Object.assign(sectionStyle, _tv(attr.ctaTypo || {}, '--bkbg-hs-cta-'));
            /* legacy fallback vars */
            if (attr.headingSize && attr.headingSize !== 56) sectionStyle['--bkbg-hs-h-sz'] = attr.headingSize + 'px';
            if (attr.headingFontWeight && attr.headingFontWeight !== '800') sectionStyle['--bkbg-hs-h-fw'] = attr.headingFontWeight;
            if (attr.headingLineHeight && attr.headingLineHeight !== 1.15) sectionStyle['--bkbg-hs-h-lh'] = String(attr.headingLineHeight);
            if (attr.subtextSize && attr.subtextSize !== 20) sectionStyle['--bkbg-hs-st-sz'] = attr.subtextSize + 'px';
            if (attr.subtextFontWeight && attr.subtextFontWeight !== '400') sectionStyle['--bkbg-hs-st-fw'] = attr.subtextFontWeight;
            if (attr.subtextLineHeight && attr.subtextLineHeight !== 1.6) sectionStyle['--bkbg-hs-st-lh'] = String(attr.subtextLineHeight);
            if (attr.ctaFontSize && attr.ctaFontSize !== 16) sectionStyle['--bkbg-hs-cta-sz'] = attr.ctaFontSize + 'px';
            if (attr.ctaFontWeight && attr.ctaFontWeight !== '600') sectionStyle['--bkbg-hs-cta-fw'] = attr.ctaFontWeight;

            var innerStyle = {
                maxWidth: attr.maxWidth + 'px',
                margin: '0 auto',
                position: 'relative',
                zIndex: 1
            };

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Background Word', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show Background Word', 'blockenberg'),
                        checked: attr.showBgWord,
                        onChange: function (v) { setAttr({ showBgWord: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    attr.showBgWord && el(TextControl, {
                        label: __('Background Word', 'blockenberg'),
                        value: attr.bgWord,
                        onChange: function (v) { setAttr({ bgWord: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    attr.showBgWord && el(RangeControl, {
                        label: __('Background Word Size (px)', 'blockenberg'),
                        value: attr.bgWordSize,
                        min: 80, max: 600,
                        onChange: function (v) { setAttr({ bgWordSize: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    attr.showBgWord && el(SelectControl, {
                        label: __('Background Word Weight', 'blockenberg'),
                        value: attr.bgWordWeight,
                        options: [
                            { label: 'Extra Bold (900)', value: '900' },
                            { label: 'Bold (700)', value: '700' },
                            { label: 'Normal (400)', value: '400' }
                        ],
                        onChange: function (v) { setAttr({ bgWordWeight: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Subtext', 'blockenberg'),
                        checked: attr.showSubtext,
                        onChange: function (v) { setAttr({ showSubtext: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show CTA Button', 'blockenberg'),
                        checked: attr.showCta,
                        onChange: function (v) { setAttr({ showCta: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    attr.showCta && el(TextControl, {
                        label: __('CTA Label', 'blockenberg'),
                        value: attr.ctaLabel,
                        onChange: function (v) { setAttr({ ctaLabel: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    attr.showCta && el(TextControl, {
                        label: __('CTA URL', 'blockenberg'),
                        value: attr.ctaUrl,
                        onChange: function (v) { setAttr({ ctaUrl: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    attr.showCta && el(ToggleControl, {
                        label: __('Open in New Tab', 'blockenberg'),
                        checked: attr.ctaOpenNewTab,
                        onChange: function (v) { setAttr({ ctaOpenNewTab: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Text Align', 'blockenberg'),
                        value: attr.textAlign,
                        options: [
                            { label: 'Left', value: 'left' },
                            { label: 'Center', value: 'center' },
                            { label: 'Right', value: 'right' }
                        ],
                        onChange: function (v) { setAttr({ textAlign: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(getTypographyControl(), { label: __('Heading Typography', 'blockenberg'), value: attr.headingTypo || {}, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                    el(getTypographyControl(), { label: __('Subtext Typography', 'blockenberg'), value: attr.subtextTypo || {}, onChange: function (v) { setAttr({ subtextTypo: v }); } }),
                    el(getTypographyControl(), { label: __('CTA Typography', 'blockenberg'), value: attr.ctaTypo || {}, onChange: function (v) { setAttr({ ctaTypo: v }); } })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#fff' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); } },
                        { label: __('Subtext', 'blockenberg'), value: attr.subtextColor, onChange: function (v) { setAttr({ subtextColor: v || '#4b5563' }); } },
                        { label: __('CTA Background', 'blockenberg'), value: attr.ctaBg, onChange: function (v) { setAttr({ ctaBg: v || '#7c3aed' }); } },
                        { label: __('CTA Text', 'blockenberg'), value: attr.ctaColor, onChange: function (v) { setAttr({ ctaColor: v || '#fff' }); } },
                        { label: __('Background Word Color', 'blockenberg'), value: attr.bgWordColor, onChange: function (v) { setAttr({ bgWordColor: v || 'rgba(0,0,0,0.05)' }); } }
                    ]
                }),
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Max Width (px)', 'blockenberg'),
                        value: attr.maxWidth,
                        min: 400, max: 1600,
                        onChange: function (v) { setAttr({ maxWidth: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: attr.paddingTop,
                        min: 0, max: 300,
                        onChange: function (v) { setAttr({ paddingTop: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: attr.paddingBottom,
                        min: 0, max: 300,
                        onChange: function (v) { setAttr({ paddingBottom: v }); },
                        __nextHasNoMarginBottom: true
                    })
                )
            );

            return el('div', blockProps, controls,
                el('div', { className: 'bkbg-hs-wrap', style: sectionStyle },
                    attr.showBgWord && el('div', {
                        className: 'bkbg-hs-bg-word',
                        style: {
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: attr.bgWordSize + 'px',
                            fontWeight: attr.bgWordWeight,
                            color: attr.bgWordColor,
                            pointerEvents: 'none',
                            userSelect: 'none',
                            lineHeight: 1,
                            whiteSpace: 'nowrap',
                            zIndex: 0
                        }
                    }, attr.bgWord),
                    el('div', { style: innerStyle },
                        el(RichText, {
                            tagName: 'h2',
                            className: 'bkbg-hs-heading',
                            style: { color: attr.headingColor, margin: '0 0 20px' },
                            value: attr.heading,
                            onChange: function (v) { setAttr({ heading: v }); },
                            placeholder: __('Heading…', 'blockenberg')
                        }),
                        attr.showSubtext && el(RichText, {
                            tagName: 'p',
                            className: 'bkbg-hs-subtext',
                            style: { color: attr.subtextColor, margin: '0 0 32px' },
                            value: attr.subtext,
                            onChange: function (v) { setAttr({ subtext: v }); },
                            placeholder: __('Subtext…', 'blockenberg')
                        }),
                        attr.showCta && el('div', { className: 'bkbg-hs-cta-wrap' },
                            el('span', {
                                className: 'bkbg-hs-cta-btn',
                                style: {
                                    display: 'inline-block',
                                    background: attr.ctaBg,
                                    color: attr.ctaColor,
                                    padding: '14px 32px',
                                    borderRadius: '8px',
                                    cursor: 'default'
                                }
                            }, attr.ctaLabel)
                        )
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save();
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-hs-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
