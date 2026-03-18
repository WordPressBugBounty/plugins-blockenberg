( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var TextareaControl = wp.components.TextareaControl;
    var Fragment = wp.element.Fragment;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'playlistTitleTypo', attrs, '--bkvpl-pt-');
        _tvf(v, 'epTitleTypo',       attrs, '--bkvpl-et-');
        _tvf(v, 'epMetaTypo',        attrs, '--bkvpl-em-');
        return v;
    }

    function EmbedUrl(videoType, videoId, videoUrl) {
        if (videoType === 'youtube' && videoId) return 'https://www.youtube.com/embed/' + videoId + '?rel=0';
        if (videoType === 'vimeo' && videoId) return 'https://player.vimeo.com/video/' + videoId;
        return videoUrl || '';
    }

    registerBlockType('blockenberg/video-playlist', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var episodes = attr.episodes || [];

            var activeIdx = useState(0);
            var active = activeIdx[0];
            var setActive = activeIdx[1];
            var activeEp = episodes[active] || episodes[0] || {};

            function updateEp(idx, field, val) {
                var updated = episodes.map(function (ep, i) {
                    if (i !== idx) return ep;
                    var p = {}; p[field] = val;
                    return Object.assign({}, ep, p);
                });
                set({ episodes: updated });
            }

            function addEpisode() {
                set({ episodes: episodes.concat([{ title: 'New Episode', description: '', videoType: 'youtube', videoId: '', videoUrl: '', duration: '', thumbnailUrl: '', thumbnailId: 0, thumbnailAlt: '' }]) });
            }

            function removeEp(idx) { set({ episodes: episodes.filter(function (_, i) { return i !== idx; }) }); }

            /* Inspector */
            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Orientation', 'blockenberg'),
                        value: attr.layout,
                        options: [
                            { label: 'Side by Side', value: 'side' },
                            { label: 'Stacked (episodes below)', value: 'stack' }
                        ],
                        onChange: function (v) { set({ layout: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    attr.layout === 'side' && el(SelectControl, {
                        label: __('Episode List Position', 'blockenberg'),
                        value: attr.listPosition,
                        options: [
                            { label: 'Right', value: 'right' },
                            { label: 'Left', value: 'left' }
                        ],
                        onChange: function (v) { set({ listPosition: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    attr.layout === 'side' && el(RangeControl, {
                        label: __('Episode List Width (px)', 'blockenberg'),
                        value: attr.listWidth, min: 240, max: 500, step: 10,
                        onChange: function (v) { set({ listWidth: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: attr.borderRadius, min: 0, max: 24,
                        onChange: function (v) { set({ borderRadius: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: attr.paddingTop, min: 0, max: 200,
                        onChange: function (v) { set({ paddingTop: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: attr.paddingBottom, min: 0, max: 200,
                        onChange: function (v) { set({ paddingBottom: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                el(PanelBody, { title: __('Visibility', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Playlist Title', 'blockenberg'), checked: attr.showPlaylistTitle, onChange: function (v) { set({ showPlaylistTitle: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Episode Numbers', 'blockenberg'), checked: attr.showNumbers, onChange: function (v) { set({ showNumbers: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Duration', 'blockenberg'), checked: attr.showDuration, onChange: function (v) { set({ showDuration: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Description under player', 'blockenberg'), checked: attr.showDescription, onChange: function (v) { set({ showDescription: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Thumbnails', 'blockenberg'), checked: attr.showThumbnails, onChange: function (v) { set({ showThumbnails: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl(__('Playlist Title', 'blockenberg'), 'playlistTitleTypo', attr, set),
                    getTypoControl(__('Episode Title', 'blockenberg'), 'epTitleTypo', attr, set),
                    getTypoControl(__('Episode Meta', 'blockenberg'), 'epMetaTypo', attr, set)
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#0f0f1a' }); }, label: __('Block Background', 'blockenberg') },
                        { value: attr.playerBg, onChange: function (v) { set({ playerBg: v || '#000000' }); }, label: __('Player Background', 'blockenberg') },
                        { value: attr.listBg, onChange: function (v) { set({ listBg: v || '#1a1a2e' }); }, label: __('List Background', 'blockenberg') },
                        { value: attr.activeBg, onChange: function (v) { set({ activeBg: v || '#2d2b55' }); }, label: __('Active Episode BG', 'blockenberg') },
                        { value: attr.titleColor, onChange: function (v) { set({ titleColor: v || '#ffffff' }); }, label: __('Playlist Title', 'blockenberg') },
                        { value: attr.epTitleColor, onChange: function (v) { set({ epTitleColor: v || '#f0f0f0' }); }, label: __('Episode Title', 'blockenberg') },
                        { value: attr.epMetaColor, onChange: function (v) { set({ epMetaColor: v || '#718096' }); }, label: __('Episode Meta', 'blockenberg') },
                        { value: attr.activeColor, onChange: function (v) { set({ activeColor: v || '#6366f1' }); }, label: __('Active Accent', 'blockenberg') },
                        { value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#6366f1' }); }, label: __('Accent', 'blockenberg') }
                    ]
                })
            );

            /* Episode config panels */
            var epPanels = el(PanelBody.displayName ? PanelBody : PanelBody, { title: __('Episodes', 'blockenberg'), initialOpen: false, style: {}, className: '' },
                /* render inside InspectorControls */
            );

            var epInspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Episodes', 'blockenberg'), initialOpen: true },
                    episodes.map(function (ep, idx) {
                        return el('div', { key: idx, style: { borderBottom: '1px solid #e5e7eb', marginBottom: '12px', paddingBottom: '12px' } },
                            el('strong', { style: { display: 'block', marginBottom: '6px', color: idx === active ? attr.activeColor : 'inherit' } }, (idx + 1) + '. ' + (ep.title || 'Episode')),
                            el(SelectControl, {
                                label: __('Type', 'blockenberg'),
                                value: ep.videoType,
                                options: [
                                    { label: 'YouTube', value: 'youtube' },
                                    { label: 'Vimeo', value: 'vimeo' },
                                    { label: 'Direct URL (mp4)', value: 'file' }
                                ],
                                onChange: function (v) { updateEp(idx, 'videoType', v); },
                                __nextHasNoMarginBottom: true
                            }),
                            ep.videoType !== 'file' ? el(TextControl, {
                                label: __('Video ID', 'blockenberg'),
                                value: ep.videoId,
                                onChange: function (v) { updateEp(idx, 'videoId', v); },
                                placeholder: ep.videoType === 'youtube' ? 'dQw4w9WgXcQ' : '123456789',
                                __nextHasNoMarginBottom: true
                            }) : el(TextControl, {
                                label: __('Video URL', 'blockenberg'),
                                value: ep.videoUrl,
                                onChange: function (v) { updateEp(idx, 'videoUrl', v); },
                                placeholder: 'https://example.com/video.mp4',
                                __nextHasNoMarginBottom: true
                            }),
                            el(TextControl, {
                                label: __('Duration', 'blockenberg'),
                                value: ep.duration,
                                onChange: function (v) { updateEp(idx, 'duration', v); },
                                placeholder: '10:30',
                                __nextHasNoMarginBottom: true
                            }),
                            el(Button, {
                                onClick: function () { removeEp(idx); },
                                variant: 'link', isDestructive: true, isSmall: true,
                                style: { marginTop: '4px' }
                            }, __('Remove Episode', 'blockenberg'))
                        );
                    }),
                    el(Button, { onClick: addEpisode, variant: 'primary', isSmall: true }, __('+ Add Episode', 'blockenberg'))
                )
            );

            /* live preview */
            var isSide = attr.layout === 'side';
            var isListLeft = attr.listPosition === 'left';
            var embedSrc = EmbedUrl(activeEp.videoType, activeEp.videoId, activeEp.videoUrl);

            var playerPane = el('div', { className: 'bkbg-vp-player-pane', style: { flex: 1, background: attr.playerBg, borderRadius: attr.borderRadius + 'px', overflow: 'hidden', minWidth: 0 } },
                el('div', { className: 'bkbg-vp-player-ratio', style: { position: 'relative', paddingTop: '56.25%', background: '#000' } },
                    embedSrc
                        ? el('iframe', { src: embedSrc, style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }, allowFullScreen: true })
                        : el('div', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' } },
                            el('span', {}, '▶ ' + __('No video ID set', 'blockenberg'))
                        )
                ),
                el('div', { style: { padding: '16px 20px' } },
                    el('div', { className: 'bkbg-vp-now-title', style: { color: attr.titleColor, marginBottom: '4px' } }, activeEp.title || ''),
                    attr.showDescription && activeEp.description && el('div', { className: 'bkbg-vp-now-desc', style: { color: attr.metaColor } }, activeEp.description)
                )
            );

            var listPane = el('div', { className: 'bkbg-vp-list-pane', style: { width: isSide ? attr.listWidth + 'px' : '100%', background: attr.listBg, borderRadius: attr.borderRadius + 'px', overflow: 'hidden', flexShrink: 0 } },
                attr.showPlaylistTitle && el('div', { className: 'bkbg-vp-list-header', style: { padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', color: attr.titleColor } }, attr.playlistTitle),
                el('div', { style: { overflowY: 'auto', maxHeight: isSide ? '480px' : '220px' } },
                    episodes.map(function (ep, idx) {
                        var isAct = idx === active;
                        return el('div', {
                            key: idx,
                            onClick: function () { setActive(idx); },
                            style: {
                                display: 'flex', gap: '10px', padding: '10px 14px', cursor: 'pointer',
                                background: isAct ? attr.activeBg : 'transparent',
                                borderLeft: isAct ? ('3px solid ' + attr.activeColor) : '3px solid transparent',
                                alignItems: 'flex-start'
                            }
                        },
                            attr.showNumbers && el('div', { style: { width: '22px', height: '22px', borderRadius: '50%', background: isAct ? attr.activeColor : 'rgba(255,255,255,0.1)', color: isAct ? '#fff' : attr.epMetaColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0, marginTop: '2px' } }, idx + 1),
                            el('div', { style: { flex: 1, minWidth: 0 } },
                                el('div', { className: 'bkbg-vp-ep-title', style: { color: attr.epTitleColor, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, ep.title || ''),
                                el('div', { className: 'bkbg-vp-ep-meta', style: { color: attr.epMetaColor } }, ep.duration || '')
                            )
                        );
                    })
                )
            );

            var blockStyle = {
                background: attr.bgColor,
                paddingTop: attr.paddingTop + 'px',
                paddingBottom: attr.paddingBottom + 'px',
                borderRadius: attr.borderRadius + 'px'
            };

            var layoutChildren = isSide
                ? (isListLeft ? [listPane, playerPane] : [playerPane, listPane])
                : [playerPane, listPane];

            return el(Fragment, {},
                inspector,
                epInspector,
                el('div', useBlockProps((function () {
                    var s = getTypoCssVars(attr);
                    return { style: s };
                })()),
                    el('div', { className: 'bkbg-vp-editor-wrap', style: blockStyle },
                        el('div', {
                            style: {
                                display: 'flex',
                                flexDirection: isSide ? 'row' : 'column',
                                gap: '2px',
                                overflow: 'hidden',
                                borderRadius: attr.borderRadius + 'px'
                            }
                        }, layoutChildren),
                        el('div', { style: { padding: '12px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap' } },
                            episodes.map(function (ep, idx) {
                                return el(Button, {
                                    key: idx,
                                    onClick: function () { setActive(idx); },
                                    variant: idx === active ? 'primary' : 'secondary',
                                    isSmall: true
                                }, (idx + 1) + '. ' + (ep.title || __('Episode', 'blockenberg')));
                            }),
                            el(Button, { onClick: addEpisode, variant: 'link', isSmall: true }, '+ ' + __('Add', 'blockenberg'))
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', useBlockProps.save((function () {
                var s = getTypoCssVars(a);
                return { style: s };
            })()),
                el('div', { className: 'bkbg-vp-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
