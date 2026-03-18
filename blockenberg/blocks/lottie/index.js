( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody    = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl  = wp.components.TextControl;
    var ColorPicker  = wp.components.ColorPicker;
    var Popover      = wp.components.Popover;
    var Notice       = wp.components.Notice;

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', title: value || 'none', onClick: function () { setOpenKey(isOpen ? null : key); }, style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || 'transparent' } }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } }, el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange }))
                )
            )
        );
    }

    registerBlockType('blockenberg/lottie', {
        title: __('Lottie Animation', 'blockenberg'),
        icon: 'format-video',
        category: 'bkbg-media',
        description: __('Play a Lottie JSON animation with flexible trigger modes.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorState = useState(null);
            var openColorKey = openColorState[0];
            var setOpenColorKey = openColorState[1];

            function sa(obj) { setAttributes(obj); }

            var blockProps = useBlockProps({ className: 'bkbg-lt-outer bkbg-lt-align-' + a.align });

            var wrapStyle = {
                width  : a.autoWidth  ? '100%' : (a.width + 'px'),
                height : a.autoHeight ? 'auto' : (a.height + 'px'),
                background   : a.bgColor || 'transparent',
                borderRadius : a.borderRadius + 'px',
                padding      : a.padding + 'px',
                boxSizing    : 'border-box'
            };

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Animation Source', 'blockenberg'), initialOpen: true },
                    el(TextControl, {
                        label: __('Lottie JSON URL', 'blockenberg'),
                        value: a.lottieUrl,
                        onChange: function (v) { sa({ lottieUrl: v }); },
                        placeholder: 'https://assets…/animation.json',
                        help: __('Enter the URL of a Lottie JSON file (e.g. from LottieFiles.com).', 'blockenberg')
                    })
                ),

                el(PanelBody, { title: __('Playback', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Play Trigger', 'blockenberg'), value: a.playTrigger,
                        options: [
                            { label: __('Autoplay', 'blockenberg'),       value: 'autoplay' },
                            { label: __('On Hover', 'blockenberg'),       value: 'hover' },
                            { label: __('On Click', 'blockenberg'),       value: 'click' },
                            { label: __('On Scroll into View', 'blockenberg'), value: 'scroll' }
                        ],
                        onChange: function (v) { sa({ playTrigger: v }); }
                    }),
                    el(ToggleControl, { label: __('Loop', 'blockenberg'), checked: a.loop, onChange: function (v) { sa({ loop: v }); } }),
                    el(RangeControl, { label: __('Speed', 'blockenberg'), value: a.speed, min: 0.1, max: 4, step: 0.1, onChange: function (v) { sa({ speed: v }); } }),
                    el(SelectControl, {
                        label: __('Direction', 'blockenberg'), value: a.direction,
                        options: [{ label: __('Forward', 'blockenberg'), value: '1' }, { label: __('Reverse', 'blockenberg'), value: '-1' }],
                        onChange: function (v) { sa({ direction: v }); }
                    }),
                    !a.loop && el(ToggleControl, { label: __('Freeze on Last Frame', 'blockenberg'), checked: a.keepLastFrame, onChange: function (v) { sa({ keepLastFrame: v }); } })
                ),

                el(PanelBody, { title: __('Size & Layout', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Full container width', 'blockenberg'), checked: a.autoWidth, onChange: function (v) { sa({ autoWidth: v }); } }),
                    !a.autoWidth && el(RangeControl, { label: __('Width (px)', 'blockenberg'), value: a.width, min: 80, max: 1200, onChange: function (v) { sa({ width: v }); } }),
                    el(ToggleControl, { label: __('Auto height (preserve ratio)', 'blockenberg'), checked: a.autoHeight, onChange: function (v) { sa({ autoHeight: v }); } }),
                    !a.autoHeight && el(RangeControl, { label: __('Height (px)', 'blockenberg'), value: a.height, min: 80, max: 1000, onChange: function (v) { sa({ height: v }); } }),
                    !a.autoWidth && el(SelectControl, {
                        label: __('Alignment', 'blockenberg'), value: a.align,
                        options: [{ label: __('Left', 'blockenberg'), value: 'left' }, { label: __('Center', 'blockenberg'), value: 'center' }, { label: __('Right', 'blockenberg'), value: 'right' }],
                        onChange: function (v) { sa({ align: v }); }
                    }),
                    el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: a.borderRadius, min: 0, max: 60, onChange: function (v) { sa({ borderRadius: v }); } }),
                    el(RangeControl, { label: __('Padding (px)', 'blockenberg'), value: a.padding, min: 0, max: 80, onChange: function (v) { sa({ padding: v }); } }),
                    renderColorControl('bgColor', __('Background Color', 'blockenberg'), a.bgColor, function (v) { sa({ bgColor: v }); }, openColorKey, setOpenColorKey)
                )
            );

            /* ── Editor preview: can't run Lottie in editor, show placeholder ── */
            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-lt-wrap', style: wrapStyle },
                        a.lottieUrl
                            ? el('div', { className: 'bkbg-lt-editor-preview' },
                                el('span', { className: 'dashicons dashicons-format-video', style: { fontSize: '48px', color: '#6b7280', display: 'block' } }),
                                el('p', { style: { fontSize: '12px', color: '#6b7280', margin: '8px 0 0' } }, __('Lottie animation will play on the front end.', 'blockenberg')),
                                el('p', { style: { fontSize: '11px', color: '#9ca3af', margin: '2px 0 0', wordBreak: 'break-all' } }, a.lottieUrl)
                              )
                            : el('div', { className: 'bkbg-lt-editor-preview bkbg-lt-empty' },
                                el('span', { className: 'dashicons dashicons-format-video', style: { fontSize: '48px', color: '#d1d5db', display: 'block' } }),
                                el('p', { style: { fontSize: '13px', color: '#9ca3af', margin: '8px 0 0' } }, __('Paste a Lottie JSON URL in the panel →', 'blockenberg'))
                              )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            var saveProps = wp.blockEditor.useBlockProps.save({
                className : 'bkbg-lt-outer bkbg-lt-align-' + a.align,
                'data-src'        : a.lottieUrl,
                'data-trigger'    : a.playTrigger,
                'data-loop'       : a.loop ? '1' : '0',
                'data-speed'      : a.speed,
                'data-direction'  : a.direction,
                'data-keep-frame' : a.keepLastFrame ? '1' : '0'
            });

            return el('div', saveProps,
                el('div', {
                    className: 'bkbg-lt-wrap',
                    style: {
                        width        : a.autoWidth  ? '100%' : (a.width + 'px'),
                        height       : a.autoHeight ? 'auto' : (a.height + 'px'),
                        background   : a.bgColor || undefined,
                        borderRadius : a.borderRadius ? (a.borderRadius + 'px') : undefined,
                        padding      : a.padding ? (a.padding + 'px') : undefined,
                        boxSizing    : 'border-box'
                    }
                },
                    el('div', { className: 'bkbg-lt-player' })
                )
            );
        }
    });
}() );
