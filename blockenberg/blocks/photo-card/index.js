( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button, SelectControl } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── Image / placeholder area ───────────────────────────────────────────────
    function CardImage( { imageUrl, imageAlt, aspectRatio, borderRadius, imagePlaceholderBg, category, showCategory, categoryBg, categoryColor, layout } ) {
        const radii = layout === 'vertical'
            ? borderRadius + 'px ' + borderRadius + 'px 0 0'
            : '0'; // handled by parent radius

        const wrapStyle = {
            position: 'relative',
            overflow: 'hidden',
            borderRadius: layout === 'vertical' ? ( borderRadius + 'px ' + borderRadius + 'px 0 0' ) : ( borderRadius + 'px 0 0 ' + borderRadius + 'px' ),
            background: imagePlaceholderBg,
            flexShrink: 0,
        };

        if ( layout === 'horizontal' ) {
            wrapStyle.width = '45%';
            wrapStyle.minHeight = 200;
        } else {
            wrapStyle.aspectRatio = aspectRatio;
            wrapStyle.width = '100%';
        }

        return el( 'div', { className: 'bkbg-pc-image', style: wrapStyle },
            imageUrl
                ? el( 'img', { src: imageUrl, alt: imageAlt, style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } } )
                : el( 'div', { style: { width: '100%', height: '100%', minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 } }, '🖼 ' + __( 'No image set', 'blockenberg' ) ),
            showCategory && category && el( 'span', { className: 'bkbg-pc-cat', style: {
                position: 'absolute', top: 12, left: 12,
                background: categoryBg, color: categoryColor,
                padding: '3px 10px', borderRadius: 99,
                letterSpacing: 0.3, textTransform: 'uppercase',
            } }, category ),
        );
    }

    // ── Full render ───────────────────────────────────────────────────────────
    function renderPhotoCard( a ) {
        const isHoriz = a.layout === 'horizontal';
        return el( 'div', { className: 'bkbg-pc-card', style: {
            background: a.cardBg,
            border: '1px solid ' + a.borderColor,
            borderRadius: a.borderRadius + 'px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: isHoriz ? ( a.imageSide === 'right' ? 'row-reverse' : 'row' ) : 'column',
            boxSizing: 'border-box',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        } },
            el( CardImage, {
                imageUrl: a.imageUrl, imageAlt: a.imageAlt, aspectRatio: a.aspectRatio,
                borderRadius: a.borderRadius, imagePlaceholderBg: a.imagePlaceholderBg,
                category: a.category, showCategory: a.showCategory,
                categoryBg: a.categoryBg, categoryColor: a.categoryColor,
                layout: a.layout,
            } ),

            // Content
            el( 'div', { className: 'bkbg-pc-body', style: { padding: a.padding + 'px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 } },
                el( 'h3', { className: 'bkbg-pc-title', style: { margin: 0, color: a.titleColor } }, a.title ),
                a.showExcerpt && el( 'p', { className: 'bkbg-pc-excerpt', style: { margin: 0, color: a.textColor } }, a.excerpt ),

                // Meta row
                el( 'div', { className: 'bkbg-pc-meta', style: { display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', color: a.metaColor, marginTop: 'auto' } },
                    a.showAuthor   && el( 'span', {}, '✍️ ' + a.author ),
                    a.showAuthor && a.showDate && el( 'span', { style: { opacity: 0.4 } }, '·' ),
                    a.showDate     && el( 'span', {}, a.date ),
                    a.showDate && a.showReadTime && el( 'span', { style: { opacity: 0.4 } }, '·' ),
                    a.showReadTime && el( 'span', {}, '⏱ ' + a.readTime ),
                ),

                a.showLink && el( 'a', { href: a.linkUrl || '#', style: {
                    color: a.linkColor, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
                } }, a.linkText ),
            ),
        );
    }

    // ── Legacy render (for deprecated save) ──────────────────────────────────
    function renderPhotoCardLegacy( a ) {
        var isHoriz = a.layout === 'horizontal';
        var imgStyle = {
            position: 'relative', overflow: 'hidden',
            borderRadius: isHoriz ? ( a.borderRadius + 'px 0 0 ' + a.borderRadius + 'px' ) : ( a.borderRadius + 'px ' + a.borderRadius + 'px 0 0' ),
            background: a.imagePlaceholderBg, flexShrink: 0,
        };
        if ( isHoriz ) { imgStyle.width = '45%'; imgStyle.minHeight = 200; }
        else { imgStyle.aspectRatio = a.aspectRatio; imgStyle.width = '100%'; }

        var imageArea = el( 'div', { className: 'bkbg-pc-image', style: imgStyle },
            a.imageUrl
                ? el( 'img', { src: a.imageUrl, alt: a.imageAlt, style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } } )
                : el( 'div', { style: { width: '100%', height: '100%', minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 } }, '🖼 ' + __( 'No image set', 'blockenberg' ) ),
            a.showCategory && a.category && el( 'span', { className: 'bkbg-pc-cat', style: {
                position: 'absolute', top: 12, left: 12,
                background: a.categoryBg, color: a.categoryColor,
                fontSize: a.metaFontSize + 'px', fontWeight: 700,
                padding: '3px 10px', borderRadius: 99,
                letterSpacing: 0.3, textTransform: 'uppercase',
            } }, a.category ),
        );

        return el( 'div', { className: 'bkbg-pc-card', style: {
            background: a.cardBg, border: '1px solid ' + a.borderColor,
            borderRadius: a.borderRadius + 'px', overflow: 'hidden',
            display: 'flex',
            flexDirection: isHoriz ? ( a.imageSide === 'right' ? 'row-reverse' : 'row' ) : 'column',
            boxSizing: 'border-box', boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        } },
            imageArea,
            el( 'div', { className: 'bkbg-pc-body', style: { padding: a.padding + 'px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 } },
                el( 'h3', { className: 'bkbg-pc-title', style: { margin: 0, fontSize: a.titleFontSize + 'px', fontWeight: 700, color: a.titleColor, lineHeight: 1.3 } }, a.title ),
                a.showExcerpt && el( 'p', { className: 'bkbg-pc-excerpt', style: { margin: 0, fontSize: a.fontSize + 'px', color: a.textColor, lineHeight: 1.65 } }, a.excerpt ),
                el( 'div', { className: 'bkbg-pc-meta', style: { display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', fontSize: a.metaFontSize + 'px', color: a.metaColor, marginTop: 'auto' } },
                    a.showAuthor   && el( 'span', {}, '✍️ ' + a.author ),
                    a.showAuthor && a.showDate && el( 'span', { style: { opacity: 0.4 } }, '·' ),
                    a.showDate     && el( 'span', {}, a.date ),
                    a.showDate && a.showReadTime && el( 'span', { style: { opacity: 0.4 } }, '·' ),
                    a.showReadTime && el( 'span', {}, '⏱ ' + a.readTime ),
                ),
                a.showLink && el( 'a', { href: a.linkUrl || '#', style: {
                    fontSize: a.fontSize + 'px', fontWeight: 600, color: a.linkColor, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
                } }, a.linkText ),
            ),
        );
    }

    // ── Block ─────────────────────────────────────────────────────────────────
    registerBlockType( 'blockenberg/photo-card', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps((function () {
                var tv = getTypoCssVars();
                var s = { background: a.bgColor };
                Object.assign(s, tv(a.titleTypo, '--bkbg-pc-tt-'));
                Object.assign(s, tv(a.bodyTypo, '--bkbg-pc-bd-'));
                Object.assign(s, tv(a.metaTypo, '--bkbg-pc-mt-'));
                return { className: 'bkbg-pc-wrap', style: s };
            })());

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Content', 'blockenberg' ), initialOpen: true },
                        el( TextControl, { label: __( 'Image URL', 'blockenberg' ),   value: a.imageUrl, onChange: v => setAttributes( { imageUrl: v } ) } ),
                        el( TextControl, { label: __( 'Image Alt', 'blockenberg' ),   value: a.imageAlt, onChange: v => setAttributes( { imageAlt: v } ) } ),
                        el( SelectControl, { label: __( 'Aspect Ratio', 'blockenberg' ), value: a.aspectRatio, options: [
                            { label: '16 / 9',  value: '16/9' },
                            { label: '4 / 3',   value: '4/3' },
                            { label: '3 / 2',   value: '3/2' },
                            { label: '1 / 1',   value: '1/1' },
                            { label: '2 / 1',   value: '2/1' },
                        ], onChange: v => setAttributes( { aspectRatio: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Category', 'blockenberg' ), checked: a.showCategory, onChange: v => setAttributes( { showCategory: v } ) } ),
                        el( TextControl,   { label: __( 'Category', 'blockenberg' ),      value: a.category,      onChange: v => setAttributes( { category:     v } ) } ),
                        el( TextControl, { label: __( 'Title', 'blockenberg' ),   value: a.title,   onChange: v => setAttributes( { title:   v } ) } ),
                        el( ToggleControl, { label: __( 'Show Excerpt', 'blockenberg' ), checked: a.showExcerpt, onChange: v => setAttributes( { showExcerpt: v } ) } ),
                        a.showExcerpt && el( TextControl, { label: __( 'Excerpt', 'blockenberg' ), value: a.excerpt, onChange: v => setAttributes( { excerpt: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Meta', 'blockenberg' ), initialOpen: false },
                        el( ToggleControl, { label: __( 'Show Author', 'blockenberg' ),    checked: a.showAuthor,   onChange: v => setAttributes( { showAuthor:   v } ) } ),
                        a.showAuthor   && el( TextControl, { label: __( 'Author', 'blockenberg' ),    value: a.author,   onChange: v => setAttributes( { author:   v } ) } ),
                        el( ToggleControl, { label: __( 'Show Date', 'blockenberg' ),      checked: a.showDate,     onChange: v => setAttributes( { showDate:     v } ) } ),
                        a.showDate     && el( TextControl, { label: __( 'Date', 'blockenberg' ),      value: a.date,     onChange: v => setAttributes( { date:     v } ) } ),
                        el( ToggleControl, { label: __( 'Show Read Time', 'blockenberg' ), checked: a.showReadTime, onChange: v => setAttributes( { showReadTime: v } ) } ),
                        a.showReadTime && el( TextControl, { label: __( 'Read Time', 'blockenberg' ), value: a.readTime, onChange: v => setAttributes( { readTime: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Link', 'blockenberg' ), checked: a.showLink, onChange: v => setAttributes( { showLink: v } ) } ),
                        a.showLink && el( TextControl, { label: __( 'Link URL', 'blockenberg' ),  value: a.linkUrl,  onChange: v => setAttributes( { linkUrl:  v } ) } ),
                        a.showLink && el( TextControl, { label: __( 'Link Text', 'blockenberg' ), value: a.linkText, onChange: v => setAttributes( { linkText: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( SelectControl, { label: __( 'Layout', 'blockenberg' ), value: a.layout, options: [
                            { label: 'Vertical (image top)', value: 'vertical' },
                            { label: 'Horizontal (image side)', value: 'horizontal' },
                        ], onChange: v => setAttributes( { layout: v } ) } ),
                        a.layout === 'horizontal' && el( SelectControl, { label: __( 'Image Side', 'blockenberg' ), value: a.imageSide, options: [
                            { label: 'Left', value: 'left' }, { label: 'Right', value: 'right' },
                        ], onChange: v => setAttributes( { imageSide: v } ) } ),
                        el( RangeControl, { label: __( 'Border Radius', 'blockenberg' ), value: a.borderRadius,  onChange: v => setAttributes( { borderRadius:  v } ), min: 0, max: 32 } ),
                        el( RangeControl, { label: __( 'Content Padding', 'blockenberg' ),value: a.padding,      onChange: v => setAttributes( { padding:       v } ), min: 12, max: 56 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el( getTypoControl(), { label: __( 'Title', 'blockenberg' ), value: a.titleTypo, onChange: v => setAttributes({ titleTypo: v }) }),
                        el( getTypoControl(), { label: __( 'Body', 'blockenberg' ), value: a.bodyTypo, onChange: v => setAttributes({ bodyTypo: v }) }),
                        el( getTypoControl(), { label: __( 'Meta', 'blockenberg' ), value: a.metaTypo, onChange: v => setAttributes({ metaTypo: v }) })
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Page Background', 'blockenberg' ),   value: a.bgColor,            onChange: v => setAttributes( { bgColor:            v || '#ffffff' } ) },
                            { label: __( 'Card Background', 'blockenberg' ),   value: a.cardBg,             onChange: v => setAttributes( { cardBg:             v || '#ffffff' } ) },
                            { label: __( 'Border', 'blockenberg' ),            value: a.borderColor,        onChange: v => setAttributes( { borderColor:        v || '#e5e7eb' } ) },
                            { label: __( 'Title', 'blockenberg' ),             value: a.titleColor,         onChange: v => setAttributes( { titleColor:         v || '#111827' } ) },
                            { label: __( 'Body Text', 'blockenberg' ),         value: a.textColor,          onChange: v => setAttributes( { textColor:          v || '#6b7280' } ) },
                            { label: __( 'Meta Text', 'blockenberg' ),         value: a.metaColor,          onChange: v => setAttributes( { metaColor:          v || '#9ca3af' } ) },
                            { label: __( 'Category Background', 'blockenberg' ),value: a.categoryBg,       onChange: v => setAttributes( { categoryBg:         v || '#6366f1' } ) },
                            { label: __( 'Category Text', 'blockenberg' ),     value: a.categoryColor,      onChange: v => setAttributes( { categoryColor:      v || '#ffffff' } ) },
                            { label: __( 'Link', 'blockenberg' ),              value: a.linkColor,          onChange: v => setAttributes( { linkColor:          v || '#6366f1' } ) },
                            { label: __( 'Image Placeholder', 'blockenberg' ), value: a.imagePlaceholderBg, onChange: v => setAttributes( { imagePlaceholderBg: v || '#e5e7eb' } ) },
                        ]
                    } ),
                ),

                renderPhotoCard( a ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save((function () {
                var tv = getTypoCssVars();
                var s = { background: a.bgColor };
                Object.assign(s, tv(a.titleTypo, '--bkbg-pc-tt-'));
                Object.assign(s, tv(a.bodyTypo, '--bkbg-pc-bd-'));
                Object.assign(s, tv(a.metaTypo, '--bkbg-pc-mt-'));
                return { className: 'bkbg-pc-wrap', style: s };
            })());
            return el( 'div', blockProps, renderPhotoCard( a ) );
        },

        deprecated: [{
            attributes: {
                imageUrl:{type:"string","default":""},imageAlt:{type:"string","default":""},aspectRatio:{type:"string","default":"16/9"},
                category:{type:"string","default":"Technology"},showCategory:{type:"boolean","default":true},
                title:{type:"string","default":"The Future of Web Development Starts Today"},
                excerpt:{type:"string","default":"Explore how modern tooling, AI-assisted coding, and component-driven design are reshaping the way we build for the web."},
                showExcerpt:{type:"boolean","default":true},author:{type:"string","default":"Alex Morgan"},showAuthor:{type:"boolean","default":true},
                date:{type:"string","default":"25 Feb 2026"},showDate:{type:"boolean","default":true},readTime:{type:"string","default":"5 min read"},showReadTime:{type:"boolean","default":true},
                linkUrl:{type:"string","default":""},linkText:{type:"string","default":"Read article \u2192"},showLink:{type:"boolean","default":true},
                layout:{type:"string","default":"vertical"},imageSide:{type:"string","default":"left"},
                borderRadius:{type:"number","default":14},padding:{type:"number","default":20},
                fontSize:{type:"number","default":14},titleFontSize:{type:"number","default":19},metaFontSize:{type:"number","default":12},
                bgColor:{type:"string","default":"#ffffff"},cardBg:{type:"string","default":"#ffffff"},borderColor:{type:"string","default":"#e5e7eb"},
                titleColor:{type:"string","default":"#111827"},textColor:{type:"string","default":"#6b7280"},metaColor:{type:"string","default":"#9ca3af"},
                categoryBg:{type:"string","default":"#6366f1"},categoryColor:{type:"string","default":"#ffffff"},linkColor:{type:"string","default":"#6366f1"},
                imagePlaceholderBg:{type:"string","default":"#e5e7eb"},titleFontWeight:{type:"string","default":"700"},bodyFontWeight:{type:"string","default":"400"}
            },
            save: function({ attributes: a }) {
                const blockProps = useBlockProps.save({ className: 'bkbg-pc-wrap', style: { background: a.bgColor } });
                return el('div', blockProps, renderPhotoCardLegacy(a));
            }
        }],
    } );
}() );
