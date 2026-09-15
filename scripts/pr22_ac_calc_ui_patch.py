from pathlib import Path

ROOT = Path('.')

def replace_once(path, old, new):
    p = ROOT / path
    s = p.read_text()
    if old not in s:
        raise SystemExit(f'expected block not found in {path}: {old[:120]!r}')
    p.write_text(s.replace(old, new, 1))

replace_once('ac-calculator.js',
"function money(n){return '$'+(Number(n)||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}",
"function finiteValue(n){if(n===null||n===undefined||n===''||n===E.INVALID_FINANCIAL)return null;var x=Number(n);return Number.isFinite(x)?x:null}\nfunction money(n){var x=finiteValue(n);return x===null?'—':'$'+x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}\nfunction pct(n){var x=finiteValue(n);return x===null?'—':(x*100).toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:1})+'%'}\nfunction priceSource(s){if(s==='catalog-customer-price')return 'Catalog Customer Price';if(s==='catalog-your-cost')return 'Catalog Your Cost';if(s==='customer-price-fallback')return 'Customer Price fallback';if(s==='invalid')return 'Invalid';return 'Manual review'}")

old_render = """function renderBom(){
  var html='';
  bom.forEach(function(b,idx){
    var flags=[];if(b.manualDuplicate)flags.push('<span class=\"flag warn\">manual duplicate</span>');if(!b.resolved)flags.push('<span class=\"flag danger\">needs review</span>');if(b.matchMode==='packaged-length')flags.push('<span class=\"flag\">packaged length</span>');
    html+='<tr class=\"'+(!b.resolved?'row-unresolved':'')+'\"><td class=\"sel\"><label class=\"tapcheck\"><input type=\"checkbox\" class=\"bomsel\" data-i=\"'+idx+'\" '+(b.selected?'checked':'')+'><span></span></label></td><td><strong>'+esc(b.label)+'</strong>'+flags.join('')+'<div class=\"muted\">'+esc(b.reason)+'</div><div class=\"mobile-detail\">'+esc(b.note||'')+'</div></td><td class=\"col-level\"><span class=\"status '+esc(b.level)+'\">'+esc(b.level)+'</span></td><td class=\"num\">'+esc(b.qty)+'</td><td>'+esc(b.units)+'</td><td class=\"col-match\"><span class=\"'+(b.resolved?'resolved':'unresolved')+'\">'+(b.resolved?'Catalog match':'Unresolved')+'</span><div>'+esc(b.item)+'</div><div class=\"muted\">'+esc(b.part||'')+'</div><div class=\"muted\">'+esc(b.note||'')+'</div></td><td class=\"num col-money\">'+money(b.unitCost)+'</td><td class=\"num col-money\">'+money((Number(b.qty)||0)*(Number(b.unitCost)||0))+'</td><td class=\"col-ref\">'+esc(b.code||'')+'</td></tr>';
  });
  $('bomBody').innerHTML=html||'<tr><td colspan=\"9\">No generated items.</td></tr>';updateTotals();
}
function updateTotals(){
  var selected=bom.filter(function(b){return b.selected!==false});var blocked=E.blockingRows(selected);
  $('statLines').textContent=selected.length;$('statResolved').textContent=selected.filter(function(b){return b.resolved}).length+'/'+selected.length;$('statCost').textContent=money(E.totalBomCost(selected));$('statWarnings').textContent=((scope&&scope.warnings)||[]).length;
  var gate=$('applyGate');if(gate){gate.textContent=blocked.length?(blocked.length+' selected item(s) need review / $0 confirmation before Apply'):'Ready to apply selected BOM';gate.className='gate '+(blocked.length?'warn':'ok')}
}
"""
new_render = """function renderBom(){
  var html='';
  bom.forEach(function(b,idx){
    var flags=[];if(b.manualDuplicate)flags.push('<span class=\"flag warn\">manual duplicate</span>');if(!b.resolved)flags.push('<span class=\"flag danger\">needs review</span>');if(b.financialInvalid)flags.push('<span class=\"flag danger\">invalid price</span>');if(b.zeroPriceReview)flags.push('<span class=\"flag warn\">$0 review</span>');if(b.matchMode==='packaged-length')flags.push('<span class=\"flag\">packaged length</span>');
    var rowClass=!b.resolved?'row-unresolved':(b.financialInvalid?'row-invalid-financial':(b.zeroPriceReview?'row-zero-review':''));
    var mobilePricing='<div class=\"pricing-detail\"><span>Customer <strong>'+money(b.customerUnitPrice)+'</strong> × '+esc(b.qty)+' = <strong>'+money(b.customerExtension)+'</strong><small>'+esc(priceSource(b.customerPriceSource))+'</small></span><span>Your Cost <strong>'+money(b.yourUnitCost)+'</strong> × '+esc(b.qty)+' = <strong>'+money(b.yourExtension)+'</strong><small>'+esc(priceSource(b.yourCostSource))+'</small></span><span>Margin <strong>'+money(b.materialMargin)+'</strong> / <strong>'+pct(b.materialMarginPct)+'</strong></span></div>';
    html+='<tr class=\"'+rowClass+'\"><td class=\"sel\"><label class=\"tapcheck\"><input type=\"checkbox\" class=\"bomsel\" data-i=\"'+idx+'\" '+(b.selected?'checked':'')+'><span></span></label></td><td><strong>'+esc(b.label)+'</strong>'+flags.join('')+'<div class=\"muted\">'+esc(b.reason)+'</div><div class=\"mobile-detail\">'+esc(b.note||'')+'</div>'+mobilePricing+'</td><td class=\"col-level\"><span class=\"status '+esc(b.level)+'\">'+esc(b.level)+'</span></td><td class=\"num\">'+esc(b.qty)+'</td><td>'+esc(b.units)+'</td><td class=\"col-match\"><span class=\"'+(b.resolved?'resolved':'unresolved')+'\">'+(b.resolved?'Catalog match':'Unresolved')+'</span><div>'+esc(b.item)+'</div><div class=\"muted\">'+esc(b.part||'')+'</div><div class=\"muted\">'+esc(b.note||'')+'</div></td><td class=\"num col-money\">'+money(b.customerUnitPrice)+'<div class=\"muted\">'+esc(priceSource(b.customerPriceSource))+'</div></td><td class=\"num col-money\">'+money(b.customerExtension)+'</td><td class=\"num col-money\">'+money(b.yourUnitCost)+'<div class=\"muted\">'+esc(priceSource(b.yourCostSource))+'</div></td><td class=\"num col-money\">'+money(b.yourExtension)+'</td><td class=\"num col-money\">'+money(b.materialMargin)+'</td><td class=\"num col-money\">'+pct(b.materialMarginPct)+'</td><td class=\"col-ref\">'+esc(b.code||'')+'</td></tr>';
  });
  $('bomBody').innerHTML=html||'<tr><td colspan=\"13\">No generated items.</td></tr>';updateTotals();
}
function updateTotals(){
  var selected=bom.filter(function(b){return b.selected!==false});var blocked=E.blockingRows(selected),hard=E.hardBlockingRows(selected),pricing=E.calculateBomPricing(selected),zeros=blocked.filter(function(b){return b.zeroPriceReview&&!b.financialInvalid&&b.resolved});
  $('statLines').textContent=selected.length;$('statResolved').textContent=selected.filter(function(b){return b.resolved}).length+'/'+selected.length;$('statCustomer').textContent=money(pricing.customerTotal);$('statYour').textContent=money(pricing.yourTotal);$('statMargin').textContent=money(pricing.marginDollar);$('statMarginPct').textContent=pct(pricing.marginPct);$('statWarnings').textContent=((scope&&scope.warnings)||[]).length;
  var gate=$('applyGate');if(gate){if(hard.length){gate.textContent=hard.length+' selected item(s) are unresolved or have invalid financial data — correct before Apply';gate.className='gate warn'}else if(zeros.length){gate.textContent=zeros.length+' selected item(s) have valid $0 pricing — review/confirm before Apply';gate.className='gate warn'}else{gate.textContent='Ready to apply selected BOM';gate.className='gate ok'}}
}
"""
replace_once('ac-calculator.js', old_render, new_render)

