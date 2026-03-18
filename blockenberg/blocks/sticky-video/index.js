( function () {
    var el               = wp.element.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps    = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var MediaUpload      = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelBody        = wp.components.PanelBody;
    var TextControl      = wp.components.TextControl;
    var ToggleControl    = wp.components.ToggleControl;
    var SelectControl    = wp.components.SelectControl;
    var RangeControl     = wp.components.RangeControl;
    var Button           = wp.components.Button;
    var useState         = wp.element.useState;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var ASPECTS = [
        { label: '16:9 (Widescreen)', value: '16:9' },
        { label: '4:3 (Classic)',      value: '4:3'  },
        { label: '1:1 (Square)',       value: '1:1'  },
        { label: '9:16 (Portrait)',    value: '9:16' },
        { label: '21:9 (Ultrawide)',   value: '21:9' }
    ];

    var CORNERS = [
        { label: 'Bottom Right', value: 'bottom-right' },
        { label: 'Bottom Left',  value: 'bottom-left'  },
        { label: 'Top Right',    value: 'top-right'    },
        { label: 'Top Left',     value: 'top-left'     }
    ];

    var VIDEO_TYPES = [
        { label: 'YouTube',   value: 'youtube'   },
        { label: 'Vimeo',     value: 'vimeo'     },
        { label: 'Self-Hosted (MP4)', value: 'self'  }
    ];

    function getAspectPad(ratio) {
        var parts = ratio.split(':');
        var w = parseFloat(parts[0]) || 16;
        var h = parseFloat(parts[1]) || 9;
        return ((h / w) * 100).toFixed(2) + '%';
    }

    function getEmbedUrl(attr) {
        var url  = attr.videoUrl || '';
        var type = attr.videoType || 'youtube';
        var ytMatch = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
        var vmMatch = url.match(/vimeo\.com\/(\d+)/);
        if (type === 'youtube' && ytMatch) {
            var params = '?rel=0' + (attr.autoplay ? '&autoplay=1' : '') + (attr.muted ? '&mute=1' : '') + (attr.loop ? '&loop=1&playlist=' + ytMatch[1] : '') + (!attr.controls ? '&controls=0' : '');
            return 'https://www.youtube.com/embed/' + ytMatch[1] + params;
        }
        if (type === 'vimeo' && vmMatch) {
            var vparams = '?' + (attr.autoplay ? 'autoplay=1&' : '') + (attr.muted ? 'muted=1&' : '') + (attr.loop ? 'loop=1&' : '');
            return 'https://player.vimeo.com/video/' + vmMatch[1] + vparams;
        }
        return url;
    }

    registerBlockType('blockenberg/sticky-video', {
        edit: function (props) {
            var attr     = props.attributes;
            var setAttr  = props.setAttributes;
            var blockProps = useBlockProps((function() {
                var _tvf = getTypoCssVars();
                var s = { background: attr.sectionBg || undefined };
                if (_tvf) {
                    Object.assign(s, _tvf(attr.titleTypo, '--bksv-tt-'));
                    Object.assign(s, _tvf(attr.subtitleTypo, '--bksv-st-'));
                }
                s['--bksv-title-fw'] = attr.titleFontWeight || '700';
                s['--bksv-title-lh'] = attr.titleLineHeight || 1.2;
                s['--bksv-st-fw'] = attr.subtitleFontWeight || '400';
                s['--bksv-st-lh'] = attr.subtitleLineHeight || 1.5;
                return { style: s };
            })());

            var padBottom = getAspectPad(attr.aspectRatio);
            var embedUrl  = getEmbedUrl(attr);

            return el('div', blockProps,
                el(InspectorControls, {},

                    // Video Source
                    el(PanelBody, { title: 'Video Source', initialOpen: true },
                        el(SelectControl, { label: 'Type', value: attr.videoType, options: VIDEO_TYPES, onChange: function(v){ setAttr({ videoType: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginTop: 12 } }),
                        el(TextControl, { label: 'Video URL', value: attr.videoUrl, placeholder: attr.videoType === 'youtube' ? 'https://www.youtube.com/watch?v=...' : attr.videoType === 'vimeo' ? 'https://vimeo.com/...' : 'https://example.com/video.mp4', onChange: function(v){ setAttr({ videoUrl: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginTop: 12 } }),
                        el(TextControl, { label: 'Title', value: attr.title, onChange: function(v){ setAttr({ title: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show title overlay', checked: attr.showTitle, onChange: function(v){ setAttr({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Subtitle (optional)', value: attr.subtitle, onChange: function(v){ setAttr({ subtitle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginTop: 8 } }),
                        el('p', { style: { fontSize: 11, color: '#64748b', margin: 0 } }, 'Poster image (shown before play):'),
                        el(MediaUploadCheck, {},
                            el(MediaUpload, {
                                onSelect: function(m){ setAttr({ posterUrl: m.url }); },
                                allowedTypes: ['image'],
                                value: attr.posterUrl,
                                render: function(obj) {
                                    return el('div', { style: { marginTop: 6 } },
                                        el(Button, { onClick: obj.open, variant: 'secondary', size: 'small' }, attr.posterUrl ? 'Change Poster' : 'Set Poster Image'),
                                        attr.posterUrl && el(Button, { onClick: function(){ setAttr({ posterUrl: '' }); }, variant: 'link', isDestructive: true, size: 'small', style: { marginLeft: 8 } }, 'Remove')
                                    );
                                }
                            })
                        )
                    ),

                    // Playback
                    el(PanelBody, { title: 'Playback Options', initialOpen: false },
                        el(ToggleControl, { label: 'Autoplay', checked: attr.autoplay, onChange: function(v){ setAttr({ autoplay: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Muted', checked: attr.muted, onChange: function(v){ setAttr({ muted: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Loop', checked: attr.loop, onChange: function(v){ setAttr({ loop: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show controls', checked: attr.controls, onChange: function(v){ setAttr({ controls: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show overlay play button', checked: attr.showOverlayPlay, onChange: function(v){ setAttr({ showOverlayPlay: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Layout
                    el(PanelBody, { title: 'Player Layout', initialOpen: false },
                        el(SelectControl, { label: 'Aspect Ratio', value: attr.aspectRatio, options: ASPECTS, onChange: function(v){ setAttr({ aspectRatio: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Border Radius', value: attr.borderRadius, min: 0, max: 40, onChange: function(v){ setAttr({ borderRadius: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Sticky
                    el(PanelBody, { title: 'Sticky / PiP Behaviour', initialOpen: false },
                        el(ToggleControl, { label: 'Enable sticky-on-scroll', checked: attr.stickyEnabled, onChange: function(v){ setAttr({ stickyEnabled: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Only stick when playing', checked: attr.stickyOnPlay, onChange: function(v){ setAttr({ stickyOnPlay: v }); }, __nextHasNoMarginBottom: true }),
                        el(SelectControl, { label: 'Sticky Corner', value: attr.stickyCorner, options: CORNERS, onChange: function(v){ setAttr({ stickyCorner: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Sticky Width (px)', value: attr.stickyWidth, min: 200, max: 500, step: 10, onChange: function(v){ setAttr({ stickyWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Edge Offset (px)', value: attr.stickyOffset, min: 8, max: 80, onChange: function(v){ setAttr({ stickyOffset: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Sticky Radius (px)', value: attr.stickyRadius, min: 0, max: 30, onChange: function(v){ setAttr({ stickyRadius: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Colors
                    el( PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl() && getTypoControl()({ label: 'Title', value: attr.titleTypo, onChange: function (v) { setAttr({ titleTypo: v }); } }),
                        getTypoControl() && getTypoControl()({ label: 'Subtitle', value: attr.subtitleTypo, onChange: function (v) { setAttr({ subtitleTypo: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Overlay Background', value: attr.overlayBg,   onChange: function(v){ setAttr({ overlayBg:   v || 'rgba(0,0,0,0.35)' }); } },
                            { label: 'Overlay Text/Icon',  value: attr.overlayColor, onChange: function(v){ setAttr({ overlayColor: v || '#ffffff' }); } },
                            { label: 'Sticky Bar BG',      value: attr.stickyBg,    onChange: function(v){ setAttr({ stickyBg:    v || '#1e293b' }); } },
                            { label: 'Section Background', value: attr.sectionBg,   onChange: function(v){ setAttr({ sectionBg:   v || '' }); } }
                        ]
                    })
                ),

                // Editor preview
                el('div', { className: 'bkbg-sv-preview', style: { borderRadius: attr.borderRadius + 'px', overflow: 'hidden', position: 'relative' } },
                    el('div', { style: { position: 'relative', paddingBottom: padBottom, background: '#0f172a', borderRadius: attr.borderRadius + 'px', overflow: 'hidden' } },
                        attr.posterUrl
                            ? el('img', { src: attr.posterUrl, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 } })
                            : el('div', { style: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1e293b,#334155)', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                                el('div', { style: { textAlign: 'center', color: '#94a3b8' } },
                                    el('div', { style: { fontSize: 48, marginBottom: 8 } }, '▶'),
                                    el('div', { style: { fontSize: 13 } }, attr.videoUrl ? attr.videoType.toUpperCase() + ' video set' : 'Enter a video URL in settings')
                                )
                            ),
                        attr.showTitle && attr.title && el('div', { style: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 16px 12px', background: 'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 100%)', color: '#fff' } },
                            el('div', { className: 'bkbg-sv-title-text' }, attr.title),
                            attr.subtitle && el('div', { className: 'bkbg-sv-subtitle-text', style: { marginTop: 3 } }, attr.subtitle)
                        ),
                        attr.stickyEnabled && el('div', { style: { position: 'absolute', top: 10, right: 12, background: 'rgba(99,102,241,0.85)', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600 } }, '📌 Sticky enabled')
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var blockProps = useBlockProps.save();
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-sv-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
