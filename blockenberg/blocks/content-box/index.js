( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;

    var _TC, _tv;
    Object.defineProperty(window, '_bkbgCBgetTC', { get: function () { return _TC || (_TC = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_bkbgCBgetTV', { get: function () { return _tv || (_tv = window.bkbgTypoCssVars); } });

    var _IP;
    function IP() { return _IP || (_IP = window.bkbgIconPicker); }

    var presets = {
        info:    { bg: '#eff6ff', border: '#3b82f6', title: '#1d4ed8', text: '#1e3a5f', badge: '#dbeafe', badgeColor: '#1d4ed8', icon: 'ℹ️', badge_default: 'Info' },
        warning: { bg: '#fffbeb', border: '#f59e0b', title: '#92400e', text: '#78350f', badge: '#fef3c7', badgeColor: '#92400e', icon: '⚠️', badge_default: 'Warning' },
        success: { bg: '#f0fdf4', border: '#22c55e', title: '#15803d', text: '#14532d', badge: '#dcfce7', badgeColor: '#15803d', icon: '✅', badge_default: 'Success' },
        tip:     { bg: '#fdf4ff', border: '#a855f7', title: '#7c3aed', text: '#5b21b6', badge: '#f3e8ff', badgeColor: '#7c3aed', icon: '💡', badge_default: 'Tip' },
        quote:   { bg: '#f8fafc', border: '#64748b', title: '#334155', text: '#475569', badge: '#e2e8f0', badgeColor: '#475569', icon: '❝',  badge_default: 'Quote' },
        custom:  { bg: '#f9fafb', border: '#d1d5db', title: '#111827', text: '#374151', badge: '#e5e7eb', badgeColor: '#374151', icon: '📌', badge_default: 'Note' }
    };

    function getColor(attr, key, fallback) {
        return attr[key] || fallback;
    }

    registerBlockType('blockenberg/content-box', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var TC = window._bkbgCBgetTC;
            var tv = window._bkbgCBgetTV || function () { return {}; };
            var blockProps = useBlockProps({ className: 'bkbg-cb-editor' });

            var p = presets[attr.variant] || presets.info;

            var bg         = getColor(attr, 'bgColor',     p.bg);
            var border     = getColor(attr, 'borderColor', p.border);
            var titleColor = getColor(attr, 'titleColor',  p.title);
            var textColor  = getColor(attr, 'textColor',   p.text);
            var badgeBg    = getColor(attr, 'badgeBg',     p.badge);
            var badgeColor = getColor(attr, 'badgeColor',  p.badgeColor);
            var iconColor  = getColor(attr, 'iconColor',   p.border);

            var borderStyle = {};
            if (attr.borderPosition === 'left')   borderStyle = { borderLeft:   attr.borderWidth + 'px solid ' + border };
            if (attr.borderPosition === 'top')    borderStyle = { borderTop:    attr.borderWidth + 'px solid ' + border };
            if (attr.borderPosition === 'all')    borderStyle = { border:       attr.borderWidth + 'px solid ' + border };
            if (attr.borderPosition === 'none')   borderStyle = {};

            var wrapStyle = Object.assign({
                background:    bg,
                borderRadius:  attr.borderRadius + 'px',
                padding:       attr.paddingV + 'px ' + attr.paddingH + 'px',
                display:       'flex',
                gap:           '16px',
                alignItems:    attr.iconLayout === 'left' ? 'flex-start' : 'flex-start',
                flexDirection: attr.iconLayout === 'top' ? 'column' : 'row',
                maxWidth:      attr.maxWidth > 0 ? attr.maxWidth + 'px' : '100%'
            }, borderStyle, tv(attr.typoTitle, '--bkcb-title-'), tv(attr.typoBody, '--bkcb-body-'));

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Style Variant', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Variant', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.variant,
                            options: [
                                { label: '🔵 Info',    value: 'info' },
                                { label: '🟡 Warning', value: 'warning' },
                                { label: '🟢 Success', value: 'success' },
                                { label: '🟣 Tip',     value: 'tip' },
                                { label: '⬜ Quote',   value: 'quote' },
                                { label: '⚙️ Custom',  value: 'custom' }
                            ],
                            onChange: function (v) {
                                var newP = presets[v] || presets.info;
                                setAttr({ variant: v, icon: newP.icon, iconType: 'custom-char', badge: newP.badge_default, bgColor: '', borderColor: '', titleColor: '', textColor: '', badgeBg: '', badgeColor: '', iconColor: '' });
                            }
                        })
                    ),
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Icon', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showIcon, onChange: function (v) { setAttr({ showIcon: v }); } }),
                        attr.showIcon && el('div', { style: { marginTop: '8px' } },
                            el(IP().IconPickerControl, IP().iconPickerProps(attr, setAttr))
                        ),
                        attr.showIcon && el(SelectControl, { label: __('Icon Position', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.iconLayout,
                            options: [{ label: 'Left', value: 'left' }, { label: 'Top', value: 'top' }],
                            onChange: function (v) { setAttr({ iconLayout: v }); } }),
                        el(ToggleControl, { label: __('Show Badge', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showBadge, onChange: function (v) { setAttr({ showBadge: v }); } }),
                        attr.showBadge && el(TextControl, { label: __('Badge Text', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.badge, onChange: function (v) { setAttr({ badge: v }); } }),
                        el(ToggleControl, { label: __('Show Title', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showTitle, onChange: function (v) { setAttr({ showTitle: v }); } })
                    ),
                    el(PanelBody, { title: __('Border & Shape', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Border Side', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.borderPosition,
                            options: [{ label: 'Left', value: 'left' }, { label: 'Top', value: 'top' }, { label: 'All sides', value: 'all' }, { label: 'None', value: 'none' }],
                            onChange: function (v) { setAttr({ borderPosition: v }); } }),
                        el(RangeControl, { label: __('Border Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.borderWidth, min: 1, max: 12, onChange: function (v) { setAttr({ borderWidth: v }); } }),
                        el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.borderRadius, min: 0, max: 32, onChange: function (v) { setAttr({ borderRadius: v }); } }),
                        el(RangeControl, { label: __('Padding Top/Bottom (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingV, min: 8, max: 64, onChange: function (v) { setAttr({ paddingV: v }); } }),
                        el(RangeControl, { label: __('Padding Left/Right (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingH, min: 8, max: 64, onChange: function (v) { setAttr({ paddingH: v }); } }),
                        el(RangeControl, { label: __('Max Width (0 = full)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.maxWidth, min: 0, max: 1200, step: 10, onChange: function (v) { setAttr({ maxWidth: v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Icon Size (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.iconSize, min: 14, max: 60, onChange: function (v) { setAttr({ iconSize: v }); } }),
                        TC && el(TC, { label: __('Title', 'blockenberg'), value: attr.typoTitle, onChange: function (v) { setAttr({ typoTitle: v }); } }),
                        TC && el(TC, { label: __('Body', 'blockenberg'), value: attr.typoBody, onChange: function (v) { setAttr({ typoBody: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: __('Custom Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: attr.bgColor,     onChange: function (v) { setAttr({ bgColor: v || '' }); },     label: __('Box Background', 'blockenberg') },
                            { value: attr.borderColor, onChange: function (v) { setAttr({ borderColor: v || '' }); }, label: __('Border Color', 'blockenberg') },
                            { value: attr.titleColor,  onChange: function (v) { setAttr({ titleColor: v || '' }); },  label: __('Title Color', 'blockenberg') },
                            { value: attr.textColor,   onChange: function (v) { setAttr({ textColor: v || '' }); },   label: __('Body Text Color', 'blockenberg') },
                            { value: attr.badgeBg,     onChange: function (v) { setAttr({ badgeBg: v || '' }); },     label: __('Badge Background', 'blockenberg') },
                            { value: attr.badgeColor,  onChange: function (v) { setAttr({ badgeColor: v || '' }); },  label: __('Badge Text', 'blockenberg') },
                            { value: attr.iconColor,   onChange: function (v) { setAttr({ iconColor: v || '' }); },   label: __('Icon Color', 'blockenberg') }
                        ]
                    })
                ),
                el('div', blockProps,
                    el('div', { style: wrapStyle },
                        attr.showIcon && el('div', { style: { fontSize: attr.iconSize + 'px', color: iconColor, lineHeight: 1, flexShrink: 0, marginTop: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' } },
                            IP().buildEditorIcon(attr.iconType, attr.icon, attr.iconDashicon, attr.iconImageUrl, { dashiconColor: attr.iconDashiconColor, style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, fontSize: 'inherit' } })
                        ),
                        el('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, flex: 1 } },
                            el('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
                                attr.showBadge && el('span', { style: { background: badgeBg, color: badgeColor, borderRadius: 4, padding: '2px 10px', fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' } }, attr.badge),
                                attr.showTitle && el(RichText, { tagName: 'strong', className: 'bkbg-cb-title', value: attr.title, onChange: function (v) { setAttr({ title: v }); }, style: { color: titleColor }, placeholder: __('Title…', 'blockenberg') })
                            ),
                            el(RichText, { tagName: 'div', className: 'bkbg-cb-text', value: attr.body, onChange: function (v) { setAttr({ body: v }); }, style: { color: textColor, margin: 0 }, placeholder: __('Box content…', 'blockenberg') })
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-content-box-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
