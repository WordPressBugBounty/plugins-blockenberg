( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody    = wp.components.PanelBody;
    var Button       = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl  = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ColorPicker  = wp.components.ColorPicker;
    var Popover      = wp.components.Popover;

    var NAV_STYLE_OPTIONS = [
        { label: __('Sidebar nav', 'blockenberg'), value: 'sidebar' },
        { label: __('Tabs',        'blockenberg'), value: 'tabs' },
    ];
    var NAV_POS_OPTIONS = [
        { label: __('Left',  'blockenberg'), value: 'left' },
        { label: __('Right', 'blockenberg'), value: 'right' },
    ];
    var ICON_TYPE_OPTIONS = [
        { label: __('Plus / Minus', 'blockenberg'), value: 'plus' },
        { label: __('Chevron',      'blockenberg'), value: 'chevron' },
        { label: __('Arrow',        'blockenberg'), value: 'arrow' },
    ];

    function iconChar(type, open) {
        if (type === 'chevron') return open ? '▲' : '▼';
        if (type === 'arrow')   return open ? '↑' : '↓';
        return open ? '−' : '+';
    }

    function makeId() { return 'c' + Math.random().toString(36).substr(2, 6); }

    var _faqcTC, _faqcTV;
    function _tc() { return _faqcTC || (_faqcTC = window.bkbgTypographyControl); }
    function _tv(o, p) { if (!_faqcTV) _faqcTV = window.bkbgTypoCssVars; return _faqcTV ? _faqcTV(o, p) : {}; }
    var IP = function () { return window.bkbgIconPicker; };

    function buildWrapStyle(a) {
        return Object.assign({
            '--bkbg-faqc-accent':       a.accentColor,
            '--bkbg-faqc-nav-bg':       a.navBg,
            '--bkbg-faqc-nav-active-bg':a.navActiveBg,
            '--bkbg-faqc-nav-active':   a.navActiveColor,
            '--bkbg-faqc-nav-inactive': a.navInactiveColor,
            '--bkbg-faqc-q-color':      a.questionColor,
            '--bkbg-faqc-a-color':      a.answerColor,
            '--bkbg-faqc-item-bg':      a.itemBg,
            '--bkbg-faqc-item-border':  a.itemBorderColor,
            '--bkbg-faqc-icon-color':   a.iconColor,
            '--bkbg-faqc-nav-r':        a.navRadius + 'px',
            '--bkbg-faqc-item-r':       a.itemRadius + 'px',
            '--bkbg-faqc-item-gap':     a.itemGap + 'px',
            '--bkbg-faqc-q-pad':        a.questionPadding + 'px',
            '--bkbg-faqc-a-pad':        a.answerPadding + 'px',
            '--bkbg-faqc-nav-w':        a.navWidth + 'px',
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        },
        _tv(a.typoNavLabel, '--bkbg-faqc-nl-'),
        _tv(a.typoQuestion, '--bkbg-faqc-qt-'),
        _tv(a.typoAnswer, '--bkbg-faqc-an-'));
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

    /* ── FaqItem component ─────────────────────────────────────────────── */
    function FaqItem(props) {
        var item = props.item;
        var a    = props.a;
        var openState = useState(props.expandFirst && props.isFirst);
        var isOpen = openState[0];
        var setOpen = openState[1];
        return el('div', { className: 'bkbg-faqc-item', style: { background: a.itemBg, border: '1px solid ' + a.itemBorderColor, borderRadius: a.itemRadius + 'px', overflow: 'hidden', marginBottom: a.itemGap + 'px' } },
            el('button', { type: 'button', className: 'bkbg-faqc-q' + (isOpen ? ' is-open' : ''), onClick: function () { setOpen(!isOpen); }, style: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: a.questionPadding + 'px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '12px', color: a.questionColor } },
                el('span', null, item.question || __('Question goes here', 'blockenberg')),
                el('span', { style: { color: isOpen ? a.accentColor : a.iconColor, flexShrink: 0 } }, iconChar(a.iconType, isOpen))
            ),
            isOpen && el('div', { className: 'bkbg-faqc-a', style: { padding: '0 ' + a.answerPadding + 'px ' + a.answerPadding + 'px', color: a.answerColor } }, item.answer || __('Answer goes here.', 'blockenberg'))
        );
    }

    /* ── Nav item ──────────────────────────────────────────────────────── */
    function NavItem(props) {
        var cat = props.cat;
        var a   = props.a;
        var isActive = props.isActive;
        return el('button', { type: 'button', className: 'bkbg-faqc-nav-item' + (isActive ? ' is-active' : ''), onClick: props.onClick, style: { width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: isActive ? a.navActiveBg : 'transparent', color: isActive ? a.navActiveColor : a.navInactiveColor, border: 'none', cursor: 'pointer', borderRadius: a.navRadius + 'px', textAlign: 'left' } },
            a.showCatIcon && el('span', null, (cat.iconPickerType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(cat.iconPickerType, cat.icon, cat.iconDashicon, cat.iconImageUrl, cat.iconDashiconColor) : (cat.icon || '📂')),
            el('span', { style: { flex: 1 } }, cat.label),
            a.showCatCount && el('span', { style: { background: isActive ? a.accentColor : a.itemBorderColor, color: isActive ? '#fff' : a.navInactiveColor, borderRadius: '99px', padding: '2px 8px', fontSize: '12px', fontWeight: 700, flexShrink: 0 } }, cat.items ? cat.items.length : 0)
        );
    }

    registerBlockType('blockenberg/faq-categories', {
        title: __('FAQ with Categories', 'blockenberg'),
        icon: 'editor-help',
        category: 'bkbg-business',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var activeCatState = useState(0);
            var activeCat = activeCatState[0];
            var setActiveCat = activeCatState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateCat(id, key, val) {
                setAttributes({ categories: a.categories.map(function (c) { if (c.id !== id) return c; var u = Object.assign({}, c); u[key] = val; return u; }) });
            }
            function addItem(catId) {
                var cat = a.categories.find(function (c) { return c.id === catId; });
                var items = (cat.items || []).concat([{ id: makeId(), question: __('New question?', 'blockenberg'), answer: __('Answer goes here.', 'blockenberg') }]);
                updateCat(catId, 'items', items);
            }
            function updateItem(catId, itemId, key, val) {
                var cat = a.categories.find(function (c) { return c.id === catId; });
                updateCat(catId, 'items', (cat.items || []).map(function (item) { if (item.id !== itemId) return item; var u = Object.assign({}, item); u[key] = val; return u; }));
            }
            function removeItem(catId, itemId) {
                var cat = a.categories.find(function (c) { return c.id === catId; });
                updateCat(catId, 'items', (cat.items || []).filter(function (item) { return item.id !== itemId; }));
            }

            var safeCat = Math.min(activeCat, Math.max(0, a.categories.length - 1));
            var currentCat = a.categories[safeCat];

            var isSidebar = a.navStyle === 'sidebar';
            var navLeft   = isSidebar && a.navPosition === 'left';

            var navArea = el('div', { className: 'bkbg-faqc-nav', style: { flex: isSidebar ? '0 0 ' + a.navWidth + 'px' : '0 0 100%', background: a.navBg, borderRadius: a.navRadius + 'px', padding: '8px', display: 'flex', flexDirection: isSidebar ? 'column' : 'row', gap: '4px', overflowX: isSidebar ? 'hidden' : 'auto' } },
                a.categories.map(function (cat, i) {
                    return el(NavItem, { key: cat.id, cat: cat, a: a, isActive: i === safeCat, onClick: function () { setActiveCat(i); } });
                })
            );

            var questionsArea = el('div', { className: 'bkbg-faqc-questions', style: { flex: 1, minWidth: 0 } },
                a.showSearch && el('input', { type: 'text', readOnly: true, placeholder: a.searchPlaceholder || __('Search questions…', 'blockenberg'), style: { width: '100%', padding: '10px 14px', border: '1px solid ' + a.itemBorderColor, borderRadius: a.itemRadius + 'px', marginBottom: '16px', boxSizing: 'border-box' } }),
                currentCat && currentCat.items && currentCat.items.map(function (item, i) {
                    return el(FaqItem, { key: item.id, item: item, a: a, expandFirst: a.expandFirst, isFirst: i === 0 });
                })
            );

            var layoutStyle = { display: 'flex', flexDirection: isSidebar ? 'row' : 'column', gap: '24px', alignItems: isSidebar ? 'flex-start' : 'stretch' };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Settings', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Navigation style',   'blockenberg'), value: a.navStyle,    options: NAV_STYLE_OPTIONS,  onChange: function (v) { setAttributes({ navStyle: v }); } }),
                        a.navStyle === 'sidebar' && el(SelectControl, { label: __('Sidebar position',  'blockenberg'), value: a.navPosition, options: NAV_POS_OPTIONS,   onChange: function (v) { setAttributes({ navPosition: v }); } }),
                        a.navStyle === 'sidebar' && el(RangeControl,  { label: __('Sidebar width (px)', 'blockenberg'), value: a.navWidth, min: 160, max: 360,           onChange: function (v) { setAttributes({ navWidth: v }); } }),
                        el(SelectControl, { label: __('Accordion icon',     'blockenberg'), value: a.iconType,   options: ICON_TYPE_OPTIONS,  onChange: function (v) { setAttributes({ iconType: v }); } }),
                        el(ToggleControl, { label: __('Show category icon', 'blockenberg'), checked: a.showCatIcon, onChange: function (v) { setAttributes({ showCatIcon: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show item count',    'blockenberg'), checked: a.showCatCount, onChange: function (v) { setAttributes({ showCatCount: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Expand first item',  'blockenberg'), checked: a.expandFirst,  onChange: function (v) { setAttributes({ expandFirst: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Allow multiple open','blockenberg'), checked: a.allowMultiple, onChange: function (v) { setAttributes({ allowMultiple: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show search field',  'blockenberg'), checked: a.showSearch, onChange: function (v) { setAttributes({ showSearch: v }); }, __nextHasNoMarginBottom: true }),
                        a.showSearch && el(TextControl, { label: __('Search placeholder', 'blockenberg'), value: a.searchPlaceholder, onChange: function (v) { setAttributes({ searchPlaceholder: v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        _tc() && _tc()({ label: __('Nav Label', 'blockenberg'), typo: a.typoNavLabel, onChange: function (v) { setAttributes({ typoNavLabel: v }); } }),
                        _tc() && _tc()({ label: __('Question', 'blockenberg'), typo: a.typoQuestion, onChange: function (v) { setAttributes({ typoQuestion: v }); } }),
                        _tc() && _tc()({ label: __('Answer', 'blockenberg'), typo: a.typoAnswer, onChange: function (v) { setAttributes({ typoAnswer: v }); } })
                    ),
                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Question padding (px)', 'blockenberg'), value: a.questionPadding, min: 10, max: 36, onChange: function (v) { setAttributes({ questionPadding: v }); } }),
                        el(RangeControl, { label: __('Answer padding (px)',   'blockenberg'), value: a.answerPadding,   min: 10, max: 36, onChange: function (v) { setAttributes({ answerPadding: v }); } }),
                        el(RangeControl, { label: __('Item radius (px)',      'blockenberg'), value: a.itemRadius,      min: 0,  max: 24, onChange: function (v) { setAttributes({ itemRadius: v }); } }),
                        el(RangeControl, { label: __('Item gap (px)',         'blockenberg'), value: a.itemGap,          min: 0,  max: 24, onChange: function (v) { setAttributes({ itemGap: v }); } }),
                        el(RangeControl, { label: __('Nav radius (px)',       'blockenberg'), value: a.navRadius,        min: 0,  max: 24, onChange: function (v) { setAttributes({ navRadius: v }); } })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',    __('Accent',              'blockenberg'), 'accentColor'),
                        cc('navBg',          __('Nav background',      'blockenberg'), 'navBg'),
                        cc('navActiveBg',    __('Nav active bg',       'blockenberg'), 'navActiveBg'),
                        cc('navActiveColor', __('Nav active text',     'blockenberg'), 'navActiveColor'),
                        cc('navInactiveColor',__('Nav inactive text',  'blockenberg'), 'navInactiveColor'),
                        cc('itemBg',         __('Item background',     'blockenberg'), 'itemBg'),
                        cc('itemBorderColor',__('Item border',         'blockenberg'), 'itemBorderColor'),
                        cc('questionColor',  __('Question text',       'blockenberg'), 'questionColor'),
                        cc('answerColor',    __('Answer text',         'blockenberg'), 'answerColor'),
                        cc('iconColor',      __('Accordion icon',      'blockenberg'), 'iconColor'),
                        cc('bgColor',        __('Section background',  'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el(PanelBody, { title: __('Categories', 'blockenberg'), initialOpen: false },
                        a.categories.map(function (cat, ci) {
                            return el(PanelBody, { key: cat.id, title: (cat.icon || '') + ' ' + (cat.label || 'Category ' + (ci + 1)), initialOpen: ci === safeCat },
                                el(IP().IconPickerControl, {
                                    iconType: cat.iconPickerType, customChar: cat.icon, dashicon: cat.iconDashicon, imageUrl: cat.iconImageUrl,
                                    onChangeType: function (v) { updateCat(cat.id, 'iconPickerType', v); },
                                    onChangeChar: function (v) { updateCat(cat.id, 'icon', v); },
                                    onChangeDashicon: function (v) { updateCat(cat.id, 'iconDashicon', v); },
                                    onChangeImageUrl: function (v) { updateCat(cat.id, 'iconImageUrl', v); }
                                }),
                                el(TextControl, { label: __('Label',        'blockenberg'), value: cat.label, onChange: function (v) { updateCat(cat.id, 'label', v); } }),
                                el('strong', { style: { display: 'block', margin: '10px 0 6px', fontSize: '12px' } }, __('Questions', 'blockenberg')),
                                (cat.items || []).map(function (item) {
                                    return el('div', { key: item.id, style: { background: '#f9f9f9', borderRadius: '6px', padding: '8px', marginBottom: '8px' } },
                                        el(TextControl,     { label: __('Question', 'blockenberg'), value: item.question, onChange: function (v) { updateItem(cat.id, item.id, 'question', v); } }),
                                        el(TextareaControl, { label: __('Answer',   'blockenberg'), value: item.answer,   onChange: function (v) { updateItem(cat.id, item.id, 'answer', v); }, rows: 3 }),
                                        el(Button, { onClick: function () { removeItem(cat.id, item.id); }, isDestructive: true, variant: 'link', size: 'compact' }, __('Remove question', 'blockenberg'))
                                    );
                                }),
                                el(Button, { onClick: function () { addItem(cat.id); }, variant: 'secondary', size: 'compact', style: { marginBottom: '10px' } }, __('+ Add Question', 'blockenberg')),
                                el(Button, { onClick: function () { setAttributes({ categories: a.categories.filter(function (c) { return c.id !== cat.id; }) }); }, isDestructive: true, variant: 'tertiary', size: 'compact' }, __('Remove category', 'blockenberg'))
                            );
                        }),
                        el(Button, { onClick: function () { setAttributes({ categories: a.categories.concat([{ id: makeId(), icon: '📁', label: __('New Category', 'blockenberg'), items: [], iconPickerType: 'custom-char', iconDashicon: '', iconImageUrl: '' }]) }); }, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Category', 'blockenberg'))
                    )
                ),

                el('div', blockProps,
                    a.showSearch && el('div', { style: { marginBottom: '20px' } },
                        el('input', { type: 'text', readOnly: true, placeholder: a.searchPlaceholder || __('Search questions…', 'blockenberg'), style: { width: '100%', padding: '10px 14px', border: '1px solid ' + a.itemBorderColor, borderRadius: a.itemRadius + 'px', boxSizing: 'border-box' } })
                    ),
                    el('div', { className: 'bkbg-faqc-layout bkbg-faqc--' + a.navStyle + (isSidebar ? ' bkbg-faqc--' + a.navPosition : ''), style: layoutStyle },
                        isSidebar && !navLeft ? questionsArea : null,
                        navArea,
                        isSidebar && navLeft ? questionsArea : !isSidebar ? questionsArea : null
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var isSidebar = a.navStyle === 'sidebar';
            var navLeft   = isSidebar && a.navPosition === 'left';
            var layoutStyle = { display: 'flex', flexDirection: isSidebar ? 'row' : 'column', gap: '24px', alignItems: isSidebar ? 'flex-start' : 'stretch' };

            var navArea = el('nav', { className: 'bkbg-faqc-nav', role: 'tablist', style: { flex: isSidebar ? '0 0 ' + a.navWidth + 'px' : '0 0 100%' } },
                a.categories.map(function (cat, i) {
                    return el('button', { key: cat.id, type: 'button', role: 'tab', className: 'bkbg-faqc-nav-item' + (i === 0 ? ' is-active' : ''), 'data-cat': cat.id, 'aria-selected': i === 0 ? 'true' : 'false', style: { width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', border: 'none', cursor: 'pointer' } },
                        a.showCatIcon && el('span', { className: 'bkbg-faqc-cat-icon', 'aria-hidden': 'true' }, (cat.iconPickerType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(cat.iconPickerType, cat.icon, cat.iconDashicon, cat.iconImageUrl, cat.iconDashiconColor) : cat.icon),
                        el('span', null, cat.label),
                        a.showCatCount && el('span', { className: 'bkbg-faqc-count' }, cat.items ? cat.items.length : 0)
                    );
                })
            );

            var questionsArea = el('div', { className: 'bkbg-faqc-panels' },
                a.showSearch && el('input', { type: 'text', className: 'bkbg-faqc-search', placeholder: a.searchPlaceholder || __('Search questions…', 'blockenberg'), 'aria-label': __('Search FAQ', 'blockenberg') }),
                a.categories.map(function (cat, ci) {
                    return el('div', { key: cat.id, className: 'bkbg-faqc-panel' + (ci === 0 ? ' is-active' : ''), role: 'tabpanel', 'data-cat': cat.id, 'aria-hidden': ci === 0 ? 'false' : 'true', style: { display: ci === 0 ? undefined : 'none' } },
                        (cat.items || []).map(function (item, ii) {
                            return el('div', { key: item.id, className: 'bkbg-faqc-item', 'data-open': a.expandFirst && ii === 0 ? '1' : undefined },
                                el('button', { type: 'button', className: 'bkbg-faqc-q', 'aria-expanded': (a.expandFirst && ii === 0) ? 'true' : 'false' },
                                    el('span', null, item.question),
                                    el('span', { className: 'bkbg-faqc-icon', 'aria-hidden': 'true' }, iconChar(a.iconType, a.expandFirst && ii === 0))
                                ),
                                el('div', { className: 'bkbg-faqc-a', 'aria-hidden': (a.expandFirst && ii === 0) ? 'false' : 'true', style: { display: (a.expandFirst && ii === 0) ? undefined : 'none' } },
                                    el('p', null, item.answer)
                                )
                            );
                        })
                    );
                })
            );

            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-faqc-wrapper', style: buildWrapStyle(a), 'data-allow-multiple': a.allowMultiple ? '1' : undefined, 'data-icon-type': a.iconType }),
                a.showSearch && el('input', { type: 'text', className: 'bkbg-faqc-search-global', placeholder: a.searchPlaceholder || __('Search questions…', 'blockenberg'), 'aria-label': __('Search FAQ', 'blockenberg') }),
                el('div', { className: 'bkbg-faqc-layout bkbg-faqc--' + a.navStyle + (isSidebar ? ' bkbg-faqc--' + a.navPosition : ''), style: layoutStyle },
                    isSidebar && !navLeft ? questionsArea : null,
                    navArea,
                    isSidebar && navLeft  ? questionsArea : !isSidebar ? questionsArea : null
                )
            );
        }
    });
}() );
