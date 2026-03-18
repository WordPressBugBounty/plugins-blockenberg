( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl   = wp.components.TextControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    var COLUMNS_OPTIONS = [
        { label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 },
    ];
    var CARD_STYLE_OPTIONS = [
        { label: __('Card (shadow)',  'blockenberg'), value: 'card' },
        { label: __('Bordered',      'blockenberg'), value: 'bordered' },
        { label: __('Flat / Ghost',  'blockenberg'), value: 'flat' },
    ];
    var HOVER_OPTIONS = [
        { label: __('Lift (shadow)', 'blockenberg'), value: 'lift' },
        { label: __('Glow',         'blockenberg'), value: 'glow' },
        { label: __('None',         'blockenberg'), value: 'none' },
    ];
    var ACCENT_BAR_POS_OPTIONS = [
        { label: __('Top',    'blockenberg'), value: 'top' },
        { label: __('Bottom', 'blockenberg'), value: 'bottom' },
        { label: __('Left',   'blockenberg'), value: 'left' },
        { label: __('None',   'blockenberg'), value: 'none' },
    ];
    var ICON_SHAPE_OPTIONS = [
        { label: __('Rounded',   'blockenberg'), value: 'rounded' },
        { label: __('Circle',    'blockenberg'), value: 'circle' },
        { label: __('Square',    'blockenberg'), value: 'square' },
    ];
    var CTA_STYLE_OPTIONS = [
        { label: __('Link arrow', 'blockenberg'), value: 'link' },
        { label: __('Button',     'blockenberg'), value: 'button' },
    ];

    function makeId() { return 'sk' + Math.random().toString(36).substr(2, 5); }

    var _tc, _tv;
    function getTC() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTV() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    function buildWrapStyle(a) {
        return {
            '--bkbg-sk-accent':         a.globalAccent,
            '--bkbg-sk-card-bg':        a.cardBg,
            '--bkbg-sk-card-border':    a.cardBorderColor,
            '--bkbg-sk-title-color':    a.titleColor,
            '--bkbg-sk-text-color':     a.textColor,
            '--bkbg-sk-hl-color':       a.highlightColor,
            '--bkbg-sk-hl-icon-color':  a.highlightIconColor,
            '--bkbg-sk-title-sz':       a.titleSize + 'px',
            '--bkbg-sk-text-sz':        a.textSize + 'px',
            '--bkbg-sk-hl-sz':          a.highlightSize + 'px',
            '--bkbg-sk-cta-sz':         a.ctaSize + 'px',
            '--bkbg-sk-icon-sz':        a.iconSize + 'px',
            '--bkbg-sk-icon-bg-sz':     a.iconBgSize + 'px',
            '--bkbg-sk-cols':           a.columns,
            '--bkbg-sk-gap':            a.gap + 'px',
            '--bkbg-sk-card-pad':       a.cardPadding + 'px',
            '--bkbg-sk-card-r':         a.cardRadius + 'px',
            '--bkbg-sk-bar-h':          a.accentBarHeight + 'px',
            '--bkbg-sk-cta-r':          a.ctaRadius + 'px',
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        };
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', title: value || 'default', onClick: function () { setOpenKey(isOpen ? null : key); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#cccccc' }
                }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Card preview ───────────────────────────────────────────────── */
    function ServiceCard(props) {
        var item    = props.item;
        var a       = props.a;
        var isEditor = props.isEditor;
        var onUpdate = props.onUpdate; /* fn(key, val) — editor only */
        var accent  = (a.useItemAccent && item.accentColor) ? item.accentColor : a.globalAccent;

        var borderVar  = a.cardStyle === 'card' ? 'none' : '1.5px solid ' + (a.cardBorderColor || '#e5e7eb');
        var shadowVar  = a.cardStyle === 'card' ? '0 4px 20px rgba(0,0,0,0.08)' : 'none';
        var bgVar      = a.cardBg || '#fff';

        var accentBarTop    = a.accentBarPosition === 'top'    ? { height: a.accentBarHeight + 'px', backgroundColor: accent, margin: '-' + a.cardPadding + 'px -' + a.cardPadding + 'px ' + (a.cardPadding / 2) + 'px', borderRadius: a.cardRadius + 'px ' + a.cardRadius + 'px 0 0' } : null;
        var accentBarBottom = a.accentBarPosition === 'bottom' ? { height: a.accentBarHeight + 'px', backgroundColor: accent, margin: (a.cardPadding / 2) + 'px -' + a.cardPadding + 'px -' + a.cardPadding + 'px', borderRadius: '0 0 ' + a.cardRadius + 'px ' + a.cardRadius + 'px' } : null;
        var accentBarLeft   = a.accentBarPosition === 'left'   ? { position: 'absolute', top: 0, left: 0, width: a.accentBarHeight + 'px', height: '100%', backgroundColor: accent, borderRadius: a.cardRadius + 'px 0 0 ' + a.cardRadius + 'px' } : null;

        var iconBgRadius = a.iconShape === 'circle' ? '50%' : (a.iconShape === 'rounded' ? '12px' : '4px');

        var cardStyle = { position: 'relative', background: bgVar, border: borderVar, boxShadow: shadowVar, borderRadius: a.cardRadius + 'px', padding: a.cardPadding + 'px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '16px' };

        var ctaStyle = a.ctaStyle === 'button'
            ? { display: 'inline-block', padding: '10px 22px', borderRadius: a.ctaRadius + 'px', background: accent, color: '#fff', fontWeight: 700, fontSize: a.ctaSize + 'px', textDecoration: 'none', cursor: 'pointer' }
            : { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: a.ctaSize + 'px', fontWeight: 700, color: accent, textDecoration: 'none', cursor: 'pointer' };

        return el('div', { className: 'bkbg-sk-card bkbg-sk-card--' + a.cardStyle + ' bkbg-sk-bar--' + a.accentBarPosition + ' bkbg-sk-hover--' + a.hoverEffect, style: cardStyle },
            accentBarLeft && el('div', { className: 'bkbg-sk-accent-bar bkbg-sk-accent-bar--left', style: accentBarLeft }),
            accentBarTop && el('div', { className: 'bkbg-sk-accent-bar bkbg-sk-accent-bar--top', style: accentBarTop }),

            /* Icon */
            el('div', { className: 'bkbg-sk-icon-wrap', style: { width: a.iconBgSize + 'px', height: a.iconBgSize + 'px', borderRadius: iconBgRadius, backgroundColor: accent + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: a.iconSize + 'px', flexShrink: 0 } },
                isEditor
                    ? el('span', { title: __('Edit in sidebar', 'blockenberg'), style: { cursor: 'default' } }, IP().buildEditorIcon(item.iconType || 'custom-char', item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor))
                    : el('span', null, IP().buildSaveIcon(item.iconType || 'custom-char', item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor))
            ),

            /* Title */
            isEditor
                ? el(RichText, { tagName: 'h3', className: 'bkbg-sk-title', value: item.title, onChange: function (v) { onUpdate('title', v); }, placeholder: __('Service title', 'blockenberg'), style: { color: a.titleColor, margin: 0 } })
                : el(RichText.Content, { tagName: 'h3', className: 'bkbg-sk-title', value: item.title }),

            /* Description */
            isEditor
                ? el(RichText, { tagName: 'p', className: 'bkbg-sk-text', value: item.text, onChange: function (v) { onUpdate('text', v); }, placeholder: __('Describe the service…', 'blockenberg'), style: { color: a.textColor, margin: 0 } })
                : el(RichText.Content, { tagName: 'p', className: 'bkbg-sk-text', value: item.text }),

            /* Highlights */
            a.showHighlights && item.highlights && item.highlights.length > 0 && el('ul', { className: 'bkbg-sk-highlights', style: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' } },
                item.highlights.map(function (hl, hi) {
                    return el('li', { key: hi, style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: a.highlightSize + 'px', color: a.highlightColor } },
                        el('span', { style: { color: accent, fontSize: (a.highlightSize + 2) + 'px', flexShrink: 0 } }, '✓'),
                        el('span', null, hl)
                    );
                })
            ),

            /* CTA */
            a.showCta && item.ctaLabel && el('div', { className: 'bkbg-sk-cta-wrap', style: { marginTop: 'auto', paddingTop: '8px' } },
                isEditor
                    ? el('span', { className: 'bkbg-sk-cta', style: ctaStyle }, item.ctaLabel, a.ctaStyle === 'link' && el('span', null, '→'))
                    : el('a', { href: item.ctaUrl || '#', className: 'bkbg-sk-cta', style: ctaStyle }, item.ctaLabel, a.ctaStyle === 'link' && el('span', null, '→'))
            ),

            accentBarBottom && el('div', { className: 'bkbg-sk-accent-bar bkbg-sk-accent-bar--bottom', style: accentBarBottom })
        );
    }

    registerBlockType('blockenberg/service-cards', {
        title: __('Service Cards', 'blockenberg'),
        icon: 'admin-multisite',
        category: 'bkbg-business',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var blockProps = useBlockProps((function () {
                var _tv = getTV();
                var s = buildWrapStyle(a);
                Object.assign(s, _tv(a.titleTypo, '--bksk-tt-'));
                Object.assign(s, _tv(a.textTypo, '--bksk-bt-'));
                return { style: s };
            })());

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateItem(id, key, val) {
                setAttributes({ items: a.items.map(function (item) { if (item.id !== id) return item; var u = Object.assign({}, item); u[key] = val; return u; }) });
            }

            var gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Columns (desktop)',  'blockenberg'), value: a.columns,        options: COLUMNS_OPTIONS, onChange: function (v) { setAttributes({ columns:        parseInt(v,10) }); } }),
                        el(SelectControl, { label: __('Columns (tablet)',   'blockenberg'), value: a.columnsTablet,  options: COLUMNS_OPTIONS, onChange: function (v) { setAttributes({ columnsTablet:  parseInt(v,10) }); } }),
                        el(SelectControl, { label: __('Columns (mobile)',   'blockenberg'), value: a.columnsMobile, options: COLUMNS_OPTIONS.slice(0,2), onChange: function (v) { setAttributes({ columnsMobile: parseInt(v,10) }); } }),
                        el(RangeControl,  { label: __('Gap (px)',           'blockenberg'), value: a.gap,           min: 8,  max: 64, onChange: function (v) { setAttributes({ gap:           v }); } })
                    ),
                    el(PanelBody, { title: __('Card Style', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Card style',    'blockenberg'), value: a.cardStyle,    options: CARD_STYLE_OPTIONS, onChange: function (v) { setAttributes({ cardStyle:    v }); } }),
                        el(SelectControl, { label: __('Hover effect',  'blockenberg'), value: a.hoverEffect,  options: HOVER_OPTIONS,     onChange: function (v) { setAttributes({ hoverEffect:  v }); } }),
                        el(RangeControl,  { label: __('Padding (px)',  'blockenberg'), value: a.cardPadding,  min: 12, max: 64, onChange: function (v) { setAttributes({ cardPadding:  v }); } }),
                        el(RangeControl,  { label: __('Radius (px)',   'blockenberg'), value: a.cardRadius,   min: 0,  max: 32, onChange: function (v) { setAttributes({ cardRadius:   v }); } })
                    ),
                    el(PanelBody, { title: __('Accent Bar', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Bar position',    'blockenberg'), value: a.accentBarPosition, options: ACCENT_BAR_POS_OPTIONS, onChange: function (v) { setAttributes({ accentBarPosition: v }); } }),
                        a.accentBarPosition !== 'none' && el(RangeControl, { label: __('Bar thickness (px)', 'blockenberg'), value: a.accentBarHeight, min: 2, max: 12, onChange: function (v) { setAttributes({ accentBarHeight: v }); } }),
                        el(ToggleControl, { label: __('Use per-card accent color', 'blockenberg'), checked: a.useItemAccent, onChange: function (v) { setAttributes({ useItemAccent: v }); }, __nextHasNoMarginBottom: true }),
                        !a.useItemAccent && renderColorControl('globalAccent', __('Global accent color', 'blockenberg'), a.globalAccent, function (v) { setAttributes({ globalAccent: v }); }, openColorKey, setOpenColorKey)
                    ),
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(ToggleControl,  { label: __('Show highlights',   'blockenberg'), checked: a.showHighlights, onChange: function (v) { setAttributes({ showHighlights: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl,  { label: __('Show CTA',          'blockenberg'), checked: a.showCta,        onChange: function (v) { setAttributes({ showCta:        v }); }, __nextHasNoMarginBottom: true }),
                        a.showCta && el(SelectControl, { label: __('CTA style', 'blockenberg'), value: a.ctaStyle, options: CTA_STYLE_OPTIONS, onChange: function (v) { setAttributes({ ctaStyle: v }); } }),
                        a.showCta && el(RangeControl,  { label: __('CTA button radius (px)', 'blockenberg'), value: a.ctaRadius, min: 0, max: 99, onChange: function (v) { setAttributes({ ctaRadius: v }); } }),
                        el(SelectControl,  { label: __('Icon shape',        'blockenberg'), value: a.iconShape,   options: ICON_SHAPE_OPTIONS, onChange: function (v) { setAttributes({ iconShape:   v }); } }),
                        el(RangeControl,   { label: __('Icon emoji (px)',   'blockenberg'), value: a.iconSize,    min: 20, max: 56, onChange: function (v) { setAttributes({ iconSize:    v }); } }),
                        el(RangeControl,   { label: __('Icon bg size (px)', 'blockenberg'), value: a.iconBgSize, min: 36, max: 100, onChange: function (v) { setAttributes({ iconBgSize: v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(getTC(), { label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                        el(getTC(), { label: __('Description', 'blockenberg'), value: a.textTypo, onChange: function (v) { setAttributes({ textTypo: v }); } }),
                        el(RangeControl, { label: __('Highlights (px)', 'blockenberg'), value: a.highlightSize, min: 11, max: 18, onChange: function (v) { setAttributes({ highlightSize: v }); } }),
                        el(RangeControl, { label: __('CTA text (px)',   'blockenberg'), value: a.ctaSize,       min: 12, max: 20, onChange: function (v) { setAttributes({ ctaSize:       v }); } })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('cardBg',           __('Card background',   'blockenberg'), 'cardBg'),
                        cc('cardBorderColor',  __('Card border',       'blockenberg'), 'cardBorderColor'),
                        cc('titleColor',       __('Title text',        'blockenberg'), 'titleColor'),
                        cc('textColor',        __('Description text',  'blockenberg'), 'textColor'),
                        cc('highlightColor',   __('Highlight text',    'blockenberg'), 'highlightColor'),
                        cc('highlightIconColor',__('Highlight icon',   'blockenberg'), 'highlightIconColor'),
                        cc('bgColor',          __('Section background','blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el(PanelBody, { title: __('Cards', 'blockenberg'), initialOpen: false },
                        a.items.map(function (item, ii) {
                            var accent = (a.useItemAccent && item.accentColor) ? item.accentColor : a.globalAccent;
                            return el(PanelBody, { key: item.id, title: (item.icon || '🔧') + ' ' + (item.title ? item.title.replace(/<[^>]+>/g,'').substring(0,20) : 'Card ' + (ii + 1)), initialOpen: false },
                                el(IP().IconPickerControl, IP().iconPickerProps(item, function (key, val) { updateItem(item.id, key, val); }, { label: __('Icon', 'blockenberg'), typeAttr: 'iconType', dashiconAttr: 'iconDashicon', imageUrlAttr: 'iconImageUrl' })),
                                a.useItemAccent && renderColorControl(item.id + '_accent', __('Card accent color', 'blockenberg'), item.accentColor, function (v) { updateItem(item.id, 'accentColor', v); }, openColorKey, setOpenColorKey),
                                el(TextControl, { label: __('CTA label', 'blockenberg'), value: item.ctaLabel, onChange: function (v) { updateItem(item.id, 'ctaLabel', v); } }),
                                el(TextControl, { label: __('CTA URL',   'blockenberg'), value: item.ctaUrl,   onChange: function (v) { updateItem(item.id, 'ctaUrl',   v); } }),
                                /* Highlights editor */
                                el('div', { style: { marginTop: '8px' } },
                                    el('p', { style: { fontSize: '12px', fontWeight: 600, margin: '0 0 6px' } }, __('Highlights', 'blockenberg')),
                                    (item.highlights || []).map(function (hl, hi) {
                                        return el('div', { key: hi, style: { display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' } },
                                            el(TextControl, { value: hl, onChange: function (v) { var newHls = item.highlights.slice(); newHls[hi] = v; updateItem(item.id, 'highlights', newHls); }, style: { flex: 1, margin: 0 }, hideLabelFromVision: true, label: '' }),
                                            el(Button, { onClick: function () { updateItem(item.id, 'highlights', item.highlights.filter(function (_, i) { return i !== hi; })); }, isDestructive: true, variant: 'tertiary', size: 'compact' }, '✕')
                                        );
                                    }),
                                    el(Button, { variant: 'secondary', size: 'compact', onClick: function () { updateItem(item.id, 'highlights', (item.highlights || []).concat(['New highlight'])); } }, __('+ Add highlight', 'blockenberg'))
                                ),
                                el(Button, { onClick: function () { setAttributes({ items: a.items.filter(function (it) { return it.id !== item.id; }) }); }, isDestructive: true, variant: 'tertiary', size: 'compact', style: { marginTop: '8px' } }, __('Remove card', 'blockenberg'))
                            );
                        }),
                        el(Button, { variant: 'primary', onClick: function () { setAttributes({ items: a.items.concat([{ id: makeId(), icon: '⭐', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', accentColor: '#6c3fb5', title: __('New Service', 'blockenberg'), text: '', highlights: [], ctaLabel: __('Learn more', 'blockenberg'), ctaUrl: '' }]) }); }, style: { marginTop: '8px' } }, __('+ Add Card', 'blockenberg'))
                    )
                ),

                el('div', blockProps,
                    el('div', { className: 'bkbg-sk-grid', style: gridStyle },
                        a.items.map(function (item) {
                            return el(ServiceCard, { key: item.id, item: item, a: a, isEditor: true, onUpdate: function (key, val) { updateItem(item.id, key, val); } });
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var _tv = window.bkbgTypoCssVars || function () { return {}; };
            var s = buildWrapStyle(a);
            Object.assign(s, _tv(a.titleTypo, '--bksk-tt-'));
            Object.assign(s, _tv(a.textTypo, '--bksk-bt-'));
            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-sk-wrapper', style: s, 'data-cols-tablet': a.columnsTablet, 'data-cols-mobile': a.columnsMobile }),
                el('div', { className: 'bkbg-sk-grid', style: { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' } },
                    a.items.map(function (item) {
                        return el(ServiceCard, { key: item.id, item: item, a: a, isEditor: false });
                    })
                )
            );
        },

        deprecated: [{
            attributes: Object.assign({}, wp.blocks.getBlockType('blockenberg/service-cards') ? wp.blocks.getBlockType('blockenberg/service-cards').attributes : {},
                {
                    titleFontWeight: { type: 'number', default: 700 },
                    textFontWeight: { type: 'number', default: 400 },
                    titleSize: { type: 'number', default: 20 },
                    textSize: { type: 'number', default: 15 },
                    highlightSize: { type: 'number', default: 13 },
                    ctaSize: { type: 'number', default: 14 }
                }
            ),
            save: function (props) {
                var a = props.attributes;
                return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-sk-wrapper', style: buildWrapStyle(a), 'data-cols-tablet': a.columnsTablet, 'data-cols-mobile': a.columnsMobile }),
                    el('div', { className: 'bkbg-sk-grid', style: { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' } },
                        a.items.map(function (item) {
                            return el(ServiceCard, { key: item.id, item: item, a: a, isEditor: false });
                        })
                    )
                );
            }
        }]
    });
}() );
