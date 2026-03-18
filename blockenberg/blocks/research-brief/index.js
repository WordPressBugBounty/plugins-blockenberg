( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var studyTypeOptions = [
        { label: '📊 Survey',         value: 'survey'       },
        { label: '🔬 Experiment',      value: 'experiment'   },
        { label: '📚 Meta-Analysis',   value: 'meta-analysis'},
        { label: '🗂️ Case Study',      value: 'case-study'   },
        { label: '🔍 Literature Review', value: 'review'     }
    ];
    var studyTypeLabels = {
        'survey':       '📊 Survey',
        'experiment':   '🔬 Experiment',
        'meta-analysis':'📚 Meta-Analysis',
        'case-study':   '🗂️ Case Study',
        'review':       '🔍 Review'
    };
    var sigOptions = [
        { label: '🟢 High Significance', value: 'high'   },
        { label: '🟡 Medium',             value: 'medium' },
        { label: '⚪ Low',                value: 'low'    }
    ];

    function upd(arr, idx, field, val) {
        return arr.map(function (e, i) {
            if (i !== idx) return e;
            var u = {}; u[field] = val;
            return Object.assign({}, e, u);
        });
    }

    function sectionHead(label, a) {
        return el('div', { style: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em', color: a.accentColor, borderBottom: '2px solid ' + a.accentColor, paddingBottom: 5, marginBottom: 10 } }, label);
    }

    function sigBadgeStyle(sig, a) {
        if (sig === 'high')   return { background: a.highBg, color: a.highColor };
        if (sig === 'medium') return { background: a.medBg,  color: a.medColor  };
        return { background: a.lowBg, color: a.lowColor };
    }
    function sigLabel(sig) {
        if (sig === 'high')   return '🟢 High';
        if (sig === 'medium') return '🟡 Medium';
        return '⚪ Low';
    }

    registerBlockType('blockenberg/research-brief', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var TC = getTypoControl();
            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.titleTypo || {}, '--bkrb-tt-'));
                    Object.assign(s, _tvFn(a.bodyTypo || {}, '--bkrb-bt-'));
                }
                return { className: 'bkbg-rb-editor-wrap', style: s };
            })());

            var preview = el('div', { className: 'bkbg-rb-wrap', style: { border: '1px solid ' + a.borderColor, borderRadius: a.borderRadius + 'px', overflow: 'hidden', background: a.bgColor } },
                // Header
                el('div', { style: { background: a.headerBg, padding: '20px 24px' } },
                    el('div', { style: { marginBottom: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' } },
                        el('span', { style: { display: 'inline-block', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: a.typeBadgeBg, color: a.typeBadgeColor } }, studyTypeLabels[a.studyType] || a.studyType),
                        a.publicationYear && el('span', { style: { fontSize: 12, color: a.metaColor } }, a.publicationYear)
                    ),
                    el('h2', { className: 'bkbg-rb-title', style: { margin: '0 0 10px', color: a.headerColor } }, a.studyTitle),
                    el('div', { style: { display: 'flex', gap: 14, flexWrap: 'wrap' } },
                        a.authors     && el('span', { style: { fontSize: 12, color: a.metaColor } }, '✍️ ' + a.authors),
                        a.publication && el('span', { style: { fontSize: 12, color: a.metaColor } }, '📰 ' + a.publication)
                    )
                ),
                // Meta strip — sample size
                a.sampleSize && el('div', { style: { padding: '10px 24px', borderBottom: '1px solid ' + a.borderColor, background: '#f8fafc', fontSize: 12, color: '#374151' } },
                    el('strong', null, 'Sample: '), a.sampleSize
                ),
                // Body
                el('div', { style: { padding: '18px 24px', display: 'grid', gap: 20 } },
                    // Methodology
                    a.showMethodology && a.methodology && el('div', null,
                        sectionHead('Methodology', a),
                        el('p', { className: 'bkbg-rb-method', style: { margin: 0, background: a.methodBg, borderRadius: 8, padding: '12px 14px', color: a.methodColor } }, a.methodology)
                    ),
                    // Findings
                    a.showFindings && a.findings.length > 0 && el('div', null,
                        sectionHead(a.findingsLabel, a),
                        el('div', { style: { display: 'grid', gap: 8 } },
                            a.findings.map(function (f, i) {
                                var bs = sigBadgeStyle(f.significance, a);
                                return el('div', { key: i, style: { display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', background: '#f8fafc', borderRadius: 8, borderLeft: '3px solid ' + a.accentColor } },
                                    el('span', { style: { flexShrink: 0, padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: bs.background, color: bs.color, whiteSpace: 'nowrap', marginTop: 1 } }, sigLabel(f.significance)),
                                    el('p', { className: 'bkbg-rb-finding-text', style: { margin: 0, color: '#374151' } }, f.finding)
                                );
                            })
                        )
                    ),
                    // Limitations
                    a.showLimitations && a.limitations.length > 0 && el('div', null,
                        sectionHead(a.limitationsLabel, a),
                        el('ul', { style: { margin: 0, paddingLeft: 18, color: a.limitColor } },
                            a.limitations.map(function (l, i) { return el('li', { key: i, style: { marginBottom: 5 } }, l); })
                        )
                    ),
                    // Takeaways
                    a.showTakeaways && a.takeaways.length > 0 && el('div', null,
                        sectionHead(a.takeawaysLabel, a),
                        el('div', { style: { display: 'grid', gap: 6 } },
                            a.takeaways.map(function (t, i) {
                                return el('div', { key: i, style: { display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', background: a.takeawayBg, borderLeft: '3px solid ' + a.takeawayBorder, borderRadius: '0 6px 6px 0' } },
                                    el('span', { style: { color: a.takeawayBorder, flexShrink: 0, fontWeight: 700 } }, '✓'),
                                    el('span', { style: { color: a.takeawayColor } }, t)
                                );
                            })
                        )
                    ),
                    // Source
                    a.showSource && a.doi && el('div', { style: { fontSize: 12, color: a.metaColor, paddingTop: 8, borderTop: '1px solid ' + a.borderColor } },
                        el('span', null, 'DOI: '),
                        el('a', { href: a.sourceUrl || '#', style: { color: a.accentColor }, target: '_blank', rel: 'noopener' }, a.doi)
                    )
                )
            );

            return el(Fragment, null,
                el('div', blockProps, preview),
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Study Info', initialOpen: true },
                        el(TextareaControl, { label: 'Study Title', value: a.studyTitle, rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { set({ studyTitle: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(SelectControl, { label: 'Study Type', value: a.studyType, options: studyTypeOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ studyType: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 8 } },
                            el(TextControl, { label: 'Authors', value: a.authors, __nextHasNoMarginBottom: true, onChange: function (v) { set({ authors: v }); } }),
                            el(TextControl, { label: 'Year', value: a.publicationYear, __nextHasNoMarginBottom: true, onChange: function (v) { set({ publicationYear: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Publication', value: a.publication, __nextHasNoMarginBottom: true, onChange: function (v) { set({ publication: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Sample Size / Scope', value: a.sampleSize, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sampleSize: v }); } })
                        )
                    ),
                    el(PanelBody, { title: 'Methodology', initialOpen: false },
                        el(ToggleControl, { label: 'Show Methodology', checked: a.showMethodology, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showMethodology: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextareaControl, { label: 'Methodology', value: a.methodology, rows: 4, __nextHasNoMarginBottom: true, onChange: function (v) { set({ methodology: v }); } })
                        )
                    ),
                    el(PanelBody, { title: 'Findings', initialOpen: false },
                        el(ToggleControl, { label: 'Show Findings', checked: a.showFindings, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showFindings: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.findingsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ findingsLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            a.findings.map(function (f, i) {
                                return el('div', { key: i, style: { marginBottom: 10, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' } },
                                    el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' } },
                                        el(SelectControl, { label: '', value: f.significance, options: sigOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ findings: upd(a.findings, i, 'significance', v) }); } }),
                                        el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ findings: a.findings.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                    ),
                                    el(TextareaControl, { label: 'Finding', value: f.finding, rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { set({ findings: upd(a.findings, i, 'finding', v) }); } })
                                );
                            }),
                            el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ findings: a.findings.concat([{ finding: 'New finding.', significance: 'medium' }]) }); } }, '+ Add Finding')
                        )
                    ),
                    el(PanelBody, { title: 'Limitations', initialOpen: false },
                        el(ToggleControl, { label: 'Show Limitations', checked: a.showLimitations, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showLimitations: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.limitationsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ limitationsLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            a.limitations.map(function (l, i) {
                                return el('div', { key: i, style: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'flex-start' } },
                                    el(TextControl, { label: '', value: l, __nextHasNoMarginBottom: true, onChange: function (v) { set({ limitations: a.limitations.map(function (x, j) { return j === i ? v : x; }) }); } }),
                                    el(Button, { isDestructive: true, variant: 'link', style: { flexShrink: 0 }, onClick: function () { set({ limitations: a.limitations.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                );
                            }),
                            el(Button, { variant: 'secondary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ limitations: a.limitations.concat(['New limitation']) }); } }, '+ Add Limitation')
                        )
                    ),
                    el(PanelBody, { title: 'Takeaways', initialOpen: false },
                        el(ToggleControl, { label: 'Show Takeaways', checked: a.showTakeaways, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showTakeaways: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.takeawaysLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ takeawaysLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            a.takeaways.map(function (t, i) {
                                return el('div', { key: i, style: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'flex-start' } },
                                    el(TextControl, { label: '', value: t, __nextHasNoMarginBottom: true, onChange: function (v) { set({ takeaways: a.takeaways.map(function (x, j) { return j === i ? v : x; }) }); } }),
                                    el(Button, { isDestructive: true, variant: 'link', style: { flexShrink: 0 }, onClick: function () { set({ takeaways: a.takeaways.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                );
                            }),
                            el(Button, { variant: 'secondary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ takeaways: a.takeaways.concat(['New takeaway']) }); } }, '+ Add Takeaway')
                        )
                    ),
                    el(PanelBody, { title: 'Source', initialOpen: false },
                        el(ToggleControl, { label: 'Show Source / DOI', checked: a.showSource, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSource: v }); } }),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                            el(TextControl, { label: 'DOI', value: a.doi, __nextHasNoMarginBottom: true, onChange: function (v) { set({ doi: v }); } }),
                            el(TextControl, { label: 'URL', value: a.sourceUrl, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sourceUrl: v }); } })
                        )
                    ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        TC && el(TC, { label: 'Title', value: a.titleTypo || {}, onChange: function(v) { set({ titleTypo: v }); } }),
                        TC && el(TC, { label: 'Body Text', value: a.bodyTypo || {}, onChange: function(v) { set({ bodyTypo: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                        )
                    ),
                    el(PanelColorSettings, {
                        title: 'Header Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Header BG',    value: a.headerBg,       onChange: function (v) { set({ headerBg: v || '#0f172a' }); } },
                            { label: 'Header Text',  value: a.headerColor,    onChange: function (v) { set({ headerColor: v || '#f8fafc' }); } },
                            { label: 'Meta Text',    value: a.metaColor,      onChange: function (v) { set({ metaColor: v || '#94a3b8' }); } },
                            { label: 'Accent',       value: a.accentColor,    onChange: function (v) { set({ accentColor: v || '#0284c7' }); } },
                            { label: 'Block BG',     value: a.bgColor,        onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                            { label: 'Border',       value: a.borderColor,    onChange: function (v) { set({ borderColor: v || '#e5e7eb' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: 'Significance Badge Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'High BG',    value: a.highBg,    onChange: function (v) { set({ highBg: v || '#dcfce7' }); } },
                            { label: 'High Text',  value: a.highColor, onChange: function (v) { set({ highColor: v || '#14532d' }); } },
                            { label: 'Med BG',     value: a.medBg,     onChange: function (v) { set({ medBg: v || '#fef9c3' }); } },
                            { label: 'Med Text',   value: a.medColor,  onChange: function (v) { set({ medColor: v || '#713f12' }); } },
                            { label: 'Low BG',     value: a.lowBg,     onChange: function (v) { set({ lowBg: v || '#f1f5f9' }); } },
                            { label: 'Low Text',   value: a.lowColor,  onChange: function (v) { set({ lowColor: v || '#374151' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: 'Section Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Method BG',      value: a.methodBg,      onChange: function (v) { set({ methodBg: v || '#f0f9ff' }); } },
                            { label: 'Limitations',    value: a.limitColor,    onChange: function (v) { set({ limitColor: v || '#7c3aed' }); } },
                            { label: 'Takeaway BG',    value: a.takeawayBg,    onChange: function (v) { set({ takeawayBg: v || '#f0fdf4' }); } },
                            { label: 'Takeaway Border',value: a.takeawayBorder,onChange: function (v) { set({ takeawayBorder: v || '#16a34a' }); } },
                            { label: 'Takeaway Text',  value: a.takeawayColor, onChange: function (v) { set({ takeawayColor: v || '#166534' }); } }
                        ]
                    })
                )
            );
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return wp.element.createElement('div', useBlockProps.save(),
                wp.element.createElement('div', {
                    className: 'bkbg-research-brief-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
