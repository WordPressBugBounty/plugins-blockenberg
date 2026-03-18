( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    function _tv(typo, prefix) {
        if (!typo) return {};
        var s = {};
        if (typo.family)     s[prefix + 'font-family'] = "'" + typo.family + "', sans-serif";
        if (typo.weight)     s[prefix + 'font-weight'] = typo.weight;
        if (typo.transform)  s[prefix + 'text-transform'] = typo.transform;
        if (typo.style)      s[prefix + 'font-style'] = typo.style;
        if (typo.decoration) s[prefix + 'text-decoration'] = typo.decoration;
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) s[prefix + 'font-size-d'] = typo.sizeDesktop + su;
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) s[prefix + 'font-size-t'] = typo.sizeTablet + su;
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) s[prefix + 'font-size-m'] = typo.sizeMobile + su;
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) s[prefix + 'line-height-d'] = typo.lineHeightDesktop + lhu;
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) s[prefix + 'line-height-t'] = typo.lineHeightTablet + lhu;
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) s[prefix + 'line-height-m'] = typo.lineHeightMobile + lhu;
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) s[prefix + 'letter-spacing-d'] = typo.letterSpacingDesktop + lsu;
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) s[prefix + 'letter-spacing-t'] = typo.letterSpacingTablet + lsu;
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) s[prefix + 'letter-spacing-m'] = typo.letterSpacingMobile + lsu;
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) s[prefix + 'word-spacing-d'] = typo.wordSpacingDesktop + wsu;
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) s[prefix + 'word-spacing-t'] = typo.wordSpacingTablet + wsu;
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) s[prefix + 'word-spacing-m'] = typo.wordSpacingMobile + wsu;
        return s;
    }

    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;

    var separatorSVGs = {
        chevron: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>',
        arrow:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>',
        slash:   null,
        dot:     null,
        dash:    null,
        custom:  null
    };

    var homeIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>';

    function getSepChar(sep, custom) {
        if (sep === 'chevron') return '❯';
        if (sep === 'arrow')   return '›';
        if (sep === 'slash')   return '/';
        if (sep === 'dot')     return '·';
        if (sep === 'dash')    return '–';
        return custom || '/';
    }

    registerBlockType('blockenberg/breadcrumbs', {
        title: __('Breadcrumbs', 'blockenberg'),
        description: __('SEO-friendly navigation trail with Schema.org markup.', 'blockenberg'),
        category: 'bkbg-layout',
        icon: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', stroke: 'currentColor', strokeWidth: 2, fill: 'none' }),
            el('polyline', { points: '9 22 9 12 15 12 15 22', stroke: 'currentColor', strokeWidth: 2, fill: 'none' })
        ),
        attributes: {
            homeLabel:       { type: 'string',  default: 'Home' },
            homeUrl:         { type: 'string',  default: '/' },
            showHome:        { type: 'boolean', default: true },
            showCurrentPage: { type: 'boolean', default: true },
            separator:       { type: 'string',  default: 'chevron' },
            customSeparator: { type: 'string',  default: '/' },
            schemaEnabled:   { type: 'boolean', default: true },
            alignment:       { type: 'string',  default: 'left' },
            fontSize:        { type: 'number',  default: 14 },
            itemSpacing:     { type: 'number',  default: 8 },
            paddingV:        { type: 'number',  default: 10 },
            textColor:       { type: 'string',  default: '#6b7280' },
            linkColor:       { type: 'string',  default: '#2563eb' },
            linkHoverColor:  { type: 'string',  default: '#1d4ed8' },
            separatorColor:  { type: 'string',  default: '#9ca3af' },
            activeColor:     { type: 'string',  default: '#111827' },
            bgColor:         { type: 'string',  default: '' },
            fontWeight:      { type: 'number',  default: 400 },
            showHomeIcon:    { type: 'boolean', default: true },
            typoText:        { type: 'object',  default: {} }
        },

        edit: function (props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;

            var blockProps = useBlockProps({
                className: 'bkbg-bc-wrap bkbg-bc-align--' + a.alignment,
                style: Object.assign({
                    '--bkbg-bc-gap':    a.itemSpacing + 'px',
                    '--bkbg-bc-padv':   a.paddingV + 'px',
                    '--bkbg-bc-text':   a.textColor,
                    '--bkbg-bc-link':   a.linkColor,
                    '--bkbg-bc-hover':  a.linkHoverColor,
                    '--bkbg-bc-sep':    a.separatorColor,
                    '--bkbg-bc-active': a.activeColor,
                    background:         a.bgColor || undefined
                }, _tv(a.typoText, '--bkbg-bc-typo-'))
            });

            var inspector = el(InspectorControls, null,

                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show Home link', 'blockenberg'),
                        checked: a.showHome,
                        onChange: function(v){ setAttr({ showHome: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    a.showHome && el(Fragment, null,
                        el(TextControl, {
                            label: __('Home label', 'blockenberg'),
                            value: a.homeLabel,
                            onChange: function(v){ setAttr({ homeLabel: v }); }
                        }),
                        el(TextControl, {
                            label: __('Home URL', 'blockenberg'),
                            value: a.homeUrl,
                            onChange: function(v){ setAttr({ homeUrl: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show home icon', 'blockenberg'),
                            checked: a.showHomeIcon,
                            onChange: function(v){ setAttr({ showHomeIcon: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el(ToggleControl, {
                        label: __('Show current page', 'blockenberg'),
                        checked: a.showCurrentPage,
                        onChange: function(v){ setAttr({ showCurrentPage: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Schema.org markup (BreadcrumbList)', 'blockenberg'),
                        checked: a.schemaEnabled,
                        onChange: function(v){ setAttr({ schemaEnabled: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),

                el(PanelBody, { title: __('Separator', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Separator style', 'blockenberg'),
                        value: a.separator,
                        options: [
                            { label: 'Chevron ›',   value: 'chevron' },
                            { label: 'Arrow →',     value: 'arrow' },
                            { label: 'Slash /',     value: 'slash' },
                            { label: 'Dot ·',       value: 'dot' },
                            { label: 'Dash –',      value: 'dash' },
                            { label: 'Custom',      value: 'custom' }
                        ],
                        onChange: function(v){ setAttr({ separator: v }); }
                    }),
                    a.separator === 'custom' && el(TextControl, {
                        label: __('Custom separator character', 'blockenberg'),
                        value: a.customSeparator,
                        onChange: function(v){ setAttr({ customSeparator: v }); }
                    })
                ),

                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Alignment', 'blockenberg'),
                        value: a.alignment,
                        options: [
                            { label: 'Left',   value: 'left' },
                            { label: 'Center', value: 'center' },
                            { label: 'Right',  value: 'right' }
                        ],
                        onChange: function(v){ setAttr({ alignment: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Item spacing (px)', 'blockenberg'),
                        value: a.itemSpacing, min: 2, max: 32,
                        onChange: function(v){ setAttr({ itemSpacing: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Vertical padding (px)', 'blockenberg'),
                        value: a.paddingV, min: 0, max: 40,
                        onChange: function(v){ setAttr({ paddingV: v }); }
                    })
                ),

                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: __('Breadcrumb Text', 'blockenberg'), value: a.typoText, onChange: function (v) { setAttr({ typoText: v }); } })
                ),
el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background',      'blockenberg'), value: a.bgColor,      onChange: function(v){ setAttr({ bgColor: v||'' }); } },
                            { label: __('Link color',      'blockenberg'), value: a.linkColor,    onChange: function(v){ setAttr({ linkColor: v||'#2563eb' }); } },
                            { label: __('Link hover',      'blockenberg'), value: a.linkHoverColor,onChange: function(v){ setAttr({ linkHoverColor: v||'#1d4ed8' }); } },
                            { label: __('Current page',   'blockenberg'), value: a.activeColor,  onChange: function(v){ setAttr({ activeColor: v||'#111827' }); } },
                            { label: __('Separator',       'blockenberg'), value: a.separatorColor,onChange: function(v){ setAttr({ separatorColor: v||'#9ca3af' }); } },
                            { label: __('Text (general)',  'blockenberg'), value: a.textColor,    onChange: function(v){ setAttr({ textColor: v||'#6b7280' }); } }
                        ]
                    })
                )
            );

            /* ── Preview breadcrumbs ── */
            var sepChar = getSepChar(a.separator, a.customSeparator);
            var crumbs = [];
            if (a.showHome) {
                crumbs.push({ label: a.homeLabel, isHome: true, url: a.homeUrl });
            }
            crumbs.push({ label: 'Category',   url: '#' });
            crumbs.push({ label: 'Current Page', url: '', isCurrent: true });

            var crumbEls = crumbs.map(function(c, i) {
                var isLast = i === crumbs.length - 1;
                return el(Fragment, { key: i },
                    el('span', {
                        className: 'bkbg-bc-item' + (c.isCurrent ? ' bkbg-bc-item--current' : '')
                    },
                        c.isHome && a.showHomeIcon
                            ? el('span', { className: 'bkbg-bc-home-icon', dangerouslySetInnerHTML: { __html: homeIconSVG } })
                            : null,
                        c.url && !c.isCurrent
                            ? el('a', { href: '#', className: 'bkbg-bc-link' }, c.isHome && a.showHomeIcon ? '' : c.label)
                            : (!c.isHome || !a.showHomeIcon) && el('span', { className: 'bkbg-bc-text' }, c.label)
                    ),
                    !isLast && el('span', { className: 'bkbg-bc-sep', 'aria-hidden': 'true' }, sepChar)
                );
            });

            return el(Fragment, null,
                inspector,
                el('nav', Object.assign({}, blockProps, { 'aria-label': 'Breadcrumb' }),
                    el('ol', { className: 'bkbg-bc-list' }, ...crumbEls)
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-bc-wrap bkbg-bc-align--' + a.alignment,
                'aria-label': 'Breadcrumb',
                'data-home-label':   a.homeLabel,
                'data-home-url':     a.homeUrl,
                'data-show-home':    a.showHome   ? '1' : '0',
                'data-show-current': a.showCurrentPage ? '1' : '0',
                'data-separator':    a.separator,
                'data-sep-custom':   a.customSeparator,
                'data-schema':       a.schemaEnabled ? '1' : '0',
                'data-show-icon':    a.showHomeIcon ? '1' : '0',
                style: Object.assign({
                    '--bkbg-bc-gap':    a.itemSpacing + 'px',
                    '--bkbg-bc-padv':   a.paddingV + 'px',
                    '--bkbg-bc-text':   a.textColor,
                    '--bkbg-bc-link':   a.linkColor,
                    '--bkbg-bc-hover':  a.linkHoverColor,
                    '--bkbg-bc-sep':    a.separatorColor,
                    '--bkbg-bc-active': a.activeColor,
                    background:         a.bgColor || undefined
                }, _tv(a.typoText, '--bkbg-bc-typo-'))
            });

            return el('nav', blockProps,
                el('ol', { className: 'bkbg-bc-list', 'aria-label': 'breadcrumb' })
            );
        }
    });
}() );
