( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var styleOptions = [
        { label: __('Minimal', 'blockenberg'), value: 'minimal' },
        { label: __('Card', 'blockenberg'), value: 'card' },
        { label: __('Split (Photo left)', 'blockenberg'), value: 'split' },
        { label: __('Dark', 'blockenberg'), value: 'dark' },
        { label: __('Centered', 'blockenberg'), value: 'centered' },
        { label: __('Border Left', 'blockenberg'), value: 'border-left' }
    ];

    var _fqTC, _fqTV;
    function _tc() { return _fqTC || (_fqTC = window.bkbgTypographyControl); }
    function _tv() { return _fqTV || (_fqTV = window.bkbgTypoCssVars); }

    function wrapStyle(a) {
        return Object.assign(
            {
                '--bkbg-fq-accent': a.accentColor,
                '--bkbg-fq-bg': a.bgColor,
                '--bkbg-fq-border': a.borderColor,
                '--bkbg-fq-quote-c': a.quoteColor,
                '--bkbg-fq-name-c': a.nameColor,
                '--bkbg-fq-title-c': a.titleColor,
                '--bkbg-fq-eyebrow-c': a.eyebrowColor,
                '--bkbg-fq-photo-sz': a.photoSize + 'px',
                '--bkbg-fq-pt': a.paddingTop + 'px',
                '--bkbg-fq-pb': a.paddingBottom + 'px',
                '--bkbg-fq-mw': a.maxWidth + 'px'
            },
            _tv()(a.typoEyebrow, '--bkbg-fq-eb-'),
            _tv()(a.typoQuote, '--bkbg-fq-qt-'),
            _tv()(a.typoName, '--bkbg-fq-nm-'),
            _tv()(a.typoTitle, '--bkbg-fq-tt-'),
            _tv()(a.typoSignature, '--bkbg-fq-sg-')
        );
    }

    registerBlockType('blockenberg/founder-quote', {
        title: __('Founder Quote', 'blockenberg'),
        icon: 'format-quote',
        category: 'bkbg-business',
        description: __('CEO or founder personal message with photo and signature.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show Eyebrow', 'blockenberg'),
                        checked: a.showEyebrow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showEyebrow: v }); }
                    }),
                    a.showEyebrow && el(TextControl, {
                        label: __('Eyebrow Text', 'blockenberg'),
                        value: a.eyebrow,
                        onChange: function (v) { setAttributes({ eyebrow: v }); }
                    }),
                    el(TextControl, {
                        label: __('Name', 'blockenberg'),
                        value: a.name,
                        onChange: function (v) { setAttributes({ name: v }); }
                    }),
                    el(TextControl, {
                        label: __('Title / Role', 'blockenberg'),
                        value: a.title,
                        onChange: function (v) { setAttributes({ title: v }); }
                    }),
                    el(TextControl, {
                        label: __('Company', 'blockenberg'),
                        value: a.company,
                        onChange: function (v) { setAttributes({ company: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Signature', 'blockenberg'),
                        checked: a.showSignature,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showSignature: v }); }
                    }),
                    a.showSignature && el(TextControl, {
                        label: __('Signature Text', 'blockenberg'),
                        value: a.signature,
                        onChange: function (v) { setAttributes({ signature: v }); }
                    })
                ),

                el(PanelBody, { title: __('Photo', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Photo', 'blockenberg'),
                        checked: a.showPhoto,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showPhoto: v }); }
                    }),
                    a.showPhoto && el(MediaUpload, {
                        onSelect: function (media) {
                            setAttributes({ photoUrl: media.url, photoId: media.id });
                        },
                        allowedTypes: ['image'],
                        value: a.photoId,
                        render: function (obj) {
                            return el(Button, {
                                variant: a.photoUrl ? 'secondary' : 'primary',
                                onClick: obj.open
                            }, a.photoUrl ? __('Change Photo', 'blockenberg') : __('Upload Photo', 'blockenberg'));
                        }
                    }),
                    a.showPhoto && a.photoUrl && el(Button, {
                        variant: 'link',
                        isDestructive: true,
                        onClick: function () { setAttributes({ photoUrl: '', photoId: 0 }); }
                    }, __('Remove Photo', 'blockenberg')),
                    a.showPhoto && el(RangeControl, {
                        label: __('Photo Size (px)', 'blockenberg'),
                        value: a.photoSize,
                        onChange: function (v) { setAttributes({ photoSize: v }); },
                        min: 40, max: 160
                    })
                ),

                el(PanelBody, { title: __('Company Logo', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Company Logo', 'blockenberg'),
                        checked: a.showCompanyLogo,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showCompanyLogo: v }); }
                    }),
                    a.showCompanyLogo && el(MediaUpload, {
                        onSelect: function (media) {
                            setAttributes({ companyLogoUrl: media.url, companyLogoId: media.id });
                        },
                        allowedTypes: ['image'],
                        value: a.companyLogoId,
                        render: function (obj) {
                            return el(Button, {
                                variant: a.companyLogoUrl ? 'secondary' : 'primary',
                                onClick: obj.open
                            }, a.companyLogoUrl ? __('Change Logo', 'blockenberg') : __('Upload Logo', 'blockenberg'));
                        }
                    }),
                    a.showCompanyLogo && a.companyLogoUrl && el(Button, {
                        variant: 'link',
                        isDestructive: true,
                        onClick: function () { setAttributes({ companyLogoUrl: '', companyLogoId: 0 }); }
                    }, __('Remove Logo', 'blockenberg')),
                    a.showCompanyLogo && el(RangeControl, {
                        label: __('Logo Width (px)', 'blockenberg'),
                        value: a.companyLogoWidth,
                        onChange: function (v) { setAttributes({ companyLogoWidth: v }); },
                        min: 40, max: 240
                    })
                ),

                el(PanelBody, { title: __('Style & Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Visual Style', 'blockenberg'),
                        value: a.style,
                        options: styleOptions,
                        onChange: function (v) { setAttributes({ style: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Max Width (px)', 'blockenberg'),
                        value: a.maxWidth,
                        onChange: function (v) { setAttributes({ maxWidth: v }); },
                        min: 400, max: 1200
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: a.paddingTop,
                        onChange: function (v) { setAttributes({ paddingTop: v }); },
                        min: 0, max: 120
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: a.paddingBottom,
                        onChange: function (v) { setAttributes({ paddingBottom: v }); },
                        min: 0, max: 120
                    })
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc()({ label: __('Eyebrow', 'blockenberg'), value: a.typoEyebrow, onChange: function (v) { setAttributes({ typoEyebrow: v }); } }),
                    _tc()({ label: __('Quote', 'blockenberg'), value: a.typoQuote, onChange: function (v) { setAttributes({ typoQuote: v }); } }),
                    _tc()({ label: __('Name', 'blockenberg'), value: a.typoName, onChange: function (v) { setAttributes({ typoName: v }); } }),
                    _tc()({ label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                    _tc()({ label: __('Signature', 'blockenberg'), value: a.typoSignature, onChange: function (v) { setAttributes({ typoSignature: v }); } })
                ),

                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.quoteColor, onChange: function (v) { setAttributes({ quoteColor: v || '#1e293b' }); }, label: __('Quote Text', 'blockenberg') },
                        { value: a.nameColor, onChange: function (v) { setAttributes({ nameColor: v || '#0f172a' }); }, label: __('Name', 'blockenberg') },
                        { value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#64748b' }); }, label: __('Title', 'blockenberg') },
                        { value: a.eyebrowColor, onChange: function (v) { setAttributes({ eyebrowColor: v || '#6c3fb5' }); }, label: __('Eyebrow', 'blockenberg') },
                        { value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#6c3fb5' }); }, label: __('Accent / Quotation Marks', 'blockenberg') },
                        { value: a.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '#ffffff' }); }, label: __('Background', 'blockenberg') },
                        { value: a.borderColor, onChange: function (v) { setAttributes({ borderColor: v || '#e2e8f0' }); }, label: __('Border / Divider', 'blockenberg') }
                    ]
                })
            );

            var wrapClass = 'bkbg-fq-wrap bkbg-fq-style--' + a.style;
            var blockProps = useBlockProps({ className: wrapClass, style: wrapStyle(a) });

            // Photo element
            var photoEl = null;
            if (a.showPhoto) {
                if (a.photoUrl) {
                    photoEl = el('img', { className: 'bkbg-fq-photo', src: a.photoUrl, alt: a.name || '' });
                } else {
                    photoEl = el('div', { className: 'bkbg-fq-photo bkbg-fq-photo-placeholder' },
                        el('span', { className: 'dashicons dashicons-admin-users' })
                    );
                }
            }

            // The attribution row (photo + name + title)
            var attrEl = el('div', { className: 'bkbg-fq-attr' },
                photoEl,
                el('div', { className: 'bkbg-fq-attr-text' },
                    el('div', { className: 'bkbg-fq-name' }, a.name),
                    el('div', { className: 'bkbg-fq-title' },
                        a.title, a.company ? el('span', { className: 'bkbg-fq-company' }, ' · ' + a.company) : null
                    )
                ),
                a.showCompanyLogo && a.companyLogoUrl && el('img', {
                    className: 'bkbg-fq-company-logo',
                    src: a.companyLogoUrl,
                    alt: a.company || '',
                    style: { width: a.companyLogoWidth + 'px' }
                })
            );

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-fq-inner' },
                        a.showEyebrow && el('div', { className: 'bkbg-fq-eyebrow' }, a.eyebrow),
                        el('blockquote', { className: 'bkbg-fq-quote' },
                            el('span', { className: 'bkbg-fq-qq bkbg-fq-qq--open' }, '\u201C'),
                            el(RichText, {
                                tagName: 'p',
                                className: 'bkbg-fq-quote-text',
                                value: a.quote,
                                onChange: function (v) { setAttributes({ quote: v }); },
                                placeholder: __('Type your quote here…', 'blockenberg')
                            }),
                            el('span', { className: 'bkbg-fq-qq bkbg-fq-qq--close' }, '\u201D')
                        ),
                        a.showSignature && el('div', { className: 'bkbg-fq-signature' }, a.signature),
                        attrEl
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            var wrapClass = 'bkbg-fq-wrap bkbg-fq-style--' + a.style;
            var blockProps = wp.blockEditor.useBlockProps.save({ className: wrapClass, style: wrapStyle(a) });

            return el('div', blockProps,
                el('div', { className: 'bkbg-fq-inner' },
                    a.showEyebrow && el('div', { className: 'bkbg-fq-eyebrow' }, a.eyebrow),
                    el('blockquote', { className: 'bkbg-fq-quote' },
                        el('span', { className: 'bkbg-fq-qq bkbg-fq-qq--open' }, '\u201C'),
                        el(RichText.Content, { tagName: 'p', className: 'bkbg-fq-quote-text', value: a.quote }),
                        el('span', { className: 'bkbg-fq-qq bkbg-fq-qq--close' }, '\u201D')
                    ),
                    a.showSignature && el('div', { className: 'bkbg-fq-signature' }, a.signature),
                    el('div', { className: 'bkbg-fq-attr' },
                        a.showPhoto && a.photoUrl && el('img', { className: 'bkbg-fq-photo', src: a.photoUrl, alt: a.name || '' }),
                        el('div', { className: 'bkbg-fq-attr-text' },
                            el('div', { className: 'bkbg-fq-name' }, a.name),
                            el('div', { className: 'bkbg-fq-title' },
                                a.title, a.company ? el('span', { className: 'bkbg-fq-company' }, ' · ' + a.company) : null
                            )
                        ),
                        a.showCompanyLogo && a.companyLogoUrl && el('img', {
                            className: 'bkbg-fq-company-logo',
                            src: a.companyLogoUrl,
                            alt: a.company || '',
                            style: { width: a.companyLogoWidth + 'px' }
                        })
                    )
                )
            );
        }
    });
}() );
