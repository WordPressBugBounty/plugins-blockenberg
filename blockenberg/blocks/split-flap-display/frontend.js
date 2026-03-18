(function () {
    'use strict';

    var CHAR_SETS = {
        alpha:   ' ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        alnum:   ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        full:    ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?:/-+@#$%&()',
        numeric: ' 0123456789'
    };

    var FONT_FAMILIES = {
        mono: '"Courier New","Lucida Console",monospace',
        sans: '"Arial","Helvetica Neue",sans-serif',
        slab: '"Rockwell","Georgia",serif'
    };

    var _typoKeys = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform'],
        ['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m'],
        ['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m'],
        ['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m'],
        ['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']
    ];
    var _sizeKeys = {'font-size-d':1,'font-size-t':1,'font-size-m':1};
    var _lhKeys   = {'line-height-d':1,'line-height-t':1,'line-height-m':1};
    var _lsKeys   = {'letter-spacing-d':1,'letter-spacing-t':1,'letter-spacing-m':1};
    var _wsKeys   = {'word-spacing-d':1,'word-spacing-t':1,'word-spacing-m':1};

    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj) return;
        _typoKeys.forEach(function (pair) {
            var v = obj[pair[0]];
            if (v === undefined || v === '' || v === null) return;
            var unit = '';
            if (_sizeKeys[pair[1]]) unit = obj.sizeUnit || 'px';
            else if (_lhKeys[pair[1]]) unit = obj.lineHeightUnit || '';
            else if (_lsKeys[pair[1]]) unit = obj.letterSpacingUnit || 'px';
            else if (_wsKeys[pair[1]]) unit = obj.wordSpacingUnit || 'px';
            el.style.setProperty(prefix + pair[1], (typeof v === 'number' ? v + unit : v));
        });
    }

    function initSplitFlap(appEl) {
        var raw = appEl.dataset.opts;
        if (!raw) return;
        var opts;
        try { opts = JSON.parse(raw); } catch (e) { return; }

        var messages = (opts.messages || ['DEPARTURES']).map(function (m) { return m.toUpperCase(); });
        var charSet  = CHAR_SETS[opts.charSet || 'alpha'];
        var font     = FONT_FAMILIES[opts.fontFamily || 'mono'];

        var cw = opts.charWidth  || 48;
        var ch = opts.charHeight || 64;
        var cg = opts.charGap    || 4;
        var rg = opts.rowGap     || 8;
        var fs = opts.fontSize   || 28;
        var fw = opts.fontWeight || 700;
        var br = opts.borderRadius || 6;
        var speed = opts.flipSpeed  || 60;
        var stagger = opts.flipStagger || 30;

        // Pad all messages to the same length (max length)
        var maxLen = 0;
        messages.forEach(function (m) { if (m.length > maxLen) maxLen = m.length; });
        messages = messages.map(function (m) {
            while (m.length < maxLen) m += ' ';
            return m;
        });

        var msgIdx = 0;
        var flipping = false;

        // Build the board DOM
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-sfd-wrap';

        var board = document.createElement('div');
        board.className = 'bkbg-sfd-board';
        board.style.backgroundColor = opts.boardBg || '#1a1a1a';
        board.style.borderRadius = (opts.boardRadius || 12) + 'px';
        board.style.padding = (opts.boardPadding || 24) + 'px';
        board.style.display = 'inline-block';

        if (opts.showLabel) {
            var lbl = document.createElement('div');
            lbl.className = 'bkbg-sfd-label';
            lbl.textContent = opts.label || 'FLIGHT INFORMATION';
            lbl.style.color = opts.labelColor || '#888';
            board.appendChild(lbl);
        }

        var rowsEl = document.createElement('div');
        rowsEl.className = 'bkbg-sfd-rows';
        rowsEl.style.gap = rg + 'px';

        // Single display row (shows one message at a time)
        var rowEl = document.createElement('div');
        rowEl.className = 'bkbg-sfd-row';
        rowEl.style.gap = cg + 'px';

        // Current displayed chars
        var currentChars = new Array(maxLen).fill(' ');
        var charEls = [];

        function makeCharEl(ch) {
            var tile = document.createElement('div');
            tile.className = 'bkbg-sfd-char';
            tile.style.width   = cw + 'px';
            tile.style.height  = ch + 'px';
            tile.style.backgroundColor = ch === ' ' ? 'transparent' : (opts.charBg || '#2a2a2a');
            tile.style.borderRadius = br + 'px';
            tile.style.perspective = '400px';
            tile.style.setProperty('--sfd-speed', speed + 'ms');
            if (opts.glowColor) tile.style.boxShadow = '0 0 12px ' + opts.glowColor;

            // Top half
            var topEl = document.createElement('div');
            topEl.className = 'bkbg-sfd-top';
            topEl.style.backgroundColor = opts.charBg || '#2a2a2a';
            var topTxt = document.createElement('span');
            topTxt.className = 'bkbg-sfd-char-text';
            topTxt.style.color      = opts.charColor || '#f5f5dc';
            topTxt.style.paddingBottom = '0';
            topTxt.style.lineHeight = (ch * 2) + 'px'; // so bottom half is cropped
            topTxt.textContent = ch;
            topEl.appendChild(topTxt);
            tile.appendChild(topEl);

            // Bottom half
            var botEl = document.createElement('div');
            botEl.className = 'bkbg-sfd-bottom';
            botEl.style.backgroundColor = opts.flapHalfBg || '#222';
            var botTxt = document.createElement('span');
            botTxt.className = 'bkbg-sfd-char-text';
            botTxt.style.color      = opts.charColor || '#f5f5dc';
            botTxt.style.lineHeight = '0'; // top half crops in
            botTxt.textContent = ch;
            botEl.appendChild(botTxt);
            tile.appendChild(botEl);

            // Divider
            var divEl = document.createElement('div');
            divEl.className = 'bkbg-sfd-divider';
            divEl.style.background = opts.dividerColor || '#111';
            tile.appendChild(divEl);

            tile._topTxt = topTxt;
            tile._botTxt = botTxt;
            tile._topEl  = topEl;
            tile._botEl  = botEl;

            return tile;
        }

        for (var i = 0; i < maxLen; i++) {
            var tile = makeCharEl(messages[0][i] || ' ');
            currentChars[i] = messages[0][i] || ' ';
            charEls.push(tile);
            rowEl.appendChild(tile);
        }

        rowsEl.appendChild(rowEl);
        board.appendChild(rowsEl);

        // Dots (ticker indicator)
        var dotsEl = null;
        if (messages.length > 1) {
            dotsEl = document.createElement('div');
            dotsEl.className = 'bkbg-sfd-dots';
            messages.forEach(function (_, di) {
                var dot = document.createElement('div');
                dot.className = 'bkbg-sfd-dot' + (di === 0 ? ' bkbg-sfd-dot-active' : '');
                dot.style.backgroundColor = opts.charColor || '#f5f5dc';
                dotsEl.appendChild(dot);
            });
            board.appendChild(dotsEl);
        }

        wrap.appendChild(board);

        /* ── Apply typography CSS vars on wrap ──────────────────────── */
        wrap.style.setProperty('--bksfd-ch-font-family', font);
        wrap.style.setProperty('--bksfd-ch-font-size-d', fs + 'px');
        wrap.style.setProperty('--bksfd-ch-font-weight', String(fw));
        wrap.style.setProperty('--bksfd-lb-font-family', font);
        typoCssVarsForEl(wrap, opts.charTypo, '--bksfd-ch-');
        typoCssVarsForEl(wrap, opts.labelTypo, '--bksfd-lb-');

        appEl.parentNode.replaceChild(wrap, appEl);

        // ── Flip animation ─────────────────────────────────────────────
        function flipCharTo(tile, fromChar, toChar, delay, onDone) {
            if (fromChar === toChar) { if (onDone) onDone(); return; }
            setTimeout(function () {
                var idx = charSet.indexOf(fromChar);
                if (idx === -1) idx = 0;

                // Create flipping top flap (shows fromChar top, folds down)
                var flipTopEl = document.createElement('div');
                flipTopEl.className = 'bkbg-sfd-flip-top';
                flipTopEl.style.backgroundColor = opts.charBg || '#2a2a2a';
                flipTopEl.style.setProperty('--sfd-speed', speed + 'ms');
                var ftTxt = document.createElement('span');
                ftTxt.className = 'bkbg-sfd-char-text';
                ftTxt.style.color      = opts.charColor || '#f5f5dc';
                ftTxt.style.lineHeight = (ch * 2) + 'px';
                ftTxt.textContent = fromChar;
                flipTopEl.appendChild(ftTxt);

                // Create flipping bottom flap (shows toChar bottom, unfolds)
                var flipBotEl = document.createElement('div');
                flipBotEl.className = 'bkbg-sfd-flip-bottom';
                flipBotEl.style.backgroundColor = opts.flapHalfBg || '#222';
                flipBotEl.style.setProperty('--sfd-speed', speed + 'ms');
                var fbTxt = document.createElement('span');
                fbTxt.className = 'bkbg-sfd-char-text';
                fbTxt.style.color      = opts.charColor || '#f5f5dc';
                fbTxt.style.lineHeight = '0';
                fbTxt.textContent = toChar;
                flipBotEl.appendChild(fbTxt);

                // Update underlying halves immediately to target char
                tile._topTxt.textContent = toChar;
                tile._botTxt.textContent = toChar;

                tile.appendChild(flipTopEl);
                tile.appendChild(flipBotEl);

                // Remove after animation
                setTimeout(function () {
                    if (flipTopEl.parentNode) flipTopEl.parentNode.removeChild(flipTopEl);
                    if (flipBotEl.parentNode) flipBotEl.parentNode.removeChild(flipBotEl);
                    if (onDone) onDone();
                }, speed + 20);
            }, delay);
        }

        function flipToMessage(target) {
            if (flipping) return;
            flipping = true;
            var remaining = maxLen;

            for (var i = 0; i < maxLen; i++) {
                (function (ci) {
                    var from = currentChars[ci] || ' ';
                    var to   = (target[ci] || ' ');
                    flipCharTo(charEls[ci], from, to, ci * stagger, function () {
                        remaining--;
                        if (remaining === 0) {
                            flipping = false;
                            currentChars = target.split('');
                        }
                    });
                })(i);
            }
        }

        // ── Ticker logic ───────────────────────────────────────────────
        function doTicker() {
            if (messages.length < 2) return;
            msgIdx = (msgIdx + 1) % messages.length;
            flipToMessage(messages[msgIdx]);

            // Update dots
            if (dotsEl) {
                var dots = dotsEl.querySelectorAll('.bkbg-sfd-dot');
                dots.forEach(function (d, di) {
                    d.classList.toggle('bkbg-sfd-dot-active', di === msgIdx);
                });
            }
        }

        var tickerTimer = null;

        function startTicker() {
            if (tickerTimer) return;
            tickerTimer = setInterval(doTicker, opts.tickerDelay || 3000);
        }

        // ── Scroll trigger ─────────────────────────────────────────────
        if (opts.flipOnScroll) {
            var played = false;
            var observer = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting && !played) {
                    played = true;
                    flipToMessage(messages[0]);
                    if (opts.tickerMode) {
                        setTimeout(startTicker, (opts.tickerDelay || 3000));
                    }
                }
            }, { threshold: 0.3 });
            observer.observe(wrap);
        } else if (opts.autoPlay || opts.tickerMode) {
            flipToMessage(messages[0]);
            if (opts.tickerMode) {
                setTimeout(startTicker, opts.tickerDelay || 3000);
            }
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-sfd-app').forEach(initSplitFlap);
    });

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        document.querySelectorAll('.bkbg-sfd-app').forEach(initSplitFlap);
    }
})();
