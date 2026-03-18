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

    var _cbTC, _cbTV;
    function _tc() { return _cbTC || (_cbTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _cbTV || (_cbTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    var PRESETS = [
        { label: 'Every minute',   expr: '* * * * *'   },
        { label: 'Every hour',     expr: '0 * * * *'   },
        { label: 'Daily 9 AM',     expr: '0 9 * * *'   },
        { label: 'Weekdays 9 AM',  expr: '0 9 * * 1-5' },
        { label: 'Weekly Monday',  expr: '0 9 * * 1'   },
        { label: 'Monthly 1st',    expr: '0 9 1 * *'   },
        { label: 'Yearly Jan 1st', expr: '0 0 1 1 *'   }
    ];

    var FIELDS = ['Minute', 'Hour', 'Day', 'Month', 'Weekday'];

    registerBlockType('blockenberg/cron-builder', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-cb-editor-wrap', style: Object.assign({}, _tv(a.typoTitle, '--bkbg-cb-ttl-'), _tv(a.typoSubtitle, '--bkbg-cb-sub-')) });

            var parts = (a.defaultExpression || '0 9 * * *').split(' ');
            while (parts.length < 5) parts.push('*');

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
                padding: '10px 20px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
            };

            var fieldStyle = {
                background: a.fieldBg,
                border: '2px solid transparent',
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'center',
                fontSize: '20px',
                fontFamily: 'monospace',
                fontWeight: '700',
                width: '70px',
                color: a.labelColor,
                outline: 'none'
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
                        { title: __('Cron Settings', 'blockenberg'), initialOpen: false },
                        el(TextControl, {
                            label: __('Default Expression', 'blockenberg'),
                            value: a.defaultExpression,
                            onChange: function (v) { setAttributes({ defaultExpression: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show Presets', 'blockenberg'),
                            checked: a.showPresets,
                            onChange: function (v) { setAttributes({ showPresets: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show Human Description', 'blockenberg'),
                            checked: a.showDescription,
                            onChange: function (v) { setAttributes({ showDescription: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show Next Run Times', 'blockenberg'),
                            checked: a.showNextRuns,
                            onChange: function (v) { setAttributes({ showNextRuns: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(RangeControl, {
                            label: __('Next Runs Count', 'blockenberg'),
                            value: a.nextRunsCount,
                            min: 1,
                            max: 10,
                            onChange: function (v) { setAttributes({ nextRunsCount: v }); }
                        })
                    ),
                    el(
                        PanelBody,
                        { title: __('Typography', 'blockenberg'), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                        _tc() && el(_tc(), { label: __('Subtitle', 'blockenberg'), value: a.typoSubtitle, onChange: function (v) { setAttributes({ typoSubtitle: v }); } }),
                        el(RangeControl, {
                            label: __('Cron expression font size (px)', 'blockenberg'),
                            value: a.expressionFontSize,
                            min: 14,
                            max: 36,
                            onChange: function (v) { setAttributes({ expressionFontSize: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el(
                        PanelBody,
                        { title: __('Appearance', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Max Width (px)', 'blockenberg'),
                            value: a.contentMaxWidth,
                            min: 320,
                            max: 1200,
                            onChange: function (v) { setAttributes({ contentMaxWidth: v }); }
                        })
                    ),
                    el(
                        PanelColorSettings,
                        {
                            title: __('Colors', 'blockenberg'),
                            initialOpen: false,
                            colorSettings: [
                                { value: a.accentColor,   onChange: function (v) { setAttributes({ accentColor: v || '#0ea5e9' }); },   label: __('Accent / Button', 'blockenberg') },
                                { value: a.sectionBg,     onChange: function (v) { setAttributes({ sectionBg: v || '#f0f9ff' }); },     label: __('Section Background', 'blockenberg') },
                                { value: a.cardBg,        onChange: function (v) { setAttributes({ cardBg: v || '#ffffff' }); },        label: __('Card Background', 'blockenberg') },
                                { value: a.fieldBg,       onChange: function (v) { setAttributes({ fieldBg: v || '#e0f2fe' }); },       label: __('Field Background', 'blockenberg') },
                                { value: a.titleColor,    onChange: function (v) { setAttributes({ titleColor: v || '#0c4a6e' }); },    label: __('Title Color', 'blockenberg') },
                                { value: a.subtitleColor, onChange: function (v) { setAttributes({ subtitleColor: v || '#6b7280' }); }, label: __('Subtitle Color', 'blockenberg') },
                                { value: a.labelColor,    onChange: function (v) { setAttributes({ labelColor: v || '#374151' }); },    label: __('Label Color', 'blockenberg') }
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
                        a.showTitle && el('div', { className: 'bkbg-cb-title', style: { color: a.titleColor, marginBottom: '6px' } }, a.title),
                        a.showSubtitle && el('div', { className: 'bkbg-cb-subtitle', style: { color: a.subtitleColor, marginBottom: '20px' } }, a.subtitle),
                        // Presets
                        a.showPresets && el('div', { style: Object.assign({}, cardStyle, { display: 'flex', gap: '8px', flexWrap: 'wrap' }) },
                            PRESETS.map(function (p) {
                                return el('button', {
                                    key: p.expr,
                                    style: {
                                        background: p.expr === a.defaultExpression ? a.accentColor : '#e5e7eb',
                                        color: p.expr === a.defaultExpression ? '#fff' : '#374151',
                                        border: 'none', borderRadius: '6px', padding: '6px 12px',
                                        cursor: 'pointer', fontSize: '12px', fontWeight: '500'
                                    }
                                }, p.label);
                            })
                        ),
                        // Fields
                        el('div', { style: cardStyle },
                            el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '14px' } },
                                FIELDS.map(function (f, i) {
                                    return el('div', { key: f, style: { textAlign: 'center' } },
                                        el('input', { style: fieldStyle, type: 'text', value: parts[i], readOnly: true }),
                                        el('div', { style: { fontSize: '11px', color: a.subtitleColor, marginTop: '4px' } }, f)
                                    );
                                })
                            ),
                            // Expression display
                            el('div', { style: { background: a.fieldBg, borderRadius: '8px', padding: '14px', textAlign: 'center', fontFamily: 'monospace', fontSize: (a.expressionFontSize || 22) + 'px', fontWeight: '700', color: a.accentColor, letterSpacing: '0.1em', marginBottom: '12px' } },
                                parts.join(' ')
                            ),
                            // Copy
                            el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center' } },
                                el('button', { style: btnStyle }, 'Copy Expression')
                            )
                        ),
                        // Description
                        a.showDescription && el('div', { style: Object.assign({}, cardStyle, { borderLeft: '4px solid ' + a.accentColor }) },
                            el('div', { style: { fontSize: '12px', fontWeight: '600', color: a.subtitleColor, marginBottom: '4px' } }, 'DESCRIPTION'),
                            el('div', { style: { fontSize: '16px', color: a.labelColor } }, 'At 09:00 AM, every day')
                        ),
                        // Next runs
                        a.showNextRuns && el('div', { style: cardStyle },
                            el('div', { style: { fontSize: '14px', fontWeight: '700', color: a.labelColor, marginBottom: '10px' } }, 'Next ' + a.nextRunsCount + ' Run Times'),
                            [0,1,2,3,4].slice(0, a.nextRunsCount).map(function (i) {
                                var d = new Date(Date.now() + i * 86400000);
                                d.setHours(9, 0, 0, 0);
                                return el('div', { key: i, style: { padding: '8px 0', borderBottom: i < a.nextRunsCount - 1 ? '1px solid #f3f4f6' : 'none', fontSize: '14px', color: a.labelColor, display: 'flex', alignItems: 'center', gap: '8px' } },
                                    el('span', { style: { color: a.accentColor, fontWeight: '600' } }, '→'),
                                    el('span', null, d.toLocaleString())
                                );
                            })
                        )
                    )
                )
            );
        },
        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ style: Object.assign({}, _tv(a.typoTitle, '--bkbg-cb-ttl-'), _tv(a.typoSubtitle, '--bkbg-cb-sub-')) });
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-cb-app',
                    'data-opts': JSON.stringify(a)
                })
            );
        }
    });
}() );