old_apply = """function applyToJob(){
  if(!state){alert('No valid Bruno AC job loaded.');return}if(!scope)calculate();
  bom.forEach(function(b,i){var cb=document.querySelector('.bomsel[data-i=\"'+i+'\"]');if(cb)b.selected=cb.checked});
  var blocked=E.blockingRows(bom);
  if(blocked.length){var names=blocked.map(function(b){return '• '+b.label+' ('+(b.resolved?'$0':'unresolved')+')'}).join('\\n');if(!confirm('These selected rows need manual review and may add $0 to the estimate:\\n\\n'+names+'\\n\\nPress OK only if you intentionally want to add them for later pricing.'))return;}
  var res=E.applyBomToJob(state,scope,bom);state=res.state;
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));toast('Saved '+res.added.length+' generated lines to Bruno Job Materials');renderJobInfo()}catch(e){alert('Could not save Bruno job: '+e.message)}
}
"""
new_apply = """function applyToJob(){
  if(!state){alert('No valid Bruno AC job loaded.');return}if(!scope)calculate();
  bom.forEach(function(b,i){var cb=document.querySelector('.bomsel[data-i=\"'+i+'\"]');if(cb)b.selected=cb.checked});
  var hard=E.hardBlockingRows(bom);
  if(hard.length){var invalidNames=hard.map(function(b){return '• '+b.label+' ('+(!b.resolved?'unresolved':'invalid financial data')+')'}).join('\\n');alert('Cannot Apply selected BOM until these rows are corrected:\\n\\n'+invalidNames);return;}
  var zeroRows=E.blockingRows(bom).filter(function(b){return b.zeroPriceReview});
  if(zeroRows.length){var zeroNames=zeroRows.map(function(b){return '• '+b.label}).join('\\n');if(!confirm('These selected rows contain legitimate $0 pricing and require confirmation:\\n\\n'+zeroNames+'\\n\\nApply them as $0?'))return;}
  var res=E.applyBomToJob(state,scope,bom);if(!res.ok){alert('Could not apply BOM:\\n'+(res.errors||[]).join('\\n'));return;}state=res.state;
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));toast('Saved '+res.added.length+' generated lines with Customer Price + Your Cost snapshots');renderJobInfo()}catch(e){alert('Could not save Bruno job: '+e.message)}
}
"""
replace_once('ac-calculator.js', old_apply, new_apply)

