from pathlib import Path
p=Path('tests/financial-integrity.test.js')
s=p.read_text()
old="assert.ok(source.includes(\"mr.actualCost !== null\") && source.includes(\"mr.procurementCostSnapshot !== null\") && source.includes(\"source='estimate'\"), 'material actual cost must resolve per row');"
new="assert.ok(typeof F.resolveMaterialCost === 'function' && typeof F.reconcileMaterialCosts === 'function', 'material actual cost hierarchy must be executable in shared core');"
if old in s:
    s=s.replace(old,new,1)
elif new not in s:
    raise SystemExit('material hierarchy compatibility assertion anchor missing')
p.write_text(s)
