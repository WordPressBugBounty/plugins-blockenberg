(function () {
    'use strict';

    var STOP_WORDS = { the:1,a:1,an:1,and:1,or:1,but:1,in:1,on:1,at:1,to:1,for:1,of:1,with:1,by:1,is:1,it:1,its:1,was:1,are:1,be:1,this:1,that:1,as:1,i:1,we:1,you:1,he:1,she:1,they:1,my:1,his:1,her:1,our:1,your:1,their:1,not:1,no:1,so:1,if:1,from:1,into:1,do:1,did:1,had:1,has:1,have:1,will:1,can:1,may:1,all:1,been:1,were:1 };

    function analyze(text) {
        var trimmed    = text.trim();
        var words      = trimmed ? trimmed.split(/\s+/).filter(function (w) { return w.replace(/[^a-zA-Z]/g,'').length > 0; }) : [];
        var sentences  = trimmed ? trimmed.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; }) : [];
        var paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(function (p) { return p.trim().length > 0; }) : [];
        var chars      = trimmed.length;
        var charsNoSp  = trimmed.replace(/\s/g, '').length;
        var cleanWords = words.map(function (w) { return w.replace(/[^a-zA-Z']/g,'').toLowerCase(); }).filter(function(w){ return w.length > 0; });
        var avgWordLen = cleanWords.length ? (cleanWords.map(function(w){ return w.length; }).reduce(function(a,b){return a+b;},0) / cleanWords.length) : 0;
        var avgSentLen = sentences.length ? (words.length / sentences.length) : 0;
        var readingS   = words.length / 200 * 60;
        var uniqueSet  = {};
        cleanWords.forEach(function (w) { uniqueSet[w] = true; });
        var uniqueWords = Object.keys(uniqueSet).length;
        var vocabRich   = cleanWords.length ? Math.round((uniqueWords / cleanWords.length) * 100) : 0;
        var longestWord = cleanWords.reduce(function (a,w) { return w.length > a.length ? w : a; }, '');

        // Frequency (skip stop words)
        var freq = {};
        cleanWords.forEach(function (w) {
            if (w.length > 1 && !STOP_WORDS[w]) freq[w] = (freq[w]||0) + 1;
        });
        var freqList = Object.keys(freq)
            .map(function (k) { return { word:k, count:freq[k] }; })
            .sort(function (a,b) { return b.count - a.count; });

        return { words:words.length, sentences:sentences.length, paragraphs:paragraphs.length,
                 chars:chars, charsNoSp:charsNoSp, avgWordLen:avgWordLen, avgSentLen:avgSentLen,
                 readingS:readingS, uniqueWords:uniqueWords, vocabRich:vocabRich,
                 longestWord:longestWord, freqList:freqList };
    }

    function fmtRead(secs) {
        if (secs < 60) return Math.ceil(secs) + 's';
        return Math.ceil(secs / 60) + ' min';
    }

    function buildBlock(root) {
        var o;
        try { o = JSON.parse(root.getAttribute('data-opts')); } catch (e) { return; }

        // CSS vars
        root.style.setProperty('--ta-accent',          o.accentColor   || '#8b5cf6');
        root.style.setProperty('--ta-bar-color',        o.barColor      || '#8b5cf6');
        root.style.setProperty('--ta-stat-bg',          o.statBg        || '#f5f3ff');
        root.style.setProperty('--ta-stat-num-color',   o.statNumColor  || '#6d28d9');
        root.style.setProperty('--ta-title-color',      o.titleColor    || '#111827');
        root.style.setProperty('--ta-subtitle-color',   o.subtitleColor || '#6b7280');
        root.style.setProperty('--ta-label-color',      o.labelColor    || '#374151');
        root.style.setProperty('--ta-input-bg',         o.inputBg       || '#f8fafc');
        root.style.setProperty('--ta-max-width',        (o.contentMaxWidth||760)+'px');

        var freqTopN = o.freqTopN || 8;

        // Build wrap
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-ta-wrap';
        wrap.style.background = o.sectionBg || '#faf5ff';
        root.appendChild(wrap);

        if (o.showTitle && o.title) {
            var h = document.createElement('h3');
            h.className = 'bkbg-ta-title';
            h.textContent = o.title;
            wrap.appendChild(h);
        }
        if (o.showSubtitle && o.subtitle) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-ta-subtitle';
            sub.textContent = o.subtitle;
            wrap.appendChild(sub);
        }

        // Copy button
        var copyRow = document.createElement('div');
        copyRow.className = 'bkbg-ta-copy-row';
        var copyBtn = document.createElement('button');
        copyBtn.className = 'bkbg-ta-copy-btn';
        copyBtn.textContent = '📋 Copy Text';
        copyBtn.addEventListener('click', function () {
            navigator.clipboard.writeText(textarea.value).then(function () {
                copyBtn.textContent = '✓ Copied!';
                setTimeout(function () { copyBtn.textContent = '📋 Copy Text'; }, 1500);
            });
        });
        copyRow.appendChild(copyBtn);
        wrap.appendChild(copyRow);

        // Textarea
        var textarea = document.createElement('textarea');
        textarea.className = 'bkbg-ta-input';
        textarea.rows = 7;
        textarea.placeholder = o.placeholder || 'Paste your text here…';
        textarea.value = o.defaultText || '';
        wrap.appendChild(textarea);

        // Results zone
        var results = document.createElement('div');
        wrap.appendChild(results);

        // ── Render results ──
        var timer = null;
        function render() {
            var text = textarea.value;
            var res  = analyze(text);
            results.innerHTML = '';

            if (!text.trim()) {
                var empty = document.createElement('div');
                empty.className = 'bkbg-ta-empty';
                empty.textContent = '✏️ Paste or type text above to see analysis';
                results.appendChild(empty);
                return;
            }

            // Basic stats
            if (o.showBasicStats) {
                var bHead = document.createElement('div');
                bHead.className = 'bkbg-ta-section-head';
                bHead.textContent = '📊 Basic Statistics';
                results.appendChild(bHead);

                var bGrid = document.createElement('div');
                bGrid.className = 'bkbg-ta-stats-grid';
                [
                    { label:'Words',       val: res.words       },
                    { label:'Characters',  val: res.chars       },
                    { label:'No Spaces',   val: res.charsNoSp   },
                    { label:'Sentences',   val: res.sentences   },
                    { label:'Paragraphs',  val: res.paragraphs  },
                    { label:'Read Time',   val: fmtRead(res.readingS) }
                ].forEach(function (s) {
                    var card = document.createElement('div');
                    card.className = 'bkbg-ta-stat';
                    var num = document.createElement('div');
                    num.className = 'bkbg-ta-stat-num';
                    num.textContent = s.val;
                    var lbl = document.createElement('div');
                    lbl.className = 'bkbg-ta-stat-label';
                    lbl.textContent = s.label;
                    card.appendChild(num);
                    card.appendChild(lbl);
                    bGrid.appendChild(card);
                });
                results.appendChild(bGrid);
            }

            // Vocab stats
            if (o.showVocabStats) {
                var vHead = document.createElement('div');
                vHead.className = 'bkbg-ta-section-head';
                vHead.textContent = '📚 Vocabulary Insights';
                results.appendChild(vHead);

                var vGrid = document.createElement('div');
                vGrid.className = 'bkbg-ta-stats-grid';
                var vItems = [
                    { label:'Unique Words',  val: res.uniqueWords },
                    { label:'Vocabulary %',  val: res.vocabRich + '%' },
                    { label:'Avg Word Len',  val: res.avgWordLen.toFixed(1) + ' ch' },
                    { label:'Avg Sent Len',  val: res.avgSentLen.toFixed(1) + ' wds' }
                ];
                if (o.showLongestWord && res.longestWord) {
                    vItems.push({ label:'Longest Word', val: res.longestWord });
                }
                vItems.forEach(function (s) {
                    var card = document.createElement('div');
                    card.className = 'bkbg-ta-stat';
                    var num = document.createElement('div');
                    num.className = 'bkbg-ta-stat-num';
                    num.style.fontSize = s.label === 'Longest Word' ? '16px' : '';
                    num.textContent = s.val;
                    var lbl = document.createElement('div');
                    lbl.className = 'bkbg-ta-stat-label';
                    lbl.textContent = s.label;
                    card.appendChild(num);
                    card.appendChild(lbl);
                    vGrid.appendChild(card);
                });
                results.appendChild(vGrid);
            }

            // Frequency chart
            if (o.showFrequency && res.freqList.length > 0) {
                var fHead = document.createElement('div');
                fHead.className = 'bkbg-ta-section-head';
                fHead.textContent = '🔠 Top Words (stop words excluded)';
                results.appendChild(fHead);

                var fList = document.createElement('div');
                fList.className = 'bkbg-ta-freq-list';

                var topItems = res.freqList.slice(0, freqTopN);
                var maxFreq  = topItems.length > 0 ? topItems[0].count : 1;

                topItems.forEach(function (item) {
                    var row = document.createElement('div');
                    row.className = 'bkbg-ta-freq-row';

                    var word = document.createElement('div');
                    word.className = 'bkbg-ta-freq-word';
                    word.textContent = item.word;
                    word.title = item.word;

                    var track = document.createElement('div');
                    track.className = 'bkbg-ta-freq-track';
                    var bar = document.createElement('div');
                    bar.className = 'bkbg-ta-freq-bar';
                    bar.style.width = Math.round((item.count / maxFreq) * 100) + '%';
                    track.appendChild(bar);

                    var cnt = document.createElement('div');
                    cnt.className = 'bkbg-ta-freq-count';
                    cnt.textContent = item.count;

                    row.appendChild(word);
                    row.appendChild(track);
                    row.appendChild(cnt);
                    fList.appendChild(row);
                });
                results.appendChild(fList);
            }
        }

        // Debounced live update
        textarea.addEventListener('input', function () {
            clearTimeout(timer);
            timer = setTimeout(render, 150);
        });

        render();
    }

    document.querySelectorAll('.bkbg-ta-app').forEach(buildBlock);
})();
