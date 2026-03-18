( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var useEffect = wp.element.useEffect;
    var useRef = wp.element.useRef;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;
    var Button = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TabPanel = wp.components.TabPanel;
    var ColorPalette = wp.components.ColorPalette;
    var GradientPicker = wp.components.__experimentalGradientPicker;

    var _fpTC, _fpTV;
    function _tc() { return _fpTC || (_fpTC = window.bkbgTypographyControl); }
    function _tv() { return _fpTV || (_fpTV = window.bkbgTypoCssVars); }

    // ── Built-in SVG icons (same system as icon-box) ────────────────────────
    var builtInIcons = {
        check: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' })
        ),
        check2: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.41-1.41L10 13.67l7.59-7.59L19 7.5l-9 9z' })
        ),
        arrow: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z' })
        ),
        'arrow-right': el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z' })
        ),
        star: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' })
        ),
        disc: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('circle', { cx: '12', cy: '12', r: '6' })
        ),
        square: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('rect', { x: '6', y: '6', width: '12', height: '12', rx: '2' })
        ),
        dash: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M4 11h16v2H4z' })
        ),
        cross: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' })
        ),
        sparkle: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z' })
        ),
        bolt: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M7 2v11h3v9l7-12h-4l4-8z' })
        ),
        heart: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' })
        ),
        globe: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' })
        ),
        shield: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z' })
        ),
        rocket: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.05-4.05c.38-.37.88-.57 1.41-.57L9.19 6.35zM11.17 19l5.38-5.38c-.45 2.29-2.16 5.89-5.38 5.38zm8.6-14.26c.1-.46.12-.93.07-1.39-.46-.05-.93-.03-1.39.07-1.19.27-2.3.86-3.2 1.76L9.5 11H8l-3 3 3.46.96.58.58.96 3.46 3-3v-1.5l5.82-5.75c.9-.9 1.49-2.01 1.76-3.2zM15 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-6.71 9.21l-1.5-1.5c-.39-.39-.39-1.02 0-1.41l.03-.03c.39-.39 1.02-.39 1.41 0l1.5 1.5c.39.39.39 1.02 0 1.41l-.03.03c-.39.39-1.02.39-1.41 0z' })
        )
    };

    var dashicons = [
        'yes', 'yes-alt', 'no', 'no-alt', 'arrow-right', 'arrow-right-alt', 'arrow-right-alt2',
        'arrow-left-alt2', 'arrow-up-alt2', 'arrow-down-alt2',
        'star-filled', 'star-half', 'star-empty', 'heart', 'thumbs-up', 'thumbs-down',
        'awards', 'flag', 'warning', 'info', 'lightbulb', 'marker', 'tag', 'category',
        'location', 'location-alt', 'clock', 'calendar', 'calendar-alt',
        'groups', 'businessman', 'businesswoman', 'admin-users', 'id', 'id-alt',
        'products', 'cart', 'money', 'money-alt', 'bank', 'feedback', 'forms',
        'edit', 'trash', 'upload', 'download', 'cloud', 'cloud-upload', 'cloud-saved',
        'search', 'lock', 'unlock', 'performance', 'analytics', 'chart-bar', 'chart-pie',
        'chart-line', 'chart-area', 'list-view', 'grid-view', 'slides',
        'desktop', 'laptop', 'tablet', 'smartphone', 'phone',
        'media-audio', 'media-video', 'media-document', 'format-image', 'camera',
        'portfolio', 'book', 'book-alt', 'text-page', 'welcome-write-blog',
        'hammer', 'art', 'schedule', 'rest-api', 'database', 'code-standards',
        'rss', 'email', 'email-alt', 'share', 'share-alt', 'networking',
        'facebook', 'twitter', 'instagram', 'linkedin', 'youtube',
        'shield', 'shield-alt', 'sos', 'image-rotate', 'image-flip-horizontal',
        'image-flip-vertical', 'image-crop', 'controls-play', 'controls-pause',
        'controls-skipforward', 'controls-skipback', 'controls-repeat', 'controls-volumeon',
        'controls-volumeoff', 'ribbon', 'certificate', 'megaphone', 'universal-access',
        'visibility', 'hidden', 'welcome-add-page', 'welcome-view-site', 'welcome-widgets-menus',
        'welcome-learn-more', 'format-video', 'format-audio', 'format-gallery', 'format-quote',
        'format-chat', 'format-aside', 'format-links', 'format-status', 'align-left',
        'align-right', 'align-center', 'align-none', 'align-full-width',
        'migrate', 'shortcode', 'saved', 'dismiss', 'sticky',
        'nametag', 'open-folder', 'vault', 'pdf', 'print', 'word'
    ];

    // ── Build icon element (mirrors icon-box logic) ───────────────────────
    function buildIconEl(a) {
        var type  = a.iconType;
        var sz    = a.iconSize;
        var col   = a.iconColor;
        var shape = a.iconBgShape;

        if (type === 'none') return null;

        var inner;
        if (type === 'custom-image') {
            if (!a.iconImageUrl) return null;
            inner = el('img', {
                src: a.iconImageUrl, alt: '',
                style: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' }
            });
        } else if (type === 'custom-char') {
            inner = el('span', { className: 'bkbg-fc-char' }, a.iconChar || '★');
        } else if (type === 'dashicon') {
            inner = el('span', { className: 'dashicons dashicons-' + a.iconDashicon });
        } else if (builtInIcons[type]) {
            inner = builtInIcons[type];
        } else {
            inner = builtInIcons.star;
        }

        return el('span', {
            className: 'bkbg-fc-icon',
            style: { '--bkbg-fc-icon-size': sz + 'px', '--bkbg-fc-icon-color': col, color: col, fontSize: sz + 'px', width: sz + 'px', height: sz + 'px' },
            'aria-hidden': 'true'
        }, inner);
    }

    // ── Wrap icon with background shape ──────────────────────────────────
    function wrapIconBg(iconEl, a) {
        if (!iconEl) return null;
        var shape  = a.iconBgShape;
        var bgSize = a.iconBgSize;
        var bgCol  = a.iconBgColor;
        var radius = a.iconBgRadius;

        var bgStyle;
        if (shape === 'circle-filled') {
            bgStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: bgSize + 'px', height: bgSize + 'px', borderRadius: '50%', background: bgCol, flexShrink: 0 };
        } else if (shape === 'square-filled') {
            bgStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: bgSize + 'px', height: bgSize + 'px', borderRadius: radius + 'px', background: bgCol, flexShrink: 0 };
        } else if (shape === 'circle-outline') {
            bgStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: bgSize + 'px', height: bgSize + 'px', borderRadius: '50%', border: '2px solid ' + bgCol, flexShrink: 0 };
        } else if (shape === 'square-outline') {
            bgStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: bgSize + 'px', height: bgSize + 'px', borderRadius: radius + 'px', border: '2px solid ' + bgCol, flexShrink: 0 };
        } else {
            bgStyle = { display: 'inline-flex', flexShrink: 0 };
        }

        return el('div', { className: 'bkbg-fc-icon-wrap', style: bgStyle }, iconEl);
    }

    // ── Resolved backgrounds for a face ────────────────────────────────────
    function faceBg(bgColor, bgGradient) {
        if (bgGradient) return { background: bgGradient };
        return { backgroundColor: bgColor };
    }

    // ── Wrapper CSS vars ────────────────────────────────────────────────────
    function buildWrapStyle(a) {
        var shadows = {
            none: 'none',
            sm:   '0 1px 3px rgba(0,0,0,.1), 0 1px 2px rgba(0,0,0,.06)',
            md:   '0 4px 6px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.06)',
            lg:   '0 10px 25px rgba(0,0,0,.1), 0 4px 10px rgba(0,0,0,.06)',
            xl:   '0 20px 40px rgba(0,0,0,.12), 0 8px 20px rgba(0,0,0,.08)'
        };
        return Object.assign({
            '--bkbg-fc-w':       a.cardWidth  + 'px',
            '--bkbg-fc-h':       a.cardHeight + 'px',
            '--bkbg-fc-radius':  a.cardRadius + 'px',
            '--bkbg-fc-speed':   a.flipSpeed  + 'ms',
            '--bkbg-fc-shadow':  shadows[a.cardShadow] || shadows.md
        },
            _tv()(a.typoFrontTitle, '--bkbg-flipc-ft-'),
            _tv()(a.typoFrontSub, '--bkbg-flipc-fs-'),
            _tv()(a.typoBackTitle, '--bkbg-flipc-bt-'),
            _tv()(a.typoBackText, '--bkbg-flipc-bx-'),
            _tv()(a.typoBtn, '--bkbg-flipc-bn-')
        );
    }

    // ── Color picker helper ─────────────────────────────────────────────────
    function makeColorControl(openKey, setOpenKey) {
        return function (key, label, value, onChange) {
            var isOpen = openKey === key;
            return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
                el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
                el('div', { style: { position: 'relative', flexShrink: 0 } },
                    el('button', {
                        type: 'button',
                        title: value || 'none',
                        onClick: function () { setOpenKey(isOpen ? null : key); },
                        style: {
                            width: '28px', height: '28px', borderRadius: '4px',
                            border: isOpen ? '2px solid #007cba' : '2px solid #ddd',
                            cursor: 'pointer', padding: 0, display: 'block',
                            background: value || '#ffffff', flexShrink: 0
                        }
                    }),
                    isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                        el('div', { style: { padding: '8px' }, onMouseDown: function (e) { e.stopPropagation(); } },
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } },
                                el('strong', { style: { fontSize: '12px' } }, label),
                                el(Button, { icon: 'no-alt', isSmall: true, onClick: function () { setOpenKey(null); } })
                            ),
                            el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                        )
                    )
                )
            );
        };
    }

    // ── Section header helper ───────────────────────────────────────────────
    function sectionHeader(text) {
        return el('p', { style: { margin: '8px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888', letterSpacing: '.5px' } }, text);
    }

    // ── Option lists ────────────────────────────────────────────────────────
    var iconTypeOptions = [
                { label: __('Star ★',            'blockenberg'), value: 'star'         },
                { label: __('Checkmark ✓',        'blockenberg'), value: 'check'        },
                { label: __('Check Circle ✓●',    'blockenberg'), value: 'check2'       },
                { label: __('Arrow ›',            'blockenberg'), value: 'arrow'        },
                { label: __('Arrow Right →',      'blockenberg'), value: 'arrow-right'  },
                { label: __('Disc •',             'blockenberg'), value: 'disc'         },
                { label: __('Square ▪',           'blockenberg'), value: 'square'       },
                { label: __('Sparkle ❖',           'blockenberg'), value: 'sparkle'      },
                { label: __('Bolt ⚡',             'blockenberg'), value: 'bolt'         },
                { label: __('Dash —',             'blockenberg'), value: 'dash'         },
                { label: __('Cross ✕',            'blockenberg'), value: 'cross'        },
                { label: __('Heart ♥',            'blockenberg'), value: 'heart'        },
                { label: __('Globe 🌐',           'blockenberg'), value: 'globe'        },
                { label: __('Shield 🛡',          'blockenberg'), value: 'shield'       },
                { label: __('Rocket 🚀',          'blockenberg'), value: 'rocket'       },
                { label: __('Custom Character',  'blockenberg'), value: 'custom-char'  },
                { label: __('Dashicon',          'blockenberg'), value: 'dashicon'     },
                { label: __('Custom Image',      'blockenberg'), value: 'custom-image' },
                { label: __('None (no icon)',     'blockenberg'), value: 'none'         }
            ];
    var iconBgShapeOptions = [
        { label: __('Circle (filled)',  'blockenberg'), value: 'circle-filled'  },
        { label: __('Square (filled)',  'blockenberg'), value: 'square-filled'  },
        { label: __('Circle (outline)', 'blockenberg'), value: 'circle-outline' },
        { label: __('Square (outline)', 'blockenberg'), value: 'square-outline' },
        { label: __('None',             'blockenberg'), value: 'none'           }
    ];

    var flipDirectionOptions = [
        { label: __('Horizontal (left ↔ right)', 'blockenberg'), value: 'horizontal' },
        { label: __('Vertical (top ↕ bottom)',   'blockenberg'), value: 'vertical'   }
    ];

    var flipTriggerOptions = [
        { label: __('Hover',  'blockenberg'), value: 'hover'  },
        { label: __('Click',  'blockenberg'), value: 'click'  }
    ];

    var shadowOptions = [
        { label: __('None',   'blockenberg'), value: 'none' },
        { label: __('Small',  'blockenberg'), value: 'sm'   },
        { label: __('Medium', 'blockenberg'), value: 'md'   },
        { label: __('Large',  'blockenberg'), value: 'lg'   },
        { label: __('XL',     'blockenberg'), value: 'xl'   }
    ];

    var alignOptions = [
        { label: __('Left',   'blockenberg'), value: 'left'   },
        { label: __('Center', 'blockenberg'), value: 'center' },
        { label: __('Right',  'blockenberg'), value: 'right'  }
    ];

    var titleTagOptions = [
        { label: 'h2', value: 'h2' },
        { label: 'h3', value: 'h3' },
        { label: 'h4', value: 'h4' },
        { label: 'h5', value: 'h5' },
        { label: 'p',  value: 'p'  }
    ];

    var fontWeightOptions = [
        { label: '300 — Light',      value: 300 },
        { label: '400 — Regular',    value: 400 },
        { label: '500 — Medium',     value: 500 },
        { label: '600 — Semi-Bold',  value: 600 },
        { label: '700 — Bold',       value: 700 },
        { label: '800 — Extra Bold', value: 800 }
    ];

    var btnSizeOptions = [
        { label: __('Small',  'blockenberg'), value: 'sm' },
        { label: __('Medium', 'blockenberg'), value: 'md' },
        { label: __('Large',  'blockenberg'), value: 'lg' }
    ];

    var btnStyleOptions = [
        { label: __('Solid',   'blockenberg'), value: 'solid'   },
        { label: __('Outline', 'blockenberg'), value: 'outline' },
        { label: __('Ghost',   'blockenberg'), value: 'ghost'   }
    ];

    var subPositionOptions = [
        { label: __('Above title', 'blockenberg'), value: 'above-title' },
        { label: __('Below title', 'blockenberg'), value: 'below-title' }
    ];

    var cardAlignOptions = [
        { label: __('Left',   'blockenberg'), value: 'left'   },
        { label: __('Center', 'blockenberg'), value: 'center' },
        { label: __('Right',  'blockenberg'), value: 'right'  }
    ];

    // ────────────────────────────────────────────────────────────────────────
    registerBlockType('blockenberg/flip-card', {
        title:       __('Flip Card', 'blockenberg'),
        icon:        'image-rotate',
        category:    'bkbg-effects',
        description: __('Card with front and back faces that flips on hover or click.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey      = openColorKeyState[0];
            var setOpenColorKey   = openColorKeyState[1];
            var renderColorControl = makeColorControl(openColorKey, setOpenColorKey);

            // Icon picker state (mirrors icon-box)
            var iconPickerState = useState(false);
            var iconPickerOpen  = iconPickerState[0];
            var setIconPickerOpen = iconPickerState[1];

            var iconSearchState = useState('');
            var iconSearch      = iconSearchState[0];
            var setIconSearch   = iconSearchState[1];

            var dashiconAnchorRef = useRef(null);

            var filteredDashicons = dashicons.filter(function (ic) {
                return !iconSearch || ic.indexOf(iconSearch) !== -1;
            });

            // Which side to preview in editor
            var previewSideState = useState('front');
            var previewSide      = previewSideState[0];
            var setPreviewSide   = previewSideState[1];

            // Unique blockId for JS click targeting
            useEffect(function () {
                if (!a.blockId) {
                    setAttributes({ blockId: 'bkbg-fc-' + Math.random().toString(36).slice(2, 8) });
                }
            }, []);

            function openPhotoLibrary() {
                var frame = wp.media({
                    title: __('Select Icon Image', 'blockenberg'),
                    button: { text: __('Use this image', 'blockenberg') },
                    multiple: false,
                    library: { type: 'image' }
                });
                frame.on('select', function () {
                    var attachment = frame.state().get('selection').first().toJSON();
                    setAttributes({ iconImageUrl: attachment.url });
                });
                frame.open();
            }

            // ── Inspector ─────────────────────────────────────────────────
            var inspector = el(InspectorControls, {},

                // ── Card Settings ─────────────────────────────────────────
                el(PanelBody, { title: __('Card Settings', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Flip Direction', 'blockenberg'),
                        value: a.flipDirection, options: flipDirectionOptions,
                        onChange: function (v) { setAttributes({ flipDirection: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Flip Trigger', 'blockenberg'),
                        value: a.flipTrigger, options: flipTriggerOptions,
                        onChange: function (v) { setAttributes({ flipTrigger: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Flip Speed (ms)', 'blockenberg'),
                        value: a.flipSpeed, min: 100, max: 1200, step: 50,
                        onChange: function (v) { setAttributes({ flipSpeed: v }); }
                    }),
                    el('hr', {}),
                    el(RangeControl, {
                        label: __('Card Width (px)', 'blockenberg'),
                        value: a.cardWidth, min: 160, max: 600,
                        onChange: function (v) { setAttributes({ cardWidth: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Card Height (px)', 'blockenberg'),
                        value: a.cardHeight, min: 120, max: 800,
                        onChange: function (v) { setAttributes({ cardHeight: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: a.cardRadius, min: 0, max: 64,
                        onChange: function (v) { setAttributes({ cardRadius: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Shadow', 'blockenberg'),
                        value: a.cardShadow, options: shadowOptions,
                        onChange: function (v) { setAttributes({ cardShadow: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Card Alignment', 'blockenberg'),
                        value: a.cardAlign, options: cardAlignOptions,
                        onChange: function (v) { setAttributes({ cardAlign: v }); }
                    })
                ),

                // ── Icon ─────────────────────────────────────────────────
                el(PanelBody, { title: __('Icon (Front)', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Icon Type', 'blockenberg'),
                        value: a.iconType, options: iconTypeOptions,
                        onChange: function (v) { setAttributes({ iconType: v }); setIconPickerOpen(false); }
                    }),

                    // Custom character input
                    a.iconType === 'custom-char' && el(TextControl, {
                        label: __('Character / Emoji / Symbol', 'blockenberg'),
                        help: __('Paste any character, emoji, or symbol', 'blockenberg'),
                        value: a.iconChar,
                        onChange: function (v) { setAttributes({ iconChar: v }); }
                    }),

                    // Dashicon picker
                    a.iconType === 'dashicon' && el(Fragment, {},
                        el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' } },
                            el('span', {
                                className: 'dashicons dashicons-' + a.iconDashicon,
                                style: { fontSize: '28px', width: '28px', height: '28px', color: a.iconColor }
                            }),
                            el(Button, {
                                variant: 'secondary', isSmall: true,
                                ref: dashiconAnchorRef,
                                onClick: function () { setIconPickerOpen(!iconPickerOpen); }
                            }, __('Choose Dashicon', 'blockenberg'))
                        ),
                        iconPickerOpen && el(Popover, {
                            position: 'bottom left',
                            placement: 'bottom-start',
                            anchor: dashiconAnchorRef.current,
                            onClose: function () { setIconPickerOpen(false); }
                        },
                            el('div', { className: 'bkbg-sc-icon-picker-modal', style: { padding: '12px', maxWidth: '320px' } },
                                el(TextControl, {
                                    placeholder: __('Search dashicons…', 'blockenberg'),
                                    value: iconSearch,
                                    onChange: function (v) { setIconSearch(v); },
                                    style: { marginBottom: '8px' }
                                }),
                                el('div', { className: 'bkbg-sc-dashicons-grid', style: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', maxHeight: '240px', overflowY: 'auto' } },
                                    filteredDashicons.map(function (ic) {
                                        return el('button', {
                                            key: ic,
                                            title: ic,
                                            style: {
                                                border: '2px solid ' + (ic === a.iconDashicon ? '#007cba' : 'transparent'),
                                                borderRadius: '4px', padding: '4px', cursor: 'pointer',
                                                background: ic === a.iconDashicon ? '#e8f4fd' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            },
                                            onClick: function (e) {
                                                e.preventDefault();
                                                setAttributes({ iconDashicon: ic });
                                                setIconPickerOpen(false);
                                            }
                                        }, el('span', { className: 'dashicons dashicons-' + ic, style: { fontSize: '20px', width: '20px', height: '20px' } }));
                                    })
                                )
                            )
                        )
                    ),

                    // Custom image picker
                    a.iconType === 'custom-image' && el(Fragment, {},
                        a.iconImageUrl && el('img', {
                            src: a.iconImageUrl, alt: '',
                            style: { maxWidth: '100%', maxHeight: '80px', marginBottom: '8px', borderRadius: '4px', display: 'block' }
                        }),
                        el(Button, {
                            variant: 'secondary', isSmall: true,
                            onClick: openPhotoLibrary,
                            style: { marginBottom: '8px' }
                        }, a.iconImageUrl ? __('Replace Image', 'blockenberg') : __('Choose Image', 'blockenberg')),
                        a.iconImageUrl && el(Button, {
                            variant: 'link', isDestructive: true, isSmall: true,
                            onClick: function () { setAttributes({ iconImageUrl: '' }); }
                        }, __('Remove', 'blockenberg'))
                    ),

                    a.iconType !== 'none' && el(Fragment, {},
                        el(RangeControl, {
                            label: __('Icon Size (px)', 'blockenberg'),
                            value: a.iconSize, min: 14, max: 120,
                            onChange: function (v) { setAttributes({ iconSize: v }); }
                        }),
                        a.iconType !== 'custom-image' &&
                            renderColorControl('iconColor', __('Icon Color', 'blockenberg'), a.iconColor, function (c) { setAttributes({ iconColor: c }); }),
                        el(SelectControl, {
                            label: __('Background Shape', 'blockenberg'),
                            value: a.iconBgShape, options: iconBgShapeOptions,
                            onChange: function (v) { setAttributes({ iconBgShape: v }); }
                        }),
                        a.iconBgShape !== 'none' && el(Fragment, {},
                            renderColorControl('iconBgColor', __('Bg Color', 'blockenberg'), a.iconBgColor, function (c) { setAttributes({ iconBgColor: c }); }),
                            el(RangeControl, {
                                label: __('Bg Container Size (px)', 'blockenberg'),
                                value: a.iconBgSize, min: 30, max: 200,
                                onChange: function (v) { setAttributes({ iconBgSize: v }); }
                            }),
                            (a.iconBgShape === 'square-filled' || a.iconBgShape === 'square-outline') &&
                                el(RangeControl, {
                                    label: __('Bg Corner Radius (px)', 'blockenberg'),
                                    value: a.iconBgRadius, min: 0, max: 60,
                                    onChange: function (v) { setAttributes({ iconBgRadius: v }); }
                                })
                        ),
                        el(RangeControl, {
                            label: __('Gap below icon (px)', 'blockenberg'),
                            value: a.iconGapBottom, min: 0, max: 60,
                            onChange: function (v) { setAttributes({ iconGapBottom: v }); }
                        })
                    )
                ),

                // ── Front Face ───────────────────────────────────────────
                el(PanelBody, { title: __('Front Face', 'blockenberg'), initialOpen: false },
                    renderColorControl('frontBgColor', __('Background Color', 'blockenberg'), a.frontBgColor, function (c) { setAttributes({ frontBgColor: c }); }),
                    el('div', { style:{ marginBottom:'12px' } },
                        el('p', { style:{ fontSize:'11px', fontWeight:600, margin:'0 0 6px', textTransform:'uppercase', color:'#757575' } }, __('Background Gradient', 'blockenberg')),
                        el(GradientPicker, { value: a.frontBgGradient, onChange: function (v) { setAttributes({ frontBgGradient: v }); } })
                    ),
                    el(SelectControl, {
                        label: __('Content Alignment', 'blockenberg'),
                        value: a.frontAlign, options: alignOptions,
                        onChange: function (v) { setAttributes({ frontAlign: v }); }
                    }),
                    el(RangeControl, { label: __('Pad Top (px)',    'blockenberg'), value: a.frontPadTop,    min: 0, max: 80, onChange: function (v) { setAttributes({ frontPadTop: v }); } }),
                    el(RangeControl, { label: __('Pad Right (px)',  'blockenberg'), value: a.frontPadRight,  min: 0, max: 80, onChange: function (v) { setAttributes({ frontPadRight: v }); } }),
                    el(RangeControl, { label: __('Pad Bottom (px)', 'blockenberg'), value: a.frontPadBottom, min: 0, max: 80, onChange: function (v) { setAttributes({ frontPadBottom: v }); } }),
                    el(RangeControl, { label: __('Pad Left (px)',   'blockenberg'), value: a.frontPadLeft,   min: 0, max: 80, onChange: function (v) { setAttributes({ frontPadLeft: v }); } }),
                    el('hr', {}),
                    sectionHeader(__('Title', 'blockenberg')),
                    el(SelectControl, { label: __('Tag', 'blockenberg'), value: a.frontTitleTag, options: titleTagOptions, onChange: function (v) { setAttributes({ frontTitleTag: v }); } }),
                    renderColorControl('frontTitleColor', __('Color', 'blockenberg'), a.frontTitleColor, function (c) { setAttributes({ frontTitleColor: c }); }),
                    el('hr', {}),
                    el(ToggleControl, {
                        label: __('Show Subtitle / Tag', 'blockenberg'), checked: a.showFrontSub,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showFrontSub: v }); }
                    }),
                    a.showFrontSub && el(Fragment, {},
                        el(SelectControl, { label: __('Position', 'blockenberg'), value: a.frontSubPosition, options: subPositionOptions, onChange: function (v) { setAttributes({ frontSubPosition: v }); } }),
                        renderColorControl('frontSubColor', __('Color', 'blockenberg'), a.frontSubColor, function (c) { setAttributes({ frontSubColor: c }); }),
                        el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: a.frontSubSpacing, min: 0, max: 40, onChange: function (v) { setAttributes({ frontSubSpacing: v }); } })
                    ),
                    el('hr', {}),
                    el(ToggleControl, {
                        label: __('Show flip hint text', 'blockenberg'), checked: a.showFlipHint,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showFlipHint: v }); }
                    }),
                    a.showFlipHint && el(Fragment, {},
                        el(TextControl, {
                            label: __('Hint Text', 'blockenberg'),
                            value: a.flipHintText,
                            placeholder: a.flipTrigger === 'hover'
                                ? __('↻ hover to flip', 'blockenberg')
                                : __('↻ click to flip', 'blockenberg'),
                            onChange: function (v) { setAttributes({ flipHintText: v }); }
                        }),
                        renderColorControl('flipHintColor', __('Hint Color', 'blockenberg'), a.flipHintColor, function (c) { setAttributes({ flipHintColor: c }); }),
                        el(RangeControl, { label: __('Hint Size (px)', 'blockenberg'), value: a.flipHintSize, min: 9, max: 16, onChange: function (v) { setAttributes({ flipHintSize: v }); } })
                    )
                ),

                // ── Back Face ────────────────────────────────────────────
                el(PanelBody, { title: __('Back Face', 'blockenberg'), initialOpen: false },
                    renderColorControl('backBgColor', __('Background Color', 'blockenberg'), a.backBgColor, function (c) { setAttributes({ backBgColor: c }); }),
                    el('div', { style:{ marginBottom:'12px' } },
                        el('p', { style:{ fontSize:'11px', fontWeight:600, margin:'0 0 6px', textTransform:'uppercase', color:'#757575' } }, __('Background Gradient', 'blockenberg')),
                        el(GradientPicker, { value: a.backBgGradient, onChange: function (v) { setAttributes({ backBgGradient: v }); } })
                    ),
                    el(SelectControl, {
                        label: __('Content Alignment', 'blockenberg'),
                        value: a.backAlign, options: alignOptions,
                        onChange: function (v) { setAttributes({ backAlign: v }); }
                    }),
                    el(RangeControl, { label: __('Pad Top (px)',    'blockenberg'), value: a.backPadTop,    min: 0, max: 80, onChange: function (v) { setAttributes({ backPadTop: v }); } }),
                    el(RangeControl, { label: __('Pad Right (px)',  'blockenberg'), value: a.backPadRight,  min: 0, max: 80, onChange: function (v) { setAttributes({ backPadRight: v }); } }),
                    el(RangeControl, { label: __('Pad Bottom (px)', 'blockenberg'), value: a.backPadBottom, min: 0, max: 80, onChange: function (v) { setAttributes({ backPadBottom: v }); } }),
                    el(RangeControl, { label: __('Pad Left (px)',   'blockenberg'), value: a.backPadLeft,   min: 0, max: 80, onChange: function (v) { setAttributes({ backPadLeft: v }); } }),
                    el('hr', {}),
                    el(ToggleControl, {
                        label: __('Show Back Title', 'blockenberg'), checked: a.showBackTitle,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showBackTitle: v }); }
                    }),
                    a.showBackTitle && el(Fragment, {},
                        sectionHeader(__('Back Title', 'blockenberg')),
                        el(SelectControl, { label: __('Tag', 'blockenberg'), value: a.backTitleTag, options: titleTagOptions, onChange: function (v) { setAttributes({ backTitleTag: v }); } }),
                        renderColorControl('backTitleColor', __('Color', 'blockenberg'), a.backTitleColor, function (c) { setAttributes({ backTitleColor: c }); }),
                        el(RangeControl, { label: __('Bottom Spacing (px)', 'blockenberg'), value: a.backTitleSpacing, min: 0, max: 60, onChange: function (v) { setAttributes({ backTitleSpacing: v }); } })
                    ),
                    el('hr', {}),
                    sectionHeader(__('Body Text', 'blockenberg')),
                    renderColorControl('backTextColor', __('Color', 'blockenberg'), a.backTextColor, function (c) { setAttributes({ backTextColor: c }); }),
                    el(RangeControl, { label: __('Bottom Spacing (px)', 'blockenberg'), value: a.backTextSpacing, min: 0, max: 60, onChange: function (v) { setAttributes({ backTextSpacing: v }); } })
                ),

                // ── Button ───────────────────────────────────────────────
                el(PanelBody, { title: __('Button (Back)', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Button', 'blockenberg'), checked: a.showButton,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showButton: v }); }
                    }),
                    a.showButton && el(Fragment, {},
                        el(TextControl, { label: __('Label', 'blockenberg'), value: a.btnLabel, onChange: function (v) { setAttributes({ btnLabel: v }); } }),
                        el(TextControl, { label: __('URL', 'blockenberg'), value: a.btnUrl, onChange: function (v) { setAttributes({ btnUrl: v }); } }),
                        el(SelectControl, {
                            label: __('Open in', 'blockenberg'),
                            value: a.btnTarget,
                            options: [
                                { label: __('Same tab', 'blockenberg'), value: '_self'  },
                                { label: __('New tab',  'blockenberg'), value: '_blank' }
                            ],
                            onChange: function (v) { setAttributes({ btnTarget: v }); }
                        }),
                        el(SelectControl, { label: __('Style', 'blockenberg'), value: a.btnStyle, options: btnStyleOptions, onChange: function (v) { setAttributes({ btnStyle: v }); } }),
                        el(SelectControl, { label: __('Size',  'blockenberg'), value: a.btnSize,  options: btnSizeOptions,  onChange: function (v) { setAttributes({ btnSize: v }); } }),
                        renderColorControl('btnBgColor',     __('Background',  'blockenberg'), a.btnBgColor,     function (c) { setAttributes({ btnBgColor: c }); }),
                        renderColorControl('btnTextColor',   __('Text Color',  'blockenberg'), a.btnTextColor,   function (c) { setAttributes({ btnTextColor: c }); }),
                        renderColorControl('btnBorderColor', __('Border Color','blockenberg'), a.btnBorderColor, function (c) { setAttributes({ btnBorderColor: c }); }),
                        el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: a.btnRadius, min: 0, max: 50, onChange: function (v) { setAttributes({ btnRadius: v }); } })
                    )
                ),

                // ── Typography ───────────────────────────────────────────────
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc()({ label: __('Front Title', 'blockenberg'), value: a.typoFrontTitle, onChange: function (v) { setAttributes({ typoFrontTitle: v }); } }),
                    _tc()({ label: __('Front Subtitle', 'blockenberg'), value: a.typoFrontSub, onChange: function (v) { setAttributes({ typoFrontSub: v }); } }),
                    _tc()({ label: __('Back Title', 'blockenberg'), value: a.typoBackTitle, onChange: function (v) { setAttributes({ typoBackTitle: v }); } }),
                    _tc()({ label: __('Back Body Text', 'blockenberg'), value: a.typoBackText, onChange: function (v) { setAttributes({ typoBackText: v }); } }),
                    _tc()({ label: __('Button', 'blockenberg'), value: a.typoBtn, onChange: function (v) { setAttributes({ typoBtn: v }); } })
                )
            );

            // ── Build faces ───────────────────────────────────────────────
            var iconEl = wrapIconBg(buildIconEl(a), a);

            var frontSubEl = a.showFrontSub
                ? el(RichText, {
                    tagName: 'p', className: 'bkbg-fc-sub',
                    value: a.frontSub, placeholder: __('Subtitle or tag…', 'blockenberg'),
                    onChange: function (v) { setAttributes({ frontSub: v }); },
                    style: {
                        color: a.frontSubColor,
                        margin: 0, padding: 0,
                        marginTop: a.frontSubPosition === 'below-title' ? a.frontSubSpacing + 'px' : 0,
                        marginBottom: a.frontSubPosition === 'above-title' ? a.frontSubSpacing + 'px' : 0
                    },
                    allowedFormats: ['core/bold', 'core/italic', 'core/text-color']
                  })
                : null;

            var frontTitleEl = el(RichText, {
                tagName: a.frontTitleTag, className: 'bkbg-fc-front-title',
                value: a.frontTitle, placeholder: __('Front title…', 'blockenberg'),
                onChange: function (v) { setAttributes({ frontTitle: v }); },
                style: {
                    color: a.frontTitleColor,
                    margin: 0, padding: 0
                },
                allowedFormats: ['core/bold', 'core/italic', 'core/text-color']
            });

                        var hintText = a.flipHintText || (a.flipTrigger === 'hover'
                                ? __('↻ hover to flip', 'blockenberg')
                                : __('↻ click to flip', 'blockenberg'));

                        var hintEl = a.showFlipHint
                                ? el('p', {
                                        className: 'bkbg-fc-hint',
                                        style: { margin: '0', padding: '0', fontSize: a.flipHintSize + 'px', color: a.flipHintColor, marginTop: 'auto', paddingTop: '12px' }
                                    }, hintText)
                                : null;

            // Editor faces: plain flex divs — no 3D transforms, no position:absolute, no backface-visibility
            var editorFaceStyle = function (padT,padR,padB,padL, align, bg, grad, radius) {
                return Object.assign({
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    width: '100%', height: '100%', boxSizing: 'border-box',
                    padding: padT + 'px ' + padR + 'px ' + padB + 'px ' + padL + 'px',
                    textAlign: align,
                    alignItems: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
                    borderRadius: radius + 'px',
                    overflow: 'hidden'
                }, faceBg(bg, grad));
            };

            var frontFace = el('div', {
                style: editorFaceStyle(a.frontPadTop,a.frontPadRight,a.frontPadBottom,a.frontPadLeft, a.frontAlign, a.frontBgColor, a.frontBgGradient, a.cardRadius)
            },
                a.iconType !== 'none' && el('div', { style: { marginBottom: a.iconGapBottom + 'px', display: 'flex', justifyContent: a.frontAlign === 'left' ? 'flex-start' : a.frontAlign === 'right' ? 'flex-end' : 'center' } }, iconEl),
                a.showFrontSub && a.frontSubPosition === 'above-title' && frontSubEl,
                frontTitleEl,
                a.showFrontSub && a.frontSubPosition === 'below-title' && frontSubEl,
                hintEl
            );

            var backTitleEl = a.showBackTitle
                ? el(RichText, {
                    tagName: a.backTitleTag, className: 'bkbg-fc-back-title',
                    value: a.backTitle, placeholder: __('Back title…', 'blockenberg'),
                    onChange: function (v) { setAttributes({ backTitle: v }); },
                    style: {
                        color: a.backTitleColor,
                        margin: 0, padding: 0, marginBottom: a.backTitleSpacing + 'px'
                    },
                    allowedFormats: ['core/bold', 'core/italic', 'core/text-color']
                  })
                : null;

            var backTextEl = el(RichText, {
                tagName: 'p', className: 'bkbg-fc-back-text',
                value: a.backText, placeholder: __('Back body text…', 'blockenberg'),
                onChange: function (v) { setAttributes({ backText: v }); },
                style: {
                    color: a.backTextColor,
                    margin: 0, padding: 0, marginBottom: a.showButton ? a.backTextSpacing + 'px' : 0
                },
                allowedFormats: ['core/bold', 'core/italic', 'core/text-color', 'core/link']
            });

            var btnPads = { sm: '6px 14px', md: '10px 22px', lg: '14px 28px' };
            var btnStyle = {
                display: 'inline-block',
                padding: btnPads[a.btnSize] || btnPads.md,
                borderRadius: a.btnRadius + 'px',
                textDecoration: 'none',
                cursor: 'pointer'
            };
            if (a.btnStyle === 'solid') {
                btnStyle.background = a.btnBgColor;
                btnStyle.color = a.btnTextColor;
                btnStyle.border = '2px solid ' + (a.btnBorderColor || a.btnBgColor);
            } else if (a.btnStyle === 'outline') {
                btnStyle.background = 'transparent';
                btnStyle.color = a.btnTextColor;
                btnStyle.border = '2px solid ' + a.btnBorderColor;
            } else {
                btnStyle.background = 'transparent';
                btnStyle.color = a.btnTextColor;
                btnStyle.border = '2px solid transparent';
            }

            var buttonEl = a.showButton
                ? el('a', {
                    href: '#', className: 'bkbg-fc-btn',
                    style: btnStyle,
                    onClick: function (e) { e.preventDefault(); }
                  }, a.btnLabel)
                : null;

            var backFace = el('div', {
                style: editorFaceStyle(a.backPadTop,a.backPadRight,a.backPadBottom,a.backPadLeft, a.backAlign, a.backBgColor, a.backBgGradient, a.cardRadius)
            },
                backTitleEl,
                backTextEl,
                buttonEl
            );

            // Preview toggle
            var previewToggle = el('div', {
                style: {
                    display: 'flex', gap: '6px', marginBottom: '8px',
                    justifyContent: a.cardAlign === 'center' ? 'center' : a.cardAlign === 'right' ? 'flex-end' : 'flex-start'
                }
            },
                el('button', {
                    type: 'button',
                    onClick: function () { setPreviewSide('front'); },
                    style: {
                        padding: '3px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600,
                        background: previewSide === 'front' ? '#007cba' : '#f0f0f0',
                        color: previewSide === 'front' ? '#fff' : '#555',
                        border: 'none'
                    }
                }, __('Front', 'blockenberg')),
                el('button', {
                    type: 'button',
                    onClick: function () { setPreviewSide('back'); },
                    style: {
                        padding: '3px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600,
                        background: previewSide === 'back' ? '#007cba' : '#f0f0f0',
                        color: previewSide === 'back' ? '#fff' : '#555',
                        border: 'none'
                    }
                }, __('Back', 'blockenberg'))
            );

            var alignStyle = { display: 'flex', flexDirection: 'column' };
            if (a.cardAlign === 'center') alignStyle.alignItems = 'center';
            else if (a.cardAlign === 'right') alignStyle.alignItems = 'flex-end';
            else alignStyle.alignItems = 'flex-start';

            var blockProps = useBlockProps({ className: 'bkbg-editor-wrap', 'data-block-label': 'Flip Card' });

            return el('div', blockProps,
                inspector,
                el('div', { style: alignStyle },
                    previewToggle,
                    el('div', {
                        className: 'bkbg-fc-outer',
                        style: Object.assign(buildWrapStyle(a), {
                            width: a.cardWidth + 'px',
                            height: a.cardHeight + 'px',
                            borderRadius: a.cardRadius + 'px',
                            boxShadow: buildWrapStyle(a)['--bkbg-fc-shadow'] || 'none',
                            overflow: 'hidden',
                            flexShrink: 0,
                            display: 'block'
                        })
                    },
                        previewSide === 'front' ? frontFace : backFace
                    )
                )
            );
        },

        // ── Save ────────────────────────────────────────────────────────────────
        save: function (props) {
            var a = props.attributes;
            var RichTextContent = wp.blockEditor.RichText.Content;

            var iconElSave = wrapIconBg(buildIconEl(a), a);

            var frontSubEl = a.showFrontSub
                ? el(RichTextContent, {
                    tagName: 'p', className: 'bkbg-fc-sub',
                    value: a.frontSub,
                    style: {
                        color: a.frontSubColor, margin: 0, padding: 0,
                        marginTop: a.frontSubPosition === 'below-title' ? a.frontSubSpacing + 'px' : 0,
                        marginBottom: a.frontSubPosition === 'above-title' ? a.frontSubSpacing + 'px' : 0
                    }
                  })
                : null;

            var frontTitleEl = el(RichTextContent, {
                tagName: a.frontTitleTag, className: 'bkbg-fc-front-title',
                value: a.frontTitle,
                style: {
                    color: a.frontTitleColor,
                    margin: 0, padding: 0
                }
            });

                        var hintText = a.flipHintText || (a.flipTrigger === 'hover'
                                ? __('↻ hover to flip', 'blockenberg')
                                : __('↻ click to flip', 'blockenberg'));

                        var hintEl = a.showFlipHint
                                ? el('p', {
                                        className: 'bkbg-fc-hint',
                                        style: { margin: 0, padding: 0, paddingTop: '12px', fontSize: a.flipHintSize + 'px', color: a.flipHintColor, marginTop: 'auto' }
                                    }, hintText)
                                : null;

            var frontFace = el('div', {
                className: 'bkbg-fc-face bkbg-fc-front',
                style: Object.assign({
                    padding: a.frontPadTop + 'px ' + a.frontPadRight + 'px ' + a.frontPadBottom + 'px ' + a.frontPadLeft + 'px',
                    textAlign: a.frontAlign,
                    alignItems: a.frontAlign === 'left' ? 'flex-start' : a.frontAlign === 'right' ? 'flex-end' : 'center',
                    borderRadius: 'var(--bkbg-fc-radius)'
                }, faceBg(a.frontBgColor, a.frontBgGradient))
            },
                a.iconType !== 'none' && el('div', { className: 'bkbg-fc-icon-wrap', style: { marginBottom: a.iconGapBottom + 'px', display: 'flex', justifyContent: a.frontAlign === 'left' ? 'flex-start' : a.frontAlign === 'right' ? 'flex-end' : 'center' } }, iconElSave),
                a.showFrontSub && a.frontSubPosition === 'above-title' && frontSubEl,
                frontTitleEl,
                a.showFrontSub && a.frontSubPosition === 'below-title' && frontSubEl,
                hintEl
            );

            var backTitleEl = a.showBackTitle
                ? el(RichTextContent, {
                    tagName: a.backTitleTag, className: 'bkbg-fc-back-title',
                    value: a.backTitle,
                    style: {
                        color: a.backTitleColor,
                        margin: 0, padding: 0, marginBottom: a.backTitleSpacing + 'px'
                    }
                  })
                : null;

            var backTextEl = el(RichTextContent, {
                tagName: 'p', className: 'bkbg-fc-back-text',
                value: a.backText,
                style: {
                    color: a.backTextColor,
                    margin: 0, padding: 0, marginBottom: a.showButton ? a.backTextSpacing + 'px' : 0
                }
            });

            var btnPads = { sm: '6px 14px', md: '10px 22px', lg: '14px 28px' };
            var btnStyleObj = {
                display: 'inline-block',
                padding: btnPads[a.btnSize] || btnPads.md,
                borderRadius: a.btnRadius + 'px', textDecoration: 'none'
            };
            if (a.btnStyle === 'solid') {
                btnStyleObj.background = a.btnBgColor;
                btnStyleObj.color = a.btnTextColor;
                btnStyleObj.border = '2px solid ' + (a.btnBorderColor || a.btnBgColor);
            } else if (a.btnStyle === 'outline') {
                btnStyleObj.background = 'transparent';
                btnStyleObj.color = a.btnTextColor;
                btnStyleObj.border = '2px solid ' + a.btnBorderColor;
            } else {
                btnStyleObj.background = 'transparent';
                btnStyleObj.color = a.btnTextColor;
                btnStyleObj.border = '2px solid transparent';
            }

            var buttonEl = a.showButton
                ? el('a', {
                    href: a.btnUrl, className: 'bkbg-fc-btn',
                    target: a.btnTarget,
                    rel: a.btnTarget === '_blank' ? 'noopener noreferrer' : undefined,
                    style: btnStyleObj
                  }, a.btnLabel)
                : null;

            var backFace = el('div', {
                className: 'bkbg-fc-face bkbg-fc-back',
                style: Object.assign({
                    padding: a.backPadTop + 'px ' + a.backPadRight + 'px ' + a.backPadBottom + 'px ' + a.backPadLeft + 'px',
                    textAlign: a.backAlign,
                    alignItems: a.backAlign === 'left' ? 'flex-start' : a.backAlign === 'right' ? 'flex-end' : 'center',
                    borderRadius: 'var(--bkbg-fc-radius)'
                }, faceBg(a.backBgColor, a.backBgGradient))
            },
                backTitleEl,
                backTextEl,
                buttonEl
            );

            var alignJustify = { left: 'flex-start', center: 'center', right: 'flex-end' };

            return el('div', {
                className: 'bkbg-fc-scene',
                style: {
                    display: 'flex',
                    justifyContent: alignJustify[a.cardAlign] || 'center'
                }
            },
                el('div', Object.assign(
                    { className: 'bkbg-fc-outer', style: buildWrapStyle(a) },
                    {
                        'data-flip-dir':     a.flipDirection,
                        'data-flip-trigger': a.flipTrigger,
                        'data-block-id':     a.blockId,
                        tabIndex: a.flipTrigger === 'click' ? 0 : undefined,
                        role: a.flipTrigger === 'click' ? 'button' : undefined,
                        'aria-label': a.flipTrigger === 'click' ? __('Flip card', 'blockenberg') : undefined
                    }
                ),
                    el('div', { className: 'bkbg-fc-inner' },
                        frontFace,
                        backFace
                    )
                )
            );
        }
    });
}() );
