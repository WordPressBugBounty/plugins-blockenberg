( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var ColorIndicator = wp.components.ColorIndicator;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    function genId() {
        return 'stb_' + Math.random().toString(36).substr(2, 9);
    }

    // Compute inline style for a segment (editor + save)
    function getSegmentStyle(seg, isEditor) {
        var style = {};

        // Preset base styles (overridden by custom settings)
        switch (seg.preset) {
            case 'highlight-yellow':
                style.background = '#fef9c3';
                style.borderRadius = '3px';
                style.padding = '1px 4px';
                break;
            case 'highlight-green':
                style.background = '#dcfce7';
                style.borderRadius = '3px';
                style.padding = '1px 4px';
                break;
            case 'highlight-pink':
                style.background = '#fce7f3';
                style.borderRadius = '3px';
                style.padding = '1px 4px';
                break;
            case 'highlight-blue':
                style.background = '#dbeafe';
                style.borderRadius = '3px';
                style.padding = '1px 4px';
                break;
            case 'badge':
                style.display = 'inline-flex';
                style.alignItems = 'center';
                style.borderRadius = '50px';
                style.padding = '3px 10px';
                style.fontSize = '85%';
                style.fontWeight = '600';
                style.lineHeight = '1.4';
                style.background = seg.bgColor || '#2563eb';
                style.color = seg.color || '#ffffff';
                break;
            case 'code':
                style.fontFamily = 'ui-monospace, SFMono-Regular, "Cascadia Code", Consolas, monospace';
                style.background = '#f1f5f9';
                style.color = '#dc2626';
                style.borderRadius = '4px';
                style.padding = '1px 6px';
                style.fontSize = '88%';
                break;
            case 'glow':
                style.textShadow = '0 0 8px ' + (seg.color || '#a78bfa') + ', 0 0 16px ' + (seg.color || '#a78bfa');
                break;
            case 'underline-fancy':
                style.textDecoration = 'underline';
                style.textDecorationColor = seg.color || '#2563eb';
                style.textDecorationThickness = '2px';
                style.textUnderlineOffset = '3px';
                break;
            default:
                break;
        }

        // Custom overrides (non-badge presets)
        if (seg.preset !== 'badge') {
            if (seg.color) style.color = seg.color;
            if (seg.bgColor) style.background = seg.bgColor;
        }

        // Shared overrides
        if (seg.bold)      style.fontWeight = '700';
        if (seg.italic)    style.fontStyle = 'italic';
        if (seg.underline) style.textDecoration = 'underline';

        if (seg.customSize > 0) style.fontSize = seg.customSize + 'px';

        if (seg.borderRadius > 0 && seg.preset === 'none') {
            style.borderRadius = seg.borderRadius + 'px';
        }
        if (seg.px > 0 && seg.preset === 'none') {
            style.paddingLeft  = seg.px + 'px';
            style.paddingRight = seg.px + 'px';
        }
        if (seg.py > 0 && seg.preset === 'none') {
            style.paddingTop    = seg.py + 'px';
            style.paddingBottom = seg.py + 'px';
        }

        return style;
    }

    var PRESETS = [
        { label: __('None (plain)', 'blockenberg'), value: 'none' },
        { label: __('Highlight — Yellow', 'blockenberg'), value: 'highlight-yellow' },
        { label: __('Highlight — Green', 'blockenberg'), value: 'highlight-green' },
        { label: __('Highlight — Pink', 'blockenberg'), value: 'highlight-pink' },
        { label: __('Highlight — Blue', 'blockenberg'), value: 'highlight-blue' },
        { label: __('Badge / Pill', 'blockenberg'), value: 'badge' },
        { label: __('Code Span', 'blockenberg'), value: 'code' },
        { label: __('Gradient Text', 'blockenberg'), value: 'gradient' },
        { label: __('Glow Text', 'blockenberg'), value: 'glow' },
        { label: __('Underline (styled)', 'blockenberg'), value: 'underline-fancy' }
    ];

    registerBlockType('blockenberg/styled-text-builder', {
        title: __('Styled Text Builder', 'blockenberg'),
        icon: 'editor-textcolor',
        category: 'bkbg-content',
        description: __('Build a paragraph with mixed inline text styles — highlights, badges, gradients and more.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var activeState = useState(null);
            var activeId = activeState[0];
            var setActiveId = activeState[1];

            var activeSeg = activeId ? a.segments.find(function (s) { return s.id === activeId; }) : null;

            function updateSeg(id, field, value) {
                setAttributes({
                    segments: a.segments.map(function (s) {
                        if (s.id !== id) return s;
                        var u = Object.assign({}, s);
                        u[field] = value;
                        return u;
                    })
                });
            }

            function addSeg() {
                var newSeg = { id: genId(), text: ' New Text', preset: 'none', bold: false, italic: false, underline: false, color: '', bgColor: '', customSize: 0, borderRadius: 0, px: 0, py: 0 };
                setAttributes({ segments: a.segments.concat([newSeg]) });
                setActiveId(newSeg.id);
            }

            function removeSeg(id) {
                if (a.segments.length <= 1) return;
                setAttributes({ segments: a.segments.filter(function (s) { return s.id !== id; }) });
                if (activeId === id) setActiveId(null);
            }

            function moveSeg(index, dir) {
                var segs = a.segments.slice();
                var target = index + dir;
                if (target < 0 || target >= segs.length) return;
                var tmp = segs[index];
                segs[index] = segs[target];
                segs[target] = tmp;
                setAttributes({ segments: segs });
            }

            var alignOptions = [
                { label: __('Left', 'blockenberg'), value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right', 'blockenberg'), value: 'right' }
            ];

            // Inspector
            var inspector = el(InspectorControls, {},
                // Active segment editor
                el(PanelBody, { title: activeSeg ? '✏ ' + __('Edit Segment', 'blockenberg') : __('Select a Segment', 'blockenberg'), initialOpen: true },
                    !activeSeg && el('p', { style: { fontSize: '13px', color: '#64748b', margin: '0 0 4px' } },
                        __('Click on any text segment in the block to edit it, or pick one from the list below.', 'blockenberg')
                    ),
                    activeSeg && el(Fragment, {},
                        el(TextControl, {
                            label: __('Text', 'blockenberg'),
                            value: activeSeg.text,
                            onChange: function (v) { updateSeg(activeId, 'text', v); },
                            __nextHasNoMarginBottom: true
                        }),
                        el('div', { style: { marginTop: '8px' } },
                            el(SelectControl, {
                                label: __('Style Preset', 'blockenberg'),
                                value: activeSeg.preset,
                                options: PRESETS,
                                onChange: function (v) { updateSeg(activeId, 'preset', v); }
                            })
                        ),
                        el('div', { style: { marginTop: '4px' } },
                            el(ToggleControl, { label: __('Bold', 'blockenberg'), checked: activeSeg.bold, onChange: function (v) { updateSeg(activeId, 'bold', v); }, __nextHasNoMarginBottom: true })
                        ),
                        el(ToggleControl, { label: __('Italic', 'blockenberg'), checked: activeSeg.italic, onChange: function (v) { updateSeg(activeId, 'italic', v); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Underline', 'blockenberg'), checked: activeSeg.underline, onChange: function (v) { updateSeg(activeId, 'underline', v); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginTop: '8px' } },
                            el(RangeControl, {
                                label: __('Custom Font Size (0 = inherit)', 'blockenberg'),
                                value: activeSeg.customSize,
                                min: 0, max: 64, step: 1,
                                onChange: function (v) { updateSeg(activeId, 'customSize', v); }
                            })
                        ),
                        (activeSeg.preset === 'none' || activeSeg.preset === 'badge' || activeSeg.preset === 'glow') && el(Fragment, {},
                            el(PanelColorSettings, {
                                title: __('Segment Colors', 'blockenberg'),
                                initialOpen: false,
                                colorSettings: [
                                    { value: activeSeg.color, onChange: function (c) { updateSeg(activeId, 'color', c || ''); }, label: __('Text Color', 'blockenberg') },
                                    { value: activeSeg.bgColor, onChange: function (c) { updateSeg(activeId, 'bgColor', c || ''); }, label: __('Background', 'blockenberg') }
                                ]
                            })
                        ),
                        activeSeg.preset === 'none' && el(Fragment, {},
                            el(RangeControl, {
                                label: __('Horizontal Padding', 'blockenberg'),
                                value: activeSeg.px, min: 0, max: 30,
                                onChange: function (v) { updateSeg(activeId, 'px', v); }
                            }),
                            el(RangeControl, {
                                label: __('Vertical Padding', 'blockenberg'),
                                value: activeSeg.py, min: 0, max: 20,
                                onChange: function (v) { updateSeg(activeId, 'py', v); }
                            }),
                            el(RangeControl, {
                                label: __('Border Radius', 'blockenberg'),
                                value: activeSeg.borderRadius, min: 0, max: 50,
                                onChange: function (v) { updateSeg(activeId, 'borderRadius', v); }
                            })
                        ),
                        el('div', { style: { marginTop: '12px' } },
                            el(Button, {
                                variant: 'tertiary',
                                isDestructive: true,
                                onClick: function () { removeSeg(activeId); },
                                disabled: a.segments.length <= 1,
                                style: { width: '100%', justifyContent: 'center' }
                            }, __('Remove This Segment', 'blockenberg'))
                        )
                    )
                ),

                el(PanelBody, { title: __('All Segments', 'blockenberg'), initialOpen: false },
                    a.segments.map(function (seg, idx) {
                        var isActive = seg.id === activeId;
                        return el('div', {
                            key: seg.id,
                            style: {
                                display: 'flex', alignItems: 'center', gap: '6px',
                                marginBottom: '6px', padding: '6px 8px',
                                background: isActive ? '#ede9fe' : '#f8fafc',
                                border: '1px solid ' + (isActive ? '#c4b5fd' : '#e2e8f0'),
                                borderRadius: '6px', cursor: 'pointer'
                            },
                            onClick: function () { setActiveId(isActive ? null : seg.id); }
                        },
                            el('span', { style: { flex: 1, fontSize: '12px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' } },
                                el('strong', {}, seg.preset !== 'none' ? '[' + seg.preset + '] ' : ''),
                                seg.text
                            ),
                            el('div', { style: { display: 'flex', gap: '2px' } },
                                el(Button, { isSmall: true, variant: 'tertiary', onClick: function (e) { e.stopPropagation(); moveSeg(idx, -1); }, disabled: idx === 0 }, '↑'),
                                el(Button, { isSmall: true, variant: 'tertiary', onClick: function (e) { e.stopPropagation(); moveSeg(idx, 1); }, disabled: idx === a.segments.length - 1 }, '↓')
                            )
                        );
                    }),
                    el('div', { style: { marginTop: '8px' } },
                        el(Button, { variant: 'secondary', onClick: addSeg, style: { width: '100%', justifyContent: 'center' } },
                            '+ ' + __('Add Segment', 'blockenberg')
                        )
                    )
                ),

                el(PanelBody, { title: __('Container', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Text Align', 'blockenberg'),
                        value: a.textAlign,
                        options: alignOptions,
                        onChange: function (v) { setAttributes({ textAlign: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Max Width (0 = full)', 'blockenberg'),
                        value: a.maxWidth, min: 0, max: 1200, step: 20,
                        onChange: function (v) { setAttributes({ maxWidth: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Container Padding', 'blockenberg'),
                        value: a.containerPadding, min: 0, max: 60,
                        onChange: function (v) { setAttributes({ containerPadding: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Container Border Radius', 'blockenberg'),
                        value: a.containerRadius, min: 0, max: 30,
                        onChange: function (v) { setAttributes({ containerRadius: v }); }
                    })
                ),
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl()({ label: __('Paragraph Text', 'blockenberg'), value: a.textTypo, onChange: function (v) { setAttributes({ textTypo: v }); } })
                ),

                el(PanelColorSettings, {
                    title: __('Container Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.textColor, onChange: function (c) { setAttributes({ textColor: c || '' }); }, label: __('Base Text Color', 'blockenberg') }
                    ]
                })
            );

            var paraStyle = {
                textAlign: a.textAlign,
                color: a.textColor || '#1e293b',
                margin: 0,
                padding: a.containerPadding > 0 ? a.containerPadding + 'px' : undefined,
                borderRadius: a.containerRadius > 0 ? a.containerRadius + 'px' : undefined
            };
            if (a.maxWidth > 0) paraStyle.maxWidth = a.maxWidth + 'px';

            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                Object.assign(s, _tvf(a.textTypo, '--bkstb-tx-'));
                return { className: 'bkbg-editor-wrap', 'data-block-label': 'Styled Text Builder', style: s };
            })());

            return el('div', blockProps,
                inspector,
                el('p', { className: 'bkbg-stb-paragraph', style: paraStyle },
                    a.segments.map(function (seg) {
                        var isActive = seg.id === activeId;
                        var segClass = 'bkbg-stb-seg';
                        if (seg.preset && seg.preset !== 'none') segClass += ' bkbg-stb-preset--' + seg.preset;
                        if (isActive) segClass += ' bkbg-stb-is-active';

                        var style = getSegmentStyle(seg, true);
                        if (isActive) {
                            style.outline = '2px dashed #6c3fb5';
                            style.outlineOffset = '2px';
                        }

                        return el('span', {
                            key: seg.id,
                            className: segClass,
                            style: style,
                            title: __('Click to edit', 'blockenberg'),
                            onClick: function (e) {
                                e.stopPropagation();
                                setActiveId(isActive ? null : seg.id);
                            }
                        }, seg.text);
                    })
                ),
                // Add segment shortcut below
                el('div', { style: { marginTop: '10px', textAlign: 'center' } },
                    el(Button, {
                        variant: 'tertiary',
                        onClick: addSeg,
                        style: { fontSize: '12px', color: '#6c3fb5' }
                    }, '+ ' + __('Add Text Segment', 'blockenberg'))
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var paraStyle = {
                textAlign: a.textAlign,
                color: a.textColor || undefined,
                margin: 0
            };
            if (a.containerPadding > 0) paraStyle.padding = a.containerPadding + 'px';
            if (a.containerRadius > 0) paraStyle.borderRadius = a.containerRadius + 'px';
            if (a.maxWidth > 0) paraStyle.maxWidth = a.maxWidth + 'px';
            var _tvf = window.bkbgTypoCssVars || function () { return {}; };
            Object.assign(paraStyle, _tvf(a.textTypo, '--bkstb-tx-'));

            return el('p', { className: 'bkbg-stb-paragraph', style: paraStyle },
                a.segments.map(function (seg, idx) {
                    var segClass = 'bkbg-stb-seg';
                    if (seg.preset && seg.preset !== 'none') segClass += ' bkbg-stb-preset--' + seg.preset;

                    return el('span', { key: idx, className: segClass, style: getSegmentStyle(seg, false) }, seg.text);
                })
            );
        }
    });
}() );
