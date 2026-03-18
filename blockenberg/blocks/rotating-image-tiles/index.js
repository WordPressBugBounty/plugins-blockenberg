( function () {
    var el                = wp.element.createElement;
    var __                = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var MediaUpload       = wp.blockEditor.MediaUpload;
    var MediaUploadCheck  = wp.blockEditor.MediaUploadCheck;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var Button            = wp.components.Button;
    var ColorPicker        = wp.components.ColorPicker;
    var Popover           = wp.components.Popover;
    var useState          = wp.element.useState;
    var Fragment          = wp.element.Fragment;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    function TilePreview(tile, a, flipped) {
        var face = flipped ? 'back' : 'front';
        var bg   = flipped ? tile.backBg : tile.frontBg;
        var url  = flipped ? tile.backUrl : tile.frontUrl;

        return el('div', {
            style: {
                width:        a.tileWidth + 'px',
                height:       a.tileHeight + 'px',
                borderRadius: a.tileRadius + 'px',
                background:   url ? 'url(' + url + ') center/cover no-repeat, ' + bg : bg,
                position:     'relative',
                overflow:     'hidden',
                flexShrink:   0
            }
        },
            a.showLabel && tile.label && el('div', {
                className: 'bkbg-rit-label',
                style: {
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '8px 12px',
                    background: a.labelBg || 'rgba(0,0,0,0.5)',
                    color: a.labelColor || '#ffffff',
                    textAlign: 'center'
                }
            }, tile.label)
        );
    }

    var BkbgColorSwatch = function (props) {
        var _st = useState(false); var isOpen = _st[0]; var setOpen = _st[1];
        return el(Fragment, {},
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                el('span', { style: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: '#1e1e1e' } }, props.label),
                el('button', {
                    type: 'button',
                    onClick: function () { setOpen(!isOpen); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #ccc', background: props.value || '#ffffff', cursor: 'pointer', padding: 0 }
                })
            ),
            isOpen && el(Popover, { onClose: function () { setOpen(false); } },
                el('div', { style: { padding: '8px' } },
                    el(ColorPicker, { color: props.value, onChangeComplete: function (c) { props.onChange(c.hex); }, enableAlpha: true })
                )
            )
        );
    };

    registerBlockType('blockenberg/rotating-image-tiles', {
        title:    __('Rotating Image Tiles'),
        icon:     'images-alt2',
        category: 'bkbg-effects',

        edit: function (props) {
            var attr    = props.attributes;
            var setAttr = props.setAttributes;
            var bp = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {};
                if (_tv) {
                    Object.assign(s, _tv(attr.labelTypo, '--bkrit-lt-'));
                }
                return { className: 'bkbg-rit-wrap', style: s };
            })());

            function updateTile(idx, field, val) {
                var tiles = attr.tiles.map(function (t, i) {
                    return i === idx ? Object.assign({}, t, { [field]: val }) : t;
                });
                setAttr({ tiles: tiles });
            }
            function addTile() {
                setAttr({ tiles: attr.tiles.concat([{
                    frontUrl: '', frontAlt: 'Front', backUrl: '', backAlt: 'Back',
                    frontBg: '#6366f1', backBg: '#a5b4fc', label: ''
                }]) });
            }
            function removeTile(idx) {
                if (attr.tiles.length <= 2) return;
                setAttr({ tiles: attr.tiles.filter(function (_, i) { return i !== idx; }) });
            }

            var inspector = el(InspectorControls, {},
                /* Tiles */
                el(PanelBody, { title: __('Tiles'), initialOpen: true },
                    attr.tiles.map(function (tile, idx) {
                        return el(PanelBody, { key: idx, title: 'Tile ' + (idx + 1), initialOpen: false },
                            /* Front image */
                            el('p', { style: { margin: '0 0 6px', fontWeight: 600 } }, __('Front Face')),
                            el(MediaUploadCheck, {},
                                el(MediaUpload, {
                                    onSelect: function (m) { updateTile(idx, 'frontUrl', m.url); },
                                    allowedTypes: ['image'], value: tile.frontUrl,
                                    render: function (ref) {
                                        return el(Button, { variant: tile.frontUrl ? 'secondary' : 'primary', onClick: ref.open },
                                            tile.frontUrl ? __('Change Front Image') : __('Choose Front Image'));
                                    }
                                })
                            ),
                            el(BkbgColorSwatch, { label: __('Front BG Color (fallback)'), value: tile.frontBg || '',
                                onChange: function (v) { updateTile(idx, 'frontBg', v); } }),
                            /* Back image */
                            el('p', { style: { margin: '8px 0 6px', fontWeight: 600 } }, __('Back Face')),
                            el(MediaUploadCheck, {},
                                el(MediaUpload, {
                                    onSelect: function (m) { updateTile(idx, 'backUrl', m.url); },
                                    allowedTypes: ['image'], value: tile.backUrl,
                                    render: function (ref) {
                                        return el(Button, { variant: tile.backUrl ? 'secondary' : 'primary', onClick: ref.open },
                                            tile.backUrl ? __('Change Back Image') : __('Choose Back Image'));
                                    }
                                })
                            ),
                            el(BkbgColorSwatch, { label: __('Back BG Color (fallback)'), value: tile.backBg || '',
                                onChange: function (v) { updateTile(idx, 'backBg', v); } }),
                            el(TextControl, { label: __('Label'), value: tile.label || '',
                                onChange: function (v) { updateTile(idx, 'label', v); },
                                __nextHasNoMarginBottom: true }),
                            attr.tiles.length > 2 && el(Button, {
                                isDestructive: true, variant: 'secondary',
                                onClick: function () { removeTile(idx); },
                                style: { marginTop: '8px' }
                            }, __('Remove Tile'))
                        );
                    }),
                    el(Button, { variant: 'primary', onClick: addTile,
                        style: { marginTop: '8px', width: '100%' }
                    }, __('+ Add Tile'))
                ),

                /* Layout */
                el(PanelBody, { title: __('Layout'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Columns'),
                        value: String(attr.columns),
                        options: ['2','3','4'].map(function (v) { return { label: v, value: v }; }),
                        onChange: function (v) { setAttr({ columns: Number(v) }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Tile Width (px)'), value: attr.tileWidth,
                        min: 120, max: 600,
                        onChange: function (v) { setAttr({ tileWidth: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Tile Height (px)'), value: attr.tileHeight,
                        min: 80, max: 500,
                        onChange: function (v) { setAttr({ tileHeight: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Tile Radius (px)'), value: attr.tileRadius,
                        min: 0, max: 40,
                        onChange: function (v) { setAttr({ tileRadius: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Gap (px)'), value: attr.gap,
                        min: 0, max: 40,
                        onChange: function (v) { setAttr({ gap: v }); },
                        __nextHasNoMarginBottom: true })
                ),

                /* Animation */
                el(PanelBody, { title: __('Animation'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Flip Axis'),
                        value: attr.flipAxis,
                        options: [
                            { label: __('Horizontal (Y)'), value: 'Y' },
                            { label: __('Vertical (X)'),   value: 'X' }
                        ],
                        onChange: function (v) { setAttr({ flipAxis: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, { label: __('Auto Flip'), checked: attr.autoFlip,
                        onChange: function (v) { setAttr({ autoFlip: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Flip on Hover'), checked: attr.flipOnHover,
                        onChange: function (v) { setAttr({ flipOnHover: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Flip Duration (ms)'), value: attr.flipDuration,
                        min: 200, max: 2000, step: 100,
                        onChange: function (v) { setAttr({ flipDuration: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Stagger Delay (ms)'), value: attr.staggerDelay,
                        min: 0, max: 1000, step: 50,
                        onChange: function (v) { setAttr({ staggerDelay: v }); },
                        __nextHasNoMarginBottom: true }),
                    attr.autoFlip && el(RangeControl, { label: __('Auto Interval (ms)'), value: attr.autoInterval,
                        min: 1000, max: 10000, step: 500,
                        onChange: function (v) { setAttr({ autoInterval: v }); },
                        __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Label'), checked: attr.showLabel,
                        onChange: function (v) { setAttr({ showLabel: v }); },
                        __nextHasNoMarginBottom: true }),
                    ),

                /* Colors */
                
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), {
                        label: __('Label Typography', 'blockenberg'),
                        value: attr.labelTypo || {},
                        onChange: function (v) { setAttr({ labelTypo: v }); }
                    })
                ),
el(PanelColorSettings, {
                    title: __('Colors'), initialOpen: false,
                    colorSettings: [
                        { label: __('Label Text'), value: attr.labelColor,
                          onChange: function (v) { setAttr({ labelColor: v || '#ffffff' }); } },
                        { label: __('Label BG'), value: attr.labelBg,
                          onChange: function (v) { setAttr({ labelBg: v || 'rgba(0,0,0,0.5)' }); } }
                    ]
                })
            );

            return el(wp.element.Fragment, {}, inspector,
                el('div', bp,
                    el('div', {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(' + attr.columns + ', 1fr)',
                            gap: attr.gap + 'px'
                        }
                    },
                        attr.tiles.map(function (tile, i) {
                            return el('div', { key: i }, TilePreview(tile, attr, false));
                        })
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var bp   = useBlockProps.save();
            return el('div', bp,
                el('div', { className: 'bkbg-rit-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
