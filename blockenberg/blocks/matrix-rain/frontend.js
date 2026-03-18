var _typoKeys = { family:'font-family', weight:'font-weight', style:'font-style',
    decoration:'text-decoration', transform:'text-transform',
    sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
    lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
    letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
    wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
function typoCssVarsForEl(el, typo, prefix) {
    if (!typo || typeof typo !== 'object') return;
    Object.keys(_typoKeys).forEach(function (k) {
        if (typo[k] !== undefined && typo[k] !== '') el.style.setProperty(prefix + _typoKeys[k], String(typo[k]));
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.bkbg-mr-app').forEach(function (root) {
        var opts = JSON.parse(root.dataset.opts || '{}');
        initMatrixRain(root, opts);
    });
});

/* character set helpers */
var KATA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
function getChars(a) {
    if (a.charSet === 'binary')  return ['0','1'];
    if (a.charSet === 'hex')     return '0123456789ABCDEF'.split('');
    if (a.charSet === 'latin')   return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
    if (a.charSet === 'custom')  return ((a.customChars || '01').split(''));
    return (KATA + '0123456789').split('');
}

function hslColumn(colIdx, total) {
    return 'hsl(' + Math.round((colIdx / total) * 360) + ',100%,55%)';
}

function initMatrixRain(root, a) {
    var height   = a.height    || 400;
    var fontSize = a.fontSize  || 16;
    var speed    = a.speed     || 50;
    var bgOp     = (a.bgOpacity || 8) / 100;
    var density  = (a.density  || 100) / 100;
    var primary  = a.primaryColor || '#00ff41';
    var headCol  = a.headColor    || '#ffffff';
    var bgColor  = a.bgColor      || '#000000';
    var chars    = getChars(a);
    var isRainbow = (a.colorStyle === 'rainbow');
    var glowOn   = a.glowEffect !== false;

    /* build DOM */
    var wrap = document.createElement('div');
    wrap.className = 'bkbg-mr-wrap';
    wrap.style.height = height + 'px';

    typoCssVarsForEl(wrap, a.overlayTypo, '--bkbg-mr-ot-');
    typoCssVarsForEl(wrap, a.subtextTypo, '--bkbg-mr-os-');

    var canvas = document.createElement('canvas');
    canvas.className = 'bkbg-mr-canvas';
    canvas.height = height;
    wrap.appendChild(canvas);

    /* overlay text */
    if (a.showOverlay) {
        var overlay = document.createElement('div');
        overlay.className = 'bkbg-mr-overlay';
        overlay.style.background = a.overlayBg || 'rgba(0,0,0,0.35)';

        if (a.overlayText) {
            var ot = document.createElement('h2');
            ot.className = 'bkbg-mr-overlay-title';
            ot.style.color = a.overlayTextColor || '#00ff41';
            ot.textContent = a.overlayText;
            overlay.appendChild(ot);
        }
        if (a.overlaySubtext) {
            var os = document.createElement('p');
            os.className = 'bkbg-mr-overlay-sub';
            os.style.color = a.overlayTextColor || '#00ff41';
            os.textContent = a.overlaySubtext;
            overlay.appendChild(os);
        }
        wrap.appendChild(overlay);
    }

    root.appendChild(wrap);

    /* canvas sizing */
    var ctx = canvas.getContext('2d');
    function resize() {
        canvas.width = wrap.offsetWidth || window.innerWidth;
        canvas.height = height;
        initDrops();
    }

    var drops = [];
    function initDrops() {
        var cols = Math.floor(canvas.width / fontSize);
        drops = [];
        for (var i = 0; i < cols; i++) {
            if (Math.random() > density) {
                drops.push(null); /* skip column based on density */
            } else {
                drops.push(a.randomStart ? Math.floor(Math.random() * -(height / fontSize)) : 0);
            }
        }
    }

    resize();
    window.addEventListener('resize', resize);

    /* animation */
    var paused    = false;
    var raf       = null;
    var lastTime  = 0;
    var interval  = 1000 / (speed / 10 + 5);
    var pauseBadge = null;

    function draw(ts) {
        raf = requestAnimationFrame(draw);
        if (paused) return;
        if (ts - lastTime < interval) return;
        lastTime = ts;

        /* fade trail */
        ctx.fillStyle = hexToRgba(bgColor, bgOp);
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (glowOn) {
            ctx.shadowBlur  = 8;
            ctx.shadowColor = primary;
        } else {
            ctx.shadowBlur  = 0;
        }

        ctx.font = fontSize + 'px monospace';

        var cols = drops.length;
        for (var i = 0; i < cols; i++) {
            if (drops[i] === null) continue;

            var ch = chars[Math.floor(Math.random() * chars.length)];
            var x  = i * fontSize;
            var y  = drops[i] * fontSize;

            /* head char (bright white / highlight) */
            ctx.fillStyle = headCol;
            ctx.fillText(ch, x, y);

            /* fade the previous cells to primary color */
            if (isRainbow) {
                ctx.fillStyle = hslColumn(i, cols);
            } else {
                ctx.fillStyle = primary;
            }

            /* draw a few chars above the head position in faded color to extend trail */
            var trailLen = Math.min(a.fadeLength || 20, Math.floor(Math.random() * 8) + 4);
            for (var t = 1; t <= trailLen; t++) {
                var ty = (drops[i] - t) * fontSize;
                if (ty < 0) break;
                var alpha = 1 - t / trailLen;
                if (isRainbow) {
                    ctx.fillStyle = 'hsla(' + Math.round((i / cols) * 360) + ',100%,55%,' + alpha + ')';
                } else {
                    ctx.fillStyle = hexToRgbaFull(primary, alpha);
                }
                ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, ty);
            }

            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    raf = requestAnimationFrame(draw);

    /* pause/resume badge */
    function togglePause() {
        paused = !paused;
        if (paused) {
            if (!pauseBadge) {
                pauseBadge = document.createElement('div');
                pauseBadge.className = 'bkbg-mr-paused-badge';
                pauseBadge.textContent = '■ PAUSED';
                wrap.appendChild(pauseBadge);
            }
            pauseBadge.style.display = 'block';
        } else {
            if (pauseBadge) pauseBadge.style.display = 'none';
        }
    }

    if (a.clickToPause) {
        canvas.addEventListener('click', togglePause);
        if (a.showOverlay && overlay) overlay.style.pointerEvents = 'auto';
    }
    if (a.pauseOnHover) {
        canvas.addEventListener('mouseenter', function () { if (!paused) { paused = true; } });
        canvas.addEventListener('mouseleave', function () { paused = false; });
    }

    /* cleanup on page unload */
    window.addEventListener('beforeunload', function () { cancelAnimationFrame(raf); });
}

function hexToRgba(hex, alpha) {
    var r = 0, g = 0, b = 0;
    if (hex && hex.startsWith('#')) {
        var h = hex.replace('#','');
        if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
        r = parseInt(h.slice(0,2),16) || 0;
        g = parseInt(h.slice(2,4),16) || 0;
        b = parseInt(h.slice(4,6),16) || 0;
    }
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}
function hexToRgbaFull(hex, alpha) { return hexToRgba(hex, alpha); }
