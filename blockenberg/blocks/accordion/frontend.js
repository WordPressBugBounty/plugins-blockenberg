(function () {
    function toArray(nl) {
        return Array.prototype.slice.call(nl || []);
    }

    function initAccordion(wrap) {
        var allowMultiple = wrap.getAttribute('data-allow-multiple') === '1';
        var schemaEnabled = wrap.getAttribute('data-schema') === '1';
        var headers = toArray(wrap.querySelectorAll('.bkbg-ac-header'));
        var items = toArray(wrap.querySelectorAll('.bkbg-ac-item'));

        // Generate unique IDs if not present
        var blockId = 'bkbg-ac-' + Math.random().toString(36).substr(2, 9);
        headers.forEach(function (header, index) {
            if (!header.id) {
                header.id = blockId + '-h-' + index;
            }
            var contentId = header.getAttribute('aria-controls');
            if (!contentId) {
                contentId = blockId + '-c-' + index;
                header.setAttribute('aria-controls', contentId);
                var content = header.nextElementSibling;
                if (content && content.classList.contains('bkbg-ac-content')) {
                    content.id = contentId;
                    content.setAttribute('aria-labelledby', header.id);
                }
            }
        });

        headers.forEach(function (header) {
            header.addEventListener('click', function () {
                var expanded = header.getAttribute('aria-expanded') === 'true';
                var contentId = header.getAttribute('aria-controls');
                var content = document.getElementById(contentId);
                var item = header.closest('.bkbg-ac-item');

                if (!allowMultiple && !expanded) {
                    // Close other panels
                    headers.forEach(function (otherHeader) {
                        if (otherHeader !== header && otherHeader.getAttribute('aria-expanded') === 'true') {
                            var otherId = otherHeader.getAttribute('aria-controls');
                            var otherContent = document.getElementById(otherId);
                            var otherItem = otherHeader.closest('.bkbg-ac-item');
                            otherHeader.setAttribute('aria-expanded', 'false');
                            if (otherContent) {
                                otherContent.setAttribute('aria-hidden', 'true');
                            }
                            if (otherItem) {
                                otherItem.classList.remove('is-active');
                            }
                        }
                    });
                }

                // Toggle current panel
                var newState = !expanded;
                header.setAttribute('aria-expanded', newState ? 'true' : 'false');
                if (content) {
                    content.setAttribute('aria-hidden', newState ? 'false' : 'true');
                }
                if (item) {
                    item.classList.toggle('is-active', newState);
                }
            });

            // Keyboard navigation
            header.addEventListener('keydown', function (e) {
                var index = headers.indexOf(header);
                var nextIndex = -1;

                switch (e.key) {
                    case 'ArrowDown':
                        nextIndex = (index + 1) % headers.length;
                        e.preventDefault();
                        break;
                    case 'ArrowUp':
                        nextIndex = (index - 1 + headers.length) % headers.length;
                        e.preventDefault();
                        break;
                    case 'Home':
                        nextIndex = 0;
                        e.preventDefault();
                        break;
                    case 'End':
                        nextIndex = headers.length - 1;
                        e.preventDefault();
                        break;
                }

                if (nextIndex >= 0) {
                    headers[nextIndex].focus();
                }
            });
        });

        // FAQ Schema injection
        if (schemaEnabled && items.length > 0) {
            var faqData = {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                'mainEntity': []
            };

            items.forEach(function (item) {
                var titleEl = item.querySelector('.bkbg-ac-title');
                var bodyEl = item.querySelector('.bkbg-ac-body');
                if (titleEl && bodyEl) {
                    faqData.mainEntity.push({
                        '@type': 'Question',
                        'name': titleEl.textContent.trim(),
                        'acceptedAnswer': {
                            '@type': 'Answer',
                            'text': bodyEl.textContent.trim()
                        }
                    });
                }
            });

            if (faqData.mainEntity.length > 0) {
                var script = document.createElement('script');
                script.type = 'application/ld+json';
                script.textContent = JSON.stringify(faqData);
                document.head.appendChild(script);
            }
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        toArray(document.querySelectorAll('.bkbg-ac-wrap')).forEach(initAccordion);
    });
})();
