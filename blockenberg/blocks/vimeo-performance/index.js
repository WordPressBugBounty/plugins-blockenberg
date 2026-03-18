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

    function extractVimeoId(input) {
        if (!input) return '';
        var s = String(input).trim();

        // Allow numeric ID directly
        if (/^\d+$/.test(s)) return s;

        // vimeo.com/<id> or vimeo.com/channels/.../<id> or vimeo.com/groups/.../videos/<id>
        var m = s.match(/vimeo\.com\/(?:.*\/)?(\d+)(?:$|\?|#|\/)/);
        if (m && m[1]) return m[1];

        // player.vimeo.com/video/<id>
        m = s.match(/player\.vimeo\.com\/video\/(\d+)/);
        if (m && m[1]) return m[1];

        return '';
    }

    function fetchOEmbedPoster(videoUrl) {
        if (!videoUrl) return Promise.resolve(null);
        var endpoint = 'https://vimeo.com/api/oembed.json?url=' + encodeURIComponent(videoUrl);
        return fetch(endpoint)
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                if (!data) return null;
                var embedSrc = '';
                if (data.html) {
                    try {
                        var tmp = document.createElement('div');
                        tmp.innerHTML = data.html;
                        var iframe = tmp.querySelector('iframe');
                        if (iframe) embedSrc = iframe.getAttribute('src') || '';
                    } catch (e) {
                        embedSrc = '';
                    }
                }
                return {
                    url: data.thumbnail_url || '',
                    alt: data.title || '',
                    embedSrc: embedSrc
                };
            })
            .catch(function () { return null; });
    }

    function withVimeoParams(baseUrl, updates) {
        if (!baseUrl) return '';
        try {
            var u = new URL(baseUrl, window.location.href);
            Object.keys(updates).forEach(function (k) {
                u.searchParams.set(k, String(updates[k]));
            });
            return u.toString();
        } catch (e) {
            return baseUrl;
        }
    }

    registerBlockType('blockenberg/vimeo-performance', {
        title: __('Vimeo Performance Embed', 'blockenberg'),
        icon: 'video-alt3',
        category: 'bkbg-dev',
        description: __('Vimeo embed with poster + lazy iframe created only on user click.', 'blockenberg'),

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

            var fetchingState = useState(false);
            var isFetching = fetchingState[0];
            var setIsFetching = fetchingState[1];

            function setVideoUrl(v) {
                var id = extractVimeoId(v);
                setAttributes({ videoUrl: v, videoId: id });
                setIsPlaying(false);

                if (a.posterSource === 'vimeo' && v) {
                    setIsFetching(true);
                    fetchOEmbedPoster(v).then(function (info) {
                        setIsFetching(false);
                        if (!info || !info.url) return;
                        setAttributes({
                            posterImage: { id: 0, url: info.url, alt: info.alt || '' },
                            embedSrc: info.embedSrc || ''
                        });
                    });
                }
            }

            function setPoster(att) {
                setAttributes({ posterImage: normalizeImage(att) });
            }

            var posterUrl = (a.posterSource === 'custom')
                ? ((a.posterImage && a.posterImage.url) ? a.posterImage.url : '')
                : ((a.posterImage && a.posterImage.url) ? a.posterImage.url : '');

            var wrapperClass = 'bkbg-vmp-wrap bkbg-editor-wrap';
            if (isSelected) wrapperClass += ' bkbg-block-selected';
            if (a.shadow) wrapperClass += ' has-shadow';
            wrapperClass += ' is-play-' + (a.playStyle || 'youtube');

            var styleVars = {
                '--bkbg-vmp-radius': (a.borderRadius || 0) + 'px',
                '--bkbg-vmp-min-height': (a.minHeight || 350) + 'px',
                '--bkbg-vmp-play-size': (a.playSize || 50) + 'px',
                '--bkbg-vmp-play-bg': a.playBg,
                '--bkbg-vmp-play-color': a.playColor,
                '--bkbg-vmp-play-hover': (a.playHoverScale || 1.05)
            };

            var blockProps = useBlockProps({
                className: wrapperClass,
                style: styleVars,
                'data-block-label': 'Vimeo'
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
                        label: __('Vimeo URL or Video ID', 'blockenberg'),
                        value: a.videoUrl,
                        onChange: setVideoUrl,
                        help: __('Paste a Vimeo link or a numeric ID.', 'blockenberg')
                    }),
                    el(ToggleControl, {
                        label: __('Do Not Track (dnt=1)', 'blockenberg'),
                        checked: !!a.dnt,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ dnt: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Autoplay on click', 'blockenberg'),
                        checked: !!a.autoplay,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ autoplay: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Muted', 'blockenberg'),
                        checked: !!a.muted,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ muted: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Loop', 'blockenberg'),
                        checked: !!a.loop,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ loop: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show title/byline/portrait', 'blockenberg'),
                        checked: !!a.showTitleBylinePortrait,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showTitleBylinePortrait: v }); }
                    })
                ),

                el(PanelBody, { title: __('Poster', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Poster source', 'blockenberg'),
                        value: a.posterSource,
                        options: [
                            { label: __('Vimeo (oEmbed)', 'blockenberg'), value: 'vimeo' },
                            { label: __('Custom image', 'blockenberg'), value: 'custom' }
                        ],
                        onChange: function (v) {
                            setAttributes({ posterSource: v });
                            if (v === 'vimeo' && a.videoUrl) {
                                setIsFetching(true);
                                fetchOEmbedPoster(a.videoUrl).then(function (info) {
                                    setIsFetching(false);
                                    if (!info || !info.url) return;
                                    setAttributes({
                                        posterImage: { id: 0, url: info.url, alt: info.alt || '' },
                                        embedSrc: info.embedSrc || ''
                                    });
                                });
                            }
                        }
                    }),
                    a.posterSource === 'custom' && el('div', { className: 'bkbg-vmp-media' },
                        (a.posterImage && a.posterImage.url)
                            ? el('img', { className: 'bkbg-vmp-media-thumb', src: a.posterImage.url, alt: a.posterImage.alt || '' })
                            : el('div', { className: 'bkbg-vmp-media-placeholder' }, __('No poster selected', 'blockenberg')),
                        el(Button, {
                            variant: 'secondary',
                            onClick: function () { openMedia(setPoster); }
                        }, (a.posterImage && a.posterImage.url) ? __('Replace poster', 'blockenberg') : __('Select poster', 'blockenberg')),
                        (a.posterImage && a.posterImage.url) && el(Button, {
                            variant: 'tertiary',
                            isDestructive: true,
                            onClick: function () { setAttributes({ posterImage: { id: 0, url: '', alt: '' } }); }
                        }, __('Remove', 'blockenberg'))
                    ),
                    (a.posterSource === 'vimeo') && el('p', { style: { marginTop: '8px', opacity: 0.8 } },
                        isFetching ? __('Fetching Vimeo thumbnail…', 'blockenberg') : __('Uses Vimeo oEmbed thumbnail. Paste a valid Vimeo URL to fetch.', 'blockenberg')
                    )
                ),

                el(PanelBody, { title: __('Design', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Aspect ratio', 'blockenberg'),
                        value: a.aspect,
                        options: [
                            { label: '4:3', value: '4/3' },
                            { label: '16:9', value: '16/9' },
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
                    })
                )
            );

            function renderPoster() {
                var hasVideo = !!a.videoId;

                return el('div', { className: 'bkbg-vmp-inner' },
                    el('div', {
                        className: 'bkbg-vmp-media-layer',
                        style: { minHeight: (a.minHeight || 350) + 'px' }
                    },
                        posterUrl
                            ? el('img', {
                                className: 'bkbg-vmp-poster-img',
                                src: posterUrl,
                                alt: (a.posterImage && a.posterImage.alt) ? a.posterImage.alt : ''
                            })
                            : el('div', { className: 'bkbg-vmp-empty' },
                                el('p', {}, hasVideo
                                    ? __('Poster will appear here (Vimeo thumbnail or custom).', 'blockenberg')
                                    : __('Paste a Vimeo URL in the sidebar to get started.', 'blockenberg'))
                            )
                    ),
                    el('button', {
                        type: 'button',
                        className: 'bkbg-vmp-play',
                        disabled: !hasVideo,
                        onMouseDown: function (e) {
                            if (!isSelected) return;
                            e.stopPropagation();
                        },
                        onClick: function (e) {
                            if (!isSelected) return;
                            e.preventDefault();
                            e.stopPropagation();
                            if (!previewOn) return;
                            setIsPlaying(true);
                        },
                        'aria-label': __('Play Vimeo video', 'blockenberg')
                    },
                        el('span', { className: 'bkbg-vmp-play-triangle' })
                    )
                );
            }

            function renderPreviewIframe() {
                if (!a.videoId) return null;
                if (!previewOn) return null;
                if (!isPlaying) return null;

                var chrome = a.showTitleBylinePortrait ? '1' : '0';
                var base = a.embedSrc || ('https://player.vimeo.com/video/' + encodeURIComponent(a.videoId));
                var src = withVimeoParams(base, {
                    autoplay: a.autoplay ? 1 : 0,
                    muted: a.muted ? 1 : 0,
                    loop: a.loop ? 1 : 0,
                    dnt: a.dnt ? 1 : 0,
                    title: chrome,
                    byline: chrome,
                    portrait: chrome
                });

                return el('div', { className: 'bkbg-vmp-inner' },
                    el('iframe', {
                        className: 'bkbg-vmp-iframe',
                        src: src,
                        title: __('Vimeo video', 'blockenberg'),
                        allow: 'autoplay; fullscreen; picture-in-picture',
                        allowFullScreen: true
                    })
                );
            }

            var aspectStyle = (a.aspect && a.aspect !== 'auto') ? { aspectRatio: a.aspect } : {};

            var content = el('div', blockProps,
                el('div', Object.assign({ className: 'bkbg-vmp-aspect' + (a.aspect !== 'auto' ? ' has-aspect' : '') }, aspectStyle),
                    renderPreviewIframe() || renderPoster()
                )
            );

            return el(Fragment, {}, toolbar, inspector, content);
        },

        save: function (props) {
            var a = props.attributes;

            var posterUrl = (a.posterImage && a.posterImage.url) ? a.posterImage.url : '';

            var cls = 'bkbg-vmp-wrap';
            if (a.shadow) cls += ' has-shadow';
            cls += ' is-play-' + (a.playStyle || 'youtube');

            var styleVars = {
                '--bkbg-vmp-radius': (a.borderRadius || 0) + 'px',
                '--bkbg-vmp-min-height': (a.minHeight || 350) + 'px',
                '--bkbg-vmp-play-size': (a.playSize || 50) + 'px',
                '--bkbg-vmp-play-bg': a.playBg,
                '--bkbg-vmp-play-color': a.playColor,
                '--bkbg-vmp-play-hover': (a.playHoverScale || 1.05)
            };

            var blockProps = useBlockProps.save({
                className: cls,
                style: styleVars,
                'data-video-id': a.videoId || '',
                'data-video-url': a.videoUrl || '',
                'data-embed-src': a.embedSrc || '',
                'data-dnt': a.dnt ? '1' : '0',
                'data-autoplay': a.autoplay ? '1' : '0',
                'data-muted': a.muted ? '1' : '0',
                'data-loop': a.loop ? '1' : '0',
                'data-chrome': a.showTitleBylinePortrait ? '1' : '0'
            });

            var aspectStyle = (a.aspect && a.aspect !== 'auto') ? { aspectRatio: a.aspect } : {};

            return el('div', blockProps,
                el('div', Object.assign({ className: 'bkbg-vmp-aspect' + (a.aspect !== 'auto' ? ' has-aspect' : '') }, aspectStyle),
                    el('div', { className: 'bkbg-vmp-inner' },
                        el('div', { className: 'bkbg-vmp-media-layer' },
                            posterUrl
                                ? el('img', {
                                    className: 'bkbg-vmp-poster-img',
                                    src: posterUrl,
                                    alt: (a.posterImage && a.posterImage.alt) ? a.posterImage.alt : ''
                                })
                                : null
                        ),
                        el('button', {
                            type: 'button',
                            className: 'bkbg-vmp-play',
                            'aria-label': __('Play Vimeo video', 'blockenberg')
                        },
                            el('span', { className: 'bkbg-vmp-play-triangle' })
                        ),
                        el('div', { className: 'bkbg-vmp-embed' })
                    )
                )
            );
        }
    });
}() );
