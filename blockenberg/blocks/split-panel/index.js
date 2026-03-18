( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    /* Lazy typography helpers */
    let _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }
    const IP = function () { return window.bkbgIconPicker; };

    function renderIconPart(type, charVal, dashicon, imageUrl, dashiconColor, forSave) {
        if (!type || type === 'custom-char') return charVal;
        var fn = forSave ? IP().buildSaveIcon : IP().buildEditorIcon;
        return fn(type, charVal, dashicon, imageUrl, dashiconColor);
    }

    function buildWrapStyle(a) {
        const tv = getTypoCssVars();
        const s = {
            background: a.bgColor,
            boxSizing: 'border-box',
            '--bksp-hd-sz': (a.titleFontSize + 2) + 'px',
            '--bksp-tt-sz': a.titleFontSize + 'px',
            '--bksp-tt-w':  String(a.titleFontWeight),
            '--bksp-tt-lh': String(a.titleLineHeight),
            '--bksp-bd-sz': a.fontSize + 'px',
            '--bksp-it-sz': a.itemFontSize + 'px',
            '--bksp-it-w':  String(a.itemFontWeight),
            '--bksp-it-lh': String(a.itemLineHeight),
        };
        if (tv) {
            Object.assign(s, tv(a.headingTypo, '--bksp-hd-'));
            Object.assign(s, tv(a.titleTypo,   '--bksp-tt-'));
            Object.assign(s, tv(a.bodyTypo,    '--bksp-bd-'));
            Object.assign(s, tv(a.itemTypo,    '--bksp-it-'));
        }
        return s;
    }

    // ── Panel component ───────────────────────────────────────────────────────
    function Panel( { icon, iconType, iconDashicon, iconImageUrl, iconDashiconColor, forSave, iconSize, title, body, items, bg, accent, textColor, titleColor, padding, borderRadius, side } ) {
        return el( 'div', { className: 'bkbg-sp-panel bkbg-sp-panel--' + side, style: {
            flex: '1 1 0',
            background: bg,
            borderRadius: borderRadius + 'px',
            padding: padding + 'px',
            borderLeft: '4px solid ' + accent,
            boxSizing: 'border-box',
        } },
            // Icon + title
            el( 'div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 } },
                el( 'span', { className: 'bkbg-sp-icon', style: { fontSize: iconSize + 'px', lineHeight: 1 } }, renderIconPart(iconType, icon, iconDashicon, iconImageUrl, iconDashiconColor, forSave) ),
                el( 'strong', { className: 'bkbg-sp-title', style: { color: titleColor } }, title ),
            ),
            // Body
            body && el( 'p', { className: 'bkbg-sp-body', style: { color: textColor, margin: '0 0 14px' } }, body ),
            // Items
            items && items.length > 0 && el( 'ul', { style: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 } },
                items.map( ( item, i ) =>
                    el( 'li', { key: i, className: 'bkbg-sp-item', style: { display: 'flex', alignItems: 'flex-start', gap: 8, color: textColor } },
                        el( 'span', { style: { flexShrink: 0, width: 8, height: 8, borderRadius: '50%', background: accent, marginTop: 6 } } ),
                        el( 'span', {}, item ),
                    )
                ),
            ),
        );
    }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderSplitPanel( a, forSave ) {
        return el( 'div', { className: 'bkbg-sp-row', style: { display: 'flex', gap: a.showDivider ? 0 : 20, alignItems: 'stretch' } },
            el( Panel, { side: 'left',  icon: a.leftIcon,  iconType: a.leftIconType, iconDashicon: a.leftIconDashicon, iconImageUrl: a.leftIconImageUrl, iconDashiconColor: a.leftIconDashiconColor, forSave: forSave, iconSize: a.iconSize, title: a.leftTitle,  body: a.leftBody,  items: a.leftItems,  bg: a.leftBg,  accent: a.leftAccent,  textColor: a.textColor, titleColor: a.titleColor, padding: a.padding, borderRadius: a.borderRadius } ),
            a.showDivider && el( 'div', { className: 'bkbg-sp-divider', style: { width: 1, margin: '0 20px', background: 'linear-gradient(to bottom, transparent, #d1d5db 30%, #d1d5db 70%, transparent)', flexShrink: 0, alignSelf: 'stretch' } } ),
            el( Panel, { side: 'right', icon: a.rightIcon, iconType: a.rightIconType, iconDashicon: a.rightIconDashicon, iconImageUrl: a.rightIconImageUrl, iconDashiconColor: a.rightIconDashiconColor, forSave: forSave, iconSize: a.iconSize, title: a.rightTitle, body: a.rightBody, items: a.rightItems, bg: a.rightBg, accent: a.rightAccent, textColor: a.textColor, titleColor: a.titleColor, padding: a.padding, borderRadius: a.borderRadius } ),
        );
    }

    // ── Item list helper ──────────────────────────────────────────────────────
    function ItemListEditor( { label, items, setItems } ) {
        return el( PanelBody, { title: label, initialOpen: false },
            el( Button, { variant: 'secondary', style: { marginBottom: 8 }, onClick: () => setItems( [ ...( items || [] ), 'New item' ] ) }, __( '+ Add Item', 'blockenberg' ) ),
            ( items || [] ).map( ( item, i ) =>
                el( 'div', { key: i, style: { display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' } },
                    el( TextControl, { value: item, style: { flex: 1, margin: 0 }, onChange: v => setItems( items.map( ( x, j ) => j === i ? v : x ) ) } ),
                    el( Button, { isDestructive: true, isSmall: true, onClick: () => setItems( items.filter( ( _, j ) => j !== i ) ) }, '✕' ),
                )
            ),
        );
    }

    // ── Block ─────────────────────────────────────────────────────────────────
    registerBlockType( 'blockenberg/split-panel', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-sp-wrap', style: buildWrapStyle(a) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Settings', 'blockenberg' ), initialOpen: true },
                        el( ToggleControl, { label: __( 'Show Heading', 'blockenberg' ),  checked: a.showTitle,  onChange: v => setAttributes( { showTitle:  v } ) } ),
                        a.showTitle && el( TextControl, { label: __( 'Heading', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Divider', 'blockenberg' ), checked: a.showDivider, onChange: v => setAttributes( { showDivider: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Left Panel', 'blockenberg' ), initialOpen: false },
                        el( IP().IconPickerControl, IP().iconPickerProps( a, setAttributes, { charAttr: 'leftIcon', typeAttr: 'leftIconType', dashiconAttr: 'leftIconDashicon', imageUrlAttr: 'leftIconImageUrl', colorAttr: 'leftIconDashiconColor' } ) ),
                        el( TextControl, { label: __( 'Title', 'blockenberg' ),         value: a.leftTitle, onChange: v => setAttributes( { leftTitle: v } ) } ),
                        el( TextControl, { label: __( 'Body Text', 'blockenberg' ),     value: a.leftBody,  onChange: v => setAttributes( { leftBody:  v } ) } ),
                        el( ItemListEditor, { label: __( 'Bullet Items', 'blockenberg' ), items: a.leftItems, setItems: v => setAttributes( { leftItems: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Right Panel', 'blockenberg' ), initialOpen: false },
                        el( IP().IconPickerControl, IP().iconPickerProps( a, setAttributes, { charAttr: 'rightIcon', typeAttr: 'rightIconType', dashiconAttr: 'rightIconDashicon', imageUrlAttr: 'rightIconImageUrl', colorAttr: 'rightIconDashiconColor' } ) ),
                        el( TextControl, { label: __( 'Title', 'blockenberg' ),         value: a.rightTitle, onChange: v => setAttributes( { rightTitle: v } ) } ),
                        el( TextControl, { label: __( 'Body Text', 'blockenberg' ),     value: a.rightBody,  onChange: v => setAttributes( { rightBody:  v } ) } ),
                        el( ItemListEditor, { label: __( 'Bullet Items', 'blockenberg' ), items: a.rightItems, setItems: v => setAttributes( { rightItems: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Style', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Border Radius', 'blockenberg' ), value: a.borderRadius, onChange: v => setAttributes( { borderRadius: v } ), min: 0, max: 32 } ),
                        el( RangeControl, { label: __( 'Padding', 'blockenberg' ),        value: a.padding,      onChange: v => setAttributes( { padding:      v } ), min: 12, max: 56 } ),
                        el( RangeControl, { label: __( 'Icon Size', 'blockenberg' ),      value: a.iconSize,     onChange: v => setAttributes( { iconSize:     v } ), min: 16, max: 64 } ),
                    ),

                    
        el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
            getTypoControl() && getTypoControl()({ label: __('Heading', 'blockenberg'), value: a.headingTypo, onChange: v => setAttributes({ headingTypo: v }) }),
            getTypoControl() && getTypoControl()({ label: __('Panel title', 'blockenberg'), value: a.titleTypo, onChange: v => setAttributes({ titleTypo: v }) }),
            getTypoControl() && getTypoControl()({ label: __('Body', 'blockenberg'), value: a.bodyTypo, onChange: v => setAttributes({ bodyTypo: v }) }),
            getTypoControl() && getTypoControl()({ label: __('Item', 'blockenberg'), value: a.itemTypo, onChange: v => setAttributes({ itemTypo: v }) })
        ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Outer Background', 'blockenberg' ), value: a.bgColor,     onChange: v => setAttributes( { bgColor:     v || '#ffffff' } ) },
                            { label: __( 'Text', 'blockenberg' ),             value: a.textColor,   onChange: v => setAttributes( { textColor:   v || '#374151' } ) },
                            { label: __( 'Title', 'blockenberg' ),            value: a.titleColor,  onChange: v => setAttributes( { titleColor:  v || '#111827' } ) },
                            { label: __( 'Left Background', 'blockenberg' ),  value: a.leftBg,      onChange: v => setAttributes( { leftBg:      v || '#fef2f2' } ) },
                            { label: __( 'Left Accent', 'blockenberg' ),      value: a.leftAccent,  onChange: v => setAttributes( { leftAccent:  v || '#ef4444' } ) },
                            { label: __( 'Right Background', 'blockenberg' ), value: a.rightBg,     onChange: v => setAttributes( { rightBg:     v || '#f0fdf4' } ) },
                            { label: __( 'Right Accent', 'blockenberg' ),     value: a.rightAccent, onChange: v => setAttributes( { rightAccent: v || '#10b981' } ) },
                        ]
                    } ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-sp-heading', style: { color: a.titleColor, margin: '0 0 20px' } }, a.title ),
                renderSplitPanel( a ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-sp-wrap', style: buildWrapStyle(a) } );
            return el( 'div', blockProps,
                ( a.showTitle && a.title ) ? el( 'h3', { className: 'bkbg-sp-heading', style: { color: a.titleColor, margin: '0 0 20px' } }, a.title ) : null,
                renderSplitPanel( a, true ),
            );
        },
    } );
}() );
