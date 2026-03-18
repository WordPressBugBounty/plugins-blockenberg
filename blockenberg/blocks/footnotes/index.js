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

    var _fnTC, _fnTV;
    function _tc() { return _fnTC || (_fnTC = window.bkbgTypographyControl); }
    function _tv() { return _fnTV || (_fnTV = window.bkbgTypoCssVars); }

    // ── helpers ────────────────────────────────────────────────────────────────
    function updateNote(notes, idx, val) {
        return notes.map(function (n, i) {
            if (i !== idx) return n;
            return Object.assign({}, n, { text: val });
        });
    }

    var MARKER_LABELS = { number: '1, 2, 3…', letter: 'a, b, c…', roman: 'i, ii, iii…', symbol: '*, †, ‡…' };
    var SYMBOLS = ['*', '†', '‡', '§', '‖', '¶', '#', '**', '††', '‡‡'];

    function getMarker(style, i) {
        if (style === 'letter') return String.fromCharCode(97 + i);
        if (style === 'roman') {
            var nums = [1,4,5,9,10,40,50,90,100,400,500,900,1000];
            var syms = ['i','iv','v','ix','x','xl','l','xc','c','cd','d','cm','m'];
            var n = i + 1, out = '';
            for (var k = nums.length - 1; k >= 0; k--) {
                while (n >= nums[k]) { out += syms[k]; n -= nums[k]; }
            }
            return out;
        }
        if (style === 'symbol') return SYMBOLS[i % SYMBOLS.length];
        return String(i + 1);
    }

    // ── FootnotesPreview ────────────────────────────────────────────────────────
    function FootnotesPreview(props) {
        var a = props.attributes;

        var markerStyle = {
            background: a.markerBg,
            color: a.markerColor,
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: '700',
            padding: '1px 5px',
            cursor: 'default',
            display: 'inline-block',
            minWidth: '20px',
            textAlign: 'center',
            flexShrink: '0'
        };

        return el('div', {
            className: 'bkbg-fn-block',
            style: { background: a.bgColor, borderRadius: a.borderRadius + 'px' }
        },
            a.dividerEnabled && el('div', { className: 'bkbg-fn-divider', style: { borderTopColor: a.dividerColor } }),
            a.showTitle && el('div', {
                className: 'bkbg-fn-title',
                style: { color: a.titleColor }
            }, a.title),
            el('ol', { className: 'bkbg-fn-list bkbg-fn-list-' + a.listStyle },
                a.notes.map(function (note, i) {
                    return el('li', {
                        key: i,
                        className: 'bkbg-fn-item',
                        style: { color: a.textColor, borderColor: a.borderColor }
                    },
                        el('span', { className: 'bkbg-fn-marker', style: markerStyle },
                            getMarker(a.markerStyle, i)
                        ),
                        el('span', { className: 'bkbg-fn-text' }, note.text)
                    );
                })
            )
        );
    }

    // ── NoteEditor ──────────────────────────────────────────────────────────────
    function NoteEditor(props) {
        var notes = props.notes;
        var setAttributes = props.setAttributes;
        var markerStyle = props.markerStyle;
        var markerColor = props.markerColor;

        var openState = useState(notes.map(function () { return false; }));
        var open = openState[0];
        var setOpen = openState[1];

        function toggle(i) {
            setOpen(open.map(function (v, j) { return j === i ? !v : v; }));
        }

        function remove(i) {
            var newNotes = notes.filter(function (_, j) { return j !== i; })
                .map(function (n, j) { return Object.assign({}, n, { id: j + 1 }); });
            setAttributes({ notes: newNotes });
            setOpen(open.filter(function (_, j) { return j !== i; }));
        }

        function add() {
            var newId = notes.length + 1;
            setAttributes({ notes: notes.concat([{ id: newId, text: 'New footnote text.' }]) });
            setOpen(open.concat([true]));
        }

        return el('div', null,
            notes.map(function (note, i) {
                return el('div', { key: i, className: 'bkbg-fn-nota-editor' },
                    el('div', {
                        className: 'bkbg-fn-nota-header',
                        onClick: function () { toggle(i); },
                        style: { borderLeftColor: markerColor }
                    },
                        el('span', null, getMarker(markerStyle, i) + ' — ' + note.text.slice(0, 40) + (note.text.length > 40 ? '…' : '')),
                        el('span', null, open[i] ? '▲' : '▼')
                    ),
                    open[i] && el('div', { className: 'bkbg-fn-nota-fields' },
                        el(TextareaControl, {
                            label: __('Footnote text'),
                            value: note.text,
                            rows: 3,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ notes: updateNote(notes, i, v) }); }
                        }),
                        el(Button, {
                            variant: 'link',
                            isDestructive: true,
                            onClick: function () { remove(i); }
                        }, __('Remove'))
                    )
                );
            }),
            el(Button, {
                variant: 'secondary',
                onClick: add,
                style: { marginTop: '8px' }
            }, __('+ Add Footnote'))
        );
    }

    // ── register ────────────────────────────────────────────────────────────────
    registerBlockType('blockenberg/footnotes', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Footnotes'), initialOpen: true },
                        el(NoteEditor, {
                            notes: a.notes,
                            setAttributes: setAttributes,
                            markerStyle: a.markerStyle,
                            markerColor: a.markerColor
                        })
                    ),
                    el(PanelBody, { title: __('Settings'), initialOpen: false },
                        el(TextControl, {
                            label: __('Section title'),
                            value: a.title,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ title: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show title'),
                            checked: a.showTitle,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showTitle: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show divider line'),
                            checked: a.dividerEnabled,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ dividerEnabled: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show tooltip on hover'),
                            checked: a.showTooltip,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showTooltip: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Marker style'),
                            value: a.markerStyle,
                            __nextHasNoMarginBottom: true,
                            options: Object.keys(MARKER_LABELS).map(function (k) {
                                return { value: k, label: MARKER_LABELS[k] };
                            }),
                            onChange: function (v) { setAttributes({ markerStyle: v }); }
                        }),
                        el(SelectControl, {
                            label: __('List style'),
                            value: a.listStyle,
                            __nextHasNoMarginBottom: true,
                            options: [
                                { value: 'default', label: 'Default (clean rows)' },
                                { value: 'card', label: 'Card (bordered)' },
                                { value: 'compact', label: 'Compact' }
                            ],
                            onChange: function (v) { setAttributes({ listStyle: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Border radius (px)'),
                            value: a.borderRadius,
                            min: 0, max: 24,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ borderRadius: v }); }
                        })
                    ),
                    el(PanelBody, { title: __('Typography'), initialOpen: false },
                        _tc()({ label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                        _tc()({ label: __('Note Text', 'blockenberg'), value: a.typoNote, onChange: function (v) { setAttributes({ typoNote: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background'), value: a.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '#f8fafc' }); } },
                            { label: __('Border'), value: a.borderColor, onChange: function (v) { setAttributes({ borderColor: v || '#e2e8f0' }); } },
                            { label: __('Title'), value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#0f172a' }); } },
                            { label: __('Text'), value: a.textColor, onChange: function (v) { setAttributes({ textColor: v || '#475569' }); } },
                            { label: __('Marker text'), value: a.markerColor, onChange: function (v) { setAttributes({ markerColor: v || '#3b82f6' }); } },
                            { label: __('Marker background'), value: a.markerBg, onChange: function (v) { setAttributes({ markerBg: v || '#eff6ff' }); } },
                            { label: __('Divider'), value: a.dividerColor, onChange: function (v) { setAttributes({ dividerColor: v || '#e2e8f0' }); } },
                            { label: __('Tooltip background'), value: a.tooltipBg, onChange: function (v) { setAttributes({ tooltipBg: v || '#1e293b' }); } },
                            { label: __('Tooltip text'), value: a.tooltipColor, onChange: function (v) { setAttributes({ tooltipColor: v || '#f1f5f9' }); } }
                        ]
                    })
                ),
                el('div', useBlockProps({ style: Object.assign({}, _tv()(a.typoTitle, '--bkbg-fn-tt-'), _tv()(a.typoNote, '--bkbg-fn-nt-')) }),
                    el(FootnotesPreview, { attributes: a })
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-fn-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
