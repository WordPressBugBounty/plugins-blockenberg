(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var registerBlockType = wp.blocks.registerBlockType;
        var __ = wp.i18n.__;
        var InspectorControls = wp.blockEditor.InspectorControls;
        var PanelColorSettings = wp.blockEditor.PanelColorSettings;
        var useBlockProps = wp.blockEditor.useBlockProps;
        var PanelBody = wp.components.PanelBody;
        var RangeControl = wp.components.RangeControl;
        var ToggleControl = wp.components.ToggleControl;
        var TextControl = wp.components.TextControl;
        var SelectControl = wp.components.SelectControl;
        var Button = wp.components.Button;

        var _TypographyControl, _typoCssVars;
        function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
        function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

        var PLATFORM_OPTIONS = [
            { label: 'Mac only', value: 'mac' },
            { label: 'Windows only', value: 'windows' },
            { label: 'Both (Mac / Win)', value: 'both' }
        ];

        function upd(arr, idx, field, val) {
            return arr.map(function (e, i) {
                if (i !== idx) return e;
                var u = {}; u[field] = val;
                return Object.assign({}, e, u);
            });
        }

        function updShortcut(sections, sIdx, scIdx, field, val) {
            return sections.map(function (sec, si) {
                if (si !== sIdx) return sec;
                return Object.assign({}, sec, {
                    shortcuts: sec.shortcuts.map(function (sc, sci) {
                        if (sci !== scIdx) return sc;
                        var u = {}; u[field] = val;
                        return Object.assign({}, sc, u);
                    })
                });
            });
        }

        function renderKeys(keysStr, a) {
            if (!keysStr) return null;
            var parts = keysStr.split(' ');
            return el('div', { className: 'bkbg-ks-keys', style: { display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'nowrap' } },
                parts.map(function (k, i) {
                    if (k === '/') return el('span', { key: i, style: { color: a.keyColor, opacity: 0.4, fontSize: a.keyFontSize + 'px' } }, '/');
                    if (k === '+') return el('span', { key: i, style: { color: a.keyColor, opacity: 0.4, fontSize: a.keyFontSize + 'px' } }, '+');
                    return el('kbd', { key: i, className: 'bkbg-ks-key', style: {
                        display: 'inline-block', padding: '2px 7px', background: a.keyBg,
                        border: '1px solid ' + a.keyBorderColor, borderBottom: '3px solid ' + a.keyBorderColor,
                        borderRadius: a.keyRadius + 'px', fontSize: a.keyFontSize + 'px',
                        color: a.keyColor, fontFamily: 'inherit', lineHeight: 1.4, whiteSpace: 'nowrap'
                    } }, k);
                })
            );
        }

        function renderShortcutRow(sc, a, idx) {
            var showMac = (a.platform === 'mac' || a.platform === 'both');
            var showWin = (a.platform === 'windows' || a.platform === 'both');
            return el('div', { key: idx, className: 'bkbg-ks-row', style: {
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 20px', gap: 16,
                borderTop: idx > 0 ? '1px solid ' + a.separatorColor : 'none'
            } },
                el('span', { className: 'bkbg-ks-desc', style: { color: a.descColor, fontSize: a.fontSize + 'px', flex: 1 } }, sc.description),
                el('div', { className: 'bkbg-ks-keys-wrap', style: { display: 'flex', gap: a.platform === 'both' ? 16 : 0, alignItems: 'center' } },
                    showMac && el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 } },
                        a.platform === 'both' && el('div', { style: { fontSize: '10px', color: a.macAccentColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 } }, 'Mac'),
                        renderKeys(sc.macKeys, a)
                    ),
                    showWin && el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 } },
                        a.platform === 'both' && el('div', { style: { fontSize: '10px', color: a.winAccentColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 } }, 'Win'),
                        renderKeys(sc.winKeys, a)
                    )
                )
            );
        }

        registerBlockType('blockenberg/keyboard-shortcut', {
            edit: function (props) {
                var a = props.attributes;
                var setAttr = props.setAttributes;

                return el(Fragment, null,
                    el(InspectorControls, null,
                        el(PanelBody, { title: __('Sheet Settings'), initialOpen: true },
                            el(TextControl, { label: __('Title'), value: a.sheetTitle, onChange: function (v) { setAttr({ sheetTitle: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Show Title'), checked: a.showTitle, onChange: function (v) { setAttr({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                            el(SelectControl, { label: __('Platform'), value: a.platform, options: PLATFORM_OPTIONS, onChange: function (v) { setAttr({ platform: v }); }, __nextHasNoMarginBottom: true })
                        ),
                        el(PanelBody, { title: __('Sections & Shortcuts'), initialOpen: false },
                            a.sections.map(function (sec, si) {
                                return el('div', { key: si, style: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 10, background: '#f9fafb' } },
                                    el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
                                        el(TextControl, { label: __('Section Heading'), value: sec.heading, onChange: function (v) { setAttr({ sections: upd(a.sections, si, 'heading', v) }); }, __nextHasNoMarginBottom: true }),
                                        el(Button, { isDestructive: true, isSmall: true, onClick: function () { setAttr({ sections: a.sections.filter(function (_, j) { return j !== si; }) }); } }, '✕')
                                    ),
                                    sec.shortcuts.map(function (sc, sci) {
                                        return el('div', { key: sci, style: { border: '1px solid #e2e8f0', borderRadius: 6, padding: 8, marginBottom: 6, background: '#fff' } },
                                            el(TextControl, { label: __('Description'), value: sc.description, onChange: function (v) { setAttr({ sections: updShortcut(a.sections, si, sci, 'description', v) }); }, __nextHasNoMarginBottom: true }),
                                            el(TextControl, { label: __('Mac Keys (space-separated)'), value: sc.macKeys, onChange: function (v) { setAttr({ sections: updShortcut(a.sections, si, sci, 'macKeys', v) }); }, __nextHasNoMarginBottom: true }),
                                            el(TextControl, { label: __('Win Keys (space-separated)'), value: sc.winKeys, onChange: function (v) { setAttr({ sections: updShortcut(a.sections, si, sci, 'winKeys', v) }); }, __nextHasNoMarginBottom: true }),
                                            el(Button, { isDestructive: true, isSmall: true, onClick: function () {
                                                setAttr({ sections: a.sections.map(function (s, sj) {
                                                    if (sj !== si) return s;
                                                    return Object.assign({}, s, { shortcuts: s.shortcuts.filter(function (_, j) { return j !== sci; }) });
                                                }) });
                                            } }, __('Remove shortcut'))
                                        );
                                    }),
                                    el(Button, { variant: 'secondary', isSmall: true, onClick: function () {
                                        setAttr({ sections: a.sections.map(function (s, sj) {
                                            if (sj !== si) return s;
                                            return Object.assign({}, s, { shortcuts: s.shortcuts.concat([{ description: 'New shortcut', macKeys: '⌘ K', winKeys: 'Ctrl K' }]) });
                                        }) });
                                    } }, __('+ Add Shortcut'))
                                );
                            }),
                            el(Button, { variant: 'primary', onClick: function () { setAttr({ sections: a.sections.concat([{ heading: 'New Section', shortcuts: [] }]) }); } }, __('+ Add Section'))
                        ),
                        el(PanelBody, { title: __('Typography'), initialOpen: false },
                            el(getTypographyControl(), { label: __('Title Typography'), value: a.titleTypo, onChange: function (v) { setAttr({ titleTypo: v }); } }),
                            el(RangeControl, { label: __('Font Size'), value: a.fontSize, min: 10, max: 20, onChange: function (v) { setAttr({ fontSize: v }); }, __nextHasNoMarginBottom: true }),
                            el(RangeControl, { label: __('Section Heading Size'), value: a.headingFontSize, min: 9, max: 18, onChange: function (v) { setAttr({ headingFontSize: v }); }, __nextHasNoMarginBottom: true }),
                            el(RangeControl, { label: __('Key Font Size'), value: a.keyFontSize, min: 9, max: 18, onChange: function (v) { setAttr({ keyFontSize: v }); }, __nextHasNoMarginBottom: true }),
                            el(RangeControl, { label: __('Line Height (%)'), value: a.lineHeight, min: 120, max: 220, onChange: function (v) { setAttr({ lineHeight: v }); }, __nextHasNoMarginBottom: true }),
                            el(RangeControl, { label: __('Border Radius'), value: a.borderRadius, min: 0, max: 24, onChange: function (v) { setAttr({ borderRadius: v }); }, __nextHasNoMarginBottom: true }),
                            el(RangeControl, { label: __('Key Radius'), value: a.keyRadius, min: 2, max: 12, onChange: function (v) { setAttr({ keyRadius: v }); }, __nextHasNoMarginBottom: true })
                        ),
                        el(PanelColorSettings, {
                            title: __('Colors'),
                            initialOpen: false,
                            colorSettings: [
                                { label: __('Background'), value: a.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                                { label: __('Border'), value: a.borderColor, onChange: function (v) { setAttr({ borderColor: v || '#e5e7eb' }); } },
                                { label: __('Title'), value: a.titleColor, onChange: function (v) { setAttr({ titleColor: v || '#111827' }); } },
                                { label: __('Section BG'), value: a.headingBg, onChange: function (v) { setAttr({ headingBg: v || '#f8fafc' }); } },
                                { label: __('Section Text'), value: a.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#374151' }); } },
                                { label: __('Section Border'), value: a.headingBorderColor, onChange: function (v) { setAttr({ headingBorderColor: v || '#e5e7eb' }); } },
                                { label: __('Description Text'), value: a.descColor, onChange: function (v) { setAttr({ descColor: v || '#374151' }); } },
                                { label: __('Key BG'), value: a.keyBg, onChange: function (v) { setAttr({ keyBg: v || '#f1f5f9' }); } },
                                { label: __('Key Border'), value: a.keyBorderColor, onChange: function (v) { setAttr({ keyBorderColor: v || '#cbd5e1' }); } },
                                { label: __('Key Text'), value: a.keyColor, onChange: function (v) { setAttr({ keyColor: v || '#1e293b' }); } },
                                { label: __('Mac Label'), value: a.macAccentColor, onChange: function (v) { setAttr({ macAccentColor: v || '#6366f1' }); } },
                                { label: __('Win Label'), value: a.winAccentColor, onChange: function (v) { setAttr({ winAccentColor: v || '#0ea5e9' }); } },
                                { label: __('Row Separator'), value: a.separatorColor, onChange: function (v) { setAttr({ separatorColor: v || '#f1f5f9' }); } }
                            ]
                        })
                    ),
                    el('div', useBlockProps((function () {
                        var _tv = getTypoCssVars();
                        var s = { background: a.bgColor, borderRadius: a.borderRadius + 'px', border: '1px solid ' + a.borderColor, overflow: 'hidden', fontSize: a.fontSize + 'px', lineHeight: (a.lineHeight / 100).toFixed(2) };
                        Object.assign(s, _tv(a.titleTypo, '--bkbg-ks-tt-'));
                        return { className: 'bkbg-ks-wrap', style: s };
                    })()),
                        a.showTitle && el('div', { className: 'bkbg-ks-header', style: { padding: '18px 20px', borderBottom: '1px solid ' + a.borderColor } },
                            el('h3', { className: 'bkbg-ks-title', style: { margin: 0, color: a.titleColor } }, a.sheetTitle)
                        ),
                        a.sections.map(function (sec, si) {
                            return el('div', { key: si, className: 'bkbg-ks-section' },
                                el('div', { className: 'bkbg-ks-section-head', style: {
                                    background: a.headingBg, padding: '7px 20px',
                                    borderTop: si === 0 && !a.showTitle ? 'none' : '1px solid ' + a.headingBorderColor,
                                    borderBottom: '1px solid ' + a.headingBorderColor
                                } },
                                    el('span', { style: { fontSize: a.headingFontSize + 'px', fontWeight: 700, color: a.headingColor, textTransform: 'uppercase', letterSpacing: '0.07em' } }, sec.heading)
                                ),
                                sec.shortcuts.map(function (sc, sci) { return renderShortcutRow(sc, a, sci); })
                            );
                        })
                    )
                );
            },
            save: function (props) {
                return el('div', useBlockProps.save(),
                    el('div', { className: 'bkbg-keyboard-shortcut-app', 'data-opts': JSON.stringify(props.attributes) })
                );
            }
        });
})();
