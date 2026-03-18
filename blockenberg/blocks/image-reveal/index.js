( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
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

    var ASPECT_OPTIONS = [
        { label: 'Auto (natural)', value: 'auto' },
        { label: '1:1 Square',    value: '1-1' },
        { label: '4:3',           value: '4-3' },
        { label: '3:2',           value: '3-2' },
        { label: '16:9',          value: '16-9' },
        { label: '21:9 Cinematic',value: '21-9' },
        { label: '9:16 Portrait', value: '9-16' },
    ];

    var DIRECTION_OPTIONS = [
        { label: 'Left  →  Right', value: 'left' },
        { label: 'Right →  Left',  value: 'right' },
        { label: 'Top   →  Bottom',value: 'top' },
        { label: 'Bottom→  Top',   value: 'bottom' },
    ];

    var STYLE_OPTIONS = [
        { label: 'Sweep (curtain)', value: 'sweep' },
        { label: 'Fade',            value: 'fade' },
        { label: 'Zoom In',         value: 'zoom' },
        { label: 'Blur to Clear',   value: 'blur' },
    ];

    var TRIGGER_OPTIONS = [
        { label: 'On Scroll (IntersectionObserver)', value: 'scroll' },
        { label: 'On Hover', value: 'hover' },
        { label: 'On Click', value: 'click' },
    ];

    function getAspectPadding(ratio) {
        if (ratio === '1-1')   return '100%';
        if (ratio === '4-3')   return '75%';
        if (ratio === '3-2')   return '66.67%';
        if (ratio === '16-9')  return '56.25%';
        if (ratio === '21-9')  return '42.86%';
        if (ratio === '9-16')  return '177.78%';
        return null;
    }

    registerBlockType('blockenberg/image-reveal', {
        title: __('Image Reveal', 'blockenberg'),
        icon: 'visibility',
        category: 'bkbg-effects',
        description: __('Image with a curtain reveal effect triggered on hover or scroll.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ style: (function() {
                var s = {}; var _tv = getTypoCssVars();
                Object.assign(s, _tv(a.labelTypo, '--bkbg-ir-lb-'));
                Object.assign(s, _tv(a.captionTypo, '--bkbg-ir-cp-'));
                return s;
            })() });

            var padding = getAspectPadding(a.aspectRatio);
            var containerStyle = {
                position: 'relative',
                borderRadius: a.borderRadius + 'px',
                overflow: 'hidden',
                maxWidth: a.maxWidth > 0 ? a.maxWidth + 'px' : '100%',
                margin: '0 auto',
            };
            if (a.aspectRatio !== 'auto' && padding) {
                containerStyle.paddingTop = padding;
                containerStyle.height = '0';
            } else {
                containerStyle.minHeight = '200px';
            }

            var imgStyle = {
                position: a.aspectRatio !== 'auto' ? 'absolute' : 'relative',
                inset: '0',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
            };

            var overlayStyle = {
                position: 'absolute',
                inset: '0',
                background: a.overlayBg,
                opacity: a.overlayOpacity / 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: a.borderRadius + 'px',
                transition: 'all ' + a.animationDuration + 'ms ease',
                pointerEvents: 'none',
            };

            return el(Fragment, null,
                el(InspectorControls, null,
                    // Image Panel
                    el(PanelBody, { title: 'Image', initialOpen: true },
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (media) {
                                    set({ imageUrl: media.url, imageId: media.id, imageAlt: media.alt || '' });
                                },
                                allowedTypes: ['image'],
                                value: a.imageId,
                                render: function (ref) {
                                    return el(Button, {
                                        onClick: ref.open,
                                        variant: a.imageUrl ? 'secondary' : 'primary',
                                        __nextHasNoMarginBottom: true,
                                    }, a.imageUrl ? __('Change Image', 'blockenberg') : __('Select Image', 'blockenberg'));
                                }
                            })
                        ),
                        a.imageUrl && el(Button, {
                            onClick: function () { set({ imageUrl: '', imageId: 0, imageAlt: '' }); },
                            isDestructive: true,
                            variant: 'link',
                            style: { marginTop: 8, display: 'block' },
                            __nextHasNoMarginBottom: true,
                        }, __('Remove Image', 'blockenberg')),
                        el('div', { style: { height: 12 } }),
                        el(TextControl, {
                            label: 'Alt Text',
                            value: a.imageAlt,
                            onChange: function (v) { set({ imageAlt: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(SelectControl, {
                            label: 'Aspect Ratio',
                            value: a.aspectRatio,
                            options: ASPECT_OPTIONS,
                            onChange: function (v) { set({ aspectRatio: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Max Width (px, 0 = full)',
                            value: a.maxWidth,
                            min: 0, max: 1400, step: 20,
                            onChange: function (v) { set({ maxWidth: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Border Radius (px)',
                            value: a.borderRadius,
                            min: 0, max: 48,
                            onChange: function (v) { set({ borderRadius: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),

                    // Reveal Panel
                    el(PanelBody, { title: 'Reveal Effect', initialOpen: true },
                        el(SelectControl, {
                            label: 'Trigger',
                            value: a.trigger,
                            options: TRIGGER_OPTIONS,
                            onChange: function (v) { set({ trigger: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(SelectControl, {
                            label: 'Reveal Style',
                            value: a.revealStyle,
                            options: STYLE_OPTIONS,
                            onChange: function (v) { set({ revealStyle: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.revealStyle === 'sweep' && el(Fragment, null,
                            el('div', { style: { height: 12 } }),
                            el(SelectControl, {
                                label: 'Direction',
                                value: a.direction,
                                options: DIRECTION_OPTIONS,
                                onChange: function (v) { set({ direction: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        ),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Animation Duration (ms)',
                            value: a.animationDuration,
                            min: 200, max: 2000, step: 50,
                            onChange: function (v) { set({ animationDuration: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        a.trigger === 'scroll' && el(Fragment, null,
                            el(RangeControl, {
                                label: 'Scroll threshold (% of element in view)',
                                value: a.scrollThreshold,
                                min: 5, max: 90,
                                onChange: function (v) { set({ scrollThreshold: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 12 } }),
                            el(ToggleControl, {
                                label: 'Reveal only once',
                                checked: a.revealOnce,
                                onChange: function (v) { set({ revealOnce: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        )
                    ),

                    // Overlay Panel
                    el(PanelBody, { title: 'Overlay & Labels', initialOpen: false },
                        el(RangeControl, {
                            label: 'Overlay Opacity (%)',
                            value: a.overlayOpacity,
                            min: 10, max: 100,
                            onChange: function (v) { set({ overlayOpacity: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(ToggleControl, {
                            label: 'Show Overlay Label',
                            checked: a.showOverlayLabel,
                            onChange: function (v) { set({ showOverlayLabel: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showOverlayLabel && el(TextControl, {
                            label: 'Overlay Label Text',
                            value: a.overlayLabel,
                            onChange: function (v) { set({ overlayLabel: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(ToggleControl, {
                            label: 'Show Revealed Label',
                            checked: a.showRevealedLabel,
                            onChange: function (v) { set({ showRevealedLabel: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showRevealedLabel && el(TextControl, {
                            label: 'Revealed Label Text',
                            value: a.revealedLabel,
                            onChange: function (v) { set({ revealedLabel: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el('div', { style: { height: 12 } }),
                        el(ToggleControl, {
                            label: 'Show Caption',
                            checked: a.showCaption,
                            onChange: function (v) { set({ showCaption: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showCaption && el(TextControl, {
                            label: 'Caption',
                            value: a.caption,
                            onChange: function (v) { set({ caption: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),

                    // Colors Panel
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypographyControl() && el(getTypographyControl(), { label: __('Label', 'blockenberg'), value: a.labelTypo, onChange: function (v) { set({ labelTypo: v }); } }),
                        getTypographyControl() && el(getTypographyControl(), { label: __('Caption', 'blockenberg'), value: a.captionTypo, onChange: function (v) { set({ captionTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Overlay Color', value: a.overlayBg, onChange: function (v) { set({ overlayBg: v || '#1e1b4b' }); } },
                            { label: 'Label Text Color', value: a.overlayTextColor, onChange: function (v) { set({ overlayTextColor: v || '#ffffff' }); } },
                            { label: 'Caption Color', value: a.captionColor, onChange: function (v) { set({ captionColor: v || '#6b7280' }); } },
                        ]
                    })
                ),

                // Editor Preview
                el('div', blockProps,
                    el('figure', { className: 'bkbg-ir-figure', style: { margin: '0', position: 'relative' } },
                        el('div', { className: 'bkbg-ir-container', style: containerStyle },
                            !a.imageUrl
                                ? el('div', {
                                    style: {
                                        position: 'absolute',
                                        inset: '0',
                                        background: '#f3f4f6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#9ca3af',
                                        fontSize: 14,
                                        minHeight: 200,
                                    }
                                }, '📷 Click "Select Image" in the sidebar')
                                : el('img', {
                                    src: a.imageUrl,
                                    alt: a.imageAlt,
                                    style: imgStyle,
                                }),
                            // Overlay preview
                            el('div', { className: 'bkbg-ir-overlay', style: overlayStyle },
                                a.showOverlayLabel && a.overlayLabel && el('div', {
                                    className: 'bkbg-ir-overlay-label',
                                    style: {
                                        color: a.overlayTextColor,
                                        textAlign: 'center',
                                        padding: '0 16px',
                                        pointerEvents: 'none',
                                    }
                                }, a.overlayLabel)
                            )
                        ),
                        a.showCaption && a.caption && el('figcaption', {
                            className: 'bkbg-ir-caption',
                            style: { color: a.captionColor, marginTop: 8, textAlign: 'center' }
                        }, a.caption)
                    ),
                    el('div', {
                        style: {
                            marginTop: 8,
                            background: '#fef3c7',
                            border: '1px solid #fbbf24',
                            borderRadius: 6,
                            padding: '6px 10px',
                            fontSize: 12,
                            color: '#92400e',
                        }
                    }, '👁 Trigger: ' + a.trigger + ' | Style: ' + a.revealStyle + (a.revealStyle === 'sweep' ? ' (' + a.direction + ')' : ''))
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-ir-app',
                    'data-opts': JSON.stringify(props.attributes),
                })
            );
        }
    });
}() );
