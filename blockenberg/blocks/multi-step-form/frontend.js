(function () {
    'use strict';

    document.querySelectorAll('.bkbg-msf-wrapper').forEach(function (wrapper) {
        var form = wrapper.querySelector('.bkbg-msf-form');
        if (!form) return;

        var total      = parseInt(form.getAttribute('data-total-steps'), 10) || 1;
        var panels     = form.querySelectorAll('.bkbg-msf-step-panel');
        var success    = form.querySelector('.bkbg-msf-success');
        var indicator  = wrapper.querySelector('.bkbg-msf-indicator');
        var current    = 0;

        /* ── Build indicator ──────────────────────────────────────────── */
        var progStyle = (indicator && indicator.getAttribute('data-progress')) || 'steps';

        function buildIndicator() {
            if (!indicator) return;
            indicator.innerHTML = '';

            if (progStyle === 'bar') {
                var track = document.createElement('div');
                track.className = 'bkbg-msf-progress-track';
                var fill = document.createElement('div');
                fill.className = 'bkbg-msf-progress-fill';
                fill.style.width = '0%';
                track.appendChild(fill);
                indicator.appendChild(track);
                return;
            }

            if (progStyle === 'dots') {
                for (var di = 0; di < total; di++) {
                    var dot = document.createElement('button');
                    dot.type = 'button';
                    dot.className = 'bkbg-msf-dot' + (di === 0 ? ' is-active' : ' is-pending');
                    dot.setAttribute('aria-label', 'Step ' + (di + 1));
                    (function (idx) {
                        dot.addEventListener('click', function () { goTo(idx); });
                    })(di);
                    indicator.appendChild(dot);
                }
                return;
            }

            /* Circles */
            for (var ci = 0; ci < total; ci++) {
                var panel = panels[ci];
                var circleWrap = document.createElement('div');
                circleWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;flex:' + (ci < total - 1 ? '1' : '0') + ';min-width:60px';

                var row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;width:100%;justify-content:center;position:relative';

                var circle = document.createElement('button');
                circle.type = 'button';
                circle.className = 'bkbg-msf-step-circle' + (ci === 0 ? ' is-active' : ' is-pending');
                circle.textContent = ci + 1;
                circle.setAttribute('aria-label', 'Go to step ' + (ci + 1));
                (function (idx) {
                    circle.addEventListener('click', function () { goTo(idx); });
                })(ci);

                row.appendChild(circle);

                if (ci < total - 1) {
                    var connector = document.createElement('div');
                    connector.className = 'bkbg-msf-connector';
                    row.appendChild(connector);
                }

                circleWrap.appendChild(row);

                if (panel) {
                    var titleEl = panel.querySelector('.bkbg-msf-step-title');
                    if (titleEl) {
                        var lbl = document.createElement('span');
                        lbl.className = 'bkbg-msf-step-label' + (ci === 0 ? ' is-active' : '');
                        lbl.textContent = titleEl.textContent;
                        circleWrap.appendChild(lbl);
                    }
                }

                indicator.appendChild(circleWrap);
            }
        }

        /* ── Update indicator state ───────────────────────────────────── */
        function updateIndicator(idx) {
            if (!indicator) return;

            if (progStyle === 'bar') {
                var fill = indicator.querySelector('.bkbg-msf-progress-fill');
                if (fill) fill.style.width = ((idx / Math.max(1, total - 1)) * 100) + '%';
                return;
            }

            if (progStyle === 'dots') {
                var dots = indicator.querySelectorAll('.bkbg-msf-dot');
                dots.forEach(function (dot, i) {
                    dot.className = 'bkbg-msf-dot ' + (i === idx ? 'is-active' : (i < idx ? 'is-done' : 'is-pending'));
                });
                return;
            }

            var circles    = indicator.querySelectorAll('.bkbg-msf-step-circle');
            var connectors = indicator.querySelectorAll('.bkbg-msf-connector');
            var labels     = indicator.querySelectorAll('.bkbg-msf-step-label');

            circles.forEach(function (c, i) {
                c.className = 'bkbg-msf-step-circle ' + (i === idx ? 'is-active' : (i < idx ? 'is-done' : 'is-pending'));
                if (i < idx) c.textContent = '✓';
                else c.textContent = i + 1;
            });
            connectors.forEach(function (c, i) {
                c.classList.toggle('is-done', i < idx);
            });
            labels.forEach(function (l, i) {
                l.classList.toggle('is-active', i === idx);
            });
        }

        /* ── Show panel ───────────────────────────────────────────────── */
        function showPanel(idx) {
            panels.forEach(function (p, i) {
                p.style.display = i === idx ? 'block' : 'none';
                p.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
            });

            /* Update prev/next buttons */
            panels.forEach(function (p, i) {
                var prevBtn = p.querySelector('.bkbg-msf-btn-prev');
                var nextBtn = p.querySelector('.bkbg-msf-btn-next');
                if (prevBtn) prevBtn.classList.toggle('is-hidden', idx === 0);
                if (nextBtn) {
                    if (idx === total - 1) {
                        nextBtn.textContent = nextBtn.getAttribute('data-submit-label') || nextBtn.textContent;
                    }
                }
            });
        }

        /* ── Validate current panel ───────────────────────────────────── */
        function validatePanel(idx) {
            var panel = panels[idx];
            if (!panel) return true;
            var required = panel.querySelectorAll('[required]');
            var valid = true;
            required.forEach(function (field) {
                field.style.borderColor = '';
                if (!field.value || !field.value.trim()) {
                    field.style.borderColor = '#ef4444';
                    if (valid) field.focus();
                    valid = false;
                }
            });
            return valid;
        }

        /* ── Navigate ─────────────────────────────────────────────────── */
        function goTo(idx) {
            current = Math.min(Math.max(idx, 0), total - 1);
            showPanel(current);
            updateIndicator(current);
            wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        /* ── Button click handler ─────────────────────────────────────── */
        form.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-action]');
            if (!btn) return;
            var action = btn.getAttribute('data-action');

            if (action === 'next') {
                if (!validatePanel(current)) return;
                goTo(current + 1);
            } else if (action === 'prev') {
                goTo(current - 1);
            } else if (action === 'submit') {
                if (!validatePanel(current)) return;
                /* Show success */
                panels.forEach(function (p) { p.style.display = 'none'; });
                if (indicator) indicator.style.display = 'none';
                if (success) success.classList.remove('is-hidden');
            }
        });

        /* ── Init ─────────────────────────────────────────────────────── */
        buildIndicator();
        showPanel(0);
        updateIndicator(0);

        /* Cache submit label */
        panels.forEach(function (p) {
            var nb = p.querySelector('.bkbg-msf-btn-next[data-action="submit"]');
            if (nb) nb.setAttribute('data-submit-label', nb.textContent);
        });
    });
})();
