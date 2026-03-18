(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var registerBlockType = wp.blocks.registerBlockType;
        var __ = wp.i18n.__;
        var InspectorControls = wp.blockEditor.InspectorControls;
        var PanelColorSettings = wp.blockEditor.PanelColorSettings;
        var useBlockProps = wp.blockEditor.useBlockProps;
        var PanelBody = wp.components.PanelBody;
        var TextControl = wp.components.TextControl;
        var ToggleControl = wp.components.ToggleControl;
        var RangeControl = wp.components.RangeControl;
        var SelectControl = wp.components.SelectControl;
        var Button = wp.components.Button;
        var ColorPicker = wp.components.ColorPicker;
        var Popover = wp.components.Popover;
        var useState = wp.element.useState;

        // ── helpers ────────────────────────────────────────────────────
        function upd(arr, idx, field, val) {
            return arr.map(function (e, i) {
                if (i !== idx) return e;
                var u = {}; u[field] = val;
                return Object.assign({}, e, u);
            });
        }

        var SECTION_TYPES = [
            { value: 'nav',     label: 'Nav bar' },
            { value: 'hero',    label: 'Hero / Banner' },
            { value: 'feature', label: 'Feature grid' },
            { value: 'content', label: 'Content / Text' },
            { value: 'cta',     label: 'CTA strip' },
            { value: 'footer',  label: 'Footer' },
        ];

        var BROWSER_STYLES = [
            { value: 'chrome',  label: 'Chrome (light)' },
            { value: 'dark',    label: 'Chrome (dark)' },
            { value: 'arc',     label: 'Arc (sidebar)' },
            { value: 'minimal', label: 'Minimal' },
        ];

        // Section icon by type
        function sectionIcon(type) {
            if (type === 'nav')     return '☰';
            if (type === 'hero')    return '★';
            if (type === 'feature') return '◈';
            if (type === 'content') return '¶';
            if (type === 'cta')     return '▶';
            if (type === 'footer')  return '◻';
            return '▪';
        }

        // ── Render browser chrome + sections ──────────────────────────
        function renderBrowser(a) {
            var isDark    = a.browserStyle === 'dark';
            var isArc     = a.browserStyle === 'arc';
            var isMinimal = a.browserStyle === 'minimal';

            var frameBg   = isDark ? '#1e1e1e' : a.frameBg;
            var frameText = isDark ? '#d4d4d4' : a.frameText;

            // Traffic-light dots
            var dots = el('div', { style: { display: 'flex', gap: '6px', alignItems: 'center', flexShrink: '0' } },
                el('span', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', display: 'block' } }),
                el('span', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', display: 'block' } }),
                el('span', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', display: 'block' } })
            );

            // Active tab
            var activeTab = el('div', {
                style: {
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: a.tabActiveBg, color: a.tabActiveText,
                    borderRadius: '6px 6px 0 0', padding: '6px 14px',
                    fontSize: a.titleFontSize + 'px', fontWeight: '500',
                    maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden'
                }
            },
                el('span', { style: { fontSize: '10px' } }, '◉'),
                el('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis' } }, a.tabTitle)
            );

            // Extra inactive tabs
            var tab2 = el('div', {
                style: {
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: a.tabInactiveBg, color: a.tabInactiveText,
                    borderRadius: '6px 6px 0 0', padding: '6px 12px',
                    fontSize: (a.titleFontSize - 1) + 'px'
                }
            }, 'New Tab');
            var tab3 = el('div', {
                style: {
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: a.tabInactiveBg, color: a.tabInactiveText,
                    borderRadius: '6px 6px 0 0', padding: '6px 10px',
                    fontSize: (a.titleFontSize - 1) + 'px'
                }
            }, '+');

            // Tab bar row (only in non-minimal)
            var tabBar = (!isMinimal && a.showTabs) ? el('div', {
                style: {
                    display: 'flex', alignItems: 'flex-end', gap: '2px',
                    padding: '8px 12px 0', background: frameBg
                }
            }, dots, el('div', { style: { width: '16px' } }), activeTab, tab2, tab3)
            : null;

            // Minimal dots-only header
            var minimalHeader = isMinimal ? el('div', {
                style: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: frameBg }
            }, dots) : null;

            // URL bar
            var urlBar = a.showURL ? el('div', {
                style: {
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: isMinimal ? '0 14px 6px' : '8px 12px',
                    background: frameBg
                }
            },
                !a.showTabs && !isMinimal ? el('div', { style: { display: 'flex', gap: '6px', alignItems: 'center', marginRight: '8px' } },
                    el('span', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', display: 'block' } }),
                    el('span', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', display: 'block' } }),
                    el('span', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', display: 'block' } })
                ) : null,
                el('div', { style: { display: 'flex', alignItems: 'center', gap: '5px', color: frameText, fontSize: (a.fontSize - 1) + 'px', cursor: 'default', opacity: '.7' } },
                    '◀', ' ', '▶', ' ', '↻'
                ),
                el('div', {
                    style: {
                        flex: '1', background: a.urlBarBg, border: '1px solid ' + a.urlBarBorder,
                        borderRadius: '20px', padding: '4px 14px',
                        display: 'flex', alignItems: 'center', gap: '6px'
                    }
                },
                    el('span', { style: { fontSize: '10px', color: '#22c55e' } }, '🔒'),
                    el('span', { style: { color: a.urlBarText, fontSize: a.fontSize + 'px', userSelect: 'none' } }, a.url)
                ),
                el('div', { style: { display: 'flex', gap: '6px', color: frameText, fontSize: (a.fontSize - 1) + 'px', opacity: '.7' } },
                    '⋯', ' ☆', ' ⬇'
                )
            ) : null;

            // Bookmarks bar
            var bookmarkBar = (a.showBookmarks && a.bookmarks && a.bookmarks.length) ? el('div', {
                style: {
                    display: 'flex', alignItems: 'center', gap: '2px',
                    padding: '4px 14px', background: frameBg,
                    borderBottom: '1px solid ' + (isDark ? '#333' : '#d1d5db')
                }
            },
                a.bookmarks.map(function (bk, idx) {
                    return el('div', {
                        key: idx,
                        style: {
                            padding: '2px 10px', borderRadius: '4px', cursor: 'default',
                            color: frameText, fontSize: (a.fontSize - 1) + 'px',
                            background: 'transparent', opacity: '.8'
                        }
                    }, '📄 ' + bk.label);
                })
            ) : null;

            // Page sections
            var pageContent = el('div', { style: { overflow: 'hidden' } },
                a.sections.map(function (sec, idx) {
                    return el('div', {
                        key: idx,
                        style: {
                            height: sec.height + 'px',
                            background: sec.bg,
                            color: sec.textColor,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: a.fontSize + 'px', fontWeight: sec.type === 'hero' ? '700' : '400',
                            letterSpacing: sec.type === 'hero' ? '-0.01em' : '0',
                            overflow: 'hidden', position: 'relative',
                            gap: '10px'
                        }
                    },
                        el('span', { style: { fontSize: '18px', opacity: '.6' } }, sectionIcon(sec.type)),
                        el('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' } }, sec.label)
                    );
                })
            );

            return el('div', {
                style: {
                    borderRadius: a.borderRadius + 'px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px ' + a.frameShadow + ', 0 4px 12px ' + a.frameShadow,
                    border: '1px solid ' + (isDark ? '#444' : '#d1d5db')
                }
            }, tabBar, minimalHeader, urlBar, bookmarkBar, pageContent);
        }

        // ── edit ──────────────────────────────────────────────────────
        function Edit(props) {
            var a   = props.attributes;
            var set = props.setAttributes;

            var colorSettings = [
                { label: __('Frame BG'),         value: a.frameBg,         onChange: function (v) { set({ frameBg: v || '#e8e8e8' }); } },
                { label: __('Frame Text'),        value: a.frameText,       onChange: function (v) { set({ frameText: v || '#3c3c3c' }); } },
                { label: __('URL Bar BG'),        value: a.urlBarBg,        onChange: function (v) { set({ urlBarBg: v || '#ffffff' }); } },
                { label: __('URL Bar Text'),      value: a.urlBarText,      onChange: function (v) { set({ urlBarText: v || '#374151' }); } },
                { label: __('URL Bar Border'),    value: a.urlBarBorder,    onChange: function (v) { set({ urlBarBorder: v || '#d1d5db' }); } },
                { label: __('Active Tab BG'),     value: a.tabActiveBg,     onChange: function (v) { set({ tabActiveBg: v || '#ffffff' }); } },
                { label: __('Active Tab Text'),   value: a.tabActiveText,   onChange: function (v) { set({ tabActiveText: v || '#111827' }); } },
                { label: __('Inactive Tab BG'),   value: a.tabInactiveBg,   onChange: function (v) { set({ tabInactiveBg: v || '#d1d5db' }); } },
                { label: __('Inactive Tab Text'), value: a.tabInactiveText, onChange: function (v) { set({ tabInactiveText: v || '#6b7280' }); } },
                { label: __('Shadow'),            value: a.frameShadow,     onChange: function (v) { set({ frameShadow: v || '#00000033' }); } },
            ];

            var inspector = el(InspectorControls, {},
                // Browser settings
                el(PanelBody, { title: __('Browser Frame'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Browser style'), value: a.browserStyle, options: BROWSER_STYLES, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ browserStyle: v }); }
                    }),
                    el(TextControl, {
                        label: __('URL'), value: a.url, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ url: v }); }
                    }),
                    el(TextControl, {
                        label: __('Tab title'), value: a.tabTitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ tabTitle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show tabs'), checked: a.showTabs, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showTabs: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show URL bar'), checked: a.showURL, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showURL: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show bookmarks bar'), checked: a.showBookmarks, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showBookmarks: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Corner radius'), value: a.borderRadius, min: 0, max: 28, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ borderRadius: v }); }
                    }),
                    ),
                // Bookmarks
                a.showBookmarks ? el(PanelBody, { title: __('Bookmarks'), initialOpen: false },
                    a.bookmarks.map(function (bk, idx) {
                        return el('div', { key: idx, style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' } },
                            el(TextControl, {
                                value: bk.label, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ bookmarks: upd(a.bookmarks, idx, 'label', v) }); }
                            }),
                            el(Button, {
                                variant: 'secondary', isSmall: true, isDestructive: true,
                                onClick: function () { var n = a.bookmarks.slice(); n.splice(idx, 1); set({ bookmarks: n }); }
                            }, '✕')
                        );
                    }),
                    a.bookmarks.length < 8 ? el(Button, {
                        variant: 'secondary', isSmall: true,
                        onClick: function () { set({ bookmarks: a.bookmarks.concat([{ label: 'Bookmark' }]) }); }
                    }, '+ Add bookmark') : null
                ) : null,
                // Page sections
                el(PanelBody, { title: __('Page Sections (' + a.sections.length + ')'), initialOpen: false },
                    a.sections.map(function (sec, idx) {
                        return el(PanelBody, {
                            key: idx,
                            title: (idx + 1) + '. ' + sec.label.substring(0, 28) + (sec.label.length > 28 ? '…' : ''),
                            initialOpen: false
                        },
                            el(SelectControl, {
                                label: __('Type'), value: sec.type, options: SECTION_TYPES, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ sections: upd(a.sections, idx, 'type', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Label / text'), value: sec.label, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ sections: upd(a.sections, idx, 'label', v) }); }
                            }),
                            el(RangeControl, {
                                label: __('Height (px)'), value: sec.height, min: 32, max: 400, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ sections: upd(a.sections, idx, 'height', v) }); }
                            }),
                            el(BkbgColorSwatch, { label: __('Background color'), value: sec.bg, onChange: function (v) { set({ sections: upd(a.sections, idx, 'bg', v) }); } }),
                            el(BkbgColorSwatch, { label: __('Text color'), value: sec.textColor, onChange: function (v) { set({ sections: upd(a.sections, idx, 'textColor', v) }); } }),
                            el(Button, {
                                variant: 'secondary', isDestructive: true, __nextHasNoMarginBottom: true,
                                onClick: function () { var n = a.sections.slice(); n.splice(idx, 1); set({ sections: n }); }
                            }, __('Remove section'))
                        );
                    }),
                    el(Button, {
                        variant: 'primary', __nextHasNoMarginBottom: true,
                        onClick: function () {
                            set({ sections: a.sections.concat([{ type: 'content', label: 'New section', height: 80, bg: '#ffffff', textColor: '#333333' }]) });
                        }
                    }, __('+ Add section'))
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(RangeControl, {
                        label: __('Font size'), value: a.fontSize, min: 10, max: 20, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ fontSize: v }); }
                    }),
                    el(RangeControl, { label: __('Title Font Size (px)', 'blockenberg'), value: a.titleFontSize, min: 10, max: 20, __nextHasNoMarginBottom: true, onChange: function (v) { set({ titleFontSize: v }); } }),
                    el(SelectControl, { label: __('Title Font Weight', 'blockenberg'), value: a.titleFontWeight||500, options: [{label:'400',value:400},{label:'500',value:500},{label:'600',value:600},{label:'700',value:700}], __nextHasNoMarginBottom: true, onChange: function (v) { set({ titleFontWeight: parseInt(v,10) }); } }),
                    el(RangeControl, { label: __('Title Line Height', 'blockenberg'), value: a.titleLineHeight||1.3, min: 0.8, max: 2.5, step: 0.1, __nextHasNoMarginBottom: true, onChange: function (v) { set({ titleLineHeight: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Frame Colors'),
                    initialOpen: false,
                    colorSettings: colorSettings
                })
            );

            return el(Fragment, {},
                inspector,
                el('div', Object.assign({}, useBlockProps(), {
                    style: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }
                }), renderBrowser(a))
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

        registerBlockType('blockenberg/browser-mockup', {
            edit: Edit,
            save: function (props) {
                return el('div', useBlockProps.save(),
                    el('div', { className: 'bkbg-browser-mockup-app', 'data-opts': JSON.stringify(props.attributes) })
                );
            }
        });
})();
