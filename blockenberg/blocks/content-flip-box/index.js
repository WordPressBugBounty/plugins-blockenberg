( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var IP = function () { return window.bkbgIconPicker; };

    var _TC, _tv;
    Object.defineProperty(window, '_bkbgCFBgetTC', { get: function () { return _TC || (_TC = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_bkbgCFBgetTV', { get: function () { return _tv || (_tv = window.bkbgTypoCssVars); } });

    function genId() {
        return 'cfb_' + Math.random().toString(36).substr(2, 9);
    }

    var defaultItem = function (n) {
        return {
            id: genId(),
            frontIcon: '⭐', frontIconType: 'custom-char', frontIconDashicon: '', frontIconImageUrl: '',
            frontTitle: 'Feature ' + n, frontText: 'A brief front description.',
            frontBg: '#6c3fb5', frontColor: '#ffffff',
            backIcon: '🔥', backIconType: 'custom-char', backIconDashicon: '', backIconImageUrl: '',
            backTitle: 'Learn More', backText: 'This is the back side with more details about this feature.',
            backBg: '#4f2d8a', backColor: '#ffffff',
            backBtnText: 'Explore', backBtnUrl: '#', backBtnBg: '#ffffff', backBtnColor: '#4f2d8a'
        };
    };

    registerBlockType('blockenberg/content-flip-box', {
        title: __('Content Flip Box', 'blockenberg'),
        icon: 'image-rotate',
        category: 'bkbg-effects',
        description: __('Grid of cards that flip on hover or click to reveal a styled back face.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var TC = window._bkbgCFBgetTC;
            var tv = window._bkbgCFBgetTV || function () { return {}; };
            var activeState = useState(null);
            var activeId = activeState[0];
            var setActiveId = activeState[1];
            // flippedIds: set of item IDs showing back face in editor
            var flippedState = useState({});
            var flipped = flippedState[0];
            var setFlipped = flippedState[1];

            var activeItem = activeId ? a.items.find(function (it) { return it.id === activeId; }) : null;

            function updateItem(id, field, value) {
                setAttributes({
                    items: a.items.map(function (it) {
                        if (it.id !== id) return it;
                        var u = Object.assign({}, it);
                        u[field] = value;
                        return u;
                    })
                });
            }

            function removeItem(id) {
                if (a.items.length <= 1) return;
                setAttributes({ items: a.items.filter(function (it) { return it.id !== id; }) });
                if (activeId === id) setActiveId(null);
            }

            function addItem() {
                var it = defaultItem(a.items.length + 1);
                setAttributes({ items: a.items.concat([it]) });
                setActiveId(it.id);
            }

            function moveItem(index, dir) {
                var items = a.items.slice();
                var t = index + dir;
                if (t < 0 || t >= items.length) return;
                var tmp = items[index]; items[index] = items[t]; items[t] = tmp;
                setAttributes({ items: items });
            }

            function toggleFlip(id) {
                var nf = Object.assign({}, flipped);
                nf[id] = !nf[id];
                setFlipped(nf);
            }

            var flipDirOptions = [
                { label: __('Horizontal (Y-axis)', 'blockenberg'), value: 'horizontal' },
                { label: __('Vertical (X-axis)', 'blockenberg'), value: 'vertical' },
                { label: __('Fade', 'blockenberg'), value: 'fade' }
            ];
            var flipTriggerOptions = [
                { label: __('On Hover', 'blockenberg'), value: 'hover' },
                { label: __('On Click', 'blockenberg'), value: 'click' }
            ];
            var alignOptions = [
                { label: __('Left', 'blockenberg'), value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right', 'blockenberg'), value: 'right' }
            ];

            var inspector = el(InspectorControls, {},
                // Items list
                el(PanelBody, { title: __('Items', 'blockenberg'), initialOpen: true },
                    a.items.map(function (item, idx) {
                        var isActive = item.id === activeId;
                        return el('div', {
                            key: item.id,
                            style: {
                                marginBottom: '8px', padding: '8px 10px',
                                background: isActive ? '#ede9fe' : '#f8fafc',
                                border: '1px solid ' + (isActive ? '#c4b5fd' : '#e2e8f0'),
                                borderRadius: '6px', cursor: 'pointer'
                            },
                            onClick: function () { setActiveId(isActive ? null : item.id); }
                        },
                            el('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                                el('span', { style: { fontSize: '18px' } }, item.frontIcon),
                                el('span', { style: { flex: 1, fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.frontTitle),
                                el('div', { style: { display: 'flex', gap: '2px' } },
                                    el(Button, { isSmall: true, variant: 'tertiary', onClick: function (e) { e.stopPropagation(); moveItem(idx, -1); }, disabled: idx === 0 }, '↑'),
                                    el(Button, { isSmall: true, variant: 'tertiary', onClick: function (e) { e.stopPropagation(); moveItem(idx, 1); }, disabled: idx === a.items.length - 1 }, '↓'),
                                    el(Button, { isSmall: true, variant: 'tertiary', isDestructive: true, onClick: function (e) { e.stopPropagation(); removeItem(item.id); }, disabled: a.items.length <= 1 }, '✕')
                                )
                            )
                        );
                    }),
                    el('div', { style: { marginTop: '8px' } },
                        el(Button, { variant: 'secondary', onClick: addItem, style: { width: '100%', justifyContent: 'center' } },
                            '+ ' + __('Add Card', 'blockenberg')
                        )
                    )
                ),

                // Active item editor
                activeItem && el(PanelBody, { title: '✏ ' + __('Edit Card', 'blockenberg') + ': ' + activeItem.frontTitle, initialOpen: true },
                    el('p', { style: { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6c3fb5', margin: '0 0 8px' } }, __('Front Face', 'blockenberg')),
                    el(IP().IconPickerControl, {
                        iconType: activeItem.frontIconType, customChar: activeItem.frontIcon, dashicon: activeItem.frontIconDashicon, imageUrl: activeItem.frontIconImageUrl,
                        onChangeType: function (v) { updateItem(activeId, 'frontIconType', v); },
                        onChangeChar: function (v) { updateItem(activeId, 'frontIcon', v); },
                        onChangeDashicon: function (v) { updateItem(activeId, 'frontIconDashicon', v); },
                        onChangeImageUrl: function (v) { updateItem(activeId, 'frontIconImageUrl', v); }
                    }),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Title', 'blockenberg'), value: activeItem.frontTitle, onChange: function (v) { updateItem(activeId, 'frontTitle', v); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Text', 'blockenberg'), value: activeItem.frontText, onChange: function (v) { updateItem(activeId, 'frontText', v); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelColorSettings, {
                        title: __('Front Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: activeItem.frontBg, onChange: function (c) { updateItem(activeId, 'frontBg', c || ''); }, label: __('Background', 'blockenberg') },
                            { value: activeItem.frontColor, onChange: function (c) { updateItem(activeId, 'frontColor', c || ''); }, label: __('Text Color', 'blockenberg') }
                        ]
                    }),
                    el('hr', { style: { margin: '12px 0', border: 'none', borderTop: '1px solid #e2e8f0' } }),
                    el('p', { style: { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#2563eb', margin: '0 0 8px' } }, __('Back Face', 'blockenberg')),
                    el(IP().IconPickerControl, {
                        iconType: activeItem.backIconType, customChar: activeItem.backIcon, dashicon: activeItem.backIconDashicon, imageUrl: activeItem.backIconImageUrl,
                        onChangeType: function (v) { updateItem(activeId, 'backIconType', v); },
                        onChangeChar: function (v) { updateItem(activeId, 'backIcon', v); },
                        onChangeDashicon: function (v) { updateItem(activeId, 'backIconDashicon', v); },
                        onChangeImageUrl: function (v) { updateItem(activeId, 'backIconImageUrl', v); }
                    }),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Title', 'blockenberg'), value: activeItem.backTitle, onChange: function (v) { updateItem(activeId, 'backTitle', v); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Text', 'blockenberg'), value: activeItem.backText, onChange: function (v) { updateItem(activeId, 'backText', v); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Button Text', 'blockenberg'), value: activeItem.backBtnText, onChange: function (v) { updateItem(activeId, 'backBtnText', v); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Button URL', 'blockenberg'), value: activeItem.backBtnUrl, onChange: function (v) { updateItem(activeId, 'backBtnUrl', v); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelColorSettings, {
                        title: __('Back Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: activeItem.backBg, onChange: function (c) { updateItem(activeId, 'backBg', c || ''); }, label: __('Background', 'blockenberg') },
                            { value: activeItem.backColor, onChange: function (c) { updateItem(activeId, 'backColor', c || ''); }, label: __('Text Color', 'blockenberg') },
                            { value: activeItem.backBtnBg, onChange: function (c) { updateItem(activeId, 'backBtnBg', c || ''); }, label: __('Button Background', 'blockenberg') },
                            { value: activeItem.backBtnColor, onChange: function (c) { updateItem(activeId, 'backBtnColor', c || ''); }, label: __('Button Text', 'blockenberg') }
                        ]
                    })
                ),

                // Grid settings
                el(PanelBody, { title: __('Grid & Layout', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Columns', 'blockenberg'), value: a.columns, min: 1, max: 6, onChange: function (v) { setAttributes({ columns: v }); } }),
                    el(RangeControl, { label: __('Gap', 'blockenberg'), value: a.gap, min: 0, max: 60, onChange: function (v) { setAttributes({ gap: v }); } }),
                    el(RangeControl, { label: __('Card Height (px)', 'blockenberg'), value: a.cardHeight, min: 160, max: 600, onChange: function (v) { setAttributes({ cardHeight: v }); } }),
                    el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: a.borderRadius, min: 0, max: 40, onChange: function (v) { setAttributes({ borderRadius: v }); } }),
                    el(SelectControl, { label: __('Text Align', 'blockenberg'), value: a.textAlign, options: alignOptions, onChange: function (v) { setAttributes({ textAlign: v }); } })
                ),

                // Flip settings
                el(PanelBody, { title: __('Flip Settings', 'blockenberg'), initialOpen: false },
                    el(SelectControl, { label: __('Flip Direction', 'blockenberg'), value: a.flipDirection, options: flipDirOptions, onChange: function (v) { setAttributes({ flipDirection: v }); } }),
                    el(SelectControl, { label: __('Flip Trigger', 'blockenberg'), value: a.flipTrigger, options: flipTriggerOptions, onChange: function (v) { setAttributes({ flipTrigger: v }); } }),
                    el(RangeControl, { label: __('Flip Speed (ms)', 'blockenberg'), value: a.flipSpeed, min: 200, max: 1200, step: 50, onChange: function (v) { setAttributes({ flipSpeed: v }); } })
                ),

                // Typography
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Icon Size', 'blockenberg'), value: a.iconSize, min: 20, max: 80, onChange: function (v) { setAttributes({ iconSize: v }); } }),
                    TC && el(TC, { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                    TC && el(TC, { label: __('Text', 'blockenberg'), value: a.typoText, onChange: function (v) { setAttributes({ typoText: v }); } }),
                    el(ToggleControl, { label: __('Show Front Text', 'blockenberg'), checked: a.showFrontText, onChange: function (v) { setAttributes({ showFrontText: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Back Button', 'blockenberg'), checked: a.showBackBtn, onChange: function (v) { setAttributes({ showBackBtn: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Button Font Size', 'blockenberg'), value: a.btnFontSize, min: 11, max: 20, onChange: function (v) { setAttributes({ btnFontSize: v }); } })
                ),

                // Button
                el(PanelBody, { title: __('Button Style', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Button Border Radius', 'blockenberg'), value: a.btnRadius, min: 0, max: 50, onChange: function (v) { setAttributes({ btnRadius: v }); } }),
                    el(RangeControl, { label: __('Button Padding H', 'blockenberg'), value: a.btnPadding, min: 6, max: 40, onChange: function (v) { setAttributes({ btnPadding: v }); } }),
                    )
            );

            var wrapStyle = Object.assign({
                '--bkbg-cfb-cols': a.columns,
                '--bkbg-cfb-gap': a.gap + 'px',
                '--bkbg-cfb-height': a.cardHeight + 'px',
                '--bkbg-cfb-radius': a.borderRadius + 'px',
                '--bkbg-cfb-speed': (a.flipSpeed / 1000) + 's',
                '--bkbg-cfb-icon-size': a.iconSize + 'px',
                '--bkbg-cfb-title-size': a.titleSize + 'px',
                '--bkbg-cfb-text-size': a.textSize + 'px',
                '--bkbg-cfb-btn-radius': a.btnRadius + 'px',
                '--bkbg-cfb-btn-padding': a.btnPadding + 'px',
                '--bkbg-cfb-btn-font': a.btnFontSize + 'px'
            }, tv(a.typoTitle, '--bkcfb-title-'), tv(a.typoText, '--bkcfb-text-'));

            function renderFace(item, face, isBack) {
                var bg = isBack ? item.backBg : item.frontBg;
                var color = isBack ? item.backColor : item.frontColor;
                var icon = isBack ? item.backIcon : item.frontIcon;
                var iconType = isBack ? (item.backIconType || 'custom-char') : (item.frontIconType || 'custom-char');
                var iconDash = isBack ? item.backIconDashicon : item.frontIconDashicon;
                var iconImg = isBack ? item.backIconImageUrl : item.frontIconImageUrl;
                var iconDashColor = isBack ? item.backIconDashiconColor : item.frontIconDashiconColor;
                var title = isBack ? item.backTitle : item.frontTitle;
                var text = isBack ? item.backText : item.frontText;
                var faceClass = 'bkbg-cfb-face bkbg-cfb-' + (isBack ? 'back' : 'front');

                return el('div', {
                    className: faceClass,
                    style: { background: bg, color: color, textAlign: a.textAlign }
                },
                    icon && el('div', { className: 'bkbg-cfb-icon' },
                        iconType !== 'custom-char' ? IP().buildEditorIcon(iconType, icon, iconDash, iconImg, iconDashColor) : icon
                    ),
                    el('div', { className: 'bkbg-cfb-title' }, title),
                    (!isBack && a.showFrontText && text) && el('div', { className: 'bkbg-cfb-text' }, text),
                    (isBack && text) && el('div', { className: 'bkbg-cfb-text' }, text),
                    (isBack && a.showBackBtn && item.backBtnText) && el('a', {
                        className: 'bkbg-cfb-btn',
                        href: '#',
                        onClick: function (e) { e.preventDefault(); },
                        style: {
                            background: item.backBtnBg,
                            color: item.backBtnColor,
                            borderRadius: a.btnRadius + 'px',
                            padding: '8px ' + a.btnPadding + 'px',
                            fontSize: a.btnFontSize + 'px'
                        }
                    }, item.backBtnText)
                );
            }

            var blockProps = useBlockProps({ className: 'bkbg-editor-wrap', 'data-block-label': 'Content Flip Box' });

            return el('div', blockProps,
                inspector,
                el('div', { className: 'bkbg-cfb-grid bkbg-editor-flip-grid', style: wrapStyle },
                    a.items.map(function (item) {
                        var isFlippedInEditor = !!flipped[item.id];
                        var isActive = item.id === activeId;
                        return el('div', {
                            key: item.id,
                            className: 'bkbg-cfb-card' + (isActive ? ' bkbg-cfb-card--active' : ''),
                            style: { height: a.cardHeight + 'px', borderRadius: a.borderRadius + 'px', overflow: 'hidden', position: 'relative', cursor: 'pointer' },
                            onClick: function () { setActiveId(isActive ? null : item.id); }
                        },
                            // Flip toggle button
                            el('button', {
                                className: 'bkbg-cfb-editor-flip-btn',
                                title: isFlippedInEditor ? __('Show Front', 'blockenberg') : __('Show Back', 'blockenberg'),
                                onClick: function (e) { e.stopPropagation(); toggleFlip(item.id); }
                            }, isFlippedInEditor ? '◀' : '▶'),
                            // Active indicator
                            isActive && el('div', { className: 'bkbg-cfb-editor-active-badge' }, '✏'),
                            // Show either front or back face in editor
                            renderFace(item, 'front', isFlippedInEditor)
                        );
                    })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var tv = window._bkbgCFBgetTV || function () { return {}; };

            var wrapStyle = Object.assign({
                '--bkbg-cfb-cols': a.columns,
                '--bkbg-cfb-gap': a.gap + 'px',
                '--bkbg-cfb-height': a.cardHeight + 'px',
                '--bkbg-cfb-radius': a.borderRadius + 'px',
                '--bkbg-cfb-speed': (a.flipSpeed / 1000) + 's',
                '--bkbg-cfb-icon-size': a.iconSize + 'px',
                '--bkbg-cfb-title-size': a.titleSize + 'px',
                '--bkbg-cfb-text-size': a.textSize + 'px',
                '--bkbg-cfb-btn-radius': a.btnRadius + 'px',
                '--bkbg-cfb-btn-padding': a.btnPadding + 'px',
                '--bkbg-cfb-btn-font': a.btnFontSize + 'px'
            }, tv(a.typoTitle, '--bkcfb-title-'), tv(a.typoText, '--bkcfb-text-'));

            return el('div', {
                className: 'bkbg-cfb-grid',
                style: wrapStyle,
                'data-trigger': a.flipTrigger,
                'data-direction': a.flipDirection
            },
                a.items.map(function (item, idx) {
                    return el('div', { key: idx, className: 'bkbg-cfb-card' },
                        el('div', { className: 'bkbg-cfb-inner' },
                            // Front face
                            el('div', { className: 'bkbg-cfb-face bkbg-cfb-front', style: { background: item.frontBg, color: item.frontColor, textAlign: a.textAlign } },
                                item.frontIcon && el('div', { className: 'bkbg-cfb-icon' },
                                    (item.frontIconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(item.frontIconType, item.frontIcon, item.frontIconDashicon, item.frontIconImageUrl, item.frontIconDashiconColor) : item.frontIcon
                                ),
                                el('div', { className: 'bkbg-cfb-title' }, item.frontTitle),
                                (a.showFrontText && item.frontText) && el('div', { className: 'bkbg-cfb-text' }, item.frontText)
                            ),
                            // Back face
                            el('div', { className: 'bkbg-cfb-face bkbg-cfb-back', style: { background: item.backBg, color: item.backColor, textAlign: a.textAlign } },
                                item.backIcon && el('div', { className: 'bkbg-cfb-icon' },
                                    (item.backIconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(item.backIconType, item.backIcon, item.backIconDashicon, item.backIconImageUrl, item.backIconDashiconColor) : item.backIcon
                                ),
                                el('div', { className: 'bkbg-cfb-title' }, item.backTitle),
                                item.backText && el('div', { className: 'bkbg-cfb-text' }, item.backText),
                                (a.showBackBtn && item.backBtnText) && el('a', {
                                    className: 'bkbg-cfb-btn',
                                    href: item.backBtnUrl || '#',
                                    style: {
                                        background: item.backBtnBg,
                                        color: item.backBtnColor,
                                        borderRadius: a.btnRadius + 'px',
                                        padding: '8px ' + a.btnPadding + 'px',
                                        fontSize: a.btnFontSize + 'px'
                                    }
                                }, item.backBtnText)
                            )
                        )
                    );
                })
            );
        }
    });
}() );
