( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    function defaultLogo() {
        return { imageUrl: '', imageId: 0, imageAlt: '', linkUrl: '' };
    }

    registerBlockType('blockenberg/logo-ticker', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var logos = attr.logos || [];

            var blockProps = useBlockProps({ className: 'bkbg-lt-editor' });

            function updateLogo(i, key, value) {
                var updated = logos.map(function (l, idx) {
                    if (idx !== i) return l;
                    var copy = Object.assign({}, l);
                    copy[key] = value;
                    return copy;
                });
                setAttr({ logos: updated });
            }

            function removeLogo(i) {
                setAttr({ logos: logos.filter(function (_, idx) { return idx !== i; }) });
            }

            function addLogo() {
                setAttr({ logos: logos.concat(defaultLogo()) });
            }

            var logoControls = logos.map(function (logo, i) {
                return el('div', {
                    key: i,
                    style: {
                        borderLeft: '3px solid #7c3aed',
                        paddingLeft: '12px',
                        marginBottom: '16px'
                    }
                },
                    el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                        el('strong', {}, 'Logo ' + (i + 1)),
                        el(Button, {
                            isSmall: true,
                            isDestructive: true,
                            onClick: function () { removeLogo(i); }
                        }, '✕')
                    ),
                    el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (media) {
                                updateLogo(i, 'imageUrl', media.url);
                                updateLogo(i, 'imageId', media.id);
                                updateLogo(i, 'imageAlt', media.alt || '');
                            },
                            allowedTypes: ['image'],
                            value: logo.imageId,
                            render: function (ref) {
                                return el('div', {},
                                    logo.imageUrl
                                        ? el('img', {
                                            src: logo.imageUrl,
                                            alt: logo.imageAlt,
                                            style: { height: '40px', objectFit: 'contain', display: 'block', marginBottom: '6px', cursor: 'pointer' },
                                            onClick: ref.open
                                        })
                                        : el(Button, { isSecondary: true, isSmall: true, onClick: ref.open }, 'Select Logo Image')
                                );
                            }
                        })
                    ),
                    el(TextControl, {
                        label: __('Link URL', 'blockenberg'),
                        value: logo.linkUrl,
                        onChange: function (v) { updateLogo(i, 'linkUrl', v); },
                        __nextHasNoMarginBottom: true
                    })
                );
            });

            // Editor preview
            var previewLogos = logos.filter(function (l) { return l.imageUrl; });
            var previewContent = previewLogos.length === 0
                ? el('div', { style: { textAlign: 'center', color: '#9ca3af', padding: '24px' } }, '← Add logos in the sidebar →')
                : el('div', { style: { display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' } },
                    previewLogos.map(function (l, i) {
                        return el('img', {
                            key: i,
                            src: l.imageUrl,
                            alt: l.imageAlt,
                            style: { height: attr.height + 'px', objectFit: 'contain', opacity: 0.8 }
                        });
                    })
                  );

            var wrapStyle = {
                background: attr.bgColor || 'transparent',
                paddingTop: attr.paddingTop + 'px',
                paddingBottom: attr.paddingBottom + 'px',
                borderTop: attr.borderTop ? '1px solid ' + attr.borderColor : 'none',
                borderBottom: attr.borderBottom ? '1px solid ' + attr.borderColor : 'none',
                overflow: 'hidden'
            };

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Logos', 'blockenberg'), initialOpen: true },
                    logoControls,
                    el(Button, {
                        isPrimary: true,
                        isSmall: true,
                        onClick: addLogo,
                        style: { marginTop: '8px' }
                    }, '+ Add Logo')
                ),
                el(PanelBody, { title: __('Ticker Settings', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Speed (seconds per loop)', 'blockenberg'),
                        value: attr.speed,
                        min: 5, max: 120,
                        onChange: function (v) { setAttr({ speed: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Direction', 'blockenberg'),
                        value: attr.direction,
                        options: [
                            { label: 'Left (→)', value: 'left' },
                            { label: 'Right (←)', value: 'right' }
                        ],
                        onChange: function (v) { setAttr({ direction: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Pause on Hover', 'blockenberg'),
                        checked: attr.pauseOnHover,
                        onChange: function (v) { setAttr({ pauseOnHover: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Logo Filter', 'blockenberg'),
                        value: attr.logoFilter,
                        options: [
                            { label: 'None (full color)', value: 'none' },
                            { label: 'Grayscale always', value: 'grayscale' },
                            { label: 'Grayscale → color on hover', value: 'grayscale-hover' }
                        ],
                        onChange: function (v) { setAttr({ logoFilter: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Logo Height (px)', 'blockenberg'),
                        value: attr.height,
                        min: 20, max: 120,
                        onChange: function (v) { setAttr({ height: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Gap Between Logos (px)', 'blockenberg'),
                        value: attr.gap,
                        min: 8, max: 120,
                        onChange: function (v) { setAttr({ gap: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '' }); } },
                        { label: __('Border Color', 'blockenberg'), value: attr.borderColor, onChange: function (v) { setAttr({ borderColor: v || '#e5e7eb' }); } }
                    ]
                }),
                el(PanelBody, { title: __('Borders & Spacing', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Border Top', 'blockenberg'),
                        checked: attr.borderTop,
                        onChange: function (v) { setAttr({ borderTop: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Border Bottom', 'blockenberg'),
                        checked: attr.borderBottom,
                        onChange: function (v) { setAttr({ borderBottom: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: attr.paddingTop,
                        min: 0, max: 120,
                        onChange: function (v) { setAttr({ paddingTop: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: attr.paddingBottom,
                        min: 0, max: 120,
                        onChange: function (v) { setAttr({ paddingBottom: v }); },
                        __nextHasNoMarginBottom: true
                    })
                )

            );

            return el('div', blockProps,
                controls,
                el('div', { style: wrapStyle }, previewContent)
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save();
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-lt-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
