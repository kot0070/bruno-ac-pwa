from pathlib import Path

core = Path('financial-integrity-core.js')
index = Path('index.html')
tests = Path('tests/financial-integrity.test.js')

c = core.read_text()
s = index.read_text()
t = tests.read_text()

# -----------------------------------------------------------------------------
# Shared executable core: strict row-level material actual-cost resolution.
# -----------------------------------------------------------------------------
anchor = """  function validateAcrCompany(company) {\n"""
insert = r'''  function resolveMaterialCost(row) {
    row = row || {};
    var qty = nonNegative(row.qty);
    if (qty === null) return { ok:false, qty:null, source:'', unitCost:null, extendedCost:null, estimateUnitCost:null, estimateExtended:null, variance:null, error:'Material quantity must be finite and nonnegative.' };

    var suppliedActual = row.actualCost !== null && row.actualCost !== undefined && row.actualCost !== '';
    var suppliedSnapshot = row.procurementCostSnapshot !== null && row.procurementCostSnapshot !== undefined && row.procurementCostSnapshot !== '';
    var source = suppliedActual ? 'actual' : (suppliedSnapshot ? 'snapshot' : 'estimate');
    var raw = suppliedActual ? row.actualCost : (suppliedSnapshot ? row.procurementCostSnapshot : row.unitCost);
    var used = nonNegative(raw);
    if (used === null) return { ok:false, qty:qty, source:source, unitCost:null, extendedCost:null, estimateUnitCost:null, estimateExtended:null, variance:null, error:'Material ' + source + ' cost must be finite and nonnegative.' };

    var estimate = nonNegative(row.unitCost);
    var extended = qty * used;
    var estimateExtended = estimate === null ? null : qty * estimate;
    var variance = estimateExtended === null ? null : extended - estimateExtended;
    return {
      ok:true,
      qty:qty,
      source:source,
      unitCost:used,
      extendedCost:extended,
      estimateUnitCost:estimate,
      estimateExtended:estimateExtended,
      variance:variance,
      error:''
    };
  }

  function reconcileMaterialCosts(rows) {
    rows = Array.isArray(rows) ? rows : [];
    var total = 0;
    var estimateTotal = 0;
    var estimateComplete = true;
    var sourceCounts = { actual:0, snapshot:0, estimate:0 };
    var details = [];
    var errors = [];
    for (var i = 0; i < rows.length; i++) {
      var r = resolveMaterialCost(rows[i]);
      var detail = {
        index:i,
        ok:r.ok,
        qty:r.qty,
        source:r.source,
        unitCost:r.unitCost,
        extendedCost:r.extendedCost,
        estimateUnitCost:r.estimateUnitCost,
        estimateExtended:r.estimateExtended,
        variance:r.variance,
        error:r.error
      };
      details.push(detail);
      if (!r.ok) {
        errors.push('Material row ' + (i + 1) + ': ' + r.error);
        continue;
      }
      sourceCounts[r.source]++;
      total += r.extendedCost;
      if (r.estimateExtended === null) estimateComplete = false;
      else estimateTotal += r.estimateExtended;
    }
    var ok = errors.length === 0;
    return {
      ok:ok,
      total:ok ? total : null,
      estimateTotal:estimateComplete ? estimateTotal : null,
      variance:ok && estimateComplete ? total - estimateTotal : null,
      estimateComplete:estimateComplete,
      sourceCounts:sourceCounts,
      rows:details,
      errors:errors
    };
  }

'''
if 'function resolveMaterialCost(row)' not in c:
    if anchor not in c:
        raise SystemExit('core insertion anchor missing')
    c = c.replace(anchor, insert + anchor, 1)

export_anchor = """    tmTotal: tmTotal,\n    validateAcrCompany: validateAcrCompany\n"""
export_new = """    tmTotal: tmTotal,\n    resolveMaterialCost: resolveMaterialCost,\n    reconcileMaterialCosts: reconcileMaterialCosts,\n    validateAcrCompany: validateAcrCompany\n"""
if export_anchor in c:
    c = c.replace(export_anchor, export_new, 1)
elif 'reconcileMaterialCosts: reconcileMaterialCosts' not in c:
    raise SystemExit('core export anchor missing')

