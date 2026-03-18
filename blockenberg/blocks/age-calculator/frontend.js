(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo) return;
        if (typo.family)     el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', sans-serif");
        if (typo.weight)     el.style.setProperty(prefix + 'font-weight', typo.weight);
        if (typo.transform)  el.style.setProperty(prefix + 'text-transform', typo.transform);
        if (typo.style)      el.style.setProperty(prefix + 'font-style', typo.style);
        if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) el.style.setProperty(prefix + 'font-size-d', typo.sizeDesktop + su);
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) el.style.setProperty(prefix + 'font-size-t', typo.sizeTablet + su);
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) el.style.setProperty(prefix + 'font-size-m', typo.sizeMobile + su);
        var lhu = typo.lineHeightUnit || 'px';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) { el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu); el.style.setProperty(prefix + 'letter-spacing', typo.letterSpacingDesktop + lsu); }
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) { el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu); el.style.setProperty(prefix + 'word-spacing', typo.wordSpacingDesktop + wsu); }
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    var DAYS_OF_WEEK = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var ZODIAC = [
        { sign:'Capricorn',  symbol:'♑', end:[1,19]  },
        { sign:'Aquarius',   symbol:'♒', end:[2,18]  },
        { sign:'Pisces',     symbol:'♓', end:[3,20]  },
        { sign:'Aries',      symbol:'♈', end:[4,19]  },
        { sign:'Taurus',     symbol:'♉', end:[5,20]  },
        { sign:'Gemini',     symbol:'♊', end:[6,20]  },
        { sign:'Cancer',     symbol:'♋', end:[7,22]  },
        { sign:'Leo',        symbol:'♌', end:[8,22]  },
        { sign:'Virgo',      symbol:'♍', end:[9,22]  },
        { sign:'Libra',      symbol:'♎', end:[10,22] },
        { sign:'Scorpio',    symbol:'♏', end:[11,21] },
        { sign:'Sagittarius',symbol:'♐', end:[12,21] },
        { sign:'Capricorn',  symbol:'♑', end:[12,31] },
    ];

    function getZodiac(month, day) {
        for (var i = 0; i < ZODIAC.length; i++) {
            var z = ZODIAC[i];
            if (month < z.end[0] || (month === z.end[0] && day <= z.end[1])) return z;
        }
        return ZODIAC[ZODIAC.length - 1];
    }

    function calcAge(birthDate, now) {
        var years  = now.getFullYear() - birthDate.getFullYear();
        var months = now.getMonth()    - birthDate.getMonth();
        var days   = now.getDate()     - birthDate.getDate();
        if (days < 0) {
            months--;
            var prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) { years--; months += 12; }
        var totalDays = Math.floor((now - birthDate) / 86400000);
        return { years: years, months: months, days: days, totalDays: totalDays };
    }

    function daysUntilBirthday(birthDate, now) {
        var next = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (next < now) next.setFullYear(now.getFullYear() + 1);
        return Math.ceil((next - now) / 86400000);
    }

    function fmt(n) { return n.toLocaleString('en-US'); }

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var accent    = opts.accentColor   || '#6c3fb5';
        var cardBg    = opts.cardBg        || '#ffffff';
        var ageCardBg = opts.ageCardBg     || accent;
        var ageCardClr= opts.ageCardColor  || '#ffffff';
        var resultBg  = opts.resultBg      || '#f5f3ff';
        var resultBdr = opts.resultBorder  || '#ede9fe';
        var statsBg   = opts.statsBg       || '#fafafa';
        var statsBdr  = opts.statsBorder   || '#e5e7eb';
        var titleClr  = opts.titleColor    || '#1e1b4b';
        var subClr    = opts.subtitleColor || '#6b7280';
        var labelClr  = opts.labelColor    || '#374151';
        var cRadius   = (opts.cardRadius     !== undefined ? opts.cardRadius : 16) + 'px';
        var aRadius   = (opts.ageCardRadius  !== undefined ? opts.ageCardRadius : 12) + 'px';
        var maxW      = (opts.maxWidth || 680) + 'px';
        var ptop      = (opts.paddingTop  !== undefined ? opts.paddingTop  : 60) + 'px';
        var pbot      = (opts.paddingBottom!== undefined ? opts.paddingBottom : 60) + 'px';
        var titleSz   = (opts.titleSize   || 28) + 'px';
        var ageNumSz  = (opts.ageNumSize  || 52) + 'px';

        /* Card */
        var card = document.createElement('div');
        card.className = 'bkbg-age-card';
        card.style.cssText = [
            'background:' + cardBg,
            'border-radius:' + cRadius,
            'padding-top:' + ptop,
            'padding-bottom:' + pbot,
            'padding-left:32px',
            'padding-right:32px',
            'max-width:' + maxW,
            'margin:0 auto',
        ].join(';');
        app.innerHTML = '';
        app.appendChild(card);

        /* Typography CSS vars */
        app.style.setProperty('--bkbg-age-title-sz', titleSz);
        app.style.setProperty('--bkbg-age-num-sz', ageNumSz);
        typoCssVarsForEl(opts.titleTypo, '--bkbg-age-title-', app);
        typoCssVarsForEl(opts.ageNumTypo, '--bkbg-age-num-', app);

        /* Title */
        if (opts.showTitle !== false && opts.title) {
            var h2 = document.createElement('h2');
            h2.className = 'bkbg-age-title';
            h2.style.cssText = 'color:' + titleClr + ';text-align:center;margin-top:0;margin-bottom:8px;font-weight:800';
            h2.textContent = opts.title;
            card.appendChild(h2);
        }

        /* Subtitle */
        if (opts.showSubtitle !== false && opts.subtitle) {
            var sub = document.createElement('p');
            sub.style.cssText = 'color:' + subClr + ';text-align:center;margin-top:0;margin-bottom:28px';
            sub.textContent = opts.subtitle;
            card.appendChild(sub);
        }

        /* Date input */
        var dateField = document.createElement('div');
        dateField.className = 'bkbg-age-date-field';
        var dateLabel = document.createElement('label');
        dateLabel.className = 'bkbg-age-date-label';
        dateLabel.style.color = labelClr;
        dateLabel.textContent = 'Date of Birth';
        var dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.className = 'bkbg-age-date-input';
        dateInput.max = new Date().toISOString().slice(0, 10);
        dateField.appendChild(dateLabel);
        dateField.appendChild(dateInput);
        card.appendChild(dateField);

        /* Results area (hidden until date chosen) */
        var resultsDiv = document.createElement('div');
        card.appendChild(resultsDiv);

        /* Empty state */
        var emptyDiv = document.createElement('div');
        emptyDiv.className = 'bkbg-age-empty';
        emptyDiv.textContent = 'Enter your birth date above to see your age';
        card.appendChild(emptyDiv);

        function render() {
            var val = dateInput.value;
            if (!val) { resultsDiv.innerHTML = ''; emptyDiv.style.display = 'block'; return; }

            var now       = new Date();
            now.setHours(0,0,0,0);
            var birthDate = new Date(val);
            if (isNaN(birthDate.getTime()) || birthDate >= now) { resultsDiv.innerHTML = ''; emptyDiv.style.display = 'block'; return; }

            emptyDiv.style.display = 'none';
            resultsDiv.innerHTML = '';

            var age    = calcAge(birthDate, now);
            var untilBd= daysUntilBirthday(birthDate, now);
            var zodiac = getZodiac(birthDate.getMonth() + 1, birthDate.getDate());
            var bornDay= DAYS_OF_WEEK[birthDate.getDay()];

            /* Age cards */
            if (opts.showAgeCards !== false) {
                var ageCards = document.createElement('div');
                ageCards.className = 'bkbg-age-cards';
                ageCards.style.marginBottom = '20px';
                [
                    { val: age.years,  label: opts.yearsLabel  || 'Years' },
                    { val: age.months, label: opts.monthsLabel || 'Months' },
                    { val: age.days,   label: opts.daysLabel   || 'Days' },
                ].forEach(function (item) {
                    var ci = document.createElement('div');
                    ci.className = 'bkbg-age-card-item';
                    ci.style.cssText = 'background:' + ageCardBg + ';border-radius:' + aRadius;
                    var numEl = document.createElement('div');
                    numEl.className = 'bkbg-age-num';
                    numEl.style.cssText = 'color:' + ageCardClr;
                    numEl.textContent = item.val;
                    var lblEl = document.createElement('div');
                    lblEl.className = 'bkbg-age-card-label';
                    lblEl.style.color = ageCardClr;
                    lblEl.textContent = item.label;
                    ci.appendChild(numEl);
                    ci.appendChild(lblEl);
                    ageCards.appendChild(ci);
                });
                resultsDiv.appendChild(ageCards);
            }

            /* Birthday countdown */
            if (opts.showNextBirthday !== false) {
                var bdDiv = document.createElement('div');
                bdDiv.className = 'bkbg-age-birthday';
                bdDiv.style.cssText = 'background:' + resultBg + ';border:1.5px solid ' + resultBdr;
                var bdEmoji = document.createElement('span');
                bdEmoji.className = 'bkbg-age-birthday-emoji';
                bdEmoji.textContent = '🎂';
                var bdInfo = document.createElement('div');
                var bdMain = document.createElement('div');
                bdMain.className = 'bkbg-age-birthday-main';
                bdMain.style.color = titleClr;
                bdMain.textContent = untilBd === 0 ? '🎉 Happy Birthday!' : ('Next birthday in ' + untilBd + ' days');
                var bdSub = document.createElement('div');
                bdSub.className = 'bkbg-age-birthday-sub';
                bdSub.style.color = subClr;
                bdSub.textContent = 'Turning ' + (age.years + 1) + ' soon';
                bdInfo.appendChild(bdMain);
                bdInfo.appendChild(bdSub);
                bdDiv.appendChild(bdEmoji);
                bdDiv.appendChild(bdInfo);
                resultsDiv.appendChild(bdDiv);
            }

            /* Zodiac + born day */
            var metaCount = (opts.showZodiac !== false ? 1 : 0) + (opts.showBornDay !== false ? 1 : 0);
            if (metaCount > 0) {
                var metaDiv = document.createElement('div');
                metaDiv.className = 'bkbg-age-meta' + (metaCount === 2 ? ' two-col' : '');
                metaDiv.style.marginBottom = '14px';
                if (opts.showZodiac !== false) {
                    var zEl = document.createElement('div');
                    zEl.className = 'bkbg-age-meta-item';
                    zEl.style.cssText = 'background:' + statsBg + ';border:1px solid ' + statsBdr;
                    zEl.innerHTML = '<div class="bkbg-age-meta-label" style="color:' + subClr + '">Zodiac Sign</div>' +
                        '<div class="bkbg-age-meta-value" style="color:' + titleClr + '">' + zodiac.symbol + ' ' + zodiac.sign + '</div>';
                    metaDiv.appendChild(zEl);
                }
                if (opts.showBornDay !== false) {
                    var bdayEl = document.createElement('div');
                    bdayEl.className = 'bkbg-age-meta-item';
                    bdayEl.style.cssText = 'background:' + statsBg + ';border:1px solid ' + statsBdr;
                    bdayEl.innerHTML = '<div class="bkbg-age-meta-label" style="color:' + subClr + '">Born On</div>' +
                        '<div class="bkbg-age-meta-value" style="color:' + titleClr + '">📅 ' + bornDay + '</div>';
                    metaDiv.appendChild(bdayEl);
                }
                resultsDiv.appendChild(metaDiv);
            }

            /* Life stats */
            if (opts.showLifeStats !== false) {
                var statsDiv = document.createElement('div');
                statsDiv.className = 'bkbg-age-stats';
                statsDiv.style.cssText = 'background:' + statsBg + ';border:1px solid ' + statsBdr;
                var statsHead = document.createElement('div');
                statsHead.className = 'bkbg-age-stats-heading';
                statsHead.style.color = subClr;
                statsHead.textContent = 'Life Stats';
                statsDiv.appendChild(statsHead);
                var grid = document.createElement('div');
                grid.className = 'bkbg-age-stats-grid';
                [
                    { label:'Total Days',        val: fmt(age.totalDays) },
                    { label:'Total Weeks',       val: fmt(Math.floor(age.totalDays / 7)) },
                    { label:'Total Hours',       val: fmt(age.totalDays * 24) },
                    { label:'Heartbeats (est.)', val: fmt(age.totalDays * 24 * 60 * 72) },
                ].forEach(function (s) {
                    var si = document.createElement('div');
                    var sl = document.createElement('div');
                    sl.className = 'bkbg-age-stat-label';
                    sl.style.color = subClr;
                    sl.textContent = s.label;
                    var sv = document.createElement('div');
                    sv.className = 'bkbg-age-stat-value';
                    sv.style.color = accent;
                    sv.textContent = s.val;
                    si.appendChild(sl);
                    si.appendChild(sv);
                    grid.appendChild(si);
                });
                statsDiv.appendChild(grid);
                resultsDiv.appendChild(statsDiv);
            }
        }

        dateInput.addEventListener('change', render);
        render();
    }

    document.querySelectorAll('.bkbg-age-app').forEach(buildApp);
})();
