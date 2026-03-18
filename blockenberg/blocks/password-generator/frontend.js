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

    var UPPER   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var LOWER   = 'abcdefghijklmnopqrstuvwxyz';
    var NUMBERS = '0123456789';
    var SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    function generatePassword(opts) {
        var pool = '';
        if (opts.includeUppercase !== false) pool += UPPER;
        if (opts.includeLowercase !== false) pool += LOWER;
        if (opts.includeNumbers   !== false) pool += NUMBERS;
        if (opts.includeSymbols   !== false) pool += SYMBOLS;
        if (opts.excludeAmbiguous)           pool  = pool.replace(/[0Ol1I]/g, '');
        if (!pool) pool = LOWER;

        var len = opts.length || 16;
        var result = '';
        var arr = new Uint32Array(len);
        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(arr);
            for (var i = 0; i < len; i++) {
                result += pool.charAt(arr[i] % pool.length);
            }
        } else {
            for (var j = 0; j < len; j++) {
                result += pool.charAt(Math.floor(Math.random() * pool.length));
            }
        }
        return result;
    }

    function getStrength(pwd, opts) {
        var score = 0;
        if (pwd.length >= 12) score++;
        if (pwd.length >= 16) score++;
        if (/[A-Z]/.test(pwd) && opts.includeUppercase !== false) score++;
        if (/[0-9]/.test(pwd) && opts.includeNumbers   !== false) score++;
        if (/[^A-Za-z0-9]/.test(pwd) && opts.includeSymbols !== false) score++;
        if (score <= 1) return { level: 'weak',   label: 'Weak',   pct: 25  };
        if (score === 2) return { level: 'fair',   label: 'Fair',   pct: 50  };
        if (score === 3) return { level: 'good',   label: 'Good',   pct: 75  };
        return             { level: 'strong', label: 'Strong', pct: 100 };
    }

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) {}

        /* Current state */
        var length   = opts.defaultLength  || 16;
        var upper    = opts.includeUppercase !== false;
        var lower    = opts.includeLowercase !== false;
        var numbers  = opts.includeNumbers  !== false;
        var symbols  = opts.includeSymbols  !== false;
        var excAmb   = opts.excludeAmbiguous === true;
        var visible  = false;
        var currentPwd = '';

        /* Colors */
        var accent    = opts.accentColor    || '#6c3fb5';
        var cardBg    = opts.cardBg         || '#ffffff';
        var pwdBg     = opts.pwdBg          || '#f5f3ff';
        var pwdBdr    = opts.pwdBorder       || '#ede9fe';
        var pwdColor  = opts.pwdColor        || '#1e1b4b';
        var labelColor= opts.labelColor      || '#374151';
        var titleColor= opts.titleColor      || '#1e1b4b';
        var subColor  = opts.subtitleColor   || '#6b7280';
        var copyBg    = opts.copyBtnBg       || accent;
        var copyCol   = opts.copyBtnColor    || '#ffffff';
        var genBg     = opts.genBtnBg        || '#f3f4f6';
        var genCol    = opts.genBtnColor     || '#374151';
        var strColors = {
            weak:   opts.strengthWeak   || '#ef4444',
            fair:   opts.strengthFair   || '#f59e0b',
            good:   opts.strengthGood   || '#3b82f6',
            strong: opts.strengthStrong || '#10b981',
        };
        var cRadius  = (opts.cardRadius  || 16) + 'px';
        var btnR     = (opts.btnRadius   || 8)  + 'px';
        var maxW     = (opts.maxWidth    || 560) + 'px';
        var ptop     = (opts.paddingTop  || 60)  + 'px';
        var pbot     = (opts.paddingBottom || 60) + 'px';
        var pwdSize  = (opts.pwdFontSize || 20) + 'px';
        var titleSize= (opts.titleSize   || 26)  + 'px';

        /* Build card */
        app.innerHTML = '';
        var card = document.createElement('div');
        card.className = 'bkbg-pg-card';
        card.style.cssText = 'background:' + cardBg + ';border-radius:' + cRadius + ';padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:' + maxW + ';margin:0 auto;padding-top:' + ptop + ';padding-bottom:' + pbot + ';box-sizing:border-box;';
        app.appendChild(card);

        typoCssVarsForEl(card, opts.titleTypo, '--bkbg-pg-tt-');
        typoCssVarsForEl(card, opts.pwdTypo, '--bkbg-pg-pw-');

        if (opts.showTitle !== false && opts.title) {
            var titleEl = document.createElement('h2');
            titleEl.className = 'bkbg-pg-title';
            titleEl.textContent = opts.title;
            titleEl.style.color = titleColor;
            card.appendChild(titleEl);
        }
        if (opts.showSubtitle !== false && opts.subtitle) {
            var subEl = document.createElement('p');
            subEl.className = 'bkbg-pg-subtitle';
            subEl.textContent = opts.subtitle;
            subEl.style.color = subColor;
            card.appendChild(subEl);
        }

        /* Password display */
        var dispBox = document.createElement('div');
        dispBox.className = 'bkbg-pg-display';
        dispBox.style.cssText = 'background:' + pwdBg + ';border-color:' + pwdBdr + ';border-radius:' + cRadius + ';border:1.5px solid ' + pwdBdr + ';';
        card.appendChild(dispBox);

        var pwdEl = document.createElement('div');
        pwdEl.className = 'bkbg-pg-password blurred';
        pwdEl.style.color = pwdColor;
        dispBox.appendChild(pwdEl);

        if (opts.showToggleVisible !== false) {
            var visBtn = document.createElement('button');
            visBtn.className = 'bkbg-pg-icon-btn vis';
            visBtn.title = 'Show/hide password';
            visBtn.style.color = '#9ca3af';
            visBtn.textContent = '👁';
            dispBox.appendChild(visBtn);
            visBtn.addEventListener('click', function() {
                visible = !visible;
                pwdEl.classList.toggle('blurred', !visible);
                visBtn.textContent = visible ? '🙈' : '👁';
            });
        }

        if (opts.showRefreshBtn !== false) {
            var refBtn = document.createElement('button');
            refBtn.className = 'bkbg-pg-icon-btn refresh';
            refBtn.title = 'Generate new';
            refBtn.style.color = accent;
            refBtn.textContent = '↻';
            dispBox.appendChild(refBtn);
            refBtn.addEventListener('click', generate);
        }

        /* Strength bar */
        var strWrap = null, strFill = null, strLabel = null;
        if (opts.showStrength !== false) {
            strWrap = document.createElement('div'); strWrap.className = 'bkbg-pg-strength';
            var strHdr = document.createElement('div'); strHdr.className = 'bkbg-pg-strength-header';
            var strLblLeft = document.createElement('span'); strLblLeft.textContent = 'Strength'; strLblLeft.style.color = labelColor;
            strLabel = document.createElement('span'); strLabel.style.fontWeight = '700';
            strHdr.appendChild(strLblLeft); strHdr.appendChild(strLabel);
            var strTrack = document.createElement('div'); strTrack.className = 'bkbg-pg-strength-track';
            strFill = document.createElement('div'); strFill.className = 'bkbg-pg-strength-fill';
            strTrack.appendChild(strFill);
            strWrap.appendChild(strHdr); strWrap.appendChild(strTrack);
            card.appendChild(strWrap);
        }

        /* Length slider */
        var rangeEl = null, lengthNumEl = null;
        if (opts.showLength !== false) {
            var lenWrap = document.createElement('div'); lenWrap.className = 'bkbg-pg-length';
            var lenHdr  = document.createElement('div'); lenHdr.className = 'bkbg-pg-length-header';
            var lenLbl  = document.createElement('span'); lenLbl.textContent = 'Length'; lenLbl.style.color = labelColor;
            lengthNumEl = document.createElement('span'); lengthNumEl.className = 'bkbg-pg-length-num'; lengthNumEl.style.color = accent;
            lenHdr.appendChild(lenLbl); lenHdr.appendChild(lengthNumEl);
            rangeEl = document.createElement('input'); rangeEl.type = 'range'; rangeEl.className = 'bkbg-pg-range';
            rangeEl.min = opts.minLength || 6; rangeEl.max = opts.maxLength || 64; rangeEl.value = length;
            rangeEl.style.accentColor = accent; rangeEl.style.color = accent;
            lenWrap.appendChild(lenHdr); lenWrap.appendChild(rangeEl);
            card.appendChild(lenWrap);
            rangeEl.addEventListener('input', function() { length = parseInt(this.value); lengthNumEl.textContent = length; generate(); });
        }

        /* Checkboxes */
        var optsGrid = document.createElement('div'); optsGrid.className = 'bkbg-pg-options';
        card.appendChild(optsGrid);

        var chkUpper, chkLower, chkNum, chkSym, chkAmb;
        function makeChk(id, labelText, checked, fullWidth) {
            var lbl = document.createElement('label'); lbl.className = 'bkbg-pg-option' + (fullWidth ? ' full-width' : ''); lbl.style.color = labelColor;
            var chk = document.createElement('input'); chk.type = 'checkbox'; chk.checked = checked; chk.style.accentColor = accent;
            var txt = document.createTextNode(' ' + labelText);
            lbl.appendChild(chk); lbl.appendChild(txt);
            optsGrid.appendChild(lbl);
            return chk;
        }

        chkUpper = makeChk('upper',  'Uppercase (A-Z)',               upper,   false);
        chkLower = makeChk('lower',  'Lowercase (a-z)',               lower,   false);
        chkNum   = makeChk('num',    'Numbers (0-9)',                 numbers, false);
        chkSym   = makeChk('sym',    'Symbols (!@#…)',                symbols, false);
        chkAmb   = makeChk('amb',    'Exclude ambiguous (0,O,l,1,I)',excAmb,  true);

        [chkUpper, chkLower, chkNum, chkSym, chkAmb].forEach(function(chk) {
            chk.addEventListener('change', function() {
                upper   = chkUpper.checked;
                lower   = chkLower.checked;
                numbers = chkNum.checked;
                symbols = chkSym.checked;
                excAmb  = chkAmb.checked;
                generate();
            });
        });

        /* Action buttons */
        var actionsRow = document.createElement('div'); actionsRow.className = 'bkbg-pg-actions';
        card.appendChild(actionsRow);

        var genBtn = document.createElement('button');
        genBtn.className = 'bkbg-pg-btn generate';
        genBtn.textContent = opts.generateLabel || 'Generate New';
        genBtn.style.cssText = 'background:' + genBg + ';color:' + genCol + ';border-radius:' + btnR + ';';
        actionsRow.appendChild(genBtn);
        genBtn.addEventListener('click', generate);

        var copyBtn = null;
        if (opts.showCopyBtn !== false) {
            copyBtn = document.createElement('button');
            copyBtn.className = 'bkbg-pg-btn copy';
            copyBtn.textContent = opts.copyLabel || 'Copy Password';
            copyBtn.style.cssText = 'background:' + copyBg + ';color:' + copyCol + ';border-radius:' + btnR + ';';
            actionsRow.appendChild(copyBtn);
            copyBtn.addEventListener('click', function() {
                if (!currentPwd) return;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(currentPwd).then(function() { showCopied(); });
                } else {
                    var ta = document.createElement('textarea');
                    ta.value = currentPwd;
                    ta.style.position = 'fixed'; ta.style.opacity = '0';
                    document.body.appendChild(ta); ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    showCopied();
                }
            });
        }

        function showCopied() {
            if (!copyBtn) return;
            copyBtn.textContent = opts.copiedLabel || 'Copied!';
            copyBtn.style.background = '#10b981';
            copyBtn.classList.add('success');
            setTimeout(function() {
                copyBtn.textContent = opts.copyLabel || 'Copy Password';
                copyBtn.style.background = copyBg;
                copyBtn.classList.remove('success');
            }, 2000);
        }

        function generate() {
            var pwd = generatePassword({ includeUppercase: upper, includeLowercase: lower, includeNumbers: numbers, includeSymbols: symbols, excludeAmbiguous: excAmb, length: length });
            currentPwd = pwd;
            pwdEl.textContent = pwd;

            if (lengthNumEl) lengthNumEl.textContent = length;

            if (strFill && strLabel) {
                var s = getStrength(pwd, { includeUppercase: upper, includeNumbers: numbers, includeSymbols: symbols });
                var col = strColors[s.level];
                strFill.style.width = s.pct + '%';
                strFill.style.background = col;
                strLabel.textContent = s.label;
                strLabel.style.color = col;
            }
        }

        generate();
    }

    document.querySelectorAll('.bkbg-pg-app').forEach(buildApp);
})();
