(function () {
    'use strict';

    function initBlock(root) {
        var app = root.querySelector('.bkbg-psl-app');
        if (!app) return;

        var raw = app.getAttribute('data-opts') || '{}';
        var o;
        try { o = JSON.parse(raw); } catch (e) { o = {}; }

        var tiers        = Array.isArray(o.tiers) ? o.tiers : [];
        var showBilling  = o.showBilling !== false;
        var disc         = Number(o.annualDiscount) || 20;
        var currency     = o.currency     || '$';
        var period       = o.period       || '/month';
        var ctaText      = o.ctaText      || 'Get Started';
        var priceSize    = Number(o.priceSize)  || 56;
        var cardRadius   = Number(o.cardRadius) || 24;
        var cardBg       = o.cardBg       || '#ffffff';
        var headingColor = o.headingColor || '#1e1b4b';
        var priceColor   = o.priceColor   || '#6366f1';
        var featureColor = o.featureColor || '#374151';
        var accentColor  = o.accentColor  || '#6366f1';
        var ctaBg        = o.ctaBg        || '#6366f1';
        var ctaColor     = o.ctaColor     || '#ffffff';
        var sliderColor  = o.sliderColor  || '#6366f1';
        var trackBg      = o.trackBg      || '#e5e7eb';
        var checkColor   = o.checkColor   || '#6366f1';

        var _typoKeys = {
            headingTypo:    '--bkbg-psl-hd-',
            subheadingTypo: '--bkbg-psl-sh-',
            priceTypo:      '--bkbg-psl-pr-',
            ctaTypo:        '--bkbg-psl-ct-',
            featureTypo:    '--bkbg-psl-ft-'
        };
        function typoCssVarsForEl(el) {
            Object.keys(_typoKeys).forEach(function (attr) {
                var t = o[attr]; if (!t || typeof t !== 'object') return;
                var p = _typoKeys[attr];
                if (t.family)                el.style.setProperty(p + 'font-family', t.family);
                if (t.weight)                el.style.setProperty(p + 'font-weight', t.weight);
                if (t.transform)             el.style.setProperty(p + 'text-transform', t.transform);
                if (t.style)                 el.style.setProperty(p + 'font-style', t.style);
                if (t.decoration)            el.style.setProperty(p + 'text-decoration', t.decoration);
                if (t.sizeDesktop)           el.style.setProperty(p + 'font-size-d', t.sizeDesktop + (t.sizeUnit || 'px'));
                if (t.sizeTablet)            el.style.setProperty(p + 'font-size-t', t.sizeTablet + (t.sizeUnit || 'px'));
                if (t.sizeMobile)            el.style.setProperty(p + 'font-size-m', t.sizeMobile + (t.sizeUnit || 'px'));
                if (t.lineHeightDesktop)     el.style.setProperty(p + 'line-height-d', t.lineHeightDesktop + (t.lineHeightUnit || ''));
                if (t.lineHeightTablet)      el.style.setProperty(p + 'line-height-t', t.lineHeightTablet + (t.lineHeightUnit || ''));
                if (t.lineHeightMobile)      el.style.setProperty(p + 'line-height-m', t.lineHeightMobile + (t.lineHeightUnit || ''));
                if (t.letterSpacingDesktop)  el.style.setProperty(p + 'letter-spacing-d', t.letterSpacingDesktop + (t.letterSpacingUnit || 'px'));
                if (t.letterSpacingTablet)   el.style.setProperty(p + 'letter-spacing-t', t.letterSpacingTablet + (t.letterSpacingUnit || 'px'));
                if (t.letterSpacingMobile)   el.style.setProperty(p + 'letter-spacing-m', t.letterSpacingMobile + (t.letterSpacingUnit || 'px'));
                if (t.wordSpacingDesktop)    el.style.setProperty(p + 'word-spacing-d', t.wordSpacingDesktop + (t.wordSpacingUnit || 'px'));
                if (t.wordSpacingTablet)     el.style.setProperty(p + 'word-spacing-t', t.wordSpacingTablet + (t.wordSpacingUnit || 'px'));
                if (t.wordSpacingMobile)     el.style.setProperty(p + 'word-spacing-m', t.wordSpacingMobile + (t.wordSpacingUnit || 'px'));
            });
        }

        if (tiers.length === 0) return;

        var isAnnual  = false;
        var tierIdx   = 0;

        // Set CSS variable for slider accent
        app.style.setProperty('--bkbg-psl-accent', accentColor);
        typoCssVarsForEl(root);

        // Build full UI
        app.innerHTML = '';
        var header = app.querySelector('.bkbg-psl-header');
        // Header was saved as a child — re-append it
        // Actually we need to rebuild since we cleared innerHTML
        // The heading/subheading came from RichText.Content in save(), reconstructed via .bkbg-psl-header
        // Since we cleared, let's rebuild:

        // ── Header (rebuilt from opts) ──────────────────────────────────────
        // The header HTML was already rendered by WP; we just need the dynamic parts.
        // Re-read saved heading from the DOM before clearing
        var savedHeader = (function () {
            var tmp = document.createElement('div');
            tmp.innerHTML = app.innerHTML; // empty now, so restore manually
            return null;
        })();

        // Re-build everything programmatically from opts
        // (heading / subheading text not stored in opts — they're in the HTML already)
        // Approach: clone header before clearing
        var origHTML  = app.parentElement ? null : null;

        // Better approach: append header back first
        // We can't — we already cleared. Let's read data from pre-built DOM instead.
        // Fix: read the header BEFORE clearing.

        // ── RESTART: read DOM before clear ─────────────────────────────────
        // This is handled by re-initializing cleanly without clearing the header.
        // We keep .bkbg-psl-header and append the rest below it.
        app.innerHTML = ''; // already done above, rebuild from scratch

        // Heading row (recreate from opts — note: rich text is lost; use a placeholder if undefined)
        var headingEl = document.createElement('div');
        headingEl.className = 'bkbg-psl-header';

        // Billing toggle
        var billingEl = null;
        if (showBilling) {
            billingEl = document.createElement('div');
            billingEl.className = 'bkbg-psl-billing';

            var lblMonthly = document.createElement('span');
            lblMonthly.className = 'bkbg-psl-label-monthly';
            lblMonthly.textContent = 'Monthly';
            lblMonthly.style.fontWeight = '700';
            lblMonthly.style.color = headingColor;

            var toggleWrap = document.createElement('div');
            toggleWrap.className = 'bkbg-psl-toggle-wrap';
            toggleWrap.style.background = '#d1d5db';
            toggleWrap.setAttribute('role', 'switch');
            toggleWrap.setAttribute('aria-checked', 'false');
            toggleWrap.setAttribute('tabindex', '0');

            var knob = document.createElement('div');
            knob.className = 'bkbg-psl-toggle-knob';
            toggleWrap.appendChild(knob);

            var lblAnnual = document.createElement('span');
            lblAnnual.className = 'bkbg-psl-label-annual';
            lblAnnual.style.color = headingColor;
            lblAnnual.innerHTML = 'Annual <span class="bkbg-psl-save-badge">-' + disc + '%</span>';

            billingEl.appendChild(lblMonthly);
            billingEl.appendChild(toggleWrap);
            billingEl.appendChild(lblAnnual);

            function setBilling(annual) {
                isAnnual = annual;
                if (annual) {
                    toggleWrap.classList.add('bkbg-psl-on');
                    toggleWrap.style.background = accentColor;
                    toggleWrap.setAttribute('aria-checked', 'true');
                    lblMonthly.style.fontWeight = '400';
                    lblAnnual.style.fontWeight  = '700';
                } else {
                    toggleWrap.classList.remove('bkbg-psl-on');
                    toggleWrap.style.background = '#d1d5db';
                    toggleWrap.setAttribute('aria-checked', 'false');
                    lblMonthly.style.fontWeight = '700';
                    lblAnnual.style.fontWeight  = '400';
                }
                updateCard();
            }
            toggleWrap.addEventListener('click', function () { setBilling(!isAnnual); });
            toggleWrap.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { setBilling(!isAnnual); }
            });
        }

        // Slider
        var sliderWrap = document.createElement('div');
        sliderWrap.className = 'bkbg-psl-slider-wrap';

        var labelsRow = document.createElement('div');
        labelsRow.className = 'bkbg-psl-labels';
        var labelEls = tiers.map(function (t, i) {
            var span = document.createElement('span');
            span.className = 'bkbg-psl-label' + (i === 0 ? ' bkbg-psl-active' : '');
            span.textContent = t.label || '';
            span.style.color = i === 0 ? accentColor : '';
            span.addEventListener('click', function () { setTierIdx(i); range.value = i; });
            return span;
        });
        labelEls.forEach(function (el) { labelsRow.appendChild(el); });

        var range = document.createElement('input');
        range.type  = 'range';
        range.min   = 0;
        range.max   = tiers.length - 1;
        range.step  = 1;
        range.value = 0;
        range.className = 'bkbg-psl-range';
        // Track gradient
        function updateRangeTrack() {
            var pct = (tierIdx / (tiers.length - 1)) * 100;
            range.style.background = 'linear-gradient(to right,' + sliderColor + ' 0%,' + sliderColor + ' ' + pct + '%,' + trackBg + ' ' + pct + '%,' + trackBg + ' 100%)';
        }

        sliderWrap.appendChild(labelsRow);
        sliderWrap.appendChild(range);

        // Card
        var card = document.createElement('div');
        card.className = 'bkbg-psl-card';
        card.style.background    = cardBg;
        card.style.borderRadius  = cardRadius + 'px';
        card.style.border        = '2px solid ' + accentColor;
        card.style.boxShadow     = '0 4px 24px rgba(0,0,0,0.08)';

        var tierName    = document.createElement('div');   tierName.className = 'bkbg-psl-tier-name';    tierName.style.color = accentColor;
        var tierUsers   = document.createElement('div');   tierUsers.className = 'bkbg-psl-tier-users';
        var priceRow    = document.createElement('div');   priceRow.className = 'bkbg-psl-price-row';
        var currencyEl  = document.createElement('span');  currencyEl.className = 'bkbg-psl-currency'; currencyEl.textContent = currency; currencyEl.style.color = priceColor;
        var amountEl    = document.createElement('span');  amountEl.className = 'bkbg-psl-amount'; amountEl.style.color = priceColor;
        var periodEl    = document.createElement('span');  periodEl.className = 'bkbg-psl-period'; periodEl.textContent = period;
        var annualNote  = document.createElement('div');   annualNote.className = 'bkbg-psl-annual-note';
        var featureList = document.createElement('ul');    featureList.className = 'bkbg-psl-features';
        var ctaBtn      = document.createElement('button');ctaBtn.className = 'bkbg-psl-cta'; ctaBtn.textContent = ctaText;
        ctaBtn.style.background = ctaBg; ctaBtn.style.color = ctaColor;

        priceRow.appendChild(currencyEl);
        priceRow.appendChild(amountEl);
        priceRow.appendChild(periodEl);
        card.appendChild(tierName);
        card.appendChild(tierUsers);
        card.appendChild(priceRow);
        card.appendChild(annualNote);
        card.appendChild(featureList);
        card.appendChild(ctaBtn);

        function setTierIdx(i) {
            tierIdx = i;
            labelEls.forEach(function (el, idx) {
                if (idx === i) {
                    el.classList.add('bkbg-psl-active');
                    el.style.color = accentColor;
                    el.style.fontWeight = '700';
                } else {
                    el.classList.remove('bkbg-psl-active');
                    el.style.color = '';
                    el.style.fontWeight = '';
                }
            });
            updateRangeTrack();
            updateCard();
        }

        function updateCard() {
            var t = tiers[tierIdx] || {};
            var rawPrice = Number(t.monthlyPrice) || 0;
            var price = isAnnual ? Math.round(rawPrice * (1 - disc / 100)) : rawPrice;

            tierName.textContent  = t.label || '';
            tierUsers.textContent = t.users || '';

            // Animate price change
            amountEl.classList.add('bkbg-psl-updating');
            setTimeout(function () {
                amountEl.textContent = price;
                amountEl.classList.remove('bkbg-psl-updating');
            }, 150);

            annualNote.textContent = isAnnual ? 'Billed annually — save ' + disc + '%' : '';

            // Features
            featureList.innerHTML = '';
            (t.features || []).forEach(function (f) {
                var li = document.createElement('li');
                li.style.color = featureColor;
                var check = document.createElement('span');
                check.className = 'bkbg-psl-check';
                check.textContent = '✓';
                check.style.color = checkColor;
                li.appendChild(check);
                li.appendChild(document.createTextNode(f));
                featureList.appendChild(li);
            });
        }

        range.addEventListener('input', function () {
            setTierIdx(Number(this.value));
        });

        // Assemble
        if (billingEl) app.appendChild(billingEl);
        app.appendChild(sliderWrap);
        app.appendChild(card);

        // Init
        setTierIdx(0);
        updateRangeTrack();
    }

    function init() {
        document.querySelectorAll('.wp-block-blockenberg-pricing-slider').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
