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
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var Button = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;

    /* ── Typography lazy getters ───────────────────────────────────────────── */
    var _Typo, _tv;
    Object.defineProperty(window, '__bkbgApTypoReady', { get: function () {
        if (!_Typo) _Typo = window.bkbgTypographyControl;
        if (!_tv)   _tv   = window.bkbgTypoCssVars;
        return !!(_Typo && _tv);
    }});

    function getTypoCssVars()  { window.__bkbgApTypoReady; return _tv;   }
    function getTypoComponent() { window.__bkbgApTypoReady; return _Typo; }

    // ── CSS vars ──────────────────────────────────────────────────────────────
    function buildWrapStyle(a) {
        var tv = getTypoCssVars();
        var shadow = a.boxShadow === 'sm' ? '0 1px 6px rgba(0,0,0,0.08)' :
                     a.boxShadow === 'md' ? '0 4px 20px rgba(0,0,0,0.12)' :
                     a.boxShadow === 'lg' ? '0 12px 48px rgba(0,0,0,0.16)' : 'none';
        var s = {
            '--bkbg-ap-accent'       : a.accentColor,
            '--bkbg-ap-progress-bg'  : a.progressBg,
            '--bkbg-ap-bg'           : a.bgColor,
            '--bkbg-ap-text-color'   : a.textColor,
            '--bkbg-ap-subtitle-color': a.subtitleColor,
            '--bkbg-ap-icon-color'   : a.iconColor,
            '--bkbg-ap-icon-bg'      : a.iconBg,
            '--bkbg-ap-cover-radius' : a.coverRadius + 'px',
            '--bkbg-ap-cover-size'   : a.coverSize + 'px',
            '--bkbg-ap-radius'       : a.playerRadius + 'px',
            '--bkbg-ap-pad'          : a.playerPaddingV + 'px ' + a.playerPaddingH + 'px',
            '--bkbg-ap-shadow'       : shadow,
            '--bkbg-ap-title-size'   : a.titleSize + 'px',
            '--bkbg-ap-title-weight' : a.titleWeight,
            '--bkbg-ap-artist-size'  : a.artistSize + 'px',
            '--bkbg-ap-btn-size'     : a.playButtonSize + 'px',
            '--bkbg-ap-progress-h'   : a.progressHeight + 'px',
            '--bkbg-ap-max-width'    : a.maxWidth + 'px'
        };
        if (tv) {
            Object.assign(s, tv(a.titleTypo  || {}, '--bkbg-ap-title-'));
            Object.assign(s, tv(a.artistTypo || {}, '--bkbg-ap-artist-'));
        }
        return s;
    }

    // ── Color swatch ──────────────────────────────────────────────────────────
    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', {
                    type: 'button', title: value || 'none',
                    onClick: function () { setOpenKey(isOpen ? null : key); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#fff' }
                }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    // ── Play / Pause icons ────────────────────────────────────────────────────
    var PlayIcon = el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor', width: '22', height: '22' },
        el('path', { d: 'M8 5v14l11-7z' })
    );

    var MusicIcon = el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor', width: '40', height: '40' },
        el('path', { d: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z', opacity: '0.6' })
    );

    // ── Register ──────────────────────────────────────────────────────────────
    registerBlockType('blockenberg/audio-player', {
        title: __('Audio Player', 'blockenberg'),
        icon: 'controls-play',
        category: 'bkbg-media',
        description: __('Custom-styled audio player with cover art and track info.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            var blockProps = useBlockProps({
                className: 'bkbg-ap-wrapper bkbg-ap-style-' + a.playerStyle,
                style: buildWrapStyle(a)
            });

            // ── Inspector ─────────────────────────────────────────────────────
            var inspector = el(InspectorControls, {},
                // Audio File
                el(PanelBody, { title: __('Audio File', 'blockenberg'), initialOpen: true },
                    el(TextControl, {
                        label: __('Audio URL (mp3/ogg/wav)', 'blockenberg'),
                        value: a.audioUrl, type: 'url', placeholder: 'https://example.com/audio.mp3',
                        onChange: function (v) { setAttributes({ audioUrl: v }); }
                    }),
                    el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (media) {
                                setAttributes({ audioUrl: media.url, audioType: media.mime || 'audio/mpeg' });
                            },
                            type: 'audio',
                            value: a.audioUrl,
                            render: function (ref) {
                                return el(Button, { variant: 'secondary', onClick: ref.open, style: { width: '100%', justifyContent: 'center', marginTop: '8px' } },
                                    a.audioUrl ? __('Replace Audio', 'blockenberg') : __('Select Audio from Library', 'blockenberg')
                                );
                            }
                        })
                    ),
                    el(SelectControl, {
                        label: __('Preload', 'blockenberg'), value: a.preload,
                        options: [
                            { label: __('Metadata (recommended)', 'blockenberg'), value: 'metadata' },
                            { label: __('Auto (load fully)', 'blockenberg'), value: 'auto' },
                            { label: __('None (on demand)', 'blockenberg'), value: 'none' }
                        ],
                        onChange: function (v) { setAttributes({ preload: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Autoplay', 'blockenberg'), checked: a.autoplay,
                        onChange: function (v) { setAttributes({ autoplay: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Loop', 'blockenberg'), checked: a.loop,
                        onChange: function (v) { setAttributes({ loop: v }); }
                    })
                ),

                // Track Info
                el(PanelBody, { title: __('Track Info', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Track Title', 'blockenberg'), value: a.audioTitle,
                        onChange: function (v) { setAttributes({ audioTitle: v }); }
                    }),
                    el(TextControl, {
                        label: __('Artist Name', 'blockenberg'), value: a.audioArtist,
                        onChange: function (v) { setAttributes({ audioArtist: v }); }
                    }),
                    el(TextControl, {
                        label: __('Album', 'blockenberg'), value: a.audioAlbum,
                        onChange: function (v) { setAttributes({ audioAlbum: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Title', 'blockenberg'), checked: a.showTitle,
                        onChange: function (v) { setAttributes({ showTitle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Artist', 'blockenberg'), checked: a.showArtist,
                        onChange: function (v) { setAttributes({ showArtist: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Album', 'blockenberg'), checked: a.showAlbum,
                        onChange: function (v) { setAttributes({ showAlbum: v }); }
                    })
                ),

                // Cover Art
                el(PanelBody, { title: __('Cover Art', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Cover Art', 'blockenberg'), checked: a.showCover,
                        onChange: function (v) { setAttributes({ showCover: v }); }
                    }),
                    a.showCover && el(Fragment, {},
                        el(TextControl, {
                            label: __('Cover Image URL', 'blockenberg'),
                            value: a.coverUrl, type: 'url', placeholder: 'https://example.com/cover.jpg',
                            onChange: function (v) { setAttributes({ coverUrl: v }); }
                        }),
                        el(MediaUploadCheck, {},
                            el(MediaUpload, {
                                onSelect: function (media) { setAttributes({ coverUrl: media.url, coverId: media.id }); },
                                type: 'image',
                                value: a.coverId,
                                render: function (ref) {
                                    return el(Button, { variant: 'secondary', onClick: ref.open, style: { width: '100%', justifyContent: 'center', marginTop: '8px' } },
                                        a.coverUrl ? __('Replace Cover', 'blockenberg') : __('Select Cover Image', 'blockenberg')
                                    );
                                }
                            })
                        ),
                        el(RangeControl, {
                            label: __('Cover Size (px)', 'blockenberg'), value: a.coverSize, min: 40, max: 200,
                            onChange: function (v) { setAttributes({ coverSize: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Cover Border Radius (px)', 'blockenberg'), value: a.coverRadius, min: 0, max: 50,
                            onChange: function (v) { setAttributes({ coverRadius: v }); }
                        })
                    )
                ),

                // Controls
                el(PanelBody, { title: __('Controls', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Timestamp', 'blockenberg'), checked: a.showTimestamp,
                        onChange: function (v) { setAttributes({ showTimestamp: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Volume Control', 'blockenberg'), checked: a.showVolume,
                        onChange: function (v) { setAttributes({ showVolume: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Playback Speed', 'blockenberg'), checked: a.showSpeed,
                        onChange: function (v) { setAttributes({ showSpeed: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Download Button', 'blockenberg'), checked: a.showDownload,
                        onChange: function (v) { setAttributes({ showDownload: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Play Button Size (px)', 'blockenberg'), value: a.playButtonSize, min: 32, max: 80,
                        onChange: function (v) { setAttributes({ playButtonSize: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Progress Bar Height (px)', 'blockenberg'), value: a.progressHeight, min: 2, max: 12,
                        onChange: function (v) { setAttributes({ progressHeight: v }); }
                    })
                ),

                // Style
                el(PanelBody, { title: __('Player Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'), value: a.playerStyle,
                        options: [
                            { label: __('Card', 'blockenberg'), value: 'card' },
                            { label: __('Minimal (bar)', 'blockenberg'), value: 'minimal' },
                            { label: __('Compact', 'blockenberg'), value: 'compact' }
                        ],
                        onChange: function (v) { setAttributes({ playerStyle: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Box Shadow', 'blockenberg'), value: a.boxShadow,
                        options: [
                            { label: __('None', 'blockenberg'), value: 'none' },
                            { label: __('Small', 'blockenberg'), value: 'sm' },
                            { label: __('Medium', 'blockenberg'), value: 'md' },
                            { label: __('Large', 'blockenberg'), value: 'lg' }
                        ],
                        onChange: function (v) { setAttributes({ boxShadow: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Player Border Radius (px)', 'blockenberg'), value: a.playerRadius, min: 0, max: 40,
                        onChange: function (v) { setAttributes({ playerRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Vertical Padding (px)', 'blockenberg'), value: a.playerPaddingV, min: 8, max: 60,
                        onChange: function (v) { setAttributes({ playerPaddingV: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Horizontal Padding (px)', 'blockenberg'), value: a.playerPaddingH, min: 8, max: 60,
                        onChange: function (v) { setAttributes({ playerPaddingH: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, min: 200, max: 1200,
                        onChange: function (v) { setAttributes({ maxWidth: v }); }
                    })
                ),

                // Colors
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    cc('accentColor', __('Accent / Progress Color', 'blockenberg'), 'accentColor'),
                    cc('progressBg', __('Progress Track Background', 'blockenberg'), 'progressBg'),
                    cc('bgColor', __('Player Background', 'blockenberg'), 'bgColor'),
                    cc('textColor', __('Title Color', 'blockenberg'), 'textColor'),
                    cc('subtitleColor', __('Artist / Subtitle Color', 'blockenberg'), 'subtitleColor'),
                    cc('iconColor', __('Play Button Icon Color', 'blockenberg'), 'iconColor'),
                    cc('iconBg', __('Play Button Background', 'blockenberg'), 'iconBg')
                ),

                // Typography
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoComponent() && el(getTypoComponent(), {
                        label: __('Title Typography', 'blockenberg'),
                        value: a.titleTypo || {},
                        onChange: function (v) { setAttributes({ titleTypo: v }); }
                    }),
                    getTypoComponent() && el(getTypoComponent(), {
                        label: __('Artist Typography', 'blockenberg'),
                        value: a.artistTypo || {},
                        onChange: function (v) { setAttributes({ artistTypo: v }); }
                    })
                )
            );

            // ── Block preview ─────────────────────────────────────────────────
            function renderCover() {
                if (!a.showCover) return null;
                return el('div', { className: 'bkbg-ap-cover' },
                    a.coverUrl
                        ? el('img', { src: a.coverUrl, alt: a.audioTitle, className: 'bkbg-ap-cover-img' })
                        : el('div', { className: 'bkbg-ap-cover-placeholder' }, MusicIcon)
                );
            }

            function renderTrackInfo() {
                return el('div', { className: 'bkbg-ap-track-info' },
                    a.showTitle && el('div', { className: 'bkbg-ap-title' }, a.audioTitle || __('Track Title', 'blockenberg')),
                    a.showArtist && el('div', { className: 'bkbg-ap-artist' }, a.audioArtist || __('Artist Name', 'blockenberg')),
                    a.showAlbum && a.audioAlbum && el('div', { className: 'bkbg-ap-album' }, a.audioAlbum)
                );
            }

            function renderProgressBar() {
                return el('div', { className: 'bkbg-ap-progress-wrap' },
                    el('div', { className: 'bkbg-ap-progress-track' },
                        el('div', { className: 'bkbg-ap-progress-fill', style: { width: '35%' } }),
                        el('div', { className: 'bkbg-ap-progress-thumb' })
                    ),
                    a.showTimestamp && el('div', { className: 'bkbg-ap-timestamps' },
                        el('span', { className: 'bkbg-ap-current' }, '0:00'),
                        el('span', { className: 'bkbg-ap-duration' }, '0:00')
                    )
                );
            }

            function renderPlayBtn() {
                return el('button', { type: 'button', className: 'bkbg-ap-play-btn', disabled: true }, PlayIcon);
            }

            var uploadPrompt = !a.audioUrl && el('div', { style: { background: '#f0f7ff', border: '2px dashed #90c4f7', borderRadius: '8px', padding: '20px', textAlign: 'center', color: '#2563eb', marginBottom: '16px', fontSize: '14px' } },
                el('strong', {}, __('Audio Player', 'blockenberg')),
                el('br', {}),
                __('Set the audio URL in the block settings panel →', 'blockenberg')
            );

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    uploadPrompt,
                    el('div', { className: 'bkbg-ap-player' },
                        a.playerStyle !== 'minimal'
                            ? el(Fragment, {},
                                el('div', { className: 'bkbg-ap-top' },
                                    renderCover(),
                                    el('div', { className: 'bkbg-ap-info-col' },
                                        renderTrackInfo(),
                                        renderProgressBar()
                                    )
                                ),
                                el('div', { className: 'bkbg-ap-controls' },
                                    renderPlayBtn(),
                                    a.showVolume && el('div', { className: 'bkbg-ap-volume' },
                                        el('span', { className: 'bkbg-ap-vol-icon' }, '🔉'),
                                        el('input', { type: 'range', className: 'bkbg-ap-vol-slider', min: 0, max: 1, step: 0.01, defaultValue: 1, disabled: true })
                                    )
                                )
                              )
                            : el(Fragment, {},
                                renderPlayBtn(),
                                el('div', { className: 'bkbg-ap-minimal-info' },
                                    a.showTitle && el('span', { className: 'bkbg-ap-title' }, a.audioTitle),
                                    renderProgressBar()
                                )
                              )
                    )
                )
            );
        },

        // ── Save ─────────────────────────────────────────────────────────────
        save: function (props) {
            var a = props.attributes;

            return el('div', wp.blockEditor.useBlockProps.save({
                className: 'bkbg-ap-wrapper bkbg-ap-style-' + a.playerStyle,
                style: buildWrapStyle(a)
            }),
                el('div', {
                    className: 'bkbg-ap-player',
                    'data-audio-url': a.audioUrl,
                    'data-audio-type': a.audioType,
                    'data-autoplay': a.autoplay ? '1' : '0',
                    'data-loop': a.loop ? '1' : '0',
                    'data-preload': a.preload,
                    'data-show-volume': a.showVolume ? '1' : '0',
                    'data-show-speed': a.showSpeed ? '1' : '0',
                    'data-show-download': a.showDownload ? '1' : '0',
                    'data-audio-url-download': a.showDownload ? a.audioUrl : ''
                },
                    a.playerStyle !== 'minimal'
                        ? el(Fragment, {},
                            el('div', { className: 'bkbg-ap-top' },
                                a.showCover && el('div', { className: 'bkbg-ap-cover' },
                                    a.coverUrl
                                        ? el('img', { src: a.coverUrl, alt: a.audioTitle, className: 'bkbg-ap-cover-img', loading: 'lazy' })
                                        : el('div', { className: 'bkbg-ap-cover-placeholder' })
                                ),
                                el('div', { className: 'bkbg-ap-info-col' },
                                    el('div', { className: 'bkbg-ap-track-info' },
                                        a.showTitle && el('div', { className: 'bkbg-ap-title' }, a.audioTitle),
                                        a.showArtist && el('div', { className: 'bkbg-ap-artist' }, a.audioArtist),
                                        a.showAlbum && a.audioAlbum && el('div', { className: 'bkbg-ap-album' }, a.audioAlbum)
                                    ),
                                    el('div', { className: 'bkbg-ap-progress-wrap' },
                                        el('div', { className: 'bkbg-ap-progress-track' },
                                            el('div', { className: 'bkbg-ap-progress-fill' }),
                                            el('div', { className: 'bkbg-ap-progress-thumb' })
                                        ),
                                        a.showTimestamp && el('div', { className: 'bkbg-ap-timestamps' },
                                            el('span', { className: 'bkbg-ap-current' }, '0:00'),
                                            el('span', { className: 'bkbg-ap-duration' }, '0:00')
                                        )
                                    )
                                )
                            ),
                            el('div', { className: 'bkbg-ap-controls' },
                                el('button', { type: 'button', className: 'bkbg-ap-play-btn', 'aria-label': 'Play' },
                                    el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor', width: '22', height: '22' },
                                        el('path', { d: 'M8 5v14l11-7z' })
                                    )
                                ),
                                a.showSpeed && el('button', { type: 'button', className: 'bkbg-ap-speed-btn', 'aria-label': 'Playback speed' }, '1×'),
                                a.showVolume && el('div', { className: 'bkbg-ap-volume' },
                                    el('button', { type: 'button', className: 'bkbg-ap-vol-btn', 'aria-label': 'Volume' },
                                        el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor', width: '18', height: '18' },
                                            el('path', { d: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z' })
                                        )
                                    ),
                                    el('input', { type: 'range', className: 'bkbg-ap-vol-slider', min: '0', max: '1', step: '0.01', defaultValue: '1', 'aria-label': 'Volume' })
                                ),
                                a.showDownload && a.audioUrl && el('a', {
                                    href: a.audioUrl, download: '', className: 'bkbg-ap-download-btn',
                                    title: __('Download', 'blockenberg'), 'aria-label': __('Download audio', 'blockenberg')
                                },
                                    el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor', width: '18', height: '18' },
                                        el('path', { d: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z' })
                                    )
                                )
                            )
                          )
                        : el(Fragment, {},
                            el('button', { type: 'button', className: 'bkbg-ap-play-btn', 'aria-label': 'Play' },
                                el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor', width: '22', height: '22' },
                                    el('path', { d: 'M8 5v14l11-7z' })
                                )
                            ),
                            el('div', { className: 'bkbg-ap-minimal-info' },
                                a.showTitle && el('span', { className: 'bkbg-ap-title' }, a.audioTitle),
                                el('div', { className: 'bkbg-ap-progress-wrap' },
                                    el('div', { className: 'bkbg-ap-progress-track' },
                                        el('div', { className: 'bkbg-ap-progress-fill' }),
                                        el('div', { className: 'bkbg-ap-progress-thumb' })
                                    ),
                                    a.showTimestamp && el('div', { className: 'bkbg-ap-timestamps' },
                                        el('span', { className: 'bkbg-ap-current' }, '0:00'),
                                        el('span', { className: 'bkbg-ap-duration' }, '0:00')
                                    )
                                )
                            )
                          )
                )
            );
        }
    });
}() );
