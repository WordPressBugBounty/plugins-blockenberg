( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _fvtbTC, _fvtbTV;
    function _tc() { return (_fvtbTC = _fvtbTC || window.bkbgTypographyControl); }
    function _tv() { return (_fvtbTV = _fvtbTV || window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    function updateItem(arr, idx, field, val) {
        return arr.map(function (item, i) {
            if (i !== idx) return item;
            var p = {}; p[field] = val;
            return Object.assign({}, item, p);
        });
    }

    function moveItem(arr, from, to) {
        var a = arr.slice();
        var item = a.splice(from, 1)[0];
        a.splice(to, 0, item);
        return a;
    }

    /* ── TabEditor ── */
    function TabEditor(props) {
        var tabs = props.tabs;
        var onChange = props.onChange;
        var activeIdx = props.activeIdx;
        var setActiveIdx = props.setActiveIdx;
        var a = props.attributes;

        function addTab() {
            onChange(tabs.concat([{
                label: 'New Feature', icon: '✨', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '',
                headline: 'Feature Headline', description: 'Describe this feature.',
                bullets: ['Benefit one', 'Benefit two', 'Benefit three'],
                ctaLabel: 'Learn More', ctaUrl: '#',
                videoUrl: '', videoPoster: '', fallbackImageUrl: '', fallbackImageId: 0
            }]));
            setActiveIdx(tabs.length);
        }

        return el(Fragment, null,
            tabs.map(function (tab, idx) {
                var isOpen = idx === activeIdx;
                return el('div', {
                    key: idx,
                    style: { border: '1px solid ' + (isOpen ? '#6366f1' : '#e5e7eb'), borderRadius: '6px', marginBottom: '6px', overflow: 'hidden' }
                },
                    /* Accordion header */
                    el('div', {
                        style: { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', background: isOpen ? '#f0f0ff' : '#f9fafb', cursor: 'pointer' },
                        onClick: function () { setActiveIdx(isOpen ? -1 : idx); }
                    },
                        el('span', { style: { fontSize: '14px' } }, (tab.iconType || 'custom-char') !== 'custom-char' && IP() ? IP().buildEditorIcon(el, tab.iconType, tab.icon, tab.iconDashicon, tab.iconImageUrl, tab.iconDashiconColor) : (tab.icon || '')),
                        el('span', { style: { flex: 1, fontSize: '12px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, tab.label || 'Tab ' + (idx + 1)),
                        el(Button, { icon: 'arrow-up-alt2', isSmall: true, disabled: idx === 0, onClick: function (e) { e.stopPropagation(); onChange(moveItem(tabs, idx, idx - 1)); setActiveIdx(idx - 1); } }),
                        el(Button, { icon: 'arrow-down-alt2', isSmall: true, disabled: idx === tabs.length - 1, onClick: function (e) { e.stopPropagation(); onChange(moveItem(tabs, idx, idx + 1)); setActiveIdx(idx + 1); } }),
                        el(Button, { icon: 'no-alt', isSmall: true, isDestructive: true, onClick: function (e) { e.stopPropagation(); var arr = tabs.slice(); arr.splice(idx, 1); onChange(arr); setActiveIdx(-1); } })
                    ),

                    isOpen && el('div', { style: { padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' } },
                        el(TextControl, { label: __('Tab Label', 'blockenberg'), value: tab.label || '', onChange: function (v) { onChange(updateItem(tabs, idx, 'label', v)); }, __nextHasNoMarginBottom: true }),
                        IP() ? el(IP().IconPickerControl, {
                            iconType: tab.iconType || 'custom-char',
                            customChar: tab.icon || '',
                            dashicon: tab.iconDashicon || '',
                            imageUrl: tab.iconImageUrl || '',
                            onChangeType: function (v) { onChange(updateItem(tabs, idx, 'iconType', v)); },
                            onChangeChar: function (v) { onChange(updateItem(tabs, idx, 'icon', v)); },
                            onChangeDashicon: function (v) { onChange(updateItem(tabs, idx, 'iconDashicon', v)); },
                            onChangeImageUrl: function (v) { onChange(updateItem(tabs, idx, 'iconImageUrl', v)); },
                            label: __('Icon', 'blockenberg')
                        }) : el(TextControl, { label: __('Icon Emoji', 'blockenberg'), value: tab.icon || '', onChange: function (v) { onChange(updateItem(tabs, idx, 'icon', v)); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Headline', 'blockenberg'), value: tab.headline || '', onChange: function (v) { onChange(updateItem(tabs, idx, 'headline', v)); }, __nextHasNoMarginBottom: true }),
                        el('div', null,
                            el('label', { style: { fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' } }, __('Description', 'blockenberg')),
                            el('textarea', {
                                value: tab.description || '',
                                onChange: function (e) { onChange(updateItem(tabs, idx, 'description', e.target.value)); },
                                style: { width: '100%', minHeight: '70px', fontSize: '12px', padding: '6px', border: '1px solid #e5e7eb', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical' }
                            })
                        ),
                        el('div', null,
                            el('label', { style: { fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' } }, __('Bullet Points (one per line)', 'blockenberg')),
                            el('textarea', {
                                value: (tab.bullets || []).join('\n'),
                                onChange: function (e) { onChange(updateItem(tabs, idx, 'bullets', e.target.value.split('\n'))); },
                                style: { width: '100%', minHeight: '60px', fontSize: '12px', padding: '6px', border: '1px solid #e5e7eb', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical' }
                            })
                        ),
                        el(TextControl, { label: __('CTA Button Label', 'blockenberg'), value: tab.ctaLabel || '', onChange: function (v) { onChange(updateItem(tabs, idx, 'ctaLabel', v)); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('CTA URL', 'blockenberg'), value: tab.ctaUrl || '', onChange: function (v) { onChange(updateItem(tabs, idx, 'ctaUrl', v)); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '4px' } },
                            el(TextControl, { label: __('Video URL (mp4, webm)', 'blockenberg'), value: tab.videoUrl || '', onChange: function (v) { onChange(updateItem(tabs, idx, 'videoUrl', v)); }, __nextHasNoMarginBottom: true })
                        ),
                        el(TextControl, { label: __('Video Poster Image URL', 'blockenberg'), value: tab.videoPoster || '', onChange: function (v) { onChange(updateItem(tabs, idx, 'videoPoster', v)); }, __nextHasNoMarginBottom: true }),
                        /* Fallback image */
                        el('div', null,
                            el('label', { style: { fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '6px' } }, __('Fallback Image (if no video)', 'blockenberg')),
                            el(MediaUploadCheck, null,
                                el(MediaUpload, {
                                    onSelect: function (media) {
                                        onChange(tabs.map(function (item, i) {
                                            if (i !== idx) return item;
                                            return Object.assign({}, item, { fallbackImageUrl: media.url, fallbackImageId: media.id });
                                        }));
                                    },
                                    allowedTypes: ['image'],
                                    value: tab.fallbackImageId,
                                    render: function (renderProps) {
                                        return el('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
                                            tab.fallbackImageUrl && el('img', { src: tab.fallbackImageUrl, alt: '', style: { maxWidth: '100%', borderRadius: '4px', maxHeight: '80px', objectFit: 'cover' } }),
                                            el(Button, { variant: 'secondary', isSmall: true, onClick: renderProps.open }, tab.fallbackImageUrl ? __('Replace', 'blockenberg') : __('Select Image', 'blockenberg')),
                                            tab.fallbackImageUrl && el(Button, { isSmall: true, isDestructive: true, onClick: function () {
                                                onChange(tabs.map(function (item, i) {
                                                    if (i !== idx) return item;
                                                    return Object.assign({}, item, { fallbackImageUrl: '', fallbackImageId: 0 });
                                                }));
                                            } }, __('Remove', 'blockenberg'))
                                        );
                                    }
                                })
                            )
                        )
                    )
                );
            }),
            el(Button, { variant: 'secondary', onClick: addTab, style: { marginTop: '6px', width: '100%', justifyContent: 'center' } }, __('+ Add Feature Tab', 'blockenberg'))
        );
    }

    /* ── Live preview ── */
    function FVTPreview(props) {
        var a = props.attributes;
        var activeTab = props.activeTab;
        var setActiveTab = props.setActiveTab;
        var tabs = a.tabs || [];
        if (!tabs.length) return el('div', { style: { padding: '24px', textAlign: 'center', color: '#9ca3af' } }, 'Add feature tabs in the sidebar');

        var tab = tabs[Math.min(activeTab, tabs.length - 1)];
        var isRightVideo = a.layout !== 'left-video';
        var tabAreaPct = (a.tabAreaWidth || 40) + '%';
        var videoPct = (100 - (a.tabAreaWidth || 40)) + '%';

        /* Aspect ratio: "16/9" → paddingBottom = 9/16*100 */
        var aspParts = (a.aspect || '16/9').split('/');
        var aspPB = (+aspParts[1] / +aspParts[0] * 100).toFixed(2) + '%';

        /* Tab buttons */
        var tabButtons = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
            tabs.map(function (t, idx) {
                var isActive = idx === activeTab;
                var bg = isActive ? (a.activeTabBg || '#6366f1') : (a.idleTabBg || 'transparent');
                var color = isActive ? (a.activeTabColor || '#fff') : (a.idleTabColor || '#374151');
                return el('button', {
                    key: idx,
                    className: 'bkbg-fvtb-tab' + (isActive ? ' is-active' : ''),
                    onClick: function () { setActiveTab(idx); },
                    style: {
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: a.tabStyle === 'pills' ? '10px 16px' : (a.tabStyle === 'cards' ? '14px 16px' : '12px 0'),
                        borderRadius: a.tabStyle === 'pills' ? '50px' : (a.tabStyle === 'cards' ? '10px' : '0'),
                        background: bg, color: color,
                        border: a.tabStyle === 'lines' ? ('0 0 0 0 solid transparent') : 'none',
                        borderLeft: a.tabStyle === 'lines' ? ('3px solid ' + (isActive ? (a.activeTabBg || '#6366f1') : 'transparent')) : undefined,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                        boxShadow: (a.tabStyle === 'cards' && isActive) ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                    }
                },
                    a.showIcons && el('span', { className: 'bkbg-fvtb-tab-icon', style: { fontSize: (a.iconSize || 24) + 'px', lineHeight: 1, flexShrink: 0 } }, (t.iconType || 'custom-char') !== 'custom-char' && IP() ? IP().buildEditorIcon(el, t.iconType, t.icon, t.iconDashicon, t.iconImageUrl, t.iconDashiconColor) : (t.icon || '')),
                    el('span', { className: 'bkbg-fvtb-tab-label' }, t.label || ''));
            })
        );

        /* Content panel */
        var content = el('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center' } },
            el('h3', { className: 'bkbg-fvtb-headline', style: { margin: 0, color: a.headlineColor || '#111827' } }, tab.headline || ''),
            el('p', { className: 'bkbg-fvtb-desc', style: { margin: 0, color: a.descColor || '#4b5563' } }, tab.description || ''),
            a.showBullets && (tab.bullets || []).length > 0 && el('ul', { className: 'bkbg-fvtb-bullets', style: { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' } },
                (tab.bullets || []).filter(Boolean).map(function (b, bi) {
                    return el('li', { key: bi, className: 'bkbg-fvtb-bullet', style: { display: 'flex', alignItems: 'flex-start', gap: '8px', color: a.bulletColor || '#374151' } },
                        el('span', { className: 'bkbg-fvtb-bullet-dot', style: { color: a.bulletDot || '#6366f1', flexShrink: 0 } }, '✓'),
                        el('span', { className: 'bkbg-fvtb-bullet-text' }, b)
                    );
                })
            ),
            a.showCta && tab.ctaLabel && el('a', {
                className: 'bkbg-fvtb-cta',
                href: tab.ctaUrl || '#',
                onClick: function (e) { e.preventDefault(); },
                style: {
                    display: 'inline-flex', alignItems: 'center',
                    padding: '12px 24px',
                    background: a.ctaBg || '#6366f1', color: a.ctaColor || '#fff',
                    borderRadius: '8px', textDecoration: 'none'
                }
            }, tab.ctaLabel)
        );

        /* Video area */
        var videoArea = el('div', {
            style: {
                position: 'relative', paddingBottom: aspPB,
                height: 0,
                background: a.videoBg || '#000',
                borderRadius: (a.videoRadius || 12) + 'px',
                overflow: 'hidden',
                boxShadow: a.videoShadow ? '0 20px 40px rgba(0,0,0,0.15)' : 'none'
            }
        },
            (tab.fallbackImageUrl || tab.videoUrl) ? el('img', {
                src: tab.fallbackImageUrl || tab.videoPoster || '',
                alt: tab.headline || '',
                style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }
            }) : el('div', {
                style: {
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d3f 100%)',
                    color: '#aaa', flexDirection: 'column', gap: '8px'
                }
            },
                el('div', { style: { fontSize: '40px', opacity: 0.5 } }, '▶'),
                el('p', { style: { margin: 0, fontSize: '12px', opacity: 0.5 } }, 'Add a video URL above')
            )
        );

        /* Left panel: tabs list */
        var leftPanel = el('div', { style: { width: tabAreaPct, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' } },
            tabButtons,
            content
        );

        /* Right panel: video */
        var rightPanel = el('div', { style: { flex: 1, minWidth: 0 } }, videoArea);

        var wrapStyle = Object.assign({
                paddingTop: (a.paddingTop || 60) + 'px',
                paddingBottom: (a.paddingBottom || 60) + 'px',
                background: a.bgColor || '',
                display: 'flex',
                gap: (a.gap || 48) + 'px',
                alignItems: 'center',
                flexWrap: 'wrap'
            },
            _tv()(a.typoHeadline, '--bkbg-fvtb-th-'),
            _tv()(a.typoDesc, '--bkbg-fvtb-td-'),
            _tv()(a.typoTabLabel, '--bkbg-fvtb-tl-'),
            _tv()(a.typoBullet, '--bkbg-fvtb-tb-')
        );

        return el('div', { className: 'bkbg-fvtb-wrap', style: wrapStyle },
            isRightVideo ? el(Fragment, null, leftPanel, rightPanel) : el(Fragment, null, rightPanel, leftPanel)
        );
    }

    registerBlockType('blockenberg/feature-video-tabs', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var tabIdxState = useState(-1);
            var tabIdx = tabIdxState[0];
            var setTabIdx = tabIdxState[1];
            var activeTabState = useState(0);
            var activeTab = activeTabState[0];
            var setActiveTab = activeTabState[1];

            var blockProps = useBlockProps();

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Feature Tabs', 'blockenberg'), initialOpen: true },
                    el(TabEditor, {
                        tabs: a.tabs,
                        onChange: function (v) { set({ tabs: v }); },
                        activeIdx: tabIdx,
                        setActiveIdx: setTabIdx,
                        attributes: a
                    })
                ),

                el(PanelBody, { title: __('Layout & Video', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Video Position', 'blockenberg'),
                        value: a.layout,
                        options: [
                            { value: 'right-video', label: 'Video on Right' },
                            { value: 'left-video',  label: 'Video on Left' }
                        ],
                        onChange: function (v) { set({ layout: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el('div', { style: { marginTop: '8px' } },
                        el(SelectControl, {
                            label: __('Tab Style', 'blockenberg'),
                            value: a.tabStyle,
                            options: [
                                { value: 'pills', label: 'Pills' },
                                { value: 'lines', label: 'Left Border Lines' },
                                { value: 'cards', label: 'Cards' }
                            ],
                            onChange: function (v) { set({ tabStyle: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Tab Area Width %', 'blockenberg'), value: a.tabAreaWidth, min: 25, max: 65, onChange: function (v) { set({ tabAreaWidth: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Column Gap (px)', 'blockenberg'), value: a.gap, min: 16, max: 120, onChange: function (v) { set({ gap: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(SelectControl, {
                            label: __('Video Aspect Ratio', 'blockenberg'),
                            value: a.aspect,
                            options: [
                                { value: '16/9', label: '16:9 (Widescreen)' },
                                { value: '4/3',  label: '4:3' },
                                { value: '3/2',  label: '3:2' },
                                { value: '1/1',  label: '1:1 (Square)' }
                            ],
                            onChange: function (v) { set({ aspect: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el(ToggleControl, { label: __('Video Autoplay (muted)', 'blockenberg'), checked: a.videoAutoPlay, onChange: function (v) { set({ videoAutoPlay: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Loop Video', 'blockenberg'), checked: a.videoLoop, onChange: function (v) { set({ videoLoop: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Video Corner Radius', 'blockenberg'), value: a.videoRadius, min: 0, max: 32, onChange: function (v) { set({ videoRadius: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(ToggleControl, { label: __('Video Shadow', 'blockenberg'), checked: a.videoShadow, onChange: function (v) { set({ videoShadow: v }); }, __nextHasNoMarginBottom: true })
                ),

                el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Icons', 'blockenberg'), checked: a.showIcons, onChange: function (v) { set({ showIcons: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Bullet Points', 'blockenberg'), checked: a.showBullets, onChange: function (v) { set({ showBullets: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show CTA Button', 'blockenberg'), checked: a.showCta, onChange: function (v) { set({ showCta: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Auto-Advance Tabs', 'blockenberg'), checked: a.autoAdvance, onChange: function (v) { set({ autoAdvance: v }); }, __nextHasNoMarginBottom: true }),
                    a.autoAdvance && el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Auto-Advance Delay (ms)', 'blockenberg'), value: a.autoAdvanceDelay, min: 1000, max: 15000, step: 500, onChange: function (v) { set({ autoAdvanceDelay: v }); }, __nextHasNoMarginBottom: true })
                    )
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && el(_tc(), { label: __('Headline', 'blockenberg'), value: a.typoHeadline, onChange: function (v) { set({ typoHeadline: v }); } }),
                    _tc() && el(_tc(), { label: __('Description', 'blockenberg'), value: a.typoDesc, onChange: function (v) { set({ typoDesc: v }); } }),
                    _tc() && el(_tc(), { label: __('Bullet Text', 'blockenberg'), value: a.typoBullet, onChange: function (v) { set({ typoBullet: v }); } }),
                    _tc() && el(_tc(), { label: __('Tab Label', 'blockenberg'), value: a.typoTabLabel, onChange: function (v) { set({ typoTabLabel: v }); } }),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Icon Size (px)', 'blockenberg'), value: a.iconSize, min: 14, max: 48, onChange: function (v) { set({ iconSize: v }); }, __nextHasNoMarginBottom: true })
                    )
                ),
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, step: 4, onChange: function (v) { set({ paddingTop: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, step: 4, onChange: function (v) { set({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                    )
                ),

                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.bgColor,        onChange: function (v) { set({ bgColor: v }); },        label: __('Section Background', 'blockenberg') },
                        { value: a.activeTabBg,    onChange: function (v) { set({ activeTabBg: v }); },    label: __('Active Tab Background', 'blockenberg') },
                        { value: a.activeTabColor, onChange: function (v) { set({ activeTabColor: v }); }, label: __('Active Tab Text', 'blockenberg') },
                        { value: a.idleTabBg,      onChange: function (v) { set({ idleTabBg: v }); },      label: __('Idle Tab Background', 'blockenberg') },
                        { value: a.idleTabColor,   onChange: function (v) { set({ idleTabColor: v }); },   label: __('Idle Tab Text', 'blockenberg') },
                        { value: a.headlineColor,  onChange: function (v) { set({ headlineColor: v }); },  label: __('Headline Color', 'blockenberg') },
                        { value: a.descColor,      onChange: function (v) { set({ descColor: v }); },      label: __('Description Color', 'blockenberg') },
                        { value: a.bulletColor,    onChange: function (v) { set({ bulletColor: v }); },    label: __('Bullet Text Color', 'blockenberg') },
                        { value: a.bulletDot,      onChange: function (v) { set({ bulletDot: v }); },      label: __('Bullet Check Color', 'blockenberg') },
                        { value: a.ctaBg,          onChange: function (v) { set({ ctaBg: v }); },          label: __('CTA Button Background', 'blockenberg') },
                        { value: a.ctaColor,       onChange: function (v) { set({ ctaColor: v }); },       label: __('CTA Button Text', 'blockenberg') },
                        { value: a.videoBg,        onChange: function (v) { set({ videoBg: v }); },        label: __('Video Background', 'blockenberg') }
                    ]
                })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el(FVTPreview, { attributes: a, activeTab: activeTab, setActiveTab: setActiveTab })
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-fvtb-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
