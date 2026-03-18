( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var SelectControl = wp.components.SelectControl;
    var RangeControl = wp.components.RangeControl;
    var Button = wp.components.Button;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var PRESETS = [
        { label: 'None (Custom)', value: 'none' },
        { label: 'Vivid',        value: 'vivid' },
        { label: 'Dramatic',     value: 'dramatic' },
        { label: 'Vintage',      value: 'vintage' },
        { label: 'Noir',         value: 'noir' },
        { label: 'Warm Glow',    value: 'warm' },
        { label: 'Cool Ice',     value: 'cool' },
        { label: 'Faded',        value: 'faded' },
        { label: 'Cinema',       value: 'cinema' },
        { label: 'Matte',        value: 'matte' },
        { label: 'Duotone',      value: 'duotone' },
        { label: 'High Key',     value: 'highkey' },
        { label: 'Low Key',      value: 'lowkey' },
        { label: 'Neon Pop',     value: 'neonpop' }
    ];

    var PRESET_VALUES = {
        none:     { brightness: 100, contrast: 100, saturation: 100, hueRotate: 0,   blur: 0, sepia: 0,  grayscale: 0,  invert: 0, opacity: 100 },
        vivid:    { brightness: 105, contrast: 120, saturation: 150, hueRotate: 0,   blur: 0, sepia: 0,  grayscale: 0,  invert: 0, opacity: 100 },
        dramatic: { brightness: 90,  contrast: 140, saturation: 110, hueRotate: 0,   blur: 0, sepia: 0,  grayscale: 0,  invert: 0, opacity: 100 },
        vintage:  { brightness: 105, contrast: 95,  saturation: 75,  hueRotate: 0,   blur: 0, sepia: 40, grayscale: 15, invert: 0, opacity: 95 },
        noir:     { brightness: 100, contrast: 125, saturation: 0,   hueRotate: 0,   blur: 0, sepia: 0,  grayscale: 100,invert: 0, opacity: 100 },
        warm:     { brightness: 108, contrast: 100, saturation: 110, hueRotate: 20,  blur: 0, sepia: 20, grayscale: 0,  invert: 0, opacity: 100 },
        cool:     { brightness: 103, contrast: 105, saturation: 95,  hueRotate: -30, blur: 0, sepia: 0,  grayscale: 10, invert: 0, opacity: 100 },
        faded:    { brightness: 112, contrast: 78,  saturation: 60,  hueRotate: 0,   blur: 0, sepia: 15, grayscale: 10, invert: 0, opacity: 90 },
        cinema:   { brightness: 88,  contrast: 130, saturation: 85,  hueRotate: 0,   blur: 0, sepia: 8,  grayscale: 0,  invert: 0, opacity: 100 },
        matte:    { brightness: 110, contrast: 85,  saturation: 70,  hueRotate: 0,   blur: 0, sepia: 10, grayscale: 5,  invert: 0, opacity: 88 },
        duotone:  { brightness: 100, contrast: 120, saturation: 0,   hueRotate: 0,   blur: 0, sepia: 60, grayscale: 40, invert: 0, opacity: 100 },
        highkey:  { brightness: 145, contrast: 80,  saturation: 80,  hueRotate: 0,   blur: 0, sepia: 0,  grayscale: 0,  invert: 0, opacity: 100 },
        lowkey:   { brightness: 55,  contrast: 130, saturation: 100, hueRotate: 0,   blur: 0, sepia: 0,  grayscale: 0,  invert: 0, opacity: 100 },
        neonpop:  { brightness: 110, contrast: 130, saturation: 200, hueRotate: 45,  blur: 0, sepia: 0,  grayscale: 0,  invert: 0, opacity: 100 }
    };

    var BLEND_MODES = [
        'normal','multiply','screen','overlay','darken','lighten',
        'color-dodge','color-burn','hard-light','soft-light','difference','exclusion','hue','saturation','color','luminosity'
    ].map(function (v) { return { label: v, value: v }; });

    var FIT_OPTIONS = [
        { label: 'Cover',    value: 'cover' },
        { label: 'Contain',  value: 'contain' },
        { label: 'Fill',     value: 'fill' },
        { label: 'Original', value: 'none' }
    ];

    function buildFilterString(attr) {
        var parts = [];
        if (attr.brightness  !== 100) parts.push('brightness(' + attr.brightness + '%)');
        if (attr.contrast    !== 100) parts.push('contrast(' + attr.contrast + '%)');
        if (attr.saturation  !== 100) parts.push('saturate(' + attr.saturation + '%)');
        if (attr.hueRotate   !== 0)   parts.push('hue-rotate(' + attr.hueRotate + 'deg)');
        if (attr.blur        !== 0)   parts.push('blur(' + attr.blur + 'px)');
        if (attr.sepia       !== 0)   parts.push('sepia(' + attr.sepia + '%)');
        if (attr.grayscale   !== 0)   parts.push('grayscale(' + attr.grayscale + '%)');
        if (attr.invert      !== 0)   parts.push('invert(' + attr.invert + '%)');
        if (attr.opacity     !== 100) parts.push('opacity(' + attr.opacity + '%)');
        return parts.length ? parts.join(' ') : 'none';
    }

    // Editor image placeholder / live preview
    function ImagePreview(props) {
        var attr = props.attr;
        var onSelect = props.onSelect;
        var filter = buildFilterString(attr);

        var wrapStyle = {
            position: 'relative',
            borderRadius: attr.borderRadius + 'px',
            overflow: 'hidden',
            maxWidth: attr.maxWidth ? attr.maxWidth + 'px' : '100%',
            margin: '0 auto',
            borderColor: attr.borderColor || undefined,
            borderWidth: attr.borderColor ? '2px' : undefined,
            borderStyle: attr.borderColor ? 'solid' : undefined
        };

        if (!attr.imageUrl) {
            return el(MediaUploadCheck, {},
                el(MediaUpload, {
                    onSelect: onSelect,
                    allowedTypes: ['image'],
                    value: attr.imageId,
                    render: function (ref) {
                        return el('div', {
                            style: {
                                border: '2px dashed #ccc', borderRadius: '8px', padding: '40px',
                                textAlign: 'center', cursor: 'pointer', background: '#fafafa'
                            },
                            onClick: ref.open
                        },
                            el('div', { style: { fontSize: '40px', marginBottom: '8px' } }, '🖼️'),
                            el('p', { style: { margin: 0, color: '#888' } }, __('Click to upload an image', 'blockenberg'))
                        );
                    }
                })
            );
        }

        return el('div', { style: wrapStyle },
            el('img', {
                src: attr.imageUrl,
                alt: attr.imageAlt,
                style: {
                    display: 'block', width: '100%',
                    height: attr.imageHeight ? attr.imageHeight + 'px' : 'auto',
                    objectFit: attr.objectFit,
                    filter: filter,
                    mixBlendMode: attr.blendMode !== 'normal' ? attr.blendMode : undefined,
                    transition: 'filter ' + attr.transitionMs + 'ms',
                    borderRadius: attr.borderRadius + 'px'
                }
            }),
            attr.overlayColor && attr.overlayOpacity > 0 && el('div', {
                style: {
                    position: 'absolute', inset: 0,
                    background: attr.overlayColor,
                    opacity: attr.overlayOpacity / 100,
                    borderRadius: attr.borderRadius + 'px',
                    pointerEvents: 'none'
                }
            }),
            attr.caption && el('p', {
                style: {
                    margin: 0, padding: '8px 12px', textAlign: 'center', fontSize: '14px',
                    color: attr.captionColor,
                    background: attr.captionBg || undefined
                }
            }, attr.caption)
        );
    }

    wp.blocks.registerBlockType('blockenberg/image-filter', {
        title: 'Image Filter',
        icon: 'format-image',
        category: 'bkbg-media',
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ style: (function () {
                var s = { fontFamily: 'inherit' };
                var fn = getTypoCssVars();
                if (fn) { Object.assign(s, fn(attr.captionTypo, '--bkbg-if-cp-')); }
                return s;
            })() });

            function onSelectImage(media) {
                setAttr({ imageUrl: media.url, imageId: media.id, imageAlt: media.alt || '' });
            }

            function applyPreset(v) {
                var p = PRESET_VALUES[v];
                if (p) setAttr(Object.assign({}, p, { preset: v }));
                else setAttr({ preset: v });
            }

            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Image', 'blockenberg'), initialOpen: true },
                        attr.imageUrl && el(MediaUploadCheck, {},
                            el(MediaUpload, {
                                onSelect: onSelectImage, allowedTypes: ['image'], value: attr.imageId,
                                render: function (ref) {
                                    return el(Button, {
                                        __nextHasNoMarginBottom: true,
                                        isSecondary: true,
                                        onClick: ref.open,
                                        style: { marginBottom: '8px', display: 'block' }
                                    }, __('Replace Image', 'blockenberg'));
                                }
                            })
                        ),
                        el(TextControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Alt Text', 'blockenberg'),
                            value: attr.imageAlt,
                            onChange: function (v) { setAttr({ imageAlt: v }); }
                        }),
                        el(TextareaControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Caption', 'blockenberg'),
                            value: attr.caption,
                            onChange: function (v) { setAttr({ caption: v }); }
                        })
                    ),
                    el(PanelBody, { title: __('Filter Preset', 'blockenberg'), initialOpen: false },
                        el(SelectControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Quick Preset', 'blockenberg'),
                            value: attr.preset,
                            options: PRESETS,
                            onChange: applyPreset
                        })
                    ),
                    el(PanelBody, { title: __('Custom Filter Sliders', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Brightness (%)', 'blockenberg'), value: attr.brightness, min: 0, max: 300, onChange: function (v) { setAttr({ brightness: v, preset: 'none' }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Contrast (%)', 'blockenberg'),   value: attr.contrast,   min: 0, max: 300, onChange: function (v) { setAttr({ contrast: v, preset: 'none' }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Saturation (%)', 'blockenberg'), value: attr.saturation, min: 0, max: 400, onChange: function (v) { setAttr({ saturation: v, preset: 'none' }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Hue Rotate (°)', 'blockenberg'), value: attr.hueRotate,  min: -180, max: 180, onChange: function (v) { setAttr({ hueRotate: v, preset: 'none' }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Blur (px)', 'blockenberg'),      value: attr.blur,       min: 0, max: 20,  onChange: function (v) { setAttr({ blur: v, preset: 'none' }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Sepia (%)', 'blockenberg'),      value: attr.sepia,      min: 0, max: 100, onChange: function (v) { setAttr({ sepia: v, preset: 'none' }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Grayscale (%)', 'blockenberg'),  value: attr.grayscale,  min: 0, max: 100, onChange: function (v) { setAttr({ grayscale: v, preset: 'none' }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Invert (%)', 'blockenberg'),     value: attr.invert,     min: 0, max: 100, onChange: function (v) { setAttr({ invert: v, preset: 'none' }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Opacity (%)', 'blockenberg'),    value: attr.opacity,    min: 0, max: 100, onChange: function (v) { setAttr({ opacity: v, preset: 'none' }); } })
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Max Width (0 = full)', 'blockenberg'), value: attr.maxWidth, min: 0, max: 1600, step: 20, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Image Height (0 = auto)', 'blockenberg'), value: attr.imageHeight, min: 0, max: 1000, step: 10, onChange: function (v) { setAttr({ imageHeight: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Border Radius (px)', 'blockenberg'), value: attr.borderRadius, min: 0, max: 50, onChange: function (v) { setAttr({ borderRadius: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: __('Object Fit', 'blockenberg'), value: attr.objectFit, options: FIT_OPTIONS, onChange: function (v) { setAttr({ objectFit: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: __('Blend Mode', 'blockenberg'), value: attr.blendMode, options: BLEND_MODES, onChange: function (v) { setAttr({ blendMode: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Transition (ms)', 'blockenberg'), value: attr.transitionMs, min: 0, max: 2000, step: 50, onChange: function (v) { setAttr({ transitionMs: v }); } })
                    ),
                    el(PanelBody, { title: __('Overlay', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Overlay Opacity (%)', 'blockenberg'), value: attr.overlayOpacity, min: 0, max: 100, onChange: function (v) { setAttr({ overlayOpacity: v }); } })
                    ),
                    el(PanelBody, { title: __('Frontend Controls', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Interactive Sliders', 'blockenberg'), help: __('Let visitors adjust the filter sliders on the front end', 'blockenberg'), checked: attr.showControls, onChange: function (v) { setAttr({ showControls: v }); } }),
                        attr.showControls && el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Reset Button', 'blockenberg'), checked: attr.showReset, onChange: function (v) { setAttr({ showReset: v }); } }),
                        attr.showControls && el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Preset Selector', 'blockenberg'), checked: attr.showPresets, onChange: function (v) { setAttr({ showPresets: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Overlay Color', 'blockenberg'), value: attr.overlayColor, onChange: function (v) { setAttr({ overlayColor: v || '' }); } },
                            { label: __('Caption Color', 'blockenberg'), value: attr.captionColor, onChange: function (v) { setAttr({ captionColor: v || '' }); } },
                            { label: __('Caption Background', 'blockenberg'), value: attr.captionBg, onChange: function (v) { setAttr({ captionBg: v || '' }); } },
                            { label: __('Border Color', 'blockenberg'), value: attr.borderColor, onChange: function (v) { setAttr({ borderColor: v || '' }); } }
                        ]
                    }),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypographyControl() && el(getTypographyControl(), { label: __('Caption', 'blockenberg'), value: attr.captionTypo, onChange: function (v) { setAttr({ captionTypo: v }); } })
                    ),

                ),
                el(ImagePreview, { attr: attr, onSelect: function (media) { setAttr({ imageUrl: media.url, imageId: media.id, imageAlt: media.alt || '' }); } })
            );
        },
        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-if-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
