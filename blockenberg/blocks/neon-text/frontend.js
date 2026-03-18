document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.bkbg-nt-app').forEach(function (root) {
        var opts = JSON.parse(root.dataset.opts || '{}');
        initNeonText(root, opts);
    });
});

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

function buildNeonShadow(a, boost) {
    var tube   = a.tubeColor   || '#00d4ff';
    var glow   = a.glowColor   || '#00d4ff';
    var second = a.secondGlow  || '#0055ff';
    var int    = (a.glowIntensity || 3) * (boost || 1);
    var spread = a.glowSpread   || 40;

    return [
        '0 0 ' + Math.round(spread * 0.1) + 'px ' + tube,
        '0 0 ' + Math.round(spread * 0.3) + 'px ' + tube,
        '0 0 ' + Math.round(spread * 0.6 * int) + 'px ' + glow,
        '0 0 ' + Math.round(spread * 1.0 * int) + 'px ' + glow,
        '0 0 ' + Math.round(spread * 2.0 * int) + 'px ' + second,
        '0 0 ' + Math.round(spread * 3.0 * int) + 'px ' + second,
    ].join(', ');
}

function initNeonText(root, a) {
    var Tag     = a.tag    || 'h2';
    var text    = a.text   || 'NEON SIGN';
    var shadow  = buildNeonShadow(a);

    /* wrap */
    var wrap = document.createElement('div');
    wrap.className = 'bkbg-nt-wrap';
    wrap.style.cssText = [
        'background:' + (a.backgroundColor || '#0a0a12'),
        'padding:' + (a.paddingV || 64) + 'px ' + (a.paddingH || 48) + 'px',
        'border-radius:' + (a.borderRadius || 16) + 'px',
        'text-align:' + (a.textAlign || 'center'),
        'position:relative',
        'overflow:hidden',
    ].join(';');

    /* sign border */
    if (a.showBorderSign) {
        var border = document.createElement('div');
        border.className = 'bkbg-nt-border-sign';
        var br = Math.max(0, (a.borderRadius || 16) - 6);
        border.style.cssText = [
            'inset:12px',
            'border-color:' + (a.borderSignColor || '#ff0080'),
            'border-radius:' + br + 'px',
            'box-shadow:0 0 12px ' + (a.borderSignColor || '#ff0080') + ',inset 0 0 12px ' + (a.borderSignColor || '#ff0080') + '22',
        ].join(';');
        wrap.appendChild(border);
    }

    /* scanlines */
    if (a.showScanlines) {
        var scanDiv = document.createElement('div');
        scanDiv.className = 'bkbg-nt-scanlines';
        wrap.appendChild(scanDiv);
    }

    /* text element */
    var textEl = document.createElement(Tag);
    textEl.className = 'bkbg-nt-text';

    var baseTs  = [
        'color:' + (a.tubeColor || '#00d4ff'),
        'text-shadow:' + shadow,
        'margin:0',
        'display:block',
        'cursor:default',
        'position:relative',
        'z-index:2',
    ].join(';');

    /* flicker mode */
    var flickerMode = a.flickerMode || 'soft';
    if (flickerMode === 'soft')    textEl.classList.add('bkbg-nt-flicker-soft');
    if (flickerMode === 'classic') textEl.classList.add('bkbg-nt-flicker-classic');

    textEl.style.cssText = baseTs;

    /* broken flicker: wrap a single character in a span */
    if (flickerMode === 'broken') {
        var chars = text.split('');
        var letterIdx = a.flickerLetter >= 0 && a.flickerLetter < chars.length
            ? a.flickerLetter
            : Math.floor(Math.random() * chars.length);
        textEl.innerHTML = chars.map(function (ch, i) {
            if (ch === ' ') return '<span>&nbsp;</span>';
            if (i === letterIdx) {
                return '<span class="bkbg-nt-broken-letter" style="text-shadow:' + shadow + '">' + ch + '</span>';
            }
            return '<span>' + ch + '</span>';
        }).join('');
    } else {
        textEl.textContent = text;
    }

    wrap.appendChild(textEl);

    /* subtitle */
    if (a.showSubText && a.subText) {
        var subEl = document.createElement('p');
        subEl.className = 'bkbg-nt-sub';
        var subShadow = buildNeonShadow(a, 0.6);
        subEl.style.cssText = [
            'color:' + (a.tubeColor || '#00d4ff'),
            'text-shadow:' + subShadow,
            'position:relative',
            'z-index:2',
        ].join(';');
        subEl.textContent = a.subText;
        wrap.appendChild(subEl);
    }

    /* glow floor */
    if (a.showGlowFloor) {
        var floor = document.createElement('div');
        floor.className = 'bkbg-nt-floor';
        floor.style.cssText = 'background:radial-gradient(ellipse at center,' + (a.glowColor || '#00d4ff') + '55 0%,transparent 70%);';
        wrap.appendChild(floor);
    }

    root.appendChild(wrap);

    /* Typography CSS vars */
    typoCssVarsForEl(root.parentNode, a.headingTypo, '--bkbg-nt-hd-');
    typoCssVarsForEl(root.parentNode, a.subtitleTypo, '--bkbg-nt-sb-');

    /* broken: re-randomize letter occasionally for realism */
    if (flickerMode === 'broken' && a.flickerLetter < 0) {
        setInterval(function () {
            var oldLetter = wrap.querySelector('.bkbg-nt-broken-letter');
            if (!oldLetter) return;
            var spans = Array.from(textEl.querySelectorAll('span'));
            var noneEmpty = spans.filter(function (s) { return s.textContent.trim(); });
            if (!noneEmpty.length) return;
            oldLetter.classList.remove('bkbg-nt-broken-letter');
            var pick = noneEmpty[Math.floor(Math.random() * noneEmpty.length)];
            pick.classList.add('bkbg-nt-broken-letter');
        }, 4000 + Math.random() * 4000);
    }
}
