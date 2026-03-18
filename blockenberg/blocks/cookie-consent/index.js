( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;

    var _ccnTC, _ccnTV;
    function _tc() { return _ccnTC || (_ccnTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _ccnTV || (_ccnTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    var positionOptions = [
        { label: __('Bottom Bar', 'blockenberg'), value: 'bottom' },
        { label: __('Top Bar', 'blockenberg'), value: 'top' },
        { label: __('Bottom-Left Corner', 'blockenberg'), value: 'bottom-left' },
        { label: __('Bottom-Right Corner', 'blockenberg'), value: 'bottom-right' }
    ];

    var layoutOptions = [
        { label: __('Bar (inline)', 'blockenberg'), value: 'bar' },
        { label: __('Popup (stacked)', 'blockenberg'), value: 'popup' }
    ];

    var animationOptions = [
        { label: __('Slide', 'blockenberg'), value: 'slide' },
        { label: __('Fade', 'blockenberg'), value: 'fade' },
        { label: __('None', 'blockenberg'), value: 'none' }
    ];

    registerBlockType('blockenberg/cookie-consent', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var wrapStyle = Object.assign({
                '--bkbg-cc-bg': a.bgColor,
                '--bkbg-cc-text': a.textColor,
                '--bkbg-cc-accept-bg': a.acceptBg,
                '--bkbg-cc-accept-color': a.acceptColor,
                '--bkbg-cc-decline-bg': a.declineBg,
                '--bkbg-cc-decline-color': a.declineColor,
                '--bkbg-cc-decline-border': a.declineBorderColor,
                '--bkbg-cc-link-color': a.linkColor,
                '--bkbg-cc-radius': a.borderRadius + 'px',
                '--bkbg-cc-padding': a.padding + 'px',
                '--bkbg-cc-font-size': a.fontSize + 'px',
                '--bkbg-cc-max-width': a.maxWidth + 'px'
            }, _tv(a.typoMessage, '--bkbg-ccn-msg-'));

            var blockProps = useBlockProps({
                className: 'bkbg-cc-preview-wrap'
            });

            var inspector = el(InspectorControls, {},

                el(PanelBody, { title: __('Message & Buttons', 'blockenberg'), initialOpen: true },
                    el(TextareaControl, {
                        label: __('Consent Message', 'blockenberg'),
                        value: a.message,
                        rows: 4,
                        onChange: function (v) { setAttributes({ message: v }); }
                    }),
                    el(TextControl, {
                        label: __('Accept Button Text', 'blockenberg'),
                        value: a.acceptLabel,
                        onChange: function (v) { setAttributes({ acceptLabel: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Decline Button', 'blockenberg'),
                        checked: a.showDecline,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showDecline: v }); }
                    }),
                    a.showDecline && el(TextControl, {
                        label: __('Decline Button Text', 'blockenberg'),
                        value: a.declineLabel,
                        onChange: function (v) { setAttributes({ declineLabel: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Customize Button', 'blockenberg'),
                        help: __('Expands cookie category toggles.', 'blockenberg'),
                        checked: a.showCustomize,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showCustomize: v }); }
                    }),
                    a.showCustomize && el(TextControl, {
                        label: __('Customize Button Text', 'blockenberg'),
                        value: a.customizeLabel,
                        onChange: function (v) { setAttributes({ customizeLabel: v }); }
                    }),
                    el('hr', {}),
                    el(TextControl, {
                        label: __('Privacy Policy Link Text', 'blockenberg'),
                        value: a.privacyLabel,
                        onChange: function (v) { setAttributes({ privacyLabel: v }); }
                    }),
                    el(TextControl, {
                        label: __('Privacy Policy URL', 'blockenberg'),
                        value: a.privacyUrl,
                        type: 'url',
                        onChange: function (v) { setAttributes({ privacyUrl: v }); }
                    })
                ),

                el(PanelBody, { title: __('Cookie Categories', 'blockenberg'), initialOpen: false },
                    el('p', { style: { fontSize: '12px', color: '#6b7280', marginBottom: '12px' } },
                        __('These appear in the customize panel when enabled.', 'blockenberg')
                    ),
                    el(ToggleControl, {
                        label: __('Analytics Cookies', 'blockenberg'),
                        checked: a.showAnalytics,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showAnalytics: v }); }
                    }),
                    a.showAnalytics && el(TextControl, {
                        label: __('Analytics Label', 'blockenberg'),
                        value: a.analyticsLabel,
                        onChange: function (v) { setAttributes({ analyticsLabel: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Marketing Cookies', 'blockenberg'),
                        checked: a.showMarketing,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showMarketing: v }); }
                    }),
                    a.showMarketing && el(TextControl, {
                        label: __('Marketing Label', 'blockenberg'),
                        value: a.marketingLabel,
                        onChange: function (v) { setAttributes({ marketingLabel: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Functional Cookies', 'blockenberg'),
                        checked: a.showFunctional,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showFunctional: v }); }
                    }),
                    a.showFunctional && el(TextControl, {
                        label: __('Functional Label', 'blockenberg'),
                        value: a.functionalLabel,
                        onChange: function (v) { setAttributes({ functionalLabel: v }); }
                    })
                ),

                el(PanelBody, { title: __('Position & Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Banner Position', 'blockenberg'),
                        value: a.position,
                        options: positionOptions,
                        onChange: function (v) { setAttributes({ position: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Layout Style', 'blockenberg'),
                        value: a.layout,
                        options: layoutOptions,
                        onChange: function (v) { setAttributes({ layout: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Entry Animation', 'blockenberg'),
                        value: a.animation,
                        options: animationOptions,
                        onChange: function (v) { setAttributes({ animation: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Max Width (px)', 'blockenberg'),
                        value: a.maxWidth, min: 320, max: 1400,
                        onChange: function (v) { setAttributes({ maxWidth: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: a.borderRadius, min: 0, max: 24,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding (px)', 'blockenberg'),
                        value: a.padding, min: 8, max: 40,
                        onChange: function (v) { setAttributes({ padding: v }); }
                    }),
                    ),

                el(PanelBody, { title: __('Cookie Settings', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Cookie Name', 'blockenberg'),
                        help: __('Key used to store consent in localStorage.', 'blockenberg'),
                        value: a.cookieName,
                        onChange: function (v) { setAttributes({ cookieName: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Remember Consent (days)', 'blockenberg'),
                        value: a.cookieDays, min: 1, max: 730,
                        onChange: function (v) { setAttributes({ cookieDays: v }); }
                    })
                ),

                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    _tc() && el(_tc(), { label: __('Message', 'blockenberg'), value: a.typoMessage, onChange: function (v) { setAttributes({ typoMessage: v }); } })
                ),
el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Banner Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.bgColor, onChange: function (c) { setAttributes({ bgColor: c || '#1f2937' }); }, label: __('Background', 'blockenberg') },
                            { value: a.textColor, onChange: function (c) { setAttributes({ textColor: c || '#f9fafb' }); }, label: __('Text', 'blockenberg') },
                            { value: a.linkColor, onChange: function (c) { setAttributes({ linkColor: c || '#93c5fd' }); }, label: __('Link', 'blockenberg') }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Button Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.acceptBg, onChange: function (c) { setAttributes({ acceptBg: c || '#2563eb' }); }, label: __('Accept Background', 'blockenberg') },
                            { value: a.acceptColor, onChange: function (c) { setAttributes({ acceptColor: c || '#ffffff' }); }, label: __('Accept Text', 'blockenberg') },
                            { value: a.declineColor, onChange: function (c) { setAttributes({ declineColor: c || '#9ca3af' }); }, label: __('Decline Text', 'blockenberg') },
                            { value: a.declineBorderColor, onChange: function (c) { setAttributes({ declineBorderColor: c || '#4b5563' }); }, label: __('Decline Border', 'blockenberg') }
                        ]
                    })
                )
            );

            // Editor preview — shows a compact inline preview
            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('div', {
                        className: 'bkbg-cc-editor-notice',
                        style: {
                            background: '#fef3c7',
                            border: '1px solid #fcd34d',
                            borderRadius: '6px',
                            padding: '10px 14px',
                            fontSize: '13px',
                            color: '#92400e'
                        }
                    },
                        el('strong', {}, __('Cookie Consent Banner', 'blockenberg')),
                        el('br', {}),
                        __('Position: ', 'blockenberg'), el('code', {}, a.position), ' · ',
                        __('Layout: ', 'blockenberg'), el('code', {}, a.layout),
                        el('br', {}),
                        __('This banner renders as a fixed overlay on the live site.', 'blockenberg')
                    ),
                    // Live preview
                    el('div', {
                        className: 'bkbg-cc-banner bkbg-cc-preview',
                        style: wrapStyle,
                        'data-layout': a.layout,
                        'data-position': a.position
                    },
                        el('div', { className: 'bkbg-cc-inner' },
                            el('div', { className: 'bkbg-cc-text' },
                                el('p', { className: 'bkbg-cc-message' }, a.message),
                                a.privacyUrl && el('a', {
                                    href: '#',
                                    className: 'bkbg-cc-privacy-link'
                                }, a.privacyLabel)
                            ),
                            el('div', { className: 'bkbg-cc-actions' },
                                el('button', { className: 'bkbg-cc-btn bkbg-cc-accept-btn' }, a.acceptLabel),
                                a.showDecline && el('button', { className: 'bkbg-cc-btn bkbg-cc-decline-btn' }, a.declineLabel),
                                a.showCustomize && el('button', { className: 'bkbg-cc-btn bkbg-cc-customize-btn' }, a.customizeLabel)
                            )
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            var typoVars = _tv(a.typoMessage, '--bkbg-ccn-msg-');
            var typoEntries = Object.keys(typoVars).map(function(k) { return k + ':' + typoVars[k]; });

            var wrapStyle = [
                '--bkbg-cc-bg:' + a.bgColor,
                '--bkbg-cc-text:' + a.textColor,
                '--bkbg-cc-accept-bg:' + a.acceptBg,
                '--bkbg-cc-accept-color:' + a.acceptColor,
                '--bkbg-cc-decline-bg:' + a.declineBg,
                '--bkbg-cc-decline-color:' + a.declineColor,
                '--bkbg-cc-decline-border:' + a.declineBorderColor,
                '--bkbg-cc-link-color:' + a.linkColor,
                '--bkbg-cc-radius:' + a.borderRadius + 'px',
                '--bkbg-cc-padding:' + a.padding + 'px',
                '--bkbg-cc-font-size:' + a.fontSize + 'px',
                '--bkbg-cc-max-width:' + a.maxWidth + 'px'
            ].concat(typoEntries).join(';');

            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-cc-banner',
                style: wrapStyle,
                'data-position': a.position,
                'data-layout': a.layout,
                'data-animation': a.animation,
                'data-cookie-name': a.cookieName,
                'data-cookie-days': a.cookieDays,
                'data-show-analytics': a.showAnalytics ? '1' : '0',
                'data-analytics-label': a.analyticsLabel,
                'data-show-marketing': a.showMarketing ? '1' : '0',
                'data-marketing-label': a.marketingLabel,
                'data-show-functional': a.showFunctional ? '1' : '0',
                'data-functional-label': a.functionalLabel
            });

            return wp.element.createElement('div', blockProps,
                wp.element.createElement('div', { className: 'bkbg-cc-inner' },
                    wp.element.createElement('div', { className: 'bkbg-cc-text' },
                        wp.element.createElement('p', { className: 'bkbg-cc-message' }, a.message),
                        a.privacyUrl && wp.element.createElement('a', {
                            href: a.privacyUrl,
                            className: 'bkbg-cc-privacy-link',
                            target: '_blank',
                            rel: 'noopener noreferrer'
                        }, a.privacyLabel)
                    ),
                    wp.element.createElement('div', { className: 'bkbg-cc-actions' },
                        wp.element.createElement('button', {
                            className: 'bkbg-cc-btn bkbg-cc-accept-btn',
                            'data-bkbg-cc-accept': 'true',
                            type: 'button'
                        }, a.acceptLabel),
                        a.showDecline && wp.element.createElement('button', {
                            className: 'bkbg-cc-btn bkbg-cc-decline-btn',
                            'data-bkbg-cc-decline': 'true',
                            type: 'button'
                        }, a.declineLabel),
                        a.showCustomize && wp.element.createElement('button', {
                            className: 'bkbg-cc-btn bkbg-cc-customize-btn',
                            'data-bkbg-cc-customize': 'true',
                            type: 'button'
                        }, a.customizeLabel)
                    ),
                    // Categories panel (hidden until customize clicked)
                    a.showCustomize && wp.element.createElement('div', {
                        className: 'bkbg-cc-categories',
                        hidden: true
                    },
                        a.showAnalytics && wp.element.createElement('label', { className: 'bkbg-cc-category' },
                            wp.element.createElement('input', { type: 'checkbox', 'data-bkbg-cc-category': 'analytics' }),
                            a.analyticsLabel
                        ),
                        a.showMarketing && wp.element.createElement('label', { className: 'bkbg-cc-category' },
                            wp.element.createElement('input', { type: 'checkbox', 'data-bkbg-cc-category': 'marketing' }),
                            a.marketingLabel
                        ),
                        a.showFunctional && wp.element.createElement('label', { className: 'bkbg-cc-category' },
                            wp.element.createElement('input', { type: 'checkbox', 'data-bkbg-cc-category': 'functional' }),
                            a.functionalLabel
                        ),
                        wp.element.createElement('button', {
                            className: 'bkbg-cc-btn bkbg-cc-save-btn',
                            'data-bkbg-cc-save': 'true',
                            type: 'button'
                        }, __('Save Preferences', 'blockenberg'))
                    )
                )
            );
        }
    });
}() );
