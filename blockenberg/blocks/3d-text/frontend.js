document.addEventListener('DOMContentLoaded', function () {
    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        transform:'text-transform', decoration:'text-decoration',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    var _typoUnits = { size:'sizeUnit', lineHeight:'lineHeightUnit', letterSpacing:'letterSpacingUnit', wordSpacing:'wordSpacingUnit' };
    var _typoUnitDefaults = { size:'px', lineHeight:'', letterSpacing:'px', wordSpacing:'px' };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k]; if (v === undefined || v === '') return;
            var prop = _typoKeys[k];
            var base = k.replace(/Desktop|Tablet|Mobile/, '');
            var uKey = _typoUnits[base];
            if (uKey && typeof v === 'number') v = v + (obj[uKey] || _typoUnitDefaults[base] || '');
            el.style.setProperty('--' + prefix + prop, v);
        });
    }

    document.querySelectorAll('.bkbg-3dt-app').forEach(function (root) {
        var opts = JSON.parse(root.dataset.opts || '{}');
        init3DText(root, opts);
    });
});

function make3dShadow(a, depthOverride) {
    var depth   = depthOverride !== undefined ? depthOverride : (a.depth || 8);
    var angle   = (a.angle || 45) * Math.PI / 180;
    var dx      = Math.cos(angle);
    var dy      = Math.sin(angle);
    var shads   = [];
    var style3d = a.style3d || 'extrude';

    if (style3d === 'extrude') {
        for (var i = 1; i <= depth; i++) {
            shads.push((dx * i).toFixed(1) + 'px ' + (dy * i).toFixed(1) + 'px 0 ' + (a.depthColor || '#312e81'));
        }
        shads.push((dx * depth + 4).toFixed(1) + 'px ' + (dy * depth + 6).toFixed(1) + 'px 8px ' + (a.shadowColor || 'rgba(0,0,0,0.25)'));
    } else if (style3d === 'longshadow') {
        var steps = depth * 4;
        for (var i = 1; i <= steps; i++) {
            shads.push(i + 'px ' + i + 'px 0 ' + (a.depthColor || '#312e81'));
        }
    } else if (style3d === 'retro') {
        for (var i = 1; i <= depth; i++) {
            shads.push(i + 'px ' + i + 'px 0 ' + (a.depthColor || '#312e81'));
        }
        shads.push('0 0 0 3px ' + (a.depthColor || '#312e81'));
        shads.push((depth + 4) + 'px ' + (depth + 6) + 'px 10px ' + (a.shadowColor || 'rgba(0,0,0,0.25)'));
    } else if (style3d === 'isometric') {
        for (var i = 1; i <= depth; i++) {
            shads.push(i + 'px ' + Math.round(i * 0.5) + 'px 0 ' + (a.depthColor || '#312e81'));
        }
        shads.push((depth + 3) + 'px ' + Math.round(depth * 0.5 + 4) + 'px 8px ' + (a.shadowColor || 'rgba(0,0,0,0.25)'));
    } else if (style3d === 'emboss') {
        shads.push('-1px -1px 2px rgba(255,255,255,0.3)');
        shads.push('1px 1px 2px rgba(0,0,0,0.5)');
        for (var i = 1; i <= depth; i++) {
            shads.push(i + 'px ' + i + 'px 0 ' + (a.depthColor || '#312e81'));
        }
    }
    return shads.join(', ');
}

function init3DText(root, a) {
    var Tag    = a.tag || 'h2';
    var text   = a.text || '3D TEXT';
    var depth  = a.depth || 8;

    /* wrap */
    var wrap = document.createElement('div');
    wrap.className = 'bkbg-3dt-wrap bkbg-3dt-hover-' + (a.hoverEffect || 'tilt');
    wrap.style.cssText = [
        'background:' + (a.showBg ? (a.backgroundColor || '#0f172a') : 'transparent'),
        'padding:' + (a.paddingV || 48) + 'px ' + (a.paddingH || 32) + 'px',
        'border-radius:' + (a.borderRadius || 0) + 'px',
        'text-align:' + (a.textAlign || 'center'),
        'overflow:hidden',
        'position:relative',
    ].join(';');

    /* text element */
    var textEl = document.createElement(Tag);
    textEl.className = 'bkbg-3dt-text bkbg-3dt-anim-' + (a.animation || 'none');
    textEl.textContent = text;

    var baseTextShadow = make3dShadow(a);

    var ts = [
        'margin:0',
        'display:block',
        'cursor:default',
        'text-shadow:' + baseTextShadow,
    ];

    if (a.gradientText) {
        ts.push('background:linear-gradient(135deg,' + (a.gradientFrom || '#a78bfa') + ' 0%,' + (a.gradientTo || '#60a5fa') + ' 100%)');
        ts.push('-webkit-background-clip:text');
        ts.push('-webkit-text-fill-color:transparent');
        ts.push('background-clip:text');
        ts.push('color:transparent');
    } else {
        ts.push('color:' + (a.textColor || '#6366f1'));
    }
    textEl.style.cssText = ts.join(';');

    wrap.appendChild(textEl);

    /* reflection */
    if (a.showReflection) {
        var reflEl = document.createElement(Tag);
        reflEl.className = 'bkbg-3dt-text bkbg-3dt-reflection';
        reflEl.textContent = text;
        reflEl.style.cssText = textEl.style.cssText;
        wrap.appendChild(reflEl);
    }

    /* Apply typo CSS vars on root (cascades to .bkbg-3dt-text) */
    typoCssVarsForEl(root, a.textTypo, 'bk3dt-tx-');

    root.appendChild(wrap);

    /* hover: tilt */
    if (a.hoverEffect === 'tilt') {
        wrap.style.perspective = '600px';
        wrap.addEventListener('mousemove', function (e) {
            var rect = wrap.getBoundingClientRect();
            var cx   = rect.left + rect.width  / 2;
            var cy   = rect.top  + rect.height / 2;
            var rx   = ((e.clientY - cy) / (rect.height / 2)) * -12;
            var ry   = ((e.clientX - cx) / (rect.width  / 2)) * 12;
            textEl.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
        });
        wrap.addEventListener('mouseleave', function () {
            textEl.style.transform = 'rotateX(0) rotateY(0)';
        });
    }

    /* hover: press — animate depth collapse */
    if (a.hoverEffect === 'press') {
        var pressing = false;
        wrap.addEventListener('mouseenter', function () {
            if (pressing) return;
            pressing = true;
            var cur = depth;
            var iv  = setInterval(function () {
                cur = Math.max(0, cur - 1);
                textEl.style.textShadow = make3dShadow(a, cur);
                if (cur <= 0) clearInterval(iv);
            }, 20);
        });
        wrap.addEventListener('mouseleave', function () {
            pressing = false;
            var cur = 0;
            var iv  = setInterval(function () {
                cur = Math.min(depth, cur + 1);
                textEl.style.textShadow = make3dShadow(a, cur);
                if (cur >= depth) clearInterval(iv);
            }, 20);
        });
    }
}
