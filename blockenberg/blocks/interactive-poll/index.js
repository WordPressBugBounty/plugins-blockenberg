( function () {
    var el               = wp.element.createElement;
    var useState         = wp.element.useState;
    var Fragment         = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __               = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps    = wp.blockEditor.useBlockProps;
    var PanelBody        = wp.components.PanelBody;
    var TextControl      = wp.components.TextControl;
    var TextareaControl  = wp.components.TextareaControl;
    var ToggleControl    = wp.components.ToggleControl;
    var RangeControl     = wp.components.RangeControl;
    var Button           = wp.components.Button;
    var Notice           = wp.components.Notice;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    // ── Preview of a single option as a vote button ──────────────────────────
    function OptionButton(props) {
        var text = props.text;
        var bg   = props.buttonBg;
        var color = props.buttonColor;
        var radius = props.borderRadius;
        return el('button', {
            className: 'bkip-option-btn',
            style: {
                background: bg,
                color: color,
                borderRadius: radius + 'px',
                border: 'none',
                padding: '10px 20px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '15px',
                width: '100%',
                marginBottom: '8px',
                textAlign: 'left',
            }
        }, text || __('Option', 'blockenberg'));
    }

    // ── Preview of results bar ────────────────────────────────────────────────
    function ResultBar(props) {
        var text   = props.text;
        var pct    = props.pct;
        var barColor = props.barColor;
        var barBg  = props.barBg;
        var radius = props.borderRadius;
        var textColor = props.resultTextColor;
        return el('div', { className: 'bkip-result', style: { marginBottom: '14px' } },
            el('div', {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: textColor || undefined,
                }
            },
                el('span', null, text),
                el('span', null, pct + '%')
            ),
            el('div', {
                className: 'bkip-bar',
                style: {
                    background: barBg,
                    borderRadius: radius + 'px',
                    overflow: 'hidden',
                    height: '10px',
                }
            },
                el('div', {
                    className: 'bkip-bar-fill',
                    style: {
                        width: pct + '%',
                        background: barColor,
                        height: '100%',
                        borderRadius: radius + 'px',
                        transition: 'width 0.6s ease',
                    }
                })
            )
        );
    }

    // ── Editor preview ────────────────────────────────────────────────────────
    function PollPreview(props) {
        var attrs = props.attributes;
        var options = attrs.options || [];
        var previewMode = useState('vote');
        var mode = previewMode[0];
        var setMode = previewMode[1];

        var totalSample = options.reduce(function (sum, o) { return sum + (o.votes || 0); }, 0);

        return el('div', {
            className: 'bkip-wrap',
            style: {
                background: attrs.wrapBg || undefined,
                border: attrs.wrapBorder ? '1px solid ' + attrs.wrapBorder : undefined,
                borderRadius: attrs.borderRadius + 'px',
                padding: attrs.wrapPadding + 'px',
                maxWidth: attrs.maxWidth + 'px',
            }
        },
            /* Editor toggle */
            el('div', { style: { display: 'flex', gap: '8px', marginBottom: '16px' } },
                el(Button, {
                    variant: mode === 'vote' ? 'primary' : 'secondary',
                    size: 'small',
                    onClick: function () { setMode('vote'); }
                }, __('Vote view', 'blockenberg')),
                el(Button, {
                    variant: mode === 'results' ? 'primary' : 'secondary',
                    size: 'small',
                    onClick: function () { setMode('results'); }
                }, __('Results view', 'blockenberg'))
            ),
            /* Question */
            el('p', {
                className: 'bkip-question',
                style: {
                    marginBottom: '20px',
                    color: attrs.questionColor || undefined,
                }
            }, attrs.question || __('Your question here…', 'blockenberg')),
            /* Vote mode */
            mode === 'vote' && el(Fragment, null,
                options.map(function (opt, i) {
                    return el(OptionButton, {
                        key: i,
                        text: opt.text,
                        buttonBg: attrs.buttonBg,
                        buttonColor: attrs.buttonColor,
                        borderRadius: attrs.borderRadius,
                    });
                }),
                options.length === 0 && el(Notice, { status: 'warning', isDismissible: false },
                    __('Add options in the sidebar.', 'blockenberg')
                )
            ),
            /* Results mode */
            mode === 'results' && el(Fragment, null,
                options.map(function (opt, i) {
                    var pct = totalSample > 0 ? Math.round((opt.votes / totalSample) * 100) : 0;
                    return el(ResultBar, {
                        key: i,
                        text: opt.text,
                        pct: pct,
                        barColor: attrs.barColor,
                        barBg: attrs.barBg,
                        borderRadius: attrs.borderRadius,
                        resultTextColor: attrs.resultTextColor,
                    });
                }),
                attrs.totalVotesLabel && el('p', {
                    style: { fontSize: '13px', color: '#888', marginTop: '8px' }
                }, totalSample + ' ' + __('votes', 'blockenberg'))
            )
        );
    }

    // ── Main block ────────────────────────────────────────────────────────────
    registerBlockType('blockenberg/interactive-poll', {
        title: __('Interactive Poll', 'blockenberg'),
        description: __('Clickable voting poll with animated results.', 'blockenberg'),
        category: 'bkbg-interactive',
        icon: 'chart-bar',

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var options = attributes.options || [];

            // Generate instance id once
            if (!attributes.instanceId) {
                setAttributes({ instanceId: 'bkip-' + Math.random().toString(36).slice(2, 8) });
            }

            function setOption(index, key, value) {
                var updated = options.map(function (o, i) {
                    if (i === index) {
                        var copy = Object.assign({}, o);
                        copy[key] = value;
                        return copy;
                    }
                    return o;
                });
                setAttributes({ options: updated });
            }

            function addOption() {
                setAttributes({ options: options.concat([{ text: 'New option', votes: 0 }]) });
            }

            function removeOption(index) {
                setAttributes({ options: options.filter(function (_, i) { return i !== index; }) });
            }

            var blockProps = useBlockProps((function () {
                var s = {};
                var _tv = getTypoCssVars();
                Object.assign(s, _tv(attributes.questionTypo, '--bkip-q-'));
                return { className: 'bkip-editor-wrap', style: s };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,
                    /* ── Question ─────────────────────────────────────────── */
                    el(PanelBody, { title: __('Question', 'blockenberg'), initialOpen: true },
                        el(TextareaControl, {
                            label: __('Question text', 'blockenberg'),
                            value: attributes.question,
                            onChange: function (v) { setAttributes({ question: v }); },
                            rows: 3,
                        }),
                        el(ToggleControl, {
                            label: __('Show total votes', 'blockenberg'),
                            checked: attributes.totalVotesLabel,
                            onChange: function (v) { setAttributes({ totalVotesLabel: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),
                    /* ── Options ──────────────────────────────────────────── */
                    el(PanelBody, { title: __('Poll Options', 'blockenberg'), initialOpen: true },
                        options.map(function (opt, i) {
                            return el(PanelBody, {
                                key: i,
                                title: (i + 1) + '. ' + (opt.text || __('Option', 'blockenberg')),
                                initialOpen: false,
                            },
                                el(TextControl, {
                                    label: __('Option text', 'blockenberg'),
                                    value: opt.text,
                                    onChange: function (v) { setOption(i, 'text', v); },
                                }),
                                el(RangeControl, {
                                    label: __('Initial votes (for preview)', 'blockenberg'),
                                    value: opt.votes || 0,
                                    min: 0, max: 999,
                                    onChange: function (v) { setOption(i, 'votes', v); },
                                }),
                                options.length > 2 && el(Button, {
                                    variant: 'link',
                                    isDestructive: true,
                                    onClick: function () { removeOption(i); }
                                }, __('Remove option', 'blockenberg'))
                            );
                        }),
                        options.length < 8 && el(Button, {
                            variant: 'secondary',
                            onClick: addOption,
                            style: { marginTop: '8px', width: '100%' },
                        }, __('+ Add option', 'blockenberg'))
                    ),
                    /* ── Behaviour ────────────────────────────────────────── */
                    el(PanelBody, { title: __('Behaviour', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Allow revoting', 'blockenberg'),
                            checked: attributes.allowRevote,
                            onChange: function (v) { setAttributes({ allowRevote: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el(ToggleControl, {
                            label: __('Show results before voting', 'blockenberg'),
                            checked: attributes.showResultsBefore,
                            onChange: function (v) { setAttributes({ showResultsBefore: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el(ToggleControl, {
                            label: __('Animate result bars', 'blockenberg'),
                            checked: attributes.animateBars,
                            onChange: function (v) { setAttributes({ animateBars: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),
                    /* ── Layout ───────────────────────────────────────────── */
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Max width (px)', 'blockenberg'),
                            value: attributes.maxWidth,
                            min: 240, max: 900,
                            onChange: function (v) { setAttributes({ maxWidth: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Padding (px)', 'blockenberg'),
                            value: attributes.wrapPadding,
                            min: 0, max: 80,
                            onChange: function (v) { setAttributes({ wrapPadding: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Border radius (px)', 'blockenberg'),
                            value: attributes.borderRadius,
                            min: 0, max: 40,
                            onChange: function (v) { setAttributes({ borderRadius: v }); },
                        })
                    ),
                    /* ── Colors ───────────────────────────────────────────── */
                    
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypographyControl() && el(getTypographyControl(), { label: __('Question'), value: attributes.questionTypo, onChange: function (v) { setAttributes({ questionTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            {
                                value: attributes.barColor,
                                onChange: function (v) { setAttributes({ barColor: v || '#6c3fb5' }); },
                                label: __('Bar fill color', 'blockenberg'),
                            },
                            {
                                value: attributes.barBg,
                                onChange: function (v) { setAttributes({ barBg: v || '#ede9fe' }); },
                                label: __('Bar track color', 'blockenberg'),
                            },
                            {
                                value: attributes.buttonBg,
                                onChange: function (v) { setAttributes({ buttonBg: v || '#6c3fb5' }); },
                                label: __('Button background', 'blockenberg'),
                            },
                            {
                                value: attributes.buttonColor,
                                onChange: function (v) { setAttributes({ buttonColor: v || '#ffffff' }); },
                                label: __('Button text color', 'blockenberg'),
                            },
                            {
                                value: attributes.questionColor,
                                onChange: function (v) { setAttributes({ questionColor: v || '' }); },
                                label: __('Question color', 'blockenberg'),
                            },
                            {
                                value: attributes.resultTextColor,
                                onChange: function (v) { setAttributes({ resultTextColor: v || '' }); },
                                label: __('Result text color', 'blockenberg'),
                            },
                            {
                                value: attributes.wrapBg,
                                onChange: function (v) { setAttributes({ wrapBg: v || '' }); },
                                label: __('Card background', 'blockenberg'),
                            },
                            {
                                value: attributes.wrapBorder,
                                onChange: function (v) { setAttributes({ wrapBorder: v || '' }); },
                                label: __('Card border color', 'blockenberg'),
                            },
                        ],
                    })
                ),
                el('div', blockProps,
                    el(PollPreview, { attributes: attributes })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var options = a.options || [];
            var optionsJson = JSON.stringify(options);
            var _tv = getTypoCssVars();

            var wrapStyle = Object.assign({
                    '--bkip-bar':        a.barColor,
                    '--bkip-bar-bg':     a.barBg,
                    '--bkip-btn-bg':     a.buttonBg,
                    '--bkip-btn-color':  a.buttonColor,
                    '--bkip-radius':     a.borderRadius + 'px',
                    '--bkip-q-size':     a.questionSize + 'px',
                    background:          a.wrapBg  || undefined,
                    border:              a.wrapBorder ? '1px solid ' + a.wrapBorder : undefined,
                    borderRadius:        a.borderRadius + 'px',
                    padding:             a.wrapPadding + 'px',
                    maxWidth:            a.maxWidth + 'px',
                    color:               a.questionColor || undefined,
                }, _tv(a.questionTypo, '--bkip-q-'));

            return el('div', {
                className: 'bkip-wrap',
                'data-instance': a.instanceId,
                'data-allow-revote': a.allowRevote ? 'true' : 'false',
                'data-show-before': a.showResultsBefore ? 'true' : 'false',
                'data-animate': a.animateBars ? 'true' : 'false',
                style: wrapStyle,
            },
                el('p', { className: 'bkip-question' }, a.question),
                el('div', { className: 'bkip-body' },
                    /* Vote area (visible before vote) */
                    el('div', { className: 'bkip-votes', 'aria-hidden': a.showResultsBefore ? 'false' : 'false' },
                        options.map(function (opt, i) {
                            return el('button', {
                                key: i,
                                className: 'bkip-option-btn',
                                'data-index': i,
                                type: 'button',
                            }, opt.text);
                        })
                    ),
                    /* Results area (hidden until vote) */
                    el('div', { className: 'bkip-results', 'aria-hidden': 'true' },
                        options.map(function (opt, i) {
                            return el('div', { key: i, className: 'bkip-result' },
                                el('div', { className: 'bkip-result-label' },
                                    el('span', { className: 'bkip-result-text' }, opt.text),
                                    el('span', { className: 'bkip-result-pct' }, '0%')
                                ),
                                el('div', { className: 'bkip-bar' },
                                    el('div', { className: 'bkip-bar-fill', 'data-index': i })
                                )
                            );
                        }),
                        a.totalVotesLabel && el('p', { className: 'bkip-total' },
                            el('span', { className: 'bkip-total-num' }, '0'),
                            ' votes'
                        ),
                        a.allowRevote && el('button', { className: 'bkip-revote', type: 'button' },
                            'Change vote'
                        )
                    ),
                    /* JSON data for frontend */
                    el('script', {
                        type: 'application/json',
                        className: 'bkip-data',
                        dangerouslySetInnerHTML: { __html: optionsJson }
                    })
                )
            );
        },
    });
}() );
