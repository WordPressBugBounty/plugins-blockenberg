( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;
    var Button = wp.components.Button;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    /* ── Placeholder SVG ──────────────────────────────────────────────────── */
    var PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
        '<rect width="400" height="300" fill="#374151"/>' +
        '<text x="200" y="155" text-anchor="middle" fill="#9ca3af" font-size="16" font-family="sans-serif">Image</text>' +
        '</svg>'
    );

    /* ── text position helpers ───────────────────────────────────────────── */
    var posMap = {
        'bottom-left':   { justifyContent: 'flex-end', alignItems: 'flex-start' },
        'bottom-center': { justifyContent: 'flex-end', alignItems: 'center' },
        'bottom-right':  { justifyContent: 'flex-end', alignItems: 'flex-end' },
        'top-left':      { justifyContent: 'flex-start', alignItems: 'flex-start' },
        'center':        { justifyContent: 'center', alignItems: 'center' },
    };

    function getPosStyle(pos) {
        return posMap[pos] || posMap['bottom-left'];
    }

    function hexAlpha(hex, opacity) {
        var h = (hex || '#000000').replace('#', '');
        if (h.length === 3) { h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; }
        var r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + (opacity/100) + ')';
    }

    /* ── PanelEditor for a single panel ──────────────────────────────────── */
    function PanelEditor(props) {
        var panel = props.panel, idx = props.idx;
        var onUpdate = props.onUpdate, onRemove = props.onRemove;
        var expandState = useState(false);
        var isOpen = expandState[0], setIsOpen = expandState[1];

        return el('div', { style: { border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' } },
            el('div', {
                style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#f9fafb', cursor: 'pointer' },
                onClick: function () { setIsOpen(!isOpen); }
            },
                panel.imageUrl
                    ? el('img', { src: panel.imageUrl, style: { width: '40px', height: '28px', objectFit: 'cover', borderRadius: '3px' } })
                    : el('div', { style: { width: '40px', height: '28px', background: '#e5e7eb', borderRadius: '3px' } }),
                el('span', { style: { flex: 1, fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                    panel.title || ('Panel ' + (idx + 1))),
                el('span', { style: { fontSize: '11px', color: '#9ca3af' } }, isOpen ? '▲' : '▼'),
                el(Button, { isSmall: true, variant: 'tertiary', isDestructive: true, onClick: function (e) { e.stopPropagation(); onRemove(idx); } }, '×')
            ),
            isOpen && el('div', { style: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' } },
                el(MediaUploadCheck, null,
                    el(MediaUpload, {
                        onSelect: function (m) { onUpdate(idx, 'imageUrl', m.url); onUpdate(idx, 'imageId', m.id); onUpdate(idx, 'imageAlt', m.alt || ''); },
                        allowedTypes: ['image'],
                        value: panel.imageId,
                        render: function (ref) {
                            return el(Button, { variant: panel.imageUrl ? 'secondary' : 'primary', onClick: ref.open, isSmall: true, style: { width: '100%' } },
                                panel.imageUrl ? __('Replace Image', 'blockenberg') : __('Choose Image', 'blockenberg')
                            );
                        }
                    })
                ),
                el(TextControl, { label: __('Label', 'blockenberg'), value: panel.label, onChange: function (v) { onUpdate(idx, 'label', v); } }),
                el(TextControl, { label: __('Title', 'blockenberg'), value: panel.title, onChange: function (v) { onUpdate(idx, 'title', v); } }),
                el(TextControl, { label: __('Subtitle', 'blockenberg'), value: panel.subtitle, onChange: function (v) { onUpdate(idx, 'subtitle', v); } })
            )
        );
    }

    /* ── render a single panel div ────────────────────────────────────────── */
    function renderPanel(panel, idx, a, isActive, isEdit) {
        var posStyle = getPosStyle(a.textPosition);
        var overlayBg = hexAlpha(a.overlayColor, isActive ? a.overlayHoverOpacity : a.overlayOpacity);
        var textAlign = a.textPosition.includes('right') ? 'right' : a.textPosition.includes('center') ? 'center' : 'left';
        var showText = a.textVisibility === 'always' || (a.textVisibility === 'expanded' && isActive) || (a.textVisibility === 'collapsed' && !isActive);

        return el('div', {
            key: idx,
            className: 'bkia-panel' + (isActive ? ' bkia-active' : ''),
            'data-index': idx,
            style: {
                flex: isActive ? a.expandedFlex : a.collapsedFlex,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: a.borderRadius + 'px',
                cursor: isEdit ? 'default' : 'pointer',
                background: panel.imageUrl ? 'none' : a.bgFallbackColor,
                transition: 'flex ' + a.transitionDuration + 'ms ' + a.transitionEasing,
            }
        },
            /* background image */
            panel.imageUrl && el('img', {
                className: 'bkia-img',
                src: panel.imageUrl,
                alt: panel.imageAlt || panel.title,
                style: {
                    position: 'absolute', inset: '0', width: '100%', height: '100%',
                    objectFit: 'cover',
                    transition: a.scaleOnHover ? 'transform ' + a.transitionDuration + 'ms ' + a.transitionEasing : 'none',
                    transform: isActive && a.scaleOnHover ? 'scale(1.05)' : 'scale(1)',
                }
            }),
            !panel.imageUrl && el('div', {
                style: { position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '12px' }
            }, 'Panel ' + (idx + 1)),
            /* overlay */
            el('div', {
                className: 'bkia-overlay',
                style: { position: 'absolute', inset: '0', background: overlayBg, transition: 'background ' + a.transitionDuration + 'ms ease', zIndex: 1 }
            }),
            /* text */
            el('div', {
                className: 'bkia-text',
                style: {
                    position: 'absolute', inset: '0', zIndex: 2,
                    display: 'flex', flexDirection: 'column',
                    padding: '20px',
                    justifyContent: posStyle.justifyContent,
                    alignItems: posStyle.alignItems,
                    textAlign: textAlign,
                    opacity: showText ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                }
            },
                a.showLabel && panel.label && el('span', {
                    className: 'bkia-label',
                    style: {
                        display: 'inline-block', color: a.labelColor,
                        background: a.labelBg, borderRadius: '4px', padding: '2px 8px',
                        marginBottom: '6px',
                    }
                }, panel.label),
                a.showTitle && panel.title && el('p', {
                    className: 'bkia-title',
                    style: { margin: '0 0 4px', color: a.titleColor }
                }, panel.title),
                a.showSubtitle && panel.subtitle && el('p', {
                    className: 'bkia-subtitle',
                    style: { margin: '0', color: a.subtitleColor }
                }, panel.subtitle),
                a.showArrow && el('span', { className: 'bkia-arrow', style: { marginTop: '10px', color: a.titleColor, fontSize: '20px' } }, '→')
            )
        );
    }

    /* ── colour-swatch + popover ─────────────────────────────── */
    function BkbgColorSwatch(p) {
        var st  = useState(false);
        var open = st[0], setOpen = st[1];
        return el('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 0', gap:'8px' } },
            el('span', { style:{ fontSize:'12px', color:'#1e1e1e', flex:1, lineHeight:1.4 } }, p.label),
            el('div', { style:{ position:'relative', flexShrink:0 } },
                el('button', {
                    type:'button', title: p.value || 'none',
                    onClick: function(){ setOpen(!open); },
                    style:{ width:'28px', height:'28px', borderRadius:'4px',
                        border: open ? '2px solid #007cba' : '2px solid #ddd',
                        cursor:'pointer', padding:0, display:'block',
                        background: p.value || '#ffffff', flexShrink:0 }
                }),
                open && el(Popover, { position:'bottom left', onClose:function(){ setOpen(false); } },
                    el('div', { style:{ padding:'8px' }, onMouseDown:function(e){ e.stopPropagation(); } },
                        el('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' } },
                            el('strong', { style:{ fontSize:'12px' } }, p.label),
                            el(Button, { icon:'no-alt', isSmall:true, onClick:function(){ setOpen(false); } })
                        ),
                        el(ColorPicker, { color: p.value, enableAlpha:true, onChange: p.onChange })
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/image-accordion', {
        title: __('Image Accordion', 'blockenberg'),
        icon: 'images-alt2',
        category: 'bkbg-media',
        description: __('Expandable image panels that expand on hover or click.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            var activeState = useState(a.defaultOpen);
            var active = activeState[0], setActive = activeState[1];

            function updatePanel(idx, key, val) {
                var arr = a.panels.slice();
                arr[idx] = Object.assign({}, arr[idx]);
                arr[idx][key] = val;
                setAttributes({ panels: arr });
            }
            function addPanel() {
                var n = a.panels.length + 1;
                setAttributes({ panels: a.panels.concat([{ imageUrl: '', imageId: 0, imageAlt: '', title: 'Panel ' + n, subtitle: 'Subtitle here', label: String(n).padStart(2,'0') }]) });
            }
            function removePanel(idx) {
                setAttributes({ panels: a.panels.filter(function (_, i) { return i !== idx; }) });
            }

            var triggerOptions = [
                { label: __('Hover', 'blockenberg'), value: 'hover' },
                { label: __('Click', 'blockenberg'), value: 'click' },
            ];
            var directionOptions = [
                { label: __('Horizontal', 'blockenberg'), value: 'horizontal' },
                { label: __('Vertical',   'blockenberg'), value: 'vertical' },
            ];
            var easingOptions = [
                { label: 'ease',        value: 'ease' },
                { label: 'ease-in-out', value: 'ease-in-out' },
                { label: 'ease-out',    value: 'ease-out' },
                { label: 'linear',      value: 'linear' },
            ];
            var textPosOptions = [
                { label: __('Bottom Left',   'blockenberg'), value: 'bottom-left' },
                { label: __('Bottom Center', 'blockenberg'), value: 'bottom-center' },
                { label: __('Bottom Right',  'blockenberg'), value: 'bottom-right' },
                { label: __('Top Left',      'blockenberg'), value: 'top-left' },
                { label: __('Center',        'blockenberg'), value: 'center' },
            ];
            var textVisOptions = [
                { label: __('Always visible',         'blockenberg'), value: 'always' },
                { label: __('Visible when expanded',  'blockenberg'), value: 'expanded' },
                { label: __('Visible when collapsed', 'blockenberg'), value: 'collapsed' },
            ];
            var weightOptions = [
                { label: '400', value: 400 }, { label: '500', value: 500 },
                { label: '600', value: 600 }, { label: '700', value: 700 }, { label: '800', value: 800 },
            ];
            var defaultOpenOptions = a.panels.map(function (p, i) { return { label: (p.title || 'Panel ' + (i+1)), value: i }; });

            var blockProps = useBlockProps({ className: 'bkia-wrap', style: (function(){
                var s = {};
                if (a.titleSize) s['--bkia-title-sz'] = a.titleSize + 'px';
                if (a.subtitleSize) s['--bkia-subtitle-sz'] = a.subtitleSize + 'px';
                if (a.labelSize) s['--bkia-label-sz'] = a.labelSize + 'px';
                if (a.titleWeight) s['--bkia-title-w'] = String(a.titleWeight);
                var _tv2 = getTypoCssVars();
                if (_tv2) {
                    Object.assign(s, _tv2(a.titleTypo, '--bkia-tt-'));
                    Object.assign(s, _tv2(a.subtitleTypo, '--bkia-st-'));
                    Object.assign(s, _tv2(a.labelTypo, '--bkia-lb-'));
                }
                return s;
            })() });
            var isHorizontal = a.direction === 'horizontal';

            return el(Fragment, null,
                el(InspectorControls, null,

                    /* — Panels — */
                    el(PanelBody, { title: __('Panels', 'blockenberg') + ' (' + a.panels.length + ')', initialOpen: true },
                        a.panels.map(function (panel, idx) {
                            return el(PanelEditor, { key: idx, panel: panel, idx: idx, onUpdate: updatePanel, onRemove: removePanel });
                        }),
                        el(Button, { variant: 'primary', onClick: addPanel, style: { width: '100%', marginTop: '8px' } },
                            __('+ Add Panel', 'blockenberg'))
                    ),

                    /* — Behaviour — */
                    el(PanelBody, { title: __('Behaviour', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Trigger', 'blockenberg'), value: a.trigger, options: triggerOptions, onChange: function (v) { setAttributes({ trigger: v }); } }),
                        el(SelectControl, { label: __('Direction', 'blockenberg'), value: a.direction, options: directionOptions, onChange: function (v) { setAttributes({ direction: v }); } }),
                        el(SelectControl, { label: __('Default Open Panel', 'blockenberg'), value: a.defaultOpen, options: defaultOpenOptions, onChange: function (v) { setAttributes({ defaultOpen: parseInt(v,10) }); } }),
                        el(RangeControl, { label: __('Height (px)', 'blockenberg'), value: a.height, min: 200, max: 900, onChange: function (v) { setAttributes({ height: v }); } }),
                        el(RangeControl, { label: __('Expanded Flex', 'blockenberg'), value: a.expandedFlex, min: 2, max: 10, onChange: function (v) { setAttributes({ expandedFlex: v }); } }),
                        el(RangeControl, { label: __('Collapsed Flex', 'blockenberg'), value: a.collapsedFlex, min: 1, max: 4, onChange: function (v) { setAttributes({ collapsedFlex: v }); } }),
                        el(RangeControl, { label: __('Transition Duration (ms)', 'blockenberg'), value: a.transitionDuration, min: 100, max: 1200, step: 50, onChange: function (v) { setAttributes({ transitionDuration: v }); } }),
                        el(SelectControl, { label: __('Easing', 'blockenberg'), value: a.transitionEasing, options: easingOptions, onChange: function (v) { setAttributes({ transitionEasing: v }); } }),
                        el(ToggleControl, { label: __('Scale Image on Expand', 'blockenberg'), checked: a.scaleOnHover, onChange: function (v) { setAttributes({ scaleOnHover: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    /* — Text — */
                    el(PanelBody, { title: __('Text Content', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Label', 'blockenberg'), checked: a.showLabel, onChange: function (v) { setAttributes({ showLabel: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: a.showTitle, onChange: function (v) { setAttributes({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: a.showSubtitle, onChange: function (v) { setAttributes({ showSubtitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Arrow', 'blockenberg'), checked: a.showArrow, onChange: function (v) { setAttributes({ showArrow: v }); }, __nextHasNoMarginBottom: true }),
                        el(SelectControl, { label: __('Text Position', 'blockenberg'), value: a.textPosition, options: textPosOptions, onChange: function (v) { setAttributes({ textPosition: v }); } }),
                        el(SelectControl, { label: __('Text Visibility', 'blockenberg'), value: a.textVisibility, options: textVisOptions, onChange: function (v) { setAttributes({ textVisibility: v }); } })
                        ),

                    /* — Style — */
                    el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: a.gap, min: 0, max: 32, onChange: function (v) { setAttributes({ gap: v }); } }),
                        el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: a.borderRadius, min: 0, max: 40, onChange: function (v) { setAttributes({ borderRadius: v }); } }),
                        el(RangeControl, { label: __('Overlay Opacity (collapsed, %)', 'blockenberg'), value: a.overlayOpacity, min: 0, max: 100, onChange: function (v) { setAttributes({ overlayOpacity: v }); } }),
                        el(RangeControl, { label: __('Overlay Opacity (expanded, %)', 'blockenberg'), value: a.overlayHoverOpacity, min: 0, max: 100, onChange: function (v) { setAttributes({ overlayHoverOpacity: v }); } }),
                        el(BkbgColorSwatch, { label: __('Label Background', 'blockenberg'), value: a.labelBg, onChange: function (v) { setAttributes({ labelBg: v }); } })
                    ),

                    /* — Colors — */
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypographyControl() && el( getTypographyControl(), { label: __( 'Title', 'blockenberg' ), value: a.titleTypo || {}, onChange: function(v){ setAttributes({ titleTypo: v }); } }),
                        getTypographyControl() && el( getTypographyControl(), { label: __( 'Subtitle', 'blockenberg' ), value: a.subtitleTypo || {}, onChange: function(v){ setAttributes({ subtitleTypo: v }); } }),
                        getTypographyControl() && el( getTypographyControl(), { label: __( 'Label', 'blockenberg' ), value: a.labelTypo || {}, onChange: function(v){ setAttributes({ labelTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Overlay Color', 'blockenberg'), value: a.overlayColor, onChange: function (v) { setAttributes({ overlayColor: v || '#000000' }); } },
                            { label: __('Title Color', 'blockenberg'), value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#ffffff' }); } },
                            { label: __('Subtitle Color', 'blockenberg'), value: a.subtitleColor, onChange: function (v) { setAttributes({ subtitleColor: v || '#e5e7eb' }); } },
                            { label: __('Label Color', 'blockenberg'), value: a.labelColor, onChange: function (v) { setAttributes({ labelColor: v || '#ffffff' }); } },
                            { label: __('Background Fallback', 'blockenberg'), value: a.bgFallbackColor, onChange: function (v) { setAttributes({ bgFallbackColor: v || '#374151' }); } },
                        ]
                    })
                ),

                /* ── Canvas ─────────────────────────────────────────────────── */
                el('div', blockProps,
                    el('div', {
                        className: 'bkia-container',
                        style: {
                            display: 'flex',
                            flexDirection: isHorizontal ? 'row' : 'column',
                            height: a.height + 'px',
                            gap: a.gap + 'px',
                            overflow: 'hidden',
                        }
                    },
                        a.panels.map(function (panel, idx) {
                            return renderPanel(panel, idx, a, idx === active, true);
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkia-wrap', style: (function(){
                var s = {};
                if (a.titleSize) s['--bkia-title-sz'] = a.titleSize + 'px';
                if (a.subtitleSize) s['--bkia-subtitle-sz'] = a.subtitleSize + 'px';
                if (a.labelSize) s['--bkia-label-sz'] = a.labelSize + 'px';
                if (a.titleWeight) s['--bkia-title-w'] = String(a.titleWeight);
                var _tv2 = getTypoCssVars();
                if (_tv2) {
                    Object.assign(s, _tv2(a.titleTypo, '--bkia-tt-'));
                    Object.assign(s, _tv2(a.subtitleTypo, '--bkia-st-'));
                    Object.assign(s, _tv2(a.labelTypo, '--bkia-lb-'));
                }
                return s;
            })() });
            var isHorizontal = a.direction === 'horizontal';

            return el('div', blockProps,
                el('div', {
                    className: 'bkia-container',
                    'data-trigger':    a.trigger,
                    'data-default':    a.defaultOpen,
                    'data-direction':  a.direction,
                    'data-exp-flex':   a.expandedFlex,
                    'data-col-flex':   a.collapsedFlex,
                    'data-duration':   a.transitionDuration,
                    'data-easing':     a.transitionEasing,
                    'data-overlay':    a.overlayOpacity,
                    'data-ov-hover':   a.overlayHoverOpacity,
                    'data-ov-color':   a.overlayColor,
                    'data-scale':      a.scaleOnHover ? '1' : '0',
                    'data-text-vis':   a.textVisibility,
                    style: {
                        display: 'flex',
                        flexDirection: isHorizontal ? 'row' : 'column',
                        height: a.height + 'px',
                        gap: a.gap + 'px',
                        overflow: 'hidden',
                    }
                },
                    a.panels.map(function (panel, idx) {
                        return renderPanel(panel, idx, a, idx === a.defaultOpen, false);
                    })
                )
            );
        }
    });
}() );
