(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  if(root)root.BrunoACReviewUX=api;
  if(typeof document!=='undefined')api.init();
})(typeof self!=='undefined'?self:this,function(){
'use strict';

function deriveReviewState(items){
  items=Array.isArray(items)?items:[];
  var selected=items.filter(function(x){return x&&x.selected!==false});
  var unresolved=selected.filter(function(x){return !!x.unresolved});
  var invalid=selected.filter(function(x){return !x.unresolved&&!!x.invalid});
  var zero=selected.filter(function(x){return !x.unresolved&&!x.invalid&&!!x.zero});
  var hard=unresolved.length+invalid.length;
  var ready=selected.length-hard-zero.length;
  var mode=hard?'action-required':(zero.length?'review-required':'ready');
  return {
    mode:mode,
    selected:selected.length,
    ready:ready,
    attention:hard+zero.length,
    hard:hard,
    unresolved:unresolved.length,
    invalid:invalid.length,
    zero:zero.length
  };
}

function init(){
  function $(id){return document.getElementById(id)}
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}

  var status=$('phase1CalcState');
  var result=$('calcExplain');
  var bomBody=$('bomBody');
  var applyBtn=$('phase1Apply');
  var mainApply=$('apply');
  if(!status||!result||!bomBody)return;

  var style=document.createElement('style');
  style.textContent=''
    +'.calc-state.action-required{border-color:#8b6b20;background:#2a2414;color:#ffe08a}'
    +'.calc-state.review-required{border-color:#7d6a2a;background:#252113;color:#ffe6a3}'
    +'.review-preview-note{margin:10px 0 0;padding:10px 12px;border:1px solid #385679;border-radius:8px;background:#101c2a;color:#c8d8ed;font-weight:700}'
    +'.review-attention{display:none;margin:12px 0;border:1px solid #8b6b20;border-radius:10px;background:#201c12;overflow:hidden}'
    +'.review-attention.show{display:block}'
    +'.review-attention-head{padding:10px 12px;border-bottom:1px solid #6d581f;font-weight:800;color:#ffe08a}'
    +'.review-attention-list{display:grid;gap:8px;padding:10px}'
    +'.review-issue{border:1px solid var(--line);border-radius:8px;background:#121a24;padding:10px}'
    +'.review-issue strong{display:block;margin-bottom:3px}'
    +'.review-issue .issue-type{font-size:12px;font-weight:800;color:#ffe08a}'
    +'.review-issue .issue-help{margin-top:3px;color:var(--muted);font-size:12px}'
    +'.review-issue-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}'
    +'.review-issue-actions button{min-height:36px;border:1px solid var(--line);border-radius:7px;background:#202b38;color:var(--text);padding:6px 10px;font-weight:700}'
    +'.review-ref-details{margin-top:12px;border:1px solid var(--line);border-radius:9px;background:#101923}'
    +'.review-ref-details>summary{cursor:pointer;padding:10px 12px;font-weight:800;list-style:none}'
    +'.review-ref-details>summary::-webkit-details-marker{display:none}'
    +'.review-ref-body{padding:0 12px 10px}'
    +'.row-review-status{display:inline-flex;margin:6px 0 0;padding:3px 7px;border-radius:999px;border:1px solid var(--line);font-size:11px;font-weight:800}'
    +'.row-review-status.ready{color:#8ce6bd;border-color:#277b5c}'
    +'.row-review-status.warn{color:#ffe08a;border-color:#8b6b20}'
    +'.row-review-help{margin-top:4px;color:var(--muted);font-size:12px}'
    +'.stat-reason{margin-top:4px;color:#ffe08a;font-size:11px;line-height:1.25}'
    +'.calc-explain-grid.review-counts{grid-template-columns:repeat(4,minmax(0,1fr));margin-top:10px}'
    +'.review-count-box{border:1px solid var(--line);border-radius:9px;background:#101923;padding:9px 10px}'
    +'.review-count-box .k{font-size:10px;color:var(--muted);text-transform:uppercase;font-weight:800}'
    +'.review-count-box .v{font-size:18px;font-weight:800}'
    +'@media(max-width:560px){.calc-explain-grid.review-counts{grid-template-columns:repeat(2,minmax(0,1fr))}.review-issue-actions button{flex:1 1 auto}}';
  document.head.appendChild(style);

  var flow=result.querySelector('.calc-flow');
  if(flow&&!$('reviewPreviewNote')){
    var preview=document.createElement('div');
    preview.id='reviewPreviewNote';
    preview.className='review-preview-note';
    preview.textContent='Preview only — Calculate does not change Job Materials. Selected materials are saved only when you press Add selected materials to Job.';
    flow.parentNode.insertBefore(preview,flow.nextSibling);
  }

  if(!$('reviewCounts')){
    var counts=document.createElement('div');
    counts.id='reviewCounts';counts.className='calc-explain-grid review-counts';
    counts.innerHTML='<div class="review-count-box"><div class="k">Generated</div><div class="v" id="reviewGenerated">0</div></div>'
      +'<div class="review-count-box"><div class="k">Selected</div><div class="v" id="reviewSelected">0</div></div>'
      +'<div class="review-count-box"><div class="k">Ready</div><div class="v" id="reviewReady">0</div></div>'
      +'<div class="review-count-box"><div class="k">Needs attention</div><div class="v" id="reviewAttention">0</div></div>';
    var grid=result.querySelector('.calc-explain-grid');
    if(grid)grid.parentNode.insertBefore(counts,grid.nextSibling);
  }

  if(!$('reviewAttentionPanel')){
    var panel=document.createElement('section');
    panel.id='reviewAttentionPanel';panel.className='review-attention';
    panel.innerHTML='<div class="review-attention-head" id="reviewAttentionHead">What needs attention</div><div class="review-attention-list" id="reviewAttentionList"></div>';
    var countsEl=$('reviewCounts');
    if(countsEl)countsEl.parentNode.insertBefore(panel,countsEl.nextSibling);
  }

  if(!$('reviewReferenceDetails')){
    var h3=Array.prototype.slice.call(result.querySelectorAll('h3')).find(function(n){return /Why \/ references used/i.test(n.textContent)});
    var list=$('calcRefList');
    if(h3&&list){
      var details=document.createElement('details');details.id='reviewReferenceDetails';details.className='review-ref-details';
      var summary=document.createElement('summary');summary.textContent='Code / OEM references';
      var body=document.createElement('div');body.className='review-ref-body';
      h3.parentNode.insertBefore(details,h3);details.appendChild(summary);details.appendChild(body);body.appendChild(h3);body.appendChild(list);
    }
  }

  function rows(){return Array.prototype.slice.call(bomBody.querySelectorAll('tr')).filter(function(r){return r.querySelector('.bomsel')})}
  function rowModel(row){
    var cb=row.querySelector('.bomsel');
    return {row:row,selected:!!(cb&&cb.checked),unresolved:row.classList.contains('row-unresolved'),invalid:row.classList.contains('row-invalid-financial'),zero:row.classList.contains('row-zero-review')};
  }
  function labelFor(row){var c=row.children[1];var s=c&&c.querySelector('strong');return (s?s.textContent:(c?c.textContent:'BOM item')).trim()}
  function issueFor(m){
    if(m.unresolved)return {type:'Unresolved catalog match',help:'Match this requirement to a Catalog item or deselect it before Apply.'};
    if(m.invalid)return {type:'Invalid financial data',help:'Fix Customer Price / Your Cost in Catalog or Margins before Apply.'};
    if(m.zero)return {type:'Valid $0 pricing — review required',help:'This is allowed, but requires confirmation before Apply.'};
    return {type:'Ready',help:'Catalog match and pricing are ready.'};
  }

  function decorateRows(models){
    models.forEach(function(m,idx){
      var cell=m.row.children[1];if(!cell)return;
      var issue=issueFor(m);var pill=cell.querySelector('.row-review-status');var help=cell.querySelector('.row-review-help');
      if(!pill){pill=document.createElement('div');pill.className='row-review-status';cell.appendChild(pill)}
      if(!help){help=document.createElement('div');help.className='row-review-help';cell.appendChild(help)}
      pill.className='row-review-status '+((m.unresolved||m.invalid||m.zero)?'warn':'ready');pill.textContent=issue.type;
      help.textContent=issue.help;m.row.dataset.reviewIndex=String(idx);
    });
  }

  function setFinancialReasons(state){
    ['statCustomer','statYour','statMargin','statMarginPct'].forEach(function(id){
      var v=$(id);if(!v||!v.parentNode)return;var r=v.parentNode.querySelector('.stat-reason');
      if(state.hard){if(!r){r=document.createElement('div');r.className='stat-reason';v.parentNode.appendChild(r)}r.textContent='Blocked by '+state.hard+' selected item'+(state.hard===1?'':'s')+' needing correction.';}
      else if(r)r.remove();
    });
  }

  function renderAttention(models,state){
    var panel=$('reviewAttentionPanel'),list=$('reviewAttentionList'),head=$('reviewAttentionHead');if(!panel||!list||!head)return;
    var attention=models.filter(function(m){return m.selected&&(m.unresolved||m.invalid||m.zero)});
    if(!attention.length){panel.classList.remove('show');list.innerHTML='';return}
    panel.classList.add('show');head.textContent='What needs attention — '+attention.length+' selected item'+(attention.length===1?'':'s');
    list.innerHTML=attention.map(function(m){var issue=issueFor(m);var idx=m.row.dataset.reviewIndex;return '<div class="review-issue"><strong>'+esc(labelFor(m.row))+'</strong><div class="issue-type">'+esc(issue.type)+'</div><div class="issue-help">'+esc(issue.help)+'</div><div class="review-issue-actions"><button type="button" data-review-jump="'+idx+'">Jump to row</button><button type="button" data-review-deselect="'+idx+'">Deselect</button></div></div>'}).join('');
  }

  function sync(){
    var models=rows().map(rowModel);decorateRows(models);
    var state=deriveReviewState(models);
    var calculated=status.classList.contains('ready')||status.classList.contains('action-required')||status.classList.contains('review-required');
    if(!calculated){return}
    $('reviewGenerated').textContent=models.length;$('reviewSelected').textContent=state.selected;$('reviewReady').textContent=state.ready;$('reviewAttention').textContent=state.attention;
    var info=$('calcBomInfo'),detail=$('calcBomDetail');
    if(info)info.textContent=state.selected+' selected / '+models.length+' generated';
    if(detail)detail.textContent=state.hard?(state.hard+' selected item'+(state.hard===1?'':'s')+' block Apply'):(state.zero?(state.zero+' valid $0 item'+(state.zero===1?'':'s')+' require review'):'All selected items are ready');
    renderAttention(models,state);setFinancialReasons(state);
    var hint=$('phase1ApplyHint');
    if(state.mode==='action-required'){
      status.className='calc-state action-required';status.textContent='Calculation complete — review '+state.hard+' blocking item'+(state.hard===1?'':'s')+' before Apply.';
      if(applyBtn)applyBtn.disabled=true;if(hint){hint.textContent='Blocked — correct or deselect the items shown above.';hint.className='phase1-applyhint warn'}
    }else if(state.mode==='review-required'){
      status.className='calc-state review-required';status.textContent='Calculation complete — review '+state.zero+' valid $0 item'+(state.zero===1?'':'s')+' before Apply.';
      if(applyBtn)applyBtn.disabled=!!(mainApply&&mainApply.disabled);if(hint){hint.textContent='Review required — valid $0 pricing will ask for confirmation on Apply.';hint.className='phase1-applyhint warn'}
    }else{
      status.className='calc-state ready';status.textContent='Calculation complete — selected BOM is ready to apply.';
      if(applyBtn)applyBtn.disabled=!!(mainApply&&mainApply.disabled);if(hint){hint.textContent='Ready — review selected rows, then add them to the current Bruno job.';hint.className='phase1-applyhint'}
    }
  }

  result.addEventListener('click',function(e){
    var jump=e.target.closest('[data-review-jump]'),des=e.target.closest('[data-review-deselect]');
    if(jump){var r=rows()[Number(jump.getAttribute('data-review-jump'))];if(r)r.scrollIntoView({behavior:'smooth',block:'center'});return}
    if(des){var r2=rows()[Number(des.getAttribute('data-review-deselect'))];var cb=r2&&r2.querySelector('.bomsel');if(cb&&cb.checked){cb.checked=false;cb.dispatchEvent(new Event('change',{bubbles:true}))}}
  });

  var queued=false;function queueSync(){if(queued)return;queued=true;setTimeout(function(){queued=false;sync()},0)}
  new MutationObserver(queueSync).observe(bomBody,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  new MutationObserver(queueSync).observe(status,{attributes:true,childList:true,subtree:true,attributeFilter:['class']});
  bomBody.addEventListener('change',queueSync,true);
  if(mainApply)new MutationObserver(queueSync).observe(mainApply,{attributes:true,attributeFilter:['disabled']});
  queueSync();
}

return {deriveReviewState:deriveReviewState,init:init};
});
