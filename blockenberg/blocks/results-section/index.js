( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/results-section', {
        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            var TC = getTypoControl();

            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = { backgroundColor: a.bgColor, paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px' };
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.headingTypo || {}, '--bkrs-ht-'));
                    Object.assign(s, _tvFn(a.bodyTypo || {}, '--bkrs-bt-'));
                }
                return { className: 'bkbg-rss-wrap', style: s };
            })());

            function updateMetric(idx, key, val) {
                var updated = a.metrics.map(function (m, i) {
                    return i === idx ? Object.assign({}, m, { [key]: val }) : m;
                });
                setAttributes({ metrics: updated });
            }

            function addMetric() {
                setAttributes({ metrics: a.metrics.concat([{ label: 'New Metric', before: '0', after: '0', change: '+0%', description: '', direction: 'up' }]) });
            }

            function removeMetric(idx) {
                setAttributes({ metrics: a.metrics.filter(function (_, i) { return i !== idx; }) });
            }

            var changeColor = function (m) {
                return m.direction === 'down' ? a.changeDownColor : a.changeUpColor;
            };
            var changeBg = function (m) {
                return m.direction === 'down' ? a.changeDownBg : a.changeUpBg;
            };

            var innerStyle = {
                maxWidth: a.maxWidth + 'px',
                margin: '0 auto',
                padding: '0 24px'
            };

            return el('div', blockProps,
                // Inspector
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Eyebrow', 'blockenberg'), checked: a.showEyebrow, onChange: function (v) { setAttributes({ showEyebrow: v }); }, __nextHasNoMarginBottom: true }),
                        a.showEyebrow && el(TextControl, { label: __('Eyebrow Text', 'blockenberg'), value: a.eyebrow, onChange: function (v) { setAttributes({ eyebrow: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Subtext', 'blockenberg'), checked: a.showSubtext, onChange: function (v) { setAttributes({ showSubtext: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Case Study', 'blockenberg'), checked: a.showCaseStudy, onChange: function (v) { setAttributes({ showCaseStudy: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show CTA', 'blockenberg'), checked: a.showCtaRow, onChange: function (v) { setAttributes({ showCtaRow: v }); }, __nextHasNoMarginBottom: true }),
                        a.showCtaRow && el(TextControl, { label: __('CTA Label', 'blockenberg'), value: a.ctaLabel, onChange: function (v) { setAttributes({ ctaLabel: v }); }, __nextHasNoMarginBottom: true }),
                        a.showCtaRow && el(TextControl, { label: __('CTA URL', 'blockenberg'), value: a.ctaUrl, onChange: function (v) { setAttributes({ ctaUrl: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: [{ label: 'Metrics Top', value: 'metrics-top' }, { label: 'Metrics Bottom', value: 'metrics-bottom' }, { label: 'Split (metrics + case)', value: 'split' }], onChange: function (v) { setAttributes({ layout: v }); }, __nextHasNoMarginBottom: true }),
                        el(SelectControl, { label: __('Metric Style', 'blockenberg'), value: a.metricStyle, options: [{ label: 'Cards', value: 'cards' }, { label: 'Borderless', value: 'borderless' }, { label: 'Dark cards', value: 'dark' }], onChange: function (v) { setAttributes({ metricStyle: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, min: 600, max: 1400, onChange: function (v) { setAttributes({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        TC && el(TC, { label: __('Heading', 'blockenberg'), value: a.headingTypo || {}, onChange: function (v) { setAttributes({ headingTypo: v }); } }),
                        TC && el(TC, { label: __('Body Text', 'blockenberg'), value: a.bodyTypo || {}, onChange: function (v) { setAttributes({ bodyTypo: v }); } }),
                        el(RangeControl, { label: __('Metric After Size (px)', 'blockenberg'), value: a.metricAfterSize, min: 18, max: 64, onChange: function (v) { setAttributes({ metricAfterSize: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Eyebrow Size (px)', 'blockenberg'), value: attributes.eyebrowSize, min: 10, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { setAttributes({ eyebrowSize: v }); } }),
                        el(RangeControl, { label: __('Case Name Size (px)', 'blockenberg'), value: a.caseNameSize, min: 12, max: 32, __nextHasNoMarginBottom: true, onChange: function (v) { setAttributes({ caseNameSize: v }); } })
                    ),
                    el(PanelBody, { title: __('Case Study', 'blockenberg'), initialOpen: false },
                        el(TextControl, { label: __('Client Name', 'blockenberg'), value: a.caseStudyName, onChange: function (v) { setAttributes({ caseStudyName: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Attribution', 'blockenberg'), value: a.clientName, onChange: function (v) { setAttributes({ clientName: v }); }, __nextHasNoMarginBottom: true }),
                        el('p', { style: { margin: '8px 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' } }, __('Client Logo', 'blockenberg')),
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (media) { setAttributes({ clientLogoUrl: media.url, clientLogoId: media.id, clientLogoAlt: media.alt || '' }); },
                                allowedTypes: ['image'],
                                value: a.clientLogoId,
                                render: function (ref) {
                                    return el('div', null,
                                        a.clientLogoUrl && el('img', { src: a.clientLogoUrl, style: { maxHeight: 40, display: 'block', marginBottom: 8, borderRadius: 4 } }),
                                        el(Button, { variant: 'secondary', size: 'small', onClick: ref.open, __nextHasNoMarginBottom: true }, a.clientLogoUrl ? __('Replace Logo', 'blockenberg') : __('Upload Logo', 'blockenberg'))
                                    );
                                }
                            })
                        )
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '#ffffff' }); } },
                            { label: __('Eyebrow Color', 'blockenberg'), value: a.eyebrowColor, onChange: function (v) { setAttributes({ eyebrowColor: v || '#7c3aed' }); } },
                            { label: __('Heading Color', 'blockenberg'), value: a.headingColor, onChange: function (v) { setAttributes({ headingColor: v || '#111827' }); } },
                            { label: __('Metric Card BG', 'blockenberg'), value: a.metricCardBg, onChange: function (v) { setAttributes({ metricCardBg: v || '#f9fafb' }); } },
                            { label: __('After Value Color', 'blockenberg'), value: a.metricAfterColor, onChange: function (v) { setAttributes({ metricAfterColor: v || '#111827' }); } },
                            { label: __('Change Up Color', 'blockenberg'), value: a.changeUpColor, onChange: function (v) { setAttributes({ changeUpColor: v || '#15803d' }); } },
                            { label: __('Change Down Color', 'blockenberg'), value: a.changeDownColor, onChange: function (v) { setAttributes({ changeDownColor: v || '#b45309' }); } },
                            { label: __('Case Study BG', 'blockenberg'), value: a.caseBg, onChange: function (v) { setAttributes({ caseBg: v || '#f8f5ff' }); } },
                            { label: __('Accent Color', 'blockenberg'), value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#7c3aed' }); } },
                            { label: __('CTA Button BG', 'blockenberg'), value: a.ctaBg, onChange: function (v) { setAttributes({ ctaBg: v || '#7c3aed' }); } }
                        ]
                    })
                ),

                // Editor preview
                el('div', { style: innerStyle },
                    // Header
                    el('div', { style: { textAlign: 'center', marginBottom: 48 } },
                        a.showEyebrow && el('span', { style: { display: 'inline-block', background: a.eyebrowBg, color: a.eyebrowColor, fontWeight: 700, fontSize: (a.eyebrowSize || 12), letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 999, marginBottom: 16 } }, a.eyebrow),
                        el(RichText, { tagName: 'h2', className: 'bkbg-rss-heading', value: a.heading, onChange: function (v) { setAttributes({ heading: v }); }, placeholder: __('Heading…', 'blockenberg'), style: { color: a.headingColor, margin: '0 0 16px' } }),
                        a.showSubtext && el(RichText, { tagName: 'p', className: 'bkbg-rss-subtext', value: a.subtext, onChange: function (v) { setAttributes({ subtext: v }); }, placeholder: __('Subtext…', 'blockenberg'), style: { color: a.subtextColor, margin: '0 auto', maxWidth: 680 } })
                    ),

                    // Metrics grid
                    el('div', { className: 'bkbg-rss-metrics bkbg-rss-metrics--' + a.metricStyle, style: { display: 'grid', gridTemplateColumns: 'repeat(' + Math.min(a.metrics.length, 3) + ', 1fr)', gap: 24, marginBottom: a.showCaseStudy ? 40 : 0 } },
                        a.metrics.map(function (m, idx) {
                            var isDarkCard = a.metricStyle === 'dark';
                            var cardBgVal = isDarkCard ? '#1f2937' : (a.metricStyle === 'cards' ? a.metricCardBg : 'transparent');
                            var borderW = a.metricStyle === 'borderless' ? 0 : 1;
                            return el('div', { key: idx, style: { background: cardBgVal, border: borderW + 'px solid ' + a.metricCardBorder, borderRadius: 14, padding: 28, position: 'relative' } },
                                // Remove button
                                el(Button, { isDestructive: true, size: 'small', onClick: function () { removeMetric(idx); }, style: { position: 'absolute', top: 10, right: 10, fontSize: 10 } }, '✕'),
                                // Change badge
                                el('span', { style: { display: 'inline-block', background: changeBg(m), color: changeColor(m), fontWeight: 700, fontSize: 12, padding: '3px 10px', borderRadius: 999, marginBottom: 12 } },
                                    m.direction === 'down' ? '▼ ' : '▲ ', m.change
                                ),
                                // Before → After
                                el('div', { style: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 } },
                                    el('span', { style: { fontSize: 16, color: a.metricBeforeColor, textDecoration: 'line-through' } },
                                        el(RichText, { tagName: 'span', value: m.before, onChange: function (v) { updateMetric(idx, 'before', v); }, placeholder: 'Before' })
                                    ),
                                    el('span', { style: { fontSize: 13, color: a.metricBeforeColor } }, '→'),
                                    el('span', { style: { fontSize: a.metricAfterSize + 'px', fontWeight: 800, color: isDarkCard ? '#ffffff' : a.metricAfterColor, lineHeight: 1 } },
                                        el(RichText, { tagName: 'span', value: m.after, onChange: function (v) { updateMetric(idx, 'after', v); }, placeholder: 'After' })
                                    )
                                ),
                                el('p', { style: { fontWeight: 700, fontSize: 15, color: isDarkCard ? '#d1d5db' : a.metricLabelColor, margin: '0 0 4px' } },
                                    el(RichText, { tagName: 'span', value: m.label, onChange: function (v) { updateMetric(idx, 'label', v); }, placeholder: 'Label' })
                                ),
                                el('p', { style: { fontSize: 13, color: isDarkCard ? '#9ca3af' : a.subtextColor, margin: 0 } },
                                    el(RichText, { tagName: 'span', value: m.description, onChange: function (v) { updateMetric(idx, 'description', v); }, placeholder: 'Description' })
                                ),
                                el('div', { style: { marginTop: 10, display: 'flex', gap: 8 } },
                                    el(SelectControl, { label: __('Direction', 'blockenberg'), value: m.direction, options: [{ label: '▲ Up', value: 'up' }, { label: '▼ Down', value: 'down' }], onChange: function (v) { updateMetric(idx, 'direction', v); }, __nextHasNoMarginBottom: true })
                                )
                            );
                        }),
                        el('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px dashed #d1d5db', borderRadius: 14, minHeight: 60, cursor: 'pointer' }, onClick: addMetric },
                            el('span', { style: { fontSize: 13, color: '#9ca3af' } }, '+ Add Metric')
                        )
                    ),

                    // Case study card
                    a.showCaseStudy && el('div', { style: { background: a.caseBg, borderRadius: 16, padding: 36, borderLeft: '4px solid ' + a.accentColor } },
                        el('div', { style: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 } },
                            a.clientLogoUrl && el('img', { src: a.clientLogoUrl, style: { height: 36, objectFit: 'contain' } }),
                            el('span', { style: { fontWeight: 800, fontSize: a.caseNameSize || 18, color: a.caseNameColor } }, a.caseStudyName)
                        ),
                        el(RichText, { tagName: 'p', value: a.caseStudySummary, onChange: function (v) { setAttributes({ caseStudySummary: v }); }, placeholder: __('Case study summary…', 'blockenberg'), style: { color: a.caseSummaryColor, fontSize: 16, lineHeight: 1.7, margin: '0 0 16px' } }),
                        el('span', { style: { fontSize: 14, color: a.subtextColor } }, '— ', a.clientName)
                    ),

                    // CTA
                    a.showCtaRow && el('div', { style: { textAlign: 'center', marginTop: 36 } },
                        el('a', { href: '#', style: { display: 'inline-block', background: a.ctaBg, color: a.ctaColor, fontWeight: 700, fontSize: 15, padding: '14px 32px', borderRadius: 8, textDecoration: 'none' } }, a.ctaLabel)
                    )
                )
            );
        },
        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-rss-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
