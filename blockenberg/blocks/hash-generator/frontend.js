(function () {
    'use strict';

    // ── Tiny MD5 (pure JS, no external deps) ────────────────────────────
    // Based on the public-domain MD5 algorithm by MD5 Specification (RFC 1321)
    function md5(str) {
        function safeAdd(x, y) { var lsw=(x&0xffff)+(y&0xffff); return (((x>>16)+(y>>16)+(lsw>>16))<<16)|(lsw&0xffff); }
        function bitRotateLeft(num, cnt) { return (num<<cnt)|(num>>>(32-cnt)); }
        function md5cmn(q,a,b,x,s,t){ return safeAdd(bitRotateLeft(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b); }
        function md5ff(a,b,c,d,x,s,t){ return md5cmn((b&c)|((~b)&d),a,b,x,s,t); }
        function md5gg(a,b,c,d,x,s,t){ return md5cmn((b&d)|(c&(~d)),a,b,x,s,t); }
        function md5hh(a,b,c,d,x,s,t){ return md5cmn(b^c^d,a,b,x,s,t); }
        function md5ii(a,b,c,d,x,s,t){ return md5cmn(c^(b|(~d)),a,b,x,s,t); }

        var bs = [];
        for (var i=0;i<str.length*8;i+=8){ bs[i>>5]|=(str.charCodeAt(i/8)&0xff)<<(i%32); }
        var len=str.length*8;
        bs[len>>5]|=0x80<<(len%32);
        bs[(((len+64)>>>9)<<4)+14]=len;

        var a=1732584193,b=-271733879,c=-1732584194,d=271733878;
        for(var blk=0;blk<bs.length;blk+=16){
            var oa=a,ob=b,oc=c,od=d,M=bs.slice(blk,blk+16);
            a=md5ff(a,b,c,d,M[0], 7,-680876936); d=md5ff(d,a,b,c,M[1],12,-389564586); c=md5ff(c,d,a,b,M[2],17, 606105819); b=md5ff(b,c,d,a,M[3],22,-1044525330);
            a=md5ff(a,b,c,d,M[4], 7,-176418897); d=md5ff(d,a,b,c,M[5],12,1200080426);  c=md5ff(c,d,a,b,M[6],17,-1473231341);b=md5ff(b,c,d,a,M[7],22,-45705983);
            a=md5ff(a,b,c,d,M[8], 7,1770035416); d=md5ff(d,a,b,c,M[9],12,-1958414417); c=md5ff(c,d,a,b,M[10],17,-42063);    b=md5ff(b,c,d,a,M[11],22,-1990404162);
            a=md5ff(a,b,c,d,M[12],7,1804603682); d=md5ff(d,a,b,c,M[13],12,-40341101);  c=md5ff(c,d,a,b,M[14],17,-1502002290);b=md5ff(b,c,d,a,M[15],22,1236535329);
            a=md5gg(a,b,c,d,M[1], 5,-165796510); d=md5gg(d,a,b,c,M[6], 9,-1069501632);c=md5gg(c,d,a,b,M[11],14, 643717713);b=md5gg(b,c,d,a,M[0],20,-373897302);
            a=md5gg(a,b,c,d,M[5], 5,-701558691); d=md5gg(d,a,b,c,M[10],9, 38016083);  c=md5gg(c,d,a,b,M[15],14,-660478335);b=md5gg(b,c,d,a,M[4],20,-405537848);
            a=md5gg(a,b,c,d,M[9], 5, 568446438); d=md5gg(d,a,b,c,M[14],9,-1019803690);c=md5gg(c,d,a,b,M[3],14,-187363961); b=md5gg(b,c,d,a,M[8],20,1163531501);
            a=md5gg(a,b,c,d,M[13],5,-1444681467);d=md5gg(d,a,b,c,M[2], 9,-51403784);  c=md5gg(c,d,a,b,M[7],14,1735328473); b=md5gg(b,c,d,a,M[12],20,-1926607734);
            a=md5hh(a,b,c,d,M[5], 4,-378558);    d=md5hh(d,a,b,c,M[8],11,-2022574463);c=md5hh(c,d,a,b,M[11],16,1839030562);b=md5hh(b,c,d,a,M[14],23,-35309556);
            a=md5hh(a,b,c,d,M[1], 4,-1530992060);d=md5hh(d,a,b,c,M[4],11,1272893353); c=md5hh(c,d,a,b,M[7],16,-155497632); b=md5hh(b,c,d,a,M[10],23,-1094730640);
            a=md5hh(a,b,c,d,M[13],4, 681279174); d=md5hh(d,a,b,c,M[0],11,-358537222); c=md5hh(c,d,a,b,M[3],16,-722521979); b=md5hh(b,c,d,a,M[6],23,76029189);
            a=md5hh(a,b,c,d,M[9], 4,-640364487); d=md5hh(d,a,b,c,M[12],11,-421815835);c=md5hh(c,d,a,b,M[15],16,530742520); b=md5hh(b,c,d,a,M[2],23,-995338651);
            a=md5ii(a,b,c,d,M[0], 6,-198630844); d=md5ii(d,a,b,c,M[7],10,1126891415);  c=md5ii(c,d,a,b,M[14],15,-1416354905);b=md5ii(b,c,d,a,M[5],21,-57434055);
            a=md5ii(a,b,c,d,M[12],6, 1700485571);d=md5ii(d,a,b,c,M[3],10,-1894986606); c=md5ii(c,d,a,b,M[10],15,-1051523);  b=md5ii(b,c,d,a,M[1],21,-2054922799);
            a=md5ii(a,b,c,d,M[8], 6, 1873313359);d=md5ii(d,a,b,c,M[15],10,-30611744);  c=md5ii(c,d,a,b,M[6],15,-1560198380);b=md5ii(b,c,d,a,M[13],21,1309151649);
            a=md5ii(a,b,c,d,M[4], 6,-145523070); d=md5ii(d,a,b,c,M[11],10,-1120210379);c=md5ii(c,d,a,b,M[2],15, 718787259); b=md5ii(b,c,d,a,M[9],21,-343485551);
            a=safeAdd(a,oa); b=safeAdd(b,ob); c=safeAdd(c,oc); d=safeAdd(d,od);
        }
        var hex='',vals=[a,b,c,d];
        for(var vi=0;vi<4;vi++){
            var v=vals[vi];
            for(var bi=0;bi<4;bi++){ var byte_=((v>>>(bi*8))&0xff); hex+=(byte_<16?'0':'')+byte_.toString(16); }
        }
        return hex;
    }

    // ── SHA via Web Crypto API ───────────────────────────────────────────
    function shaHash(algorithm, text) {
        var encoder = new TextEncoder();
        var data    = encoder.encode(text);
        var algo    = algorithm === 'SHA-1' ? 'SHA-1' : algorithm; // SHA-256, SHA-512
        return crypto.subtle.digest(algo, data).then(function(buf) {
            var arr = Array.from(new Uint8Array(buf));
            return arr.map(function(b){ return (b<16?'0':'')+b.toString(16); }).join('');
        });
    }

    // ── Bootstrap ────────────────────────────────────────────────────────
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

    document.querySelectorAll('.bkbg-hg-app').forEach(function(root) {
        var opts;
        try { opts = JSON.parse(root.getAttribute('data-opts') || '{}'); }
        catch(e) { return; }

        var o = {
            title:            opts.title            || 'Hash Generator',
            subtitle:         opts.subtitle         || '',
            defaultAlgorithm: opts.defaultAlgorithm || 'SHA-256',
            defaultInput:     opts.defaultInput     || '',
            showMD5:          opts.showMD5          !== false,
            showSHA1:         opts.showSHA1         !== false,
            showSHA256:       opts.showSHA256        !== false,
            showSHA512:       opts.showSHA512        === true,
            showCompare:      opts.showCompare       !== false,
            autoHash:         opts.autoHash          !== false,
            accentColor:      opts.accentColor      || '#6366f1',
            sectionBg:        opts.sectionBg        || '#f5f3ff',
            cardBg:           opts.cardBg           || '#ffffff',
            inputBg:          opts.inputBg          || '#f9fafb',
            hashBg:           opts.hashBg           || '#1e1b4b',
            hashColor:        opts.hashColor        || '#a5b4fc',
            titleColor:       opts.titleColor       || '#111827',
            subtitleColor:    opts.subtitleColor    || '#6b7280',
            labelColor:       opts.labelColor       || '#374151',
            titleFontSize:    parseInt(opts.titleFontSize)   || 26,
            contentMaxWidth:  parseInt(opts.contentMaxWidth) || 700
        };

        var enabledAlgos = [];
        if (o.showMD5)    enabledAlgos.push('MD5');
        if (o.showSHA1)   enabledAlgos.push('SHA-1');
        if (o.showSHA256) enabledAlgos.push('SHA-256');
        if (o.showSHA512) enabledAlgos.push('SHA-512');

        if (!enabledAlgos.length) return;
        var activeAlgo = enabledAlgos.indexOf(o.defaultAlgorithm) >= 0 ? o.defaultAlgorithm : enabledAlgos[0];

        // ── Render skeleton ────────────────────────────────────────────
        var wrap = root;
        typoCssVarsForEl(opts.typoTitle, '--bkbg-hg-tt-', wrap);
        typoCssVarsForEl(opts.typoSubtitle, '--bkbg-hg-st-', wrap);

        root.innerHTML =
            '<div class="bkbg-hg-wrap" style="background:' + o.sectionBg + ';max-width:' + o.contentMaxWidth + 'px;--hg-accent:' + o.accentColor + '">' +
            (o.title    ? '<h3 class="bkbg-hg-title" style="color:' + o.titleColor + '">' + o.title    + '</h3>' : '') +
            (o.subtitle ? '<p  class="bkbg-hg-subtitle" style="color:' + o.subtitleColor + '">' + o.subtitle + '</p>' : '') +

            '<div class="bkbg-hg-field">' +
            '<label class="bkbg-hg-field-label" style="color:' + o.labelColor + '">Input Text</label>' +
            '<textarea id="hg-input" class="bkbg-hg-textarea" style="background:' + o.inputBg + ';color:' + o.labelColor + '" placeholder="Type or paste text here…">' + (o.defaultInput || '') + '</textarea>' +
            '</div>' +

            '<div class="bkbg-hg-algos" id="hg-algos">' +
            enabledAlgos.map(function(a) {
                return '<button class="bkbg-hg-algo-btn' + (a === activeAlgo ? ' active' : '') + '" data-algo="' + a + '"' +
                    (a === activeAlgo ? ' style="background:' + o.accentColor + ';border-color:' + o.accentColor + ';color:#fff"' : 'style="color:' + o.labelColor + '"') + '>' + a + '</button>';
            }).join('') +
            '</div>' +

            '<div class="bkbg-hg-rows" id="hg-rows">' + renderRowsHtml('', [], o) + '</div>' +

            (o.showCompare ?
                '<div class="bkbg-hg-compare" id="hg-compare" style="background:' + o.cardBg + '">' +
                '<div class="bkbg-hg-compare-label" style="color:' + o.labelColor + '">Verify / Compare Hash</div>' +
                '<div class="bkbg-hg-compare-row">' +
                '<input id="hg-compare-in" type="text" class="bkbg-hg-compare-input" style="background:' + o.inputBg + ';color:' + o.labelColor + '" placeholder="Paste expected hash to compare…">' +
                '<span id="hg-compare-badge" class="bkbg-hg-compare-badge" style="display:none"></span>' +
                '</div>' +
                '</div>'
            : '') +
            '</div>';

        var textareaEl  = root.querySelector('#hg-input');
        var algosEl     = root.querySelector('#hg-algos');
        var rowsEl      = root.querySelector('#hg-rows');
        var compareInEl = root.querySelector('#hg-compare-in');
        var compareBadge= root.querySelector('#hg-compare-badge');

        // computed hash cache
        var hashCache = {};

        function renderRowsHtml(text, computed, opt) {
            if (!text) {
                return enabledAlgos.map(function(a) {
                    return '<div class="bkbg-hg-row" style="background:' + opt.hashBg + '">' +
                        '<span class="bkbg-hg-row-algo">' + a + '</span>' +
                        '<span class="bkbg-hg-row-value" style="color:' + opt.hashColor + ';opacity:0.4">— enter text to generate —</span>' +
                        '</div>';
                }).join('');
            }
            return enabledAlgos.map(function(a) {
                var val = computed[a] || '…';
                return '<div class="bkbg-hg-row" style="background:' + opt.hashBg + '" data-algo="' + a + '">' +
                    '<span class="bkbg-hg-row-algo">' + a + '</span>' +
                    '<span class="bkbg-hg-row-value" id="hg-val-' + a.replace(/[^a-z0-9]/gi,'-') + '" style="color:' + opt.hashColor + '">' + val + '</span>' +
                    '<button class="bkbg-hg-row-copy" data-algo="' + a + '" title="Copy ' + a + ' hash">⧉</button>' +
                    '<span class="bkbg-hg-copy-toast" id="hg-toast-' + a.replace(/[^a-z0-9]/gi,'-') + '">Copied!</span>' +
                    '</div>';
            }).join('');
        }

        // ── Compute hashes ─────────────────────────────────────────────
        var hashTimer = null;
        function computeHashes(text) {
            if (!text) {
                hashCache = {};
                rowsEl.innerHTML = renderRowsHtml('', {}, o);
                if (compareBadge) compareBadge.style.display = 'none';
                return;
            }
            rowsEl.innerHTML = renderRowsHtml(text, {}, o);
            bindCopyBtns();

            // MD5 — synchronous
            if (o.showMD5) {
                var m = md5(text);
                hashCache['MD5'] = m;
                var el = root.querySelector('#hg-val-MD5');
                if (el) el.textContent = m;
            }

            // SHA — async (Web Crypto)
            function doSha(algo) {
                if (!window.crypto || !window.crypto.subtle) {
                    var el2 = root.querySelector('#hg-val-' + algo.replace(/[^a-z0-9]/gi,'-'));
                    if (el2) el2.textContent = '(Web Crypto not available)';
                    return;
                }
                shaHash(algo, text).then(function(hex) {
                    hashCache[algo] = hex;
                    var rowEl = root.querySelector('#hg-val-' + algo.replace(/[^a-z0-9]/gi,'-'));
                    if (rowEl) rowEl.textContent = hex;
                    updateCompare();
                }).catch(function() {});
            }
            if (o.showSHA1)   doSha('SHA-1');
            if (o.showSHA256) doSha('SHA-256');
            if (o.showSHA512) doSha('SHA-512');

            updateCompare();
            bindCopyBtns();
        }

        function updateCompare() {
            if (!compareInEl || !compareBadge) return;
            var expected = compareInEl.value.trim().toLowerCase();
            if (!expected || !hashCache[activeAlgo]) {
                compareBadge.style.display = 'none';
                return;
            }
            var actual = hashCache[activeAlgo].toLowerCase();
            var match  = (actual === expected);
            compareBadge.className = 'bkbg-hg-compare-badge ' + (match ? 'match' : 'nomatch');
            compareBadge.textContent = match ? '✓ Match' : '✗ No match';
            compareBadge.style.display = 'inline-block';
        }

        function bindCopyBtns() {
            root.querySelectorAll('.bkbg-hg-row-copy').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var algo  = btn.getAttribute('data-algo');
                    var hash  = hashCache[algo];
                    var toast = root.querySelector('#hg-toast-' + algo.replace(/[^a-z0-9]/gi,'-'));
                    if (!hash) return;
                    navigator.clipboard.writeText(hash).then(function() {
                        if (toast) { toast.classList.add('show'); setTimeout(function(){ toast.classList.remove('show'); }, 1800); }
                    }).catch(function(){});
                });
            });
        }

        // ── Input debounce ─────────────────────────────────────────────
        textareaEl.addEventListener('input', function() {
            if (!o.autoHash) return;
            clearTimeout(hashTimer);
            hashTimer = setTimeout(function(){ computeHashes(textareaEl.value); }, 300);
        });

        // ── Algo tab switching ─────────────────────────────────────────
        algosEl.querySelectorAll('.bkbg-hg-algo-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                activeAlgo = btn.getAttribute('data-algo');
                algosEl.querySelectorAll('.bkbg-hg-algo-btn').forEach(function(b) {
                    var act = b.getAttribute('data-algo') === activeAlgo;
                    b.classList.toggle('active', act);
                    b.style.background   = act ? o.accentColor : '';
                    b.style.borderColor  = act ? o.accentColor : '';
                    b.style.color        = act ? '#fff' : o.labelColor;
                });
                updateCompare();
            });
        });

        // ── Compare input ──────────────────────────────────────────────
        if (compareInEl) {
            compareInEl.addEventListener('input', updateCompare);
        }

        // ── Initial hash (if prefilled) ────────────────────────────────
        if (o.defaultInput) {
            computeHashes(o.defaultInput);
        }

        // ── Manual hash button (if autoHash off) ──────────────────────
        if (!o.autoHash) {
            var btn = document.createElement('button');
            btn.textContent = 'Generate Hashes';
            btn.style.cssText = 'margin-top:10px;padding:10px 22px;border-radius:9px;border:none;background:' + o.accentColor + ';color:#fff;font-size:14px;font-weight:700;cursor:pointer;transition:opacity 0.2s;';
            textareaEl.parentNode.insertBefore(btn, textareaEl.nextSibling);
            btn.addEventListener('click', function(){ computeHashes(textareaEl.value); });
        }
    });
})();
