( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;
    var __ = wp.i18n.__;

    /* ── Typography lazy getters ───────────────────────────────────────── */
    var _Typo, _tv;
    Object.defineProperty(window, '__bkbgAserTypoReady', { get: function () {
        if (!_Typo) _Typo = window.bkbgTypographyControl;
        if (!_tv)   _tv   = window.bkbgTypoCssVars;
        return !!(_Typo && _tv);
    }});
    function getTypoCssVars()   { window.__bkbgAserTypoReady; return _tv;   }
    function getTypoComponent()  { window.__bkbgAserTypoReady; return _Typo; }

    function updatePart(parts, idx, field, val) {
        return parts.map(function (p, i) {
            if (i !== idx) return p;
            var u = {}; u[field] = val;
            return Object.assign({}, p, u);
        });
    }

    // ── SeriesPreview ───────────────────────────────────────────────────────────
    function SeriesPreview(props) {
        var a = props.attributes;
        var setAttributes = props.setAttributes;
        var total = a.parts.length;
        var pct = total > 0 ? Math.round((a.currentPart / total) * 100) : 0;

        return el('div', {
            className: 'bkbg-aser-block',
            style: { background: a.bgColor, borderColor: a.borderColor, borderRadius: a.borderRadius + 'px' }
        },
            // Header
            el('div', { className: 'bkbg-aser-header' },
                el('div', { className: 'bkbg-aser-series-label', style: { color: a.accentColor } }, 'Article Series'),
                el('h3', {
                    className: 'bkbg-aser-title',
                    style: { color: a.titleColor },
                    contentEditable: true,
                    suppressContentEditableWarning: true,
                    onBlur: function (e) { setAttributes({ seriesTitle: e.target.textContent }); }
                }, a.seriesTitle),
                a.showSeriesDescription && el('p', {
                    className: 'bkbg-aser-desc',
                    style: { color: a.descColor },
                    contentEditable: true,
                    suppressContentEditableWarning: true,
                    onBlur: function (e) { setAttributes({ seriesDescription: e.target.textContent }); }
                }, a.seriesDescription)
            ),
            // Progress bar
            a.showProgress && el('div', { className: 'bkbg-aser-progress-wrap' },
                el('div', { className: 'bkbg-aser-progress-bar', style: { background: a.progressBg } },
                    el('div', {
                        className: 'bkbg-aser-progress-fill',
                        style: { width: pct + '%', background: a.progressColor }
                    })
                ),
                el('span', { className: 'bkbg-aser-progress-label', style: { color: a.descColor } },
                    'Part ' + a.currentPart + ' of ' + total
                )
            ),
            // Parts list
            el('ol', { className: 'bkbg-aser-list bkbg-aser-layout-' + a.layout },
                a.parts.map(function (part, i) {
                    var isCurrent = i + 1 === a.currentPart;
                    return el('li', {
                        key: i,
                        className: 'bkbg-aser-item' + (isCurrent ? ' is-current' : ''),
                        style: {
                            background: isCurrent ? a.currentBg : a.itemBg,
                            color: isCurrent ? a.currentColor : a.itemColor,
                            borderColor: isCurrent ? a.currentBorderColor : a.itemBorderColor,
                            borderRadius: Math.max(0, a.borderRadius - 4) + 'px'
                        }
                    },
                        a.showNumbers && el('span', {
                            className: 'bkbg-aser-num',
                            style: {
                                background: isCurrent ? a.currentNumberBg : a.numberBg,
                                color: isCurrent ? a.currentNumberColor : a.numberColor
                            }
                        }, String(i + 1)),
                        el('div', { className: 'bkbg-aser-item-body' },
                            el('span', {
                                className: 'bkbg-aser-part-title',
                                style: { color: isCurrent ? a.currentColor : a.itemColor }
                            }, part.title),
                            a.showExcerpt && part.excerpt && el('span', {
                                className: 'bkbg-aser-excerpt',
                                style: { color: isCurrent ? a.currentColor : a.excerptColor }
                            }, part.excerpt)
                        ),
                        isCurrent && el('span', { className: 'bkbg-aser-current-badge', style: { background: a.accentColor } }, 'Current')
                    );
                })
            )
        );
    }

    // ── PartEditor ──────────────────────────────────────────────────────────────
    function PartEditor(props) {
        var parts = props.parts;
        var currentPart = props.currentPart;
        var setAttributes = props.setAttributes;
        var accentColor = props.accentColor;

        var openState = useState(parts.map(function () { return false; }));
        var open = openState[0];
        var setOpen = openState[1];

        function toggle(i) {
            setOpen(open.map(function (v, j) { return j === i ? !v : v; }));
        }

        function remove(i) {
            var newParts = parts.filter(function (_, j) { return j !== i; });
            var newCurrent = currentPart > i + 1 ? currentPart - 1 : currentPart;
            setAttributes({ parts: newParts, currentPart: Math.min(newCurrent, newParts.length) });
            setOpen(open.filter(function (_, j) { return j !== i; }));
        }

        function add() {
            setAttributes({ parts: parts.concat([{ title: 'Part ' + (parts.length + 1) + ': New Article', url: '#', excerpt: 'Short description of this article.' }]) });
            setOpen(open.concat([true]));
        }

        return el('div', null,
            parts.map(function (part, i) {
                var isCurrent = i + 1 === currentPart;
                return el('div', { key: i, className: 'bkbg-aser-part-ed' },
                    el('div', {
                        className: 'bkbg-aser-part-ed-header',
                        onClick: function () { toggle(i); },
                        style: { borderLeftColor: isCurrent ? '#3b82f6' : accentColor }
                    },
                        el('span', null, (i + 1) + '. ' + part.title.slice(0, 35) + (part.title.length > 35 ? '…' : '')),
                        el('span', null, open[i] ? '▲' : '▼')
                    ),
                    open[i] && el('div', { className: 'bkbg-aser-part-ed-fields' },
                        el(TextControl, {
                            label: __('Title'),
                            value: part.title,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ parts: updatePart(parts, i, 'title', v) }); }
                        }),
                        el(TextControl, {
                            label: __('URL'),
                            value: part.url,
                            type: 'url',
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ parts: updatePart(parts, i, 'url', v) }); }
                        }),
                        el(TextareaControl, {
                            label: __('Excerpt (optional)'),
                            value: part.excerpt,
                            rows: 2,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ parts: updatePart(parts, i, 'excerpt', v) }); }
                        }),
                        el('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
                            el(Button, {
                                variant: isCurrent ? 'primary' : 'secondary',
                                isSmall: true,
                                onClick: function () { setAttributes({ currentPart: i + 1 }); }
                            }, isCurrent ? '★ Current article' : 'Set as current'),
                            parts.length > 1 && el(Button, {
                                variant: 'link',
                                isDestructive: true,
                                isSmall: true,
                                onClick: function () { remove(i); }
                            }, __('Remove'))
                        )
                    )
                );
            }),
            el(Button, {
                variant: 'secondary',
                onClick: add,
                style: { marginTop: '8px' }
            }, __('+ Add Part'))
        );
    }

    // ── register ────────────────────────────────────────────────────────────────
    registerBlockType('blockenberg/article-series', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Series Parts'), initialOpen: true },
                        el(PartEditor, {
                            parts: a.parts,
                            currentPart: a.currentPart,
                            setAttributes: setAttributes,
                            accentColor: a.accentColor
                        })
                    ),
                    el(PanelBody, { title: __('Display'), initialOpen: false },
                        el(SelectControl, {
                            label: __('Layout'),
                            value: a.layout,
                            __nextHasNoMarginBottom: true,
                            options: [
                                { value: 'list', label: 'List' },
                                { value: 'compact', label: 'Compact' },
                                { value: 'grid', label: 'Grid (2-col)' }
                            ],
                            onChange: function (v) { setAttributes({ layout: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show progress bar'),
                            checked: a.showProgress,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showProgress: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show series description'),
                            checked: a.showSeriesDescription,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showSeriesDescription: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show part numbers'),
                            checked: a.showNumbers,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showNumbers: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show excerpts'),
                            checked: a.showExcerpt,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showExcerpt: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Border radius (px)'),
                            value: a.borderRadius,
                            min: 0, max: 24,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ borderRadius: v }); }
                        })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoComponent() && el(getTypoComponent(), {
                            label: __('Title Typography', 'blockenberg'),
                            value: a.titleTypo || {},
                            onChange: function (v) { setAttributes({ titleTypo: v }); }
                        }),
                        getTypoComponent() && el(getTypoComponent(), {
                            label: __('Description Typography', 'blockenberg'),
                            value: a.descTypo || {},
                            onChange: function (v) { setAttributes({ descTypo: v }); }
                        }),
                        getTypoComponent() && el(getTypoComponent(), {
                            label: __('Part Title Typography', 'blockenberg'),
                            value: a.partTitleTypo || {},
                            onChange: function (v) { setAttributes({ partTitleTypo: v }); }
                        }),
                        getTypoComponent() && el(getTypoComponent(), {
                            label: __('Excerpt Typography', 'blockenberg'),
                            value: a.excerptTypo || {},
                            onChange: function (v) { setAttributes({ excerptTypo: v }); }
                        })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background'), value: a.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '#f8fafc' }); } },
                            { label: __('Border'), value: a.borderColor, onChange: function (v) { setAttributes({ borderColor: v || '#e2e8f0' }); } },
                            { label: __('Accent'), value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#3b82f6' }); } },
                            { label: __('Title'), value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#0f172a' }); } },
                            { label: __('Description'), value: a.descColor, onChange: function (v) { setAttributes({ descColor: v || '#64748b' }); } },
                            { label: __('Item background'), value: a.itemBg, onChange: function (v) { setAttributes({ itemBg: v || '#ffffff' }); } },
                            { label: __('Item text'), value: a.itemColor, onChange: function (v) { setAttributes({ itemColor: v || '#334155' }); } },
                            { label: __('Current item bg'), value: a.currentBg, onChange: function (v) { setAttributes({ currentBg: v || '#eff6ff' }); } },
                            { label: __('Current item text'), value: a.currentColor, onChange: function (v) { setAttributes({ currentColor: v || '#1d4ed8' }); } },
                            { label: __('Current item border'), value: a.currentBorderColor, onChange: function (v) { setAttributes({ currentBorderColor: v || '#3b82f6' }); } },
                            { label: __('Progress bar fill'), value: a.progressColor, onChange: function (v) { setAttributes({ progressColor: v || '#3b82f6' }); } },
                            { label: __('Number bg'), value: a.numberBg, onChange: function (v) { setAttributes({ numberBg: v || '#e2e8f0' }); } },
                            { label: __('Current number bg'), value: a.currentNumberBg, onChange: function (v) { setAttributes({ currentNumberBg: v || '#3b82f6' }); } }
                        ]
                    })
                ),
                el('div', useBlockProps((function () {
                    var _tv = getTypoCssVars();
                    var s = {
                        '--bkbg-aser-title-sz': (a.titleFontSize || 20) + 'px',
                        '--bkbg-aser-desc-sz':  (a.descFontSize  || 14) + 'px',
                        '--bkbg-aser-pt-sz':    (a.partTitleFontSize || 14) + 'px',
                        '--bkbg-aser-exc-sz':   (a.excerptFontSize || 12) + 'px'
                    };
                    if (_tv) {
                        Object.assign(s, _tv(a.titleTypo     || {}, '--bkbg-aser-title-'));
                        Object.assign(s, _tv(a.descTypo      || {}, '--bkbg-aser-desc-'));
                        Object.assign(s, _tv(a.partTitleTypo || {}, '--bkbg-aser-pt-'));
                        Object.assign(s, _tv(a.excerptTypo   || {}, '--bkbg-aser-exc-'));
                    }
                    return { style: s };
                })()),
                    el(SeriesPreview, { attributes: a, setAttributes: setAttributes })
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-aser-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
