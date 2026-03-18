document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.bkbg-ww-app').forEach(function (root) {
        var opts = JSON.parse(root.dataset.opts || '{}');
        new WeatherWidget(root, opts);
    });
});

function WeatherWidget(root, opts) {
    var self      = this;
    self.root     = root;
    self.opts     = opts;
    self.apiKey   = opts.apiKey   || '';
    self.city     = opts.city     || 'London';
    self.units    = opts.units    || 'metric';
    self.lang     = opts.lang     || 'en';
    self.refreshMs = (opts.refreshInterval || 0) * 60 * 1000;
    self.timer    = null;
    self.lat      = null;
    self.lon      = null;
    self.current  = null;

    if (!self.apiKey) {
        root.innerHTML = '<div class="bkbg-ww-loading">⚠️ No OpenWeatherMap API key set. Add it in the block settings.</div>';
        return;
    }

    if (opts.autoLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (pos) {
                self.lat = pos.coords.latitude;
                self.lon = pos.coords.longitude;
                self.fetchWeather();
            },
            function () { self.fetchWeather(); }
        );
    } else {
        self.fetchWeather();
    }
}

WeatherWidget.prototype.fetchWeather = function () {
    var self = this;
    var base = 'https://api.openweathermap.org/data/2.5/';
    var unitStr = '&units=' + self.units + '&lang=' + self.lang;
    var locStr = self.lat ? ('lat=' + self.lat + '&lon=' + self.lon) : ('q=' + encodeURIComponent(self.city));
    var currentUrl  = base + 'weather?' + locStr + unitStr + '&appid=' + self.apiKey;
    var forecastUrl = base + 'forecast?' + locStr + unitStr + '&cnt=40&appid=' + self.apiKey;

    self.root.innerHTML = '<div class="bkbg-ww-loading">🌐 Loading weather…</div>';

    Promise.all([
        fetch(currentUrl).then(function (r) { return r.json(); }),
        self.opts.showForecast ? fetch(forecastUrl).then(function (r) { return r.json(); }) : Promise.resolve(null)
    ]).then(function (data) {
        var current  = data[0];
        var forecast = data[1];
        if (current.cod && current.cod !== 200) {
            self.root.innerHTML = '<div class="bkbg-ww-error">❌ ' + (current.message || 'API error') + '</div>';
            return;
        }
        self.current = current;
        self.render(current, forecast);
        if (self.refreshMs > 0) {
            clearInterval(self.timer);
            self.timer = setInterval(function () { self.fetchWeather(); }, self.refreshMs);
        }
    }).catch(function (err) {
        self.root.innerHTML = '<div class="bkbg-ww-error">❌ Failed to load weather data. Check your API key and city name.</div>';
    });
};

