( function () {
    var el                = wp.element.createElement;
    var __                = wp.i18n.__;
    var useState          = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var MediaUpload       = wp.blockEditor.MediaUpload;
    var MediaUploadCheck  = wp.blockEditor.MediaUploadCheck;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var ToggleControl     = wp.components.ToggleControl;
    var TextControl       = wp.components.TextControl;
    var Button            = wp.components.Button;
    var Spinner           = wp.components.Spinner;
    var Fragment          = wp.element.Fragment;
    var SelectControl     = wp.components.SelectControl;
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }

    registerBlockType('blockenberg/product-360', {
        title:    __('Product 360°'),
        icon:     'image-rotate',
        category: 'bkbg-media',

        edit: function (props) {
            var attr    = props.attributes;
            var setAttr = props.setAttributes;
            var bp      = useBlockProps({ className: 'bkbg-p360-wrap' });

            var state = useState(0);
            var previewFrame = state[0];
            var setPreviewFrame = state[1];

            function addFrames(mediaItems) {
                var newFrames = mediaItems.map(function (m) {
                    return { url: m.url, alt: m.alt || '' };
                });
                setAttr({ frames: attr.frames.concat(newFrames) });
            }
            function removeFrame(idx) {
                setAttr({ frames: attr.frames.filter(function (_, i) { return i !== idx; }) });
            }
            function moveFrame(idx, dir) {
                var fs = attr.frames.slice();
                var to = idx + dir;
                if (to < 0 || to >= fs.length) return;
                var tmp = fs[idx]; fs[idx] = fs[to]; fs[to] = tmp;
                setAttr({ frames: fs });
            }

            var totalFrames = attr.frames.length;
            var currentUrl = totalFrames > 0 ? attr.frames[previewFrame % totalFrames].url : '';

            var inspector = el(InspectorControls, {},
                /* Frames */
                el(PanelBody, { title: __('Frames (' + totalFrames + ')'), initialOpen: true },
                    el('p', { style: { color: '#64748b', margin: '0 0 8px', fontSize: 12 } },
                        __('Add image frames in rotation order. More frames = smoother spin.')),
                    el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (m) { addFrames(Array.isArray(m) ? m : [m]); },
                            allowedTypes: ['image'],
                            multiple: true,
                            gallery: false,
                            render: function (ref) {
                                return el(Button, { variant: 'primary', onClick: ref.open,
                                    style: { width: '100%', marginBottom: 8 }
                                }, __('+ Add Frames'));
                            }
                        })
                    ),
                    attr.frames.map(function (f, idx) {
                        return el('div', { key: idx, style: {
                            display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4
                        }},
                            el('img', { src: f.url, style: {
                                width: 40, height: 30, objectFit: 'cover',
                                borderRadius: 4, flexShrink: 0
                            }}),
                            el('span', { style: { flex: 1, fontSize: 11, overflow: 'hidden',
                                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
                            }, idx + 1),
                            el(Button, { variant: 'secondary', size: 'small',
                                onClick: function () { moveFrame(idx, -1); },
                                disabled: idx === 0
                            }, '↑'),
                            el(Button, { variant: 'secondary', size: 'small',
                                onClick: function () { moveFrame(idx, 1); },
                                disabled: idx === totalFrames - 1
                            }, '↓'),
                            el(Button, { isDestructive: true, size: 'small',
                                onClick: function () { removeFrame(idx); }
                            }, '✕')
                        );
                    }),
                    totalFrames > 0 && el(Button, { variant: 'secondary', isDestructive: true,
                        onClick: function () { setAttr({ frames: [] }); },
                        style: { marginTop: 8 }
                    }, __('Clear All Frames'))
                ),

                /* Viewer */
                el(PanelBody, { title: __('Viewer'), initialOpen: false },
                    el(RangeControl, { label: __('Width (px)'), value: attr.viewerWidth,
                        min: 200, max: 1400,
                        onChange: function (v) { setAttr({ viewerWidth: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Height (px)'), value: attr.viewerHeight,
                        min: 120, max: 900,
                        onChange: function (v) { setAttr({ viewerHeight: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Radius (px)'), value: attr.viewerRadius,
                        min: 0, max: 40,
                        onChange: function (v) { setAttr({ viewerRadius: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                /* Behaviour */
                el(PanelBody, { title: __('Behaviour'), initialOpen: false },
                    el(RangeControl, { label: __('Drag Sensitivity'), value: attr.dragSensitivity,
                        min: 1, max: 20,
                        onChange: function (v) { setAttr({ dragSensitivity: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Auto Spin'), checked: attr.autoSpin,
                        onChange: function (v) { setAttr({ autoSpin: v }); },
                        __nextHasNoMarginBottom: true }),
                    attr.autoSpin && el(RangeControl, { label: __('Auto Speed (frames/sec)'), value: attr.autoSpeed,
                        min: 5, max: 240, step: 5,
                        onChange: function (v) { setAttr({ autoSpeed: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Progress Bar'), checked: attr.showProgress,
                        onChange: function (v) { setAttr({ showProgress: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Controls (prev/next)'), checked: attr.showControls,
                        onChange: function (v) { setAttr({ showControls: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Hint'), checked: attr.showHint,
                        onChange: function (v) { setAttr({ showHint: v }); },
                        __nextHasNoMarginBottom: true }),
                    attr.showHint && el(TextControl, { label: __('Hint Text'), value: attr.hintText,
                        onChange: function (v) { setAttr({ hintText: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                el(PanelBody, { title: __('Typography'), initialOpen: false },
                    (function () {
                        var TC = getTypoControl();
                        if (!TC) return el('p', null, 'Loading…');
                        return el(TC, { label: 'Hint', value: attr.hintTypo, onChange: function (v) { setAttr({ hintTypo: v }); } });
                    })()
                ),
                                el(PanelColorSettings, {
                    title: __('Colors'), initialOpen: false,
                    colorSettings: [
                        { label: __('Viewer BG'), value: attr.bgColor,
                          onChange: function (v) { setAttr({ bgColor: v || '#f1f5f9' }); } },
                        { label: __('Progress'), value: attr.progressColor,
                          onChange: function (v) { setAttr({ progressColor: v || '#6366f1' }); } },
                        { label: __('Hint Text'), value: attr.hintColor,
                          onChange: function (v) { setAttr({ hintColor: v || '#64748b' }); } },
                        { label: __('Controls BG'), value: attr.controlsBg,
                          onChange: function (v) { setAttr({ controlsBg: v || '#ffffff' }); } }
                    ]
                })
            );

            /* Editor preview */
            var viewerStyle = {
                width: '100%', maxWidth: attr.viewerWidth + 'px',
                height: attr.viewerHeight + 'px',
                borderRadius: attr.viewerRadius + 'px',
                background: attr.bgColor,
                position: 'relative', overflow: 'hidden',
                margin: '0 auto'
            };

            return el(wp.element.Fragment, {}, inspector,
                el('div', bp,
                    el('div', { style: viewerStyle },
                        totalFrames > 0
                            ? el('img', { src: currentUrl, style: {
                                width: '100%', height: '100%', objectFit: 'contain',
                                display: 'block'
                              }})
                            : el('div', { style: {
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                height: '100%', color: '#94a3b8', gap: 8
                              }},
                                el('span', { style: { fontSize: 40 } }, '🔄'),
                                el('span', { style: { fontSize: 14 } }, __('Add frames in the sidebar'))
                              ),
                        totalFrames > 1 && el('div', { style: {
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            display: 'flex', gap: 8, justifyContent: 'center',
                            padding: '8px', background: 'rgba(0,0,0,0.15)'
                        }},
                            el(Button, { variant: 'secondary', size: 'small',
                                onClick: function () { setPreviewFrame((previewFrame - 1 + totalFrames) % totalFrames); }
                            }, '←'),
                            el('span', { style: { color: '#fff', lineHeight: '28px', fontSize: 12 }},
                                (previewFrame + 1) + ' / ' + totalFrames),
                            el(Button, { variant: 'secondary', size: 'small',
                                onClick: function () { setPreviewFrame((previewFrame + 1) % totalFrames); }
                            }, '→')
                        )
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var bp   = useBlockProps.save();
            return el('div', bp,
                el('div', { className: 'bkbg-p360-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
