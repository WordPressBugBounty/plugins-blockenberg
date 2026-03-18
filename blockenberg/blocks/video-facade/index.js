( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelBody       = wp.components.PanelBody;
    var Button          = wp.components.Button;
    var ToggleControl   = wp.components.ToggleControl;
    var RangeControl    = wp.components.RangeControl;
    var SelectControl   = wp.components.SelectControl;
    var TextControl     = wp.components.TextControl;
    var ColorPicker     = wp.components.ColorPicker;
    var Popover         = wp.components.Popover;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'titleTypo',    attrs, '--bkvf-tt-');
        _tvf(v, 'subtitleTypo', attrs, '--bkvf-st-');
        _tvf(v, 'captionTypo',  attrs, '--bkvf-cp-');
        return v;
    }

    var ASPECT_RATIOS = {
        '16-9': 56.25,
        '4-3':  75,
        '21-9': 42.86,
        '1-1':  100,
    };

    /* ── Helpers ──────────────────────────────────────────────────── */
    function extractVideoInfo(url) {
        url = (url || '').trim();
        if (!url) return { provider: 'youtube', id: '' };

        /* YouTube */
        var ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
        if (ytMatch) return { provider: 'youtube', id: ytMatch[1] };

        /* Vimeo */
        var vmMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (vmMatch) return { provider: 'vimeo', id: vmMatch[1] };

        return { provider: 'youtube', id: '' };
    }

    function getAutoThumb(provider, videoId) {
        if (provider === 'youtube' && videoId) {
            return 'https://img.youtube.com/vi/' + videoId + '/maxresdefault.jpg';
        }
        return '';
    }

    function hexToRgba(hex, alpha) {
        hex = (hex || '#000000').replace('#', '');
        if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        var r = parseInt(hex.substr(0,2),16), g = parseInt(hex.substr(2,2),16), b = parseInt(hex.substr(4,2),16);
        return 'rgba('+r+','+g+','+b+','+(alpha/100)+')';
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', onClick: function () { setOpenKey(isOpen ? null : key); }, style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#ccc' } }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Play icon SVG ────────────────────────────────────────────── */
    function PlayIcon(props) {
        var size = props.size || 72;
        var color = props.color || '#fff';
        var bg = props.bg || '#6c3fb5';
        var style = props.style || 'circle';
        var pulsing = props.pulsing;

        var inner = el('svg', { xmlns: 'http://www.w3.org/2000/svg', width: size * 0.45, height: size * 0.45, viewBox: '0 0 24 24', fill: color },
            el('path', { d: 'M8 5v14l11-7z' })
        );

        if (style === 'minimal') {
            return el('div', { style: { width: size + 'px', height: size + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid ' + color, borderRadius: '50%', cursor: 'pointer' } }, inner);
        }
        if (style === 'oval') {
            return el('div', { style: { padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '10px', background: bg, borderRadius: '99px', cursor: 'pointer' } },
                inner,
                el('span', { style: { color: color, fontWeight: 700, fontSize: '16px', letterSpacing: '0.02em' } }, __('Watch', 'blockenberg'))
            );
        }
        /* circle (default) */
        return el('div', {
            style: {
                width: size + 'px', height: size + 'px',
                borderRadius: '50%',
                background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                animation: pulsing ? 'bkbg-vf-pulse 2s ease-in-out infinite' : 'none',
            }
        }, inner);
    }

    /* ── Editor preview ───────────────────────────────────────────── */
    function VideoPreview(props) {
        var a = props.a;
        var thumbSrc = a.thumbnailUrl || (a.autoThumb ? getAutoThumb(a.videoProvider, a.videoId) : '');
        var ratio = ASPECT_RATIOS[a.aspectRatio] || 56.25;

        return el('div', {
            style: {
                position: 'relative',
                width: '100%',
                paddingBottom: ratio + '%',
                borderRadius: a.borderRadius + 'px',
                overflow: 'hidden',
                boxShadow: a.showShadow ? '0 12px 48px rgba(0,0,0,0.18)' : 'none',
                background: '#111',
                cursor: 'pointer',
            }
        },
            /* Thumbnail */
            thumbSrc && el('img', {
                src: thumbSrc, alt: '',
                style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }
            }),
            !thumbSrc && el('div', { style: { position: 'absolute', inset: 0, background: '#1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                el('span', { style: { color: '#6b7280', fontSize: '14px', fontWeight: 500 } }, a.videoId ? '⏳ Thumbnail loading...' : '🎬 ' + __('Enter a YouTube or Vimeo URL in the panel →', 'blockenberg'))
            ),

            /* Overlay */
            el('div', { style: { position: 'absolute', inset: 0, background: hexToRgba(a.overlayColor, a.overlayOpacity) } }),

            /* Title / subtitle overlay */
            (a.showTitle || a.showSubtitle) && el('div', { style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '32px 24px', textAlign: 'center' } },
                a.showTitle && el('p', { className: 'bkbg-vf-title', style: { margin: 0, color: a.titleColor, textShadow: '0 2px 8px rgba(0,0,0,0.4)' } }, a.title || __('Video Title', 'blockenberg')),
                a.showSubtitle && el('p', { className: 'bkbg-vf-subtitle', style: { margin: '6px 0 0', color: a.subtitleColor, textShadow: '0 1px 4px rgba(0,0,0,0.3)' } }, a.subtitle || __('Subtitle text', 'blockenberg'))
            ),

            /* Play button centered */
            el('div', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                el(PlayIcon, { size: a.playSize, color: a.playColor, bg: a.playBg, style: a.playStyle, pulsing: a.playPulsing })
            )
        );
    }

    registerBlockType('blockenberg/video-facade', {
        title: __('Video Facade', 'blockenberg'),
        icon: 'video-alt3',
        category: 'bkbg-media',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var blockProps = useBlockProps((function () {
                var s = getTypoCssVars(a);
                s.backgroundColor = a.bgColor || undefined;
                s.paddingTop = a.paddingTop + 'px';
                s.paddingBottom = a.paddingBottom + 'px';
                return { style: s };
            })());

            function cc(key, label, value, attrKey) {
                return renderColorControl(key, label, value, function (v) {
                    var upd = {}; upd[attrKey] = v; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function handleUrlChange(url) {
                var info = extractVideoInfo(url);
                setAttributes({ videoUrl: url, videoProvider: info.provider, videoId: info.id });
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Video', 'blockenberg'), initialOpen: true },
                        el(TextControl, { label: __('YouTube or Vimeo URL', 'blockenberg'), value: a.videoUrl, onChange: handleUrlChange, placeholder: 'https://youtube.com/watch?v=...' }),
                        a.videoProvider && a.videoId && el('p', { style: { fontSize: '12px', color: '#888', margin: '0 0 8px', background: '#f0f4ff', padding: '4px 8px', borderRadius: '4px' } },
                            '✅ ' + a.videoProvider.charAt(0).toUpperCase() + a.videoProvider.slice(1) + ' ID: ' + a.videoId
                        ),
                        el(SelectControl, { label: __('Aspect ratio', 'blockenberg'), value: a.aspectRatio, options: [{ label: '16:9 (Widescreen)', value: '16-9' }, { label: '4:3 (Classic)', value: '4-3' }, { label: '21:9 (Cinematic)', value: '21-9' }, { label: '1:1 (Square)', value: '1-1' }], onChange: function (v) { setAttributes({ aspectRatio: v }); } }),
                        el(ToggleControl, { label: __('Auto-load thumbnail from provider', 'blockenberg'), checked: a.autoThumb, onChange: function (v) { setAttributes({ autoThumb: v }); }, __nextHasNoMarginBottom: true }),
                        el('p', { style: { fontSize: '12px', color: '#888', margin: '4px 0 12px' } }, __('Or upload a custom thumbnail below:', 'blockenberg')),
                        el(MediaUploadCheck, null,
                            el(MediaUpload, { onSelect: function (m) { setAttributes({ thumbnailUrl: m.url, thumbnailId: m.id }); }, allowedTypes: ['image'], value: a.thumbnailId,
                                render: function (mp) {
                                    return el(Fragment, null,
                                        a.thumbnailUrl && el('img', { src: a.thumbnailUrl, style: { width: '100%', borderRadius: '6px', marginBottom: '6px', display: 'block' } }),
                                        el(Button, { variant: 'secondary', size: 'compact', onClick: mp.open }, a.thumbnailUrl ? __('Change thumbnail', 'blockenberg') : __('Upload thumbnail', 'blockenberg')),
                                        a.thumbnailUrl && el(Button, { variant: 'tertiary', size: 'compact', isDestructive: true, onClick: function () { setAttributes({ thumbnailUrl: '', thumbnailId: 0 }); }, style: { marginLeft: '6px' } }, __('Remove', 'blockenberg'))
                                    );
                                }
                            })
                        )
                    ),
                    el(PanelBody, { title: __('Overlay & Play Button', 'blockenberg'), initialOpen: false },
                        RangeControl && el(RangeControl, { label: __('Overlay opacity (%)', 'blockenberg'), value: a.overlayOpacity, min: 0, max: 85, onChange: function (v) { setAttributes({ overlayOpacity: v }); } }),
                        cc('overlayColor', __('Overlay color', 'blockenberg'), a.overlayColor, 'overlayColor'),
                        el(SelectControl, { label: __('Play button style', 'blockenberg'), value: a.playStyle, options: [{ label: __('Circle', 'blockenberg'), value: 'circle' }, { label: __('Oval with text', 'blockenberg'), value: 'oval' }, { label: __('Minimal outline', 'blockenberg'), value: 'minimal' }], onChange: function (v) { setAttributes({ playStyle: v }); } }),
                        el(RangeControl, { label: __('Play button size (px)', 'blockenberg'), value: a.playSize, min: 40, max: 140, onChange: function (v) { setAttributes({ playSize: v }); } }),
                        cc('playBg',    __('Play button background', 'blockenberg'), a.playBg,    'playBg'),
                        cc('playColor', __('Play icon color', 'blockenberg'),       a.playColor, 'playColor'),
                        el(ToggleControl, { label: __('Pulsing animation', 'blockenberg'), checked: a.playPulsing, onChange: function (v) { setAttributes({ playPulsing: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Overlay Text', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show title', 'blockenberg'), checked: a.showTitle, onChange: function (v) { setAttributes({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showTitle && el(TextControl, { label: __('Title', 'blockenberg'), value: a.title, onChange: function (v) { setAttributes({ title: v }); } }),
                        el(ToggleControl, { label: __('Show subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: function (v) { setAttributes({ showSubtitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showSubtitle && el(TextControl, { label: __('Subtitle', 'blockenberg'), value: a.subtitle, onChange: function (v) { setAttributes({ subtitle: v }); } }),
                        cc('titleColor',    __('Title color', 'blockenberg'),    a.titleColor,    'titleColor'),
                        cc('subtitleColor', __('Subtitle color', 'blockenberg'), a.subtitleColor, 'subtitleColor')
                    ),
                    el(PanelBody, { title: __('Caption', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show caption', 'blockenberg'), checked: a.showCaption, onChange: function (v) { setAttributes({ showCaption: v }); }, __nextHasNoMarginBottom: true }),
                        a.showCaption && el(TextControl, { label: __('Caption text', 'blockenberg'), value: a.caption, onChange: function (v) { setAttributes({ caption: v }); } }),
                        a.showCaption && cc('captionColor', __('Caption color', 'blockenberg'), a.captionColor, 'captionColor')
                    ),
                    el(PanelBody, { title: __('Card Style', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Border radius (px)', 'blockenberg'), value: a.borderRadius, min: 0, max: 40, onChange: function (v) { setAttributes({ borderRadius: v }); } }),
                        el(ToggleControl, { label: __('Show shadow', 'blockenberg'), checked: a.showShadow, onChange: function (v) { setAttributes({ showShadow: v }); }, __nextHasNoMarginBottom: true }),
                        cc('bgColor', __('Section background', 'blockenberg'), a.bgColor, 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl(__('Title', 'blockenberg'), 'titleTypo', a, setAttributes),
                        getTypoControl(__('Subtitle', 'blockenberg'), 'subtitleTypo', a, setAttributes),
                        getTypoControl(__('Caption', 'blockenberg'), 'captionTypo', a, setAttributes)
                    )
                ),

                el('div', blockProps,
                    el(VideoPreview, { a: a }),
                    a.showCaption && a.caption && el('p', { className: 'bkbg-vf-caption', style: { marginTop: '10px', color: a.captionColor, textAlign: 'center' } }, a.caption)
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var thumbSrc = a.thumbnailUrl || (a.autoThumb ? getAutoThumb(a.videoProvider, a.videoId) : '');
            var ratio = ASPECT_RATIOS[a.aspectRatio] || 56.25;

            return el('div', wp.blockEditor.useBlockProps.save((function () {
                var _tv = getTypoCssVars(a);
                _tv.backgroundColor = a.bgColor || undefined;
                _tv.paddingTop = a.paddingTop + 'px';
                _tv.paddingBottom = a.paddingBottom + 'px';
                return { className: 'bkbg-vf-wrapper', style: _tv };
            })()),
                el('div', {
                    className: 'bkbg-vf-facade',
                    'data-provider': a.videoProvider,
                    'data-vid': a.videoId,
                    'data-pulsing': a.playPulsing ? '1' : '0',
                    style: {
                        position: 'relative', width: '100%',
                        paddingBottom: ratio + '%',
                        borderRadius: a.borderRadius + 'px',
                        overflow: 'hidden',
                        boxShadow: a.showShadow ? '0 12px 48px rgba(0,0,0,0.18)' : 'none',
                        background: '#111',
                        cursor: 'pointer',
                    }
                },
                    thumbSrc && el('img', {
                        className: 'bkbg-vf-thumb', src: thumbSrc, alt: a.title || '',
                        loading: 'lazy',
                        style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
                    }),
                    el('div', { className: 'bkbg-vf-overlay', style: { position: 'absolute', inset: 0, background: hexToRgba(a.overlayColor, a.overlayOpacity) } }),
                    (a.showTitle || a.showSubtitle) && el('div', { className: 'bkbg-vf-text', style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '32px 24px', textAlign: 'center', pointerEvents: 'none' } },
                        a.showTitle && a.title && el('p', { className: 'bkbg-vf-title', style: { margin: 0, color: a.titleColor } }, a.title),
                        a.showSubtitle && a.subtitle && el('p', { className: 'bkbg-vf-subtitle', style: { margin: '6px 0 0', color: a.subtitleColor } }, a.subtitle)
                    ),
                    el('div', { className: 'bkbg-vf-play', style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' } },
                        a.playStyle === 'oval'
                            ? el('div', { style: { padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '10px', background: a.playBg, borderRadius: '99px' } },
                                el('svg', { xmlns: 'http://www.w3.org/2000/svg', width: a.playSize * 0.45, height: a.playSize * 0.45, viewBox: '0 0 24 24', fill: a.playColor }, el('path', { d: 'M8 5v14l11-7z' })),
                                el('span', { style: { color: a.playColor, fontWeight: 700, fontSize: '16px' } }, 'Watch')
                              )
                            : el('div', { style: { width: a.playSize + 'px', height: a.playSize + 'px', borderRadius: a.playStyle === 'minimal' ? '50%' : '50%', background: a.playStyle === 'minimal' ? 'transparent' : a.playBg, border: a.playStyle === 'minimal' ? '3px solid ' + a.playColor : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                                el('svg', { xmlns: 'http://www.w3.org/2000/svg', width: a.playSize * 0.45, height: a.playSize * 0.45, viewBox: '0 0 24 24', fill: a.playColor }, el('path', { d: 'M8 5v14l11-7z' }))
                              )
                    )
                ),
                a.showCaption && a.caption && el('p', { className: 'bkbg-vf-caption', style: { marginTop: '10px', color: a.captionColor, textAlign: 'center' } }, a.caption)
            );
        }
    });
}() );