WeatherWidget.prototype.render = function (current, forecast) {
    var self = this;
    var opts  = self.opts;
    var a     = opts;

    var deg = a.units === 'imperial' ? '°F' : a.units === 'standard' ? 'K' : '°C';
    var temp       = Math.round(current.main.temp);
    var feelsLike  = Math.round(current.main.feels_like);
    var tempMax    = Math.round(current.main.temp_max);
    var tempMin    = Math.round(current.main.temp_min);
    var humidity   = current.main.humidity;
    var windSpeed  = Math.round(current.wind.speed * (a.units === 'metric' ? 3.6 : 1));
    var windUnit   = a.units === 'metric' ? 'km/h' : a.units === 'imperial' ? 'mph' : 'm/s';
    var pressure   = current.main.pressure;
    var visibility = current.visibility ? Math.round(current.visibility / 1000) + ' km' : '--';
    var condition  = current.weather[0].description;
    var iconCode   = current.weather[0].icon;
    var cityName   = current.name + (current.sys && current.sys.country ? ', ' + current.sys.country : '');
    var isNight    = iconCode.endsWith('n');

    /* determine bg class */
    var mainId = current.weather[0].id;
    var bgClass;
    if (a.backgroundStyle === 'custom') {
        bgClass = 'bkbg-ww-bg-custom';
    } else if (a.backgroundStyle === 'transparent') {
        bgClass = '';
    } else {
        if (isNight) bgClass = 'bkbg-ww-bg-night';
        else if (mainId >= 200 && mainId < 300) bgClass = 'bkbg-ww-bg-thunderstorm';
        else if (mainId >= 300 && mainId < 600) bgClass = 'bkbg-ww-bg-rain';
        else if (mainId >= 600 && mainId < 700) bgClass = 'bkbg-ww-bg-snow';
        else if (mainId >= 700 && mainId < 800) bgClass = 'bkbg-ww-bg-mist';
        else if (mainId === 800) bgClass = 'bkbg-ww-bg-clear';
        else bgClass = 'bkbg-ww-bg-clouds';
    }

    var weatherEmoji = iconToEmoji(iconCode);

    /* CSS vars */
    var wrapStyle = 'color:' + a.textColor + ';padding:' + a.padding + 'px;border-radius:' + a.borderRadius + 'px;';
    if (a.backgroundStyle === 'custom') wrapStyle += '--ww-bg:' + a.customBg + ';';
    if (a.layout === 'card') wrapStyle += 'max-width:' + a.maxWidth + 'px;margin:0 auto;';

    var cardStyle = 'background:' + a.cardBg + ';backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-radius:' + a.cardRadius + 'px;padding:24px;border:1px solid rgba(255,255,255,0.2);';

    /* forecast daily groups (pick one item per day ~noon) */
    var forecastHTML = '';
    if (a.showForecast && forecast && forecast.list) {
        var days = [];
        var seen = {};
        forecast.list.forEach(function (item) {
            var d = new Date(item.dt * 1000);
            var dayKey = d.toLocaleDateString('en', { weekday: 'short' });
            var dayDate = d.toDateString();
            if (!seen[dayDate] && days.length < a.forecastDays) {
                seen[dayDate] = true;
                days.push({
                    day: dayKey,
                    emoji: iconToEmoji(item.weather[0].icon),
                    hi: Math.round(item.main.temp_max),
                    lo: Math.round(item.main.temp_min),
                });
            }
        });
        var fcDays = days.map(function (f) {
            return '<div class="bkbg-ww-fc-day" style="background:' + a.forecastBg + ';border-radius:' + a.cardRadius + 'px;">' +
                '<div class="bkbg-ww-fc-name">' + f.day + '</div>' +
                '<div class="bkbg-ww-fc-icon">' + f.emoji + '</div>' +
                '<div class="bkbg-ww-fc-hi">' + f.hi + deg + '</div>' +
                '<div class="bkbg-ww-fc-lo">' + f.lo + deg + '</div>' +
                '</div>';
        }).join('');
        forecastHTML = '<div class="bkbg-ww-forecast-label">5-Day Forecast</div>' +
            '<div class="bkbg-ww-forecast">' + fcDays + '</div>';
    }

    var statsHTML = '';
    if (a.showHumidity || a.showWind || a.showPressure || a.showVisibility) {
        var stats = [];
        if (a.showHumidity)   stats.push({ icon: '💧', val: humidity + '%',       lbl: 'Humidity' });
        if (a.showWind)       stats.push({ icon: '💨', val: windSpeed + ' ' + windUnit, lbl: 'Wind' });
        if (a.showPressure)   stats.push({ icon: '🌡', val: pressure + ' hPa',    lbl: 'Pressure' });
        if (a.showVisibility) stats.push({ icon: '👁', val: visibility,            lbl: 'Visibility' });
        statsHTML = '<div class="bkbg-ww-stats" style="margin-bottom:' + (a.showForecast ? '24' : '0') + 'px;">' +
            stats.map(function (s) {
                return '<div class="bkbg-ww-stat">' +
                    '<div class="bkbg-ww-stat-icon">' + s.icon + '</div>' +
                    '<div class="bkbg-ww-stat-val">' + s.val + '</div>' +
                    '<div class="bkbg-ww-stat-lbl">' + s.lbl + '</div>' +
                    '</div>';
            }).join('') + '</div>';
    }

    var feelsLikeHTML = a.showFeelsLike
        ? '<div class="bkbg-ww-feelslike">Feels like ' + feelsLike + deg + '&nbsp;&nbsp;·&nbsp;&nbsp;H: ' + tempMax + deg + '&nbsp;&nbsp;L: ' + tempMin + deg + '</div>'
        : '';

    var refreshBtn = '<button class="bkbg-ww-refresh-btn" data-ww-refresh>↻ Refresh</button>';

    var html = '<div class="bkbg-ww-wrap bkbg-ww-' + a.layout + ' ' + bgClass + '" style="' + wrapStyle + '">' +
        '<div class="bkbg-ww-card-inner" style="' + cardStyle + '">' +
        '<div class="bkbg-ww-top">' +
        '<div>' +
        '<div class="bkbg-ww-city-label">📍 ' + cityName + '</div>' +
        '<div class="bkbg-ww-temp">' + temp + deg + '</div>' +
        '<div class="bkbg-ww-condition">' + condition + '</div>' +
        '</div>' +
        (a.showAnimatedIcon ? '<div class="bkbg-ww-icon-lg">' + weatherEmoji + '</div>' : '') +
        '</div>' +
        feelsLikeHTML +
        statsHTML +
        forecastHTML +
        '<div style="text-align:right;margin-top:12px;">' + refreshBtn + '</div>' +
        '</div>' +
        '</div>';

    self.root.innerHTML = html;
    self.root.querySelector('[data-ww-refresh]').addEventListener('click', function () {
        self.fetchWeather();
    });
};

function iconToEmoji(code) {
    if (!code) return '🌤';
    var c = String(code);
    if (c.startsWith('01d')) return '☀️';
    if (c.startsWith('01n')) return '🌙';
    if (c.startsWith('02')) return '⛅';
    if (c.startsWith('03') || c.startsWith('04')) return '☁️';
    if (c.startsWith('09') || c.startsWith('10')) return '🌧';
    if (c.startsWith('11')) return '⛈';
    if (c.startsWith('13')) return '❄️';
    if (c.startsWith('50')) return '🌫';
    return '🌤';
}
