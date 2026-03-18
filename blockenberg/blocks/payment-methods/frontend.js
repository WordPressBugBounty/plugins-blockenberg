(function () {
    'use strict';

    var BRANDS = {
        visa:       { label: 'Visa',        bg: '#1434CB', color: '#fff',    text: 'VISA',       fontSize: 15, fontStyle: 'italic', fontFamily: 'Georgia, serif', fontWeight: '900' },
        mastercard: { label: 'Mastercard',  bg: '#252525', color: '#fff',    text: 'MC',         fontSize: 14, fontFamily: 'system-ui, sans-serif',                fontWeight: '800' },
        amex:       { label: 'Amex',        bg: '#007BC1', color: '#fff',    text: 'AMEX',       fontSize: 12, fontFamily: 'system-ui, sans-serif',                fontWeight: '700' },
        paypal:     { label: 'PayPal',      bg: '#003087', color: '#009cde', text: 'PayPal',     fontSize: 11, fontFamily: 'system-ui, sans-serif',                fontWeight: '800' },
        applepay:   { label: 'Apple Pay',   bg: '#000000', color: '#fff',    text: ' Pay',       fontSize: 11, fontFamily: 'system-ui, sans-serif',                fontWeight: '600', prefix: '\uD83C\uDF4E' },
        googlepay:  { label: 'Google Pay',  bg: '#ffffff', color: '#1a73e8', text: 'G Pay',      fontSize: 12, fontFamily: 'system-ui, sans-serif',                fontWeight: '700', border: '#dadce0' },
        discover:   { label: 'Discover',    bg: '#231F20', color: '#F76F20', text: 'DISCOVER',   fontSize: 9,  fontFamily: 'system-ui, sans-serif',                fontWeight: '700' },
        stripe:     { label: 'Stripe',      bg: '#635BFF', color: '#fff',    text: 'stripe',     fontSize: 12, fontFamily: 'system-ui, sans-serif',                fontWeight: '700' },
        klarna:     { label: 'Klarna',      bg: '#FFB3C7', color: '#17120f', text: 'klarna',     fontSize: 11, fontFamily: 'system-ui, sans-serif',                fontWeight: '700' },
        afterpay:   { label: 'Afterpay',    bg: '#B2FCE4', color: '#000',    text: 'afterpay',   fontSize: 9,  fontFamily: 'system-ui, sans-serif',                fontWeight: '700' },
        amazonpay:  { label: 'Amazon Pay',  bg: '#232F3E', color: '#FF9900', text: 'amazon\npay',fontSize: 9,  fontFamily: 'system-ui, sans-serif',                fontWeight: '700' },
        venmo:      { label: 'Venmo',       bg: '#3D95CE', color: '#fff',    text: 'venmo',      fontSize: 11, fontFamily: 'system-ui, sans-serif',                fontWeight: '700' },
        maestro:    { label: 'Maestro',     bg: '#fff',    color: '#333',    text: 'maestro',    fontSize: 10, fontFamily: 'system-ui, sans-serif',                fontWeight: '600', border: '#ccc' },
        bitcoin:    { label: 'Bitcoin',     bg: '#F7931A', color: '#fff',    text: '\u20BF',     fontSize: 20, fontFamily: 'system-ui, sans-serif',                fontWeight: '700' },
        shoppay:    { label: 'Shop Pay',    bg: '#5A31F4', color: '#fff',    text: 'shop\npay',  fontSize: 10, fontFamily: 'system-ui, sans-serif',                fontWeight: '700' }
    };

    var BADGE_ICONS = { ssl: '\uD83D\uDD12', pci: '\uD83D\uDEE1', '256bit': '\uD83D\uDD10', shield: '\u2713' };

    function applyCSS(el, styles) {
        Object.keys(styles).forEach(function (k) { el.style[k] = styles[k]; });
    }

    var _typoKeys = {
        family: '-ff', sizeDesktop: '-fs', sizeTablet: '-fs-tab', sizeMobile: '-fs-mob',
        weight: '-fw', style: '-fst', decoration: '-td', transform: '-tt',
        letterSpacing: '-ls', lineHeight: '-lh'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj) return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k]; if (v === undefined || v === '') return;
            var u = (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile')
                ? (String(v).match(/[a-z%]/i) ? v : v + 'px')
                : (k === 'lineHeight' ? String(v) : v);
            el.style.setProperty(prefix + _typoKeys[k], u);
        });
    }

    function makeIcon(brandId, size, radius, bgOverride, borderOverride) {
        var b = BRANDS[brandId];
        if (!b) return null;

        var width = Math.round(size * 1.6);
        var div = document.createElement('div');
        div.className = 'bkbg-pmth-icon';
        applyCSS(div, {
            width: width + 'px',
            height: size + 'px',
            background: bgOverride || b.bg,
            borderRadius: radius + 'px',
            border: (borderOverride || b.border) ? '1px solid ' + (borderOverride || b.border) : 'none',
            flexDirection: 'column'
        });

        var span = document.createElement('span');
        span.className = 'bkbg-pmth-icon-text';
        span.textContent = (b.prefix || '') + b.text;
        applyCSS(span, {
            color: b.color,
            fontSize: b.fontSize + 'px',
            fontWeight: b.fontWeight || '700',
            fontStyle: b.fontStyle || 'normal',
            fontFamily: b.fontFamily || 'system-ui, sans-serif',
            whiteSpace: 'pre',
            lineHeight: '1.1',
            textAlign: 'center'
        });
        div.appendChild(span);
        return div;
    }

    function init() {
        document.querySelectorAll('.bkbg-pmth-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                methods: [],
                securityBadges: [],
                layout: 'row',
                align: 'center',
                showLabels: false,
                showSecurityBadges: true,
                badgePosition: 'below',
                iconSize: 44,
                iconRadius: 8,
                iconGap: 10,
                badgeFontSize: 12,
                maxWidth: 0,
                paddingTop: 0,
                paddingBottom: 0,
                iconBg: '',
                iconBorder: '',
                labelColor: '',
                badgeColor: '',
                bgColor: ''
            }, opts);

            var alignClass = 'is-' + o.align;

            /* Outer wrap */
            var wrap = document.createElement('div');
            wrap.className = 'bkbg-pmth-wrap';
            applyCSS(wrap, {
                paddingTop: o.paddingTop + 'px',
                paddingBottom: o.paddingBottom + 'px',
                background: o.bgColor || ''
            });

            var inner = document.createElement('div');
            inner.className = 'bkbg-pmth-inner' + (o.badgePosition === 'right' ? ' is-inline' : '');

            /* Max width wrapper */
            var maxWrap = inner;
            if (o.maxWidth > 0) {
                maxWrap = document.createElement('div');
                maxWrap.style.maxWidth = o.maxWidth + 'px';
                maxWrap.style.margin = '0 auto';
                maxWrap.style.width = '100%';
                wrap.appendChild(maxWrap);
                maxWrap.appendChild(inner);
            } else {
                wrap.appendChild(inner);
            }

            /* Icons row */
            var iconsRow = document.createElement('div');
            iconsRow.className = 'bkbg-pmth-icons ' + alignClass;
            iconsRow.style.gap = o.iconGap + 'px';

            var enabled = (o.methods || []).filter(function (m) { return m.enabled; });
            enabled.forEach(function (m) {
                var b = BRANDS[m.id];
                if (!b) return;

                var iconWrap = document.createElement('div');
                iconWrap.className = 'bkbg-pmth-icon-wrap';

                var icon = makeIcon(m.id, o.iconSize, o.iconRadius, o.iconBg || '', o.iconBorder || '');
                if (icon) iconWrap.appendChild(icon);

                if (o.showLabels) {
                    var lbl = document.createElement('span');
                    lbl.className = 'bkbg-pmth-label';
                    lbl.textContent = b.label;
                    applyCSS(lbl, { color: o.labelColor || '#6b7280', fontSize: '10px' });
                    iconWrap.appendChild(lbl);
                }

                iconsRow.appendChild(iconWrap);
            });

            if (enabled.length === 0) {
                var empty = document.createElement('p');
                empty.style.color = '#9ca3af';
                empty.style.fontSize = '13px';
                empty.textContent = 'No payment methods enabled.';
                iconsRow.appendChild(empty);
            }

            inner.appendChild(iconsRow);

            /* Badges */
            if (o.showSecurityBadges) {
                var enabledBadges = (o.securityBadges || []).filter(function (b) { return b.enabled; });
                if (enabledBadges.length) {
                    var badgesRow = document.createElement('div');
                    badgesRow.className = 'bkbg-pmth-badges ' + alignClass;

                    enabledBadges.forEach(function (badge) {
                        var bdg = document.createElement('div');
                        bdg.className = 'bkbg-pmth-badge';

                        var icon = document.createElement('span');
                        icon.className = 'bkbg-pmth-badge-icon';
                        icon.textContent = BADGE_ICONS[badge.id] || '\uD83D\uDD12';
                        // icon size inherits from .bkbg-pmth-badge

                        var lbl = document.createElement('span');
                        lbl.textContent = badge.label || badge.id;
                        applyCSS(lbl, { color: o.badgeColor || '#6b7280' });

                        bdg.appendChild(icon);
                        bdg.appendChild(lbl);
                        badgesRow.appendChild(bdg);
                    });

                    inner.appendChild(badgesRow);
                }
            }

            typoCssVarsForEl(wrap, o.badgeTypo, '--bkbg-pmth-badge');
            appEl.parentNode.insertBefore(wrap, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
