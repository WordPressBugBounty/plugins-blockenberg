( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var IP = function () { return window.bkbgIconPicker; };

    // ── Single stat card ──────────────────────────────────────────────────────
    function StatCard( { stat, a } ) {
        return el( 'div', { className: 'bkbg-is-card', style: {
            background: a.cardBg,
            border: '1px solid ' + a.borderColor,
            borderRadius: a.cardRadius + 'px',
            padding: a.cardPadding + 'px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 10,
            boxSizing: 'border-box',
        } },
            // Icon circle
            a.showIcon && el( 'div', { className: 'bkbg-is-icon', style: {
                width: a.iconBgSize + 'px', height: a.iconBgSize + 'px',
                borderRadius: a.iconBgRadius + 'px',
                background: ( stat.accentColor || '#6366f1' ) + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: a.iconSize + 'px', flexShrink: 0,
            } }, (stat.iconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(stat.iconType, stat.icon, stat.iconDashicon, stat.iconImageUrl, stat.iconDashiconColor) : stat.icon ),

            // Value
            el( 'div', { className: 'bkbg-is-value', style: {
                color: stat.accentColor || a.valueColor,
            } }, stat.value ),

            // Label
            el( 'div', { className: 'bkbg-is-label', style: {
                color: a.labelColor,
            } }, stat.label ),

            // Description
            stat.desc && el( 'div', { className: 'bkbg-is-desc', style: {
                color: a.descColor,
            } }, stat.desc ),
        );
    }

    // ── Full render ───────────────────────────────────────────────────────────
    function renderIconStats( a ) {
        return el( 'div', { className: 'bkbg-is-grid', style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)',
            gap: a.gap + 'px',
        } },
            ( a.stats || [] ).map( ( stat, i ) => el( StatCard, { key: i, stat, a } ) )
        );
    }

    function updStat( setAttributes, stats, si, field, val ) {
        setAttributes( { stats: stats.map( ( s, i ) => i === si ? { ...s, [field]: val } : s ) } );
    }

    // ── Block ─────────────────────────────────────────────────────────────────
    registerBlockType( 'blockenberg/icon-stats', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            var wrapStyle = {
                background: a.bgColor,
                '--bkbg-is-heading-sz': (a.valueFontSize * 0.6 + 8) + 'px',
                '--bkbg-is-subtitle-sz': a.labelFontSize + 'px',
                '--bkbg-is-value-sz': a.valueFontSize + 'px',
                '--bkbg-is-label-sz': a.labelFontSize + 'px',
                '--bkbg-is-desc-sz': a.descFontSize + 'px',
            };
            var _tv = getTypoCssVars();
            if (_tv) {
                Object.assign(wrapStyle, _tv(a.headingTypo, '--bkbg-is-hd-'));
                Object.assign(wrapStyle, _tv(a.subtitleTypo, '--bkbg-is-st-'));
                Object.assign(wrapStyle, _tv(a.valueTypo, '--bkbg-is-vl-'));
                Object.assign(wrapStyle, _tv(a.labelTypo, '--bkbg-is-lb-'));
                Object.assign(wrapStyle, _tv(a.descTypo, '--bkbg-is-ds-'));
            }
            const blockProps = useBlockProps( { className: 'bkbg-is-wrap', style: wrapStyle } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Settings', 'blockenberg' ), initialOpen: true },
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),    checked: a.showTitle,    onChange: v => setAttributes( { showTitle:    v } ) } ),
                        a.showTitle    && el( TextControl, { label: __( 'Title', 'blockenberg' ),    value: a.title,    onChange: v => setAttributes( { title:    v } ) } ),
                        el( ToggleControl, { label: __( 'Show Subtitle', 'blockenberg' ), checked: a.showSubtitle,  onChange: v => setAttributes( { showSubtitle:  v } ) } ),
                        a.showSubtitle && el( TextControl, { label: __( 'Subtitle', 'blockenberg' ), value: a.subtitle, onChange: v => setAttributes( { subtitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Icons', 'blockenberg' ),    checked: a.showIcon,     onChange: v => setAttributes( { showIcon:     v } ) } ),
                        el( RangeControl, { label: __( 'Columns', 'blockenberg' ), value: a.columns, onChange: v => setAttributes( { columns: v } ), min: 1, max: 6 } ),
                    ),

                    el( PanelBody, { title: __( 'Style', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Icon Size', 'blockenberg' ),       value: a.iconSize,      onChange: v => setAttributes( { iconSize:      v } ), min: 16, max: 64 } ),
                        el( RangeControl, { label: __( 'Icon Circle Size', 'blockenberg' ),value: a.iconBgSize,    onChange: v => setAttributes( { iconBgSize:    v } ), min: 32, max: 120 } ),
                        el( RangeControl, { label: __( 'Icon Circle Radius', 'blockenberg' ),value: a.iconBgRadius,onChange: v => setAttributes( { iconBgRadius:  v } ), min: 0, max: 99 } ),
                        el( RangeControl, { label: __( 'Card Padding', 'blockenberg' ),    value: a.cardPadding,   onChange: v => setAttributes( { cardPadding:   v } ), min: 12, max: 56 } ),
                        el( RangeControl, { label: __( 'Card Radius', 'blockenberg' ),     value: a.cardRadius,    onChange: v => setAttributes( { cardRadius:    v } ), min: 0, max: 32 } ),
                        el( RangeControl, { label: __( 'Gap', 'blockenberg' ),             value: a.gap,           onChange: v => setAttributes( { gap:           v } ), min: 8, max: 40 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypographyControl() && el(getTypographyControl(), { label: __('Heading', 'blockenberg'), typo: a.headingTypo || {}, onChange: v => setAttributes({ headingTypo: v }) }),
                        getTypographyControl() && el(getTypographyControl(), { label: __('Subtitle', 'blockenberg'), typo: a.subtitleTypo || {}, onChange: v => setAttributes({ subtitleTypo: v }) }),
                        getTypographyControl() && el(getTypographyControl(), { label: __('Value', 'blockenberg'), typo: a.valueTypo || {}, onChange: v => setAttributes({ valueTypo: v }) }),
                        getTypographyControl() && el(getTypographyControl(), { label: __('Label', 'blockenberg'), typo: a.labelTypo || {}, onChange: v => setAttributes({ labelTypo: v }) }),
                        getTypographyControl() && el(getTypographyControl(), { label: __('Description', 'blockenberg'), typo: a.descTypo || {}, onChange: v => setAttributes({ descTypo: v }) })
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ),    value: a.bgColor,      onChange: v => setAttributes( { bgColor:      v || '#ffffff' } ) },
                            { label: __( 'Card Background', 'blockenberg' ),value: a.cardBg,      onChange: v => setAttributes( { cardBg:       v || '#f9fafb' } ) },
                            { label: __( 'Border', 'blockenberg' ),         value: a.borderColor, onChange: v => setAttributes( { borderColor:  v || '#e5e7eb' } ) },
                            { label: __( 'Heading', 'blockenberg' ),        value: a.headingColor,onChange: v => setAttributes( { headingColor: v || '#111827' } ) },
                            { label: __( 'Subtitle', 'blockenberg' ),       value: a.subtitleColor,onChange: v => setAttributes( { subtitleColor:v || '#6b7280' } ) },
                            { label: __( 'Value (default)', 'blockenberg' ),value: a.valueColor,  onChange: v => setAttributes( { valueColor:   v || '#111827' } ) },
                            { label: __( 'Label', 'blockenberg' ),          value: a.labelColor,  onChange: v => setAttributes( { labelColor:   v || '#374151' } ) },
                            { label: __( 'Description', 'blockenberg' ),    value: a.descColor,   onChange: v => setAttributes( { descColor:    v || '#6b7280' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Stats', 'blockenberg' ), initialOpen: false },
                        el( Button, {
                            variant: 'secondary', style: { marginBottom: 10 },
                            onClick: () => setAttributes( { stats: [ ...( a.stats || [] ), { icon: '📊', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', value: '99%', label: 'New Stat', desc: 'Description', accentColor: '#6366f1' } ] } ),
                        }, __( '+ Add Stat', 'blockenberg' ) ),
                        a.stats.map( ( stat, si ) =>
                            el( PanelBody, { key: si, title: ( stat.icon ? stat.icon + ' ' : '' ) + stat.label, initialOpen: false },
                                el( IP().IconPickerControl, { iconType: stat.iconType || 'custom-char', customChar: stat.icon, dashicon: stat.iconDashicon || '', imageUrl: stat.iconImageUrl || '',
                                    onChangeType: function (v) { updStat( setAttributes, a.stats, si, 'iconType', v ); }, onChangeChar: function (v) { updStat( setAttributes, a.stats, si, 'icon', v ); },
                                    onChangeDashicon: function (v) { updStat( setAttributes, a.stats, si, 'iconDashicon', v ); }, onChangeImageUrl: function (v) { updStat( setAttributes, a.stats, si, 'iconImageUrl', v ); } }),
                                el( TextControl, { label: __( 'Value', 'blockenberg' ),        value: stat.value, onChange: v => updStat( setAttributes, a.stats, si, 'value', v ) } ),
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),        value: stat.label, onChange: v => updStat( setAttributes, a.stats, si, 'label', v ) } ),
                                el( TextControl, { label: __( 'Description', 'blockenberg' ),  value: stat.desc,  onChange: v => updStat( setAttributes, a.stats, si, 'desc',  v ) } ),
                                el( 'div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
                                    el( 'label', { style: { fontSize: 11 } }, __( 'Accent Color', 'blockenberg' ) ),
                                    el( 'input', { type: 'color', value: stat.accentColor || '#6366f1', style: { width: 40, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }, onChange: e => updStat( setAttributes, a.stats, si, 'accentColor', e.target.value ) } ),
                                ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { stats: a.stats.filter( ( _, x ) => x !== si ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                // Header
                ( a.showTitle && a.title ) && el( 'h3', { className: 'bkbg-is-title', style: { color: a.headingColor, margin: '0 0 6px' } }, a.title ),
                ( a.showSubtitle && a.subtitle ) && el( 'p', { className: 'bkbg-is-subtitle', style: { color: a.subtitleColor, margin: '0 0 20px' } }, a.subtitle ),
                renderIconStats( a ),
            );
        },

        save: function ( { attributes: a } ) {
            var saveStyle = {
                background: a.bgColor,
                '--bkbg-is-heading-sz': (a.valueFontSize * 0.6 + 8) + 'px',
                '--bkbg-is-subtitle-sz': a.labelFontSize + 'px',
                '--bkbg-is-value-sz': a.valueFontSize + 'px',
                '--bkbg-is-label-sz': a.labelFontSize + 'px',
                '--bkbg-is-desc-sz': a.descFontSize + 'px',
            };
            var _tv2 = getTypoCssVars();
            if (_tv2) {
                Object.assign(saveStyle, _tv2(a.headingTypo, '--bkbg-is-hd-'));
                Object.assign(saveStyle, _tv2(a.subtitleTypo, '--bkbg-is-st-'));
                Object.assign(saveStyle, _tv2(a.valueTypo, '--bkbg-is-vl-'));
                Object.assign(saveStyle, _tv2(a.labelTypo, '--bkbg-is-lb-'));
                Object.assign(saveStyle, _tv2(a.descTypo, '--bkbg-is-ds-'));
            }
            const blockProps = useBlockProps.save( { className: 'bkbg-is-wrap', style: saveStyle } );
            return el( 'div', blockProps,
                ( a.showTitle    && a.title )    ? el( 'h3', { className: 'bkbg-is-title',    style: { color: a.headingColor,  margin: '0 0 6px' } }, a.title )    : null,
                ( a.showSubtitle && a.subtitle ) ? el( 'p',  { className: 'bkbg-is-subtitle', style: { color: a.subtitleColor, margin: '0 0 20px' } }, a.subtitle ) : null,
                renderIconStats( a ),
            );
        },
    } );
}() );
