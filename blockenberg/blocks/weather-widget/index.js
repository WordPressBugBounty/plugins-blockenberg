( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
    var __                 = wp.i18n.__;
    var registerBlockType  = wp.blocks.registerBlockType;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody          = wp.components.PanelBody;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'tempTypo', attrs, '--bkww-tp-');
        _tvf(v, 'cityTypo', attrs, '--bkww-ct-');
        _tvf(v, 'metaTypo', attrs, '--bkww-mt-');
        return v;
    }

    var UNITS = [
        { label: 'Celsius (°C)',    value: 'metric' },
        { label: 'Fahrenheit (°F)', value: 'imperial' },
        { label: 'Kelvin (K)',      value: 'standard' },
    ];

    var LAYOUTS = [
        { label: 'Card (centered)',  value: 'card' },
        { label: 'Wide (full-width)', value: 'wide' },
        { label: 'Minimal (compact)', value: 'minimal' },
    ];

    var BG_STYLES = [
        { label: 'Gradient (auto by weather)', value: 'gradient' },
        { label: 'Custom color',               value: 'custom' },
        { label: 'Transparent',                value: 'transparent' },
    ];

    var LANGS = [
        { label: 'English',  value: 'en' },
        { label: 'Russian',  value: 'ru' },
        { label: 'German',   value: 'de' },
        { label: 'French',   value: 'fr' },
        { label: 'Spanish',  value: 'es' },
        { label: 'Japanese', value: 'ja' },
    ];

    /* weather icon emoji map for editor preview */
    function weatherIcon(code) {
        if (!code) return '🌤';
        var c = String(code);
        if (c.startsWith('01')) return '☀️';
        if (c.startsWith('02')) return '⛅';
        if (c.startsWith('03') || c.startsWith('04')) return '☁️';
        if (c.startsWith('09') || c.startsWith('10')) return '🌧';
        if (c.startsWith('11')) return '⛈';
        if (c.startsWith('13')) return '❄️';
        if (c.startsWith('50')) return '🌫';
        return '🌤';
    }

    function unitLabel(units) {
        if (units === 'imperial') return '°F';
        if (units === 'standard') return 'K';
        return '°C';
    }

    /* demo forecast data for editor preview */
    var DEMO_FORECAST = [
        { day: 'Mon', icon: '☀️', hi: 22, lo: 14 },
        { day: 'Tue', icon: '⛅', hi: 19, lo: 12 },
        { day: 'Wed', icon: '🌧', hi: 15, lo: 10 },
        { day: 'Thu', icon: '☁️', hi: 17, lo: 11 },
        { day: 'Fri', icon: '☀️', hi: 24, lo: 16 },
    ];

    function WeatherPreview(props) {
        var a = props.attributes;
        var deg = unitLabel(a.units);
        var wrapStyle = {
            background: a.backgroundStyle === 'gradient'
                ? 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #0f172a 100%)'
                : a.backgroundStyle === 'custom' ? a.customBg : 'transparent',
            borderRadius: a.borderRadius + 'px',
            padding: a.padding + 'px',
            maxWidth: a.layout === 'card' ? a.maxWidth + 'px' : '100%',
            margin: a.layout === 'card' ? '0 auto' : '0',
            color: a.textColor,
            fontFamily: 'inherit',
        };
        var cardStyle = {
            background: a.cardBg,
            backdropFilter: 'blur(16px)',
            borderRadius: a.cardRadius + 'px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.2)',
        };

        return el('div', { style: wrapStyle },
            el('div', { style: cardStyle },
                /* top row: city + icon */
                el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' } },
                    el('div', null,
                        el('div', { className: 'bkbg-ww-city-label', style: { opacity: 0.75, marginBottom: '4px' } },
                            '📍 ' + (a.city || 'Your City')),
                        el('div', { className: 'bkbg-ww-temp' }, '22' + deg),
                        el('div', { style: { fontSize: '15px', opacity: 0.85, marginTop: '4px' } }, 'Partly Cloudy'),
                    ),
                    el('div', { style: { fontSize: '72px', lineHeight: 1 } }, '⛅')
                ),
                /* feels like / hi-lo */
                a.showFeelsLike && el('div', { style: { fontSize: '13px', opacity: 0.7, marginBottom: '16px' } },
                    'Feels like 20' + deg + '  ·  H: 25' + deg + '  L: 14' + deg),
                /* stats row */
                el('div', { style: { display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: a.showForecast ? '24px' : '0' } },
                    a.showHumidity && el('div', { style: { background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', flex: '1', minWidth: '80px', textAlign: 'center' } },
                        el('div', { style: { fontSize: '18px' } }, '💧'),
                        el('div', { style: { fontSize: '14px', fontWeight: 600 } }, '68%'),
                        el('div', { className: 'bkbg-ww-stat-lbl', style: { opacity: 0.7 } }, 'Humidity'),
                    ),
                    a.showWind && el('div', { style: { background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', flex: '1', minWidth: '80px', textAlign: 'center' } },
                        el('div', { style: { fontSize: '18px' } }, '💨'),
                        el('div', { style: { fontSize: '14px', fontWeight: 600 } }, '14 km/h'),
                        el('div', { className: 'bkbg-ww-stat-lbl', style: { opacity: 0.7 } }, 'Wind'),
                    ),
                    a.showPressure && el('div', { style: { background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', flex: '1', minWidth: '80px', textAlign: 'center' } },
                        el('div', { style: { fontSize: '18px' } }, '🌡'),
                        el('div', { style: { fontSize: '14px', fontWeight: 600 } }, '1013 hPa'),
                        el('div', { className: 'bkbg-ww-stat-lbl', style: { opacity: 0.7 } }, 'Pressure'),
                    ),
                ),
                /* forecast */
                a.showForecast && el('div', null,
                    el('div', { style: { fontSize: '12px', fontWeight: 600, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' } }, '5-Day Forecast'),
                    el('div', { style: { display: 'flex', gap: '8px' } },
                        DEMO_FORECAST.slice(0, a.forecastDays).map(function (f) {
                            return el('div', {
                                key: f.day,
                                style: { background: a.forecastBg, borderRadius: '10px', padding: '10px 8px', flex: 1, textAlign: 'center' },
                            },
                                el('div', { style: { fontSize: '11px', opacity: 0.7, marginBottom: '4px' } }, f.day),
                                el('div', { style: { fontSize: '20px', marginBottom: '4px' } }, f.icon),
                                el('div', { style: { fontSize: '12px', fontWeight: 600 } }, f.hi + deg),
                                el('div', { style: { fontSize: '11px', opacity: 0.6 } }, f.lo + deg),
                            );
                        })
                    )
                )
            ),
            !a.apiKey && el('div', { style: { marginTop: '10px', padding: '8px 12px', background: 'rgba(255,165,0,0.2)', borderRadius: '8px', fontSize: '12px', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)' } },
                '⚠️ Add your OpenWeatherMap API key in the block settings to fetch live data.')
        );
    }

    registerBlockType('blockenberg/weather-widget', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            return el(Fragment, null,
                el(InspectorControls, null,
                    /* API */
                    el(PanelBody, { title: 'API & Location', initialOpen: true },
                        el(TextControl, { __nextHasNoMarginBottom: true, label: 'OpenWeatherMap API Key', value: a.apiKey, onChange: function (v) { set({ apiKey: v }); }, help: 'Free key from openweathermap.org' }),
                        el(TextControl, { __nextHasNoMarginBottom: true, label: 'Default City', value: a.city, onChange: function (v) { set({ city: v }); }, help: 'e.g. London, New York, Tokyo' }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Auto-detect visitor location (Geolocation)', checked: a.autoLocation, onChange: function (v) { set({ autoLocation: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Units', value: a.units, options: UNITS, onChange: function (v) { set({ units: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Language', value: a.lang, options: LANGS, onChange: function (v) { set({ lang: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Auto-refresh interval (minutes)', value: a.refreshInterval, min: 0, max: 60, step: 5, onChange: function (v) { set({ refreshInterval: v }); }, help: '0 = no refresh' }),
                    ),
                    /* Display */
                    el(PanelBody, { title: 'Display Options', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show feels-like temperature', checked: a.showFeelsLike, onChange: function (v) { set({ showFeelsLike: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show humidity', checked: a.showHumidity, onChange: function (v) { set({ showHumidity: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show wind speed', checked: a.showWind, onChange: function (v) { set({ showWind: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show pressure', checked: a.showPressure, onChange: function (v) { set({ showPressure: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show visibility', checked: a.showVisibility, onChange: function (v) { set({ showVisibility: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show animated weather icon', checked: a.showAnimatedIcon, onChange: function (v) { set({ showAnimatedIcon: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show 5-day forecast', checked: a.showForecast, onChange: function (v) { set({ showForecast: v }); } }),
                        a.showForecast && el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Forecast days', value: a.forecastDays, min: 2, max: 5, onChange: function (v) { set({ forecastDays: v }); } }),
                    ),
                    /* Layout */
                    el(PanelBody, { title: 'Layout', initialOpen: false },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Layout', value: a.layout, options: LAYOUTS, onChange: function (v) { set({ layout: v }); } }),
                        a.layout === 'card' && el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Max width (px)', value: a.maxWidth, min: 280, max: 800, step: 10, onChange: function (v) { set({ maxWidth: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Padding (px)', value: a.padding, min: 8, max: 64, onChange: function (v) { set({ padding: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Outer radius (px)', value: a.borderRadius, min: 0, max: 48, onChange: function (v) { set({ borderRadius: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Card radius (px)', value: a.cardRadius, min: 0, max: 32, onChange: function (v) { set({ cardRadius: v }); } }),
                    ),
                    /* Typography */
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl( __( 'Temperature', 'blockenberg' ), 'tempTypo', a, set ),
                        getTypoControl( __( 'City Label', 'blockenberg' ),  'cityTypo', a, set ),
                        getTypoControl( __( 'Stat Labels', 'blockenberg' ), 'metaTypo', a, set ),
                    ),
                    /* Colors */
                    el(PanelBody, { title: 'Background', initialOpen: false },
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Background style', value: a.backgroundStyle, options: BG_STYLES, onChange: function (v) { set({ backgroundStyle: v }); } }),
                        a.backgroundStyle === 'custom' && el('div', { style: { marginTop: '8px' } },
                            el('label', { style: { display: 'block', fontSize: '12px', marginBottom: '4px' } }, 'Background color'),
                            el('input', { type: 'color', value: a.customBg, onChange: function (e) { set({ customBg: e.target.value }); }, style: { width: '100%', height: '36px', border: 'none', borderRadius: '4px', cursor: 'pointer' } })
                        ),
                    ),
                    el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { value: a.textColor, onChange: function (v) { set({ textColor: v || '#ffffff' }); }, label: 'Text color' },
                            { value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#60a5fa' }); }, label: 'Accent color' },
                            { value: a.cardBg, onChange: function (v) { set({ cardBg: v || 'rgba(255,255,255,0.12)' }); }, label: 'Card background' },
                            { value: a.forecastBg, onChange: function (v) { set({ forecastBg: v || 'rgba(255,255,255,0.08)' }); }, label: 'Forecast day background' },
                        ],
                    }),
                ),
                el('div', useBlockProps({ style: getTypoCssVars(a) }),
                    el(WeatherPreview, { attributes: a })
                )
            );
        },
        save: function (props) {
            var a = props.attributes;
            return el('div', useBlockProps.save({ style: getTypoCssVars(a) }),
                el('div', { className: 'bkbg-ww-app', 'data-opts': JSON.stringify(a) })
            );
        },
    });
}() );
