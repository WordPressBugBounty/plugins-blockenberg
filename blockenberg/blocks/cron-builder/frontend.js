function typoCssVarsForEl(typo, prefix, el) {
    if (!typo || typeof typo !== 'object') return;
    var map = {
        family: 'font-family', weight: 'font-weight', style: 'font-style',
        transform: 'text-transform', decoration: 'text-decoration',
        sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
        sizeUnit: null,
        lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
        lineHeightUnit: null,
        letterSpacingDesktop: 'letter-spacing-d', letterSpacingTablet: 'letter-spacing-t', letterSpacingMobile: 'letter-spacing-m',
        letterSpacingUnit: null,
        wordSpacingDesktop: 'word-spacing-d', wordSpacingTablet: 'word-spacing-t', wordSpacingMobile: 'word-spacing-m',
        wordSpacingUnit: null
    };
    var sizeU = typo.sizeUnit || 'px';
    var lhU   = typo.lineHeightUnit || '';
    var lsU   = typo.letterSpacingUnit || 'px';
    var wsU   = typo.wordSpacingUnit || 'px';
    Object.keys(map).forEach(function (k) {
        var css = map[k]; if (!css) return;
        var v = typo[k]; if (v === undefined || v === '' || v === null) return;
        if (/size|spacing/i.test(k)) {
            var u = /letterSpacing/.test(k) ? lsU : /wordSpacing/.test(k) ? wsU : /lineHeight/.test(k) ? lhU : sizeU;
            v = v + u;
        }
        el.style.setProperty(prefix + css, v);
    });
}

