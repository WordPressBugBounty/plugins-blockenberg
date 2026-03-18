(function () {
    'use strict';
    function mk(tag, cls, styles) { var d = document.createElement(tag); if (cls) d.className = cls; if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; }); return d; }
    function tx(tag, cls, text, styles) { var d = mk(tag, cls, styles); d.textContent = text; return d; }
    function ap(p) { Array.prototype.slice.call(arguments, 1).forEach(function (c) { if (c) p.appendChild(c); }); return p; }

    var typoKeys = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform'],
        ['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m'],
        ['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m'],
        ['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m'],
        ['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']
    ];
    function typoCssVarsForEl(el, typo, prefix) {
        if (!typo || typeof typo !== 'object') return;
        var u = typo.sizeUnit || 'px';
        typoKeys.forEach(function (pair) {
            var v = typo[pair[0]];
            if (v === undefined || v === '' || v === null) return;
            var css = (typeof v === 'number' && pair[0].indexOf('size') !== -1) ? v + u
                    : (typeof v === 'number') ? String(v) : v;
            el.style.setProperty(prefix + pair[1], css);
        });
    }

    function renderKeys(keysStr, a) {
        if (!keysStr) return null;
        var wrap = mk('div', 'bkbg-ks-keys');
        wrap.style.cssText = 'display:flex;align-items:center;gap:3px;flex-wrap:nowrap';
        keysStr.split(' ').forEach(function (k) {
            if (k === '/' || k === '+') {
                var sep = tx('span', null, k);
                sep.style.cssText = 'color:' + a.keyColor + ';opacity:0.4;font-size:' + a.keyFontSize + 'px';
                ap(wrap, sep);
            } else {
                var key = tx('kbd', 'bkbg-ks-key', k);
                key.style.cssText = 'display:inline-block;padding:2px 7px;background:' + a.keyBg + ';border:1px solid ' + a.keyBorderColor + ';border-bottom:3px solid ' + a.keyBorderColor + ';border-radius:' + a.keyRadius + 'px;font-size:' + a.keyFontSize + 'px;color:' + a.keyColor + ';font-family:inherit;line-height:1.4;white-space:nowrap';
                ap(wrap, key);
            }
        });
        return wrap;
    }

    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var a = Object.assign({
            sheetTitle: 'Keyboard Shortcuts', showTitle: true, platform: 'both', sections: [],
            fontSize: 14, titleFontSize: 22, headingFontSize: 12, keyFontSize: 12,
            lineHeight: 160, borderRadius: 12, keyRadius: 6,
            bgColor: '#ffffff', borderColor: '#e5e7eb', titleColor: '#111827',
            headingBg: '#f8fafc', headingColor: '#374151', headingBorderColor: '#e5e7eb',
            descColor: '#374151', keyBg: '#f1f5f9', keyBorderColor: '#cbd5e1', keyColor: '#1e293b',
            macAccentColor: '#6366f1', winAccentColor: '#0ea5e9', separatorColor: '#f1f5f9'
        }, JSON.parse(appEl.dataset.opts || '{}'));

        var lh = (a.lineHeight / 100).toFixed(2);
        var showMac = (a.platform === 'mac' || a.platform === 'both');
        var showWin = (a.platform === 'windows' || a.platform === 'both');

        var wrap = mk('div', 'bkbg-ks-wrap');
        wrap.style.cssText = 'background:' + a.bgColor + ';border-radius:' + a.borderRadius + 'px;border:1px solid ' + a.borderColor + ';overflow:hidden;font-size:' + a.fontSize + 'px;line-height:' + lh;
        typoCssVarsForEl(wrap, a.titleTypo, '--bkbg-ks-tt-');

        if (a.showTitle && a.sheetTitle) {
            var header = mk('div', 'bkbg-ks-header');
            header.style.cssText = 'padding:18px 20px;border-bottom:1px solid ' + a.borderColor;
            var titleEl = tx('h3', 'bkbg-ks-title', a.sheetTitle);
            titleEl.style.cssText = 'margin:0;color:' + a.titleColor;
            ap(header, titleEl);
            ap(wrap, header);
        }

        a.sections.forEach(function (sec, si) {
            var section = mk('div', 'bkbg-ks-section');

            var secHead = mk('div', 'bkbg-ks-section-head');
            secHead.style.cssText = 'background:' + a.headingBg + ';padding:7px 20px;border-top:1px solid ' + a.headingBorderColor + ';border-bottom:1px solid ' + a.headingBorderColor;
            if (si === 0 && !a.showTitle) secHead.style.borderTop = 'none';
            var headLabel = tx('span', null, sec.heading);
            headLabel.style.cssText = 'font-size:' + a.headingFontSize + 'px;font-weight:700;color:' + a.headingColor + ';text-transform:uppercase;letter-spacing:0.07em';
            ap(secHead, headLabel);
            ap(section, secHead);

            sec.shortcuts.forEach(function (sc, sci) {
                var row = mk('div', 'bkbg-ks-row');
                row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:9px 20px;gap:16px' + (sci > 0 ? ';border-top:1px solid ' + a.separatorColor : '');

                var desc = tx('span', 'bkbg-ks-desc', sc.description);
                desc.style.cssText = 'color:' + a.descColor + ';flex:1';
                ap(row, desc);

                var keysWrap = mk('div', 'bkbg-ks-keys-wrap');
                keysWrap.style.cssText = 'display:flex;gap:' + (a.platform === 'both' ? '16px' : '0') + ';align-items:center;flex-shrink:0';

                if (showMac && sc.macKeys) {
                    var macCol = mk('div');
                    macCol.style.cssText = 'display:flex;flex-direction:column;align-items:flex-end;gap:2px';
                    if (a.platform === 'both') {
                        var macLabel = tx('div', null, 'Mac');
                        macLabel.style.cssText = 'font-size:10px;color:' + a.macAccentColor + ';font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px';
                        ap(macCol, macLabel);
                    }
                    var mkKeys = renderKeys(sc.macKeys, a);
                    if (mkKeys) ap(macCol, mkKeys);
                    ap(keysWrap, macCol);
                }
                if (showWin && sc.winKeys) {
                    var winCol = mk('div');
                    winCol.style.cssText = 'display:flex;flex-direction:column;align-items:flex-end;gap:2px';
                    if (a.platform === 'both') {
                        var winLabel = tx('div', null, 'Win');
                        winLabel.style.cssText = 'font-size:10px;color:' + a.winAccentColor + ';font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px';
                        ap(winCol, winLabel);
                    }
                    var wKeys = renderKeys(sc.winKeys, a);
                    if (wKeys) ap(winCol, wKeys);
                    ap(keysWrap, winCol);
                }
                ap(row, keysWrap);
                ap(section, row);
            });

            ap(wrap, section);
        });

        appEl.innerHTML = '';
        appEl.appendChild(wrap);
    }

    function init() { document.querySelectorAll('.bkbg-keyboard-shortcut-app').forEach(buildBlock); }
    if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }
})();
