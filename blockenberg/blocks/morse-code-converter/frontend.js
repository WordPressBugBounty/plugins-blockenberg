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

    var MORSE_MAP = {
        'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---',
        'K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-',
        'U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..',
        '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
        ' ':'/'
    };
    var REVERSE_MAP = {};
    Object.keys(MORSE_MAP).forEach(function(k){ REVERSE_MAP[MORSE_MAP[k]] = k; });

    function toMorse(text) {
        return text.toUpperCase().split('').map(function(c){ return MORSE_MAP[c] || ''; }).join(' ').replace(/  +/g,' ').trim();
    }
    function fromMorse(morse) {
        return morse.trim().split(' / ').map(function(word){
            return word.trim().split(' ').map(function(code){ return REVERSE_MAP[code.trim()] || ''; }).join('');
        }).join(' ');
    }

    function showToast(msg) {
        var t = document.querySelector('.bkbg-mcc-toast');
        if (!t) { t = document.createElement('div'); t.className = 'bkbg-mcc-toast'; document.body.appendChild(t); }
        t.textContent = msg; t.classList.add('show');
        setTimeout(function(){ t.classList.remove('show'); }, 1800);
    }

    // Web Audio API Morse playback
    function playMorse(morseStr) {
        if (!window.AudioContext && !window.webkitAudioContext) { showToast('Audio not supported'); return; }
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var wpm = 15;
        var dot = 1200 / wpm / 1000;
        var t = ctx.currentTime + 0.1;
        var freq = 600;

        function beep(dur) {
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, t);
            osc.start(t); osc.stop(t + dur);
            t += dur;
        }
        function pause(dur) { t += dur; }

        morseStr.split('').forEach(function(ch) {
            if (ch === '.') { beep(dot); pause(dot); }
            else if (ch === '-') { beep(dot * 3); pause(dot); }
            else if (ch === ' ') { pause(dot * 2); }
            else if (ch === '/') { pause(dot * 4); }
        });
    }

    var CHARS = Object.keys(MORSE_MAP).filter(function(k){ return k !== ' '; });

    function initBlock(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) {}

        var accent       = opts.accentColor      || '#6c3fb5';
        var outputBg     = opts.outputBg         || '#f5f3ff';
        var outputBorder = opts.outputBorder      || '#ede9fe';
        var outputColor  = opts.outputColor      || '#3b0764';
        var tabActiveBg   = opts.tabActiveBg     || accent;
        var tabActiveClr  = opts.tabActiveColor  || '#fff';
        var tabInactiveBg = opts.tabInactiveBg   || '#f3f4f6';
        var tabInactiveClr= opts.tabInactiveColor|| '#374151';
        var refBg         = opts.refBg           || '#f9fafb';
        var refBorder     = opts.refBorder       || '#e5e7eb';
        var inputBorder   = opts.inputBorder     || '#e5e7eb';
        var labelColor    = opts.labelColor      || '#374151';
        var cardRadius    = (opts.cardRadius  !== undefined ? opts.cardRadius  : 16) + 'px';
        var inputRadius   = (opts.inputRadius !== undefined ? opts.inputRadius : 8)  + 'px';
        var outputFS      = (opts.outputFontSize || 18) + 'px';

        var state = { mode: opts.defaultMode || 'encode' };

        // Wrap
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-mcc-wrap';
        wrap.style.borderRadius = cardRadius;
        if (opts.cardBg) wrap.style.background = opts.cardBg;
        app.appendChild(wrap);

        // Header
        if (opts.showTitle || opts.showSubtitle) {
            var hdr = document.createElement('div'); hdr.className = 'bkbg-mcc-header';
            if (opts.showTitle && opts.title) {
                var ti = document.createElement('div'); ti.className = 'bkbg-mcc-title';
                if (opts.titleColor) ti.style.color = opts.titleColor;
                ti.textContent = opts.title; hdr.appendChild(ti);
            }
            if (opts.showSubtitle && opts.subtitle) {
                var su = document.createElement('div'); su.className = 'bkbg-mcc-subtitle';
                if (opts.subtitleColor) su.style.color = opts.subtitleColor;
                su.textContent = opts.subtitle; hdr.appendChild(su);
            }
            wrap.appendChild(hdr);
        }

        // Tabs
        var tabWrap = document.createElement('div'); tabWrap.className = 'bkbg-mcc-tabs';
        var tabEncode = document.createElement('button'); tabEncode.className = 'bkbg-mcc-tab'; tabEncode.type = 'button'; tabEncode.textContent = 'Text → Morse';
        var tabDecode = document.createElement('button'); tabDecode.className = 'bkbg-mcc-tab'; tabDecode.type = 'button'; tabDecode.textContent = 'Morse → Text';
        tabWrap.appendChild(tabEncode); tabWrap.appendChild(tabDecode); wrap.appendChild(tabWrap);

        function styleTab(btn, active) {
            btn.style.background = active ? tabActiveBg : tabInactiveBg;
            btn.style.color = active ? tabActiveClr : tabInactiveClr;
            btn.classList.toggle('active', active);
        }

        // Label
        var inputLabel = document.createElement('label'); inputLabel.className = 'bkbg-mcc-label'; inputLabel.style.color = labelColor;
        // Textarea
        var textarea = document.createElement('textarea'); textarea.className = 'bkbg-mcc-textarea';
        textarea.style.borderRadius = inputRadius; textarea.style.borderColor = inputBorder;
        textarea.rows = 3;
        var inputWrap = document.createElement('div'); inputWrap.style.marginBottom = '12px';
        inputWrap.appendChild(inputLabel); inputWrap.appendChild(textarea); wrap.appendChild(inputWrap);

        // Output
        var outputBox = document.createElement('div'); outputBox.className = 'bkbg-mcc-output';
        outputBox.style.background = outputBg; outputBox.style.borderColor = outputBorder; outputBox.style.borderRadius = inputRadius;
        var outputLabel = document.createElement('div'); outputLabel.className = 'bkbg-mcc-output-label'; outputLabel.style.color = labelColor;
        var outputText = document.createElement('div'); outputText.className = 'bkbg-mcc-output-text'; outputText.style.color = outputColor;
        outputBox.appendChild(outputLabel); outputBox.appendChild(outputText); wrap.appendChild(outputBox);

        // Buttons
        var actionsRow = document.createElement('div'); actionsRow.className = 'bkbg-mcc-actions'; actionsRow.style.marginBottom = '20px';
        if (opts.showCopyButton !== false) {
            var copyBtn = document.createElement('button'); copyBtn.className = 'bkbg-mcc-btn-copy'; copyBtn.type = 'button'; copyBtn.textContent = '📋 Copy'; copyBtn.style.background = accent;
            copyBtn.addEventListener('click', function(){
                var val = outputText.textContent;
                if (!val) return;
                if (navigator.clipboard) { navigator.clipboard.writeText(val).then(function(){ showToast('Copied!'); }); }
                else { showToast('Copy not supported'); }
            });
            actionsRow.appendChild(copyBtn);
        }
        if (opts.showPlayButton !== false) {
            var playBtn = document.createElement('button'); playBtn.className = 'bkbg-mcc-btn-play'; playBtn.type = 'button'; playBtn.textContent = '🔊 Play Audio';
            playBtn.addEventListener('click', function(){
                var morse = state.mode === 'encode' ? outputText.textContent : textarea.value;
                playMorse(morse);
            });
            actionsRow.appendChild(playBtn);
        }
        wrap.appendChild(actionsRow);

        // Reference table
        if (opts.showReference !== false) {
            var refDetails = document.createElement('details'); refDetails.className = 'bkbg-mcc-ref';
            var refSummary = document.createElement('summary'); refSummary.textContent = 'Morse Code Reference (A–Z, 0–9)'; refSummary.style.background = refBg;
            var refGrid = document.createElement('div'); refGrid.className = 'bkbg-mcc-ref-grid'; refGrid.style.background = refBg;
            CHARS.forEach(function(c){
                var cell = document.createElement('div'); cell.className = 'bkbg-mcc-ref-cell'; cell.style.borderColor = refBorder;
                var charEl = document.createElement('div'); charEl.className = 'bkbg-mcc-ref-char'; charEl.style.color = accent; charEl.textContent = c;
                var codeEl = document.createElement('div'); codeEl.className = 'bkbg-mcc-ref-code'; codeEl.textContent = MORSE_MAP[c];
                cell.appendChild(charEl); cell.appendChild(codeEl); refGrid.appendChild(cell);
            });
            refDetails.appendChild(refSummary); refDetails.appendChild(refGrid); wrap.appendChild(refDetails);
        }

        function updateOutput() {
            var val = textarea.value;
            var result;
            if (state.mode === 'encode') {
                result = toMorse(val);
                outputLabel.textContent = 'Morse Code';
                inputLabel.textContent = 'Enter Text';
            } else {
                result = fromMorse(val);
                outputLabel.textContent = 'Decoded Text';
                inputLabel.textContent = 'Enter Morse Code (use / between words)';
            }
            if (result) {
                outputText.textContent = result;
                outputText.classList.remove('empty');
            } else {
                outputText.textContent = 'Output will appear here…';
                outputText.classList.add('empty');
            }
        }

        // Set typography CSS vars on the blockProps wrapper
        var bpWrap = app.parentNode;
        typoCssVarsForEl(bpWrap, opts.titleTypo, '--bkbg-mcc-tt-');
        typoCssVarsForEl(bpWrap, opts.subtitleTypo, '--bkbg-mcc-st-');
        typoCssVarsForEl(bpWrap, opts.outputTypo, '--bkbg-mcc-ot-');

        function setMode(mode) {
            state.mode = mode;
            var defText = opts.defaultText || 'Hello World';
            textarea.value = mode === 'encode' ? defText : toMorse(defText);
            styleTab(tabEncode, mode === 'encode');
            styleTab(tabDecode, mode === 'decode');
            updateOutput();
        }

        tabEncode.addEventListener('click', function(){ setMode('encode'); });
        tabDecode.addEventListener('click', function(){ setMode('decode'); });
        textarea.addEventListener('input', updateOutput);

        setMode(state.mode);
    }

    function init() { document.querySelectorAll('.bkbg-mcc-app').forEach(initBlock); }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
