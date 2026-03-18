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
    var Button = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var sizeOptions = [
        { label: __('Small (480px)', 'blockenberg'), value: 'sm' },
        { label: __('Medium (640px)', 'blockenberg'), value: 'md' },
        { label: __('Large (800px)', 'blockenberg'), value: 'lg' },
        { label: __('Extra Large (1100px)', 'blockenberg'), value: 'xl' },
        { label: __('Full Screen', 'blockenberg'), value: 'full' }
    ];

    var animationOptions = [
        { label: __('Zoom In', 'blockenberg'), value: 'zoom' },
        { label: __('Slide Up', 'blockenberg'), value: 'slide-up' },
        { label: __('Slide Down', 'blockenberg'), value: 'slide-down' },
        { label: __('Fade', 'blockenberg'), value: 'fade' },
        { label: __('None', 'blockenberg'), value: 'none' }
    ];

    var triggerModeOptions = [
        { label: __('Click (manual)', 'blockenberg'), value: 'click' },
        { label: __('Auto (after delay)', 'blockenberg'), value: 'auto' }
    ];

    var btnStyleOptions = [
        { label: __('Primary (filled)', 'blockenberg'), value: 'primary' },
        { label: __('Outline', 'blockenberg'), value: 'outline' },
        { label: __('Ghost / Text', 'blockenberg'), value: 'ghost' }
    ];

    var btnSizeOptions = [
        { label: __('Small', 'blockenberg'), value: 'sm' },
        { label: __('Medium', 'blockenberg'), value: 'md' },
        { label: __('Large', 'blockenberg'), value: 'lg' }
    ];

    var alignOptions = [
        { label: __('Left', 'blockenberg'), value: 'left' },
        { label: __('Center', 'blockenberg'), value: 'center' },
        { label: __('Right', 'blockenberg'), value: 'right' }
    ];

    registerBlockType('blockenberg/modal', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var previewOpen = useState(false);
            var isPreviewOpen = previewOpen[0];
            var setPreviewOpen = previewOpen[1];

            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {
                    '--bkbg-modal-bg': a.modalBg,
                    '--bkbg-modal-radius': a.modalRadius + 'px',
                    '--bkbg-modal-padding': a.modalPadding + 'px',
                    '--bkbg-modal-title-size': a.titleSize + 'px',
                    '--bkbg-modal-title-weight': a.titleWeight,
                    '--bkbg-modal-title-color': a.titleColor,
                    '--bkbg-modal-content-size': a.contentSize + 'px',
                    '--bkbg-modal-content-color': a.contentColor,
                    '--bkbg-modal-content-lh': a.contentLineHeight,
                    '--bkbg-modal-title-lh': a.titleLineHeight,
                    '--bkbg-modal-close-color': a.closeBtnColor,
                    '--bkbg-modal-close-hover': a.closeBtnHoverColor,
                    '--bkbg-modal-overlay-bg': a.overlayBg,
                    '--bkbg-modal-btn-bg': a.triggerBtnBg,
                    '--bkbg-modal-btn-color': a.triggerBtnColor,
                    '--bkbg-modal-btn-radius': a.triggerBtnRadius + 'px'
                };
                Object.assign(s, _tvf(a.titleTypo, '--bkbg-modal-tt-'));
                Object.assign(s, _tvf(a.bodyTypo, '--bkbg-modal-bd-'));
                return { className: 'bkbg-modal-block', style: s, 'data-trigger-align': a.triggerAlignment };
            })());

            var inspector = el(InspectorControls, {},

                el(PanelBody, { title: __('Trigger Button', 'blockenberg'), initialOpen: true },
                    el(TextControl, {
                        label: __('Button Label', 'blockenberg'),
                        value: a.triggerLabel,
                        onChange: function (v) { setAttributes({ triggerLabel: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Button Style', 'blockenberg'),
                        value: a.triggerBtnStyle,
                        options: btnStyleOptions,
                        onChange: function (v) { setAttributes({ triggerBtnStyle: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Button Size', 'blockenberg'),
                        value: a.triggerBtnSize,
                        options: btnSizeOptions,
                        onChange: function (v) { setAttributes({ triggerBtnSize: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Alignment', 'blockenberg'),
                        value: a.triggerAlignment,
                        options: alignOptions,
                        onChange: function (v) { setAttributes({ triggerAlignment: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: a.triggerBtnRadius,
                        min: 0, max: 50,
                        onChange: function (v) { setAttributes({ triggerBtnRadius: v }); }
                    })
                ),

                el(PanelBody, { title: __('Modal Content', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Modal Title', 'blockenberg'),
                        value: a.modalTitle,
                        onChange: function (v) { setAttributes({ modalTitle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Header', 'blockenberg'),
                        checked: a.showHeader,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showHeader: v }); }
                    })
                ),

                el(PanelBody, { title: __('Modal Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Modal Size', 'blockenberg'),
                        value: a.modalSize,
                        options: sizeOptions,
                        onChange: function (v) { setAttributes({ modalSize: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Open Animation', 'blockenberg'),
                        value: a.animation,
                        options: animationOptions,
                        onChange: function (v) { setAttributes({ animation: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Modal Border Radius (px)', 'blockenberg'),
                        value: a.modalRadius, min: 0, max: 32,
                        onChange: function (v) { setAttributes({ modalRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Modal Padding (px)', 'blockenberg'),
                        value: a.modalPadding, min: 12, max: 64,
                        onChange: function (v) { setAttributes({ modalPadding: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Blur Overlay Background', 'blockenberg'),
                        checked: a.overlayBlur,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ overlayBlur: v }); }
                    })
                ),

                el(PanelBody, { title: __('Behavior', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Trigger Mode', 'blockenberg'),
                        value: a.triggerMode,
                        options: triggerModeOptions,
                        onChange: function (v) { setAttributes({ triggerMode: v }); }
                    }),
                    a.triggerMode === 'auto' && el(RangeControl, {
                        label: __('Auto Open Delay (ms)', 'blockenberg'),
                        value: a.autoDelay, min: 0, max: 15000, step: 500,
                        onChange: function (v) { setAttributes({ autoDelay: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Close Button', 'blockenberg'),
                        checked: a.showCloseBtn,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showCloseBtn: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Close on Overlay Click', 'blockenberg'),
                        checked: a.closeOnOverlay,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ closeOnOverlay: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Close on Escape Key', 'blockenberg'),
                        checked: a.closeOnEsc,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ closeOnEsc: v }); }
                    })
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(getTypoControl(), {
                        label: __('Title', 'blockenberg'),
                        value: a.titleTypo,
                        onChange: function (v) { setAttributes({ titleTypo: v }); }
                    }),
                    el(getTypoControl(), {
                        label: __('Body', 'blockenberg'),
                        value: a.bodyTypo,
                        onChange: function (v) { setAttributes({ bodyTypo: v }); }
                    })
                ),

                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Button Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.triggerBtnBg, onChange: function (c) { setAttributes({ triggerBtnBg: c || '#2563eb' }); }, label: __('Button Background', 'blockenberg') },
                            { value: a.triggerBtnColor, onChange: function (c) { setAttributes({ triggerBtnColor: c || '#ffffff' }); }, label: __('Button Text', 'blockenberg') }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Modal Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.modalBg, onChange: function (c) { setAttributes({ modalBg: c || '#ffffff' }); }, label: __('Modal Background', 'blockenberg') },
                            { value: a.titleColor, onChange: function (c) { setAttributes({ titleColor: c || '#111827' }); }, label: __('Title', 'blockenberg') },
                            { value: a.contentColor, onChange: function (c) { setAttributes({ contentColor: c || '#374151' }); }, label: __('Content Text', 'blockenberg') },
                            { value: a.closeBtnColor, onChange: function (c) { setAttributes({ closeBtnColor: c || '#6b7280' }); }, label: __('Close Button', 'blockenberg') }
                        ]
                    })
                )
            );

            // Trigger button preview
            var triggerBtnClass = 'bkbg-modal-trigger bkbg-modal-btn-' + a.triggerBtnStyle + ' bkbg-modal-btn-' + a.triggerBtnSize;

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    // Trigger area
                    el('div', { className: 'bkbg-modal-trigger-wrap', style: { textAlign: a.triggerAlignment } },
                        el('button', {
                            className: triggerBtnClass,
                            onClick: function () { setPreviewOpen(!isPreviewOpen); },
                            type: 'button'
                        }, a.triggerLabel),
                        a.triggerMode === 'auto' && el('span', {
                            className: 'bkbg-modal-auto-badge'
                        }, __('Auto-opens after', 'blockenberg') + ' ' + (a.autoDelay / 1000).toFixed(1) + 's')
                    ),

                    // Editor preview modal (inline)
                    isPreviewOpen && el('div', {
                        className: 'bkbg-modal-editor-preview',
                        'data-size': a.modalSize,
                        'data-animation': a.animation
                    },
                        el('div', { className: 'bkbg-modal-dialog' },
                            a.showHeader && el('div', { className: 'bkbg-modal-header' },
                                el('h2', { className: 'bkbg-modal-title' },
                                    el(TextControl, {
                                        value: a.modalTitle,
                                        onChange: function (v) { setAttributes({ modalTitle: v }); },
                                        hideLabelFromVision: true,
                                        label: __('Modal Title', 'blockenberg')
                                    })
                                ),
                                a.showCloseBtn && el('button', {
                                    className: 'bkbg-modal-close',
                                    type: 'button',
                                    onClick: function () { setPreviewOpen(false); }
                                }, '✕')
                            ),
                            el('div', { className: 'bkbg-modal-content' },
                                el(RichText, {
                                    tagName: 'div',
                                    className: 'bkbg-modal-body',
                                    value: a.modalContent,
                                    onChange: function (v) { setAttributes({ modalContent: v }); },
                                    placeholder: __('Add modal content here...', 'blockenberg')
                                })
                            )
                        )
                    )
                )
            );
        },

        deprecated: [{
            save: function (props) {
                var a = props.attributes;
                var RichTextContent = wp.blockEditor.RichText.Content;
                var modalId = 'bkbg-modal-' + (Math.random().toString(36).substr(2, 9));

                var svgs = {
                    chevron: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'
                };

                var wrapStyle = [
                    '--bkbg-modal-bg:' + a.modalBg,
                    '--bkbg-modal-radius:' + a.modalRadius + 'px',
                    '--bkbg-modal-padding:' + a.modalPadding + 'px',
                    '--bkbg-modal-title-size:' + a.titleSize + 'px',
                    '--bkbg-modal-title-weight:' + a.titleWeight,
                    '--bkbg-modal-title-color:' + a.titleColor,
                    '--bkbg-modal-content-size:' + a.contentSize + 'px',
                    '--bkbg-modal-content-color:' + a.contentColor,
                    '--bkbg-modal-content-lh:' + a.contentLineHeight,
                    '--bkbg-modal-title-lh:' + a.titleLineHeight,
                    '--bkbg-modal-close-color:' + a.closeBtnColor,
                    '--bkbg-modal-close-hover:' + a.closeBtnHoverColor,
                    '--bkbg-modal-overlay-bg:' + a.overlayBg,
                    '--bkbg-modal-btn-bg:' + a.triggerBtnBg,
                    '--bkbg-modal-btn-color:' + a.triggerBtnColor,
                    '--bkbg-modal-btn-radius:' + a.triggerBtnRadius + 'px'
                ].join(';');

                var blockProps = wp.blockEditor.useBlockProps.save({
                    className: 'bkbg-modal-block',
                    style: wrapStyle,
                    'data-trigger-align': a.triggerAlignment,
                    'data-modal-id': modalId
                });

                var triggerBtnClass = 'bkbg-modal-trigger bkbg-modal-btn-' + a.triggerBtnStyle + ' bkbg-modal-btn-' + a.triggerBtnSize;

                return el('div', blockProps,
                    el('div', { className: 'bkbg-modal-trigger-wrap', style: { textAlign: a.triggerAlignment } },
                        el('button', {
                            className: triggerBtnClass,
                            'aria-haspopup': 'dialog',
                            'aria-controls': modalId,
                            'data-bkbg-modal-open': modalId,
                            type: 'button'
                        }, a.triggerLabel)
                    ),
                    el('div', {
                        className: 'bkbg-modal-overlay',
                        id: modalId,
                        role: 'dialog',
                        'aria-modal': 'true',
                        'aria-labelledby': modalId + '-title',
                        'aria-hidden': 'true',
                        'data-size': a.modalSize,
                        'data-animation': a.animation,
                        'data-close-overlay': a.closeOnOverlay ? '1' : '0',
                        'data-close-esc': a.closeOnEsc ? '1' : '0',
                        'data-trigger-mode': a.triggerMode,
                        'data-auto-delay': a.autoDelay,
                        'data-overlay-blur': a.overlayBlur ? '1' : '0'
                    },
                        el('div', { className: 'bkbg-modal-dialog' },
                            a.showHeader && el('div', { className: 'bkbg-modal-header' },
                                el('h2', { className: 'bkbg-modal-title', id: modalId + '-title' }, a.modalTitle),
                                a.showCloseBtn && el('button', {
                                    className: 'bkbg-modal-close',
                                    type: 'button',
                                    'aria-label': 'Close modal',
                                    'data-bkbg-modal-close': modalId
                                }, '✕')
                            ),
                            el('div', { className: 'bkbg-modal-content' },
                                el(RichTextContent, { tagName: 'div', className: 'bkbg-modal-body', value: a.modalContent })
                            )
                        )
                    )
                );
            }
        }],

        save: function (props) {
            var a = props.attributes;
            var RichTextContent = wp.blockEditor.RichText.Content;
            var modalId = 'bkbg-modal-' + (Math.random().toString(36).substr(2, 9));

            var blockProps = wp.blockEditor.useBlockProps.save((function () {
                var _tvf = getTypoCssVars();
                var s = {
                    '--bkbg-modal-bg': a.modalBg,
                    '--bkbg-modal-radius': a.modalRadius + 'px',
                    '--bkbg-modal-padding': a.modalPadding + 'px',
                    '--bkbg-modal-title-size': a.titleSize + 'px',
                    '--bkbg-modal-title-weight': a.titleWeight,
                    '--bkbg-modal-title-color': a.titleColor,
                    '--bkbg-modal-content-size': a.contentSize + 'px',
                    '--bkbg-modal-content-color': a.contentColor,
                    '--bkbg-modal-content-lh': a.contentLineHeight,
                    '--bkbg-modal-title-lh': a.titleLineHeight,
                    '--bkbg-modal-close-color': a.closeBtnColor,
                    '--bkbg-modal-close-hover': a.closeBtnHoverColor,
                    '--bkbg-modal-overlay-bg': a.overlayBg,
                    '--bkbg-modal-btn-bg': a.triggerBtnBg,
                    '--bkbg-modal-btn-color': a.triggerBtnColor,
                    '--bkbg-modal-btn-radius': a.triggerBtnRadius + 'px'
                };
                Object.assign(s, _tvf(a.titleTypo, '--bkbg-modal-tt-'));
                Object.assign(s, _tvf(a.bodyTypo, '--bkbg-modal-bd-'));
                return {
                    className: 'bkbg-modal-block',
                    style: s,
                    'data-trigger-align': a.triggerAlignment,
                    'data-modal-id': modalId
                };
            })());

            var triggerBtnClass = 'bkbg-modal-trigger bkbg-modal-btn-' + a.triggerBtnStyle + ' bkbg-modal-btn-' + a.triggerBtnSize;

            return el('div', blockProps,
                // Trigger
                el('div', { className: 'bkbg-modal-trigger-wrap', style: { textAlign: a.triggerAlignment } },
                    el('button', {
                        className: triggerBtnClass,
                        'aria-haspopup': 'dialog',
                        'aria-controls': modalId,
                        'data-bkbg-modal-open': modalId,
                        type: 'button'
                    }, a.triggerLabel)
                ),

                // Modal overlay + dialog
                el('div', {
                    className: 'bkbg-modal-overlay',
                    id: modalId,
                    role: 'dialog',
                    'aria-modal': 'true',
                    'aria-labelledby': modalId + '-title',
                    'aria-hidden': 'true',
                    'data-size': a.modalSize,
                    'data-animation': a.animation,
                    'data-close-overlay': a.closeOnOverlay ? '1' : '0',
                    'data-close-esc': a.closeOnEsc ? '1' : '0',
                    'data-trigger-mode': a.triggerMode,
                    'data-auto-delay': a.autoDelay,
                    'data-overlay-blur': a.overlayBlur ? '1' : '0'
                },
                    el('div', { className: 'bkbg-modal-dialog' },
                        a.showHeader && el('div', { className: 'bkbg-modal-header' },
                            el('h2', { className: 'bkbg-modal-title', id: modalId + '-title' }, a.modalTitle),
                            a.showCloseBtn && el('button', {
                                className: 'bkbg-modal-close',
                                type: 'button',
                                'aria-label': 'Close modal',
                                'data-bkbg-modal-close': modalId
                            }, '✕')
                        ),
                        el('div', { className: 'bkbg-modal-content' },
                            el(RichTextContent, { tagName: 'div', className: 'bkbg-modal-body', value: a.modalContent })
                        )
                    )
                )
            );
        }
    });
}() );
