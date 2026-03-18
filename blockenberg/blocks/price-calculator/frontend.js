(function () {
    function initCalculator(card) {
        var currency    = card.dataset.currency    || '$';
        var currencyPos = card.dataset.currencyPos || 'before';
        var discount    = parseFloat(card.dataset.annualDiscount) || 0;
        var basePrice   = parseFloat(card.dataset.basePrice)      || 0;

        var isAnnual = false;

        var toggleBtn  = card.querySelector('.bkbg-pc-toggle-btn');
        var priceEl    = card.querySelector('.bkbg-pc-price-val');
        var priceNote  = card.querySelector('.bkbg-pc-price-note');
        var sliderRows = card.querySelectorAll('.bkbg-pc-slider-row');
        var addonEls   = card.querySelectorAll('.bkbg-pc-addon');

        function calcTotal() {
            var total = basePrice;

            sliderRows.forEach(function (row) {
                var range = row.querySelector('.bkbg-pc-range');
                var ppu   = parseFloat(row.dataset.pricePerUnit) || 0;
                if (range) total += parseFloat(range.value) * ppu;
            });

            addonEls.forEach(function (addonEl) {
                var cb    = addonEl.querySelector('.bkbg-pc-addon-cb');
                var price = parseFloat(addonEl.dataset.price) || 0;
                if (cb && cb.checked) total += price;
            });

            if (isAnnual && discount > 0) {
                total = total * (1 - discount / 100);
            }
            return total;
        }

        function formatPrice(val) {
            var num = val.toFixed(2).replace(/\.00$/, '');
            return currencyPos === 'before' ? currency + num : num + currency;
        }

        function updateDisplay() {
            if (!priceEl) return;
            var total = calcTotal();
            priceEl.textContent = total.toFixed(2).replace(/\.00$/, '');
        }

        function updateSliderFill(row, range) {
            var fill = row.querySelector('.bkbg-pc-slider-fill');
            var valEl = row.querySelector('.bkbg-pc-slider-val');
            if (!range) return;
            var pct = ((range.value - range.min) / (range.max - range.min)) * 100;
            if (fill) fill.style.width = pct + '%';
            if (valEl) valEl.textContent = range.value + ' ' + (range.dataset.unit || '');
        }

        /* Init slider fills */
        sliderRows.forEach(function (row) {
            var range = row.querySelector('.bkbg-pc-range');
            if (!range) return;
            updateSliderFill(row, range);
            range.addEventListener('input', function () {
                updateSliderFill(row, range);
                updateDisplay();
            });
        });

        /* Addon checkboxes */
        addonEls.forEach(function (addonEl) {
            var cb = addonEl.querySelector('.bkbg-pc-addon-cb');
            if (!cb) return;
            if (cb.checked) addonEl.classList.add('is-checked');
            cb.addEventListener('change', function () {
                addonEl.classList.toggle('is-checked', cb.checked);
                updateDisplay();
            });
        });

        /* Billing toggle */
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function () {
                isAnnual = !isAnnual;
                toggleBtn.setAttribute('aria-pressed', isAnnual ? 'true' : 'false');
                if (priceNote) {
                    priceNote.textContent = isAnnual
                        ? (priceNote.dataset.annual || '')
                        : (priceNote.dataset.monthly || '');
                }
                updateDisplay();
            });
        }

        updateDisplay();
    }

    function init() {
        var cards = document.querySelectorAll('.bkbg-pc-card');
        cards.forEach(initCalculator);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
