( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
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
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    var _crsTC, _crsTV;
    function _tc() { return _crsTC || (_crsTC = window.bkbgTypographyControl); }
    function _tv(typo, prefix) { return _crsTV ? _crsTV(typo, prefix) : ((_crsTV = window.bkbgTypoCssVars) ? _crsTV(typo, prefix) : {}); }

    function setResult(results, idx, key, val, setAttr) {
        var next = results.map(function (r, i) { return i === idx ? Object.assign({}, r, { [key]: val }) : r; });
        setAttr({ results: next });
    }
    function setMetric(results, rIdx, mIdx, key, val, setAttr) {
        var next = results.map(function (r, i) {
            if (i !== rIdx) return r;
            var metrics = r.metrics.map(function (m, j) { return j === mIdx ? Object.assign({}, m, { [key]: val }) : m; });
            return Object.assign({}, r, { metrics: metrics });
        });
        setAttr({ results: next });
    }

    function renderResultCard(result, attr) {
        return el('div', { className: 'bkbg-crs-card', style: { background: attr.cardBg, borderColor: attr.cardBorder } },
            /* Company logo / name */
            attr.showLogo && el('div', { className: 'bkbg-crs-company-row', style: { background: attr.logoBg } },
                result.companyLogo
                    ? el('img', { src: result.companyLogo, className: 'bkbg-crs-company-logo', alt: result.companyName })
                    : el('div', { className: 'bkbg-crs-company-name-fallback', style: { color: attr.accentColor } }, result.companyName)
            ),
            /* Quote */
            el('blockquote', { className: 'bkbg-crs-quote', style: { color: attr.quoteColor } }, '"' + result.quote + '"'),
            /* Author */
            attr.showAuthor && el('div', { className: 'bkbg-crs-author-row' },
                el('div', { className: 'bkbg-crs-author-name', style: { color: attr.authorColor } }, result.authorName),
                el('div', { className: 'bkbg-crs-author-title', style: { color: attr.titleColor } }, result.authorTitle)
            ),
            /* Metrics */
            attr.showMetrics && result.metrics && result.metrics.length > 0 && el('div', { className: 'bkbg-crs-metrics' },
                result.metrics.map(function (m, mi) {
                    return el('div', { key: mi, className: 'bkbg-crs-metric' },
                        el('div', { className: 'bkbg-crs-metric-val', style: { color: attr.metricNumColor, fontSize: (attr.metricNumFontSize || 28) + 'px' } }, m.value),
                        el('div', { className: 'bkbg-crs-metric-label', style: { color: attr.metricLabelColor, fontSize: (attr.metricLabelFontSize || 13) + 'px' } }, m.label)
                    );
                })
            ),
            /* Tags */
            attr.showTags && result.tags && result.tags.length > 0 && el('div', { className: 'bkbg-crs-tags' },
                result.tags.map(function (tag, ti) {
                    return el('span', { key: ti, className: 'bkbg-crs-tag', style: { background: attr.tagBg, color: attr.tagColor } }, tag);
                })
            )
        );
    }

    registerBlockType('blockenberg/customer-results', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            return el(wp.element.Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(TextControl, { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrow, onChange: function (v) { setAttr({ eyebrow: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Heading', 'blockenberg'), value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Subtext', 'blockenberg'), value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Layout', 'blockenberg'), value: attr.layout, options: [{ label: 'Grid', value: 'grid' }, { label: 'List (horizontal)', value: 'list' }, { label: 'Featured First', value: 'featured' }], onChange: function (v) { setAttr({ layout: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Columns (grid)', 'blockenberg'), value: attr.columns, min: 1, max: 4, onChange: function (v) { setAttr({ columns: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Company Logo', 'blockenberg'), checked: attr.showLogo, onChange: function (v) { setAttr({ showLogo: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Author', 'blockenberg'), checked: attr.showAuthor, onChange: function (v) { setAttr({ showAuthor: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Metrics', 'blockenberg'), checked: attr.showMetrics, onChange: function (v) { setAttr({ showMetrics: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Tags', 'blockenberg'), checked: attr.showTags, onChange: function (v) { setAttr({ showTags: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Max Width', 'blockenberg'), value: attr.maxWidth, min: 600, max: 1600, step: 20, onChange: function (v) { setAttr({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#f8fafc' }); } },
                            { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); } },
                            { label: __('Subtext', 'blockenberg'), value: attr.subColor, onChange: function (v) { setAttr({ subColor: v || '#6b7280' }); } },
                            { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowColor, onChange: function (v) { setAttr({ eyebrowColor: v || '#6366f1' }); } },
                            { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#ffffff' }); } },
                            { label: __('Card Border', 'blockenberg'), value: attr.cardBorder, onChange: function (v) { setAttr({ cardBorder: v || '#e2e8f0' }); } },
                            { label: __('Quote Text', 'blockenberg'), value: attr.quoteColor, onChange: function (v) { setAttr({ quoteColor: v || '#374151' }); } },
                            { label: __('Author Name', 'blockenberg'), value: attr.authorColor, onChange: function (v) { setAttr({ authorColor: v || '#111827' }); } },
                            { label: __('Author Title', 'blockenberg'), value: attr.titleColor, onChange: function (v) { setAttr({ titleColor: v || '#6b7280' }); } },
                            { label: __('Metric Number', 'blockenberg'), value: attr.metricNumColor, onChange: function (v) { setAttr({ metricNumColor: v || '#6366f1' }); } },
                            { label: __('Metric Label', 'blockenberg'), value: attr.metricLabelColor, onChange: function (v) { setAttr({ metricLabelColor: v || '#6b7280' }); } },
                            { label: __('Tag Background', 'blockenberg'), value: attr.tagBg, onChange: function (v) { setAttr({ tagBg: v || '#ede9fe' }); } },
                            { label: __('Tag Text', 'blockenberg'), value: attr.tagColor, onChange: function (v) { setAttr({ tagColor: v || '#6d28d9' }); } }
                        ]
                    }),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Eyebrow', 'blockenberg'), typo: attr.typoEyebrow || {}, onChange: function(v) { setAttr({ typoEyebrow: v }); } }),
                        _tc() && el(_tc(), { label: __('Heading', 'blockenberg'), typo: attr.typoHeading || {}, onChange: function(v) { setAttr({ typoHeading: v }); } }),
                        _tc() && el(_tc(), { label: __('Subtext', 'blockenberg'), typo: attr.typoSubtext || {}, onChange: function(v) { setAttr({ typoSubtext: v }); } }),
                        el(RangeControl, { label: __('Metric number font size (px)', 'blockenberg'), value: attr.metricNumFontSize, min: 16, max: 48, onChange: function (v) { setAttr({ metricNumFontSize: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Metric label font size (px)', 'blockenberg'), value: attr.metricLabelFontSize, min: 10, max: 18, onChange: function (v) { setAttr({ metricLabelFontSize: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    /* Customer result panels */
                    el(PanelBody, { title: __('Customer Stories', 'blockenberg'), initialOpen: false },
                        attr.results.map(function (result, idx) {
                            return el(PanelBody, { key: idx, title: (result.companyName || 'Story ' + (idx + 1)), initialOpen: false },
                                el(TextControl, { label: __('Company Name', 'blockenberg'), value: result.companyName, onChange: function (v) { setResult(attr.results, idx, 'companyName', v, setAttr); }, __nextHasNoMarginBottom: true }),
                                el(TextareaControl, { label: __('Quote', 'blockenberg'), value: result.quote, onChange: function (v) { setResult(attr.results, idx, 'quote', v, setAttr); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Author Name', 'blockenberg'), value: result.authorName, onChange: function (v) { setResult(attr.results, idx, 'authorName', v, setAttr); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Author Title', 'blockenberg'), value: result.authorTitle, onChange: function (v) { setResult(attr.results, idx, 'authorTitle', v, setAttr); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Tags (comma-separated)', 'blockenberg'), value: (result.tags || []).join(', '), onChange: function (v) { setResult(attr.results, idx, 'tags', v.split(',').map(function (t) { return t.trim(); }).filter(Boolean), setAttr); }, __nextHasNoMarginBottom: true }),
                                el('p', { style: { fontWeight: 600, fontSize: 12, margin: '8px 0 4px' } }, __('Metrics', 'blockenberg')),
                                (result.metrics || []).map(function (metric, mi) {
                                    return el('div', { key: mi, style: { display: 'flex', gap: 8, marginBottom: 6 } },
                                        el(TextControl, { label: __('Value', 'blockenberg'), value: metric.value, onChange: function (v) { setMetric(attr.results, idx, mi, 'value', v, setAttr); }, __nextHasNoMarginBottom: true }),
                                        el(TextControl, { label: __('Label', 'blockenberg'), value: metric.label, onChange: function (v) { setMetric(attr.results, idx, mi, 'label', v, setAttr); }, __nextHasNoMarginBottom: true })
                                    );
                                }),
                                el('p', { style: { fontWeight: 600, fontSize: 12, marginBottom: 4 } }, __('Company Logo', 'blockenberg')),
                                el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function (m) { setResult(attr.results, idx, 'companyLogo', m.url, setAttr); },
                                        allowedTypes: ['image'], value: result.companyLogo,
                                        render: function (rp) {
                                            return el('div', null,
                                                result.companyLogo && el('img', { src: result.companyLogo, style: { maxHeight: 36, display: 'block', marginBottom: 6 } }),
                                                el(Button, { onClick: rp.open, variant: 'secondary', size: 'small' }, result.companyLogo ? __('Change', 'blockenberg') : __('Upload Logo', 'blockenberg')),
                                                result.companyLogo && el(Button, { onClick: function () { setResult(attr.results, idx, 'companyLogo', '', setAttr); }, variant: 'link', isDestructive: true, size: 'small', style: { marginLeft: 8 } }, __('Remove', 'blockenberg'))
                                            );
                                        }
                                    })
                                ),
                                el(Button, { onClick: function () { setAttr({ results: attr.results.filter(function (_, i) { return i !== idx; }) }); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true }, __('Remove Story', 'blockenberg'))
                            );
                        }),
                        el(Button, { onClick: function () { setAttr({ results: attr.results.concat([{ companyName: 'New Company', companyLogo: '', authorName: 'Name', authorTitle: 'Title', quote: 'Amazing results!', metrics: [{ value: '0%', label: 'Improvement' }], tags: [] }]) }); }, variant: 'secondary', style: { marginTop: 8 } }, __('+ Add Story', 'blockenberg'))
                    )
                ),
                /* Editor Preview */
                el('div', Object.assign(useBlockProps({ className: 'bkbg-crs-editor', style: Object.assign({ background: attr.bgColor },
                    { '--bkbg-crs-eye-fs': (attr.eyebrowFontSize || 14) + 'px', '--bkbg-crs-hdg-fs': (attr.headingFontSize || 28) + 'px', '--bkbg-crs-sub-fs': (attr.subtextFontSize || 16) + 'px' },
                    _tv(attr.typoEyebrow, '--bkbg-crs-eye-'),
                    _tv(attr.typoHeading, '--bkbg-crs-hdg-'),
                    _tv(attr.typoSubtext, '--bkbg-crs-sub-')) })),
                    el('div', { className: 'bkbg-crs-inner', style: { maxWidth: attr.maxWidth + 'px', margin: '0 auto', padding: attr.paddingTop + 'px 24px ' + attr.paddingBottom + 'px' } },
                        el('div', { className: 'bkbg-crs-header', style: { textAlign: 'center', marginBottom: 48 } },
                            el(RichText, { tagName: 'p', className: 'bkbg-crs-eyebrow', style: { color: attr.eyebrowColor }, value: attr.eyebrow, onChange: function (v) { setAttr({ eyebrow: v }); }, placeholder: __('Eyebrow…', 'blockenberg') }),
                            el(RichText, { tagName: 'h2', className: 'bkbg-crs-heading', style: { color: attr.headingColor }, value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, placeholder: __('Heading…', 'blockenberg') }),
                            el(RichText, { tagName: 'p', className: 'bkbg-crs-sub', style: { color: attr.subColor }, value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, placeholder: __('Subtext…', 'blockenberg') })
                        ),
                        el('div', { className: 'bkbg-crs-grid layout-' + attr.layout, style: { gridTemplateColumns: attr.layout === 'grid' ? 'repeat(' + attr.columns + ',1fr)' : undefined } },
                            attr.results.map(function (result, idx) { return el(wp.element.Fragment, { key: idx }, renderResultCard(result, attr)); })
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-crs-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
