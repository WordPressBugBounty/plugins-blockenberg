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
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc, _tvf;
    Object.defineProperty(window, '_bkbgTypoCtrlCache', { get: function () { if (!_tc) { _tc = window.bkbgTypographyControl; } return _tc; } });
    Object.defineProperty(window, '_bkbgTypoVarsCache', { get: function () { if (!_tvf) { _tvf = window.bkbgTypoCssVars; } return _tvf; } });
    function getTypoControl(props, attrName, label) { return window._bkbgTypoCtrlCache(props, attrName, label); }

    var SEVERITY_OPTIONS = [
        { label: 'Critical', value: 'critical' },
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' }
    ];

    function severityLabel(s) {
        if (s === 'critical') return '🔴 Critical';
        if (s === 'high')     return '🟠 High';
        if (s === 'medium')   return '🟡 Medium';
        return '🟢 Low';
    }

    function getSevStyle(s, a) {
        if (s === 'critical') return { background: a.criticalBg, color: a.criticalColor };
        if (s === 'high')     return { background: a.highBg,     color: a.highColor     };
        if (s === 'medium')   return { background: a.mediumBg,   color: a.mediumColor   };
        return                       { background: a.lowBg,      color: a.lowColor      };
    }

    /* ── ES5-safe update helpers ─────────────────────────── */
    function updateIssue(issues, idx, field, val) {
        return issues.map(function (iss, i) {
            if (i !== idx) return iss;
            var u = {}; u[field] = val;
            return Object.assign({}, iss, u);
        });
    }

    function addIssue(issues) {
        return issues.concat([{
            problem: 'New Issue',
            cause: 'Root cause description',
            solution: 'Step-by-step solution to resolve this issue.',
            severity: 'medium'
        }]);
    }

    function removeIssue(issues, idx) {
        return issues.filter(function (_, i) { return i !== idx; });
    }

    registerBlockType('blockenberg/troubleshooting-guide', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = (function () {
                var s = {};
                Object.assign(s, window._bkbgTypoVarsCache(a.titleTypo, '--bktsg-tt-'), window._bkbgTypoVarsCache(a.problemTypo, '--bktsg-pt-'), window._bkbgTypoVarsCache(a.bodyTypo, '--bktsg-bt-'));
                return useBlockProps({ className: 'bkbg-tg-editor', style: Object.keys(s).length ? s : undefined });
            })();

            /* ── Preview rendering ───────────────────────── */
            function renderPreview() {
                return el('div', {
                    className: 'bkbg-tg-block',
                    style: {
                        background: a.bgColor || undefined,
                        boxSizing: 'border-box'
                    }
                },
                    /* Header */
                    (a.showTitle || a.showSubtitle) && el('div', {
                        className: 'bkbg-tg-header',
                        style: { marginBottom: '20px' }
                    },
                        a.showTitle && el('h3', {
                            className: 'bkbg-tg-title',
                            style: { color: a.titleColor, margin: '0 0 8px' }
                        }, a.blockTitle),
                        a.showSubtitle && a.blockSubtitle && el('p', {
                            className: 'bkbg-tg-subtitle',
                            style: { fontSize: '15px', color: a.subtitleColor, margin: 0 }
                        }, a.blockSubtitle)
                    ),
                    /* Search bar placeholder */
                    a.enableSearch && el('div', {
                        className: 'bkbg-tg-search-wrap',
                        style: { marginBottom: a.gap + 'px' }
                    },
                        el('input', {
                            type: 'text',
                            placeholder: a.searchPlaceholder,
                            className: 'bkbg-tg-search',
                            readOnly: true,
                            style: {
                                width: '100%', padding: '10px 14px 10px 38px',
                                border: '1px solid ' + a.borderColor,
                                borderRadius: a.borderRadius + 'px',
                                fontSize: '14px', boxSizing: 'border-box'
                            }
                        })
                    ),
                    /* Issues */
                    el('div', {
                        className: 'bkbg-tg-list',
                        style: {
                            display: 'flex', flexDirection: 'column', gap: a.gap + 'px'
                        }
                    },
                        a.issues.map(function (iss, idx) {
                            var sevStyle = getSevStyle(iss.severity, a);
                            var cardStyle = {
                                background: a.cardBg,
                                border: '1px solid ' + a.borderColor,
                                borderRadius: a.borderRadius + 'px',
                                overflow: 'hidden'
                            };
                            if (a.style === 'left-accent') {
                                cardStyle.borderLeft = '4px solid ' + sevStyle.color;
                            }
                            return el('div', { className: 'bkbg-tg-issue', key: idx, style: cardStyle },
                                /* Problem row */
                                el('div', {
                                    className: 'bkbg-tg-problem-row',
                                    style: {
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '14px 18px',
                                        borderBottom: (a.showCause || true) ? '1px solid ' + a.borderColor : 'none'
                                    }
                                },
                                    a.showNumbers && el('span', {
                                        style: {
                                            minWidth: '26px', height: '26px', borderRadius: '50%',
                                            background: a.borderColor, color: a.problemColor,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '12px', fontWeight: 700, flexShrink: 0
                                        }
                                    }, String(idx + 1)),
                                    el('span', {
                                        className: 'bkbg-tg-problem-text',
                                        style: {
                                            color: a.problemColor, flex: 1
                                        }
                                    }, iss.problem),
                                    a.showSeverity && el('span', {
                                        className: 'bkbg-tg-severity',
                                        style: Object.assign({ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }, sevStyle)
                                    }, severityLabel(iss.severity))
                                ),
                                /* Cause */
                                a.showCause && iss.cause && el('div', {
                                    style: { padding: '10px 18px', borderBottom: '1px solid ' + a.borderColor }
                                },
                                    el('span', { style: { fontSize: '11px', fontWeight: 700, color: a.labelColor, textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: '4px' } }, 'Cause'),
                                    el('span', { className: 'bkbg-tg-cause-text', style: { color: a.causeColor } }, iss.cause)
                                ),
                                /* Solution */
                                el('div', {
                                    style: {
                                        padding: '10px 18px',
                                        background: a.solutionBg,
                                        borderTop: '1px solid ' + a.solutionBorderColor
                                    }
                                },
                                    el('span', { style: { fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: '4px' } }, '✔ Solution'),
                                    el('span', { className: 'bkbg-tg-solution-text', style: { color: a.solutionColor } }, iss.solution)
                                )
                            );
                        })
                    )
                );
            }

            /* ── Inspector ───────────────────────────────── */
            var inspector = el(InspectorControls, {},
                /* Title & Subtitle */
                el(PanelBody, { title: 'Title & Subtitle', initialOpen: true },
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Title', checked: a.showTitle, onChange: function (v) { set({ showTitle: v }); } }),
                    a.showTitle && el(TextControl, { __nextHasNoMarginBottom: true, label: 'Title', value: a.blockTitle, onChange: function (v) { set({ blockTitle: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Subtitle', checked: a.showSubtitle, onChange: function (v) { set({ showSubtitle: v }); } }),
                    a.showSubtitle && el(TextControl, { __nextHasNoMarginBottom: true, label: 'Subtitle', value: a.blockSubtitle, onChange: function (v) { set({ blockSubtitle: v }); } })
                ),
                /* Issues Manager */
                el(PanelBody, { title: 'Issues (' + a.issues.length + ')', initialOpen: true },
                    a.issues.map(function (iss, idx) {
                        return el('div', {
                            key: idx,
                            style: { border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 10, background: '#f8fafc' }
                        },
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
                                el('strong', { style: { fontSize: 12 } }, '#' + (idx + 1) + ' ' + (iss.problem.slice(0, 30) || 'Issue')),
                                el(Button, {
                                    isSmall: true, isDestructive: true,
                                    onClick: function () { set({ issues: removeIssue(a.issues, idx) }); }
                                }, '✕')
                            ),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: 'Problem', value: iss.problem, onChange: function (v) { set({ issues: updateIssue(a.issues, idx, 'problem', v) }); } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: 'Cause', value: iss.cause, onChange: function (v) { set({ issues: updateIssue(a.issues, idx, 'cause', v) }); } }),
                            el('div', { style: { marginBottom: 8 } },
                                el('label', { style: { fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 } }, 'Solution'),
                                el('textarea', {
                                    value: iss.solution, rows: 3,
                                    style: { width: '100%', fontSize: 12, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' },
                                    onChange: function (e) { set({ issues: updateIssue(a.issues, idx, 'solution', e.target.value) }); }
                                })
                            ),
                            el(SelectControl, {
                                __nextHasNoMarginBottom: true, label: 'Severity',
                                value: iss.severity, options: SEVERITY_OPTIONS,
                                onChange: function (v) { set({ issues: updateIssue(a.issues, idx, 'severity', v) }); }
                            })
                        );
                    }),
                    el(Button, {
                        variant: 'secondary', style: { width: '100%', justifyContent: 'center', marginTop: 4 },
                        onClick: function () { set({ issues: addIssue(a.issues) }); }
                    }, '+ Add Issue')
                ),
                /* Display */
                el(PanelBody, { title: 'Display', initialOpen: false },
                    el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Layout', value: a.layout, options: [{ label: 'Cards', value: 'cards' }, { label: 'Compact List', value: 'compact' }], onChange: function (v) { set({ layout: v }); } }),
                    el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Style', value: a.style, options: [{ label: 'Bordered', value: 'bordered' }, { label: 'Left Accent', value: 'left-accent' }, { label: 'Flat', value: 'flat' }], onChange: function (v) { set({ style: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Cause Column', checked: a.showCause, onChange: function (v) { set({ showCause: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Severity Badges', checked: a.showSeverity, onChange: function (v) { set({ showSeverity: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Numbers', checked: a.showNumbers, onChange: function (v) { set({ showNumbers: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Search Bar', checked: a.enableSearch, onChange: function (v) { set({ enableSearch: v }); } }),
                    a.enableSearch && el(TextControl, { __nextHasNoMarginBottom: true, label: 'Search Placeholder', value: a.searchPlaceholder, onChange: function (v) { set({ searchPlaceholder: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Collapsible Issues', checked: a.collapsible, onChange: function (v) { set({ collapsible: v }); } })
                ),
                /* Typography */
                el(PanelBody, { title: 'Typography', initialOpen: false },
                    getTypoControl(props, 'titleTypo', __('Title', 'blockenberg')),
                    getTypoControl(props, 'problemTypo', __('Problem', 'blockenberg')),
                    getTypoControl(props, 'bodyTypo', __('Body', 'blockenberg'))
                ),
                /* Spacing */
                el(PanelBody, { title: 'Spacing', initialOpen: false },
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Gap Between Issues', value: a.gap, min: 4, max: 40, onChange: function (v) { set({ gap: v }); } }),
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Border Radius', value: a.borderRadius, min: 0, max: 24, onChange: function (v) { set({ borderRadius: v }); } })
                ),
                /* Colors */
                el(PanelColorSettings, {
                    title: 'Colors', initialOpen: false,
                    colorSettings: [
                        { label: 'Block Background', value: a.bgColor, onChange: function (v) { set({ bgColor: v || '' }); } },
                        { label: 'Card Background', value: a.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                        { label: 'Border Color', value: a.borderColor, onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); } },
                        { label: 'Title Color', value: a.titleColor, onChange: function (v) { set({ titleColor: v || '#0f172a' }); } },
                        { label: 'Problem Color', value: a.problemColor, onChange: function (v) { set({ problemColor: v || '#1e293b' }); } },
                        { label: 'Cause Color', value: a.causeColor, onChange: function (v) { set({ causeColor: v || '#475569' }); } },
                        { label: 'Solution Text Color', value: a.solutionColor, onChange: function (v) { set({ solutionColor: v || '#374151' }); } },
                        { label: 'Solution Background', value: a.solutionBg, onChange: function (v) { set({ solutionBg: v || '#f0fdf4' }); } }
                    ]
                }),
                el(PanelColorSettings, {
                    title: 'Severity Colors', initialOpen: false,
                    colorSettings: [
                        { label: 'Critical Background', value: a.criticalBg, onChange: function (v) { set({ criticalBg: v || '#fee2e2' }); } },
                        { label: 'Critical Text', value: a.criticalColor, onChange: function (v) { set({ criticalColor: v || '#991b1b' }); } },
                        { label: 'High Background', value: a.highBg, onChange: function (v) { set({ highBg: v || '#ffedd5' }); } },
                        { label: 'High Text', value: a.highColor, onChange: function (v) { set({ highColor: v || '#9a3412' }); } },
                        { label: 'Medium Background', value: a.mediumBg, onChange: function (v) { set({ mediumBg: v || '#fef9c3' }); } },
                        { label: 'Medium Text', value: a.mediumColor, onChange: function (v) { set({ mediumColor: v || '#854d0e' }); } },
                        { label: 'Low Background', value: a.lowBg, onChange: function (v) { set({ lowBg: v || '#f0fdf4' }); } },
                        { label: 'Low Text', value: a.lowColor, onChange: function (v) { set({ lowColor: v || '#166534' }); } }
                    ]
                })
            );

            return el(Fragment, {}, inspector, el('div', blockProps, renderPreview()));
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            var a = props.attributes;
            var bp = (function () {
                var tv = Object.assign({}, window._bkbgTypoVarsCache(a.titleTypo, '--bktsg-tt-'), window._bkbgTypoVarsCache(a.problemTypo, '--bktsg-pt-'), window._bkbgTypoVarsCache(a.bodyTypo, '--bktsg-bt-'));
                var parts = []; Object.keys(tv).forEach(function (k) { parts.push(k + ':' + tv[k]); });
                return useBlockProps.save(parts.length ? { style: parts.join(';') } : {});
            })();
            return el('div', bp,
                el('div', {
                    className: 'bkbg-troubleshooting-guide-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