(function () {
    'use strict';

    var PRESETS = [
        { label: 'Every minute',   expr: '* * * * *'   },
        { label: 'Every hour',     expr: '0 * * * *'   },
        { label: 'Daily 9 AM',     expr: '0 9 * * *'   },
        { label: 'Weekdays 9 AM',  expr: '0 9 * * 1-5' },
        { label: 'Weekly Monday',  expr: '0 9 * * 1'   },
        { label: 'Monthly 1st',    expr: '0 9 1 * *'   },
        { label: 'Yearly Jan 1st', expr: '0 0 1 1 *'   }
    ];

    var MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    /* ---- Describe a cron expression in English ---- */
    function describe(expr) {
        var parts = (expr || '').trim().split(/\s+/);
        if (parts.length !== 5) return 'Invalid expression';

        var min = parts[0], hr = parts[1], dom = parts[2], mon = parts[3], dow = parts[4];

        function fmtTime(h, m) {
            var H = parseInt(h, 10), M = parseInt(m, 10);
            if (isNaN(H) || isNaN(M)) return 'at ' + m + ':' + h;
            var ampm = H >= 12 ? 'PM' : 'AM';
            var h12 = H % 12 || 12;
            return 'at ' + h12 + ':' + String(M).padStart(2, '0') + ' ' + ampm;
        }

        var timeStr = '';
        if (min === '*' && hr === '*') {
            timeStr = 'every minute';
        } else if (min === '*') {
            timeStr = 'every minute of hour ' + hr;
        } else if (hr === '*') {
            timeStr = 'at minute ' + min + ' of every hour';
        } else {
            timeStr = fmtTime(hr, min);
        }

        var domStr = '';
        if (dom !== '*') {
            if (/^\d+$/.test(dom)) domStr = 'on day ' + dom + ' of the month';
            else domStr = 'on day ' + dom + ' of the month';
        }

        var monStr = '';
        if (mon !== '*') {
            if (/^\d+$/.test(mon) && parseInt(mon) >= 1 && parseInt(mon) <= 12) monStr = 'in ' + MONTHS[parseInt(mon) - 1];
            else monStr = 'in month ' + mon;
        }

        var dowStr = '';
        if (dow !== '*') {
            var days = dow.split(',').map(function (d) {
                if (/^\d+$/.test(d)) return WEEKDAYS[parseInt(d) % 7] || d;
                if (/^\d+-\d+$/.test(d)) {
                    var range = d.split('-');
                    return (WEEKDAYS[parseInt(range[0])] || range[0]) + '–' + (WEEKDAYS[parseInt(range[1])] || range[1]);
                }
                return d;
            });
            dowStr = 'on ' + days.join(', ');
        }

        var parts2 = [timeStr];
        if (domStr) parts2.push(domStr);
        if (monStr) parts2.push(monStr);
        if (dowStr) parts2.push(dowStr);
        if (dom === '*' && mon === '*' && dow === '*' && timeStr !== 'every minute') parts2.push('every day');

        return parts2.join(', ');
    }

    /* ---- Validate a cron field ---- */
    function validateField(val, min, max) {
        if (val === '*') return true;
        if (/^\*\/\d+$/.test(val)) return true;
        if (/^\d+$/.test(val)) { var n = parseInt(val); return n >= min && n <= max; }
        if (/^\d+-\d+$/.test(val)) {
            var parts = val.split('-');
            return parseInt(parts[0]) >= min && parseInt(parts[1]) <= max && parseInt(parts[0]) <= parseInt(parts[1]);
        }
        if (/^\d+(,\d+)+$/.test(val)) {
            return val.split(',').every(function (n) { var x = parseInt(n); return x >= min && x <= max; });
        }
        return false;
    }

    /* ---- Compute next N run times ---- */
    function nextRuns(expr, count) {
        var parts = (expr || '').trim().split(/\s+/);
        if (parts.length !== 5) return [];

        function matchField(val, n, min, max) {
            if (val === '*') return true;
            if (/^\*\/(\d+)$/.test(val)) { var step = parseInt(val.slice(2)); return n % step === 0; }
            if (/^\d+$/.test(val)) return parseInt(val) === n;
            if (/^\d+-\d+$/.test(val)) { var r = val.split('-'); return n >= parseInt(r[0]) && n <= parseInt(r[1]); }
            if (/^\d+(,\d+)+$/.test(val)) return val.split(',').map(Number).indexOf(n) !== -1;
            return false;
        }

        var results = [];
        var d = new Date();
        d.setSeconds(0, 0);
        d.setMinutes(d.getMinutes() + 1);

        var limit = 0;
        while (results.length < count && limit < 525600) {
            limit++;
            if (
                matchField(parts[3], d.getMonth() + 1, 1, 12) &&
                matchField(parts[2], d.getDate(), 1, 31) &&
                matchField(parts[4], d.getDay(), 0, 7) &&
                matchField(parts[1], d.getHours(), 0, 23) &&
                matchField(parts[0], d.getMinutes(), 0, 59)
            ) {
                results.push(new Date(d));
            }
            d.setMinutes(d.getMinutes() + 1);
        }
        return results;
    }

    function relativeTime(date) {
        var diff = date - Date.now();
        var mins = Math.round(diff / 60000);
        if (mins < 60) return 'in ' + mins + ' min';
        var hrs = Math.round(mins / 60);
        if (hrs < 24) return 'in ' + hrs + ' hr';
        return 'in ' + Math.round(hrs / 24) + ' day' + (Math.round(hrs/24) > 1 ? 's' : '');
    }

    function initBlock(root) {
        var opts;
        try { opts = JSON.parse(root.getAttribute('data-opts')); } catch (e) { return; }

        var a = opts;
        var expr = a.defaultExpression || '0 9 * * *';
        var exprParts = expr.split(/\s+/);
        while (exprParts.length < 5) exprParts.push('*');

        root.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-cb-wrap';
        wrap.style.cssText = 'background:' + a.sectionBg + ';max-width:' + a.contentMaxWidth + 'px;margin:0 auto;';
        root.appendChild(wrap);

        typoCssVarsForEl(a.typoTitle, '--bkbg-cb-ttl-', wrap);
        typoCssVarsForEl(a.typoSubtitle, '--bkbg-cb-sub-', wrap);

        if (a.showTitle) {
            var h = document.createElement('div');
            h.className = 'bkbg-cb-title';
            h.style.color = a.titleColor;
            h.textContent = a.title;
            wrap.appendChild(h);
        }

        if (a.showSubtitle) {
            var s = document.createElement('div');
            s.className = 'bkbg-cb-subtitle';
            s.style.color = a.subtitleColor;
            s.textContent = a.subtitle;
            wrap.appendChild(s);
        }

        // Presets
        if (a.showPresets) {
            var presetsEl = document.createElement('div');
            presetsEl.className = 'bkbg-cb-presets';
            presetsEl.style.background = a.cardBg;
            PRESETS.forEach(function (p) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-cb-preset-btn';
                btn.textContent = p.label;
                btn.title = p.expr;
                updatePresetStyle(btn, p.expr === expr);
                btn.addEventListener('click', function () {
                    expr = p.expr;
                    exprParts = expr.split(/\s+/);
                    updateInputs();
                    renderAll();
                    presetsEl.querySelectorAll('.bkbg-cb-preset-btn').forEach(function (b) {
                        updatePresetStyle(b, b.title === expr);
                    });
                });
                presetsEl.appendChild(btn);
            });
            wrap.appendChild(presetsEl);
        }

        function updatePresetStyle(btn, active) {
            btn.style.cssText = 'background:' + (active ? a.accentColor : '#e5e7eb') + ';color:' + (active ? '#fff' : '#374151') + ';';
        }

        // Fields card
        var fieldsCard = document.createElement('div');
        fieldsCard.className = 'bkbg-cb-card';
        fieldsCard.style.background = a.cardBg;
        wrap.appendChild(fieldsCard);

        var FIELD_DEFS = [
            { label: 'Minute',  min: 0, max: 59 },
            { label: 'Hour',    min: 0, max: 23 },
            { label: 'Day',     min: 1, max: 31 },
            { label: 'Month',   min: 1, max: 12 },
            { label: 'Weekday', min: 0, max: 7  }
        ];

        var fieldsRow = document.createElement('div');
        fieldsRow.className = 'bkbg-cb-fields';
        fieldsCard.appendChild(fieldsRow);

        var inputs = [];

        FIELD_DEFS.forEach(function (def, idx) {
            var col = document.createElement('div');
            col.className = 'bkbg-cb-field-col';

            var inp = document.createElement('input');
            inp.type = 'text';
            inp.className = 'bkbg-cb-field-input';
            inp.value = exprParts[idx] || '*';
            inp.style.cssText = 'background:' + a.fieldBg + ';color:' + a.accentColor + ';';
            inp.setAttribute('aria-label', def.label);
            inp.title = def.label + ' (' + def.min + '-' + def.max + ')';

            inp.addEventListener('input', function () {
                exprParts[idx] = inp.value || '*';
                expr = exprParts.join(' ');
                renderAll();
            });

            inputs.push(inp);

            var lbl = document.createElement('div');
            lbl.className = 'bkbg-cb-field-label';
            lbl.style.color = a.subtitleColor;
            lbl.textContent = def.label;

            col.appendChild(inp);
            col.appendChild(lbl);
            fieldsRow.appendChild(col);
        });

        function updateInputs() {
            inputs.forEach(function (inp, idx) {
                inp.value = exprParts[idx] || '*';
            });
        }

        // Expression display
        var exprDisplay = document.createElement('div');
        exprDisplay.className = 'bkbg-cb-expr-display';
        exprDisplay.style.cssText = 'background:' + a.fieldBg + ';color:' + a.accentColor + ';';
        fieldsCard.appendChild(exprDisplay);

        // Error display
        var errorEl = document.createElement('div');
        errorEl.className = 'bkbg-cb-error';
        errorEl.style.display = 'none';
        fieldsCard.appendChild(errorEl);

        // Actions
        var actionsRow = document.createElement('div');
        actionsRow.className = 'bkbg-cb-actions';
        var copyBtn = document.createElement('button');
        copyBtn.className = 'bkbg-cb-btn';
        copyBtn.style.background = a.accentColor;
        copyBtn.textContent = 'Copy Expression';
        var copyMsg = document.createElement('div');
        copyMsg.className = 'bkbg-cb-copy-msg';
        copyMsg.style.color = a.accentColor;
        copyMsg.textContent = '✓ Copied to clipboard!';

        copyBtn.addEventListener('click', function () {
            navigator.clipboard && navigator.clipboard.writeText(expr).catch(function () {
                var t = document.createElement('textarea');
                t.value = expr; document.body.appendChild(t); t.select();
                document.execCommand('copy'); document.body.removeChild(t);
            });
            copyMsg.classList.add('bkbg-cb-show');
            setTimeout(function () { copyMsg.classList.remove('bkbg-cb-show'); }, 2000);
        });

        actionsRow.appendChild(copyBtn);
        fieldsCard.appendChild(actionsRow);
        fieldsCard.appendChild(copyMsg);

        // Description card
        var descCard = null, descText = null;
        if (a.showDescription) {
            descCard = document.createElement('div');
            descCard.className = 'bkbg-cb-desc-card';
            descCard.style.cssText = 'background:' + a.cardBg + ';border-left-color:' + a.accentColor + ';';

            var descLabel = document.createElement('div');
            descLabel.className = 'bkbg-cb-desc-label';
            descLabel.style.color = a.subtitleColor;
            descLabel.textContent = 'DESCRIPTION';
            descCard.appendChild(descLabel);

            descText = document.createElement('div');
            descText.className = 'bkbg-cb-desc-text';
            descText.style.color = a.labelColor;
            descCard.appendChild(descText);
            wrap.appendChild(descCard);
        }

        // Next runs card
        var nextCard = null, nextList = null;
        if (a.showNextRuns) {
            nextCard = document.createElement('div');
            nextCard.className = 'bkbg-cb-card';
            nextCard.style.background = a.cardBg;

            var nextTitle = document.createElement('div');
            nextTitle.className = 'bkbg-cb-next-title';
            nextTitle.style.color = a.labelColor;
            nextTitle.textContent = 'Next Run Times';
            nextCard.appendChild(nextTitle);

            nextList = document.createElement('div');
            nextCard.appendChild(nextList);
            wrap.appendChild(nextCard);
        }

        function renderAll() {
            // Update expression display
            exprDisplay.textContent = exprParts.join(' ');

            // Validate
            var valid = [
                validateField(exprParts[0], 0, 59),
                validateField(exprParts[1], 0, 23),
                validateField(exprParts[2], 1, 31),
                validateField(exprParts[3], 1, 12),
                validateField(exprParts[4], 0, 7)
            ];

            var allValid = valid.every(Boolean);
            inputs.forEach(function (inp, idx) {
                inp.style.borderColor = valid[idx] ? 'transparent' : '#ef4444';
            });

            if (!allValid) {
                errorEl.style.display = 'block';
                errorEl.textContent = 'Invalid expression — check highlighted fields';
            } else {
                errorEl.style.display = 'none';
            }

            // Description
            if (descText) {
                descText.textContent = describe(exprParts.join(' '));
            }

            // Next runs
            if (nextList) {
                nextList.innerHTML = '';
                if (allValid) {
                    var runs = nextRuns(exprParts.join(' '), parseInt(a.nextRunsCount) || 5);
                    runs.forEach(function (d) {
                        var item = document.createElement('div');
                        item.className = 'bkbg-cb-next-item';
                        item.style.color = a.labelColor;

                        var arrow = document.createElement('span');
                        arrow.className = 'bkbg-cb-next-arrow';
                        arrow.style.color = a.accentColor;
                        arrow.textContent = '→';

                        var dateText = document.createElement('span');
                        dateText.textContent = d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

                        var rel = document.createElement('span');
                        rel.className = 'bkbg-cb-next-relative';
                        rel.textContent = relativeTime(d);

                        [arrow, dateText, rel].forEach(function (el) { item.appendChild(el); });
                        nextList.appendChild(item);
                    });
                    if (runs.length === 0) {
                        var noRun = document.createElement('div');
                        noRun.style.cssText = 'color:' + a.subtitleColor + ';font-size:13px;padding:8px 0;';
                        noRun.textContent = 'No upcoming runs found in the next year.';
                        nextList.appendChild(noRun);
                    }
                } else {
                    var errNote = document.createElement('div');
                    errNote.style.cssText = 'color:#ef4444;font-size:13px;padding:8px 0;';
                    errNote.textContent = 'Fix the expression to see next run times.';
                    nextList.appendChild(errNote);
                }
            }
        }

        renderAll();
    }

    function init() {
        document.querySelectorAll('.bkbg-cb-app').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
