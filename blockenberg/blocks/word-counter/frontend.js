(function () {
    'use strict';

    function analyzeText(text, readingWPM, speakingWPM) {
        var words      = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        var chars      = text.length;
        var charsNoSp  = text.replace(/\s/g, '').length;
        var sentences  = text.trim() === '' ? 0 : (text.match(/[^.!?]+[.!?]+/g) || []).length;
        var paras      = text.trim() === '' ? 0 : (text.trim().split(/\n\s*\n+/).filter(function(p) { return p.trim() !== ''; }).length || (text.trim() !== '' ? 1 : 0));
        var readSec    = words > 0 ? Math.ceil((words / readingWPM) * 60) : 0;
        var speakSec   = words > 0 ? Math.ceil((words / speakingWPM) * 60) : 0;
        return { words: words, chars: chars, charsNoSp: charsNoSp, sentences: sentences, paragraphs: paras, readSec: readSec, speakSec: speakSec };
    }

    function fmtTime(secs) {
        if (secs < 60) return secs + 's';
        var m  = Math.floor(secs / 60);
        var s  = secs % 60;
        return m + 'm' + (s ? ' ' + s + 's' : '');
    }

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var o         = opts;
        var rWPM      = parseInt(o.readingWPM)  || 238;
        var sWPM      = parseInt(o.speakingWPM) || 130;
        var radius    = (o.cardRadius  || 16) + 'px';
        var inpRad    = (o.inputRadius || 8)  + 'px';
        var accentC   = o.accentColor      || '#6c3fb5';
        var labelC    = o.labelColor       || '#374151';
        var wrdC      = o.wordCountColor   || '#6c3fb5';
        var charC     = o.charCountColor   || '#3b82f6';
        var sentC     = o.sentenceColor    || '#10b981';
        var paraC     = o.paragraphColor   || '#f59e0b';
        var readC     = o.readingColor     || '#8b5cf6';
        var speakC    = o.speakingColor    || '#ec4899';
        var barFillC  = o.limitBarFill     || '#6c3fb5';
        var barOverC  = o.limitBarOver     || '#ef4444';
        var barBgC    = o.limitBarBg       || '#e5e7eb';
        var statBg    = o.statCardBg       || '#f5f3ff';
        var statBdr   = o.statCardBorder   || '#ede9fe';
        var txtaBg    = o.textareaBg       || '#f9fafb';
        var txtaBdr   = o.textareaBorder   || '#e5e7eb';
        var valSz     = o.statValueSize    || 36;
        var charLimit = parseInt(o.charLimit) || 500;

        app.innerHTML = '';
        app.style.fontFamily = 'inherit';
        app.style.boxSizing  = 'border-box';

        // Section wrapper
        var section = document.createElement('div');
        section.style.paddingTop    = (o.paddingTop || 60) + 'px';
        section.style.paddingBottom = (o.paddingBottom || 60) + 'px';
        section.style.background    = o.sectionBg || '';
        app.appendChild(section);

        var card = document.createElement('div');
        card.style.cssText = 'background:' + (o.cardBg || '#fff') + ';border-radius:' + radius + ';padding:36px 32px;max-width:' + (o.maxWidth || 680) + 'px;margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,.09);box-sizing:border-box;';
        section.appendChild(card);

        // Title / subtitle
        if (o.showTitle || o.showSubtitle) {
            var hdr = document.createElement('div');
            hdr.style.marginBottom = '20px';
            if (o.showTitle) {
                var ttl = document.createElement('div');
                ttl.className = 'bkbg-wrd-title';
                ttl.textContent   = o.title || 'Word Counter';
                ttl.style.color = o.titleColor || '#1e1b4b';
                hdr.appendChild(ttl);
            }
            if (o.showSubtitle && o.subtitle) {
                var sub = document.createElement('div');
                sub.className = 'bkbg-wrd-subtitle';
                sub.textContent   = o.subtitle;
                sub.style.color = o.subtitleColor || '#6b7280';
                hdr.appendChild(sub);
            }
            card.appendChild(hdr);
        }

        // Textarea
        var textarea = document.createElement('textarea');
        textarea.className   = 'bkbg-wrd-textarea';
        textarea.placeholder = o.placeholder || 'Start typing or paste your text here\u2026';
        textarea.value       = o.defaultText || '';
        textarea.style.cssText = 'width:100%;height:' + (o.textareaHeight || 200) + 'px;padding:14px 16px;border-radius:' + inpRad + ';border:2px solid ' + txtaBdr + ';background:' + txtaBg + ';font-size:15px;line-height:1.6;resize:vertical;outline:none;box-sizing:border-box;margin-bottom:16px;font-family:inherit;transition:border-color .2s;';
        textarea.addEventListener('focus', function () { textarea.style.borderColor = accentC; textarea.style.boxShadow = '0 0 0 3px rgba(108,63,181,.15)'; });
        textarea.addEventListener('blur',  function () {
            var over = o.showCharLimit && textarea.value.length > charLimit;
            textarea.style.borderColor = over ? barOverC : txtaBdr;
            textarea.style.boxShadow   = '';
        });
        textarea.addEventListener('input', update);
        card.appendChild(textarea);

        // Char limit bar
        var limitSection = null;
        var limitLabel   = null;
        var limitFill    = null;
        if (o.showCharLimit) {
            limitSection = document.createElement('div');
            limitSection.style.marginBottom = '16px';
            var limitRow = document.createElement('div');
            limitRow.style.cssText = 'display:flex;justify-content:space-between;font-size:12px;color:' + labelC + ';margin-bottom:5px;';
            var limitTitle = document.createElement('span'); limitTitle.textContent = 'Character Limit';
            limitLabel = document.createElement('span');
            limitRow.appendChild(limitTitle); limitRow.appendChild(limitLabel);
            limitSection.appendChild(limitRow);
            var limitTrack = document.createElement('div');
            limitTrack.className = 'bkbg-wrd-limit-bar-track';
            limitTrack.style.cssText = 'height:8px;border-radius:100px;background:' + barBgC + ';overflow:hidden;';
            limitFill = document.createElement('div');
            limitFill.className = 'bkbg-wrd-limit-bar-fill';
            limitFill.style.cssText = 'height:100%;width:0%;background:' + barFillC + ';border-radius:100px;transition:width .3s,background .3s;';
            limitTrack.appendChild(limitFill);
            limitSection.appendChild(limitTrack);
            card.appendChild(limitSection);
        }

        // Stats grid
        var statsGrid = document.createElement('div');
        statsGrid.className = 'bkbg-wrd-stats-grid';
        statsGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;';
        card.appendChild(statsGrid);

        // Stat definitions
        var statDefs = [
            { key: 'words',      label: 'Words',                val: 0, color: wrdC,   show: true },
            { key: 'chars',      label: 'Characters',           val: 0, color: charC,  show: true },
            { key: 'charsNoSp',  label: 'Chars (no spaces)',    val: 0, color: charC,  show: !!o.showCharNoSpaces },
            { key: 'sentences',  label: 'Sentences',            val: 0, color: sentC,  show: !!o.showSentences },
            { key: 'paragraphs', label: 'Paragraphs',           val: 0, color: paraC,  show: !!o.showParagraphs },
            { key: 'readTime',   label: 'Reading Time',         val: 0, color: readC,  show: !!o.showReadingTime },
            { key: 'speakTime',  label: 'Speaking Time',        val: 0, color: speakC, show: !!o.showSpeakingTime }
        ].filter(function(s) { return s.show; });

        var statEls = {};
        statDefs.forEach(function (s) {
            var card2 = document.createElement('div');
            card2.className = 'bkbg-wrd-stat-card';
            card2.style.cssText = 'background:' + statBg + ';border:1.5px solid ' + statBdr + ';border-radius:' + radius + ';padding:16px 14px;text-align:center;transition:transform .18s,box-shadow .18s;';
            var valEl = document.createElement('div');
            valEl.className = 'bkbg-wrd-stat-value';
            valEl.textContent  = '0';
            valEl.style.cssText = 'font-size:' + valSz + 'px;font-weight:800;color:' + s.color + ';line-height:1.1;';
            var lblEl = document.createElement('div');
            lblEl.textContent  = s.label;
            lblEl.style.cssText = 'font-size:12px;color:' + labelC + ';margin-top:4px;font-weight:600;';
            card2.appendChild(valEl);
            card2.appendChild(lblEl);
            statsGrid.appendChild(card2);
            statEls[s.key] = valEl;
        });

        function update() {
            var text  = textarea.value;
            var stats = analyzeText(text, rWPM, sWPM);
            var over  = o.showCharLimit && stats.chars > charLimit;

            // Update textarea border
            if (document.activeElement !== textarea) {
                textarea.style.borderColor = over ? barOverC : txtaBdr;
            }

            // Update stat cards
            if (statEls.words)      statEls.words.textContent     = stats.words;
            if (statEls.chars)      statEls.chars.textContent     = stats.chars;
            if (statEls.charsNoSp)  statEls.charsNoSp.textContent = stats.charsNoSp;
            if (statEls.sentences)  statEls.sentences.textContent = stats.sentences;
            if (statEls.paragraphs) statEls.paragraphs.textContent= stats.paragraphs;
            if (statEls.readTime)   statEls.readTime.textContent  = fmtTime(stats.readSec);
            if (statEls.speakTime)  statEls.speakTime.textContent = fmtTime(stats.speakSec);

            // Update limit bar
            if (o.showCharLimit && limitFill && limitLabel) {
                var pct = Math.min(100, (stats.chars / charLimit) * 100);
                limitFill.style.width      = pct.toFixed(1) + '%';
                limitFill.style.background = over ? barOverC : barFillC;
                limitLabel.textContent     = stats.chars + ' / ' + charLimit;
                limitLabel.style.color     = over ? barOverC : labelC;
                limitLabel.style.fontWeight= over ? '700' : '400';
            }
        }

        update();
    }

    document.querySelectorAll('.bkbg-wrd-app').forEach(buildApp);
})();
