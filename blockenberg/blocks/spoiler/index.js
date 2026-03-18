( function () {
    var el                = wp.element.createElement;
    var useState          = wp.element.useState;
    var Fragment          = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __                = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    function buildWrapStyle(a) {
        var s = {
            '--bksp-lb-sz': (a.labelSize || 16) + 'px',
            '--bksp-lb-w':  a.labelFontWeight || '700',
            '--bksp-lb-lh': String(a.labelLineHeight || 1.4),
            '--bksp-ct-sz': (a.contentSize || 16) + 'px',
            '--bksp-ct-w':  a.contentFontWeight || '400',
            '--bksp-ct-lh': String(a.contentLineHeight || 1.7),
        };
        var fn = getTypoCssVars();
        if (fn) {
            Object.assign(s, fn(a.labelTypo, '--bksp-lb'));
            Object.assign(s, fn(a.contentTypo, '--bksp-ct'));
        }
        return s;
    }

    var SPOILER_TYPES = [
        { label: 'Warning (amber)',  value: 'warning'  },
        { label: 'Info (blue)',      value: 'info'     },
        { label: 'Danger (red)',     value: 'danger'   },
        { label: 'Success (green)',  value: 'success'  },
        { label: 'Neutral (gray)',   value: 'neutral'  },
        { label: 'Custom colors',   value: 'custom'   },
    ];

    var TYPE_DEFAULTS = {
        warning: { accent:'#f59e0b', labelBg:'#fffbeb', labelColor:'#92400e', border:'#f59e0b', btn:'#f59e0b', btnTxt:'#ffffff' },
        info:    { accent:'#3b82f6', labelBg:'#eff6ff', labelColor:'#1e40af', border:'#3b82f6', btn:'#3b82f6', btnTxt:'#ffffff' },
        danger:  { accent:'#ef4444', labelBg:'#fef2f2', labelColor:'#991b1b', border:'#ef4444', btn:'#ef4444', btnTxt:'#ffffff' },
        success: { accent:'#10b981', labelBg:'#f0fdf4', labelColor:'#065f46', border:'#10b981', btn:'#10b981', btnTxt:'#ffffff' },
        neutral: { accent:'#6b7280', labelBg:'#f9fafb', labelColor:'#374151', border:'#d1d5db', btn:'#6b7280', btnTxt:'#ffffff' },
        custom:  { accent:'#6c3fb5', labelBg:'#f5f3ff', labelColor:'#4c1d95', border:'#6c3fb5', btn:'#6c3fb5', btnTxt:'#ffffff' },
    };

    function getColors(a) {
        if (a.spoilerType !== 'custom') {
            var d = TYPE_DEFAULTS[a.spoilerType] || TYPE_DEFAULTS.warning;
            return { accent: d.accent, labelBg: d.labelBg, labelColor: d.labelColor, border: d.border, btn: d.btn, btnColor: d.btnTxt };
        }
        return { accent: a.accentColor, labelBg: a.labelBg, labelColor: a.labelColor, border: a.borderColor, btn: a.btnBg, btnColor: a.btnColor };
    }

    function SpoilerPreview(props) {
        var a        = props.attributes;
        var setAttr  = props.setAttributes;
        var c        = getColors(a);
        var open     = a.startOpen;

        var cRadius  = (a.cardRadius || 12) + 'px';
        var bRadius  = (a.btnRadius  || 8)  + 'px';
        var pV       = (a.paddingV   || 20) + 'px';
        var pH       = (a.paddingH   || 24) + 'px';
        var maxW     = (a.maxWidth   || 720) + 'px';

        /* Header bar */
        var header = el('div', {
            className: 'bkbg-sp-header',
            style: {
                background: c.labelBg,
                borderBottom: open ? '1px solid ' + c.border : 'none',
                padding: pV + ' ' + pH,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                cursor: 'default',
            },
        },
            el('div', { style: { display:'flex', alignItems:'center', gap:'10px' } },
                el('span', {
                    className: 'bkbg-sp-label',
                    style: { color: c.labelColor },
                    contentEditable: true,
                    suppressContentEditableWarning: true,
                    onBlur: function (e) { setAttr({ label: e.target.innerText.trim() }); },
                    dangerouslySetInnerHTML: { __html: a.label },
                }),
                a.showSubLabel && el('span', {
                    style: { color: c.labelColor, opacity: 0.7, fontSize: '13px', fontStyle: 'italic' },
                    contentEditable: true,
                    suppressContentEditableWarning: true,
                    onBlur: function (e) { setAttr({ subLabel: e.target.innerText.trim() }); },
                    dangerouslySetInnerHTML: { __html: a.subLabel },
                })
            ),
            el('span', {
                className: 'bkbg-sp-icon',
                style: { color: c.labelColor, fontSize: '13px', opacity: 0.7 },
            }, a.showIcon ? (function() { var _t = open ? (a.iconOpenType || 'custom-char') : (a.iconClosedType || 'custom-char'); return _t !== 'custom-char' ? IP().buildEditorIcon(_t, open ? a.iconOpen : a.iconClosed, open ? a.iconOpenDashicon : a.iconClosedDashicon, open ? a.iconOpenImageUrl : a.iconClosedImageUrl, open ? a.iconOpenDashiconColor : a.iconClosedDashiconColor) : (open ? a.iconOpen : a.iconClosed); })() : null)
        );

        /* Hidden content */
        var content = open
            ? el('div', { className: 'bkbg-sp-content', style: { padding: pV + ' ' + pH, background: a.contentBg || '#ffffff' } },
                el('div', {
                    className: 'bkbg-sp-text',
                    style: { color: a.contentColor || '#374151' },
                    contentEditable: true,
                    suppressContentEditableWarning: true,
                    onBlur: function (e) { setAttr({ content: e.target.innerHTML }); },
                    dangerouslySetInnerHTML: { __html: a.content },
                })
              )
            : el('div', {
                className: 'bkbg-sp-reveal-wrap',
                style: { padding: pV + ' ' + pH, background: a.contentBg || '#ffffff', textAlign: 'center' },
              },
                el('button', {
                    className: 'bkbg-sp-btn',
                    style: { background: c.btn, color: c.btnColor, borderRadius: bRadius, padding: '10px 28px', border: 'none', fontWeight: 600, fontSize: '15px', cursor: 'pointer' },
                }, a.showIcon ? ((a.iconClosedType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(a.iconClosedType, a.iconClosed, a.iconClosedDashicon, a.iconClosedImageUrl, a.iconClosedDashiconColor) : a.iconClosed) : null, a.showIcon ? ' ' : null, a.revealBtnText)
              );

        return el(Fragment, null,
            el('div', {
                className: 'bkbg-sp-wrap',
                style: {
                    maxWidth: maxW,
                    margin: '0 auto',
                    border: '2px solid ' + c.border,
                    borderRadius: cRadius,
                    overflow: 'hidden',
                },
            },
                header,
                content
            ),
            el('p', { style: { textAlign: 'center', color: '#6b7280', fontSize: '12px', marginTop: '6px' } },
                '[ Editor preview — toggle "Start open" in settings to see the other state ]'
            )
        );
    }

    registerBlockType('blockenberg/spoiler', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-spoiler-block', style: buildWrapStyle(a) });

            var customColorPanels = a.spoilerType === 'custom'
                ? el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false, colorSettings: [
                        { label: 'Header Background', value: a.labelBg,      onChange: function (v) { setAttr({ labelBg: v }); } },
                        { label: 'Header Text',       value: a.labelColor,   onChange: function (v) { setAttr({ labelColor: v }); } },
                        { label: 'Border',            value: a.borderColor,  onChange: function (v) { setAttr({ borderColor: v }); } },
                        { label: 'Button Background', value: a.btnBg,        onChange: function (v) { setAttr({ btnBg: v }); } },
                        { label: 'Button Text',       value: a.btnColor,     onChange: function (v) { setAttr({ btnColor: v }); } },
                        { label: 'Content Background',value: a.contentBg,    onChange: function (v) { setAttr({ contentBg: v }); } },
                        { label: 'Content Text',      value: a.contentColor, onChange: function (v) { setAttr({ contentColor: v }); } },
                    ],
                  })
                : null;

            return el('div', blockProps,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(TextControl, { label: 'Header Label', value: a.label, onChange: function (v) { setAttr({ label: v }); } }),
                        el(ToggleControl, { label: 'Show Sub-label', checked: a.showSubLabel, onChange: function (v) { setAttr({ showSubLabel: v }); }, __nextHasNoMarginBottom: true }),
                        a.showSubLabel && el(TextControl, { label: 'Sub-label text', value: a.subLabel, onChange: function (v) { setAttr({ subLabel: v }); } }),
                        el(TextControl, { label: 'Reveal button text', value: a.revealBtnText, onChange: function (v) { setAttr({ revealBtnText: v }); } }),
                        el(TextControl, { label: 'Hide button text',   value: a.hideBtnText,   onChange: function (v) { setAttr({ hideBtnText: v }); } }),
                    ),
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: 'Spoiler type (preset colors)', value: a.spoilerType, options: SPOILER_TYPES, onChange: function (v) { setAttr({ spoilerType: v }); } }),
                        el(ToggleControl, { label: 'Show icon', checked: a.showIcon, onChange: function (v) { setAttr({ showIcon: v }); }, __nextHasNoMarginBottom: true }),
                        a.showIcon && el(IP().IconPickerControl, IP().iconPickerProps(a, setAttr, { charAttr: 'iconClosed', typeAttr: 'iconClosedType', dashiconAttr: 'iconClosedDashicon', imageUrlAttr: 'iconClosedImageUrl', colorAttr: 'iconClosedDashiconColor' })),
                        a.showIcon && el(IP().IconPickerControl, IP().iconPickerProps(a, setAttr, { charAttr: 'iconOpen', typeAttr: 'iconOpenType', dashiconAttr: 'iconOpenDashicon', imageUrlAttr: 'iconOpenImageUrl', colorAttr: 'iconOpenDashiconColor' })),
                        el(ToggleControl, { label: '☛ Start open in editor', checked: a.startOpen, onChange: function (v) { setAttr({ startOpen: v }); }, __nextHasNoMarginBottom: true }),
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl() ? el(getTypoControl(), { label:__('Label','blockenberg'), value:a.labelTypo, onChange:function(v){ setAttr({labelTypo:v}); } }) : null,
                        getTypoControl() ? el(getTypoControl(), { label:__('Content','blockenberg'), value:a.contentTypo, onChange:function(v){ setAttr({contentTypo:v}); } }) : null
                    ),
                    customColorPanels,
                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: 'Max width (px)', value: a.maxWidth, min: 300, max: 1200, step: 10, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: 'Padding V (px)', value: a.paddingV, min: 8, max: 60, onChange: function (v) { setAttr({ paddingV: v }); } }),
                        el(RangeControl, { label: 'Padding H (px)', value: a.paddingH, min: 8, max: 80, onChange: function (v) { setAttr({ paddingH: v }); } }),
                        el(RangeControl, { label: 'Card radius (px)', value: a.cardRadius, min: 0, max: 32, onChange: function (v) { setAttr({ cardRadius: v }); } }),
                        el(RangeControl, { label: 'Button radius (px)', value: a.btnRadius, min: 0, max: 50, onChange: function (v) { setAttr({ btnRadius: v }); } }),
                    )
                ),
                el(SpoilerPreview, { attributes: a, setAttributes: setAttr })
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-spoiler-block' });
            return el('div', Object.assign({}, blockProps, {
                className: (blockProps.className || '') + ' bkbg-sp-app',
                'data-opts': JSON.stringify(a),
            }));
        },
    });
}() );
