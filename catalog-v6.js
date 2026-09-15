(function(){
'use strict';

/*
 * Catalog Completion V6
 * Adds common residential/light-commercial HVAC install materials without
 * overwriting any existing catalog row or shop-edited price. Prices are
 * estimating placeholders only and should be replaced with current vendor/OEM costs.
 *
 * V6.1 also owns the migration path for older saved/imported jobs. The main app
 * intentionally keeps its large legacy state normalizer unchanged; this module
 * repairs missing V6 catalog metadata in localStorage and performs one controlled
 * reload so the private in-app state is rebuilt from the enriched catalog.
 */
var STORAGE_KEY='bruno-ac-v1';
var RELOAD_FLAG='bruno-catalog-v6-reload';
var ITEMS=[
  {id:'ac-ls-17',item:'Insulated refrigerant line-set pair allowance (diameters by OEM)',part:'LS-PAIR-FT',vendor:'-',units:'ft',unitCost:9.5,category:'Line sets & fittings',notes:'Generic per-foot estimating allowance only. Exact liquid/suction diameters and equivalent-length limits come from OEM instructions.'},
  {id:'ac-ls-11',item:'Insulated line set package, 25 ft',part:'LS-PKG-25',vendor:'-',units:'ea',unitCost:185,category:'Line sets & fittings',notes:'Example estimating placeholder; verify diameter and OEM compatibility.'},
  {id:'ac-ls-12',item:'Insulated line set package, 35 ft',part:'LS-PKG-35',vendor:'-',units:'ea',unitCost:245,category:'Line sets & fittings',notes:'Example estimating placeholder; verify diameter and OEM compatibility.'},
  {id:'ac-ls-13',item:'Insulated line set package, 50 ft',part:'LS-PKG-50',vendor:'-',units:'ea',unitCost:335,category:'Line sets & fittings',notes:'Example estimating placeholder; verify diameter and OEM compatibility.'},
  {id:'ac-ls-14',item:'Line-set cover / line-hide channel',part:'LINEHIDE',vendor:'-',units:'ft',unitCost:6.5,category:'Line sets & fittings'},
  {id:'ac-ls-15',item:'Line-hide elbows / couplings / end fittings kit',part:'LINEHIDE-FIT',vendor:'-',units:'kit',unitCost:38,category:'Line sets & fittings'},
  {id:'ac-ls-16',item:'Copper fittings / couplings / reducers allowance',part:'ACR-FIT',vendor:'-',units:'kit',unitCost:55,category:'Line sets & fittings'},
  {id:'ac-ls-18',item:'Service valve caps / Schrader cores kit',part:'CORE-KIT',vendor:'-',units:'kit',unitCost:24,category:'Line sets & fittings'},

  {id:'ac-cd-08',item:'PVC condensate fittings assortment (3/4 in)',part:'PVC-FIT-34',vendor:'-',units:'kit',unitCost:28,category:'Condensate & drainage'},
  {id:'ac-cd-09',item:'Condensate cleanout / vent tee assembly',part:'DRN-CLEANOUT',vendor:'-',units:'ea',unitCost:18,category:'Condensate & drainage'},
  {id:'ac-cd-10',item:'Condensate drain pipe hangers / support clamps',part:'DRN-HANG',vendor:'-',units:'pk',unitCost:16,category:'Condensate & drainage'},
  {id:'ac-cd-11',item:'Condensate drain termination / air-gap fittings allowance',part:'DRN-TERM',vendor:'-',units:'ea',unitCost:22,category:'Condensate & drainage'},
  {id:'ac-cd-12',item:'Mini-split condensate drain hose',part:'MS-DRAIN',vendor:'-',units:'ft',unitCost:1.35,category:'Condensate & drainage'},
  {id:'ac-cd-13',item:'Mini-split condensate pump',part:'MS-PUMP',vendor:'-',units:'ea',unitCost:145,category:'Condensate & drainage'},

  {id:'ac-du-13',item:'Duct hanger / support strap',part:'DUCT-STRAP',vendor:'-',units:'roll',unitCost:18,category:'Ductwork & distribution'},
  {id:'ac-du-14',item:'Supply boot / register box',part:'SUP-BOOT',vendor:'-',units:'ea',unitCost:24,category:'Ductwork & distribution'},
  {id:'ac-du-15',item:'Round starting collar / takeoff fitting',part:'TAKEOFF',vendor:'-',units:'ea',unitCost:16,category:'Ductwork & distribution'},
  {id:'ac-du-16',item:'Return-air box / return plenum allowance',part:'RET-BOX',vendor:'-',units:'ea',unitCost:165,category:'Ductwork & distribution'},
  {id:'ac-du-17',item:'Flexible duct connector / canvas vibration connector',part:'DUCT-FLEXCON',vendor:'-',units:'ea',unitCost:42,category:'Ductwork & distribution'},
  {id:'ac-du-18',item:'Duct sealant / mastic accessory brush and mesh kit',part:'MASTIC-KIT',vendor:'-',units:'kit',unitCost:24,category:'Ductwork & distribution'},

  {id:'ac-pd-05',item:'Outdoor-unit vibration isolation pad set',part:'VIB-PAD',vendor:'-',units:'set',unitCost:32,category:'Pads, stands & mounts'},
  {id:'ac-pd-06',item:'Air-handler hanging / support hardware kit',part:'AH-HANG',vendor:'-',units:'kit',unitCost:95,category:'Pads, stands & mounts',notes:'Field support allowance only; verify structural attachment and OEM requirements.'},
  {id:'ac-pd-07',item:'Equipment anchoring / hurricane tie-down hardware kit',part:'ANCHOR-KIT',vendor:'-',units:'kit',unitCost:48,category:'Pads, stands & mounts',notes:'Verify local wind/load and manufacturer requirements.'},

  {id:'ac-el-06',item:'HVAC disconnect fuse set (rating by nameplate)',part:'DISC-FUSE',vendor:'-',units:'set',unitCost:38,category:'Electrical accessories (HVAC)',notes:'Rating by equipment nameplate/OEM and electrical scope.'},
  {id:'ac-el-07',item:'24 V control transformer',part:'XFMR-24V',vendor:'-',units:'ea',unitCost:48,category:'Electrical accessories (HVAC)'},
  {id:'ac-el-08',item:'HVAC contactor',part:'CONTACTOR',vendor:'-',units:'ea',unitCost:42,category:'Electrical accessories (HVAC)'},
  {id:'ac-el-09',item:'Run capacitor / dual run capacitor',part:'CAP-RUN',vendor:'-',units:'ea',unitCost:38,category:'Electrical accessories (HVAC)',notes:'Service inventory placeholder; select exact µF/voltage in field.'},
  {id:'ac-el-10',item:'Low-voltage splice / wire connector kit',part:'LV-CONN',vendor:'-',units:'kit',unitCost:18,category:'Electrical accessories (HVAC)'},

  {id:'ac-is-04',item:'Pipe insulation adhesive / seam tape',part:'INS-TAPE',vendor:'-',units:'roll',unitCost:18,category:'Insulation & sealing'},
  {id:'ac-is-05',item:'Exterior penetration sealant / flashing allowance',part:'EXT-SEAL',vendor:'-',units:'ea',unitCost:22,category:'Insulation & sealing'},
  {id:'ac-is-06',item:'Firestop sealant for rated penetration (when required)',part:'FIRESTOP',vendor:'-',units:'ea',unitCost:38,category:'Insulation & sealing',notes:'Use only where the assembly requires an approved firestop system.'},

  {id:'ac-iq-05',item:'Filter rack / field-installed filter base',part:'FILTER-RACK',vendor:'-',units:'ea',unitCost:85,category:'Filters & IAQ'},
  {id:'ac-iq-06',item:'Condensate pan antimicrobial treatment allowance',part:'PAN-TREAT',vendor:'-',units:'ea',unitCost:14,category:'Filters & IAQ'},

  {id:'ac-cm-12',item:'Equipment labels / identification / warning labels kit',part:'LABEL-KIT',vendor:'-',units:'kit',unitCost:12,category:'Consumables / misc & freight'},
  {id:'ac-cm-13',item:'Roof / wall patching and weather-seal consumables allowance',part:'PATCH-SEAL',vendor:'-',units:'allow',unitCost:45,category:'Consumables / misc & freight'},
  {id:'ac-cm-14',item:'Jobsite cleanup / debris disposal consumables allowance',part:'CLEANUP',vendor:'-',units:'allow',unitCost:35,category:'Consumables / misc & freight'},
  {id:'ac-cm-15',item:'Equipment delivery / local freight allowance',part:'DELIVERY',vendor:'-',units:'allow',unitCost:125,category:'Consumables / misc & freight'},

  {id:'ac-ms-04',item:'Mini-split wall bracket / ground stand',part:'MS-STAND',vendor:'-',units:'ea',unitCost:125,category:'Mini-split / multi-zone'},
  {id:'ac-ms-05',item:'Mini-split communication / interconnect cable allowance',part:'MS-CABLE',vendor:'-',units:'ft',unitCost:1.65,category:'Mini-split / multi-zone',notes:'Verify conductor count/gauge and OEM listing.'},
  {id:'ac-ms-06',item:'Mini-split flare fitting / adapter kit',part:'MS-FLARE',vendor:'-',units:'kit',unitCost:42,category:'Mini-split / multi-zone'}
];

function cloneRow(row){
  var out={};Object.keys(row).forEach(function(k){out[k]=row[k]});
  if(out.crew==null)out.crew=1;
  if(out.prod==null)out.prod=0;
  if(out.prodUnit==null)out.prodUnit='Day';
  if(out.yourCost==null)out.yourCost=out.unitCost;
  return out;
}

function isMissing(v){return v==null||v==='';}

function enrichMissing(target,source){
  var changed=false;
  if(!target||!source)return changed;
  Object.keys(source).forEach(function(k){
    if(isMissing(target[k])){target[k]=source[k];changed=true;}
  });
  if(isMissing(target.crew)){target.crew=1;changed=true;}
  if(target.prod==null){target.prod=0;changed=true;}
  if(isMissing(target.prodUnit)){target.prodUnit='Day';changed=true;}
  if(isMissing(target.yourCost)){
    target.yourCost=!isMissing(target.unitCost)?target.unitCost:source.unitCost;
    changed=true;
  }
  return changed;
}

function mergeInto(cat){
  if(!Array.isArray(cat))return {changed:false,added:0,enriched:0};
  var byId={},byName={},added=0,enriched=0,changed=false;
  cat.forEach(function(r){
    if(!r)return;
    if(r.id)byId[String(r.id)]=r;
    if(r.item)byName[String(r.item).trim().toLowerCase()]=r;
  });
  ITEMS.forEach(function(src){
    var name=String(src.item).trim().toLowerCase();
    var existing=byId[String(src.id)]||byName[name];
    if(existing){
      if(enrichMissing(existing,src)){enriched++;changed=true;}
      return;
    }
    var row=cloneRow(src);
    cat.push(row);
    byId[String(row.id)]=row;
    byName[name]=row;
    added++;
    changed=true;
  });
  return {changed:changed,added:added,enriched:enriched};
}

function repairStoredJob(){
  try{
    var raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return false;
    var job=JSON.parse(raw);
    if(!job||typeof job!=='object'||Array.isArray(job))return false;
    if(!Array.isArray(job.catalog))job.catalog=[];
    var result=mergeInto(job.catalog);
    if(!result.changed)return false;
    localStorage.setItem(STORAGE_KEY,JSON.stringify(job));
    return true;
  }catch(e){return false;}
}

function controlledReload(){
  try{
    if(sessionStorage.getItem(RELOAD_FLAG)==='1'){
      sessionStorage.removeItem(RELOAD_FLAG);
      return;
    }
    sessionStorage.setItem(RELOAD_FLAG,'1');
  }catch(e){}
  window.location.reload();
}

function watchImport(id){
  var el=document.getElementById(id);
  if(!el)return;
  el.addEventListener('change',function(){
    var before='';
    try{before=localStorage.getItem(STORAGE_KEY)||'';}catch(e){}
    var tries=0;
    var timer=setInterval(function(){
      tries++;
      var now='';
      try{now=localStorage.getItem(STORAGE_KEY)||'';}catch(e2){}
      if(now!==before){
        clearInterval(timer);
        if(repairStoredJob())controlledReload();
        return;
      }
      if(tries>=50)clearInterval(timer);
    },100);
  });
}

try{
  if(window.BRUNO_SEED&&Array.isArray(window.BRUNO_SEED.catalog))mergeInto(window.BRUNO_SEED.catalog);
}catch(e){}

/*
 * The core app state lives inside an IIFE, so an external catalog module cannot
 * safely mutate its private `state` variable. Repair the persisted job instead,
 * then reload once so the canonical app normalizer consumes the complete rows.
 */
if(repairStoredJob()){
  controlledReload();
  return;
}

try{sessionStorage.removeItem(RELOAD_FLAG);}catch(e3){}
watchImport('btn-import');
watchImport('btn-import-app');
})();
