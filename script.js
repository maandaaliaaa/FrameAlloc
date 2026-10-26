const colors = ['#3678f6','#14a89d','#f5a142','#8a67e8','#e66b76','#38a3d5'];
const defaultProcesses = [
  {id:1, pages:10, priority:3, working:4},
  {id:2, pages:20, priority:2, working:8},
  {id:3, pages:30, priority:1, working:12}
];
let processes = defaultProcesses.map(p=>({...p}));
let nextId = 4;
const $ = id => document.getElementById(id);
const policyLabels = {equal:'Equal allocation',proportional:'Proportional allocation',priority:'Priority-based allocation',working:'Working-set allocation'};
const policySubtitles = {equal:'An equal share for every process',proportional:'Proportional distribution across process sizes',priority:'Weighted distribution based on priority',working:'Dynamic distribution based on active working-set estimates'};
function getFrames(){return Number($('frameCount').value)}
function sharesFor(policy){
  const frames=getFrames(), n=processes.length;
  if(!n) return [];
  let weights;
  if(policy==='equal') weights=processes.map(()=>1);
  else if(policy==='priority') weights=processes.map(p=>Math.max(1,p.priority));
  else if(policy==='working') weights=processes.map(p=>Math.max(1,p.working));
  else weights=processes.map(p=>Math.max(0,p.pages));
  let sum=weights.reduce((a,b)=>a+b,0);
  if(sum===0){weights=processes.map(()=>1);sum=n;}
  const exact=weights.map(w=>frames*w/sum);
  const out=exact.map(Math.floor);
  let remaining=frames-out.reduce((a,b)=>a+b,0);
  const order=exact.map((v,i)=>({i,frac:v-Math.floor(v)})).sort((a,b)=>b.frac-a.frac||a.i-b.i);
  for(let i=0;i<remaining;i++) out[order[i%order.length].i]++;
  return out;
}
function renderProcessInputs(){
  $('processList').innerHTML=processes.map((p,i)=>`
    <div class="process-row">
      <div class="process-badge" style="background:${colors[i%colors.length]}19;color:${colors[i%colors.length]}">P${i+1}</div>
      <div class="process-meta"><strong>Process ${i+1}</strong><small>${p.pages} pages · priority ${p.priority}</small></div>
      <input type="number" min="0" max="9999" value="${p.pages}" aria-label="Pages required for process ${i+1}" data-id="${p.id}" data-field="pages">
      <button class="remove-process" title="Remove process" data-remove="${p.id}" ${processes.length<=1?'disabled':''}>×</button>
    </div>`).join('');
  $('processList').querySelectorAll('input').forEach(input=>input.addEventListener('change',e=>{
    const p=processes.find(x=>x.id===Number(e.target.dataset.id)); if(p)p.pages=Math.max(0,Number(e.target.value)||0); renderAll();
  }));
  $('processList').querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{
    if(processes.length>1){processes=processes.filter(p=>p.id!==Number(btn.dataset.remove));renderAll();}
  }));
}
function renderResults(){
  const policy=$('algorithm').value, frames=getFrames(), alloc=sharesFor(policy);
  const allocated=alloc.reduce((a,b)=>a+b,0), usedPct=frames?Math.round(allocated/frames*100):0;
  $('metricFrames').textContent=frames; $('metricProcesses').textContent=processes.length;
  $('metricAllocated').innerHTML=`${allocated} <small>/ ${frames}</small>`;
  $('metricUtil').innerHTML=`${usedPct}<span class="unit">%</span>`;
  $('utilBar').style.width=usedPct+'%'; $('frameCountLabel').textContent=frames;
  $('policyName').textContent=policyLabels[policy]; $('resultSubtitle').textContent=policySubtitles[policy];
  $('unusedFrames').textContent=(frames-allocated)+' frames';
  $('distributionText').textContent=({equal:'Equal share',proportional:'Size weighted',priority:'Priority weighted',working:'Working-set weighted'})[policy];
  $('allocationList').innerHTML=processes.map((p,i)=>{
    const pct=frames?alloc[i]/frames*100:0;
    return `<div class="allocation-item"><div class="allocation-meta"><div class="allocation-name"><i style="background:${colors[i%colors.length]}"></i>P${i+1}<small>${p.pages} pages</small></div><span>${alloc[i]} <small>frames · ${pct.toFixed(1)}%</small></span></div><div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${colors[i%colors.length]}"></div></div></div>`;
  }).join('');
  const blocks=[]; alloc.forEach((a,i)=>{for(let j=0;j<a;j++)blocks.push(`<div class="frame-cell" style="background:${colors[i%colors.length]}" title="Frame ${blocks.length}: Process P${i+1}"></div>`)}); 
  for(let i=0;i<frames-allocated;i++)blocks.push(`<div class="frame-cell free" title="Free frame"></div>`);
  $('frameMap').innerHTML=blocks.join('');
  $('resultNote').textContent=policy==='equal'?'Equal allocation gives every process the same share, regardless of its page count.':policy==='proportional'?'Proportional allocation uses each process size as its weight. Integer rounding uses the largest-remainder method.':policy==='priority'?'Priority weights affect the share; larger weights receive more frames. This demo uses higher numbers to indicate higher priority.':'Working-set allocation uses the estimated active working-set size as its weight. This is a simplified research extension.';
}
function renderComparison(){
  const frames=getFrames(), all={equal:sharesFor('equal'),proportional:sharesFor('proportional'),priority:sharesFor('priority'),working:sharesFor('working')};
  $('comparisonBody').innerHTML=processes.map((p,i)=>`<tr><td>P${i+1}</td><td>${p.pages}</td><td>${all.equal[i]}</td><td>${all.proportional[i]}</td><td>${all.priority[i]}</td><td>${all.working[i]}</td></tr>`).join('');
  $('comparisonFoot').innerHTML=`<tr><td>TOTAL</td><td>${processes.reduce((s,p)=>s+p.pages,0)}</td><td>${all.equal.reduce((a,b)=>a+b,0)}</td><td>${all.proportional.reduce((a,b)=>a+b,0)}</td><td>${all.priority.reduce((a,b)=>a+b,0)}</td><td>${all.working.reduce((a,b)=>a+b,0)}</td></tr>`;
  $('insightTitle').textContent=`${policyLabels[$('algorithm').value]} selected`;
  const vals=all[$('algorithm').value];
  $('insightText').textContent=`With ${frames} available frames, ${processes.map((p,i)=>`P${i+1} receives ${vals[i]}`).join(', ')}. All policies allocate the frame pool using integer shares; the distribution rule is what changes.`;
}
function renderAll(){renderProcessInputs();renderResults();renderComparison();}
$('algorithm').addEventListener('change',renderAll);
$('frameCount').addEventListener('input',renderAll);
$('runBtn').addEventListener('click',()=>{renderAll();$('runBtn').textContent='✓ Allocation recalculated';setTimeout(()=>$('runBtn').textContent='▶ Run allocation simulation',1100)});
$('addProcess').addEventListener('click',()=>{
  if(processes.length>=6){alert('For this demo, the maximum is 6 processes.');return}
  processes.push({id:nextId++,pages:10,priority:1,working:4});renderAll();
});
$('resetBtn').addEventListener('click',()=>{
  processes=defaultProcesses.map(p=>({...p}));nextId=4;$('frameCount').value=32;$('algorithm').value='proportional';renderAll();
});
document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  if(btn.dataset.view==='comparison')$('comparisonSection').scrollIntoView({behavior:'smooth',block:'start'});
  else if(btn.dataset.view==='research')$('researchSection').scrollIntoView({behavior:'smooth',block:'start'});
  else window.scrollTo({top:0,behavior:'smooth'});
}));
renderAll();