# -----------------------------------------------------------------------------
# Normalize material actual/snapshot values persistently without synthesizing 0.
# -----------------------------------------------------------------------------
old = """      row.qty = window.BrunoFinancial.normalizePersistentFinancial(row.qty, 0);\n      row.unitCost = window.BrunoFinancial.normalizePersistentFinancial(row.unitCost, 0);\n      if (row.lastPriceUpdate == null || row.lastPriceUpdate === '') {\n"""
new = """      row.qty = window.BrunoFinancial.normalizePersistentFinancial(row.qty, 0);\n      row.unitCost = window.BrunoFinancial.normalizePersistentFinancial(row.unitCost, 0);\n      if (row.actualCost !== null && row.actualCost !== undefined && row.actualCost !== '') row.actualCost = window.BrunoFinancial.normalizePersistentFinancial(row.actualCost, 0);\n      if (row.procurementCostSnapshot !== null && row.procurementCostSnapshot !== undefined && row.procurementCostSnapshot !== '') row.procurementCostSnapshot = window.BrunoFinancial.normalizePersistentFinancial(row.procurementCostSnapshot, 0);\n      if (row.procurementCostSource == null) row.procurementCostSource = '';\n      if (row.lastPriceUpdate == null || row.lastPriceUpdate === '') {\n"""
if old not in s:
    raise SystemExit('material normalize anchor missing')
s = s.replace(old, new, 1)

# -----------------------------------------------------------------------------
# New Job Profitability material reconciliation UI.
# -----------------------------------------------------------------------------
html_anchor = """        <label style=\"display:flex;align-items:center;gap:.5rem;margin-top:.75rem;color:var(--text-muted);font-size:.9rem\">\n          <input type=\"checkbox\" id=\"pnl-mat-link\" checked /> Auto Actual Material cost hierarchy\n        </label>\n      </div>\n      <div class=\"stat-row\">\n"""
html_new = """        <label style=\"display:flex;align-items:center;gap:.5rem;margin-top:.75rem;color:var(--text-muted);font-size:.9rem\">\n          <input type=\"checkbox\" id=\"pnl-mat-link\" checked /> Auto Actual Material cost hierarchy\n        </label>\n      </div>\n      <div class=\"card\" id=\"pnl-material-reconciliation\">\n        <div class=\"panel-head\" style=\"margin-bottom:.65rem\">\n          <h3>Material Cost Reconciliation</h3>\n          <span class=\"hint\">Actual purchase → procurement snapshot → estimate fallback</span>\n        </div>\n        <p class=\"section-help\" style=\"margin-top:0\"><strong>Cost provenance:</strong> enter the actual purchased unit cost when known. Blank Actual keeps the snapshot/fallback hierarchy. Invalid supplied costs remain invalid and cannot silently become $0. Use “Refresh snapshot” only when you intentionally want the current Catalog Your Cost to replace that row’s saved procurement snapshot.</p>\n        <div class=\"note-box warn\" id=\"pnl-mat-recon-validation\" style=\"display:none\" role=\"alert\"></div>\n        <div class=\"table-wrap\">\n          <table class=\"data\" id=\"pnl-mat-recon-table\">\n            <thead><tr><th>Material</th><th>Qty</th><th>Estimate / Quote Unit</th><th>Snapshot</th><th>Actual Unit Cost</th><th>Source Used</th><th>Used Ext.</th><th>Variance vs Est.</th><th></th></tr></thead>\n            <tbody id=\"pnl-mat-recon-body\"></tbody>\n          </table>\n        </div>\n        <div class=\"stat-row\">\n          <div class=\"stat\"><div class=\"lbl\">Material used cost</div><div class=\"val\" id=\"pnl-mat-recon-used\">—</div></div>\n          <div class=\"stat\"><div class=\"lbl\">Estimate reference</div><div class=\"val\" id=\"pnl-mat-recon-est\">—</div></div>\n          <div class=\"stat\"><div class=\"lbl\">Cost variance</div><div class=\"val\" id=\"pnl-mat-recon-var\">—</div></div>\n          <div class=\"stat\"><div class=\"lbl\">Cost sources</div><div class=\"val\" id=\"pnl-mat-recon-source-counts\">—</div></div>\n        </div>\n      </div>\n      <div class=\"stat-row\">\n"""
if html_anchor not in s:
    raise SystemExit('P&L HTML insertion anchor missing')
s = s.replace(html_anchor, html_new, 1)

