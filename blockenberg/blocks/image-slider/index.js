( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var MediaUpload       = wp.blockEditor.MediaUpload;
    var MediaUploadCheck  = wp.blockEditor.MediaUploadCheck;
    var PanelBody    = wp.components.PanelBody;
    var Button       = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl  = wp.components.TextControl;
    var ColorPicker  = wp.components.ColorPicker;
    var Popover      = wp.components.Popover;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', {
                    type: 'button', title: value || 'transparent',
                    onClick: function () { setOpenKey(isOpen ? null : key); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#cccccc' }
                }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } }, el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange }))
                )
            )
        );
    }

    function buildWrapStyle(a) {
        var s = {
            '--bkbg-is-height'   : a.height + 'px',
            '--bkbg-is-mob-h'    : a.mobileHeight + 'px',
            '--bkbg-is-radius'   : a.borderRadius + 'px',
            '--bkbg-is-accent'   : a.accentColor,
            '--bkbg-is-cap-bg'   : a.captionBg,
            '--bkbg-is-cap-color': a.captionColor,
            '--bkbg-is-title-sz' : a.titleSize + 'px',
            '--bkbg-is-sub-sz'   : a.subtitleSize + 'px'
        };
        var _tv = getTypoCssVars();
        Object.assign(s, _tv(a.titleTypo, '--bkbg-is-tt-'));
        Object.assign(s, _tv(a.subtitleTypo, '--bkbg-is-st-'));
        return s;
    }

    registerBlockType('blockenberg/image-slider', {
        title: __('Image Slider', 'blockenberg'),
        icon: 'images-alt2',
        category: 'bkbg-media',
        description: __('Responsive image carousel with captions, autoplay and touch support.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var activeSlideState = useState(0);
            var activeSlide = activeSlideState[0];
            var setActiveSlide = activeSlideState[1];

            var slides = a.slides || [];

            function updateSlide(idx, key, val) {
                var updated = slides.map(function (s, i) {
                    if (i !== idx) return s;
                    var n = Object.assign({}, s); n[key] = val; return n;
                });
                setAttributes({ slides: updated });
            }

            function addSlide() {
                setAttributes({ slides: slides.concat([{ imageUrl: '', imageId: 0, alt: '', title: 'New Slide', subtitle: '', buttonText: '', buttonUrl: '', buttonTarget: false, overlayColor: '' }]) });
                setActiveSlide(slides.length);
            }

            function removeSlide(idx) {
                setAttributes({ slides: slides.filter(function (_, i) { return i !== idx; }) });
                setActiveSlide(Math.max(0, idx - 1));
            }

            function cc(key, label, val, attrKey) {
                return renderColorControl(key, label, val, function (v) {
                    var upd = {}; upd[attrKey] = v; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            var blockProps = useBlockProps({ className: 'bkbg-is-wrapper', style: buildWrapStyle(a) });
            var curSlide = slides[activeSlide] || {};

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Slides', 'blockenberg'), initialOpen: true },
                    el('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' } },
                        slides.map(function (s, idx) {
                            var isSel = idx === activeSlide;
                            return el('div', {
                                key: idx,
                                style: { display: 'flex', alignItems: 'center', gap: '6px', background: isSel ? '#e8f0fe' : '#f5f5f5', border: isSel ? '1px solid #4285f4' : '1px solid #ddd', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer' },
                                onClick: function () { setActiveSlide(idx); }
                            },
                                s.imageUrl && el('img', { src: s.imageUrl, style: { width: '36px', height: '28px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 } }),
                                !s.imageUrl && el('span', { style: { width: '36px', height: '28px', background: '#ddd', borderRadius: '3px', flexShrink: 0, display: 'block' } }),
                                el('span', { style: { flex: 1, fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, s.title || __('Slide', 'blockenberg')),
                                el('button', { type: 'button', onClick: function (e) { e.stopPropagation(); removeSlide(idx); }, style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#cc1818', padding: '0 2px' } }, '×')
                            );
                        })
                    ),
                    el(Button, { variant: 'secondary', onClick: addSlide, style: { width: '100%', justifyContent: 'center', marginBottom: '16px' } },
                        '+ ' + __('Add Slide', 'blockenberg')
                    ),
                    slides.length > 0 && el('div', { style: { borderTop: '1px solid #e0e0e0', paddingTop: '12px' } },
                        el('strong', { style: { fontSize: '12px', display: 'block', marginBottom: '8px' } }, __('Edit Slide', 'blockenberg') + ' #' + (activeSlide + 1)),
                        el(MediaUploadCheck, {},
                            el(MediaUpload, {
                                onSelect: function (media) { setAttributes({ slides: slides.map(function (s, i) { return i !== activeSlide ? s : Object.assign({}, s, { imageUrl: media.url, imageId: media.id, alt: media.alt || '' }); }) }); },
                                allowedTypes: ['image'],
                                value: curSlide.imageId || 0,
                                render: function (obj) {
                                    return el(Button, {
                                        onClick: obj.open, variant: curSlide.imageUrl ? 'secondary' : 'primary',
                                        style: { width: '100%', justifyContent: 'center', marginBottom: '8px' }
                                    }, curSlide.imageUrl ? __('Replace Image', 'blockenberg') : __('Set Image', 'blockenberg'));
                                }
                            })
                        ),
                        curSlide.imageUrl && el(Button, {
                            variant: 'tertiary', isDestructive: true,
                            onClick: function () { setAttributes({ slides: slides.map(function (s, i) { return i !== activeSlide ? s : Object.assign({}, s, { imageUrl: '', imageId: 0 }); }) }); },
                            style: { marginBottom: '8px', fontSize: '12px' }
                        }, __('Remove Image', 'blockenberg')),
                        el(TextControl, { label: __('Title', 'blockenberg'), value: curSlide.title || '', onChange: function (v) { updateSlide(activeSlide, 'title', v); } }),
                        el(TextControl, { label: __('Subtitle', 'blockenberg'), value: curSlide.subtitle || '', onChange: function (v) { updateSlide(activeSlide, 'subtitle', v); } }),
                        el(TextControl, { label: __('Button Label (optional)', 'blockenberg'), value: curSlide.buttonText || '', onChange: function (v) { updateSlide(activeSlide, 'buttonText', v); } }),
                        curSlide.buttonText && el(Fragment, {},
                            el(TextControl, { label: __('Button URL', 'blockenberg'), value: curSlide.buttonUrl || '', onChange: function (v) { updateSlide(activeSlide, 'buttonUrl', v); } }),
                            el(ToggleControl, { label: __('Open in new tab', 'blockenberg'), checked: !!curSlide.buttonTarget, onChange: function (v) { updateSlide(activeSlide, 'buttonTarget', v); } })
                        )
                    )
                ),

                el(PanelBody, { title: __('Autoplay & Behaviour', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Autoplay', 'blockenberg'), checked: a.autoplay, onChange: function (v) { setAttributes({ autoplay: v }); } }),
                    a.autoplay && el(RangeControl, { label: __('Speed (ms)', 'blockenberg'), value: a.autoplaySpeed, min: 1000, max: 10000, step: 500, onChange: function (v) { setAttributes({ autoplaySpeed: v }); } }),
                    a.autoplay && el(ToggleControl, { label: __('Pause on Hover', 'blockenberg'), checked: a.pauseOnHover, onChange: function (v) { setAttributes({ pauseOnHover: v }); } }),
                    el(ToggleControl, { label: __('Loop', 'blockenberg'), checked: a.loop, onChange: function (v) { setAttributes({ loop: v }); } }),
                    el(SelectControl, {
                        label: __('Transition', 'blockenberg'), value: a.transition,
                        options: [{ label: __('Slide', 'blockenberg'), value: 'slide' }, { label: __('Fade', 'blockenberg'), value: 'fade' }],
                        onChange: function (v) { setAttributes({ transition: v }); }
                    })
                ),

                el(PanelBody, { title: __('Navigation', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Arrows', 'blockenberg'), checked: a.showArrows, onChange: function (v) { setAttributes({ showArrows: v }); } }),
                    a.showArrows && el(SelectControl, {
                        label: __('Arrow Style', 'blockenberg'), value: a.arrowStyle,
                        options: [{ label: __('Rounded', 'blockenberg'), value: 'rounded' }, { label: __('Circle', 'blockenberg'), value: 'circle' }, { label: __('Square', 'blockenberg'), value: 'square' }],
                        onChange: function (v) { setAttributes({ arrowStyle: v }); }
                    }),
                    el(ToggleControl, { label: __('Show Dots', 'blockenberg'), checked: a.showDots, onChange: function (v) { setAttributes({ showDots: v }); } })
                ),

                el(PanelBody, { title: __('Dimensions', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Height Desktop (px)', 'blockenberg'), value: a.height, min: 200, max: 900, onChange: function (v) { setAttributes({ height: v }); } }),
                    el(RangeControl, { label: __('Height Mobile (px)', 'blockenberg'), value: a.mobileHeight, min: 100, max: 600, onChange: function (v) { setAttributes({ mobileHeight: v }); } }),
                    el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: a.borderRadius, min: 0, max: 40, onChange: function (v) { setAttributes({ borderRadius: v }); } }),
                    el(SelectControl, {
                        label: __('Image Fit', 'blockenberg'), value: a.objectFit,
                        options: [{ label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' }, { label: 'Fill', value: 'fill' }],
                        onChange: function (v) { setAttributes({ objectFit: v }); }
                    })
                ),

                el(PanelBody, { title: __('Caption & Button', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Caption Position', 'blockenberg'), value: a.captionPosition,
                        options: [
                            { label: __('Bottom Left', 'blockenberg'), value: 'bottom-left' },
                            { label: __('Bottom Center', 'blockenberg'), value: 'bottom-center' },
                            { label: __('Center', 'blockenberg'), value: 'center' },
                            { label: __('None', 'blockenberg'), value: 'none' }
                        ],
                        onChange: function (v) { setAttributes({ captionPosition: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Button Style', 'blockenberg'), value: a.btnStyle,
                        options: [{ label: __('Primary (solid)', 'blockenberg'), value: 'primary' }, { label: __('Outline', 'blockenberg'), value: 'outline' }, { label: __('Ghost (text)', 'blockenberg'), value: 'ghost' }],
                        onChange: function (v) { setAttributes({ btnStyle: v }); }
                    }),
                    cc('accentColor', __('Accent / Button Color', 'blockenberg'), a.accentColor, 'accentColor'),
                    cc('captionBg', __('Caption Background', 'blockenberg'), a.captionBg, 'captionBg'),
                    cc('captionColor', __('Caption Text Color', 'blockenberg'), a.captionColor, 'captionColor')
                ),
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypographyControl() && el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                    getTypographyControl() && el(getTypographyControl(), { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo, onChange: function (v) { setAttributes({ subtitleTypo: v }); } })
                )
            );

            /* Preview */
            var s = slides[activeSlide] || {};
            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-is-slider bkbg-is-trans-' + a.transition }, 
                        el('div', { className: 'bkbg-is-slide bkbg-is-slide-active' },
                            s.imageUrl
                                ? el('img', { src: s.imageUrl, alt: s.alt || '', className: 'bkbg-is-img', style: { objectFit: a.objectFit } })
                                : el('div', { className: 'bkbg-is-placeholder' }, el('span', {}, __('Set a slide image in the panel →', 'blockenberg'))),
                            a.captionPosition !== 'none' && (s.title || s.subtitle) && el('div', { className: 'bkbg-is-caption bkbg-is-cap-' + a.captionPosition },
                                s.title && el('h2', { className: 'bkbg-is-title' }, s.title),
                                s.subtitle && el('p', { className: 'bkbg-is-subtitle' }, s.subtitle),
                                s.buttonText && el('a', { className: 'bkbg-is-btn bkbg-is-btn-' + a.btnStyle, href: s.buttonUrl || '#', style: { pointerEvents: 'none' } }, s.buttonText)
                            )
                        )
                    ),
                    a.showArrows && el(Fragment, {},
                        el('button', { className: 'bkbg-is-arrow bkbg-is-arrow-prev bkbg-is-arrow-' + a.arrowStyle, 'aria-label': __('Previous', 'blockenberg'), style: { pointerEvents: 'none' } }, '‹'),
                        el('button', { className: 'bkbg-is-arrow bkbg-is-arrow-next bkbg-is-arrow-' + a.arrowStyle, 'aria-label': __('Next', 'blockenberg'), style: { pointerEvents: 'none' } }, '›')
                    ),
                    a.showDots && el('div', { className: 'bkbg-is-dots' },
                        slides.map(function (_, idx) {
                            return el('button', { key: idx, className: 'bkbg-is-dot' + (idx === activeSlide ? ' bkbg-is-dot-active' : ''), style: { pointerEvents: 'none' } });
                        })
                    ),
                    slides.length > 1 && el('div', { style: { position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '11px', padding: '3px 7px', borderRadius: '4px' } },
                        (activeSlide + 1) + ' / ' + slides.length
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var slides = a.slides || [];
            var el = wp.element.createElement;
            var _tv = getTypoCssVars();
            var saveStyle = {
                '--bkbg-is-height'   : a.height + 'px',
                '--bkbg-is-mob-h'    : a.mobileHeight + 'px',
                '--bkbg-is-radius'   : a.borderRadius + 'px',
                '--bkbg-is-accent'   : a.accentColor,
                '--bkbg-is-cap-bg'   : a.captionBg,
                '--bkbg-is-cap-color': a.captionColor,
                '--bkbg-is-title-sz' : a.titleSize + 'px',
                '--bkbg-is-sub-sz'   : a.subtitleSize + 'px'
            };
            Object.assign(saveStyle, _tv(a.titleTypo, '--bkbg-is-tt-'));
            Object.assign(saveStyle, _tv(a.subtitleTypo, '--bkbg-is-st-'));
            var saveProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-is-wrapper',
                style: saveStyle,
                'data-autoplay'       : a.autoplay ? '1' : '0',
                'data-speed'          : a.autoplaySpeed,
                'data-loop'           : a.loop ? '1' : '0',
                'data-pause-hover'    : a.pauseOnHover ? '1' : '0',
                'data-transition'     : a.transition
            });

            return el('div', saveProps,
                el('div', { className: 'bkbg-is-slider bkbg-is-trans-' + a.transition },
                    slides.map(function (s, idx) {
                        return el('div', { key: idx, className: 'bkbg-is-slide' + (idx === 0 ? ' bkbg-is-slide-active' : '') },
                            s.imageUrl && el('img', { src: s.imageUrl, alt: s.alt || '', className: 'bkbg-is-img', style: { objectFit: a.objectFit }, loading: idx === 0 ? 'eager' : 'lazy' }),
                            a.captionPosition !== 'none' && (s.title || s.subtitle) && el('div', { className: 'bkbg-is-caption bkbg-is-cap-' + a.captionPosition },
                                s.title && el('h2', { className: 'bkbg-is-title' }, s.title),
                                s.subtitle && el('p', { className: 'bkbg-is-subtitle' }, s.subtitle),
                                s.buttonText && el('a', {
                                    className: 'bkbg-is-btn bkbg-is-btn-' + a.btnStyle,
                                    href: s.buttonUrl || '#',
                                    target: s.buttonTarget ? '_blank' : undefined,
                                    rel: s.buttonTarget ? 'noopener noreferrer' : undefined
                                }, s.buttonText)
                            )
                        );
                    })
                ),
                a.showArrows && el('button', { className: 'bkbg-is-arrow bkbg-is-arrow-prev bkbg-is-arrow-' + a.arrowStyle, 'aria-label': 'Previous slide' }, '‹'),
                a.showArrows && el('button', { className: 'bkbg-is-arrow bkbg-is-arrow-next bkbg-is-arrow-' + a.arrowStyle, 'aria-label': 'Next slide' }, '›'),
                a.showDots && el('div', { className: 'bkbg-is-dots' },
                    slides.map(function (_, idx) {
                        return el('button', { key: idx, className: 'bkbg-is-dot' + (idx === 0 ? ' bkbg-is-dot-active' : ''), 'aria-label': 'Go to slide ' + (idx + 1) });
                    })
                )
            );
        }
    });
}() );
