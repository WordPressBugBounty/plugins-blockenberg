( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
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
    var Fragment = wp.element.Fragment;
    var IP = function () { return window.bkbgIconPicker; };

    var _TC, _tv;
    Object.defineProperty(window, '_bkbgCMgetTC', { get: function () { return _TC || (_TC = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_bkbgCMgetTV', { get: function () { return _tv || (_tv = window.bkbgTypoCssVars); } });

    registerBlockType('blockenberg/content-menu', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var TC = window._bkbgCMgetTC;
            var tv = window._bkbgCMgetTV || function () { return {}; };
            var links = attr.links || [];

            var activeState = useState(0);
            var activeIdx = activeState[0];
            var setActiveIdx = activeState[1];

            function updateLink(idx, field, val) {
                var updated = links.map(function (lk, i) {
                    if (i !== idx) return lk;
                    var p = {}; p[field] = val;
                    return Object.assign({}, lk, p);
                });
                set({ links: updated });
            }

            function addLink() {
                set({ links: links.concat([{ label: 'New Section', anchor: 'section-' + (links.length + 1), icon: '📌', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '' }]) });
            }

            function removeLink(idx) {
                set({ links: links.filter(function (_, i) { return i !== idx; }) });
            }

            var isVertical = attr.position !== 'inline' || attr.menuStyle === 'list' || attr.menuStyle === 'dots';
            var isDots = attr.menuStyle === 'dots';

            /* Style helpers */
            function linkStyle(isActive) {
                var base = { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', textDecoration: 'none' };
                if (attr.menuStyle === 'pills') {
                    base.padding = '7px 16px';
                    base.borderRadius = attr.borderRadius + 'px';
                    base.background = isActive ? attr.activeBg : 'transparent';
                    base.color = isActive ? attr.activeColor : attr.linkColor;
                } else if (attr.menuStyle === 'list') {
                    base.padding = '9px 14px';
                    base.borderLeft = isActive ? ('3px solid ' + attr.accentColor) : '3px solid transparent';
                    base.color = isActive ? attr.accentColor : attr.linkColor;
                } else if (attr.menuStyle === 'tabs') {
                    base.padding = '9px 18px';
                    base.borderBottom = isActive ? ('2px solid ' + attr.accentColor) : '2px solid transparent';
                    base.color = isActive ? attr.accentColor : attr.linkColor;
                } else if (attr.menuStyle === 'dots') {
                    base.padding = '4px';
                    base.justifyContent = 'center';
                }
                return base;
            }

            /* Inspector */
            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Menu Settings', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Position', 'blockenberg'),
                        value: attr.position,
                        options: [
                            { label: 'Inline (inside content)', value: 'inline' },
                            { label: 'Fixed — Left', value: 'fixed-left' },
                            { label: 'Fixed — Right', value: 'fixed-right' }
                        ],
                        onChange: function (v) { set({ position: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'),
                        value: attr.menuStyle,
                        options: [
                            { label: 'Pills (rounded buttons)', value: 'pills' },
                            { label: 'List (left accent line)', value: 'list' },
                            { label: 'Tabs (underline)', value: 'tabs' },
                            { label: 'Dots (compact)', value: 'dots' }
                        ],
                        onChange: function (v) { set({ menuStyle: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, { label: __('Show Icons', 'blockenberg'), checked: attr.showIcons, onChange: function (v) { set({ showIcons: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Numbers', 'blockenberg'), checked: attr.showNumbers, onChange: function (v) { set({ showNumbers: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Smooth Scroll on Click', 'blockenberg'), checked: attr.animateScroll, onChange: function (v) { set({ animateScroll: v }); }, __nextHasNoMarginBottom: true }),
                    attr.position !== 'inline' && el(RangeControl, {
                        label: __('Vertical Position (vh %)', 'blockenberg'),
                        value: attr.fixedTop, min: 10, max: 90,
                        onChange: function (v) { set({ fixedTop: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    attr.position !== 'inline' && el(RangeControl, {
                        label: __('Edge Offset (px)', 'blockenberg'),
                        value: attr.fixedOffset, min: 8, max: 80,
                        onChange: function (v) { set({ fixedOffset: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Menu Width (px)', 'blockenberg'),
                        value: attr.menuWidth, min: 100, max: 320,
                        onChange: function (v) { set({ menuWidth: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: attr.borderRadius, min: 0, max: 24,
                        onChange: function (v) { set({ borderRadius: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: attr.paddingTop, min: 0, max: 200,
                        onChange: function (v) { set({ paddingTop: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: attr.paddingBottom, min: 0, max: 200,
                        onChange: function (v) { set({ paddingBottom: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                /* Links config */
                el(PanelBody, { title: __('Links', 'blockenberg'), initialOpen: true },
                    links.map(function (lk, idx) {
                        return el('div', { key: idx, style: { borderBottom: '1px solid #e5e7eb', marginBottom: '10px', paddingBottom: '10px' } },
                            el(TextControl, { label: __('Label', 'blockenberg'), value: lk.label, onChange: function (v) { updateLink(idx, 'label', v); }, __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Anchor ID (no #)', 'blockenberg'), value: lk.anchor, onChange: function (v) { updateLink(idx, 'anchor', v.replace('#', '')); }, placeholder: 'section-id', __nextHasNoMarginBottom: true }),
                            attr.showIcons && el(IP().IconPickerControl, {
                                iconType: lk.iconType, customChar: lk.icon, dashicon: lk.iconDashicon, imageUrl: lk.iconImageUrl,
                                onChangeType: function (v) { updateLink(idx, 'iconType', v); },
                                onChangeChar: function (v) { updateLink(idx, 'icon', v); },
                                onChangeDashicon: function (v) { updateLink(idx, 'iconDashicon', v); },
                                onChangeImageUrl: function (v) { updateLink(idx, 'iconImageUrl', v); }
                            }),
                            el(Button, { onClick: function () { removeLink(idx); }, variant: 'link', isDestructive: true, isSmall: true, style: { marginTop: '4px' } }, __('Remove', 'blockenberg'))
                        );
                    }),
                    el(Button, { onClick: addLink, variant: 'primary', isSmall: true }, __('+ Add Link', 'blockenberg'))
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); }, label: __('Menu Background', 'blockenberg') },
                        { value: attr.linkColor, onChange: function (v) { set({ linkColor: v || '#374151' }); }, label: __('Link Text', 'blockenberg') },
                        { value: attr.activeBg, onChange: function (v) { set({ activeBg: v || '#6366f1' }); }, label: __('Active Background', 'blockenberg') },
                        { value: attr.activeColor, onChange: function (v) { set({ activeColor: v || '#ffffff' }); }, label: __('Active Text', 'blockenberg') },
                        { value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#e5e7eb' }); }, label: __('Border', 'blockenberg') },
                        { value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#6366f1' }); }, label: __('Accent', 'blockenberg') }
                    ]
                }),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    TC && el(TC, { label: __('Link Text', 'blockenberg'), value: attr.typoLink, onChange: function (v) { set({ typoLink: v }); } })
                )
            );

            /* nav container style */
            var navStyle = Object.assign({
                background: attr.bgColor,
                border: '1px solid ' + attr.borderColor,
                borderRadius: attr.borderRadius + 'px',
                boxShadow: '0 2px 12px ' + attr.shadowColor,
                overflow: 'hidden',
                maxWidth: attr.menuWidth + 'px'
            }, tv(attr.typoLink, '--bkcm-link-'));

            return el(Fragment, {},
                inspector,
                el('div', useBlockProps({ style: { paddingTop: attr.paddingTop + 'px', paddingBottom: attr.paddingBottom + 'px' } }),
                    el('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' } },
                        attr.position !== 'inline' && el('div', { className: 'bkbg-cm-editor-note' },
                            '⚠️ ' + __('This menu will be FIXED on the page in the selected position. In the editor it is shown inline.', 'blockenberg')
                        ),
                        el('nav', { className: 'bkbg-cm-nav cm-' + attr.menuStyle, style: navStyle },
                            links.map(function (lk, idx) {
                                var isAct = idx === activeIdx;
                                if (attr.menuStyle === 'dots') {
                                    return el('div', {
                                        key: idx,
                                        className: 'bkbg-cm-dot',
                                        title: lk.label,
                                        onClick: function () { setActiveIdx(idx); },
                                        style: { width: isAct ? '22px' : '10px', height: '10px', borderRadius: '999px', background: isAct ? attr.activeBg : attr.borderColor, transition: 'all 0.2s', cursor: 'pointer' }
                                    });
                                }
                                return el('div', {
                                    key: idx,
                                    className: 'bkbg-cm-link' + (isAct ? ' active' : ''),
                                    onClick: function () { setActiveIdx(idx); },
                                    style: linkStyle(isAct)
                                },
                                    attr.showNumbers && el('span', { className: 'bkbg-cm-num' }, idx + 1 + '.'),
                                    attr.showIcons && lk.icon && el('span', { className: 'bkbg-cm-link-icon' },
                                        (lk.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(lk.iconType, lk.icon, lk.iconDashicon, lk.iconImageUrl, lk.iconDashiconColor) : lk.icon
                                    ),
                                    el('span', {}, lk.label)
                                );
                            })
                        )
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-cm-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
