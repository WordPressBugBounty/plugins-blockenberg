( function () {
    var el = wp.element.createElement;
    var useEffect = wp.element.useEffect;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var BlockControls = wp.blockEditor.BlockControls;
    var BlockAlignmentToolbar = wp.blockEditor.BlockAlignmentToolbar;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InnerBlocks = wp.blockEditor.InnerBlocks;
    var PanelBody = wp.components.PanelBody;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var ToolbarGroup = wp.components.ToolbarGroup;
    var ToolbarButton = wp.components.ToolbarButton;
    var ColorPalette = wp.components.ColorPalette;
    var BaseControl = wp.components.BaseControl;

    // Background presets
    var backgroundOptions = [
        { label: __('None', 'blockenberg'), value: 'none' },
        { label: __('Light', 'blockenberg'), value: 'light' },
        { label: __('Dark', 'blockenberg'), value: 'dark' },
        { label: __('Accent', 'blockenberg'), value: 'accent' },
        { label: __('Custom', 'blockenberg'), value: 'custom' }
    ];

    // Max width options
    var maxWidthOptions = [
        { label: '1024px', value: '1024px' },
        { label: '1200px', value: '1200px' },
        { label: '1440px', value: '1440px' }
    ];

    var spacingUnitOptions = [
        { label: 'px', value: 'px' },
        { label: '%', value: '%' },
        { label: 'em', value: 'em' },
        { label: 'rem', value: 'rem' },
        { label: 'vw', value: 'vw' },
        { label: 'vh', value: 'vh' },
        { label: __('Custom', 'blockenberg'), value: 'custom' }
    ];

    function cssLength(value) {
        if (value === undefined || value === null) return undefined;
        var v = String(value).trim();
        if (!v) return undefined;
        // Back-compat: if stored as a number ("1200"), treat as px.
        if (/^\d+(?:\.\d+)?$/.test(v)) return v + 'px';
        return v;
    }

    function getSpacingSideValue(attrs, type, side) {
        var cap = side.charAt(0).toUpperCase() + side.slice(1);
        var value = attrs[type + cap];
        var unit = attrs[type + cap + 'Unit'] || 'px';
        var customUnit = attrs[type + cap + 'CustomUnit'] || '';

        if (value === undefined || value === null) return undefined;
        var raw = String(value).trim();
        if (!raw) return undefined;

        if (unit === 'custom') {
            return customUnit ? raw + customUnit : raw;
        }

        return raw + unit;
    }

    function getSpacingStyles(attrs) {
        return {
            paddingTop: getSpacingSideValue(attrs, 'padding', 'top'),
            paddingRight: getSpacingSideValue(attrs, 'padding', 'right'),
            paddingBottom: getSpacingSideValue(attrs, 'padding', 'bottom'),
            paddingLeft: getSpacingSideValue(attrs, 'padding', 'left'),
            marginTop: getSpacingSideValue(attrs, 'margin', 'top'),
            marginRight: getSpacingSideValue(attrs, 'margin', 'right'),
            marginBottom: getSpacingSideValue(attrs, 'margin', 'bottom'),
            marginLeft: getSpacingSideValue(attrs, 'margin', 'left')
        };
    }

    // Section icon
    var sectionIcon = el('svg', { 
        width: 24, 
        height: 24, 
        viewBox: '0 0 24 24', 
        xmlns: 'http://www.w3.org/2000/svg' 
    },
        el('path', { 
            d: 'M3 5h18v2H3V5zm0 12h18v2H3v-2zm0-6h18v2H3v-2z',
            fill: 'currentColor'
        })
    );

    registerBlockType('blockenberg/section', {
        title: __('Section', 'blockenberg'),
        icon: sectionIcon,
        category: 'bkbg-layout',
        description: __('A container section for organizing content with rows and columns.', 'blockenberg'),
        
        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            // Back-compat: if existing content used core align, map it to sectionWidth.
            // (We keep this local to avoid mutating saved content unless user changes settings.)
            var effectiveSectionWidth = a.sectionWidth;
            if (!effectiveSectionWidth) {
                if (a.align === 'full') effectiveSectionWidth = 'full';
                else if (a.align === 'wide') effectiveSectionWidth = 'wide';
                else effectiveSectionWidth = 'default';
            }

            // Keep core alignment in sync so the editor wrapper can actually change width.
            // For "boxed" we intentionally use "wide" to give the block room in the editor,
            // while our own max-width controls the final visual width.
            var nextAlign = (effectiveSectionWidth === 'full')
                ? 'full'
                : (effectiveSectionWidth === 'wide' || effectiveSectionWidth === 'boxed')
                    ? 'wide'
                    : undefined;

            useEffect(function () {
                if (a.align !== nextAlign) {
                    setAttributes({ align: nextAlign });
                }
            }, [effectiveSectionWidth]);

            var blockProps = useBlockProps({
                className: [
                    'bkbg-section',
                    'bkbg-section--section-' + effectiveSectionWidth,
                    'bkbg-section--content-' + a.contentWidth,
                    'bkbg-section--padding-' + a.paddingY,
                    'bkbg-section--bg-' + a.background
                ].join(' '),
                style: Object.assign({}, {
                    '--bkbg-section-section-max-width': cssLength(a.sectionBoxedMaxWidth || a.boxedMaxWidth),
                    '--bkbg-section-max-width': cssLength(a.boxedMaxWidth),
                    '--bkbg-section-custom-bg': a.backgroundColor || undefined
                }, getSpacingStyles(a))
            });

            function renderSpacingControl(type, label) {
                var sides = [
                    { key: 'Top', label: __('Top', 'blockenberg') },
                    { key: 'Left', label: __('Left', 'blockenberg') },
                    { key: 'Bottom', label: __('Bottom', 'blockenberg') },
                    { key: 'Right', label: __('Right', 'blockenberg') }
                ];

                return el('div', { className: 'bkbg-spacing-control' },
                    el('div', { className: 'bkbg-spacing-control__title' }, label),
                    el('div', { className: 'bkbg-spacing-control__grid' },
                        sides.map(function (side) {
                            var valueKey = type + side.key;
                            var unitKey = type + side.key + 'Unit';
                            var customUnitKey = type + side.key + 'CustomUnit';

                            return el('div', { className: 'bkbg-spacing-control__item', key: valueKey },
                                el('label', { className: 'bkbg-spacing-control__label' }, side.label),
                                el('div', { className: 'bkbg-spacing-control__row' },
                                    el('input', {
                                        type: 'text',
                                        className: 'components-text-control__input',
                                        value: a[valueKey] || '',
                                        placeholder: '0',
                                        onChange: function (e) {
                                            var next = {};
                                            next[valueKey] = e.target.value;
                                            setAttributes(next);
                                        }
                                    }),
                                    el('select', {
                                        className: 'components-select-control__input',
                                        value: a[unitKey] || 'px',
                                        onChange: function (e) {
                                            var next = {};
                                            next[unitKey] = e.target.value;
                                            setAttributes(next);
                                        }
                                    }, spacingUnitOptions.map(function (opt) {
                                        return el('option', { key: opt.value, value: opt.value }, opt.label);
                                    }))
                                ),
                                (a[unitKey] || 'px') === 'custom' && el('input', {
                                    type: 'text',
                                    className: 'components-text-control__input bkbg-spacing-control__custom-unit',
                                    value: a[customUnitKey] || '',
                                    placeholder: __('unit, e.g. ch', 'blockenberg'),
                                    onChange: function (e) {
                                        var next = {};
                                        next[customUnitKey] = e.target.value;
                                        setAttributes(next);
                                    }
                                })
                            );
                        })
                    )
                );
            }

            // Max width UI modes (preset vs custom)
            var presetMaxWidthValues = maxWidthOptions.map(function (o) { return o.value; });
            var sectionMaxWidthValue = a.sectionBoxedMaxWidth || a.boxedMaxWidth || '';
            var contentMaxWidthValue = a.boxedMaxWidth || '';

            var initialSectionMode = presetMaxWidthValues.indexOf(sectionMaxWidthValue) !== -1 ? 'preset' : 'custom';
            var initialContentMode = presetMaxWidthValues.indexOf(contentMaxWidthValue) !== -1 ? 'preset' : 'custom';

            var _sectionModeState = useState(initialSectionMode);
            var sectionMaxWidthMode = _sectionModeState[0];
            var setSectionMaxWidthMode = _sectionModeState[1];

            var _contentModeState = useState(initialContentMode);
            var contentMaxWidthMode = _contentModeState[0];
            var setContentMaxWidthMode = _contentModeState[1];

            // If something external changes the value to a non-preset, ensure UI switches to custom.
            useEffect(function () {
                if (presetMaxWidthValues.indexOf(sectionMaxWidthValue) === -1 && sectionMaxWidthMode !== 'custom') {
                    setSectionMaxWidthMode('custom');
                }
            }, [sectionMaxWidthValue]);

            useEffect(function () {
                if (presetMaxWidthValues.indexOf(contentMaxWidthValue) === -1 && contentMaxWidthMode !== 'custom') {
                    setContentMaxWidthMode('custom');
                }
            }, [contentMaxWidthValue]);

            // Toolbar controls - Section alignment + Content width
            var toolbarAlignValue = (effectiveSectionWidth === 'full' || effectiveSectionWidth === 'wide')
                ? effectiveSectionWidth
                : undefined;
            var toolbar = el(BlockControls, { group: 'block' },
                el(BlockAlignmentToolbar, {
                    value: toolbarAlignValue,
                    onChange: function (v) {
                        // Only wide/full are controlled in the toolbar.
                        // Clearing alignment goes to "default".
                        var next = v ? v : 'default';
                        setAttributes({ sectionWidth: next });
                    },
                    controls: ['wide', 'full']
                })
            );

            // Inspector controls
            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Section Settings', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Section Width', 'blockenberg'),
                        help: __('Controls the width of the section itself (background). Default uses the theme content area. Wide uses the theme\'s wide width (wideSize).', 'blockenberg'),
                        value: effectiveSectionWidth,
                        options: [
                            { label: __('Full Width', 'blockenberg'), value: 'full' },
                            { label: __('Wide', 'blockenberg'), value: 'wide' },
                            { label: __('Boxed', 'blockenberg'), value: 'boxed' },
                            { label: __('Default', 'blockenberg'), value: 'default' }
                        ],
                        onChange: function (v) { setAttributes({ sectionWidth: v }); }
                    }),
                    effectiveSectionWidth === 'boxed' && el(wp.element.Fragment, {},
                        el(SelectControl, {
                            label: __('Section Max Width', 'blockenberg'),
                            value: sectionMaxWidthMode === 'custom' ? 'custom' : sectionMaxWidthValue,
                            options: maxWidthOptions.concat([
                                { label: __('Custom', 'blockenberg'), value: 'custom' }
                            ]),
                            onChange: function (v) {
                                if (v === 'custom') {
                                    setSectionMaxWidthMode('custom');
                                    return;
                                }
                                setSectionMaxWidthMode('preset');
                                setAttributes({ sectionBoxedMaxWidth: v });
                            }
                        }),
                        sectionMaxWidthMode === 'custom' && el(TextControl, {
                            label: __('Custom Section Max Width', 'blockenberg'),
                            help: __('Any CSS length, e.g. 1200px, 72rem, 90%, 80vw', 'blockenberg'),
                            value: sectionMaxWidthValue,
                            onChange: function (v) {
                                setSectionMaxWidthMode('custom');
                                setAttributes({ sectionBoxedMaxWidth: v });
                            }
                        })
                    ),
                    el(SelectControl, {
                        label: __('Content Width', 'blockenberg'),
                        help: __('Controls the width of the content inside the section.', 'blockenberg'),
                        value: a.contentWidth,
                        options: [
                            { label: __('Boxed', 'blockenberg'), value: 'boxed' },
                            { label: __('Full Width', 'blockenberg'), value: 'full' }
                        ],
                        onChange: function (v) { setAttributes({ contentWidth: v }); }
                    }),
                    a.contentWidth === 'boxed' && el(wp.element.Fragment, {},
                        el(SelectControl, {
                            label: __('Content Max Width', 'blockenberg'),
                            value: contentMaxWidthMode === 'custom' ? 'custom' : contentMaxWidthValue,
                            options: maxWidthOptions.concat([
                                { label: __('Custom', 'blockenberg'), value: 'custom' }
                            ]),
                            onChange: function (v) {
                                if (v === 'custom') {
                                    setContentMaxWidthMode('custom');
                                    return;
                                }
                                setContentMaxWidthMode('preset');
                                setAttributes({ boxedMaxWidth: v });
                            }
                        }),
                        contentMaxWidthMode === 'custom' && el(TextControl, {
                            label: __('Custom Content Max Width', 'blockenberg'),
                            help: __('Any CSS length, e.g. 1200px, 72rem, 90%, 80vw', 'blockenberg'),
                            value: contentMaxWidthValue,
                            onChange: function (v) {
                                setContentMaxWidthMode('custom');
                                setAttributes({ boxedMaxWidth: v });
                            }
                        })
                    ),
                )
            );

            // Inner blocks template - only allow Row blocks
            var innerBlocksTemplate = [
                ['blockenberg/row', { columnsCount: 1 }]
            ];
            var allowedBlocks = ['blockenberg/row'];

            return el('div', blockProps,
                toolbar,
                inspector,
                el('div', { className: 'bkbg-section__inner' },
                    el(InnerBlocks, {
                        template: innerBlocksTemplate,
                        allowedBlocks: allowedBlocks,
                        templateLock: false,
                        renderAppender: false
                    })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = useBlockProps.save({
                className: [
                    'bkbg-section',
                    'bkbg-section--section-' + (a.sectionWidth || (a.align ? (a.align === 'full' ? 'full' : (a.align === 'wide' ? 'wide' : 'default')) : 'full')),
                    'bkbg-section--content-' + a.contentWidth,
                    'bkbg-section--padding-' + a.paddingY,
                    'bkbg-section--bg-' + a.background
                ].join(' '),
                style: Object.assign({}, {
                    '--bkbg-section-section-max-width': cssLength(a.sectionBoxedMaxWidth || a.boxedMaxWidth),
                    '--bkbg-section-max-width': cssLength(a.boxedMaxWidth),
                    '--bkbg-section-custom-bg': a.backgroundColor || undefined
                }, getSpacingStyles(a))
            });

            return el('div', blockProps,
                el('div', { className: 'bkbg-section__inner' },
                    el(InnerBlocks.Content)
                )
            );
        }
    });
}() );
