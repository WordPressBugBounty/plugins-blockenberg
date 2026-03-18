(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family:'font-family', weight:'font-weight', style:'font-style',
            decoration:'text-decoration', transform:'text-transform',
            sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
            lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
            letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
            wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
        };
        Object.keys(map).forEach(function(k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) v = v + (typo.sizeUnit || 'px');
                else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) v = v + (typo.lineHeightUnit || '');
                else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) v = v + (typo.letterSpacingUnit || 'px');
                else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) v = v + (typo.wordSpacingUnit || 'px');
                el.style.setProperty(prefix + map[k], String(v));
            }
        });
    }

    var TYPE_ICONS = {
        address: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 019.5 9 2.5 2.5 0 0112 6.5 2.5 2.5 0 0114.5 9 2.5 2.5 0 0112 11.5z"/></svg>',
        phone:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.4 11.4 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.57 3.57 1 1 0 01-.25 1.01l-2.2 2.21z"/></svg>',
        email:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
        website: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54A1.99 1.99 0 0016 14h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V5.07c3.95.49 7 3.85 7 7.93 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
        hours:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>',
        fax:     '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H7V4h10v16zM9 7h6v2H9zm0 4h6v2H9zm0 4h4v2H9z"/></svg>',
        custom:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
    };

    function getLinkHref(item) {
        if (item.type === 'phone')   return 'tel:' + item.value.replace(/\s/g, '');
        if (item.type === 'email')   return 'mailto:' + item.value;
        if (item.type === 'website') return item.value;
        return item.value;
    }

    function makeIconEl(type, iconStyle) {
        var svg = TYPE_ICONS[type] || TYPE_ICONS.custom;
        var span = document.createElement('span');
        span.className = 'bkbg-cti-icon bkbg-cti-icon--' + (iconStyle === 'none' ? 'plain' : iconStyle === 'outline' ? 'box bkbg-cti-icon--outline' : 'box');
        span.innerHTML = svg;
        return span;
    }

    function initContactInfo(wrap) {
        var d         = wrap.dataset;
        var items     = JSON.parse(d.items || '[]');
        var iconStyle = d.iconStyle   || 'filled';
        var showLabel = d.showLabel   !== '0';
        var withSchema= d.schema      !== '0';

        items.forEach(function (item) {
            var row = document.createElement('div');
            row.className = 'bkbg-cti-item';

            row.appendChild(makeIconEl(item.type, iconStyle));

            var body = document.createElement('div');
            body.className = 'bkbg-cti-body';

            if (showLabel && item.label) {
                var lbl = document.createElement('span');
                lbl.className   = 'bkbg-cti-label';
                lbl.textContent = item.label;
                body.appendChild(lbl);
            }

            if (item.linkEnabled) {
                var a = document.createElement('a');
                a.className   = 'bkbg-cti-link';
                a.href        = getLinkHref(item);
                a.textContent = item.value;
                if (item.type === 'website') { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
                body.appendChild(a);
            } else {
                var val = document.createElement('span');
                val.className   = 'bkbg-cti-value';
                val.textContent = item.value;
                body.appendChild(val);
            }

            row.appendChild(body);
            wrap.appendChild(row);
        });

        /* Schema injection */
        if (withSchema && items.length) {
            var address = items.find(function (i) { return i.type === 'address'; });
            var phone   = items.find(function (i) { return i.type === 'phone'; });
            var email   = items.find(function (i) { return i.type === 'email'; });

            if (address || phone || email) {
                var schema = { '@context': 'https://schema.org', '@type': 'LocalBusiness' };
                if (address) schema['address'] = { '@type': 'PostalAddress', 'streetAddress': address.value };
                if (phone)   schema['telephone'] = phone.value;
                if (email)   schema['email'] = email.value;

                var script = document.createElement('script');
                script.type        = 'application/ld+json';
                script.textContent = JSON.stringify(schema);
                document.head.appendChild(script);
            }
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-cti-wrap[data-items]').forEach(initContactInfo);
    });
})();
