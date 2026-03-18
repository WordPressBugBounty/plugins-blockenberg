(function () {
    'use strict';

    var _typoKeys = { family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
    function typoCssVarsForEl(el, typo, prefix) {
        if (!typo || typeof typo !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') el.style.setProperty(prefix + _typoKeys[k], String(typo[k]));
        });
    }

    var FREQ_MULT   = { once: 1, daily: 250, weekly: 52, biweekly: 26, monthly: 12 };
    var FREQ_LABELS = { once: 'One-time', daily: 'Daily (250×/yr)', weekly: 'Weekly (52×/yr)', biweekly: 'Bi-weekly (26×/yr)', monthly: 'Monthly (12×/yr)' };
    var EQUIV = [
        { icon: '☕', label: 'Specialty coffees', price: 6 },
        { icon: '🍕', label: 'Pizza slices',      price: 4 },
        { icon: '📚', label: 'Books',             price: 18 },
        { icon: '🎬', label: 'Movie tickets',      price: 15 }
    ];

    function fmt(n, cur) {
        return (cur||'$') + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    function fmtShort(n, cur) {
        if (n >= 1000000) return (cur||'$') + (n/1000000).toFixed(2) + 'M';
        if (n >= 1000)    return (cur||'$') + (n/1000).toFixed(1) + 'K';
        return fmt(n, cur||'$');
    }

    function calcCost(attendees, rate, hours, minutes) {
        return attendees * rate * (hours + minutes / 60);
    }

    document.querySelectorAll('.bkbg-mcc-app').forEach(function (root) {
        var opts = {};
        try { opts = JSON.parse(root.getAttribute('data-opts') || '{}'); } catch(e) {}

        var cur             = opts.currency         || '$';
        var showRecurring   = opts.showRecurring     !== false;
        var showEquivs      = opts.showEquivalents   !== false;
        var showTimer       = opts.showTimer         !== false;
        var accentColor     = opts.accentColor       || '#f43f5e';
        var sectionBg       = opts.sectionBg         || '#fff1f2';
        var cardBg          = opts.cardBg            || '#ffffff';
        var inputBg         = opts.inputBg           || '#f9fafb';
        var resultBg        = opts.resultBg          || '#ffe4e6';
        var titleColor      = opts.titleColor        || '#111827';
        var subtitleColor   = opts.subtitleColor     || '#6b7280';
        var labelColor      = opts.labelColor        || '#374151';
        var recurringColor  = opts.recurringColor    || '#7c3aed';

        var state = {
            attendees: parseInt(opts.defaultAttendees)  || 5,
            rate:      parseFloat(opts.defaultHourlyRate) || 75,
            hours:     parseInt(opts.defaultHours)      || 1,
            minutes:   parseInt(opts.defaultMinutes)    || 0,
            freq:      opts.defaultFrequency             || 'weekly',
            timerRunning: false,
            timerStart:   0,
            timerInterval: null,
            timerElapsed:  0
        };

        typoCssVarsForEl(root, opts.titleTypo, '--bkbg-mcc-tt-');
        typoCssVarsForEl(root, opts.subtitleTypo, '--bkbg-mcc-st-');

        function render() {
            var single   = calcCost(state.attendees, state.rate, state.hours, state.minutes);
            var durationMins = state.hours * 60 + state.minutes;
            var perMin   = state.attendees * state.rate / 60;
            var freqMult = FREQ_MULT[state.freq] || 1;
            var annual   = single * freqMult;

            root.innerHTML =
                '<div class="bkbg-mcc-card" style="background:' + cardBg + ';max-width:' + (opts.contentMaxWidth||680) + 'px;">' +
                    '<h2 class="bkbg-mcc-title" style="color:' + titleColor + ';">' + (opts.title || 'Meeting Cost Calculator') + '</h2>' +
                    '<p class="bkbg-mcc-subtitle" style="color:' + subtitleColor + ';">' + (opts.subtitle || 'Discover the true cost of your meetings in real time') + '</p>' +

                    '<div class="bkbg-mcc-inputs" style="background:' + sectionBg + ';">' +
                        '<div class="bkbg-mcc-field">' +
                            '<div class="bkbg-mcc-field-header">' +
                                '<label class="bkbg-mcc-label" style="color:' + labelColor + ';">👥 Attendees</label>' +
                                '<span class="bkbg-mcc-field-val" style="color:' + accentColor + ';">' + state.attendees + '</span>' +
                            '</div>' +
                            '<input type="range" class="bkbg-mcc-slider" id="mcc-att" min="1" max="100" value="' + state.attendees + '" style="accent-color:' + accentColor + ';">' +
                        '</div>' +
                        '<div class="bkbg-mcc-field">' +
                            '<div class="bkbg-mcc-field-header">' +
                                '<label class="bkbg-mcc-label" style="color:' + labelColor + ';">💰 Avg Hourly Rate</label>' +
                                '<span class="bkbg-mcc-field-val" style="color:' + accentColor + ';">' + cur + state.rate + '/hr</span>' +
                            '</div>' +
                            '<input type="range" class="bkbg-mcc-slider" id="mcc-rate" min="10" max="500" step="5" value="' + state.rate + '" style="accent-color:' + accentColor + ';">' +
                        '</div>' +
                        '<div class="bkbg-mcc-row">' +
                            '<div class="bkbg-mcc-field">' +
                                '<label class="bkbg-mcc-label" style="color:' + labelColor + ';">⏱ Hours</label>' +
                                '<select class="bkbg-mcc-select" id="mcc-hours" style="background:' + inputBg + ';">' +
                                    [0,1,2,3,4,5,6,7,8].map(function(h){ return '<option value="' + h + '"' + (h===state.hours?' selected':'') + '>' + h + 'h</option>'; }).join('') +
                                '</select>' +
                            '</div>' +
                            '<div class="bkbg-mcc-field">' +
                                '<label class="bkbg-mcc-label" style="color:' + labelColor + ';">⏱ Minutes</label>' +
                                '<select class="bkbg-mcc-select" id="mcc-mins" style="background:' + inputBg + ';">' +
                                    [0,15,30,45].map(function(m){ return '<option value="' + m + '"' + (m===state.minutes?' selected':'') + '>' + m + 'm</option>'; }).join('') +
                                '</select>' +
                            '</div>' +
                            '<div class="bkbg-mcc-field">' +
                                '<label class="bkbg-mcc-label" style="color:' + labelColor + ';">🔄 Frequency</label>' +
                                '<select class="bkbg-mcc-select" id="mcc-freq" style="background:' + inputBg + ';">' +
                                    Object.keys(FREQ_LABELS).map(function(k){ return '<option value="' + k + '"' + (k===state.freq?' selected':'') + '>' + FREQ_LABELS[k] + '</option>'; }).join('') +
                                '</select>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    // Live timer
                    (showTimer ?
                    '<div class="bkbg-mcc-ticker">' +
                        '<div class="bkbg-mcc-ticker-dot" id="mcc-dot" style="background:' + accentColor + ';display:' + (state.timerRunning ? 'block':'none') + ';"></div>' +
                        '<div class="bkbg-mcc-ticker-val" id="mcc-ticker-val" style="color:' + accentColor + ';">' +
                            (state.timerRunning ? 'Live cost: ' + fmt(perMin * (state.timerElapsed/60), cur) : '') +
                        '</div>' +
                        '<button id="mcc-timer-btn" style="padding:6px 16px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;background:' + (state.timerRunning ? '#6b7280' : accentColor) + ';color:#fff;font-family:inherit;">' +
                            (state.timerRunning ? '⏹ Stop Meeting' : '▶ Start Meeting Timer') +
                        '</button>' +
                    '</div>' : '') +

                    '<div class="bkbg-mcc-result" style="background:' + resultBg + ';">' +
                        '<div class="bkbg-mcc-result-label" style="color:' + labelColor + ';">💸 This meeting costs</div>' +
                        '<div class="bkbg-mcc-result-val" id="mcc-cost-val" style="color:' + accentColor + ';">' + fmt(single, cur) + '</div>' +
                        '<div class="bkbg-mcc-result-sub" style="color:#9ca3af;">' + fmt(perMin, cur) + ' per minute · ' + durationMins + ' min meeting</div>' +
                    '</div>' +

                    (showRecurring && state.freq !== 'once' ?
                    '<div class="bkbg-mcc-recurring" style="border:2px solid ' + recurringColor + '33;background:' + recurringColor + '0d;">' +
                        '<div class="bkbg-mcc-rec-title" style="color:' + labelColor + ';">📅 Annual Cost (' + FREQ_LABELS[state.freq] + ')</div>' +
                        '<div class="bkbg-mcc-rec-val" style="color:' + recurringColor + ';">' + fmtShort(annual, cur) + '</div>' +
                        '<div class="bkbg-mcc-rec-sub" style="color:#9ca3af;">' + freqMult + ' meetings × ' + fmt(single, cur) + ' each</div>' +
                    '</div>' : '') +

                    (showEquivs ?
                    '<div class="bkbg-mcc-equivs">' +
                        '<div class="bkbg-mcc-equiv-title" style="color:' + labelColor + ';">💡 This meeting is equivalent to…</div>' +
                        '<div class="bkbg-mcc-equiv-grid">' +
                            EQUIV.map(function(eq) {
                                var count = Math.round(single / eq.price);
                                return '<div class="bkbg-mcc-equiv-card" style="border-color:' + accentColor + '44;background:' + accentColor + '10;">' +
                                    '<div class="bkbg-mcc-equiv-icon">' + eq.icon + '</div>' +
                                    '<div class="bkbg-mcc-equiv-val" style="color:' + accentColor + ';">' + count.toLocaleString() + '</div>' +
                                    '<div class="bkbg-mcc-equiv-label">' + eq.label + '</div>' +
                                '</div>';
                            }).join('') +
                        '</div>' +
                    '</div>' : '') +
                '</div>';

            bindEvents(perMin, single);
        }

        function bindEvents(perMin, single) {
            var attSlider  = root.querySelector('#mcc-att');
            var rateSlider = root.querySelector('#mcc-rate');
            var hoursEl    = root.querySelector('#mcc-hours');
            var minsEl     = root.querySelector('#mcc-mins');
            var freqEl     = root.querySelector('#mcc-freq');
            var timerBtn   = root.querySelector('#mcc-timer-btn');

            if (attSlider)  attSlider.addEventListener('input',  function(){ state.attendees = parseInt(this.value)||1; render(); });
            if (rateSlider) rateSlider.addEventListener('input', function(){ state.rate = parseFloat(this.value)||10; render(); });
            if (hoursEl)    hoursEl.addEventListener('change',   function(){ state.hours = parseInt(this.value)||0; render(); });
            if (minsEl)     minsEl.addEventListener('change',    function(){ state.minutes = parseInt(this.value)||0; render(); });
            if (freqEl)     freqEl.addEventListener('change',    function(){ state.freq = this.value; render(); });

            if (timerBtn) {
                timerBtn.addEventListener('click', function() {
                    if (state.timerRunning) {
                        clearInterval(state.timerInterval);
                        state.timerRunning = false;
                        state.timerElapsed = 0;
                    } else {
                        state.timerRunning = true;
                        state.timerStart   = Date.now();
                        state.timerElapsed = 0;
                        state.timerInterval = setInterval(function() {
                            state.timerElapsed = (Date.now() - state.timerStart) / 1000;
                            // Update only the ticker without full re-render
                            var tickerEl   = root.querySelector('#mcc-ticker-val');
                            var costValEl  = root.querySelector('#mcc-cost-val');
                            var dotEl      = root.querySelector('#mcc-dot');
                            var liveCost   = perMin * (state.timerElapsed / 60);
                            if (tickerEl) tickerEl.textContent = 'Live cost: ' + fmt(liveCost, cur);
                            if (costValEl) costValEl.textContent = fmt(single + liveCost, cur);
                        }, 1000);
                    }
                    render();
                });
            }
        }

        render();
    });

})();
