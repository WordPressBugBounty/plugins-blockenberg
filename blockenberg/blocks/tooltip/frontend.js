(function () {
    function init() {
        document.querySelectorAll('.bkbg-tt-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                triggerText: 'Hover over me',
                tooltipContent: 'This is the tooltip explanation.',
                position: 'top',
                triggerStyle: 'underline-dotted',
                maxWidth: 260,
                showArrow: true,
                animationType: 'fade',
                align: 'left',
                triggerSize: 16,
                triggerWeight: '500',
                tooltipSize: 13,
                tooltipLineHeight: 1.55,
                tooltipPadding: 12,
                tooltipRadius: 8,
                triggerColor: '#6366f1',
                underlineColor: '#6366f1',
                highlightBg: '#ede9fe',
                tooltipBg: '#1e293b',
                tooltipColor: '#f8fafc',
            }, opts);

            // Outer wrapper
            var outer = document.createElement('div');
            outer.style.textAlign = o.align;

            // Tooltip wrapper
            var wrap = document.createElement('span');
            wrap.className = 'bkbg-tt-wrap pos-' + o.position + ' anim-' + o.animationType;
            wrap.setAttribute('role', 'group');

            // Trigger
            var trigger = document.createElement('span');
            trigger.className = 'bkbg-tt-trigger style-' + o.triggerStyle;
            trigger.setAttribute('tabindex', '0');
            trigger.setAttribute('aria-describedby', 'bkbg-tt-popup-' + Math.random().toString(36).substr(2, 6));
            trigger.textContent = o.triggerText;

            // Apply trigger styles
            trigger.style.color = o.triggerColor;
            if (o.triggerStyle === 'underline-dotted' || o.triggerStyle === 'underline-solid' || o.triggerStyle === 'underline-dashed') {
                trigger.style.textDecorationColor = o.underlineColor;
            }
            if (o.triggerStyle === 'highlight') {
                trigger.style.background = o.highlightBg;
                trigger.style.borderRadius = '4px';
                trigger.style.padding = '0 4px';
            }

            // Popup
            var popup = document.createElement('div');
            popup.className = 'bkbg-tt-popup';
            popup.setAttribute('role', 'tooltip');
            popup.setAttribute('id', trigger.getAttribute('aria-describedby'));
            popup.style.maxWidth = o.maxWidth + 'px';
            popup.style.minWidth = '140px';
            popup.style.background = o.tooltipBg;
            popup.style.color = o.tooltipColor;
            popup.style.padding = o.tooltipPadding + 'px';
            popup.style.borderRadius = o.tooltipRadius + 'px';
            popup.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)';
            popup.textContent = o.tooltipContent;

            // Arrow
            if (o.showArrow) {
                var arrow = document.createElement('div');
                arrow.className = 'bkbg-tt-arrow';
                if (o.position === 'top') {
                    arrow.style.borderTop = '6px solid ' + o.tooltipBg;
                } else if (o.position === 'bottom') {
                    arrow.style.borderBottom = '6px solid ' + o.tooltipBg;
                } else if (o.position === 'left') {
                    arrow.style.borderLeft = '6px solid ' + o.tooltipBg;
                } else if (o.position === 'right') {
                    arrow.style.borderRight = '6px solid ' + o.tooltipBg;
                }
                popup.appendChild(arrow);
            }

            // Mobile click toggle
            var isOpen = false;
            trigger.addEventListener('click', function (e) {
                if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768) {
                    e.preventDefault();
                    isOpen = !isOpen;
                    if (isOpen) {
                        wrap.classList.add('is-open');
                    } else {
                        wrap.classList.remove('is-open');
                    }
                }
            });

            // Close on Escape
            trigger.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    wrap.classList.remove('is-open');
                    isOpen = false;
                }
                if (e.key === 'Enter' || e.key === ' ') {
                    isOpen = !isOpen;
                    wrap.classList.toggle('is-open', isOpen);
                }
            });

            // Close on outside click
            document.addEventListener('click', function (e) {
                if (!wrap.contains(e.target)) {
                    wrap.classList.remove('is-open');
                    isOpen = false;
                }
            });

            wrap.appendChild(trigger);
            wrap.appendChild(popup);
            outer.appendChild(wrap);

            appEl.parentNode.insertBefore(outer, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
