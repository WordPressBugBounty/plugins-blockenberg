/* ====================================================
   Page List Block — editor (index.js)
   Block: blockenberg/page-list
   ==================================================== */
( function () {
    var el            = wp.element.createElement;
    var useState      = wp.element.useState;
    var Fragment      = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelBody          = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;
    var ToggleControl      = wp.components.ToggleControl;
    var TextControl        = wp.components.TextControl;
    var Button             = wp.components.Button;
    var __                 = wp.i18n.__;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    /* ── helpers ── */
    function uid() {
        return 'pgl-' + Math.random().toString(36).slice(2, 7);
    }

    function move(arr, from, to) {
        var a = arr.slice();
        a.splice(to, 0, a.splice(from, 1)[0]);
        return a;
    }

    function buildWrapStyle(attrs) {
        return {
            '--bkbg-pgl-cols':        attrs.columns,
            '--bkbg-pgl-gap':         attrs.gap + 'px',
            '--bkbg-pgl-font':        attrs.fontSize + 'px',
            '--bkbg-pgl-weight':      attrs.fontWeight,
            '--bkbg-pgl-desc-font':   attrs.descFontSize + 'px',
            '--bkbg-pgl-icon-size':   attrs.iconSize + 'px',
            '--bkbg-pgl-radius':      attrs.borderRadius + 'px',
            '--bkbg-pgl-pad-v':       attrs.itemPaddingV + 'px',
            '--bkbg-pgl-pad-h':       attrs.itemPaddingH + 'px',
            '--bkbg-pgl-link-color':  attrs.linkColor,
            '--bkbg-pgl-link-hover':  attrs.linkColorHover,
            '--bkbg-pgl-bg':          attrs.bgColor,
            '--bkbg-pgl-bg-hover':    attrs.bgColorHover,
            '--bkbg-pgl-border':      attrs.borderColor,
            '--bkbg-pgl-icon-color':  attrs.iconColor,
            '--bkbg-pgl-desc-color':  attrs.descColor,
            '--bkbg-pgl-chev-color':  attrs.chevronColor,
            '--bkbg-pgl-accent':      attrs.accentColor,
            maxWidth:                 attrs.maxWidth,
        };
    }

    /* ── single list item (editor) ── */
    function EditorItem(props) {
        var item       = props.item;
        var depth      = props.depth;
        var showIcons  = props.showIcons;
        var showDesc   = props.showDescription;
        var showChev   = props.showChevron;
        var layout     = props.layout;

        var chevron = el('span', { className: 'bkbg-pgl-chevron', 'aria-hidden': 'true' }, '›');
        var iconEl  = showIcons ? el('span', { className: 'bkbg-pgl-icon' }, (item.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(item.iconType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor) : (item.icon || '📄')) : null;
        var descEl  = showDesc && item.description ? el('span', { className: 'bkbg-pgl-desc' }, item.description) : null;

        var label = el('span', { className: 'bkbg-pgl-label' }, item.title || __('Page title', 'blockenberg'));
        var inner = el(
            'span', { className: 'bkbg-pgl-link-inner' },
            iconEl, el('span', { className: 'bkbg-pgl-text-wrap' }, label, descEl), showChev ? chevron : null
        );
        var link = el('a', { className: 'bkbg-pgl-link', href: item.url || '#', onClick: function(e){ e.preventDefault(); } }, inner);
        var li   = el('li', { className: 'bkbg-pgl-item' }, link);

        if (depth >= 2 && item.children && item.children.length) {
            var subItems = item.children.map(function(child) {
                var cIcon  = showIcons ? el('span', { className: 'bkbg-pgl-icon bkbg-pgl-icon--child' }, (child.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(child.iconType, child.icon, child.iconDashicon, child.iconImageUrl, child.iconDashiconColor) : (child.icon || '📄')) : null;
                var cLabel = el('span', { className: 'bkbg-pgl-label' }, child.title || __('Sub-page', 'blockenberg'));
                var cInner = el('span', { className: 'bkbg-pgl-link-inner' }, cIcon, el('span', { className: 'bkbg-pgl-text-wrap' }, cLabel));
                return el('li', { key: child.id, className: 'bkbg-pgl-item bkbg-pgl-item--child' },
                    el('a', { className: 'bkbg-pgl-link bkbg-pgl-link--child', href: child.url || '#', onClick: function(e){ e.preventDefault(); } }, cInner)
                );
            });
            return el(Fragment, null, li, el('ul', { className: 'bkbg-pgl-children' }, subItems));
        }
        return li;
    }

    /* ── editor for one item in inspector ── */
    function ItemEditor(props) {
        var item      = props.item;
        var onChange  = props.onChange;
        var onRemove  = props.onRemove;

        var childRows = (item.children || []).map(function(c, ci) {
            return el('div', { key: c.id, style: { background: '#f8f9fa', borderRadius: '6px', padding: '8px', marginBottom: '4px' } },
                el(TextControl, {
                    label: __('Sub-page title', 'blockenberg'),
                    value: c.title,
                    onChange: function(v) {
                        var newChildren = item.children.slice();
                        newChildren[ci] = Object.assign({}, c, { title: v });
                        onChange({ children: newChildren });
                    }
                }),
                el(TextControl, {
                    label: __('URL', 'blockenberg'),
                    value: c.url,
                    onChange: function(v) {
                        var newChildren = item.children.slice();
                        newChildren[ci] = Object.assign({}, c, { url: v });
                        onChange({ children: newChildren });
                    }
                }),
                el(IP().IconPickerControl, { iconType: c.iconType || 'custom-char', customChar: c.icon || '', dashicon: c.iconDashicon || '', imageUrl: c.iconImageUrl || '', onChangeType: function (v) {
                        var newChildren = item.children.slice();
                        newChildren[ci] = Object.assign({}, c, { iconType: v });
                        onChange({ children: newChildren });
                    }, onChangeChar: function (v) {
                        var newChildren = item.children.slice();
                        newChildren[ci] = Object.assign({}, c, { icon: v });
                        onChange({ children: newChildren });
                    }, onChangeDashicon: function (v) {
                        var newChildren = item.children.slice();
                        newChildren[ci] = Object.assign({}, c, { iconDashicon: v });
                        onChange({ children: newChildren });
                    }, onChangeImageUrl: function (v) {
                        var newChildren = item.children.slice();
                        newChildren[ci] = Object.assign({}, c, { iconImageUrl: v });
                        onChange({ children: newChildren });
                    } }),
                el(Button, {
                    isDestructive: true,
                    variant: 'tertiary',
                    onClick: function() {
                        var newChildren = item.children.filter(function(_, i) { return i !== ci; });
                        onChange({ children: newChildren });
                    }
                }, __('Remove sub-page', 'blockenberg'))
            );
        });

        return el(Fragment, null,
            el(TextControl, { label: __('Page Title', 'blockenberg'), value: item.title, onChange: function(v){ onChange({ title: v }); } }),
            el(TextControl, { label: __('URL', 'blockenberg'), value: item.url, onChange: function(v){ onChange({ url: v }); } }),
            el(IP().IconPickerControl, { iconType: item.iconType || 'custom-char', customChar: item.icon || '', dashicon: item.iconDashicon || '', imageUrl: item.iconImageUrl || '', onChangeType: function (v) { onChange({ iconType: v }); }, onChangeChar: function (v) { onChange({ icon: v }); }, onChangeDashicon: function (v) { onChange({ iconDashicon: v }); }, onChangeImageUrl: function (v) { onChange({ iconImageUrl: v }); } }),
            el(TextControl, { label: __('Description', 'blockenberg'), value: item.description, onChange: function(v){ onChange({ description: v }); }, help: __('Short subtitle shown below the title.', 'blockenberg') }),
            childRows.length ? el('div', { style: { marginTop: '8px' } }, el('strong', null, __('Sub-pages', 'blockenberg')), el('div', { style: { marginTop: '4px' } }, childRows)) : null,
            el(Button, {
                variant: 'secondary',
                style: { marginTop: '6px', width: '100%' },
                onClick: function() {
                    onChange({ children: (item.children || []).concat([{ id: uid(), title: 'Sub-page', url: '#', icon: '📄', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '' }]) });
                }
            }, __('+ Add Sub-page', 'blockenberg')),
            el('hr', { style: { margin: '12px 0' } }),
            el(Button, { isDestructive: true, variant: 'tertiary', onClick: onRemove }, __('Remove page', 'blockenberg'))
        );
    }

    /* ── REGISTER ── */
    registerBlockType('blockenberg/page-list', {
        edit: function (props) {
            var attrs      = props.attributes;
            var setAttr    = props.setAttributes;
            var items      = attrs.items;

            var _useState  = useState(null);
            var activeId   = _useState[0];
            var setActiveId = _useState[1];

            var blockProps = useBlockProps((function () {
                var tv = getTypoCssVars();
                var s = {
                    '--bkbg-pgl-cols':        attrs.columns,
                    '--bkbg-pgl-gap':         attrs.gap + 'px',
                    '--bkbg-pgl-icon-size':   attrs.iconSize + 'px',
                    '--bkbg-pgl-radius':      attrs.borderRadius + 'px',
                    '--bkbg-pgl-pad-v':       attrs.itemPaddingV + 'px',
                    '--bkbg-pgl-pad-h':       attrs.itemPaddingH + 'px',
                    '--bkbg-pgl-link-color':  attrs.linkColor,
                    '--bkbg-pgl-link-hover':  attrs.linkColorHover,
                    '--bkbg-pgl-bg':          attrs.bgColor,
                    '--bkbg-pgl-bg-hover':    attrs.bgColorHover,
                    '--bkbg-pgl-border':      attrs.borderColor,
                    '--bkbg-pgl-icon-color':  attrs.iconColor,
                    '--bkbg-pgl-desc-color':  attrs.descColor,
                    '--bkbg-pgl-chev-color':  attrs.chevronColor,
                    '--bkbg-pgl-accent':      attrs.accentColor,
                    maxWidth:                 attrs.maxWidth,
                };
                Object.assign(s, tv(attrs.linkTypo, '--bkbg-pgl-lk-'));
                Object.assign(s, tv(attrs.descTypo, '--bkbg-pgl-ds-'));
                return { className: 'bkbg-pgl-wrap bkbg-editor-pgl bkbg-pgl-layout--' + attrs.layout, style: s };
            })());

            /* update single item by id */
            function updateItem(id, patch) {
                setAttr({ items: items.map(function(it) { return it.id === id ? Object.assign({}, it, patch) : it; }) });
            }

            /* Inspector */
            var activeItem = items.find(function(it) { return it.id === activeId; });

            var inspector = el(InspectorControls, null,
                /* Items */
                el(PanelBody, { title: __('Pages', 'blockenberg'), initialOpen: true },
                    items.map(function(item, idx) {
                        var isActive = activeId === item.id;
                        return el('div', { key: item.id },
                            el('div', {
                                style: {
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: isActive ? '#f3f0ff' : '#f8f9fa',
                                    border: isActive ? '1px solid #6c3fb5' : '1px solid #e2e8f0',
                                    borderRadius: '6px', padding: '6px 8px', marginBottom: '4px', cursor: 'pointer'
                                },
                                onClick: function() { setActiveId(isActive ? null : item.id); }
                            },
                                el('span', { style: { flex: 1, fontWeight: 500, fontSize: '13px' } }, (item.icon ? item.icon + '  ' : '') + (item.title || __('(untitled)', 'blockenberg'))),
                                el(Button, { icon: 'arrow-up', label: __('Move up', 'blockenberg'), isSmall: true, disabled: idx === 0,
                                    onClick: function(e){ e.stopPropagation(); setAttr({ items: move(items, idx, idx - 1) }); } }),
                                el(Button, { icon: 'arrow-down', label: __('Move down', 'blockenberg'), isSmall: true, disabled: idx === items.length - 1,
                                    onClick: function(e){ e.stopPropagation(); setAttr({ items: move(items, idx, idx + 1) }); } }),
                                el(Button, { icon: 'no-alt', label: __('Remove', 'blockenberg'), isSmall: true, isDestructive: true,
                                    onClick: function(e){ e.stopPropagation(); setAttr({ items: items.filter(function(_, i){ return i !== idx; }) }); if (activeId === item.id) setActiveId(null); } })
                            ),
                            isActive ? el('div', { style: { padding: '8px', background: '#faf8ff', borderRadius: '0 0 6px 6px', border: '1px solid #6c3fb5', borderTop: 'none', marginBottom: '4px' } },
                                el(ItemEditor, {
                                    item: item,
                                    onChange: function(patch){ updateItem(item.id, patch); },
                                    onRemove: function(){ setAttr({ items: items.filter(function(i){ return i.id !== item.id; }) }); setActiveId(null); }
                                })
                            ) : null
                        );
                    }),
                    el(Button, { variant: 'primary', style: { marginTop: '8px', width: '100%' },
                        onClick: function() { var n = { id: uid(), title: 'New Page', url: '#', icon: '📄', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', description: '', children: [] }; setAttr({ items: items.concat([n]) }); setActiveId(n.id); }
                    }, __('+ Add Page', 'blockenberg'))
                ),

                /* Layout */
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'),
                        value: attrs.layout,
                        options: [
                            { label: __('Plain',    'blockenberg'), value: 'plain'    },
                            { label: __('Bordered', 'blockenberg'), value: 'bordered' },
                            { label: __('Pills',    'blockenberg'), value: 'pills'    },
                            { label: __('Cards',    'blockenberg'), value: 'cards'    },
                            { label: __('Sidebar',  'blockenberg'), value: 'sidebar'  },
                        ],
                        onChange: function(v){ setAttr({ layout: v }); }
                    }),
                    el(RangeControl, { label: __('Columns', 'blockenberg'), value: attrs.columns, min: 1, max: 4, onChange: function(v){ setAttr({ columns: v }); } }),
                    el(SelectControl, {
                        label: __('Sub-page depth', 'blockenberg'),
                        value: String(attrs.depth),
                        options: [
                            { label: __('1 level (no sub-pages)', 'blockenberg'), value: '1' },
                            { label: __('2 levels (show sub-pages)', 'blockenberg'), value: '2' },
                        ],
                        onChange: function(v){ setAttr({ depth: parseInt(v) }); }
                    }),
                    el(ToggleControl, { label: __('Show icons',       'blockenberg'), checked: attrs.showIcons,       onChange: function(v){ setAttr({ showIcons: v }); } }),
                    el(ToggleControl, { label: __('Show description', 'blockenberg'), checked: attrs.showDescription, onChange: function(v){ setAttr({ showDescription: v }); } }),
                    el(ToggleControl, { label: __('Show chevron',     'blockenberg'), checked: attrs.showChevron,     onChange: function(v){ setAttr({ showChevron: v }); } }),
                    el(SelectControl, {
                        label: __('Link target', 'blockenberg'),
                        value: attrs.linkTarget,
                        options: [
                            { label: __('Same tab', 'blockenberg'),  value: '_self'  },
                            { label: __('New tab',  'blockenberg'),  value: '_blank' },
                        ],
                        onChange: function(v){ setAttr({ linkTarget: v }); }
                    }),
                    el(TextControl, { label: __('Max Width', 'blockenberg'), value: attrs.maxWidth, onChange: function(v){ setAttr({ maxWidth: v }); } })
                ),

                /* Spacing & Shape */
                el(PanelBody, { title: __('Spacing & Shape', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Item gap (px)',          'blockenberg'), value: attrs.gap,           min: 0, max: 40, onChange: function(v){ setAttr({ gap: v }); } }),
                    el(RangeControl, { label: __('Padding vertical (px)',  'blockenberg'), value: attrs.itemPaddingV,  min: 0, max: 40, onChange: function(v){ setAttr({ itemPaddingV: v }); } }),
                    el(RangeControl, { label: __('Padding horizontal (px)','blockenberg'), value: attrs.itemPaddingH,  min: 0, max: 60, onChange: function(v){ setAttr({ itemPaddingH: v }); } }),
                    el(RangeControl, { label: __('Border radius (px)',     'blockenberg'), value: attrs.borderRadius,  min: 0, max: 50, onChange: function(v){ setAttr({ borderRadius: v }); } })
                ),

                /* Typography */
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(getTypoControl(), { label: __('Link', 'blockenberg'), value: attrs.linkTypo, onChange: function (v) { setAttr({ linkTypo: v }); } }),
                    el(getTypoControl(), { label: __('Description', 'blockenberg'), value: attrs.descTypo, onChange: function (v) { setAttr({ descTypo: v }); } }),
                    el(RangeControl, { label: __('Icon size (px)', 'blockenberg'), value: attrs.iconSize, min: 12, max: 48, onChange: function(v){ setAttr({ iconSize: v }); } })
                ),

                /* Colors */
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Link color',         'blockenberg'), value: attrs.linkColor,      onChange: function(v){ setAttr({ linkColor: v || '' }); } },
                        { label: __('Link hover color',   'blockenberg'), value: attrs.linkColorHover, onChange: function(v){ setAttr({ linkColorHover: v || '' }); } },
                        { label: __('Background',         'blockenberg'), value: attrs.bgColor,        onChange: function(v){ setAttr({ bgColor: v || '' }); } },
                        { label: __('Background hover',   'blockenberg'), value: attrs.bgColorHover,   onChange: function(v){ setAttr({ bgColorHover: v || '' }); } },
                        { label: __('Border color',       'blockenberg'), value: attrs.borderColor,    onChange: function(v){ setAttr({ borderColor: v || '' }); } },
                        { label: __('Icon color',         'blockenberg'), value: attrs.iconColor,      onChange: function(v){ setAttr({ iconColor: v || '' }); } },
                        { label: __('Description color',  'blockenberg'), value: attrs.descColor,      onChange: function(v){ setAttr({ descColor: v || '' }); } },
                        { label: __('Chevron color',      'blockenberg'), value: attrs.chevronColor,   onChange: function(v){ setAttr({ chevronColor: v || '' }); } },
                        { label: __('Accent color',       'blockenberg'), value: attrs.accentColor,    onChange: function(v){ setAttr({ accentColor: v || '' }); } },
                    ]
                })
            );

            /* Preview */
            var listItems = items.map(function(item) {
                return el(EditorItem, Object.assign({ key: item.id }, { item: item, depth: attrs.depth, showIcons: attrs.showIcons, showDescription: attrs.showDescription, showChevron: attrs.showChevron, layout: attrs.layout }));
            });

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el('ul', { className: 'bkbg-pgl-list' }, listItems)
                )
            );
        },

        save: function (props) {
            var a  = props.attributes;
            var tv = getTypoCssVars();
            var s = {
                '--bkbg-pgl-cols':        a.columns,
                '--bkbg-pgl-gap':         a.gap + 'px',
                '--bkbg-pgl-icon-size':   a.iconSize + 'px',
                '--bkbg-pgl-radius':      a.borderRadius + 'px',
                '--bkbg-pgl-pad-v':       a.itemPaddingV + 'px',
                '--bkbg-pgl-pad-h':       a.itemPaddingH + 'px',
                '--bkbg-pgl-link-color':  a.linkColor,
                '--bkbg-pgl-link-hover':  a.linkColorHover,
                '--bkbg-pgl-bg':          a.bgColor,
                '--bkbg-pgl-bg-hover':    a.bgColorHover,
                '--bkbg-pgl-border':      a.borderColor,
                '--bkbg-pgl-icon-color':  a.iconColor,
                '--bkbg-pgl-desc-color':  a.descColor,
                '--bkbg-pgl-chev-color':  a.chevronColor,
                '--bkbg-pgl-accent':      a.accentColor,
                maxWidth:                 a.maxWidth,
            };
            Object.assign(s, tv(a.linkTypo, '--bkbg-pgl-lk-'));
            Object.assign(s, tv(a.descTypo, '--bkbg-pgl-ds-'));
            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-pgl-wrap bkbg-pgl-layout--' + a.layout, style: s });

            function saveChild(child) {
                var cIcon = a.showIcons ? el('span', { className: 'bkbg-pgl-icon bkbg-pgl-icon--child' }, (child.iconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(child.iconType, child.icon, child.iconDashicon, child.iconImageUrl, child.iconDashiconColor) : child.icon) : null;
                var cLabel = el('span', { className: 'bkbg-pgl-label' }, child.title);
                var cInner = el('span', { className: 'bkbg-pgl-link-inner' }, cIcon, el('span', { className: 'bkbg-pgl-text-wrap' }, cLabel));
                return el('li', { key: child.id, className: 'bkbg-pgl-item bkbg-pgl-item--child' },
                    el('a', { className: 'bkbg-pgl-link bkbg-pgl-link--child', href: child.url, target: a.linkTarget }, cInner)
                );
            }

            function saveItem(item) {
                var iconEl  = a.showIcons ? el('span', { className: 'bkbg-pgl-icon' }, (item.iconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(item.iconType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor) : item.icon) : null;
                var descEl  = a.showDescription && item.description ? el('span', { className: 'bkbg-pgl-desc' }, item.description) : null;
                var chevron = a.showChevron ? el('span', { className: 'bkbg-pgl-chevron', 'aria-hidden': 'true' }, '›') : null;
                var label   = el('span', { className: 'bkbg-pgl-label' }, item.title);
                var textWrap = el('span', { className: 'bkbg-pgl-text-wrap' }, label, descEl);
                var inner   = el('span', { className: 'bkbg-pgl-link-inner' }, iconEl, textWrap, chevron);
                var link    = el('a', { className: 'bkbg-pgl-link', href: item.url, target: a.linkTarget }, inner);
                var li      = el('li', { className: 'bkbg-pgl-item' }, link);
                if (a.depth >= 2 && item.children && item.children.length) {
                    var sub = el('ul', { className: 'bkbg-pgl-children' }, item.children.map(saveChild));
                    return el(wp.element.Fragment, { key: item.id }, li, sub);
                }
                return el('li', { key: item.id, className: 'bkbg-pgl-item' }, link);
            }

            return el('div', blockProps,
                el('ul', { className: 'bkbg-pgl-list' }, a.items.map(saveItem))
            );
        },

        deprecated: [{
            save: function (props) {
                var a = props.attributes;
                var wrapStyle = buildWrapStyle(a);
                var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-pgl-wrap bkbg-pgl-layout--' + a.layout, style: wrapStyle });

                function saveChild(child) {
                    var cIcon = a.showIcons ? el('span', { className: 'bkbg-pgl-icon bkbg-pgl-icon--child' }, child.icon) : null;
                    var cLabel = el('span', { className: 'bkbg-pgl-label' }, child.title);
                    var cInner = el('span', { className: 'bkbg-pgl-link-inner' }, cIcon, el('span', { className: 'bkbg-pgl-text-wrap' }, cLabel));
                    return el('li', { key: child.id, className: 'bkbg-pgl-item bkbg-pgl-item--child' },
                        el('a', { className: 'bkbg-pgl-link bkbg-pgl-link--child', href: child.url, target: a.linkTarget }, cInner)
                    );
                }

                function saveItem(item) {
                    var iconEl  = a.showIcons ? el('span', { className: 'bkbg-pgl-icon' }, item.icon) : null;
                    var descEl  = a.showDescription && item.description ? el('span', { className: 'bkbg-pgl-desc' }, item.description) : null;
                    var chevron = a.showChevron ? el('span', { className: 'bkbg-pgl-chevron', 'aria-hidden': 'true' }, '\u203A') : null;
                    var label   = el('span', { className: 'bkbg-pgl-label' }, item.title);
                    var textWrap = el('span', { className: 'bkbg-pgl-text-wrap' }, label, descEl);
                    var inner   = el('span', { className: 'bkbg-pgl-link-inner' }, iconEl, textWrap, chevron);
                    var link    = el('a', { className: 'bkbg-pgl-link', href: item.url, target: a.linkTarget }, inner);
                    var li      = el('li', { className: 'bkbg-pgl-item' }, link);
                    if (a.depth >= 2 && item.children && item.children.length) {
                        var sub = el('ul', { className: 'bkbg-pgl-children' }, item.children.map(saveChild));
                        return el(wp.element.Fragment, { key: item.id }, li, sub);
                    }
                    return el('li', { key: item.id, className: 'bkbg-pgl-item' }, link);
                }

                return el('div', blockProps,
                    el('ul', { className: 'bkbg-pgl-list' }, a.items.map(saveItem))
                );
            }
        }]
    });
}() );
