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

    function buildWhatsAppUrl(number, message) {
        var num = (number || '').replace(/[^0-9]/g, '');
        var msg = encodeURIComponent(message || '');
        return 'https://wa.me/' + num + (msg ? '?text=' + msg : '');
    }

    function initBlock(root) {
        var app = root.querySelector('.bkbg-phb-app');
        if (!app) return;

        var raw = app.getAttribute('data-opts') || '{}';
        var o;
        try { o = JSON.parse(raw); } catch (e) { o = {}; }

        var mode            = o.mode           || 'both';
        var layout          = o.layout         || 'floating';
        var position        = o.position       || 'bottom-right';
        var showPulse       = o.showPulse       !== false;
        var showText        = !!o.showText;
        var buttonText      = o.buttonText     || 'Call us';
        var buttonSize      = Number(o.buttonSize)  || 56;
        var iconSize        = Number(o.iconSize)    || 26;
        var borderRadius    = Number(o.borderRadius) || 999;
        var gap             = Number(o.gap)     || 14;
        var shadowStrength  = Number(o.shadowStrength) || 30;
        var scrollOffset    = Number(o.scrollOffset) || 0;
        var phoneBg         = o.phoneBg         || '#6366f1';
        var phoneColor      = o.phoneColor      || '#ffffff';
        var phonePulse      = o.phonePulseBg    || '#6366f1';
        var whatsappBg      = o.whatsappBg      || '#25d366';
        var whatsappColor   = o.whatsappColor   || '#ffffff';
        var whatsappPulse   = o.whatsappPulseBg || '#25d366';
        var labelBg         = o.labelBg         || '#1e1b4b';
        var labelColor      = o.labelColor      || '#ffffff';
        var labelTypo       = o.labelTypo;

        var shadowAlpha = (shadowStrength / 100).toFixed(2);
        var shadowStyle = '0 4px 20px rgba(0,0,0,' + shadowAlpha + ')';

        var showPhone     = mode !== 'whatsapp';
        var showWhatsapp  = mode !== 'phone';

        /* ── Build container ──────────────────────────────────────────── */
        var isFloating = layout === 'floating';
        var container  = document.createElement('div');

        if (isFloating) {
            container.className = 'bkbg-phb-float bkbg-phb-' + position +
                (scrollOffset > 0 ? '' : ' bkbg-phb-visible');
            container.style.setProperty('--phb-gap', gap + 'px');
            document.body.appendChild(container);
        } else {
            container.className = 'bkbg-phb-inline';
            container.style.setProperty('--phb-gap', gap + 'px');
            app.appendChild(container);
        }

        /* ── Helper: build one button item ────────────────────────────── */
        function makeItem(type, icon, bg, color, pulse, href, labelText) {
            var item = document.createElement('div');
            item.className = 'bkbg-phb-item bkbg-phb-' + type;

            // Pulse ring
            if (showPulse) {
                var ring = document.createElement('div');
                ring.className = 'bkbg-phb-pulse';
                ring.style.borderRadius = borderRadius + 'px';
                ring.style.setProperty('--phb-' + (type === 'phone' ? 'phone' : 'wa') + '-pulse', pulse);
                ring.style.background = pulse;
                item.appendChild(ring);
            }

            // Button
            var btn = document.createElement('a');
            btn.className  = 'bkbg-phb-btn';
            btn.href       = href;
            btn.target     = '_blank';
            btn.rel        = 'noopener noreferrer';
            btn.setAttribute('aria-label', labelText || type);
            btn.style.cssText = [
                'width:'         + buttonSize   + 'px',
                'height:'        + buttonSize   + 'px',
                'border-radius:' + borderRadius + 'px',
                'background:'    + bg,
                'color:'         + color,
                'font-size:'     + iconSize     + 'px',
                'box-shadow:'    + shadowStyle
            ].join(';');
            btn.textContent = icon;
            item.appendChild(btn);

            // Label
            if (showText && labelText) {
                var lbl = document.createElement('span');
                lbl.className   = 'bkbg-phb-label';
                lbl.textContent = labelText;
                lbl.style.background = labelBg;
                lbl.style.color      = labelColor;
                typoCssVarsForEl(lbl, labelTypo, '--bkbg-phb-lb-');
                item.appendChild(lbl);
            }

            return item;
        }

        /* ── Add phone button ─────────────────────────────────────────── */
        if (showPhone && o.phoneNumber) {
            var phoneHref = 'tel:' + o.phoneNumber.replace(/\s/g, '');
            container.appendChild(
                makeItem('phone', '📞', phoneBg, phoneColor, phonePulse, phoneHref, buttonText)
            );
        }

        /* ── Add WhatsApp button ──────────────────────────────────────── */
        if (showWhatsapp && o.whatsappNumber) {
            var waHref = buildWhatsAppUrl(o.whatsappNumber, o.whatsappMessage);
            container.appendChild(
                makeItem('whatsapp', '💬', whatsappBg, whatsappColor, whatsappPulse, waHref, 'WhatsApp')
            );
        }

        /* ── Scroll offset (floating only) ────────────────────────────── */
        if (isFloating && scrollOffset > 0) {
            var ticking = false;
            window.addEventListener('scroll', function () {
                if (!ticking) {
                    requestAnimationFrame(function () {
                        if (window.scrollY >= scrollOffset) {
                            container.classList.add('bkbg-phb-visible');
                        } else {
                            container.classList.remove('bkbg-phb-visible');
                        }
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }
    }

    function init() {
        document.querySelectorAll('.wp-block-blockenberg-phone-button').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
