(function () {
    'use strict';

    function clampInt(value, min, max) {
        var n = parseInt(value, 10);
        if (isNaN(n)) n = 0;
        return Math.max(min, Math.min(max, n));
    }

    function sanitizeColor(input, fallback) {
        var v = String(input || '').trim();
        // Allow only hex colors to avoid CSS injection via `background:`.
        if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) {
            return v;
        }
        return fallback;
    }

    function clearEl(el) {
        while (el && el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }

    // Lighten color helper
    function lightenColor(hex, percent) {
        var num = parseInt(hex.replace('#', ''), 16);
        var r = Math.min(255, (num >> 16) + Math.round(255 * percent / 100));
        var g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * percent / 100));
        var b = Math.min(255, (num & 0x0000FF) + Math.round(255 * percent / 100));
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function initProgressBar(wrap) {
        var itemsData = wrap.getAttribute('data-items');
        var animate = wrap.getAttribute('data-animate') === '1';
        var showLabels = wrap.getAttribute('data-show-labels') === '1';
        var showPercentage = wrap.getAttribute('data-show-percentage') === '1';
        var percentagePosition = wrap.getAttribute('data-percentage-position') || 'right';
        var gradient = wrap.getAttribute('data-gradient') === '1';
        var gradientAngle = clampInt(wrap.getAttribute('data-gradient-angle') || 90, 0, 360);
        var glow = wrap.getAttribute('data-glow') === '1';
        var stripes = wrap.classList.contains('bkbg-pb-striped');

        if (!itemsData) return;

        // Parse items
        var items = itemsData.split(';;').map(function (item) {
            var parts = item.split('|');
            return {
                label: parts[0] || '',
                percentage: clampInt(parts[1], 0, 100),
                color: sanitizeColor(parts[2], '#3b82f6')
            };
        });

        var list = wrap.querySelector('.bkbg-pb-list');
        if (!list) return;

        clearEl(list);

        items.forEach(function (item) {
            // Build background style
            var bgStyle = '';
            var bgSize = '';
            var lighterColor = lightenColor(item.color, 30);

            if (stripes && gradient) {
                var stripesBg = 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)';
                bgStyle = stripesBg + ', linear-gradient(' + gradientAngle + 'deg, ' + item.color + ' 0%, ' + lighterColor + ' 50%, ' + item.color + ' 100%)';
                bgSize = '40px 40px, 200% 100%';
            } else if (stripes) {
                var stripesBg = 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)';
                bgStyle = stripesBg + ', ' + item.color;
                bgSize = '40px 40px, 100% 100%';
            } else if (gradient) {
                bgStyle = 'linear-gradient(' + gradientAngle + 'deg, ' + item.color + ' 0%, ' + lighterColor + ' 50%, ' + item.color + ' 100%)';
                bgSize = '200% 100%';
            } else {
                bgStyle = item.color;
            }

            // Box shadow for glow
            var boxShadow = '';
            if (glow) {
                boxShadow = 'box-shadow: 0 0 10px ' + item.color + ', 0 0 20px ' + item.color + '60;';
            }

            var itemEl = document.createElement('div');
            itemEl.className = 'bkbg-pb-item';

            // Header
            if (showLabels || (showPercentage && percentagePosition === 'right')) {
                var headerEl = document.createElement('div');
                headerEl.className = 'bkbg-pb-header';
                if (showLabels) {
                    var labelEl = document.createElement('span');
                    labelEl.className = 'bkbg-pb-label';
                    labelEl.textContent = item.label || '';
                    headerEl.appendChild(labelEl);
                }
                if (showPercentage && percentagePosition === 'right') {
                    var pctEl = document.createElement('span');
                    pctEl.className = 'bkbg-pb-percentage';
                    pctEl.textContent = item.percentage + '%';
                    headerEl.appendChild(pctEl);
                }
                itemEl.appendChild(headerEl);
            }

            // Above percentage
            if (showPercentage && percentagePosition === 'above') {
                var aboveWrap = document.createElement('div');
                aboveWrap.className = 'bkbg-pb-above';

                var abovePct = document.createElement('span');
                abovePct.className = 'bkbg-pb-percentage-above';
                abovePct.textContent = item.percentage + '%';
                abovePct.style.left = (animate ? 0 : item.percentage) + '%';
                aboveWrap.appendChild(abovePct);

                itemEl.appendChild(aboveWrap);
            }

            // Track and bar
            var trackEl = document.createElement('div');
            trackEl.className = 'bkbg-pb-track';

            var barEl = document.createElement('div');
            barEl.className = 'bkbg-pb-bar';
            barEl.style.width = (animate ? 0 : item.percentage) + '%';
            barEl.style.background = bgStyle;
            if (bgSize) {
                barEl.style.backgroundSize = bgSize;
            }
            if (glow) {
                barEl.style.boxShadow = '0 0 10px ' + item.color + ', 0 0 20px ' + item.color + '60';
            }
            barEl.setAttribute('data-percentage', String(item.percentage));
            barEl.setAttribute('data-color', item.color);

            if (showPercentage && percentagePosition === 'inside') {
                var insidePct = document.createElement('span');
                insidePct.className = 'bkbg-pb-percentage-inside';
                insidePct.textContent = item.percentage + '%';
                barEl.appendChild(insidePct);
            }

            trackEl.appendChild(barEl);
            itemEl.appendChild(trackEl);

            list.appendChild(itemEl);
        });

        // Animate if needed
        if (animate) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        wrap.classList.add('bkbg-pb-animated');
                        
                        // Animate bars
                        var bars = wrap.querySelectorAll('.bkbg-pb-bar');
                        bars.forEach(function (bar) {
                            var percentage = bar.getAttribute('data-percentage');
                            bar.style.width = percentage + '%';
                        });

                        // Animate above percentages
                        var aboveEls = wrap.querySelectorAll('.bkbg-pb-percentage-above');
                        aboveEls.forEach(function (el) {
                            var text = el.textContent;
                            var percentage = parseInt(text, 10);
                            el.style.left = percentage + '%';
                        });

                        observer.unobserve(wrap);
                    }
                });
            }, { threshold: 0.2 });

            observer.observe(wrap);
        } else {
            wrap.classList.add('bkbg-pb-animated');
        }
    }

    function init() {
        var progressBars = document.querySelectorAll('.bkbg-pb-wrap[data-items]');
        progressBars.forEach(initProgressBar);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