# -----------------------------------------------------------------------------
# Reconciliation renderer and P&L integration through shared core.
# -----------------------------------------------------------------------------
render_anchor = """  function renderPnL(calc) {\n"""
render_helper = r'''  function materialSourceLabel(source) {
    if (source === 'actual') return 'Actual purchase';
    if (source === 'snapshot') return 'Procurement snapshot';
    if (source === 'estimate') return 'Estimate fallback';
    return 'Invalid';
  }

  function renderMaterialReconciliation(recon) {
    var body = document.getElementById('pnl-mat-recon-body');
    if (!body) return;
    var rows = state.materialsUsed || [];
    var details = (recon && recon.rows) || [];
    var html = '';
    for (var i = 0; i < rows.length; i++) {
      var m = rows[i] || {};
      var d = details[i] || { ok:false, source:'', unitCost:null, extendedCost:null, estimateUnitCost:null, variance:null };
      var actualSupplied = m.actualCost !== null && m.actualCost !== undefined && m.actualCost !== '';
      var actual = actualSupplied ? nonNegativeFinancial(m.actualCost) : null;
      var snapSupplied = m.procurementCostSnapshot !== null && m.procurementCostSnapshot !== undefined && m.procurementCostSnapshot !== '';
      var snap = snapSupplied ? nonNegativeFinancial(m.procurementCostSnapshot) : null;
      var estimate = nonNegativeFinancial(m.unitCost);
      var actualInvalid = actualSupplied && actual === null;
      var snapshotInvalid = snapSupplied && snap === null;
      var label = m.item || m.part || ('Material ' + (i + 1));
      html += '<tr data-i="' + i + '"' + (!d.ok ? ' class="invalid-financial"' : '') + '>' +
        '<td><strong>' + esc(label) + '</strong><div class="hint">' + esc(m.part || '') + '</div></td>' +
        '<td class="num-cell">' + (nonNegativeFinancial(m.qty) === null ? '—' : nonNegativeFinancial(m.qty)) + '</td>' +
        '<td class="num-cell">' + safeMoney(estimate) + '</td>' +
        '<td class="num-cell">' + (snapshotInvalid ? '<span style="color:var(--danger)">INVALID</span>' : (snapSupplied ? safeMoney(snap) : '—')) + '</td>' +
        '<td><input type="number" class="num pnl-mat-actual' + (actualInvalid ? ' invalid-financial' : '') + '" step="0.01" min="0" data-i="' + i + '" value="' + (actual === null ? '' : actual) + '" placeholder="auto"' + (actualInvalid ? ' aria-invalid="true" title="Invalid actual material cost — correct or clear to return to auto hierarchy"' : ' title="Blank = use procurement snapshot or estimate fallback"') + ' /></td>' +
        '<td><span class="badge">' + esc(materialSourceLabel(d.source)) + '</span></td>' +
        '<td class="num-cell">' + safeMoney(d.extendedCost) + '</td>' +
        '<td class="num-cell">' + safeMoney(d.variance) + '</td>' +
        '<td><button type="button" class="btn btn-sm pnl-mat-refresh-snapshot" data-i="' + i + '" title="Replace this row procurement snapshot with current Catalog Your Cost">Refresh snapshot</button></td>' +
        '</tr>';
    }
    body.innerHTML = html || '<tr><td colspan="9" style="color:var(--text-muted);padding:1rem">No job materials to reconcile.</td></tr>';
    var used = document.getElementById('pnl-mat-recon-used'); if (used) used.textContent = recon && recon.ok ? money(recon.total) : '—';
    var est = document.getElementById('pnl-mat-recon-est'); if (est) est.textContent = recon && recon.estimateComplete ? money(recon.estimateTotal) : '—';
    var vari = document.getElementById('pnl-mat-recon-var'); if (vari) { vari.textContent = recon && recon.variance !== null ? money(recon.variance) : '—'; vari.style.color = recon && recon.variance !== null && recon.variance <= 0 ? 'var(--success)' : 'var(--warning)'; }
    var counts = document.getElementById('pnl-mat-recon-source-counts');
    if (counts && recon) counts.textContent = 'Actual ' + recon.sourceCounts.actual + ' · Snapshot ' + recon.sourceCounts.snapshot + ' · Fallback ' + recon.sourceCounts.estimate;
    var val = document.getElementById('pnl-mat-recon-validation');
    if (val) { val.style.display = recon && recon.errors && recon.errors.length ? 'block' : 'none'; val.textContent = recon && recon.errors ? recon.errors.join(' ') : ''; }
  }

'''
if 'function renderMaterialReconciliation(recon)' not in s:
    if render_anchor not in s:
        raise SystemExit('renderPnL anchor missing')
    s = s.replace(render_anchor, render_helper + render_anchor, 1)

