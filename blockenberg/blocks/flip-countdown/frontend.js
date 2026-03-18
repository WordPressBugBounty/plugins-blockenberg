(function () {
    'use strict';

    /* ── Typography CSS-var helper ──────────────────────────────── */
    var defined = function (v) { return v !== undefined && v !== null && v !== ''; };
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = {
            family:              'font-family',
            weight:              'font-weight',
            style:               'font-style',
            decoration:          'text-decoration',
            transform:           'text-transform',
            sizeDesktop:         'font-size-d',
            sizeTablet:          'font-size-t',
            sizeMobile:          'font-size-m',
            lineHeightDesktop:   'line-height-d',
            lineHeightTablet:    'line-height-t',
            lineHeightMobile:    'line-height-m',
            letterSpacingDesktop:'letter-spacing-d',
            letterSpacingTablet: 'letter-spacing-t',
            letterSpacingMobile: 'letter-spacing-m',
            wordSpacingDesktop:  'word-spacing-d',
            wordSpacingTablet:   'word-spacing-t',
            wordSpacingMobile:   'word-spacing-m'
        };
        var needsPx = { sizeDesktop:1,sizeTablet:1,sizeMobile:1,letterSpacingDesktop:1,letterSpacingTablet:1,letterSpacingMobile:1,wordSpacingDesktop:1,wordSpacingTablet:1,wordSpacingMobile:1 };
        Object.keys(m).forEach(function (k) {
            if (defined(typo[k])) {
                var v = typo[k];
                if (needsPx[k] && typeof v === 'number') v = v + (typo[k.replace(/Desktop|Tablet|Mobile/, 'Unit')] || 'px');
                el.style.setProperty(prefix + m[k], '' + v);
            }
        });
        if (defined(typo.family)) el.style.setProperty(prefix + 'font-family', typo.family + ', sans-serif');
    }

    function initBlock(root) {
        var optsRaw = root.getAttribute('data-opts');
        var opts;
        try { opts = JSON.parse(optsRaw); } catch (e) { opts = {}; }

        var targetDate    = opts.targetDate    || '';
        var showDays      = opts.showDays      !== false;
        var showHours     = opts.showHours     !== false;
        var showMinutes   = opts.showMinutes   !== false;
        var showSeconds   = opts.showSeconds   !== false;
        var showLabels    = opts.showLabels    !== false;
        var showSeps      = opts.showSeparators !== false;
        var endMessage    = opts.endMessage    || '🎉 The wait is over!';
        var endAction     = opts.endAction     || 'message';
        var cardRadius    = opts.cardRadius    || 8;
        var cardGap       = opts.cardGap       || 16;
        var digitSize     = opts.digitSize     || 56;
        var labelFontSize = opts.labelFontSize || 12;
        var flipBg        = opts.flipBg        || '#1e1b4b';
        var flipColor     = opts.flipColor     || '#ffffff';
        var flipHingeBg   = opts.flipHingeBg   || '#0f0e17';
        var labelColor    = opts.labelColor    || '#64748b';
        var sepColor      = opts.separatorColor || '#6366f1';
        var sectionBg     = opts.sectionBg     || '#f8fafc';
        var titleColor    = opts.titleColor    || '#1e1b4b';

        if (sectionBg) root.style.background = sectionBg;

        typoCssVarsForEl(opts.typoTitle, '--bkbg-fcd-tt-', root);
        typoCssVarsForEl(opts.typoSubtitle, '--bkbg-fcd-ts-', root);
        typoCssVarsForEl(opts.typoDigit, '--bkbg-fcd-td-', root);
        typoCssVarsForEl(opts.typoLabel, '--bkbg-fcd-tl-', root);

        var titleEl = root.querySelector('.bkbg-fc-title');
        if (titleEl) { titleEl.style.color = titleColor; }
        var subEl = root.querySelector('.bkbg-fc-subtitle');
        if (subEl) { subEl.style.color = titleColor; }

        var target = targetDate ? new Date(targetDate).getTime() : null;
        if (!target || isNaN(target)) { target = Date.now() + 7 * 24 * 60 * 60 * 1000; } // demo: 7 days

        // ---- Build digit cards ----
        var units = [];
        if (showDays)    units.push({ key: 'd', label: 'Days',    max: 999 });
        if (showHours)   units.push({ key: 'h', label: 'Hours',   max: 23 });
        if (showMinutes) units.push({ key: 'm', label: 'Minutes', max: 59 });
        if (showSeconds) units.push({ key: 's', label: 'Seconds', max: 59 });

        var row = document.createElement('div');
        row.className = 'bkbg-fc-row';
        row.style.gap = cardGap + 'px';
        root.appendChild(row);

        // Map from key to array [card0, card1] (for 2-digit display)
        var cards = {};

        function makeDigitCard(digit) {
            var card = document.createElement('div');
            card.className = 'bkbg-fc-card';
            card.style.cssText = 'background:' + flipBg + ';border-radius:' + cardRadius + 'px;color:' + flipColor + ';';

            var upper = document.createElement('div');
            upper.className = 'bkbg-fc-upper';
            upper.textContent = digit;

            var lower = document.createElement('div');
            lower.className = 'bkbg-fc-lower';
            lower.textContent = digit;

            var hinge = document.createElement('div');
            hinge.className = 'bkbg-fc-hinge';
            hinge.style.background = flipHingeBg;

            card.appendChild(upper);
            card.appendChild(lower);
            card.appendChild(hinge);
            return card;
        }

        function flipDigitCard(card, oldD, newD) {
            if (oldD === newD) return;
            var upper = card.querySelector('.bkbg-fc-upper');
            var lower = card.querySelector('.bkbg-fc-lower');

            // Remove old flap elements
            var old = card.querySelectorAll('.bkbg-fc-flap-upper, .bkbg-fc-flap-lower');
            old.forEach(function (el) { el.remove(); });

            // Flap upper: shows oldD, flips away
            var flapUpper = document.createElement('div');
            flapUpper.className = 'bkbg-fc-flap-upper';
            flapUpper.textContent = oldD;
            flapUpper.style.cssText = 'color:' + flipColor + ';';

            // Flap lower: shows newD, flips in
            var flapLower = document.createElement('div');
            flapLower.className = 'bkbg-fc-flap-lower';
            flapLower.textContent = newD;
            flapLower.style.cssText = 'color:' + flipColor + ';background:' + flipBg + ';';

            // Update static halves immediately for lower, update upper after animation
            lower.textContent = newD;

            card.appendChild(flapUpper);
            card.appendChild(flapLower);

            flapUpper.addEventListener('animationend', function () {
                upper.textContent = newD;
                flapUpper.remove();
            });
            flapLower.addEventListener('animationend', function () {
                flapLower.remove();
            });
        }

        units.forEach(function (u, i) {
            if (i > 0 && showSeps) {
                var sep = document.createElement('div');
                sep.className = 'bkbg-fc-sep';
                sep.textContent = ':';
                sep.style.cssText = 'color:' + sepColor + ';';
                row.appendChild(sep);
            }

            var unit_ = document.createElement('div');
            unit_.className = 'bkbg-fc-unit';

            var pair = document.createElement('div');
            pair.className = 'bkbg-fc-pair';

            var c0 = makeDigitCard('0');
            var c1 = makeDigitCard('0');
            pair.appendChild(c0);
            pair.appendChild(c1);
            unit_.appendChild(pair);

            if (showLabels) {
                var lbl = document.createElement('div');
                lbl.className = 'bkbg-fc-label';
                lbl.textContent = u.label;
                lbl.style.cssText = 'color:' + labelColor + ';';
                unit_.appendChild(lbl);
            }

            row.appendChild(unit_);
            cards[u.key] = [c0, c1];
        });

        // ---- Prev values cache ----
        var prev = { d: -1, h: -1, m: -1, s: -1 };

        function updateCards(key, val) {
            var str = String(Math.max(0, val)).padStart(2, '0');
            var d0 = str[0];
            var d1 = str[1];
            var prevStr = String(Math.max(0, prev[key])).padStart(2, '0');

            if (prev[key] < 0) {
                // First render — no animation
                if (cards[key]) {
                    cards[key][0].querySelector('.bkbg-fc-upper').textContent = d0;
                    cards[key][0].querySelector('.bkbg-fc-lower').textContent = d0;
                    cards[key][1].querySelector('.bkbg-fc-upper').textContent = d1;
                    cards[key][1].querySelector('.bkbg-fc-lower').textContent = d1;
                }
            } else {
                if (d0 !== prevStr[0] && cards[key]) flipDigitCard(cards[key][0], prevStr[0], d0);
                if (d1 !== prevStr[1] && cards[key]) flipDigitCard(cards[key][1], prevStr[1], d1);
            }
            prev[key] = val;
        }

        var finished = false;

        function tick() {
            if (finished) return;
            var now  = Date.now();
            var diff = Math.max(0, target - now);

            if (diff <= 0) {
                finished = true;
                if (endAction === 'hide') {
                    root.style.display = 'none';
                } else if (endAction === 'message') {
                    row.style.display = 'none';
                    var msg = document.createElement('div');
                    msg.className = 'bkbg-fc-end';
                    msg.textContent = endMessage;
                    msg.style.color = titleColor;
                    root.appendChild(msg);
                }
                return; // stop ticking
            }

            var totalSec = Math.floor(diff / 1000);
            var s = totalSec % 60;
            var totalMin = Math.floor(totalSec / 60);
            var m = totalMin % 60;
            var totalHour = Math.floor(totalMin / 60);
            var h = totalHour % 24;
            var d = Math.floor(totalHour / 24);

            if (showDays)    updateCards('d', d);
            if (showHours)   updateCards('h', h);
            if (showMinutes) updateCards('m', m);
            if (showSeconds) updateCards('s', s);

            setTimeout(tick, 1000);
        }

        tick();
    }

    document.querySelectorAll('.bkbg-fc-app').forEach(function (root) {
        initBlock(root);
    });
})();
