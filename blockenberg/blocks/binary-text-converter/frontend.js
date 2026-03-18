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

    // ---------- Conversion helpers ----------
    function textToBinary(text) {
        return text.split('').map(function (c) {
            return c.charCodeAt(0).toString(2).padStart(8, '0');
        }).join(' ');
    }
    function binaryToText(bin) {
        var parts = bin.trim().split(/\s+/);
        for (var i = 0; i < parts.length; i++) {
            if (!/^[01]{1,8}$/.test(parts[i])) throw new Error('Invalid binary: "' + parts[i] + '"');
        }
        return parts.map(function (b) { return String.fromCharCode(parseInt(b, 2)); }).join('');
    }
    function textToHex(text) {
        return text.split('').map(function (c) {
            return c.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase();
        }).join(' ');
    }
    function hexToText(hex) {
        var parts = hex.trim().split(/\s+/);
        for (var i = 0; i < parts.length; i++) {
            if (!/^[0-9a-fA-F]{1,2}$/.test(parts[i])) throw new Error('Invalid hex: "' + parts[i] + '"');
        }
        return parts.map(function (h) { return String.fromCharCode(parseInt(h, 16)); }).join('');
    }
    function textToOctal(text) {
        return text.split('').map(function (c) {
            return c.charCodeAt(0).toString(8).padStart(3, '0');
        }).join(' ');
    }
    function octalToText(oct) {
        var parts = oct.trim().split(/\s+/);
        for (var i = 0; i < parts.length; i++) {
            if (!/^[0-7]{1,3}$/.test(parts[i])) throw new Error('Invalid octal: "' + parts[i] + '"');
        }
        return parts.map(function (o) { return String.fromCharCode(parseInt(o, 8)); }).join('');
    }

    var TABS = [
        { id: 'binary', label: 'Binary',      color: null },
        { id: 'hex',    label: 'Hexadecimal', color: null },
        { id: 'octal',  label: 'Octal',       color: null }
    ];

    // ASCII label for special characters
    function asciiChar(code) {
        var specials = { 0:'NUL',1:'SOH',2:'STX',3:'ETX',4:'EOT',5:'ENQ',6:'ACK',7:'BEL',8:'BS',9:'TAB',10:'LF',11:'VT',12:'FF',13:'CR',14:'SO',15:'SI',16:'DLE',17:'DC1',18:'DC2',19:'DC3',20:'DC4',21:'NAK',22:'SYN',23:'ETB',24:'CAN',25:'EM',26:'SUB',27:'ESC',28:'FS',29:'GS',30:'RS',31:'US',32:'SPC',127:'DEL' };
        return specials[code] || String.fromCharCode(code);
    }

    function initApp(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) { return; }

        var accent      = opts.accentColor  || '#6c3fb5';
        var binColor    = opts.binaryColor  || '#6c3fb5';
        var hexColor    = opts.hexColor     || '#0ea5e9';
        var octColor    = opts.octalColor   || '#10b981';
        var asciiClr    = opts.asciiColor   || '#f59e0b';
        var cardR       = (opts.cardRadius  || 16) + 'px';
        var tabR        = (opts.tabRadius   || 8)  + 'px';
        var inpR        = (opts.inputRadius || 8)  + 'px';
        var maxW        = (opts.maxWidth    || 700) + 'px';
        var lblClr      = opts.labelColor   || '#374151';
        var errC        = opts.errorColor   || '#ef4444';

        var tabColors = { binary: binColor, hex: hexColor, octal: octColor };

        TABS[0].color = binColor; TABS[1].color = hexColor; TABS[2].color = octColor;

        app.style.paddingTop    = (opts.paddingTop    || 60) + 'px';
        app.style.paddingBottom = (opts.paddingBottom || 60) + 'px';
        if (opts.sectionBg) app.style.background = opts.sectionBg;

        typoCssVarsForEl(opts.titleTypo, '--bkbg-btc-title-', app);
        typoCssVarsForEl(opts.subtitleTypo, '--bkbg-btc-sub-', app);

        var card = document.createElement('div');
        card.className = 'bkbg-btc-card';
        Object.assign(card.style, { background: opts.cardBg || '#fff', borderRadius: cardR, maxWidth: maxW });
        app.appendChild(card);

        if (opts.showTitle && opts.title) {
            var ttl = document.createElement('div'); ttl.className = 'bkbg-btc-title';
            ttl.textContent = opts.title; if (opts.titleColor) ttl.style.color = opts.titleColor;
            card.appendChild(ttl);
        }
        if (opts.showSubtitle && opts.subtitle) {
            var sub = document.createElement('div'); sub.className = 'bkbg-btc-subtitle';
            sub.textContent = opts.subtitle; if (opts.subtitleColor) sub.style.color = opts.subtitleColor;
            card.appendChild(sub);
        }

        var activeTab  = opts.defaultTab  || 'binary';
        var activeMode = opts.defaultMode || 'encode';

        // Tabs
        var tabsRow = document.createElement('div'); tabsRow.className = 'bkbg-btc-tabs'; card.appendChild(tabsRow);
        var tabBtns = {};
        TABS.forEach(function (t) {
            var b = document.createElement('button'); b.className = 'bkbg-btc-tab'; b.textContent = t.label;
            b.style.borderRadius = tabR;
            b.addEventListener('click', function () { activeTab = t.id; refreshTabs(); clearIO(); });
            tabBtns[t.id] = b; tabsRow.appendChild(b);
        });
        function refreshTabs() {
            TABS.forEach(function (t) {
                var b = tabBtns[t.id]; var active = t.id === activeTab; var c = t.color;
                b.style.background    = active ? c : 'transparent';
                b.style.color         = active ? '#fff' : c;
                b.style.borderColor   = active ? c : (opts.inputBorder || '#d1d5db');
            });
        }
        refreshTabs();

        // Mode row
        var modeRow = document.createElement('div'); modeRow.className = 'bkbg-btc-mode-row'; card.appendChild(modeRow);
        var mLbl = document.createElement('span'); mLbl.className = 'bkbg-btc-mode-label'; mLbl.textContent = 'Direction:'; modeRow.appendChild(mLbl);
        var mBtns = {};
        [{ id: 'encode', label: '📝 Text → Code' }, { id: 'decode', label: '🔓 Code → Text' }].forEach(function (m) {
            var b = document.createElement('button'); b.className = 'bkbg-btc-mode-btn'; b.textContent = m.label;
            b.addEventListener('click', function () { activeMode = m.id; refreshModes(); updateLabels(); clearIO(); });
            mBtns[m.id] = b; modeRow.appendChild(b);
        });
        function refreshModes() {
            Object.keys(mBtns).forEach(function (k) {
                var b = mBtns[k]; var active = k === activeMode; var c = tabColors[activeTab] || accent;
                b.style.background  = active ? c : 'transparent';
                b.style.color       = active ? '#fff' : '#6b7280';
                b.style.borderColor = active ? c : (opts.inputBorder || '#d1d5db');
            });
        }
        refreshModes();

        // Input
        var inpLbl = document.createElement('label'); inpLbl.className = 'bkbg-btc-lbl'; inpLbl.style.color = lblClr; card.appendChild(inpLbl);
        var inp = document.createElement('textarea'); inp.className = 'bkbg-btc-textarea';
        inp.style.borderRadius = inpR; inp.style.background = opts.inputBg || '#f9fafb';
        inp.style.borderColor = opts.inputBorder || '#d1d5db';
        inp.addEventListener('input', function () { errorEl.textContent = ''; });
        card.appendChild(inp);

        // Convert button
        var cvtBtn = document.createElement('button'); cvtBtn.className = 'bkbg-btc-convert-btn';
        card.appendChild(cvtBtn);

        // Error
        var errorEl = document.createElement('div'); errorEl.className = 'bkbg-btc-error'; errorEl.style.color = errC; card.appendChild(errorEl);

        // Output
        var outLbl = document.createElement('label'); outLbl.className = 'bkbg-btc-lbl'; outLbl.style.color = lblClr; card.appendChild(outLbl);
        var outBox = document.createElement('div'); outBox.className = 'bkbg-btc-output bkbg-btc-output-empty';
        outBox.style.borderRadius = inpR; outBox.style.background = opts.outputBg || '#f0f9ff';
        outBox.style.border = '1.5px solid ' + (opts.outputBorder || '#bae6fd');
        outBox.textContent = 'Result will appear here…'; card.appendChild(outBox);

        // Stats + copy row
        var statsRow = document.createElement('div'); statsRow.className = 'bkbg-btc-stats'; card.appendChild(statsRow);
        var statChars = document.createElement('span'); statsRow.appendChild(statChars);
        var statBits  = document.createElement('span'); statsRow.appendChild(statBits);
        var copyBtn = document.createElement('button'); copyBtn.className = 'bkbg-btc-copy-btn';
        copyBtn.textContent = '📋 Copy'; copyBtn.style.marginLeft = 'auto';
        copyBtn.addEventListener('click', function () {
            var text = outBox.textContent;
            if (!text || outBox.classList.contains('bkbg-btc-output-empty')) return;
            navigator.clipboard.writeText(text).then(function () {
                copyBtn.textContent = '✅ Copied!'; setTimeout(function () { copyBtn.textContent = '📋 Copy'; }, 1500);
            }).catch(function () {});
        });
        statsRow.appendChild(copyBtn);

        var currentOutput = '';

        function updateLabels() {
            var c = tabColors[activeTab] || accent;
            cvtBtn.style.background = c;
            if (activeMode === 'encode') {
                inpLbl.textContent = 'Plain Text Input';
                outLbl.textContent = activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + ' Output';
                cvtBtn.textContent = '→ Encode to ' + (activeTab === 'hex' ? 'Hexadecimal' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
                inp.placeholder = 'Type or paste text here…';
            } else {
                inpLbl.textContent = (activeTab === 'hex' ? 'Hexadecimal' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)) + ' Input';
                outLbl.textContent = 'Decoded Text';
                cvtBtn.textContent = '← Decode from ' + (activeTab === 'hex' ? 'Hexadecimal' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
                var examples = { binary:'01001000 01101001', hex:'48 69', octal:'110 151' };
                inp.placeholder = 'e.g. ' + (examples[activeTab] || '');
            }
        }
        updateLabels();

        function clearIO() {
            inp.value = ''; outBox.textContent = 'Result will appear here…';
            outBox.className = 'bkbg-btc-output bkbg-btc-output-empty';
            errorEl.textContent = ''; statChars.textContent = ''; statBits.textContent = '';
            currentOutput = ''; updateLabels(); refreshModes(); refreshTabs();
        }

        function convert() {
            errorEl.textContent = '';
            var val = inp.value;
            if (!val.trim()) { outBox.textContent = 'Result will appear here…'; outBox.className='bkbg-btc-output bkbg-btc-output-empty'; return; }
            try {
                var result;
                if (activeMode === 'encode') {
                    if (activeTab === 'binary') result = textToBinary(val);
                    else if (activeTab === 'hex')  result = textToHex(val);
                    else                           result = textToOctal(val);
                } else {
                    if (activeTab === 'binary') result = binaryToText(val);
                    else if (activeTab === 'hex')  result = hexToText(val);
                    else                           result = octalToText(val);
                }
                currentOutput = result;
                outBox.textContent = result;
                outBox.className = 'bkbg-btc-output';
                outBox.style.color = activeMode === 'decode' ? '#111827' : (tabColors[activeTab] || accent);
                // Stats
                var chars = result.length;
                statChars.textContent = chars + ' chars';
                if (activeMode === 'encode' && activeTab === 'binary') {
                    statBits.textContent = '| ' + (val.length * 8) + ' bits';
                } else { statBits.textContent = ''; }
            } catch (err) {
                errorEl.textContent = '❗ ' + err.message;
                outBox.textContent = 'Result will appear here…'; outBox.className='bkbg-btc-output bkbg-btc-output-empty';
            }
        }

        cvtBtn.addEventListener('click', convert);
        inp.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); convert(); }
        });

        // ASCII Table
        if (opts.showAsciiTable !== false) {
            var divider = document.createElement('hr'); divider.className = 'bkbg-btc-divider'; card.appendChild(divider);
            var ascTitle = document.createElement('div'); ascTitle.className = 'bkbg-btc-ascii-title'; ascTitle.style.color = asciiClr;
            ascTitle.textContent = 'ASCII Reference Table'; card.appendChild(ascTitle);

            var asciiFilter = 'printable';
            var filtersRow = document.createElement('div'); filtersRow.className = 'bkbg-btc-ascii-filters'; card.appendChild(filtersRow);
            var fBtns = {};
            [{ id: 'printable', label: 'Printable (32–126)' }, { id: 'all', label: 'All (0–127)' }, { id: 'control', label: 'Control (0–31)' }].forEach(function (f) {
                var b = document.createElement('button'); b.className = 'bkbg-btc-ascii-filter-btn'; b.textContent = f.label;
                b.addEventListener('click', function () { asciiFilter = f.id; refreshFilters(); renderAscii(); });
                fBtns[f.id] = b; filtersRow.appendChild(b);
            });
            function refreshFilters() {
                Object.keys(fBtns).forEach(function (k) {
                    var b = fBtns[k]; var active = k === asciiFilter;
                    b.style.background  = active ? asciiClr : 'transparent';
                    b.style.color       = active ? '#fff' : '#6b7280';
                    b.style.borderColor = active ? asciiClr : '#d1d5db';
                });
            }
            refreshFilters();

            var tableWrap = document.createElement('div'); tableWrap.style.overflowX = 'auto'; card.appendChild(tableWrap);
            var table = document.createElement('table'); table.className = 'bkbg-btc-ascii-table'; tableWrap.appendChild(table);
            var thead = document.createElement('thead'); table.appendChild(thead);
            var theadRow = document.createElement('tr'); thead.appendChild(theadRow);
            ['Dec','Hex','Oct','Bin','Char'].forEach(function (h) {
                var th = document.createElement('th'); th.textContent = h; theadRow.appendChild(th);
            });
            var tbody = document.createElement('tbody'); table.appendChild(tbody);

            function renderAscii() {
                tbody.innerHTML = '';
                var start = asciiFilter === 'control' ? 0 : 32;
                var end   = asciiFilter === 'control' ? 32 : (asciiFilter === 'all' ? 128 : 127);
                for (var i = start; i < end; i++) {
                    var isControl = i < 32 || i === 127;
                    var row = document.createElement('tr');
                    var ch = asciiChar(i);
                    var isSpecial = isControl || i === 32;
                    var data = [
                        { text: i.toString(),                         cls: '' },
                        { text: i.toString(16).toUpperCase().padStart(2,'0'), cls: 'bkbg-btc-stat', style: 'color:'+hexColor },
                        { text: i.toString(8).padStart(3,'0'),        cls: 'bkbg-btc-stat', style: 'color:'+octColor },
                        { text: i.toString(2).padStart(8,'0'),        cls: 'bkbg-btc-ascii-dim' },
                        { text: ch, cls: isSpecial ? 'bkbg-btc-ascii-dim' : 'bkbg-btc-ascii-char', style: isSpecial ? '' : 'color:'+asciiClr }
                    ];
                    data.forEach(function (d) {
                        var td = document.createElement('td'); td.textContent = d.text; td.className = d.cls;
                        if (d.style) td.style.cssText = d.style; row.appendChild(td);
                    });
                    // Click to insert char into input
                    if (!isControl) {
                        row.style.cursor = 'pointer';
                        row.title = 'Click to insert "' + ch + '" into input';
                        row.addEventListener('click', function (ch) { return function () { inp.value += ch; }; }(ch));
                    }
                    tbody.appendChild(row);
                }
            }
            renderAscii();
        }
    }

    document.querySelectorAll('.bkbg-btc-app').forEach(initApp);
})();
