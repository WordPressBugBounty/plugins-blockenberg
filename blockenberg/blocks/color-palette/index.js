( function () {
    var el                = wp.element.createElement;
    var Fragment          = wp.element.Fragment;
    var useState          = wp.element.useState;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var RichText          = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody         = wp.components.PanelBody;
    var ToggleControl     = wp.components.ToggleControl;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var Button            = wp.components.Button;
    var ColorPicker       = wp.components.ColorPicker;
    var Popover           = wp.components.Popover;

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    var _tv = (function () {
        var fn = window.bkbgTypoCssVars;
        return fn ? fn : function () { return {}; };
    })();

    /* ── helpers ────────────────────────────────────────────────────────────── */
    function hexToRgb(hex) {
        var r = 0, g = 0, b = 0;
        var clean = hex ? hex.replace('#', '') : '000000';
        if (clean.length === 3) { clean = clean.split('').map(function (c) { return c + c; }).join(''); }
        r = parseInt(clean.substring(0, 2), 16);
        g = parseInt(clean.substring(2, 4), 16);
        b = parseInt(clean.substring(4, 6), 16);
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }

    function sectionLabel(text) {
        return el('p', {
            style: { margin: '10px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888', letterSpacing: '.5px' }
        }, text);
    }

    /* ── colour swatch row ──────────────────────────────────────────────────── */
    function ColorRow(props) {
        var index    = props.index;
        var color    = props.color;
        var onChange = props.onChange;
        var onRemove = props.onRemove;
        var openKey  = props.openKey;
        var setOpenKey = props.setOpenKey;

        var key = 'color-' + index;
        var isOpen = openKey === key;

        return el('div', { style: { background: '#f9fafb', borderRadius: '8px', padding: '10px', marginBottom: '8px', border: '1px solid #e5e7eb' } },
            /* swatch preview */
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' } },
                el('button', {
                    type: 'button',
                    onClick: function () { setOpenKey(isOpen ? null : key); },
                    style: { width: '36px', height: '36px', borderRadius: '6px', border: '2px solid ' + (isOpen ? '#007cba' : '#ddd'), background: color.hex || '#ffffff', cursor: 'pointer', flexShrink: 0 }
                }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' }, onMouseDown: function (e) { e.stopPropagation(); } },
                        el(ColorPicker, {
                            color: color.hex,
                            enableAlpha: false,
                            onChange: function (v) { onChange('hex', v); }
                        })
                    )
                ),
                el('strong', { style: { fontSize: '13px', flex: 1 } }, color.name || __('Unnamed', 'blockenberg'))
            ),
            el(TextControl, { label: __('Name', 'blockenberg'), value: color.name || '', onChange: function (v) { onChange('name', v); } }),
            el(TextControl, { label: __('CSS Variable', 'blockenberg'), value: color.cssVar || '', onChange: function (v) { onChange('cssVar', v); }, placeholder: '--color-primary' }),
            el(Button, { isDestructive: true, isSmall: true, onClick: onRemove }, __('Remove', 'blockenberg'))
        );
    }

    /* ── swatch card preview in editor ─────────────────────────────────────── */
    function SwatchCard(props) {
        var a   = props.attrs;
        var c   = props.color;
        var idx = props.index;

        var cardStyle = {
            borderRadius: a.borderRadius + 'px',
            overflow: 'hidden',
            background: a.labelBg,
            boxShadow: a.showShadow ? '0 2px 12px rgba(0,0,0,0.1)' : 'none',
            border: a.showBorder ? '1px solid ' + a.borderColor : 'none',
        };

        var swatchStyle = {
            background: c.hex,
            height: a.swatchHeight + 'px',
            position: 'relative',
        };

        var labelStyle = {
            padding: a.labelPadding + 'px',
            textAlign: a.textAlign,
            background: a.labelBg,
        };

        return el('div', { style: cardStyle },
            el('div', { style: swatchStyle }),
            el('div', { style: labelStyle },
                a.showName && el('p', { className: 'bkcp-name', style: { margin: '0 0 2px', color: a.labelTextColor } }, c.name || ''),
                a.showHex  && el('p', { className: 'bkcp-hex', style: { margin: '0 0 2px', fontFamily: 'monospace', color: a.labelMeta } }, (c.hex || '').toUpperCase()),
                a.showRGB  && el('p', { className: 'bkcp-rgb', style: { margin: '0 0 2px', fontFamily: 'monospace', color: a.labelMeta } }, hexToRgb(c.hex)),
                a.showCssVar && c.cssVar && el('p', { className: 'bkcp-cssvar', style: { margin: '0', fontFamily: 'monospace', color: a.labelMeta } }, c.cssVar),
                a.showCopyBtn && el('button', {
                    type: 'button',
                    style: { marginTop: '6px', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', border: '1px solid #e5e7eb', background: '#f3f4f6', cursor: 'pointer', color: '#374151' },
                    onClick: function (e) { e.preventDefault(); }
                }, __('Copy', 'blockenberg'))
            )
        );
    }

    /* ── edit ───────────────────────────────────────────────────────────────── */
    function Edit(props) {
        var attributes   = props.attributes;
        var setAttributes = props.setAttributes;
        var a            = attributes;

        var openKeyState = useState(null);
        var openKey      = openKeyState[0];
        var setOpenKey   = openKeyState[1];

        function updateColor(idx, key, val) {
            var next = (a.colors || []).slice();
            next[idx] = Object.assign({}, next[idx], { [key]: val });
            setAttributes({ colors: next });
        }

        function addColor() {
            setAttributes({ colors: (a.colors || []).concat([{ name: 'New Color', hex: '#6c3fb5', cssVar: '' }]) });
        }

        function removeColor(idx) {
            var next = (a.colors || []).slice();
            next.splice(idx, 1);
            setAttributes({ colors: next });
        }

        var bpStyle = { padding: '16px' };
        Object.assign(bpStyle, _tv(a.typoTitle, '--bkbg-cp-tt'));
        Object.assign(bpStyle, _tv(a.typoLabel, '--bkbg-cp-lb'));
        var blockProps = useBlockProps({ style: bpStyle });

        var gridStyle = {
            display: 'grid',
            gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)',
            gap: a.gap + 'px',
        };

        var listStyle = {
            display: 'flex',
            flexDirection: 'column',
            gap: a.gap + 'px',
        };

        return el(Fragment, null,
            el(InspectorControls, null,

                /* Colors panel */
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                    el(getTypographyControl(), { label: __('Label', 'blockenberg'), value: a.typoLabel, onChange: function (v) { setAttributes({ typoLabel: v }); } })
                ),
el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: true },
                    (a.colors || []).map(function (color, idx) {
                        return el(ColorRow, {
                            key: idx,
                            index: idx,
                            color: color,
                            onChange: function (k, v) { updateColor(idx, k, v); },
                            onRemove: function () { removeColor(idx); },
                            openKey: openKey,
                            setOpenKey: setOpenKey,
                        });
                    }),
                    el(Button, { isPrimary: true, isSmall: true, onClick: addColor, style: { marginTop: '6px' } }, __('+ Add Color', 'blockenberg'))
                ),

                /* Layout panel */
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Display', 'blockenberg'),
                        value: a.layout,
                        options: [
                            { label: __('Grid', 'blockenberg'), value: 'grid' },
                            { label: __('List (horizontal)', 'blockenberg'), value: 'list' },
                        ],
                        onChange: function (v) { setAttributes({ layout: v }); }
                    }),
                    a.layout === 'grid' && el(RangeControl, {
                        label: __('Columns', 'blockenberg'),
                        value: a.columns,
                        min: 1,
                        max: 8,
                        onChange: function (v) { setAttributes({ columns: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Swatch Height (px)', 'blockenberg'),
                        value: a.swatchHeight,
                        min: 40,
                        max: 300,
                        onChange: function (v) { setAttributes({ swatchHeight: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap (px)', 'blockenberg'),
                        value: a.gap,
                        min: 0,
                        max: 48,
                        onChange: function (v) { setAttributes({ gap: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: a.borderRadius,
                        min: 0,
                        max: 32,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Label Padding (px)', 'blockenberg'),
                        value: a.labelPadding,
                        min: 4,
                        max: 32,
                        onChange: function (v) { setAttributes({ labelPadding: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Text Align', 'blockenberg'),
                        value: a.textAlign,
                        options: [
                            { label: __('Left', 'blockenberg'), value: 'left' },
                            { label: __('Center', 'blockenberg'), value: 'center' },
                            { label: __('Right', 'blockenberg'), value: 'right' },
                        ],
                        onChange: function (v) { setAttributes({ textAlign: v }); }
                    })
                ),

                /* Labels panel */
                el(PanelBody, { title: __('Labels & Copy', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Name', 'blockenberg'), checked: a.showName, onChange: function (v) { setAttributes({ showName: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Hex', 'blockenberg'), checked: a.showHex, onChange: function (v) { setAttributes({ showHex: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show RGB', 'blockenberg'), checked: a.showRGB, onChange: function (v) { setAttributes({ showRGB: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show CSS Variable', 'blockenberg'), checked: a.showCssVar, onChange: function (v) { setAttributes({ showCssVar: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Copy Button', 'blockenberg'), checked: a.showCopyBtn, onChange: function (v) { setAttributes({ showCopyBtn: v }); }, __nextHasNoMarginBottom: true }),
                    a.showCopyBtn && el(SelectControl, {
                        label: __('Copy Format', 'blockenberg'),
                        value: a.copyFormat,
                        options: [
                            { label: __('HEX', 'blockenberg'), value: 'hex' },
                            { label: __('RGB', 'blockenberg'), value: 'rgb' },
                            { label: __('CSS Variable', 'blockenberg'), value: 'css' },
                        ],
                        onChange: function (v) { setAttributes({ copyFormat: v }); }
                    }),
                    ),

                /* Card style panel */
                el(PanelBody, { title: __('Card Style', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Shadow', 'blockenberg'), checked: a.showShadow, onChange: function (v) { setAttributes({ showShadow: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Border', 'blockenberg'), checked: a.showBorder, onChange: function (v) { setAttributes({ showBorder: v }); }, __nextHasNoMarginBottom: true })
                ),

                /* Title panel */
                el(PanelBody, { title: __('Section Title', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: a.showTitle, onChange: function (v) { setAttributes({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                    a.showTitle && el(Fragment, null,
                        el(TextControl, { label: __('Title text', 'blockenberg'), value: a.title, onChange: function (v) { setAttributes({ title: v }); } }),
                        el(RangeControl, { label: __('Title Size (px)', 'blockenberg'), value: a.titleSize, min: 14, max: 48, onChange: function (v) { setAttributes({ titleSize: v }); } })
                    )
                ),

                /* Colors */
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Card Background', 'blockenberg'), value: a.labelBg, onChange: function (v) { setAttributes({ labelBg: v || '#ffffff' }); } },
                        { label: __('Name Text', 'blockenberg'), value: a.labelTextColor, onChange: function (v) { setAttributes({ labelTextColor: v || '#1e1e1e' }); } },
                        { label: __('Meta Text (hex/rgb)', 'blockenberg'), value: a.labelMeta, onChange: function (v) { setAttributes({ labelMeta: v || '#6b7280' }); } },
                        { label: __('Border', 'blockenberg'), value: a.borderColor, onChange: function (v) { setAttributes({ borderColor: v || '#e5e7eb' }); } },
                        { label: __('Title', 'blockenberg'), value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#1e1e1e' }); } },
                    ]
                })
            ),

            /* ── editor preview ── */
            el('div', blockProps,
                a.showTitle && a.title && el('h3', { className: 'bkcp-title', style: { marginBottom: '16px', color: a.titleColor } }, a.title),
                el('div', { style: a.layout === 'grid' ? gridStyle : listStyle },
                    (a.colors || []).map(function (color, idx) {
                        return el(SwatchCard, { key: idx, attrs: a, color: color, index: idx });
                    })
                )
            )
        );
    }

    /* ── save ───────────────────────────────────────────────────────────────── */
    function Save(props) {
        var a = props.attributes;
        var bpStyle = {};
        Object.assign(bpStyle, _tv(a.typoTitle, '--bkbg-cp-tt'));
        Object.assign(bpStyle, _tv(a.typoLabel, '--bkbg-cp-lb'));
        var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkcp-wrap', style: bpStyle });

        var gridStyle = a.layout === 'grid'
            ? 'display:grid;grid-template-columns:repeat(' + a.columns + ',1fr);gap:' + a.gap + 'px;'
            : 'display:flex;flex-wrap:wrap;gap:' + a.gap + 'px;';

        return el('div', blockProps,
            a.showTitle && a.title && el('h3', {
                className: 'bkcp-title',
                style: { marginBottom: '16px', color: a.titleColor }
            }, a.title),
            el('div', {
                className: 'bkcp-grid',
                style: { display: a.layout === 'grid' ? 'grid' : 'flex', gridTemplateColumns: a.layout === 'grid' ? ('repeat(' + a.columns + ',1fr)') : undefined, flexWrap: a.layout === 'list' ? 'wrap' : undefined, gap: a.gap + 'px' }
            },
                (a.colors || []).map(function (c, idx) {
                    return el('div', {
                        key: idx,
                        className: 'bkcp-card',
                        style: {
                            borderRadius: a.borderRadius + 'px',
                            overflow: 'hidden',
                            background: a.labelBg,
                            boxShadow: a.showShadow ? '0 2px 12px rgba(0,0,0,0.1)' : 'none',
                            border: a.showBorder ? '1px solid ' + a.borderColor : 'none',
                        }
                    },
                        el('div', {
                            className: 'bkcp-swatch',
                            style: { background: c.hex, height: a.swatchHeight + 'px' }
                        }),
                        el('div', {
                            className: 'bkcp-label',
                            style: { padding: a.labelPadding + 'px', textAlign: a.textAlign }
                        },
                            a.showName && el('p', { className: 'bkcp-name', style: { margin: '0 0 2px', color: a.labelTextColor } }, c.name || ''),
                            a.showHex  && el('p', { className: 'bkcp-hex',  style: { margin: '0 0 2px', fontFamily: 'monospace', color: a.labelMeta } }, (c.hex || '').toUpperCase()),
                            a.showRGB  && el('p', { className: 'bkcp-rgb',  style: { margin: '0 0 2px', fontFamily: 'monospace', color: a.labelMeta }, 'data-hex': c.hex }, ''),
                            a.showCssVar && c.cssVar && el('p', { className: 'bkcp-cssvar', style: { margin: '0', fontFamily: 'monospace', color: a.labelMeta } }, c.cssVar),
                            a.showCopyBtn && el('button', {
                                className: 'bkcp-copy',
                                type: 'button',
                                'data-hex': c.hex,
                                'data-rgb': '',
                                'data-cssvar': c.cssVar || '',
                                'data-format': a.copyFormat,
                            }, __('Copy', 'blockenberg'))
                        )
                    );
                })
            )
        );
    }

    registerBlockType('blockenberg/color-palette', {
        edit: Edit,
        save: Save,
    });
}() );
