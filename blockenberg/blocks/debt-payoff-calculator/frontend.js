(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = { family:'font-family', weight:'font-weight', transform:'text-transform', style:'font-style', decoration:'text-decoration',
                  sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
                  lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
                  letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
                  wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
        Object.keys(m).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k], u = typo[k + 'Unit'] || '';
                if (/Desktop|Tablet|Mobile/.test(k) && typeof v === 'number') v = v + (u || 'px');
                el.style.setProperty(prefix + m[k], '' + v);
            }
        });
    }

    function calcPayoff(debts, extra, strategy) {
        var list = debts.map(function(d){ return {name:d.name, balance:parseFloat(d.balance)||0, rate:(parseFloat(d.rate)||0)/100/12, min:parseFloat(d.minPay)||0}; });
        list = list.filter(function(d){ return d.balance > 0; });
        if (!list.length) return {months:0, totalInterest:0, schedule:[]};
        var sorted = list.slice().sort(function(a,b){
            return strategy === 'avalanche' ? b.rate - a.rate : a.balance - b.balance;
        });
        var minTotal = sorted.reduce(function(s,d){ return s+d.min; }, 0);
        var budget = minTotal + (extra||0);
        var schedule = [], totalInterest = 0, months = 0, MAX = 600;
        while (sorted.some(function(d){ return d.balance>0; }) && months<MAX) {
            months++;
            var available = budget;
            sorted.forEach(function(d){
                if (d.balance<=0) return;
                var int = d.balance*d.rate;
                totalInterest+=int; d.balance+=int;
                var pay=Math.min(d.min,d.balance); d.balance-=pay; available-=pay;
                if (d.balance<0.01) d.balance=0;
            });
            for (var i=0;i<sorted.length;i++){
                if (sorted[i].balance>0&&available>0){
                    var ex=Math.min(available,sorted[i].balance);
                    sorted[i].balance-=ex; available-=ex;
                    if (sorted[i].balance<0.01) sorted[i].balance=0;
                }
            }
            var totalBal=sorted.reduce(function(s,d){return s+d.balance;},0);
            if (schedule.length<120) schedule.push({month:months,totalBalance:Math.round(totalBal*100)/100,totalInterest:Math.round(totalInterest*100)/100});
        }
        return {months:months, totalInterest:Math.round(totalInterest*100)/100, schedule:schedule};
    }

    function fmtMoney(n, cur) { return (cur||'$') + Math.abs(n).toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2}); }

    function initApp(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts')||'{}'); } catch(e){ return; }

        var accent   = opts.accentColor    || '#6c3fb5';
        var cur      = opts.currency       || '$';
        var avClr    = opts.avalancheColor || '#8b5cf6';
        var sbClr    = opts.snowballColor  || '#3b82f6';
        var cardR    = (opts.cardRadius    || 16)+'px';
        var inpR     = (opts.inputRadius   || 8)+'px';
        var maxW     = (opts.maxWidth      || 700)+'px';
        var ptop     = (opts.paddingTop    || 60)+'px';
        var pbot     = (opts.paddingBottom || 60)+'px';
        var schedRows= opts.scheduleRows   || 12;

        var strategy = opts.defaultStrategy || 'avalanche';
        var extra    = 200;
        var nextId   = 10;
        var debts    = [
            {id:1,name:'Credit Card A',balance:5000,rate:22.99,minPay:100},
            {id:2,name:'Credit Card B',balance:2800,rate:17.49,minPay:60},
            {id:3,name:'Personal Loan',balance:8500,rate:11.5, minPay:180}
        ];

        app.style.paddingTop    = ptop;
        app.style.paddingBottom = pbot;
        if (opts.sectionBg) app.style.background = opts.sectionBg;

        /* Typography CSS vars */
        app.style.setProperty('--bkbg-dpc-ttl-fs', (opts.titleSize || 28) + 'px');
        app.style.setProperty('--bkbg-dpc-sub-fs', (opts.subtitleFontSize || 15) + 'px');
        if (opts.typoTitle) typoCssVarsForEl(opts.typoTitle, '--bkbg-dpc-ttl-', app);
        if (opts.typoSubtitle) typoCssVarsForEl(opts.typoSubtitle, '--bkbg-dpc-sub-', app);

        var card = document.createElement('div');
        card.className = 'bkbg-dpc-card';
        Object.assign(card.style, {background:opts.cardBg||'#fff', borderRadius:cardR, maxWidth:maxW});
        app.appendChild(card);

        // Header
        if (opts.showTitle && opts.title) {
            var ttl=document.createElement('div'); ttl.className='bkbg-dpc-title';
            ttl.textContent=opts.title; if(opts.titleColor)ttl.style.color=opts.titleColor;
            card.appendChild(ttl);
        }
        if (opts.showSubtitle && opts.subtitle) {
            var sub=document.createElement('div'); sub.className='bkbg-dpc-subtitle';
            sub.textContent=opts.subtitle; if(opts.subtitleColor)sub.style.color=opts.subtitleColor;
            card.appendChild(sub);
        }

        // Strategy tabs
        var stratTabs=document.createElement('div'); stratTabs.className='bkbg-dpc-strat-tabs'; card.appendChild(stratTabs);
        var stratBtns={};
        [{id:'avalanche',label:'⬇ Avalanche',color:avClr},{id:'snowball',label:'⛄ Snowball',color:sbClr}].forEach(function(s){
            var btn=document.createElement('button'); btn.className='bkbg-dpc-strat-btn'; btn.textContent=s.label; btn.dataset.strat=s.id;
            btn.addEventListener('click',function(){ strategy=s.id; updateStratTabs(); render(); });
            stratBtns[s.id]=btn; stratTabs.appendChild(btn);
        });

        function updateStratTabs(){
            Object.keys(stratBtns).forEach(function(k){
                var btn=stratBtns[k];
                var clr=k==='avalanche'?avClr:sbClr;
                var active=k===strategy;
                btn.style.border='2px solid '+(active?clr:'#e5e7eb');
                btn.style.background=active?clr+'18':'#fff';
                btn.style.color=active?clr:'#6b7280';
                btn.style.fontWeight=active?'700':'500';
            });
        }
        updateStratTabs();

        // Row header
        var rowHdr=document.createElement('div'); rowHdr.className='bkbg-dpc-row-header'; card.appendChild(rowHdr);
        ['Name','Balance ('+cur+')','APR %','Min Pay ('+cur+')',''].forEach(function(h){
            var d=document.createElement('div'); d.className='bkbg-dpc-lbl';
            if(opts.labelColor)d.style.color=opts.labelColor; d.textContent=h; rowHdr.appendChild(d);
        });

        // Debt rows container
        var rowsWrap=document.createElement('div'); rowsWrap.className='bkbg-dpc-rows-wrap'; card.appendChild(rowsWrap);

        function mkInput(type,val,placeholder,onChange){
            var inp=document.createElement('input'); inp.type=type; inp.value=val; inp.className='bkbg-dpc-input';
            inp.style.borderRadius=inpR; inp.style.borderColor=opts.inputBorder||'#e5e7eb';
            if(placeholder)inp.placeholder=placeholder;
            inp.addEventListener('input',function(){onChange(inp.value);});
            return inp;
        }

        function renderRows(){
            rowsWrap.innerHTML='';
            debts.forEach(function(d){
                var row=document.createElement('div'); row.className='bkbg-dpc-debt-row';
                if(opts.rowBg) row.style.background=opts.rowBg;
                if(opts.rowBorder) row.style.borderColor=opts.rowBorder;
                row.appendChild(mkInput('text', d.name,'Debt name',function(v){d.name=v;}));
                row.appendChild(mkInput('number',d.balance,'',function(v){d.balance=parseFloat(v)||0; render();}));
                row.appendChild(mkInput('number',d.rate,'',function(v){d.rate=parseFloat(v)||0; render();}));
                row.appendChild(mkInput('number',d.minPay,'',function(v){d.minPay=parseFloat(v)||0; render();}));
                var rm=document.createElement('button'); rm.className='bkbg-dpc-remove-btn'; rm.textContent='×';
                rm.addEventListener('click',function(){debts=debts.filter(function(x){return x.id!==d.id;}); renderRows(); render();});
                row.appendChild(rm);
                rowsWrap.appendChild(row);
            });
        }

        // Add row / extra payment
        var addRow=document.createElement('div'); addRow.className='bkbg-dpc-add-row'; card.appendChild(addRow);
        var addBtn=document.createElement('button'); addBtn.className='bkbg-dpc-add-btn'; addBtn.textContent='+ Add Debt';
        addBtn.style.background=accent;
        addBtn.addEventListener('click',function(){ nextId++; debts.push({id:nextId,name:'New Debt',balance:1000,rate:15,minPay:25}); renderRows(); render(); });
        addRow.appendChild(addBtn);
        var extraWrap=document.createElement('div'); extraWrap.className='bkbg-dpc-extra-wrap';
        var extraLbl=document.createElement('label'); extraLbl.className='bkbg-dpc-lbl'; extraLbl.textContent='Extra Monthly Payment ('+cur+')';
        if(opts.labelColor)extraLbl.style.color=opts.labelColor;
        var extraInp=document.createElement('input'); extraInp.type='number'; extraInp.value=extra; extraInp.className='bkbg-dpc-input'; extraInp.style.borderRadius=inpR; extraInp.style.maxWidth='180px';
        extraInp.addEventListener('input',function(){ extra=parseFloat(extraInp.value)||0; render(); });
        extraWrap.appendChild(extraLbl); extraWrap.appendChild(extraInp); addRow.appendChild(extraWrap);

        // Results
        var resultsEl=document.createElement('div'); resultsEl.className='bkbg-dpc-results'; card.appendChild(resultsEl);
        if(opts.resultBg) resultsEl.style.background=opts.resultBg;
        if(opts.resultBorder) resultsEl.style.borderColor=opts.resultBorder;

        // Comparison
        var cmpEl=document.createElement('div'); cmpEl.className='bkbg-dpc-comparison';
        if(opts.showComparison!==false) card.appendChild(cmpEl);

        // Schedule
        var schedEl=document.createElement('div');
        if(opts.showSchedule!==false) card.appendChild(schedEl);

        function render(){
            var avRes=calcPayoff(debts,extra,'avalanche');
            var sbRes=calcPayoff(debts,extra,'snowball');
            var cur2=strategy==='avalanche'?avRes:sbRes;
            var curClr=strategy==='avalanche'?avClr:sbClr;

            // Results card
            resultsEl.innerHTML='';
            var rt=document.createElement('div'); rt.className='bkbg-dpc-results-title'; rt.style.color=curClr;
            rt.textContent=(strategy==='avalanche'?'Avalanche':'Snowball')+' Strategy Results'; resultsEl.appendChild(rt);
            var sg=document.createElement('div'); sg.className='bkbg-dpc-stat-grid'; resultsEl.appendChild(sg);
            [{label:'Months to Payoff',val:cur2.months+' mo'},{label:'Years to Payoff',val:(cur2.months/12).toFixed(1)+' yr'},{label:'Total Interest',val:fmtMoney(cur2.totalInterest,cur)}].forEach(function(item){
                var box=document.createElement('div'); box.className='bkbg-dpc-stat';
                var v=document.createElement('div'); v.className='bkbg-dpc-stat-val'; v.style.color=accent; v.textContent=item.val;
                var l=document.createElement('div'); l.className='bkbg-dpc-stat-lbl'; l.textContent=item.label;
                box.appendChild(v); box.appendChild(l); sg.appendChild(box);
            });

            // Comparison
            if(opts.showComparison!==false){
                cmpEl.innerHTML='';
                var ct=document.createElement('div'); ct.className='bkbg-dpc-cmp-title'; ct.textContent='Strategy Comparison'; cmpEl.appendChild(ct);
                var cg=document.createElement('div'); cg.className='bkbg-dpc-cmp-grid'; cmpEl.appendChild(cg);
                [{label:'Avalanche',res:avRes,color:avClr},{label:'Snowball',res:sbRes,color:sbClr}].forEach(function(s){
                    var item=document.createElement('div'); item.className='bkbg-dpc-cmp-item';
                    item.style.background=s.color+'0d'; item.style.border='2px solid '+s.color+'44';
                    var lbl=document.createElement('div'); lbl.className='bkbg-dpc-cmp-label'; lbl.style.color=s.color; lbl.textContent=s.label;
                    var mo=document.createElement('div'); mo.className='bkbg-dpc-cmp-months'; mo.textContent=s.res.months+' mo';
                    var it=document.createElement('div'); it.className='bkbg-dpc-cmp-interest'; it.textContent='Interest: '+fmtMoney(s.res.totalInterest,cur);
                    item.appendChild(lbl); item.appendChild(mo); item.appendChild(it); cg.appendChild(item);
                });
                if(avRes.months>0&&sbRes.months>0){
                    var tip=document.createElement('div'); tip.className='bkbg-dpc-cmp-tip';
                    var saved=Math.abs(sbRes.totalInterest-avRes.totalInterest);
                    tip.textContent= avRes.totalInterest<=sbRes.totalInterest
                        ? '💡 Avalanche saves '+fmtMoney(saved,cur)+' in interest vs. Snowball'
                        : '💡 Snowball saves '+fmtMoney(saved,cur)+' in interest vs. Avalanche';
                    cmpEl.appendChild(tip);
                }
            }

            // Schedule
            if(opts.showSchedule!==false){
                schedEl.innerHTML='';
                if(cur2.schedule.length>0){
                    var stt=document.createElement('div'); stt.className='bkbg-dpc-schedule-title';
                    stt.textContent='Payoff Schedule (first '+schedRows+' months)'; schedEl.appendChild(stt);
                    var wrap=document.createElement('div'); wrap.className='bkbg-dpc-schedule-wrap'; schedEl.appendChild(wrap);
                    var table=document.createElement('table'); table.className='bkbg-dpc-schedule-table'; wrap.appendChild(table);
                    var thead=document.createElement('thead'); table.appendChild(thead);
                    var hr=document.createElement('tr'); thead.appendChild(hr);
                    ['Month','Remaining Balance','Total Interest Paid'].forEach(function(h){
                        var th=document.createElement('th'); th.textContent=h; hr.appendChild(th);
                    });
                    var tbody=document.createElement('tbody'); table.appendChild(tbody);
                    cur2.schedule.slice(0,schedRows).forEach(function(row,i){
                        var tr=document.createElement('tr'); tbody.appendChild(tr);
                        [row.month, fmtMoney(row.totalBalance,cur), fmtMoney(row.totalInterest,cur)].forEach(function(val,ci){
                            var td=document.createElement('td'); td.textContent=val;
                            if(ci===2) td.className='td-interest';
                            if(ci===1) td.className='td-balance';
                            tr.appendChild(td);
                        });
                    });
                }
            }
        }

        renderRows();
        render();
    }

    document.querySelectorAll('.bkbg-dpc-app').forEach(initApp);
})();
