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
    var Button = wp.components.Button;

    var _tc, _tv;
    function getTC() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTV() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/service-details', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tv = getTV();
                var s = {};
                Object.assign(s, _tv(attr.headingTypo, '--bksd-ht-'));
                Object.assign(s, _tv(attr.eyebrowTypo, '--bksd-et-'));
                Object.assign(s, _tv(attr.bodyTypo, '--bksd-bt-'));
                return { className: 'bkbg-svd-editor', style: s };
            })());

            var isRight = attr.layout === 'image-right';
            var isCentered = attr.layout === 'centered';

            function updateFeature(idx, key, val) {
                var next = attr.features.map(function (f, i) {
                    if (i !== idx) return f;
                    var obj = {}; Object.keys(f).forEach(function (k) { obj[k] = f[k]; });
                    obj[key] = val; return obj;
                });
                setAttr({ features: next });
            }

            function removeFeature(idx) {
                setAttr({ features: attr.features.filter(function (_, i) { return i !== idx; }) });
            }

            /* image panel */
            var imagePanel = el('div', { className: 'bkbg-svd-image-col', style: { flex: '0 0 48%' } },
                el(MediaUploadCheck, {},
                    el(MediaUpload, {
                        onSelect: function (m) { setAttr({ imageUrl: m.url, imageId: m.id, imageAlt: m.alt || '' }); },
                        allowedTypes: ['image'], value: attr.imageId,
                        render: function (ref) {
                            return attr.imageUrl
                                ? el('div', { style: { position: 'relative' } },
                                    el('img', {
                                        src: attr.imageUrl, alt: attr.imageAlt,
                                        style: { width: '100%', borderRadius: attr.imageRadius + 'px', display: 'block', maxHeight: '480px', objectFit: 'cover' }
                                    }),
                                    el(Button, {
                                        isSmall: true, isDestructive: true,
                                        style: { position: 'absolute', top: '8px', right: '8px' },
                                        onClick: function () { setAttr({ imageUrl: '', imageId: 0 }); }
                                    }, '✕')
                                )
                                : el('div', {
                                    onClick: ref.open, style: { background: '#f3f4f6', borderRadius: attr.imageRadius + 'px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '40px', color: '#d1d5db' }
                                }, '🖼️');
                        }
                    })
                )
            );

            /* text panel */
            var textPanel = el('div', { className: 'bkbg-svd-text-col', style: { flex: '1' } },
                attr.showEyebrow && el(RichText, {
                    tagName: 'p', value: attr.eyebrow, className: 'bkbg-svd-eyebrow',
                    style: { color: attr.eyebrowColor, margin: '0 0 12px' },
                    onChange: function (v) { setAttr({ eyebrow: v }); }
                }),
                el(RichText, {
                    tagName: 'h2', value: attr.heading, className: 'bkbg-svd-heading',
                    style: { color: attr.headingColor, margin: '0 0 14px' },
                    onChange: function (v) { setAttr({ heading: v }); }
                }),
                el(RichText, {
                    tagName: 'p', value: attr.subtext, className: 'bkbg-svd-subtext',
                    style: { color: attr.bodyColor, margin: '0 0 12px' },
                    onChange: function (v) { setAttr({ subtext: v }); }
                }),
                el(RichText, {
                    tagName: 'p', value: attr.bodyText, className: 'bkbg-svd-body',
                    style: { color: attr.bodyColor, margin: '0 0 24px' },
                    onChange: function (v) { setAttr({ bodyText: v }); }
                }),
                attr.showFeatures && el('div', { style: { marginBottom: '28px' } },
                    attr.features.map(function (feat, idx) {
                        return el('div', {
                            key: idx,
                            style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }
                        },
                            el('span', {
                                style: { background: attr.checkBg, color: attr.checkColor, width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', flexShrink: 0 }
                            }, feat.icon || '✓'),
                            el(TextControl, {
                                value: feat.text,
                                style: { flex: 1, margin: 0 },
                                onChange: function (v) { updateFeature(idx, 'text', v); },
                                __nextHasNoMarginBottom: true
                            }),
                            el(Button, { isSmall: true, isDestructive: true, onClick: function () { removeFeature(idx); } }, '✕')
                        );
                    }),
                    el(Button, { isSecondary: true, isSmall: true, onClick: function () { setAttr({ features: attr.features.concat([{ icon: '✓', text: 'New feature' }]) }); } }, '+ Add feature')
                ),
                el('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' } },
                    attr.ctaEnabled && el('a', { href: '#editor', style: { background: attr.ctaBg, color: attr.ctaColor, padding: '12px 28px', borderRadius: '6px', fontWeight: '600', fontSize: '15px', textDecoration: 'none', display: 'inline-block' } }, attr.ctaLabel),
                    attr.cta2Enabled && el('a', { href: '#editor', style: { color: attr.cta2Color, fontWeight: '600', fontSize: '15px', textDecoration: 'underline' } }, attr.cta2Label)
                )
            );

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Image & Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'), value: attr.layout,
                        options: [{ label: 'Image left, text right', value: 'image-left' }, { label: 'Image right, text left', value: 'image-right' }, { label: 'Centered (image top)', value: 'centered' }],
                        onChange: function (v) { setAttr({ layout: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Image Border Radius (px)', 'blockenberg'), value: attr.imageRadius, min: 0, max: 32, onChange: function (v) { setAttr({ imageRadius: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Text & CTAs', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Eyebrow', 'blockenberg'), checked: attr.showEyebrow, onChange: function (v) { setAttr({ showEyebrow: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Feature List', 'blockenberg'), checked: attr.showFeatures, onChange: function (v) { setAttr({ showFeatures: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Primary CTA', 'blockenberg'), checked: attr.ctaEnabled, onChange: function (v) { setAttr({ ctaEnabled: v }); }, __nextHasNoMarginBottom: true }),
                    attr.ctaEnabled && el(TextControl, { label: __('CTA Label', 'blockenberg'), value: attr.ctaLabel, onChange: function (v) { setAttr({ ctaLabel: v }); }, __nextHasNoMarginBottom: true }),
                    attr.ctaEnabled && el(TextControl, { label: __('CTA URL', 'blockenberg'), value: attr.ctaUrl, onChange: function (v) { setAttr({ ctaUrl: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Secondary CTA', 'blockenberg'), checked: attr.cta2Enabled, onChange: function (v) { setAttr({ cta2Enabled: v }); }, __nextHasNoMarginBottom: true }),
                    attr.cta2Enabled && el(TextControl, { label: __('Secondary CTA Label', 'blockenberg'), value: attr.cta2Label, onChange: function (v) { setAttr({ cta2Label: v }); }, __nextHasNoMarginBottom: true }),
                    attr.cta2Enabled && el(TextControl, { label: __('Secondary CTA URL', 'blockenberg'), value: attr.cta2Url, onChange: function (v) { setAttr({ cta2Url: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: attr.maxWidth, min: 480, max: 1600, onChange: function (v) { setAttr({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 160, onChange: function (v) { setAttr({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 160, onChange: function (v) { setAttr({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTC(), { label: __('Heading', 'blockenberg'), value: attr.headingTypo, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                    el(getTC(), { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowTypo, onChange: function (v) { setAttr({ eyebrowTypo: v }); } }),
                    el(getTC(), { label: __('Body', 'blockenberg'), value: attr.bodyTypo, onChange: function (v) { setAttr({ bodyTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                        { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowColor, onChange: function (v) { setAttr({ eyebrowColor: v || '#7c3aed' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); } },
                        { label: __('Body Text', 'blockenberg'), value: attr.bodyColor, onChange: function (v) { setAttr({ bodyColor: v || '#374151' }); } },
                        { label: __('Feature Text', 'blockenberg'), value: attr.featureColor, onChange: function (v) { setAttr({ featureColor: v || '#374151' }); } },
                        { label: __('Check BG', 'blockenberg'), value: attr.checkBg, onChange: function (v) { setAttr({ checkBg: v || '#ede9fe' }); } },
                        { label: __('Check Icon', 'blockenberg'), value: attr.checkColor, onChange: function (v) { setAttr({ checkColor: v || '#7c3aed' }); } },
                        { label: __('Primary CTA BG', 'blockenberg'), value: attr.ctaBg, onChange: function (v) { setAttr({ ctaBg: v || '#7c3aed' }); } },
                        { label: __('Primary CTA Text', 'blockenberg'), value: attr.ctaColor, onChange: function (v) { setAttr({ ctaColor: v || '#ffffff' }); } },
                        { label: __('Secondary CTA', 'blockenberg'), value: attr.cta2Color, onChange: function (v) { setAttr({ cta2Color: v || '#7c3aed' }); } }
                    ]
                })
            );

            return el('div', blockProps, controls,
                el('div', { style: { background: attr.bgColor, paddingTop: attr.paddingTop + 'px', paddingBottom: attr.paddingBottom + 'px' } },
                    el('div', {
                        style: {
                            maxWidth: attr.maxWidth + 'px', margin: '0 auto',
                            display: isCentered ? 'flex' : 'flex',
                            flexDirection: isCentered ? 'column' : (isRight ? 'row-reverse' : 'row'),
                            gap: '48px', alignItems: isCentered ? 'center' : 'center'
                        }
                    }, imagePanel, textPanel)
                )
            );
        },

        save: function (props) {
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', { className: 'bkbg-svd-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
