( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InnerBlocks = wp.blockEditor.InnerBlocks;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var Notice = wp.components.Notice;

    /* ── hex alpha ─────────────────────────────────────────────────────────── */
    function hexAlpha(opacity) {
        return Math.round(opacity / 100 * 255).toString(16).padStart(2, '0');
    }

    function buildOverlayBg(a) {
        if (a.overlayGradient) {
            var hex1 = (a.overlayGradientStart || '#000000') + hexAlpha(a.overlayOpacity);
            return 'linear-gradient(' + a.overlayGradientDir + ', ' + hex1 + ', ' + (a.overlayGradientEnd || 'transparent') + ')';
        }
        return (a.overlayColor || '#000000') + hexAlpha(a.overlayOpacity);
    }

    /* ── YouTube ID extractor ──────────────────────────────────────────────── */
    function extractYoutubeId(raw) {
        raw = raw.trim();
        var m = raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (m) { return m[1]; }
        if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) { return raw; }
        return raw;
    }

    function extractVimeoId(raw) {
        raw = raw.trim();
        var m = raw.match(/vimeo\.com\/(\d+)/);
        if (m) { return m[1]; }
        if (/^\d+$/.test(raw)) { return raw; }
        return raw;
    }

    /* ── Editor preview ────────────────────────────────────────────────────── */
    function EditorMediaPreview(props) {
        var a = props.a;
        if (a.videoType === 'hosted' && a.videoUrl) {
            return el('video', {
                src: a.videoUrl,
                poster: a.posterUrl || undefined,
                muted: true, loop: true, autoPlay: false,
                style: { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: a.objectFit, objectPosition: a.objectPosition, pointerEvents: 'none' }
            });
        }
        if (a.posterUrl) {
            return el('img', {
                src: a.posterUrl, alt: a.posterAlt || '',
                style: { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: a.objectFit, objectPosition: a.objectPosition, pointerEvents: 'none' }
            });
        }
        return el('div', {
            style: { position: 'absolute', inset: '0', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '14px', pointerEvents: 'none' }
        }, '▶ ' + (a.videoType === 'youtube' ? 'YouTube' : a.videoType === 'vimeo' ? 'Vimeo' : 'Video') + ' background (plays on frontend)');
    }

    registerBlockType('blockenberg/background-video', {
        title: __('Background Video', 'blockenberg'),
        icon: 'format-video',
        category: 'bkbg-media',
        description: __('Looping autoplay background video section.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            var justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
            var alignMap   = { top: 'flex-start', center: 'center', bottom: 'flex-end' };

            var videoTypeOptions = [
                { label: __('Self-Hosted (MP4/WebM)', 'blockenberg'), value: 'hosted' },
                { label: __('YouTube',               'blockenberg'), value: 'youtube' },
                { label: __('Vimeo',                 'blockenberg'), value: 'vimeo' },
            ];
            var gradDirOptions = [
                { label: 'Top → Bottom',  value: 'to bottom' },
                { label: 'Bottom → Top',  value: 'to top' },
                { label: 'Left → Right',  value: 'to right' },
                { label: 'Right → Left',  value: 'to left' },
                { label: 'Diagonal ↘',    value: 'to bottom right' },
                { label: 'Diagonal ↗',    value: 'to top right' },
            ];
            var contentAlignOptions = [
                { label: 'Left',   value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right',  value: 'right' },
            ];
            var contentVAlignOptions = [
                { label: 'Top',    value: 'top' },
                { label: 'Middle', value: 'center' },
                { label: 'Bottom', value: 'bottom' },
            ];
            var objectFitOptions = [
                { label: 'Cover',   value: 'cover' },
                { label: 'Contain', value: 'contain' },
                { label: 'Fill',    value: 'fill' },
            ];
            var objectPosOptions = [
                { label: 'Center', value: 'center center' },
                { label: 'Top',    value: 'top center' },
                { label: 'Bottom', value: 'bottom center' },
                { label: 'Left',   value: 'center left' },
                { label: 'Right',  value: 'center right' },
            ];

            var blockProps = useBlockProps({ className: 'bkbv-outer' });

            return el(Fragment, null,
                el(InspectorControls, null,

                    /* — Video Source — */
                    el(PanelBody, { title: __('Video Source', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Video Type', 'blockenberg'), value: a.videoType, options: videoTypeOptions, onChange: function (v) { setAttributes({ videoType: v }); } }),

                        a.videoType === 'hosted' && el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (m) { setAttributes({ videoUrl: m.url, videoId: m.id }); },
                                allowedTypes: ['video'],
                                value: a.videoId,
                                render: function (ref) {
                                    return el('div', null,
                                        a.videoUrl && el('p', { style: { fontSize: '12px', color: '#6b7280', wordBreak: 'break-all', margin: '0 0 6px' } }, a.videoUrl.split('/').pop()),
                                        el(Button, { variant: a.videoUrl ? 'secondary' : 'primary', onClick: ref.open, style: { width: '100%', marginBottom: '4px' } },
                                            a.videoUrl ? __('Replace Video', 'blockenberg') : __('Choose Video File', 'blockenberg')
                                        ),
                                        a.videoUrl && el(Button, {
                                            variant: 'tertiary', isDestructive: true,
                                            onClick: function () { setAttributes({ videoUrl: '', videoId: 0 }); }
                                        }, __('Remove Video', 'blockenberg'))
                                    );
                                }
                            })
                        ),

                        a.videoType === 'youtube' && el('div', null,
                            el(TextControl, {
                                label: __('YouTube ID or URL', 'blockenberg'),
                                value: a.youtubeId,
                                placeholder: 'dQw4w9WgXcQ',
                                help: __('Paste the full URL or just the video ID.', 'blockenberg'),
                                onChange: function (v) { setAttributes({ youtubeId: extractYoutubeId(v) }); }
                            }),
                            el(Notice, { status: 'info', isDismissible: false },
                                __('YouTube will not autoplay unless muted. This is handled automatically.', 'blockenberg')
                            )
                        ),

                        a.videoType === 'vimeo' && el(TextControl, {
                            label: __('Vimeo ID or URL', 'blockenberg'),
                            value: a.vimeoId,
                            placeholder: '123456789',
                            help: __('Paste the full URL or just the numeric ID.', 'blockenberg'),
                            onChange: function (v) { setAttributes({ vimeoId: extractVimeoId(v) }); }
                        }),

                        el('hr', { style: { margin: '12px 0' } }),
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (m) { setAttributes({ posterUrl: m.url, posterId: m.id, posterAlt: m.alt || '' }); },
                                allowedTypes: ['image'],
                                value: a.posterId,
                                render: function (ref) {
                                    return el('div', null,
                                        a.posterUrl && el('img', { src: a.posterUrl, style: { width: '100%', height: '60px', objectFit: 'cover', borderRadius: '4px', marginBottom: '6px' } }),
                                        el(Button, { variant: a.posterUrl ? 'secondary' : 'tertiary', onClick: ref.open, style: { width: '100%', marginBottom: '4px' } },
                                            a.posterUrl ? __('Replace Poster Image', 'blockenberg') : __('Set Poster / Fallback Image', 'blockenberg')
                                        ),
                                        a.posterUrl && el(Button, { variant: 'tertiary', isDestructive: true, onClick: function () { setAttributes({ posterUrl: '', posterId: 0 }); } }, __('Remove Poster', 'blockenberg'))
                                    );
                                }
                            })
                        ),

                        el(SelectControl, { label: __('Object Fit', 'blockenberg'), value: a.objectFit, options: objectFitOptions, onChange: function (v) { setAttributes({ objectFit: v }); } }),
                        el(SelectControl, { label: __('Object Position', 'blockenberg'), value: a.objectPosition, options: objectPosOptions, onChange: function (v) { setAttributes({ objectPosition: v }); } })
                    ),

                    /* — Playback — */
                    el(PanelBody, { title: __('Playback', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Loop', 'blockenberg'), checked: a.videoLoop, onChange: function (v) { setAttributes({ videoLoop: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Play only when in viewport', 'blockenberg'), checked: a.playOnlyInView, onChange: function (v) { setAttributes({ playOnlyInView: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Pause on hover', 'blockenberg'), checked: a.pauseOnHover, onChange: function (v) { setAttributes({ pauseOnHover: v }); }, __nextHasNoMarginBottom: true }),
                        a.videoType === 'hosted' && el(RangeControl, { label: __('Playback Speed', 'blockenberg'), value: a.playbackRate, min: 0.25, max: 2, step: 0.25, onChange: function (v) { setAttributes({ playbackRate: v }); } })
                    ),

                    /* — Overlay — */
                    el(PanelBody, { title: __('Overlay', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Overlay Opacity (%)', 'blockenberg'), value: a.overlayOpacity, min: 0, max: 100, onChange: function (v) { setAttributes({ overlayOpacity: v }); } }),
                        el(ToggleControl, { label: __('Gradient Overlay', 'blockenberg'), checked: a.overlayGradient, onChange: function (v) { setAttributes({ overlayGradient: v }); }, __nextHasNoMarginBottom: true }),
                        a.overlayGradient && el(SelectControl, { label: __('Direction', 'blockenberg'), value: a.overlayGradientDir, options: gradDirOptions, onChange: function (v) { setAttributes({ overlayGradientDir: v }); } })
                    ),

                    /* — Layout — */
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Min Height (px)', 'blockenberg'), value: a.minHeight, min: 100, max: 1200, onChange: function (v) { setAttributes({ minHeight: v }); } }),
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: a.paddingTop, min: 0, max: 300, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 300, onChange: function (v) { setAttributes({ paddingBottom: v }); } }),
                        el(RangeControl, { label: __('Padding Left', 'blockenberg'), value: a.paddingLeft, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingLeft: v }); } }),
                        el(RangeControl, { label: __('Padding Right', 'blockenberg'), value: a.paddingRight, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingRight: v }); } }),
                        el(RangeControl, { label: __('Content Max Width (px)', 'blockenberg'), value: a.contentMaxWidth, min: 200, max: 1600, onChange: function (v) { setAttributes({ contentMaxWidth: v }); } }),
                        el(SelectControl, { label: __('Horizontal Align', 'blockenberg'), value: a.contentAlign, options: contentAlignOptions, onChange: function (v) { setAttributes({ contentAlign: v }); } }),
                        el(SelectControl, { label: __('Vertical Align', 'blockenberg'), value: a.contentVAlign, options: contentVAlignOptions, onChange: function (v) { setAttributes({ contentVAlign: v }); } }),
                        el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: a.borderRadius, min: 0, max: 80, onChange: function (v) { setAttributes({ borderRadius: v }); } })
                    ),

                    /* — Colors — */
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Overlay Color', 'blockenberg'), value: a.overlayColor, onChange: function (v) { setAttributes({ overlayColor: v || '#000000' }); } },
                            { label: __('Gradient Start', 'blockenberg'), value: a.overlayGradientStart, onChange: function (v) { setAttributes({ overlayGradientStart: v || '#000000' }); } },
                            { label: __('Gradient End',   'blockenberg'), value: a.overlayGradientEnd,   onChange: function (v) { setAttributes({ overlayGradientEnd:   v || 'transparent' }); } },
                            { label: __('Content Text Color', 'blockenberg'), value: a.textColor, onChange: function (v) { setAttributes({ textColor: v || '#ffffff' }); } },
                        ]
                    })
                ),

                /* ── Canvas ─────────────────────────────────────────────────── */
                el('div', {
                    ...blockProps,
                    style: { position: 'relative', overflow: 'hidden', minHeight: a.minHeight + 'px', borderRadius: a.borderRadius + 'px' }
                },
                    /* video/poster preview */
                    el(EditorMediaPreview, { a: a }),

                    /* overlay */
                    el('div', { className: 'bkbv-overlay', style: { position: 'absolute', inset: '0', background: buildOverlayBg(a), zIndex: 1, pointerEvents: 'none' } }),

                    /* content */
                    el('div', {
                        className: 'bkbv-content',
                        style: {
                            position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column',
                            alignItems: justifyMap[a.contentAlign] || 'center',
                            justifyContent: alignMap[a.contentVAlign] || 'center',
                            minHeight: a.minHeight + 'px',
                            paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px',
                            paddingLeft: a.paddingLeft + 'px', paddingRight: a.paddingRight + 'px',
                            color: a.textColor,
                        }
                    },
                        el('div', { style: { width: '100%', maxWidth: a.contentMaxWidth + 'px' } },
                            el(InnerBlocks, { templateLock: false })
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbv-outer' });
            var justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
            var alignMap   = { top: 'flex-start', center: 'center', bottom: 'flex-end' };

            return el('div', {
                ...blockProps,
                style: { position: 'relative', overflow: 'hidden', minHeight: a.minHeight + 'px', borderRadius: a.borderRadius + 'px' },
                'data-video-type':  a.videoType,
                'data-video-url':   a.videoUrl,
                'data-youtube-id':  a.youtubeId,
                'data-vimeo-id':    a.vimeoId,
                'data-loop':        a.videoLoop ? '1' : '0',
                'data-in-view':     a.playOnlyInView ? '1' : '0',
                'data-pause-hover': a.pauseOnHover ? '1' : '0',
                'data-rate':        a.playbackRate,
                'data-object-fit':  a.objectFit,
                'data-object-pos':  a.objectPosition,
            },
                /* media container — frontend.js creates the <video> or iframe here */
                el('div', {
                    className: 'bkbv-media',
                    style: { position: 'absolute', inset: '0', zIndex: 0, overflow: 'hidden' },
                    'aria-hidden': 'true'
                },
                    /* poster shown until video loads */
                    a.posterUrl && el('img', {
                        className: 'bkbv-poster',
                        src: a.posterUrl, alt: '',
                        style: { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: a.objectFit, objectPosition: a.objectPosition }
                    })
                ),

                /* overlay */
                el('div', {
                    className: 'bkbv-overlay',
                    style: { position: 'absolute', inset: '0', background: buildOverlayBg(a), zIndex: 1, pointerEvents: 'none' },
                    'aria-hidden': 'true'
                }),

                /* content */
                el('div', {
                    className: 'bkbv-content',
                    style: {
                        position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column',
                        alignItems: justifyMap[a.contentAlign] || 'center',
                        justifyContent: alignMap[a.contentVAlign] || 'center',
                        minHeight: a.minHeight + 'px',
                        paddingTop:    a.paddingTop    + 'px', paddingBottom: a.paddingBottom + 'px',
                        paddingLeft:   a.paddingLeft   + 'px', paddingRight:  a.paddingRight  + 'px',
                        color: a.textColor,
                    }
                },
                    el('div', { style: { width: '100%', maxWidth: a.contentMaxWidth + 'px' } },
                        el(InnerBlocks.Content, null)
                    )
                )
            );
        }
    });
}() );
