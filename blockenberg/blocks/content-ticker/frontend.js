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
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) {
            el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
            el.style.setProperty(prefix + 'letter-spacing',   typo.letterSpacingDesktop + lsu);
        }
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) {
            el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
            el.style.setProperty(prefix + 'word-spacing',   typo.wordSpacingDesktop + wsu);
        }
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    function initBlock(root) {
        var appEl = root.querySelector('.bkbg-ctk-app');
        if (!appEl) return;

        var raw = appEl.getAttribute('data-opts') || '{}';
        var o;
        try { o = JSON.parse(raw); } catch (e) { o = {}; }

        var items          = Array.isArray(o.items) ? o.items : [];
        var prefix         = o.prefix         !== undefined ? o.prefix         : '📢 Breaking';
        var showPrefix     = o.showPrefix      !== false;
        var speed          = Number(o.speed)   || 60;          // px/s
        var pauseOnHover   = o.pauseOnHover    !== false;
        var separator      = o.separator       !== undefined ? o.separator       : ' ◉ ';
        var direction      = o.direction       || 'left';
        var height         = Number(o.height)  || 44;
        var fontSize       = Number(o.fontSize) || 14;
        var fontWeight     = Number(o.fontWeight) || 400;
        var borderRadius   = Number(o.borderRadius) || 6;
        var prefixPadding  = Number(o.prefixPadding) || 20;
        var prefixBg       = o.prefixBg         || '#ef4444';
        var prefixColor    = o.prefixColor      || '#ffffff';
        var tickerBg       = o.tickerBg         || '#1e1b4b';
        var tickerColor    = o.tickerColor      || '#e2e8f0';
        var linkColor      = o.linkColor        || '#a5b4fc';
        var separatorColor = o.separatorColor   || '#475569';

        if (items.length === 0) return;

        appEl.innerHTML = '';

        // ── Outer wrapper ──────────────────────────────────────────────────
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-ctk-wrap' +
            (pauseOnHover ? ' bkbg-ctk-pauseable' : '') +
            (direction === 'right' ? ' bkbg-ctk-rtl' : '');
        wrap.style.cssText = [
            'height:'        + height + 'px',
            'border-radius:' + borderRadius + 'px',
            'background:'    + tickerBg,
            'color:'         + tickerColor
        ].join(';');

        typoCssVarsForEl(o.typoText, '--bkctk-text-', wrap);

        // ── Prefix ─────────────────────────────────────────────────────────
        if (showPrefix && prefix) {
            var pre = document.createElement('div');
            pre.className = 'bkbg-ctk-prefix';
            pre.textContent = prefix;
            pre.style.cssText = [
                'background:' + prefixBg,
                'color:'      + prefixColor,
                'padding:0 '  + prefixPadding + 'px'
            ].join(';');
            wrap.appendChild(pre);
        }

        // ── Track ──────────────────────────────────────────────────────────
        var track = document.createElement('div');
        track.className = 'bkbg-ctk-track';
        wrap.appendChild(track);

        // ── Inner (items × 2 for seamless loop) ───────────────────────────
        var inner = document.createElement('div');
        inner.className = 'bkbg-ctk-inner';
        track.appendChild(inner);

        function buildItems() {
            var frag = document.createDocumentFragment();
            items.forEach(function (item) {
                var sep = document.createElement('span');
                sep.className = 'bkbg-ctk-sep';
                sep.style.color = separatorColor;
                sep.textContent = separator;
                frag.appendChild(sep);

                var itemEl = document.createElement('span');
                itemEl.className = 'bkbg-ctk-item';

                if (item.url) {
                    var a = document.createElement('a');
                    a.href = item.url;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.textContent = item.text || '';
                    a.style.color = linkColor;
                    itemEl.appendChild(a);
                } else {
                    itemEl.textContent = item.text || '';
                }
                frag.appendChild(itemEl);
            });
            return frag;
        }

        inner.appendChild(buildItems());
        inner.appendChild(buildItems()); // second copy for seamless loop

        // ── Direction arrow ────────────────────────────────────────────────
        var arrow = document.createElement('div');
        arrow.className = 'bkbg-ctk-arrow';
        arrow.style.cssText = 'background:' + prefixBg + ';color:' + prefixColor;
        arrow.textContent = direction === 'right' ? '◀' : '▶';
        wrap.appendChild(arrow);

        appEl.appendChild(wrap);

        // ── Calculate animation duration from content width ────────────────
        function setDuration() {
            var halfW = inner.scrollWidth / 2;     // width of one copy
            if (halfW < 1) return;
            var dur = halfW / speed;               // seconds
            inner.style.animationDuration = dur + 's';
        }

        // Run once after paint so scrollWidth is available
        requestAnimationFrame(function () {
            setDuration();
        });

        // Recalculate on resize
        if (typeof ResizeObserver !== 'undefined') {
            var ro = new ResizeObserver(function () {
                setDuration();
            });
            ro.observe(track);
        }
    }

    function init() {
        document.querySelectorAll('.wp-block-blockenberg-content-ticker').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
