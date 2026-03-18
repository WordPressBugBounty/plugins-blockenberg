( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;

    var _tc, _tvf;
    Object.defineProperty(window, '_bkbgTypoCtrlCache', { get: function () { if (!_tc) { _tc = window.bkbgTypographyControl; } return _tc; } });
    Object.defineProperty(window, '_bkbgTypoVarsCache', { get: function () { if (!_tvf) { _tvf = window.bkbgTypoCssVars; } return _tvf; } });
    function getTypoControl(props, attrName, label) { return window._bkbgTypoCtrlCache(props, attrName, label); }

    var icons = {
        chevron: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
        plus: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        arrow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>'
    };

    function getIconEl(type) {
        if (type === 'none') return null;
        return el('span', {
            className: 'bkbg-tgl-icon',
            'aria-hidden': 'true',
            dangerouslySetInnerHTML: { __html: icons[type] || icons.chevron }
        });
    }

    var iconTypeOptions = [
        { label: __('Chevron', 'blockenberg'), value: 'chevron' },
        { label: __('Plus / Minus', 'blockenberg'), value: 'plus' },
        { label: __('Arrow', 'blockenberg'), value: 'arrow' },
        { label: __('None', 'blockenberg'), value: 'none' }
    ];

    var iconPositionOptions = [
        { label: __('Right', 'blockenberg'), value: 'right' },
        { label: __('Left', 'blockenberg'), value: 'left' }
    ];

    var layoutOptions = [
        { label: __('Default', 'blockenberg'), value: 'default' },
        { label: __('Boxed', 'blockenberg'), value: 'boxed' },
        { label: __('Minimal', 'blockenberg'), value: 'minimal' },
        { label: __('Bordered Left', 'blockenberg'), value: 'bordered' }
    ];

    var titleTagOptions = [
        { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' },
        { label: 'H5', value: 'h5' },
        { label: 'H6', value: 'h6' },
        { label: 'p', value: 'p' },
        { label: 'div', value: 'div' }
    ];

    registerBlockType('blockenberg/toggle', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var isOpen = useState(a.defaultOpen)[0];

            var wrapStyle = {
                '--bkbg-tgl-radius': a.borderRadius + 'px',
                '--bkbg-tgl-padding': a.padding + 'px',
                '--bkbg-tgl-speed': a.animationSpeed + 'ms',
                '--bkbg-tgl-title-color': a.titleColor,
                '--bkbg-tgl-title-bg': a.titleBg,
                '--bkbg-tgl-title-hover-bg': a.titleHoverBg,
                '--bkbg-tgl-active-title-bg': a.activeTitleBg,
                '--bkbg-tgl-active-title-color': a.activeTitleColor,
                '--bkbg-tgl-content-color': a.contentColor,
                '--bkbg-tgl-content-bg': a.contentBg,
                '--bkbg-tgl-icon-color': a.iconColor,
                '--bkbg-tgl-icon-active-color': a.iconActiveColor,
                '--bkbg-tgl-border-color': a.borderColor,
                '--bkbg-tgl-divider-color': a.dividerColor
            };
            Object.assign(wrapStyle, window._bkbgTypoVarsCache(a.titleTypo, '--bktgl-tt-'), window._bkbgTypoVarsCache(a.contentTypo, '--bktgl-ct-'));

            var blockProps = useBlockProps({
                className: 'bkbg-tgl-wrap bkbg-tgl-editor' + (isOpen ? ' is-open' : ''),
                style: wrapStyle,
                'data-layout': a.layout,
                'data-icon': a.iconType,
                'data-icon-pos': a.iconPosition
            });

            var inspector = el(InspectorControls, {},

                el(PanelBody, { title: __('Toggle Settings', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Open by default', 'blockenberg'),
                        help: __('Start the toggle in expanded state on page load.', 'blockenberg'),
                        checked: a.defaultOpen,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ defaultOpen: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Title Tag', 'blockenberg'),
                        value: a.titleTag,
                        options: titleTagOptions,
                        onChange: function (v) { setAttributes({ titleTag: v }); }
                    })
                ),

                el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'),
                        value: a.layout,
                        options: layoutOptions,
                        onChange: function (v) { setAttributes({ layout: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Icon Type', 'blockenberg'),
                        value: a.iconType,
                        options: iconTypeOptions,
                        onChange: function (v) { setAttributes({ iconType: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Icon Position', 'blockenberg'),
                        value: a.iconPosition,
                        options: iconPositionOptions,
                        onChange: function (v) { setAttributes({ iconPosition: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: a.borderRadius,
                        min: 0, max: 24,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding (px)', 'blockenberg'),
                        value: a.padding,
                        min: 8, max: 48,
                        onChange: function (v) { setAttributes({ padding: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Animation Speed (ms)', 'blockenberg'),
                        value: a.animationSpeed,
                        min: 0, max: 800, step: 50,
                        onChange: function (v) { setAttributes({ animationSpeed: v }); }
                    })
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl(props, 'titleTypo', __('Title', 'blockenberg')),
                    getTypoControl(props, 'contentTypo', __('Content', 'blockenberg'))
                ),

                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Title Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.titleColor, onChange: function (c) { setAttributes({ titleColor: c || '#111827' }); }, label: __('Text', 'blockenberg') },
                            { value: a.titleBg, onChange: function (c) { setAttributes({ titleBg: c || '#ffffff' }); }, label: __('Background', 'blockenberg') },
                            { value: a.titleHoverBg, onChange: function (c) { setAttributes({ titleHoverBg: c || '#f9fafb' }); }, label: __('Background (Hover)', 'blockenberg') },
                            { value: a.activeTitleColor, onChange: function (c) { setAttributes({ activeTitleColor: c || '#1d4ed8' }); }, label: __('Text (Open)', 'blockenberg') },
                            { value: a.activeTitleBg, onChange: function (c) { setAttributes({ activeTitleBg: c || '#eff6ff' }); }, label: __('Background (Open)', 'blockenberg') }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Content Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.contentColor, onChange: function (c) { setAttributes({ contentColor: c || '#374151' }); }, label: __('Text', 'blockenberg') },
                            { value: a.contentBg, onChange: function (c) { setAttributes({ contentBg: c || '#ffffff' }); }, label: __('Background', 'blockenberg') }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Icon & Border Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.iconColor, onChange: function (c) { setAttributes({ iconColor: c || '#6b7280' }); }, label: __('Icon', 'blockenberg') },
                            { value: a.iconActiveColor, onChange: function (c) { setAttributes({ iconActiveColor: c || '#2563eb' }); }, label: __('Icon (Open)', 'blockenberg') },
                            { value: a.borderColor, onChange: function (c) { setAttributes({ borderColor: c || '#e5e7eb' }); }, label: __('Border', 'blockenberg') },
                            { value: a.dividerColor, onChange: function (c) { setAttributes({ dividerColor: c || '#f3f4f6' }); }, label: __('Divider', 'blockenberg') }
                        ]
                    })
                )
            );

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('button', {
                        className: 'bkbg-tgl-trigger',
                        'aria-expanded': isOpen ? 'true' : 'false'
                    },
                        a.iconPosition === 'left' && getIconEl(a.iconType),
                        el(a.titleTag, { className: 'bkbg-tgl-title' },
                            el(TextControl, {
                                value: a.title,
                                onChange: function (v) { setAttributes({ title: v }); },
                                placeholder: __('Toggle title...', 'blockenberg'),
                                hideLabelFromVision: true,
                                label: __('Toggle Title', 'blockenberg')
                            })
                        ),
                        a.iconPosition === 'right' && getIconEl(a.iconType)
                    ),
                    el('div', { className: 'bkbg-tgl-content', 'aria-hidden': isOpen ? 'false' : 'true' },
                        el('div', { className: 'bkbg-tgl-content-inner' },
                            el(RichText, {
                                tagName: 'div',
                                className: 'bkbg-tgl-body',
                                value: a.content,
                                onChange: function (v) { setAttributes({ content: v }); },
                                placeholder: __('Add toggle content here...', 'blockenberg')
                            })
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var RichTextContent = wp.blockEditor.RichText.Content;

            var wrapParts = [
                '--bkbg-tgl-radius:' + a.borderRadius + 'px',
                '--bkbg-tgl-padding:' + a.padding + 'px',
                '--bkbg-tgl-speed:' + a.animationSpeed + 'ms',
                '--bkbg-tgl-title-color:' + a.titleColor,
                '--bkbg-tgl-title-bg:' + a.titleBg,
                '--bkbg-tgl-title-hover-bg:' + a.titleHoverBg,
                '--bkbg-tgl-active-title-bg:' + a.activeTitleBg,
                '--bkbg-tgl-active-title-color:' + a.activeTitleColor,
                '--bkbg-tgl-content-color:' + a.contentColor,
                '--bkbg-tgl-content-bg:' + a.contentBg,
                '--bkbg-tgl-icon-color:' + a.iconColor,
                '--bkbg-tgl-icon-active-color:' + a.iconActiveColor,
                '--bkbg-tgl-border-color:' + a.borderColor,
                '--bkbg-tgl-divider-color:' + a.dividerColor
            ];
            var tv = Object.assign({}, window._bkbgTypoVarsCache(a.titleTypo, '--bktgl-tt-'), window._bkbgTypoVarsCache(a.contentTypo, '--bktgl-ct-'));
            Object.keys(tv).forEach(function (k) { wrapParts.push(k + ':' + tv[k]); });
            var wrapStyle = wrapParts.join(';');

            var iconSvgs = {
                chevron: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
                plus: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
                arrow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>'
            };

            var iconEl = a.iconType !== 'none' ? el('span', {
                className: 'bkbg-tgl-icon',
                'aria-hidden': 'true',
                dangerouslySetInnerHTML: { __html: iconSvgs[a.iconType] || iconSvgs.chevron }
            }) : null;

            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-tgl-wrap' + (a.defaultOpen ? ' is-open' : ''),
                style: wrapStyle,
                'data-layout': a.layout,
                'data-icon': a.iconType,
                'data-icon-pos': a.iconPosition,
                'data-default-open': a.defaultOpen ? '1' : '0',
                'data-speed': a.animationSpeed
            });

            return el('div', blockProps,
                el('button', {
                    className: 'bkbg-tgl-trigger',
                    'aria-expanded': a.defaultOpen ? 'true' : 'false'
                },
                    a.iconPosition === 'left' && iconEl,
                    el(a.titleTag, { className: 'bkbg-tgl-title' }, a.title),
                    a.iconPosition === 'right' && iconEl
                ),
                el('div', {
                    className: 'bkbg-tgl-content',
                    'aria-hidden': a.defaultOpen ? 'false' : 'true'
                },
                    el('div', { className: 'bkbg-tgl-content-inner' },
                        el(RichTextContent, { tagName: 'div', className: 'bkbg-tgl-body', value: a.content })
                    )
                )
            );
        }
    });
}() );
