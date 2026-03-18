(function () {
    'use strict';

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

    var LOREM_WORDS = [
        'lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit',
        'sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore',
        'magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation',
        'ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat',
        'duis','aute','irure','in','reprehenderit','voluptate','velit','esse',
        'cillum','eu','fugiat','nulla','pariatur','excepteur','sint','occaecat',
        'cupidatat','non','proident','sunt','culpa','qui','officia','deserunt',
        'mollit','anim','id','est','laborum','perspiciatis','unde','omnis','iste',
        'natus','error','accusantium','doloremque','laudantium','totam','rem',
        'aperiam','eaque','ipsa','quae','ab','illo','inventore','veritatis',
        'architecto','beatae','vitae','dicta','explicabo','nemo','ipsam','quia',
        'voluptas','aspernatur','odit','fugit','accusamus','iusto','odio','dignissimos',
        'blanditiis','praesentium','voluptatum','deleniti','atque','corrupti',
        'quos','dolores','quas','molestias','excepturi','occaecati','cupiditate',
        'provident','similique','mollitia','animi','dolorem','porro','quisquam','eum',
        'nihil','quo','maxime','placeat','facere','possimus','omnis','voluptatem',
        'suscipit','eligendi','optio','cumque','impedit','quo','minus','illum','vero'
    ];

    var LOREM_CLASSIC_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomWord() {
        return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
    }

    function generateSentence(wordsMin, wordsMax) {
        var n = rand(wordsMin || 8, wordsMax || 18);
        var words = [];
        for (var i = 0; i < n; i++) words.push(randomWord());
        var sentence = words.join(' ');
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        var endings = ['.', '.', '.', '!', '?'];
        return sentence + endings[Math.floor(Math.random() * endings.length)];
    }

    function generateParagraph(sentenceCountMin, sentenceCountMax) {
        var n = rand(sentenceCountMin || 4, sentenceCountMax || 7);
        var sents = [];
        for (var i = 0; i < n; i++) sents.push(generateSentence());
        return sents.join(' ');
    }

    function buildOutput(opts, mode, count, useLorem, useHtml) {
        var html = useHtml;
        if (mode === 'paragraphs') {
            var paras = [];
            for (var i = 0; i < count; i++) {
                var p = (i === 0 && useLorem) ? LOREM_CLASSIC_START + ' ' + generateParagraph(3, 6) : generateParagraph();
                paras.push(html ? '<p>' + p + '</p>' : p);
            }
            return html ? paras.join('\n') : paras.join('\n\n');
        }
        if (mode === 'sentences') {
            var sents = [];
            for (var i = 0; i < count; i++) {
                var s = (i === 0 && useLorem) ? LOREM_CLASSIC_START : generateSentence();
                sents.push(s);
            }
            return sents.join(html ? '\n' : '\n');
        }
        if (mode === 'words') {
            var first = useLorem ? 'Lorem ipsum dolor sit amet consectetur adipiscing elit'.split(' ') : [];
            var words = first.slice(0, Math.min(first.length, count));
            while (words.length < count) words.push(randomWord());
            return words.slice(0, count).join(' ');
        }
        if (mode === 'list') {
            var items = [];
            var startWords = useLorem ? ['Lorem','Ipsum','Dolor','Sit','Amet','Consectetur','Adipiscing','Elit'] : [];
            for (var i = 0; i < count; i++) {
                var itemWords = [];
                var len = rand(3, 7);
                if (i < startWords.length && useLorem) itemWords.push(startWords[i]);
                while (itemWords.length < len) itemWords.push(randomWord());
                var item = itemWords.join(' ');
                item = item.charAt(0).toUpperCase() + item.slice(1);
                items.push(item);
            }
            if (html) {
                return '<ul>\n' + items.map(function(it){ return '  <li>' + it + '</li>'; }).join('\n') + '\n</ul>';
            }
            return items.map(function(it, idx){ return (idx + 1) + '. ' + it; }).join('\n');
        }
        return '';
    }

    function plainText(mode, count, useLorem) {
        return buildOutput(null, mode, count, useLorem, false);
    }

    function htmlText(mode, count, useLorem) {
        return buildOutput(null, mode, count, useLorem, true);
    }

    function countWords(text) {
        var plain = text.replace(/<[^>]+>/g, ' ');
        var cleaned = plain.trim().replace(/\s+/g, ' ');
        return cleaned ? cleaned.split(' ').length : 0;
    }

    function countChars(text) {
        return text.replace(/<[^>]+>/g, '').length;
    }

    document.querySelectorAll('.bkbg-lig-app').forEach(function (root) {
        var opts = {};
        try { opts = JSON.parse(root.getAttribute('data-opts') || '{}'); } catch(e) {}

        /* Apply typography CSS vars */
        typoCssVarsForEl(root, opts.titleTypo, '--bkbg-lig-tt-');
        typoCssVarsForEl(root, opts.subtitleTypo, '--bkbg-lig-st-');
        typoCssVarsForEl(root, opts.outputTypo, '--bkbg-lig-out-');

        var mode  = opts.defaultMode  || 'paragraphs';
        var count = parseInt(opts.defaultCount) || 3;
        var showHtmlToggle = opts.showHtmlToggle !== false;
        var showStats      = opts.showStats      !== false;
        var startWithLorem = opts.startWithLorem !== false;
        var outputHeight   = parseInt(opts.outputHeight)   || 260;

        var accentColor    = opts.accentColor    || '#6c3fb5';
        var sectionBg      = opts.sectionBg      || '#f5f3ff';
        var cardBg         = opts.cardBg         || '#ffffff';
        var outputBg       = opts.outputBg       || '#fafafa';
        var outputBorder   = opts.outputBorder   || '#e5e7eb';
        var outputTextColor= opts.outputTextColor|| '#374151';
        var titleColor     = opts.titleColor     || '#111827';
        var subtitleColor  = opts.subtitleColor  || '#6b7280';
        var labelColor     = opts.labelColor     || '#374151';
        var tabBg          = opts.tabBg          || '#f3f4f6';

        var useHtml = false;
        var generatedPlain = '';
        var generatedHtml  = '';

        // Build HTML
        root.innerHTML =
            '<div class="bkbg-lig-card" style="background:' + cardBg + ';border-radius:16px;">' +
                '<h2 class="bkbg-lig-title" style="color:' + titleColor + ';">' + (opts.title || 'Lorem Ipsum Generator') + '</h2>' +
                '<p class="bkbg-lig-subtitle" style="color:' + subtitleColor + ';">' + (opts.subtitle || 'Generate placeholder text for your designs and documents') + '</p>' +
                '<div class="bkbg-lig-tabs" style="background:' + tabBg + ';" id="lig-tabs"></div>' +
                '<div class="bkbg-lig-controls">' +
                    '<div class="bkbg-lig-count-wrap" style="background:' + sectionBg + ';color:' + labelColor + ';">' +
                        '<span style="font-size:13px;font-weight:600;margin-right:4px;">Count:</span>' +
                        '<button class="bkbg-lig-count-btn" id="lig-dec">−</button>' +
                        '<span class="bkbg-lig-count-val" id="lig-count-val">' + count + '</span>' +
                        '<button class="bkbg-lig-count-btn" id="lig-inc">+</button>' +
                    '</div>' +
                    '<button class="bkbg-lig-btn" id="lig-generate" style="background:' + accentColor + ';color:#fff;">Generate</button>' +
                    '<button class="bkbg-lig-btn bkbg-lig-btn-sec" id="lig-copy">📋 Copy</button>' +
                    '<span class="bkbg-lig-copied" id="lig-copied">Copied!</span>' +
                '</div>' +
                (showHtmlToggle ?
                    '<div class="bkbg-lig-opts">' +
                        '<label class="bkbg-lig-check-lbl" style="color:' + labelColor + ';">' +
                            '<input type="checkbox" id="lig-lorem-chk"' + (startWithLorem ? ' checked' : '') + '> Start with "Lorem ipsum…"' +
                        '</label>' +
                        '<label class="bkbg-lig-check-lbl" style="color:' + labelColor + ';">' +
                            '<input type="checkbox" id="lig-html-chk"> HTML output' +
                        '</label>' +
                    '</div>'
                    : '') +
                '<div class="bkbg-lig-output" id="lig-output" style="background:' + outputBg + ';color:' + outputTextColor + ';border-color:' + outputBorder + ';min-height:' + outputHeight + 'px;" tabindex="0"></div>' +
                (showStats ? '<div class="bkbg-lig-stats" id="lig-stats"></div>' : '') +
            '</div>';

        var MODES = [
            { key: 'paragraphs', label: 'Paragraphs' },
            { key: 'sentences',  label: 'Sentences'  },
            { key: 'words',      label: 'Words'       },
            { key: 'list',       label: 'List'        }
        ];

        var tabsEl    = root.querySelector('#lig-tabs');
        var countVal  = root.querySelector('#lig-count-val');
        var decBtn    = root.querySelector('#lig-dec');
        var incBtn    = root.querySelector('#lig-inc');
        var genBtn    = root.querySelector('#lig-generate');
        var copyBtn   = root.querySelector('#lig-copy');
        var copiedEl  = root.querySelector('#lig-copied');
        var outputEl  = root.querySelector('#lig-output');
        var statsEl   = root.querySelector('#lig-stats');
        var loremChk  = root.querySelector('#lig-lorem-chk');
        var htmlChk   = root.querySelector('#lig-html-chk');

        function renderTabs() {
            tabsEl.innerHTML = '';
            MODES.forEach(function(m) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-lig-tab';
                btn.textContent = m.label;
                var active = m.key === mode;
                btn.style.background = active ? accentColor : 'transparent';
                btn.style.color = active ? '#fff' : labelColor;
                btn.setAttribute('data-mode', m.key);
                tabsEl.appendChild(btn);
            });
        }

        function generate() {
            var useLorem = loremChk ? loremChk.checked : startWithLorem;
            generatedPlain = plainText(mode, count, useLorem);
            generatedHtml  = htmlText(mode, count, useLorem);
            useHtml = htmlChk ? htmlChk.checked : false;
            renderOutput();
        }

        function renderOutput() {
            if (useHtml) {
                outputEl.innerHTML = generatedHtml;
            } else {
                // Use innerHTML with <br> for newlines so it looks right
                var escaped = generatedPlain.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                outputEl.innerHTML = escaped.replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>');
                var d = document.createElement('div');
                d.innerHTML = '<p>' + escaped.replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>') + '</p>';
                outputEl.innerHTML = '<p>' + escaped.replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>') + '</p>';
            }
            if (statsEl) {
                var raw = useHtml ? generatedHtml : generatedPlain;
                var wc = countWords(raw);
                var cc = countChars(raw);
                statsEl.innerHTML =
                    '<span>Words: <strong>' + wc + '</strong></span>' +
                    '<span>Characters: <strong>' + cc + '</strong></span>';
            }
        }

        tabsEl.addEventListener('click', function(e) {
            var btn = e.target.closest('[data-mode]');
            if (!btn) return;
            mode = btn.getAttribute('data-mode');
            renderTabs();
            generate();
        });

        decBtn.addEventListener('click', function() {
            if (count > 1) { count--; countVal.textContent = count; }
        });
        incBtn.addEventListener('click', function() {
            if (count < 50) { count++; countVal.textContent = count; }
        });
        genBtn.addEventListener('click', generate);

        if (loremChk) loremChk.addEventListener('change', generate);
        if (htmlChk)  htmlChk.addEventListener('change', function() { useHtml = htmlChk.checked; renderOutput(); });

        copyBtn.addEventListener('click', function() {
            var text = useHtml ? generatedHtml : generatedPlain;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(showCopied).catch(fallbackCopy.bind(null, text));
            } else {
                fallbackCopy(text);
            }
        });

        function fallbackCopy(text) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed'; ta.style.top = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); showCopied(); } catch(e) {}
            document.body.removeChild(ta);
        }

        function showCopied() {
            if (!copiedEl) return;
            copiedEl.style.display = 'inline-block';
            setTimeout(function() { copiedEl.style.display = 'none'; }, 2000);
        }

        root.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                generate();
            }
        });

        renderTabs();
        generate();
    });

})();
