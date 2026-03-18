( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _dmTC, _dmTV;
    function _tc() { return _dmTC || (_dmTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_dmTV || (_dmTV = window.bkbgTypoCssVars)) ? _dmTV(t, p) : {}; }

    /* ── Calculation helpers ─────────────────────────── */
    function calcTotals(options, criteria) {
        return options.map(function (opt) {
            var total = 0;
            criteria.forEach(function (crit, ci) {
                total += (opt.scores[ci] || 0) * (crit.weight || 1);
            });
            return total;
        });
    }

    function winnerIdx(totals) {
        var maxVal = -1, maxIdx = -1;
        totals.forEach(function (t, i) { if (t > maxVal) { maxVal = t; maxIdx = i; } });
        return maxIdx;
    }

    /* ── ES5 update helpers ──────────────────────────── */
    function updateOption(options, idx, field, val) {
        return options.map(function (o, i) {
            if (i !== idx) return o;
            var u = {}; u[field] = val;
            return Object.assign({}, o, u);
        });
    }

    function updateScore(options, oIdx, cIdx, val) {
        return options.map(function (o, i) {
            if (i !== oIdx) return o;
            var newScores = o.scores.map(function (s, j) { return j === cIdx ? val : s; });
            return Object.assign({}, o, { scores: newScores });
        });
    }

    function updateCriterion(criteria, idx, field, val) {
        return criteria.map(function (c, i) {
            if (i !== idx) return c;
            var u = {}; u[field] = val;
            return Object.assign({}, c, u);
        });
    }

    function addOption(options, criteria) {
        var scores = criteria.map(function () { return 5; });
        return options.concat([{ name: 'New Option', scores: scores }]);
    }

    function removeOption(options, idx) {
        return options.filter(function (_, i) { return i !== idx; });
    }

    function addCriterion(criteria, options) {
        var newCriteria = criteria.concat([{ label: 'New Criterion', weight: 3 }]);
        var newOptions = options.map(function (o) {
            return Object.assign({}, o, { scores: o.scores.concat([5]) });
        });
        return { criteria: newCriteria, options: newOptions };
    }

    function removeCriterion(criteria, options, cIdx) {
        var newCriteria = criteria.filter(function (_, i) { return i !== cIdx; });
        var newOptions = options.map(function (o) {
            return Object.assign({}, o, { scores: o.scores.filter(function (_, i) { return i !== cIdx; }) });
        });
        return { criteria: newCriteria, options: newOptions };
    }

    registerBlockType('blockenberg/decision-matrix', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-dm-editor',
                style: Object.assign(
                    { '--bkbg-dm-ttl-fs': (a.titleFontSize || 24) + 'px',
                      '--bkbg-dm-sub-fs': (a.subtitleFontSize || 14) + 'px',
                      '--bkbg-dm-cel-fs': (a.fontSize || 14) + 'px' },
                    _tv(a.typoTitle || {}, '--bkbg-dm-ttl-'),
                    _tv(a.typoSubtitle || {}, '--bkbg-dm-sub-'),
                    _tv(a.typoCell || {}, '--bkbg-dm-cel-')
                )
            });

            var totals = calcTotals(a.options, a.criteria);
            var winner = a.showWinner ? winnerIdx(totals) : -1;
            var maxTotal = Math.max.apply(null, totals);

            function renderPreview() {
                return el('div', {
                    className: 'bkbg-dm-block',
                    style: { background: a.bgColor || undefined, boxSizing: 'border-box' }
                },
                    /* Header */
                    (a.showTitle || a.showSubtitle) && el('div', {
                        className: 'bkbg-dm-header',
                        style: { marginBottom: '20px' }
                    },
                        a.showTitle && el('h3', {
                            className: 'bkbg-dm-title',
                            style: { color: a.titleColor, margin: '0 0 6px' }
                        }, a.blockTitle),
                        a.showSubtitle && a.blockSubtitle && el('p', {
                            className: 'bkbg-dm-subtitle',
                            style: { color: a.subtitleColor, margin: 0 }
                        }, a.blockSubtitle)
                    ),
                    /* Winner banner */
                    a.showWinner && winner >= 0 && el('div', {
                        className: 'bkbg-dm-winner-banner',
                        style: {
                            background: a.winnerBg, border: '1px solid ' + a.winnerBorderColor,
                            borderRadius: a.borderRadius + 'px', padding: '12px 18px',
                            marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px'
                        }
                    },
                        el('span', { style: { fontSize: '20px' } }, '🏆'),
                        el('span', { style: { fontWeight: 700, color: a.winnerColor, fontSize: (a.winnerFontSize || 15) + 'px' } },
                            a.options[winner].name + ' wins with ' + totals[winner] + ' points'
                        )
                    ),
                    /* Table */
                    el('div', { style: { overflowX: 'auto' } },
                        el('table', {
                            className: 'bkbg-dm-table',
                            style: {
                                width: '100%', borderCollapse: 'collapse',
                                border: '1px solid ' + a.borderColor,
                                borderRadius: a.borderRadius + 'px',
                                overflow: 'hidden'
                            }
                        },
                            /* Header row */
                            el('thead', {},
                                el('tr', {},
                                    el('th', {
                                        style: {
                                            background: a.headerBg, color: a.headerColor,
                                            padding: '12px 16px', textAlign: 'left', fontWeight: 700,
                                            border: '1px solid rgba(255,255,255,.1)'
                                        }
                                    }, 'Criterion'),
                                    a.showWeights && el('th', {
                                        style: {
                                            background: a.headerBg, color: a.headerColor,
                                            padding: '12px 10px', textAlign: 'center', fontWeight: 600,
                                            fontSize: '12px', border: '1px solid rgba(255,255,255,.1)'
                                        }
                                    }, 'Weight'),
                                    a.options.map(function (opt, oIdx) {
                                        var isWin = oIdx === winner;
                                        return el('th', {
                                            key: oIdx,
                                            style: {
                                                background: isWin ? a.winnerBorderColor : a.headerBg,
                                                color: a.headerColor, padding: '12px 16px',
                                                textAlign: 'center', fontWeight: 700,
                                                border: '1px solid rgba(255,255,255,.1)'
                                            }
                                        },
                                            opt.name,
                                            isWin && el('span', { style: { marginLeft: '6px', fontSize: '14px' } }, '🏆')
                                        );
                                    })
                                )
                            ),
                            /* Body rows */
                            el('tbody', {},
                                a.criteria.map(function (crit, ci) {
                                    return el('tr', { key: ci },
                                        el('td', {
                                            style: {
                                                background: a.criteriaLabelBg, color: a.criteriaLabelColor,
                                                padding: '10px 16px', fontWeight: 600,
                                                border: '1px solid ' + a.borderColor
                                            }
                                        }, crit.label),
                                        a.showWeights && el('td', {
                                            style: {
                                                background: a.criteriaLabelBg, color: a.accentColor,
                                                padding: '10px', textAlign: 'center', fontWeight: 700, fontSize: '13px',
                                                border: '1px solid ' + a.borderColor
                                            }
                                        }, '×' + (crit.weight || 1)),
                                        a.options.map(function (opt, oi) {
                                            var raw = opt.scores[ci] || 0;
                                            var weighted = raw * (crit.weight || 1);
                                            var isWin = oi === winner;
                                            return el('td', {
                                                key: oi,
                                                style: {
                                                    background: isWin ? a.winnerBg : a.cellBg,
                                                    color: a.cellColor, padding: '10px 16px',
                                                    textAlign: 'center',
                                                    border: '1px solid ' + a.borderColor
                                                }
                                            },
                                                el('span', { style: { fontWeight: 600 } }, String(raw)),
                                                a.showRawScores && el('span', {
                                                    style: { fontSize: '11px', color: a.accentColor, marginLeft: '4px' }
                                                }, '(' + weighted + ')')
                                            );
                                        })
                                    );
                                }),
                                /* Total row */
                                el('tr', { style: { background: a.totalRowBg } },
                                    el('td', {
                                        colSpan: a.showWeights ? 2 : 1,
                                        style: {
                                            padding: '12px 16px', fontWeight: 700, fontSize: '13px',
                                            color: a.totalRowColor, textTransform: 'uppercase',
                                            letterSpacing: '.05em', background: a.totalRowBg,
                                            border: '1px solid ' + a.borderColor
                                        }
                                    }, '🏁 Weighted Total'),
                                    totals.map(function (t, i) {
                                        var isWin = i === winner;
                                        return el('td', {
                                            key: i,
                                            style: {
                                                padding: '12px 16px', textAlign: 'center', fontWeight: 800,
                                                fontSize: '16px',
                                                color: isWin ? a.winnerColor : a.totalRowColor,
                                                background: isWin ? a.winnerBg : a.totalRowBg,
                                                border: '1px solid ' + a.borderColor
                                            }
                                        }, String(t));
                                    })
                                )
                            )
                        )
                    )
                );
            }

            var inspector = el(InspectorControls, {},
                /* Title */
                el(PanelBody, { title: 'Title', initialOpen: true },
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Title', checked: a.showTitle, onChange: function (v) { set({ showTitle: v }); } }),
                    a.showTitle && el(TextControl, { __nextHasNoMarginBottom: true, label: 'Title', value: a.blockTitle, onChange: function (v) { set({ blockTitle: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Subtitle', checked: a.showSubtitle, onChange: function (v) { set({ showSubtitle: v }); } }),
                    a.showSubtitle && el(TextControl, { __nextHasNoMarginBottom: true, label: 'Subtitle', value: a.blockSubtitle, onChange: function (v) { set({ blockSubtitle: v }); } })
                ),
                /* Options */
                el(PanelBody, { title: 'Options (' + a.options.length + ')', initialOpen: true },
                    a.options.map(function (opt, oi) {
                        return el('div', {
                            key: oi,
                            style: { border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, marginBottom: 8, background: '#f8fafc' }
                        },
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 } },
                                el('strong', { style: { fontSize: 12 } }, 'Option ' + (oi + 1)),
                                el(Button, { isSmall: true, isDestructive: true, onClick: function () { set({ options: removeOption(a.options, oi) }); } }, '✕')
                            ),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: 'Name', value: opt.name, onChange: function (v) { set({ options: updateOption(a.options, oi, 'name', v) }); } }),
                            el('div', { style: { fontSize: 11, fontWeight: 600, marginBottom: 4, color: '#64748b' } }, 'Scores (1–10):'),
                            el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
                                a.criteria.map(function (crit, ci) {
                                    return el('label', { key: ci, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 10, gap: 2 } },
                                        el('span', { style: { maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#475569' } }, crit.label),
                                        el('input', {
                                            type: 'number', min: 0, max: 10,
                                            value: opt.scores[ci] !== undefined ? opt.scores[ci] : 5,
                                            style: { width: 44, textAlign: 'center', padding: '3px 4px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 },
                                            onChange: function (e) { set({ options: updateScore(a.options, oi, ci, parseInt(e.target.value) || 0) }); }
                                        })
                                    );
                                })
                            )
                        );
                    }),
                    el(Button, {
                        variant: 'secondary', style: { width: '100%', justifyContent: 'center', marginTop: 4 },
                        onClick: function () { set({ options: addOption(a.options, a.criteria) }); }
                    }, '+ Add Option')
                ),
                /* Criteria */
                el(PanelBody, { title: 'Criteria (' + a.criteria.length + ')', initialOpen: true },
                    a.criteria.map(function (crit, ci) {
                        return el('div', {
                            key: ci,
                            style: { border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, marginBottom: 8, background: '#f8fafc' }
                        },
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 } },
                                el('strong', { style: { fontSize: 12 } }, 'Criterion ' + (ci + 1)),
                                el(Button, {
                                    isSmall: true, isDestructive: true,
                                    onClick: function () {
                                        var result = removeCriterion(a.criteria, a.options, ci);
                                        set({ criteria: result.criteria, options: result.options });
                                    }
                                }, '✕')
                            ),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: 'Label', value: crit.label, onChange: function (v) { set({ criteria: updateCriterion(a.criteria, ci, 'label', v) }); } }),
                            el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Weight (importance)', value: crit.weight || 1, min: 1, max: 10, onChange: function (v) { set({ criteria: updateCriterion(a.criteria, ci, 'weight', v) }); } })
                        );
                    }),
                    el(Button, {
                        variant: 'secondary', style: { width: '100%', justifyContent: 'center', marginTop: 4 },
                        onClick: function () {
                            var result = addCriterion(a.criteria, a.options);
                            set({ criteria: result.criteria, options: result.options });
                        }
                    }, '+ Add Criterion')
                ),
                /* Display */
                el(PanelBody, { title: 'Display', initialOpen: false },
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Weights Column', checked: a.showWeights, onChange: function (v) { set({ showWeights: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Weighted Score', checked: a.showRawScores, onChange: function (v) { set({ showRawScores: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Highlight Winner', checked: a.showWinner, onChange: function (v) { set({ showWinner: v }); } })
                ),
                /* Typography */
                el(PanelBody, { title: 'Typography', initialOpen: false },
                    _tc() && _tc()({ label: __('Title typography', 'blockenberg'), value: a.typoTitle || {}, onChange: function (v) { set({ typoTitle: v }); } }),
                    _tc() && _tc()({ label: __('Subtitle typography', 'blockenberg'), value: a.typoSubtitle || {}, onChange: function (v) { set({ typoSubtitle: v }); } }),
                    _tc() && _tc()({ label: __('Table typography', 'blockenberg'), value: a.typoCell || {}, onChange: function (v) { set({ typoCell: v }); } }),
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Winner Label Font Size', value: a.winnerFontSize, min: 10, max: 24, onChange: function (v) { set({ winnerFontSize: v }); } })
                ),
                /* Appearance */
                el(PanelBody, { title: 'Appearance', initialOpen: false },
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Border Radius', value: a.borderRadius, min: 0, max: 20, onChange: function (v) { set({ borderRadius: v }); } })
                ),
                /* Colors */
                el(PanelColorSettings, {
                    title: 'Colors', initialOpen: false,
                    colorSettings: [
                        { label: 'Block Background', value: a.bgColor, onChange: function (v) { set({ bgColor: v || '' }); } },
                        { label: 'Header Background', value: a.headerBg, onChange: function (v) { set({ headerBg: v || '#1e293b' }); } },
                        { label: 'Header Text', value: a.headerColor, onChange: function (v) { set({ headerColor: v || '#ffffff' }); } },
                        { label: 'Criteria Label Bg', value: a.criteriaLabelBg, onChange: function (v) { set({ criteriaLabelBg: v || '#f1f5f9' }); } },
                        { label: 'Criteria Label Color', value: a.criteriaLabelColor, onChange: function (v) { set({ criteriaLabelColor: v || '#475569' }); } },
                        { label: 'Cell Background', value: a.cellBg, onChange: function (v) { set({ cellBg: v || '#ffffff' }); } },
                        { label: 'Cell Color', value: a.cellColor, onChange: function (v) { set({ cellColor: v || '#374151' }); } },
                        { label: 'Border Color', value: a.borderColor, onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); } },
                        { label: 'Winner Background', value: a.winnerBg, onChange: function (v) { set({ winnerBg: v || '#eff6ff' }); } },
                        { label: 'Winner Color', value: a.winnerColor, onChange: function (v) { set({ winnerColor: v || '#1d4ed8' }); } },
                        { label: 'Winner Border', value: a.winnerBorderColor, onChange: function (v) { set({ winnerBorderColor: v || '#3b82f6' }); } },
                        { label: 'Total Row Bg', value: a.totalRowBg, onChange: function (v) { set({ totalRowBg: v || '#f8fafc' }); } },
                        { label: 'Accent Color', value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#3b82f6' }); } }
                    ]
                })
            );

            return el(Fragment, {}, inspector, el('div', blockProps, renderPreview()));
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-decision-matrix-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
