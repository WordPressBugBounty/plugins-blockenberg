(function () {
    var AM5 = [
        'https://cdn.amcharts.com/lib/5/index.js',
        'https://cdn.amcharts.com/lib/5/map.js',
        'https://cdn.amcharts.com/lib/5/geodata/worldLow.js',
        'https://cdn.amcharts.com/lib/5/themes/Animated.js'
    ];

    function loadScriptsSequential(urls, cb) {
        if (!urls.length) { cb(); return; }
        var s = document.createElement('script');
        s.src = urls[0];
        s.onload = function () { loadScriptsSequential(urls.slice(1), cb); };
        s.onerror = function () { loadScriptsSequential(urls.slice(1), cb); };
        document.head.appendChild(s);
    }

    function hexToInt(hex) {
        var v = (hex || '#aaaaaa').replace('#', '');
        if (v.length === 3) v = v[0]+v[0]+v[1]+v[1]+v[2]+v[2];
        return parseInt(v, 16);
    }

    function lerp(a, b, t) {
        return Math.round(a + (b - a) * t);
    }

    function gradientColor(lowHex, highHex, t) {
        var lc = [
            parseInt(lowHex.replace('#','').substr(0,2),16),
            parseInt(lowHex.replace('#','').substr(2,2),16),
            parseInt(lowHex.replace('#','').substr(4,2),16),
        ];
        var hc = [
            parseInt(highHex.replace('#','').substr(0,2),16),
            parseInt(highHex.replace('#','').substr(2,2),16),
            parseInt(highHex.replace('#','').substr(4,2),16),
        ];
        var r = lerp(lc[0],hc[0],t), g = lerp(lc[1],hc[1],t), b = lerp(lc[2],hc[2],t);
        return '#' + ('0'+r.toString(16)).slice(-2) + ('0'+g.toString(16)).slice(-2) + ('0'+b.toString(16)).slice(-2);
    }

    function initMap(holder) {
        var countries, opts;
        try { countries = JSON.parse(holder.getAttribute('data-countries') || '[]'); } catch(e){ return; }
        try { opts     = JSON.parse(holder.getAttribute('data-opts')      || '{}'); } catch(e){ opts={}; }

        var am5     = window.am5;
        var am5map  = window.am5map;
        var am5geo  = window.am5geodata_worldLow;
        var am5themes= window.am5themes_Animated;

        if (!am5 || !am5map || !am5geo) return;

        /* Build lookup */
        var countryMap = {};
        var values = [];
        countries.forEach(function(c){
            countryMap[c.code] = c;
            values.push(c.value || 0);
        });
        var minVal = Math.min.apply(null, values) || 0;
        var maxVal = Math.max.apply(null, values) || 1;

        /* Create root */
        holder.style.minHeight = (opts.mapHeight || 480) + 'px';
        var root = am5.Root.new(holder);
        if (am5themes) root.setThemes([am5themes.new(root)]);

        var chart = root.container.children.push(
            am5map.MapChart.new(root, {
                panX: 'rotateX',
                projection: am5map[opts.projection || 'geoNaturalEarth1'] ? am5map[opts.projection || 'geoNaturalEarth1']() : am5map.geoNaturalEarth1(),
                background: am5.Rectangle.new(root, { fill: am5.color(opts.mapBg || '#f0f4f8') })
            })
        );

        var polygonSeries = chart.series.push(
            am5map.MapPolygonSeries.new(root, {
                geoJSON: am5geo,
            })
        );

        polygonSeries.mapPolygons.template.setAll({
            tooltipText: opts.showTooltips !== false ? '{name}' : '',
            interactive: true,
            fill: am5.color(opts.defaultFill || '#e5e7eb'),
            stroke: am5.color(opts.borderColor || '#fff'),
            strokeWidth: 0.8,
        });

        polygonSeries.mapPolygons.template.states.create('hover', {
            fill: am5.color(opts.hoverFill || '#ede9fe'),
        });

        /* Colour countries by data */
        polygonSeries.events.on('datavalidated', function () {
            polygonSeries.mapPolygons.each(function (polygon) {
                var id = polygon.dataItem && polygon.dataItem.get('id');
                var code = id ? id.replace('AM-','').replace(/^id-/,'').toUpperCase() : '';
                var country = countryMap[code];

                if (country) {
                    var color = opts.defaultFill || '#e5e7eb';
                    if (opts.colorMode === 'custom' && country.color) {
                        color = country.color;
                    } else if (opts.colorMode === 'uniform') {
                        color = opts.highColor || '#5b21b6';
                    } else {
                        /* gradient */
                        var t = maxVal > minVal ? (country.value - minVal) / (maxVal - minVal) : 1;
                        color = gradientColor(opts.lowColor||'#c4b5fd', opts.highColor||'#5b21b6', t);
                    }
                    polygon.set('fill', am5.color(color));

                    if (opts.showTooltips !== false) {
                        var label = (opts.legendTitle || '') + ': ' + country.value;
                        polygon.set('tooltipText', country.name + '\n' + label);
                    }

                    if (country.url) {
                        polygon.events.on('click', function() {
                            window.open(country.url, '_blank');
                        });
                        polygon.set('cursorOverStyle', 'pointer');
                    }
                }
            });
        });

        /* Legend */
        if (opts.showLegend) {
            var legendHolder = holder.parentElement && holder.parentElement.querySelector('.bkbg-wm-legend');
            if (legendHolder) {
                legendHolder.style.display = 'flex';
                var bar = legendHolder.querySelector('.bkbg-wm-legend-bar');
                if (bar) {
                    bar.style.background = 'linear-gradient(to right, '+(opts.lowColor||'#c4b5fd')+', '+(opts.highColor||'#5b21b6')+')';
                }
            }
        }

        holder._am5Root = root;
    }

    function init() {
        var holders = document.querySelectorAll('.bkbg-wm-map-holder[data-countries]');
        if (!holders.length) return;

        loadScriptsSequential(AM5, function () {
            holders.forEach(function (holder) {
                var io = new IntersectionObserver(function(entries, obs){
                    if (entries[0].isIntersecting) {
                        obs.disconnect();
                        initMap(holder);
                    }
                }, { threshold: 0.1 });
                io.observe(holder);
            });
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
