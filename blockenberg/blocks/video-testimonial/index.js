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
    var PanelBody    = wp.components.PanelBody;
    var Button       = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl  = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ColorPicker  = wp.components.ColorPicker;
    var Popover      = wp.components.Popover;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'quoteTypo',  attrs, '--bkvt-qt-');
        _tvf(v, 'authorTypo', attrs, '--bkvt-au-');
        _tvf(v, 'roleTypo',   attrs, '--bkvt-rl-');
        return v;
    }

    var LAYOUT_OPTIONS = [
        { label: __('Grid',       'blockenberg'), value: 'grid' },
        { label: __('Masonry',    'blockenberg'), value: 'masonry' },
        { label: __('Featured',   'blockenberg'), value: 'featured' },
    ];
    var SHADOW_OPTIONS = [
        { label: __('None',   'blockenberg'), value: 'none' },
        { label: __('Small',  'blockenberg'), value: 'sm' },
        { label: __('Medium', 'blockenberg'), value: 'md' },
        { label: __('Large',  'blockenberg'), value: 'lg' },
    ];
    var ASPECT_OPTIONS = [
        { label: '16:9', value: '16/9' }, { label: '4:3', value: '4/3' }, { label: '1:1', value: '1/1' },
    ];

    function makeId() { return 'vt' + Math.random().toString(36).substr(2, 6); }

    function buildWrapStyle(a) {
        var shadow = a.cardShadow === 'sm' ? '0 1px 4px rgba(0,0,0,0.07)'
                   : a.cardShadow === 'md' ? '0 4px 20px rgba(0,0,0,0.1)'
                   : a.cardShadow === 'lg' ? '0 8px 40px rgba(0,0,0,0.14)' : 'none';
        var s = getTypoCssVars(a);
        s['--bkbg-vt-shadow']       = shadow;
        s['--bkbg-vt-radius']       = a.cardRadius + 'px';
        s['--bkbg-vt-pad']          = a.cardPadding + 'px';
        s['--bkbg-vt-card-bg']      = a.cardBg;
        s['--bkbg-vt-quote-color']  = a.quoteColor;
        s['--bkbg-vt-author-color'] = a.authorColor;
        s['--bkbg-vt-role-color']   = a.roleColor;
        s['--bkbg-vt-star-color']   = a.starColor;
        s['--bkbg-vt-accent']       = a.accentColor;
        s['--bkbg-vt-overlay-bg']   = a.overlayBg;
        s['--bkbg-vt-play-color']   = a.playIconColor;
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
                el('button', { type: 'button', title: value || 'default', onClick: function () { setOpenKey(isOpen ? null : key); }, style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#cccccc' } }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Get YouTube/Vimeo embed URL ─────────────────────────────────────── */
    function getEmbedUrl(url) {
        if (!url) return '';
        var ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
        if (ytMatch) return 'https://www.youtube.com/embed/' + ytMatch[1] + '?autoplay=1&rel=0';
        var vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) return 'https://player.vimeo.com/video/' + vimeoMatch[1] + '?autoplay=1';
        return url;
    }

    function getVideoId(url) {
        if (!url) return '';
        var ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
        if (ytMatch) return 'yt:' + ytMatch[1];
        var vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) return 'vimeo:' + vimeoMatch[1];
        return url;
    }

    /* ── Star row ─────────────────────────────────────────────────────────── */
    function StarRow(props) {
        var rating = props.rating || 5;
        var size = props.size || 16;
        var color = props.color || '#f59e0b';
        var stars = [];
        for (var i = 1; i <= 5; i++) {
            stars.push(el('svg', { key: i, width: size, height: size, viewBox: '0 0 24 24', style: { display: 'inline-block', marginRight: '2px' } },
                el('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2', fill: i <= rating ? color : '#e5e7eb', stroke: i <= rating ? color : '#e5e7eb', strokeWidth: '1' })
            ));
        }
        return el('div', { className: 'bkbg-vt-stars', style: { display: 'flex', alignItems: 'center', gap: '1px' } }, stars);
    }

    /* ── Play button SVG ──────────────────────────────────────────────────── */
    function PlayBtn(props) {
        return el('div', { className: 'bkbg-vt-play', style: { width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' } },
            el('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: props.color || '#fff' },
                el('polygon', { points: '5 3 19 12 5 21 5 3' })
            )
        );
    }

    /* ── Single card ──────────────────────────────────────────────────────── */
    function VTCard(props) {
        var item = props.item;
        var a = props.a;
        var aspectParts = a.videoAspect.split('/');
        var aspectPadding = ((parseInt(aspectParts[1], 10) / parseInt(aspectParts[0], 10)) * 100) + '%';

        return el('div', { className: 'bkbg-vt-card' + (a.animate ? ' bkbg-vt-anim' : ''), style: { background: 'var(--bkbg-vt-card-bg)', borderRadius: 'var(--bkbg-vt-radius)', overflow: 'hidden', boxShadow: 'var(--bkbg-vt-shadow)', display: 'flex', flexDirection: 'column' } },
            /* video thumbnail area */
            el('div', { className: 'bkbg-vt-video-wrap', 'data-embed': getEmbedUrl(item.videoUrl), style: { position: 'relative', paddingBottom: aspectPadding, background: '#111', flexShrink: 0, cursor: 'pointer' } },
                item.thumbnailUrl && el('img', { src: item.thumbnailUrl, alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } }),
                !item.thumbnailUrl && el('div', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: '#9ca3af', background: '#1e1e2e' } },
                    el('span', { style: { fontSize: '28px' } }, '▶'),
                    el('span', { style: { fontSize: '11px' } }, item.videoUrl || __('Paste video URL in settings', 'blockenberg'))
                ),
                /* overlay */
                el('div', { style: { position: 'absolute', inset: 0, background: 'var(--bkbg-vt-overlay-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                    el(PlayBtn, { color: a.playIconColor })
                )
            ),
            /* text area */
            el('div', { className: 'bkbg-vt-body', style: { padding: 'var(--bkbg-vt-pad)', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 } },
                a.showRating && el(StarRow, { rating: item.rating, size: a.starSize, color: a.starColor }),
                a.showQuote && item.quote && el('p', { className: 'bkbg-vt-quote', style: { color: 'var(--bkbg-vt-quote-color)', margin: 0 } },
                    el('span', { style: { color: a.accentColor, fontSize: (a.quoteSize + 6) + 'px', lineHeight: 0.5, verticalAlign: '-0.3em', fontStyle: 'normal', marginRight: '4px', fontFamily: 'Georgia, serif' } }, '\u201C'),
                    item.quote
                ),
                el('div', { className: 'bkbg-vt-author-row', style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                    el('div', { style: { width: '36px', height: '36px', borderRadius: '50%', background: a.accentColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, color: a.accentColor, flexShrink: 0 } }, (item.author || '?').charAt(0).toUpperCase()),
                    el('div', null,
                        el('p', { className: 'bkbg-vt-author', style: { margin: 0, color: 'var(--bkbg-vt-author-color)' } }, item.author),
                        (item.role || item.company) && el('p', { className: 'bkbg-vt-role', style: { margin: 0, color: 'var(--bkbg-vt-role-color)' } },
                            [item.role, a.showCompany && item.company].filter(Boolean).join(' · ')
                        )
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/video-testimonial', {
        title: __('Video Testimonial', 'blockenberg'),
        icon: 'video-alt3',
        category: 'bkbg-marketing',
        description: __('Testimonial cards with embedded video, star rating, and author.', 'blockenberg'),

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

            function updateItem(idx, key, val) {
                var items = a.items.map(function (it, i) { if (i !== idx) return it; var u = Object.assign({}, it); u[key] = val; return u; });
                setAttributes({ items: items });
            }
            function addItem() {
                setAttributes({ items: a.items.concat([{ id: makeId(), videoUrl: '', thumbnailUrl: '', thumbnailId: 0, quote: 'This product exceeded every expectation we had. Highly recommend it to any team.', author: 'New Customer', role: 'Role', company: 'Company', rating: 5 }]) });
            }
            function removeItem(idx) {
                if (a.items.length <= 1) return;
                setAttributes({ items: a.items.filter(function (_, i) { return i !== idx; }) });
            }

            var gridStyle = a.layout === 'masonry'
                ? { columnCount: a.columns, columnGap: a.gap + 'px' }
                : { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: LAYOUT_OPTIONS, onChange: function (v) { setAttributes({ layout: v }); } }),
                        el(RangeControl, { label: __('Columns', 'blockenberg'), value: a.columns, min: 1, max: 4, onChange: function (v) { setAttributes({ columns: v }); } }),
                        el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: a.gap, min: 8, max: 60, onChange: function (v) { setAttributes({ gap: v }); } }),
                        el(SelectControl, { label: __('Video aspect ratio', 'blockenberg'), value: a.videoAspect, options: ASPECT_OPTIONS, onChange: function (v) { setAttributes({ videoAspect: v }); } }),
                        el(RangeControl, { label: __('Card radius (px)', 'blockenberg'), value: a.cardRadius, min: 0, max: 40, onChange: function (v) { setAttributes({ cardRadius: v }); } }),
                        el(RangeControl, { label: __('Card padding (px)', 'blockenberg'), value: a.cardPadding, min: 8, max: 52, onChange: function (v) { setAttributes({ cardPadding: v }); } }),
                        el(SelectControl, { label: __('Card shadow', 'blockenberg'), value: a.cardShadow, options: SHADOW_OPTIONS, onChange: function (v) { setAttributes({ cardShadow: v }); } }),
                        el(ToggleControl, { label: __('Animate on scroll', 'blockenberg'), checked: a.animate, onChange: function (v) { setAttributes({ animate: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show star rating', 'blockenberg'), checked: a.showRating, onChange: function (v) { setAttributes({ showRating: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show quote text', 'blockenberg'), checked: a.showQuote, onChange: function (v) { setAttributes({ showQuote: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show role', 'blockenberg'), checked: a.showRole, onChange: function (v) { setAttributes({ showRole: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show company', 'blockenberg'), checked: a.showCompany, onChange: function (v) { setAttributes({ showCompany: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl(__('Quote', 'blockenberg'), 'quoteTypo', a, setAttributes),
                        getTypoControl(__('Author', 'blockenberg'), 'authorTypo', a, setAttributes),
                        getTypoControl(__('Role', 'blockenberg'), 'roleTypo', a, setAttributes),
                        el(RangeControl, { label: __('Star size (px)', 'blockenberg'), value: a.starSize, min: 10, max: 28, onChange: function (v) { setAttributes({ starSize: v }); } })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accent',      __('Accent',           'blockenberg'), 'accentColor'),
                        cc('cardBg',      __('Card background',  'blockenberg'), 'cardBg'),
                        cc('quoteColor',  __('Quote text',       'blockenberg'), 'quoteColor'),
                        cc('authorColor', __('Author name',      'blockenberg'), 'authorColor'),
                        cc('roleColor',   __('Role / company',   'blockenberg'), 'roleColor'),
                        cc('starColor',   __('Stars',            'blockenberg'), 'starColor'),
                        cc('overlayBg',   __('Video overlay bg', 'blockenberg'), 'overlayBg'),
                        cc('playColor',   __('Play icon',        'blockenberg'), 'playIconColor'),
                        cc('bgColor',     __('Section bg',       'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el(PanelBody, { title: __('Testimonials', 'blockenberg'), initialOpen: false },
                        a.items.map(function (item, idx) {
                            return el(PanelBody, { key: item.id, title: item.author || (__('Testimonial', 'blockenberg') + ' ' + (idx + 1)), initialOpen: false },
                                el(TextControl, { label: __('Video URL (YouTube or Vimeo)', 'blockenberg'), value: item.videoUrl, onChange: function (v) { updateItem(idx, 'videoUrl', v); } }),
                                el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function (media) { setAttributes({ items: a.items.map(function (it, i) { return i !== idx ? it : Object.assign({}, it, { thumbnailUrl: media.url, thumbnailId: media.id }); }) }); },
                                        allowedTypes: ['image'], value: item.thumbnailId,
                                        render: function (p) {
                                            return el('div', { style: { marginBottom: '8px' } },
                                                item.thumbnailUrl && el('img', { src: item.thumbnailUrl, style: { width: '100%', height: '60px', objectFit: 'cover', borderRadius: '4px', marginBottom: '4px' } }),
                                                el(Button, { onClick: p.open, variant: item.thumbnailUrl ? 'secondary' : 'primary', size: 'compact' }, item.thumbnailUrl ? __('Replace thumbnail', 'blockenberg') : __('Upload thumbnail', 'blockenberg'))
                                            );
                                        }
                                    })
                                ),
                                el(TextareaControl, { label: __('Quote', 'blockenberg'), value: item.quote, onChange: function (v) { updateItem(idx, 'quote', v); } }),
                                el(TextControl, { label: __('Author name', 'blockenberg'), value: item.author, onChange: function (v) { updateItem(idx, 'author', v); } }),
                                el(TextControl, { label: __('Role', 'blockenberg'), value: item.role, onChange: function (v) { updateItem(idx, 'role', v); } }),
                                el(TextControl, { label: __('Company', 'blockenberg'), value: item.company, onChange: function (v) { updateItem(idx, 'company', v); } }),
                                el(RangeControl, { label: __('Star rating', 'blockenberg'), value: item.rating, min: 1, max: 5, onChange: function (v) { updateItem(idx, 'rating', v); } }),
                                a.items.length > 1 && el(Button, { onClick: function () { removeItem(idx); }, variant: 'tertiary', isDestructive: true, size: 'compact', style: { marginTop: '8px' } }, __('Remove', 'blockenberg'))
                            );
                        }),
                        el(Button, { onClick: addItem, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Testimonial', 'blockenberg'))
                    )
                ),

                el('div', blockProps,
                    el('div', { className: 'bkbg-vt-grid bkbg-vt-layout-' + a.layout, style: gridStyle },
                        a.items.map(function (item, idx) {
                            return el(VTCard, { key: item.id || idx, item: item, a: a });
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var gridStyle = a.layout === 'masonry'
                ? { columnCount: a.columns, columnGap: a.gap + 'px' }
                : { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' };

            return el('div', wp.blockEditor.useBlockProps.save({
                className: 'bkbg-vt-wrapper bkbg-vt-layout-' + a.layout,
                style: buildWrapStyle(a)
            }),
                el('div', { className: 'bkbg-vt-grid', style: gridStyle },
                    a.items.map(function (item, idx) {
                        var aspectParts = a.videoAspect.split('/');
                        var aspectPadding = ((parseInt(aspectParts[1], 10) / parseInt(aspectParts[0], 10)) * 100) + '%';
                        return el('div', { key: item.id || idx, className: 'bkbg-vt-card' + (a.animate ? ' bkbg-vt-anim' : ''), 'data-embed': getEmbedUrl(item.videoUrl) },
                            el('div', { className: 'bkbg-vt-video-wrap', style: { position: 'relative', paddingBottom: aspectPadding } },
                                item.thumbnailUrl && el('img', { className: 'bkbg-vt-thumb', src: item.thumbnailUrl, alt: '', loading: 'lazy' }),
                                el('div', { className: 'bkbg-vt-overlay' },
                                    el('div', { className: 'bkbg-vt-play' },
                                        el('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: a.playIconColor },
                                            el('polygon', { points: '5 3 19 12 5 21 5 3' })
                                        )
                                    )
                                )
                            ),
                            el('div', { className: 'bkbg-vt-body' },
                                a.showRating && el('div', { className: 'bkbg-vt-stars' },
                                    Array.from({ length: 5 }).map(function (_, i) {
                                        return el('svg', { key: i, width: a.starSize, height: a.starSize, viewBox: '0 0 24 24', style: { display: 'inline-block', marginRight: '2px' } },
                                            el('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2', fill: i < item.rating ? a.starColor : '#e5e7eb', stroke: i < item.rating ? a.starColor : '#e5e7eb', strokeWidth: '1' })
                                        );
                                    })
                                ),
                                a.showQuote && item.quote && el('p', { className: 'bkbg-vt-quote' }, item.quote),
                                el('div', { className: 'bkbg-vt-author-row' },
                                    el('div', { className: 'bkbg-vt-avatar', style: { background: a.accentColor + '22', color: a.accentColor } }, (item.author || '?').charAt(0).toUpperCase()),
                                    el('div', null,
                                        el('p', { className: 'bkbg-vt-author', style: { color: a.authorColor } }, item.author),
                                        (item.role || item.company) && el('p', { className: 'bkbg-vt-role', style: { color: a.roleColor } },
                                            [item.role, a.showCompany && item.company].filter(Boolean).join(' · ')
                                        )
                                    )
                                )
                            )
                        );
                    })
                )
            );
        }
    });
}() );
