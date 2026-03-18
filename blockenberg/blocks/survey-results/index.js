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
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function upd(arr, idx, field, val) {
        return arr.map(function (e, i) {
            if (i !== idx) return e;
            var u = {}; u[field] = val;
            return Object.assign({}, e, u);
        });
    }

    function updOpt(questions, qi, oi, field, val) {
        return questions.map(function (q, i) {
            if (i !== qi) return q;
            var newOpts = q.options.map(function (o, j) {
                if (j !== oi) return o;
                var u = {}; u[field] = val;
                return Object.assign({}, o, u);
            });
            return Object.assign({}, q, { options: newOpts });
        });
    }

    function fmtN(n) {
        return n >= 1000 ? (n / 1000).toFixed(0) + 'k' : String(n);
    }

    registerBlockType('blockenberg/survey-results', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) {
                    Object.assign(s, _tvf(a.titleTypo, '--bksr-tt-'));
                    Object.assign(s, _tvf(a.textTypo, '--bksr-tx-'));
                }
                return { className: 'bkbg-sr-editor-wrap', style: s };
            })());

            function renderQuestion(q, qi) {
                var maxPct = Math.max.apply(null, q.options.map(function (o) { return o.percent; }));
                return el('div', { key: qi, style: { padding: '18px 22px', borderBottom: '1px solid ' + a.borderColor } },
                    el('p', { className: 'bkbg-sr-q-text', style: { margin: '0 0 14px', color: a.questionColor } }, (qi + 1) + '. ' + q.question),
                    q.options.map(function (opt, oi) {
                        var isWinner = a.highlightWinner && opt.percent === maxPct;
                        return el('div', { key: oi, style: { marginBottom: 10, padding: isWinner ? '8px 10px' : '0', background: isWinner ? a.winnerBg : 'transparent', borderRadius: 6 } },
                            // Label row
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 } },
                                el('span', { style: { color: a.labelColor, fontWeight: isWinner ? 700 : 400 } }, opt.label),
                                el('span', { style: { display: 'flex', gap: 6 } },
                                    a.showPercentages && el('strong', { style: { color: a.percentColor, fontVariantNumeric: 'tabular-nums' } }, opt.percent + '%'),
                                    a.showCounts && el('span', { style: { color: a.countColor } }, '(' + fmtN(opt.count) + ')')
                                )
                            ),
                            // Bar
                            a.showBars && el('div', { style: { height: a.barHeight + 'px', background: a.barBg, borderRadius: 100 } },
                                el('div', { style: { width: opt.percent + '%', height: '100%', background: isWinner ? a.barFillWinner : a.barFill, borderRadius: 100, transition: 'width .3s' } })
                            )
                        );
                    })
                );
            }

            var preview = el('div', { className: 'bkbg-sr-wrap', style: { border: '1px solid ' + a.borderColor, borderRadius: a.borderRadius + 'px', overflow: 'hidden', background: a.bgColor } },
                // Header
                el('div', { className: 'bkbg-sr-header', style: { background: a.headerBg, padding: '18px 22px' } },
                    el('h2', { className: 'bkbg-sr-title', style: { margin: '0 0 6px', color: a.headerColor } }, a.surveyTitle),
                    a.showMeta && el('div', { className: 'bkbg-sr-meta', style: { color: a.metaColor } },
                        el('span', null, '🏢 ' + a.organization),
                        el('span', null, '👥 ' + a.respondents.toLocaleString() + ' ' + a.respondentsLabel),
                        el('span', null, '📅 ' + a.surveyDate)
                    )
                ),
                // Questions
                el('div', null, a.questions.map(renderQuestion)),
                // Methodology
                a.showMethodology && a.methodology && el('div', { className: 'bkbg-sr-methodology', style: { background: a.methodologyBg, padding: '12px 22px', borderTop: '1px solid ' + a.borderColor } },
                    el('p', { className: 'bkbg-sr-method-text', style: { margin: 0, color: a.methodologyColor, fontStyle: 'italic' } },
                        el('strong', null, 'Methodology: '),
                        a.methodology
                    )
                )
            );

            return el(Fragment, null,
                el('div', blockProps, preview),
                el(InspectorControls, null,
                    // Survey Info
                    el(PanelBody, { title: 'Survey Info', initialOpen: true },
                        el(TextControl, { label: 'Survey Title', value: a.surveyTitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ surveyTitle: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Organization', value: a.organization, __nextHasNoMarginBottom: true, onChange: function (v) { set({ organization: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                            el(TextControl, { label: 'Date', value: a.surveyDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ surveyDate: v }); } }),
                            el(TextControl, { label: 'Respondents Label', value: a.respondentsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ respondentsLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'Number of Respondents', value: a.respondents, min: 100, max: 1000000, step: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ respondents: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(ToggleControl, { label: 'Show Meta (org, respondents, date)', checked: a.showMeta, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showMeta: v }); } })
                        )
                    ),
                    // Display Options
                    el(PanelBody, { title: 'Display Options', initialOpen: false },
                        el(ToggleControl, { label: 'Show Bars', checked: a.showBars, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showBars: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(ToggleControl, { label: 'Show Percentages', checked: a.showPercentages, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showPercentages: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(ToggleControl, { label: 'Show Counts', checked: a.showCounts, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showCounts: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(ToggleControl, { label: 'Highlight Winner Option', checked: a.highlightWinner, __nextHasNoMarginBottom: true, onChange: function (v) { set({ highlightWinner: v }); } })
                        ),
                        a.showBars && el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'Bar Height (px)', value: a.barHeight, min: 4, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ barHeight: v }); } })
                        )
                    ),
                    // Questions
                    el(PanelBody, { title: 'Questions & Data', initialOpen: false },
                        a.questions.map(function (q, qi) {
                            return el('div', { key: qi, style: { marginBottom: 16, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' } },
                                el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
                                    el('strong', { style: { fontSize: 11, color: '#374151' } }, 'Question ' + (qi + 1)),
                                    el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ questions: a.questions.filter(function (_, j) { return j !== qi; }) }); } }, '✕')
                                ),
                                el(TextareaControl, { label: 'Question Text', value: q.question, rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { set({ questions: upd(a.questions, qi, 'question', v) }); } }),
                                el('div', { style: { marginTop: 8 } },
                                    el('label', { style: { display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 } }, 'Options'),
                                    q.options.map(function (opt, oi) {
                                        return el('div', { key: oi, style: { display: 'grid', gridTemplateColumns: '2fr 60px 80px auto', gap: 4, alignItems: 'center', marginBottom: 4 } },
                                            el(TextControl, { label: '', value: opt.label, placeholder: 'Option label', __nextHasNoMarginBottom: true, onChange: function (v) { set({ questions: updOpt(a.questions, qi, oi, 'label', v) }); } }),
                                            el(TextControl, { label: '', value: String(opt.percent), placeholder: '%', __nextHasNoMarginBottom: true, type: 'number', onChange: function (v) { set({ questions: updOpt(a.questions, qi, oi, 'percent', parseInt(v) || 0) }); } }),
                                            el(TextControl, { label: '', value: String(opt.count), placeholder: 'Count', __nextHasNoMarginBottom: true, type: 'number', onChange: function (v) { set({ questions: updOpt(a.questions, qi, oi, 'count', parseInt(v) || 0) }); } }),
                                            el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () {
                                                var newOpts = q.options.filter(function (_, j) { return j !== oi; });
                                                set({ questions: upd(a.questions, qi, 'options', newOpts) });
                                            } }, '✕')
                                        );
                                    }),
                                    el(Button, { variant: 'secondary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () {
                                        var newOpts = q.options.concat([{ label: 'Option', percent: 20, count: 0 }]);
                                        set({ questions: upd(a.questions, qi, 'options', newOpts) });
                                    } }, '+ Add Option')
                                )
                            );
                        }),
                        el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () {
                            set({ questions: a.questions.concat([{ question: 'New Question?', options: [{ label: 'Option A', percent: 60, count: 0 }, { label: 'Option B', percent: 40, count: 0 }] }]) });
                        } }, '+ Add Question')
                    ),
                    // Methodology
                    el(PanelBody, { title: 'Methodology', initialOpen: false },
                        el(ToggleControl, { label: 'Show Methodology', checked: a.showMethodology, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showMethodology: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextareaControl, { label: 'Methodology Text', value: a.methodology, rows: 4, __nextHasNoMarginBottom: true, onChange: function (v) { set({ methodology: v }); } })
                        )
                    ),
                    // Typography
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl()({ label: 'Title', value: a.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }),
                        getTypoControl()({ label: 'Text', value: a.textTypo, onChange: function (v) { set({ textTypo: v }); } })
                    ),
                    el(PanelBody, { title: 'Spacing', initialOpen: false },
                        el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    // Colors
                    el(PanelColorSettings, {
                        title: 'Header & Layout Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Block Background', value: a.bgColor,      onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                            { label: 'Border',           value: a.borderColor,  onChange: function (v) { set({ borderColor: v || '#e5e7eb' }); } },
                            { label: 'Header BG',        value: a.headerBg,     onChange: function (v) { set({ headerBg: v || '#0f172a' }); } },
                            { label: 'Header Text',      value: a.headerColor,  onChange: function (v) { set({ headerColor: v || '#ffffff' }); } },
                            { label: 'Meta Text',        value: a.metaColor,    onChange: function (v) { set({ metaColor: v || '#94a3b8' }); } },
                            { label: 'Methodology BG',   value: a.methodologyBg,onChange: function (v) { set({ methodologyBg: v || '#f8fafc' }); } },
                            { label: 'Methodology Text', value: a.methodologyColor, onChange: function (v) { set({ methodologyColor: v || '#6b7280' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: 'Chart & Option Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Question Text',   value: a.questionColor, onChange: function (v) { set({ questionColor: v || '#111827' }); } },
                            { label: 'Label Text',      value: a.labelColor,    onChange: function (v) { set({ labelColor: v || '#374151' }); } },
                            { label: 'Percent Text',    value: a.percentColor,  onChange: function (v) { set({ percentColor: v || '#111827' }); } },
                            { label: 'Count Text',      value: a.countColor,    onChange: function (v) { set({ countColor: v || '#6b7280' }); } },
                            { label: 'Bar BG',          value: a.barBg,         onChange: function (v) { set({ barBg: v || '#f1f5f9' }); } },
                            { label: 'Bar Fill',        value: a.barFill,       onChange: function (v) { set({ barFill: v || '#3b82f6' }); } },
                            { label: 'Bar Fill (Winner)',value: a.barFillWinner, onChange: function (v) { set({ barFillWinner: v || '#1d4ed8' }); } },
                            { label: 'Winner Row BG',   value: a.winnerBg,      onChange: function (v) { set({ winnerBg: v || '#eff6ff' }); } }
                        ]
                    })
                )
            );
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return wp.element.createElement('div', useBlockProps.save(),
                wp.element.createElement('div', {
                    className: 'bkbg-survey-results-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
