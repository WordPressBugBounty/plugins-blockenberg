( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var SelectControl = wp.components.SelectControl;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    /* ── ES5 update helpers ──────────────────────────── */
    function updateParagraph(paras, idx, val) {
        return paras.map(function (p, i) { return i === idx ? val : p; });
    }
    function addParagraph(paras) { return paras.concat(['New paragraph text here.']); }
    function removeParagraph(paras, idx) { return paras.filter(function (_, i) { return i !== idx; }); }

    registerBlockType('blockenberg/press-release', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.headlineTypo, '--bkbg-pr-hl-'));
                    Object.assign(s, _tvFn(a.bodyTypo, '--bkbg-pr-bd-'));
                }
                return { className: 'bkbg-pr-editor', style: s };
            })());

            function renderPreview() {
                var bodyStyle = {
                    background: a.bgColor, boxSizing: 'border-box',
                    maxWidth: a.maxWidth + 'px', margin: '0 auto',
                    color: a.textColor,
                    padding: '40px 48px',
                    border: '1px solid ' + a.dateBorderColor,
                    borderRadius: a.borderRadius + 'px'
                };

                return el('div', { className: 'bkbg-pr-block', style: bodyStyle },
                    /* Release label */
                    a.showReleaseLabel && el('div', {
                        className: 'bkbg-pr-release-label',
                        style: {
                            fontFamily: 'inherit', fontSize: '11px', fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '.12em',
                            color: a.releaseLabelColor, marginBottom: '8px'
                        }
                    }, a.releaseLabel),

                    /* Dateline */
                    a.showDateline && el('div', {
                        className: 'bkbg-pr-dateline',
                        style: {
                            fontSize: '13px', color: a.subheadlineColor,
                            marginBottom: '24px', paddingBottom: '16px',
                            borderBottom: '1px solid ' + a.dateBorderColor
                        }
                    }, (a.city ? a.city + ', ' : '') + a.releaseDate),

                    /* Headline */
                    el('h1', {
                        className: 'bkbg-pr-headline',
                        style: {
                            color: a.headlineColor,
                            margin: '0 0 12px'
                        }
                    }, a.headline),

                    /* Subheadline */
                    a.showSubheadline && a.subheadline && el('h2', {
                        className: 'bkbg-pr-subheadline',
                        style: {
                            color: a.subheadlineColor,
                            margin: '0 0 28px'
                        }
                    }, a.subheadline),

                    /* Intro paragraph (dateline-style bold first para) */
                    a.introParagraph && el('p', {
                        className: 'bkbg-pr-intro',
                        style: { margin: '0 0 18px', color: a.textColor }
                    }, a.introParagraph),

                    /* Body paragraphs */
                    a.bodyParagraphs.map(function (para, idx) {
                        return el('p', {
                            key: idx, className: 'bkbg-pr-para',
                            style: { margin: '0 0 18px', color: a.textColor }
                        }, para);
                    }),

                    /* End marker */
                    a.showEndMarker && el('p', {
                        className: 'bkbg-pr-end',
                        style: { textAlign: 'center', color: a.textColor, margin: '24px 0' }
                    }, a.endMarker),

                    /* Boilerplate */
                    a.showBoilerplate && el('div', {
                        className: 'bkbg-pr-boilerplate',
                        style: {
                            background: a.boilerplateBg, border: '1px solid ' + a.boilerplateBorderColor,
                            borderRadius: (a.borderRadius - 2) + 'px',
                            padding: '18px 20px', marginBottom: '16px'
                        }
                    },
                        el('strong', {
                            style: { fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: a.textColor }
                        }, a.boilerplateTitle),
                        el('p', {
                            style: { margin: 0, color: a.boilerplateTextColor }
                        }, a.boilerplateText)
                    ),

                    /* Media contact */
                    a.showMediaContact && el('div', {
                        className: 'bkbg-pr-contact',
                        style: {
                            background: a.contactBg, border: '1px solid ' + a.contactBorderColor,
                            borderRadius: (a.borderRadius - 2) + 'px',
                            padding: '14px 20px', fontSize: '13px', fontFamily: 'Arial, sans-serif'
                        }
                    },
                        el('div', { style: { fontWeight: 700, marginBottom: '4px', color: a.contactColor } }, 'Media Contact'),
                        el('div', { style: { color: a.contactColor } }, a.mediaContactName + (a.mediaContactTitle ? ', ' + a.mediaContactTitle : '')),
                        a.mediaContactCompany && el('div', { style: { color: a.contactColor, opacity: '.85' } }, a.mediaContactCompany),
                        a.mediaContactEmail && el('div', { style: { marginTop: '4px' } },
                            el('a', { href: 'mailto:' + a.mediaContactEmail, style: { color: a.accentColor, textDecoration: 'none' } }, a.mediaContactEmail)
                        ),
                        a.mediaContactPhone && el('div', { style: { color: a.contactColor } }, a.mediaContactPhone)
                    )
                );
            }

            var inspector = el(InspectorControls, {},
                /* Release Info */
                el(PanelBody, { title: 'Release Info', initialOpen: true },
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Release Label', checked: a.showReleaseLabel, onChange: function (v) { set({ showReleaseLabel: v }); } }),
                    a.showReleaseLabel && el(TextControl, { __nextHasNoMarginBottom: true, label: 'Label', value: a.releaseLabel, onChange: function (v) { set({ releaseLabel: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Dateline', checked: a.showDateline, onChange: function (v) { set({ showDateline: v }); } }),
                    a.showDateline && el(TextControl, { __nextHasNoMarginBottom: true, label: 'City', value: a.city, onChange: function (v) { set({ city: v }); } }),
                    a.showDateline && el(TextControl, { __nextHasNoMarginBottom: true, label: 'Date', value: a.releaseDate, onChange: function (v) { set({ releaseDate: v }); } })
                ),
                /* Headline */
                el(PanelBody, { title: 'Headline', initialOpen: true },
                    el('div', { style: { marginBottom: 8 } },
                        el('label', { style: { fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 } }, 'Headline'),
                        el('textarea', {
                            value: a.headline, rows: 3,
                            style: { width: '100%', fontSize: 12, padding: '5px 7px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box', fontFamily: 'inherit' },
                            onChange: function (e) { set({ headline: e.target.value }); }
                        })
                    ),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Subheadline', checked: a.showSubheadline, onChange: function (v) { set({ showSubheadline: v }); } }),
                    a.showSubheadline && el('div', { style: { marginBottom: 8 } },
                        el('label', { style: { fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 } }, 'Subheadline'),
                        el('textarea', {
                            value: a.subheadline, rows: 2,
                            style: { width: '100%', fontSize: 12, padding: '5px 7px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box', fontFamily: 'inherit' },
                            onChange: function (e) { set({ subheadline: e.target.value }); }
                        })
                    )
                ),
                /* Body Content */
                el(PanelBody, { title: 'Body Content', initialOpen: true },
                    el('div', { style: { marginBottom: 10 } },
                        el('label', { style: { fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 } }, 'Opening Paragraph (Dateline Lead)'),
                        el('textarea', {
                            value: a.introParagraph, rows: 4,
                            style: { width: '100%', fontSize: 12, padding: '5px 7px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box', fontFamily: 'inherit' },
                            onChange: function (e) { set({ introParagraph: e.target.value }); }
                        })
                    ),
                    el('div', { style: { fontSize: 11, fontWeight: 600, marginBottom: 6 } }, 'Body Paragraphs:'),
                    a.bodyParagraphs.map(function (para, idx) {
                        return el('div', {
                            key: idx,
                            style: { marginBottom: 10, border: '1px solid #e2e8f0', borderRadius: 6, padding: 8, background: '#f8fafc' }
                        },
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 } },
                                el('span', { style: { fontSize: 11, color: '#64748b' } }, 'Paragraph ' + (idx + 1)),
                                el(Button, { isSmall: true, isDestructive: true, onClick: function () { set({ bodyParagraphs: removeParagraph(a.bodyParagraphs, idx) }); } }, '✕')
                            ),
                            el('textarea', {
                                value: para, rows: 4,
                                style: { width: '100%', fontSize: 12, padding: '5px 7px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box', fontFamily: 'inherit' },
                                onChange: function (e) { set({ bodyParagraphs: updateParagraph(a.bodyParagraphs, idx, e.target.value) }); }
                            })
                        );
                    }),
                    el(Button, { variant: 'secondary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ bodyParagraphs: addParagraph(a.bodyParagraphs) }); } }, '+ Add Paragraph')
                ),
                /* End Marker */
                el(PanelBody, { title: 'End Marker & Boilerplate', initialOpen: false },
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show End Marker (###)', checked: a.showEndMarker, onChange: function (v) { set({ showEndMarker: v }); } }),
                    a.showEndMarker && el(TextControl, { __nextHasNoMarginBottom: true, label: 'End Marker Text', value: a.endMarker, onChange: function (v) { set({ endMarker: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Boilerplate', checked: a.showBoilerplate, onChange: function (v) { set({ showBoilerplate: v }); } }),
                    a.showBoilerplate && el(TextControl, { __nextHasNoMarginBottom: true, label: 'Boilerplate Title', value: a.boilerplateTitle, onChange: function (v) { set({ boilerplateTitle: v }); } }),
                    a.showBoilerplate && el('div', { style: { marginBottom: 8 } },
                        el('label', { style: { fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 } }, 'Boilerplate Text'),
                        el('textarea', {
                            value: a.boilerplateText, rows: 4,
                            style: { width: '100%', fontSize: 12, padding: '5px 7px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box', fontFamily: 'inherit' },
                            onChange: function (e) { set({ boilerplateText: e.target.value }); }
                        })
                    )
                ),
                /* Media Contact */
                el(PanelBody, { title: 'Media Contact', initialOpen: false },
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Media Contact', checked: a.showMediaContact, onChange: function (v) { set({ showMediaContact: v }); } }),
                    a.showMediaContact && Fragment && el(Fragment, {},
                        el(TextControl, { __nextHasNoMarginBottom: true, label: 'Name', value: a.mediaContactName, onChange: function (v) { set({ mediaContactName: v }); } }),
                        el(TextControl, { __nextHasNoMarginBottom: true, label: 'Title / Role', value: a.mediaContactTitle, onChange: function (v) { set({ mediaContactTitle: v }); } }),
                        el(TextControl, { __nextHasNoMarginBottom: true, label: 'Company', value: a.mediaContactCompany, onChange: function (v) { set({ mediaContactCompany: v }); } }),
                        el(TextControl, { __nextHasNoMarginBottom: true, label: 'Email', value: a.mediaContactEmail, onChange: function (v) { set({ mediaContactEmail: v }); } }),
                        el(TextControl, { __nextHasNoMarginBottom: true, label: 'Phone', value: a.mediaContactPhone, onChange: function (v) { set({ mediaContactPhone: v }); } })
                    )
                ),
                /* Typography */
                el(PanelBody, { title: 'Typography', initialOpen: false },
                    (function () {
                        var TC = getTypoControl();
                        if (!TC) return el('p', null, 'Loading\u2026');
                        return el(Fragment, null,
                            el(TC, { label: __('Headline', 'blockenberg'), value: a.headlineTypo, onChange: function (v) { set({ headlineTypo: v }); } }),
                            el(TC, { label: __('Body Text', 'blockenberg'), value: a.bodyTypo, onChange: function (v) { set({ bodyTypo: v }); } })
                        );
                    })()
                ),
                /* Appearance */
                el(PanelBody, { title: 'Appearance', initialOpen: false },
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Max Width (px)', value: a.maxWidth, min: 480, max: 1200, onChange: function (v) { set({ maxWidth: v }); } }),
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Border Radius', value: a.borderRadius, min: 0, max: 20, onChange: function (v) { set({ borderRadius: v }); } })
                ),
                /* Colors */
                el(PanelColorSettings, {
                    title: 'Colors', initialOpen: false,
                    colorSettings: [
                        { label: 'Background', value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                        { label: 'Body Text Color', value: a.textColor, onChange: function (v) { set({ textColor: v || '#1a1a2e' }); } },
                        { label: 'Headline Color', value: a.headlineColor, onChange: function (v) { set({ headlineColor: v || '#0f172a' }); } },
                        { label: 'Subheadline / Dateline Color', value: a.subheadlineColor, onChange: function (v) { set({ subheadlineColor: v || '#475569' }); } },
                        { label: 'Release Label Color', value: a.releaseLabelColor, onChange: function (v) { set({ releaseLabelColor: v || '#dc2626' }); } },
                        { label: 'Border Color', value: a.dateBorderColor, onChange: function (v) { set({ dateBorderColor: v || '#e2e8f0' }); } },
                        { label: 'Boilerplate Background', value: a.boilerplateBg, onChange: function (v) { set({ boilerplateBg: v || '#f8fafc' }); } },
                        { label: 'Boilerplate Text Color', value: a.boilerplateTextColor, onChange: function (v) { set({ boilerplateTextColor: v || '#64748b' }); } },
                        { label: 'Contact Background', value: a.contactBg, onChange: function (v) { set({ contactBg: v || '#f1f5f9' }); } },
                        { label: 'Contact Text Color', value: a.contactColor, onChange: function (v) { set({ contactColor: v || '#334155' }); } },
                        { label: 'Link / Accent Color', value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#2563eb' }); } }
                    ]
                })
            );

            return el(Fragment, {}, inspector, el('div', blockProps, renderPreview()));
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-press-release-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
