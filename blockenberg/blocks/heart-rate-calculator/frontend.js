(function () {
    'use strict';

    function calcMaxHR(age, formula) {
        if (formula === 'tanaka')  return Math.round(208 - 0.7 * age);
        if (formula === 'gellish') return Math.round(207 - 0.7 * age);
        return 220 - age; // fox (default)
    }

    var ZONES = [
        { num: 1, name: 'Recovery',   icon: '🚶', pctLo: 50, pctHi: 60, purpose: 'Rest & recovery — improve base fitness and promote active recovery' },
        { num: 2, name: 'Fat Burn',   icon: '🔥', pctLo: 60, pctHi: 70, purpose: 'Fat burning & aerobic base — improve endurance and metabolic efficiency' },
        { num: 3, name: 'Aerobic',    icon: '🏃', pctLo: 70, pctHi: 80, purpose: 'Improve cardiovascular efficiency and increase aerobic capacity' },
        { num: 4, name: 'Threshold',  icon: '⚡', pctLo: 80, pctHi: 90, purpose: 'Increase lactate threshold — improve speed and race performance' },
        { num: 5, name: 'Max Effort', icon: '🚀', pctLo: 90, pctHi: 100, purpose: 'Maximum effort — develop peak power and neuromuscular speed' }
    ];

    var FORMULA_LABELS = {
        fox:     'Fox (220 − age)',
        tanaka:  'Tanaka (208 − 0.7×age)',
        gellish: 'Gellish (207 − 0.7×age)'
    };

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

    document.querySelectorAll('.bkbg-hrc-app').forEach(function (root) {
        var opts = {};
        try { opts = JSON.parse(root.getAttribute('data-opts') || '{}'); } catch(e) {}

        var defaultAge     = parseInt(opts.defaultAge)     || 30;
        var defaultFormula = opts.defaultFormula           || 'fox';
        var showIcon       = opts.showZoneIcon             !== false;
        var showPurpose    = opts.showPurpose              !== false;

        var accentColor    = opts.accentColor    || '#ef4444';
        var sectionBg      = opts.sectionBg      || '#fff7f7';
        var cardBg         = opts.cardBg         || '#ffffff';
        var inputBg        = opts.inputBg        || '#f9fafb';
        var labelColor     = opts.labelColor     || '#374151';
        var titleColor     = opts.titleColor     || '#111827';
        var subtitleColor  = opts.subtitleColor  || '#6b7280';
        var zColors        = [
            opts.z1Color || '#6ee7b7',
            opts.z2Color || '#34d399',
            opts.z3Color || '#fbbf24',
            opts.z4Color || '#f97316',
            opts.z5Color || '#ef4444'
        ];

        var currentAge     = defaultAge;
        var currentFormula = defaultFormula;

        typoCssVarsForEl(opts.typoTitle, '--bkbg-hrc-tt-', root);
        typoCssVarsForEl(opts.typoSubtitle, '--bkbg-hrc-st-', root);

        root.innerHTML =
            '<div class="bkbg-hrc-card" style="background:' + cardBg + ';max-width:' + (opts.contentMaxWidth || 760) + 'px;">' +
                '<h2 class="bkbg-hrc-title" style="color:' + titleColor + ';">' + (opts.title || 'Heart Rate Zone Calculator') + '</h2>' +
                '<p class="bkbg-hrc-subtitle" style="color:' + subtitleColor + ';">' + (opts.subtitle || 'Find your personalized training zones based on your age') + '</p>' +

                '<div class="bkbg-hrc-controls" style="background:' + sectionBg + ';">' +
                    '<div class="bkbg-hrc-control-group">' +
                        '<label class="bkbg-hrc-label" style="color:' + labelColor + ';">🎂 Your Age: <strong id="hrc-age-display" style="color:' + accentColor + ';">' + defaultAge + '</strong></label>' +
                        '<input type="range" class="bkbg-hrc-slider" id="hrc-age-slider" min="18" max="80" value="' + defaultAge + '" style="accent-color:' + accentColor + ';">' +
                    '</div>' +
                    '<div class="bkbg-hrc-control-group">' +
                        '<label class="bkbg-hrc-label" style="color:' + labelColor + ';">📐 Formula</label>' +
                        '<select class="bkbg-hrc-select" id="hrc-formula" style="background:' + inputBg + ';">' +
                            '<option value="fox"' +     (defaultFormula === 'fox'     ? ' selected' : '') + '>Fox: 220 − age</option>' +
                            '<option value="tanaka"' +  (defaultFormula === 'tanaka'  ? ' selected' : '') + '>Tanaka: 208 − 0.7×age</option>' +
                            '<option value="gellish"' + (defaultFormula === 'gellish' ? ' selected' : '') + '>Gellish: 207 − 0.7×age</option>' +
                        '</select>' +
                    '</div>' +
                '</div>' +

                '<div class="bkbg-hrc-maxhr" id="hrc-maxhr-box" style="border-color:' + accentColor + ';background:' + accentColor + '12;">' +
                    '<div class="bkbg-hrc-maxhr-label" style="color:' + labelColor + ';">❤️ Maximum Heart Rate</div>' +
                    '<div class="bkbg-hrc-maxhr-val" id="hrc-maxhr-val" style="color:' + accentColor + ';">' + calcMaxHR(defaultAge, defaultFormula) + '</div>' +
                    '<div class="bkbg-hrc-maxhr-unit" style="color:' + subtitleColor + ';">beats per minute</div>' +
                '</div>' +

                '<div class="bkbg-hrc-zones" id="hrc-zones"></div>' +
            '</div>';

        var ageSlider  = root.querySelector('#hrc-age-slider');
        var ageDisplay = root.querySelector('#hrc-age-display');
        var fmlSelect  = root.querySelector('#hrc-formula');
        var maxhrVal   = root.querySelector('#hrc-maxhr-val');
        var zonesEl    = root.querySelector('#hrc-zones');

        function renderZones() {
            var maxHR = calcMaxHR(currentAge, currentFormula);
            maxhrVal.textContent = maxHR;

            var html = '';
            ZONES.forEach(function(z, i) {
                var color = zColors[i];
                var lo = Math.round(maxHR * z.pctLo / 100);
                var hi = Math.round(maxHR * z.pctHi / 100);
                html +=
                    '<div class="bkbg-hrc-zone-row" style="border-left-color:' + color + ';background:' + color + '18;">' +
                        '<div class="bkbg-hrc-zone-left">' +
                            '<div class="bkbg-hrc-zone-badge" style="background:' + color + ';color:#fff;">' +
                                (showIcon ? z.icon + ' ' : '') + 'Zone ' + z.num +
                            '</div>' +
                            '<div class="bkbg-hrc-zone-name">' + z.name + '</div>' +
                        '</div>' +
                        '<div class="bkbg-hrc-zone-center">' +
                            (showPurpose ? '<div class="bkbg-hrc-zone-purpose">' + z.purpose + '</div>' : '') +
                        '</div>' +
                        '<div class="bkbg-hrc-zone-right">' +
                            '<div class="bkbg-hrc-zone-bpm" style="color:' + color + ';">' + lo + ' – ' + hi + '</div>' +
                            '<div class="bkbg-hrc-zone-pct">' + z.pctLo + '–' + z.pctHi + '% max HR</div>' +
                        '</div>' +
                    '</div>';
            });
            zonesEl.innerHTML = html;
        }

        ageSlider.addEventListener('input', function () {
            currentAge = parseInt(this.value);
            ageDisplay.textContent = currentAge;
            renderZones();
        });

        fmlSelect.addEventListener('change', function () {
            currentFormula = this.value;
            renderZones();
        });

        renderZones();
    });

})();
