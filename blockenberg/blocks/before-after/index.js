( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var useMemo = wp.element.useMemo;

    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var BlockControls = wp.blockEditor.BlockControls;
    var useBlockProps = wp.blockEditor.useBlockProps;

    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var ToolbarGroup = wp.components.ToolbarGroup;
    var ToolbarButton = wp.components.ToolbarButton;
    var Popover = wp.components.Popover;
    var ColorPicker = wp.components.ColorPicker;
    var TabPanel = wp.components.TabPanel;

    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
    }

    // Full Dashicons list (300+ icons)
    var dashicons = [
        // Admin Menu
        'menu', 'admin-site', 'admin-site-alt', 'admin-site-alt2', 'admin-site-alt3', 'dashboard',
        'admin-post', 'admin-media', 'admin-links', 'admin-page', 'admin-comments',
        'admin-appearance', 'admin-plugins', 'admin-users', 'admin-tools', 'admin-settings',
        'admin-network', 'admin-home', 'admin-generic', 'admin-collapse', 'filter',
        'admin-customizer', 'admin-multisite',
        // Welcome Screen
        'welcome-write-blog', 'welcome-add-page', 'welcome-view-site', 'welcome-widgets-menus',
        'welcome-comments', 'welcome-learn-more',
        // Post Formats
        'format-aside', 'format-image', 'format-gallery', 'format-video', 'format-status',
        'format-quote', 'format-chat', 'format-audio',
        // Media
        'camera', 'camera-alt', 'images-alt', 'images-alt2', 'video-alt', 'video-alt2',
        'video-alt3', 'media-archive', 'media-audio', 'media-code', 'media-default',
        'media-document', 'media-interactive', 'media-spreadsheet', 'media-text',
        'media-video', 'playlist-audio', 'playlist-video', 'controls-play',
        'controls-pause', 'controls-forward', 'controls-skipforward', 'controls-back',
        'controls-skipback', 'controls-repeat', 'controls-volumeon', 'controls-volumeoff',
        // Image Editing
        'image-crop', 'image-rotate', 'image-rotate-left', 'image-rotate-right',
        'image-flip-vertical', 'image-flip-horizontal', 'image-filter',
        // Sorting & Misc UI
        'align-left', 'align-right', 'align-center', 'align-none', 'align-pull-left', 'align-pull-right',
        'align-full-width', 'align-wide',
        'lock', 'unlock', 'calendar', 'calendar-alt', 'visibility', 'hidden',
        'post-status', 'edit', 'trash', 'sticky',
        // Arrows & Navigation
        'arrow-up', 'arrow-down', 'arrow-right', 'arrow-left',
        'arrow-up-alt', 'arrow-down-alt', 'arrow-right-alt', 'arrow-left-alt',
        'arrow-up-alt2', 'arrow-down-alt2', 'arrow-right-alt2', 'arrow-left-alt2',
        'sort', 'leftright', 'randomize', 'list-view', 'excerpt-view', 'grid-view',
        'move', 'undo', 'redo',
        // Social & Sharing
        'share', 'share-alt', 'share-alt2', 'rss', 'email', 'email-alt', 'email-alt2',
        'networking', 'amazon', 'facebook', 'facebook-alt', 'google',
        'twitter', 'twitter-alt', 'instagram', 'linkedin', 'pinterest', 'podio',
        'reddit', 'spotify', 'twitch', 'whatsapp', 'xing', 'youtube',
        // WordPress.org Specific
        'hammer', 'art', 'migrate', 'performance', 'universal-access',
        'universal-access-alt', 'tickets', 'nametag', 'clipboard', 'heart', 'megaphone',
        'schedule', 'tide', 'rest-api', 'code-standards',
        // BuddyPress
        'buddicons-activity', 'buddicons-bbpress-logo', 'buddicons-buddypress-logo',
        'buddicons-community', 'buddicons-forums', 'buddicons-friends',
        'buddicons-groups', 'buddicons-pm', 'buddicons-replies',
        'buddicons-topics', 'buddicons-tracking',
        // WordPress Core
        'wordpress', 'wordpress-alt', 'pressthis', 'update', 'update-alt',
        'screenoptions', 'info', 'cart', 'feedback', 'cloud', 'cloud-saved',
        'cloud-upload', 'translation', 'tag', 'category', 'archive',
        // Status & Alerts
        'yes', 'yes-alt', 'no', 'no-alt', 'plus', 'plus-alt', 'plus-alt2',
        'minus', 'dismiss', 'marker', 'star-filled', 'star-half', 'star-empty',
        'flag', 'warning', 'thumbs-up', 'thumbs-down', 'smiley',
        // Location & Places
        'location', 'location-alt', 'vault', 'shield', 'shield-alt',
        'sos', 'search', 'slides', 'text-page', 'analytics', 'chart-pie',
        'chart-bar', 'chart-line', 'chart-area', 'groups', 'businessman', 'businesswoman',
        'businessperson', 'id', 'id-alt', 'products', 'awards', 'forms', 'testimonial',
        'portfolio', 'book', 'book-alt', 'download', 'upload', 'backup',
        'clock', 'lightbulb', 'microphone', 'desktop', 'laptop', 'tablet',
        'smartphone', 'phone', 'index-card', 'carrot', 'building', 'store',
        'album', 'palmtree', 'tickets-alt', 'money', 'money-alt', 'bank',
        // Misc Objects
        'layout', 'paperclip', 'color-picker', 'edit-large', 'edit-page',
        'airplane', 'beer', 'bell', 'bitcoin', 'calculator', 'car', 'coffee',
        'database', 'database-add', 'database-export', 'database-import',
        'database-remove', 'database-view', 'drumstick', 'ellipsis', 'exit',
        'food', 'fullscreen-alt', 'fullscreen-exit-alt', 'games', 'hourglass',
        'html', 'insert', 'insert-after', 'insert-before', 'open-folder',
        'pdf', 'pets', 'plugins-checked', 'printer', 'privacy', 'remove',
        'saved', 'shortcode', 'superhero', 'superhero-alt', 'text', 'external',
        // Table Operations
        'table-col-after', 'table-col-before', 'table-col-delete',
        'table-row-after', 'table-row-before', 'table-row-delete',
        // Editor Controls
        'editor-aligncenter', 'editor-alignleft', 'editor-alignright', 'editor-bold',
        'editor-break', 'editor-code', 'editor-contract', 'editor-customchar',
        'editor-expand', 'editor-help', 'editor-indent', 'editor-insertmore',
        'editor-italic', 'editor-justify', 'editor-kitchensink', 'editor-ltr',
        'editor-ol', 'editor-ol-rtl', 'editor-outdent', 'editor-paragraph',
        'editor-paste-text', 'editor-paste-word', 'editor-quote', 'editor-removeformatting',
        'editor-rtl', 'editor-spellcheck', 'editor-strikethrough', 'editor-table',
        'editor-textcolor', 'editor-ul', 'editor-underline', 'editor-unlink', 'editor-video'
    ];

    function parseIcon(iconValue) {
        if (!iconValue) return { type: 'dashicon', value: 'leftright' };
        if (typeof iconValue === 'string') return { type: 'dashicon', value: iconValue };
        return iconValue;
    }

    function clamp(n, min, max) {
        n = parseFloat(n);
        if (isNaN(n)) n = min;
        return Math.max(min, Math.min(max, n));
    }

    function colorToRgbaString(color) {
        if (!color || !color.rgb) return '';
        var a = (typeof color.rgb.a === 'number') ? color.rgb.a : 1;
        return 'rgba(' + color.rgb.r + ',' + color.rgb.g + ',' + color.rgb.b + ',' + a + ')';
    }

    function openMedia(onSelect) {
        if (!wp || !wp.media) return;
        var frame = wp.media({
            title: __('Select Image', 'blockenberg'),
            button: { text: __('Use image', 'blockenberg') },
            multiple: false,
            library: { type: 'image' }
        });
        frame.on('select', function () {
            var attachment = frame.state().get('selection').first().toJSON();
            onSelect(attachment);
        });
        frame.open();
    }

    function normalizeImage(att) {
        return {
            id: att && att.id ? att.id : 0,
            url: att && att.url ? att.url : '',
            alt: att && att.alt ? att.alt : ''
        };
    }

    registerBlockType('blockenberg/before-after', {
        title: __('Before/After Slider', 'blockenberg'),
        icon: 'image-flip-horizontal',
        category: 'bkbg-media',
        description: __('Compare two images with a draggable slider handle.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var TC = getTypographyControl();
            var isSelected = props.isSelected;

            var dragState = useState(null);
            var dragging = dragState[0];
            var setDragging = dragState[1];

            var colorPopoverState = useState(null);
            var openColor = colorPopoverState[0];
            var setOpenColor = colorPopoverState[1];

            // Handle icon picker popover
            var iconPickerState = useState(false);
            var openHandleIconPicker = iconPickerState[0];
            var setOpenHandleIconPicker = iconPickerState[1];

            // Dashicon search
            var searchState = useState('');
            var iconSearch = searchState[0];
            var setIconSearch = searchState[1];

            var filteredDashicons = useMemo(function () {
                if (!iconSearch) return dashicons;
                var s = iconSearch.toLowerCase();
                return dashicons.filter(function (name) {
                    return name.toLowerCase().includes(s);
                });
            }, [iconSearch]);

            function setBeforeImage(att) {
                setAttributes({ beforeImage: normalizeImage(att) });
            }

            function setAfterImage(att) {
                setAttributes({ afterImage: normalizeImage(att) });
            }

            function swapImages() {
                setAttributes({ beforeImage: a.afterImage, afterImage: a.beforeImage });
            }

            function setPos(next) {
                setAttributes({ startPosition: clamp(next, 0, 100) });
            }

            function posFromEvent(e, containerEl) {
                if (!containerEl) return a.startPosition;

                var rect = containerEl.getBoundingClientRect();
                var clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
                var clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;

                if (a.orientation === 'vertical') {
                    var y = clientY - rect.top;
                    return clamp((y / rect.height) * 100, 0, 100);
                }

                var x = clientX - rect.left;
                return clamp((x / rect.width) * 100, 0, 100);
            }

            function beginDrag(e) {
                // Don't hijack clicks on controls (e.g., the Select buttons in empty states)
                if (e && e.target && e.target.closest) {
                    if (e.target.closest('button, a, input, textarea, select, .components-button')) {
                        return false;
                    }
                }
                e.preventDefault();
                setDragging(true);
                return true;
            }

            function onMove(e, containerEl) {
                if (!dragging) return;
                e.preventDefault();
                setPos(posFromEvent(e, containerEl));
            }

            function endDrag() {
                setDragging(false);
            }

            var layoutClass = 'bkbg-ba-wrap bkbg-editor-wrap';
            if (isSelected) layoutClass += ' bkbg-block-selected';
            layoutClass += a.orientation === 'vertical' ? ' is-vertical' : ' is-horizontal';
            layoutClass += a.shadow ? ' has-shadow' : '';
            if (a.handleHoverAnim) {
                layoutClass += ' has-handle-anim';
                layoutClass += a.handleHoverAnimType ? (' is-handle-anim-' + a.handleHoverAnimType) : ' is-handle-anim-pulse';
            }
            if (a.handleHoverScale) {
                layoutClass += ' has-handle-hover';
            }

            var _tv = getTypoCssVars();
            var styleVars = {
                '--bkbg-ba-pos': a.startPosition + '%',
                '--bkbg-ba-radius': a.borderRadius + 'px',
                '--bkbg-ba-handle-size': a.handleSize + 'px',
                '--bkbg-ba-handle-icon-size': (a.handleIconSize || 18) + 'px',
                '--bkbg-ba-handle-anim-dur': (a.handleHoverAnimDuration || 650) + 'ms',
                '--bkbg-ba-handle-hover-scale': (a.handleHoverScaleAmount || 1.08),
                '--bkbg-ba-handle-bg': a.handleBg,
                '--bkbg-ba-handle-color': a.handleColor,
                '--bkbg-ba-line-color': a.lineColor,
                '--bkbg-ba-line-width': a.lineWidth + 'px',
                '--bkbg-ba-label-bg': a.labelBg,
                '--bkbg-ba-label-color': a.labelColor,
                '--bkbg-ba-label-radius': a.labelRadius + 'px',
                '--bkbg-ba-min-height': a.minHeight + 'px'
            };
            Object.assign(styleVars, _tv(a.labelTypo || {}, '--bkbg-ba-label-'));

            function renderHandleIcon() {
                var icon = parseIcon(a.handleIcon);
                if (!icon || icon.type === 'none') return null;
                if (icon.type === 'custom') {
                    return el('img', { className: 'bkbg-ba-handle-img', src: icon.value, alt: '' });
                }
                return el('span', { className: 'dashicons dashicons-' + icon.value + ' bkbg-ba-handle-icon' });
            }

            function renderHandleIconWrapped() {
                return el('span', { className: 'bkbg-ba-handle-surface' },
                    el('span', { className: 'bkbg-ba-handle-anim' },
                        el('span', { className: 'bkbg-ba-handle-hover' },
                            renderHandleIcon()
                        )
                    )
                );
            }

            function renderHandleIconPicker(position) {
                var currentIcon = parseIcon(a.handleIcon);

                var stop = function (e) {
                    if (e && e.stopPropagation) e.stopPropagation();
                };

                var openMediaLibrary = function () {
                    var frame = wp.media({
                        title: __('Select Icon Image', 'blockenberg'),
                        button: { text: __('Use as Icon', 'blockenberg') },
                        multiple: false,
                        library: { type: 'image' }
                    });
                    frame.on('select', function () {
                        var attachment = frame.state().get('selection').first().toJSON();
                        setAttributes({ handleIcon: { type: 'custom', value: attachment.url } });
                        setOpenHandleIconPicker(false);
                    });
                    frame.open();
                };

                return el(Popover, {
                    position: position || 'bottom center',
                    className: 'bkbg-ba-icon-popover',
                    onClose: function () {
                        setOpenHandleIconPicker(false);
                        setIconSearch('');
                    }
                },
                    el('div', { className: 'bkbg-ba-icon-picker-modal', onMouseDown: stop, onClick: stop },
                        el('div', { className: 'bkbg-ba-icon-picker-header' },
                            el('h3', {}, __('Choose Handle Icon', 'blockenberg')),
                            el(Button, {
                                icon: 'no-alt',
                                onClick: function () {
                                    setOpenHandleIconPicker(false);
                                    setIconSearch('');
                                },
                                className: 'bkbg-ba-icon-picker-close'
                            })
                        ),
                        el(TabPanel, {
                            className: 'bkbg-ba-icon-tabs',
                            activeClass: 'is-active',
                            tabs: [
                                { name: 'dashicons', title: __('Dashicons', 'blockenberg'), className: 'bkbg-ba-tab-dashicons' },
                                { name: 'media', title: __('Media Library', 'blockenberg'), className: 'bkbg-ba-tab-media' }
                            ]
                        }, function (tab) {
                            if (tab.name === 'dashicons') {
                                return el('div', { className: 'bkbg-ba-dashicons-panel' },
                                    el('div', { className: 'bkbg-ba-icon-actions' },
                                        el(Button, {
                                            variant: 'secondary',
                                            onClick: function () {
                                                setAttributes({ handleIcon: { type: 'none', value: '' } });
                                                setOpenHandleIconPicker(false);
                                                setIconSearch('');
                                            }
                                        }, __('No icon', 'blockenberg')),
                                        el(Button, {
                                            variant: 'secondary',
                                            onClick: function () {
                                                setAttributes({ handleIcon: { type: 'dashicon', value: 'leftright' } });
                                                setOpenHandleIconPicker(false);
                                                setIconSearch('');
                                            }
                                        }, __('Reset', 'blockenberg'))
                                    ),
                                    el(TextControl, {
                                        placeholder: __('Search icons...', 'blockenberg'),
                                        value: iconSearch,
                                        onChange: setIconSearch,
                                        className: 'bkbg-ba-icon-search'
                                    }),
                                    el('div', { className: 'bkbg-ba-dashicons-grid' },
                                        filteredDashicons.length === 0
                                            ? el('p', { className: 'bkbg-ba-no-icons' }, __('No icons found', 'blockenberg'))
                                            : filteredDashicons.map(function (name) {
                                                var isActive = currentIcon.type === 'dashicon' && currentIcon.value === name;
                                                return el('button', {
                                                    key: name,
                                                    type: 'button',
                                                    className: 'bkbg-ba-dashicon-btn' + (isActive ? ' is-active' : ''),
                                                    onClick: function () {
                                                        setAttributes({ handleIcon: { type: 'dashicon', value: name } });
                                                        setOpenHandleIconPicker(false);
                                                        setIconSearch('');
                                                    },
                                                    title: name
                                                },
                                                    el('span', { className: 'dashicons dashicons-' + name })
                                                );
                                            })
                                    )
                                );
                            }

                            // Media tab
                            return el('div', { className: 'bkbg-ba-media-panel' },
                                currentIcon.type === 'custom' && el('div', { className: 'bkbg-ba-current-media' },
                                    el('img', { src: currentIcon.value, alt: '' }),
                                    el(Button, {
                                        isDestructive: true,
                                        variant: 'secondary',
                                        onClick: function () {
                                            setAttributes({ handleIcon: { type: 'dashicon', value: 'leftright' } });
                                        }
                                    }, __('Remove', 'blockenberg'))
                                ),
                                el(Button, {
                                    variant: 'secondary',
                                    onClick: openMediaLibrary,
                                    className: 'bkbg-ba-media-btn'
                                },
                                    el('span', { className: 'dashicons dashicons-upload' }),
                                    ' ',
                                    __('Select from Media Library', 'blockenberg')
                                ),
                                el('p', { className: 'bkbg-ba-media-hint' },
                                    __('Upload or select an image to use as a custom handle icon.', 'blockenberg')
                                )
                            );
                        })
                    )
                );
            }

            var blockProps = useBlockProps({
                className: layoutClass,
                style: styleVars,
                'data-block-label': 'Before/After'
            });

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Images', 'blockenberg'), initialOpen: true },
                    el('div', { className: 'bkbg-ba-media-row' },
                        el('div', { className: 'bkbg-ba-media-col' },
                            el('div', { className: 'bkbg-ba-media-title' }, __('Before image', 'blockenberg')),
                            a.beforeImage && a.beforeImage.url
                                ? el('img', { className: 'bkbg-ba-media-thumb', src: a.beforeImage.url, alt: a.beforeImage.alt || '' })
                                : el('div', { className: 'bkbg-ba-media-placeholder' }, __('No image selected', 'blockenberg')),
                            el(Button, {
                                variant: 'secondary',
                                onClick: function () { openMedia(setBeforeImage); }
                            }, a.beforeImage && a.beforeImage.url ? __('Replace', 'blockenberg') : __('Select', 'blockenberg')),
                            (a.beforeImage && a.beforeImage.url) && el(Button, {
                                variant: 'tertiary',
                                isDestructive: true,
                                onClick: function () { setAttributes({ beforeImage: { id: 0, url: '', alt: '' } }); }
                            }, __('Remove', 'blockenberg'))
                        ),
                        el('div', { className: 'bkbg-ba-media-col' },
                            el('div', { className: 'bkbg-ba-media-title' }, __('After image', 'blockenberg')),
                            a.afterImage && a.afterImage.url
                                ? el('img', { className: 'bkbg-ba-media-thumb', src: a.afterImage.url, alt: a.afterImage.alt || '' })
                                : el('div', { className: 'bkbg-ba-media-placeholder' }, __('No image selected', 'blockenberg')),
                            el(Button, {
                                variant: 'secondary',
                                onClick: function () { openMedia(setAfterImage); }
                            }, a.afterImage && a.afterImage.url ? __('Replace', 'blockenberg') : __('Select', 'blockenberg')),
                            (a.afterImage && a.afterImage.url) && el(Button, {
                                variant: 'tertiary',
                                isDestructive: true,
                                onClick: function () { setAttributes({ afterImage: { id: 0, url: '', alt: '' } }); }
                            }, __('Remove', 'blockenberg'))
                        )
                    ),
                    el(Button, {
                        variant: 'secondary',
                        disabled: !(a.beforeImage && a.beforeImage.url && a.afterImage && a.afterImage.url),
                        onClick: swapImages
                    }, __('Swap images', 'blockenberg'))
                ),

                el(PanelBody, { title: __('Slider', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Orientation', 'blockenberg'),
                        value: a.orientation,
                        options: [
                            { label: __('Horizontal', 'blockenberg'), value: 'horizontal' },
                            { label: __('Vertical', 'blockenberg'), value: 'vertical' }
                        ],
                        onChange: function (v) { setAttributes({ orientation: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Start position (%)', 'blockenberg'),
                        value: a.startPosition,
                        onChange: setPos,
                        min: 0,
                        max: 100
                    }),
                    el(RangeControl, {
                        label: __('Minimum height (px)', 'blockenberg'),
                        value: a.minHeight,
                        onChange: function (v) { setAttributes({ minHeight: v }); },
                        min: 120,
                        max: 900
                    }),
                    el(SelectControl, {
                        label: __('Aspect ratio', 'blockenberg'),
                        value: a.aspect,
                        options: [
                            { label: __('Auto', 'blockenberg'), value: 'auto' },
                            { label: '1:1', value: '1/1' },
                            { label: '4:3', value: '4/3' },
                            { label: '3:2', value: '3/2' },
                            { label: '16:9', value: '16/9' },
                            { label: '21:9', value: '21/9' }
                        ],
                        onChange: function (v) { setAttributes({ aspect: v }); }
                    })
                ),

                el(PanelBody, { title: __('Labels', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show labels', 'blockenberg'),
                        checked: a.showLabels,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showLabels: v }); }
                    }),
                    a.showLabels && el(SelectControl, {
                        label: __('Label position', 'blockenberg'),
                        value: a.labelPosition,
                        options: [
                            { label: __('Top', 'blockenberg'), value: 'top' },
                            { label: __('Bottom', 'blockenberg'), value: 'bottom' }
                        ],
                        onChange: function (v) { setAttributes({ labelPosition: v }); }
                    }),
                    a.showLabels && el(TextControl, {
                        label: __('Before label', 'blockenberg'),
                        value: a.beforeLabel,
                        onChange: function (v) { setAttributes({ beforeLabel: v }); }
                    }),
                    a.showLabels && el(TextControl, {
                        label: __('After label', 'blockenberg'),
                        value: a.afterLabel,
                        onChange: function (v) { setAttributes({ afterLabel: v }); }
                    }),
                    a.showLabels && el('div', { className: 'bkbg-ba-color-row' },
                        el('span', {}, __('Label background', 'blockenberg')),
                        el('button', {
                            className: 'bkbg-ba-color-btn',
                            style: { backgroundColor: a.labelBg },
                            onClick: function () { setOpenColor(openColor === 'labelBg' ? null : 'labelBg'); }
                        }),
                        openColor === 'labelBg' && el(Popover, { position: 'bottom left', onClose: function () { setOpenColor(null); } },
                            el(ColorPicker, {
                                color: a.labelBg,
                                onChangeComplete: function (c) {
                                    var rgba = colorToRgbaString(c);
                                    setAttributes({ labelBg: rgba || (c.hex ? c.hex : a.labelBg) });
                                }
                            })
                        )
                    ),
                    a.showLabels && el('div', { className: 'bkbg-ba-color-row' },
                        el('span', {}, __('Label text', 'blockenberg')),
                        el('button', {
                            className: 'bkbg-ba-color-btn',
                            style: { backgroundColor: a.labelColor },
                            onClick: function () { setOpenColor(openColor === 'labelColor' ? null : 'labelColor'); }
                        }),
                        openColor === 'labelColor' && el(Popover, { position: 'bottom left', onClose: function () { setOpenColor(null); } },
                            el(ColorPicker, {
                                color: a.labelColor,
                                onChangeComplete: function (c) { setAttributes({ labelColor: c.hex }); }
                            })
                        )
                    ),
                    a.showLabels && el(RangeControl, {
                        label: __('Label radius', 'blockenberg'),
                        value: a.labelRadius,
                        onChange: function (v) { setAttributes({ labelRadius: v }); },
                        min: 0,
                        max: 30
                    })
                ),

                el(PanelBody, { title: __('Handle', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Handle style', 'blockenberg'),
                        value: a.handleStyle,
                        options: [
                            { label: __('Circle', 'blockenberg'), value: 'circle' },
                            { label: __('Square', 'blockenberg'), value: 'square' }
                        ],
                        onChange: function (v) { setAttributes({ handleStyle: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Handle size', 'blockenberg'),
                        value: a.handleSize,
                        onChange: function (v) { setAttributes({ handleSize: v }); },
                        min: 28,
                        max: 80
                    }),

                    el('div', { className: 'bkbg-ba-icon-row' },
                        el('span', { className: 'bkbg-ba-icon-row-label' }, __('Handle icon', 'blockenberg')),
                        el('button', {
                            type: 'button',
                            className: 'bkbg-ba-icon-picker-btn',
                            onMouseDown: function (e) { e.stopPropagation(); },
                            onClick: function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpenHandleIconPicker(!openHandleIconPicker);
                            }
                        },
                            (function () {
                                var icon = parseIcon(a.handleIcon);
                                if (icon.type === 'custom') {
                                    return el('img', { className: 'bkbg-ba-icon-btn-img', src: icon.value, alt: '' });
                                }
                                if (icon.type === 'none') {
                                    return el('span', { className: 'bkbg-ba-icon-btn-none' }, __('None', 'blockenberg'));
                                }
                                return el('span', { className: 'dashicons dashicons-' + icon.value });
                            })()
                        ),
                        openHandleIconPicker && el('div', { className: 'bkbg-ba-icon-popover-anchor' },
                            renderHandleIconPicker('middle left')
                        )
                    ),
                    el(RangeControl, {
                        label: __('Handle icon size', 'blockenberg'),
                        value: a.handleIconSize || 18,
                        onChange: function (v) { setAttributes({ handleIconSize: v }); },
                        min: 10,
                        max: 34
                    }),
                    el(RangeControl, {
                        label: __('Divider line width', 'blockenberg'),
                        value: a.lineWidth,
                        onChange: function (v) { setAttributes({ lineWidth: v }); },
                        min: 1,
                        max: 8
                    }),
                    el('div', { className: 'bkbg-ba-color-row' },
                        el('span', {}, __('Handle background', 'blockenberg')),
                        el('button', {
                            className: 'bkbg-ba-color-btn',
                            style: { backgroundColor: a.handleBg },
                            onClick: function () { setOpenColor(openColor === 'handleBg' ? null : 'handleBg'); }
                        }),
                        openColor === 'handleBg' && el(Popover, { position: 'bottom left', onClose: function () { setOpenColor(null); } },
                            el(ColorPicker, {
                                color: a.handleBg,
                                onChangeComplete: function (c) { setAttributes({ handleBg: c.hex }); }
                            })
                        )
                    ),
                    el('div', { className: 'bkbg-ba-color-row' },
                        el('span', {}, __('Handle icon', 'blockenberg')),
                        el('button', {
                            className: 'bkbg-ba-color-btn',
                            style: { backgroundColor: a.handleColor },
                            onClick: function () { setOpenColor(openColor === 'handleColor' ? null : 'handleColor'); }
                        }),
                        openColor === 'handleColor' && el(Popover, { position: 'bottom left', onClose: function () { setOpenColor(null); } },
                            el(ColorPicker, {
                                color: a.handleColor,
                                onChangeComplete: function (c) { setAttributes({ handleColor: c.hex }); }
                            })
                        )
                    ),
                    el('div', { className: 'bkbg-ba-color-row' },
                        el('span', {}, __('Line color', 'blockenberg')),
                        el('button', {
                            className: 'bkbg-ba-color-btn',
                            style: { backgroundColor: a.lineColor },
                            onClick: function () { setOpenColor(openColor === 'lineColor' ? null : 'lineColor'); }
                        }),
                        openColor === 'lineColor' && el(Popover, { position: 'bottom left', onClose: function () { setOpenColor(null); } },
                            el(ColorPicker, {
                                color: a.lineColor,
                                onChangeComplete: function (c) {
                                    var rgba = colorToRgbaString(c);
                                    setAttributes({ lineColor: rgba || c.hex });
                                }
                            })
                        )
                    ),

                    el(ToggleControl, {
                        label: __('Animate handle', 'blockenberg'),
                        checked: !!a.handleHoverAnim,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ handleHoverAnim: v }); }
                    }),
                    a.handleHoverAnim && el(SelectControl, {
                        label: __('Animation', 'blockenberg'),
                        value: a.handleHoverAnimType || 'pulse',
                        options: [
                            { label: __('Pulse', 'blockenberg'), value: 'pulse' },
                            { label: __('Wiggle', 'blockenberg'), value: 'wiggle' },
                            { label: __('Bounce', 'blockenberg'), value: 'bounce' },
                            { label: __('Glow', 'blockenberg'), value: 'glow' }
                        ],
                        onChange: function (v) { setAttributes({ handleHoverAnimType: v }); }
                    }),
                    a.handleHoverAnim && el(RangeControl, {
                        label: __('Animation duration (ms)', 'blockenberg'),
                        value: a.handleHoverAnimDuration || 650,
                        onChange: function (v) { setAttributes({ handleHoverAnimDuration: v }); },
                        min: 150,
                        max: 2000
                    }),

                    el(ToggleControl, {
                        label: __('Enlarge icon area on hover', 'blockenberg'),
                        checked: !!a.handleHoverScale,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ handleHoverScale: v }); }
                    }),
                    a.handleHoverScale && el(RangeControl, {
                        label: __('Hover scale', 'blockenberg'),
                        value: a.handleHoverScaleAmount || 1.08,
                        onChange: function (v) { setAttributes({ handleHoverScaleAmount: v }); },
                        min: 1,
                        max: 1.25,
                        step: 0.01
                    })
                ),

                el(PanelBody, { title: __('Frame', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Border radius', 'blockenberg'),
                        value: a.borderRadius,
                        onChange: function (v) { setAttributes({ borderRadius: v }); },
                        min: 0,
                        max: 40
                    }),
                    el(ToggleControl, {
                        label: __('Shadow', 'blockenberg'),
                        checked: a.shadow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ shadow: v }); }
                    })
                ),
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    a.showLabels && TC && el(TC, { label: __('Label', 'blockenberg'), value: a.labelTypo || {}, onChange: function(v){ setAttributes({labelTypo: v}); } })
                )
            );

            var toolbar = el(BlockControls, {},
                el(ToolbarGroup, {},
                    el(ToolbarButton, {
                        icon: 'image-flip-horizontal',
                        label: __('Swap images', 'blockenberg'),
                        disabled: !(a.beforeImage && a.beforeImage.url && a.afterImage && a.afterImage.url),
                        onClick: swapImages
                    }),
                    el(ToolbarButton, {
                        icon: 'image-rotate',
                        label: __('Reset position', 'blockenberg'),
                        onClick: function () { setPos(50); }
                    })
                )
            );

            function renderInner() {
                var hasBefore = a.beforeImage && a.beforeImage.url;
                var hasAfter = a.afterImage && a.afterImage.url;

                // Empty / partial state: show two side-by-side panels so selectors never overlap.
                if (!hasBefore || !hasAfter) {
                    return el('div', { className: 'bkbg-ba-inner bkbg-ba-empty-inner' },
                        el('div', { className: 'bkbg-ba-empty-grid' },
                            el('div', { className: 'bkbg-ba-empty-panel is-before' },
                                el('div', { className: 'bkbg-ba-empty-panel-title' }, __('Before', 'blockenberg')),
                                hasBefore
                                    ? el('img', { className: 'bkbg-ba-empty-thumb', src: a.beforeImage.url, alt: a.beforeImage.alt || '' })
                                    : el('div', { className: 'bkbg-ba-empty-copy' }, __('Select the BEFORE image', 'blockenberg')),
                                el(Button, {
                                    variant: 'secondary',
                                    onMouseDown: function (e) { e.stopPropagation(); },
                                    onTouchStart: function (e) { e.stopPropagation(); },
                                    onClick: function () { openMedia(setBeforeImage); }
                                }, hasBefore ? __('Replace Before', 'blockenberg') : __('Select Before', 'blockenberg'))
                            ),
                            el('div', { className: 'bkbg-ba-empty-panel is-after' },
                                el('div', { className: 'bkbg-ba-empty-panel-title' }, __('After', 'blockenberg')),
                                hasAfter
                                    ? el('img', { className: 'bkbg-ba-empty-thumb', src: a.afterImage.url, alt: a.afterImage.alt || '' })
                                    : el('div', { className: 'bkbg-ba-empty-copy' }, __('Select the AFTER image', 'blockenberg')),
                                el(Button, {
                                    variant: 'secondary',
                                    onMouseDown: function (e) { e.stopPropagation(); },
                                    onTouchStart: function (e) { e.stopPropagation(); },
                                    onClick: function () { openMedia(setAfterImage); }
                                }, hasAfter ? __('Replace After', 'blockenberg') : __('Select After', 'blockenberg'))
                            )
                        )
                    );
                }

                return el('div', {
                    className: 'bkbg-ba-inner',
                    onMouseMove: function (e) { onMove(e, e.currentTarget); },
                    onTouchMove: function (e) { onMove(e, e.currentTarget); },
                    onMouseUp: endDrag,
                    onMouseLeave: endDrag,
                    onTouchEnd: endDrag,
                    onTouchCancel: endDrag
                },
                    el('div', { className: 'bkbg-ba-layer bkbg-ba-before' },
                        el('img', { src: a.beforeImage.url, alt: a.beforeImage.alt || '' })
                    ),
                    el('div', { className: 'bkbg-ba-layer bkbg-ba-after' },
                        el('img', { src: a.afterImage.url, alt: a.afterImage.alt || '' })
                    ),
                    el('div', { className: 'bkbg-ba-divider' },
                        el('div', {
                            className: 'bkbg-ba-handle' + (a.handleStyle === 'square' ? ' is-square' : ' is-circle'),
                            onMouseDown: function (e) {
                                if (beginDrag(e)) {
                                    setPos(posFromEvent(e, e.currentTarget.closest('.bkbg-ba-inner')));
                                }
                            },
                            onTouchStart: function (e) {
                                if (beginDrag(e)) {
                                    setPos(posFromEvent(e, e.currentTarget.closest('.bkbg-ba-inner')));
                                }
                            }
                        },
                            renderHandleIconWrapped()
                        )
                    ),
                    a.showLabels && el('div', { className: 'bkbg-ba-labels is-' + a.labelPosition },
                        el('div', { className: 'bkbg-ba-label bkbg-ba-label-before' }, a.beforeLabel || __('Before', 'blockenberg')),
                        el('div', { className: 'bkbg-ba-label bkbg-ba-label-after' }, a.afterLabel || __('After', 'blockenberg'))
                    ),
                    // Accessible range input
                    el('input', {
                        className: 'bkbg-ba-range',
                        type: 'range',
                        min: 0,
                        max: 100,
                        value: a.startPosition,
                        onChange: function (e) { setPos(e.target.value); },
                        'aria-label': __('Before/After position', 'blockenberg')
                    })
                );
            }

            var content = el('div', blockProps,
                el('div', {
                    className: 'bkbg-ba-aspect' + (a.aspect !== 'auto' ? ' has-aspect' : ''),
                    style: a.aspect !== 'auto' ? { aspectRatio: a.aspect } : {}
                },
                    renderInner()
                )
            );

            return el(Fragment, {},
                toolbar,
                inspector,
                content
            );
        },

        save: function (props) {
            var a = props.attributes;

            var cls = 'bkbg-ba-wrap';
            cls += a.orientation === 'vertical' ? ' is-vertical' : ' is-horizontal';
            if (a.shadow) cls += ' has-shadow';
            if (a.handleHoverAnim) {
                cls += ' has-handle-anim';
                cls += a.handleHoverAnimType ? (' is-handle-anim-' + a.handleHoverAnimType) : ' is-handle-anim-pulse';
            }
            if (a.handleHoverScale) {
                cls += ' has-handle-hover';
            }

            var _tv = getTypoCssVars();
            var styleVars = {
                '--bkbg-ba-pos': (a.startPosition || 50) + '%',
                '--bkbg-ba-radius': (a.borderRadius || 0) + 'px',
                '--bkbg-ba-handle-size': (a.handleSize || 44) + 'px',
                '--bkbg-ba-handle-icon-size': (a.handleIconSize || 18) + 'px',
                '--bkbg-ba-handle-anim-dur': (a.handleHoverAnimDuration || 650) + 'ms',
                '--bkbg-ba-handle-hover-scale': (a.handleHoverScaleAmount || 1.08),
                '--bkbg-ba-handle-bg': a.handleBg,
                '--bkbg-ba-handle-color': a.handleColor,
                '--bkbg-ba-line-color': a.lineColor,
                '--bkbg-ba-line-width': (a.lineWidth || 2) + 'px',
                '--bkbg-ba-label-bg': a.labelBg,
                '--bkbg-ba-label-color': a.labelColor,
                '--bkbg-ba-label-radius': (a.labelRadius || 6) + 'px',
                '--bkbg-ba-min-height': (a.minHeight || 260) + 'px'
            };
            Object.assign(styleVars, _tv(a.labelTypo || {}, '--bkbg-ba-label-'));

            function renderSavedHandleIcon() {
                var icon = parseIcon(a.handleIcon);
                if (!icon || icon.type === 'none') return null;
                if (icon.type === 'custom') {
                    return el('img', { className: 'bkbg-ba-handle-img', src: icon.value, alt: '' });
                }
                return el('span', { className: 'dashicons dashicons-' + icon.value + ' bkbg-ba-handle-icon' });
            }

            function renderSavedHandleIconWrapped() {
                return el('span', { className: 'bkbg-ba-handle-surface' },
                    el('span', { className: 'bkbg-ba-handle-anim' },
                        el('span', { className: 'bkbg-ba-handle-hover' },
                            renderSavedHandleIcon()
                        )
                    )
                );
            }

            var aspectStyle = (a.aspect && a.aspect !== 'auto') ? { aspectRatio: a.aspect } : {};

            var blockProps = useBlockProps.save({
                className: cls,
                style: styleVars,
                'data-pos': String(a.startPosition || 50),
                'data-orientation': a.orientation || 'horizontal',
                'data-show-labels': a.showLabels ? '1' : '0',
                'data-label-position': a.labelPosition || 'top'
            });

            return el('div', blockProps,
                el('div', Object.assign({ className: 'bkbg-ba-aspect' + (a.aspect !== 'auto' ? ' has-aspect' : '') }, aspectStyle),
                    el('div', { className: 'bkbg-ba-inner' },
                        el('div', { className: 'bkbg-ba-layer bkbg-ba-before' },
                            a.beforeImage && a.beforeImage.url
                                ? el('img', { src: a.beforeImage.url, alt: (a.beforeImage.alt || '') })
                                : null
                        ),
                        el('div', { className: 'bkbg-ba-layer bkbg-ba-after' },
                            a.afterImage && a.afterImage.url
                                ? el('img', { src: a.afterImage.url, alt: (a.afterImage.alt || '') })
                                : null
                        ),
                        el('div', { className: 'bkbg-ba-divider' },
                            el('div', { className: 'bkbg-ba-handle' + (a.handleStyle === 'square' ? ' is-square' : ' is-circle') },
                                renderSavedHandleIconWrapped()
                            )
                        ),
                        a.showLabels && el('div', { className: 'bkbg-ba-labels is-' + (a.labelPosition || 'top') },
                            el('div', { className: 'bkbg-ba-label bkbg-ba-label-before' }, a.beforeLabel || __('Before', 'blockenberg')),
                            el('div', { className: 'bkbg-ba-label bkbg-ba-label-after' }, a.afterLabel || __('After', 'blockenberg'))
                        ),
                        el('input', {
                            className: 'bkbg-ba-range',
                            type: 'range',
                            min: 0,
                            max: 100,
                            value: a.startPosition || 50,
                            'aria-label': __('Before/After position', 'blockenberg')
                        })
                    )
                )
            );
        }
    });
}() );
