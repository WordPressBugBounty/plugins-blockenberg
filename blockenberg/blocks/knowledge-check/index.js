( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;
    var __ = wp.i18n.__;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── helpers ────────────────────────────────────────────────────────────────
    function updateOption(opts, idx, field, val) {
        return opts.map(function (o, i) {
            if (i !== idx) return o;
            var u = {}; u[field] = val;
            return Object.assign({}, o, u);
        });
    }

    // ── QuizPreview ─────────────────────────────────────────────────────────────
    function QuizPreview(props) {
        var a = props.attributes;
        var setAttributes = props.setAttributes;

        return el('div', {
            className: 'bkbg-kc-block bkbg-kc-style-' + a.style,
            style: { background: a.bgColor, borderColor: a.borderColor, borderRadius: a.borderRadius + 'px' }
        },
            // Header row
            el('div', { className: 'bkbg-kc-header' },
                a.showIcon && el('span', { className: 'bkbg-kc-icon' }, a.icon),
                el('div', { className: 'bkbg-kc-meta' },
                    a.topic && el('span', { className: 'bkbg-kc-topic', style: { color: a.accentColor, borderColor: a.accentColor } }, a.topic),
                    a.difficulty && el('span', { className: 'bkbg-kc-difficulty' }, a.difficulty)
                )
            ),
            // Question
            el('p', {
                className: 'bkbg-kc-question',
                style: { color: a.questionColor },
                contentEditable: true,
                suppressContentEditableWarning: true,
                onBlur: function (e) { setAttributes({ question: e.target.textContent }); }
            }, a.question),
            // Options
            el('div', { className: 'bkbg-kc-options' },
                a.options.map(function (opt, i) {
                    return el('label', {
                        key: i,
                        className: 'bkbg-kc-option' + (opt.correct ? ' is-correct-preview' : ''),
                        style: {
                            background: opt.correct ? a.correctBg : a.optionBg,
                            color: opt.correct ? a.correctColor : a.optionColor,
                            borderColor: opt.correct ? a.correctColor : a.optionBorderColor,
                            borderRadius: (a.borderRadius - 2) + 'px'
                        }
                    },
                        el('span', { className: 'bkbg-kc-opt-letter', style: { background: a.accentColor, color: '#fff' } },
                            String.fromCharCode(65 + i)
                        ),
                        el('span', { className: 'bkbg-kc-opt-text' }, opt.text),
                        opt.correct && el('span', { className: 'bkbg-kc-correct-badge' }, '✓')
                    );
                })
            ),
            // Explanation preview
            a.showExplanation && a.explanation && el('div', {
                className: 'bkbg-kc-explanation',
                style: { background: a.explanationBg, color: a.explanationColor, borderRadius: (a.borderRadius - 4) + 'px' }
            },
                el('strong', null, 'Explanation: '),
                a.explanation
            ),
            // Reveal button (static in editor)
            el('div', { className: 'bkbg-kc-actions' },
                el('div', {
                    className: 'bkbg-kc-reveal-btn',
                    style: { background: a.revealBg, color: a.revealColor, borderRadius: (a.borderRadius - 2) + 'px' }
                }, a.revealLabel)
            )
        );
    }

    // ── OptionEditor ────────────────────────────────────────────────────────────
    function OptionEditor(props) {
        var options = props.options;
        var setAttributes = props.setAttributes;
        var accentColor = props.accentColor;

        function addOption() {
            setAttributes({ options: options.concat([{ text: 'New option', correct: false }]) });
        }

        function remove(i) {
            setAttributes({ options: options.filter(function (_, j) { return j !== i; }) });
        }

        function setCorrect(i) {
            setAttributes({
                options: options.map(function (o, j) {
                    return Object.assign({}, o, { correct: j === i });
                })
            });
        }

        return el('div', null,
            options.map(function (opt, i) {
                return el('div', { key: i, className: 'bkbg-kc-opt-editor', style: { borderLeftColor: opt.correct ? '#15803d' : accentColor } },
                    el('div', { className: 'bkbg-kc-opt-editor-row' },
                        el('span', { className: 'bkbg-kc-opt-editor-letter' }, String.fromCharCode(65 + i)),
                        el(TextControl, {
                            value: opt.text,
                            placeholder: __('Option text…'),
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ options: updateOption(options, i, 'text', v) }); }
                        }),
                        el(Button, {
                            variant: opt.correct ? 'primary' : 'secondary',
                            isSmall: true,
                            onClick: function () { setCorrect(i); },
                            title: __('Mark as correct')
                        }, '✓'),
                        options.length > 2 && el(Button, {
                            variant: 'link',
                            isDestructive: true,
                            isSmall: true,
                            onClick: function () { remove(i); }
                        }, '✕')
                    )
                );
            }),
            options.length < 6 && el(Button, {
                variant: 'secondary',
                onClick: addOption,
                style: { marginTop: '6px' }
            }, __('+ Add Option'))
        );
    }

    // ── register ────────────────────────────────────────────────────────────────
    registerBlockType('blockenberg/knowledge-check', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Question'), initialOpen: true },
                        el(SelectControl, {
                            label: __('Question type'),
                            value: a.questionType,
                            __nextHasNoMarginBottom: true,
                            options: [
                                { value: 'multiple', label: 'Multiple choice' },
                                { value: 'truefalse', label: 'True / False' }
                            ],
                            onChange: function (v) {
                                if (v === 'truefalse') {
                                    setAttributes({
                                        questionType: v,
                                        options: [
                                            { text: 'True', correct: true },
                                            { text: 'False', correct: false }
                                        ]
                                    });
                                } else {
                                    setAttributes({ questionType: v });
                                }
                            }
                        }),
                        el(TextareaControl, {
                            label: __('Question'),
                            value: a.question,
                            rows: 3,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ question: v }); }
                        }),
                        el(TextControl, {
                            label: __('Topic tag (optional)'),
                            value: a.topic,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ topic: v }); }
                        }),
                        el(TextControl, {
                            label: __('Difficulty label (optional)'),
                            value: a.difficulty,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ difficulty: v }); }
                        }),
                        el(TextControl, {
                            label: __('Icon (emoji)'),
                            value: a.icon,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ icon: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show icon'),
                            checked: a.showIcon,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showIcon: v }); }
                        })
                    ),
                    el(PanelBody, { title: __('Answer Options'), initialOpen: true },
                        el(OptionEditor, {
                            options: a.options,
                            setAttributes: setAttributes,
                            accentColor: a.accentColor
                        })
                    ),
                    el(PanelBody, { title: __('Explanation'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show explanation after reveal'),
                            checked: a.showExplanation,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showExplanation: v }); }
                        }),
                        el(TextareaControl, {
                            label: __('Explanation text'),
                            value: a.explanation,
                            rows: 4,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ explanation: v }); }
                        })
                    ),
                    el(PanelBody, { title: __('Interaction'), initialOpen: false },
                        el(TextControl, {
                            label: __('Reveal button label'),
                            value: a.revealLabel,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ revealLabel: v }); }
                        }),
                        el(TextControl, {
                            label: __('Correct label'),
                            value: a.correctLabel,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ correctLabel: v }); }
                        }),
                        el(TextControl, {
                            label: __('Incorrect label'),
                            value: a.incorrectLabel,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ incorrectLabel: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Allow retry'),
                            checked: a.allowRetry,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ allowRetry: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Shuffle options on load'),
                            checked: a.shuffleOptions,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ shuffleOptions: v }); }
                        })
                    ),
                    el(PanelBody, { title: __('Style'), initialOpen: false },
                        el(SelectControl, {
                            label: __('Block style'),
                            value: a.style,
                            __nextHasNoMarginBottom: true,
                            options: [
                                { value: 'card', label: 'Card (bordered)' },
                                { value: 'flat', label: 'Flat' },
                                { value: 'minimal', label: 'Minimal' }
                            ],
                            onChange: function (v) { setAttributes({ style: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Border radius (px)'),
                            value: a.borderRadius,
                            min: 0, max: 24,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ borderRadius: v }); }
                        })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background'), value: a.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '#f8fafc' }); } },
                            { label: __('Border'), value: a.borderColor, onChange: function (v) { setAttributes({ borderColor: v || '#e2e8f0' }); } },
                            { label: __('Question text'), value: a.questionColor, onChange: function (v) { setAttributes({ questionColor: v || '#0f172a' }); } },
                            { label: __('Accent'), value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#6366f1' }); } },
                            { label: __('Option background'), value: a.optionBg, onChange: function (v) { setAttributes({ optionBg: v || '#ffffff' }); } },
                            { label: __('Option text'), value: a.optionColor, onChange: function (v) { setAttributes({ optionColor: v || '#334155' }); } },
                            { label: __('Correct highlight bg'), value: a.correctBg, onChange: function (v) { setAttributes({ correctBg: v || '#dcfce7' }); } },
                            { label: __('Correct text'), value: a.correctColor, onChange: function (v) { setAttributes({ correctColor: v || '#15803d' }); } },
                            { label: __('Incorrect highlight bg'), value: a.incorrectBg, onChange: function (v) { setAttributes({ incorrectBg: v || '#fee2e2' }); } },
                            { label: __('Incorrect text'), value: a.incorrectColor, onChange: function (v) { setAttributes({ incorrectColor: v || '#b91c1c' }); } },
                            { label: __('Explanation bg'), value: a.explanationBg, onChange: function (v) { setAttributes({ explanationBg: v || '#eff6ff' }); } },
                            { label: __('Explanation text'), value: a.explanationColor, onChange: function (v) { setAttributes({ explanationColor: v || '#1e40af' }); } },
                            { label: __('Reveal button bg'), value: a.revealBg, onChange: function (v) { setAttributes({ revealBg: v || '#6366f1' }); } },
                            { label: __('Reveal button text'), value: a.revealColor, onChange: function (v) { setAttributes({ revealColor: v || '#ffffff' }); } }
                        ]
                    }),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Question'), value: a.questionTypo || {}, onChange: function (v) { setAttributes({ questionTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Option'), value: a.optionTypo || {}, onChange: function (v) { setAttributes({ optionTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Result'), value: a.resultTypo || {}, onChange: function (v) { setAttributes({ resultTypo: v }); } })
                    ),

                ),
                el('div', useBlockProps((function () {
                    var _tvFn = getTypoCssVars();
                    var s = {};
                    if (_tvFn) {
                        Object.assign(s, _tvFn(a.questionTypo, '--bkbg-kc-q-'));
                        Object.assign(s, _tvFn(a.optionTypo, '--bkbg-kc-o-'));
                        Object.assign(s, _tvFn(a.resultTypo, '--bkbg-kc-r-'));
                    }
                    return { style: s };
                })()),
                    el(QuizPreview, { attributes: a, setAttributes: setAttributes })
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-kc-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
