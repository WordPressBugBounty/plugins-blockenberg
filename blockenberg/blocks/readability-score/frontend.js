(function () {
    'use strict';

    // ── Readability algorithms ──────────────────────────────────────────────
    function countSyllables(word) {
        word = word.toLowerCase().replace(/[^a-z]/g, '');
        if (!word.length) return 0;
        if (word.length <= 3) return 1;
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        var m = word.match(/[aeiouy]{1,2}/g);
        return m ? m.length : 1;
    }

    function analyze(text) {
        if (!text || !text.trim()) return null;
        var sentences = text.trim().split(/[.!?]+/).filter(function(s){ return s.trim().length > 0; }).length || 1;
        var wordList  = text.trim().split(/\s+/).filter(function(w){ return w.replace(/[^a-zA-Z]/g,'').length > 0; });
        var words     = wordList.length || 1;
        var syllables = wordList.reduce(function(n,w){ return n + countSyllables(w); }, 0) || 1;
        var complex   = wordList.filter(function(w){ return countSyllables(w) >= 3; }).length;

        var fe = 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words);
        var fleschEase = Math.min(100, Math.max(0, Math.round(fe)));
        var gradeLevel = Math.max(0, Math.round((0.39*(words/sentences) + 11.8*(syllables/words) - 15.59)*10)/10);
        var gunningFog = Math.max(0, Math.round(0.4*((words/sentences) + 100*(complex/words))*10)/10);
        var readingTime = Math.max(1, Math.ceil(words/200));

        return {
            fleschEase:         fleschEase,
            gradeLevel:         gradeLevel,
            gunningFog:         gunningFog,
            words:              words,
            sentences:          sentences,
            syllables:          syllables,
            avgWordsPerSentence:Math.round((words/sentences)*10)/10,
            avgSyllablesPerWord:Math.round((syllables/words)*10)/10,
            readingTime:        readingTime
        };
    }

    function gaugeInfo(score) {
        if (score >= 90) return { label:'Very Easy',        color:'#10b981', grade:'5th grade'          };
        if (score >= 70) return { label:'Easy',             color:'#22c55e', grade:'6th grade'          };
        if (score >= 60) return { label:'Fairly Easy',      color:'#84cc16', grade:'7th grade'          };
        if (score >= 50) return { label:'Standard',         color:'#f59e0b', grade:'8–9th grade'        };
        if (score >= 30) return { label:'Fairly Difficult', color:'#f97316', grade:'10–12th grade'      };
        if (score >= 10) return { label:'Difficult',        color:'#ef4444', grade:'College'            };
        return               { label:'Very Confusing',  color:'#dc2626', grade:'Professional'       };
    }

    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    function initReadabilityScore(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) { opts = {}; }

        var accent        = opts.accentColor     || '#6c3fb5';
        var cardBg        = opts.cardBg          || '#ffffff';
        var textareaBg    = opts.textareaBg      || '#f9fafb';
        var textareaBorder= opts.textareaBorder  || '#e5e7eb';
        var statBg        = opts.statBg          || '#f3f4f6';
        var statBorder    = opts.statBorder      || '#e5e7eb';
        var statValueColor= opts.statValueColor  || '#111827';
        var statLabelColor= opts.statLabelColor  || '#6b7280';
        var gaugeTrack    = opts.gaugeTrackColor  || '#e5e7eb';
        var scoreBg       = opts.scoreBg         || '#f9fafb';
        var labelColor    = opts.labelColor      || '#374151';
        var titleColor    = opts.titleColor      || '';
        var subtitleColor = opts.subtitleColor   || '';
        var sectionBg     = opts.sectionBg       || '';

        var maxWidth      = (opts.maxWidth      || 620) + 'px';
        var cardRadius    = (opts.cardRadius    || 16)  + 'px';
        var paddingTop    = (opts.paddingTop    != null ? opts.paddingTop    : 60) + 'px';
        var paddingBottom = (opts.paddingBottom != null ? opts.paddingBottom : 60) + 'px';

        var showFleschEase  = opts.showFleschEase  !== false;
        var showGradeLevel  = opts.showGradeLevel  !== false;
        var showGunningFog  = opts.showGunningFog  !== false;
        var showStats       = opts.showStats       !== false;
        var showGauge       = opts.showGauge       !== false;
        var showReadingTime = opts.showReadingTime !== false;

        // Set CSS custom property for focus ring
        app.style.setProperty('--bkbg-rs-accent', accent);
        typoCssVarsForEl(app, opts.titleTypo || {}, '--bkras-tt-');
        typoCssVarsForEl(app, opts.subtitleTypo || {}, '--bkras-st-');
        app.style.paddingTop    = paddingTop;
        app.style.paddingBottom = paddingBottom;
        if (sectionBg) app.style.background = sectionBg;

        // Wrapper
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-rs-wrap';
        wrap.style.cssText = 'background:' + cardBg + ';border-radius:' + cardRadius + ';max-width:' + maxWidth;
        app.appendChild(wrap);

        // Header
        var showTitle    = opts.showTitle    && opts.title;
        var showSubtitle = opts.showSubtitle && opts.subtitle;
        if (showTitle || showSubtitle) {
            var header = document.createElement('div');
            header.className = 'bkbg-rs-header';
            if (showTitle) {
                var h = document.createElement('div');
                h.className = 'bkbg-rs-title bkras-title';
                if (titleColor) h.style.color = titleColor;
                h.textContent = opts.title;
                header.appendChild(h);
            }
            if (showSubtitle) {
                var sub = document.createElement('div');
                sub.className = 'bkbg-rs-subtitle bkras-subtitle';
                if (subtitleColor) sub.style.color = subtitleColor;
                sub.textContent = opts.subtitle;
                header.appendChild(sub);
            }
            wrap.appendChild(header);
        }

        // Textarea section
        var labelEl = document.createElement('label');
        labelEl.className = 'bkbg-rs-label';
        labelEl.style.color = labelColor;
        labelEl.textContent = 'Your Text';

        var textarea = document.createElement('textarea');
        textarea.className = 'bkbg-rs-textarea';
        textarea.rows = 6;
        textarea.placeholder = opts.placeholder || 'Paste or type your text here...';
        textarea.style.cssText = 'background:' + textareaBg + ';border:1.5px solid ' + textareaBorder;

        var textareaWrap = document.createElement('div');
        textareaWrap.style.marginBottom = '20px';
        textareaWrap.appendChild(labelEl);
        textareaWrap.appendChild(textarea);
        wrap.appendChild(textareaWrap);

        // Results container
        var results = document.createElement('div');
        wrap.appendChild(results);

        function renderEmpty() {
            results.innerHTML = '<div class="bkbg-rs-empty">Start typing or paste text to see the analysis…</div>';
        }

        function renderResults(data) {
            results.innerHTML = '';
            var info = gaugeInfo(data.fleschEase);

            // Stats grid
            if (showStats) {
                var statsGrid = document.createElement('div');
                statsGrid.className = 'bkbg-rs-stats-grid';
                var statsData = [
                    { label:'Words',          val:data.words },
                    { label:'Sentences',      val:data.sentences },
                    { label:'Syllables',      val:data.syllables },
                    { label:'Avg Words/Sent', val:data.avgWordsPerSentence },
                    { label:'Avg Syll/Word',  val:data.avgSyllablesPerWord }
                ];
                if (showReadingTime) statsData.push({ label:'Read Time', val:data.readingTime+'m' });
                statsData.forEach(function(s) {
                    var card = document.createElement('div');
                    card.className = 'bkbg-rs-stat';
                    card.style.cssText = 'background:' + statBg + ';border:1px solid ' + statBorder;
                    var valEl = document.createElement('div');
                    valEl.className = 'bkbg-rs-stat-val';
                    valEl.style.color = statValueColor;
                    valEl.textContent = s.val;
                    var lblEl = document.createElement('div');
                    lblEl.className = 'bkbg-rs-stat-lbl';
                    lblEl.style.color = statLabelColor;
                    lblEl.textContent = s.label;
                    card.appendChild(valEl);
                    card.appendChild(lblEl);
                    statsGrid.appendChild(card);
                });
                results.appendChild(statsGrid);
            }

            // Gauge
            if (showGauge && showFleschEase) {
                var gaugeSection = document.createElement('div');
                gaugeSection.className = 'bkbg-rs-gauge-section';

                var gHeader = document.createElement('div');
                gHeader.className = 'bkbg-rs-gauge-header';
                var gLabel = document.createElement('span');
                gLabel.className = 'bkbg-rs-gauge-label';
                gLabel.style.color = labelColor;
                gLabel.textContent = 'Flesch Reading Ease';
                var gScore = document.createElement('span');
                gScore.className = 'bkbg-rs-gauge-score';
                gScore.style.color = info.color;
                gScore.textContent = data.fleschEase + ' — ' + info.label;
                gHeader.appendChild(gLabel);
                gHeader.appendChild(gScore);

                var gTrack = document.createElement('div');
                gTrack.className = 'bkbg-rs-gauge-track';
                gTrack.style.background = gaugeTrack;
                var gFill = document.createElement('div');
                gFill.className = 'bkbg-rs-gauge-fill';
                gFill.style.cssText = 'width:' + data.fleschEase + '%;background:' + info.color;
                gTrack.appendChild(gFill);

                var gRange = document.createElement('div');
                gRange.className = 'bkbg-rs-gauge-range';
                var gLeft = document.createElement('span'); gLeft.textContent = '0 – Very Confusing';
                var gRight = document.createElement('span'); gRight.textContent = '100 – Very Easy';
                gRange.appendChild(gLeft);
                gRange.appendChild(gRight);

                gaugeSection.appendChild(gHeader);
                gaugeSection.appendChild(gTrack);
                gaugeSection.appendChild(gRange);
                results.appendChild(gaugeSection);
            }

            // Score cards
            if (showGradeLevel || showGunningFog) {
                var scoresRow = document.createElement('div');
                scoresRow.className = 'bkbg-rs-scores-row';

                if (showGradeLevel) {
                    var glCard = document.createElement('div');
                    glCard.className = 'bkbg-rs-score-card';
                    glCard.style.cssText = 'background:' + scoreBg + ';border:1px solid ' + statBorder;
                    glCard.innerHTML = '<div class="bkbg-rs-score-name" style="color:' + statLabelColor + '">Flesch-Kincaid Grade</div>' +
                        '<div class="bkbg-rs-score-val" style="color:' + statValueColor + '">' + data.gradeLevel + '</div>' +
                        '<div class="bkbg-rs-score-desc">' + info.grade + '</div>';
                    scoresRow.appendChild(glCard);
                }
                if (showGunningFog) {
                    var gfCard = document.createElement('div');
                    gfCard.className = 'bkbg-rs-score-card';
                    gfCard.style.cssText = 'background:' + scoreBg + ';border:1px solid ' + statBorder;
                    gfCard.innerHTML = '<div class="bkbg-rs-score-name" style="color:' + statLabelColor + '">Gunning Fog Index</div>' +
                        '<div class="bkbg-rs-score-val" style="color:' + statValueColor + '">' + data.gunningFog + '</div>' +
                        '<div class="bkbg-rs-score-desc">Years of education needed</div>';
                    scoresRow.appendChild(gfCard);
                }
                results.appendChild(scoresRow);
            }
        }

        renderEmpty();

        var debounceTimer;
        textarea.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function() {
                var data = analyze(textarea.value);
                if (data) { renderResults(data); }
                else      { renderEmpty(); }
            }, 250);
        });
    }

    document.querySelectorAll('.bkbg-rs-app').forEach(initReadabilityScore);
})();
