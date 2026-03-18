( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var useRef = wp.element.useRef;
    var useEffect = wp.element.useEffect;

    var registerBlockType = wp.blocks.registerBlockType;

    var InspectorControls = wp.blockEditor.InspectorControls;
    var BlockControls = wp.blockEditor.BlockControls;
    var useBlockProps = wp.blockEditor.useBlockProps;

    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var ToolbarGroup = wp.components.ToolbarGroup;
    var ToolbarButton = wp.components.ToolbarButton;

    function clone(obj) {
        var out = {};
        for (var k in obj) out[k] = obj[k];
        return out;
    }

    function openMedia(onSelect) {
        if (!wp || !wp.media) return;
        var frame = wp.media({
            title: __('Select Logo', 'blockenberg'),
            button: { text: __('Use logo', 'blockenberg') },
            multiple: false
        });

        frame.on('select', function () {
            var attachment = frame.state().get('selection').first().toJSON();
            onSelect(attachment);
        });

        frame.open();
    }

    registerBlockType('blockenberg/logo-carousel', {
        title: __('Logo Carousel', 'blockenberg'),
        icon: 'images-alt2',
        category: 'bkbg-marketing',
        description: __('Show client/partner logos in a responsive carousel or grid.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var isSelected = props.isSelected;

            var activeIndexState = useState(0);
            var activeIndex = activeIndexState[0];
            var setActiveIndex = activeIndexState[1];

            var trackRef = useRef(null);
            var activeSlideState = useState(0);
            var activeSlide = activeSlideState[0];
            var setActiveSlide = activeSlideState[1];

            var progressState = useState(0);
            var progressPct = progressState[0];
            var setProgressPct = progressState[1];

            function updateLogo(index, patch) {
                var next = (a.logos || []).map(function (it, i) {
                    if (i !== index) return it;
                    var updated = clone(it || {});
                    for (var k in patch) updated[k] = patch[k];
                    return updated;
                });
                setAttributes({ logos: next });
            }

            function updateLogoImage(index, image) {
                updateLogo(index, { image: image });
            }

            function addLogo() {
                var next = (a.logos || []).slice();
                next.push({ image: { id: 0, url: '', alt: '' }, link: '', newTab: true });
                setAttributes({ logos: next });
                setActiveIndex(next.length - 1);
            }

            function removeLogo(index) {
                var arr = (a.logos || []).slice();
                if (arr.length <= 1) return;
                arr.splice(index, 1);
                setAttributes({ logos: arr });
                setActiveIndex(Math.max(0, Math.min(arr.length - 1, index - 1)));
            }

            function duplicateLogo(index) {
                var arr = (a.logos || []).slice();
                var it = clone(arr[index] || {});
                arr.splice(index + 1, 0, it);
                setAttributes({ logos: arr });
                setActiveIndex(index + 1);
            }

            function moveLogo(index, dir) {
                var arr = (a.logos || []).slice();
                var to = index + dir;
                if (to < 0 || to >= arr.length) return;
                var tmp = arr[index];
                arr[index] = arr[to];
                arr[to] = tmp;
                setAttributes({ logos: arr });
                setActiveIndex(to);
            }

            function getSlides() {
                if (!trackRef.current) return [];
                return trackRef.current.querySelectorAll('.bkbg-lc-slide');
            }

            function scrollToIndex(i) {
                if (!trackRef.current) return;
                var slides = getSlides();
                if (!slides.length) return;
                var idx = Math.max(0, Math.min(slides.length - 1, i));
                slides[idx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
            }

            function scrollByOne(dir) {
                if (!trackRef.current) return;
                var slides = getSlides();
                if (!slides.length) return;

                var trackRect = trackRef.current.getBoundingClientRect();
                var currentIndex = 0;
                for (var i = 0; i < slides.length; i++) {
                    var r = slides[i].getBoundingClientRect();
                    if (r.left >= trackRect.left - 10) {
                        currentIndex = i;
                        break;
                    }
                }

                scrollToIndex(currentIndex + dir);
            }

            useEffect(function () {
                if (!trackRef.current) return;
                var track = trackRef.current;

                function getScrollPct() {
                    var max = track.scrollWidth - track.clientWidth;
                    if (max <= 0) return 0;
                    var pct = (track.scrollLeft / max) * 100;
                    if (pct < 0) pct = 0;
                    if (pct > 100) pct = 100;
                    return pct;
                }

                function updateFromScroll() {
                    var slides = getSlides();
                    if (!slides.length) return;
                    var trackRect = track.getBoundingClientRect();
                    var idx = 0;
                    for (var i = 0; i < slides.length; i++) {
                        var r = slides[i].getBoundingClientRect();
                        if (r.left >= trackRect.left - 10) {
                            idx = i;
                            break;
                        }
                    }
                    setActiveSlide(idx);
                    setProgressPct(getScrollPct());
                }

                updateFromScroll();
                track.addEventListener('scroll', updateFromScroll, { passive: true });
                return function () {
                    track.removeEventListener('scroll', updateFromScroll);
                };
            }, [a.layoutStyle, (a.logos || []).length]);

            function renderIndicators() {
                if (a.carouselIndicators === 'none') return null;

                if (a.carouselIndicators === 'progress') {
                    return el('div', { className: 'bkbg-lc-indicators' },
                        el('div', { className: 'bkbg-lc-progress' },
                            el('div', { className: 'bkbg-lc-progress-bar', style: { width: progressPct + '%' } })
                        )
                    );
                }

                if (a.carouselIndicators === 'fraction') {
                    var total = Math.max(1, (a.logos || []).length);
                    return el('div', { className: 'bkbg-lc-indicators' },
                        el('div', { className: 'bkbg-lc-fraction', 'aria-label': __('Carousel position', 'blockenberg') },
                            el('span', { className: 'bkbg-lc-fraction-current' }, String(activeSlide + 1)),
                            el('span', { 'aria-hidden': 'true' }, '/'),
                            el('span', { className: 'bkbg-lc-fraction-total' }, String(total))
                        )
                    );
                }

                // dots
                return el('div', { className: 'bkbg-lc-indicators' },
                    el('div', { className: 'bkbg-lc-dots', role: 'tablist', 'aria-label': __('Logo Carousel', 'blockenberg') },
                        (a.logos || []).map(function (_, i) {
                            return el('button', {
                                key: i,
                                type: 'button',
                                className: 'bkbg-lc-dot' + (i === activeSlide ? ' is-active' : ''),
                                'aria-label': __('Go to slide', 'blockenberg') + ' ' + (i + 1),
                                onClick: function (e) { e.preventDefault(); e.stopPropagation(); scrollToIndex(i); }
                            });
                        })
                    )
                );
            }

            function renderLogoItem(item, index) {
                var img = item && item.image;
                var hasImg = img && img.url;

                var slideInnerClasses = ['bkbg-lc-slide-inner'];
                if (index === activeIndex && isSelected) slideInnerClasses.push('is-active');

                var inner = el('div', {
                    className: slideInnerClasses.join(' '),
                    onClick: function () { setActiveIndex(index); }
                },
                    el('div', { className: 'bkbg-lc-card-actions' },
                        el(Button, {
                            icon: 'arrow-left-alt2',
                            label: __('Move Left', 'blockenberg'),
                            disabled: index === 0,
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); moveLogo(index, -1); }
                        }),
                        el(Button, {
                            icon: 'arrow-right-alt2',
                            label: __('Move Right', 'blockenberg'),
                            disabled: index === (a.logos || []).length - 1,
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); moveLogo(index, 1); }
                        }),
                        el(Button, {
                            icon: 'admin-page',
                            label: __('Duplicate', 'blockenberg'),
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); duplicateLogo(index); }
                        }),
                        el(Button, {
                            icon: 'trash',
                            label: __('Remove', 'blockenberg'),
                            isDestructive: true,
                            disabled: (a.logos || []).length <= 1,
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); removeLogo(index); }
                        })
                    ),

                    el('div', {
                        className: 'bkbg-lc-item',
                        onClick: function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveIndex(index);
                            openMedia(function (att) {
                                updateLogoImage(index, { id: att.id, url: att.url, alt: att.alt || '' });
                            });
                        },
                        title: hasImg ? __('Click to change logo', 'blockenberg') : __('Click to add logo', 'blockenberg')
                    },
                        hasImg
                            ? el('img', { src: img.url, alt: img.alt || '' })
                            : el('div', { className: 'bkbg-lc-placeholder' }, __('Add Logo', 'blockenberg'))
                    )
                );

                return el('div', { key: index, className: 'bkbg-lc-slide' }, inner);
            }

            function renderLogoGridCell(item, index) {
                var img = item && item.image;
                var hasImg = img && img.url;

                var slideInnerClasses = ['bkbg-lc-slide-inner'];
                if (index === activeIndex && isSelected) slideInnerClasses.push('is-active');

                return el('div', {
                    key: index,
                    className: 'bkbg-lc-grid-cell',
                    onClick: function () { setActiveIndex(index); }
                },
                    el('div', { className: 'bkbg-lc-card-actions' },
                        el(Button, {
                            icon: 'arrow-left-alt2',
                            label: __('Move Left', 'blockenberg'),
                            disabled: index === 0,
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); moveLogo(index, -1); }
                        }),
                        el(Button, {
                            icon: 'arrow-right-alt2',
                            label: __('Move Right', 'blockenberg'),
                            disabled: index === (a.logos || []).length - 1,
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); moveLogo(index, 1); }
                        }),
                        el(Button, {
                            icon: 'admin-page',
                            label: __('Duplicate', 'blockenberg'),
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); duplicateLogo(index); }
                        }),
                        el(Button, {
                            icon: 'trash',
                            label: __('Remove', 'blockenberg'),
                            isDestructive: true,
                            disabled: (a.logos || []).length <= 1,
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); removeLogo(index); }
                        })
                    ),
                    el('div', {
                        className: slideInnerClasses.join(' ')
                    },
                        el('div', {
                            className: 'bkbg-lc-item',
                            onClick: function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveIndex(index);
                                openMedia(function (att) {
                                    updateLogoImage(index, { id: att.id, url: att.url, alt: att.alt || '' });
                                });
                            },
                            title: hasImg ? __('Click to change logo', 'blockenberg') : __('Click to add logo', 'blockenberg')
                        },
                            hasImg
                                ? el('img', { src: img.url, alt: img.alt || '' })
                                : el('div', { className: 'bkbg-lc-placeholder' }, __('Add Logo', 'blockenberg'))
                        )
                    )
                );
            }

            var styleVars = {
                '--bkbg-lc-columns': String(a.columns),
                '--bkbg-lc-gap': a.gap + 'px',
                '--bkbg-lc-carousel-visible': String(a.carouselVisible || 4),
                '--bkbg-lc-peek': a.carouselPeekAmount || '20%',

                '--bkbg-lc-logo-max-h': ((a.logoMaxHeight != null ? a.logoMaxHeight : 150)) + 'px',
                '--bkbg-lc-logo-padding': (a.logoPadding || 14) + 'px',
                '--bkbg-lc-logo-radius': (a.logoRadius || 12) + 'px',
                '--bkbg-lc-logo-bg': a.logoBg,
                '--bkbg-lc-logo-border-color': a.logoBorderColor,
                '--bkbg-lc-logo-border-width': (a.logoBorderWidth || 0) + 'px',

                '--bkbg-lc-logo-opacity': String(a.logoOpacity != null ? a.logoOpacity : 0.8),
                '--bkbg-lc-logo-hover-opacity': String(a.logoHoverOpacity != null ? a.logoHoverOpacity : 1),
                '--bkbg-lc-logo-filter': a.logoGrayscale ? 'grayscale(1)' : 'grayscale(0)',
                '--bkbg-lc-logo-hover-filter': a.logoHoverGrayscale ? 'grayscale(1)' : 'grayscale(0)',
                '--bkbg-lc-logo-fit': a.logoFit || 'contain',
                '--bkbg-lc-logo-hover-scale': String(a.logoHoverScale || 1.03),

                '--bkbg-lc-indicator-size': (a.carouselIndicatorSize || 8) + 'px',
                '--bkbg-lc-indicator-color': a.carouselIndicatorColor,
                '--bkbg-lc-indicator-active-color': a.carouselIndicatorActiveColor,
                '--bkbg-lc-progress-height': (a.carouselProgressHeight || 6) + 'px',
                '--bkbg-lc-progress-bg': a.carouselProgressBg,
                '--bkbg-lc-progress-fg': a.carouselProgressFg,
                '--bkbg-lc-fraction-color': a.carouselFractionColor,
                '--bkbg-lc-fraction-size': (a.carouselFractionSize || 13) + 'px'
            };

            var classes = ['bkbg-lc-wrap'];
            if (a.layoutStyle === 'carousel') {
                classes.push('bkbg-lc-carousel');
                if (a.carouselPeek) classes.push('bkbg-lc-carousel-peek');
                classes.push('bkbg-lc-nav-' + (a.carouselNavStyle || 'overlay'));
                classes.push('bkbg-lc-indicators-' + (a.carouselIndicators || 'none'));
                classes.push('bkbg-lc-indicators-pos-' + (a.carouselIndicatorsPosition || 'below'));

                if (a.carouselIndicators === 'dots') {
                    classes.push('bkbg-lc-dots-style-' + (a.carouselDotsStyle || 'default'));
                }
                if (a.carouselIndicators === 'progress') {
                    classes.push('bkbg-lc-progress-style-' + (a.carouselProgressStyle || 'default'));
                }
            }

            var blockProps = useBlockProps({
                className: 'bkbg-editor-wrap ' + classes.join(' '),
                style: styleVars,
                'data-block-label': 'Logo Carousel'
            });

            var blockControls = el(BlockControls, {},
                el(ToolbarGroup, {},
                    el(ToolbarButton, {
                        icon: 'plus',
                        label: __('Add Logo', 'blockenberg'),
                        onClick: addLogo
                    })
                )
            );

            var selected = (a.logos || [])[activeIndex] || { image: { id: 0, url: '', alt: '' }, link: '', newTab: true };

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Display', 'blockenberg'),
                        value: a.layoutStyle || 'carousel',
                        options: [
                            { label: __('Carousel', 'blockenberg'), value: 'carousel' },
                            { label: __('Grid', 'blockenberg'), value: 'grid' }
                        ],
                        onChange: function (v) { setAttributes({ layoutStyle: v }); }
                    }),
                    (a.layoutStyle === 'grid') && el(RangeControl, {
                        label: __('Columns', 'blockenberg'),
                        value: a.columns || 5,
                        min: 2,
                        max: 8,
                        onChange: function (v) { setAttributes({ columns: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap', 'blockenberg'),
                        value: a.gap || 24,
                        min: 0,
                        max: 64,
                        onChange: function (v) { setAttributes({ gap: v }); }
                    })
                ),

                (a.layoutStyle === 'carousel') && el(PanelBody, { title: __('Carousel', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Visible logos', 'blockenberg'),
                        value: a.carouselVisible || 4,
                        min: 1,
                        max: 8,
                        onChange: function (v) { setAttributes({ carouselVisible: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Peek next logos', 'blockenberg'),
                        checked: !!a.carouselPeek,
                        onChange: function (v) { setAttributes({ carouselPeek: !!v }); }
                    }),
                    a.carouselPeek && el(TextControl, {
                        label: __('Peek amount', 'blockenberg'),
                        help: __('CSS length, e.g. 20% or 120px', 'blockenberg'),
                        value: a.carouselPeekAmount || '20%',
                        onChange: function (v) { setAttributes({ carouselPeekAmount: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show arrows', 'blockenberg'),
                        checked: !!a.carouselNav,
                        onChange: function (v) { setAttributes({ carouselNav: !!v }); }
                    }),
                    a.carouselNav && el(SelectControl, {
                        label: __('Arrow style', 'blockenberg'),
                        value: a.carouselNavStyle || 'overlay',
                        options: [
                            { label: __('Top Right', 'blockenberg'), value: 'top' },
                            { label: __('Bottom Center', 'blockenberg'), value: 'bottom' },
                            { label: __('Overlay Sides', 'blockenberg'), value: 'overlay' }
                        ],
                        onChange: function (v) { setAttributes({ carouselNavStyle: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Indicators', 'blockenberg'),
                        value: a.carouselIndicators || 'none',
                        options: [
                            { label: __('None', 'blockenberg'), value: 'none' },
                            { label: __('Dots', 'blockenberg'), value: 'dots' },
                            { label: __('Progress', 'blockenberg'), value: 'progress' },
                            { label: __('Fraction', 'blockenberg'), value: 'fraction' }
                        ],
                        onChange: function (v) { setAttributes({ carouselIndicators: v }); }
                    }),
                    (a.carouselIndicators !== 'none') && el(SelectControl, {
                        label: __('Indicators position', 'blockenberg'),
                        value: a.carouselIndicatorsPosition || 'below',
                        options: [
                            { label: __('Below', 'blockenberg'), value: 'below' },
                            { label: __('Top', 'blockenberg'), value: 'top' }
                        ],
                        onChange: function (v) { setAttributes({ carouselIndicatorsPosition: v }); }
                    }),
                    (a.carouselIndicators === 'dots') && el(SelectControl, {
                        label: __('Dots style', 'blockenberg'),
                        value: a.carouselDotsStyle || 'default',
                        options: [
                            { label: __('Default', 'blockenberg'), value: 'default' },
                            { label: __('Active pill', 'blockenberg'), value: 'pill' }
                        ],
                        onChange: function (v) { setAttributes({ carouselDotsStyle: v }); }
                    }),
                    (a.carouselIndicators === 'progress') && el(SelectControl, {
                        label: __('Progress style', 'blockenberg'),
                        value: a.carouselProgressStyle || 'default',
                        options: [
                            { label: __('Default', 'blockenberg'), value: 'default' },
                            { label: __('Edge to edge', 'blockenberg'), value: 'edge' }
                        ],
                        onChange: function (v) { setAttributes({ carouselProgressStyle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Infinite Loop', 'blockenberg'),
                        checked: a.infiniteScroll !== false,
                        onChange: function (v) { setAttributes({ infiniteScroll: !!v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Auto-scroll (continuous)', 'blockenberg'),
                        help: __('Runs on the live site (frontend). Please check it there.', 'blockenberg'),
                        checked: !!a.autoScroll,
                        onChange: function (v) { setAttributes({ autoScroll: !!v }); }
                    }),
                    a.autoScroll && el(RangeControl, {
                        label: __('Auto-scroll speed (px/sec)', 'blockenberg'),
                        value: a.autoScrollSpeed || 40,
                        min: 5,
                        max: 200,
                        step: 1,
                        onChange: function (v) { setAttributes({ autoScrollSpeed: v }); }
                    }),
                    a.autoScroll && el(ToggleControl, {
                        label: __('Pause on hover', 'blockenberg'),
                        checked: a.autoScrollPauseOnHover !== false,
                        onChange: function (v) { setAttributes({ autoScrollPauseOnHover: !!v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Autoplay', 'blockenberg'),
                        checked: !!a.autoplay,
                        onChange: function (v) { setAttributes({ autoplay: !!v }); }
                    }),
                    a.autoplay && el(RangeControl, {
                        label: __('Autoplay delay (ms)', 'blockenberg'),
                        value: a.autoplayDelay || 3000,
                        min: 800,
                        max: 10000,
                        step: 100,
                        onChange: function (v) { setAttributes({ autoplayDelay: v }); }
                    }),
                    a.autoplay && el(ToggleControl, {
                        label: __('Pause on hover', 'blockenberg'),
                        checked: a.autoplayPauseOnHover !== false,
                        onChange: function (v) { setAttributes({ autoplayPauseOnHover: !!v }); }
                    })
                ),

                el(PanelBody, { title: __('Logos', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Max logo height (px)', 'blockenberg'),
                        type: 'number',
                        value: (a.logoMaxHeight != null ? String(a.logoMaxHeight) : '150'),
                        min: 0,
                        onChange: function (v) {
                            var n = parseInt(v, 10);
                            if (isNaN(n)) n = 0;
                            setAttributes({ logoMaxHeight: n });
                        }
                    }),
                    el(RangeControl, {
                        label: __('Padding', 'blockenberg'),
                        value: a.logoPadding || 14,
                        min: 0,
                        max: 40,
                        onChange: function (v) { setAttributes({ logoPadding: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Radius', 'blockenberg'),
                        value: a.logoRadius || 12,
                        min: 0,
                        max: 40,
                        onChange: function (v) { setAttributes({ logoRadius: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Image fit', 'blockenberg'),
                        value: a.logoFit || 'contain',
                        options: [
                            { label: __('Contain', 'blockenberg'), value: 'contain' },
                            { label: __('Cover', 'blockenberg'), value: 'cover' }
                        ],
                        onChange: function (v) { setAttributes({ logoFit: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Opacity', 'blockenberg'),
                        value: a.logoOpacity != null ? a.logoOpacity : 0.8,
                        min: 0.1,
                        max: 1,
                        step: 0.05,
                        onChange: function (v) { setAttributes({ logoOpacity: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Hover opacity', 'blockenberg'),
                        value: a.logoHoverOpacity != null ? a.logoHoverOpacity : 1,
                        min: 0.1,
                        max: 1,
                        step: 0.05,
                        onChange: function (v) { setAttributes({ logoHoverOpacity: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Grayscale', 'blockenberg'),
                        checked: !!a.logoGrayscale,
                        onChange: function (v) { setAttributes({ logoGrayscale: !!v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Grayscale on hover', 'blockenberg'),
                        checked: !!a.logoHoverGrayscale,
                        onChange: function (v) { setAttributes({ logoHoverGrayscale: !!v }); }
                    }),
                    el(RangeControl, {
                        label: __('Hover scale', 'blockenberg'),
                        value: a.logoHoverScale || 1.03,
                        min: 1,
                        max: 1.2,
                        step: 0.01,
                        onChange: function (v) { setAttributes({ logoHoverScale: v }); }
                    })
                ),

                el(PanelBody, { title: __('Selected Logo', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Link URL', 'blockenberg'),
                        value: selected.link || '',
                        placeholder: 'https://',
                        onChange: function (v) { updateLogo(activeIndex, { link: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Open in new tab', 'blockenberg'),
                        checked: selected.newTab !== false,
                        onChange: function (v) { updateLogo(activeIndex, { newTab: !!v }); }
                    })
                ),

                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false, colorSettings: [
                        {
                            label: __('Item background', 'blockenberg'),
                            value: a.logoBg,
                            onChange: function (v) { setAttributes({ logoBg: v }); }
                        },
                        {
                            label: __('Item border', 'blockenberg'),
                            value: a.logoBorderColor,
                            onChange: function (v) { setAttributes({ logoBorderColor: v }); }
                        },
                        {
                            label: __('Indicator', 'blockenberg'),
                            value: a.carouselIndicatorColor,
                            onChange: function (v) { setAttributes({ carouselIndicatorColor: v }); }
                        },
                        {
                            label: __('Indicator active', 'blockenberg'),
                            value: a.carouselIndicatorActiveColor,
                            onChange: function (v) { setAttributes({ carouselIndicatorActiveColor: v }); }
                        },
                        {
                            label: __('Progress background', 'blockenberg'),
                            value: a.carouselProgressBg,
                            onChange: function (v) { setAttributes({ carouselProgressBg: v }); }
                        },
                        {
                            label: __('Progress foreground', 'blockenberg'),
                            value: a.carouselProgressFg,
                            onChange: function (v) { setAttributes({ carouselProgressFg: v }); }
                        },
                        {
                            label: __('Fraction color', 'blockenberg'),
                            value: a.carouselFractionColor,
                            onChange: function (v) { setAttributes({ carouselFractionColor: v }); }
                        }
                    ]
                }),

            );

            var content;
            if (a.layoutStyle === 'grid') {
                content = el('div', { className: 'bkbg-lc-grid' },
                    (a.logos || []).map(function (it, idx) { return renderLogoGridCell(it, idx); })
                );
            } else {
                var indicators = renderIndicators();
                var nav = a.carouselNav && el('div', { className: 'bkbg-lc-nav' },
                    el('button', {
                        type: 'button',
                        className: 'bkbg-lc-nav-btn',
                        'data-bkbg-nav': 'prev',
                        'aria-label': __('Previous', 'blockenberg'),
                        onClick: function (e) { e.preventDefault(); e.stopPropagation(); scrollByOne(-1); }
                    }, el('span', { className: 'dashicons dashicons-arrow-left-alt2', 'aria-hidden': 'true' })),
                    el('button', {
                        type: 'button',
                        className: 'bkbg-lc-nav-btn',
                        'data-bkbg-nav': 'next',
                        'aria-label': __('Next', 'blockenberg'),
                        onClick: function (e) { e.preventDefault(); e.stopPropagation(); scrollByOne(1); }
                    }, el('span', { className: 'dashicons dashicons-arrow-right-alt2', 'aria-hidden': 'true' }))
                );

                content = el('div', { className: 'bkbg-lc-carousel' },
                    (a.carouselIndicatorsPosition === 'top') && indicators,
                    el('div', { className: 'bkbg-lc-carousel-inner' },
                        nav,
                        el('div', { className: 'bkbg-lc-track', ref: trackRef },
                            (a.logos || []).map(function (it, idx) { return renderLogoItem(it, idx); })
                        )
                    ),
                    (a.carouselIndicatorsPosition !== 'top') && indicators
                );
            }

            return el(Fragment, {},
                inspector,
                blockControls,
                el('div', blockProps,
                    content,
                    el('div', { className: 'bkbg-editor-actions' },
                        el(Button, { variant: 'secondary', icon: 'plus-alt2', onClick: addLogo }, __('Add Logo', 'blockenberg'))
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            var styleVars = {
                '--bkbg-lc-columns': String(a.columns),
                '--bkbg-lc-gap': a.gap + 'px',
                '--bkbg-lc-carousel-visible': String(a.carouselVisible || 4),
                '--bkbg-lc-peek': a.carouselPeekAmount || '20%',

                '--bkbg-lc-logo-max-h': ((a.logoMaxHeight != null ? a.logoMaxHeight : 150)) + 'px',
                '--bkbg-lc-logo-padding': (a.logoPadding || 14) + 'px',
                '--bkbg-lc-logo-radius': (a.logoRadius || 12) + 'px',
                '--bkbg-lc-logo-bg': a.logoBg,
                '--bkbg-lc-logo-border-color': a.logoBorderColor,
                '--bkbg-lc-logo-border-width': (a.logoBorderWidth || 0) + 'px',

                '--bkbg-lc-logo-opacity': String(a.logoOpacity != null ? a.logoOpacity : 0.8),
                '--bkbg-lc-logo-hover-opacity': String(a.logoHoverOpacity != null ? a.logoHoverOpacity : 1),
                '--bkbg-lc-logo-filter': a.logoGrayscale ? 'grayscale(1)' : 'grayscale(0)',
                '--bkbg-lc-logo-hover-filter': a.logoHoverGrayscale ? 'grayscale(1)' : 'grayscale(0)',
                '--bkbg-lc-logo-fit': a.logoFit || 'contain',
                '--bkbg-lc-logo-hover-scale': String(a.logoHoverScale || 1.03),

                '--bkbg-lc-indicator-size': (a.carouselIndicatorSize || 8) + 'px',
                '--bkbg-lc-indicator-color': a.carouselIndicatorColor,
                '--bkbg-lc-indicator-active-color': a.carouselIndicatorActiveColor,
                '--bkbg-lc-progress-height': (a.carouselProgressHeight || 6) + 'px',
                '--bkbg-lc-progress-bg': a.carouselProgressBg,
                '--bkbg-lc-progress-fg': a.carouselProgressFg,
                '--bkbg-lc-fraction-color': a.carouselFractionColor,
                '--bkbg-lc-fraction-size': (a.carouselFractionSize || 13) + 'px'
            };

            var classes = ['bkbg-lc-wrap'];
            if (a.layoutStyle === 'carousel') {
                classes.push('bkbg-lc-carousel');
                if (a.carouselPeek) classes.push('bkbg-lc-carousel-peek');
                classes.push('bkbg-lc-nav-' + (a.carouselNavStyle || 'overlay'));
                classes.push('bkbg-lc-indicators-' + (a.carouselIndicators || 'none'));
                classes.push('bkbg-lc-indicators-pos-' + (a.carouselIndicatorsPosition || 'below'));

                if (a.carouselIndicators === 'dots') {
                    classes.push('bkbg-lc-dots-style-' + (a.carouselDotsStyle || 'default'));
                }
                if (a.carouselIndicators === 'progress') {
                    classes.push('bkbg-lc-progress-style-' + (a.carouselProgressStyle || 'default'));
                }
            }

            var blockProps = useBlockProps.save({
                className: classes.join(' '),
                style: styleVars,
                'data-bkbg-autoplay': a.autoplay ? '1' : '0',
                'data-bkbg-autoplay-delay': String(a.autoplayDelay || 3000),
                'data-bkbg-autoplay-hover': a.autoplayPauseOnHover === false ? '0' : '1',
                'data-bkbg-infinite': a.infiniteScroll === false ? '0' : '1',
                'data-bkbg-autoscroll': a.autoScroll ? '1' : '0',
                'data-bkbg-autoscroll-speed': String(a.autoScrollSpeed || 40),
                'data-bkbg-autoscroll-hover': a.autoScrollPauseOnHover === false ? '0' : '1'
            });

            function renderIndicators() {
                if (a.carouselIndicators === 'none') return null;

                if (a.carouselIndicators === 'progress') {
                    return el('div', { className: 'bkbg-lc-indicators' },
                        el('div', { className: 'bkbg-lc-progress' },
                            el('div', { className: 'bkbg-lc-progress-bar', style: { width: '0%' } })
                        )
                    );
                }

                if (a.carouselIndicators === 'fraction') {
                    var total = Math.max(1, (a.logos || []).length);
                    return el('div', { className: 'bkbg-lc-indicators' },
                        el('div', { className: 'bkbg-lc-fraction', 'aria-label': __('Carousel position', 'blockenberg') },
                            el('span', { className: 'bkbg-lc-fraction-current', 'data-bkbg-fraction': 'current' }, '1'),
                            el('span', { 'aria-hidden': 'true' }, '/'),
                            el('span', { className: 'bkbg-lc-fraction-total', 'data-bkbg-fraction': 'total' }, String(total))
                        )
                    );
                }

                return el('div', { className: 'bkbg-lc-indicators' },
                    el('div', { className: 'bkbg-lc-dots', role: 'tablist', 'aria-label': __('Logo Carousel', 'blockenberg') },
                        (a.logos || []).map(function (_, i) {
                            return el('button', {
                                key: i,
                                type: 'button',
                                className: 'bkbg-lc-dot' + (i === 0 ? ' is-active' : ''),
                                'data-bkbg-dot': String(i),
                                'aria-label': __('Go to slide', 'blockenberg') + ' ' + (i + 1)
                            });
                        })
                    )
                );
            }

            function renderItem(it, idx) {
                var img = it && it.image;
                var hasImg = img && img.url;
                var href = (it && it.link) ? String(it.link) : '';
                var newTab = !(it && it.newTab === false);

                var inner = hasImg
                    ? el('img', { src: img.url, alt: img.alt || '' })
                    : el('div', { className: 'bkbg-lc-placeholder', 'aria-hidden': 'true' }, '');

                if (href) {
                    return el('a', {
                        key: idx,
                        className: 'bkbg-lc-item',
                        href: href,
                        target: newTab ? '_blank' : undefined,
                        rel: newTab ? 'noopener noreferrer' : undefined
                    }, inner);
                }

                return el('div', { key: idx, className: 'bkbg-lc-item' }, inner);
            }

            if (a.layoutStyle === 'grid') {
                return el('div', blockProps,
                    el('div', { className: 'bkbg-lc-grid' }, (a.logos || []).map(renderItem))
                );
            }

            var indicators = renderIndicators();

            return el('div', blockProps,
                (a.carouselIndicatorsPosition === 'top') && indicators,
                el('div', { className: 'bkbg-lc-carousel-inner' },
                    a.carouselNav && el('div', { className: 'bkbg-lc-nav' },
                        el('button', { type: 'button', className: 'bkbg-lc-nav-btn', 'data-bkbg-nav': 'prev', 'aria-label': __('Previous', 'blockenberg') },
                            el('span', { className: 'dashicons dashicons-arrow-left-alt2', 'aria-hidden': 'true' })
                        ),
                        el('button', { type: 'button', className: 'bkbg-lc-nav-btn', 'data-bkbg-nav': 'next', 'aria-label': __('Next', 'blockenberg') },
                            el('span', { className: 'dashicons dashicons-arrow-right-alt2', 'aria-hidden': 'true' })
                        )
                    ),
                    el('div', { className: 'bkbg-lc-track' },
                        (a.logos || []).map(function (it, idx) {
                            return el('div', { key: idx, className: 'bkbg-lc-slide' }, renderItem(it, idx));
                        })
                    )
                ),
                (a.carouselIndicatorsPosition !== 'top') && indicators
            );
        }
    });
}() );
