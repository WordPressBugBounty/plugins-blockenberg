( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;

    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var BlockControls = wp.blockEditor.BlockControls;
    var useBlockProps = wp.blockEditor.useBlockProps;

    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var ToolbarGroup = wp.components.ToolbarGroup;
    var ToolbarButton = wp.components.ToolbarButton;
    var Popover = wp.components.Popover;
    var ColorPicker = wp.components.ColorPicker;

    /* ── Typography helpers (lazy) ───────────────────────────────── */
    var _tc, _tvf;
    Object.defineProperty(window, '__bkytp_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '__bkytp_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, typoObj, setAttributes, attrName) {
        var fn = window.__bkytp_tc;
        return fn ? fn({ label: label, value: typoObj || {}, onChange: function (v) { var o = {}; o[attrName] = v; setAttributes(o); } }) : null;
    }
    function getTypoCssVarsObj(a) {
        var fn = window.__bkytp_tvf;
        var s = {};
        if (fn) {
            Object.assign(s, fn(a.titleTypo || {}, '--bkytp-tt-'));
        }
        return s;
    }

    function clamp(n, min, max) {
        n = parseFloat(n);
        if (isNaN(n)) n = min;
        return Math.max(min, Math.min(max, n));
    }

    function colorToRgbaString(color) {
        if (!color || !color.rgb) return '';
        var a = (typeof color.rgb.a === 'number') ? color.rgb.a : 1;
        return 'rgba(' + color.rgb.r + ',' + color.rgb.g + ',' + color.rgb.b + ',' + a + ')';
    }

    function normalizeImage(att) {
        return {
            id: att && att.id ? att.id : 0,
            url: att && att.url ? att.url : '',
            alt: att && att.alt ? att.alt : ''
        };
    }

    function openMedia(onSelect) {
        if (!wp || !wp.media) return;
        var frame = wp.media({
            title: __('Select Poster Image', 'blockenberg'),
            button: { text: __('Use image', 'blockenberg') },
            multiple: false,
            library: { type: 'image' }
        });
        frame.on('select', function () {
            var attachment = frame.state().get('selection').first().toJSON();
            onSelect(attachment);
        });
        frame.open();
    }

    function extractYouTubeId(input) {
        if (!input) return '';
        var s = String(input).trim();
        // If user pasted only the ID
        if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;

        // youtu.be/<id>
        var m = s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (m && m[1]) return m[1];

        // youtube.com/watch?v=<id>
        m = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        if (m && m[1]) return m[1];

        // youtube.com/embed/<id>
        m = s.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
        if (m && m[1]) return m[1];

        // youtube.com/shorts/<id>
        m = s.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
        if (m && m[1]) return m[1];

        return '';
    }

    function youtubeThumb(id, variant) {
        if (!id) return '';
        var v = variant || 'youtube-max';
        if (v === 'youtube-hq') return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
        return 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg';
    }

    function buildEmbedSrc(a, autoplay) {
        if (!a.videoId) return '';
        var host = a.privacyMode ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com';
        var params = [];
        params.push('autoplay=' + (autoplay ? '1' : '0'));
        params.push('controls=' + (a.controls ? '1' : '0'));
        params.push('rel=' + (a.rel ? '1' : '0'));
        if (a.mute) params.push('mute=1');
        if (a.startTime && a.startTime > 0) params.push('start=' + Math.floor(a.startTime));
        if (a.loop) {
            params.push('loop=1');
            params.push('playlist=' + encodeURIComponent(a.videoId));
        }
        return host + '/embed/' + encodeURIComponent(a.videoId) + '?' + params.join('&');
    }

    registerBlockType('blockenberg/youtube-performance', {
        title: __('YouTube Performance Embed', 'blockenberg'),
        icon: 'video-alt3',
        category: 'bkbg-dev',
        description: __('YouTube embed with poster + lazy iframe created only on user click.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var isSelected = props.isSelected;

            var previewState = useState(false);
            var previewOn = previewState[0];
            var setPreviewOn = previewState[1];

            var playingState = useState(false);
            var isPlaying = playingState[0];
            var setIsPlaying = playingState[1];

            var colorPopoverState = useState(null);
            var openColor = colorPopoverState[0];
            var setOpenColor = colorPopoverState[1];

            function setVideoUrl(v) {
                var id = extractYouTubeId(v);
                setAttributes({ videoUrl: v, videoId: id });
                setIsPlaying(false);
            }

            function setPoster(att) {
                setAttributes({ posterImage: normalizeImage(att) });
            }

            var posterUrl = '';
            if (a.posterSource === 'custom') {
                posterUrl = (a.posterImage && a.posterImage.url) ? a.posterImage.url : '';
            } else {
                posterUrl = youtubeThumb(a.videoId, a.posterSource);
            }

            var wrapperClass = 'bkbg-ytp-wrap bkbg-editor-wrap';
            if (isSelected) wrapperClass += ' bkbg-block-selected';
            if (a.shadow) wrapperClass += ' has-shadow';
            wrapperClass += ' is-play-' + (a.playStyle || 'circle');

            var styleVars = {
                '--bkbg-ytp-radius': (a.borderRadius || 0) + 'px',
                '--bkbg-ytp-min-height': (a.minHeight || 260) + 'px',
                '--bkbg-ytp-play-size': (a.playSize || 64) + 'px',
                '--bkbg-ytp-play-bg': a.playBg,
                '--bkbg-ytp-play-color': a.playColor,
                '--bkbg-ytp-play-hover': (a.playHoverScale || 1.05)
            };

            var blockProps = useBlockProps({
                className: wrapperClass,
                style: styleVars,
                'data-block-label': 'YouTube'
            });

            var toolbar = el(BlockControls, {},
                el(ToolbarGroup, {},
                    el(ToolbarButton, {
                        icon: 'visibility',
                        label: __('Toggle editor preview', 'blockenberg'),
                        isPressed: previewOn,
                        onClick: function () {
                            setPreviewOn(!previewOn);
                            setIsPlaying(false);
                        }
                    }),
                    el(ToolbarButton, {
                        icon: 'controls-repeat',
                        label: __('Reset', 'blockenberg'),
                        onClick: function () { setIsPlaying(false); }
                    })
                )
            );

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Video', 'blockenberg'), initialOpen: true },
                    el(TextControl, {
                        label: __('YouTube URL or Video ID', 'blockenberg'),
                        value: a.videoUrl,
                        onChange: setVideoUrl,
                        help: __('Paste a YouTube link (watch, short, embed, youtu.be) or an 11‑char ID.', 'blockenberg')
                    }),
                    el(ToggleControl, {
                        label: __('Show title overlay', 'blockenberg'),
                        checked: !!a.showTitle,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showTitle: v }); }
                    }),
                    !!a.showTitle && el(TextControl, {
                        label: __('Title', 'blockenberg'),
                        value: a.title,
                        onChange: function (v) { setAttributes({ title: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Privacy mode (youtube-nocookie.com)', 'blockenberg'),
                        checked: !!a.privacyMode,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ privacyMode: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Start time (seconds)', 'blockenberg'),
                        value: a.startTime || 0,
                        onChange: function (v) { setAttributes({ startTime: v || 0 }); },
                        min: 0,
                        max: 600
                    }),
                    el(ToggleControl, {
                        label: __('Show controls', 'blockenberg'),
                        checked: !!a.controls,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ controls: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Related videos at end', 'blockenberg'),
                        checked: !!a.rel,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ rel: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Mute on play', 'blockenberg'),
                        checked: !!a.mute,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ mute: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Loop', 'blockenberg'),
                        checked: !!a.loop,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ loop: v }); }
                    })
                ),

                el(PanelBody, { title: __('Poster', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Poster source', 'blockenberg'),
                        value: a.posterSource,
                        options: [
                            { label: __('YouTube (maxresdefault)', 'blockenberg'), value: 'youtube-max' },
                            { label: __('YouTube (hqdefault)', 'blockenberg'), value: 'youtube-hq' },
                            { label: __('Custom image', 'blockenberg'), value: 'custom' }
                        ],
                        onChange: function (v) { setAttributes({ posterSource: v }); }
                    }),
                    a.posterSource === 'custom' && el('div', { className: 'bkbg-ytp-media' },
                        (a.posterImage && a.posterImage.url)
                            ? el('img', { className: 'bkbg-ytp-media-thumb', src: a.posterImage.url, alt: a.posterImage.alt || '' })
                            : el('div', { className: 'bkbg-ytp-media-placeholder' }, __('No poster selected', 'blockenberg')),
                        el(Button, {
                            variant: 'secondary',
                            onClick: function () { openMedia(setPoster); }
                        }, (a.posterImage && a.posterImage.url) ? __('Replace poster', 'blockenberg') : __('Select poster', 'blockenberg')),
                        (a.posterImage && a.posterImage.url) && el(Button, {
                            variant: 'tertiary',
                            isDestructive: true,
                            onClick: function () { setAttributes({ posterImage: { id: 0, url: '', alt: '' } }); }
                        }, __('Remove', 'blockenberg'))
                    )
                ),

                el(PanelBody, { title: __('Design', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Aspect ratio', 'blockenberg'),
                        value: a.aspect,
                        options: [
                            { label: '16:9', value: '16/9' },
                            { label: '4:3', value: '4/3' },
                            { label: '1:1', value: '1/1' },
                            { label: __('Auto', 'blockenberg'), value: 'auto' }
                        ],
                        onChange: function (v) { setAttributes({ aspect: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Minimum height (px)', 'blockenberg'),
                        value: a.minHeight,
                        onChange: function (v) { setAttributes({ minHeight: v }); },
                        min: 120,
                        max: 900
                    }),
                    el(RangeControl, {
                        label: __('Border radius', 'blockenberg'),
                        value: a.borderRadius,
                        onChange: function (v) { setAttributes({ borderRadius: v }); },
                        min: 0,
                        max: 40
                    }),
                    el(ToggleControl, {
                        label: __('Shadow', 'blockenberg'),
                        checked: !!a.shadow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ shadow: v }); }
                    })
                ),

                el(PanelBody, { title: __('Play Button', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'),
                        value: a.playStyle,
                        options: [
                            { label: __('YouTube', 'blockenberg'), value: 'youtube' },
                            { label: __('Circle', 'blockenberg'), value: 'circle' },
                            { label: __('Rounded', 'blockenberg'), value: 'rounded' },
                            { label: __('Square', 'blockenberg'), value: 'square' }
                        ],
                        onChange: function (v) { setAttributes({ playStyle: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Size', 'blockenberg'),
                        value: a.playSize,
                        onChange: function (v) { setAttributes({ playSize: v }); },
                        min: 36,
                        max: 120
                    }),
                    el(RangeControl, {
                        label: __('Hover scale', 'blockenberg'),
                        value: a.playHoverScale || 1.05,
                        onChange: function (v) { setAttributes({ playHoverScale: v }); },
                        min: 1,
                        max: 1.2,
                        step: 0.01
                    }),
                    el('div', { className: 'bkbg-ytp-color-row' },
                        el('button', {
                            className: 'bkbg-ytp-color-btn',
                            style: { backgroundColor: a.playBg },
                            onClick: function () { setOpenColor(openColor === 'playBg' ? null : 'playBg'); }
                        }),
                        openColor === 'playBg' && el(Popover, { position: 'bottom left', onClose: function () { setOpenColor(null); } },
                            el(ColorPicker, {
                                color: a.playBg,
                                onChangeComplete: function (c) {
                                    var rgba = colorToRgbaString(c);
                                    setAttributes({ playBg: rgba || (c.hex ? c.hex : a.playBg) });
                                }
                            })
                        )
                    ),
                    el('div', { className: 'bkbg-ytp-color-row' },
                        el('span', {}, __('Icon', 'blockenberg')),
                        el('button', {
                            className: 'bkbg-ytp-color-btn',
                            style: { backgroundColor: a.playColor },
                            onClick: function () { setOpenColor(openColor === 'playColor' ? null : 'playColor'); }
                        }),
                        openColor === 'playColor' && el(Popover, { position: 'bottom left', onClose: function () { setOpenColor(null); } },
                            el(ColorPicker, {
                                color: a.playColor,
                                onChangeComplete: function (c) { setAttributes({ playColor: c.hex }); }
                            })
                        )
                    )
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl( 'Title', a.titleTypo, setAttributes, 'titleTypo' )
                )
            );

            function renderPoster() {
                var hasVideo = !!a.videoId;

                return el('div', { className: 'bkbg-ytp-inner' },
                    el('div', {
                        className: 'bkbg-ytp-media-layer',
                        style: { minHeight: (a.minHeight || 260) + 'px' }
                    },
                        posterUrl
                            ? el('img', {
                                className: 'bkbg-ytp-poster-img',
                                src: posterUrl,
                                alt: (a.posterSource === 'custom' && a.posterImage && a.posterImage.alt) ? a.posterImage.alt : ''
                            })
                            : el('div', { className: 'bkbg-ytp-empty' },
                                el('p', {}, hasVideo
                                    ? __('Poster will appear here (YouTube thumbnail or custom).', 'blockenberg')
                                    : __('Paste a YouTube URL in the sidebar to get started.', 'blockenberg'))
                            )
                    ),
                    el('div', { className: 'bkbg-ytp-overlay' },
                        (a.showTitle && a.title) && el('div', { className: 'bkbg-ytp-title' }, a.title),
                        el('button', {
                            type: 'button',
                            className: 'bkbg-ytp-play',
                            disabled: !hasVideo,
                            onMouseDown: function (e) {
                                // allow selecting the block on click when not selected
                                if (!isSelected) return;
                                e.stopPropagation();
                            },
                            onClick: function (e) {
                                if (!isSelected) return;
                                e.preventDefault();
                                e.stopPropagation();
                                if (!previewOn) {
                                    // No iframe preview unless enabled; keep block selectable.
                                    return;
                                }
                                setIsPlaying(true);
                            },
                            'aria-label': __('Play YouTube video', 'blockenberg')
                        },
                            el('span', { className: 'bkbg-ytp-play-triangle' })
                        ),
                        (!previewOn && hasVideo) && el('div', { className: 'bkbg-ytp-hint' },
                            __('Preview is off (no iframe). Enable preview in the toolbar.', 'blockenberg')
                        )
                    )
                );
            }

            function renderPreviewIframe() {
                if (!a.videoId) return null;
                if (!previewOn) return null;
                if (!isPlaying) return null;

                var src = buildEmbedSrc(a, true);

                return el('div', { className: 'bkbg-ytp-inner' },
                    el('iframe', {
                        className: 'bkbg-ytp-iframe',
                        src: src,
                        title: __('YouTube video', 'blockenberg'),
                        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
                        allowFullScreen: true
                    })
                );
            }

            var aspectStyle = (a.aspect && a.aspect !== 'auto') ? { aspectRatio: a.aspect } : {};

            var content = el('div', blockProps,
                el('div', Object.assign({ className: 'bkbg-ytp-aspect' + (a.aspect !== 'auto' ? ' has-aspect' : '') }, aspectStyle),
                    renderPreviewIframe() || renderPoster()
                )
            );

            return el(Fragment, {}, toolbar, inspector, content);
        },

        save: function (props) {
            var a = props.attributes;

            function youtubeThumbSaved(id, variant) {
                if (!id) return '';
                var v = variant || 'youtube-max';
                if (v === 'youtube-hq') return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
                return 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg';
            }

            var posterUrl = '';
            if (a.posterSource === 'custom') {
                posterUrl = (a.posterImage && a.posterImage.url) ? a.posterImage.url : '';
            } else {
                posterUrl = youtubeThumbSaved(a.videoId, a.posterSource);
            }

            var cls = 'bkbg-ytp-wrap';
            if (a.shadow) cls += ' has-shadow';
            cls += ' is-play-' + (a.playStyle || 'circle');

            var styleVars = (function () {
                var s = {
                    '--bkbg-ytp-radius': (a.borderRadius || 0) + 'px',
                    '--bkbg-ytp-min-height': (a.minHeight || 260) + 'px',
                    '--bkbg-ytp-play-size': (a.playSize || 64) + 'px',
                    '--bkbg-ytp-play-bg': a.playBg,
                    '--bkbg-ytp-play-color': a.playColor,
                    '--bkbg-ytp-play-hover': (a.playHoverScale || 1.05)
                };
                Object.assign(s, getTypoCssVarsObj(a));
                return s;
            })();

            var blockProps = useBlockProps.save({
                className: cls,
                style: styleVars,
                'data-video-id': a.videoId || '',
                'data-privacy': a.privacyMode ? '1' : '0',
                'data-start': String(a.startTime || 0),
                'data-controls': a.controls ? '1' : '0',
                'data-rel': a.rel ? '1' : '0',
                'data-mute': a.mute ? '1' : '0',
                'data-loop': a.loop ? '1' : '0',
                'data-poster-source': a.posterSource || 'youtube-max'
            });

            var aspectStyle = (a.aspect && a.aspect !== 'auto') ? { aspectRatio: a.aspect } : {};

            return el('div', blockProps,
                el('div', Object.assign({ className: 'bkbg-ytp-aspect' + (a.aspect !== 'auto' ? ' has-aspect' : '') }, aspectStyle),
                    el('div', { className: 'bkbg-ytp-inner' },
                        el('div', { className: 'bkbg-ytp-media-layer' },
                            posterUrl
                                ? el('img', {
                                    className: 'bkbg-ytp-poster-img',
                                    src: posterUrl,
                                    alt: (a.posterSource === 'custom' && a.posterImage && a.posterImage.alt) ? a.posterImage.alt : ''
                                })
                                : null
                        ),
                        el('button', {
                            type: 'button',
                            className: 'bkbg-ytp-play',
                            'aria-label': __('Play YouTube video', 'blockenberg')
                        },
                            el('span', { className: 'bkbg-ytp-play-triangle' })
                        ),
                        (a.showTitle && a.title) && el('div', { className: 'bkbg-ytp-title' }, a.title),
                        el('div', { className: 'bkbg-ytp-embed' })
                    )
                )
            );
        }
    });
}() );
