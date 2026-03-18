(function () {
    'use strict';

    var typoMap = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform'],
        ['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m'],
        ['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m'],
        ['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m'],
        ['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']
    ];
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        for (var i = 0; i < typoMap.length; i++) {
            var v = typo[typoMap[i][0]];
            if (v !== undefined && v !== '' && v !== null) el.style.setProperty(prefix + typoMap[i][1], String(v));
        }
    }

    function hamwi(hcm, g)    { var i=(hcm-152.4)/2.54; return (g==='male'?48:45.4)  + (g==='male'?2.7:2.25) *Math.max(i,0); }
    function devine(hcm, g)   { var i=(hcm-152.4)/2.54; return (g==='male'?50:45.5)  + 2.3 *Math.max(i,0); }
    function robinson(hcm, g) { var i=(hcm-152.4)/2.54; return (g==='male'?52:49)     + (g==='male'?1.9:1.7)  *Math.max(i,0); }
    function miller(hcm, g)   { var i=(hcm-152.4)/2.54; return (g==='male'?56.2:53.1) + (g==='male'?1.41:1.36)*Math.max(i,0); }
    function bmiRange(hcm)    { var hm=hcm/100; return {low:18.5*hm*hm, high:24.9*hm*hm}; }
    function toLbs(kg)        { return kg*2.2046; }

    function initApp(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts')||'{}'); } catch(e){ return; }

        var accent   = opts.accentColor    || '#6c3fb5';
        var cardR    = (opts.cardRadius    || 16)+'px';
        var inpR     = (opts.inputRadius   || 8)+'px';
        var maxW     = (opts.maxWidth      || 600)+'px';
        var ptop     = (opts.paddingTop    || 60)+'px';
        var pbot     = (opts.paddingBottom || 60)+'px';
        var lblClr   = opts.labelColor     || '#374151';

        var unit     = opts.defaultUnit   || 'metric';
        var gender   = opts.defaultGender || 'male';
        var heightCm = opts.defaultHeight || 170;
        var ft=5, ins=7;

        app.style.paddingTop    = ptop;
        app.style.paddingBottom = pbot;
        if (opts.sectionBg) app.style.background = opts.sectionBg;

        // Card
        var card = document.createElement('div'); card.className='bkbg-iwc-card';
        Object.assign(card.style, {background:opts.cardBg||'#fff',borderRadius:cardR,maxWidth:maxW});
        if (opts.titleSize) card.style.setProperty('--bkbg-iwc-title-sz', opts.titleSize + 'px');
        typoCssVarsForEl(opts.titleTypo, '--bkbg-iwc-tt-', card);
        typoCssVarsForEl(opts.subtitleTypo, '--bkbg-iwc-st-', card);
        app.appendChild(card);

        if (opts.showTitle && opts.title) {
            var ttl=document.createElement('div'); ttl.className='bkbg-iwc-title';
            ttl.textContent=opts.title; if(opts.titleColor)ttl.style.color=opts.titleColor;
            card.appendChild(ttl);
        }
        if (opts.showSubtitle && opts.subtitle) {
            var sub=document.createElement('div'); sub.className='bkbg-iwc-subtitle';
            sub.textContent=opts.subtitle; if(opts.subtitleColor)sub.style.color=opts.subtitleColor;
            card.appendChild(sub);
        }

        // Unit/Gender toggles
        var toggleGrid=document.createElement('div'); toggleGrid.className='bkbg-iwc-toggle-grid';
        card.appendChild(toggleGrid);

        function mkToggleGroup(labelText, options, current, onChange) {
            var wrap=document.createElement('div');
            var lbl=document.createElement('label'); lbl.className='bkbg-iwc-lbl'; lbl.textContent=labelText;
            if(lblClr)lbl.style.color=lblClr; wrap.appendChild(lbl);
            var bar=document.createElement('div'); bar.className='bkbg-iwc-toggle-bar'; wrap.appendChild(bar);
            var btns={};
            options.forEach(function(o){
                var btn=document.createElement('button'); btn.className='bkbg-iwc-toggle-btn'; btn.textContent=o.label;
                btn.dataset.val=o.id; btn.dataset.color=o.color||accent;
                btn.addEventListener('click',function(){ onChange(o.id); });
                btns[o.id]=btn; bar.appendChild(btn);
            });
            function refresh(val){
                Object.keys(btns).forEach(function(k){
                    var b=btns[k]; var c=b.dataset.color;
                    var active=k===val;
                    b.style.background=active?c:'transparent'; b.style.color=active?'#fff':'#6b7280'; b.style.fontWeight=active?'700':'500';
                });
            }
            refresh(current);
            return {el:wrap, refresh:refresh};
        }

        var unitToggle = mkToggleGroup('Unit System',
            [{id:'metric',label:'Metric',color:accent},{id:'imperial',label:'Imperial',color:accent}],
            unit, function(v){ unit=v; unitToggle.refresh(v); renderHeight(); render(); });
        var gndrToggle = mkToggleGroup('Biological Sex',
            [{id:'male',label:'♂ Male',color:opts.maleColor||'#3b82f6'},{id:'female',label:'♀ Female',color:opts.femaleColor||'#ec4899'}],
            gender, function(v){ gender=v; gndrToggle.refresh(v); render(); });
        toggleGrid.appendChild(unitToggle.el);
        toggleGrid.appendChild(gndrToggle.el);

        // Height input area
        var heightWrap=document.createElement('div'); heightWrap.className='bkbg-iwc-height-wrap'; card.appendChild(heightWrap);
        var hLbl=document.createElement('label'); hLbl.className='bkbg-iwc-lbl'; hLbl.textContent='Height'; if(lblClr)hLbl.style.color=lblClr;
        heightWrap.appendChild(hLbl);

        var metricRow=document.createElement('div'); metricRow.className='bkbg-iwc-slider-row';
        var slider=document.createElement('input'); slider.type='range'; slider.min=140; slider.max=220; slider.value=heightCm; slider.className='bkbg-iwc-slider';
        slider.style.accentColor=accent;
        var heightVal=document.createElement('span'); heightVal.className='bkbg-iwc-height-val'; heightVal.style.color=accent; heightVal.textContent=heightCm+' cm';
        slider.addEventListener('input',function(){ heightCm=parseInt(slider.value); heightVal.textContent=heightCm+' cm'; render(); });
        metricRow.appendChild(slider); metricRow.appendChild(heightVal);

        var impRow=document.createElement('div'); impRow.className='bkbg-iwc-imperial-row'; impRow.style.display='none';
        function mkNumInput(val,min,max,lbl,onChange){
            var col=document.createElement('div'); col.className='bkbg-iwc-imperial-col';
            var l=document.createElement('label'); l.className='bkbg-iwc-lbl'; l.textContent=lbl; if(lblClr)l.style.color=lblClr;
            var inp=document.createElement('input'); inp.type='number'; inp.value=val; inp.min=min; inp.max=max; inp.className='bkbg-iwc-input';
            inp.style.borderRadius=inpR; if(opts.inputBorder)inp.style.borderColor=opts.inputBorder;
            inp.addEventListener('input',function(){ onChange(parseInt(inp.value)||0); render(); });
            col.appendChild(l); col.appendChild(inp); return col;
        }
        impRow.appendChild(mkNumInput(ft,4,7,"Feet",function(v){ft=v; heightCm=Math.round((ft*12+ins)*2.54);}));
        impRow.appendChild(mkNumInput(ins,0,11,"Inches",function(v){ins=v; heightCm=Math.round((ft*12+ins)*2.54);}));
        heightWrap.appendChild(metricRow); heightWrap.appendChild(impRow);

        function renderHeight(){
            if(unit==='metric'){metricRow.style.display='flex';impRow.style.display='none';}
            else{metricRow.style.display='none';impRow.style.display='flex';}
        }

        // Result
        var resultEl=document.createElement('div'); resultEl.className='bkbg-iwc-result'; card.appendChild(resultEl);
        if(opts.resultBg) resultEl.style.background=opts.resultBg;
        if(opts.resultBorder){resultEl.style.border='1px solid '+opts.resultBorder;}

        // Chart
        var chartEl=document.createElement('div'); chartEl.className='bkbg-iwc-chart';
        if(opts.showChart!==false) card.appendChild(chartEl);

        // Formula grid
        var fgEl=document.createElement('div'); fgEl.className='bkbg-iwc-formula-grid';
        if(opts.showFormulas!==false) card.appendChild(fgEl);

        // BMI range
        var bmiEl=document.createElement('div'); bmiEl.className='bkbg-iwc-bmi-box';
        if(opts.showBMIRange!==false){
            var bmiClr=opts.bmiRangeColor||'#22c55e';
            bmiEl.style.background=bmiClr+'14'; bmiEl.style.border='1.5px solid '+bmiClr+'55';
            card.appendChild(bmiEl);
        }

        function fmtW(kg){ return unit==='metric' ? kg.toFixed(1)+' kg' : toLbs(kg).toFixed(1)+' lbs'; }

        function render(){
            var hcm=unit==='metric'?heightCm:Math.round((ft*12+ins)*2.54);
            var FORMULAS=[
                {key:'hamwi',   label:'Hamwi',   color:opts.hamwiColor   ||'#8b5cf6', kg:hamwi(hcm,gender)},
                {key:'devine',  label:'Devine',  color:opts.devineColor  ||'#3b82f6', kg:devine(hcm,gender)},
                {key:'robinson',label:'Robinson',color:opts.robinsonColor||'#10b981', kg:robinson(hcm,gender)},
                {key:'miller',  label:'Miller',  color:opts.millerColor  ||'#f59e0b', kg:miller(hcm,gender)}
            ];
            var avg=FORMULAS.reduce(function(s,f){return s+f.kg;},0)/FORMULAS.length;
            var minK=Math.min.apply(null,FORMULAS.map(function(f){return f.kg;}))-3;
            var maxK=Math.max.apply(null,FORMULAS.map(function(f){return f.kg;}))+3;
            var pct=function(kg){return Math.max(5,Math.min(100,((kg-minK)/(maxK-minK))*100));};

            // Result
            resultEl.innerHTML='';
            var rl=document.createElement('div'); rl.className='bkbg-iwc-result-label'; rl.style.color=accent; rl.textContent='Average Ideal Weight'; resultEl.appendChild(rl);
            var rv=document.createElement('div'); rv.className='bkbg-iwc-result-val'; rv.style.color=accent;
            if(opts.resultSize)rv.style.fontSize=opts.resultSize+'px';
            rv.textContent=fmtW(avg); resultEl.appendChild(rv);
            var rs=document.createElement('div'); rs.className='bkbg-iwc-result-sub'; rs.textContent='Average of 4 medical formulas'; resultEl.appendChild(rs);

            // Chart
            if(opts.showChart!==false){
                chartEl.innerHTML='';
                FORMULAS.forEach(function(f){
                    var row=document.createElement('div'); row.className='bkbg-iwc-bar-row';
                    var hdr=document.createElement('div'); hdr.className='bkbg-iwc-bar-header'; hdr.style.color=f.color;
                    var nl=document.createElement('span'); nl.textContent=f.label;
                    var vl=document.createElement('span'); vl.textContent=fmtW(f.kg);
                    hdr.appendChild(nl); hdr.appendChild(vl);
                    var track=document.createElement('div'); track.className='bkbg-iwc-bar-track';
                    var fill=document.createElement('div'); fill.className='bkbg-iwc-bar-fill';
                    fill.style.width=pct(f.kg)+'%'; fill.style.background=f.color;
                    track.appendChild(fill); row.appendChild(hdr); row.appendChild(track); chartEl.appendChild(row);
                });
            }

            // Formula grid
            if(opts.showFormulas!==false){
                fgEl.innerHTML='';
                FORMULAS.forEach(function(f){
                    var item=document.createElement('div'); item.className='bkbg-iwc-formula-item';
                    item.style.background=f.color+'12'; item.style.border='2px solid '+f.color+'44';
                    var nm=document.createElement('div'); nm.className='bkbg-iwc-formula-name'; nm.style.color=f.color; nm.textContent=f.label;
                    var mn=document.createElement('div'); mn.className='bkbg-iwc-formula-main'; mn.textContent=fmtW(f.kg);
                    var alt=document.createElement('div'); alt.className='bkbg-iwc-formula-alt';
                    alt.textContent=unit==='metric'?toLbs(f.kg).toFixed(1)+' lbs':f.kg.toFixed(1)+' kg';
                    item.appendChild(nm); item.appendChild(mn); item.appendChild(alt); fgEl.appendChild(item);
                });
            }

            // BMI range
            if(opts.showBMIRange!==false){
                bmiEl.innerHTML='';
                var bmiClr=opts.bmiRangeColor||'#22c55e';
                var br=bmiRange(hcm);
                var bt=document.createElement('div'); bt.className='bkbg-iwc-bmi-title'; bt.style.color=bmiClr; bt.textContent='✓ Healthy BMI Range (18.5–24.9)';
                var bv=document.createElement('div'); bv.className='bkbg-iwc-bmi-range'; bv.textContent=fmtW(br.low)+' – '+fmtW(br.high);
                var bs=document.createElement('div'); bs.className='bkbg-iwc-bmi-sub';
                bs.textContent='Based on your height of '+(unit==='metric'?(hcm+' cm'):(ft+"' "+ins+'"'));
                bmiEl.appendChild(bt); bmiEl.appendChild(bv); bmiEl.appendChild(bs);
            }
        }

        renderHeight();
        render();
    }

    document.querySelectorAll('.bkbg-iwc-app').forEach(initApp);
})();
