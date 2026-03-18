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
    var PanelBody = wp.components.PanelBody;
    var Button = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    /* ── CSS vars ─────────────────────────────────────────────────────────── */
    function buildWrapStyle(a) {
        var style = {
            '--bkbg-ig-cols'      : a.columns,
            '--bkbg-ig-cols-tab'  : a.columnsTablet,
            '--bkbg-ig-cols-mob'  : a.columnsMobile,
            '--bkbg-ig-gap'       : a.gap + 'px',
            '--bkbg-ig-radius'    : a.borderRadius + 'px',
            '--bkbg-ig-hover-bg'  : a.hoverOverlayBg,
            '--bkbg-ig-cap-bg'    : a.captionBg,
            '--bkbg-ig-cap-color' : a.captionColor,
            '--bkbg-ig-icon-color': a.overlayIconColor,
            '--bkbg-ig-filter-active': a.filterActiveColor
        };
        if (a.bgColor) style['--bkbg-ig-bg'] = a.bgColor;
        if (a.filterBgColor) style['--bkbg-ig-filter-bg'] = a.filterBgColor;
        if (a.filterTextColor) style['--bkbg-ig-filter-text'] = a.filterTextColor;
        if (a.filterBorderRadius) style['--bkbg-ig-filter-radius'] = a.filterBorderRadius + 'px';
        var fn = getTypoCssVars();
        if (fn) { Object.assign(style, fn(a.captionTypo, '--bkbg-ig-cp-'), fn(a.filterTypo, '--bkbg-ig-ft-')); }
        return style;
    }

    /* ── Aspect ratio map ─────────────────────────────────────────────────── */
    var RATIOS = {
        square: '1 / 1',
        landscape: '4 / 3',
        wide: '16 / 9',
        portrait: '3 / 4',
        tall: '2 / 3',
        auto: 'auto'
    };

    /* ── Color picker helper ──────────────────────────────────────────────── */
    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', {
                    type: 'button', title: value || 'default',
                    onClick: function () { setOpenKey(isOpen ? null : key); },
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

    /* ── Render one gallery item in editor ────────────────────────────────── */
    function renderItem(img, a, onRemove, onCaptionChange) {
        var ar = RATIOS[a.aspectRatio] || '1 / 1';
        var autoAr = a.aspectRatio === 'auto';
        return el('div', {
            key: img.id || img.url,
            className: 'bkbg-ig-item',
            style: { position: 'relative', borderRadius: 'var(--bkbg-ig-radius, 8px)', overflow: 'hidden', aspectRatio: autoAr ? undefined : ar }
        },
            el('img', {
                src: img.url,
                alt: img.alt || '',
                style: { width: '100%', height: autoAr ? 'auto' : '100%', objectFit: 'cover', display: 'block' }
            }),
            a.showCaptions && el('div', {
                className: 'bkbg-ig-caption',
                style: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 8px', background: 'rgba(0,0,0,0.5)', color: '#fff' }
            }, img.caption || ''),
            el('button', {
                type: 'button',
                onClick: function () { onRemove(img); },
                style: { position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '14px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }
            }, '×')
        );
    }

    /* ── Register ─────────────────────────────────────────────────────────── */
    registerBlockType('blockenberg/image-gallery', {
        title: __('Image Gallery', 'blockenberg'),
        icon: 'format-gallery',
        category: 'bkbg-media',
        description: __('Responsive gallery with grid/masonry layouts and lightbox.', 'blockenberg'),

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

            function removeImage(img) {
                setAttributes({ images: a.images.filter(function (i) { return i.url !== img.url; }) });
            }

            var blockProps = useBlockProps({
                className: 'bkbg-ig-wrapper bkbg-ig-layout-' + a.layout,
                style: buildWrapStyle(a)
            });

            /* ── Inspector ──────────────────────────────────────────────── */
            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'), value: a.layout,
                        options: [
                            { label: __('Grid (equal)', 'blockenberg'), value: 'grid' },
                            { label: __('Masonry', 'blockenberg'), value: 'masonry' },
                            { label: __('Justified (rows)', 'blockenberg'), value: 'justified' }
                        ],
                        onChange: function (v) { setAttributes({ layout: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Columns (Desktop)', 'blockenberg'), value: a.columns, min: 1, max: 8,
                        onChange: function (v) { setAttributes({ columns: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Columns (Tablet)', 'blockenberg'), value: a.columnsTablet, min: 1, max: 5,
                        onChange: function (v) { setAttributes({ columnsTablet: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Columns (Mobile)', 'blockenberg'), value: a.columnsMobile, min: 1, max: 3,
                        onChange: function (v) { setAttributes({ columnsMobile: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap (px)', 'blockenberg'), value: a.gap, min: 0, max: 60,
                        onChange: function (v) { setAttributes({ gap: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Aspect Ratio', 'blockenberg'), value: a.aspectRatio,
                        options: [
                            { label: __('Square (1:1)', 'blockenberg'), value: 'square' },
                            { label: __('Landscape (4:3)', 'blockenberg'), value: 'landscape' },
                            { label: __('Wide (16:9)', 'blockenberg'), value: 'wide' },
                            { label: __('Portrait (3:4)', 'blockenberg'), value: 'portrait' },
                            { label: __('Tall (2:3)', 'blockenberg'), value: 'tall' },
                            { label: __('Auto (original)', 'blockenberg'), value: 'auto' }
                        ],
                        onChange: function (v) { setAttributes({ aspectRatio: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'), value: a.borderRadius, min: 0, max: 30,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    })
                ),

                el(PanelBody, { title: __('Hover & Captions', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Hover Effect', 'blockenberg'), value: a.hoverEffect,
                        options: [
                            { label: __('Zoom', 'blockenberg'), value: 'zoom' },
                            { label: __('Fade Overlay', 'blockenberg'), value: 'fade' },
                            { label: __('Slide Up Caption', 'blockenberg'), value: 'caption-slide' },
                            { label: __('Grayscale', 'blockenberg'), value: 'grayscale' },
                            { label: __('None', 'blockenberg'), value: 'none' }
                        ],
                        onChange: function (v) { setAttributes({ hoverEffect: v }); }
                    }),
                    cc('hoverOverlayBg', __('Hover Overlay Color', 'blockenberg'), 'hoverOverlayBg'),
                    cc('overlayIconColor', __('Overlay Icon Color', 'blockenberg'), 'overlayIconColor'),
                    el(ToggleControl, {
                        label: __('Show Captions', 'blockenberg'), checked: a.showCaptions,
                        onChange: function (v) { setAttributes({ showCaptions: v }); }
                    }),
                    a.showCaptions && el(SelectControl, {
                        label: __('Caption Style', 'blockenberg'), value: a.captionStyle,
                        options: [
                            { label: __('Overlay (always visible)', 'blockenberg'), value: 'overlay' },
                            { label: __('Hover reveal', 'blockenberg'), value: 'hover' }
                        ],
                        onChange: function (v) { setAttributes({ captionStyle: v }); }
                    }),
                    a.showCaptions && cc('captionBg', __('Caption Background', 'blockenberg'), 'captionBg'),
                    a.showCaptions && cc('captionColor', __('Caption Text Color', 'blockenberg'), 'captionColor')
                ),

                el(PanelBody, { title: __('Lightbox', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Enable Lightbox', 'blockenberg'), checked: a.lightbox,
                        onChange: function (v) { setAttributes({ lightbox: v }); }
                    })
                ),

                el(PanelBody, { title: __('Filter Bar', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Enable Category Filter', 'blockenberg'), checked: a.filterEnabled,
                        help: __('Add a "category" field to image metadata for filtering.', 'blockenberg'),
                        onChange: function (v) { setAttributes({ filterEnabled: v }); }
                    }),
                    a.filterEnabled && el(Fragment, {},
                        cc('filterActiveColor', __('Active Filter Color', 'blockenberg'), 'filterActiveColor'),
                        cc('filterBgColor', __('Filter Bar Background', 'blockenberg'), 'filterBgColor'),
                        cc('filterTextColor', __('Filter Text Color', 'blockenberg'), 'filterTextColor'),
                        el(RangeControl, {
                            label: __('Filter Button Radius', 'blockenberg'), value: a.filterBorderRadius, min: 0, max: 30,
                            onChange: function (v) { setAttributes({ filterBorderRadius: v }); }
                        })
                    )
                ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypographyControl() && el(getTypographyControl(), { label: __('Caption', 'blockenberg'), value: a.captionTypo, onChange: function (v) { setAttributes({ captionTypo: v }); } }),
                        getTypographyControl() && el(getTypographyControl(), { label: __('Filter Button', 'blockenberg'), value: a.filterTypo, onChange: function (v) { setAttributes({ filterTypo: v }); } })
                    ),

            );

            /* ── Editor render ────────────────────────────────────────────── */
            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    // Add images toolbar
                    el('div', { style: { marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } },
                        el(MediaUploadCheck, {},
                            el(MediaUpload, {
                                onSelect: function (medias) {
                                    // MediaUpload multiple
                                    var arr = Array.isArray(medias) ? medias : [medias];
                                    var existing = a.images || [];
                                    var existingUrls = existing.map(function (i) { return i.url; });
                                    var toAdd = arr.filter(function (m) { return existingUrls.indexOf(m.url) === -1; }).map(function (m) {
                                        return { id: m.id, url: m.url, alt: m.alt, caption: m.caption, sizes: m.sizes };
                                    });
                                    setAttributes({ images: existing.concat(toAdd) });
                                },
                                type: 'image',
                                multiple: true,
                                gallery: true,
                                value: (a.images || []).map(function (i) { return i.id; }),
                                render: function (ref) {
                                    return el(Button, { variant: 'primary', onClick: ref.open },
                                        a.images && a.images.length > 0
                                            ? __('Edit Gallery Images', 'blockenberg')
                                            : __('Add Gallery Images', 'blockenberg')
                                    );
                                }
                            })
                        ),
                        a.images && a.images.length > 0 && el('span', { style: { fontSize: '12px', color: '#888' } }, a.images.length + ' ' + __('images', 'blockenberg'))
                    ),

                    // Grid preview
                    a.images && a.images.length > 0
                        ? el('div', { className: 'bkbg-ig-grid' },
                            a.images.map(function (img) {
                                return renderItem(img, a, removeImage);
                            })
                          )
                        : el('div', { style: { background: '#f0f7ff', border: '2px dashed #90c4f7', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', color: '#2563eb' } },
                            el('span', { className: 'dashicons dashicons-format-gallery', style: { fontSize: '36px', display: 'block', marginBottom: '8px' } }),
                            el('span', {}, __('Add images to start your gallery →', 'blockenberg'))
                          )
                )
            );
        },

        /* ── Save ───────────────────────────────────────────────────────── */
        save: function (props) {
            var a = props.attributes;
            var images = a.images || [];
            var ar = RATIOS[a.aspectRatio] || '1 / 1';
            var autoAr = a.aspectRatio === 'auto';

            // Gather unique categories for filter
            var categories = [];
            if (a.filterEnabled) {
                images.forEach(function (img) {
                    if (img.category && categories.indexOf(img.category) === -1) categories.push(img.category);
                });
            }

            return el('div', wp.blockEditor.useBlockProps.save({
                className: 'bkbg-ig-wrapper bkbg-ig-layout-' + a.layout + ' bkbg-ig-hover-' + a.hoverEffect,
                style: buildWrapStyle(a)
            }),
                // Filter bar
                a.filterEnabled && categories.length > 0 && el('div', { className: 'bkbg-ig-filter-bar' },
                    el('button', { type: 'button', className: 'bkbg-ig-filter-btn is-active', 'data-filter': 'all' }, __('All', 'blockenberg')),
                    categories.map(function (cat) {
                        return el('button', { key: cat, type: 'button', className: 'bkbg-ig-filter-btn', 'data-filter': cat }, cat);
                    })
                ),

                // Gallery grid
                el('div', {
                    className: 'bkbg-ig-grid',
                    'data-lightbox': a.lightbox ? '1' : '0',
                    'data-layout': a.layout
                },
                    images.map(function (img, idx) {
                        return el('div', {
                            key: img.id || img.url,
                            className: 'bkbg-ig-item',
                            'data-category': img.category || '',
                            'data-index': idx
                        },
                            el('a', {
                                href: a.lightbox ? img.url : undefined,
                                className: 'bkbg-ig-link' + (a.lightbox ? ' bkbg-ig-lb-trigger' : ''),
                                'aria-label': img.alt || img.caption || __('View image', 'blockenberg'),
                                onClick: a.lightbox ? 'return false;' : undefined
                            },
                                el('img', {
                                    src: (img.sizes && img.sizes.large && img.sizes.large.url) || img.url,
                                    alt: img.alt || '',
                                    className: 'bkbg-ig-img',
                                    loading: 'lazy',
                                    decoding: 'async',
                                    style: !autoAr ? { aspectRatio: ar, objectFit: 'cover', width: '100%', display: 'block' } : { width: '100%', display: 'block' }
                                }),
                                el('div', { className: 'bkbg-ig-overlay', 'aria-hidden': 'true' },
                                    a.lightbox && el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor', width: '28', height: '28', className: 'bkbg-ig-eye-icon' },
                                        el('path', { d: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z' })
                                    )
                                ),
                                (a.showCaptions && img.caption) && el('div', { className: 'bkbg-ig-caption bkbg-ig-caption-' + a.captionStyle }, img.caption)
                            )
                        );
                    })
                )
            );
        }
    });
}() );
