( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody    = wp.components.PanelBody;
    var Button       = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl  = wp.components.TextControl;
    var ColorPicker  = wp.components.ColorPicker;
    var Popover      = wp.components.Popover;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'badgeTypo',     attrs, '--bkvs-bg-');
        _tvf(v, 'headlineTypo',  attrs, '--bkvs-hd-');
        _tvf(v, 'subtextTypo',   attrs, '--bkvs-st-');
        _tvf(v, 'statValueTypo', attrs, '--bkvs-sv-');
        _tvf(v, 'statLabelTypo', attrs, '--bkvs-sl-');
        return v;
    }

    var VIDEO_TYPE_OPTIONS = [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Vimeo',   value: 'vimeo' },
        { label: __('Self-hosted', 'blockenberg'), value: 'self' },
    ];
    var ASPECT_OPTIONS = [
        { label: '16 / 9', value: '16/9' },
        { label: '4 / 3',  value: '4/3' },
        { label: '21 / 9', value: '21/9' },
        { label: '1 / 1',  value: '1/1' },
    ];
    var LAYOUT_OPTIONS = [
        { label: __('Full hero', 'blockenberg'), value: 'hero' },
        { label: __('Centered card', 'blockenberg'), value: 'card' },
        { label: __('Content above', 'blockenberg'), value: 'above' },
    ];
    var ALIGN_OPTIONS = [
        { label: __('Left',   'blockenberg'), value: 'left' },
        { label: __('Center', 'blockenberg'), value: 'center' },
        { label: __('Right',  'blockenberg'), value: 'right' },
    ];
    var PLAY_STYLE_OPTIONS = [
        { label: __('Circle', 'blockenberg'), value: 'circle' },
        { label: __('Square', 'blockenberg'), value: 'square' },
        { label: __('Pill',   'blockenberg'), value: 'pill' },
    ];

    function makeId() { return 'st' + Math.random().toString(36).substr(2, 5); }

    function ratioPercent(r) {
        var p = r.split('/');
        return (parseInt(p[1], 10) / parseInt(p[0], 10) * 100).toFixed(2) + '%';
    }

    function buildWrapStyle(a) {
        var s = getTypoCssVars(a);
        s['--bkbg-vs-accent']       = a.accentColor;
        s['--bkbg-vs-headline']     = a.headlineColor;
        s['--bkbg-vs-subtext']      = a.subtextColor;
        s['--bkbg-vs-badge-bg']     = a.badgeBg;
        s['--bkbg-vs-badge-color']  = a.badgeColor;
        s['--bkbg-vs-play-bg']      = a.playBg;
        s['--bkbg-vs-play-color']   = a.playColor;
        s['--bkbg-vs-stat-value']   = a.statValueColor;
        s['--bkbg-vs-stat-label']   = a.statLabelColor;
        s['--bkbg-vs-stat-divider'] = a.statDividerColor;
        s['--bkbg-vs-br']           = a.borderRadius + 'px';
        s['--bkbg-vs-max-w']        = a.maxWidth + 'px';
        s['--bkbg-vs-play-sz']      = a.playButtonSize + 'px';
        s['--bkbg-vs-text-align']   = a.textAlign;
        s.paddingTop    = a.paddingTop + 'px';
        s.paddingBottom = a.paddingBottom + 'px';
        s.backgroundColor = a.bgColor || undefined;
        return s;
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', title: value || 'default', onClick: function () { setOpenKey(isOpen ? null : key); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#cccccc' }
                }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Video embed preview (editor only) ──────────────────────────────── */
    function VideoEmbed(props) {
        var a = props.a;
        var src = '';
        if (a.videoType === 'youtube' && a.youtubeId) {
            src = 'https://www.youtube-nocookie.com/embed/' + a.youtubeId + '?controls=1';
        } else if (a.videoType === 'vimeo' && a.vimeoId) {
            src = 'https://player.vimeo.com/video/' + a.vimeoId;
        }

        var boxStyle = { position: 'relative', borderRadius: a.borderRadius + 'px', overflow: 'hidden', boxShadow: a.showShadow ? '0 24px 64px rgba(0,0,0,0.18)' : 'none', background: '#111', maxWidth: a.maxWidth + 'px', margin: '0 auto' };

        if (src) {
            return el('div', { style: boxStyle },
                el('div', { style: { paddingBottom: ratioPercent(a.aspectRatio) } }),
                el('iframe', { src: src, frameBorder: '0', allowFullScreen: true, style: { position: 'absolute', inset: 0, width: '100%', height: '100%' } })
            );
        }

        /* placeholder with thumbnail */
        return el('div', { style: Object.assign({}, boxStyle, { cursor: 'default' }) },
            el('div', { style: { paddingBottom: ratioPercent(a.aspectRatio) } }),
            el('div', { style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' } },
                a.posterUrl
                    ? el('img', { src: a.posterUrl, alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })
                    : null,
                el('div', { style: { position: 'relative', zIndex: 2, width: a.playButtonSize + 'px', height: a.playButtonSize + 'px', borderRadius: a.playButtonStyle === 'circle' ? '50%' : a.playButtonStyle === 'pill' ? '99px' : '12px', background: a.playBg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' } },
                    el('span', { style: { fontSize: (a.playButtonSize * 0.35) + 'px', color: a.playColor, marginLeft: '4px' } }, '▶')
                ),
                !a.posterUrl && el('p', { style: { position: 'relative', zIndex: 2, color: '#9ca3af', fontSize: '13px', margin: 0 } },
                    a.videoType === 'youtube' ? __('Enter YouTube Video ID in sidebar →', 'blockenberg') :
                    a.videoType === 'vimeo'   ? __('Enter Vimeo Video ID in sidebar →', 'blockenberg') :
                    __('Add a thumbnail image in sidebar →', 'blockenberg')
                )
            )
        );
    }

    registerBlockType('blockenberg/video-section', {
        title: __('Video Section', 'blockenberg'),
        icon: 'format-video',
        category: 'bkbg-media',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateStat(id, key, val) {
                setAttributes({ stats: a.stats.map(function (s) { if (s.id !== id) return s; var u = Object.assign({}, s); u[key] = val; return u; }) });
            }

            var contentBox = a.showContent && el('div', { className: 'bkbg-vs-content', style: { textAlign: a.textAlign, marginBottom: a.contentPosition === 'above' ? '40px' : '40px', marginTop: a.contentPosition === 'below' ? '40px' : 0 } },
                a.showBadge && el('span', { className: 'bkbg-vs-badge', style: { display: 'inline-block', background: a.badgeBg, color: a.badgeColor, padding: '5px 16px', borderRadius: '99px', marginBottom: '16px' } }, a.badge),
                el(RichText, { tagName: a.headlineTag, className: 'bkbg-vs-headline', value: a.headline, onChange: function (v) { setAttributes({ headline: v }); }, placeholder: __('Video section headline…', 'blockenberg'), style: { color: a.headlineColor, margin: '0 0 14px' } }),
                el(RichText, { tagName: 'p', className: 'bkbg-vs-subtext', value: a.subtext, onChange: function (v) { setAttributes({ subtext: v }); }, placeholder: __('Supporting description…', 'blockenberg'), style: { color: a.subtextColor, margin: 0 } })
            );

            var statsBox = a.showStats && el('div', { className: 'bkbg-vs-stats', style: { display: 'flex', alignItems: 'center', justifyContent: a.textAlign === 'center' ? 'center' : 'flex-start', gap: '0', marginTop: '40px', flexWrap: 'wrap' } },
                a.stats.map(function (s, i) {
                    return el(Fragment, { key: s.id },
                        i > 0 && el('div', { style: { width: '1px', height: '40px', background: a.statDividerColor, margin: '0 32px', flexShrink: 0 } }),
                        el('div', { style: { textAlign: 'center' } },
                            el('div', { className: 'bkbg-vs-stat-value', style: { color: a.statValueColor } }, s.value),
                            el('div', { className: 'bkbg-vs-stat-label', style: { color: a.statLabelColor, marginTop: '4px' } }, s.label)
                        )
                    );
                })
            );

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Video Source', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Video type', 'blockenberg'), value: a.videoType, options: VIDEO_TYPE_OPTIONS, onChange: function (v) { setAttributes({ videoType: v }); } }),
                        a.videoType === 'youtube' && el(TextControl, { label: __('YouTube Video ID', 'blockenberg'), help: __('e.g. dQw4w9WgXcQ from the URL', 'blockenberg'), value: a.youtubeId, onChange: function (v) { setAttributes({ youtubeId: v.trim() }); } }),
                        a.videoType === 'vimeo'   && el(TextControl, { label: __('Vimeo Video ID',   'blockenberg'), help: __('e.g. 148751763 from the URL', 'blockenberg'),     value: a.vimeoId,   onChange: function (v) { setAttributes({ vimeoId:   v.trim() }); } }),
                        a.videoType === 'self'    && el(TextControl, { label: __('Video URL (.mp4)', 'blockenberg'), value: a.videoUrl, onChange: function (v) { setAttributes({ videoUrl: v }); } }),
                        el('p', { style: { fontSize: '12px', color: '#6b7280', margin: '4px 0 8px' } }, __('Thumbnail / poster image:', 'blockenberg')),
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (m) { setAttributes({ posterUrl: m.url, posterId: m.id }); },
                                allowedTypes: ['image'], value: a.posterId,
                                render: function (p) { return el('div', null,
                                    a.posterUrl && el('img', { src: a.posterUrl, style: { width: '100%', borderRadius: '6px', marginBottom: '6px' } }),
                                    el(Button, { onClick: p.open, variant: a.posterUrl ? 'secondary' : 'primary', size: 'compact' }, a.posterUrl ? __('Replace thumbnail', 'blockenberg') : __('Add thumbnail', 'blockenberg'))
                                ); }
                            })
                        )
                    ),
                    el(PanelBody, { title: __('Layout & Display', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Aspect ratio',    'blockenberg'), value: a.aspectRatio, options: ASPECT_OPTIONS, onChange: function (v) { setAttributes({ aspectRatio: v }); } }),
                        el(SelectControl, { label: __('Play button style','blockenberg'), value: a.playButtonStyle, options: PLAY_STYLE_OPTIONS, onChange: function (v) { setAttributes({ playButtonStyle: v }); } }),
                        el(RangeControl,  { label: __('Play button size (px)', 'blockenberg'), value: a.playButtonSize, min: 48, max: 120, onChange: function (v) { setAttributes({ playButtonSize: v }); } }),
                        el(RangeControl,  { label: __('Video max width (px)', 'blockenberg'), value: a.maxWidth, min: 400, max: 1400, onChange: function (v) { setAttributes({ maxWidth: v }); } }),
                        el(RangeControl,  { label: __('Border radius (px)',   'blockenberg'), value: a.borderRadius, min: 0, max: 32, onChange: function (v) { setAttributes({ borderRadius: v }); } }),
                        el(ToggleControl, { label: __('Video shadow',   'blockenberg'), checked: a.showShadow, onChange: function (v) { setAttributes({ showShadow: v }); }, __nextHasNoMarginBottom: true }),
                        el(SelectControl, { label: __('Text alignment', 'blockenberg'), value: a.textAlign, options: ALIGN_OPTIONS, onChange: function (v) { setAttributes({ textAlign: v }); } })
                    ),
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show content block', 'blockenberg'), checked: a.showContent, onChange: function (v) { setAttributes({ showContent: v }); }, __nextHasNoMarginBottom: true }),
                        a.showContent && el(ToggleControl, { label: __('Show badge',        'blockenberg'), checked: a.showBadge,   onChange: function (v) { setAttributes({ showBadge:   v }); }, __nextHasNoMarginBottom: true }),
                        a.showContent && a.showBadge && el(TextControl, { label: __('Badge text', 'blockenberg'), value: a.badge, onChange: function (v) { setAttributes({ badge: v }); } }),
                        a.showContent && el(SelectControl, { label: __('Headline tag', 'blockenberg'), value: a.headlineTag, options: ['h1','h2','h3','h4'].map(function (t) { return { label: t.toUpperCase(), value: t }; }), onChange: function (v) { setAttributes({ headlineTag: v }); } })
                    ),
                    el(PanelBody, { title: __('Stats', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show stats strip', 'blockenberg'), checked: a.showStats, onChange: function (v) { setAttributes({ showStats: v }); }, __nextHasNoMarginBottom: true }),
                        a.showStats && a.stats.map(function (s, i) {
                            return el(PanelBody, { key: s.id, title: __('Stat', 'blockenberg') + ' ' + (i + 1), initialOpen: false },
                                el(TextControl, { label: __('Value', 'blockenberg'), value: s.value, onChange: function (v) { updateStat(s.id, 'value', v); } }),
                                el(TextControl, { label: __('Label', 'blockenberg'), value: s.label, onChange: function (v) { updateStat(s.id, 'label', v); } })
                            );
                        }),
                        a.showStats && el(Button, { variant: 'secondary', size: 'compact', onClick: function () { setAttributes({ stats: a.stats.concat([{ id: makeId(), value: '99%', label: 'Satisfaction' }]) }); } }, __('+ Add Stat', 'blockenberg'))
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl(__('Badge', 'blockenberg'), 'badgeTypo', a, setAttributes),
                        getTypoControl(__('Headline', 'blockenberg'), 'headlineTypo', a, setAttributes),
                        getTypoControl(__('Subtext', 'blockenberg'), 'subtextTypo', a, setAttributes),
                        getTypoControl(__('Stat Value', 'blockenberg'), 'statValueTypo', a, setAttributes),
                        getTypoControl(__('Stat Label', 'blockenberg'), 'statLabelTypo', a, setAttributes)
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',   __('Accent',            'blockenberg'), 'accentColor'),
                        cc('headlineColor', __('Headline',          'blockenberg'), 'headlineColor'),
                        cc('subtextColor',  __('Subtext',           'blockenberg'), 'subtextColor'),
                        cc('badgeBg',       __('Badge background',  'blockenberg'), 'badgeBg'),
                        cc('badgeColor',    __('Badge text',        'blockenberg'), 'badgeColor'),
                        cc('playBg',        __('Play button bg',    'blockenberg'), 'playBg'),
                        cc('playColor',     __('Play button icon',  'blockenberg'), 'playColor'),
                        cc('statValueColor',__('Stat value',        'blockenberg'), 'statValueColor'),
                        cc('statLabelColor',__('Stat label',        'blockenberg'), 'statLabelColor'),
                        cc('statDividerColor',__('Stat divider',    'blockenberg'), 'statDividerColor'),
                        cc('bgColor',       __('Section background','blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    a.showContent && contentBox,
                    el(VideoEmbed, { a: a }),
                    statsBox
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            var src = '';
            if (a.videoType === 'youtube' && a.youtubeId) {
                src = 'https://www.youtube-nocookie.com/embed/' + a.youtubeId + '?controls=1&rel=0';
            } else if (a.videoType === 'vimeo' && a.vimeoId) {
                src = 'https://player.vimeo.com/video/' + a.vimeoId;
            }
            var hasSrc = !!src;
            var hasVideo = hasSrc || a.videoType === 'self';

            var contentBox = a.showContent && el('div', { className: 'bkbg-vs-content' },
                a.showBadge && el('span', { className: 'bkbg-vs-badge' }, a.badge),
                el(RichText.Content, { tagName: a.headlineTag, value: a.headline, className: 'bkbg-vs-headline' }),
                el(RichText.Content, { tagName: 'p', value: a.subtext, className: 'bkbg-vs-subtext' })
            );

            var videoBox = el('div', { className: 'bkbg-vs-video-wrap', style: { maxWidth: a.maxWidth + 'px', margin: '0 auto' } },
                el('div', { className: 'bkbg-vs-video-frame', style: { position: 'relative', borderRadius: a.borderRadius + 'px', overflow: 'hidden', boxShadow: a.showShadow ? '0 24px 64px rgba(0,0,0,0.18)' : 'none', background: '#111' } },
                    el('div', { style: { paddingBottom: (a.aspectRatio.split('/').reduce(function (_, v, i, arr) { return i === 1 ? (parseInt(v,10) / parseInt(arr[0],10) * 100).toFixed(2) : _; }, '56.25') + '%') } }),
                    hasSrc
                        ? el('iframe', { src: src, frameBorder: '0', allow: 'autoplay; fullscreen; picture-in-picture', allowFullScreen: true, loading: 'lazy', className: 'bkbg-vs-iframe', style: { position: 'absolute', inset: 0, width: '100%', height: '100%' } })
                        : null,
                    a.videoType === 'self' && a.videoUrl
                        ? el('video', { src: a.videoUrl, controls: true, poster: a.posterUrl || undefined, className: 'bkbg-vs-selfhosted', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })
                        : null,
                    !hasVideo && a.posterUrl
                        ? el(Fragment, null,
                            el('img', { src: a.posterUrl, alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } }),
                            el('button', { type: 'button', className: 'bkbg-vs-play-btn', 'aria-label': __('Play video', 'blockenberg') },
                                el('span', { className: 'bkbg-vs-play-icon' }, '▶')
                            )
                        )
                        : null
                )
            );

            var statsBox = a.showStats && el('div', { className: 'bkbg-vs-stats' },
                a.stats.map(function (s, i) {
                    return el(Fragment, { key: s.id },
                        i > 0 && el('div', { className: 'bkbg-vs-stat-divider', 'aria-hidden': 'true' }),
                        el('div', { className: 'bkbg-vs-stat' },
                            el('div', { className: 'bkbg-vs-stat-value' }, s.value),
                            el('div', { className: 'bkbg-vs-stat-label' }, s.label)
                        )
                    );
                })
            );

            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-vs-wrapper', style: buildWrapStyle(a) }),
                contentBox,
                videoBox,
                statsBox
            );
        }
    });
}() );
