( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, SelectControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    // ── Pill renderer ─────────────────────────────────────────────────────────
    function TagPill( { tag, showIcon, iconSize, pillRadius, pillPaddingX, pillPaddingY, forSave } ) {
        var iconContent = null;
        if (showIcon) {
            var _iType = tag.iconType || 'custom-char';
            if (_iType !== 'custom-char' && IP()) {
                iconContent = forSave
                    ? IP().buildSaveIcon(_iType, tag.icon, tag.iconDashicon, tag.iconImageUrl, tag.iconDashiconColor)
                    : IP().buildEditorIcon(_iType, tag.icon, tag.iconDashicon, tag.iconImageUrl, tag.iconDashiconColor);
            } else if (tag.icon) {
                iconContent = tag.icon;
            }
        }
        const inner = [
            iconContent && el( 'span', { className: 'bkbg-tl-icon', style: { fontSize: iconSize + 'px', lineHeight: 1, flexShrink: 0 } }, iconContent ),
            el( 'span', null, tag.label ),
        ];
        const pillStyle = {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: tag.color || '#6366f1',
            color: tag.textColor || '#ffffff',
            borderRadius: pillRadius + 'px',
            padding: pillPaddingY + 'px ' + pillPaddingX + 'px',
            cursor: tag.url ? 'pointer' : 'default',
            transition: 'transform 0.15s, box-shadow 0.15s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        };
        if ( tag.url ) {
            return el( 'a', { href: tag.url, style: pillStyle, className: 'bkbg-tl-pill bkbg-tl-pill--link' }, ...inner );
        }
        return el( 'span', { style: pillStyle, className: 'bkbg-tl-pill' }, ...inner );
    }

    // ── Full render ───────────────────────────────────────────────────────────
    function renderTagList( a, forSave ) {
        return el( 'div', { className: 'bkbg-tl-pills', style: { display: 'flex', flexWrap: 'wrap', gap: a.gap + 'px' } },
            ( a.tags || [] ).map( ( tag, i ) =>
                el( TagPill, { key: i, tag, showIcon: a.showIcon, iconSize: a.iconSize, pillRadius: a.pillRadius, pillPaddingX: a.pillPaddingX, pillPaddingY: a.pillPaddingY, forSave: !!forSave } )
            )
        );
    }

    function updTag( setAttributes, tags, ti, field, val ) {
        setAttributes( { tags: tags.map( ( t, i ) => i === ti ? { ...t, [field]: val } : t ) } );
    }

    // ── Block ─────────────────────────────────────────────────────────────────
    registerBlockType( 'blockenberg/tag-list', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( (function () {
                var _tvf = getTypoCssVars();
                var s = { background: a.bgColor };
                if (_tvf) {
                    Object.assign(s, _tvf(a.titleTypo, '--bktl-tt-'));
                    Object.assign(s, _tvf(a.pillTypo, '--bktl-pl-'));
                }
                return { className: 'bkbg-tl-wrap', style: s };
            })() );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Settings', 'blockenberg' ), initialOpen: true },
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),    checked: a.showTitle,   onChange: v => setAttributes( { showTitle:   v } ) } ),
                        a.showTitle && el( TextControl, { label: __( 'Title', 'blockenberg' ),     value: a.title,     onChange: v => setAttributes( { title:     v } ) } ),
                        el( ToggleControl, { label: __( 'Show Subtitle', 'blockenberg' ), checked: a.showSubtitle, onChange: v => setAttributes( { showSubtitle:v } ) } ),
                        a.showSubtitle && el( TextControl, { label: __( 'Subtitle', 'blockenberg' ),  value: a.subtitle,  onChange: v => setAttributes( { subtitle:  v } ) } ),
                        el( ToggleControl, { label: __( 'Show Icons', 'blockenberg' ),    checked: a.showIcon,    onChange: v => setAttributes( { showIcon:    v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Style', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Pill Radius', 'blockenberg' ),           value: a.pillRadius,   onChange: v => setAttributes( { pillRadius:   v } ), min: 0, max: 99 } ),
                        el( RangeControl, { label: __( 'Horizontal Padding', 'blockenberg' ),    value: a.pillPaddingX, onChange: v => setAttributes( { pillPaddingX: v } ), min: 6, max: 40 } ),
                        el( RangeControl, { label: __( 'Vertical Padding', 'blockenberg' ),      value: a.pillPaddingY, onChange: v => setAttributes( { pillPaddingY: v } ), min: 2, max: 24 } ),
                        el( RangeControl, { label: __( 'Icon Size', 'blockenberg' ),             value: a.iconSize,     onChange: v => setAttributes( { iconSize:     v } ), min: 10, max: 28 } ),
                        el( RangeControl, { label: __( 'Gap Between Pills', 'blockenberg' ),     value: a.gap,          onChange: v => setAttributes( { gap:          v } ), min: 4, max: 28 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl()({ label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: v => setAttributes({ titleTypo: v }) }),
                        getTypoControl()({ label: __('Pill', 'blockenberg'), value: a.pillTypo, onChange: v => setAttributes({ pillTypo: v }) })
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ),  value: a.bgColor,       onChange: v => setAttributes( { bgColor:      v || '#ffffff' } ) },
                            { label: __( 'Heading', 'blockenberg' ),     value: a.headingColor,  onChange: v => setAttributes( { headingColor: v || '#111827' } ) },
                            { label: __( 'Subtitle', 'blockenberg' ),    value: a.subtitleColor, onChange: v => setAttributes( { subtitleColor:v || '#6b7280' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Tags', 'blockenberg' ), initialOpen: false },
                        el( Button, {
                            variant: 'secondary', style: { marginBottom: 10 },
                            onClick: () => setAttributes( { tags: [ ...( a.tags || [] ), { icon: '🏷️', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', label: 'New Tag', color: '#6366f1', textColor: '#ffffff', url: '' } ] } ),
                        }, __( '+ Add Tag', 'blockenberg' ) ),
                        a.tags.map( ( tag, ti ) =>
                            el( PanelBody, { key: ti, title: ( (tag.iconType || 'custom-char') === 'custom-char' ? (tag.icon ? tag.icon + ' ' : '') : '● ' ) + tag.label, initialOpen: false },
                                el(IP().IconPickerControl, IP().iconPickerProps(tag, function(patch) { var updated = a.tags.map(function(t, i) { return i === ti ? Object.assign({}, t, patch) : t; }); setAttributes({ tags: updated }); }, { label: __('Icon', 'blockenberg'), charAttr: 'icon', typeAttr: 'iconType', dashiconAttr: 'iconDashicon', imageUrlAttr: 'iconImageUrl' })),
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),        value: tag.label,     onChange: v => updTag( setAttributes, a.tags, ti, 'label',     v ) } ),
                                el( TextControl, { label: __( 'Link URL', 'blockenberg' ),     value: tag.url,       onChange: v => updTag( setAttributes, a.tags, ti, 'url',       v ) } ),
                                el( 'div', { style: { display: 'flex', gap: 12, marginBottom: 8 } },
                                    el( 'div', {},
                                        el( 'label', { style: { fontSize: 11, display: 'block', marginBottom: 4 } }, __( 'Background', 'blockenberg' ) ),
                                        el( 'input', { type: 'color', value: tag.color || '#6366f1', style: { width: 40, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }, onChange: e => updTag( setAttributes, a.tags, ti, 'color', e.target.value ) } ),
                                    ),
                                    el( 'div', {},
                                        el( 'label', { style: { fontSize: 11, display: 'block', marginBottom: 4 } }, __( 'Text', 'blockenberg' ) ),
                                        el( 'input', { type: 'color', value: tag.textColor || '#ffffff', style: { width: 40, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }, onChange: e => updTag( setAttributes, a.tags, ti, 'textColor', e.target.value ) } ),
                                    ),
                                ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { tags: a.tags.filter( ( _, x ) => x !== ti ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-tl-title', style: { color: a.headingColor, margin: '0 0 8px' } }, a.title ),
                a.showSubtitle && a.subtitle && el( 'p', { className: 'bkbg-tl-subtitle', style: { color: a.subtitleColor, margin: '0 0 14px' } }, a.subtitle ),
                renderTagList( a, false ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( (function () {
                var _tvf = getTypoCssVars();
                var s = { background: a.bgColor };
                if (_tvf) {
                    Object.assign(s, _tvf(a.titleTypo, '--bktl-tt-'));
                    Object.assign(s, _tvf(a.pillTypo, '--bktl-pl-'));
                }
                return { className: 'bkbg-tl-wrap', style: s };
            })() );
            return el( 'div', blockProps,
                ( a.showTitle && a.title )    ? el( 'h3', { className: 'bkbg-tl-title',    style: { color: a.headingColor,  margin: '0 0 8px' } }, a.title )    : null,
                ( a.showSubtitle && a.subtitle ) ? el( 'p',  { className: 'bkbg-tl-subtitle', style: { color: a.subtitleColor, margin: '0 0 14px' } }, a.subtitle ) : null,
                renderTagList( a, true ),
            );
        },
    } );
}() );
