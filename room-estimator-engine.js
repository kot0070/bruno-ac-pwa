(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.BrunoRoomEstimatorEngine=api;
})(typeof self!=='undefined'?self:this,function(){
  'use strict';
  var VERSION='1.1.0';
  var REASONS=['customer_request','contractor_choice','field_condition','design_upgrade','existing_condition','other_documented_reason'];
  var ROOM_TYPES=['kitchen','bedroom','living_room','bathroom','garage','laundry','office','other'];
  var DEFAULT_SUPPLY={kitchen:1,bedroom:1,living_room:1,bathroom:1,garage:0,laundry:1,office:1,other:1};
  var EVALUATION_LEVELS=[
    {level:0,key:'raw',label:'Raw inputs'},
    {level:1,key:'model',label:'Normalized building / room model'},
    {level:2,key:'rules',label:'Code / design requirements'},
    {level:3,key:'baseline',label:'Calculated baseline'},
    {level:4,key:'override',label:'Override / compliance'},
    {level:5,key:'bom',label:'BOM / components'},
    {level:6,key:'pricing',label:'Catalog / pricing'},
    {level:7,key:'snapshot',label:'Confirmed snapshot / history'}
  ];
  function num(v,fallback){var n=Number(v);return Number.isFinite(n)?n:(fallback==null?0:fallback)}
  function text(v){return String(v==null?'':v).trim()}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function round1(v){return Math.round(v*10)/10}
  function arr(v){return Array.isArray(v)?v:[]}
  function bool(v,f){return v===true||v===false?v:!!f}
  function id(){return 'rm-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
  function nullableNumber(v){if(v===null||v===undefined||text(v)==='')return null;var n=Number(v);return Number.isFinite(n)&&n>=0?n:null}
  function stable(v){if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(stable).join(',')+']';return '{'+Object.keys(v).sort().map(function(k){return JSON.stringify(k)+':'+stable(v[k])}).join(',')+'}'}
  function defaultBuilding(){return {sqft:2000,stories:1,ceilingHeight:8,location:'Texas',foundation:'slab',ductScope:'existing',returnGrillesDesign:'',notes:''}}
  function defaultRoom(type){type=ROOM_TYPES.indexOf(type)>=0?type:'other';return {id:id(),type:type,count:1,areaEach:'',conditioned:type!=='garage',supplyPerRoom:'',branchFtPerRoom:'',exteriorWalls:'',windows:''}}
  function defaultPlan(){return {version:VERSION,enabled:true,building:defaultBuilding(),rooms:[],overrides:{},updatedAt:null}}
  function normalizeBuilding(raw){raw=raw||{};var d=defaultBuilding();return {sqft:clamp(num(raw.sqft,d.sqft),0,100000),stories:clamp(Math.round(num(raw.stories,d.stories)),1,10),ceilingHeight:clamp(num(raw.ceilingHeight,d.ceilingHeight),6,30),location:text(raw.location)||d.location,foundation:text(raw.foundation)||d.foundation,ductScope:text(raw.ductScope)||d.ductScope,returnGrillesDesign:nullableNumber(raw.returnGrillesDesign),notes:text(raw.notes)}}
  function normalizeRoom(raw){raw=raw||{};var type=ROOM_TYPES.indexOf(text(raw.type))>=0?text(raw.type):'other';return {id:text(raw.id)||id(),type:type,count:clamp(Math.round(num(raw.count,1)),1,50),areaEach:nullableNumber(raw.areaEach),conditioned:bool(raw.conditioned,type!=='garage'),supplyPerRoom:nullableNumber(raw.supplyPerRoom),branchFtPerRoom:nullableNumber(raw.branchFtPerRoom),exteriorWalls:nullableNumber(raw.exteriorWalls),windows:nullableNumber(raw.windows)}}
  function normalizeOverride(raw){raw=raw||{};var value=nullableNumber(raw.value),reason=text(raw.reason);return {value:value,reason:REASONS.indexOf(reason)>=0?reason:'',note:text(raw.note)}}
  function normalizePlan(raw){raw=raw||{};var out={version:VERSION,enabled:raw.enabled!==false,building:normalizeBuilding(raw.building),rooms:arr(raw.rooms).map(normalizeRoom),overrides:{},updatedAt:text(raw.updatedAt)||null};Object.keys(raw.overrides||{}).forEach(function(k){out.overrides[k]=normalizeOverride(raw.overrides[k])});return out}
  function dependencyFingerprints(raw){var p=normalizePlan(raw);return {model:stable({enabled:p.enabled,building:p.building,rooms:p.rooms}),rules:stable({location:p.building.location,foundation:p.building.foundation,ductScope:p.building.ductScope}),baseline:stable({building:p.building,rooms:p.rooms}),override:stable(p.overrides)}}
  function earliestDirtyLevel(previousRaw,nextRaw){if(!previousRaw)return 0;var a=dependencyFingerprints(previousRaw),b=dependencyFingerprints(nextRaw);if(a.model!==b.model)return 1;if(a.rules!==b.rules)return 2;if(a.baseline!==b.baseline)return 3;if(a.override!==b.override)return 4;return null}
  function roomArea(room){return room.areaEach==null?null:room.areaEach*room.count}
  function defaultSupplyForRoom(room){var base=DEFAULT_SUPPLY[room.type];if(room.type==='living_room'&&room.areaEach!=null&&room.areaEach>300)base=2;if(room.areaEach!=null&&room.areaEach>500&&room.type!=='garage')base=Math.max(base,2);return base}
  function supplyBaseline(rooms){var total=0,source=[];arr(rooms).forEach(function(r){if(!r.conditioned)return;var each=r.supplyPerRoom==null?defaultSupplyForRoom(r):r.supplyPerRoom;total+=each*r.count;source.push({roomId:r.id,type:r.type,count:r.count,each:each,source:r.supplyPerRoom==null?'planning_default':'room_input'})});return {value:total,source:source}}
  function ductBaseline(rooms){var total=0,missing=[];arr(rooms).forEach(function(r){if(!r.conditioned)return;if(r.branchFtPerRoom==null){missing.push(r.id);return}total+=r.branchFtPerRoom*r.count});return {value:missing.length?null:round1(total),missingRoomIds:missing}}
  function conditionedArea(rooms){var total=0,known=0,missing=[];arr(rooms).forEach(function(r){if(!r.conditioned)return;var a=roomArea(r);if(a==null)missing.push(r.id);else{total+=a;known+=r.count}});return {value:round1(total),knownInstances:known,missingRoomIds:missing}}
  function applyOverride(metric,override){var base=metric.calculatedBaseline,finalValue=base,provenance=base==null?'unresolved':'calculated_baseline',blocking=[];if(override&&override.value!=null){if(metric.hardMinimum&&metric.codeMinimum!=null&&override.value<metric.codeMinimum){blocking.push({key:metric.key,type:'below_code_minimum',message:'Override '+override.value+' is below hard minimum '+metric.codeMinimum+'.'})}else{finalValue=override.value;provenance='override'}}return Object.assign({},metric,{override:override||{value:null,reason:'',note:''},finalQuantity:finalValue,finalSource:provenance,blocking:blocking})}
  function evaluationState(p,area,sup,duct,metrics,checks,blockers,warnings){return {levels:EVALUATION_LEVELS.map(function(x){var status='ready',detail='';if(x.level===0){detail='Inputs captured.'}else if(x.level===1){status=area.missingRoomIds.length?'review':'ready';detail=area.missingRoomIds.length?'Some conditioned room areas are missing.':'Building and room model normalized.'}else if(x.level===2){status=checks.some(function(c){return c.status==='required-input'})?'review':'ready';detail='Applicable code/design references evaluated.'}else if(x.level===3){status=(duct.value==null&&p.building.ductScope!=='existing')?'blocked':'ready';detail='Planning/takeoff baselines evaluated.'}else if(x.level===4){status=blockers.length?'blocked':warnings.length?'review':'ready';detail='Overrides compared with modeled requirements.'}else if(x.level===5){status=blockers.length?'blocked':'ready';detail=blockers.length?'Final quantities cannot safely flow to BOM yet.':'Final quantities ready for BOM preview.'}else if(x.level===6){status='external';detail='Existing AC Calculator / Catalog pricing layer.'}else{status='external';detail='Confirmed snapshots/history are immutable records outside live evaluation.'}return {level:x.level,key:x.key,label:x.label,status:status,detail:detail}}),fingerprints:dependencyFingerprints(p)} }
  function build(raw){
    var p=normalizePlan(raw),b=p.building,rooms=p.rooms,area=conditionedArea(rooms),sup=supplyBaseline(rooms),duct=ductBaseline(rooms),warnings=[],blockers=[],checks=[],areaDelta=null;
    if(b.sqft>0&&area.value>0){areaDelta=round1(area.value-b.sqft);if(Math.abs(areaDelta)/b.sqft>0.15)warnings.push('Room schedule area differs from building area by more than 15%; verify room areas or total square footage.')}
    if(area.missingRoomIds.length)warnings.push('Some conditioned rooms have no area; area reconciliation is incomplete.');
    if(duct.missingRoomIds.length&&b.ductScope!=='existing')warnings.push('Duct quantity is unresolved until every conditioned room has a branch/run takeoff or an explicit duct override.');
    checks.push({key:'equipment-sizing',status:'required-input',ruleIds:['IRC-M1401.3-EQUIPMENT-SIZING'],title:'Equipment sizing requires an approved load-calculation path',detail:'Square footage and room counts are not converted into tonnage. Enter/verify Manual J or other AHJ-accepted load result, then select equipment through the applicable design/OEM process.'});
    checks.push({key:'duct-design',status:b.ductScope==='existing'?'field-verify':'required-input',ruleIds:['ACCA-MANUAL-D-2016','LOCAL-AHJ-VERIFY'],title:'Duct sizing and airflow remain design inputs',detail:'Room schedule can create a material takeoff baseline, but duct diameter, airflow, static pressure and balancing are not inferred from floor area.'});
    var metrics={};
    metrics.supplyRegisters=applyOverride({key:'supplyRegisters',label:'Supply registers',units:'ea',codeMinimum:null,hardMinimum:false,calculatedBaseline:sup.value,baselineType:'planning_takeoff',ruleIds:['ACCA-MANUAL-D-2016','LOCAL-AHJ-VERIFY'],explanation:'Planning baseline sums per-room supply outlets. Blank per-room supply counts use a visible planning default, not a code minimum.'},p.overrides.supplyRegisters);
    metrics.ductFt=applyOverride({key:'ductFt',label:'Duct material takeoff',units:'ft',codeMinimum:null,hardMinimum:false,calculatedBaseline:b.ductScope==='existing'?0:duct.value,baselineType:b.ductScope==='existing'?'existing_scope':'field_takeoff',ruleIds:['ACCA-MANUAL-D-2016','LOCAL-AHJ-VERIFY'],explanation:b.ductScope==='existing'?'Existing duct scope: no generated duct footage.':'Baseline is the sum of entered room branch/run lengths. Missing lengths keep quantity unresolved.'},p.overrides.ductFt);
    metrics.returnGrilles=applyOverride({key:'returnGrilles',label:'Return grilles',units:'ea',codeMinimum:null,hardMinimum:false,calculatedBaseline:b.returnGrillesDesign,baselineType:'design_input',ruleIds:['ACCA-MANUAL-D-2016','LOCAL-AHJ-VERIFY'],explanation:'Return count is not guessed from square footage. Enter a design value or documented contractor/customer override.'},p.overrides.returnGrilles);
    Object.keys(metrics).forEach(function(k){blockers=blockers.concat(metrics[k].blocking||[]);if(metrics[k].override&&metrics[k].override.value!=null&&!metrics[k].override.reason)warnings.push(metrics[k].label+' override has no documented reason.')});
    if(metrics.ductFt.finalQuantity==null&&b.ductScope!=='existing')blockers.push({key:'ductFt',type:'missing_takeoff',message:'Duct quantity unresolved: add branch lengths or an explicit override.'});
    if(metrics.returnGrilles.finalQuantity==null&&b.ductScope!=='existing')blockers.push({key:'returnGrilles',type:'missing_design_input',message:'Return grille quantity unresolved: enter a design value or documented override.'});
    else if(metrics.returnGrilles.finalQuantity==null)warnings.push('Return grille quantity is not changed in existing-duct mode.');
    var out={version:VERSION,plan:p,roomSummary:{rows:rooms.length,instances:rooms.reduce(function(a,r){return a+r.count},0),conditionedArea:area.value,buildingSqft:b.sqft,areaDelta:areaDelta,areaIncomplete:area.missingRoomIds.length>0},metrics:metrics,checks:checks,warnings:warnings,blockers:blockers,ready:blockers.length===0};
    out.evaluation=evaluationState(p,area,sup,duct,metrics,checks,blockers,warnings);return out;
  }
  function calculatorInputs(result){result=result||{};var m=result.metrics||{},o={};['supplyRegisters','ductFt','returnGrilles'].forEach(function(k){if(m[k]&&m[k].finalQuantity!=null)o[k]=m[k].finalQuantity});if(result.plan&&result.plan.building)o.sqft=result.plan.building.sqft;return o}
  function preset(name){var p=defaultPlan();if(name==='typical-3-2'){p.rooms=[defaultRoom('kitchen'),defaultRoom('living_room'),defaultRoom('bedroom'),defaultRoom('bathroom'),defaultRoom('laundry'),defaultRoom('garage')];p.rooms[2].count=3;p.rooms[3].count=2;}return p}
  return {VERSION:VERSION,REASONS:REASONS,ROOM_TYPES:ROOM_TYPES,DEFAULT_SUPPLY:DEFAULT_SUPPLY,EVALUATION_LEVELS:EVALUATION_LEVELS,defaultBuilding:defaultBuilding,defaultRoom:defaultRoom,defaultPlan:defaultPlan,normalizePlan:normalizePlan,dependencyFingerprints:dependencyFingerprints,earliestDirtyLevel:earliestDirtyLevel,build:build,calculatorInputs:calculatorInputs,preset:preset};
});
