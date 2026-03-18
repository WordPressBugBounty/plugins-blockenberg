( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var _ftbTC, _ftbTV;
    function _tc() { return (_ftbTC = _ftbTC || window.bkbgTypographyControl); }
    function _tv() { return (_ftbTV = _ftbTV || window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
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

    var POSITION_OPTIONS = [
        { label: __('Tabs left',  'blockenberg'), value: 'left' },
        { label: __('Tabs right', 'blockenberg'), value: 'right' },
        { label: __('Tabs top',   'blockenberg'), value: 'top' },
    ];
    var ASPECT_OPTIONS = [
        { label: '16 / 9', value: '16/9' },
        { label: '4 / 3',  value: '4/3' },
        { label: '1 / 1',  value: '1/1' },
        { label: '3 / 2',  value: '3/2' },
    ];
    var TAB_STYLE_OPTIONS = [
        { label: __('Card',     'blockenberg'), value: 'card' },
        { label: __('Bordered', 'blockenberg'), value: 'bordered' },
        { label: __('Minimal',  'blockenberg'), value: 'minimal' },
    ];

    function makeId() { return 'ft' + Math.random().toString(36).substr(2, 5); }

    function buildWrapStyle(a) {
        return Object.assign({
            '--bkbg-ftb-accent':         a.accentColor,
            '--bkbg-ftb-active-bg':      a.activeTabBg,
            '--bkbg-ftb-active-color':   a.activeTabColor,
            '--bkbg-ftb-inactive-bg':    a.inactiveTabBg,
            '--bkbg-ftb-inactive-color': a.inactiveTabColor,
            '--bkbg-ftb-tab-border':     a.tabBorderColor,
            '--bkbg-ftb-headline':       a.headlineColor,
            '--bkbg-ftb-desc':           a.descColor,
            '--bkbg-ftb-placeholder-bg': a.imagePlaceholderBg,
            '--bkbg-ftb-icon-sz':        a.iconSize + 'px',
            '--bkbg-ftb-tabs-w':         a.tabsWidth + 'px',
            '--bkbg-ftb-gap':            a.gap + 'px',
            '--bkbg-ftb-img-r':          a.imageRadius + 'px',
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        },
            _tv()(a.typoLabel, '--bkbg-ftb-tl-'),
            _tv()(a.typoHeadline, '--bkbg-ftb-th-'),
            _tv()(a.typoDesc, '--bkbg-ftb-td-')
        );
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

    function ratioPercent(r) {
        var p = r.split('/');
        return (parseInt(p[1], 10) / parseInt(p[0], 10) * 100).toFixed(2) + '%';
    }

    /* ── Single tab button ─────────────────────────────────────────────── */
    function TabButton(props) {
        var tab      = props.tab;
        var isActive = props.isActive;
        var a        = props.a;
        var btnStyle = {
            display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px 18px', cursor: 'pointer',
            background: isActive ? a.activeTabBg : a.inactiveTabBg, borderRadius: '10px',
            border: a.tabStyle === 'bordered' ? ('1.5px solid ' + (isActive ? a.accentColor : a.tabBorderColor)) : 'none',
            borderLeft: a.tabStyle === 'card' && a.tabsPosition !== 'top' && isActive ? ('3px solid ' + a.accentColor) : undefined,
            marginBottom: a.tabsPosition !== 'top' ? '6px' : '0',
            marginRight: a.tabsPosition === 'top' ? '6px' : '0',
            textAlign: 'left', width: a.tabsPosition !== 'top' ? '100%' : 'auto',
        };
        return el('button', { type: 'button', style: btnStyle, onClick: props.onClick },
            el('span', { style: { fontSize: a.iconSize + 'px', flexShrink: 0, lineHeight: 1 } }, (tab.iconType || 'custom-char') !== 'custom-char' && IP() ? IP().buildEditorIcon(el, tab.iconType, tab.icon, tab.iconDashicon, tab.iconImageUrl, tab.iconDashiconColor) : (tab.icon || '⚡')),
            el('div', null,
                el('div', { className: 'bkbg-ftb-tab-label', style: { color: isActive ? a.activeTabColor : a.inactiveTabColor, marginBottom: '3px' } }, tab.label),
                isActive && tab.description && el('div', { className: 'bkbg-ftb-tab-preview-desc', style: { color: a.descColor, maxHeight: '60px', opacity: 1 } }, tab.description.substring(0, 80) + (tab.description.length > 80 ? '…' : ''))
            )
        );
    }

    /* ── Image preview pane ────────────────────────────────────────────── */
    function ImagePane(props) {
        var tab = props.tab;
        var a   = props.a;
        var paneStyle = { flex: 1, minWidth: 0, position: 'relative', borderRadius: a.imageRadius + 'px', overflow: 'hidden', boxShadow: a.imageShadow ? '0 20px 60px rgba(0,0,0,0.14)' : 'none', background: a.imagePlaceholderBg };
        return el('div', { className: 'bkbg-ftb-image-pane', style: paneStyle },
            el('div', { style: { paddingBottom: ratioPercent(a.imageAspect) } }),
            tab.imageUrl
                ? el('img', { src: tab.imageUrl, alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: a.imageObjectFit } })
                : el('div', { style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#9ca3af', fontSize: '13px' } },
                    el('span', { style: { fontSize: '40px' } }, '🖼'),
                    __('Add screenshot in sidebar', 'blockenberg')
                ),
            /* headline/desc overlay at bottom for vertical tabs */
            (a.tabsPosition === 'left' || a.tabsPosition === 'right') && el('div', { style: { position: 'relative', padding: '24px 28px' } },
                el('h3', { className: 'bkbg-ftb-headline', style: { color: a.headlineColor, margin: '0 0 10px' } }, tab.headline || tab.label),
                el('p',  { className: 'bkbg-ftb-desc', style: { color: a.descColor, margin: 0 } }, tab.description || '')
            )
        );
    }

    registerBlockType('blockenberg/feature-tabs', {
        title: __('Feature Tabs', 'blockenberg'),
        icon: 'layout',
        category: 'bkbg-marketing',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var activeState = useState(a.defaultActive || 0);
            var active = activeState[0];
            var setActive = activeState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateTab(id, key, val) {
                setAttributes({ tabs: a.tabs.map(function (t) { if (t.id !== id) return t; var u = Object.assign({}, t); u[key] = val; return u; }) });
            }

            var safeActive = Math.min(active, Math.max(0, a.tabs.length - 1));
            var currentTab = a.tabs[safeActive] || {};
            var isVertical = a.tabsPosition !== 'top';
            var isRight    = a.tabsPosition === 'right';

            var tabList = el('div', { className: 'bkbg-ftb-tab-list', style: {
                display: 'flex', flexDirection: isVertical ? 'column' : 'row',
                flexShrink: 0, width: isVertical ? a.tabsWidth + 'px' : '100%',
                flexWrap: isVertical ? undefined : 'wrap',
            } },
                a.tabs.map(function (tab, i) {
                    return el(TabButton, { key: tab.id, tab: tab, isActive: i === safeActive, a: a, onClick: function () { setActive(i); } });
                })
            );

            var imagePane = el(ImagePane, { tab: currentTab, a: a });

            var layoutStyle = { display: 'flex', flexDirection: isVertical ? (isRight ? 'row-reverse' : 'row') : 'column', gap: a.gap + 'px', alignItems: 'flex-start' };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Tabs position',   'blockenberg'), value: a.tabsPosition, options: POSITION_OPTIONS, onChange: function (v) { setAttributes({ tabsPosition: v }); } }),
                        el(SelectControl, { label: __('Tab style',       'blockenberg'), value: a.tabStyle,     options: TAB_STYLE_OPTIONS, onChange: function (v) { setAttributes({ tabStyle: v }); } }),
                        isVertical && el(RangeControl, { label: __('Tabs sidebar width (px)', 'blockenberg'), value: a.tabsWidth, min: 180, max: 420, onChange: function (v) { setAttributes({ tabsWidth: v }); } }),
                        el(RangeControl,  { label: __('Gap between tabs and image (px)', 'blockenberg'), value: a.gap, min: 16, max: 96, onChange: function (v) { setAttributes({ gap: v }); } }),
                        el(SelectControl, { label: __('Image aspect ratio', 'blockenberg'), value: a.imageAspect, options: ASPECT_OPTIONS, onChange: function (v) { setAttributes({ imageAspect: v }); } }),
                        el(RangeControl,  { label: __('Image radius (px)',  'blockenberg'), value: a.imageRadius, min: 0, max: 32, onChange: function (v) { setAttributes({ imageRadius: v }); } }),
                        el(ToggleControl, { label: __('Image shadow',       'blockenberg'), checked: a.imageShadow, onChange: function (v) { setAttributes({ imageShadow: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Animate on scroll',  'blockenberg'), checked: a.animate,     onChange: function (v) { setAttributes({ animate: v }); },     __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Tab Label', 'blockenberg'), value: a.typoLabel, onChange: function (v) { setAttributes({ typoLabel: v }); } }),
                        _tc() && el(_tc(), { label: __('Headline', 'blockenberg'), value: a.typoHeadline, onChange: function (v) { setAttributes({ typoHeadline: v }); } }),
                        _tc() && el(_tc(), { label: __('Description', 'blockenberg'), value: a.typoDesc, onChange: function (v) { setAttributes({ typoDesc: v }); } }),
                        el(RangeControl, { label: __('Icon size (px)',  'blockenberg'), value: a.iconSize,     min: 16, max: 48, onChange: function (v) { setAttributes({ iconSize:     v }); } })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',       __('Accent / active indicator', 'blockenberg'), 'accentColor'),
                        cc('activeTabBg',       __('Active tab background',     'blockenberg'), 'activeTabBg'),
                        cc('activeTabColor',    __('Active tab text',           'blockenberg'), 'activeTabColor'),
                        cc('inactiveTabBg',     __('Inactive tab background',   'blockenberg'), 'inactiveTabBg'),
                        cc('inactiveTabColor',  __('Inactive tab text',         'blockenberg'), 'inactiveTabColor'),
                        cc('tabBorderColor',    __('Tab border',                'blockenberg'), 'tabBorderColor'),
                        cc('headlineColor',     __('Content headline',          'blockenberg'), 'headlineColor'),
                        cc('descColor',         __('Content description',       'blockenberg'), 'descColor'),
                        cc('imagePlaceholderBg',__('Image placeholder bg',      'blockenberg'), 'imagePlaceholderBg'),
                        cc('bgColor',           __('Section background',        'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el(PanelBody, { title: __('Tabs', 'blockenberg'), initialOpen: false },
                        a.tabs.map(function (tab, ti) {
                            return el(PanelBody, { key: tab.id, title: (tab.icon || '⚡') + ' ' + (tab.label || 'Tab ' + (ti + 1)), initialOpen: ti === safeActive },
                                el(IP().IconPickerControl, {
                                    iconType: tab.iconType || 'custom-char',
                                    customChar: tab.icon || '',
                                    dashicon: tab.iconDashicon || '',
                                    imageUrl: tab.iconImageUrl || '',
                                    onChangeType: function (v) { updateTab(tab.id, 'iconType', v); },
                                    onChangeChar: function (v) { updateTab(tab.id, 'icon', v); },
                                    onChangeDashicon: function (v) { updateTab(tab.id, 'iconDashicon', v); },
                                    onChangeImageUrl: function (v) { updateTab(tab.id, 'iconImageUrl', v); },
                                    label: __('Icon', 'blockenberg')
                                }),
                                el(TextControl, { label: __('Tab label',    'blockenberg'), value: tab.label, onChange: function (v) { updateTab(tab.id, 'label', v); } }),
                                el(TextControl, { label: __('Headline',     'blockenberg'), value: tab.headline, onChange: function (v) { updateTab(tab.id, 'headline', v); } }),
                                el(TextareaControl, { label: __('Description', 'blockenberg'), value: tab.description, onChange: function (v) { updateTab(tab.id, 'description', v); }, rows: 3 }),
                                el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function (m) { updateTab(tab.id, 'imageUrl', m.url); updateTab(tab.id, 'imageId', m.id); },
                                        allowedTypes: ['image'], value: tab.imageId,
                                        render: function (p) { return el('div', null,
                                            tab.imageUrl && el('img', { src: tab.imageUrl, style: { width: '100%', borderRadius: '6px', marginBottom: '6px' } }),
                                            el(Button, { onClick: p.open, variant: tab.imageUrl ? 'secondary' : 'primary', size: 'compact' }, tab.imageUrl ? __('Replace screenshot', 'blockenberg') : __('Add screenshot', 'blockenberg'))
                                        ); }
                                    })
                                ),
                                el(Button, { onClick: function () { setAttributes({ tabs: a.tabs.filter(function (t) { return t.id !== tab.id; }) }); if (safeActive >= ti) setActive(Math.max(0, safeActive - 1)); }, isDestructive: true, variant: 'tertiary', size: 'compact' }, __('Remove tab', 'blockenberg'))
                            );
                        }),
                        el(Button, { variant: 'primary', onClick: function () { setAttributes({ tabs: a.tabs.concat([{ id: makeId(), icon: '🔧', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', label: __('New Feature', 'blockenberg'), headline: '', description: '', imageUrl: '', imageId: 0 }]) }); setActive(a.tabs.length); }, style: { marginTop: '8px' } }, __('+ Add Tab', 'blockenberg'))
                    )
                ),

                el('div', blockProps,
                    el('div', { className: 'bkbg-ftb-layout bkbg-ftb--' + a.tabsPosition, style: layoutStyle },
                        isRight ? imagePane : tabList,
                        isRight ? tabList : imagePane
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var isVertical = a.tabsPosition !== 'top';
            var isRight    = a.tabsPosition === 'right';
            var layoutStyle = { display: 'flex', flexDirection: isVertical ? (isRight ? 'row-reverse' : 'row') : 'column', gap: a.gap + 'px', alignItems: 'flex-start' };

            var tabList = el('nav', { className: 'bkbg-ftb-tab-list', role: 'tablist', style: { flexShrink: 0, width: isVertical ? a.tabsWidth + 'px' : '100%', display: 'flex', flexDirection: isVertical ? 'column' : 'row', flexWrap: 'wrap' } },
                a.tabs.map(function (tab, i) {
                    return el('button', { key: tab.id, type: 'button', role: 'tab', className: 'bkbg-ftb-tab-btn' + (i === (a.defaultActive || 0) ? ' is-active' : ''), 'data-tab': tab.id, 'aria-selected': i === (a.defaultActive || 0) ? 'true' : 'false' },
                        el('span', { className: 'bkbg-ftb-tab-icon', 'aria-hidden': 'true' }, (tab.iconType || 'custom-char') !== 'custom-char' && IP() ? IP().buildSaveIcon(el, tab.iconType, tab.icon, tab.iconDashicon, tab.iconImageUrl, tab.iconDashiconColor) : tab.icon),
                        el('div', { className: 'bkbg-ftb-tab-text' },
                            el('span', { className: 'bkbg-ftb-tab-label' }, tab.label),
                            el('span', { className: 'bkbg-ftb-tab-preview-desc' }, tab.description)
                        )
                    );
                })
            );

            var imagePane = el('div', { className: 'bkbg-ftb-panels', style: { flex: 1, minWidth: 0, position: 'relative' } },
                a.tabs.map(function (tab, i) {
                    return el('div', { key: tab.id, className: 'bkbg-ftb-panel' + (i === (a.defaultActive || 0) ? ' is-active' : ''), role: 'tabpanel', 'data-panel': tab.id, 'aria-hidden': i === (a.defaultActive || 0) ? 'false' : 'true' },
                        el('div', { className: 'bkbg-ftb-image-pane', style: { position: 'relative', borderRadius: a.imageRadius + 'px', overflow: 'hidden', boxShadow: a.imageShadow ? '0 20px 60px rgba(0,0,0,0.14)' : 'none' } },
                            el('div', { style: { paddingBottom: (a.imageAspect.split('/').reduce(function (_, v, idx, arr) { return idx === 1 ? (parseInt(v,10) / parseInt(arr[0],10) * 100).toFixed(2) : _; }, '56.25') + '%') } }),
                            tab.imageUrl && el('img', { src: tab.imageUrl, alt: tab.headline || tab.label || '', loading: 'lazy', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: a.imageObjectFit } })
                        ),
                        isVertical && el('div', { className: 'bkbg-ftb-panel-content' },
                            el('h3', { className: 'bkbg-ftb-headline' }, tab.headline || tab.label),
                            el('p',  { className: 'bkbg-ftb-desc' }, tab.description)
                        )
                    );
                })
            );

            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-ftb-wrapper', style: buildWrapStyle(a), 'data-animate': a.animate ? '1' : undefined }),
                el('div', { className: 'bkbg-ftb-layout bkbg-ftb--' + a.tabsPosition, style: layoutStyle },
                    isRight ? imagePane : tabList,
                    isRight ? tabList : imagePane
                )
            );
        }
    });
}() );
