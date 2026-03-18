( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var TextControl   = wp.components.TextControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'sectionTitleTypo', attrs, '--bkvg-stt-');
        _tvf(v, 'cardTitleTypo',    attrs, '--bkvg-ct-');
        _tvf(v, 'descTypo',         attrs, '--bkvg-ds-');
        return v;
    }

    var COLUMNS_OPTIONS = [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 },
    ];

    var ASPECT_OPTIONS = [
        { label: '16:9', value: '16/9' },
        { label: '4:3',  value: '4/3'  },
        { label: '1:1',  value: '1/1'  },
    ];

    function makeId() { return 'vg' + Math.random().toString(36).substr(2, 5); }

    /* Extract YouTube video ID from any YouTube URL */
    function getYoutubeId(url) {
        if (!url) return null;
        var match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        return match ? match[1] : null;
    }

    function getThumbUrl(video) {
        if (video.thumbUrl) return video.thumbUrl;
        var ytId = getYoutubeId(video.url);
        if (ytId) return 'https://img.youtube.com/vi/' + ytId + '/mqdefault.jpg';
        return '';
    }

    function buildWrapStyle(a) {
        var s = getTypoCssVars(a);
        s['--bkbg-vg-accent']           = a.accentColor;
        s['--bkbg-vg-play-btn-bg']      = a.playBtnBg;
        s['--bkbg-vg-play-btn-color']   = a.playBtnColor;
        s['--bkbg-vg-card-bg']          = a.cardBg;
        s['--bkbg-vg-card-border']      = a.cardBorder;
        s['--bkbg-vg-dur-bg']           = a.durationBg;
        s['--bkbg-vg-dur-color']        = a.durationColor;
        s['--bkbg-vg-filter-active-bg'] = a.filterActiveBg;
        s['--bkbg-vg-filter-active-c']  = a.filterActiveColor;
        s['--bkbg-vg-filter-bg']        = a.filterInactiveBg;
        s['--bkbg-vg-filter-c']         = a.filterInactiveColor;
        s['--bkbg-vg-title-color']      = a.sectionTitleColor;
        s['--bkbg-vg-card-title-c']     = a.titleColor;
        s['--bkbg-vg-desc-color']       = a.descColor;
        s['--bkbg-vg-cat-color']        = a.categoryColor;
        s['--bkbg-vg-card-r']           = a.cardRadius + 'px';
        s['--bkbg-vg-thumb-r']          = a.thumbRadius + 'px';
        s['--bkbg-vg-play-size']        = a.playBtnSize + 'px';
        s.paddingTop    = a.paddingTop    + 'px';
        s.paddingBottom = a.paddingBottom + 'px';
        s.backgroundColor = a.bgColor || undefined;
        return s;
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

    /* ── Video Card preview ─────────────────────────────────────────── */
    function VideoCard(props) {
        var video = props.video;
        var a = props.a;
        var thumbUrl = getThumbUrl(video);
        var ar = a.aspectRatio.replace('/', '/'); /* keep as-is for aspect-ratio CSS */

        return el('div', { className: 'bkbg-vg-card', style: { background: a.cardBg, border: '1px solid ' + a.cardBorder, borderRadius: a.cardRadius + 'px', overflow: 'hidden' } },
            /* Thumbnail */
            el('div', { className: 'bkbg-vg-thumb-wrap', style: { position: 'relative', aspectRatio: a.aspectRatio, background: '#111', overflow: 'hidden', borderRadius: a.thumbRadius + 'px' } },
                thumbUrl
                    ? el('img', { src: thumbUrl, alt: video.title, style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } })
                    : el('div', { style: { width: '100%', height: '100%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                          el('span', { style: { fontSize: '28px' } }, '🎥')
                      ),
                /* Play button */
                el('div', { className: 'bkbg-vg-play-btn', style: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: a.playBtnSize + 'px', height: a.playBtnSize + 'px', borderRadius: '50%', background: a.playBtnBg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' } },
                    el('span', { style: { color: a.playBtnColor, fontSize: a.playBtnSize * 0.4 + 'px', marginLeft: '3px' } }, '▶')
                ),
                /* Duration */
                a.showDuration && video.duration && el('div', { className: 'bkbg-vg-duration', style: { position: 'absolute', bottom: '8px', right: '8px', background: a.durationBg, color: a.durationColor, fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px' } }, video.duration),
                /* Category pill */
                a.showCategory && video.category && el('div', { className: 'bkbg-vg-cat', style: { position: 'absolute', top: '8px', left: '8px', background: a.accentColor, color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px' } }, video.category)
            ),
            /* Card body */
            el('div', { className: 'bkbg-vg-card-body', style: { padding: '12px 14px' } },
                el('p', { className: 'bkbg-vg-card-title', style: { margin: '0 0 4px', color: a.titleColor } }, video.title || __('Untitled', 'blockenberg')),
                a.showDescription && video.description && el('p', { className: 'bkbg-vg-desc', style: { margin: 0, color: a.descColor } }, video.description)
            )
        );
    }

    registerBlockType('blockenberg/video-grid', {
        title: __('Video Grid', 'blockenberg'),
        icon: 'video-alt3',
        category: 'bkbg-media',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var editingVideoState = useState(null);
            var editingVideo = editingVideoState[0];
            var setEditingVideo = editingVideoState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateVideo(id, key, val) {
                setAttributes({ videos: a.videos.map(function (v) {
                    if (v.id !== id) return v;
                    var u = Object.assign({}, v); u[key] = val; return u;
                }) });
            }

            function removeVideo(id) {
                setAttributes({ videos: a.videos.filter(function (v) { return v.id !== id; }) });
                if (editingVideo === id) setEditingVideo(null);
            }

            function addVideo() {
                var newId = makeId();
                setAttributes({ videos: a.videos.concat([{ id: newId, title: __('New Video', 'blockenberg'), url: '', thumbUrl: '', thumbId: 0, duration: '', category: '', description: '' }]) });
                setEditingVideo(newId);
            }

            /* Get unique categories for filter preview */
            var categories = a.videos.reduce(function (acc, v) {
                if (v.category && acc.indexOf(v.category) === -1) acc.push(v.category);
                return acc;
            }, []);

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Videos', 'blockenberg'), initialOpen: true },
                        a.videos.map(function (video, idx) {
                            var isEditing = editingVideo === video.id;
                            return el('div', { key: video.id, style: { border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' } },
                                /* Collapsed header */
                                el('div', { onClick: function () { setEditingVideo(isEditing ? null : video.id); }, style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', cursor: 'pointer', background: isEditing ? '#f0e9ff' : '#fafafa', borderBottom: isEditing ? '1px solid #e0e0e0' : 'none' } },
                                    el('span', { style: { fontSize: '12px', fontWeight: 700, color: '#555', minWidth: '18px' } }, (idx + 1) + '.'),
                                    el('span', { style: { flex: 1, fontSize: '12px', fontWeight: 600, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, video.title || __('Untitled', 'blockenberg')),
                                    el('span', { style: { fontSize: '12px', color: '#6c3fb5', fontWeight: 700 } }, isEditing ? '▲' : '▼')
                                ),
                                isEditing && el('div', { style: { padding: '10px' } },
                                    el(TextControl, { label: __('Title', 'blockenberg'), value: video.title, onChange: function (v) { updateVideo(video.id, 'title', v); } }),
                                    el(TextControl, { label: __('Video URL (YouTube/Vimeo)', 'blockenberg'), value: video.url, onChange: function (v) { updateVideo(video.id, 'url', v); } }),
                                    el(TextControl, { label: __('Duration', 'blockenberg'), value: video.duration, onChange: function (v) { updateVideo(video.id, 'duration', v); }, placeholder: '12:34' }),
                                    el(TextControl, { label: __('Category', 'blockenberg'), value: video.category, onChange: function (v) { updateVideo(video.id, 'category', v); } }),
                                    el(TextControl, { label: __('Short description', 'blockenberg'), value: video.description, onChange: function (v) { updateVideo(video.id, 'description', v); } }),
                                    el('div', { style: { marginBottom: '8px' } },
                                        el('p', { style: { fontSize: '12px', fontWeight: 600, color: '#1e1e1e', marginBottom: '4px' } }, __('Thumbnail', 'blockenberg')),
                                        video.thumbUrl && el('img', { src: video.thumbUrl, alt: '', style: { width: '100%', borderRadius: '6px', marginBottom: '6px', display: 'block' } }),
                                        !video.thumbUrl && el('p', { style: { fontSize: '11px', color: '#999', marginBottom: '6px' } }, __('Auto-generated from YouTube URL, or upload custom thumb.', 'blockenberg')),
                                        el(MediaUploadCheck, null,
                                            el(MediaUpload, { onSelect: function (media) { setAttributes({ videos: a.videos.map(function (v) { return v.id !== video.id ? v : Object.assign({}, v, { thumbUrl: media.url, thumbId: media.id }); }) }); }, allowedTypes: ['image'], value: video.thumbId,
                                                render: function (renderProps) {
                                                    return el(Button, { variant: 'secondary', size: 'compact', onClick: renderProps.open }, video.thumbUrl ? __('Change thumbnail', 'blockenberg') : __('Upload thumbnail', 'blockenberg'));
                                                }
                                            })
                                        ),
                                        video.thumbUrl && el(Button, { variant: 'tertiary', isDestructive: true, size: 'compact', onClick: function () { updateVideo(video.id, 'thumbUrl', ''); updateVideo(video.id, 'thumbId', 0); }, style: { marginLeft: '6px' } }, __('Remove thumb', 'blockenberg'))
                                    ),
                                    el(Button, { isDestructive: true, variant: 'tertiary', size: 'compact', onClick: function () { removeVideo(video.id); } }, __('Remove video', 'blockenberg'))
                                )
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: addVideo, style: { width: '100%', justifyContent: 'center' } }, '+ ' + __('Add Video', 'blockenberg'))
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el('fieldset', { style: { border: 'none', padding: 0, margin: '0 0 12px' } },
                            el('legend', { style: { fontSize: '12px', fontWeight: 600, color: '#1e1e1e', marginBottom: '6px' } }, __('Columns', 'blockenberg')),
                            el('div', { style: { display: 'flex', gap: '6px' } },
                                COLUMNS_OPTIONS.map(function (opt) {
                                    return el('button', { key: opt.value, type: 'button', onClick: function () { setAttributes({ columns: opt.value }); },
                                        style: { flex: 1, padding: '6px', border: a.columns === opt.value ? '2px solid #6c3fb5' : '1px solid #ddd', borderRadius: '6px', background: a.columns === opt.value ? '#f0e9ff' : '#fff', cursor: 'pointer', fontWeight: 700, color: a.columns === opt.value ? '#6c3fb5' : '#555' }
                                    }, opt.label);
                                })
                            )
                        ),
                        el('fieldset', { style: { border: 'none', padding: 0, margin: '0 0 12px' } },
                            el('legend', { style: { fontSize: '12px', fontWeight: 600, color: '#1e1e1e', marginBottom: '6px' } }, __('Aspect ratio', 'blockenberg')),
                            el('div', { style: { display: 'flex', gap: '6px' } },
                                ASPECT_OPTIONS.map(function (opt) {
                                    return el('button', { key: opt.value, type: 'button', onClick: function () { setAttributes({ aspectRatio: opt.value }); },
                                        style: { flex: 1, padding: '6px', border: a.aspectRatio === opt.value ? '2px solid #6c3fb5' : '1px solid #ddd', borderRadius: '6px', background: a.aspectRatio === opt.value ? '#f0e9ff' : '#fff', cursor: 'pointer', fontWeight: 700, color: a.aspectRatio === opt.value ? '#6c3fb5' : '#555' }
                                    }, opt.label);
                                })
                            )
                        ),
                        el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: a.gap, min: 8, max: 48, onChange: function (v) { setAttributes({ gap: v }); } })
                    ),
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show category filter bar', 'blockenberg'), checked: a.showFilter, onChange: function (v) { setAttributes({ showFilter: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show category pill on card', 'blockenberg'), checked: a.showCategory, onChange: function (v) { setAttributes({ showCategory: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show duration badge', 'blockenberg'), checked: a.showDuration, onChange: function (v) { setAttributes({ showDuration: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show description', 'blockenberg'), checked: a.showDescription, onChange: function (v) { setAttributes({ showDescription: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl(__('Section Title', 'blockenberg'), 'sectionTitleTypo', a, setAttributes),
                        getTypoControl(__('Card Title', 'blockenberg'), 'cardTitleTypo', a, setAttributes),
                        getTypoControl(__('Description', 'blockenberg'), 'descTypo', a, setAttributes)
                    ),
                    el(PanelBody, { title: __('Appearance', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Card radius (px)',     'blockenberg'), value: a.cardRadius,    min: 0, max: 24, onChange: function (v) { setAttributes({ cardRadius:    v }); } }),
                        el(RangeControl, { label: __('Thumb radius (px)',    'blockenberg'), value: a.thumbRadius,   min: 0, max: 24, onChange: function (v) { setAttributes({ thumbRadius:   v }); } }),
                        el(RangeControl, { label: __('Play button size (px)','blockenberg'), value: a.playBtnSize,   min: 32, max: 96, onChange: function (v) { setAttributes({ playBtnSize:   v }); } })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',         __('Accent',            'blockenberg'), 'accentColor'),
                        cc('sectionTitleColor',   __('Section title',     'blockenberg'), 'sectionTitleColor'),
                        cc('titleColor',          __('Card title',        'blockenberg'), 'titleColor'),
                        cc('descColor',           __('Description',       'blockenberg'), 'descColor'),
                        cc('categoryColor',       __('Category text',     'blockenberg'), 'categoryColor'),
                        cc('cardBg',              __('Card bg',           'blockenberg'), 'cardBg'),
                        cc('cardBorder',          __('Card border',       'blockenberg'), 'cardBorder'),
                        cc('playBtnBg',           __('Play btn bg',       'blockenberg'), 'playBtnBg'),
                        cc('playBtnColor',        __('Play btn icon',     'blockenberg'), 'playBtnColor'),
                        cc('durationBg',          __('Duration badge bg', 'blockenberg'), 'durationBg'),
                        cc('durationColor',       __('Duration text',     'blockenberg'), 'durationColor'),
                        cc('filterActiveBg',      __('Filter active bg',  'blockenberg'), 'filterActiveBg'),
                        cc('filterActiveColor',   __('Filter active text','blockenberg'), 'filterActiveColor'),
                        cc('filterInactiveBg',    __('Filter inactive bg','blockenberg'), 'filterInactiveBg'),
                        cc('filterInactiveColor', __('Filter inactive',   'blockenberg'), 'filterInactiveColor'),
                        cc('bgColor',             __('Section bg',        'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    /* Section title */
                    (a.title || a.subtitle) && el('div', { className: 'bkbg-vg-section-hdr', style: { textAlign: 'center', marginBottom: '28px' } },
                        el(RichText, { tagName: 'h2', className: 'bkbg-vg-section-title', value: a.title, onChange: function (v) { setAttributes({ title: v }); }, placeholder: __('Grid title…', 'blockenberg'), style: { color: a.sectionTitleColor, margin: '0 0 8px' } }),
                        el(RichText, { tagName: 'p', className: 'bkbg-vg-section-sub', value: a.subtitle, onChange: function (v) { setAttributes({ subtitle: v }); }, placeholder: __('Subtitle…', 'blockenberg'), style: { color: a.descColor, margin: 0 } })
                    ),
                    /* Filter bar preview */
                    a.showFilter && categories.length > 0 && el('div', { className: 'bkbg-vg-filter-bar', style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' } },
                        el('button', { type: 'button', className: 'bkbg-vg-filter-btn is-active', style: { padding: '7px 18px', borderRadius: '99px', border: 'none', background: a.filterActiveBg, color: a.filterActiveColor, fontSize: '13px', fontWeight: 700, cursor: 'pointer' } }, __('All', 'blockenberg')),
                        categories.map(function (cat) {
                            return el('button', { key: cat, type: 'button', className: 'bkbg-vg-filter-btn', style: { padding: '7px 18px', borderRadius: '99px', border: 'none', background: a.filterInactiveBg, color: a.filterInactiveColor, fontSize: '13px', fontWeight: 600, cursor: 'pointer' } }, cat);
                        })
                    ),
                    /* Grid */
                    el('div', { className: 'bkbg-vg-grid', style: { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' } },
                        a.videos.map(function (video) {
                            return el(VideoCard, { key: video.id, video: video, a: a });
                        }),
                        a.videos.length === 0 && el('div', { style: { gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: '#aaa', background: '#fafafa', borderRadius: '8px', border: '2px dashed #ddd' } },
                            el('span', { style: { fontSize: '32px', display: 'block', marginBottom: '10px' } }, '🎬'),
                            el('p', { style: { margin: 0, fontWeight: 700 } }, __('Add your first video →', 'blockenberg'))
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var categories = a.videos.reduce(function (acc, v) {
                if (v.category && acc.indexOf(v.category) === -1) acc.push(v.category);
                return acc;
            }, []);

            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-vg-wrapper', style: buildWrapStyle(a) }),
                (a.title || a.subtitle) && el('div', { className: 'bkbg-vg-section-hdr' },
                    el(RichText.Content, { tagName: 'h2', className: 'bkbg-vg-section-title', value: a.title }),
                    el(RichText.Content, { tagName: 'p',  className: 'bkbg-vg-section-sub',   value: a.subtitle })
                ),
                a.showFilter && categories.length > 0 && el('div', { className: 'bkbg-vg-filter-bar' },
                    el('button', { type: 'button', className: 'bkbg-vg-filter-btn is-active', 'data-category': '' }, __('All', 'blockenberg')),
                    categories.map(function (cat) {
                        return el('button', { key: cat, type: 'button', className: 'bkbg-vg-filter-btn', 'data-category': cat }, cat);
                    })
                ),
                el('div', { className: 'bkbg-vg-grid', style: { '--bkbg-vg-cols': a.columns, gap: a.gap + 'px' } },
                    a.videos.map(function (video) {
                        var thumbUrl = getThumbUrl(video);
                        var ytId = getYoutubeId(video.url);
                        var embedUrl = ytId ? 'https://www.youtube.com/embed/' + ytId + '?autoplay=1' : video.url;
                        return el('div', { key: video.id, className: 'bkbg-vg-card', 'data-embed-url': embedUrl, 'data-category': video.category || '' },
                            el('div', { className: 'bkbg-vg-thumb-wrap' },
                                thumbUrl
                                    ? el('img', { src: thumbUrl, alt: video.title, loading: 'lazy', className: 'bkbg-vg-thumb' })
                                    : el('div', { className: 'bkbg-vg-thumb-placeholder' }),
                                el('button', { type: 'button', className: 'bkbg-vg-play-btn', 'aria-label': __('Play video', 'blockenberg') },
                                    el('span', { className: 'bkbg-vg-play-icon', 'aria-hidden': 'true' }, '▶')
                                ),
                                a.showDuration && video.duration && el('div', { className: 'bkbg-vg-duration' }, video.duration),
                                a.showCategory && video.category && el('div', { className: 'bkbg-vg-cat-pill' }, video.category)
                            ),
                            el('div', { className: 'bkbg-vg-card-body' },
                                el('p', { className: 'bkbg-vg-card-title' }, video.title),
                                a.showDescription && video.description && el('p', { className: 'bkbg-vg-desc' }, video.description)
                            )
                        );
                    })
                ),
                /* Lightbox modal */
                el('div', { className: 'bkbg-vg-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': __('Video player', 'blockenberg'), hidden: true },
                    el('div', { className: 'bkbg-vg-modal-overlay' }),
                    el('div', { className: 'bkbg-vg-modal-content' },
                        el('button', { type: 'button', className: 'bkbg-vg-modal-close', 'aria-label': __('Close', 'blockenberg') }, '✕'),
                        el('div', { className: 'bkbg-vg-modal-iframe-wrap' })
                    )
                )
            );
        }
    });
}() );
