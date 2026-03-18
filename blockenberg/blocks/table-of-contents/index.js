( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody    = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl  = wp.components.TextControl;
    var ColorPicker  = wp.components.ColorPicker;
    var Popover      = wp.components.Popover;

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', title: value, onClick: function () { setOpenKey(isOpen ? null : key); }, style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#cccccc' } }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } }, el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange }))
                )
            )
        );
    }

    function buildCSS(a) {
        return {
            '--bkbg-toc-bg'          : a.bgColor,
            '--bkbg-toc-border'      : a.borderColor,
            '--bkbg-toc-title-color' : a.titleColor,
            '--bkbg-toc-link-color'  : a.linkColor,
            '--bkbg-toc-link-hover'  : a.linkHoverColor,
            '--bkbg-toc-link-active' : a.activeLinkColor,
            '--bkbg-toc-radius'      : a.borderRadius + 'px',
            '--bkbg-toc-pad'         : a.padding + 'px'
        };
    }

    registerBlockType('blockenberg/table-of-contents', {
        title: __('Table of Contents', 'blockenberg'),
        icon: 'list-view',
        category: 'bkbg-blog',
        description: __('Auto-generated TOC from page headings. No manual editing needed.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorState = useState(null);
            var openColorKey = openColorState[0];
            var setOpenColorKey = openColorState[1];

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function sa(obj) { setAttributes(obj); }

            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = Object.assign({}, buildCSS(a));
                if (a.maxWidth > 0) s.maxWidth = a.maxWidth + 'px';
                if (a.sticky)       s.position = 'sticky';
                if (_tvf) {
                    Object.assign(s, _tvf(a.titleTypo, '--bktoc-tt-'));
                    Object.assign(s, _tvf(a.linkTypo, '--bktoc-lt-'));
                }
                return { className: 'bkbg-toc-wrapper' + (a.sticky ? ' bkbg-toc-sticky' : ''), style: s };
            })());

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Heading Levels', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: 'H2', checked: a.includeH2, onChange: function (v) { sa({ includeH2: v }); } }),
                    el(ToggleControl, { label: 'H3', checked: a.includeH3, onChange: function (v) { sa({ includeH3: v }); } }),
                    el(ToggleControl, { label: 'H4', checked: a.includeH4, onChange: function (v) { sa({ includeH4: v }); } }),
                    el(ToggleControl, { label: 'H5', checked: a.includeH5, onChange: function (v) { sa({ includeH5: v }); } }),
                    el(ToggleControl, { label: 'H6', checked: a.includeH6, onChange: function (v) { sa({ includeH6: v }); } })
                ),

                el(PanelBody, { title: __('Behaviour', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('TOC Title', 'blockenberg'), value: a.tocTitle, onChange: function (v) { sa({ tocTitle: v }); } }),
                    el(ToggleControl, { label: __('Collapsible', 'blockenberg'), checked: a.collapsible, onChange: function (v) { sa({ collapsible: v }); } }),
                    a.collapsible && el(ToggleControl, { label: __('Collapsed by Default', 'blockenberg'), checked: a.defaultCollapsed, onChange: function (v) { sa({ defaultCollapsed: v }); } }),
                    el(ToggleControl, { label: __('Smooth Scroll', 'blockenberg'), checked: a.smoothScroll, onChange: function (v) { sa({ smoothScroll: v }); } }),
                    el(RangeControl, { label: __('Scroll Offset (px) — for fixed headers', 'blockenberg'), value: a.scrollOffset, min: 0, max: 200, onChange: function (v) { sa({ scrollOffset: v }); } }),
                    el(ToggleControl, { label: __('Sticky Position', 'blockenberg'), checked: a.sticky, onChange: function (v) { sa({ sticky: v }); } }),
                    el(ToggleControl, { label: __('Indent Nested Levels', 'blockenberg'), checked: a.indentNested, onChange: function (v) { sa({ indentNested: v }); } }),
                    el(SelectControl, {
                        label: __('List Style', 'blockenberg'), value: a.listStyle,
                        options: [{ label: __('None', 'blockenberg'), value: 'none' }, { label: __('Bullets', 'blockenberg'), value: 'disc' }, { label: __('Numbers', 'blockenberg'), value: 'decimal' }],
                        onChange: function (v) { sa({ listStyle: v }); }
                    })
                ),

                el(PanelBody, { title: __('Size & Layout', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Max Width (0 = full)', 'blockenberg'), value: a.maxWidth, min: 0, max: 900, onChange: function (v) { sa({ maxWidth: v }); } }),
                    el(RangeControl, { label: __('Max Height — scroll inside (0 = none)', 'blockenberg'), value: a.maxHeight, min: 0, max: 800, onChange: function (v) { sa({ maxHeight: v }); } }),
                    el(RangeControl, { label: __('Padding (px)', 'blockenberg'), value: a.padding, min: 0, max: 60, onChange: function (v) { sa({ padding: v }); } }),
                    el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: a.borderRadius, min: 0, max: 24, onChange: function (v) { sa({ borderRadius: v }); } })
                ),

                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl()({ label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { sa({ titleTypo: v }); } }),
                    getTypoControl()({ label: __('Link', 'blockenberg'), value: a.linkTypo, onChange: function (v) { sa({ linkTypo: v }); } })
                ),
