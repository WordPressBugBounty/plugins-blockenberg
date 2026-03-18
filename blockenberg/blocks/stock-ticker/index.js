( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var ToggleControl = wp.components.ToggleControl;
    var SelectControl = wp.components.SelectControl;
    var RangeControl = wp.components.RangeControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var LAYOUTS = [
        { label: 'Scrolling Ticker', value: 'ticker' },
        { label: 'Cards Grid',       value: 'cards' },
        { label: 'Table',            value: 'table' }
    ];

    var CURRENCIES = [
        { label: 'USD ($)',  value: 'usd'  },
        { label: 'EUR (€)',  value: 'eur'  },
        { label: 'GBP (£)',  value: 'gbp'  },
        { label: 'JPY (¥)',  value: 'jpy'  },
        { label: 'BTC (₿)', value: 'btc'  },
        { label: 'ETH (Ξ)', value: 'eth'  }
    ];

    var DUMMY_COINS = [
        { id: 'bitcoin',  symbol: 'BTC', name: 'Bitcoin',  price: 67245.32,  change: 2.34,  mcap: '1.33T',  vol: '38.2B',  icon: '₿' },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 3512.18,   change: -1.22, mcap: '422.1B', vol: '18.5B',  icon: 'Ξ' },
        { id: 'solana',   symbol: 'SOL', name: 'Solana',   price: 178.44,    change: 5.61,  mcap: '82.3B',  vol: '4.1B',   icon: '◎' },
        { id: 'cardano',  symbol: 'ADA', name: 'Cardano',  price: 0.4823,    change: -0.88, mcap: '17.1B',  vol: '520M',   icon: '₳' },
        { id: 'dogecoin', symbol: 'DOGE',name: 'Dogecoin', price: 0.1624,    change: 3.14,  mcap: '23.5B',  vol: '1.2B',   icon: 'Ð' },
        { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', price: 8.24,      change: -2.07, mcap: '12.9B',  vol: '350M',   icon: '●' }
    ];

    function formatPrice(p, sym) {
        if (p >= 1000) return sym + p.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        if (p >= 1) return sym + p.toFixed(2);
        return sym + p.toFixed(4);
    }

    function TickerPreview(props) {
        var attr = props.attr;
        var sym  = attr.currencySymbol || '$';

        if (attr.layout === 'ticker') {
            return el('div', {
                style: {
                    backgroundColor: attr.bgColor,
                    borderRadius: attr.borderRadius + 'px',
                    overflow: 'hidden',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center'
                }
            },
                attr.showLabel && el('div', {
                    style: {
                        background: attr.accentColor, color: '#fff',
                        padding: '8px 14px', fontSize: '11px', fontWeight: 700,
                        letterSpacing: '0.1em', flexShrink: 0,
                        whiteSpace: 'nowrap'
                    }
                }, '● ' + (attr.labelText || 'LIVE')),
                el('div', {
                    style: {
                        display: 'flex', gap: '32px', padding: '10px 24px',
                        overflow: 'hidden', whiteSpace: 'nowrap',
                        fontSize: attr.fontSize + 'px', fontWeight: attr.fontWeight,
                        color: attr.textColor
                    }
                },
                    DUMMY_COINS.slice(0, 6).map(function (c) {
                        return el('span', { key: c.id, style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } },
                            attr.showIcons && el('span', { style: { color: attr.accentColor } }, c.icon),
                            attr.showSymbol && el('span', { style: { fontWeight: 700 } }, c.symbol),
                            el('span', {}, formatPrice(c.price, sym)),
                            attr.showChange && el('span', {
                                style: { color: c.change >= 0 ? attr.upColor : attr.downColor, fontSize: '12px' }
                            }, (c.change >= 0 ? '+' : '') + c.change.toFixed(2) + '%')
                        );
                    })
                )
            );
        }

        if (attr.layout === 'cards') {
            return el('div', {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(' + Math.min(attr.cardColumns, 4) + ', 1fr)',
                    gap: '12px'
                }
            },
                DUMMY_COINS.slice(0, attr.cardColumns * 2).map(function (c) {
                    return el('div', {
                        key: c.id,
                        style: {
                            backgroundColor: attr.cardBg,
                            borderRadius: attr.borderRadius + 'px',
                            padding: '16px',
                            border: '1px solid ' + attr.borderColor
                        }
                    },
                        el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' } },
                            attr.showIcons && el('span', { style: { fontSize: '20px', color: attr.accentColor } }, c.icon),
                            el('div', {},
                                el('div', { style: { fontWeight: 700, color: attr.textColor, fontSize: attr.fontSize + 'px' } }, c.name),
                                attr.showSymbol && el('div', { style: { fontSize: '11px', color: attr.textColor, opacity: 0.5 } }, c.symbol)
                            )
                        ),
                        el('div', { style: { fontSize: (attr.fontSize + 2) + 'px', fontWeight: 700, color: attr.textColor } }, formatPrice(c.price, sym)),
                        attr.showChange && el('div', {
                            style: { color: c.change >= 0 ? attr.upColor : attr.downColor, fontSize: '13px', marginTop: '4px' }
                        }, (c.change >= 0 ? '▲ +' : '▼ ') + c.change.toFixed(2) + '%')
                    );
                })
            );
        }

        // Table
        return el('table', {
            style: {
                width: '100%', borderCollapse: 'collapse',
                backgroundColor: attr.bgColor, borderRadius: attr.borderRadius + 'px',
                overflow: 'hidden', fontSize: attr.fontSize + 'px', color: attr.textColor
            }
        },
            el('thead', {},
                el('tr', { style: { borderBottom: '1px solid ' + attr.borderColor, opacity: 0.7 } },
                    el('th', { style: { padding: '10px 14px', textAlign: 'left', fontWeight: 600 } }, 'Asset'),
                    el('th', { style: { padding: '10px 14px', textAlign: 'right', fontWeight: 600 } }, 'Price'),
                    attr.showChange && el('th', { style: { padding: '10px 14px', textAlign: 'right', fontWeight: 600 } }, '24h'),
                    attr.showMarketCap && el('th', { style: { padding: '10px 14px', textAlign: 'right', fontWeight: 600 } }, 'Mkt Cap'),
                    attr.showVolume && el('th', { style: { padding: '10px 14px', textAlign: 'right', fontWeight: 600 } }, 'Volume')
                )
            ),
            el('tbody', {},
                DUMMY_COINS.map(function (c, i) {
                    return el('tr', {
                        key: c.id,
                        style: { borderBottom: '1px solid ' + attr.borderColor, backgroundColor: i % 2 ? 'rgba(255,255,255,0.02)' : '' }
                    },
                        el('td', { style: { padding: '10px 14px' } },
                            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                                attr.showIcons && el('span', { style: { color: attr.accentColor } }, c.icon),
                                el('strong', {}, c.name),
                                attr.showSymbol && el('span', { style: { opacity: 0.5, fontSize: '12px' } }, c.symbol)
                            )
                        ),
                        el('td', { style: { padding: '10px 14px', textAlign: 'right', fontWeight: 700 } }, formatPrice(c.price, sym)),
                        attr.showChange && el('td', {
                            style: { padding: '10px 14px', textAlign: 'right', color: c.change >= 0 ? attr.upColor : attr.downColor }
                        }, (c.change >= 0 ? '▲ +' : '▼ ') + c.change.toFixed(2) + '%'),
                        attr.showMarketCap && el('td', { style: { padding: '10px 14px', textAlign: 'right', opacity: 0.7 } }, c.mcap),
                        attr.showVolume && el('td', { style: { padding: '10px 14px', textAlign: 'right', opacity: 0.7 } }, c.vol)
                    );
                })
            )
        );
    }

    wp.blocks.registerBlockType('blockenberg/stock-ticker', {
        title: 'Crypto Price Ticker',
        icon: 'chart-line',
        category: 'bkbg-effects',
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps((function() {
                var _tvf = getTypoCssVars();
                var s = { fontFamily: 'inherit' };
                if (_tvf) {
                    Object.assign(s, _tvf(attr.textTypo, '--bkstk-tx-'));
                }
                s['--bkstk-tx-fw'] = attr.fontWeight || 600;
                s['--bkstk-tx-lh'] = attr.lineHeight || 1.4;
                return { style: s };
            })());

            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Coins & Currency', 'blockenberg'), initialOpen: true },
                        el(TextControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Coin IDs (CoinGecko, comma-separated)', 'blockenberg'),
                            help: __('e.g. bitcoin,ethereum,solana,dogecoin', 'blockenberg'),
                            value: attr.coins,
                            onChange: function (v) { setAttr({ coins: v }); }
                        }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: __('Currency', 'blockenberg'), value: attr.currency, options: CURRENCIES, onChange: function (v) { setAttr({ currency: v }); } }),
                        el(TextControl, { __nextHasNoMarginBottom: true, label: __('Currency Symbol', 'blockenberg'), value: attr.currencySymbol, onChange: function (v) { setAttr({ currencySymbol: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Refresh Interval (seconds)', 'blockenberg'), value: attr.refreshInterval, min: 10, max: 3600, step: 10, onChange: function (v) { setAttr({ refreshInterval: v }); } })
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: __('Display Layout', 'blockenberg'), value: attr.layout, options: LAYOUTS, onChange: function (v) { setAttr({ layout: v }); } }),
                        attr.layout === 'ticker' && el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Scroll Speed (seconds/loop)', 'blockenberg'), value: attr.tickerSpeed, min: 10, max: 120, onChange: function (v) { setAttr({ tickerSpeed: v }); } }),
                        attr.layout === 'ticker' && el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Pause on Hover', 'blockenberg'), checked: attr.pauseOnHover, onChange: function (v) { setAttr({ pauseOnHover: v }); } }),
                        attr.layout === 'cards' && el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Card Columns', 'blockenberg'), value: attr.cardColumns, min: 1, max: 6, onChange: function (v) { setAttr({ cardColumns: v }); } })
                    ),
                    el(PanelBody, { title: __('Data Fields', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show 24h Price Change', 'blockenberg'), checked: attr.showChange, onChange: function (v) { setAttr({ showChange: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Volume', 'blockenberg'), checked: attr.showVolume, onChange: function (v) { setAttr({ showVolume: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Market Cap', 'blockenberg'), checked: attr.showMarketCap, onChange: function (v) { setAttr({ showMarketCap: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Coin Icons', 'blockenberg'), checked: attr.showIcons, onChange: function (v) { setAttr({ showIcons: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Ticker Symbol', 'blockenberg'), checked: attr.showSymbol, onChange: function (v) { setAttr({ showSymbol: v }); } })
                    ),
                    el(PanelBody, { title: __('Label', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show LIVE Label', 'blockenberg'), checked: attr.showLabel, onChange: function (v) { setAttr({ showLabel: v }); } }),
                        attr.showLabel && el(TextControl, { __nextHasNoMarginBottom: true, label: __('Label Text', 'blockenberg'), value: attr.labelText, onChange: function (v) { setAttr({ labelText: v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl() && getTypoControl()({ label: __('Text', 'blockenberg'), value: attr.textTypo, onChange: function (v) { setAttr({ textTypo: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Border Radius (px)', 'blockenberg'), value: attr.borderRadius, min: 0, max: 30, onChange: function (v) { setAttr({ borderRadius: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background',     'blockenberg'), value: attr.bgColor,     onChange: function (v) { setAttr({ bgColor: v || '' }); } },
                            { label: __('Card Background','blockenberg'), value: attr.cardBg,       onChange: function (v) { setAttr({ cardBg: v || '' }); } },
                            { label: __('Text Color',     'blockenberg'), value: attr.textColor,    onChange: function (v) { setAttr({ textColor: v || '' }); } },
                            { label: __('Accent / Label', 'blockenberg'), value: attr.accentColor, onChange: function (v) { setAttr({ accentColor: v || '' }); } },
                            { label: __('Price Up (▲)',  'blockenberg'), value: attr.upColor,       onChange: function (v) { setAttr({ upColor: v || '' }); } },
                            { label: __('Price Down (▼)','blockenberg'), value: attr.downColor,     onChange: function (v) { setAttr({ downColor: v || '' }); } },
                            { label: __('Border Color',  'blockenberg'), value: attr.borderColor,   onChange: function (v) { setAttr({ borderColor: v || '' }); } }
                        ]
                    })
                ),
                el('p', {
                    style: {
                        background: '#fff3cd', color: '#856404', padding: '8px 12px',
                        borderRadius: '6px', fontSize: '12px', marginBottom: '12px'
                    }
                }, '⚠️ Editor shows dummy data. Live prices load on the front end via the CoinGecko API.'),
                el(TickerPreview, { attr: attr })
            );
        },
        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-st-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
