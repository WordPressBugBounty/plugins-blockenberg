( function () {
    var el = wp.element.createElement;
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

    var ALIGN_OPTIONS = [
        { label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }
    ];
    var LENS_SHAPE_OPTIONS = [
        { label: 'Circle', value: 'circle' }, { label: 'Square', value: 'square' }
    ];
    var EFFECT_OPTIONS = [
        { label: 'Floating Lens',   value: 'lens' },
        { label: 'Side Preview Box', value: 'preview' },
    ];

    function EditorPlaceholder(a, openFn) {
        if (!a.imageUrl) {
            return el('div', {
                onClick: openFn,
                style: {
                    border: '2px dashed #c084fc', borderRadius: a.imageRadius + 'px',
                    height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', background: '#faf5ff', flexDirection: 'column', gap: '8px',
                }
            },
                el('span', { className: 'dashicons dashicons-search', style: { fontSize: '40px', width: '40px', height: '40px', color: '#c084fc', lineHeight: 1 } }),
                el('span', { style: { color: '#a855f7', fontWeight: 600 } }, __('Click to select image', 'blockenberg')),
                el('span', { style: { color: '#c4b5fd', fontSize: '13px' } }, __('Opens with zoom lens on hover', 'blockenberg')),
            );
        }
        return el('div', { style: { position: 'relative', textAlign: a.align } },
            el('div', { style: { display: 'inline-block', position: 'relative', maxWidth: '100%' } },
                el('img', {
                    src: a.imageUrl, alt: a.alt,
                    style: { maxWidth: '100%', width: a.width + 'px', display: 'block', borderRadius: a.imageRadius + 'px' }
                }),
                /* lens demo in editor */
                el('div', {
                    style: {
                        position: 'absolute', width: a.lensSize + 'px', height: a.lensSize + 'px',
                        borderRadius: a.lensShape === 'circle' ? '50%' : a.imageRadius + 'px',
                        border: a.lensBorderWidth + 'px solid ' + a.lensBorderColor,
                        boxShadow: a.lensShadow ? '0 4px 20px rgba(0,0,0,0.25)' : 'none',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%,-50%)',
                        pointerEvents: 'none', zIndex: 2,
                        backgroundImage: 'url(' + a.imageUrl + ')',
                        backgroundSize: (a.zoomFactor) + '% ' + (a.zoomFactor) + '%',
                        backgroundPosition: '50% 50%',
                        backgroundRepeat: 'no-repeat',
                        overflow: 'hidden',
                        opacity: 0.85,
                    }
                }),
                el('div', {
                    style: {
                        position: 'absolute', bottom: '8px', right: '8px', zIndex: 3,
                        background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
                    }
                }, '🔍 Editor preview'),
            ),
            a.showCaption && a.caption && el('p', {
                className: 'bkmag-caption',
                style: { color: a.captionColor, marginTop: '8px', textAlign: 'center' }
            }, a.caption),
        );
    }

    registerBlockType('blockenberg/image-magnifier', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ style: (function () {
                var s = { textAlign: a.align };
                var fn = getTypoCssVars();
                if (fn) { Object.assign(s, fn(a.captionTypo, '--bkmag-cp-')); }
                return s;
            })() });

            return el('div', blockProps,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Image', 'blockenberg'), initialOpen: true },
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (m) { set({ imageUrl: m.url, imageId: m.id, alt: m.alt || '' }); },
                                allowedTypes: ['image'], value: a.imageId,
                                render: function (ref) {
                                    return el(Button, {
                                        onClick: ref.open, variant: 'secondary',
                                        style: { width: '100%', justifyContent: 'center', marginBottom: '6px' }
                                    }, a.imageUrl ? __('Change Image') : __('Select Image'));
                                }
                            })
                        ),
                        a.imageUrl && el(Button, {
                            isDestructive: true, isSmall: true,
                            onClick: function () { set({ imageUrl: '', imageId: 0 }); }
                        }, __('Remove Image')),
                        el(TextControl, {
                            label: __('Alt Text'), value: a.alt,
                            onChange: function (v) { set({ alt: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Max Width (px)'), value: a.width, min: 200, max: 1200,
                            onChange: function (v) { set({ width: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Border Radius (px)'), value: a.imageRadius, min: 0, max: 32,
                            onChange: function (v) { set({ imageRadius: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Alignment'), value: a.align, options: ALIGN_OPTIONS,
                            onChange: function (v) { set({ align: v }); }
                        }),
                    ),
                    el(PanelBody, { title: __('Zoom Effect', 'blockenberg'), initialOpen: false },
                        el(SelectControl, {
                            label: __('Effect Type'), value: a.effectType, options: EFFECT_OPTIONS,
                            onChange: function (v) { set({ effectType: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Zoom Factor %'), value: a.zoomFactor, min: 110, max: 500,
                            onChange: function (v) { set({ zoomFactor: v }); }
                        }),
                        a.effectType === 'lens' && el(RangeControl, {
                            label: __('Lens Size (px)'), value: a.lensSize, min: 60, max: 400,
                            onChange: function (v) { set({ lensSize: v }); }
                        }),
                        a.effectType === 'lens' && el(SelectControl, {
                            label: __('Lens Shape'), value: a.lensShape, options: LENS_SHAPE_OPTIONS,
                            onChange: function (v) { set({ lensShape: v }); }
                        }),
                        a.effectType === 'lens' && el(RangeControl, {
                            label: __('Lens Border Width (px)'), value: a.lensBorderWidth, min: 0, max: 6,
                            onChange: function (v) { set({ lensBorderWidth: v }); }
                        }),
                        a.effectType === 'lens' && el(ToggleControl, {
                            label: __('Lens Shadow'), checked: a.lensShadow,
                            onChange: function (v) { set({ lensShadow: v }); }, __nextHasNoMarginBottom: true
                        }),
                        a.effectType === 'preview' && el(RangeControl, {
                            label: __('Preview Width (px)'), value: a.previewWidth, min: 150, max: 600,
                            onChange: function (v) { set({ previewWidth: v }); }
                        }),
                        a.effectType === 'preview' && el(RangeControl, {
                            label: __('Preview Height (px)'), value: a.previewHeight, min: 150, max: 600,
                            onChange: function (v) { set({ previewHeight: v }); }
                        }),
                    ),
                    el(PanelBody, { title: __('Caption & Hint', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show Caption'), checked: a.showCaption,
                            onChange: function (v) { set({ showCaption: v }); }, __nextHasNoMarginBottom: true
                        }),
                        a.showCaption && el(TextControl, {
                            label: __('Caption'), value: a.caption,
                            onChange: function (v) { set({ caption: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show Hover Hint'), checked: a.showHint,
                            onChange: function (v) { set({ showHint: v }); }, __nextHasNoMarginBottom: true
                        }),
                        a.showHint && el(TextControl, {
                            label: __('Hint Text'), value: a.hint,
                            onChange: function (v) { set({ hint: v }); }
                        }),
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Lens Border'), value: a.lensBorderColor, onChange: function (v) { set({ lensBorderColor: v || '#6c3fb5' }); } },
                            { label: __('Preview Border'), value: a.previewBorder, onChange: function (v) { set({ previewBorder: v || '#e5e7eb' }); } },
                            { label: __('Caption Color'), value: a.captionColor, onChange: function (v) { set({ captionColor: v || '#6b7280' }); } },
                            { label: __('Hint Color'), value: a.hintColor, onChange: function (v) { set({ hintColor: v || '#9ca3af' }); } },
                        ]
                    }),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypographyControl() && el(getTypographyControl(), { label: __('Caption', 'blockenberg'), value: a.captionTypo, onChange: function (v) { set({ captionTypo: v }); } })
                    ),

                ),
                el(MediaUploadCheck, null,
                    el(MediaUpload, {
                        onSelect: function (m) { set({ imageUrl: m.url, imageId: m.id, alt: m.alt || '' }); },
                        allowedTypes: ['image'], value: a.imageId,
                        render: function (ref) { return EditorPlaceholder(a, ref.open); }
                    })
                ),
            );
        },

        save: function (props) {
            var a = props.attributes;
            if (!a.imageUrl) return el('div', { className: 'bkmag-wrap' });

            return el('div', {
                className: 'bkmag-wrap',
                style: (function () {
                    var s = { textAlign: a.align };
                    var fn = getTypoCssVars();
                    if (fn) { Object.assign(s, fn(a.captionTypo, '--bkmag-cp-')); }
                    return s;
                })()
            },
                el('div', {
                    className: 'bkmag-container',
                    'data-zoom': a.zoomFactor,
                    'data-lens-size': a.lensSize,
                    'data-lens-shape': a.lensShape,
                    'data-lens-border': a.lensBorderColor,
                    'data-lens-border-w': a.lensBorderWidth,
                    'data-lens-shadow': a.lensShadow ? '1' : '0',
                    'data-effect': a.effectType,
                    'data-preview-w': a.previewWidth,
                    'data-preview-h': a.previewHeight,
                    'data-preview-border': a.previewBorder,
                    'data-preview-radius': a.previewRadius,
                    style: { display: 'inline-block', position: 'relative', maxWidth: '100%', cursor: 'crosshair' }
                },
                    el('img', {
                        className: 'bkmag-img',
                        src: a.imageUrl, alt: a.alt,
                        style: { width: a.width + 'px', maxWidth: '100%', display: 'block', borderRadius: a.imageRadius + 'px', userSelect: 'none', WebkitUserDrag: 'none' }
                    }),
                    a.showHint && el('div', {
                        className: 'bkmag-hint',
                        style: { textAlign: 'center', color: a.hintColor, fontSize: '12px', marginTop: '6px', position: 'absolute', bottom: '-24px', left: 0, right: 0 }
                    }, a.hint),
                ),
                a.showCaption && a.caption && el('p', {
                    className: 'bkmag-caption',
                    style: { color: a.captionColor, marginTop: '32px', textAlign: 'center' }
                }, a.caption),
            );
        }
    });
}() );
