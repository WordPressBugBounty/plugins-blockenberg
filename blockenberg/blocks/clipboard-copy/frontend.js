(function () {
    'use strict';

    var copyIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';

    var sizeMap = {
        sm: { h: '32px', pad: '0 10px', fs: '12px' },
        md: { h: '40px', pad: '0 14px', fs: '14px' },
        lg: { h: '48px', pad: '0 18px', fs: '16px' },
    };

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
            el.style.setProperty(prefix + prop, v);
        });
    }

    function initClipboard(wrap) {
        var d         = wrap.dataset;
        var text      = d.text         || '';
        var label     = d.label        || 'Copy';
        var copied    = d.copiedLabel  || 'Copied! ✓';
        var showCode  = d.showCode     !== '0';
        var iconOn    = d.icon         !== '0';
        var sz        = sizeMap[d.size] || sizeMap.md;
        var radius    = parseInt(d.radius,  10) || 8;
        var btnBg     = d.btnBg     || '#111827';
        var btnColor  = d.btnColor  || '#ffffff';
        var codeBg    = d.codeBg    || '#f3f4f6';
        var codeColor = d.codeColor || '#111827';
        var codeFs    = (d.codeFs   || '16') + 'px';
        var fw        = d.fw        || '600';
        var toast     = parseInt(d.toast, 10) || 2000;
        var desc      = d.description || '';
        var descFs    = d.descSize || '13';

        /* Apply typography CSS vars */
        try { var typoCode = JSON.parse(d.typoCode || '{}'); typoCssVarsForEl(wrap, typoCode, '--bkbg-cpc-cd-'); } catch(e){}
        try { var typoDesc = JSON.parse(d.typoDesc || '{}'); typoCssVarsForEl(wrap, typoDesc, '--bkbg-cpc-ds-'); } catch(e){}

        /* Apply card styles as CSS vars on wrap */
        wrap.style.setProperty('--bkbg-cpc-bg',     d.bg     || '#f9fafb');
        wrap.style.setProperty('--bkbg-cpc-border',  d.border || '#e5e7eb');
        wrap.style.setProperty('--bkbg-cpc-radius',  radius + 'px');

        /* Description */
        if (desc) {
            var p = document.createElement('p');
            p.className   = 'bkbg-cpc-desc';
            p.textContent = desc;
            wrap.appendChild(p);
        }

        /* Code display */
        if (showCode && text) {
            var codeEl = document.createElement('span');
            codeEl.className = 'bkbg-cpc-code';
            codeEl.textContent = text;
            codeEl.style.cssText = [
                'background:'   + codeBg,
                'color:'        + codeColor,
                'border-radius:'+ (radius / 2) + 'px',
            ].join(';');
            wrap.appendChild(codeEl);
        }

        /* Button */
        var btn = document.createElement('button');
        btn.className  = 'bkbg-cpc-btn';
        btn.type       = 'button';
        btn.style.cssText = [
            'height:'       + sz.h,
            'padding:'      + sz.pad,
            'background:'   + btnBg,
            'color:'        + btnColor,
            'font-size:'    + sz.fs,
            'font-weight:'  + fw,
            'border-radius:'+ (radius / 2) + 'px',
        ].join(';');

        if (iconOn) {
            var iconWrap = document.createElement('span');
            iconWrap.style.cssText = 'display:flex;align-items:center;';
            iconWrap.innerHTML = copyIcon;
            btn.appendChild(iconWrap);
        }
        var btnText = document.createElement('span');
        btnText.textContent = label;
        btn.appendChild(btnText);
        wrap.appendChild(btn);

        /* Copy handler */
        var timeout;
        btn.addEventListener('click', function () {
            clearTimeout(timeout);
            function onSuccess() {
                btnText.textContent = copied;
                btn.style.background = '#10b981';
                timeout = setTimeout(function () {
                    btnText.textContent = label;
                    btn.style.background = btnBg;
                }, toast);
            }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(onSuccess).catch(function () {
                    fallbackCopy(text);
                    onSuccess();
                });
            } else {
                fallbackCopy(text);
                onSuccess();
            }
        });
    }

    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-cpc-wrap[data-text]').forEach(initClipboard);
    });
})();
