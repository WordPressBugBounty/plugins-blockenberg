( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;
    const Fragment = window.wp.element.Fragment;

    // Lazy lookup so the typography control is resolved at render time
    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
    }

    // ── Row component ─────────────────────────────────────────────────────────
    function InfoRow( { icon, children, accentColor, textColor, labelColor, fontSize } ) {
        return el( 'div', { className: 'bkbg-ac-row', style: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' } },
            el( 'div', { className: 'bkbg-ac-icon', style: {
                width: 34, height: 34, borderRadius: 8, background: accentColor + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0, color: accentColor,
            } }, icon ),
            el( 'div', { className: 'bkbg-ac-row-text', style: { flex: 1, color: textColor, paddingTop: 6 } }, children ),
        );
    }

    // ── Full render ───────────────────────────────────────────────────────────
    function renderAddressCard( a ) {
        return el( 'div', { className: 'bkbg-ac-card', style: {
            background: a.cardBg,
            border: '1px solid ' + a.borderColor,
            borderRadius: a.borderRadius + 'px',
            padding: a.padding + 'px',
            borderTop: '3px solid ' + a.accentColor,
            boxSizing: 'border-box',
        } },
            // Header
            el( 'div', { className: 'bkbg-ac-header', style: { marginBottom: 16 } },
                a.showCompany && el( 'div', { className: 'bkbg-ac-company', style: { color: a.headingColor } }, a.companyName ),
                a.showTagline && el( 'div', { className: 'bkbg-ac-tagline-text', style: { color: a.taglineColor, marginTop: 4 } }, a.tagline ),
            ),

            // Info rows
            a.showAddress && el( InfoRow, { icon: '📍', accentColor: a.accentColor, textColor: a.textColor, labelColor: a.labelColor, fontSize: a.fontSize },
                el( 'span', {}, a.address1 ),
                a.address2  && el( 'span', { style: { display: 'block' } }, a.address2 ),
                a.country   && el( 'span', { style: { display: 'block', color: a.labelColor } }, a.country ),
            ),
            a.showPhone && el( InfoRow, { icon: '📞', accentColor: a.accentColor, textColor: a.textColor, labelColor: a.labelColor, fontSize: a.fontSize },
                el( 'a', { href: 'tel:' + a.phone, style: { color: a.textColor, textDecoration: 'none' } }, a.phone ),
            ),
            a.showEmail && el( InfoRow, { icon: '✉️', accentColor: a.accentColor, textColor: a.textColor, labelColor: a.labelColor, fontSize: a.fontSize },
                el( 'a', { href: 'mailto:' + a.email, style: { color: a.linkColor, textDecoration: 'none' } }, a.email ),
            ),
            a.showWebsite && el( InfoRow, { icon: '🌐', accentColor: a.accentColor, textColor: a.textColor, labelColor: a.labelColor, fontSize: a.fontSize },
                el( 'a', { href: a.website, style: { color: a.linkColor, textDecoration: 'none' } }, a.website.replace( /^https?:\/\//, '' ) ),
            ),
            a.showHours && el( InfoRow, { icon: '🕐', accentColor: a.accentColor, textColor: a.textColor, labelColor: a.labelColor, fontSize: a.fontSize },
                a.hours,
            ),

            // Map link
            a.showMapLink && el( 'a', {
                href: a.mapUrl || '#',
                className: 'bkbg-ac-maplink',
                style: {
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    marginTop: 16, padding: '8px 16px',
                    background: a.accentColor, color: '#fff',
                    borderRadius: 99,
                    fontWeight: 600, textDecoration: 'none',
                    boxShadow: '0 2px 6px ' + a.accentColor + '44',
                }
            }, '🗺️ ', a.mapLinkLabel ),
        );
    }

    // ── Block ─────────────────────────────────────────────────────────────────
    registerBlockType( 'blockenberg/address-card', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            var _tv = getTypoCssVars();
            var wrapStyle = { background: a.bgColor,
                '--bkbg-ac-heading-sz': a.headingFontSize + 'px',
                '--bkbg-ac-body-sz':    a.fontSize + 'px',
            };
            Object.assign(wrapStyle, _tv(a.headingTypo || {}, '--bkbg-ac-heading-'));
            Object.assign(wrapStyle, _tv(a.bodyTypo    || {}, '--bkbg-ac-body-'));
            const blockProps = useBlockProps( { className: 'bkbg-ac-wrap', style: wrapStyle } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Company', 'blockenberg' ), initialOpen: true },
                        el( ToggleControl, { label: __( 'Show Company Name', 'blockenberg' ), checked: a.showCompany, onChange: v => setAttributes( { showCompany: v } ) } ),
                        el( TextControl,   { label: __( 'Company Name', 'blockenberg' ),      value: a.companyName,  onChange: v => setAttributes( { companyName: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Tagline', 'blockenberg' ),      checked: a.showTagline, onChange: v => setAttributes( { showTagline: v } ) } ),
                        el( TextControl,   { label: __( 'Tagline', 'blockenberg' ),           value: a.tagline,      onChange: v => setAttributes( { tagline:     v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Contact Details', 'blockenberg' ), initialOpen: false },
                        el( ToggleControl, { label: __( 'Show Address', 'blockenberg' ), checked: a.showAddress, onChange: v => setAttributes( { showAddress: v } ) } ),
                        el( TextControl,   { label: __( 'Address Line 1', 'blockenberg' ),  value: a.address1, onChange: v => setAttributes( { address1: v } ) } ),
                        el( TextControl,   { label: __( 'Address Line 2', 'blockenberg' ),  value: a.address2, onChange: v => setAttributes( { address2: v } ) } ),
                        el( TextControl,   { label: __( 'Country', 'blockenberg' ),         value: a.country,  onChange: v => setAttributes( { country:  v } ) } ),
                        el( ToggleControl, { label: __( 'Show Phone', 'blockenberg' ),  checked: a.showPhone,   onChange: v => setAttributes( { showPhone:   v } ) } ),
                        el( TextControl,   { label: __( 'Phone', 'blockenberg' ),       value: a.phone,         onChange: v => setAttributes( { phone:       v } ) } ),
                        el( ToggleControl, { label: __( 'Show Email', 'blockenberg' ),  checked: a.showEmail,   onChange: v => setAttributes( { showEmail:   v } ) } ),
                        el( TextControl,   { label: __( 'Email', 'blockenberg' ),       value: a.email,         onChange: v => setAttributes( { email:       v } ) } ),
                        el( ToggleControl, { label: __( 'Show Website', 'blockenberg' ),checked: a.showWebsite, onChange: v => setAttributes( { showWebsite: v } ) } ),
                        el( TextControl,   { label: __( 'Website URL', 'blockenberg' ), value: a.website,       onChange: v => setAttributes( { website:     v } ) } ),
                        el( ToggleControl, { label: __( 'Show Hours', 'blockenberg' ),  checked: a.showHours,   onChange: v => setAttributes( { showHours:   v } ) } ),
                        el( TextControl,   { label: __( 'Opening Hours', 'blockenberg' ),value: a.hours,        onChange: v => setAttributes( { hours:       v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Map Link', 'blockenberg' ), initialOpen: false },
                        el( ToggleControl, { label: __( 'Show Map Link', 'blockenberg' ),  checked: a.showMapLink,  onChange: v => setAttributes( { showMapLink:  v } ) } ),
                        el( TextControl,   { label: __( 'Map URL', 'blockenberg' ),         value: a.mapUrl,         onChange: v => setAttributes( { mapUrl:       v } ) } ),
                        el( TextControl,   { label: __( 'Link Label', 'blockenberg' ),      value: a.mapLinkLabel,   onChange: v => setAttributes( { mapLinkLabel: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Style', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Border Radius', 'blockenberg' ), value: a.borderRadius,   onChange: v => setAttributes( { borderRadius:   v } ), min: 0, max: 32 } ),
                        el( RangeControl, { label: __( 'Padding', 'blockenberg' ),       value: a.padding,        onChange: v => setAttributes( { padding:        v } ), min: 12, max: 60 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function () {
                            var TC = getTypographyControl();
                            if (!TC) return el('p', { style: { color: '#999', fontSize: '12px', padding: '8px 0' } }, __('Typography control loading…', 'blockenberg'));
                            return el(Fragment, {},
                                el(TC, { label: __('Heading', 'blockenberg'), value: a.headingTypo || {}, onChange: function (v) { setAttributes({ headingTypo: v }); } }),
                                el(TC, { label: __('Body Text', 'blockenberg'), value: a.bodyTypo || {}, onChange: function (v) { setAttributes({ bodyTypo: v }); } })
                            );
                        })()
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Accent / Top Border', 'blockenberg' ), value: a.accentColor,  onChange: v => setAttributes( { accentColor:  v || '#6366f1' } ) },
                            { label: __( 'Page Background', 'blockenberg' ),     value: a.bgColor,      onChange: v => setAttributes( { bgColor:      v || '#ffffff' } ) },
                            { label: __( 'Card Background', 'blockenberg' ),     value: a.cardBg,       onChange: v => setAttributes( { cardBg:       v || '#f9fafb' } ) },
                            { label: __( 'Border', 'blockenberg' ),              value: a.borderColor,  onChange: v => setAttributes( { borderColor:  v || '#e5e7eb' } ) },
                            { label: __( 'Heading', 'blockenberg' ),             value: a.headingColor, onChange: v => setAttributes( { headingColor: v || '#111827' } ) },
                            { label: __( 'Tagline', 'blockenberg' ),             value: a.taglineColor, onChange: v => setAttributes( { taglineColor: v || '#6b7280' } ) },
                            { label: __( 'Body Text', 'blockenberg' ),           value: a.textColor,    onChange: v => setAttributes( { textColor:    v || '#374151' } ) },
                            { label: __( 'Links', 'blockenberg' ),               value: a.linkColor,    onChange: v => setAttributes( { linkColor:    v || '#6366f1' } ) },
                        ]
                    } ),
                ),

                renderAddressCard( a ),
            );
        },

        save: function ( { attributes: a } ) {
            var _tv = getTypoCssVars();
            var wrapStyle = { background: a.bgColor,
                '--bkbg-ac-heading-sz': a.headingFontSize + 'px',
                '--bkbg-ac-body-sz':    a.fontSize + 'px',
            };
            Object.assign(wrapStyle, _tv(a.headingTypo || {}, '--bkbg-ac-heading-'));
            Object.assign(wrapStyle, _tv(a.bodyTypo    || {}, '--bkbg-ac-body-'));
            const blockProps = useBlockProps.save( { className: 'bkbg-ac-wrap', style: wrapStyle } );
            return el( 'div', blockProps, renderAddressCard( a ) );
        },
    } );
}() );