el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    cc('bgColor',         __('Background', 'blockenberg'),          'bgColor'),
                    cc('borderColor',     __('Border / Divider', 'blockenberg'),    'borderColor'),
                    cc('titleColor',      __('Title Color', 'blockenberg'),         'titleColor'),
                    cc('linkColor',       __('Link Color', 'blockenberg'),          'linkColor'),
                    cc('linkHoverColor',  __('Link Hover Color', 'blockenberg'),    'linkHoverColor'),
                    cc('activeLinkColor', __('Active Link Color', 'blockenberg'),   'activeLinkColor')
                )
            );

            /* ── Editor preview ─────────────────────────────────────────── */
            var listTag = a.listStyle === 'decimal' ? 'ol' : 'ul';

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('nav', { className: 'bkbg-toc-nav', 'aria-label': a.tocTitle || __('Table of Contents', 'blockenberg') },
                        el('div', { className: 'bkbg-toc-header' },
                            el('span', { className: 'bkbg-toc-title' }, a.tocTitle),
                            a.collapsible && el('button', { className: 'bkbg-toc-toggle', type: 'button', 'aria-expanded': !a.defaultCollapsed, style: { pointerEvents: 'none' } }, a.defaultCollapsed ? '▸' : '▾')
                        ),
                        el('div', { className: 'bkbg-toc-body' + (a.defaultCollapsed ? ' bkbg-toc-hidden' : '') },
                            el(listTag, { className: 'bkbg-toc-list bkbg-toc-ls-' + a.listStyle, style: { maxHeight: a.maxHeight > 0 ? (a.maxHeight + 'px') : undefined, overflowY: a.maxHeight > 0 ? 'auto' : undefined } },
                                el('li', { className: 'bkbg-toc-item bkbg-toc-h2' }, el('a', { href: '#' }, __('Heading 1 (generated from page)', 'blockenberg'))),
                                a.includeH3 && el('li', { className: 'bkbg-toc-item bkbg-toc-h3' + (a.indentNested ? ' bkbg-toc-nested' : '') }, el('a', { href: '#' }, __('Sub-heading', 'blockenberg'))),
                                el('li', { className: 'bkbg-toc-item bkbg-toc-h2' }, el('a', { href: '#' }, __('Heading 2 (generated from page)', 'blockenberg')))
                            )
                        )
                    ),
                    el('p', { style: { fontSize: '11px', color: '#9ca3af', margin: '8px 0 0', fontStyle: 'italic' } }, __('Links are generated automatically from page headings on the front end.', 'blockenberg'))
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            var _tvf = getTypoCssVars();
            var wrapStyle = Object.assign({}, buildCSS(a));
            if (a.maxWidth > 0) wrapStyle.maxWidth = a.maxWidth + 'px';
            if (_tvf) {
                Object.assign(wrapStyle, _tvf(a.titleTypo, '--bktoc-tt-'));
                Object.assign(wrapStyle, _tvf(a.linkTypo, '--bktoc-lt-'));
            }

            var saveProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-toc-wrapper' + (a.sticky ? ' bkbg-toc-sticky' : ''),
                style: wrapStyle,
                'data-include'        : [a.includeH2 && 'h2', a.includeH3 && 'h3', a.includeH4 && 'h4', a.includeH5 && 'h5', a.includeH6 && 'h6'].filter(Boolean).join(','),
                'data-list-style'     : a.listStyle,
                'data-collapsible'    : a.collapsible    ? '1' : '0',
                'data-collapsed'      : a.defaultCollapsed ? '1' : '0',
                'data-smooth'         : a.smoothScroll   ? '1' : '0',
                'data-offset'         : a.scrollOffset,
                'data-indent'         : a.indentNested   ? '1' : '0',
                'data-max-height'     : a.maxHeight
            });

            return el('div', saveProps,
                el('nav', { className: 'bkbg-toc-nav', 'aria-label': a.tocTitle },
                    el('div', { className: 'bkbg-toc-header' },
                        el('span', { className: 'bkbg-toc-title' }, a.tocTitle),
                        a.collapsible && el('button', { className: 'bkbg-toc-toggle', type: 'button', 'aria-expanded': (!a.defaultCollapsed).toString() })
                    ),
                    el('div', { className: 'bkbg-toc-body' + (a.defaultCollapsed ? ' bkbg-toc-hidden' : '') })
                )
            );
        }
    });
}() );
