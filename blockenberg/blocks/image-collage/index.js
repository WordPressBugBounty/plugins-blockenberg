( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var ToggleControl = wp.components.ToggleControl;
    var TextControl = wp.components.TextControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var PRESET_OPTIONS = [
        { label: __('Scattered',  'blockenberg'), value: 'scattered' },
        { label: __('Stack',      'blockenberg'), value: 'stack' },
        { label: __('Grid',       'blockenberg'), value: 'grid' },
    ];
    var FRAME_OPTIONS = [
        { label: __('None',      'blockenberg'), value: 'none' },
        { label: __('Shadow',    'blockenberg'), value: 'shadow' },
        { label: __('Polaroid',  'blockenberg'), value: 'polaroid' },
    ];
    var ALIGN_OPTIONS = [
        { label: __('Left',   'blockenberg'), value: 'left' },
        { label: __('Center', 'blockenberg'), value: 'center' },
        { label: __('Right',  'blockenberg'), value: 'right' },
    ];
    var OVERLAY_POS_OPTIONS = [
        { label: __('Bottom right', 'blockenberg'), value: 'bottom-right' },
        { label: __('Bottom left',  'blockenberg'), value: 'bottom-left' },
        { label: __('Top right',    'blockenberg'), value: 'top-right' },
        { label: __('Top left',     'blockenberg'), value: 'top-left' },
        { label: __('Center',       'blockenberg'), value: 'center' },
    ];

    /* Preset position/rotation tables */
    var PRESETS = {
        scattered: [
            { rotation: -6, offsetX: 0,   offsetY: 0,   scale: 1.0, zIndex: 1 },
            { rotation:  4, offsetX: 30,  offsetY: 15,  scale: 0.9, zIndex: 2 },
            { rotation: -2, offsetX: 55,  offsetY: 5,   scale: 0.85, zIndex: 3 },
            { rotation:  7, offsetX: 15,  offsetY: 40,  scale: 0.8, zIndex: 2 },
            { rotation: -4, offsetX: 45,  offsetY: 35,  scale: 0.75, zIndex: 1 },
        ],
        stack: [
            { rotation: -8, offsetX: 0, offsetY: 0, scale: 1.0, zIndex: 1 },
            { rotation:  4, offsetX: 5, offsetY: 5, scale: 1.0, zIndex: 2 },
            { rotation: -2, offsetX: 2, offsetY: 2, scale: 1.0, zIndex: 3 },
            { rotation:  6, offsetX: 4, offsetY: 4, scale: 1.0, zIndex: 2 },
            { rotation: -5, offsetX: 1, offsetY: 1, scale: 1.0, zIndex: 1 },
        ],
        grid: [
            { rotation: 0, offsetX: 0,  offsetY: 0,  scale: 1.0, zIndex: 1 },
            { rotation: 0, offsetX: 52, offsetY: 0,  scale: 1.0, zIndex: 1 },
            { rotation: 0, offsetX: 0,  offsetY: 52, scale: 1.0, zIndex: 1 },
            { rotation: 0, offsetX: 52, offsetY: 52, scale: 1.0, zIndex: 1 },
            { rotation: 0, offsetX: 26, offsetY: 26, scale: 1.0, zIndex: 2 },
        ],
    };

    function makeId() { return 'ic' + Math.random().toString(36).substr(2, 6); }

    function imgStyle(img, a) {
        var w = img.w || 240;
        var h = img.h || 180;
        var fp = img.frame === 'polaroid' ? a.framePadding : (img.frame === 'shadow' ? 0 : 0);
        var style = {
            position: 'absolute',
            left: img.offsetX + '%',
            top: img.offsetY + '%',
            width: w + 'px',
            height: h + 'px',
            transform: 'rotate(' + img.rotation + 'deg) scale(' + img.scale + ')',
            zIndex: img.zIndex,
            transition: a.hoverLift ? 'transform 0.3s ease, box-shadow 0.3s ease' : undefined,
            overflow: 'hidden',
            background: '#e5e7eb',
        };
        var frame = img.frame !== 'inherit' ? img.frame : 'none';
        if (frame === 'polaroid') {
            Object.assign(style, {
                padding: a.framePadding + 'px',
                paddingBottom: (a.framePadding * 3) + 'px',
                background: a.frameColor,
                boxShadow: '0 ' + (a.shadowIntensity / 5) + 'px ' + a.shadowIntensity + 'px rgba(0,0,0,0.18)',
                overflow: 'visible',
            });
        } else if (frame === 'shadow') {
            Object.assign(style, {
                boxShadow: '0 ' + (a.shadowIntensity / 5) + 'px ' + a.shadowIntensity + 'px rgba(0,0,0,0.18)',
            });
        }
        return style;
    }

    function overlayPosStyle(pos) {
        var map = {
            'bottom-right': { bottom: '20px', right: '20px' },
            'bottom-left':  { bottom: '20px', left: '20px' },
            'top-right':    { top: '20px', right: '20px' },
            'top-left':     { top: '20px', left: '20px' },
            'center':       { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' },
        };
        return map[pos] || map['bottom-right'];
    }

    registerBlockType('blockenberg/image-collage', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var blockProps = useBlockProps({ style: (function () {
                var s = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined };
                var fn = getTypoCssVars();
                if (fn) { Object.assign(s, fn(a.headlineTypo, '--bkbg-ic-ht-'), fn(a.subtextTypo, '--bkbg-ic-st-')); }
                return s;
            })() });

            function setImg(id, patch) {
                setAttributes({ images: a.images.map(function (img) { return img.id === id ? Object.assign({}, img, patch) : img; }) });
            }
            function addImg() {
                if (a.images.length >= 5) return;
                var idx = a.images.length;
                var pre = PRESETS.scattered[idx] || PRESETS.scattered[0];
                setAttributes({ images: a.images.concat([Object.assign({ id: makeId(), url: '', mediaId: 0, frame: 'inherit', w: 240, h: 180 }, pre)]) });
            }
            function removeImg(id) {
                if (a.images.length <= 1) return;
                setAttributes({ images: a.images.filter(function (img) { return img.id !== id; }) });
            }
            function applyPreset(preset) {
                var pre = PRESETS[preset] || PRESETS.scattered;
                setAttributes({
                    preset: preset,
                    images: a.images.map(function (img, i) {
                        return Object.assign({}, img, pre[i] || pre[0]);
                    })
                });
            }

            var canvasStyle = {
                position: 'relative',
                height: a.canvasHeight + 'px',
                maxWidth: a.canvasMaxWidth + 'px',
                margin: a.align === 'center' ? '0 auto' : (a.align === 'right' ? '0 0 0 auto' : '0'),
                overflow: 'visible',
            };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Preset', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Layout preset', 'blockenberg'), value: a.preset, options: PRESET_OPTIONS, onChange: applyPreset }),
                        el(SelectControl, { label: __('Align canvas', 'blockenberg'), value: a.align, options: ALIGN_OPTIONS, onChange: function (v) { setAttributes({ align: v }); } })
                    ),
                    el(PanelBody, { title: __('Canvas', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Canvas height (px)', 'blockenberg'), value: a.canvasHeight, min: 200, max: 900, onChange: function (v) { setAttributes({ canvasHeight: v }); } }),
                        el(RangeControl, { label: __('Max width (px)', 'blockenberg'), value: a.canvasMaxWidth, min: 300, max: 1400, onChange: function (v) { setAttributes({ canvasMaxWidth: v }); } })
                    ),
                    el(PanelBody, { title: __('Frame & Effects', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Shadow intensity', 'blockenberg'), value: a.shadowIntensity, min: 0, max: 60, onChange: function (v) { setAttributes({ shadowIntensity: v }); } }),
                        el(TextControl, { label: __('Frame padding (px)', 'blockenberg'), type: 'number', value: a.framePadding, onChange: function (v) { setAttributes({ framePadding: parseInt(v, 10) || 0 }); } }),
                        el(ToggleControl, { label: __('Hover lift effect', 'blockenberg'), checked: a.hoverLift, onChange: function (v) { setAttributes({ hoverLift: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Animate in on scroll', 'blockenberg'), checked: a.animateIn, onChange: function (v) { setAttributes({ animateIn: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Overlay Card', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show overlay card', 'blockenberg'), checked: a.showOverlayCard, onChange: function (v) { setAttributes({ showOverlayCard: v }); }, __nextHasNoMarginBottom: true }),
                        a.showOverlayCard && el(Fragment, null,
                            el(TextControl, { label: __('Headline', 'blockenberg'), value: a.overlayCardText, onChange: function (v) { setAttributes({ overlayCardText: v }); } }),
                            el(TextControl, { label: __('Subtext', 'blockenberg'), value: a.overlayCardSubtext, onChange: function (v) { setAttributes({ overlayCardSubtext: v }); } }),
                            el(SelectControl, { label: __('Position', 'blockenberg'), value: a.overlayCardPos, options: OVERLAY_POS_OPTIONS, onChange: function (v) { setAttributes({ overlayCardPos: v }); } })
                        )
                    ),
                    a.showOverlayCard && el(PanelColorSettings, {
                        title: __('Overlay Card Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.overlayCardBg,    onChange: function (v) { setAttributes({ overlayCardBg: v || '' }); },    label: __('Card background', 'blockenberg') },
                            { value: a.overlayCardColor, onChange: function (v) { setAttributes({ overlayCardColor: v || '' }); }, label: __('Text color', 'blockenberg') },
                            { value: a.overlayCardAccent, onChange: function (v) { setAttributes({ overlayCardAccent: v || '' }); }, label: __('Accent line', 'blockenberg') },
                        ]
                    }),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypographyControl() && el(getTypographyControl(), { label: __('Headline', 'blockenberg'), value: a.headlineTypo, onChange: function (v) { setAttributes({ headlineTypo: v }); } }),
                        getTypographyControl() && el(getTypographyControl(), { label: __('Subtext', 'blockenberg'), value: a.subtextTypo, onChange: function (v) { setAttributes({ subtextTypo: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.frameColor, onChange: function (v) { setAttributes({ frameColor: v || '' }); }, label: __('Frame / polaroid bg', 'blockenberg') },
                            { value: a.bgColor,    onChange: function (v) { setAttributes({ bgColor: v || '' }); },    label: __('Section background', 'blockenberg') },
                        ]
                    }),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el(PanelBody, { title: __('Images', 'blockenberg'), initialOpen: true },
                        a.images.map(function (img, idx) {
                            return el(PanelBody, { key: img.id, title: (img.url ? __('Image', 'blockenberg') + ' ' + (idx + 1) : __('Empty slot', 'blockenberg') + ' ' + (idx + 1)), initialOpen: false },
                                el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function (media) { setImg(img.id, { url: media.url, mediaId: media.id, w: media.width || 240, h: media.height || 180 }); },
                                        allowedTypes: ['image'],
                                        value: img.mediaId,
                                        render: function (p) {
                                            return el('div', { style: { marginBottom: '12px' } },
                                                img.url && el('img', { src: img.url, style: { width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px', marginBottom: '6px' } }),
                                                el(Button, { onClick: p.open, variant: img.url ? 'secondary' : 'primary', size: 'compact' }, img.url ? __('Replace image', 'blockenberg') : __('Select image', 'blockenberg'))
                                            );
                                        }
                                    })
                                ),
                                el(SelectControl, { label: __('Frame', 'blockenberg'), value: img.frame, options: [{ label: __('Use global', 'blockenberg'), value: 'inherit' }].concat(FRAME_OPTIONS), onChange: function (v) { setImg(img.id, { frame: v }); } }),
                                el(RangeControl, { label: __('Rotation (°)', 'blockenberg'), value: img.rotation, min: -20, max: 20, onChange: function (v) { setImg(img.id, { rotation: v }); } }),
                                el(RangeControl, { label: __('Offset X (%)', 'blockenberg'), value: img.offsetX, min: 0, max: 80, onChange: function (v) { setImg(img.id, { offsetX: v }); } }),
                                el(RangeControl, { label: __('Offset Y (%)', 'blockenberg'), value: img.offsetY, min: 0, max: 80, onChange: function (v) { setImg(img.id, { offsetY: v }); } }),
                                el(RangeControl, { label: __('Scale (%)', 'blockenberg'), value: Math.round(img.scale * 100), min: 50, max: 150, onChange: function (v) { setImg(img.id, { scale: v / 100 }); } }),
                                el(RangeControl, { label: __('Z-index', 'blockenberg'), value: img.zIndex, min: 1, max: 10, onChange: function (v) { setImg(img.id, { zIndex: v }); } }),
                                el(RangeControl, { label: __('Width (px)', 'blockenberg'), value: img.w, min: 80, max: 600, onChange: function (v) { setImg(img.id, { w: v }); } }),
                                el(RangeControl, { label: __('Height (px)', 'blockenberg'), value: img.h, min: 60, max: 500, onChange: function (v) { setImg(img.id, { h: v }); } }),
                                a.images.length > 1 && el(Button, { onClick: function () { removeImg(img.id); }, variant: 'tertiary', isDestructive: true, size: 'compact' }, __('Remove', 'blockenberg'))
                            );
                        }),
                        a.images.length < 5 && el(Button, { onClick: addImg, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Image', 'blockenberg'))
                    )
                ),

                el('div', blockProps,
                    el('div', { style: canvasStyle },
                        a.images.map(function (img) {
                            return el('div', { key: img.id, style: imgStyle(img, a) },
                                img.url
                                    ? el('img', { src: img.url, alt: '', style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } })
                                    : el('div', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '12px' } }, __('No image', 'blockenberg'))
                            );
                        }),
                        a.showOverlayCard && el('div', {
                            style: Object.assign({ position: 'absolute', zIndex: 20, background: a.overlayCardBg || '#fff', color: a.overlayCardColor || '#1e293b', padding: '16px 22px', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', maxWidth: '260px', borderTop: '4px solid ' + (a.overlayCardAccent || '#6c3fb5') }, overlayPosStyle(a.overlayCardPos))
                        },
                            a.overlayCardText && el('p', { className: 'bkbg-ic-headline', style: { margin: '0 0 4px' } }, a.overlayCardText),
                            a.overlayCardSubtext && el('p', { className: 'bkbg-ic-subtext', style: { margin: 0, opacity: 0.75 } }, a.overlayCardSubtext)
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-image-collage-wrap' });

            var canvasStyle = {
                position: 'relative',
                height: a.canvasHeight + 'px',
                maxWidth: a.canvasMaxWidth + 'px',
                margin: a.align === 'center' ? '0 auto' : (a.align === 'right' ? '0 0 0 auto' : '0'),
                overflow: 'visible',
            };

            return el('div', Object.assign({}, blockProps, { style: (function () {
                var s = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined };
                var fn = getTypoCssVars();
                if (fn) { Object.assign(s, fn(a.headlineTypo, '--bkbg-ic-ht-'), fn(a.subtextTypo, '--bkbg-ic-st-')); }
                return s;
            })() }),
                el('div', { className: 'bkbg-image-collage bkbg-image-collage--' + a.preset, 'data-hover-lift': a.hoverLift ? '1' : '0', 'data-animate-in': a.animateIn ? '1' : '0', style: canvasStyle },
                    a.images.map(function (img) {
                        var w = img.w || 240;
                        var h = img.h || 180;
                        var frame = img.frame !== 'inherit' ? img.frame : 'none';
                        var style = {
                            position: 'absolute',
                            left: img.offsetX + '%',
                            top: img.offsetY + '%',
                            width: w + 'px',
                            height: h + 'px',
                            transform: 'rotate(' + img.rotation + 'deg) scale(' + img.scale + ')',
                            zIndex: img.zIndex,
                            overflow: frame === 'polaroid' ? 'visible' : 'hidden',
                            background: '#e5e7eb',
                        };
                        if (frame === 'polaroid') {
                            Object.assign(style, { padding: a.framePadding + 'px', paddingBottom: (a.framePadding * 3) + 'px', background: a.frameColor, boxShadow: '0 ' + (a.shadowIntensity / 5) + 'px ' + a.shadowIntensity + 'px rgba(0,0,0,0.18)' });
                        } else if (frame === 'shadow') {
                            style.boxShadow = '0 ' + (a.shadowIntensity / 5) + 'px ' + a.shadowIntensity + 'px rgba(0,0,0,0.18)';
                        }
                        return el('div', { key: img.id, className: 'bkbg-ic-img', style: style },
                            img.url && el('img', { src: img.url, alt: '', style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } })
                        );
                    }),
                    a.showOverlayCard && el('div', {
                        className: 'bkbg-ic-overlay-card',
                        style: Object.assign({ position: 'absolute', zIndex: 20, background: a.overlayCardBg || '#fff', color: a.overlayCardColor || '#1e293b', padding: '16px 22px', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', maxWidth: '260px', borderTop: '4px solid ' + (a.overlayCardAccent || '#6c3fb5') }, (function(pos) { var map = { 'bottom-right': { bottom: '20px', right: '20px' }, 'bottom-left': { bottom: '20px', left: '20px' }, 'top-right': { top: '20px', right: '20px' }, 'top-left': { top: '20px', left: '20px' }, 'center': { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' } }; return map[pos] || map['bottom-right']; })(a.overlayCardPos))
                    },
                        a.overlayCardText && el('p', { className: 'bkbg-ic-headline', style: { margin: '0 0 4px' } }, a.overlayCardText),
                        a.overlayCardSubtext && el('p', { className: 'bkbg-ic-subtext', style: { margin: 0, opacity: 0.75 } }, a.overlayCardSubtext)
                    )
                )
            );
        }
    });
}() );
