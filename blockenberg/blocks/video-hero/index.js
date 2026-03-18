( function () {
    var el = wp.element.createElement;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var ToggleControl = wp.components.ToggleControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'headingTypo', attrs, '--bkvh-hd-');
        _tvf(v, 'subTypo',     attrs, '--bkvh-sb-');
        _tvf(v, 'eyebrowTypo', attrs, '--bkvh-ey-');
        _tvf(v, 'ctaTypo',     attrs, '--bkvh-ct-');
        return v;
    }

    function wrapStyle(a) {
        var s = getTypoCssVars(a);
        s['--bkbg-vh-bg']           = a.bgColor;
        s['--bkbg-vh-heading-c']    = a.headingColor;
        s['--bkbg-vh-sub-c']        = a.subColor;
        s['--bkbg-vh-eyebrow-c']    = a.eyebrowColor;
        s['--bkbg-vh-accent']       = a.accentColor;
        s['--bkbg-vh-btn-bg']       = a.btnBg;
        s['--bkbg-vh-btn-text']     = a.btnText;
        s['--bkbg-vh-btn2-bg']      = a.btn2Bg;
        s['--bkbg-vh-btn2-text']    = a.btn2Text;
        s['--bkbg-vh-btn2-border']  = a.btn2Border;
        s['--bkbg-vh-video-border'] = a.videoBorder;
        s['--bkbg-vh-cta-r']        = a.ctaRadius + 'px';
        s['--bkbg-vh-pt']           = a.paddingTop + 'px';
        s['--bkbg-vh-pb']           = a.paddingBottom + 'px';
        s['--bkbg-vh-max-w']        = a.maxWidth + 'px';
        s['--bkbg-vh-video-r']      = a.videoRadius + 'px';
        return s;
    }

    var ASPECT_MAP = { '16-9': '56.25%', '4-3': '75%', '21-9': '42.86%' };

    registerBlockType('blockenberg/video-hero', {
        title: __('Video Hero', 'blockenberg'),
        icon: 'video-alt3',
        category: 'bkbg-layout',

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var styleOptions = [
                { label: __('Dark', 'blockenberg'), value: 'dark' },
                { label: __('Light', 'blockenberg'), value: 'light' },
                { label: __('Gradient', 'blockenberg'), value: 'gradient' },
            ];
            var layoutOptions = [
                { label: __('Video below content', 'blockenberg'), value: 'below' },
                { label: __('Video beside content', 'blockenberg'), value: 'side' },
            ];
            var aspectOptions = [
                { label: __('16:9 (Widescreen)', 'blockenberg'), value: '16-9' },
                { label: __('4:3', 'blockenberg'), value: '4-3' },
                { label: __('21:9 (Cinematic)', 'blockenberg'), value: '21-9' },
            ];
            var alignOptions = [
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Left', 'blockenberg'), value: 'left' },
            ];

            function isYoutube(url) { return url && (url.includes('youtube.com') || url.includes('youtu.be')); }
            function isVimeo(url) { return url && url.includes('vimeo.com'); }

            function renderVideoPreview() {
                var padPct = ASPECT_MAP[a.aspectRatio] || '56.25%';
                var shadowStyle = a.videoShadow ? { boxShadow: '0 24px 64px rgba(0,0,0,0.25)' } : {};
                return el('div', {
                    className: 'bkbg-vh-video-wrap bkbg-vh-video--' + a.aspectRatio,
                    style: Object.assign({ borderRadius: a.videoRadius + 'px' }, shadowStyle, { border: '1px solid ' + a.videoBorder })
                },
                    el('div', { className: 'bkbg-vh-video-inner', style: { paddingBottom: padPct, position: 'relative' } },
                        a.videoUrl && (isYoutube(a.videoUrl) || isVimeo(a.videoUrl))
                            ? el('div', { className: 'bkbg-vh-video-embed', style: { position: 'absolute', inset: 0 } },
                                el('div', { style: { background: '#000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', borderRadius: a.videoRadius + 'px' } },
                                    el('span', { style: { opacity: .6 } }, '▶ ' + (isYoutube(a.videoUrl) ? 'YouTube' : 'Vimeo') + ' video will play on frontend')
                                )
                            )
                            : el('div', { style: { position: 'absolute', inset: 0, background: 'rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', borderRadius: a.videoRadius + 'px' } },
                                el('span', { className: 'dashicons dashicons-video-alt3', style: { fontSize: '48px', width: '48px', height: '48px', color: a.accentColor } }),
                                el('span', { style: { color: 'rgba(255,255,255,.5)', fontSize: '13px' } }, a.videoUrl ? a.videoUrl.substring(0, 40) + '…' : __('No video URL set', 'blockenberg'))
                            ),
                        a.showPlayButton && el('div', { className: 'bkbg-vh-play-btn', style: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '64px', height: '64px', background: a.accentColor, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } },
                            el('span', { style: { color:'#fff', fontSize:'24px', marginLeft:'4px' } }, '▶')
                        )
                    )
                );
            }

            var blockProps = useBlockProps({
                className: 'bkbg-vh-wrap bkbg-vh-style--' + a.style + ' bkbg-vh-layout--' + a.videoLayout + ' bkbg-vh-align--' + a.contentAlign,
                style: wrapStyle(a)
            });

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show Eyebrow', 'blockenberg'),
                        checked: a.showEyebrow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showEyebrow: v }); }
                    }),
                    a.showEyebrow && el(TextControl, {
                        label: __('Eyebrow Text', 'blockenberg'),
                        value: a.eyebrow,
                        onChange: function (v) { set({ eyebrow: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Subheading', 'blockenberg'),
                        checked: a.showSubheading,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSubheading: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Primary CTA', 'blockenberg'),
                        checked: a.showCta,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showCta: v }); }
                    }),
                    a.showCta && el(TextControl, {
                        label: __('CTA Text', 'blockenberg'),
                        value: a.ctaText,
                        onChange: function (v) { set({ ctaText: v }); }
                    }),
                    a.showCta && el(TextControl, {
                        label: __('CTA URL', 'blockenberg'),
                        value: a.ctaUrl,
                        onChange: function (v) { set({ ctaUrl: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Secondary CTA', 'blockenberg'),
                        checked: a.showSecondaryCta,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSecondaryCta: v }); }
                    }),
                    a.showSecondaryCta && el(TextControl, {
                        label: __('Secondary Text', 'blockenberg'),
                        value: a.ctaSecondaryText,
                        onChange: function (v) { set({ ctaSecondaryText: v }); }
                    }),
                    a.showSecondaryCta && el(TextControl, {
                        label: __('Secondary URL', 'blockenberg'),
                        value: a.ctaSecondaryUrl,
                        onChange: function (v) { set({ ctaSecondaryUrl: v }); }
                    })
                ),
                el(PanelBody, { title: __('Video', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Video URL / Embed URL', 'blockenberg'),
                        value: a.videoUrl,
                        onChange: function (v) { set({ videoUrl: v }); },
                        help: __('YouTube, Vimeo, or direct embed URL', 'blockenberg')
                    }),
                    el('div', { style: { marginBottom: '12px' } },
                        el('label', { style: { display:'block', fontSize:'11px', fontWeight:'500', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.05em' } }, __('Poster / Thumbnail Image', 'blockenberg')),
                        el(MediaUpload, {
                            onSelect: function (m) { set({ posterUrl: m.url, posterId: m.id }); },
                            allowedTypes: ['image'],
                            value: a.posterId,
                            render: function (p) {
                                return el('div', {},
                                    a.posterUrl && el('img', { src: a.posterUrl, style: { width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px', marginBottom: '6px' } }),
                                    el(Button, { onClick: p.open, variant: 'secondary', isSmall: true }, a.posterUrl ? __('Change Poster', 'blockenberg') : __('Set Poster Image', 'blockenberg'))
                                );
                            }
                        })
                    ),
                    el(SelectControl, {
                        label: __('Video Layout', 'blockenberg'),
                        value: a.videoLayout,
                        options: layoutOptions,
                        onChange: function (v) { set({ videoLayout: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Aspect Ratio', 'blockenberg'),
                        value: a.aspectRatio,
                        options: aspectOptions,
                        onChange: function (v) { set({ aspectRatio: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Play Button Overlay', 'blockenberg'),
                        checked: a.showPlayButton,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showPlayButton: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Video Shadow', 'blockenberg'),
                        checked: a.videoShadow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ videoShadow: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Video Border Radius (px)', 'blockenberg'),
                        value: a.videoRadius,
                        onChange: function (v) { set({ videoRadius: v }); },
                        min: 0,
                        max: 32
                    })
                ),
                el(PanelBody, { title: __('Style & Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Section Style', 'blockenberg'),
                        value: a.style,
                        options: styleOptions,
                        onChange: function (v) { set({ style: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Content Alignment', 'blockenberg'),
                        value: a.contentAlign,
                        options: alignOptions,
                        onChange: function (v) { set({ contentAlign: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Max Content Width (px)', 'blockenberg'),
                        value: a.maxWidth,
                        onChange: function (v) { set({ maxWidth: v }); },
                        min: 480,
                        max: 1200,
                        step: 20
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: a.paddingTop,
                        onChange: function (v) { set({ paddingTop: v }); },
                        min: 0, max: 200
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: a.paddingBottom,
                        onChange: function (v) { set({ paddingBottom: v }); },
                        min: 0, max: 200
                    })
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl(__('Heading', 'blockenberg'), 'headingTypo', a, set),
                    getTypoControl(__('Subheading', 'blockenberg'), 'subTypo', a, set),
                    getTypoControl(__('Eyebrow', 'blockenberg'), 'eyebrowTypo', a, set),
                    getTypoControl(__('CTA Button', 'blockenberg'), 'ctaTypo', a, set)
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#0f172a' }); } },
                        { label: __('Accent Color', 'blockenberg'), value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#6c3fb5' }); } },
                        { label: __('Heading', 'blockenberg'), value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#ffffff' }); } },
                        { label: __('Subheading', 'blockenberg'), value: a.subColor, onChange: function (v) { set({ subColor: v || 'rgba(255,255,255,0.65)' }); } },
                        { label: __('Eyebrow', 'blockenberg'), value: a.eyebrowColor, onChange: function (v) { set({ eyebrowColor: v || '#a78bfa' }); } },
                        { label: __('Primary Button', 'blockenberg'), value: a.btnBg, onChange: function (v) { set({ btnBg: v || '#6c3fb5' }); } },
                        { label: __('Primary Button Text', 'blockenberg'), value: a.btnText, onChange: function (v) { set({ btnText: v || '#ffffff' }); } },
                        { label: __('Secondary Button Text', 'blockenberg'), value: a.btn2Text, onChange: function (v) { set({ btn2Text: v || 'rgba(255,255,255,0.85)' }); } },
                        { label: __('Video Border', 'blockenberg'), value: a.videoBorder, onChange: function (v) { set({ videoBorder: v || 'rgba(255,255,255,0.1)' }); } },
                    ]
                })
            );

            var canvas = el('div', blockProps,
                el('div', { className: 'bkbg-vh-inner' },
                    el('div', { className: 'bkbg-vh-content' },
                        a.showEyebrow && a.eyebrow && el('span', { className: 'bkbg-vh-eyebrow' }, a.eyebrow),
                        el(RichText, {
                            tagName: 'h1',
                            className: 'bkbg-vh-heading',
                            value: a.heading,
                            onChange: function (v) { set({ heading: v }); },
                            placeholder: __('Enter headline…', 'blockenberg'),
                            allowedFormats: ['core/bold', 'core/italic']
                        }),
                        a.showSubheading && el(RichText, {
                            tagName: 'p',
                            className: 'bkbg-vh-sub',
                            value: a.subheading,
                            onChange: function (v) { set({ subheading: v }); },
                            placeholder: __('Enter subheading…', 'blockenberg'),
                            allowedFormats: ['core/bold', 'core/italic']
                        }),
                        (a.showCta || a.showSecondaryCta) && el('div', { className: 'bkbg-vh-ctas' },
                            a.showCta && el('a', { className: 'bkbg-vh-btn bkbg-vh-btn--primary', href: '#', onClick: function (e) { e.preventDefault(); } }, a.ctaText),
                            a.showSecondaryCta && el('a', { className: 'bkbg-vh-btn bkbg-vh-btn--secondary', href: '#', onClick: function (e) { e.preventDefault(); } }, a.ctaSecondaryText)
                        )
                    ),
                    el('div', { className: 'bkbg-vh-video-col' },
                        renderVideoPreview()
                    )
                )
            );

            return el('div', {}, inspector, canvas);
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = useBlockProps.save({
                className: 'bkbg-vh-wrap bkbg-vh-style--' + a.style + ' bkbg-vh-layout--' + a.videoLayout + ' bkbg-vh-align--' + a.contentAlign,
                style: wrapStyle(a)
            });
            var padPct = ASPECT_MAP[a.aspectRatio] || '56.25%';
            var shadowStyle = a.videoShadow ? { boxShadow: '0 24px 64px rgba(0,0,0,0.25)' } : {};

            return el('div', blockProps,
                el('div', { className: 'bkbg-vh-inner' },
                    el('div', { className: 'bkbg-vh-content' },
                        a.showEyebrow && a.eyebrow && el('span', { className: 'bkbg-vh-eyebrow' }, a.eyebrow),
                        el(RichText.Content, { tagName: 'h1', className: 'bkbg-vh-heading', value: a.heading }),
                        a.showSubheading && el(RichText.Content, { tagName: 'p', className: 'bkbg-vh-sub', value: a.subheading }),
                        (a.showCta || a.showSecondaryCta) && el('div', { className: 'bkbg-vh-ctas' },
                            a.showCta && el('a', { className: 'bkbg-vh-btn bkbg-vh-btn--primary', href: a.ctaUrl }, a.ctaText),
                            a.showSecondaryCta && el('a', { className: 'bkbg-vh-btn bkbg-vh-btn--secondary', href: a.ctaSecondaryUrl }, a.ctaSecondaryText)
                        )
                    ),
                    el('div', { className: 'bkbg-vh-video-col' },
                        el('div', {
                            className: 'bkbg-vh-video-wrap bkbg-vh-video--' + a.aspectRatio,
                            style: Object.assign({ borderRadius: a.videoRadius + 'px' }, shadowStyle, { border: '1px solid ' + a.videoBorder })
                        },
                            el('div', { className: 'bkbg-vh-video-inner', style: { paddingBottom: padPct, position: 'relative' } },
                                el('iframe', {
                                    className: 'bkbg-vh-iframe',
                                    src: a.videoUrl,
                                    frameBorder: '0',
                                    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                                    allowFullScreen: true,
                                    style: { position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: a.videoRadius + 'px' }
                                }),
                                a.showPlayButton && a.posterUrl && el('div', {
                                    className: 'bkbg-vh-poster',
                                    'data-video': a.videoUrl,
                                    style: { position: 'absolute', inset: 0, cursor: 'pointer' }
                                },
                                    el('img', { src: a.posterUrl, alt: '', style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: a.videoRadius + 'px' } }),
                                    el('div', { className: 'bkbg-vh-play-btn' },
                                        el('span', {}, '▶')
                                    )
                                )
                            )
                        )
                    )
                )
            );
        }
    });
}() );
