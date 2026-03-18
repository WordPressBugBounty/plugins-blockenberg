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

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/image-overlap-text', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-iot-editor', style: (function() {
                var s = {}; var _tv = getTypoCssVars();
                Object.assign(s, _tv(attr.eyebrowTypo, '--bkbg-iot-ey-'));
                Object.assign(s, _tv(attr.headingTypo, '--bkbg-iot-h-'));
                Object.assign(s, _tv(attr.subtextTypo, '--bkbg-iot-st-'));
                Object.assign(s, _tv(attr.bodyTypo, '--bkbg-iot-bd-'));
                return s;
            })() });

            var isRight = attr.overlapSide === 'right';

            /* decorative element */
            function makeDecor() {
                if (attr.decorative === 'none') return null;
                if (attr.decorative === 'dots') {
                    return el('div', { className: 'bkbg-iot-decor bkbg-iot-decor--dots', style: { '--dot-color': attr.dotColor } });
                }
                if (attr.decorative === 'lines') {
                    return el('div', { className: 'bkbg-iot-decor bkbg-iot-decor--lines', style: { '--accent': attr.accentColor } });
                }
                return el('div', { className: 'bkbg-iot-decor bkbg-iot-decor--shape', style: { background: attr.accentColor } });
            }

            var imageCol = el('div', {
                className: 'bkbg-iot-image-col',
                style: { position: 'relative', flex: '0 0 55%', overflow: 'visible' }
            },
                makeDecor(),
                attr.imageUrl
                    ? el('img', {
                        src: attr.imageUrl, alt: attr.imageAlt,
                        className: 'bkbg-iot-img',
                        style: { borderRadius: attr.imageRadius + 'px', width: '100%', display: 'block', objectFit: 'cover', minHeight: '360px' }
                    })
                    : el('div', {
                        style: { background: '#f3f4f6', borderRadius: attr.imageRadius + 'px', minHeight: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: '#d1d5db' }
                    }, '🖼️')
            );

            var textCol = el('div', {
                className: 'bkbg-iot-text-col',
                style: { flex: '1', padding: isRight ? '40px 0 40px ' + attr.overlapAmount + 'px' : '40px ' + attr.overlapAmount + 'px 40px 0', background: attr.panelBg, position: 'relative', zIndex: 1 }
            },
                attr.showEyebrow && el(RichText, {
                    tagName: 'p', value: attr.eyebrow,
                    className: 'bkbg-iot-eyebrow',
                    style: { color: attr.eyebrowColor, margin: '0 0 12px' },
                    onChange: function (v) { setAttr({ eyebrow: v }); }
                }),
                el(RichText, {
                    tagName: 'h2', value: attr.heading,
                    className: 'bkbg-iot-heading',
                    style: { color: attr.headingColor, margin: '0 0 16px' },
                    onChange: function (v) { setAttr({ heading: v }); }
                }),
                el(RichText, {
                    tagName: 'p', value: attr.subtext,
                    className: 'bkbg-iot-subtext',
                    style: { color: attr.subtextColor, margin: '0 0 16px' },
                    onChange: function (v) { setAttr({ subtext: v }); }
                }),
                attr.bodyText && el(RichText, {
                    tagName: 'p', value: attr.bodyText,
                    className: 'bkbg-iot-body',
                    style: { color: attr.bodyColor, margin: '0 0 24px' },
                    onChange: function (v) { setAttr({ bodyText: v }); }
                }),
                attr.ctaEnabled && el('div', {},
                    el('a', {
                        href: '#editor',
                        style: { display: 'inline-block', background: attr.ctaBg, color: attr.ctaColor, padding: '12px 28px', borderRadius: '6px', fontWeight: '600', fontSize: '15px', textDecoration: 'none' }
                    }, attr.ctaLabel)
                )
            );

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Image', 'blockenberg'), initialOpen: true },
                    el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (m) { setAttr({ imageUrl: m.url, imageId: m.id, imageAlt: m.alt || '' }); },
                            allowedTypes: ['image'], value: attr.imageId,
                            render: function (ref) {
                                return el('div', {},
                                    attr.imageUrl && el('div', { style: { marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'center' } },
                                        el('img', { src: attr.imageUrl, style: { width: '64px', height: '48px', objectFit: 'cover', borderRadius: '4px' } }),
                                        el(Button, { isSmall: true, isDestructive: true, onClick: function () { setAttr({ imageUrl: '', imageId: 0 }); } }, '✕')
                                    ),
                                    el(Button, { isSecondary: true, isSmall: true, onClick: ref.open }, attr.imageUrl ? __('Replace Image', 'blockenberg') : __('Choose Image', 'blockenberg'))
                                );
                            }
                        })
                    ),
                    el(RangeControl, { label: __('Image Border Radius (px)', 'blockenberg'), value: attr.imageRadius, min: 0, max: 32, onChange: function (v) { setAttr({ imageRadius: v }); }, __nextHasNoMarginBottom: true }),
                    el(SelectControl, {
                        label: __('Decorative Element', 'blockenberg'), value: attr.decorative,
                        options: [{ label: 'Dot grid', value: 'dots' }, { label: 'Diagonal lines', value: 'lines' }, { label: 'Solid shape', value: 'shape' }, { label: 'None', value: 'none' }],
                        onChange: function (v) { setAttr({ decorative: v }); }, __nextHasNoMarginBottom: true
                    })
                ),
                el(PanelBody, { title: __('Layout & Text', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Image Side', 'blockenberg'), value: attr.overlapSide,
                        options: [{ label: 'Image left, text right', value: 'left' }, { label: 'Image right, text left', value: 'right' }],
                        onChange: function (v) { setAttr({ overlapSide: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Overlap into text (px)', 'blockenberg'), value: attr.overlapAmount, min: 0, max: 120, onChange: function (v) { setAttr({ overlapAmount: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Eyebrow', 'blockenberg'), checked: attr.showEyebrow, onChange: function (v) { setAttr({ showEyebrow: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show CTA Button', 'blockenberg'), checked: attr.ctaEnabled, onChange: function (v) { setAttr({ ctaEnabled: v }); }, __nextHasNoMarginBottom: true }),
                    attr.ctaEnabled && el(TextControl, { label: __('CTA Label', 'blockenberg'), value: attr.ctaLabel, onChange: function (v) { setAttr({ ctaLabel: v }); }, __nextHasNoMarginBottom: true }),
                    attr.ctaEnabled && el(TextControl, { label: __('CTA URL', 'blockenberg'), value: attr.ctaUrl, onChange: function (v) { setAttr({ ctaUrl: v }); }, __nextHasNoMarginBottom: true }),
                    attr.ctaEnabled && el(ToggleControl, { label: __('Open in New Tab', 'blockenberg'), checked: attr.ctaIsExternal, onChange: function (v) { setAttr({ ctaIsExternal: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: attr.maxWidth, min: 600, max: 1600, onChange: function (v) { setAttr({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 160, onChange: function (v) { setAttr({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 160, onChange: function (v) { setAttr({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypographyControl() && el(getTypographyControl(), { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowTypo, onChange: function (v) { setAttr({ eyebrowTypo: v }); } }),
                    getTypographyControl() && el(getTypographyControl(), { label: __('Heading', 'blockenberg'), value: attr.headingTypo, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                    getTypographyControl() && el(getTypographyControl(), { label: __('Subtext', 'blockenberg'), value: attr.subtextTypo, onChange: function (v) { setAttr({ subtextTypo: v }); } }),
                    getTypographyControl() && el(getTypographyControl(), { label: __('Body', 'blockenberg'), value: attr.bodyTypo, onChange: function (v) { setAttr({ bodyTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Page Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                        { label: __('Text Panel BG', 'blockenberg'), value: attr.panelBg, onChange: function (v) { setAttr({ panelBg: v || '#f9fafb' }); } },
                        { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowColor, onChange: function (v) { setAttr({ eyebrowColor: v || '#7c3aed' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); } },
                        { label: __('Subtext', 'blockenberg'), value: attr.subtextColor, onChange: function (v) { setAttr({ subtextColor: v || '#6b7280' }); } },
                        { label: __('Body Text', 'blockenberg'), value: attr.bodyColor, onChange: function (v) { setAttr({ bodyColor: v || '#374151' }); } },
                        { label: __('CTA Background', 'blockenberg'), value: attr.ctaBg, onChange: function (v) { setAttr({ ctaBg: v || '#7c3aed' }); } },
                        { label: __('CTA Text', 'blockenberg'), value: attr.ctaColor, onChange: function (v) { setAttr({ ctaColor: v || '#ffffff' }); } },
                        { label: __('Accent / Shape', 'blockenberg'), value: attr.accentColor, onChange: function (v) { setAttr({ accentColor: v || '#7c3aed' }); } },
                        { label: __('Dot Color', 'blockenberg'), value: attr.dotColor, onChange: function (v) { setAttr({ dotColor: v || '#e5e7eb' }); } }
                    ]
                })
            );

            return el('div', blockProps, controls,
                el('div', { style: { background: attr.bgColor, paddingTop: attr.paddingTop + 'px', paddingBottom: attr.paddingBottom + 'px' } },
                    el('div', {
                        style: {
                            maxWidth: attr.maxWidth + 'px', margin: '0 auto',
                            display: 'flex', flexDirection: isRight ? 'row-reverse' : 'row',
                            alignItems: 'stretch', position: 'relative', overflow: 'visible'
                        }
                    }, imageCol, textCol)
                )
            );
        },

        save: function (props) {
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', { className: 'bkbg-iot-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
