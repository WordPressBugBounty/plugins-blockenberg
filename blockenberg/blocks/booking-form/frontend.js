(function () {
    'use strict';

    var MONTHS     = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var DAYS_SHORT  = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    var DAYS_LONG   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo) return;
        if (typo.family)     el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', sans-serif");
        if (typo.weight)     el.style.setProperty(prefix + 'font-weight', typo.weight);
        if (typo.transform)  el.style.setProperty(prefix + 'text-transform', typo.transform);
        if (typo.style)      el.style.setProperty(prefix + 'font-style', typo.style);
        if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) el.style.setProperty(prefix + 'font-size-d', typo.sizeDesktop + su);
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) el.style.setProperty(prefix + 'font-size-t', typo.sizeTablet + su);
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) el.style.setProperty(prefix + 'font-size-m', typo.sizeMobile + su);
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    document.querySelectorAll('.bkbg-bf-app').forEach(function (app) {
        var opts;
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) { return; }

        var services         = opts.services         || [];
        var timeSlots        = opts.timeSlots        || [];
        var blockedDays      = opts.blockedDays      || [0, 6];
        var showSvcSelect    = opts.showServiceSelect !== false;
        var showName         = opts.showNameField     !== false;
        var showEmail        = opts.showEmailField    !== false;
        var showPhone        = opts.showPhoneField    !== false;
        var showNotes        = opts.showNotes         !== false;
        var showPrice        = opts.showPrice         !== false;
        var formTitle        = opts.formTitle        || 'Book an Appointment';
        var formSubtitle     = opts.formSubtitle     || 'Choose your preferred date and time.';
        var submitLabel      = opts.submitLabel      || 'Confirm Booking';
        var confTitle        = opts.confirmationTitle || 'Booking Confirmed! 🎉';
        var confMsg          = opts.confirmationMsg  || 'Thank you! We\'ve received your booking.';
        var formWidth        = parseInt(opts.formWidth)    || 600;
        var formRadius       = parseInt(opts.formRadius)   || 20;
        var inputRadius      = parseInt(opts.inputRadius)  || 10;
        var calRadius        = parseInt(opts.calendarRadius) || 12;
        var sectionBg        = opts.sectionBg        || '';

        // CSS vars
        app.style.setProperty('--bf-accent',           opts.accentColor          || '#6366f1');
        app.style.setProperty('--bf-btn-bg',           opts.btnBg                || '#6366f1');
        app.style.setProperty('--bf-btn-clr',          opts.btnColor             || '#ffffff');
        app.style.setProperty('--bf-form-bg',          opts.formBg               || '#ffffff');
        app.style.setProperty('--bf-form-border',      opts.formBorder           || '#e2e8f0');
        app.style.setProperty('--bf-cal-bg',           opts.calendarBg           || '#f8fafc');
        app.style.setProperty('--bf-cal-header',       opts.calendarHeaderBg     || '#6366f1');
        app.style.setProperty('--bf-cal-header-clr',   opts.calendarHeaderColor  || '#ffffff');
        app.style.setProperty('--bf-sel-day',          opts.selectedDayBg        || '#6366f1');
        app.style.setProperty('--bf-sel-day-clr',      opts.selectedDayColor     || '#ffffff');
        app.style.setProperty('--bf-slot-bg',          opts.slotBg               || '#f1f5f9');
        app.style.setProperty('--bf-slot-sel',         opts.slotSelectedBg       || '#6366f1');
        app.style.setProperty('--bf-slot-sel-clr',     opts.slotSelectedColor    || '#ffffff');
        app.style.setProperty('--bf-input-bg',         opts.inputBg              || '#f8fafc');
        app.style.setProperty('--bf-input-border',     opts.inputBorder          || '#e2e8f0');
        app.style.setProperty('--bf-text',             opts.textColor            || '#0f172a');
        app.style.setProperty('--bf-muted',            opts.mutedColor           || '#64748b');
        app.style.setProperty('--bf-width',            formWidth + 'px');
        app.style.setProperty('--bf-input-radius',     inputRadius + 'px');
        app.style.setProperty('--bf-cal-radius',       calRadius + 'px');
        if (sectionBg) app.style.background = sectionBg;
        typoCssVarsForEl(opts.typoTitle, '--bkbg-bfm-title-', app);
        typoCssVarsForEl(opts.typoSubtitle, '--bkbg-bfm-sub-', app);

        // ── State ──
        var currentStep     = 1; // 1=service+date, 2=details, 3=confirm
        var selectedService = services[0] || null;
        var selectedDate    = null;   // Date object
        var selectedTime    = null;   // string e.g. "10:00"
        var calYear, calMonth;
        var today = new Date();
        calYear  = today.getFullYear();
        calMonth = today.getMonth();

        // ── Helpers ──
        function el(tag, className) {
            var d = document.createElement(tag);
            if (className) d.className = className;
            return d;
        }
        function txt(text) { return document.createTextNode(text); }

        function formatDate(d) {
            if (!d) return '';
            return DAYS_LONG[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
        }

        // ── Build ──
        var wrap = el('div', 'bkbg-bf-wrap');
        app.appendChild(wrap);

        var card = el('div', 'bkbg-bf-card');
        card.style.borderRadius = formRadius + 'px';
        wrap.appendChild(card);

        // Header
        var header = el('div', 'bkbg-bf-header');
        var titleEl = el('h2', 'bkbg-bf-title');
        titleEl.textContent = formTitle;
        var subEl = el('p', 'bkbg-bf-subtitle');
        subEl.textContent = formSubtitle;
        header.appendChild(titleEl);
        header.appendChild(subEl);
        card.appendChild(header);

        // Steps
        var stepsBar = el('div', 'bkbg-bf-steps');
        var stepDefs = showSvcSelect
            ? [{ n: 1, label: 'Service & Date' }, { n: 2, label: 'Your Details' }, { n: 3, label: 'Confirm' }]
            : [{ n: 1, label: 'Date & Time' },    { n: 2, label: 'Your Details' }, { n: 3, label: 'Confirm' }];
        var stepEls = [];
        stepDefs.forEach(function (s) {
            var stepEl = el('div', 'bkbg-bf-step');
            var num = el('span', 'bkbg-bf-step-num');
            num.textContent = s.n;
            stepEl.appendChild(num);
            stepEl.appendChild(txt(' ' + s.label));
            stepsBar.appendChild(stepEl);
            stepEls.push(stepEl);
        });
        card.appendChild(stepsBar);

        // Content
        var content = el('div', 'bkbg-bf-content');
        card.appendChild(content);

        // ── Section 1: service + date/time ──
        var sec1 = el('div', 'bkbg-bf-section bkbg-bf-section-active');
        content.appendChild(sec1);

        // Service selector
        var svcGrid = null;
        if (showSvcSelect && services.length) {
            var svcTitle = el('p', 'bkbg-bf-slots-label');
            svcTitle.textContent = 'Select Service';
            sec1.appendChild(svcTitle);
            svcGrid = el('div', 'bkbg-bf-service-grid');
            sec1.appendChild(svcGrid);

            var svcEls = [];
            services.forEach(function (svc, si) {
                var opt = el('div', 'bkbg-bf-service-option');
                opt.style.borderRadius = inputRadius + 'px';
                var left = el('div');
                var name = el('div', 'bkbg-bf-svc-name');
                name.textContent = svc.label;
                var meta = el('div', 'bkbg-bf-svc-meta');
                meta.textContent = svc.duration + ' min';
                left.appendChild(name);
                left.appendChild(meta);
                opt.appendChild(left);
                if (showPrice && svc.price) {
                    var price = el('div', 'bkbg-bf-svc-price');
                    price.textContent = svc.price;
                    opt.appendChild(price);
                }
                opt.addEventListener('click', function () {
                    selectedService = svc;
                    svcEls.forEach(function (e){ e.classList.remove('bkbg-bf-selected'); });
                    opt.classList.add('bkbg-bf-selected');
                });
                svcGrid.appendChild(opt);
                svcEls.push(opt);
                if (si === 0) opt.classList.add('bkbg-bf-selected');
            });
        }

        // ── Calendar ──
        var calTitle = el('p', 'bkbg-bf-slots-label');
        calTitle.textContent = 'Select Date';
        sec1.appendChild(calTitle);

        var calDiv = el('div', 'bkbg-bf-calendar');
        sec1.appendChild(calDiv);

        var calHeader = el('div', 'bkbg-bf-cal-header');
        var btnPrev = el('button', 'bkbg-bf-cal-nav');
        btnPrev.type = 'button';
        btnPrev.textContent = '‹';
        var calMonthLabel = el('span', 'bkbg-bf-cal-month');
        var btnNext = el('button', 'bkbg-bf-cal-nav');
        btnNext.type = 'button';
        btnNext.textContent = '›';
        calHeader.appendChild(btnPrev);
        calHeader.appendChild(calMonthLabel);
        calHeader.appendChild(btnNext);
        calDiv.appendChild(calHeader);

        var daysHeader = el('div', 'bkbg-bf-cal-days-header');
        DAYS_SHORT.forEach(function(d) {
            var dn = el('div', 'bkbg-bf-cal-day-name');
            dn.textContent = d;
            daysHeader.appendChild(dn);
        });
        calDiv.appendChild(daysHeader);

        var calGrid = el('div', 'bkbg-bf-cal-grid');
        calDiv.appendChild(calGrid);

        function renderCal() {
            calMonthLabel.textContent = MONTHS[calMonth] + ' ' + calYear;
            calGrid.innerHTML = '';
            var firstDay     = new Date(calYear, calMonth, 1).getDay();
            var daysInMonth  = new Date(calYear, calMonth + 1, 0).getDate();
            // Padding cells
            for (var p = 0; p < firstDay; p++) {
                var empty = el('div', 'bkbg-bf-cal-day bkbg-bf-empty');
                calGrid.appendChild(empty);
            }
            for (var d = 1; d <= daysInMonth; d++) {
                var date = new Date(calYear, calMonth, d);
                var dow  = date.getDay();
                var isPast    = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                var isBlocked = blockedDays.indexOf(dow) !== -1;
                var isToday   = date.getDate() === today.getDate() && calYear === today.getFullYear() && calMonth === today.getMonth();
                var isSel     = selectedDate && date.toDateString() === selectedDate.toDateString();

                var cls = 'bkbg-bf-cal-day';
                if (isPast)    cls += ' bkbg-bf-past';
                if (isBlocked) cls += ' bkbg-bf-blocked';
                if (isToday)   cls += ' bkbg-bf-today';
                if (isSel)     cls += ' bkbg-bf-selected';

                var dayEl = el('div', cls);
                dayEl.textContent = d;

                if (!isPast && !isBlocked) {
                    (function(dt) {
                        dayEl.addEventListener('click', function () {
                            selectedDate = dt;
                            selectedTime = null;
                            renderCal();
                            renderSlots();
                        });
                    })(date);
                }
                calGrid.appendChild(dayEl);
            }
        }

        btnPrev.addEventListener('click', function () {
            calMonth--;
            if (calMonth < 0) { calMonth = 11; calYear--; }
            renderCal();
        });
        btnNext.addEventListener('click', function () {
            calMonth++;
            if (calMonth > 11) { calMonth = 0; calYear++; }
            renderCal();
        });

        // ── Time Slots ──
        var slotsLabel = el('p', 'bkbg-bf-slots-label');
        slotsLabel.textContent = 'Available Times';
        sec1.appendChild(slotsLabel);

        var slotsGrid = el('div', 'bkbg-bf-slots-grid');
        sec1.appendChild(slotsGrid);

        function renderSlots() {
            slotsGrid.innerHTML = '';
            if (!selectedDate) {
                var hint = el('p', 'bkbg-bf-no-slots');
                hint.textContent = 'Please select a date to see available times.';
                slotsGrid.appendChild(hint);
                return;
            }
            if (!timeSlots.length) {
                var noSlots = el('p', 'bkbg-bf-no-slots');
                noSlots.textContent = 'No time slots configured.';
                slotsGrid.appendChild(noSlots);
                return;
            }
            timeSlots.forEach(function (t) {
                var slotEl = el('div', 'bkbg-bf-slot' + (t === selectedTime ? ' bkbg-bf-slot-selected' : ''));
                slotEl.textContent = t;
                slotEl.addEventListener('click', function () {
                    selectedTime = t;
                    renderSlots();
                });
                slotsGrid.appendChild(slotEl);
            });
        }

        // Nav buttons sec1
        var nav1 = el('div', 'bkbg-bf-nav-btns');
        var btn1Next = el('button', 'bkbg-bf-btn-primary');
        btn1Next.type = 'button';
        btn1Next.style.borderRadius = inputRadius + 'px';
        btn1Next.textContent = 'Continue →';
        nav1.appendChild(btn1Next);
        sec1.appendChild(nav1);

        btn1Next.addEventListener('click', function () {
            if (!selectedDate) { alert('Please select a date.'); return; }
            if (!selectedTime) { alert('Please select a time slot.'); return; }
            goToStep(2);
        });

        // ── Section 2: contact details ──
        var sec2 = el('div', 'bkbg-bf-section');
        content.appendChild(sec2);

        function detailInp(type, placeholder, name) {
            var g = el('div', 'bkbg-bf-group');
            var lab = el('label', 'bkbg-bf-label');
            lab.textContent = placeholder;
            var inp2 = el(type === 'textarea' ? 'textarea' : 'input', type === 'textarea' ? 'bkbg-bf-textarea' : 'bkbg-bf-input');
            if (type !== 'textarea') inp2.type = type;
            inp2.name = name;
            inp2.placeholder = placeholder;
            inp2.style.borderRadius = inputRadius + 'px';
            g.appendChild(lab);
            g.appendChild(inp2);
            return { group: g, input: inp2 };
        }

        var nameField  = null;
        var emailField = null;
        var phoneField = null;
        var notesField = null;

        if (showName) {
            nameField = detailInp('text', 'Your Full Name', 'name');
            sec2.appendChild(nameField.group);
        }
        if (showEmail) {
            emailField = detailInp('email', 'Email Address', 'email');
            sec2.appendChild(emailField.group);
        }
        if (showPhone) {
            phoneField = detailInp('tel', 'Phone Number', 'phone');
            sec2.appendChild(phoneField.group);
        }
        if (showNotes) {
            notesField = detailInp('textarea', 'Additional Notes (optional)', 'notes');
            sec2.appendChild(notesField.group);
        }

        var nav2 = el('div', 'bkbg-bf-nav-btns');
        var btn2Back = el('button', 'bkbg-bf-btn-secondary');
        btn2Back.type = 'button';
        btn2Back.style.borderRadius = inputRadius + 'px';
        btn2Back.textContent = '← Back';
        var btn2Next = el('button', 'bkbg-bf-btn-primary');
        btn2Next.type = 'button';
        btn2Next.style.borderRadius = inputRadius + 'px';
        btn2Next.textContent = 'Review Booking →';
        nav2.appendChild(btn2Back);
        nav2.appendChild(btn2Next);
        sec2.appendChild(nav2);

        btn2Back.addEventListener('click', function () { goToStep(1); });
        btn2Next.addEventListener('click', function () {
            if (showEmail && emailField && !emailField.input.value) { alert('Please enter your email.'); return; }
            goToStep(3);
        });

        // ── Section 3: summary + submit ──
        var sec3 = el('div', 'bkbg-bf-section');
        content.appendChild(sec3);

        var summaryDiv = el('div', 'bkbg-bf-summary');
        sec3.appendChild(summaryDiv);

        function buildSummary() {
            summaryDiv.innerHTML = '';
            function row(label, val) {
                var r = el('div', 'bkbg-bf-summary-row');
                var l = el('span', 'bkbg-bf-summary-label');
                l.textContent = label;
                var v = el('span');
                v.textContent = val;
                r.appendChild(l);
                r.appendChild(v);
                summaryDiv.appendChild(r);
            }
            if (showSvcSelect && selectedService) row('Service', selectedService.label + (showPrice && selectedService.price ? ' — ' + selectedService.price : ''));
            row('Date',    formatDate(selectedDate));
            row('Time',    selectedTime || '');
            if (showName  && nameField)  row('Name',  nameField.input.value);
            if (showEmail && emailField) row('Email', emailField.input.value);
            if (showPhone && phoneField) row('Phone', phoneField.input.value);
        }

        var nav3 = el('div', 'bkbg-bf-nav-btns');
        var btn3Back = el('button', 'bkbg-bf-btn-secondary');
        btn3Back.type = 'button';
        btn3Back.style.borderRadius = inputRadius + 'px';
        btn3Back.textContent = '← Back';
        var btn3Submit = el('button', 'bkbg-bf-btn-primary');
        btn3Submit.type = 'button';
        btn3Submit.style.borderRadius = inputRadius + 'px';
        btn3Submit.textContent = submitLabel;
        nav3.appendChild(btn3Back);
        nav3.appendChild(btn3Submit);
        sec3.appendChild(nav3);

        btn3Back.addEventListener('click', function () { goToStep(2); });
        btn3Submit.addEventListener('click', function () {
            btn3Submit.disabled = true;
            btn3Submit.textContent = '⟳ Processing…';
            // Simulate submission (replace with real API call)
            setTimeout(function () {
                showConfirmation();
            }, 1200);
        });

        // ── Confirmation ──
        var successDiv = el('div', 'bkbg-bf-success');
        successDiv.style.display = 'none';
        card.appendChild(successDiv);

        function showConfirmation() {
            card.querySelectorAll('.bkbg-bf-header, .bkbg-bf-steps, .bkbg-bf-content').forEach(function(e){ e.style.display = 'none'; });
            successDiv.style.display = '';
            successDiv.innerHTML = '';

            var icon = el('div', 'bkbg-bf-success-icon');
            icon.textContent = '✅';
            var tEl = el('h2', 'bkbg-bf-success-title');
            tEl.textContent = confTitle;
            var mEl = el('p', 'bkbg-bf-success-msg');
            mEl.textContent = confMsg;

            var detail = el('div', 'bkbg-bf-success-detail');
            if (showSvcSelect && selectedService) detail.innerHTML += '<p><strong>Service:</strong> ' + selectedService.label + '</p>';
            detail.innerHTML += '<p><strong>Date:</strong> ' + formatDate(selectedDate) + '</p>';
            detail.innerHTML += '<p><strong>Time:</strong> ' + selectedTime + '</p>';
            if (showEmail && emailField) detail.innerHTML += '<p><strong>Confirmation sent to:</strong> ' + emailField.input.value + '</p>';

            successDiv.appendChild(icon);
            successDiv.appendChild(tEl);
            successDiv.appendChild(mEl);
            successDiv.appendChild(detail);
        }

        // ── Step Navigation ──
        function goToStep(n) {
            currentStep = n;
            [sec1, sec2, sec3].forEach(function(s, i) {
                s.classList.toggle('bkbg-bf-section-active', i + 1 === n);
            });
            stepEls.forEach(function(s, i) {
                s.classList.remove('bkbg-bf-step-active', 'bkbg-bf-step-done');
                if (i + 1 === n) s.classList.add('bkbg-bf-step-active');
                if (i + 1 < n)  s.classList.add('bkbg-bf-step-done');
            });
            if (n === 3) buildSummary();
        }

        // ── Init ──
        renderCal();
        renderSlots();
        goToStep(1);
    });
})();
