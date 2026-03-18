( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
    }

    var COLUMNS_OPTIONS = [
        { label: '1 column', value: 1 },
        { label: '2 columns', value: 2 },
        { label: '3 columns', value: 3 },
    ];
    var ASPECT_OPTIONS = [
        { label: '16:9 (Widescreen)',  value: '16/9' },
        { label: '4:3 (Standard)',     value: '4/3' },
        { label: '3:2 (Photo)',        value: '3/2' },
        { label: '1:1 (Square)',       value: '1/1' },
        { label: '3:4 (Portrait)',     value: '3/4' },
    ];
    var HANDLE_STYLE_OPTIONS = [
        { label: 'Circle + Arrows',  value: 'circle-arrows' },
        { label: 'Circle only',      value: 'circle' },
        { label: 'Line (thin)',       value: 'line' },
        { label: 'Double arrow',     value: 'double-arrow' },
    ];
    var LABEL_POS_OPTIONS = [
        { label: 'Inner edge',  value: 'inner-edge' },
        { label: 'Outer corner', value: 'outer-corner' },
    ];
    var ORIENTATION_OPTIONS = [
        { label: 'Horizontal (left/right)', value: 'horizontal' },
        { label: 'Vertical (top/bottom)',   value: 'vertical' },
    ];

    function updatePair(arr, idx, field, val) {
        return arr.map(function (p, i) {
            if (i !== idx) return p;
            var patch = {}; patch[field] = val;
            return Object.assign({}, p, patch);
        });
    }

    function editorPairPreview(pair, a, i) {
        var isHoriz = a.orientation !== 'vertical';
        var aspect = (a.aspect || '4/3').split('/');
        var ratio = (parseInt(aspect[1], 10) / parseInt(aspect[0], 10)) * 100;

        return el('div', {
            key: i,
            style: {
                borderRadius: a.borderRadius + 'px',
                overflow: 'hidden',
                background: '#f1f5f9',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }
        },
            // Image pair
            el('div', { style: { position: 'relative', paddingTop: ratio + '%' } },
                // Before image (left half or top half)
                pair.beforeUrl && el('img', {
                    src: pair.beforeUrl, alt: pair.beforeAlt,
                    style: {
                        position: 'absolute', top: 0,
                        left: 0, width: isHoriz ? '50%' : '100%',
                        height: isHoriz ? '100%' : '50%',
                        objectFit: 'cover',
                    }
                }),
                // After image (right half or bottom half)
                pair.afterUrl && el('img', {
                    src: pair.afterUrl, alt: pair.afterAlt,
                    style: {
                        position: 'absolute', top: isHoriz ? 0 : '50%',
                        left: isHoriz ? '50%' : 0,
                        width: isHoriz ? '50%' : '100%',
                        height: isHoriz ? '100%' : '50%',
                        objectFit: 'cover',
                    }
                }),
                // Divider line
                el('div', {
                    style: {
                        position: 'absolute',
                        top: isHoriz ? 0 : '50%',
                        left: isHoriz ? '50%' : 0,
                        width: isHoriz ? a.lineWidth + 'px' : '100%',
                        height: isHoriz ? '100%' : a.lineWidth + 'px',
                        background: a.lineColor,
                        transform: isHoriz ? 'translateX(-50%)' : 'translateY(-50%)',
                    }
                }),
                // Labels
                a.showLabels && el(Fragment, null,
                    el('span', {
                        className: 'bkbg-bag-label bkbg-bag-label-before',
                        style: {
                            position: 'absolute', top: 8, left: 8,
                            background: a.labelBg, color: a.labelColor,
                            padding: '2px 8px', borderRadius: 4,
                        }
                    }, pair.beforeLabel || 'Before'),
                    el('span', {
                        className: 'bkbg-bag-label bkbg-bag-label-after',
                        style: {
                            position: 'absolute', top: 8, right: 8,
                            background: a.labelBg, color: a.labelColor,
                            padding: '2px 8px', borderRadius: 4,
                        }
                    }, pair.afterLabel || 'After')
                ),
                // Handle
                el('div', {
                    style: {
                        position: 'absolute',
                        top: isHoriz ? '50%' : '50%',
                        left: isHoriz ? '50%' : '50%',
                        transform: 'translate(-50%, -50%)',
                        width: a.handleSize + 'px', height: a.handleSize + 'px',
                        background: a.handleBg,
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                        color: a.handleColor, fontSize: 14, fontWeight: 700,
                        zIndex: 2,
                    }
                }, '⟺')
            ),
            // Caption
            a.showCaptions && pair.caption && el('div', {
                className: 'bkbg-bag-caption',
                style: {
                    padding: '8px 12px',
                    color: a.captionColor, background: a.captionBg,
                }
            }, pair.caption)
        );
    }

    registerBlockType('blockenberg/before-after-grid', {
        title: __('Before / After Grid', 'blockenberg'),
        icon: 'align-pull-left',
        category: 'bkbg-media',
        description: __('A grid of draggable before/after image comparison sliders.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var _tv = getTypoCssVars();
            var TC = getTypographyControl();
            var bpStyle = {};
            Object.assign(bpStyle, _tv(a.labelTypo || {}, '--bkbg-bag-label-'));
            Object.assign(bpStyle, _tv(a.captionTypo || {}, '--bkbg-bag-caption-'));
            var blockProps = useBlockProps({ style: bpStyle });

            return el(Fragment, null,
                el(InspectorControls, null,

                    // Pairs
                    el(PanelBody, { title: 'Image Pairs (' + a.pairs.length + ')', initialOpen: true },
                        a.pairs.map(function (pair, i) {
                            return el('div', {
                                key: i,
                                style: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 10, background: '#fafafa' }
                            },
                                el('p', { style: { fontWeight: 700, fontSize: 13, margin: '0 0 8px', color: '#374151' } }, 'Pair ' + (i + 1)),

                                el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 } },
                                    // Before
                                    el('div', null,
                                        el('p', { style: { fontSize: 11, fontWeight: 600, color: '#6b7280', margin: '0 0 4px' } }, 'BEFORE'),
                                        pair.beforeUrl && el('img', { src: pair.beforeUrl, style: { width: '100%', height: 60, objectFit: 'cover', borderRadius: 6, marginBottom: 4 } }),
                                        el(MediaUploadCheck, null,
                                            el(MediaUpload, {
                                                onSelect: function (m) {
                                                    var u = updatePair(a.pairs, i, 'beforeUrl', m.url);
                                                    u = updatePair(u, i, 'beforeId', m.id);
                                                    u = updatePair(u, i, 'beforeAlt', m.alt || 'Before');
                                                    set({ pairs: u });
                                                },
                                                allowedTypes: ['image'], value: pair.beforeId,
                                                render: function (mp) {
                                                    return el(Button, { variant: 'secondary', size: 'small', onClick: mp.open, __nextHasNoMarginBottom: true }, pair.beforeUrl ? '⟳' : 'Select');
                                                }
                                            })
                                        ),
                                        el('div', { style: { height: 4 } }),
                                        el(TextControl, { label: 'Label', value: pair.beforeLabel, onChange: function (v) { set({ pairs: updatePair(a.pairs, i, 'beforeLabel', v) }); }, __nextHasNoMarginBottom: true })
                                    ),
                                    // After
                                    el('div', null,
                                        el('p', { style: { fontSize: 11, fontWeight: 600, color: '#6b7280', margin: '0 0 4px' } }, 'AFTER'),
                                        pair.afterUrl && el('img', { src: pair.afterUrl, style: { width: '100%', height: 60, objectFit: 'cover', borderRadius: 6, marginBottom: 4 } }),
                                        el(MediaUploadCheck, null,
                                            el(MediaUpload, {
                                                onSelect: function (m) {
                                                    var u = updatePair(a.pairs, i, 'afterUrl', m.url);
                                                    u = updatePair(u, i, 'afterId', m.id);
                                                    u = updatePair(u, i, 'afterAlt', m.alt || 'After');
                                                    set({ pairs: u });
                                                },
                                                allowedTypes: ['image'], value: pair.afterId,
                                                render: function (mp) {
                                                    return el(Button, { variant: 'secondary', size: 'small', onClick: mp.open, __nextHasNoMarginBottom: true }, pair.afterUrl ? '⟳' : 'Select');
                                                }
                                            })
                                        ),
                                        el('div', { style: { height: 4 } }),
                                        el(TextControl, { label: 'Label', value: pair.afterLabel, onChange: function (v) { set({ pairs: updatePair(a.pairs, i, 'afterLabel', v) }); }, __nextHasNoMarginBottom: true })
                                    )
                                ),
                                el(TextControl, { label: 'Caption', value: pair.caption, onChange: function (v) { set({ pairs: updatePair(a.pairs, i, 'caption', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 4 } }),
                                el(Button, { isDestructive: true, variant: 'link', size: 'small', onClick: function () { set({ pairs: a.pairs.filter(function (_, idx) { return idx !== i; }) }); }, __nextHasNoMarginBottom: true }, 'Remove Pair')
                            );
                        }),
                        el(Button, {
                            variant: 'secondary', onClick: function () {
                                set({ pairs: a.pairs.concat([{ beforeUrl: '', beforeId: 0, beforeAlt: 'Before', beforeLabel: 'Before', afterUrl: '', afterId: 0, afterAlt: 'After', afterLabel: 'After', caption: '' }]) });
                            },
                            style: { width: '100%', justifyContent: 'center' }, __nextHasNoMarginBottom: true
                        }, '+ Add Pair')
                    ),

                    // Layout
                    el(PanelBody, { title: 'Layout', initialOpen: false },
                        el(SelectControl, { label: 'Columns', value: a.columns, options: COLUMNS_OPTIONS, onChange: function (v) { set({ columns: parseInt(v, 10) }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(SelectControl, { label: 'Aspect Ratio', value: a.aspect, options: ASPECT_OPTIONS, onChange: function (v) { set({ aspect: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Gap (px)', value: a.gap, min: 0, max: 60, onChange: function (v) { set({ gap: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 32, onChange: function (v) { set({ borderRadius: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(SelectControl, { label: 'Slider Orientation', value: a.orientation, options: ORIENTATION_OPTIONS, onChange: function (v) { set({ orientation: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Start Position (%)', value: a.startPosition, min: 10, max: 90, onChange: function (v) { set({ startPosition: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Handle & Labels
                    el(PanelBody, { title: 'Handle & Labels', initialOpen: false },
                        el(SelectControl, { label: 'Handle Style', value: a.handleStyle, options: HANDLE_STYLE_OPTIONS, onChange: function (v) { set({ handleStyle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Handle Size (px)', value: a.handleSize, min: 24, max: 80, onChange: function (v) { set({ handleSize: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Line Width (px)', value: a.lineWidth, min: 1, max: 8, onChange: function (v) { set({ lineWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(ToggleControl, { label: 'Show labels', checked: a.showLabels, onChange: function (v) { set({ showLabels: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(ToggleControl, { label: 'Show captions', checked: a.showCaptions, onChange: function (v) { set({ showCaptions: v }); }, __nextHasNoMarginBottom: true }),
                        ),

                    // Colors
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        a.showLabels && TC && el(TC, { label: __('Label', 'blockenberg'), value: a.labelTypo || {}, onChange: function(v){ set({labelTypo: v}); } }),
                        a.showCaptions && TC && el(TC, { label: __('Caption', 'blockenberg'), value: a.captionTypo || {}, onChange: function(v){ set({captionTypo: v}); } })
                    ),
el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Handle Background', value: a.handleBg,    onChange: function (v) { set({ handleBg: v || '#ffffff' }); } },
                            { label: 'Handle Icon',       value: a.handleColor, onChange: function (v) { set({ handleColor: v || '#374151' }); } },
                            { label: 'Divider Line',      value: a.lineColor,   onChange: function (v) { set({ lineColor: v || '#ffffff' }); } },
                            { label: 'Label Background',  value: a.labelBg,     onChange: function (v) { set({ labelBg: v || 'rgba(0,0,0,0.55)' }); } },
                            { label: 'Label Text',        value: a.labelColor,  onChange: function (v) { set({ labelColor: v || '#ffffff' }); } },
                            { label: 'Caption Background',value: a.captionBg,   onChange: function (v) { set({ captionBg: v || '#f8fafc' }); } },
                            { label: 'Caption Text',      value: a.captionColor,onChange: function (v) { set({ captionColor: v || '#374151' }); } },
                        ]
                    })
                ),

                // ── Editor Preview ──
                el('div', blockProps,
                    el('p', { style: { fontSize: 11, color: '#9ca3af', margin: '0 0 10px', textAlign: 'center' } }, 'Before/After Grid — drag to compare on the frontend'),
                    el('div', {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)',
                            gap: a.gap + 'px',
                        }
                    },
                        a.pairs.map(function (pair, i) { return editorPairPreview(pair, a, i); })
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-bag-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
