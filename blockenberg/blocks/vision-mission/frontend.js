(function () {
    'use strict';

    document.querySelectorAll('.bkbg-vms-app').forEach(function (root) {
        var a;
        try { a = JSON.parse(root.dataset.opts || '{}'); } catch (e) { return; }

        var bg = a.bgColor || '#ffffff';
        var ptop = a.paddingTop !== undefined ? a.paddingTop : 80;
        var pbot = a.paddingBottom !== undefined ? a.paddingBottom : 80;
        var maxW = a.maxWidth || 1100;
        var isSplit = a.layout === 'split';
        var isCards = a.layout === 'cards';

        root.style.backgroundColor = bg;
        root.style.paddingTop = ptop + 'px';
        root.style.paddingBottom = pbot + 'px';

        var inner = document.createElement('div');
        inner.className = 'bkbg-vms-inner';
        inner.style.maxWidth = maxW + 'px';

        // === Header ===
        var header = document.createElement('div');
        header.style.cssText = 'text-align:center;margin-bottom:48px;';

        if (a.showEyebrow !== false && a.eyebrow) {
            var eyebrow = document.createElement('span');
            eyebrow.className = 'bkbg-vms-eyebrow';
            eyebrow.style.cssText = 'display:inline-block;background:' + (a.eyebrowBg || '#f3f0ff') + ';color:' + (a.eyebrowColor || '#7c3aed') + ';padding:5px 14px;border-radius:999px;margin-bottom:16px;';
            eyebrow.textContent = a.eyebrow;
            header.appendChild(eyebrow);
        }

        if (a.showHeading !== false && a.heading) {
            var heading = document.createElement('h2');
            heading.className = 'bkbg-vms-heading';
            heading.style.cssText = 'color:' + (a.headingColor || '#111827') + ';margin:0;';
            heading.innerHTML = a.heading;
            header.appendChild(heading);
        }

        inner.appendChild(header);

        // === Helper: build statement block ===
        function buildStatement(opts) {
            var block = document.createElement('div');
            block.className = 'bkbg-vms-statement';
            block.style.cssText = 'background:' + opts.bg + ';border-color:' + opts.border + ';';

            var hdr = document.createElement('div');
            hdr.className = 'bkbg-vms-statement-header';

            var icon = document.createElement('span');
            icon.className = 'bkbg-vms-statement-icon';
            var _IP = window.bkbgIconPicker;
            var _iType = opts.iconType || 'custom-char';
            if (_IP && _iType !== 'custom-char') {
                var _in = _IP.buildFrontendIcon(_iType, opts.icon, opts.iconDashicon, opts.iconImageUrl, opts.iconDashiconColor);
                if (_in) icon.appendChild(_in);
                else icon.textContent = opts.icon;
            } else {
                icon.textContent = opts.icon;
            }
            hdr.appendChild(icon);

            var label = document.createElement('span');
            label.className = 'bkbg-vms-statement-label';
            label.style.color = opts.labelColor;
            label.textContent = opts.label;
            hdr.appendChild(label);
            block.appendChild(hdr);

            var text = document.createElement('p');
            text.className = 'bkbg-vms-statement-text';
            text.style.cssText = 'color:' + opts.textColor + ';';
            text.innerHTML = opts.text;
            block.appendChild(text);

            return block;
        }

        // === Statements container ===
        var statementsEl = document.createElement('div');
        var statementsClass = 'bkbg-vms-statements--';
        if (isSplit || isCards) statementsClass += (isCards ? 'cards' : 'split');
        else statementsClass += 'stack';
        statementsEl.className = statementsClass;

        if (a.showMission !== false) {
            statementsEl.appendChild(buildStatement({
                bg: a.missionBg || '#f8f5ff',
                border: a.missionBorder || '#7c3aed',
                icon: a.missionIcon || '🎯',
                iconType: a.missionIconType,
                iconDashicon: a.missionIconDashicon,
                iconImageUrl: a.missionIconImageUrl,
                label: a.missionLabel || 'Our Mission',
                labelColor: a.missionLabelColor || '#7c3aed',
                text: a.missionText || '',
                textColor: a.missionTextColor || '#1f2937'
            }));
        }

        if (a.showVision !== false) {
            statementsEl.appendChild(buildStatement({
                bg: a.visionBg || '#eff6ff',
                border: a.visionBorder || '#3b82f6',
                icon: a.visionIcon || '🔭',
                iconType: a.visionIconType,
                iconDashicon: a.visionIconDashicon,
                iconImageUrl: a.visionIconImageUrl,
                label: a.visionLabel || 'Our Vision',
                labelColor: a.visionLabelColor || '#2563eb',
                text: a.visionText || '',
                textColor: a.visionTextColor || '#1f2937'
            }));
        }

        if ((a.showMission !== false) || (a.showVision !== false)) {
            inner.appendChild(statementsEl);
        }

        // === Values ===
        if (a.showValues !== false && a.values && a.values.length) {
            var valuesSection = document.createElement('div');

            var valuesHeading = document.createElement('h3');
            valuesHeading.className = 'bkbg-vms-values-heading';
            valuesHeading.style.color = a.valuesLabelColor || '#111827';
            valuesHeading.textContent = a.valuesLabel || 'Core Values';
            valuesSection.appendChild(valuesHeading);

            var grid = document.createElement('div');
            grid.className = 'bkbg-vms-values-grid';
            grid.style.gridTemplateColumns = 'repeat(' + (a.valuesColumns || 3) + ', 1fr)';

            a.values.forEach(function (v) {
                var card = document.createElement('div');
                card.className = 'bkbg-vms-value-card';
                card.style.cssText = 'background:' + (a.valueCardBg || '#f9fafb') + ';border-color:' + (a.valueCardBorder || '#e5e7eb') + ';';

                var iconEl = document.createElement('span');
                iconEl.className = 'bkbg-vms-value-icon';
                var _IP = window.bkbgIconPicker;
                var _iType = v.iconType || 'custom-char';
                if (_IP && _iType !== 'custom-char') {
                    var _in = _IP.buildFrontendIcon(_iType, v.icon, v.iconDashicon, v.iconImageUrl, v.iconDashiconColor);
                    if (_in) iconEl.appendChild(_in);
                    else iconEl.textContent = v.icon;
                } else {
                    iconEl.textContent = v.icon;
                }
                card.appendChild(iconEl);

                var titleEl = document.createElement('h4');
                titleEl.className = 'bkbg-vms-value-title';
                titleEl.style.color = a.valueTitleColor || '#111827';
                titleEl.innerHTML = v.title;
                card.appendChild(titleEl);

                var descEl = document.createElement('p');
                descEl.className = 'bkbg-vms-value-desc';
                descEl.style.color = a.valueDescColor || '#6b7280';
                descEl.innerHTML = v.description;
                card.appendChild(descEl);

                grid.appendChild(card);
            });

            valuesSection.appendChild(grid);
            inner.appendChild(valuesSection);
        }

        root.appendChild(inner);
    });
})();
