(function () {
    'use strict';

    function getTimeInZone(timezone) {
        if (!timezone || timezone === 'local') {
            var d = new Date();
            return { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() };
        }
        try {
            var parts = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false
            }).formatToParts(new Date());
            var vals = {};
            parts.forEach(function (p) { vals[p.type] = parseInt(p.value, 10); });
            return { h: vals.hour % 24, m: vals.minute, s: vals.second };
        } catch (e) {
            var d2 = new Date();
            return { h: d2.getHours(), m: d2.getMinutes(), s: d2.getSeconds() };
        }
    }

    function getDateInZone(timezone) {
        if (!timezone || timezone === 'local') {
            return new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
        try {
            return new Intl.DateTimeFormat(undefined, {
                timeZone: timezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            }).format(new Date());
        } catch (e) {
            return new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
    }

    function getDigitalInZone(timezone) {
        if (!timezone || timezone === 'local') {
            return new Date().toLocaleTimeString();
        }
        try {
            return new Intl.DateTimeFormat(undefined, { timeZone: timezone, hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date());
        } catch (e) {
            return new Date().toLocaleTimeString();
        }
    }

    function toRad(deg) { return (deg - 90) * Math.PI / 180; }

    var ns = 'http://www.w3.org/2000/svg';

    function createEl(tag, attrs, children) {
        var el = document.createElementNS(ns, tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (k) {
                el.setAttribute(k, attrs[k]);
            });
        }
        if (children) {
            children.forEach(function (c) { if (c) el.appendChild(c); });
        }
        return el;
    }

    function buildClock(opts) {
        var sz   = opts.clockSize || 240;
        var r    = 46;
        var cx   = 50, cy = 50;
        var bw   = opts.clockStyle === 'minimal' ? 2 : opts.clockStyle === 'bold' ? 9 : 4;

        var svg = createEl('svg', {
            viewBox: '0 0 100 100',
            width: sz, height: sz,
            'class': 'bkbg-clk-svg',
            'aria-label': 'Analog clock'
        });

        // Border circle
        svg.appendChild(createEl('circle', { cx: cx, cy: cy, r: 49, fill: opts.clockBorder || '#1e1b4b' }));
        // Face
        svg.appendChild(createEl('circle', { cx: cx, cy: cy, r: 49 - bw, fill: opts.clockFace || '#ffffff' }));

        // Ticks
        if (opts.showTicks !== false) {
            for (var i = 0; i < 60; i++) {
                var isBig = i % 5 === 0;
                var ang = (i * 6 - 90) * Math.PI / 180;
                var innerR = isBig ? r - 7 : r - 4;
                svg.appendChild(createEl('line', {
                    x1: cx + innerR * Math.cos(ang), y1: cy + innerR * Math.sin(ang),
                    x2: cx + r     * Math.cos(ang), y2: cy + r     * Math.sin(ang),
                    stroke: opts.tickColor || '#374151',
                    'stroke-width': isBig ? 1.8 : 0.8,
                    'stroke-linecap': 'round'
                }));
            }
        }

        // Numbers
        if (opts.showNumbers !== false) {
            for (var j = 1; j <= 12; j++) {
                var nAng = (j * 30 - 90) * Math.PI / 180;
                var txt = createEl('text', {
                    x: cx + (r - 14) * Math.cos(nAng),
                    y: cy + (r - 14) * Math.sin(nAng),
                    'text-anchor': 'middle',
                    'dominant-baseline': 'middle',
                    'font-size': 7, 'font-weight': 700,
                    fill: opts.numberColor || '#1e1b4b',
                    'font-family': 'system-ui, sans-serif'
                });
                txt.textContent = j;
                svg.appendChild(txt);
            }
        }

        // Hands (created and stored for updates)
        var hourHand = createEl('line', {
            x1: cx, y1: cy, x2: cx, y2: cy - 28,
            stroke: opts.hourHandColor || '#1e1b4b',
            'stroke-width': 3.5, 'stroke-linecap': 'round'
        });

        var minuteHand = createEl('line', {
            x1: cx, y1: cy, x2: cx, y2: cy - 38,
            stroke: opts.minuteHandColor || '#374151',
            'stroke-width': 2.5, 'stroke-linecap': 'round'
        });

        var secondHand = null, secondTail = null;
        if (opts.showSecondHand !== false) {
            secondHand = createEl('line', {
                x1: cx, y1: cy, x2: cx, y2: cy - 40,
                stroke: opts.secondHandColor || '#ef4444',
                'stroke-width': 1.5, 'stroke-linecap': 'round',
                'class': 'bkbg-clk-second-hand'
            });
            secondTail = createEl('line', {
                x1: cx, y1: cy, x2: cx, y2: cy + 10,
                stroke: opts.secondHandColor || '#ef4444',
                'stroke-width': 1.5, 'stroke-linecap': 'round'
            });
        }

        svg.appendChild(hourHand);
        svg.appendChild(minuteHand);
        if (secondHand) svg.appendChild(secondHand);
        if (secondTail) svg.appendChild(secondTail);

        // Center dot
        svg.appendChild(createEl('circle', { cx: cx, cy: cy, r: 3.5, fill: opts.centerDotColor || '#ef4444' }));
        svg.appendChild(createEl('circle', { cx: cx, cy: cy, r: 1.5, fill: '#fff' }));

        function updateHands(t) {
            var h12    = t.h % 12;
            var hDeg   = h12 * 30 + t.m * 0.5;
            var mDeg   = t.m * 6  + t.s * 0.1;
            var sDeg   = t.s * 6;

            function rotate(hand, angle, len) {
                var rad = toRad(angle);
                hand.setAttribute('x2', cx + len * Math.cos(rad));
                hand.setAttribute('y2', cy + len * Math.sin(rad));
            }

            rotate(hourHand,   hDeg, 28);
            rotate(minuteHand, mDeg, 38);

            if (secondHand) {
                rotate(secondHand, sDeg, 40);
                var tailRad = toRad(sDeg + 180);
                secondTail.setAttribute('x2', cx + 10 * Math.cos(tailRad));
                secondTail.setAttribute('y2', cy + 10 * Math.sin(tailRad));
            }
        }

        return { svg: svg, updateHands: updateHands };
    }

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family:'font-family', weight:'font-weight', style:'font-style',
            decoration:'text-decoration', transform:'text-transform',
            sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
            lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
            letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
            wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
        };
        Object.keys(map).forEach(function(k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) v = v + (typo.sizeUnit || 'px');
                else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) v = v + (typo.lineHeightUnit || '');
                else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) v = v + (typo.letterSpacingUnit || 'px');
                else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) v = v + (typo.wordSpacingUnit || 'px');
                el.style.setProperty(prefix + map[k], String(v));
            }
        });
    }

    function initBlock(root) {
        var optsRaw = root.getAttribute('data-opts');
        var opts;
        try { opts = JSON.parse(optsRaw); } catch (e) { opts = {}; }

        // Apply background
        if (opts.sectionBg) root.style.background = opts.sectionBg;

        // Typography CSS vars
        typoCssVarsForEl(opts.titleTypo, '--bkbg-clk-title-', root);
        typoCssVarsForEl(opts.subtitleTypo, '--bkbg-clk-subtitle-', root);
        if (opts.fontSize && opts.fontSize !== 22) root.style.setProperty('--bkbg-clk-title-sz', opts.fontSize + 'px');
        if (opts.subtitleSize && opts.subtitleSize !== 14) root.style.setProperty('--bkbg-clk-subtitle-sz', opts.subtitleSize + 'px');

        // Apply title styles
        var titleEl = root.querySelector('.bkbg-clk-title');
        if (titleEl) {
            titleEl.style.color      = opts.titleColor || '#1e1b4b';
        }
        var subtitleEl = root.querySelector('.bkbg-clk-subtitle');
        if (subtitleEl) {
            subtitleEl.style.color    = opts.titleColor || '#1e1b4b';
        }

        // Build clock wrap
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-clk-clock-wrap';
        root.appendChild(wrap);

        // Build and insert SVG clock
        var clock = buildClock(opts);
        wrap.appendChild(clock.svg);

        // Date element
        var dateEl = null;
        if (opts.showDate) {
            dateEl = document.createElement('div');
            dateEl.className = 'bkbg-clk-date';
            dateEl.style.color = opts.titleColor || '#1e1b4b';
            wrap.appendChild(dateEl);
        }

        // Digital time element
        var digitalEl = null;
        if (opts.showDigitalTime) {
            digitalEl = document.createElement('div');
            digitalEl.className = 'bkbg-clk-digital';
            digitalEl.style.color = opts.titleColor || '#1e1b4b';
            wrap.appendChild(digitalEl);
        }

        function tick() {
            var t = getTimeInZone(opts.timezone);
            clock.updateHands(t);
            if (dateEl) dateEl.textContent = getDateInZone(opts.timezone);
            if (digitalEl) digitalEl.textContent = getDigitalInZone(opts.timezone);
        }

        tick(); // initial render
        setInterval(tick, 1000);
    }

    document.querySelectorAll('.bkbg-clk-app').forEach(function (root) {
        initBlock(root);
    });
})();
