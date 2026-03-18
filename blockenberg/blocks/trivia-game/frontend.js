(function () {
    'use strict';

    var QUESTIONS = [
        // ---- Science & Nature ----
        { cat: 'science', q: 'How many bones are in the adult human body?', choices: ['206', '187', '215', '232'], answer: 0, exp: 'Adults have 206 bones. Babies are born with around 270-300 bones, many of which fuse together.' },
        { cat: 'science', q: 'What is the chemical symbol for gold?', choices: ['Au', 'Ag', 'Gd', 'Go'], answer: 0, exp: 'Au comes from the Latin word "aurum" meaning gold.' },
        { cat: 'science', q: 'What planet is known as the Red Planet?', choices: ['Mars', 'Jupiter', 'Saturn', 'Venus'], answer: 0, exp: 'Mars appears red due to iron oxide (rust) on its surface.' },
        { cat: 'science', q: 'How many chromosomes does a typical human cell contain?', choices: ['46', '23', '48', '36'], answer: 0, exp: 'Humans have 23 pairs (46 total) chromosomes. Sperm and egg cells have just 23.' },
        { cat: 'science', q: 'What is the speed of light in a vacuum (approx.)?', choices: ['300,000 km/s', '150,000 km/s', '3,000 km/s', '1,080,000 km/s'], answer: 0, exp: 'The speed of light is approximately 299,792 km/s, often rounded to 300,000 km/s.' },
        { cat: 'science', q: 'Which gas makes up about 78% of Earth\'s atmosphere?', choices: ['Nitrogen', 'Oxygen', 'Carbon Dioxide', 'Argon'], answer: 0, exp: 'Nitrogen (N₂) makes up ~78% of the atmosphere. Oxygen is only ~21%.' },
        { cat: 'science', q: 'What is the powerhouse of the cell?', choices: ['Mitochondria', 'Nucleus', 'Ribosome', 'Endoplasmic reticulum'], answer: 0, exp: 'Mitochondria produce ATP, which powers cellular processes.' },
        { cat: 'science', q: 'Which element has the atomic number 1?', choices: ['Hydrogen', 'Helium', 'Lithium', 'Carbon'], answer: 0, exp: 'Hydrogen is the lightest and most abundant element in the universe.' },
        { cat: 'science', q: 'What is the hardest natural substance on Earth?', choices: ['Diamond', 'Quartz', 'Topaz', 'Corundum'], answer: 0, exp: 'Diamond scores 10 on the Mohs hardness scale, the highest possible.' },
        { cat: 'science', q: 'How long does it take light from the Sun to reach Earth?', choices: ['~8 minutes', '~1 second', '~1 hour', '~24 minutes'], answer: 0, exp: 'Light from the Sun takes approximately 8 minutes and 20 seconds to reach Earth.' },
        // ---- History ----
        { cat: 'history', q: 'In which year did World War II end?', choices: ['1945', '1944', '1946', '1918'], answer: 0, exp: 'World War II ended in 1945 — V-E Day was May 8 and V-J Day was September 2.' },
        { cat: 'history', q: 'Who was the first President of the United States?', choices: ['George Washington', 'John Adams', 'Thomas Jefferson', 'Benjamin Franklin'], answer: 0, exp: 'George Washington served as the first U.S. President from 1789 to 1797.' },
        { cat: 'history', q: 'The Great Wall of China was primarily built during which dynasty?', choices: ['Ming Dynasty', 'Han Dynasty', 'Qin Dynasty', 'Tang Dynasty'], answer: 0, exp: 'The most iconic sections were built during the Ming Dynasty (1368–1644).' },
        { cat: 'history', q: 'In which city was the Titanic built?', choices: ['Belfast', 'Southampton', 'London', 'Liverpool'], answer: 0, exp: 'RMS Titanic was built at the Harland and Wolff shipyard in Belfast, Ireland.' },
        { cat: 'history', q: 'Which empire was ruled by Julius Caesar?', choices: ['Roman', 'Greek', 'Byzantine', 'Ottoman'], answer: 0, exp: 'Julius Caesar was a Roman general and statesman who greatly expanded the Roman Republic.' },
        { cat: 'history', q: 'The Berlin Wall fell in which year?', choices: ['1989', '1991', '1985', '1979'], answer: 0, exp: 'The Berlin Wall fell on November 9, 1989, marking the end of the Cold War era in Europe.' },
        { cat: 'history', q: 'Napoleon Bonaparte was exiled to which island?', choices: ['Saint Helena', 'Elba', 'Corsica', 'Malta'], answer: 0, exp: 'After his final defeat at Waterloo, Napoleon was exiled to Saint Helena in 1815.' },
        { cat: 'history', q: 'Which civilization built Machu Picchu?', choices: ['Inca', 'Aztec', 'Maya', 'Olmec'], answer: 0, exp: 'Machu Picchu was built by the Inca Empire around 1450 CE in the Andes Mountains of Peru.' },
        { cat: 'history', q: 'The first atomic bomb was dropped on which city?', choices: ['Hiroshima', 'Nagasaki', 'Tokyo', 'Osaka'], answer: 0, exp: 'The first atomic bomb ("Little Boy") was dropped on Hiroshima on August 6, 1945.' },
        { cat: 'history', q: 'Who painted the Sistine Chapel ceiling?', choices: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Botticelli'], answer: 0, exp: 'Michelangelo painted the Sistine Chapel ceiling between 1508 and 1512 for Pope Julius II.' },
        // ---- Geography ----
        { cat: 'geography', q: 'What is the capital of Australia?', choices: ['Canberra', 'Sydney', 'Melbourne', 'Perth'], answer: 0, exp: 'Canberra is Australia\'s capital. Sydney is the largest city, but Canberra was purpose-built as the capital.' },
        { cat: 'geography', q: 'Which is the longest river in the world?', choices: ['Nile', 'Amazon', 'Yangtze', 'Mississippi'], answer: 0, exp: 'The Nile River in Africa is traditionally considered the world\'s longest river at ~6,650 km.' },
        { cat: 'geography', q: 'Mount Everest is located on the border of which two countries?', choices: ['Nepal and China', 'India and Nepal', 'China and India', 'Nepal and Bhutan'], answer: 0, exp: 'Everest sits on the border of Nepal (south side) and Tibet/China (north side).' },
        { cat: 'geography', q: 'Which country has the most natural lakes?', choices: ['Canada', 'Russia', 'USA', 'Finland'], answer: 0, exp: 'Canada has an estimated 2 million+ lakes, more than any other country on Earth.' },
        { cat: 'geography', q: 'What is the smallest country in the world?', choices: ['Vatican City', 'Monaco', 'San Marino', 'Liechtenstein'], answer: 0, exp: 'Vatican City, with an area of just 0.44 km², is the world\'s smallest independent state.' },
        { cat: 'geography', q: 'The Sahara Desert is primarily located on which continent?', choices: ['Africa', 'Asia', 'Australia', 'South America'], answer: 0, exp: 'The Sahara is the world\'s largest hot desert, spanning about 9 million km² across North Africa.' },
        { cat: 'geography', q: 'Which ocean is the largest?', choices: ['Pacific', 'Atlantic', 'Indian', 'Arctic'], answer: 0, exp: 'The Pacific Ocean covers about 165 million km², nearly half of the world\'s total ocean area.' },
        { cat: 'geography', q: 'In which country is the Amazon rainforest primarily located?', choices: ['Brazil', 'Peru', 'Colombia', 'Bolivia'], answer: 0, exp: 'About 60% of the Amazon rainforest is in Brazil; the remainder extends into 8 other nations.' },
        // ---- Pop Culture & Entertainment ----
        { cat: 'popculture', q: 'What movie features the quote "To infinity and beyond!"?', choices: ['Toy Story', 'Buzz Lightyear', 'Interstellar', 'Gravity'], answer: 0, exp: 'Buzz Lightyear\'s catchphrase first appeared in the 1995 Pixar film Toy Story.' },
        { cat: 'popculture', q: 'How many strings does a standard guitar have?', choices: ['6', '4', '7', '12'], answer: 0, exp: 'A standard acoustic or electric guitar has 6 strings, tuned E-A-D-G-B-E.' },
        { cat: 'popculture', q: 'Who wrote the Harry Potter book series?', choices: ['J.K. Rowling', 'Tolkien', 'C.S. Lewis', 'Roald Dahl'], answer: 0, exp: 'J.K. Rowling wrote the seven Harry Potter novels published between 1997 and 2007.' },
        { cat: 'popculture', q: 'Which TV show is set in the fictional town of Hawkins, Indiana?', choices: ['Stranger Things', 'Dark', 'The OA', 'Twin Peaks'], answer: 0, exp: 'Stranger Things, the Netflix sci-fi horror series, is set in Hawkins, Indiana.' },
        { cat: 'popculture', q: 'In chess, which piece can only move diagonally?', choices: ['Bishop', 'Rook', 'Queen', 'Knight'], answer: 0, exp: 'The Bishop can only move diagonally, staying on one color for the entire game.' },
        { cat: 'popculture', q: 'What band was Freddie Mercury the lead singer of?', choices: ['Queen', 'Led Zeppelin', 'The Who', 'Aerosmith'], answer: 0, exp: 'Freddie Mercury was the charismatic lead vocalist of the British rock band Queen.' },
        { cat: 'popculture', q: 'Super Mario first appeared in which 1981 arcade game?', choices: ['Donkey Kong', 'Mario Bros', 'Space Invaders', 'Pac-Man'], answer: 0, exp: 'Mario (then "Jumpman") debuted in Donkey Kong in 1981, though "Mario Bros." named him in 1983.' },
        // ---- Sports ----
        { cat: 'sports', q: 'How many players are on a standard basketball team on the court at once?', choices: ['5', '6', '7', '4'], answer: 0, exp: 'Each basketball team has 5 players on the court simultaneously.' },
        { cat: 'sports', q: 'In which sport would you perform a "slam dunk"?', choices: ['Basketball', 'Volleyball', 'Tennis', 'Handball'], answer: 0, exp: 'A slam dunk is a powerful basketball shot where the player dunks the ball through the hoop.' },
        { cat: 'sports', q: 'How many holes are in a standard round of golf?', choices: ['18', '9', '24', '36'], answer: 0, exp: 'A standard round of golf is played over 18 holes. A "half round" is 9 holes.' },
        { cat: 'sports', q: 'Which country won the 2022 FIFA World Cup?', choices: ['Argentina', 'France', 'Croatia', 'Morocco'], answer: 0, exp: 'Argentina won the 2022 FIFA World Cup, defeating France in the final on penalties.' },
        { cat: 'sports', q: 'In tennis, what is the term for a score of 40-40?', choices: ['Deuce', 'Tie', 'Love-all', 'Match point'], answer: 0, exp: 'When both players reach 40, the score is called "Deuce." The next point is then an "Advantage."' },
        // ---- Technology ----
        { cat: 'technology', q: 'What does "HTTP" stand for?', choices: ['HyperText Transfer Protocol', 'High Transfer Text Protocol', 'HyperText Transmission Protocol', 'Host Transfer Text Protocol'], answer: 0, exp: 'HTTP (HyperText Transfer Protocol) is the foundation of data communication on the World Wide Web.' },
        { cat: 'technology', q: 'Who co-founded Apple Inc. with Steve Jobs?', choices: ['Steve Wozniak', 'Bill Gates', 'Mark Zuckerberg', 'Jeff Bezos'], answer: 0, exp: 'Steve Wozniak co-founded Apple Inc. in 1976 with Steve Jobs and Ronald Wayne.' },
        { cat: 'technology', q: 'In computing, what does "RAM" stand for?', choices: ['Random Access Memory', 'Rapid Access Memory', 'Read Access Module', 'Random Application Memory'], answer: 0, exp: 'RAM (Random Access Memory) is your computer\'s short-term working memory.' },
        { cat: 'technology', q: 'What programming language is known as the "language of the web"?', choices: ['JavaScript', 'Python', 'Java', 'C++'], answer: 0, exp: 'JavaScript is the primary scripting language of the web, running natively in all browsers.' },
        { cat: 'technology', q: 'What does "AI" stand for in the context of computing?', choices: ['Artificial Intelligence', 'Automated Interface', 'Algorithmic Integration', 'Advanced Iteration'], answer: 0, exp: 'AI stands for Artificial Intelligence — the simulation of human intelligence processes by computers.' },
        { cat: 'technology', q: 'Which company created the Android operating system?', choices: ['Google', 'Apple', 'Samsung', 'Microsoft'], answer: 0, exp: 'Android was developed by Android Inc. and purchased by Google in 2005. It launched publicly in 2008.' }
    ];

    var CAT_NAMES = {
        science:    'Science & Nature',
        history:    'History',
        geography:  'Geography',
        popculture: 'Pop Culture',
        sports:     'Sports',
        technology: 'Technology',
        mixed:      'Mix'
    };

    var CAT_EMOJIS = {
        science: '🔬', history: '🏛️', geography: '🌍', popculture: '🎬', sports: '⚽', technology: '💻', mixed: '🎯'
    };

    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        }
        return a;
    }

    function getQuestions(category, count) {
        var pool = category === 'mixed' ? QUESTIONS : QUESTIONS.filter(function (q) { return q.cat === category; });
        if (!pool.length) pool = QUESTIONS;
        var shuffled = shuffle(pool);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    function shuffleAnswers(q) {
        var pairs = q.choices.map(function (c, i) { return { text: c, correct: i === q.answer }; });
        var shuffledPairs = shuffle(pairs);
        return { choices: shuffledPairs.map(function (p) { return p.text; }), answer: shuffledPairs.findIndex(function (p) { return p.correct; }) };
    }

    function initBlock(root) {
        var optsRaw = root.getAttribute('data-opts');
        var opts;
        try { opts = JSON.parse(optsRaw); } catch (e) { opts = {}; }

        var accent      = opts.accentColor  || '#6366f1';
        var correctCol  = opts.correctColor  || '#22c55e';
        var wrongCol    = opts.wrongColor    || '#ef4444';
        var cardBg      = opts.cardBg        || '#ffffff';
        var titleColor  = opts.titleColor    || '#1e1b4b';
        var sectionBg   = opts.sectionBg     || '#f0f4ff';
        var maxQ        = opts.questionsPerRound || 10;
        var timeSec     = opts.timePerQuestion   || 20;
        var catSetting  = opts.category          || 'mixed';

        if (sectionBg) root.style.background = sectionBg;

        var titleEl = root.querySelector('.bkbg-trv-title');
        if (titleEl) { titleEl.style.color = titleColor; }
        var subEl = root.querySelector('.bkbg-trv-subtitle');
        if (subEl) { subEl.style.color = titleColor; }

        // ---- Game container ----
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-trv-game';
        root.appendChild(wrap);

        // ---- Game state ----
        var questions, qIndex, score, correct_, wrong_, timerVal, timerInterval, answered;

        function startGame(category) {
            questions = getQuestions(category, maxQ).map(function (q) {
                var s = shuffleAnswers(q);
                return Object.assign({}, q, { choices: s.choices, answer: s.answer });
            });
            qIndex   = 0;
            score    = 0;
            correct_ = 0;
            wrong_   = 0;
            showQuestion();
        }

        function stopTimer() {
            clearInterval(timerInterval);
        }

        function startTimer() {
            stopTimer();
            timerVal = timeSec;
            updateTimer();
            timerInterval = setInterval(function () {
                timerVal--;
                updateTimer();
                if (timerVal <= 0) {
                    stopTimer();
                    revealTimeUp();
                }
            }, 1000);
        }

        // ---- Render functions ----
        function showStart() {
            wrap.innerHTML = '';
            var startDiv = document.createElement('div');
            startDiv.className = 'bkbg-trv-start';

            var heading = document.createElement('div');
            heading.style.cssText = 'font-size:15px;font-weight:700;color:' + accent + ';margin-bottom:10px;';
            heading.textContent = catSetting === 'mixed' ? '🎯 Choose a Category' : CAT_EMOJIS[catSetting] + ' ' + CAT_NAMES[catSetting];
            startDiv.appendChild(heading);

            var cats = catSetting === 'mixed'
                ? ['mixed','science','history','geography','popculture','sports','technology']
                : [catSetting];

            var grid = document.createElement('div');
            grid.className = 'bkbg-trv-cat-grid';

            cats.forEach(function (cat) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-trv-cat-btn';
                btn.style.background = accent + '18';
                btn.style.color = titleColor;
                btn.style.borderColor = accent + '44';
                btn.innerHTML = '<div style="font-size:28px;margin-bottom:6px">' + (CAT_EMOJIS[cat] || '🎯') + '</div>' + CAT_NAMES[cat];
                btn.addEventListener('click', function () { startGame(cat); });
                grid.appendChild(btn);
            });
            startDiv.appendChild(grid);

            var hint = document.createElement('p');
            hint.style.cssText = 'font-size:13px;color:' + titleColor + ';opacity:0.5;';
            hint.textContent = maxQ + ' questions · ' + timeSec + 's per question';
            startDiv.appendChild(hint);

            wrap.appendChild(startDiv);
        }

        // Progress elements (re-used)
        var progressWrap, progressFill, progressLabel, timerWrap, timerPill, timerDot, timerSpan;
        var card, catLabel, questionEl, choicesGrid;
        var nextBtn, explanationDiv;

        function buildGameUI() {
            wrap.innerHTML = '';

            // Score bar
            var scoreBar = document.createElement('div');
            scoreBar.className = 'bkbg-trv-score-bar';
            function makeScoreItem(id, label) {
                var item = document.createElement('div');
                item.className = 'bkbg-trv-score-item';
                item.style.color = titleColor;
                var num = document.createElement('div');
                num.className = 'bkbg-trv-score-num';
                num.id = 'bkbg-trv-' + id + '-' + Date.now();
                num.textContent = '0';
                var lbl = document.createElement('div');
                lbl.className = 'bkbg-trv-score-lbl';
                lbl.textContent = label;
                item.appendChild(num);
                item.appendChild(lbl);
                scoreBar.appendChild(item);
                return num;
            }
            var scoreNumEl   = makeScoreItem('score', 'Score');
            var correctNumEl = makeScoreItem('correct', '✓ Correct');
            var wrongNumEl   = makeScoreItem('wrong', '✗ Wrong');
            wrap.appendChild(scoreBar);

            function updateScoreBar() {
                scoreNumEl.textContent   = score;
                correctNumEl.textContent = correct_;
                wrongNumEl.textContent   = wrong_;
                scoreNumEl.style.color   = accent;
                correctNumEl.style.color = correctCol;
                wrongNumEl.style.color   = wrongCol;
            }

            // Progress
            if (opts.showProgress !== false) {
                progressWrap = document.createElement('div');
                progressWrap.className = 'bkbg-trv-progress-wrap';
                var pgBg = document.createElement('div');
                pgBg.className = 'bkbg-trv-progress-bar-bg';
                progressFill = document.createElement('div');
                progressFill.className = 'bkbg-trv-progress-bar-fill';
                progressFill.style.background = accent;
                progressFill.style.width = '0%';
                pgBg.appendChild(progressFill);
                progressLabel = document.createElement('span');
                progressLabel.className = 'bkbg-trv-progress-label';
                progressLabel.style.color = titleColor;
                progressWrap.appendChild(pgBg);
                progressWrap.appendChild(progressLabel);
                wrap.appendChild(progressWrap);
            }

            // Timer
            if (opts.showTimer !== false) {
                timerWrap = document.createElement('div');
                timerWrap.className = 'bkbg-trv-timer-wrap';
                timerPill = document.createElement('div');
                timerPill.className = 'bkbg-trv-timer-pill';
                timerPill.style.background = accent + '18';
                timerDot = document.createElement('div');
                timerDot.className = 'bkbg-trv-timer-dot';
                timerDot.style.background = accent;
                timerSpan = document.createElement('span');
                timerSpan.className = 'bkbg-trv-timer-value';
                timerSpan.style.color = accent;
                timerPill.appendChild(timerDot);
                timerPill.appendChild(timerSpan);
                timerWrap.appendChild(timerPill);
                wrap.appendChild(timerWrap);
            }

            // Card
            card = document.createElement('div');
            card.className = 'bkbg-trv-card';
            card.style.background = cardBg;

            catLabel = document.createElement('div');
            catLabel.className = 'bkbg-trv-cat-label';
            catLabel.style.color = accent;
            card.appendChild(catLabel);

            questionEl = document.createElement('div');
            questionEl.className = 'bkbg-trv-question';
            questionEl.style.color = titleColor;
            card.appendChild(questionEl);

            choicesGrid = document.createElement('div');
            choicesGrid.className = 'bkbg-trv-choices';
            card.appendChild(choicesGrid);

            explanationDiv = document.createElement('div');
            explanationDiv.className = 'bkbg-trv-explanation';
            explanationDiv.style.display = 'none';
            explanationDiv.style.background = accent + '14';
            explanationDiv.style.color = titleColor;
            card.appendChild(explanationDiv);

            wrap.appendChild(card);

            // Next button
            nextBtn = document.createElement('button');
            nextBtn.className = 'bkbg-trv-action-btn';
            nextBtn.style.background = accent;
            nextBtn.style.color = '#fff';
            nextBtn.style.display = 'none';
            nextBtn.addEventListener('click', function () {
                qIndex++;
                if (qIndex >= questions.length) {
                    showResults();
                } else {
                    showQuestion();
                }
            });
            wrap.appendChild(nextBtn);

            // re-expose updateScoreBar
            wrap._updateScore = updateScoreBar;
            return updateScoreBar;
        }

        var updateScoreBar;

        function updateTimer() {
            if (!timerSpan) return;
            timerSpan.textContent = timerVal + 's';
            var ratio = timerVal / timeSec;
            var col = ratio > 0.5 ? correctCol : ratio > 0.25 ? '#f59e0b' : wrongCol;
            timerSpan.style.color  = col;
            timerDot.style.background = col;
            timerPill.style.background = col + '18';
        }

        function showQuestion() {
            answered = false;
            var q = questions[qIndex];
            if (!card || !questionEl) { updateScoreBar = buildGameUI(); }

            if (progressFill) { progressFill.style.width = (qIndex / questions.length * 100) + '%'; }
            if (progressLabel) { progressLabel.textContent = (qIndex + 1) + ' / ' + questions.length; }

            catLabel.textContent = (CAT_EMOJIS[q.cat] || '') + ' ' + (CAT_NAMES[q.cat] || q.cat);
            questionEl.textContent = q.q;

            choicesGrid.innerHTML = '';
            explanationDiv.style.display = 'none';
            nextBtn.style.display = 'none';

            q.choices.forEach(function (choice, i) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-trv-choice';
                btn.style.color = titleColor;
                btn.textContent = choice;
                btn.addEventListener('click', function () { pickAnswer(i, q, btn); });
                choicesGrid.appendChild(btn);
            });

            startTimer();
        }

        function pickAnswer(i, q, btn) {
            if (answered) return;
            answered = true;
            stopTimer();
            revealAnswer(i, q);
        }

        function revealTimeUp() {
            if (answered) return;
            answered = true;
            wrong_++;
            if (wrap._updateScore) wrap._updateScore();
            revealAnswer(-1, questions[qIndex]);
        }

        function revealAnswer(chosen, q) {
            var allBtns = choicesGrid.querySelectorAll('.bkbg-trv-choice');
            allBtns.forEach(function (b, i) {
                b.disabled = true;
                if (i === q.answer) {
                    b.classList.add('bkbg-trv-correct');
                    b.style.background = correctCol;
                    b.style.color = '#fff';
                } else if (i === chosen) {
                    b.classList.add('bkbg-trv-wrong');
                    b.style.background = wrongCol;
                    b.style.color = '#fff';
                } else {
                    b.style.opacity = '0.4';
                }
            });

            if (chosen === q.answer) {
                score += Math.max(10, Math.round(timerVal / timeSec * 100));
                correct_++;
            } else if (chosen !== -1) {
                wrong_++;
            } else {
                // time up
                score = Math.max(0, score);
            }
            if (wrap._updateScore) wrap._updateScore();

            if (opts.showExplanation !== false && q.exp) {
                explanationDiv.textContent = '💡 ' + q.exp;
                explanationDiv.style.display = 'block';
            }

            nextBtn.textContent = qIndex + 1 >= questions.length ? 'See Results →' : 'Next Question →';
            nextBtn.style.display = 'block';
        }

        function showResults() {
            stopTimer();
            wrap.innerHTML = '';

            var pct = Math.round(correct_ / questions.length * 100);
            var trophy = pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '😅';

            var res = document.createElement('div');
            res.className = 'bkbg-trv-results';
            res.style.color = titleColor;

            var trophyEl = document.createElement('div');
            trophyEl.className = 'bkbg-trv-trophy';
            trophyEl.textContent = trophy;
            res.appendChild(trophyEl);

            var finalScore = document.createElement('div');
            finalScore.className = 'bkbg-trv-final-score';
            finalScore.style.color = accent;
            finalScore.textContent = score;
            res.appendChild(finalScore);

            var finalLabel = document.createElement('div');
            finalLabel.className = 'bkbg-trv-final-label';
            finalLabel.textContent = 'Total Score';
            res.appendChild(finalLabel);

            var breakdown = document.createElement('div');
            breakdown.className = 'bkbg-trv-breakdown';
            [
                { label: '✓ Correct', val: correct_, col: correctCol },
                { label: '✗ Wrong', val: wrong_, col: wrongCol },
                { label: 'Accuracy', val: pct + '%', col: accent }
            ].forEach(function (item) {
                var d = document.createElement('div');
                d.className = 'bkbg-trv-breakdown-item';
                d.innerHTML = '<span style="font-weight:700;font-size:22px;color:' + item.col + '">' + item.val + '</span><br><span style="opacity:0.6;font-size:12px">' + item.label + '</span>';
                breakdown.appendChild(d);
            });
            res.appendChild(breakdown);

            var pMsg = pct >= 80 ? 'Outstanding! You\'re a true trivia master! 🎉' : pct >= 60 ? 'Good job! Keep practicing!' : pct >= 40 ? 'Not bad! Try again to improve.' : 'Better luck next time! Try again.';
            var msg = document.createElement('p');
            msg.style.cssText = 'font-size:15px;margin-bottom:20px;opacity:0.75;';
            msg.textContent = pMsg;
            res.appendChild(msg);

            var playBtn = document.createElement('button');
            playBtn.className = 'bkbg-trv-action-btn';
            playBtn.style.background = accent;
            playBtn.style.color = '#fff';
            playBtn.style.maxWidth = '300px';
            playBtn.textContent = '↩ Play Again';
            playBtn.addEventListener('click', function () { showStart(); });
            res.appendChild(playBtn);

            wrap.appendChild(res);
        }

        // Initialize
        updateScoreBar = function () {};
        if (catSetting !== 'mixed') {
            startGame(catSetting);
        } else {
            showStart();
        }
    }

    document.querySelectorAll('.bkbg-trv-app').forEach(function (root) {
        initBlock(root);
    });
})();
