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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var LAYOUT_OPTIONS = [
        { label: __('Equal halves',    'blockenberg'), value: 'equal' },
        { label: __('60 / 40',         'blockenberg'), value: '60-40' },
        { label: __('40 / 60',         'blockenberg'), value: '40-60' },
    ];
    var DIVIDER_STYLE_OPTIONS = [
        { label: __('None',  'blockenberg'), value: 'none' },
        { label: __('Line',  'blockenberg'), value: 'line' },
        { label: __('Arrow', 'blockenberg'), value: 'arrow' },
    ];
    var TEXT_ALIGN_OPTIONS = [
        { label: __('Left',   'blockenberg'), value: 'left' },
        { label: __('Center', 'blockenberg'), value: 'center' },
        { label: __('Right',  'blockenberg'), value: 'right' },
    ];

    function makeId() { return 'sc' + Math.random().toString(36).substr(2, 5); }

    function buildWrapStyle(a) {
        var s = {
            '--bkbg-sct-wrap-r':    a.wrapRadius + 'px',
            '--bkbg-sct-btn-r':     a.btnRadius + 'px',
            '--bkbg-sct-badge-r':   a.badgeRadius + 'px',
            '--bkbg-sct-headline-sz': a.headlineSize + 'px',
            '--bkbg-sct-desc-sz':   a.descSize + 'px',
            '--bkbg-sct-badge-sz':  a.badgeSize + 'px',
            '--bkbg-sct-btn-sz':    a.btnSize + 'px',
            '--bkbg-sct-min-h':     a.minHeight + 'px',
            '--bkbg-sct-pad':       a.panelPadding + 'px',
            '--bkbg-sct-div-color': a.dividerColor,
            '--bkbg-sct-hl-w':      a.headlineFontWeight || 700,
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
        };
        var tv = getTypoCssVars();
        if (tv) {
            Object.assign(s, tv(a.headlineTypo, '--bksct-hl-'));
            Object.assign(s, tv(a.descTypo, '--bksct-ds-'));
            Object.assign(s, tv(a.badgeTypo, '--bksct-bd-'));
            Object.assign(s, tv(a.btnTypo, '--bksct-bt-'));
        }
        return s;
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

    /* ── Single CTA panel ───────────────────────────────────────────── */
    function CtaPanel(props) {
        var panel = props.panel;
        var a     = props.a;
        var sa    = props.setAttributes;
        var isEditor = props.isEditor;

        function update(key, val) {
            if (!sa) return;
            sa({ panels: a.panels.map(function (p) { if (p.id !== panel.id) return p; var u = Object.assign({}, p); u[key] = val; return u; }) });
        }

        var panelStyle = {
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: a.textAlign === 'center' ? 'center' : (a.textAlign === 'right' ? 'flex-end' : 'flex-start'),
            justifyContent: 'center', textAlign: a.textAlign, padding: a.panelPadding + 'px', minHeight: a.minHeight + 'px',
            backgroundColor: panel.bgColor || '#f5f3ff', color: panel.textColor || '#1e1e1e',
        };
        var btnStyle = { display: 'inline-block', padding: '13px 32px', borderRadius: a.btnRadius + 'px', backgroundColor: panel.btnBg || '#6c3fb5', color: panel.btnColor || '#fff', cursor: 'pointer', border: 'none', marginTop: '18px' };
        var badgeStyle = { display: 'inline-block', padding: '4px 14px', borderRadius: a.badgeRadius + 'px', backgroundColor: panel.btnBg + '22', color: panel.btnBg, marginBottom: '14px' };

        if (isEditor) {
            return el('div', { className: 'bkbg-sct-panel', style: panelStyle },
                panel.showBadge && el('span', { className: 'bkbg-sct-badge', style: badgeStyle }, panel.badge || __('Free', 'blockenberg')),
                el(RichText, { tagName: 'h2', className: 'bkbg-sct-headline', value: panel.headline, onChange: function (v) { update('headline', v); }, placeholder: __('Headline…', 'blockenberg'), style: { color: panel.textColor, margin: '0 0 12px', textAlign: a.textAlign } }),
                el(RichText, { tagName: 'p',  className: 'bkbg-sct-desc',     value: panel.description, onChange: function (v) { update('description', v); }, placeholder: __('Short description…', 'blockenberg'), style: { color: panel.textColor, margin: '0', textAlign: a.textAlign } }),
                el('span', { className: 'bkbg-sct-btn', style: btnStyle }, panel.btnLabel || __('Get Started', 'blockenberg'))
            );
        }

        return el('div', { className: 'bkbg-sct-panel', style: panelStyle },
            panel.showBadge && el('span', { className: 'bkbg-sct-badge', style: badgeStyle }, panel.badge || ''),
            el(RichText.Content, { tagName: 'h2', className: 'bkbg-sct-headline', value: panel.headline, style: { color: panel.textColor } }),
            el(RichText.Content, { tagName: 'p',  className: 'bkbg-sct-desc',     value: panel.description, style: { color: panel.textColor } }),
            el('a', { href: panel.btnUrl || '#', className: 'bkbg-sct-btn', target: panel.btnNewTab ? '_blank' : undefined, rel: panel.btnNewTab ? 'noopener noreferrer' : undefined, style: btnStyle }, panel.btnLabel || '')
        );
    }

    /* ── Divider ────────────────────────────────────────────────────── */
    function Divider(props) {
        var a = props.a;
        if (!a.showDivider || a.dividerStyle === 'none') return null;
        if (a.dividerStyle === 'arrow') {
            return el('div', { className: 'bkbg-sct-divider bkbg-sct-div--arrow', style: { position: 'relative', width: '48px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: a.dividerColor || '#6c3fb5' } }, '→');
        }
        return el('div', { className: 'bkbg-sct-divider bkbg-sct-div--line', style: { width: '1px', flexShrink: 0, alignSelf: 'stretch', backgroundColor: a.dividerColor || '#ddd', margin: '24px 0' } });
    }

    registerBlockType('blockenberg/split-cta', {
        title: __('Split CTA', 'blockenberg'),
        icon: 'columns',
        category: 'bkbg-marketing',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function panelColorControl(panelId, key, label, value) {
                var ckKey = panelId + '_' + key;
                return renderColorControl(ckKey, label, value, function (val) {
                    setAttributes({ panels: a.panels.map(function (p) { if (p.id !== panelId) return p; var u = Object.assign({}, p); u[key] = val; return u; }) });
                }, openColorKey, setOpenColorKey);
            }

            var wrapFlex = { display: 'flex', flexDirection: 'row', borderRadius: a.wrapRadius + 'px', overflow: 'hidden' };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                        el(SelectControl,  { label: __('Panel sizes',    'blockenberg'), value: a.layout,       options: LAYOUT_OPTIONS,       onChange: function (v) { setAttributes({ layout:       v }); } }),
                        el(SelectControl,  { label: __('Text align',     'blockenberg'), value: a.textAlign,    options: TEXT_ALIGN_OPTIONS,    onChange: function (v) { setAttributes({ textAlign:    v }); } }),
                        el(SelectControl,  { label: __('Divider style',  'blockenberg'), value: a.dividerStyle, options: DIVIDER_STYLE_OPTIONS, onChange: function (v) { setAttributes({ dividerStyle: v }); } }),
                        a.dividerStyle !== 'none' && renderColorControl('dividerColor', __('Divider color', 'blockenberg'), a.dividerColor, function (v) { setAttributes({ dividerColor: v }); }, openColorKey, setOpenColorKey),
                        el(RangeControl,   { label: __('Min height (px)',    'blockenberg'), value: a.minHeight,    min: 160, max: 700, onChange: function (v) { setAttributes({ minHeight:    v }); } }),
                        el(RangeControl,   { label: __('Panel padding (px)', 'blockenberg'), value: a.panelPadding, min: 20,  max: 120, onChange: function (v) { setAttributes({ panelPadding: v }); } }),
                        el(RangeControl,   { label: __('Outer radius (px)',  'blockenberg'), value: a.wrapRadius,   min: 0,   max: 32,  onChange: function (v) { setAttributes({ wrapRadius:   v }); } }),
                        el(RangeControl,   { label: __('Button radius (px)',  'blockenberg'), value: a.btnRadius,   min: 0, max: 99, onChange: function (v) { setAttributes({ btnRadius:   v }); } }),
                        el(RangeControl,   { label: __('Badge radius (px)',   'blockenberg'), value: a.badgeRadius, min: 0, max: 99, onChange: function (v) { setAttributes({ badgeRadius: v }); } }),
                        el(ToggleControl,  { label: __('Stack on mobile',    'blockenberg'), checked: a.stackOnMobile, onChange: function (v) { setAttributes({ stackOnMobile: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl() ? el(getTypoControl(), { label: __('Headline Typography', 'blockenberg'), value: a.headlineTypo || {}, onChange: function (v) { setAttributes({ headlineTypo: v }); } }) : null,
                        getTypoControl() ? el(getTypoControl(), { label: __('Description Typography', 'blockenberg'), value: a.descTypo || {}, onChange: function (v) { setAttributes({ descTypo: v }); } }) : null,
                        getTypoControl() ? el(getTypoControl(), { label: __('Badge Typography', 'blockenberg'), value: a.badgeTypo || {}, onChange: function (v) { setAttributes({ badgeTypo: v }); } }) : null,
                        getTypoControl() ? el(getTypoControl(), { label: __('Button Typography', 'blockenberg'), value: a.btnTypo || {}, onChange: function (v) { setAttributes({ btnTypo: v }); } }) : null
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    a.panels.map(function (panel, pi) {
                        return el(PanelBody, { key: panel.id, title: __('Panel', 'blockenberg') + ' ' + (pi + 1) + ': ' + (panel.headline ? panel.headline.replace(/<[^>]+>/g,'').substring(0,24) : '…'), initialOpen: pi === 0 },
                            el(ToggleControl, { label: __('Show badge', 'blockenberg'), checked: panel.showBadge, onChange: function (v) { setAttributes({ panels: a.panels.map(function (p) { if (p.id !== panel.id) return p; return Object.assign({}, p, { showBadge: v }); }) }); }, __nextHasNoMarginBottom: true }),
                            panel.showBadge && el(TextControl, { label: __('Badge text', 'blockenberg'), value: panel.badge, onChange: function (v) { setAttributes({ panels: a.panels.map(function (p) { if (p.id !== panel.id) return p; return Object.assign({}, p, { badge: v }); }) }); } }),
                            el(TextControl, { label: __('Button label', 'blockenberg'), value: panel.btnLabel, onChange: function (v) { setAttributes({ panels: a.panels.map(function (p) { if (p.id !== panel.id) return p; return Object.assign({}, p, { btnLabel: v }); }) }); } }),
                            el(TextControl, { label: __('Button URL',   'blockenberg'), value: panel.btnUrl,   onChange: function (v) { setAttributes({ panels: a.panels.map(function (p) { if (p.id !== panel.id) return p; return Object.assign({}, p, { btnUrl: v }); }) }); } }),
                            el(ToggleControl, { label: __('Open link in new tab', 'blockenberg'), checked: panel.btnNewTab, onChange: function (v) { setAttributes({ panels: a.panels.map(function (p) { if (p.id !== panel.id) return p; return Object.assign({}, p, { btnNewTab: v }); }) }); }, __nextHasNoMarginBottom: true }),
                            panelColorControl(panel.id, 'bgColor',    __('Panel background', 'blockenberg'), panel.bgColor),
                            panelColorControl(panel.id, 'textColor',  __('Panel text',       'blockenberg'), panel.textColor),
                            panelColorControl(panel.id, 'btnBg',      __('Button background','blockenberg'), panel.btnBg),
                            panelColorControl(panel.id, 'btnColor',   __('Button text',      'blockenberg'), panel.btnColor)
                        );
                    })
                ),

                el('div', blockProps,
                    el('div', { className: 'bkbg-sct-wrapper bkbg-sct--' + a.layout, style: wrapFlex },
                        el(CtaPanel, { panel: a.panels[0], a: a, setAttributes: setAttributes, isEditor: true }),
                        el(Divider, { a: a }),
                        el(CtaPanel, { panel: a.panels[1], a: a, setAttributes: setAttributes, isEditor: true })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var wrapFlex = { display: 'flex', flexDirection: 'row', borderRadius: a.wrapRadius + 'px', overflow: 'hidden' };
            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-sct-section bkbg-sct--stack-' + (a.stackOnMobile ? 'yes' : 'no'), style: buildWrapStyle(a) }),
                el('div', { className: 'bkbg-sct-wrapper bkbg-sct--' + a.layout, style: wrapFlex },
                    el(CtaPanel, { panel: a.panels[0], a: a, isEditor: false }),
                    el(Divider, { a: a }),
                    el(CtaPanel, { panel: a.panels[1], a: a, isEditor: false })
                )
            );
        }
    });
}() );
