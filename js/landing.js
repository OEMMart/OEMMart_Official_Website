(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  // 跑马灯内容翻倍以实现无缝循环
  const mq = document.getElementById('marq');
  mq.innerHTML += mq.innerHTML;

  if (reduce || !hasGsap){
    document.body.classList.add('static','lit');
  } else {
    gsap.registerPlugin(ScrollTrigger);

    const stage = document.getElementById('stage');
    const docs = gsap.utils.toArray('.doc');

    gsap.set('#after', {visibility:'visible'});
    gsap.set('#after > *', {autoAlpha:0, y:44});

    const tl = gsap.timeline({
      scrollTrigger:{
        trigger: stage, start:'top top', end:'+=2800',
        pin:true, scrub:1, invalidateOnRefresh:true,
        onUpdate: self => document.body.classList.toggle('lit', self.progress > 0.62)
      }
    });

    tl.to('#before', {autoAlpha:0, y:-60, duration:1.2, ease:'power1.in'}, 0.3);
    docs.forEach((doc, i)=>{
      const wrap = doc.parentElement;
      tl.to(doc, {
        x: ()=> stage.clientWidth*0.5 - (wrap.offsetLeft + doc.offsetWidth/2),
        y: ()=> stage.clientHeight*0.44 - (wrap.offsetTop + doc.offsetHeight/2),
        rotation: (i%2 ? 300 : -300),
        scale: 0.04, autoAlpha: 0,
        duration: 2.4, ease: 'power2.in'
      }, 0.5 + i*0.12);
    });
    tl.to('#orb', {autoAlpha:1, scale:1.25, duration:1.6, ease:'power2.out'}, 1.4);
    tl.to('#orb', {scale:0.95, duration:0.5, ease:'power1.inOut'}, 3.2);
    tl.to('#light', {opacity:1, duration:1.8, ease:'power1.inOut'}, 3.6);
    tl.to('#orb', {autoAlpha:0, scale:2.6, duration:1.4, ease:'power2.in'}, 3.7);
    tl.to('#after > *', {autoAlpha:1, y:0, duration:1.4, stagger:0.3, ease:'power3.out'}, 4.6);
    tl.to({}, {duration:0.8});
  }

  // reveal
  const io = new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('vis'); io.unobserve(e.target);} });
  },{threshold:0.16});
  document.querySelectorAll('.rv').forEach(el=>io.observe(el));

  // 巨型数字滚动计数
  const cio = new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, dur = 1400, t0 = performance.now();
      const step = t =>{
        const p = Math.min(1,(t - t0)/dur), eased = 1 - Math.pow(1-p,3);
        el.textContent = Math.round(target*eased);
        if(p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      cio.unobserve(el);
    });
  },{threshold:0.6});
  document.querySelectorAll('[data-count]').forEach(el=>cio.observe(el));

  // Before/After 拖拽
  const cmp = document.getElementById('cmp');
  let dragging = false;
  const setX = clientX =>{
    const r = cmp.getBoundingClientRect();
    cmp.style.setProperty('--x', Math.min(92, Math.max(8,(clientX - r.left)/r.width*100))+'%');
  };
  cmp.addEventListener('pointerdown', e=>{ dragging=true; setX(e.clientX); cmp.setPointerCapture(e.pointerId); });
  cmp.addEventListener('pointermove', e=>{ if(dragging) setX(e.clientX); });
  cmp.addEventListener('pointerup', ()=> dragging=false);
  cmp.addEventListener('pointercancel', ()=> dragging=false);

  /* ===== 标书纸：逐词书写 + 自然语言修订第二幕 ===== */
  const sheet = document.getElementById('sheet');
  (function(){
    const wrapWords = node =>{
      [...node.childNodes].forEach(ch=>{
        if(ch.nodeType === 3){
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(part=>{
            if(!part) return;
            if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement('span'); s.className='w'; s.textContent=part; frag.appendChild(s);
          });
          node.replaceChild(frag, ch);
        } else if(ch.nodeType === 1 && ch.id !== 'caret'){ wrapWords(ch); }
      });
    };
    const paras = [...sheet.querySelectorAll('.para')];
    const originals = paras.map(p=>p.innerHTML);
    const p34 = document.getElementById('p34');
    const bubble = document.getElementById('bubble');
    const P34_REV = '<b>3.4 Exceptions.</b> Our equipment meets the stated requirements with one exception: air quality class, where our <span class="tok">ISO 8573-1 Class 2</span> rating exceeds the specified class, documented with data from <span class="tok">your product catalogue</span>. <span class="rvtag">REWRITTEN</span>';

    if(reduce){
      p34.innerHTML = P34_REV;
      p34.classList.add('sel');
      bubble.classList.add('on');
      return;
    }
    const caret = document.createElement('span'); caret.className='caret'; caret.id='caret';
    const typeWords = (scope, speedMin, speedRand, done) =>{
      const words = [...scope.querySelectorAll('.w:not(.on)')];
      let i = 0;
      const t = ()=>{
        if(i >= words.length){ done && done(); return; }
        words[i].classList.add('on');
        if(words[i].parentNode) words[i].parentNode.insertBefore(caret, words[i].nextSibling);
        i++;
        setTimeout(t, speedMin + Math.random()*speedRand);
      };
      t();
    };
    const run = ()=>{
      // 第一幕：整稿书写
      paras.forEach((p,idx)=>{ p.innerHTML = originals[idx]; p.classList.remove('sel'); });
      bubble.classList.remove('on');
      paras.forEach(wrapWords);
      typeWords(sheet, 38, 66, ()=>{
        // 第二幕：用户圈中 3.4 段，说一句话
        setTimeout(()=>{
          p34.classList.add('sel');
          bubble.classList.add('on');
          // 第三幕：只重写这一段
          setTimeout(()=>{
            p34.innerHTML = P34_REV;
            wrapWords(p34);
            typeWords(p34, 20, 28, ()=>{ setTimeout(run, 5600); });
          }, 2300);
        }, 1100);
      });
    };
    let started = false;
    const sio = new IntersectionObserver(es=>{
      es.forEach(e=>{ if(e.isIntersecting && !started){ started=true; setTimeout(run,500); sio.disconnect(); } });
    },{threshold:0.35});
    sio.observe(sheet);
  })();

  /* ===== Signal 合成流水线：原始信号 → 你的业务透镜 → 行动建议 ===== */
  (function(){
    const raw = [
      {s:'FEDERAL REGISTER', t:'12m ago', h:'$2.1B water infrastructure grants for 2027'},
      {s:'OHIO DAS', t:'1h ago', h:'Energy-efficiency standards updated for public buildings'},
      {s:'SAM.GOV', t:'22m ago', h:'Pre-solicitation: shore-side compressed air systems'},
      {s:'INDUSTRY WIRE', t:'5h ago', h:'Major competitor exits Texas service market'},
      {s:'NAVY SMALL BIZ', t:'2h ago', h:'FY27 set-aside goals raised for coastal yards'},
      {s:'PORT AUTHORITY', t:'40m ago', h:'Two shipyard expansion filings on the Gulf coast'}
    ];
    const insights = [
      {hl:"Pre-position for Ohio's Q1 wastewater surge.",
       body:'Grant money, new efficiency standards and a competitor exit all point the same way. Your CSD line fits the incoming specs.',
       chips:['FEDERAL REGISTER','OHIO DAS','INDUSTRY WIRE'], hot:[0,1,3]},
      {hl:'Extend the naval win to two more shipyards.',
       body:'A fresh pre-solicitation matches your March scope. Set-aside goals and expansion filings widen the door.',
       chips:['SAM.GOV','NAVY SMALL BIZ','PORT AUTHORITY'], hot:[2,4,5]}
    ];
    const rawlist = document.getElementById('rawlist');
    raw.forEach(it=>{
      const d = document.createElement('div');
      d.className = 'rawchip';
      d.innerHTML = '<div class="s"><span>'+it.s+'</span><span>'+it.t+'</span></div><div class="h">'+it.h+'</div>';
      rawlist.appendChild(d);
    });
    const chips = [...rawlist.children];
    const lens = document.getElementById('lens'), insight = document.getElementById('insight');
    const ihl = document.getElementById('ihl'), ibody = document.getElementById('ibody'), ichips = document.getElementById('ichips');
    const show = ins =>{
      ihl.textContent = ins.hl; ibody.textContent = ins.body;
      ichips.innerHTML = ins.chips.map(c=>'<span class="ichip">'+c+'</span>').join('');
    };
    show(insights[0]);
    chips.forEach((c,i)=>{ if(insights[0].hot.includes(i)) c.classList.add('hot'); });
    if(reduce) return;
    let k = 0;
    setInterval(()=>{
      const next = insights[(k+1) % insights.length];
      chips.forEach(c=>c.classList.remove('hot'));
      // 逐个点亮下一组信号
      next.hot.forEach((idx,j)=> setTimeout(()=>chips[idx].classList.add('hot'), 350*j) );
      setTimeout(()=>{ lens.classList.add('pulse'); }, 1300);
      setTimeout(()=>{ insight.classList.add('swap'); }, 1750);
      setTimeout(()=>{
        k = (k+1) % insights.length;
        show(insights[k]);
        insight.classList.remove('swap');
        lens.classList.remove('pulse');
      }, 2350);
    }, 7600);
  })();

  /* ===== 匹配飞轮 ===== */
  (function(){
    const seq = [
      {tt:'General industrial equipment, standing offer renewal', rg:'Texas · closes in 40 days', sc:34, v:'n'},
      {tt:'HVAC and air treatment equipment, school district', rg:'Ontario · closes in 12 days', sc:61, v:'n'},
      {tt:'Compressed air system, naval yard maintenance', rg:'SAM.gov · closes in 34 days', sc:88, v:'y'},
      {tt:'Rotary screw compressors, wastewater plant retrofit', rg:'State of Ohio · closes in 21 days', sc:93, v:'y'}
    ];
    const card = document.getElementById('fwcard'), tt = document.getElementById('fwtt'),
          rg = document.getElementById('fwrg'), sc = document.getElementById('fwsc'),
          trail = document.getElementById('trail'),
          byes = document.getElementById('fbyes'), bno = document.getElementById('fbno');
    let k = 0, busy = false, timer = null;
    const show = s =>{ tt.textContent = s.tt; rg.textContent = s.rg; sc.textContent = s.sc; };
    const stamp = v =>{
      const chip = document.createElement('span');
      chip.className = 'v ' + v; chip.textContent = v === 'y' ? '✓' : '✗';
      trail.appendChild(chip);
      requestAnimationFrame(()=>requestAnimationFrame(()=>chip.classList.add('on')));
    };
    const advance = manual =>{
      if(busy) return; busy = true;
      const cur = seq[k];
      const btn = (manual || cur.v) === 'y' ? byes : bno;
      btn.classList.add('pressed');
      stamp(manual || cur.v);
      setTimeout(()=>{
        btn.classList.remove('pressed');
        card.classList.add('swap');
        setTimeout(()=>{
          k = (k+1) % seq.length;
          if(k === 0) trail.innerHTML = '';
          show(seq[k]);
          card.classList.remove('swap');
          busy = false;
        }, 620);
      }, 650);
    };
    show(seq[0]);
    if(!reduce){
      timer = setInterval(()=>advance(null), 4200);
      const bump = v =>{ clearInterval(timer); advance(v); timer = setInterval(()=>advance(null), 4200); };
      byes.addEventListener('click', ()=>bump('y'));
      bno.addEventListener('click', ()=>bump('n'));
    } else {
      show(seq[3]);
      ['n','n','y','y'].forEach(v=>{ stamp(v); });
      trail.querySelectorAll('.v').forEach(c=>c.classList.add('on'));
    }
  })();

  /* ===== 联系表单：提交到 HubSpot Forms API =====
     注意：目录文件无法经此匿名 API 上传（需 Files API 鉴权），
     选择了文件时在成功文案中承诺回信附安全上传链接。
     TODO: 营销同意勾选需拿到 HubSpot subscriptionTypeId 后接入 legalConsentOptions。 */
  (function(){
    const HS_PORTAL = '341778708';
    const HS_FORM = '90f0e3b8-f6d7-4d19-a872-c69098bc6d91';
    const form = document.getElementById('demoform');
    if(!form) return;
    const val = id => document.getElementById(id).value.trim();
    form.addEventListener('submit', e=>{
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('input[required]').forEach(inp=>{
        const bad = !inp.value.trim() || (inp.type==='email' && !/^\S+@\S+\.\S+$/.test(inp.value));
        inp.classList.toggle('err', bad);
        if(bad) ok = false;
      });
      if(!ok) return;
      const btn = form.querySelector('button[type=submit]');
      const label = btn.querySelector('span');
      label.textContent = 'Sending...';
      btn.disabled = true;
      const hutk = (document.cookie.match(/hubspotutk=([^;]+)/) || [])[1];
      const payload = {
        fields: [
          {name:'firstname', value: val('cf-fname')},
          {name:'lastname', value: val('cf-lname')},
          {name:'company', value: val('cf-company')},
          {name:'email', value: val('cf-email')},
          {name:'phone', value: val('cf-phone')}
        ],
        context: Object.assign({pageUri: location.href, pageName: document.title}, hutk ? {hutk} : {})
      };
      fetch('https://api.hsforms.com/submissions/v3/integration/submit/'+HS_PORTAL+'/'+HS_FORM, {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
      }).then(r=>{
        if(!r.ok) throw new Error('submit failed');
        const hasFiles = document.getElementById('cf-file').files.length > 0;
        if(hasFiles) document.querySelector('#cdone p').textContent =
          "We'll reply within one business day with demo times and a secure link for your catalogue.";
        form.closest('.cform').classList.add('sent');
      }).catch(()=>{
        label.textContent = 'Book a demo';
        btn.disabled = false;
        let err = document.getElementById('cerr');
        if(!err){
          err = document.createElement('p');
          err.id = 'cerr';
          err.style.cssText = 'margin-top:12px;font-size:13.5px;color:#d4441e;text-align:center';
          err.textContent = "Something went wrong sending the form. Call us at +1 (925) 770-4587 and we'll set it up by phone.";
          form.appendChild(err);
        }
      });
    });
    form.querySelectorAll('input').forEach(inp=> inp.addEventListener('input', ()=>inp.classList.remove('err')) );
    // 目录上传：显示已选文件名
    const file = document.getElementById('cf-file'), drop = document.getElementById('drop'), names = document.getElementById('dropnames');
    file.addEventListener('change', ()=>{
      const fs = [...file.files].map(f=>f.name);
      drop.classList.toggle('hasfiles', fs.length > 0);
      names.textContent = fs.length ? ': ' + fs.join(', ') : ' and Ollie starts scoring tenders against it from day one.';
    });
  })();
})();
