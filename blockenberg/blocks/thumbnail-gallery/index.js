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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var _tvf = function (typo, prefix) { var fn = getTypoCssVars(); return fn ? fn(typo, prefix) : {}; };

    /* ─── helpers ─── */
    function updateItem(arr, idx, field, val) {
        return arr.map(function (item, i) {
            if (i !== idx) return item;
            var p = {}; p[field] = val;
            return Object.assign({}, item, p);
        });
    }

    function moveItem(arr, from, to) {
        var a = arr.slice();
        var item = a.splice(from, 1)[0];
        a.splice(to, 0, item);
        return a;
    }

    /* ─── ImageEditor ─── */
    function ImageEditor(props) {
        var images = props.images;
        var onChange = props.onChange;
        var activeIdx = props.activeIdx;
        var setActiveIdx = props.setActiveIdx;

        return el(Fragment, null,
            el('div', { className: 'bkbg-tgal-img-list' },
                images.map(function (img, idx) {
                    return el('div', {
                        key: idx,
                        className: 'bkbg-tgal-img-item' + (idx === activeIdx ? ' is-active' : ''),
                        style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', padding: '6px', border: '1px solid ' + (idx === activeIdx ? '#6366f1' : '#e5e7eb'), borderRadius: '6px', cursor: 'pointer' },
                        onClick: function () { setActiveIdx(idx); }
                    },
                        el('div', {
                            style: {
                                width: '48px', height: '36px', flexShrink: 0, borderRadius: '4px',
                                background: img.url ? 'url(' + img.url + ') center/cover' : '#e5e7eb'
                            }
                        }),
                        el('div', { style: { flex: 1, minWidth: 0 } },
                            el('div', { style: { fontWeight: '600', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, img.title || img.alt || 'Image ' + (idx + 1)),
                            el('div', { style: { fontSize: '11px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, img.caption || '—')
                        ),
                        el('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
                            el(Button, {
                                icon: 'arrow-up-alt2', isSmall: true,
                                disabled: idx === 0,
                                onClick: function (e) { e.stopPropagation(); onChange(moveItem(images, idx, idx - 1)); setActiveIdx(idx - 1); }
                            }),
                            el(Button, {
                                icon: 'arrow-down-alt2', isSmall: true,
                                disabled: idx === images.length - 1,
                                onClick: function (e) { e.stopPropagation(); onChange(moveItem(images, idx, idx + 1)); setActiveIdx(idx + 1); }
                            }),
                            el(Button, {
                                icon: 'no-alt', isSmall: true, isDestructive: true,
                                onClick: function (e) { e.stopPropagation(); var a = images.slice(); a.splice(idx, 1); onChange(a); setActiveIdx(Math.max(0, idx - 1)); }
                            })
                        )
                    );
                }),
                /* add button */
                el(MediaUploadCheck, null,
                    el(MediaUpload, {
                        onSelect: function (media) {
                            var newImgs = Array.isArray(media)
                                ? media.map(function (m) { return { url: m.url || '', id: m.id || 0, alt: m.alt || '', caption: m.caption || '', title: m.title || m.alt || '' }; })
                                : [{ url: media.url || '', id: media.id || 0, alt: media.alt || '', caption: media.caption || '', title: media.title || media.alt || '' }];
                            onChange(images.concat(newImgs));
                        },
                        allowedTypes: ['image'],
                        multiple: true,
                        render: function (ref) {
                            return el(Button, {
                                onClick: ref.open,
                                variant: 'secondary',
                                style: { marginTop: '8px', width: '100%', justifyContent: 'center' }
                            }, __('+ Add Images', 'blockenberg'));
                        }
                    })
                )
            ),

            /* active image fields */
            activeIdx < images.length && el('div', { style: { marginTop: '12px', padding: '10px', background: '#f8fafc', borderRadius: '6px' } },
                el('div', { style: { fontWeight: '600', fontSize: '12px', marginBottom: '8px', color: '#374151' } }, __('Image ' + (activeIdx + 1) + ' Details', 'blockenberg')),
                el(TextControl, {
                    label: __('Title', 'blockenberg'),
                    value: images[activeIdx].title || '',
                    onChange: function (v) { onChange(updateItem(images, activeIdx, 'title', v)); },
                    __nextHasNoMarginBottom: true
                }),
                el('div', { style: { marginTop: '8px' } },
                    el(TextControl, {
                        label: __('Caption', 'blockenberg'),
                        value: images[activeIdx].caption || '',
                        onChange: function (v) { onChange(updateItem(images, activeIdx, 'caption', v)); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                el('div', { style: { marginTop: '8px' } },
                    el(TextControl, {
                        label: __('Alt Text', 'blockenberg'),
                        value: images[activeIdx].alt || '',
                        onChange: function (v) { onChange(updateItem(images, activeIdx, 'alt', v)); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                el('div', { style: { marginTop: '8px' } },
                    el(MediaUploadCheck, null,
                        el(MediaUpload, {
                            onSelect: function (media) {
                                var newImg = Object.assign({}, images[activeIdx], {
                                    url: media.url || '', id: media.id || 0,
                                    alt: images[activeIdx].alt || media.alt || '',
                                    caption: images[activeIdx].caption || media.caption || '',
                                    title: images[activeIdx].title || media.title || ''
                                });
                                onChange(updateItem(images, activeIdx, 'url', newImg.url));
                            },
                            allowedTypes: ['image'],
                            render: function (ref) {
                                return el(Button, { onClick: ref.open, variant: 'secondary', isSmall: true }, __('Replace Image', 'blockenberg'));
                            }
                        })
                    )
                )
            )
        );
    }

    /* ─── GalleryPreview ─── */
    function GalleryPreview(props) {
        var a = props.attributes;
        var images = a.images;
        var activeState = useState(0);
        var activeIdx = activeState[0];
        var setActiveIdx = activeState[1];

        if (!images || images.length === 0) {
            return el('div', {
                style: { padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#9ca3af' }
            }, __('Add images to preview the gallery', 'blockenberg'));
        }

        var activeImg = images[Math.min(activeIdx, images.length - 1)];
        var isVert = a.thumbPosition === 'left' || a.thumbPosition === 'right';

        var mainStyle = {
            position: 'relative',
            background: a.mainBg || '#000',
            borderRadius: a.mainBorderRadius + 'px',
            overflow: 'hidden',
            aspectRatio: a.mainAspect || '16/9',
            flex: '1 1 auto',
            minWidth: 0
        };

        var thumbStrip = el('div', {
            style: {
                display: 'flex',
                flexDirection: isVert ? 'column' : 'row',
                gap: a.thumbGap + 'px',
                overflowX: isVert ? 'hidden' : 'auto',
                overflowY: isVert ? 'auto' : 'hidden',
                flexShrink: 0,
                padding: '4px'
            }
        },
            images.map(function (img, idx) {
                var isActive = idx === activeIdx;
                return el('div', {
                    key: idx,
                    onClick: function () { setActiveIdx(idx); },
                    style: {
                        flexShrink: 0,
                        width: isVert ? a.thumbSize + 'px' : a.thumbSize * 1.4 + 'px',
                        height: a.thumbSize + 'px',
                        borderRadius: a.thumbBorderRadius + 'px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: isActive ? (a.thumbActiveBorderWidth || 2) + 'px solid ' + a.thumbActiveBorder : (a.thumbActiveBorderWidth || 2) + 'px solid transparent',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s',
                        background: img.url ? 'url(' + img.url + ') center/' + (a.mainObjectFit || 'cover') : a.thumbBg || '#e5e7eb'
                    }
                });
            })
        );

        var mainArea = el('div', { style: mainStyle },
            activeImg.url && el('img', {
                src: activeImg.url,
                alt: activeImg.alt || '',
                style: { width: '100%', height: '100%', objectFit: a.mainObjectFit || 'cover', display: 'block' }
            }),
            /* caption */
            a.showCaptions && activeImg.caption && el('div', {
                className: 'bkbg-tgal-caption',
                style: {
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: a.captionBg || 'rgba(0,0,0,0.6)',
                    color: a.captionColor || '#fff',
                    padding: '8px 14px'
                }
            }, activeImg.caption),
            /* counter */
            a.showCounter && el('div', {
                className: 'bkbg-tgal-counter',
                style: {
                    position: 'absolute', top: '10px', right: '10px',
                    background: a.counterBg || 'rgba(0,0,0,0.55)',
                    color: a.counterColor || '#fff',
                    borderRadius: '20px',
                    padding: '2px 10px'
                }
            }, (activeIdx + 1) + ' / ' + images.length),
            /* zoom icon */
            a.showZoom && el('div', {
                style: {
                    position: 'absolute', top: '10px', left: '10px',
                    background: a.zoomIconBg || 'rgba(0,0,0,0.45)',
                    color: a.zoomIconColor || '#fff',
                    borderRadius: '6px',
                    padding: '4px 7px',
                    fontSize: '14px',
                    cursor: 'zoom-in'
                }
            }, '⤢'),
            /* arrows */
            a.showArrows && images.length > 1 && el(Fragment, null,
                el('div', {
                    style: {
                        position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                        background: a.arrowBg || 'rgba(0,0,0,0.45)', color: a.arrowColor || '#fff',
                        width: '32px', height: '32px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontSize: '16px'
                    },
                    onClick: function () { setActiveIdx((activeIdx - 1 + images.length) % images.length); }
                }, '‹'),
                el('div', {
                    style: {
                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                        background: a.arrowBg || 'rgba(0,0,0,0.45)', color: a.arrowColor || '#fff',
                        width: '32px', height: '32px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontSize: '16px'
                    },
                    onClick: function () { setActiveIdx((activeIdx + 1) % images.length); }
                }, '›')
            )
        );

        var containerStyle = {
            display: 'flex',
            flexDirection: isVert ? 'row' : (a.thumbPosition === 'top' ? 'column-reverse' : 'column'),
            gap: '12px'
        };

        if (a.thumbPosition === 'left') {
            containerStyle.flexDirection = 'row';
        } else if (a.thumbPosition === 'right') {
            containerStyle.flexDirection = 'row-reverse';
        }

        return el('div', { style: containerStyle },
            a.thumbPosition === 'top' ? thumbStrip : null,
            a.thumbPosition === 'left' ? thumbStrip : null,
            mainArea,
            a.thumbPosition === 'right' ? thumbStrip : null,
            a.thumbPosition === 'bottom' || !a.thumbPosition ? thumbStrip : null
        );
    }

    /* ─── register ─── */
    registerBlockType('blockenberg/thumbnail-gallery', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var imgIdxState = useState(0);
            var imgIdx = imgIdxState[0];
            var setImgIdx = imgIdxState[1];

            var blockProps = useBlockProps((function () {
                var s = {
                    paddingTop: (a.paddingTop || 0) + 'px',
                    paddingBottom: (a.paddingBottom || 0) + 'px',
                    background: a.bgColor
                };
                var tv = Object.assign({}, _tvf(a.captionTypo, '--bktg-cp-'), _tvf(a.counterTypo, '--bktg-ct-'));
                return { style: Object.assign(s, tv) };
            })());

            var inspector = el(InspectorControls, null,
                /* Images */
                el(PanelBody, { title: __('Images', 'blockenberg'), initialOpen: true },
                    el(ImageEditor, {
                        images: a.images,
                        onChange: function (v) { set({ images: v }); },
                        activeIdx: imgIdx,
                        setActiveIdx: setImgIdx
                    })
                ),

                /* Layout */
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Thumbnail Position', 'blockenberg'),
                        value: a.thumbPosition,
                        options: [
                            { value: 'bottom', label: 'Bottom' },
                            { value: 'top', label: 'Top' },
                            { value: 'left', label: 'Left' },
                            { value: 'right', label: 'Right' }
                        ],
                        onChange: function (v) { set({ thumbPosition: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el('div', { style: { marginTop: '8px' } },
                        el(SelectControl, {
                            label: __('Main Aspect Ratio', 'blockenberg'),
                            value: a.mainAspect,
                            options: [
                                { value: '16/9', label: '16:9 Widescreen' },
                                { value: '4/3', label: '4:3 Standard' },
                                { value: '3/2', label: '3:2 Photo' },
                                { value: '1/1', label: '1:1 Square' },
                                { value: '3/4', label: '3:4 Portrait' }
                            ],
                            onChange: function (v) { set({ mainAspect: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(SelectControl, {
                            label: __('Image Fit', 'blockenberg'),
                            value: a.mainObjectFit,
                            options: [
                                { value: 'cover', label: 'Cover' },
                                { value: 'contain', label: 'Contain' }
                            ],
                            onChange: function (v) { set({ mainObjectFit: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(SelectControl, {
                            label: __('Animation', 'blockenberg'),
                            value: a.animationType,
                            options: [
                                { value: 'fade', label: 'Fade' },
                                { value: 'slide', label: 'Slide' }
                            ],
                            onChange: function (v) { set({ animationType: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, {
                            label: __('Max Width (px)', 'blockenberg'),
                            value: a.maxWidth,
                            min: 400, max: 1600, step: 20,
                            onChange: function (v) { set({ maxWidth: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    )
                ),

                /* Thumbnails */
                el(PanelBody, { title: __('Thumbnails', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Thumbnail Size (px)', 'blockenberg'),
                        value: a.thumbSize,
                        min: 40, max: 160, step: 4,
                        onChange: function (v) { set({ thumbSize: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, {
                            label: __('Thumbnail Gap (px)', 'blockenberg'),
                            value: a.thumbGap,
                            min: 0, max: 24, step: 2,
                            onChange: function (v) { set({ thumbGap: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, {
                            label: __('Thumbnail Border Radius', 'blockenberg'),
                            value: a.thumbBorderRadius,
                            min: 0, max: 20,
                            onChange: function (v) { set({ thumbBorderRadius: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, {
                            label: __('Active Border Width (px)', 'blockenberg'),
                            value: a.thumbActiveBorderWidth,
                            min: 1, max: 6,
                            onChange: function (v) { set({ thumbActiveBorderWidth: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    )
                ),

                /* Options */
                el(PanelBody, { title: __('Options', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Captions', 'blockenberg'),
                        checked: a.showCaptions,
                        onChange: function (v) { set({ showCaptions: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show Counter', 'blockenberg'),
                        checked: a.showCounter,
                        onChange: function (v) { set({ showCounter: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show Navigation Arrows', 'blockenberg'),
                        checked: a.showArrows,
                        onChange: function (v) { set({ showArrows: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show Zoom Button', 'blockenberg'),
                        checked: a.showZoom,
                        onChange: function (v) { set({ showZoom: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Auto-Play', 'blockenberg'),
                        checked: a.autoPlay,
                        onChange: function (v) { set({ autoPlay: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    a.autoPlay && el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, {
                            label: __('Auto-Play Delay (ms)', 'blockenberg'),
                            value: a.autoPlayDelay,
                            min: 1000, max: 10000, step: 500,
                            onChange: function (v) { set({ autoPlayDelay: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, {
                            label: __('Main Border Radius', 'blockenberg'),
                            value: a.mainBorderRadius,
                            min: 0, max: 32,
                            onChange: function (v) { set({ mainBorderRadius: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, {
                            label: __('Padding Top (px)', 'blockenberg'),
                            value: a.paddingTop,
                            min: 0, max: 120, step: 4,
                            onChange: function (v) { set({ paddingTop: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, {
                            label: __('Padding Bottom (px)', 'blockenberg'),
                            value: a.paddingBottom,
                            min: 0, max: 120, step: 4,
                            onChange: function (v) { set({ paddingBottom: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    )
                ),

                /* Typography */
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), {
                        label: __('Caption Typography', 'blockenberg'),
                        value: a.captionTypo || {},
                        onChange: function (v) { set({ captionTypo: v }); }
                    }),
                    getTypoControl() && el(getTypoControl(), {
                        label: __('Counter Typography', 'blockenberg'),
                        value: a.counterTypo || {},
                        onChange: function (v) { set({ counterTypo: v }); }
                    })
                ),

                /* Colors */
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.bgColor, onChange: function (v) { set({ bgColor: v }); }, label: __('Background', 'blockenberg') },
                        { value: a.mainBg, onChange: function (v) { set({ mainBg: v }); }, label: __('Main Image Background', 'blockenberg') },
                        { value: a.captionBg, onChange: function (v) { set({ captionBg: v }); }, label: __('Caption Background', 'blockenberg') },
                        { value: a.captionColor, onChange: function (v) { set({ captionColor: v }); }, label: __('Caption Text', 'blockenberg') },
                        { value: a.counterBg, onChange: function (v) { set({ counterBg: v }); }, label: __('Counter Background', 'blockenberg') },
                        { value: a.counterColor, onChange: function (v) { set({ counterColor: v }); }, label: __('Counter Text', 'blockenberg') },
                        { value: a.thumbActiveBorder, onChange: function (v) { set({ thumbActiveBorder: v }); }, label: __('Active Thumb Border', 'blockenberg') },
                        { value: a.thumbBg, onChange: function (v) { set({ thumbBg: v }); }, label: __('Thumbnail Background', 'blockenberg') },
                        { value: a.arrowBg, onChange: function (v) { set({ arrowBg: v }); }, label: __('Arrow Background', 'blockenberg') },
                        { value: a.arrowColor, onChange: function (v) { set({ arrowColor: v }); }, label: __('Arrow Icon', 'blockenberg') }
                    ]
                })
            );

            var previewWrap = el('div', {
                style: { maxWidth: a.maxWidth + 'px', margin: '0 auto' }
            },
                el(GalleryPreview, { attributes: a })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps, previewWrap)
            );
        },

        save: function (props) {
            var a = props.attributes;
            var bp = useBlockProps.save((function () {
                var tv = Object.assign({}, _tvf(a.captionTypo, '--bktg-cp-'), _tvf(a.counterTypo, '--bktg-ct-'));
                return { style: tv };
            })());
            return el('div', bp,
                el('div', { className: 'bkbg-tgal-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
