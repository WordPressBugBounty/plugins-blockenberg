(function () {
    var el = window.wp.element.createElement;
    var Fragment = window.wp.element.Fragment;
    var __ = function (s) { return s; };
    var registerBlockType  = window.wp.blocks.registerBlockType;
    var InspectorControls  = window.wp.blockEditor.InspectorControls;
    var PanelBody          = window.wp.components.PanelBody;
    var ToggleControl      = window.wp.components.ToggleControl;
    var SelectControl      = window.wp.components.SelectControl;
    var RangeControl       = window.wp.components.RangeControl;
    var TextControl        = window.wp.components.TextControl;
    var PanelColorSettings = window.wp.blockEditor.PanelColorSettings;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/post-carousel', {
        title: __('Post Carousel'),
        description: __('A responsive carousel of posts with autoplay, arrows, and dots.'),
        category: 'bkbg-blog',
        icon: el('svg', { viewBox: '0 0 24 24', fill: 'currentColor', width: 24, height: 24 },
            el('path', { d: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM8 11l2.5 3.16 3.5-4.47L18 16H6z' }),
            el('path', { d: 'M1 12l3-3v6l-3-3zm19-3l3 3-3 3V9z' })
        ),

        edit: function (props) {
            var a    = props.attributes;
            var setA = props.setAttributes;

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Query'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Post Type'), value: a.postType,
                        options: [
                            { label: 'Posts', value: 'post' },
                            { label: 'Pages', value: 'page' },
                        ],
                        onChange: function (v) { setA({ postType: v }); },
                    }),
                    el(SelectControl, {
                        label: __('Order By'), value: a.orderby,
                        options: [
                            { label: 'Date',       value: 'date' },
                            { label: 'Title',      value: 'title' },
                            { label: 'Modified',   value: 'modified' },
                            { label: 'Random',     value: 'rand' },
                            { label: 'Menu Order', value: 'menu_order' },
                        ],
                        onChange: function (v) { setA({ orderby: v }); },
                    }),
                    el(SelectControl, {
                        label: __('Order'), value: a.order,
                        options: [
                            { label: 'Newest first', value: 'desc' },
                            { label: 'Oldest first', value: 'asc' },
                        ],
                        onChange: function (v) { setA({ order: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Number of Posts'), value: a.perPage, min: 2, max: 20,
                        onChange: function (v) { setA({ perPage: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Excerpt Length (words)'), value: a.excerptLen, min: 5, max: 60,
                        onChange: function (v) { setA({ excerptLen: v }); },
                    })
                ),
                el(PanelBody, { title: __('Carousel'), initialOpen: true },
                    el(RangeControl, {
                        label: __('Slides (Desktop)'), value: a.slidesPerView, min: 1, max: 5,
                        onChange: function (v) { setA({ slidesPerView: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Slides (Tablet)'), value: a.slidesPerViewTablet, min: 1, max: 4,
                        onChange: function (v) { setA({ slidesPerViewTablet: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Slides (Mobile)'), value: a.slidesPerViewMobile, min: 1, max: 2,
                        onChange: function (v) { setA({ slidesPerViewMobile: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Gap (px)'), value: a.gap, min: 0, max: 60,
                        onChange: function (v) { setA({ gap: v }); },
                    }),
                    el(ToggleControl, {
                        label: __('Autoplay'), checked: a.autoplay,
                        onChange: function (v) { setA({ autoplay: v }); },
                        __nextHasNoMarginBottom: true,
                    }),
                    a.autoplay && el(RangeControl, {
                        label: __('Autoplay Speed (ms)'), value: a.autoplaySpeed, min: 1000, max: 10000, step: 500,
                        onChange: function (v) { setA({ autoplaySpeed: v }); },
                    }),
                    a.autoplay && el(ToggleControl, {
                        label: __('Pause on Hover'), checked: a.pauseOnHover,
                        onChange: function (v) { setA({ pauseOnHover: v }); },
                        __nextHasNoMarginBottom: true,
                    }),
                    el(ToggleControl, {
                        label: __('Loop'), checked: a.loop,
                        onChange: function (v) { setA({ loop: v }); },
                        __nextHasNoMarginBottom: true,
                    }),
                    el(ToggleControl, {
                        label: __('Show Arrows'), checked: a.showArrows,
                        onChange: function (v) { setA({ showArrows: v }); },
                        __nextHasNoMarginBottom: true,
                    }),
                    a.showArrows && el(SelectControl, {
                        label: __('Arrow Style'), value: a.arrowStyle,
                        options: [
                            { label: 'Circle',  value: 'circle' },
                            { label: 'Square',  value: 'square' },
                            { label: 'Minimal', value: 'minimal' },
                        ],
                        onChange: function (v) { setA({ arrowStyle: v }); },
                    }),
                    el(ToggleControl, {
                        label: __('Show Dots'), checked: a.showDots,
                        onChange: function (v) { setA({ showDots: v }); },
                        __nextHasNoMarginBottom: true,
                    })
                ),
                el(PanelBody, { title: __('Card'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Card Style'), value: a.cardStyle,
                        options: [
                            { label: 'Shadow',   value: 'shadow' },
                            { label: 'Outlined', value: 'outlined' },
                            { label: 'Flat',     value: 'flat' },
                        ],
                        onChange: function (v) { setA({ cardStyle: v }); },
                    }),
                    el(RangeControl, {
                        label: __('Card Radius'), value: a.cardRadius, min: 0, max: 30,
                        onChange: function (v) { setA({ cardRadius: v }); },
                    }),
                    el(SelectControl, {
                        label: __('Image Ratio'), value: a.imageRatio,
                        options: [
                            { label: '16:9', value: '56.25' },
                            { label: '4:3',  value: '75' },
                            { label: '1:1',  value: '100' },
                        ],
                        onChange: function (v) { setA({ imageRatio: v }); },
                    }),
                    el(ToggleControl, {
                        label: __('Show Image'),    checked: a.showImage,
                        onChange: function (v) { setA({ showImage: v }); },
                        __nextHasNoMarginBottom: true,
                    }),
                    el(ToggleControl, {
                        label: __('Show Meta'),     checked: a.showMeta,
                        onChange: function (v) { setA({ showMeta: v }); },
                        __nextHasNoMarginBottom: true,
                    }),
                    el(ToggleControl, {
                        label: __('Show Excerpt'),  checked: a.showExcerpt,
                        onChange: function (v) { setA({ showExcerpt: v }); },
                        __nextHasNoMarginBottom: true,
                    }),
                    el(ToggleControl, {
                        label: __('Show Read More'), checked: a.showReadMore,
                        onChange: function (v) { setA({ showReadMore: v }); },
                        __nextHasNoMarginBottom: true,
                    }),
                    a.showReadMore && el(TextControl, {
                        label:    __('Read More Label'),
                        value:    a.readMoreLabel,
                        onChange: function (v) { setA({ readMoreLabel: v }); },
                    })
                ),
                el(PanelBody, { title: __('Typography'), initialOpen: false },
                    (function () {
                        var TC = getTypoControl();
                        if (!TC) return el('p', null, 'Loading…');
                        return el(Fragment, null,
                            el(TC, { label: 'Title Typography', value: a.titleTypo, onChange: function (v) { setA({ titleTypo: v }); } }),
                            el(TC, { label: 'Excerpt Typography', value: a.excerptTypo, onChange: function (v) { setA({ excerptTypo: v }); } }),
                            el(TC, { label: 'Meta Typography', value: a.metaTypo, onChange: function (v) { setA({ metaTypo: v }); } })
                        );
                    })()
                ),
                                el(PanelBody, { title: __('Colors'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Card Colors'), initialOpen: false,
                        colorSettings: [
                            { label: __('Card BG'),      value: a.cardBg,       onChange: function (v) { setA({ cardBg:       v || '#ffffff' }); } },
                            { label: __('Title'),        value: a.titleColor,   onChange: function (v) { setA({ titleColor:   v || '#111827' }); } },
                            { label: __('Excerpt'),      value: a.excerptColor, onChange: function (v) { setA({ excerptColor: v || '#6b7280' }); } },
                            { label: __('Meta'),         value: a.metaColor,    onChange: function (v) { setA({ metaColor:    v || '#9ca3af' }); } },
                            { label: __('Link / Button'),value: a.linkColor,    onChange: function (v) { setA({ linkColor:    v || '#2563eb' }); } },
                        ],
                    }),
                    el(PanelColorSettings, {
                        title: __('Navigation Colors'), initialOpen: false,
                        colorSettings: [
                            { label: __('Arrow BG'),     value: a.arrowBg,        onChange: function (v) { setA({ arrowBg:        v || '#ffffff' }); } },
                            { label: __('Arrow Color'),  value: a.arrowColor,     onChange: function (v) { setA({ arrowColor:     v || '#111827' }); } },
                            { label: __('Dot'),          value: a.dotColor,       onChange: function (v) { setA({ dotColor:       v || '#d1d5db' }); } },
                            { label: __('Dot Active'),   value: a.dotActiveColor, onChange: function (v) { setA({ dotActiveColor: v || '#111827' }); } },
                        ],
                    })
                )
            );

            /* ── Simple editor preview ── */
            var demoCards = [1, 2, 3].slice(0, a.slidesPerView);
            var trackStyle = {
                display: 'flex',
                gap:     a.gap + 'px',
                overflow:'hidden',
            };
            var cardW = 'calc(' + (100 / a.slidesPerView) + '% - ' + (a.gap * (a.slidesPerView - 1) / a.slidesPerView) + 'px)';

            var _tvFn = getTypoCssVars();
            var editorStyle = {};
            Object.assign(editorStyle, _tvFn(a.titleTypo, '--bkbg-poc-tt-'));
            Object.assign(editorStyle, _tvFn(a.excerptTypo, '--bkbg-poc-ex-'));
            Object.assign(editorStyle, _tvFn(a.metaTypo, '--bkbg-poc-mt-'));

            return el('div', { className: 'bkbg-poc-editor', style: editorStyle },
                inspector,
                el('div', { style: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 } },
                    el('p', { style: { margin: '0 0 12px', fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' } },
                        'Post Carousel — ' + a.perPage + ' posts · ' + a.slidesPerView + ' per row'
                    ),
                    el('div', { style: trackStyle },
                        demoCards.map(function (n) {
                            return el('div', {
                                key: n,
                                style: {
                                    width:        cardW,
                                    flexShrink:   0,
                                    background:   a.cardBg,
                                    borderRadius: a.cardRadius + 'px',
                                    overflow:     'hidden',
                                    boxShadow:    a.cardStyle === 'shadow' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                                    border:       a.cardStyle === 'outlined' ? '1px solid #e5e7eb' : 'none',
                                }
                            },
                                a.showImage && el('div', { style: { paddingBottom: a.imageRatio + '%', background: '#e5e7eb', position: 'relative' } },
                                    el('div', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 12 } }, 'Image ' + n)
                                ),
                                el('div', { style: { padding: '14px' } },
                                    a.showMeta && el('div', { className: 'bkbg-poc-meta', style: { color: a.metaColor, marginBottom: 6 } }, 'Jan ' + (n * 5) + ', 2025'),
                                    el('div', { className: 'bkbg-poc-title', style: { color: a.titleColor, marginBottom: 6 } }, 'Post Title ' + n),
                                    a.showExcerpt && el('div', { className: 'bkbg-poc-excerpt', style: { color: a.excerptColor } }, 'Post excerpt preview text here…'),
                                    a.showReadMore && el('span', { className: 'bkbg-poc-rm', style: { color: a.linkColor, marginTop: 10, display: 'block' } }, a.readMoreLabel + ' →')
                                )
                            );
                        })
                    ),
                    a.showArrows && el('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 12 } },
                        el('span', { style: { background: a.arrowBg, color: a.arrowColor, borderRadius: a.arrowStyle === 'circle' ? '50%' : 4, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', fontSize: 16 } }, '‹'),
                        el('span', { style: { background: a.arrowBg, color: a.arrowColor, borderRadius: a.arrowStyle === 'circle' ? '50%' : 4, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', fontSize: 16 } }, '›')
                    ),
                    a.showDots && el('div', { style: { display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 } },
                        [0,1,2].map(function (i) {
                            return el('span', { key: i, style: { width: 8, height: 8, borderRadius: '50%', background: i === 0 ? a.dotActiveColor : a.dotColor } });
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', {
                className: 'bkbg-poc-wrap',
                'data-post-type':   a.postType,
                'data-orderby':     a.orderby,
                'data-order':       a.order,
                'data-per-page':    a.perPage,
                'data-excerpt-len': a.excerptLen,
                'data-spv':         a.slidesPerView,
                'data-spv-tablet':  a.slidesPerViewTablet,
                'data-spv-mobile':  a.slidesPerViewMobile,
                'data-gap':         a.gap,
                'data-autoplay':    a.autoplay    ? '1' : '0',
                'data-ap-speed':    a.autoplaySpeed,
                'data-pause-hover': a.pauseOnHover ? '1' : '0',
                'data-loop':        a.loop        ? '1' : '0',
                'data-arrows':      a.showArrows  ? '1' : '0',
                'data-arrow-style': a.arrowStyle,
                'data-dots':        a.showDots    ? '1' : '0',
                'data-show-image':  a.showImage   ? '1' : '0',
                'data-show-meta':   a.showMeta    ? '1' : '0',
                'data-show-excerpt':a.showExcerpt ? '1' : '0',
                'data-show-rm':     a.showReadMore ? '1' : '0',
                'data-rm-label':    a.readMoreLabel,
                'data-ratio':       a.imageRatio,
                'data-card-style':  a.cardStyle,
                'data-card-bg':     a.cardBg,
                'data-card-radius': a.cardRadius,
                'data-title-c':     a.titleColor,
                'data-excerpt-c':   a.excerptColor,
                'data-meta-c':      a.metaColor,
                'data-link-c':      a.linkColor,
                'data-arrow-bg':    a.arrowBg,
                'data-arrow-c':     a.arrowColor,
                'data-dot-c':       a.dotColor,
                'data-dot-active':  a.dotActiveColor,
                'data-title-typo':  JSON.stringify(a.titleTypo || {}),
                'data-excerpt-typo': JSON.stringify(a.excerptTypo || {}),
                'data-meta-typo':   JSON.stringify(a.metaTypo || {}),
            });
        },
    });
})();
