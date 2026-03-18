( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button, SelectControl } = window.wp.components;
    const { __ } = window.wp.i18n;

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }
    var _tv = (function () {
        var fn = window.bkbgTypoCssVars;
        return fn ? fn : function () { return {}; };
    })();

    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return isNaN(r) ? '' : `${r}, ${g}, ${b}`;
    }

    function isLight(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b > 128;
    }

    function updGroup(groups, gi, field, val) {
        return groups.map((g, i) => i === gi ? { ...g, [field]: val } : g);
    }
    function updToken(groups, gi, ti, field, val) {
        return groups.map((g, i) => {
            if (i !== gi) return g;
            return { ...g, tokens: g.tokens.map((t, j) => j === ti ? { ...t, [field]: val } : t) };
        });
    }

    // ── Render colour grid ───────────────────────────────────────────
    function renderSwatch(token, a) {
        const light = isLight(token.hex || '#ffffff');
        const onColor = light ? '#000000' : '#ffffff';
        return el('div', {
            className: 'bkbg-ct-swatch',
            style: {
                background: a.swatchBg,
                border: '1px solid ' + a.borderColor,
                borderRadius: a.swatchRadius + 'px',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'inline-flex',
                flexDirection: 'column',
            }
        },
            // Color block
            el('div', {
                className: 'bkbg-ct-color-block',
                'data-hex': token.hex,
                style: {
                    width: a.swatchSize + 'px',
                    height: a.swatchSize + 'px',
                    background: token.hex,
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
                    padding: '4px',
                }
            },
                a.showCopyHint && el('span', { className: 'bkbg-ct-copy-icon', style: { fontSize: '11px', color: onColor, opacity: 0, transition: 'opacity .15s', userSelect: 'none' } }, '⎘')
            ),
            // Label area
            el('div', {
                style: { padding: '6px 8px', minWidth: a.swatchSize + 'px', maxWidth: a.swatchSize + 10 + 'px' }
            },
                a.showName && el('div', { className: 'bkbg-ctk-name', style: { color: a.swatchNameColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, token.name),
                a.showHex  && el('div', { className: 'bkbg-ctk-hex', style: { color: a.swatchMetaColor, marginTop: '1px' } }, token.hex),
                a.showRGB  && el('div', { className: 'bkbg-ctk-rgb', style: { color: a.swatchMetaColor } }, hexToRgb(token.hex)),
            )
        );
    }

    function renderGroup(group, a) {
        return el('div', { className: 'bkbg-ct-group', style: { marginBottom: '32px' } },
            el('h4', { className: 'bkbg-ct-group-name', style: { color: a.groupNameColor, fontSize: '14px', fontWeight: 700, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' } }, group.name),
            el('div', { className: 'bkbg-ct-swatches', style: { display: 'flex', flexWrap: 'wrap', gap: '10px' } },
                (group.tokens || []).map((token, ti) => renderSwatch(token, a))
            )
        );
    }

    function wrapStyle(a) {
        return { background: a.bgColor, borderRadius: a.borderRadius + 'px', paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', paddingLeft: '36px', paddingRight: '36px' };
    }

    registerBlockType('blockenberg/color-tokens', {
        edit: function ({ attributes: a, setAttributes }) {
            var bpStyle = wrapStyle(a);
            Object.assign(bpStyle, _tv(a.typoTitle, '--bkbg-ctk-tt'));
            Object.assign(bpStyle, _tv(a.typoSubtitle, '--bkbg-ctk-st'));
            Object.assign(bpStyle, _tv(a.typoLabel, '--bkbg-ctk-lb'));
            const blockProps = useBlockProps({ style: bpStyle });
            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Content'), initialOpen: true },
                        el(TextControl, { label: __('Title'), value: a.title, onChange: v => setAttributes({ title: v }) }),
                        el(ToggleControl, { label: __('Show title'), checked: a.showTitle, onChange: v => setAttributes({ showTitle: v }) }),
                        el(TextControl, { label: __('Subtitle'), value: a.subtitle, onChange: v => setAttributes({ subtitle: v }) }),
                        el(ToggleControl, { label: __('Show subtitle'), checked: a.showSubtitle, onChange: v => setAttributes({ showSubtitle: v }) }),
                        el(ToggleControl, { label: __('Show swatch name'), checked: a.showName, onChange: v => setAttributes({ showName: v }) }),
                        el(ToggleControl, { label: __('Show hex value'), checked: a.showHex, onChange: v => setAttributes({ showHex: v }) }),
                        el(ToggleControl, { label: __('Show RGB value'), checked: a.showRGB, onChange: v => setAttributes({ showRGB: v }) }),
                        el(ToggleControl, { label: __('Show copy icon on hover'), checked: a.showCopyHint, onChange: v => setAttributes({ showCopyHint: v }) }),
                    ),
                    el(PanelBody, { title: __('Swatch Size'), initialOpen: false },
                        el(RangeControl, { label: __('Swatch size (px)'), value: a.swatchSize, min: 40, max: 160, onChange: v => setAttributes({ swatchSize: v }) }),
                        el(RangeControl, { label: __('Swatch radius (px)'), value: a.swatchRadius, min: 0, max: 24, onChange: v => setAttributes({ swatchRadius: v }) }),
                    ),
                    el(PanelBody, { title: __('Palette Groups (' + a.groups.length + ')'), initialOpen: false },
                        a.groups.map((group, gi) =>
                            el(PanelBody, { key: gi, title: group.name + ' (' + group.tokens.length + ' tokens)', initialOpen: false },
                                el(TextControl, { label: __('Group name'), value: group.name, onChange: v => setAttributes({ groups: updGroup(a.groups, gi, 'name', v) }) }),
                                el('p', { style: { fontSize: '12px', color: '#666', margin: '0 0 8px' } }, __('Tokens')),
                                group.tokens.map((token, ti) =>
                                    el('div', { key: ti, style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' } },
                                        el('input', { type: 'color', value: token.hex, style: { width: '36px', height: '36px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', flexShrink: 0 }, onChange: e => setAttributes({ groups: updToken(a.groups, gi, ti, 'hex', e.target.value) }) }),
                                        el(TextControl, { label: '', value: token.name, placeholder: __('token name'), onChange: v => setAttributes({ groups: updToken(a.groups, gi, ti, 'name', v) }) }),
                                        el(Button, { variant: 'secondary', isSmall: true, isDestructive: true, onClick: () => { const g = { ...group, tokens: group.tokens.filter((_, j) => j !== ti) }; setAttributes({ groups: updGroup(a.groups, gi, 'tokens', g.tokens) }); } }, '✕'),
                                    )
                                ),
                                el('div', { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
                                    el(Button, { variant: 'secondary', isSmall: true, onClick: () => { const g = { ...group, tokens: group.tokens.concat([{ name: 'new-token', hex: '#6366f1' }]) }; setAttributes({ groups: updGroup(a.groups, gi, 'tokens', g.tokens) }); } }, __('+ Token')),
                                    el(Button, { variant: 'secondary', isSmall: true, isDestructive: true, onClick: () => setAttributes({ groups: a.groups.filter((_, j) => j !== gi) }) }, __('Remove group')),
                                ),
                            )
                        ),
                        el(Button, { variant: 'primary', onClick: () => setAttributes({ groups: a.groups.concat([{ name: 'New Palette', tokens: [{ name: 'color-500', hex: '#6366f1' }] }]) }) }, __('+ Add group')),
                    ),
                    el(PanelBody, { title: __('Spacing & Style'), initialOpen: false },
                        el(RangeControl, { label: __('Border radius'), value: a.borderRadius, min: 0, max: 32, onChange: v => setAttributes({ borderRadius: v }) }),
                        el(RangeControl, { label: __('Padding top'), value: a.paddingTop, min: 0, max: 120, onChange: v => setAttributes({ paddingTop: v }) }),
                        el(RangeControl, { label: __('Padding bottom'), value: a.paddingBottom, min: 0, max: 120, onChange: v => setAttributes({ paddingBottom: v }) }),
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function () {
                            var TC = getTypographyControl();
                            return el( window.wp.element.Fragment, {},
                                el( TC, { label: __( 'Title', 'blockenberg' ), value: a.typoTitle || {}, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                                el( TC, { label: __( 'Subtitle', 'blockenberg' ), value: a.typoSubtitle || {}, onChange: function (v) { setAttributes({ typoSubtitle: v }); } }),
                                el( TC, { label: __( 'Label', 'blockenberg' ), value: a.typoLabel || {}, onChange: function (v) { setAttributes({ typoLabel: v }); } })
                            );
                        })()
                    ),
el(PanelColorSettings, {
                        title: __('Colors'), initialOpen: false,
                        colorSettings: [
                            { label: __('Background'),     value: a.bgColor,        onChange: v => setAttributes({ bgColor:        v || '#ffffff' }) },
                            { label: __('Title'),          value: a.titleColor,     onChange: v => setAttributes({ titleColor:     v || '#0f172a' }) },
                            { label: __('Subtitle'),       value: a.subtitleColor,  onChange: v => setAttributes({ subtitleColor:  v || '#64748b' }) },
                            { label: __('Group name'),     value: a.groupNameColor, onChange: v => setAttributes({ groupNameColor: v || '#374151' }) },
                            { label: __('Swatch name'),    value: a.swatchNameColor,onChange: v => setAttributes({ swatchNameColor:v || '#374151' }) },
                            { label: __('Swatch meta'),    value: a.swatchMetaColor,onChange: v => setAttributes({ swatchMetaColor:v || '#6b7280' }) },
                            { label: __('Swatch card BG'), value: a.swatchBg,       onChange: v => setAttributes({ swatchBg:       v || '#f8fafc' }) },
                            { label: __('Swatch border'),  value: a.borderColor,    onChange: v => setAttributes({ borderColor:    v || '#e2e8f0' }) },
                        ]
                    }),
                ),

                a.showTitle && el('h3', { className: 'bkbg-ct-title', style: { color: a.titleColor, margin: '0 0 8px' } }, a.title),
                a.showSubtitle && el('p', { className: 'bkbg-ct-subtitle', style: { color: a.subtitleColor, margin: '0 0 32px' } }, a.subtitle),
                el('div', { className: 'bkbg-ct-groups' },
                    a.groups.map((g, i) => renderGroup(g, a))
                ),
            );
        },

        save: function ({ attributes: a }) {
            var bpStyle = wrapStyle(a);
            Object.assign(bpStyle, _tv(a.typoTitle, '--bkbg-ctk-tt'));
            Object.assign(bpStyle, _tv(a.typoSubtitle, '--bkbg-ctk-st'));
            Object.assign(bpStyle, _tv(a.typoLabel, '--bkbg-ctk-lb'));
            return el('div', { className: 'bkbg-ct-wrap', style: bpStyle },
                a.showTitle && el('h3', { className: 'bkbg-ct-title', style: { color: a.titleColor, margin: '0 0 8px' } }, a.title),
                a.showSubtitle && el('p', { className: 'bkbg-ct-subtitle', style: { color: a.subtitleColor, margin: '0 0 32px' } }, a.subtitle),
                el('div', { className: 'bkbg-ct-groups' },
                    a.groups.map((g, i) => renderGroup(g, a))
                ),
            );
        }
    });
}() );
