(function(){
'use strict';
try{
  var raw=localStorage.getItem('bruno-ac-v1');if(!raw)return;
  var s=JSON.parse(raw),snap=s&&s.acCalculator&&s.acCalculator.roomEstimator;
  var plan=snap&&snap.plan&&snap.plan.building?snap.plan:snap;
  if(!plan||!plan.building)return;
  var b=plan.building,sq=document.getElementById('sqft'),duct=document.getElementById('ductMode');
  if(sq&&b.sqft!=null)sq.value=b.sqft;
  if(duct&&b.ductScope)duct.value=b.ductScope;
}catch(e){}
})();