(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-rvb-wrap[data-schema="1"]').forEach(function (wrap) {
            var d         = wrap.dataset;
            var schemaType= d.schemaType || 'Product';
            var name      = d.name       || document.title;
            var score     = parseFloat(d.score)    || 0;
            var maxScore  = parseFloat(d.maxScore) || 5;
            var price     = d.price      || '';

            /* Collect pros/cons from rendered HTML for description */
            var proEls  = wrap.querySelectorAll('.bkbg-rvb-pros li');
            var conEls  = wrap.querySelectorAll('.bkbg-rvb-cons li');
            var summary = wrap.querySelector('.bkbg-rvb-summary p');

            var pros = Array.prototype.map.call(proEls, function (el) { return el.textContent.trim(); });
            var cons = Array.prototype.map.call(conEls, function (el) { return el.textContent.trim(); });

            var description = (summary ? summary.textContent.trim() : '') ||
                (pros.length ? 'Pros: ' + pros.join(', ') : '');

            var schema = {
                '@context': 'https://schema.org',
                '@type':    schemaType,
                'name':     name,
            };

            if (description) schema.description = description;

            /* AggregateRating */
            schema.aggregateRating = {
                '@type':       'AggregateRating',
                'ratingValue': score,
                'bestRating':  maxScore,
                'worstRating': 1,
                'ratingCount': 1,
            };

            /* Offer / Price */
            if (price && schemaType === 'Product') {
                schema.offers = {
                    '@type':       'Offer',
                    'price':        price.replace(/[^0-9.,]/g, ''),
                    'priceCurrency':'USD',
                    'availability': 'https://schema.org/InStock',
                };
            }

            var script = document.createElement('script');
            script.type        = 'application/ld+json';
            script.textContent = JSON.stringify(schema);
            document.head.appendChild(script);
        });
    });
})();