old_hierarchy = r'''    var link=pnl.linkMaterial!==false, actMat=0, matSource='explicit actual';
    if(!link && pnl.actualMaterial!=='' && pnl.actualMaterial!=null){actMat=actualValue(pnl.actualMaterial,'Actual material');}
    else {
      var rows=state.materialsUsed||[], sourceCounts={actual:0,snapshot:0,estimate:0}; actMat=0;
      for(var i=0;i<rows.length;i++){
        var mr=rows[i]||{}, q=nonNegativeFinancial(mr.qty), pc=null, source='';
        if(q===null){errors.push('Material row '+(i+1)+' quantity must be finite and nonnegative.');actMat=NaN;break;}
        if(mr.actualCost !== null && mr.actualCost !== undefined && mr.actualCost !== '') { pc=nonNegativeFinancial(mr.actualCost); source='actual'; }
        else if(mr.procurementCostSnapshot !== null && mr.procurementCostSnapshot !== undefined && mr.procurementCostSnapshot !== '') { pc=nonNegativeFinancial(mr.procurementCostSnapshot); source='snapshot'; }
        else { pc=nonNegativeFinancial(mr.unitCost); source='estimate'; }
        if(pc===null){errors.push('Material row '+(i+1)+' '+source+' cost must be finite and nonnegative.');actMat=NaN;break;}
        sourceCounts[source]++; actMat += q*pc;
      }
      if(isFinite(actMat)) {
        var labels=[];
        if(sourceCounts.actual) labels.push('explicit actual');
        if(sourceCounts.snapshot) labels.push('procurement snapshot');
        if(sourceCounts.estimate) labels.push('estimated cost fallback');
        matSource=labels.join(' + ') || 'no material rows';
      }
    }
'''
new_hierarchy = r'''    var link=pnl.linkMaterial!==false, actMat=0, matSource='explicit actual';
    var materialRecon = window.BrunoFinancial.reconcileMaterialCosts(state.materialsUsed || []);
    renderMaterialReconciliation(materialRecon);
    if(!link && pnl.actualMaterial!=='' && pnl.actualMaterial!=null){actMat=actualValue(pnl.actualMaterial,'Actual material');matSource='manual total override';}
    else {
      if (!materialRecon.ok) { errors = errors.concat(materialRecon.errors || []); actMat = NaN; }
      else {
        actMat = materialRecon.total;
        var sourceCounts = materialRecon.sourceCounts || {actual:0,snapshot:0,estimate:0};
        var labels=[];
        if(sourceCounts.actual) labels.push('explicit actual');
        if(sourceCounts.snapshot) labels.push('procurement snapshot');
        if(sourceCounts.estimate) labels.push('estimated cost fallback');
        matSource=labels.join(' + ') || 'no material rows';
      }
    }
'''
if old_hierarchy not in s:
    raise SystemExit('old P&L hierarchy block missing')
s = s.replace(old_hierarchy, new_hierarchy, 1)

# -----------------------------------------------------------------------------
# Per-row actual-cost edit + explicit snapshot refresh from Catalog Your Cost.
# -----------------------------------------------------------------------------
listener_anchor = """    on('pnl-mat-link', 'change', function () {\n      state.pnl.linkMaterial = this.checked;\n      softRefresh();\n    });\n\n"""
listener_new = """    on('pnl-mat-link', 'change', function () {\n      state.pnl.linkMaterial = this.checked;\n      softRefresh();\n    });\n    on('pnl-mat-recon-body', 'change', function (e) {\n      if (!e.target.classList.contains('pnl-mat-actual')) return;\n      var i = +e.target.getAttribute('data-i');\n      var row = (state.materialsUsed || [])[i];\n      if (!row) return;\n      var raw = String(e.target.value == null ? '' : e.target.value).trim();\n      if (raw === '') delete row.actualCost;\n      else { var n = Number(raw); row.actualCost = (isFinite(n) && n >= 0) ? n : window.BrunoFinancial.INVALID_FINANCIAL; }\n      softRefresh();\n    });\n    on('pnl-mat-recon-body', 'click', function (e) {\n      if (!e.target.classList.contains('pnl-mat-refresh-snapshot')) return;\n      var i = +e.target.getAttribute('data-i');\n      var row = (state.materialsUsed || [])[i];\n      if (!row) return;\n      var cid = row.catalogId || row.id;\n      var cat = state.catalog || [], found = null;\n      for (var ci = 0; ci < cat.length; ci++) if (cat[ci] && String(cat[ci].id) === String(cid)) { found = cat[ci]; break; }\n      if (!found) { toast('No matching Catalog row for this material'); return; }\n      var yc = nonNegativeFinancial(found.yourCost);\n      if (yc === null) { toast('Catalog Your Cost is invalid — correct it before refreshing snapshot'); return; }\n      row.procurementCostSnapshot = yc;\n      row.procurementCostSource = 'catalog_yourCost_snapshot_manual_refresh';\n      row.procurementCostUpdated = todayISO();\n      softRefresh();\n      toast('Procurement snapshot refreshed from Catalog Your Cost');\n    });\n\n"""
if listener_anchor not in s:
    raise SystemExit('P&L listener anchor missing')
