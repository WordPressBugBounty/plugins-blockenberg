(function () {
    'use strict';

    function clampInt(value, min, max) {
        var n = parseInt(value, 10);
        if (isNaN(n)) n = 0;
        return Math.max(min, Math.min(max, n));
    }

    function sanitizeColor(input, fallback) {
        var v = String(input || '').trim();
        if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) {
            return v;
        }
        return fallback;
    }

    function formatNumber(num, separator) {
        if (!separator) return String(num);
        return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    }

    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    function animateCounter(el, targetNum, duration, separator, prefix, suffix) {
        var startTime = null;
        var startNum = 0;

        function update(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed = timestamp - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var easedProgress = easeOutQuart(progress);
            var currentNum = Math.floor(startNum + (targetNum - startNum) * easedProgress);

            el.textContent = prefix + formatNumber(currentNum, separator) + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = prefix + formatNumber(targetNum, separator) + suffix;
            }
        }

        requestAnimationFrame(update);
    }

    function clearEl(el) {
        while (el && el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }

    function initStatsCounter(wrap) {
        var itemsData = wrap.getAttribute('data-items');
        var animate = wrap.getAttribute('data-animate') === '1';
        var duration = clampInt(wrap.getAttribute('data-duration') || 2000, 100, 10000);
        var separator = wrap.getAttribute('data-separator') || ',';
        var showIcon = wrap.getAttribute('data-show-icon') === '1';
        var iconStyle = wrap.getAttribute('data-icon-style') || 'default';
        var iconPosition = wrap.getAttribute('data-icon-position') || 'top';
        var showLabel = wrap.getAttribute('data-show-label') === '1';
        var labelPosition = wrap.getAttribute('data-label-position') || 'below';
        var cardStyle = wrap.getAttribute('data-card-style') === '1';
        var cardShadow = wrap.getAttribute('data-card-shadow') === '1';
        var useItemColors = wrap.getAttribute('data-use-item-colors') === '1';

        if (!itemsData) return;

        // Parse items
        var items = itemsData.split(';;').map(function (item) {
            var parts = item.split('|');
            return {
                number: clampInt(parts[0], 0, 999999999),
                prefix: parts[1] || '',
                suffix: parts[2] || '',
                label: parts[3] || '',
                icon: parts[4] || '',
                color: sanitizeColor(parts[5], '#3b82f6'),
                numberColor: parts[6] || '',
                labelColor: parts[7] || ''
            };
        });

        var list = wrap.querySelector('.bkbg-sc-list');
        if (!list) return;

        clearEl(list);

        var numberEls = [];

        items.forEach(function (item, index) {
            var itemEl = document.createElement('div');
            itemEl.className = 'bkbg-sc-item';
            if (cardStyle) itemEl.className += ' bkbg-sc-item--card';
            if (cardShadow) itemEl.className += ' bkbg-sc-item--shadow';

            var innerEl = document.createElement('div');
            innerEl.className = 'bkbg-sc-item-inner';

            if (iconPosition === 'left') {
                innerEl.className += ' bkbg-sc-item-inner--left';
            } else if (iconPosition === 'right') {
                innerEl.className += ' bkbg-sc-item-inner--right';
            } else {
                innerEl.className += ' bkbg-sc-item-inner--top';
            }

            // Icon
            if (showIcon && item.icon) {
                var iconWrap = document.createElement('div');
                iconWrap.className = 'bkbg-sc-icon';

                // Check if custom image icon (JSON format or direct URL)
                var isCustomIcon = false;
                var customIconUrl = '';
                var dashiconName = item.icon;

                if (item.icon.indexOf('{') === 0) {
                    // JSON format: {"type":"custom","value":"url"}
                    try {
                        var iconData = JSON.parse(item.icon);
                        if (iconData.type === 'custom' && iconData.value) {
                            isCustomIcon = true;
                            customIconUrl = iconData.value;
                        } else if (iconData.type === 'dashicon' && iconData.value) {
                            dashiconName = iconData.value;
                        }
                    } catch (e) {
                        // Not valid JSON, use as dashicon name
                    }
                }

                var iconInner;
                if (isCustomIcon) {
                    iconInner = document.createElement('img');
                    iconInner.src = customIconUrl;
                    iconInner.alt = '';
                    iconInner.className = 'bkbg-sc-icon-img';
                } else {
                    iconInner = document.createElement('span');
                    iconInner.className = 'dashicons dashicons-' + dashiconName;
                }

                if (iconStyle === 'filled') {
                    iconWrap.className += ' bkbg-sc-icon--filled';
                    iconWrap.style.backgroundColor = useItemColors ? item.color : '';
                    if (!isCustomIcon) iconInner.style.color = '#fff';
                } else if (iconStyle === 'outlined') {
                    iconWrap.className += ' bkbg-sc-icon--outlined';
                    iconWrap.style.borderColor = useItemColors ? item.color : '';
                    if (!isCustomIcon) iconInner.style.color = useItemColors ? item.color : '';
                } else {
                    if (!isCustomIcon) iconInner.style.color = useItemColors ? item.color : '';
                }

                iconWrap.appendChild(iconInner);

                if (iconPosition !== 'right') {
                    innerEl.appendChild(iconWrap);
                }
            }

            // Content
            var contentEl = document.createElement('div');
            contentEl.className = 'bkbg-sc-content';

            // Label above
            if (showLabel && labelPosition === 'above' && item.label) {
                var labelEl = document.createElement('span');
                labelEl.className = 'bkbg-sc-label';
                if (item.labelColor) labelEl.style.color = item.labelColor;
                labelEl.textContent = item.label;
                contentEl.appendChild(labelEl);
            }

            // Number
            var numberEl = document.createElement('span');
            numberEl.className = 'bkbg-sc-number';
            if (item.numberColor) numberEl.style.color = item.numberColor;
            if (animate) {
                numberEl.textContent = item.prefix + '0' + item.suffix;
            } else {
                numberEl.textContent = item.prefix + formatNumber(item.number, separator) + item.suffix;
            }
            contentEl.appendChild(numberEl);

            numberEls.push({
                el: numberEl,
                number: item.number,
                prefix: item.prefix,
                suffix: item.suffix
            });

            // Label below
            if (showLabel && labelPosition === 'below' && item.label) {
                var labelEl2 = document.createElement('span');
                labelEl2.className = 'bkbg-sc-label';
                if (item.labelColor) labelEl2.style.color = item.labelColor;
                labelEl2.textContent = item.label;
                contentEl.appendChild(labelEl2);
            }

            innerEl.appendChild(contentEl);

            // Icon on right
            if (showIcon && item.icon && iconPosition === 'right') {
                var iconWrap2 = document.createElement('div');
                iconWrap2.className = 'bkbg-sc-icon';

                var iconInner2;
                if (isCustomIcon) {
                    iconInner2 = document.createElement('img');
                    iconInner2.src = customIconUrl;
                    iconInner2.alt = '';
                    iconInner2.className = 'bkbg-sc-icon-img';
                } else {
                    iconInner2 = document.createElement('span');
                    iconInner2.className = 'dashicons dashicons-' + dashiconName;
                }

                if (iconStyle === 'filled') {
                    iconWrap2.className += ' bkbg-sc-icon--filled';
                    iconWrap2.style.backgroundColor = useItemColors ? item.color : '';
                    if (!isCustomIcon) iconInner2.style.color = '#fff';
                } else if (iconStyle === 'outlined') {
                    iconWrap2.className += ' bkbg-sc-icon--outlined';
                    iconWrap2.style.borderColor = useItemColors ? item.color : '';
                    if (!isCustomIcon) iconInner2.style.color = useItemColors ? item.color : '';
                } else {
                    if (!isCustomIcon) iconInner2.style.color = useItemColors ? item.color : '';
                }

                iconWrap2.appendChild(iconInner2);
                innerEl.appendChild(iconWrap2);
            }

            itemEl.appendChild(innerEl);
            list.appendChild(itemEl);
        });

        // Animate if needed
        if (animate) {
            var observed = false;
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && !observed) {
                        observed = true;
                        wrap.classList.add('bkbg-sc-animated');

                        numberEls.forEach(function (data) {
                            animateCounter(data.el, data.number, duration, separator, data.prefix, data.suffix);
                        });

                        observer.unobserve(wrap);
                    }
                });
            }, { threshold: 0.2 });

            observer.observe(wrap);
        } else {
            wrap.classList.add('bkbg-sc-animated');
        }
    }

    function init() {
        var statsCounters = document.querySelectorAll('.bkbg-sc-wrap[data-items]');
        statsCounters.forEach(initStatsCounter);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
