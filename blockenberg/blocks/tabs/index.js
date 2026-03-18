( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var Button = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── CSS vars builder ──────────────────────────────────────────────────────
    function buildWrapStyle(a) {
        var shadow = a.boxShadow === 'sm' ? '0 1px 4px rgba(0,0,0,0.10)' :
                     a.boxShadow === 'md' ? '0 4px 16px rgba(0,0,0,0.12)' :
                     a.boxShadow === 'lg' ? '0 8px 32px rgba(0,0,0,0.15)' : 'none';
        return {
            '--bkbg-tabs-tab-bar-bg'     : a.tabBarBg,
            '--bkbg-tabs-tab-bg'         : a.tabBg,
            '--bkbg-tabs-tab-color'      : a.tabColor,
            '--bkbg-tabs-tab-hover-bg'   : a.tabHoverBg,
            '--bkbg-tabs-tab-hover-color': a.tabHoverColor,
            '--bkbg-tabs-tab-active-bg'  : a.tabActiveBg,
            '--bkbg-tabs-tab-active-color': a.tabActiveColor,
            '--bkbg-tabs-indicator-color': a.indicatorColor,
            '--bkbg-tabs-indicator-h'    : a.indicatorHeight + 'px',
            '--bkbg-tabs-tab-pad-v'      : a.tabPaddingV + 'px',
            '--bkbg-tabs-tab-pad-h'      : a.tabPaddingH + 'px',
            '--bkbg-tabs-tab-radius'     : a.tabBorderRadius + 'px',
            '--bkbg-tabs-gap'            : a.tabGap + 'px',
            '--bkbg-tabs-content-bg'     : a.contentBg,
            '--bkbg-tabs-content-color'  : a.contentColor,
            '--bkbg-tabs-content-pad'    : a.contentPaddingTop + 'px ' + a.contentPaddingRight + 'px ' + a.contentPaddingBottom + 'px ' + a.contentPaddingLeft + 'px',
            '--bkbg-tabs-content-radius' : a.contentBorderRadius + 'px',
            '--bkbg-tabs-content-min-h'  : a.contentMinHeight ? a.contentMinHeight + 'px' : 'auto',
            '--bkbg-tabs-border-color'   : a.borderColor,
            '--bkbg-tabs-border-w'       : a.borderWidth + 'px',
            '--bkbg-tabs-wrapper-bg'     : a.wrapperBg,
            '--bkbg-tabs-wrapper-pad'    : a.wrapperPaddingTop + 'px ' + a.wrapperPaddingRight + 'px ' + a.wrapperPaddingBottom + 'px ' + a.wrapperPaddingLeft + 'px',
            '--bkbg-tabs-wrapper-radius' : a.wrapperBorderRadius + 'px',
            '--bkbg-tabs-shadow'         : shadow
        };
    }

    // ── Color swatch helper ───────────────────────────────────────────────────
    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', {
                    type: 'button',
                    title: value || 'none',
                    onClick: function () { setOpenKey(isOpen ? null : key); },
                    style: {
                        width: '28px', height: '28px', borderRadius: '4px',
                        border: isOpen ? '2px solid #007cba' : '2px solid #ddd',
                        cursor: 'pointer', padding: 0, display: 'block',
                        background: value || 'transparent',
                        backgroundImage: !value ? 'repeating-linear-gradient(45deg,#ccc 0,#ccc 1px,transparent 0,transparent 50%)' : 'none',
                        backgroundSize: '4px 4px'
                    }
                }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    // ── Item update helpers ───────────────────────────────────────────────────
    function updateItem(items, index, field, value, setAttributes) {
        var newItems = items.map(function (item, i) {
            if (i !== index) return item;
            var updated = {};
            for (var k in item) { updated[k] = item[k]; }
            updated[field] = value;
            return updated;
        });
        setAttributes({ items: newItems });
    }

    // ── Register block ────────────────────────────────────────────────────────
    registerBlockType('blockenberg/tabs', {
        title: __('Tabs', 'blockenberg'),
        icon: {
            src: el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', width: 24, height: 24, 'aria-hidden': true, focusable: false },
                el('rect', { x: 2, y: 8, width: 6, height: 3, rx: 1, fill: 'currentColor' }),
                el('rect', { x: 9, y: 8, width: 6, height: 3, rx: 1, fill: 'currentColor', opacity: 0.4 }),
                el('rect', { x: 16, y: 8, width: 6, height: 3, rx: 1, fill: 'currentColor', opacity: 0.4 }),
                el('rect', { x: 2, y: 12, width: 20, height: 9, rx: 1.5, fill: 'currentColor', opacity: 0.15 }),
                el('rect', { x: 2, y: 12, width: 20, height: 9, rx: 1.5, stroke: 'currentColor', strokeWidth: 1.5, fill: 'none' })
            )
        },
        category: 'bkbg-content',
        description: __('Tabbed content panels with full WYSIWYG editing per tab.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function addTab() {
                setAttributes({
                    items: a.items.concat([{
                        title: __('New Tab', 'blockenberg'),
                        content: '<p>' + __('Tab content goes here.', 'blockenberg') + '</p>',
                        icon: 'dashicons-star-filled',
                        showIcon: true
                    }])
                });
            }

            function removeTab(index) {
                if (a.items.length <= 1) return;
                var newItems = a.items.filter(function (_, i) { return i !== index; });
                var newActive = a.activeTab >= newItems.length ? newItems.length - 1 : a.activeTab;
                setAttributes({ items: newItems, activeTab: newActive });
            }

            function moveTab(index, dir) {
                var newIndex = index + dir;
                if (newIndex < 0 || newIndex >= a.items.length) return;
                var newItems = a.items.slice();
                var temp = newItems[index]; newItems[index] = newItems[newIndex]; newItems[newIndex] = temp;
                setAttributes({ items: newItems });
            }

            var wrapperClass = 'bkbg-tabs-wrapper bkbg-tabs-style-' + a.tabStyle + ' bkbg-tabs-pos-' + a.tabPosition + ' bkbg-tabs-align-' + a.tabAlign;
            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = Object.assign({}, buildWrapStyle(a));
                if (_tvf) {
                    Object.assign(s, _tvf(a.tabTypo, '--bktb-tb-'));
                    Object.assign(s, _tvf(a.contentTypo, '--bktb-ct-'));
                }
                return { className: wrapperClass, style: s };
            })());

            // ── Inspector ─────────────────────────────────────────────────────
            var inspector = el(InspectorControls, {},
                // Tabs Management
                el(PanelBody, { title: __('Tabs', 'blockenberg'), initialOpen: true },
                    a.items.map(function (item, i) {
                        return el('div', {
                            key: i,
                            style: { border: '1px solid #ddd', borderRadius: '6px', padding: '10px', marginBottom: '10px', background: i === a.activeTab ? '#f0f7ff' : '#fafafa' }
                        },
                            el('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' } },
                                el('span', { style: { fontWeight: '600', fontSize: '12px', flex: 1 } }, (i + 1) + '. ' + (item.title || __('Tab', 'blockenberg'))),
                                el(Button, { isSmall: true, variant: 'tertiary', onClick: function () { moveTab(i, -1); }, disabled: i === 0 }, '↑'),
                                el(Button, { isSmall: true, variant: 'tertiary', onClick: function () { moveTab(i, 1); }, disabled: i === a.items.length - 1 }, '↓'),
                                el(Button, {
                                    isSmall: true, variant: 'tertiary',
                                    onClick: function () { setAttributes({ activeTab: i }); }
                                }, i === a.activeTab ? __('Editing', 'blockenberg') : __('Edit', 'blockenberg')),
                                el(Button, {
                                    isSmall: true, isDestructive: true, variant: 'tertiary',
                                    onClick: function () { removeTab(i); }, disabled: a.items.length <= 1
                                }, '✕')
                            ),
                            el(TextControl, {
                                label: __('Tab Label', 'blockenberg'),
                                value: item.title,
                                onChange: function (val) { updateItem(a.items, i, 'title', val, setAttributes); }
                            }),
                            a.showIcons && el(TextControl, {
                                label: __('Icon (dashicons class)', 'blockenberg'),
                                value: item.icon || '',
                                placeholder: 'dashicons-star-filled',
                                onChange: function (val) { updateItem(a.items, i, 'icon', val, setAttributes); }
                            })
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: addTab, style: { width: '100%', justifyContent: 'center' } },
                        '+ ' + __('Add Tab', 'blockenberg')
                    )
                ),

                // Layout
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Tab Style', 'blockenberg'),
                        value: a.tabStyle,
                        options: [
                            { label: __('Underline', 'blockenberg'), value: 'underline' },
                            { label: __('Pills / Rounded', 'blockenberg'), value: 'pills' },
                            { label: __('Boxed', 'blockenberg'), value: 'boxed' },
                            { label: __('Minimal', 'blockenberg'), value: 'minimal' }
                        ],
                        onChange: function (val) { setAttributes({ tabStyle: val }); }
                    }),
                    el(SelectControl, {
                        label: __('Tab Position', 'blockenberg'),
                        value: a.tabPosition,
                        options: [
                            { label: __('Top', 'blockenberg'), value: 'top' },
                            { label: __('Left', 'blockenberg'), value: 'left' }
                        ],
                        onChange: function (val) { setAttributes({ tabPosition: val }); }
                    }),
                    a.tabPosition === 'top' && el(SelectControl, {
                        label: __('Tab Alignment', 'blockenberg'),
                        value: a.tabAlign,
                        options: [
                            { label: __('Left', 'blockenberg'), value: 'left' },
                            { label: __('Center', 'blockenberg'), value: 'center' },
                            { label: __('Right', 'blockenberg'), value: 'right' },
                            { label: __('Full Width', 'blockenberg'), value: 'full' }
                        ],
                        onChange: function (val) { setAttributes({ tabAlign: val }); }
                    }),
                    el(SelectControl, {
                        label: __('Animation', 'blockenberg'),
                        value: a.animationType,
                        options: [
                            { label: __('None', 'blockenberg'), value: 'none' },
                            { label: __('Fade', 'blockenberg'), value: 'fade' },
                            { label: __('Slide Up', 'blockenberg'), value: 'slide-up' }
                        ],
                        onChange: function (val) { setAttributes({ animationType: val }); }
                    }),
                    el(RangeControl, {
                        label: __('Tab Gap', 'blockenberg'),
                        value: a.tabGap, min: 0, max: 24,
                        onChange: function (val) { setAttributes({ tabGap: val }); }
                    }),
                    el(SelectControl, {
                        label: __('Box Shadow', 'blockenberg'),
                        value: a.boxShadow,
                        options: [
                            { label: __('None', 'blockenberg'), value: 'none' },
                            { label: __('Small', 'blockenberg'), value: 'sm' },
                            { label: __('Medium', 'blockenberg'), value: 'md' },
                            { label: __('Large', 'blockenberg'), value: 'lg' }
                        ],
                        onChange: function (val) { setAttributes({ boxShadow: val }); }
                    })
                ),

                // Icons & Labels
                el(PanelBody, { title: __('Icons & Labels', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Icons', 'blockenberg'),
                        checked: a.showIcons,
                        onChange: function (val) { setAttributes({ showIcons: val }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Labels', 'blockenberg'),
                        checked: a.showLabels,
                        onChange: function (val) { setAttributes({ showLabels: val }); }
                    }),
                    (a.showIcons && a.showLabels) && el(SelectControl, {
                        label: __('Icon Position', 'blockenberg'),
                        value: a.iconPosition,
                        options: [
                            { label: __('Left of label', 'blockenberg'), value: 'left' },
                            { label: __('Right of label', 'blockenberg'), value: 'right' },
                            { label: __('Above label', 'blockenberg'), value: 'top' }
                        ],
                        onChange: function (val) { setAttributes({ iconPosition: val }); }
                    })
                ),

                // Tab Button Styles
                el(PanelBody, { title: __('Tab Button Style', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Vertical Padding (px)', 'blockenberg'),
                        value: a.tabPaddingV, min: 4, max: 32,
                        onChange: function (val) { setAttributes({ tabPaddingV: val }); }
                    }),
                    el(RangeControl, {
                        label: __('Horizontal Padding (px)', 'blockenberg'),
                        value: a.tabPaddingH, min: 8, max: 60,
                        onChange: function (val) { setAttributes({ tabPaddingH: val }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: a.tabBorderRadius, min: 0, max: 50,
                        onChange: function (val) { setAttributes({ tabBorderRadius: val }); }
                    }),
                    el(RangeControl, {
                        label: __('Indicator Height (px)', 'blockenberg'),
                        value: a.indicatorHeight, min: 1, max: 8,
                        onChange: function (val) { setAttributes({ indicatorHeight: val }); }
                    }),
                    cc('tabBarBg', __('Tab Bar Background', 'blockenberg'), 'tabBarBg'),
                    cc('tabBg', __('Tab Background', 'blockenberg'), 'tabBg'),
                    cc('tabColor', __('Tab Text Color', 'blockenberg'), 'tabColor'),
                    cc('tabHoverBg', __('Tab Hover Background', 'blockenberg'), 'tabHoverBg'),
                    cc('tabHoverColor', __('Tab Hover Color', 'blockenberg'), 'tabHoverColor'),
                    cc('tabActiveBg', __('Active Tab Background', 'blockenberg'), 'tabActiveBg'),
                    cc('tabActiveColor', __('Active Tab Color', 'blockenberg'), 'tabActiveColor'),
                    cc('indicatorColor', __('Indicator / Accent Color', 'blockenberg'), 'indicatorColor')
                ),

                // Content Area
                el(PanelBody, { title: __('Content Area', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: a.contentPaddingTop, min: 0, max: 80,
                        onChange: function (val) { setAttributes({ contentPaddingTop: val }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding Right (px)', 'blockenberg'),
                        value: a.contentPaddingRight, min: 0, max: 80,
                        onChange: function (val) { setAttributes({ contentPaddingRight: val }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: a.contentPaddingBottom, min: 0, max: 80,
                        onChange: function (val) { setAttributes({ contentPaddingBottom: val }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding Left (px)', 'blockenberg'),
                        value: a.contentPaddingLeft, min: 0, max: 80,
                        onChange: function (val) { setAttributes({ contentPaddingLeft: val }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: a.contentBorderRadius, min: 0, max: 40,
                        onChange: function (val) { setAttributes({ contentBorderRadius: val }); }
                    }),
                    el(RangeControl, {
                        label: __('Min Height (px, 0 = auto)', 'blockenberg'),
                        value: a.contentMinHeight, min: 0, max: 800,
                        onChange: function (val) { setAttributes({ contentMinHeight: val }); }
                    }),
                    cc('contentBg', __('Content Background', 'blockenberg'), 'contentBg'),
                    cc('contentColor', __('Content Text Color', 'blockenberg'), 'contentColor'),
                    cc('borderColor', __('Border Color', 'blockenberg'), 'borderColor')
                ),

                // Wrapper
                el(PanelBody, { title: __('Wrapper', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: a.wrapperPaddingTop, min: 0, max: 100,
                        onChange: function (val) { setAttributes({ wrapperPaddingTop: val }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding Right (px)', 'blockenberg'),
                        value: a.wrapperPaddingRight, min: 0, max: 100,
                        onChange: function (val) { setAttributes({ wrapperPaddingRight: val }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: a.wrapperPaddingBottom, min: 0, max: 100,
                        onChange: function (val) { setAttributes({ wrapperPaddingBottom: val }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding Left (px)', 'blockenberg'),
                        value: a.wrapperPaddingLeft, min: 0, max: 100,
                        onChange: function (val) { setAttributes({ wrapperPaddingLeft: val }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: a.wrapperBorderRadius, min: 0, max: 40,
                        onChange: function (val) { setAttributes({ wrapperBorderRadius: val }); }
                    }),
                    cc('wrapperBg', __('Wrapper Background', 'blockenberg'), 'wrapperBg')
                ),
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl()({ label: __('Tab Button', 'blockenberg'), value: a.tabTypo, onChange: function (v) { setAttributes({ tabTypo: v }); } }),
                    getTypoControl()({ label: __('Content', 'blockenberg'), value: a.contentTypo, onChange: function (v) { setAttributes({ contentTypo: v }); } })
                )
            );

            // ── Block render ──────────────────────────────────────────────────
            function renderTabIcon(item) {
                if (!a.showIcons || !item.icon) return null;
                return el('span', { className: 'dashicons ' + item.icon + ' bkbg-tabs-tab-icon' });
            }

            function renderTab(item, i) {
                var isActive = i === a.activeTab;
                var parts = [];
                if (a.iconPosition === 'top' && a.showIcons) parts.push(renderTabIcon(item));
                if (a.iconPosition === 'left' && a.showIcons) parts.push(renderTabIcon(item));
                if (a.showLabels) parts.push(el('span', { key: 'lbl', className: 'bkbg-tabs-tab-label' }, item.title || __('Tab', 'blockenberg')));
                if (a.iconPosition === 'right' && a.showIcons) parts.push(renderTabIcon(item));

                return el('button', {
                    key: i,
                    type: 'button',
                    className: 'bkbg-tabs-tab' + (isActive ? ' is-active' : '') + ' bkbg-tabs-icon-pos-' + a.iconPosition,
                    onClick: function () { setAttributes({ activeTab: i }); }
                }, parts);
            }

            var tabBar = el('div', { className: 'bkbg-tabs-tabbar', role: 'tablist' },
                a.items.map(function (item, i) { return renderTab(item, i); })
            );

            var panels = a.items.map(function (item, i) {
                var isActive = i === a.activeTab;
                return el('div', {
                    key: i,
                    className: 'bkbg-tabs-panel' + (isActive ? ' is-active' : ''),
                    style: { display: isActive ? '' : 'none' }
                },
                    el(RichText, {
                        tagName: 'div',
                        className: 'bkbg-tabs-content',
                        value: item.content,
                        onChange: function (val) { updateItem(a.items, i, 'content', val, setAttributes); },
                        placeholder: __('Write tab content here…', 'blockenberg'),
                        multiline: 'p'
                    })
                );
            });

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-tabs-inner bkbg-tabs-anim-' + a.animationType },
                        a.tabPosition === 'top' ? el(Fragment, {}, tabBar, el('div', { className: 'bkbg-tabs-panels' }, panels))
                                                : el(Fragment, {}, el('div', { className: 'bkbg-tabs-left-layout' }, tabBar, el('div', { className: 'bkbg-tabs-panels' }, panels)))
                    )
                )
            );
        },

        // ── Save ─────────────────────────────────────────────────────────────
        save: function (props) {
            var a = props.attributes;

            function renderSaveTabIcon(item) {
                if (!a.showIcons || !item.icon) return null;
                return el('span', { className: 'dashicons ' + item.icon + ' bkbg-tabs-tab-icon', 'aria-hidden': 'true' });
            }

            function renderSaveTab(item, i) {
                var parts = [];
                if (a.iconPosition === 'top' && a.showIcons) parts.push(renderSaveTabIcon(item));
                if (a.iconPosition === 'left' && a.showIcons) parts.push(renderSaveTabIcon(item));
                if (a.showLabels) parts.push(el('span', { key: 'lbl', className: 'bkbg-tabs-tab-label' }, item.title || ''));
                if (a.iconPosition === 'right' && a.showIcons) parts.push(renderSaveTabIcon(item));

                return el('button', {
                    key: i,
                    type: 'button',
                    role: 'tab',
                    'aria-selected': i === 0 ? 'true' : 'false',
                    'aria-controls': 'bkbg-tabs-panel-' + i,
                    id: 'bkbg-tabs-tab-' + i,
                    className: 'bkbg-tabs-tab' + (i === 0 ? ' is-active' : '') + ' bkbg-tabs-icon-pos-' + a.iconPosition,
                    tabIndex: i === 0 ? 0 : -1
                }, parts);
            }

            var tabBar = el('div', {
                className: 'bkbg-tabs-tabbar',
                role: 'tablist',
                'aria-label': 'Tabs'
            }, a.items.map(function (item, i) { return renderSaveTab(item, i); }));

            var panels = a.items.map(function (item, i) {
                return el('div', {
                    key: i,
                    id: 'bkbg-tabs-panel-' + i,
                    role: 'tabpanel',
                    'aria-labelledby': 'bkbg-tabs-tab-' + i,
                    'aria-hidden': i === 0 ? 'false' : 'true',
                    className: 'bkbg-tabs-panel' + (i === 0 ? ' is-active' : '')
                },
                    el(RichText.Content, { tagName: 'div', className: 'bkbg-tabs-content', value: item.content })
                );
            });

            var wrapperClass = 'bkbg-tabs-wrapper bkbg-tabs-style-' + a.tabStyle + ' bkbg-tabs-pos-' + a.tabPosition + ' bkbg-tabs-align-' + a.tabAlign;

            var _tvf = getTypoCssVars();
            var saveStyle = Object.assign({}, buildWrapStyle(a));
            if (_tvf) {
                Object.assign(saveStyle, _tvf(a.tabTypo, '--bktb-tb-'));
                Object.assign(saveStyle, _tvf(a.contentTypo, '--bktb-ct-'));
            }

            return el('div', wp.blockEditor.useBlockProps.save({ className: wrapperClass, style: saveStyle }),
                el('div', {
                    className: 'bkbg-tabs-inner bkbg-tabs-anim-' + a.animationType,
                    'data-animation': a.animationType
                },
                    a.tabPosition === 'top'
                        ? el(Fragment, {}, tabBar, el('div', { className: 'bkbg-tabs-panels' }, panels))
                        : el('div', { className: 'bkbg-tabs-left-layout' }, tabBar, el('div', { className: 'bkbg-tabs-panels' }, panels))
                )
            );
        }
    });
}() );