s = s.replace(listener_anchor, listener_new, 1)

# -----------------------------------------------------------------------------
# Tests: executable core reconciliation + source integration assertions.
# -----------------------------------------------------------------------------
append = r'''

// Material Cost Reconciliation — executable next-phase coverage.
{
  const rows = [
    { qty: 1, unitCost: 100, procurementCostSnapshot: 80, actualCost: 90 },
    { qty: 2, unitCost: 100, procurementCostSnapshot: 70 },
    { qty: 3, unitCost: 50 }
  ];
  const r = F.reconcileMaterialCosts(rows);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.total, 380);
  assert.strictEqual(r.estimateTotal, 450);
  assert.strictEqual(r.variance, -70);
  assert.deepStrictEqual(r.sourceCounts, { actual: 1, snapshot: 1, estimate: 1 });
  assert.strictEqual(r.rows[0].source, 'actual');
  assert.strictEqual(r.rows[1].source, 'snapshot');
  assert.strictEqual(r.rows[2].source, 'estimate');

  const invalidActual = F.reconcileMaterialCosts([{ qty: 1, unitCost: 100, procurementCostSnapshot: 80, actualCost: F.INVALID_FINANCIAL }]);
  assert.strictEqual(invalidActual.ok, false, 'invalid explicit actual must not fall through to snapshot');
  assert.strictEqual(invalidActual.total, null);

  const invalidSnapshot = F.reconcileMaterialCosts([{ qty: 1, unitCost: 100, procurementCostSnapshot: F.INVALID_FINANCIAL }]);
  assert.strictEqual(invalidSnapshot.ok, false, 'invalid supplied snapshot must not fall through to estimate');

  const zeroActual = F.reconcileMaterialCosts([{ qty: 2, unitCost: 100, actualCost: 0 }]);
  assert.strictEqual(zeroActual.ok, true);
  assert.strictEqual(zeroActual.total, 0, 'legitimate zero actual cost remains valid zero');

  const persisted = JSON.parse(JSON.stringify({ actualCost: F.normalizePersistentFinancial('abc', 0), procurementCostSnapshot: F.normalizePersistentFinancial('Infinity', 0) }));
  assert.strictEqual(persisted.actualCost, F.INVALID_FINANCIAL);
  assert.strictEqual(persisted.procurementCostSnapshot, F.INVALID_FINANCIAL);
}

// Material reconciliation production integration invariants.
{
  const src = source;
  assert(src.includes('id="pnl-material-reconciliation"'), 'P&L must expose material reconciliation UI');
  assert(src.includes('id="pnl-mat-recon-body"'));
  assert(src.includes("window.BrunoFinancial.reconcileMaterialCosts(state.materialsUsed || [])"), 'P&L must use executable shared reconciliation core');
  assert(src.includes("row.actualCost = window.BrunoFinancial.normalizePersistentFinancial(row.actualCost, 0)"), 'actual material unit cost must persist strictly');
  assert(src.includes("row.procurementCostSnapshot = window.BrunoFinancial.normalizePersistentFinancial(row.procurementCostSnapshot, 0)"), 'procurement snapshot must persist strictly');
  assert(src.includes("if (raw === '') delete row.actualCost"), 'clearing actual should intentionally return to hierarchy rather than synthesize zero');
  assert(src.includes("row.procurementCostSnapshot = yc"), 'snapshot refresh must be explicit and use validated Catalog Your Cost');
  assert(src.includes("Catalog Your Cost is invalid — correct it before refreshing snapshot"));
}
'''
if 'Material Cost Reconciliation — executable next-phase coverage.' not in t:
    t += append

core.write_text(c)
index.write_text(s)
tests.write_text(t)
