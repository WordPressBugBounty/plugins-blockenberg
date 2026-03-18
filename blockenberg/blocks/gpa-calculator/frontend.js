(function () {
    'use strict';

    var GRADE_POINTS = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'D-': 0.7,
        'F': 0.0
    };
    var GRADE_KEYS = Object.keys(GRADE_POINTS);

    function calcGPA(courses) {
        var totalCredits = 0, totalPoints = 0;
        courses.forEach(function (c) {
            var pts = GRADE_POINTS[c.grade];
            var cr  = parseFloat(c.credits) || 0;
            if (pts !== undefined && cr > 0) {
                totalCredits += cr;
                totalPoints  += pts * cr;
            }
        });
        return {
            gpa: totalCredits > 0 ? totalPoints / totalCredits : 0,
            totalCredits: totalCredits,
            totalPoints: totalPoints
        };
    }

    function gradeClass(gpa) {
        if (gpa >= 3.9) return 'Summa Cum Laude';
        if (gpa >= 3.7) return 'Magna Cum Laude';
        if (gpa >= 3.5) return 'Cum Laude';
        if (gpa >= 3.0) return 'Good Standing';
        if (gpa >= 2.0) return 'Satisfactory';
        if (gpa > 0)    return 'Probation Risk';
        return '—';
    }

    function gradeClassColor(gpa, accent) {
        if (gpa >= 3.5) return '#15803d';
        if (gpa >= 3.0) return accent;
        if (gpa >= 2.0) return '#d97706';
        return '#dc2626';
    }

    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family: 'font-family', weight: 'font-weight', style: 'font-style',
            decoration: 'text-decoration', transform: 'text-transform',
            sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
            lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
            letterSpacingDesktop: 'letter-spacing-d', letterSpacingTablet: 'letter-spacing-t', letterSpacingMobile: 'letter-spacing-m',
            wordSpacingDesktop: 'word-spacing-d', wordSpacingTablet: 'word-spacing-t', wordSpacingMobile: 'word-spacing-m'
        };
        Object.keys(map).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) {
                    v = v + (typo.sizeUnit || 'px');
                } else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) {
                    v = v + (typo.lineHeightUnit || '');
                } else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) {
                    v = v + (typo.letterSpacingUnit || 'px');
                } else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) {
                    v = v + (typo.wordSpacingUnit || 'px');
                }
                el.style.setProperty(prefix + map[k], String(v));
            }
        });
    }

    function buildApp(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) { return; }
        var o = opts;
        var accent = o.accentColor || '#6c3fb5';

        /* State */
        var courses = (o.defaultCourses || []).map(function (c) {
            return { name: c.name, grade: c.grade, credits: c.credits };
        });

        app.style.paddingTop    = (o.paddingTop || 60) + 'px';
        app.style.paddingBottom = (o.paddingBottom || 60) + 'px';
        if (o.sectionBg) app.style.background = o.sectionBg;

        typoCssVarsForEl(o.typoTitle, '--bkbg-gpa-tt-', app);
        typoCssVarsForEl(o.typoGpa, '--bkbg-gpa-gp-', app);

        /* Header */
        var maxW = (o.maxWidth || 680) + 'px';
        if (o.showTitle || o.showSubtitle) {
            var hdr = document.createElement('div');
            hdr.style.cssText = 'text-align:center;margin-bottom:32px;max-width:' + maxW + ';margin-left:auto;margin-right:auto';
            if (o.showTitle && o.title) {
                var ht = document.createElement('h3');
                ht.className = 'bkbg-gpa-title';
                ht.textContent = o.title;
                ht.style.cssText = 'color:' + (o.titleColor || '#1e1b4b') + ';margin:0 0 8px';
                hdr.appendChild(ht);
            }
            if (o.showSubtitle && o.subtitle) {
                var hs = document.createElement('p');
                hs.textContent = o.subtitle;
                hs.style.cssText = 'color:' + (o.subtitleColor || '#6b7280') + ';margin:0';
                hdr.appendChild(hs);
            }
            app.appendChild(hdr);
        }

        /* Card */
        var card = document.createElement('div');
        card.className = 'bkbg-gpa-card';
        card.style.cssText = 'background:' + (o.cardBg || '#fff') + ';border-radius:' + (o.cardRadius || 16) + 'px;padding:32px;max-width:' + maxW + ';margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,0.06)';
        app.appendChild(card);

        /* Result area */
        var resultArea = document.createElement('div');
        resultArea.className = 'bkbg-gpa-result';
        resultArea.style.cssText = 'background:' + (o.resultBg || '#f5f3ff') + ';border:2px solid ' + (o.resultBorder || '#ede9fe') + ';border-radius:' + (o.cardRadius || 16) + 'px;padding:24px 32px;text-align:center;margin-bottom:24px';
        card.appendChild(resultArea);

        /* Table header */
        var tHead = document.createElement('div');
        tHead.style.cssText = 'display:grid;grid-template-columns:1fr 100px 80px 40px;background:' + (o.tableHeaderBg || '#f9fafb') + ';border-radius:8px 8px 0 0;padding:8px 12px;font-weight:600;font-size:13px;color:' + (o.subtitleColor || '#6b7280') + ';gap:8px';
        tHead.innerHTML = '<span>Course</span><span style="text-align:center">Grade</span><span style="text-align:center">Credits</span><span></span>';
        card.appendChild(tHead);

        /* Rows container */
        var tbody = document.createElement('div');
        tbody.className = 'bkbg-gpa-tbody';
        card.appendChild(tbody);

        /* Add button */
        var addBtn = document.createElement('button');
        addBtn.className = 'bkbg-gpa-add-btn';
        addBtn.textContent = '+ Add Course';
        addBtn.style.cssText = 'background:' + accent + ';color:#fff;margin-top:12px;border:none;border-radius:' + (o.inputRadius || 8) + 'px;padding:8px 18px;cursor:pointer;font-size:14px;font-weight:600';
        addBtn.addEventListener('click', function () {
            courses.push({ name: 'New Course', grade: 'B', credits: 3 });
            render();
        });
        card.appendChild(addBtn);

        /* Grade scale help */
        if (o.showHelp !== false) {
            var help = document.createElement('div');
            help.className = 'bkbg-gpa-scale-help';
            ['A/A+ = 4.0', 'A- = 3.7', 'B+ = 3.3', 'B = 3.0', 'B- = 2.7', 'C+ = 2.3', 'C = 2.0', 'D = 1.0'].forEach(function (t) {
                var sp = document.createElement('span');
                sp.textContent = t;
                help.appendChild(sp);
            });
            card.appendChild(help);
        }

        function renderResult() {
            var res = calcGPA(courses);
            var gpa = res.gpa.toFixed(2);
            var html = '<div class="bkbg-gpa-number" style="color:' + (o.gpaColor || accent) + '">' + esc(gpa) + '</div>';
            html += '<div style="color:' + (o.subtitleColor || '#6b7280') + ';margin-top:4px">GPA (4.0 scale)</div>';
            if (o.showGradeClass !== false) {
                html += '<div class="bkbg-gpa-classification" style="color:' + gradeClassColor(res.gpa, accent) + '">' + esc(gradeClass(res.gpa)) + '</div>';
            }
            if (o.showTotals !== false) {
                html += '<div style="display:flex;justify-content:center;gap:32px;margin-top:16px">';
                html += '<div style="text-align:center"><div style="font-size:22px;font-weight:700;color:' + (o.labelColor || '#374151') + '">' + res.totalCredits + '</div><div style="font-size:12px;color:' + (o.subtitleColor || '#6b7280') + '">Credits</div></div>';
                html += '<div style="text-align:center"><div style="font-size:22px;font-weight:700;color:' + (o.labelColor || '#374151') + '">' + res.totalPoints.toFixed(1) + '</div><div style="font-size:12px;color:' + (o.subtitleColor || '#6b7280') + '">Grade Points</div></div>';
                html += '</div>';
            }
            resultArea.innerHTML = html;
        }

        function render() {
            tbody.innerHTML = '';
            courses.forEach(function (c, i) {
                var row = document.createElement('div');
                row.className = 'bkbg-gpa-row';
                row.style.background = i % 2 === 0 ? '#fff' : '#fafafa';

                /* Name input */
                var nameIn = document.createElement('input');
                nameIn.type = 'text'; nameIn.value = c.name; nameIn.placeholder = 'Course name';
                nameIn.style.borderRadius = (o.inputRadius || 8) + 'px';
                nameIn.addEventListener('input', function () { courses[i].name = nameIn.value; });

                /* Grade select */
                var gradeEl = document.createElement('select');
                gradeEl.style.borderRadius = (o.inputRadius || 8) + 'px';
                gradeEl.style.textAlign = 'center';
                GRADE_KEYS.forEach(function (g) {
                    var opt = document.createElement('option');
                    opt.value = g; opt.textContent = g;
                    if (g === c.grade) opt.selected = true;
                    gradeEl.appendChild(opt);
                });
                gradeEl.addEventListener('change', function () { courses[i].grade = gradeEl.value; renderResult(); });

                /* Credits input */
                var credIn = document.createElement('input');
                credIn.type = 'number'; credIn.min = '0'; credIn.step = '0.5'; credIn.value = c.credits;
                credIn.style.borderRadius = (o.inputRadius || 8) + 'px';
                credIn.style.textAlign = 'center';
                credIn.addEventListener('input', function () { courses[i].credits = parseFloat(credIn.value) || 0; renderResult(); });

                /* Remove btn */
                var rmBtn = document.createElement('button');
                rmBtn.className = 'bkbg-gpa-remove-btn';
                rmBtn.textContent = '✕';
                rmBtn.addEventListener('click', function () { courses.splice(i, 1); render(); });

                row.appendChild(nameIn);
                row.appendChild(gradeEl);
                row.appendChild(credIn);
                row.appendChild(rmBtn);
                tbody.appendChild(row);
            });
            renderResult();
        }

        render();
    }

    document.querySelectorAll('.bkbg-gpa-app').forEach(buildApp);
})();
