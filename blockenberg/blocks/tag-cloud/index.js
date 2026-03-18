( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var PanelRow = wp.components.PanelRow;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    /* ---------- helpers ---------- */
    function getTagFontSize(weight, minPx, maxPx) {
        // weight 1-5 → fontSize minPx-maxPx
        return Math.round(minPx + ((weight - 1) / 4) * (maxPx - minPx));
    }

    function getTagColors(index, a) {
        if (a.colorMode === 'multi') {
            var cols = a.multiColors.split(',').map(function (c) { return c.trim(); }).filter(Boolean);
            return { bg: cols[index % cols.length], text: a.textColor };
        }
        if (a.colorMode === 'gradient') {
            return { bg: 'linear-gradient(135deg,' + a.primaryColor + ',' + a.secondaryColor + ')', text: a.textColor };
        }
        /* single */
        return { bg: a.primaryColor, text: a.textColor };
    }

    function getSortedTags(a) {
        var tags = (a.tags || []).slice();
        if (a.sortBy === 'alpha') {
            tags.sort(function (x, y) { return x.label.localeCompare(y.label); });
        } else if (a.sortBy === 'size') {
            tags.sort(function (x, y) { return y.weight - x.weight; });
        }
        if (a.randomize) {
            for (var i = tags.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var tmp = tags[i]; tags[i] = tags[j]; tags[j] = tmp;
            }
        }
        return tags.slice(0, a.maxTags);
    }

    function buildTagStyle(index, a, weight) {
        var fs = getTagFontSize(weight, a.fontSizeMin, a.fontSizeMax);
        var colors = getTagColors(index, a);
        var br = a.tagStyle === 'pill' ? 9999 : a.borderRadius;
        var bgStr = a.tagStyle === 'outlined' ? 'transparent' : colors.bg;
        var borderStr = a.tagStyle === 'outlined'
            ? a.borderWidth + 'px solid ' + (a.colorMode === 'multi' ? colors.bg : a.borderColor)
            : 'none';
        return {
            display: 'inline-block',
            fontSize: fs + 'px',
            padding: a.paddingY + 'px ' + a.paddingX + 'px',
            borderRadius: br + 'px',
            background: a.tagStyle === 'flat' ? 'none' : (a.tagStyle === 'outlined' ? 'transparent' : colors.bg),
            color: a.tagStyle === 'flat'
                ? (a.colorMode === 'multi' ? colors.bg : a.primaryColor)
                : (a.tagStyle === 'outlined' ? (a.colorMode === 'multi' ? colors.bg : a.borderColor) : colors.text),
            border: borderStr,
            transition: a.animateHover ? 'all 0.2s ease' : 'none',
            margin: '0',
        };
    }

    /* ---------- editor preview tag ---------- */
    function EditorTag(props) {
        var a = props.attrs;
        var tag = props.tag;
        var index = props.index;
        var style = buildTagStyle(index, a, tag.weight || 1);
        return el('a', { href: '#', className: 'bktagcl-tag', style: style, onClick: function (e) { e.preventDefault(); } },
            tag.label || __('Tag', 'blockenberg')
        );
    }

    /* ---------- tag editor row ---------- */
    function TagRow(props) {
        var tag = props.tag;
        var index = props.index;
        var onChange = props.onChange;
        var onRemove = props.onRemove;

        return el('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' } },
            el(TextControl, {
                placeholder: __('Label', 'blockenberg'),
                value: tag.label || '',
                onChange: function (v) { onChange('label', v); },
                style: { flex: '1', minWidth: '100px', margin: 0 }
            }),
            el(TextControl, {
                placeholder: __('URL', 'blockenberg'),
                value: tag.url || '',
                onChange: function (v) { onChange('url', v); },
                style: { flex: '1', minWidth: '100px', margin: 0 }
            }),
            el(SelectControl, {
                label: '',
                value: String(tag.weight || 3),
                options: [
                    { label: __('1 – XS', 'blockenberg'), value: '1' },
                    { label: __('2 – SM', 'blockenberg'), value: '2' },
                    { label: __('3 – MD', 'blockenberg'), value: '3' },
                    { label: __('4 – LG', 'blockenberg'), value: '4' },
                    { label: __('5 – XL', 'blockenberg'), value: '5' },
                ],
                onChange: function (v) { onChange('weight', parseInt(v, 10)); },
                style: { margin: 0 }
            }),
            el(Button, {
                isDestructive: true,
                isSmall: true,
                onClick: onRemove,
                'aria-label': __('Remove tag', 'blockenberg')
            }, '✕')
        );
    }

    /* ---------- edit ---------- */
    function Edit(props) {
        var attributes = props.attributes;
        var setAttributes = props.setAttributes;
        var a = attributes;

        function setTags(newTags) {
            setAttributes({ tags: newTags });
        }

        function addTag() {
            setAttributes({ tags: (a.tags || []).concat([{ label: 'New Tag', url: '#', weight: 3 }]) });
        }

        function removeTag(idx) {
            var next = (a.tags || []).slice();
            next.splice(idx, 1);
            setAttributes({ tags: next });
        }

        function updateTag(idx, key, val) {
            var next = (a.tags || []).slice();
            next[idx] = Object.assign({}, next[idx], { [key]: val });
            setAttributes({ tags: next });
        }

        var sortedPreview = getSortedTags(a);

        var wrapStyle = {
            display: 'flex',
            flexWrap: 'wrap',
            gap: a.gap + 'px',
            justifyContent: a.textAlign === 'center' ? 'center' : (a.textAlign === 'right' ? 'flex-end' : 'flex-start'),
        };

        var blockProps = useBlockProps((function () {
            var _tvf = getTypoCssVars();
            var s = { padding: '16px' };
            if (_tvf) Object.assign(s, _tvf(a.tagTypo, '--bktgc-tg-'));
            return { style: s };
        })());

        var colorSettings = [
            {
                label: __('Primary Color', 'blockenberg'),
                value: a.primaryColor,
                onChange: function (v) { setAttributes({ primaryColor: v || '#6c3fb5' }); }
            },
            {
                label: __('Secondary Color (gradient)', 'blockenberg'),
                value: a.secondaryColor,
                onChange: function (v) { setAttributes({ secondaryColor: v || '#a855f7' }); }
            },
            {
                label: __('Text Color', 'blockenberg'),
                value: a.textColor,
                onChange: function (v) { setAttributes({ textColor: v || '#ffffff' }); }
            },
            {
                label: __('Hover Background', 'blockenberg'),
                value: a.hoverBg,
                onChange: function (v) { setAttributes({ hoverBg: v || '#5a2fa0' }); }
            },
            {
                label: __('Hover Text Color', 'blockenberg'),
                value: a.hoverTextColor,
                onChange: function (v) { setAttributes({ hoverTextColor: v || '#ffffff' }); }
            },
            {
                label: __('Border Color', 'blockenberg'),
                value: a.borderColor,
                onChange: function (v) { setAttributes({ borderColor: v || '#6c3fb5' }); }
            },
        ];

        return el(Fragment, null,
            el(InspectorControls, null,

                /* Source Panel */
                el(PanelBody, { title: __('Source', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Tag Source', 'blockenberg'),
                        value: a.sourceType,
                        options: [
                            { label: __('Custom Tags', 'blockenberg'), value: 'custom' },
                            { label: __('WordPress Tags', 'blockenberg'), value: 'wp-tags' },
                        ],
                        onChange: function (v) { setAttributes({ sourceType: v }); }
                    }),
                    a.sourceType === 'wp-tags' && el(Fragment, null,
                        el(RangeControl, {
                            label: __('Max Tags', 'blockenberg'),
                            value: a.maxTags,
                            min: 5,
                            max: 100,
                            onChange: function (v) { setAttributes({ maxTags: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show Count', 'blockenberg'),
                            checked: a.showCount,
                            onChange: function (v) { setAttributes({ showCount: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    )
                ),

                /* Custom Tags Panel */
                a.sourceType === 'custom' && el(PanelBody, { title: __('Tags', 'blockenberg'), initialOpen: true },
                    (a.tags || []).map(function (tag, idx) {
                        return el(TagRow, {
                            key: idx,
                            tag: tag,
                            index: idx,
                            onChange: function (key, val) { updateTag(idx, key, val); },
                            onRemove: function () { removeTag(idx); }
                        });
                    }),
                    el(Button, { isPrimary: true, isSmall: true, onClick: addTag, style: { marginTop: '8px' } },
                        __('+ Add Tag', 'blockenberg')
                    )
                ),

                /* Sorting */
                el(PanelBody, { title: __('Sorting', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Sort By', 'blockenberg'),
                        value: a.sortBy,
                        options: [
                            { label: __('Input order', 'blockenberg'), value: 'input' },
                            { label: __('Alphabetical', 'blockenberg'), value: 'alpha' },
                            { label: __('Size (weight)', 'blockenberg'), value: 'size' },
                        ],
                        onChange: function (v) { setAttributes({ sortBy: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Randomize Order', 'blockenberg'),
                        checked: a.randomize,
                        onChange: function (v) { setAttributes({ randomize: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),

                /* Style Panel */
                el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Tag Style', 'blockenberg'),
                        value: a.tagStyle,
                        options: [
                            { label: __('Rounded', 'blockenberg'), value: 'rounded' },
                            { label: __('Pill', 'blockenberg'), value: 'pill' },
                            { label: __('Outlined', 'blockenberg'), value: 'outlined' },
                            { label: __('Flat (no background)', 'blockenberg'), value: 'flat' },
                        ],
                        onChange: function (v) { setAttributes({ tagStyle: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Color Mode', 'blockenberg'),
                        value: a.colorMode,
                        options: [
                            { label: __('Single color', 'blockenberg'), value: 'single' },
                            { label: __('Multi-color', 'blockenberg'), value: 'multi' },
                            { label: __('Gradient', 'blockenberg'), value: 'gradient' },
                        ],
                        onChange: function (v) { setAttributes({ colorMode: v }); }
                    }),
                    a.colorMode === 'multi' && el(BkbgMultiColorControl, {
                        label: __('Colors (comma-separated hex)', 'blockenberg'),
                        value: a.multiColors,
                        onChange: function (v) { setAttributes({ multiColors: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Text Align', 'blockenberg'),
                        value: a.textAlign,
                        options: [
                            { label: __('Left', 'blockenberg'), value: 'left' },
                            { label: __('Center', 'blockenberg'), value: 'center' },
                            { label: __('Right', 'blockenberg'), value: 'right' },
                        ],
                        onChange: function (v) { setAttributes({ textAlign: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Animated Hover', 'blockenberg'),
                        checked: a.animateHover,
                        onChange: function (v) { setAttributes({ animateHover: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),

                /* Typography Panel */
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl()({ label: __('Tag', 'blockenberg'), value: a.tagTypo, onChange: function (v) { setAttributes({ tagTypo: v }); } }),
                    el(RangeControl, {
                        label: __('Min Font Size (px)', 'blockenberg'),
                        value: a.fontSizeMin,
                        min: 9,
                        max: 20,
                        onChange: function (v) { setAttributes({ fontSizeMin: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Max Font Size (px)', 'blockenberg'),
                        value: a.fontSizeMax,
                        min: 14,
                        max: 40,
                        onChange: function (v) { setAttributes({ fontSizeMax: v }); }
                    })
                ),

                /* Spacing Panel */
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Gap Between Tags (px)', 'blockenberg'),
                        value: a.gap,
                        min: 0,
                        max: 32,
                        onChange: function (v) { setAttributes({ gap: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Horizontal Padding (px)', 'blockenberg'),
                        value: a.paddingX,
                        min: 4,
                        max: 40,
                        onChange: function (v) { setAttributes({ paddingX: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Vertical Padding (px)', 'blockenberg'),
                        value: a.paddingY,
                        min: 2,
                        max: 24,
                        onChange: function (v) { setAttributes({ paddingY: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: a.borderRadius,
                        min: 0,
                        max: 40,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Width (px)', 'blockenberg'),
                        value: a.borderWidth,
                        min: 1,
                        max: 6,
                        onChange: function (v) { setAttributes({ borderWidth: v }); }
                    })
                ),

                /* Colors */
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: colorSettings
                })
            ),

            /* ---- editor preview ---- */
            el('div', blockProps,
                a.sourceType === 'wp-tags' && el('p', { style: { textAlign: 'center', color: '#888', fontStyle: 'italic', marginBottom: '12px', fontSize: '13px' } },
                    __('WordPress tags will render on the front end.', 'blockenberg')
                ),
                el('div', {
                    className: 'bktagcl-wrap',
                    style: wrapStyle,
                    'data-source': a.sourceType,
                    'data-max': a.maxTags,
                    'data-sort': a.sortBy,
                    'data-count': a.showCount ? '1' : '0',
                    'data-hover-bg': a.hoverBg,
                    'data-hover-text': a.hoverTextColor,
                    'data-animate': a.animateHover ? '1' : '0',
                },
                    sortedPreview.map(function (tag, idx) {
                        return el(EditorTag, { key: idx, attrs: a, tag: tag, index: idx });
                    })
                )
            )
        );
    }

    /* ---------- save ---------- */
    function Save(props) {
        var a = props.attributes;
        var sorted = getSortedTags(a);
        var blockProps = (function () {
            var _tvf = getTypoCssVars();
            var s = {};
            if (_tvf) Object.assign(s, _tvf(a.tagTypo, '--bktgc-tg-'));
            return wp.blockEditor.useBlockProps.save({ style: s });
        })();

        var wrapStyle = {
            display: 'flex',
            flexWrap: 'wrap',
            gap: a.gap + 'px',
            justifyContent: a.textAlign === 'center' ? 'center' : (a.textAlign === 'right' ? 'flex-end' : 'flex-start'),
        };

        return el('div', blockProps,
            el('div', Object.assign({
                className: 'bktagcl-wrap',
                'data-source': a.sourceType,
                'data-max': a.maxTags,
                'data-sort': a.sortBy,
                'data-count': a.showCount ? '1' : '0',
                'data-hover-bg': a.hoverBg,
                'data-hover-text': a.hoverTextColor,
                'data-animate': a.animateHover ? '1' : '0',
                '--bktagcl-hover-bg': a.hoverBg,
                '--bktagcl-hover-text': a.hoverTextColor,
            }, { style: wrapStyle }),
                a.sourceType === 'custom' && sorted.map(function (tag, idx) {
                    var fs = getTagFontSize(tag.weight || 1, a.fontSizeMin, a.fontSizeMax);
                    var colors = getTagColors(idx, a);
                    var br = a.tagStyle === 'pill' ? 9999 : a.borderRadius;
                    var bgVal = a.tagStyle === 'flat' ? 'none' : (a.tagStyle === 'outlined' ? 'transparent' : colors.bg);
                    var textVal = a.tagStyle === 'flat'
                        ? (a.colorMode === 'multi' ? colors.bg : a.primaryColor)
                        : (a.tagStyle === 'outlined' ? (a.colorMode === 'multi' ? colors.bg : a.borderColor) : colors.text);
                    var borderVal = a.tagStyle === 'outlined'
                        ? a.borderWidth + 'px solid ' + (a.colorMode === 'multi' ? colors.bg : a.borderColor)
                        : 'none';

                    return el('a', {
                        key: idx,
                        href: tag.url || '#',
                        className: 'bktagcl-tag',
                        style: {
                            fontSize: fs + 'px',
                            padding: a.paddingY + 'px ' + a.paddingX + 'px',
                            borderRadius: br + 'px',
                            background: bgVal,
                            color: textVal,
                            border: borderVal,
                            display: 'inline-block',
                        }
                    }, tag.label);
                }),
                /* wp-tags placeholder — rendered by frontend.js */
                a.sourceType === 'wp-tags' && null
            )
        );
    }

    /* ── BkbgMultiColorControl ──────────────────────────────────────── */
    function BkbgMultiColorControl(props) {
        var label = props.label;
        var value = props.value || '';
        var onChange = props.onChange;
        var colors = value.split(',').map(function (c) { return c.trim(); }).filter(Boolean);
        var st = useState(-1); var openIdx = st[0]; var setOpenIdx = st[1];
        return el(Fragment, null,
            el('div', { style: { marginBottom: '8px' } },
                el('span', { style: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', display: 'block', marginBottom: '4px' } }, label),
                el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' } },
                    colors.map(function (c, i) {
                        return el('div', { key: i, style: { position: 'relative', display: 'inline-flex' } },
                            el('button', { type: 'button', style: { width: 28, height: 28, borderRadius: 4, border: '1px solid #ccc', background: c, cursor: 'pointer', padding: 0 }, onClick: function () { setOpenIdx(openIdx === i ? -1 : i); } }),
                            el('button', { type: 'button', 'aria-label': 'Remove', style: { position: 'absolute', top: -6, right: -6, width: 14, height: 14, borderRadius: '50%', border: 'none', background: '#d00', color: '#fff', fontSize: '10px', lineHeight: '14px', cursor: 'pointer', padding: 0, textAlign: 'center' }, onClick: function () { var n = colors.slice(); n.splice(i, 1); onChange(n.join(',')); } }, '×'),
                            openIdx === i && el(Popover, { onClose: function () { setOpenIdx(-1); } }, el('div', { style: { padding: '8px' } }, el(ColorPicker, { color: c, enableAlpha: true, onChange: function (v) { var n = colors.slice(); n[i] = v; onChange(n.join(',')); } })))
                        );
                    }),
                    el(Button, { isSmall: true, variant: 'secondary', onClick: function () { onChange(value ? value + ',#6c3fb5' : '#6c3fb5'); }, style: { height: 28, minWidth: 28 } }, '+')
                )
            )
        );
    }

    registerBlockType('blockenberg/tag-cloud', {
        edit: Edit,
        save: Save,
    });
}() );
