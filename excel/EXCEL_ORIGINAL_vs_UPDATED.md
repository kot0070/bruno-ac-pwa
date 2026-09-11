# Bruno AC Excel — Original vs UPDATED

**Original:** `/workspace/bruno-ac/BrunoAC_Estimating.xlsx` (unchanged)
**UPDATED:** `/workspace/bruno-ac/BrunoAC_Estimating_UPDATED.xlsx`

## Major fixes

| ID | Issue | Original | UPDATED |
|----|-------|----------|---------|
| M1 | Tax effective % summed | `Workers!B30=B29+D29+F29` (10+5+2=17) | Compound `(1-(1-f)(1-s)(1-l))*100` → 16.21 |
| M2 | No weekday OT when hpd>8 | `persons×days×hpd` all straight | If hpd>8: straight×8 + weekday OT×1.5; Sat/Sun unchanged |
| M3 | profit≥1 → #DIV/0! | `(D*(1+OH))/(1-profit)` | If profit≥1 return cost (PWA withOHP) |

## Demo smoke (hpd=8)
Unchanged: mat 6028, equip 600, labor 2712, cost 9340, sales 13735.294…, ROUND 13735.

Branding: Bruno AC Services LLC


## M3 follow-up (recheck)
Also guarded `Summary!D35` and `Summary!D39` so Quote Total does not `#DIV/0!` when profit≥1 (H20/22/24/26 alone were insufficient).