replace_once('ac-calculator.html',
"      <div class=\"summary\"><div class=\"stat\"><div class=\"k\">Selected lines</div><div class=\"v\" id=\"statLines\">0</div></div><div class=\"stat\"><div class=\"k\">Catalog resolved</div><div class=\"v\" id=\"statResolved\">0/0</div></div><div class=\"stat\"><div class=\"k\">Material estimate</div><div class=\"v\" id=\"statCost\">$0.00</div></div><div class=\"stat\"><div class=\"k\">Warnings</div><div class=\"v\" id=\"statWarnings\">0</div></div></div>",
"      <div class=\"summary\"><div class=\"stat\"><div class=\"k\">Selected lines</div><div class=\"v\" id=\"statLines\">0</div></div><div class=\"stat\"><div class=\"k\">Catalog resolved</div><div class=\"v\" id=\"statResolved\">0/0</div></div><div class=\"stat\"><div class=\"k\">Customer Materials</div><div class=\"v\" id=\"statCustomer\">—</div></div><div class=\"stat\"><div class=\"k\">Your Material Cost</div><div class=\"v\" id=\"statYour\">—</div></div><div class=\"stat\"><div class=\"k\">Material Margin</div><div class=\"v\" id=\"statMargin\">—</div></div><div class=\"stat\"><div class=\"k\">Material Margin %</div><div class=\"v\" id=\"statMarginPct\">—</div></div><div class=\"stat\"><div class=\"k\">Warnings</div><div class=\"v\" id=\"statWarnings\">0</div></div></div>")
replace_once('ac-calculator.html',
"      <div class=\"tablewrap\"><table><thead><tr><th>Add</th><th>Requirement</th><th class=\"col-level\">Level</th><th>Qty</th><th>Unit</th><th class=\"col-match\">Catalog result</th><th class=\"col-money\">Unit $</th><th class=\"col-money\">Ext $</th><th class=\"col-ref\">Reference</th></tr></thead><tbody id=\"bomBody\"></tbody></table></div>",
"      <div class=\"tablewrap\"><table><thead><tr><th>Add</th><th>Requirement</th><th class=\"col-level\">Level</th><th>Qty</th><th>Unit</th><th class=\"col-match\">Catalog result</th><th class=\"col-money\">Customer Unit</th><th class=\"col-money\">Customer Ext.</th><th class=\"col-money\">Your Unit</th><th class=\"col-money\">Your Ext.</th><th class=\"col-money\">Margin $</th><th class=\"col-money\">Margin %</th><th class=\"col-ref\">Reference</th></tr></thead><tbody id=\"bomBody\"></tbody></table></div>")
replace_once('ac-calculator.html',
"      <p class=\"muted\">Manual Job Materials are never deleted. Matching manual SKU/item rows are detected and generated duplicates are unchecked by default. Re-running Apply replaces only AC Calculator-generated rows.</p>",
"      <p class=\"muted\">Customer Price feeds quote-side Job Materials. Your Cost becomes the procurement snapshot used by Job Profitability until an Actual purchase cost is entered. Manual Job Materials are never deleted. Re-running Apply intentionally rebuilds only AC Calculator-generated rows from current Catalog pricing.</p>")

replace_once('ac-calculator.css',
".mobile-detail{display:none;color:var(--muted);font-size:12px;margin-top:4px}",
".mobile-detail{display:none;color:var(--muted);font-size:12px;margin-top:4px}.pricing-detail{display:none}.row-invalid-financial{background:#28181b88}.row-zero-review{background:#2a241455}")
replace_once('ac-calculator.css',
".col-money{display:none}.mobile-detail{display:block}.num{text-align:left}",
".col-money{display:none}.mobile-detail{display:block}.pricing-detail{display:grid;gap:5px;margin-top:8px;padding-top:7px;border-top:1px solid var(--line);color:var(--muted);font-size:12px}.pricing-detail span{display:block}.pricing-detail small{display:block;color:var(--muted)}.num{text-align:left}")
replace_once('ac-calculator.css', 'table{border-collapse:collapse;width:100%;min-width:900px}', 'table{border-collapse:collapse;width:100%;min-width:1280px}')
replace_once('sw.js', "const CACHE = 'bruno-ac-v31';", "const CACHE = 'bruno-ac-v32';")
