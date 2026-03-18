( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    // ── Typography helpers ──────────────────────────────────────────────────
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

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderCandlestick( a ) {
        const candles = a.candles || [];
        const W  = a.svgWidth;
        const H  = a.svgHeight;
        const PT = a.padTop;
        const PL = a.padLeft;
        const PR = a.padRight;
        const PB = a.padBottom;
        const n  = candles.length;
        if ( ! n ) return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%' } );

        const volumeH  = a.showVolume ? Math.round( ( H - PT - PB ) * 0.22 ) : 0;
        const priceH   = H - PT - PB - volumeH - ( volumeH ? 8 : 0 );
        const chartW   = W - PL - PR;
        const CW       = a.candleWidth;
        const WW       = a.wickWidth;

        const prices   = candles.flatMap( c => [ c.high, c.low ] );
        const minP     = Math.min( ...prices );
        const maxP     = Math.max( ...prices );
        const pRange   = ( maxP - minP ) || 1;
        const pPad     = pRange * 0.05;

        function py( v ) { return PT + priceH - ( ( v - ( minP - pPad ) ) / ( pRange + pPad * 2 ) ) * priceH; }

        const maxVol   = a.showVolume ? Math.max( ...candles.map( c => c.volume || 0 ) ) || 1 : 1;
        const volTop   = PT + priceH + 8;

        const step     = chartW / n;

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Price grid lines
        if ( a.showGrid ) {
            const ticks = 5;
            for ( let t = 0; t <= ticks; t++ ) {
                const gy = PT + ( t / ticks ) * priceH;
                const yV = ( minP - pPad ) + ( 1 - t / ticks ) * ( pRange + pPad * 2 );
                svgEls.push( el( 'line', { key: `gl${ t }`, x1: PL, y1: gy, x2: W - PR, y2: gy, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1 } ) );
                svgEls.push( el( 'text', { key: `gy${ t }`, x: PL - 6, y: gy, textAnchor: 'end', dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize - 1, fontFamily: 'inherit' }, yV.toFixed(1) ) );
            }
        }

        // Candles
        candles.forEach( ( c, i ) => {
            const cx     = PL + i * step + step / 2;
            const bull   = c.close >= c.open;
            const clr    = bull ? ( a.bullColor || '#10b981' ) : ( a.bearColor || '#ef4444' );
            const bodyT  = py( Math.max( c.open, c.close ) );
            const bodyB  = py( Math.min( c.open, c.close ) );
            const bodyH  = Math.max( 1, bodyB - bodyT );

            // Wick
            svgEls.push( el( 'line', { key: `wick${ i }`, x1: cx, y1: py( c.high ), x2: cx, y2: py( c.low ), stroke: clr, strokeWidth: WW } ) );
            // Body
            svgEls.push( el( 'rect', { key: `body${ i }`, x: cx - CW / 2, y: bodyT, width: CW, height: bodyH, fill: bull ? clr : clr, stroke: clr, strokeWidth: 1, fillOpacity: bull ? 1 : 0.85, rx: 1 } ) );

            // Volume bar
            if ( a.showVolume ) {
                const vol  = c.volume || 0;
                const vH   = ( vol / maxVol ) * ( volumeH * 0.9 );
                svgEls.push( el( 'rect', { key: `vol${ i }`, x: cx - CW / 2, y: volTop + ( volumeH * 0.9 ) - vH, width: CW, height: vH, fill: clr, fillOpacity: 0.5, rx: 1 } ) );
            }

            // X label
            svgEls.push( el( 'text', { key: `xl${ i }`, x: cx, y: H - PB + 16, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize - 1, fontFamily: 'inherit', transform: n > 7 ? `rotate(-35,${ cx },${ H - PB + 16 })` : undefined }, c.label ) );
        } );

        // Axes
        svgEls.push( el( 'line', { key: 'xax', x1: PL, y1: PT + priceH, x2: W - PR, y2: PT + priceH, stroke: a.textColor, strokeWidth: 1, strokeOpacity: 0.3 } ) );
        svgEls.push( el( 'line', { key: 'yax', x1: PL, y1: PT, x2: PL, y2: PT + priceH, stroke: a.textColor, strokeWidth: 1, strokeOpacity: 0.3 } ) );

        // Volume axis separator
        if ( a.showVolume ) {
            svgEls.push( el( 'line', { key: 'volax', x1: PL, y1: volTop, x2: W - PR, y2: volTop, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1 } ) );
            svgEls.push( el( 'text', { key: 'voltitle', x: PL - 6, y: volTop + 4, textAnchor: 'end', fill: a.textColor, fontSize: a.labelFontSize - 2, fontFamily: 'inherit' }, 'Vol' ) );
        }

        // Legend
        svgEls.push( el( 'rect', { key: 'bull-lgn', x: PL, y: 4, width: 12, height: 12, fill: a.bullColor || '#10b981', rx: 2 } ) );
        svgEls.push( el( 'text', { key: 'bull-lgt', x: PL + 16, y: 12, dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize - 1, fontFamily: 'inherit' }, __( 'Bullish', 'blockenberg' ) ) );
        svgEls.push( el( 'rect', { key: 'bear-lgn', x: PL + 70, y: 4, width: 12, height: 12, fill: a.bearColor || '#ef4444', rx: 2 } ) );
        svgEls.push( el( 'text', { key: 'bear-lgt', x: PL + 86, y: 12, dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize - 1, fontFamily: 'inherit' }, __( 'Bearish', 'blockenberg' ) ) );

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updCandle( setAttributes, candles, ci, field, val ) {
        setAttributes( { candles: candles.map( ( c, i ) => i === ci ? { ...c, [field]: val } : c ) } );
    }

    registerBlockType( 'blockenberg/candlestick-chart', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-candle-wrap', style: _tv(a.typoTitle, '--bkbg-candle-tt-') } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),  checked: a.showTitle,  onChange: v => setAttributes( { showTitle:  v } ) } ),
                        el( ToggleControl, { label: __( 'Show Grid', 'blockenberg' ),   checked: a.showGrid,   onChange: v => setAttributes( { showGrid:   v } ) } ),
                        el( ToggleControl, { label: __( 'Show Volume Bars', 'blockenberg' ), checked: a.showVolume, onChange: v => setAttributes( { showVolume: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),  value: a.svgWidth,     onChange: v => setAttributes( { svgWidth:     v } ), min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Canvas Height', 'blockenberg' ), value: a.svgHeight,    onChange: v => setAttributes( { svgHeight:    v } ), min: 200, max: 800 } ),
                        el( RangeControl, { label: __( 'Candle Width', 'blockenberg' ),  value: a.candleWidth,  onChange: v => setAttributes( { candleWidth:  v } ), min: 4, max: 40 } ),
                        el( RangeControl, { label: __( 'Wick Width', 'blockenberg' ),    value: a.wickWidth,    onChange: v => setAttributes( { wickWidth:    v } ), min: 1, max: 6 } ),
                        el( RangeControl, { label: __( 'Left Padding', 'blockenberg' ),  value: a.padLeft,      onChange: v => setAttributes( { padLeft:      v } ), min: 30, max: 120 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el( 'p', { style: { margin: '0 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __( 'Title', 'blockenberg' ) ),
                        el( getTypographyControl(), {
                            label: __( 'Title Typography', 'blockenberg' ),
                            value: a.typoTitle,
                            onChange: v => setAttributes( { typoTitle: v } )
                        } ),
                        el( 'hr', {} ),
                        el( RangeControl, { label: __( 'SVG Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 8, max: 18 } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Bullish (up)',  'blockenberg' ), value: a.bullColor,  onChange: v => setAttributes( { bullColor:  v || '#10b981' } ) },
                            { label: __( 'Bearish (down)','blockenberg' ), value: a.bearColor,  onChange: v => setAttributes( { bearColor:  v || '#ef4444' } ) },
                            { label: __( 'Background',    'blockenberg' ), value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Grid',          'blockenberg' ), value: a.gridColor,  onChange: v => setAttributes( { gridColor:  v || '#f3f4f6' } ) },
                            { label: __( 'Title',         'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Text/Axes',     'blockenberg' ), value: a.textColor,  onChange: v => setAttributes( { textColor:  v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Candles', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => {
                            const last = a.candles[ a.candles.length - 1 ] || {};
                            setAttributes( { candles: [ ...a.candles, { label: 'New', open: last.close || 150, high: ( last.close || 150 ) + 5, low: ( last.close || 150 ) - 4, close: ( last.close || 150 ) + 2, volume: 300 } ] } );
                        } }, __( '+ Add Candle', 'blockenberg' ) ),
                        a.candles.map( ( c, ci ) =>
                            el( PanelBody, { key: ci, title: c.label || `Candle ${ ci + 1 }`, initialOpen: false },
                                el( TextControl,  { label: __( 'Label', 'blockenberg' ),  value: c.label,   onChange: v => updCandle( setAttributes, a.candles, ci, 'label',  v ) } ),
                                el( TextControl,  { label: __( 'Open',  'blockenberg' ),  value: String( c.open ),  type: 'number', onChange: v => updCandle( setAttributes, a.candles, ci, 'open',  parseFloat( v ) || 0 ) } ),
                                el( TextControl,  { label: __( 'High',  'blockenberg' ),  value: String( c.high ),  type: 'number', onChange: v => updCandle( setAttributes, a.candles, ci, 'high',  parseFloat( v ) || 0 ) } ),
                                el( TextControl,  { label: __( 'Low',   'blockenberg' ),  value: String( c.low ),   type: 'number', onChange: v => updCandle( setAttributes, a.candles, ci, 'low',   parseFloat( v ) || 0 ) } ),
                                el( TextControl,  { label: __( 'Close', 'blockenberg' ),  value: String( c.close ), type: 'number', onChange: v => updCandle( setAttributes, a.candles, ci, 'close', parseFloat( v ) || 0 ) } ),
                                el( TextControl,  { label: __( 'Volume','blockenberg' ),  value: String( c.volume || 0 ), type: 'number', onChange: v => updCandle( setAttributes, a.candles, ci, 'volume', parseInt( v ) || 0 ) } ),
                                el( Button, { isDestructive: true, isSmall: true, style: { marginTop: 6 }, onClick: () => setAttributes( { candles: a.candles.filter( ( _, x ) => x !== ci ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-candle-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-candle-svg' }, renderCandlestick( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-candle-wrap', style: _tv(a.typoTitle, '--bkbg-candle-tt-') } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-candle-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-candle-svg' }, renderCandlestick( a ) ),
            );
        },
    } );
}() );
