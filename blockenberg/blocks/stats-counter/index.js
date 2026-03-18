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
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;
    var ToolbarGroup = wp.components.ToolbarGroup;
    var ToolbarButton = wp.components.ToolbarButton;
    var TabPanel = wp.components.TabPanel;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

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

    // Helper: parse icon value (supports legacy string or new object format)
    function parseIcon(iconValue) {
        if (!iconValue) return { type: 'dashicon', value: 'groups' };
        if (typeof iconValue === 'string') {
            // Legacy format - just the icon name
            return { type: 'dashicon', value: iconValue };
        }
        return iconValue;
    }

    registerBlockType('blockenberg/stats-counter', {
        title: __('Stats Counter', 'blockenberg'),
        icon: 'performance',
        category: 'bkbg-business',
        description: __('Display animated number counters with icons, labels, and rich customization.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var isSelected = props.isSelected;
            var a = attributes;

            // State for editing
            var editingState = useState(null);
            var editing = editingState[0];
            var setEditing = editingState[1];

            // State for hovered item
            var hoveredState = useState(null);
            var hovered = hoveredState[0];
            var setHovered = hoveredState[1];

            // State for color picker
            var colorPickerState = useState(null);
            var colorPicker = colorPickerState[0];
            var setColorPicker = colorPickerState[1];

            // State for icon picker popover
            var iconPickerState = useState(null);
            var openIconPicker = iconPickerState[0];
            var setOpenIconPicker = iconPickerState[1];

            // Search state for dashicons
            var searchState = useState('');
            var iconSearch = searchState[0];
            var setIconSearch = searchState[1];

            // Filter dashicons based on search
            var filteredDashicons = useMemo(function() {
                if (!iconSearch) return dashicons;
                var search = iconSearch.toLowerCase();
                return dashicons.filter(function(icon) {
                    return icon.toLowerCase().includes(search);
                });
            }, [iconSearch]);

            var layoutOptions = [
                { label: __('Grid', 'blockenberg'), value: 'grid' },
                { label: __('Inline', 'blockenberg'), value: 'inline' },
                { label: __('Stacked', 'blockenberg'), value: 'stacked' }
            ];

            var iconPositionOptions = [
                { label: __('Top', 'blockenberg'), value: 'top' },
                { label: __('Left', 'blockenberg'), value: 'left' },
                { label: __('Right', 'blockenberg'), value: 'right' }
            ];

            var iconStyleOptions = [
                { label: __('Default (Icon only)', 'blockenberg'), value: 'default' },
                { label: __('Filled Background', 'blockenberg'), value: 'filled' },
                { label: __('Outlined', 'blockenberg'), value: 'outlined' }
            ];

            var labelPositionOptions = [
                { label: __('Below Number', 'blockenberg'), value: 'below' },
                { label: __('Above Number', 'blockenberg'), value: 'above' }
            ];

            var textAlignOptions = [
                { label: __('Left', 'blockenberg'), value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right', 'blockenberg'), value: 'right' }
            ];

            var fontWeightOptions = [
                { label: '400', value: 400 },
                { label: '500', value: 500 },
                { label: '600', value: 600 },
                { label: '700', value: 700 },
                { label: '800', value: 800 },
                { label: '900', value: 900 }
            ];

            var separatorOptions = [
                { label: __('Comma (1,000)', 'blockenberg'), value: ',' },
                { label: __('Space (1 000)', 'blockenberg'), value: ' ' },
                { label: __('Period (1.000)', 'blockenberg'), value: '.' },
                { label: __('None (1000)', 'blockenberg'), value: '' }
            ];

            // Update item
            function updateItem(index, key, value) {
                var newItems = a.items.slice();
                newItems[index] = Object.assign({}, newItems[index]);
                newItems[index][key] = value;
                setAttributes({ items: newItems });
            }

            // Add item
            function addItem() {
                var colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
                var icons = ['groups', 'yes-alt', 'chart-bar', 'star-filled', 'heart', 'thumbs-up', 'awards', 'building'];
                var newColor = colors[a.items.length % colors.length];
                var newIcon = icons[a.items.length % icons.length];
                var newItems = a.items.concat([{
                    number: 100,
                    suffix: '+',
                    prefix: '',
                    label: __('New Stat', 'blockenberg'),
                    icon: newIcon,
                    color: newColor,
                    numberColor: '',
                    labelColor: ''
                }]);
                setAttributes({ items: newItems });
            }

            // Remove item
            function removeItem(index) {
                if (a.items.length <= 1) return;
                var newItems = a.items.filter(function (_, i) { return i !== index; });
                setAttributes({ items: newItems });
            }

            // Move item
            function moveItem(index, direction) {
                var newIndex = index + direction;
                if (newIndex < 0 || newIndex >= a.items.length) return;
                var newItems = a.items.slice();
                var temp = newItems[index];
                newItems[index] = newItems[newIndex];
                newItems[newIndex] = temp;
                setAttributes({ items: newItems });
            }

            // Duplicate item
            function duplicateItem(index) {
                var newItems = a.items.slice();
                newItems.splice(index + 1, 0, Object.assign({}, a.items[index]));
                setAttributes({ items: newItems });
            }

            // Format number with separator
            function formatNumber(num, separator) {
                if (!separator) return String(num);
                return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
            }

            // Render full icon picker popover with tabs
            function renderIconPicker(index, position) {
                var currentIcon = parseIcon(a.items[index].icon);
                var stop = function (e) {
                    if (e && e.stopPropagation) e.stopPropagation();
                };

                return el(Popover, {
                    position: position || 'bottom center',
                    className: 'bkbg-sc-icon-popover',
                    onClose: function () { 
                        setOpenIconPicker(null);
                        setIconSearch('');
                    }
                },
                    el('div', { className: 'bkbg-sc-icon-picker-modal', onMouseDown: stop, onClick: stop },
                        el('div', { className: 'bkbg-sc-icon-picker-header' },
                            el('h3', {}, __('Choose Icon', 'blockenberg')),
                            el(Button, {
                                icon: 'no-alt',
                                onClick: function() { 
                                    setOpenIconPicker(null);
                                    setIconSearch('');
                                },
                                className: 'bkbg-sc-icon-picker-close'
                            })
                        ),
                        el(TabPanel, {
                            className: 'bkbg-sc-icon-tabs',
                            activeClass: 'is-active',
                            tabs: [
                                { name: 'dashicons', title: __('Dashicons', 'blockenberg'), className: 'bkbg-sc-tab-dashicons' },
                                { name: 'media', title: __('Media Library', 'blockenberg'), className: 'bkbg-sc-tab-media' }
                            ]
                        }, function(tab) {
                            if (tab.name === 'dashicons') {
                                return el('div', { className: 'bkbg-sc-dashicons-panel' },
                                    // Search box
                                    el(TextControl, {
                                        placeholder: __('Search icons...', 'blockenberg'),
                                        value: iconSearch,
                                        onChange: setIconSearch,
                                        className: 'bkbg-sc-icon-search'
                                    }),
                                    // Icons grid
                                    el('div', { className: 'bkbg-sc-dashicons-grid' },
                                        filteredDashicons.length === 0 
                                            ? el('p', { className: 'bkbg-sc-no-icons' }, __('No icons found', 'blockenberg'))
                                            : filteredDashicons.map(function(icon) {
                                                var isActive = currentIcon.type === 'dashicon' && currentIcon.value === icon;
                                                return el('button', {
                                                    key: icon,
                                                    type: 'button',
                                                    className: 'bkbg-sc-dashicon-btn' + (isActive ? ' is-active' : ''),
                                                    onClick: function() {
                                                        updateItem(index, 'icon', icon);
                                                        setOpenIconPicker(null);
                                                        setIconSearch('');
                                                    },
                                                    title: icon
                                                },
                                                    el('span', { className: 'dashicons dashicons-' + icon })
                                                );
                                            })
                                    )
                                );
                            } else {
                                // Media Library tab
                                var openMediaLibrary = function() {
                                    var frame = wp.media({
                                        title: __('Select Icon Image', 'blockenberg'),
                                        button: { text: __('Use as Icon', 'blockenberg') },
                                        multiple: false,
                                        library: { type: 'image' }
                                    });
                                    frame.on('select', function() {
                                        var attachment = frame.state().get('selection').first().toJSON();
                                        updateItem(index, 'icon', { type: 'custom', value: attachment.url });
                                        setOpenIconPicker(null);
                                    });
                                    frame.open();
                                };

                                return el('div', { className: 'bkbg-sc-media-panel' },
                                    // Current custom icon preview
                                    currentIcon.type === 'custom' && el('div', { className: 'bkbg-sc-current-media' },
                                        el('img', { src: currentIcon.value, alt: '' }),
                                        el(Button, {
                                            isDestructive: true,
                                            variant: 'secondary',
                                            onClick: function() {
                                                updateItem(index, 'icon', 'groups');
                                            }
                                        }, __('Remove', 'blockenberg'))
                                    ),
                                    // Media upload button
                                    el(Button, {
                                        variant: 'secondary',
                                        onClick: openMediaLibrary,
                                        className: 'bkbg-sc-media-btn'
                                    },
                                        el('span', { className: 'dashicons dashicons-upload' }),
                                        ' ',
                                        __('Select from Media Library', 'blockenberg')
                                    ),
                                    el('p', { className: 'bkbg-sc-media-hint' },
                                        __('Upload or select an image to use as a custom icon.', 'blockenberg')
                                    )
                                );
                            }
                        })
                    )
                );
            }

            // Inspector controls
            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Layout Style', 'blockenberg'),
                        value: a.layoutStyle,
                        options: layoutOptions,
                        onChange: function (v) { setAttributes({ layoutStyle: v }); }
                    }),
                    (a.layoutStyle === 'grid') && el(RangeControl, {
                        label: __('Columns', 'blockenberg'),
                        value: a.columns,
                        onChange: function (v) { setAttributes({ columns: v }); },
                        min: 1,
                        max: 6
                    }),
                    el(RangeControl, {
                        label: __('Gap', 'blockenberg'),
                        value: a.gap,
                        onChange: function (v) { setAttributes({ gap: v }); },
                        min: 0,
                        max: 80
                    }),
                    el(SelectControl, {
                        label: __('Text Align', 'blockenberg'),
                        value: a.textAlign,
                        options: textAlignOptions,
                        onChange: function (v) { setAttributes({ textAlign: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Dividers between items', 'blockenberg'),
                        checked: a.divider,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ divider: v }); }
                    })
                ),

                el(PanelBody, { title: __('Icon', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Icon', 'blockenberg'),
                        checked: a.showIcon,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showIcon: v }); }
                    }),
                    a.showIcon && el(SelectControl, {
                        label: __('Icon Position', 'blockenberg'),
                        value: a.iconPosition,
                        options: iconPositionOptions,
                        onChange: function (v) { setAttributes({ iconPosition: v }); }
                    }),
                    a.showIcon && el(SelectControl, {
                        label: __('Icon Style', 'blockenberg'),
                        value: a.iconStyle,
                        options: iconStyleOptions,
                        onChange: function (v) { setAttributes({ iconStyle: v }); }
                    }),
                    a.showIcon && el(RangeControl, {
                        label: __('Icon Size', 'blockenberg'),
                        value: a.iconSize,
                        onChange: function (v) { setAttributes({ iconSize: v }); },
                        min: 16,
                        max: 96
                    }),
                    a.showIcon && (a.iconStyle === 'filled' || a.iconStyle === 'outlined') && el(RangeControl, {
                        label: __('Background Size', 'blockenberg'),
                        value: a.iconBgSize,
                        onChange: function (v) { setAttributes({ iconBgSize: v }); },
                        min: 40,
                        max: 160
                    }),
                    a.showIcon && (a.iconStyle === 'filled' || a.iconStyle === 'outlined') && el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.iconRadius,
                        onChange: function (v) { setAttributes({ iconRadius: v }); },
                        min: 0,
                        max: 50,
                        help: __('50 = circle', 'blockenberg')
                    }),
                    a.showIcon && el(ToggleControl, {
                        label: __('Use item colors for icons', 'blockenberg'),
                        checked: a.useItemColors,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ useItemColors: v }); }
                    })
                ),

                el(PanelBody, { title: __('Number', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Number Weight', 'blockenberg'),
                        value: a.numberWeight,
                        options: fontWeightOptions,
                        onChange: function (v) { setAttributes({ numberWeight: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Thousands Separator', 'blockenberg'),
                        value: a.separator,
                        options: separatorOptions,
                        onChange: function (v) { setAttributes({ separator: v }); }
                    })
                ),

                el(PanelBody, { title: __('Label', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Label', 'blockenberg'),
                        checked: a.showLabel,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showLabel: v }); }
                    }),
                    a.showLabel && el(SelectControl, {
                        label: __('Label Position', 'blockenberg'),
                        value: a.labelPosition,
                        options: labelPositionOptions,
                        onChange: function (v) { setAttributes({ labelPosition: v }); }
                    }),
                    a.showLabel && el(SelectControl, {
                        label: __('Label Weight', 'blockenberg'),
                        value: a.labelWeight,
                        options: fontWeightOptions,
                        onChange: function (v) { setAttributes({ labelWeight: v }); }
                    })
                ),

                el(PanelBody, { title: __('Card Style', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Enable Card Style', 'blockenberg'),
                        checked: a.cardStyle,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ cardStyle: v }); }
                    }),
                    a.cardStyle && el(RangeControl, {
                        label: __('Padding', 'blockenberg'),
                        value: a.cardPadding,
                        onChange: function (v) { setAttributes({ cardPadding: v }); },
                        min: 8,
                        max: 80
                    }),
                    a.cardStyle && el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.cardRadius,
                        onChange: function (v) { setAttributes({ cardRadius: v }); },
                        min: 0,
                        max: 40
                    }),
                    a.cardStyle && el(ToggleControl, {
                        label: __('Border', 'blockenberg'),
                        checked: a.cardBorder,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ cardBorder: v }); }
                    }),
                    a.cardStyle && a.cardBorder && el(RangeControl, {
                        label: __('Border Width', 'blockenberg'),
                        value: a.cardBorderWidth,
                        onChange: function (v) { setAttributes({ cardBorderWidth: v }); },
                        min: 1,
                        max: 6
                    }),
                    a.cardStyle && el(ToggleControl, {
                        label: __('Shadow', 'blockenberg'),
                        checked: a.cardShadow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ cardShadow: v }); }
                    })
                ),

                el(PanelBody, { title: __('Animation', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Animate on Scroll', 'blockenberg'),
                        checked: a.animateOnScroll,
                        help: __('Numbers count up when visible on the page.', 'blockenberg'),
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ animateOnScroll: v }); }
                    }),
                    a.animateOnScroll && el(RangeControl, {
                        label: __('Animation Duration (ms)', 'blockenberg'),
                        value: a.animationDuration,
                        onChange: function (v) { setAttributes({ animationDuration: v }); },
                        min: 500,
                        max: 5000,
                        step: 100
                    })
                ),

                el(PanelBody, { title: __('Title', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Title', 'blockenberg'),
                        checked: a.showTitle,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showTitle: v }); }
                    }),
                    ),

                el(PanelBody, { title: __('Stats Items', 'blockenberg'), initialOpen: false },
                    a.items.map(function (item, index) {
                        return el('div', { key: index, className: 'bkbg-sc-item-control' },
                            el('div', { className: 'bkbg-sc-item-header' },
                                el('span', { className: 'bkbg-sc-item-title' }, 
                                    (item.prefix || '') + formatNumber(item.number, a.separator) + (item.suffix || '')
                                ),
                                el('div', { className: 'bkbg-sc-item-actions' },
                                    el(Button, {
                                        icon: 'arrow-up-alt2',
                                        size: 'small',
                                        disabled: index === 0,
                                        onClick: function () { moveItem(index, -1); }
                                    }),
                                    el(Button, {
                                        icon: 'arrow-down-alt2',
                                        size: 'small',
                                        disabled: index === a.items.length - 1,
                                        onClick: function () { moveItem(index, 1); }
                                    }),
                                    el(Button, {
                                        icon: 'trash',
                                        size: 'small',
                                        isDestructive: true,
                                        disabled: a.items.length <= 1,
                                        onClick: function () { removeItem(index); }
                                    })
                                )
                            ),
                            el(TextControl, {
                                label: __('Number', 'blockenberg'),
                                type: 'number',
                                value: String(item.number),
                                onChange: function (v) { 
                                    var n = parseInt(v, 10);
                                    if (isNaN(n)) n = 0;
                                    updateItem(index, 'number', n); 
                                }
                            }),
                            el('div', { className: 'bkbg-sc-prefix-suffix' },
                                el(TextControl, {
                                    label: __('Prefix', 'blockenberg'),
                                    value: item.prefix || '',
                                    placeholder: '$',
                                    onChange: function (v) { updateItem(index, 'prefix', v); }
                                }),
                                el(TextControl, {
                                    label: __('Suffix', 'blockenberg'),
                                    value: item.suffix || '',
                                    placeholder: '+',
                                    onChange: function (v) { updateItem(index, 'suffix', v); }
                                })
                            ),
                            el(TextControl, {
                                label: __('Label', 'blockenberg'),
                                value: item.label,
                                onChange: function (v) { updateItem(index, 'label', v); }
                            }),
                            a.showIcon && el('div', { className: 'bkbg-sc-icon-row' },
                                el('span', {}, __('Icon', 'blockenberg')),
                                el('div', { className: 'bkbg-sc-icon-btn-wrap' },
                                    (function() {
                                        var iconData = parseIcon(item.icon);
                                        return el('button', {
                                            type: 'button',
                                            className: 'bkbg-sc-icon-btn',
                                            onClick: function (e) { 
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setOpenIconPicker(openIconPicker === 'panel-' + index ? null : 'panel-' + index); 
                                            },
                                            title: __('Click to change icon', 'blockenberg')
                                        },
                                            iconData.type === 'custom' 
                                                ? el('img', { src: iconData.value, alt: '' })
                                                : el('span', { className: 'dashicons dashicons-' + iconData.value })
                                        );
                                    })(),
                                    openIconPicker === 'panel-' + index && renderIconPicker(index, 'middle left')
                                )
                            ),
                            el('div', { className: 'bkbg-sc-color-row' },
                                el('span', {}, __('Icon Color', 'blockenberg')),
                                el('button', {
                                    className: 'bkbg-sc-color-btn',
                                    style: { backgroundColor: item.color },
                                    onClick: function () { 
                                        setColorPicker(colorPicker === index ? null : index); 
                                    }
                                }),
                                colorPicker === index && el(Popover, {
                                    position: 'bottom left',
                                    onClose: function () { setColorPicker(null); }
                                },
                                    el(ColorPicker, {
                                        color: item.color,
                                        onChangeComplete: function (c) { 
                                            updateItem(index, 'color', c.hex); 
                                        }
                                    })
                                )
                            ),
                            el('div', { className: 'bkbg-sc-color-row' },
                                el('span', {}, __('Number Color', 'blockenberg')),
                                el('button', {
                                    className: 'bkbg-sc-color-btn',
                                    style: { backgroundColor: item.numberColor || a.numberColor || '#1f2937' },
                                    onClick: function () { 
                                        setColorPicker(colorPicker === 'number-' + index ? null : 'number-' + index); 
                                    }
                                }),
                                colorPicker === 'number-' + index && el(Popover, {
                                    position: 'bottom left',
                                    onClose: function () { setColorPicker(null); }
                                },
                                    el(ColorPicker, {
                                        color: item.numberColor || a.numberColor || '#1f2937',
                                        onChangeComplete: function (c) { 
                                            updateItem(index, 'numberColor', c.hex); 
                                        }
                                    })
                                )
                            ),
                            el('div', { className: 'bkbg-sc-color-row' },
                                el('span', {}, __('Label Color', 'blockenberg')),
                                el('button', {
                                    className: 'bkbg-sc-color-btn',
                                    style: { backgroundColor: item.labelColor || a.labelColor || '#6b7280' },
                                    onClick: function () { 
                                        setColorPicker(colorPicker === 'label-' + index ? null : 'label-' + index); 
                                    }
                                }),
                                colorPicker === 'label-' + index && el(Popover, {
                                    position: 'bottom left',
                                    onClose: function () { setColorPicker(null); }
                                },
                                    el(ColorPicker, {
                                        color: item.labelColor || a.labelColor || '#6b7280',
                                        onChangeComplete: function (c) { 
                                            updateItem(index, 'labelColor', c.hex); 
                                        }
                                    })
                                )
                            )
                        );
                    }),
                    el(Button, {
                        variant: 'secondary',
                        onClick: addItem,
                        className: 'bkbg-sc-add-btn'
                    }, __('+ Add Stat', 'blockenberg'))
                ),

                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl()({ label: __('Number', 'blockenberg'), value: a.numberTypo, onChange: function (v) { setAttributes({ numberTypo: v }); } }),
                    a.showLabel && getTypoControl()({ label: __('Label', 'blockenberg'), value: a.labelTypo, onChange: function (v) { setAttributes({ labelTypo: v }); } }),
                    a.showTitle && getTypoControl()({ label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        {
                            value: a.numberColor,
                            onChange: function (v) { setAttributes({ numberColor: v }); },
                            label: __('Number Color', 'blockenberg')
                        },
                        {
                            value: a.labelColor,
                            onChange: function (v) { setAttributes({ labelColor: v }); },
                            label: __('Label Color', 'blockenberg')
                        },
                        {
                            value: a.titleColor,
                            onChange: function (v) { setAttributes({ titleColor: v }); },
                            label: __('Title Color', 'blockenberg')
                        },
                        a.cardStyle && {
                            value: a.cardBg,
                            onChange: function (v) { setAttributes({ cardBg: v }); },
                            label: __('Card Background', 'blockenberg')
                        },
                        a.cardStyle && a.cardBorder && {
                            value: a.cardBorderColor,
                            onChange: function (v) { setAttributes({ cardBorderColor: v }); },
                            label: __('Card Border Color', 'blockenberg')
                        },
                        a.divider && {
                            value: a.dividerColor,
                            onChange: function (v) { setAttributes({ dividerColor: v }); },
                            label: __('Divider Color', 'blockenberg')
                        }
                    ].filter(Boolean)
                })
            );

            // CSS variables
            var tv = getTypoCssVars();
            var wrapStyle = {
                '--bkbg-sc-columns': a.columns,
                '--bkbg-sc-gap': a.gap + 'px',
                '--bkbg-sc-icon-size': a.iconSize + 'px',
                '--bkbg-sc-icon-bg-size': a.iconBgSize + 'px',
                '--bkbg-sc-icon-radius': a.iconRadius + '%',
                '--bkbg-sc-number-size': a.numberSize + 'px',
                '--bkbg-sc-number-weight': a.numberWeight,
                '--bkbg-sc-number-color': a.numberColor,
                '--bkbg-sc-number-lh': a.numberLineHeight,
                '--bkbg-sc-label-size': a.labelSize + 'px',
                '--bkbg-sc-label-weight': a.labelWeight,
                '--bkbg-sc-label-color': a.labelColor,
                '--bkbg-sc-label-lh': a.labelLineHeight,
                '--bkbg-sc-title-size': a.titleSize + 'px',
                '--bkbg-sc-title-wt': a.titleFontWeight || '700',
                '--bkbg-sc-title-lh': a.titleLineHeight,
                '--bkbg-sc-title-color': a.titleColor,
                '--bkbg-sc-card-bg': a.cardBg,
                '--bkbg-sc-card-border-color': a.cardBorderColor,
                '--bkbg-sc-card-border-width': a.cardBorderWidth + 'px',
                '--bkbg-sc-card-radius': a.cardRadius + 'px',
                '--bkbg-sc-card-padding': a.cardPadding + 'px',
                '--bkbg-sc-divider-color': a.dividerColor,
                '--bkbg-sc-text-align': a.textAlign
            };
            Object.assign(wrapStyle, tv(a.titleTypo, '--bksc-tt-'));
            Object.assign(wrapStyle, tv(a.numberTypo, '--bksc-nm-'));
            Object.assign(wrapStyle, tv(a.labelTypo, '--bksc-lb-'));

            // Title element
            var titleEl = null;
            if (a.showTitle) {
                if (editing === 'title') {
                    titleEl = el('input', {
                        type: 'text',
                        className: 'bkbg-sc-title bkbg-sc-input-active',
                        value: a.title,
                        autoFocus: true,
                        placeholder: __('Stats Title', 'blockenberg'),
                        onChange: function (e) { setAttributes({ title: e.target.value }); },
                        onBlur: function () { setEditing(null); },
                        onKeyDown: function (e) { if (e.key === 'Enter') setEditing(null); }
                    });
                } else {
                    titleEl = el('div', {
                        className: 'bkbg-sc-title bkbg-sc-clickable',
                        onClick: function () { setEditing('title'); }
                    }, a.title || __('Stats Title', 'blockenberg'));
                }
            }

            // Render icon (with index for icon picker)
            function renderIcon(item, index) {
                var iconColor = a.useItemColors ? item.color : 'currentColor';
                var bgColor = a.useItemColors ? item.color : '#3b82f6';
                var iconData = parseIcon(item.icon);

                // Create the icon element (dashicon or custom image)
                var iconEl;
                if (iconData.type === 'custom') {
                    iconEl = el('img', { 
                        src: iconData.value,
                        alt: '',
                        style: { 
                            width: a.iconSize + 'px',
                            height: a.iconSize + 'px',
                            objectFit: 'contain'
                        }
                    });
                } else {
                    iconEl = el('span', { 
                        className: 'dashicons dashicons-' + iconData.value,
                        style: { 
                            color: a.iconStyle === 'filled' ? '#fff' : iconColor,
                            fontSize: a.iconSize + 'px',
                            width: a.iconSize + 'px',
                            height: a.iconSize + 'px'
                        }
                    });
                }

                // Wrapper with click handler to open icon picker
                var wrapperProps = {
                    className: 'bkbg-sc-icon bkbg-sc-icon-clickable' + 
                        (a.iconStyle === 'filled' ? ' bkbg-sc-icon--filled' : '') +
                        (a.iconStyle === 'outlined' ? ' bkbg-sc-icon--outlined' : ''),
                    onClick: function(e) {
                        e.stopPropagation();
                        setOpenIconPicker(openIconPicker === 'editor-' + index ? null : 'editor-' + index);
                    },
                    title: __('Click to change icon', 'blockenberg'),
                    style: {}
                };

                if (a.iconStyle === 'filled') {
                    wrapperProps.style = {
                        backgroundColor: bgColor,
                        width: a.iconBgSize + 'px',
                        height: a.iconBgSize + 'px',
                        borderRadius: a.iconRadius + '%'
                    };
                } else if (a.iconStyle === 'outlined') {
                    wrapperProps.style = {
                        borderColor: bgColor,
                        width: a.iconBgSize + 'px',
                        height: a.iconBgSize + 'px',
                        borderRadius: a.iconRadius + '%'
                    };
                }

                return el('div', wrapperProps, 
                    iconEl,
                    openIconPicker === 'editor-' + index && renderIconPicker(index)
                );
            }

            // Build stat items
            var statItems = a.items.map(function (item, index) {
                var numberKey = 'number-' + index;
                var labelKey = 'label-' + index;
                var prefixKey = 'prefix-' + index;
                var suffixKey = 'suffix-' + index;

                // Icon
                var iconEl = a.showIcon ? renderIcon(item, index) : null;

                // Number display
                var numberDisplay = formatNumber(item.number, a.separator);
                var prefixEl = item.prefix ? el('span', { className: 'bkbg-sc-prefix' }, item.prefix) : null;
                var suffixEl = item.suffix ? el('span', { className: 'bkbg-sc-suffix' }, item.suffix) : null;

                var numberEl;
                var numberStyle = item.numberColor ? { color: item.numberColor } : {};
                if (editing === numberKey) {
                    numberEl = el('input', {
                        type: 'number',
                        className: 'bkbg-sc-number bkbg-sc-input-active',
                        value: item.number,
                        style: numberStyle,
                        autoFocus: true,
                        onChange: function (e) { 
                            var n = parseInt(e.target.value, 10);
                            if (isNaN(n)) n = 0;
                            updateItem(index, 'number', n);
                        },
                        onBlur: function () { setEditing(null); },
                        onKeyDown: function (e) { if (e.key === 'Enter') setEditing(null); }
                    });
                } else {
                    numberEl = el('span', {
                        className: 'bkbg-sc-number bkbg-sc-clickable',
                        style: numberStyle,
                        onClick: function () { setEditing(numberKey); }
                    }, prefixEl, numberDisplay, suffixEl);
                }

                // Label
                var labelEl = null;
                var labelStyle = item.labelColor ? { color: item.labelColor } : {};
                if (a.showLabel) {
                    if (editing === labelKey) {
                        labelEl = el('input', {
                            type: 'text',
                            className: 'bkbg-sc-label bkbg-sc-input-active',
                            value: item.label,
                            style: labelStyle,
                            autoFocus: true,
                            onChange: function (e) { updateItem(index, 'label', e.target.value); },
                            onBlur: function () { setEditing(null); },
                            onKeyDown: function (e) { if (e.key === 'Enter') setEditing(null); }
                        });
                    } else {
                        labelEl = el('span', {
                            className: 'bkbg-sc-label bkbg-sc-clickable',
                            style: labelStyle,
                            onClick: function () { setEditing(labelKey); }
                        }, item.label || __('Label', 'blockenberg'));
                    }
                }

                // Content wrapper (number + label)
                var contentEl = el('div', { className: 'bkbg-sc-content' },
                    a.labelPosition === 'above' && labelEl,
                    numberEl,
                    a.labelPosition === 'below' && labelEl
                );

                // Item actions (visible on hover)
                var itemActions = el('div', { className: 'bkbg-sc-item-actions-overlay' },
                    el(Button, {
                        icon: 'arrow-left-alt2',
                        size: 'small',
                        disabled: index === 0,
                        onClick: function (e) { e.stopPropagation(); moveItem(index, -1); },
                        label: __('Move Left', 'blockenberg')
                    }),
                    el(Button, {
                        icon: 'admin-page',
                        size: 'small',
                        onClick: function (e) { e.stopPropagation(); duplicateItem(index); },
                        label: __('Duplicate', 'blockenberg')
                    }),
                    el(Button, {
                        icon: 'no-alt',
                        size: 'small',
                        disabled: a.items.length <= 1,
                        onClick: function (e) { 
                            e.stopPropagation(); 
                            if (a.items.length > 1 && window.confirm(__('Delete this stat?', 'blockenberg'))) {
                                removeItem(index); 
                            }
                        },
                        label: __('Delete', 'blockenberg')
                    }),
                    el(Button, {
                        icon: 'arrow-right-alt2',
                        size: 'small',
                        disabled: index === a.items.length - 1,
                        onClick: function (e) { e.stopPropagation(); moveItem(index, 1); },
                        label: __('Move Right', 'blockenberg')
                    })
                );

                var itemClass = 'bkbg-sc-item';
                if (hovered === index) itemClass += ' bkbg-sc-item-hovered';
                if (a.cardStyle) itemClass += ' bkbg-sc-item--card';
                if (a.cardShadow) itemClass += ' bkbg-sc-item--shadow';

                // Build item based on icon position
                var itemContent;
                if (a.iconPosition === 'left' && a.showIcon) {
                    itemContent = el('div', { className: 'bkbg-sc-item-inner bkbg-sc-item-inner--left' },
                        iconEl,
                        contentEl
                    );
                } else if (a.iconPosition === 'right' && a.showIcon) {
                    itemContent = el('div', { className: 'bkbg-sc-item-inner bkbg-sc-item-inner--right' },
                        contentEl,
                        iconEl
                    );
                } else {
                    itemContent = el('div', { className: 'bkbg-sc-item-inner bkbg-sc-item-inner--top' },
                        iconEl,
                        contentEl
                    );
                }

                return el('div', {
                    className: itemClass,
                    key: index,
                    onMouseEnter: function () { setHovered(index); },
                    onMouseLeave: function () { setHovered(null); }
                },
                    itemActions,
                    itemContent
                );
            });

            // Layout classes
            var layoutClass = 'bkbg-sc-wrap bkbg-editor-wrap';
            layoutClass += ' bkbg-sc-' + a.layoutStyle;
            layoutClass += ' bkbg-sc-icon-' + a.iconPosition;
            if (a.divider) layoutClass += ' bkbg-sc-divider';
            if (isSelected) layoutClass += ' bkbg-block-selected';

            var blockProps = useBlockProps({
                className: layoutClass,
                style: wrapStyle,
                'data-layout': a.layoutStyle,
                'data-block-label': 'Stats'
            });

            // Block toolbar
            var blockToolbar = el(BlockControls, {},
                el(ToolbarGroup, {},
                    el(ToolbarButton, {
                        icon: 'plus-alt2',
                        label: __('Add Stat', 'blockenberg'),
                        onClick: addItem
                    })
                )
            );

            // Add button
            var addButton = el('div', { className: 'bkbg-editor-actions' },
                el(Button, {
                    variant: 'secondary',
                    icon: 'plus-alt2',
                    onClick: addItem
                }, __('Add Stat', 'blockenberg'))
            );

            return el(Fragment, {},
                blockToolbar,
                inspector,
                el('div', blockProps,
                    titleEl,
                    el('div', { className: 'bkbg-sc-list' }, statItems),
                    addButton
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            // CSS variables
            var tv = getTypoCssVars();
            var wrapStyle = {
                '--bkbg-sc-columns': a.columns,
                '--bkbg-sc-gap': a.gap + 'px',
                '--bkbg-sc-icon-size': a.iconSize + 'px',
                '--bkbg-sc-icon-bg-size': a.iconBgSize + 'px',
                '--bkbg-sc-icon-radius': a.iconRadius + '%',
                '--bkbg-sc-number-size': a.numberSize + 'px',
                '--bkbg-sc-number-weight': a.numberWeight,
                '--bkbg-sc-number-color': a.numberColor,
                '--bkbg-sc-number-lh': a.numberLineHeight,
                '--bkbg-sc-label-size': a.labelSize + 'px',
                '--bkbg-sc-label-weight': a.labelWeight,
                '--bkbg-sc-label-color': a.labelColor,
                '--bkbg-sc-label-lh': a.labelLineHeight,
                '--bkbg-sc-title-size': a.titleSize + 'px',
                '--bkbg-sc-title-wt': a.titleFontWeight || '700',
                '--bkbg-sc-title-lh': a.titleLineHeight,
                '--bkbg-sc-title-color': a.titleColor,
                '--bkbg-sc-card-bg': a.cardBg,
                '--bkbg-sc-card-border-color': a.cardBorderColor,
                '--bkbg-sc-card-border-width': a.cardBorderWidth + 'px',
                '--bkbg-sc-card-radius': a.cardRadius + 'px',
                '--bkbg-sc-card-padding': a.cardPadding + 'px',
                '--bkbg-sc-divider-color': a.dividerColor,
                '--bkbg-sc-text-align': a.textAlign,
                '--bkbg-sc-animation-duration': a.animationDuration + 'ms'
            };
            Object.assign(wrapStyle, tv(a.titleTypo, '--bksc-tt-'));
            Object.assign(wrapStyle, tv(a.numberTypo, '--bksc-nm-'));
            Object.assign(wrapStyle, tv(a.labelTypo, '--bksc-lb-'));

            // Serialize items for frontend
            var itemsData = a.items.map(function (item) {
                // Handle icon - could be string or object
                var iconStr = item.icon || '';
                if (typeof item.icon === 'object' && item.icon !== null) {
                    iconStr = JSON.stringify(item.icon);
                }
                return [
                    item.number,
                    item.prefix || '',
                    item.suffix || '',
                    item.label || '',
                    iconStr,
                    item.color || '#3b82f6',
                    item.numberColor || '',
                    item.labelColor || ''
                ].join('|');
            }).join(';;');

            // Layout classes
            var layoutClass = 'bkbg-sc-wrap';
            layoutClass += ' bkbg-sc-' + a.layoutStyle;
            layoutClass += ' bkbg-sc-icon-' + a.iconPosition;
            if (a.divider) layoutClass += ' bkbg-sc-divider';

            // Title element
            var titleEl = null;
            if (a.showTitle && a.title) {
                titleEl = el('div', { className: 'bkbg-sc-title' }, a.title);
            }

            return el('div', {
                className: layoutClass,
                style: wrapStyle,
                'data-items': itemsData,
                'data-animate': a.animateOnScroll ? '1' : '0',
                'data-duration': a.animationDuration,
                'data-separator': a.separator,
                'data-show-icon': a.showIcon ? '1' : '0',
                'data-icon-style': a.iconStyle,
                'data-icon-position': a.iconPosition,
                'data-show-label': a.showLabel ? '1' : '0',
                'data-label-position': a.labelPosition,
                'data-card-style': a.cardStyle ? '1' : '0',
                'data-card-shadow': a.cardShadow ? '1' : '0',
                'data-use-item-colors': a.useItemColors ? '1' : '0'
            },
                titleEl,
                el('div', { className: 'bkbg-sc-list' })
            );
        }
    });
}() );
