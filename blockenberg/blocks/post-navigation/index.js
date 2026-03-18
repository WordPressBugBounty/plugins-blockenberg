( function () {
    const el = window.wp.element.createElement;
    const Fragment = window.wp.element.Fragment;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, SelectControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;
    let _tc; const getTypoControl = () => _tc || (_tc = window.bkbgTypographyControl);
    let _tv; const getTypoCssVars = () => _tv || (_tv = window.bkbgTypoCssVars);

    const STYLES = [
        { label: 'Cards',   value: 'cards' },
        { label: 'Minimal', value: 'minimal' },
        { label: 'Arrows',  value: 'arrows' },
        { label: 'Pills',   value: 'pills' },
        { label: 'Split',   value: 'split' },
    ];

    function wrapStyle(a) {
        const _tvFn = getTypoCssVars();
        const s = {
            '--bkbg-pn-bg':         a.bgColor,
            '--bkbg-pn-card-bg':    a.cardBg,
            '--bkbg-pn-text':       a.textColor,
            '--bkbg-pn-label':      a.labelColor,
            '--bkbg-pn-accent':     a.accentColor,
            '--bkbg-pn-border':     a.borderColor,
            '--bkbg-pn-hover-bg':   a.hoverBg,
            '--bkbg-pn-max-w':      a.maxWidth + 'px',
            '--bkbg-pn-pt':         a.paddingTop + 'px',
            '--bkbg-pn-pb':         a.paddingBottom + 'px',
            '--bkbg-pn-radius':     a.borderRadius + 'px',
            '--bkbg-pn-gap':        a.gap + 'px',
            '--bkbg-pn-arrow-sz':   a.arrowSize + 'px',
        };
        Object.assign(s, _tvFn(a.labelTypo, '--bkbg-pn-lb-'));
        Object.assign(s, _tvFn(a.titleTypo, '--bkbg-pn-tt-'));
        return s;
    }

    function NavCard({ side, label, title, url, showLabel, showArrow, a }) {
        const isPrev = side === 'prev';
        return el('div', { className: 'bkbg-pn-card bkbg-pn-card--' + side },
            isPrev && showArrow && el('span', { className: 'bkbg-pn-arrow bkbg-pn-arrow--prev dashicons dashicons-arrow-left-alt2' }),
            el('div', { className: 'bkbg-pn-body' },
                showLabel && el('span', { className: 'bkbg-pn-label' }, label),
                el('span', { className: 'bkbg-pn-title' }, title),
            ),
            !isPrev && showArrow && el('span', { className: 'bkbg-pn-arrow bkbg-pn-arrow--next dashicons dashicons-arrow-right-alt2' }),
        );
    }

    registerBlockType('blockenberg/post-navigation', {
        deprecated: [{
            attributes: {
                prevLabel:     { type: 'string',  default: 'Previous Article' },
                prevTitle:     { type: 'string',  default: 'How to Build a Design System from Scratch' },
                prevUrl:       { type: 'string',  default: '#' },
                nextLabel:     { type: 'string',  default: 'Next Article' },
                nextTitle:     { type: 'string',  default: '10 Principles Every Product Designer Should Know' },
                nextUrl:       { type: 'string',  default: '#' },
                showLabels:    { type: 'boolean', default: true },
                showArrows:    { type: 'boolean', default: true },
                showDivider:   { type: 'boolean', default: true },
                style:         { type: 'string',  default: 'cards' },
                maxWidth:      { type: 'integer', default: 860 },
                paddingTop:    { type: 'integer', default: 48 },
                paddingBottom: { type: 'integer', default: 48 },
                borderRadius:  { type: 'integer', default: 14 },
                gap:           { type: 'integer', default: 16 },
                labelSize:     { type: 'integer', default: 11 },
                titleSize:     { type: 'integer', default: 17 },
                arrowSize:     { type: 'integer', default: 22 },
                bgColor:       { type: 'string',  default: '#ffffff' },
                cardBg:        { type: 'string',  default: '#f8fafc' },
                textColor:     { type: 'string',  default: '#0f172a' },
                labelColor:    { type: 'string',  default: '#94a3b8' },
                accentColor:   { type: 'string',  default: '#6c3fb5' },
                borderColor:   { type: 'string',  default: '#e2e8f0' },
                hoverBg:       { type: 'string',  default: '#f1f5f9' },
                titleFontWeight:{ type: 'string', default: '700' },
                labelFontWeight:{ type: 'string', default: '600' }
            },
            save: function ({ attributes: a }) {
                const oldStyle = {
                    '--bkbg-pn-bg':         a.bgColor,
                    '--bkbg-pn-card-bg':    a.cardBg,
                    '--bkbg-pn-text':       a.textColor,
                    '--bkbg-pn-label':      a.labelColor,
                    '--bkbg-pn-accent':     a.accentColor,
                    '--bkbg-pn-border':     a.borderColor,
                    '--bkbg-pn-hover-bg':   a.hoverBg,
                    '--bkbg-pn-max-w':      a.maxWidth + 'px',
                    '--bkbg-pn-pt':         a.paddingTop + 'px',
                    '--bkbg-pn-pb':         a.paddingBottom + 'px',
                    '--bkbg-pn-radius':     a.borderRadius + 'px',
                    '--bkbg-pn-gap':        a.gap + 'px',
                    '--bkbg-pn-label-sz':   a.labelSize + 'px',
                    '--bkbg-pn-title-sz':   a.titleSize + 'px',
                    '--bkbg-pn-arrow-sz':   a.arrowSize + 'px',
                };
                return el('div', {
                    className: 'bkbg-pn-wrap bkbg-pn-style--' + a.style,
                    style: oldStyle,
                },
                    el('div', { className: 'bkbg-pn-inner' },
                        el('a', { href: a.prevUrl, className: 'bkbg-pn-card bkbg-pn-card--prev', rel: 'prev' },
                            a.showArrows && el('span', { className: 'bkbg-pn-arrow dashicons dashicons-arrow-left-alt2', 'aria-hidden': 'true' }),
                            el('div', { className: 'bkbg-pn-body' },
                                a.showLabels && el('span', { className: 'bkbg-pn-label' }, a.prevLabel),
                                el('span', { className: 'bkbg-pn-title' }, a.prevTitle),
                            ),
                        ),
                        a.showDivider && el('div', { className: 'bkbg-pn-divider', 'aria-hidden': 'true' }),
                        el('a', { href: a.nextUrl, className: 'bkbg-pn-card bkbg-pn-card--next', rel: 'next' },
                            el('div', { className: 'bkbg-pn-body bkbg-pn-body--next' },
                                a.showLabels && el('span', { className: 'bkbg-pn-label' }, a.nextLabel),
                                el('span', { className: 'bkbg-pn-title' }, a.nextTitle),
                            ),
                            a.showArrows && el('span', { className: 'bkbg-pn-arrow dashicons dashicons-arrow-right-alt2', 'aria-hidden': 'true' }),
                        ),
                    ),
                );
            }
        }],
        edit: function (props) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps({ className: 'bkbg-pn-wrap bkbg-pn-style--' + a.style, style: wrapStyle(a) });

            return el('div', blockProps,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Previous Article'), initialOpen: true },
                        el(TextControl, { label: __('Label'), value: a.prevLabel, onChange: v => setAttributes({ prevLabel: v }) }),
                        el(TextControl, { label: __('Post Title'), value: a.prevTitle, onChange: v => setAttributes({ prevTitle: v }) }),
                        el(TextControl, { label: __('URL'), value: a.prevUrl, onChange: v => setAttributes({ prevUrl: v }) }),
                    ),

                    el(PanelBody, { title: __('Next Article'), initialOpen: true },
                        el(TextControl, { label: __('Label'), value: a.nextLabel, onChange: v => setAttributes({ nextLabel: v }) }),
                        el(TextControl, { label: __('Post Title'), value: a.nextTitle, onChange: v => setAttributes({ nextTitle: v }) }),
                        el(TextControl, { label: __('URL'), value: a.nextUrl, onChange: v => setAttributes({ nextUrl: v }) }),
                    ),

                    el(PanelBody, { title: __('Style & Display'), initialOpen: false },
                        el(SelectControl, { label: __('Style'), value: a.style, options: STYLES, onChange: v => setAttributes({ style: v }) }),
                        el(ToggleControl, { label: __('Show Direction Labels'), checked: a.showLabels, onChange: v => setAttributes({ showLabels: v }), __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Arrows'), checked: a.showArrows, onChange: v => setAttributes({ showArrows: v }), __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Center Divider'), checked: a.showDivider, onChange: v => setAttributes({ showDivider: v }), __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Max Width (px)'), value: a.maxWidth, min: 480, max: 1400, onChange: v => setAttributes({ maxWidth: v }) }),
                        el(RangeControl, { label: __('Border Radius (px)'), value: a.borderRadius, min: 0, max: 32, onChange: v => setAttributes({ borderRadius: v }) }),
                        el(RangeControl, { label: __('Gap (px)'), value: a.gap, min: 0, max: 64, onChange: v => setAttributes({ gap: v }) }),
                        el(RangeControl, { label: __('Padding Top (px)'), value: a.paddingTop, min: 0, max: 160, onChange: v => setAttributes({ paddingTop: v }) }),
                        el(RangeControl, { label: __('Padding Bottom (px)'), value: a.paddingBottom, min: 0, max: 160, onChange: v => setAttributes({ paddingBottom: v }) }),
                    ),

                    el(PanelBody, { title: __('Typography'), initialOpen: false },
                        (() => {
                            const TC = getTypoControl();
                            if (!TC) return el('p', null, 'Loading…');
                            return el(Fragment, null,
                                el(TC, { label: 'Label Typography', value: a.labelTypo, onChange: v => setAttributes({ labelTypo: v }) }),
                                el(TC, { label: 'Title Typography', value: a.titleTypo, onChange: v => setAttributes({ titleTypo: v }) })
                            );
                        })(),
                        el(RangeControl, { label: __('Arrow Size (px)'), value: a.arrowSize, min: 14, max: 40, onChange: v => setAttributes({ arrowSize: v }) }),
                    ),

                    el(PanelColorSettings, {
                        title: __('Colors'), initialOpen: false,
                        colorSettings: [
                            { label: __('Background'),    value: a.bgColor,      onChange: v => setAttributes({ bgColor:      v || '#ffffff' }) },
                            { label: __('Card BG'),       value: a.cardBg,       onChange: v => setAttributes({ cardBg:       v || '#f8fafc' }) },
                            { label: __('Text'),          value: a.textColor,    onChange: v => setAttributes({ textColor:    v || '#0f172a' }) },
                            { label: __('Label'),         value: a.labelColor,   onChange: v => setAttributes({ labelColor:   v || '#94a3b8' }) },
                            { label: __('Accent'),        value: a.accentColor,  onChange: v => setAttributes({ accentColor:  v || '#6c3fb5' }) },
                            { label: __('Border'),        value: a.borderColor,  onChange: v => setAttributes({ borderColor:  v || '#e2e8f0' }) },
                            { label: __('Hover BG'),      value: a.hoverBg,      onChange: v => setAttributes({ hoverBg:      v || '#f1f5f9' }) },
                        ]
                    }),
                ),

                el('div', { className: 'bkbg-pn-inner' },
                    el('a', { href: a.prevUrl, className: 'bkbg-pn-card bkbg-pn-card--prev', onClick: e => e.preventDefault() },
                        a.showArrows && el('span', { className: 'bkbg-pn-arrow dashicons dashicons-arrow-left-alt2' }),
                        el('div', { className: 'bkbg-pn-body' },
                            a.showLabels && el('span', { className: 'bkbg-pn-label' }, a.prevLabel),
                            el('span', { className: 'bkbg-pn-title' }, a.prevTitle),
                        ),
                    ),
                    a.showDivider && el('div', { className: 'bkbg-pn-divider' }),
                    el('a', { href: a.nextUrl, className: 'bkbg-pn-card bkbg-pn-card--next', onClick: e => e.preventDefault() },
                        el('div', { className: 'bkbg-pn-body bkbg-pn-body--next' },
                            a.showLabels && el('span', { className: 'bkbg-pn-label' }, a.nextLabel),
                            el('span', { className: 'bkbg-pn-title' }, a.nextTitle),
                        ),
                        a.showArrows && el('span', { className: 'bkbg-pn-arrow dashicons dashicons-arrow-right-alt2' }),
                    ),
                ),
            );
        },

        save: function ({ attributes: a }) {
            return el('div', {
                className: 'bkbg-pn-wrap bkbg-pn-style--' + a.style,
                style: wrapStyle(a),
            },
                el('div', { className: 'bkbg-pn-inner' },
                    el('a', { href: a.prevUrl, className: 'bkbg-pn-card bkbg-pn-card--prev', rel: 'prev' },
                        a.showArrows && el('span', { className: 'bkbg-pn-arrow dashicons dashicons-arrow-left-alt2', 'aria-hidden': 'true' }),
                        el('div', { className: 'bkbg-pn-body' },
                            a.showLabels && el('span', { className: 'bkbg-pn-label' }, a.prevLabel),
                            el('span', { className: 'bkbg-pn-title' }, a.prevTitle),
                        ),
                    ),
                    a.showDivider && el('div', { className: 'bkbg-pn-divider', 'aria-hidden': 'true' }),
                    el('a', { href: a.nextUrl, className: 'bkbg-pn-card bkbg-pn-card--next', rel: 'next' },
                        el('div', { className: 'bkbg-pn-body bkbg-pn-body--next' },
                            a.showLabels && el('span', { className: 'bkbg-pn-label' }, a.nextLabel),
                            el('span', { className: 'bkbg-pn-title' }, a.nextTitle),
                        ),
                        a.showArrows && el('span', { className: 'bkbg-pn-arrow dashicons dashicons-arrow-right-alt2', 'aria-hidden': 'true' }),
                    ),
                ),
            );
        }
    });
}() );
