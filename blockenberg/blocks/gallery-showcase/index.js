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
    var ColorPicker  = wp.components.ColorPicker;
    var Popover      = wp.components.Popover;

    var _gsTC, _gsTV;
    function _tc() { return _gsTC || (_gsTC = window.bkbgTypographyControl); }
    function _tv() { return _gsTV || (_gsTV = window.bkbgTypoCssVars); }

    var THUMB_POS_OPTIONS = [
        { label: __('Bottom', 'blockenberg'), value: 'bottom' },
        { label: __('Top',    'blockenberg'), value: 'top' },
        { label: __('Left',   'blockenberg'), value: 'left' },
        { label: __('Right',  'blockenberg'), value: 'right' },
    ];
    var ASPECT_OPTIONS = [
        { label: '4 / 3',  value: '4/3' },
        { label: '16 / 9', value: '16/9' },
        { label: '1 / 1',  value: '1/1' },
        { label: '3 / 2',  value: '3/2' },
    ];
    var FIT_OPTIONS = [
        { label: __('Cover',   'blockenberg'), value: 'cover' },
        { label: __('Contain', 'blockenberg'), value: 'contain' },
    ];
    var CAPTION_POS_OPTIONS = [
        { label: __('Overlay',   'blockenberg'), value: 'overlay' },
        { label: __('Below',     'blockenberg'), value: 'below' },
    ];
    var ARROW_STYLE_OPTIONS = [
        { label: __('Circle',  'blockenberg'), value: 'circle' },
        { label: __('Square',  'blockenberg'), value: 'square' },
        { label: __('Minimal', 'blockenberg'), value: 'minimal' },
    ];
    var TRANSITION_OPTIONS = [
        { label: __('Fade',  'blockenberg'), value: 'fade' },
        { label: __('Slide', 'blockenberg'), value: 'slide' },
    ];

    function normalizeCaption(cap) {
        if (!cap) return '';
        var s = '';
        if (typeof cap === 'string') s = cap;
        else if (typeof cap === 'object') s = (cap.raw || cap.rendered || '').toString();
        else s = String(cap);
        // WP media captions may include simple HTML wrappers
        return s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    }

    // Match frontend.js: data-caption || alt (title is saved as alt when caption is empty).
    function imageCaptionText(img) {
        if (!img) return '';
        return normalizeCaption(img.caption) || normalizeCaption(img.title) || normalizeCaption(img.alt) || '';
    }

    function isDefaultOverlayWhite(color) {
        if (!color) return true;
        var c = String(color).trim().toLowerCase();
        return c === '#fff' || c === '#ffffff' || c === 'rgb(255, 255, 255)' || c === 'rgba(255, 255, 255, 1)';
    }

    function buildWrapStyle(a) {
        var aspect = (a.mainAspect || '4/3').replace(/\s+/g, '');
        var belowColor = (!a.captionColor || isDefaultOverlayWhite(a.captionColor))
            ? '#6b7280'
            : a.captionColor;
        var typoCap = (_tv() || function () { return {}; })(a.typoCaption, '--bkbg-gs-cap-');
        var typoCnt = (_tv() || function () { return {}; })(a.typoCounter, '--bkbg-gs-cnt-');
        return Object.assign(
            {
                '--bkbg-gs-active-border':  a.activeBorderColor,
                '--bkbg-gs-active-bw':      a.activeBorderWidth + 'px',
                '--bkbg-gs-main-r':         a.mainRadius + 'px',
                '--bkbg-gs-thumb-r':        a.thumbnailRadius + 'px',
                '--bkbg-gs-thumb-gap':      a.thumbnailGap + 'px',
                '--bkbg-gs-aspect':         aspect.replace('/', ' / '),
                '--bkbg-gs-object-fit':     a.mainObjectFit || 'cover',
                '--bkbg-gs-main-shadow':    a.mainShadow ? '0 16px 48px rgba(0,0,0,0.12)' : 'none',
                '--bkbg-gs-caption-bg':     a.captionBg || 'rgba(0,0,0,0.55)',
                '--bkbg-gs-caption-color':  a.captionColor || '#ffffff',
                '--bkbg-gs-caption-below-color': belowColor,
                '--bkbg-gs-arrow-bg':       a.arrowBg || 'rgba(0,0,0,0.45)',
                '--bkbg-gs-arrow-color':    a.arrowColor,
                '--bkbg-gs-counter-bg':     a.counterBg || 'rgba(0,0,0,0.55)',
                '--bkbg-gs-counter-color':  a.counterColor || '#ffffff',
                '--bkbg-gs-lightbox-bg':    a.lightboxOverlayBg || a.lightboxBg || 'rgba(0,0,0,0.9)',
                paddingTop:    (a.paddingTop || 0) + 'px',
                paddingBottom: (a.paddingBottom || 0) + 'px',
                backgroundColor: a.bgColor || undefined,
            },
            typoCap,
            typoCnt
        );
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

    function ratioPercent(r) {
        var parts = r.split('/');
        return (parseInt(parts[1], 10) / parseInt(parts[0], 10) * 100).toFixed(2) + '%';
    }

    registerBlockType('blockenberg/gallery-showcase', {
        title: __('Gallery Showcase', 'blockenberg'),
        icon: 'format-gallery',
        category: 'bkbg-media',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var activeState = useState(0);
            var active = activeState[0];
            var setActive = activeState[1];

            var blockProps = useBlockProps({ className: 'bkbg-gs-wrapper', style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            var images = Array.isArray(a.images) ? a.images : [];
            var safeActive = Math.min(active, Math.max(0, images.length - 1));
            var currentImage = images[safeActive];
            // Same source as frontend (caption, else title/alt used as img alt).
            var currentCaption = imageCaptionText(currentImage);
            var showCap = a.showCaption !== false;
            var capPos = a.captionPosition || 'overlay';
            var belowCaptionColor = (!a.captionColor || isDefaultOverlayWhite(a.captionColor))
                ? '#6b7280'
                : a.captionColor;
            var mainAspectCss = (a.mainAspect || '4/3').replace(/\s+/g, '').replace('/', ' / ');

            var isVertical  = a.thumbnailPosition === 'left' || a.thumbnailPosition === 'right';
            var thumbAfter  = a.thumbnailPosition === 'bottom' || a.thumbnailPosition === 'right';

            var mainBox = el('div', { className: 'bkbg-gs-main', style: { position: 'relative', borderRadius: a.mainRadius + 'px', overflow: 'hidden', background: '#f3f4f6', aspectRatio: mainAspectCss, width: '100%' } },
                currentImage
                    ? el('img', { src: currentImage.imageUrl, alt: currentImage.title || '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: a.mainObjectFit || 'cover', display: 'block', zIndex: 0 } })
                    : el('div', { style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#9ca3af' } },
                        el('span', { style: { fontSize: '48px' } }, '🖼'),
                        el('p', { style: { margin: 0, fontSize: '14px' } }, __('No images yet — add images below in the sidebar.', 'blockenberg'))
                    ),
                a.showCounter && images.length > 0 && el('div', { className: 'bkbg-gs-counter', style: { position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: '99px', padding: '4px 12px', zIndex: 2 } },
                    (safeActive + 1) + ' / ' + images.length
                ),
                // Always render caption chrome in the editor when enabled (fallback matches frontend alt/title).
                showCap && capPos === 'overlay' && el('div', {
                    className: 'bkbg-gs-caption bkbg-gs-caption--overlay',
                    style: {
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '10px 14px',
                        background: a.captionBg || 'rgba(0,0,0,0.55)',
                        color: a.captionColor || '#ffffff',
                        fontSize: '14px',
                        lineHeight: '1.4',
                        zIndex: 5,
                        pointerEvents: 'none',
                        opacity: currentCaption ? 1 : 0.85
                    }
                }, currentCaption || __('Add caption in Images panel…', 'blockenberg')),
                a.showArrows && images.length > 1 && el(Fragment, null,
                    el('button', { type: 'button', onClick: function () { setActive((safeActive - 1 + images.length) % images.length); }, style: { position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: a.arrowStyle === 'circle' ? '50%' : a.arrowStyle === 'square' ? '4px' : '0', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 } }, '‹'),
                    el('button', { type: 'button', onClick: function () { setActive((safeActive + 1) % images.length); }, style: { position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: a.arrowStyle === 'circle' ? '50%' : a.arrowStyle === 'square' ? '4px' : '0', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 } }, '›')
                )
            );

            var thumbStrip = images.length > 0 && el('div', { className: 'bkbg-gs-thumbs', style: { display: 'flex', flexDirection: isVertical ? 'column' : 'row', gap: a.thumbnailGap + 'px', overflowX: isVertical ? 'hidden' : 'auto', overflowY: isVertical ? 'auto' : 'hidden', flexShrink: 0, maxWidth: isVertical ? '120px' : 'none', padding: '4px 0' } },
                images.map(function (img, i) {
                    var isActive = i === safeActive;
                    return el('button', { key: img.imageId || i, type: 'button', onClick: function () { setActive(i); }, style: { flexShrink: 0, width: isVertical ? '100%' : '80px', height: '60px', borderRadius: a.thumbnailRadius + 'px', overflow: 'hidden', border: isActive ? (a.activeBorderWidth + 'px solid ' + a.activeBorderColor) : '2px solid transparent', padding: 0, cursor: 'pointer', background: '#f3f4f6', opacity: isActive ? 1 : 0.7, transition: 'all 0.15s ease' } },
                        img.imageUrl && el('img', { src: img.imageUrl, alt: '', style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } })
                    );
                })
            );

            var flexDir = isVertical
                ? (a.thumbnailPosition === 'left' ? 'row-reverse' : 'row')
                : (a.thumbnailPosition === 'top'  ? 'column-reverse' : 'column');

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Thumbnail position',  'blockenberg'), value: a.thumbnailPosition, options: THUMB_POS_OPTIONS, onChange: function (v) { setAttributes({ thumbnailPosition: v }); } }),
                        el(SelectControl, { label: __('Main aspect ratio',   'blockenberg'), value: a.mainAspect,        options: ASPECT_OPTIONS,     onChange: function (v) { setAttributes({ mainAspect: v }); } }),
                        el(SelectControl, { label: __('Main fit',            'blockenberg'), value: a.mainObjectFit,     options: FIT_OPTIONS,        onChange: function (v) { setAttributes({ mainObjectFit: v }); } }),
                        el(RangeControl,  { label: __('Main radius (px)',    'blockenberg'), value: a.mainRadius,        min: 0, max: 40,             onChange: function (v) { setAttributes({ mainRadius: v }); } }),
                        el(RangeControl,  { label: __('Thumbnail radius (px)','blockenberg'),value: a.thumbnailRadius,   min: 0, max: 20,             onChange: function (v) { setAttributes({ thumbnailRadius: v }); } }),
                        el(RangeControl,  { label: __('Thumbnail gap (px)', 'blockenberg'), value: a.thumbnailGap,      min: 2, max: 24,             onChange: function (v) { setAttributes({ thumbnailGap: v }); } }),
                        el(ToggleControl, { label: __('Show image shadow',   'blockenberg'), checked: a.mainShadow, onChange: function (v) { setAttributes({ mainShadow: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show counter badge',  'blockenberg'), checked: a.showCounter, onChange: function (v) { setAttributes({ showCounter: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Captions', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show captions', 'blockenberg'), checked: showCap, onChange: function (v) { setAttributes({ showCaption: v }); }, __nextHasNoMarginBottom: true }),
                        showCap && el(SelectControl, { label: __('Caption position', 'blockenberg'), value: capPos, options: CAPTION_POS_OPTIONS, onChange: function (v) { setAttributes({ captionPosition: v }); } })
                    ),
                    el(PanelBody, { title: __('Navigation', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show arrows', 'blockenberg'), checked: a.showArrows, onChange: function (v) { setAttributes({ showArrows: v }); }, __nextHasNoMarginBottom: true }),
                        a.showArrows && el(SelectControl, { label: __('Arrow style', 'blockenberg'), value: a.arrowStyle, options: ARROW_STYLE_OPTIONS, onChange: function (v) { setAttributes({ arrowStyle: v }); } }),
                        el(SelectControl, { label: __('Transition type', 'blockenberg'), value: a.transitionType, options: TRANSITION_OPTIONS, onChange: function (v) { setAttributes({ transitionType: v }); } }),
                        el(RangeControl, { label: __('Transition duration (ms)', 'blockenberg'), value: a.transitionDuration, min: 100, max: 1000, step: 50, onChange: function (v) { setAttributes({ transitionDuration: v }); } })
                    ),
                    el(PanelBody, { title: __('Lightbox', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Enable lightbox',   'blockenberg'), checked: a.enableLightbox, onChange: function (v) { setAttributes({ enableLightbox: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Keyboard navigation','blockenberg'), checked: a.enableKeyboard, onChange: function (v) { setAttributes({ enableKeyboard: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show zoom button',  'blockenberg'), checked: a.showZoom, onChange: function (v) { setAttributes({ showZoom: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        _tc() && _tc()({ label: __('Caption', 'blockenberg'), value: a.typoCaption, onChange: function (v) { setAttributes({ typoCaption: v }); } }),
                        _tc() && _tc()({ label: __('Counter', 'blockenberg'), value: a.typoCounter, onChange: function (v) { setAttributes({ typoCounter: v }); } })
                    ),
el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('activeBorderColor', __('Active thumb border', 'blockenberg'), 'activeBorderColor'),
                        el(RangeControl, { label: __('Active border width (px)', 'blockenberg'), value: a.activeBorderWidth, min: 1, max: 6, onChange: function (v) { setAttributes({ activeBorderWidth: v }); } }),
                        cc('captionBg',         __('Caption background',  'blockenberg'), 'captionBg'),
                        cc('captionColor',      __('Caption text',        'blockenberg'), 'captionColor'),
                        cc('arrowBg',           __('Arrow background',    'blockenberg'), 'arrowBg'),
                        cc('arrowColor',        __('Arrow icon',          'blockenberg'), 'arrowColor'),
                        cc('counterBg',         __('Counter background',  'blockenberg'), 'counterBg'),
                        cc('counterColor',      __('Counter text',        'blockenberg'), 'counterColor'),
                        cc('lightboxOverlayBg', __('Lightbox overlay',    'blockenberg'), 'lightboxOverlayBg'),
                        cc('bgColor',           __('Section background',  'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el(PanelBody, { title: __('Images', 'blockenberg'), initialOpen: false },
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (medias) {
                                    var list = Array.isArray(medias) ? medias : [medias];
                                    var newImages = list.map(function (m) {
                                        var title = (m.title && (typeof m.title === 'object' ? (m.title.raw || m.title.rendered || '') : m.title)) || '';
                                        var cap = normalizeCaption(m.caption) || normalizeCaption(m.alt) || '';
                                        return {
                                            imageUrl: m.url,
                                            imageId: m.id,
                                            caption: cap,
                                            title: title
                                        };
                                    });
                                    setAttributes({ images: a.images.concat(newImages) });
                                },
                                allowedTypes: ['image'], multiple: true, value: a.images.map(function (i) { return i.imageId; }),
                                render: function (p) { return el(Button, { onClick: p.open, variant: 'primary', style: { marginBottom: '12px' } }, __('+ Add Images', 'blockenberg')); }
                            })
                        ),
                        a.images.map(function (img, i) {
                            return el('div', { key: img.imageId || i, style: { display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '10px', padding: '8px', background: '#f9f9f9', borderRadius: '6px' } },
                                el('img', { src: img.imageUrl, style: { width: '56px', height: '40px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 } }),
                                el('div', { style: { flex: 1, minWidth: 0 } },
                                    el(TextControl, { placeholder: normalizeCaption(img.title) || __('Caption…', 'blockenberg'), value: normalizeCaption(img.caption), onChange: function (v) { setAttributes({ images: a.images.map(function (im, idx) { if (idx !== i) return im; return Object.assign({}, im, { caption: v }); }) }); } })
                                ),
                                el(Button, { onClick: function () { setAttributes({ images: a.images.filter(function (_, idx) { return idx !== i; }) }); if (safeActive >= i) setActive(Math.max(0, safeActive - 1)); }, isDestructive: true, variant: 'tertiary', size: 'compact' }, '✕')
                            );
                        })
                    )
                ),

                el('div', blockProps,
                    el('div', { className: 'bkbg-gs-showcase bkbg-gs--thumb-' + a.thumbnailPosition, style: { display: 'flex', flexDirection: flexDir, gap: '14px', alignItems: isVertical ? 'flex-start' : 'stretch' } },
                        thumbAfter ? mainBox : thumbStrip,
                        thumbAfter ? thumbStrip : mainBox
                    ),
                    showCap && capPos === 'below' && el('p', { className: 'bkbg-gs-below-caption', style: { textAlign: 'center', color: belowCaptionColor, margin: '10px 0 0', fontSize: '14px', lineHeight: '1.4', opacity: currentCaption ? 1 : 0.7 } }, currentCaption || __('Add caption in Images panel…', 'blockenberg'))
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var isVertical = a.thumbnailPosition === 'left' || a.thumbnailPosition === 'right';
            var thumbAfter = a.thumbnailPosition === 'bottom' || a.thumbnailPosition === 'right';
            var flexDir    = isVertical
                ? (a.thumbnailPosition === 'left' ? 'row-reverse' : 'row')
                : (a.thumbnailPosition === 'top'  ? 'column-reverse' : 'column');
            var showCap = a.showCaption !== false;
            var capPos = a.captionPosition || 'overlay';
            var firstCaption = a.images[0] ? imageCaptionText(a.images[0]) : '';

            var mainBox = el('div', {
                className: 'bkbg-gs-main',
                'data-transition': a.transitionType || a.transition || 'fade',
                'data-duration': a.transitionDuration || 320,
                style: { position: 'relative', borderRadius: a.mainRadius + 'px', overflow: 'hidden' }
            },
                el('div', { className: 'bkbg-gs-main-images' },
                    a.images.map(function (img, i) {
                        var cap = imageCaptionText(img);
                        return el('div', {
                            key: i,
                            className: 'bkbg-gs-slide' + (i === 0 ? ' is-active' : ''),
                            'data-idx': i
                        },
                            el('img', {
                                src: img.imageUrl,
                                alt: img.title || cap || '',
                                loading: i === 0 ? 'eager' : 'lazy',
                                'data-caption': cap
                            })
                        );
                    })
                ),
                a.showCounter && a.images.length > 0 && el('div', { className: 'bkbg-gs-counter', 'aria-live': 'polite' }, '1 / ' + a.images.length),
                showCap && capPos === 'overlay' && el('div', { className: 'bkbg-gs-caption bkbg-gs-caption--overlay', 'aria-live': 'polite' }, firstCaption),
                a.showArrows && a.images.length > 1 && el(Fragment, null,
                    el('button', { type: 'button', className: 'bkbg-gs-arrow bkbg-gs-arrow--prev bkbg-gs-arrow--' + a.arrowStyle, 'aria-label': __('Previous', 'blockenberg') }, '‹'),
                    el('button', { type: 'button', className: 'bkbg-gs-arrow bkbg-gs-arrow--next bkbg-gs-arrow--' + a.arrowStyle, 'aria-label': __('Next', 'blockenberg') }, '›')
                ),
                a.enableLightbox && el('button', { type: 'button', className: 'bkbg-gs-lightbox-trigger', 'aria-label': __('Open lightbox', 'blockenberg') }, '⛶')
            );

            var thumbStrip = el('div', { className: 'bkbg-gs-thumbs', role: 'list', style: { display: 'flex', flexDirection: isVertical ? 'column' : 'row', gap: a.thumbnailGap + 'px' } },
                a.images.map(function (img, i) {
                    return el('button', { key: i, type: 'button', role: 'listitem', className: 'bkbg-gs-thumb' + (i === 0 ? ' is-active' : ''), 'data-idx': i, 'aria-label': __('Image', 'blockenberg') + ' ' + (i + 1) },
                        el('img', { src: img.imageUrl, alt: img.title || '', loading: 'lazy', style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } })
                    );
                })
            );

            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-gs-wrapper', style: buildWrapStyle(a), 'data-lightbox': a.enableLightbox ? '1' : undefined, 'data-keyboard': a.enableKeyboard ? '1' : undefined }),
                el('div', { className: 'bkbg-gs-showcase bkbg-gs--thumb-' + a.thumbnailPosition, style: { display: 'flex', flexDirection: flexDir, gap: '14px', alignItems: isVertical ? 'flex-start' : 'stretch' } },
                    thumbAfter ? mainBox : thumbStrip,
                    thumbAfter ? thumbStrip : mainBox
                ),
                showCap && capPos === 'below' && el('p', { className: 'bkbg-gs-below-caption', 'aria-live': 'polite' }, firstCaption)
            );
        }
    });
}() );
