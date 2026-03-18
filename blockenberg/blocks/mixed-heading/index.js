( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var TAG_OPTIONS = [
        { label: 'H1', value: 'h1' }, { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' }, { label: 'H4', value: 'h4' },
        { label: 'H5', value: 'h5' }, { label: 'H6', value: 'h6' },
        { label: 'p (paragraph)', value: 'p' },
        { label: 'div', value: 'div' },
    ];
    var ALIGN_OPTIONS = [
        { label: 'Left',   value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right',  value: 'right' },
    ];
    var STYLE_OPTIONS = [
        { label: 'Normal',          value: 'normal' },
        { label: 'Gradient Text',   value: 'gradient' },
        { label: 'Highlight (bg)',  value: 'highlight' },
        { label: 'Outlined/Stroke', value: 'stroke' },
        { label: 'Badge Pill',      value: 'badge' },
        { label: 'Monospace/Code',  value: 'mono' },
        { label: 'Ghost (faded)',   value: 'ghost' },
    ];
    var WEIGHT_OPTIONS = [
        { label: '300 Light',    value: '300' },
        { label: '400 Normal',   value: '400' },
        { label: '500 Medium',   value: '500' },
        { label: '600 Semibold', value: '600' },
        { label: '700 Bold',     value: '700' },
        { label: '800 ExtraBold',value: '800' },
        { label: '900 Black',    value: '900' },
    ];
    var GRADIENT_DIR_OPTIONS = [
        { label: 'Left → Right',   value: 'to right' },
        { label: 'Right → Left',   value: 'to left' },
        { label: 'Top → Bottom',   value: 'to bottom' },
        { label: 'Diagonal ↘',     value: 'to bottom right' },
        { label: 'Diagonal ↗',     value: 'to top right' },
    ];

    function updateSeg(arr, idx, field, val) {
        return arr.map(function (s, i) {
            if (i !== idx) return s;
            var p = {}; p[field] = val;
            return Object.assign({}, s, p);
        });
    }

    function segStyle(s, a, effSize) {
        effSize = effSize || a.fontSize;
        var base = {
            fontWeight: s.weight || '700',
            fontStyle:  s.italic ? 'italic' : 'normal',
            textDecoration: s.underline ? 'underline' : 'none',
            letterSpacing: s.spacing ? s.spacing + 'em' : undefined,
            display: 'inline',
            fontSize: s.scale && s.scale !== 1 ? (effSize * s.scale) + 'px' : undefined,
        };
        if (s.style === 'gradient') {
            return Object.assign({}, base, {
                backgroundImage: 'linear-gradient(' + (a.gradientDir || 'to right') + ', ' + s.color + ', ' + s.color2 + ')',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
            });
        } else if (s.style === 'highlight') {
            return Object.assign({}, base, {
                color: s.color,
                background: s.bg || '#ede9fe',
                borderRadius: 4 + 'px',
                padding: '0 4px',
                display: 'inline',
            });
        } else if (s.style === 'stroke') {
            return Object.assign({}, base, {
                color: 'transparent',
                WebkitTextStroke: (a.strokeWidth || 2) + 'px ' + s.color,
                textStroke: (a.strokeWidth || 2) + 'px ' + s.color,
            });
        } else if (s.style === 'badge') {
            return Object.assign({}, base, {
                color: s.color,
                background: s.bg || '#f1f5f9',
                borderRadius: (a.badgeRadius || 6) + 'px',
                padding: (a.badgePaddingY || 3) + 'px ' + (a.badgePaddingX || 8) + 'px',
                display: 'inline-block',
                verticalAlign: 'middle',
            });
        } else if (s.style === 'mono') {
            return Object.assign({}, base, {
                color: s.color,
                fontFamily: "'Courier New', Courier, monospace",
                background: s.bg || '#f8f8f8',
                borderRadius: 4 + 'px',
                padding: '2px 6px',
                fontSize: '0.88em',
            });
        } else if (s.style === 'ghost') {
            return Object.assign({}, base, {
                color: s.color,
                opacity: 0.35,
            });
        }
        // normal
        return Object.assign({}, base, { color: s.color });
    }

    function buildPreviewEl(a) {
        var effSize = (a.headingTypo && a.headingTypo.sizeDesktop) || a.fontSize;
        var segs = (a.segments || []).map(function (s, i) {
            return el('span', { key: i, style: segStyle(s, a, effSize) }, s.text);
        });
        var hStyle = {
            textAlign: a.textAlign,
            maxWidth: a.maxWidth + 'px',
            margin: '0 auto',
            paddingTop: a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            fontWeight: 'normal',
            wordBreak: 'break-word',
        };
        return el(a.tag || 'h2', { className: 'bkbg-mhd-heading', style: hStyle }, segs);
    }

    registerBlockType('blockenberg/mixed-heading', {
        title: __('Mixed Heading', 'blockenberg'),
        icon: 'editor-spellcheck',
        category: 'bkbg-content',
        description: __('Build headings with mixed per-segment styles: gradient, highlight, stroke, badge, mono, and more.', 'blockenberg'),

        deprecated: [{
            save: function (props) {
                return el('div', useBlockProps.save(),
                    el('div', { className: 'bkbg-mhd-app', 'data-opts': JSON.stringify(props.attributes) })
                );
            }
        }],

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var expandedSt = useState(-1);
            var expanded = expandedSt[0];
            var setExpanded = expandedSt[1];
            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = { textAlign: a.textAlign };
                Object.assign(s, _tvf(a.headingTypo, '--bkbg-mhd-hd-'));
                return { style: s };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,

                    // Global
                    el(PanelBody, { title: 'Heading Settings', initialOpen: true },
                        el(SelectControl, { label: 'HTML Tag', value: a.tag, options: TAG_OPTIONS, onChange: function (v) { set({ tag: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(SelectControl, { label: 'Text Align', value: a.textAlign, options: ALIGN_OPTIONS, onChange: function (v) { set({ textAlign: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Max Width (px)', value: a.maxWidth, min: 200, max: 1400, step: 20, onChange: function (v) { set({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Padding Top (px)', value: a.paddingTop, min: 0, max: 120, onChange: function (v) { set({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Padding Bottom (px)', value: a.paddingBottom, min: 0, max: 120, onChange: function (v) { set({ paddingBottom: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(SelectControl, { label: 'Gradient Direction', value: a.gradientDir, options: GRADIENT_DIR_OPTIONS, onChange: function (v) { set({ gradientDir: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Stroke Width (px)', value: a.strokeWidth, min: 1, max: 8, onChange: function (v) { set({ strokeWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Badge Border Radius (px)', value: a.badgeRadius, min: 0, max: 30, onChange: function (v) { set({ badgeRadius: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Segments
                    el(PanelBody, { title: 'Text Segments (' + a.segments.length + ')', initialOpen: true },
                        el('p', { style: { fontSize: 11, color: '#6b7280', margin: '0 0 10px' } }, 'Add segments to build your heading. Each can have a different style. Use a space-only segment for word gaps.'),
                        a.segments.map(function (s, i) {
                            var isOpen = expanded === i;
                            return el('div', {
                                key: i,
                                style: { border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 6, background: '#fafafa', overflow: 'hidden' }
                            },
                                // Header row
                                el('div', {
                                    style: { display: 'flex', alignItems: 'center', padding: '6px 10px', cursor: 'pointer', gap: 8, borderBottom: isOpen ? '1px solid #e5e7eb' : 'none' },
                                    onClick: function () { setExpanded(isOpen ? -1 : i); }
                                },
                                    el('span', { style: Object.assign({ fontSize: 13, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, segStyle(s, a)) }, s.text || '(empty)'),
                                    el('span', { style: { fontSize: 10, color: '#9ca3af', flexShrink: 0 } }, s.style),
                                    el('span', { style: { fontSize: 12, color: '#9ca3af' } }, isOpen ? '▲' : '▼')
                                ),
                                isOpen && el('div', { style: { padding: '10px' } },
                                    el(TextControl, { label: 'Text', value: s.text, onChange: function (v) { set({ segments: updateSeg(a.segments, i, 'text', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 8 } }),
                                    el(SelectControl, { label: 'Style', value: s.style, options: STYLE_OPTIONS, onChange: function (v) { set({ segments: updateSeg(a.segments, i, 'style', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 8 } }),
                                    el(SelectControl, { label: 'Font Weight', value: s.weight, options: WEIGHT_OPTIONS, onChange: function (v) { set({ segments: updateSeg(a.segments, i, 'weight', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 8 } }),
                                    el('div', { style: { display: 'flex', gap: 8 } },
                                        el('label', { style: { display: 'block', fontSize: 11, fontWeight: 600, color: '#374151' } }, 'Text Color'),
                                        el('input', {
                                            type: 'color', value: s.color || '#111827',
                                            onChange: function (e) { set({ segments: updateSeg(a.segments, i, 'color', e.target.value) }); },
                                            style: { flex: 1, height: 32, border: 'none', cursor: 'pointer', borderRadius: 4 }
                                        })
                                    ),
                                    (s.style === 'gradient') && el(Fragment, null,
                                        el('div', { style: { height: 8 } }),
                                        el('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
                                            el('label', { style: { fontSize: 11, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' } }, 'Gradient End'),
                                            el('input', {
                                                type: 'color', value: s.color2 || '#ec4899',
                                                onChange: function (e) { set({ segments: updateSeg(a.segments, i, 'color2', e.target.value) }); },
                                                style: { flex: 1, height: 32, border: 'none', cursor: 'pointer', borderRadius: 4 }
                                            })
                                        )
                                    ),
                                    (s.style === 'highlight' || s.style === 'badge' || s.style === 'mono') && el(Fragment, null,
                                        el('div', { style: { height: 8 } }),
                                        el('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
                                            el('label', { style: { fontSize: 11, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' } }, 'Background'),
                                            el('input', {
                                                type: 'color', value: (s.bg && s.bg !== 'transparent') ? s.bg : '#ede9fe',
                                                onChange: function (e) { set({ segments: updateSeg(a.segments, i, 'bg', e.target.value) }); },
                                                style: { flex: 1, height: 32, border: 'none', cursor: 'pointer', borderRadius: 4 }
                                            })
                                        )
                                    ),
                                    el('div', { style: { height: 8 } }),
                                    el(ToggleControl, { label: 'Italic', checked: s.italic, onChange: function (v) { set({ segments: updateSeg(a.segments, i, 'italic', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 4 } }),
                                    el(ToggleControl, { label: 'Underline', checked: s.underline, onChange: function (v) { set({ segments: updateSeg(a.segments, i, 'underline', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 8 } }),
                                    el(RangeControl, { label: 'Scale (1 = same size)', value: s.scale || 1, min: 0.5, max: 2, step: 0.05, onChange: function (v) { set({ segments: updateSeg(a.segments, i, 'scale', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 8 } }),
                                    el(RangeControl, { label: 'Letter Spacing (em)', value: s.spacing || 0, min: -0.1, max: 0.3, step: 0.01, onChange: function (v) { set({ segments: updateSeg(a.segments, i, 'spacing', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
                                        el(Button, {
                                            variant: 'secondary', size: 'small', __nextHasNoMarginBottom: true,
                                            onClick: function () {
                                                var cloned = JSON.parse(JSON.stringify(a.segments[i]));
                                                var next = a.segments.slice(0, i + 1).concat([cloned]).concat(a.segments.slice(i + 1));
                                                set({ segments: next });
                                                setExpanded(i + 1);
                                            }
                                        }, 'Duplicate'),
                                        el(Button, {
                                            isDestructive: true, variant: 'link', size: 'small', __nextHasNoMarginBottom: true,
                                            onClick: function () {
                                                set({ segments: a.segments.filter(function (_, idx) { return idx !== i; }) });
                                                setExpanded(-1);
                                            }
                                        }, 'Remove')
                                    )
                                )
                            );
                        }),
                        el('div', { style: { height: 6 } }),
                        el('div', { style: { display: 'flex', gap: 6 } },
                            el(Button, {
                                variant: 'secondary', size: 'small', __nextHasNoMarginBottom: true,
                                onClick: function () {
                                    var newSeg = { text: 'New text', style: 'normal', color: '#111827', color2: '#6366f1', bg: 'transparent', weight: '700', italic: false, underline: false, scale: 1, spacing: 0 };
                                    set({ segments: a.segments.concat([newSeg]) });
                                    setExpanded(a.segments.length);
                                }
                            }, '+ Add Segment'),
                            el(Button, {
                                variant: 'tertiary', size: 'small', __nextHasNoMarginBottom: true,
                                onClick: function () {
                                    var spacer = { text: ' ', style: 'normal', color: '#111827', color2: '#6366f1', bg: 'transparent', weight: '700', italic: false, underline: false, scale: 1, spacing: 0 };
                                    set({ segments: a.segments.concat([spacer]) });
                                }
                            }, '+ Add Space')
                        )
                    ),
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el( getTypoControl(), { label: __( 'Heading', 'blockenberg' ), value: a.headingTypo, onChange: function (v) { set({ headingTypo: v }); } })
                    )
                ),

                // ── Editor Preview ──
                el('div', blockProps,
                    el('div', { className: 'bkbg-mhd-outer', style: { textAlign: a.textAlign } },
                        buildPreviewEl(a)
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = useBlockProps.save((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                Object.assign(s, _tvf(a.headingTypo, '--bkbg-mhd-hd-'));
                return { style: s };
            })());
            return el('div', blockProps,
                el('div', { className: 'bkbg-mhd-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
