( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var __                 = wp.i18n.__;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;
    var SelectControl      = wp.components.SelectControl;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'titleTypo', attrs, '--bktst-tt-');
        _tvf(v, 'subtitleTypo', attrs, '--bktst-st-');
        return v;
    }

    var SAMPLE_TEXT = 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.';

    registerBlockType('blockenberg/typing-speed-test', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var blockProps = useBlockProps((function () { var _tv = getTypoCssVars(a); var s = {}; Object.assign(s, _tv); return { className: 'bkbg-tst-editor-wrap', style: s }; })());

            var containerStyle = {
                background: a.sectionBg,
                borderRadius: '12px',
                padding: '28px',
                maxWidth: a.contentMaxWidth + 'px',
                margin: '0 auto',
                fontFamily: 'system-ui, sans-serif'
            };

            var cardStyle = {
                background: a.cardBg,
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            };

            var btnStyle = {
                background: a.accentColor,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
            };

            var statBoxStyle = {
                textAlign: 'center',
                flex: '1',
                minWidth: '80px'
            };

            return el(
                Fragment,
                null,
                el(
                    InspectorControls,
                    null,
                    el(
                        PanelBody,
                        { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(TextControl, {
                            label: __('Title', 'blockenberg'),
                            value: a.title,
                            onChange: function (v) { setAttributes({ title: v }); }
                        }),
                        el(TextControl, {
                            label: __('Subtitle', 'blockenberg'),
                            value: a.subtitle,
                            onChange: function (v) { setAttributes({ subtitle: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show Title', 'blockenberg'),
                            checked: a.showTitle,
                            onChange: function (v) { setAttributes({ showTitle: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show Subtitle', 'blockenberg'),
                            checked: a.showSubtitle,
                            onChange: function (v) { setAttributes({ showSubtitle: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el(
                        PanelBody,
                        { title: __('Test Settings', 'blockenberg'), initialOpen: false },
                        el(SelectControl, {
                            label: __('Test Duration', 'blockenberg'),
                            value: String(a.duration),
                            options: [
                                { value: '30',  label: '30 seconds' },
                                { value: '60',  label: '60 seconds' },
                                { value: '120', label: '2 minutes' },
                                { value: '180', label: '3 minutes' }
                            ],
                            onChange: function (v) { setAttributes({ duration: parseInt(v) }); }
                        }),
                        el(SelectControl, {
                            label: __('Default Difficulty', 'blockenberg'),
                            value: a.defaultDifficulty,
                            options: [
                                { value: 'easy',   label: __('Easy', 'blockenberg') },
                                { value: 'medium', label: __('Medium', 'blockenberg') },
                                { value: 'hard',   label: __('Hard', 'blockenberg') }
                            ],
                            onChange: function (v) { setAttributes({ defaultDifficulty: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show Difficulty Buttons', 'blockenberg'),
                            checked: a.showDifficultyBtn,
                            onChange: function (v) { setAttributes({ showDifficultyBtn: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show Live WPM', 'blockenberg'),
                            checked: a.showLiveWpm,
                            onChange: function (v) { setAttributes({ showLiveWpm: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show Accuracy', 'blockenberg'),
                            checked: a.showAccuracy,
                            onChange: function (v) { setAttributes({ showAccuracy: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show Error Count', 'blockenberg'),
                            checked: a.showErrors,
                            onChange: function (v) { setAttributes({ showErrors: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el(
                        PanelBody,
                        { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl(__('Title', 'blockenberg'), 'titleTypo', a, setAttributes),
                        getTypoControl(__('Subtitle', 'blockenberg'), 'subtitleTypo', a, setAttributes)
                    ),
                    el(
                        PanelBody,
                        { title: __('Appearance', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Max Width (px)', 'blockenberg'),
                            value: a.contentMaxWidth,
                            min: 320, max: 1200,
                            onChange: function (v) { setAttributes({ contentMaxWidth: v }); }
                        })
                    ),
                    el(
                        PanelColorSettings,
                        {
                            title: __('Colors', 'blockenberg'),
                            initialOpen: false,
                            colorSettings: [
                                { value: a.accentColor,    onChange: function (v) { setAttributes({ accentColor: v || '#8b5cf6' }); },    label: __('Accent Color', 'blockenberg') },
                                { value: a.correctColor,   onChange: function (v) { setAttributes({ correctColor: v || '#22c55e' }); },   label: __('Correct Letter Color', 'blockenberg') },
                                { value: a.errorColor,     onChange: function (v) { setAttributes({ errorColor: v || '#ef4444' }); },     label: __('Error Color', 'blockenberg') },
                                { value: a.sectionBg,      onChange: function (v) { setAttributes({ sectionBg: v || '#f5f3ff' }); },      label: __('Section Background', 'blockenberg') },
                                { value: a.cardBg,         onChange: function (v) { setAttributes({ cardBg: v || '#ffffff' }); },         label: __('Card Background', 'blockenberg') },
                                { value: a.textAreaBg,     onChange: function (v) { setAttributes({ textAreaBg: v || '#1e1b4b' }); },     label: __('Text Area Background', 'blockenberg') },
                                { value: a.textAreaColor,  onChange: function (v) { setAttributes({ textAreaColor: v || '#c4b5fd' }); },  label: __('Text Area Text', 'blockenberg') },
                                { value: a.titleColor,     onChange: function (v) { setAttributes({ titleColor: v || '#4c1d95' }); },     label: __('Title Color', 'blockenberg') },
                                { value: a.subtitleColor,  onChange: function (v) { setAttributes({ subtitleColor: v || '#6b7280' }); },  label: __('Subtitle Color', 'blockenberg') },
                                { value: a.labelColor,     onChange: function (v) { setAttributes({ labelColor: v || '#374151' }); },     label: __('Label Color', 'blockenberg') }
                            ]
                        }
                    )
                ),
                el(
                    'div',
                    blockProps,
                    el(
                        'div',
                        { style: containerStyle },
                        a.showTitle && el('div', { className: 'bkbg-tst-title', style: { color: a.titleColor } }, a.title),
                        a.showSubtitle && el('div', { className: 'bkbg-tst-subtitle', style: { color: a.subtitleColor } }, a.subtitle),

                        // Stats bar
                        el('div', { style: Object.assign({}, cardStyle, { display: 'flex', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap' }) },
                            [
                                { label: 'Time', value: a.duration + 's' },
                                a.showLiveWpm  && { label: 'WPM', value: '–' },
                                a.showAccuracy && { label: 'Accuracy', value: '–' },
                                a.showErrors   && { label: 'Errors', value: '–' }
                            ].filter(Boolean).map(function (s, i) {
                                return el('div', { key: i, style: statBoxStyle },
                                    el('div', { style: { fontSize: '28px', fontWeight: '700', color: a.accentColor } }, s.value),
                                    el('div', { style: { fontSize: '12px', color: a.subtitleColor, marginTop: '2px' } }, s.label)
                                );
                            })
                        ),

                        // Difficulty buttons
                        a.showDifficultyBtn && el('div', { style: { display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' } },
                            ['easy', 'medium', 'hard'].map(function (d) {
                                var active = d === a.defaultDifficulty;
                                return el('button', {
                                    key: d,
                                    style: {
                                        background: active ? a.accentColor : '#e5e7eb',
                                        color: active ? '#fff' : '#374151',
                                        border: 'none', borderRadius: '6px', padding: '6px 16px',
                                        cursor: 'pointer', fontSize: '13px', fontWeight: '600', textTransform: 'capitalize'
                                    }
                                }, d.charAt(0).toUpperCase() + d.slice(1));
                            })
                        ),

                        // Text display area
                        el('div', { style: Object.assign({}, cardStyle, { background: a.textAreaBg, fontFamily: 'monospace', fontSize: '17px', lineHeight: '1.9', color: a.textAreaColor, letterSpacing: '0.02em', minHeight: '100px', padding: '20px' }) },
                            SAMPLE_TEXT
                        ),

                        // Input area
                        el('textarea', {
                            placeholder: 'Click here and start typing...',
                            disabled: true,
                            style: {
                                width: '100%', borderRadius: '8px', padding: '14px',
                                fontSize: '15px', border: '2px solid ' + a.accentColor,
                                background: a.cardBg, color: a.labelColor,
                                resize: 'none', height: '80px', fontFamily: 'monospace',
                                boxSizing: 'border-box', marginTop: '4px'
                            }
                        }),

                        el('div', { style: { display: 'flex', justifyContent: 'center', marginTop: '14px' } },
                            el('button', { style: btnStyle }, '▶ Start Test')
                        )
                    )
                )
            );
        },
        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save((function () { var _tv = getTypoCssVars(a); var s = {}; Object.assign(s, _tv); return { style: s }; })());
            return el('div', blockProps,
                el('div', { className: 'bkbg-tst-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
