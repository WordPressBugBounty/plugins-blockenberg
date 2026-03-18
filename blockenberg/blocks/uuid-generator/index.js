( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var __                 = wp.i18n.__;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var RichText           = wp.blockEditor.RichText;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;
    var SelectControl      = wp.components.SelectControl;
    var Button             = wp.components.Button;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'titleTypo', attrs, '--bkuuid-tt-');
        _tvf(v, 'subtitleTypo', attrs, '--bkuuid-st-');
        return v;
    }

    function uuidV4Preview() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    var SAMPLE_UUIDS = [
        uuidV4Preview(),
        uuidV4Preview(),
        uuidV4Preview(),
        uuidV4Preview(),
        uuidV4Preview()
    ];

    registerBlockType('blockenberg/uuid-generator', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var blockProps = useBlockProps((function () { var _tv = getTypoCssVars(a); return { style: _tv, className: 'bkbg-uuid-editor-wrap' }; })());

            var containerStyle = {
                background: a.sectionBg,
                borderRadius: '12px',
                padding: '28px',
                maxWidth: a.contentMaxWidth + 'px',
                margin: '0 auto',
                fontFamily: 'system-ui, sans-serif'
            };

            var uuidItemStyle = {
                background: a.uuidBg,
                color: a.uuidColor,
                borderRadius: '6px',
                padding: '10px 14px',
                fontFamily: 'monospace',
                fontSize: '14px',
                marginBottom: '6px',
                letterSpacing: '0.03em',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            };

            var btnStyle = {
                background: a.accentColor,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 22px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
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
                        { title: __('Generator Settings', 'blockenberg'), initialOpen: false },
                        el(SelectControl, {
                            label: __('Default UUID Version', 'blockenberg'),
                            value: a.defaultVersion,
                            options: [
                                { value: 'v4', label: __('UUID v4 (random)', 'blockenberg') },
                                { value: 'v1', label: __('UUID v1 (timestamp)', 'blockenberg') }
                            ],
                            onChange: function (v) { setAttributes({ defaultVersion: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Default Count', 'blockenberg'),
                            value: a.defaultCount,
                            min: 1,
                            max: 50,
                            onChange: function (v) { setAttributes({ defaultCount: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Default Uppercase', 'blockenberg'),
                            checked: a.showUppercase,
                            onChange: function (v) { setAttributes({ showUppercase: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show History', 'blockenberg'),
                            checked: a.showHistory,
                            onChange: function (v) { setAttributes({ showHistory: v }); },
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
                                { value: a.uuidBg,        onChange: function (v) { setAttributes({ uuidBg: v || '#0f172a' }); },        label: __('UUID Background', 'blockenberg') },
                                { value: a.uuidColor,     onChange: function (v) { setAttributes({ uuidColor: v || '#7dd3fc' }); },     label: __('UUID Text', 'blockenberg') },
                                { value: a.sectionBg,     onChange: function (v) { setAttributes({ sectionBg: v || '#f0f9ff' }); },     label: __('Section Background', 'blockenberg') },
                                { value: a.cardBg,        onChange: function (v) { setAttributes({ cardBg: v || '#ffffff' }); },        label: __('Card Background', 'blockenberg') },
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
                        a.showTitle && el('div', {
                            className: 'bkbg-uuid-title', style: { color: a.titleColor, marginBottom: '6px' }
                        }, a.title),
                        a.showSubtitle && el('div', {
                            className: 'bkbg-uuid-subtitle', style: { color: a.subtitleColor, marginBottom: '20px' }
                        }, a.subtitle),
                        el(
                            'div',
                            { style: { background: a.cardBg, borderRadius: '10px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } },
                            el('div', { style: { display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' } },
                                el('button', { style: Object.assign({}, btnStyle, { background: a.defaultVersion === 'v4' ? a.accentColor : '#e5e7eb', color: a.defaultVersion === 'v4' ? '#fff' : '#374151' }) }, 'v4'),
                                el('button', { style: Object.assign({}, btnStyle, { background: a.defaultVersion === 'v1' ? a.accentColor : '#e5e7eb', color: a.defaultVersion === 'v1' ? '#fff' : '#374151' }) }, 'v1')
                            ),
                            el('div', { style: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' } },
                                [1, 5, 10, 25, 50].map(function (n) {
                                    return el('button', {
                                        key: n,
                                        style: Object.assign({}, btnStyle, { background: n === a.defaultCount ? a.accentColor : '#e5e7eb', color: n === a.defaultCount ? '#fff' : '#374151', padding: '6px 14px', fontSize: '13px' })
                                    }, n);
                                })
                            ),
                            SAMPLE_UUIDS.slice(0, a.defaultCount > 5 ? 5 : a.defaultCount).map(function (uuid, i) {
                                var display = a.showUppercase ? uuid.toUpperCase() : uuid;
                                return el('div', { key: i, style: uuidItemStyle },
                                    el('span', null, display),
                                    el('button', { style: { background: 'rgba(125,211,252,0.1)', border: '1px solid rgba(125,211,252,0.3)', color: a.uuidColor, borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '11px' } }, __('Copy', 'blockenberg'))
                                );
                            }),
                            a.defaultCount > 5 && el('div', { style: { color: a.subtitleColor, fontSize: '13px', paddingTop: '6px' } }, '+ ' + (a.defaultCount - 5) + ' more UUID' + (a.defaultCount - 5 > 1 ? 's' : '') + ' on the frontend'),
                            el('div', { style: { display: 'flex', gap: '10px', marginTop: '16px' } },
                                el('button', { style: btnStyle }, __('Generate', 'blockenberg')),
                                el('button', { style: Object.assign({}, btnStyle, { background: 'transparent', color: a.accentColor, border: '2px solid ' + a.accentColor }) }, __('Copy All', 'blockenberg'))
                            )
                        )
                    )
                )
            );
        },
        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save((function () { var _tv = getTypoCssVars(a); return { style: _tv }; })());
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-uuid-app',
                    'data-opts': JSON.stringify(a)
                })
            );
        }
    });
}() );
