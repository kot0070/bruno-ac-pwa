(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  if(root)root.BrunoServiceJournalUX=api;
  if(typeof document!=='undefined')api.init();
})(typeof self!=='undefined'?self:this,function(){
'use strict';

function friendlyTaxSummary(code,label,effective){
  var parts=[];
  code=String(code||'').trim();label=String(label||'').trim();effective=String(effective||'').trim();
  if(code)parts.push(code);
  else if(label)parts.push(label);
  if(effective)parts.push('Effective '+effective);
  return parts.length?parts.join(' · '):'Tap to review rates';
}

function init(){
  function $(id){return document.getElementById(id)}
  var panel=$('panel-dispatch');
  if(!panel||panel.classList.contains('sj-enhanced'))return;

  var cards=Array.prototype.slice.call(panel.querySelectorAll(':scope > .card'));
  var taxCard=cards.find(function(c){var h=c.querySelector('h3');return !!(h&&/^Tax settings/i.test(h.textContent.trim()))});
  var dayCard=cards.find(function(c){return !!c.querySelector('#disp-date')});
  var callsCard=cards.find(function(c){return !!c.querySelector('#disp-table')});
  if(!taxCard||!dayCard||!callsCard)return;

  panel.classList.add('sj-enhanced');

  var head=panel.querySelector(':scope > .panel-head');
  if(head){
    var title=head.querySelector('h2');var hint=head.querySelector('.hint');
    if(title)title.textContent='Service Call Journal';
    if(hint)hint.textContent='Daily calls · hours · gross · estimated net';
  }
  var intro=panel.querySelector(':scope > .section-help');
  if(intro){
    intro.classList.add('sj-intro');
    intro.innerHTML='<strong>Daily field journal:</strong> choose the day, add service calls, and review hours and pay. Tax settings stay available below when you need them.';
  }

  var style=document.createElement('style');
  style.textContent=''
    +'.sj-enhanced{padding-bottom:1.25rem}'
    +'.sj-enhanced>.panel-head{margin-bottom:.55rem}'
    +'.sj-enhanced>.panel-head h2{font-size:1.45rem}'
    +'.sj-intro{margin:.1rem 0 1rem!important;padding:.65rem .8rem!important}'
    +'.sj-day-card{border-color:#355374;background:linear-gradient(180deg,#1d2a3a,#1a222d)}'
    +'.sj-day-card>h3{margin-bottom:.65rem}'
    +'.sj-day-card .toolbar{align-items:center!important}'
    +'.sj-day-card #disp-prev,.sj-day-card #disp-next,.sj-day-card #disp-today{min-height:44px}'
    +'.sj-primary-action{width:100%;min-height:54px;font-size:1rem;margin:.25rem 0 .85rem}'
    +'.sj-calls-card>h3{display:flex;align-items:baseline;gap:.45rem;flex-wrap:wrap;margin-bottom:.7rem}'
    +'.sj-calls-card .toolbar{justify-content:flex-end;margin-bottom:.55rem}'
    +'.sj-calls-card #disp-add{display:none}'
    +'.sj-empty-note{display:none;margin:.65rem 0;padding:.9rem;border:1px dashed var(--border);border-radius:10px;color:var(--text-muted);text-align:center}'
    +'.sj-empty-note.show{display:block}'
    +'.sj-tax-wrap{margin-top:.25rem;border:1px solid var(--border);border-radius:10px;background:#171f2a;overflow:hidden}'
    +'.sj-tax-wrap>summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:.75rem;min-height:52px;padding:.75rem 1rem;font-weight:700}'
    +'.sj-tax-wrap>summary::-webkit-details-marker{display:none}'
    +'.sj-tax-title{display:flex;align-items:center;gap:.5rem}'
    +'.sj-tax-meta{color:var(--text-muted);font-size:.78rem;font-weight:600;text-align:right}'
    +'.sj-tax-wrap[open]>summary{border-bottom:1px solid var(--border)}'
    +'.sj-tax-wrap .card{margin:0;border:0;border-radius:0;box-shadow:none;background:transparent}'
    +'.sj-tax-wrap .card>h3{display:none}'
    +'.sj-tax-wrap .section-help{font-size:.8rem;margin:.2rem 0 .8rem!important}'
    +'.sj-enhanced #disp-day-totals{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.55rem;margin-top:.8rem}'
    +'.sj-enhanced #disp-day-totals .stat{min-width:0;padding:.7rem .75rem;border:1px solid var(--border);border-radius:9px;background:#111923}'
    +'.sj-enhanced #disp-day-totals .lbl{font-size:.68rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.03em}'
    +'.sj-enhanced #disp-day-totals .val{font-size:1.05rem;font-weight:800;margin-top:.15rem}'
    +'.sj-enhanced #disp-day-totals .val.big{color:var(--success);font-size:1.15rem}'
    +'@media(max-width:720px){'
      +'.sj-enhanced>.panel-head{display:block}.sj-enhanced>.panel-head .hint{display:block;margin-top:.2rem}'
      +'.sj-enhanced #disp-day-totals{grid-template-columns:repeat(2,minmax(0,1fr))}'
      +'.sj-day-card .toolbar{display:grid!important;grid-template-columns:44px minmax(0,1fr) 44px;gap:.5rem!important}'
      +'.sj-day-card #disp-prev{grid-column:1}.sj-day-card .field:has(#disp-date){grid-column:2}.sj-day-card #disp-next{grid-column:3}.sj-day-card #disp-today{grid-column:1/4;width:100%}'
      +'.sj-day-card .field:has(#disp-weekday){display:none}'
      +'.sj-day-card #disp-week{margin-top:.65rem;overflow-x:auto}'
      +'.sj-calls-card .table-wrap{overflow:visible!important}'
      +'.sj-calls-card #disp-table{display:block;width:100%;min-width:0}'
      +'.sj-calls-card #disp-table thead{display:none}'
      +'.sj-calls-card #disp-table tbody{display:grid;gap:.7rem}'
      +'.sj-calls-card #disp-table tr[data-i]{display:grid;grid-template-columns:1fr 1fr;gap:.55rem .65rem;padding:.75rem;border:1px solid var(--border);border-radius:10px;background:#111923}'
      +'.sj-calls-card #disp-table td{display:block;padding:0;border:0;min-width:0}'
      +'.sj-calls-card #disp-table td::before{display:block;margin-bottom:.2rem;color:var(--text-muted);font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.03em}'
      +'.sj-calls-card #disp-table td:nth-child(1)::before{content:"Time"}.sj-calls-card #disp-table td:nth-child(2)::before{content:"Hours"}'
      +'.sj-calls-card #disp-table td:nth-child(3){grid-column:1/3}.sj-calls-card #disp-table td:nth-child(3)::before{content:"Address"}'
      +'.sj-calls-card #disp-table td:nth-child(4){grid-column:1/3}.sj-calls-card #disp-table td:nth-child(4)::before{content:"Description"}'
      +'.sj-calls-card #disp-table td:nth-child(5)::before{content:"Gross"}.sj-calls-card #disp-table td:nth-child(6)::before{content:"Tax %"}'
      +'.sj-calls-card #disp-table td:nth-child(7)::before{content:"Estimated net"}.sj-calls-card #disp-table td:nth-child(8)::before{content:"Status"}'
      +'.sj-calls-card #disp-table td:nth-child(9){grid-column:1/3;text-align:right}'
      +'.sj-calls-card #disp-table input,.sj-calls-card #disp-table select{width:100%;min-height:44px}'
      +'.sj-calls-card #disp-table .num-cell{display:flex;flex-direction:column;justify-content:center;font-weight:800;font-size:1rem}'
      +'.sj-tax-meta{max-width:55%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    +'}';
  document.head.appendChild(style);

  dayCard.classList.add('sj-day-card');
  callsCard.classList.add('sj-calls-card');
  var dayH=dayCard.querySelector('h3');if(dayH)dayH.textContent='Day';
  var callsH=callsCard.querySelector('h3');if(callsH&&callsH.firstChild)callsH.firstChild.nodeValue='Service Calls ';

  var add=document.createElement('button');
  add.type='button';add.id='sjAddCall';add.className='btn btn-primary sj-primary-action';add.textContent='+ Add Service Call';
  var callsToolbar=callsCard.querySelector('.toolbar');
  callsCard.insertBefore(add,callsToolbar||callsCard.children[1]||null);
  add.addEventListener('click',function(){var original=$('disp-add');if(original)original.click()});

  var empty=document.createElement('div');empty.id='sjEmpty';empty.className='sj-empty-note';empty.textContent='No service calls logged for this day yet. Tap Add Service Call to start.';
  var tableWrap=callsCard.querySelector('.table-wrap');if(tableWrap)callsCard.insertBefore(empty,tableWrap);

  var taxWrap=document.createElement('details');taxWrap.id='sjTaxSettings';taxWrap.className='sj-tax-wrap';
  var taxSummary=document.createElement('summary');taxSummary.innerHTML='<span class="sj-tax-title">⚙ Tax Settings</span><span class="sj-tax-meta" id="sjTaxMeta">Tap to review rates</span>';
  taxCard.parentNode.insertBefore(taxWrap,taxCard);taxWrap.appendChild(taxSummary);taxWrap.appendChild(taxCard);

  var anchor=intro||head;
  if(anchor&&anchor.parentNode){
    anchor.parentNode.insertBefore(dayCard,anchor.nextSibling);
    anchor.parentNode.insertBefore(callsCard,dayCard.nextSibling);
    anchor.parentNode.appendChild(taxWrap);
  }

  function updateEmpty(){
    var body=$('disp-table')&&$('disp-table').querySelector('tbody');
    var count=body?body.querySelectorAll('tr[data-i]').length:0;
    empty.classList.toggle('show',count===0);
  }
  function fieldValueByLabel(pattern){
    var fields=taxCard.querySelectorAll('.field');
    for(var i=0;i<fields.length;i++){
      var label=fields[i].querySelector('label');if(!label||!pattern.test(label.textContent))continue;
      var input=fields[i].querySelector('input,select,textarea,.readonly-val');
      return input?(input.value!=null?input.value:input.textContent):'';
    }
    return '';
  }
  function updateTaxMeta(){
    var code=fieldValueByLabel(/state\s*\/\s*jurisdiction code|jurisdiction code/i);
    var label=fieldValueByLabel(/jurisdiction label/i);
    var effective=fieldValueByLabel(/effective combined/i);
    var meta=$('sjTaxMeta');if(meta)meta.textContent=friendlyTaxSummary(code,label,effective);
  }
  function refresh(){updateEmpty();updateTaxMeta()}

  panel.addEventListener('input',function(e){if(taxCard.contains(e.target))updateTaxMeta()});
  panel.addEventListener('change',function(e){if(taxCard.contains(e.target))updateTaxMeta();if(callsCard.contains(e.target))updateEmpty()});
  var tbody=$('disp-table')&&$('disp-table').querySelector('tbody');
  if(tbody)new MutationObserver(updateEmpty).observe(tbody,{childList:true});
  var totals=$('disp-day-totals');if(totals)new MutationObserver(updateTaxMeta).observe(totals,{childList:true,subtree:true});
  refresh();
}

return {friendlyTaxSummary:friendlyTaxSummary,init:init};
});
