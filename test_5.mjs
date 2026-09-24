const API_URL = "https://shafnat.llmsorgum.online/bima-api/chat";

const SCENARIOS = [
  { name: "S01-Camilan-25k", cat: "camilan_sehat", ing: "tepung_sorgum, Telur, Minyak Kelapa, Madu, Santan", budget: 25000, time: "Maks 30 Menit" },
  { name: "S02-Dessert-20k", cat: "dessert_rendah_gi", ing: "tepung_sorgum, Santan, Gula Merah, Daun Pandan", budget: 20000, time: "Maks 30 Menit" },
  { name: "S03-Minuman-15k", cat: "minuman_nutrisi", ing: "tepung_sorgum, Santan, Madu, Daun Pandan", budget: 15000, time: "Maks 15 Menit" },
  { name: "S04-MakanBerat-30k", cat: "makanan_berat", ing: "biji_sorgum, protein_ayam_telur, sayuran_hijau, Bawang Merah, Wortel, Minyak Kelapa", budget: 30000, time: "Maks 45 Menit" },
  { name: "S05-Camilan-10k", cat: "camilan_sehat", ing: "tepung_sorgum, Telur, Garam", budget: 10000, time: "Maks 15 Menit" },
];

const FLOOR = [[/garam/i,2000],[/merica/i,3000],[/gula/i,3000],[/minyak/i,5000],[/kecap/i,3000],[/bawang/i,3000],[/wortel/i,3000],[/sayur|bayam/i,2000],[/telur/i,2500],[/tahu|tempe/i,2000],[/tepung.*sorgum/i,8000],[/biji.*sorgum/i,6000],[/santan/i,3000],[/susu/i,4000],[/madu/i,10000],[/daun/i,1500]];
const CEILING = [[/garam/i,5000],[/merica/i,8000],[/gula/i,12000],[/minyak/i,18000],[/kecap/i,8000],[/bawang/i,10000],[/wortel/i,10000],[/sayur|bayam/i,8000],[/telur/i,30000],[/tahu|tempe/i,8000],[/tepung.*sorgum/i,20000],[/biji.*sorgum/i,15000],[/santan/i,10000],[/madu/i,35000],[/daun/i,5000]];
const GMIN=1500,GMAX=50000;
function fl(n){for(const[r,m]of FLOOR)if(r.test(n))return m;return null}
function cl(n){for(const[r,m]of CEILING)if(r.test(n))return m;return null}

function parseGramasi(raw){
  const np=raw.replace(/:\s*rp\s*[\d.,]+/i,'').trim();
  const m=np.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if(m)return{cleanName:m[1].trim(),amount:m[2].trim()};
  return{cleanName:np.trim(),amount:''};
}

function makePrompt(s){
  return `Anda adalah SorghumCare AI, ahli gizi dan koki spesialis sorgum Indonesia.

### INPUT USER
- Kategori Hidangan: ${s.cat}
- Bahan Pokok: ${s.ing}
- Target Budget per porsi: Rp ${s.budget.toLocaleString("id-ID")}
- Batas Waktu Persiapan: ${s.time}

### ATURAN
- HANYA gunakan Bahan Pokok + bahan dapur umum.
- Harga = harga beli satuan warung BUKAN harga per-gram. Minimum Rp 1.500/bahan.
- Tulis gramasi di nama bahan: "Tepung Sorgum (150 gram)". Isi field "amount" juga.
- estimatedCost = total estimatedPrice. Servings realistis.

### FORMAT: JSON murni
{"title":"s","subtitle":"s","targetAge":"s","dishCategory":"s","targetBudget":n,"estimatedCost":n,"prepTimeMinutes":n,"cookTimeMinutes":n,"servings":n,"ingredients":[{"name":"s (gramasi)","amount":"s","estimatedPrice":n}],"nutritionHighlight":{"title":"s","description":"s","fiberGrams":n,"proteinGrams":n,"glycemicIndex":"s","caloriesEstimate":n},"steps":[{"stepNumber":n,"title":"s","instruction":"s","timerMinutes":n}],"tags":["s"]}`;
}

async function callApi(prompt){
  const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),170000);
  try{
    const res=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json","X-Use-RAG":"false","X-Stream":"true","X-Max-Tokens":"4096"},body:JSON.stringify({message:prompt}),signal:ctl.signal});
    clearTimeout(t);if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const reader=res.body.getReader(),dec=new TextDecoder();let full="",buf="";
    while(true){const{done,value}=await reader.read();if(done)break;buf+=dec.decode(value,{stream:true});const lines=buf.split("\n");buf=lines.pop()||"";for(const line of lines){if(!line.startsWith("data: "))continue;const p=line.slice(6).trim();if(p==="[DONE]")continue;try{const o=JSON.parse(p);if(o.delta)full+=o.delta;if(o.response)full=o.response;}catch{}}}
    return full;
  }catch(e){clearTimeout(t);throw e;}
}

function extractJson(text){
  if(!text)return null;const s=text.indexOf("{");if(s===-1)return null;
  let d=0;for(let i=s;i<text.length;i++){if(text[i]==="{")d++;else if(text[i]==="}"){d--;if(d===0)try{return JSON.parse(text.substring(s,i+1))}catch{return null}}}return null;
}

function evaluate(json,scenario){
  const issues=[];const ings=json.ingredients||[];
  if(!json.servings||json.servings<1)issues.push("SERVINGS_INVALID");
  const details=[];
  for(const ing of ings){
    const raw=ing.name||"",p=Number(ing.estimatedPrice)||0,a=ing.amount||"";
    const parsed=parseGramasi(raw);
    const hasGramasi=parsed.amount.length>0||a.length>0;
    const f=fl(raw),c=cl(raw);const minP=f!==null?f:GMIN,maxP=c!==null?c:GMAX;
    let corrected=p;const flags=[];
    if(p<minP){corrected=minP;flags.push("FLOOR");}
    if(p>maxP){corrected=maxP;flags.push("CEILING");}
    if(p===0)flags.push("ZERO");
    if(!hasGramasi)flags.push("NO_GRAMASI");
    details.push({name:parsed.cleanName,amount:a||parsed.amount,rawPrice:p,correctedPrice:corrected,flags});
  }
  const rawSum=ings.reduce((s,i)=>s+(Number(i.estimatedPrice)||0),0);
  const corrSum=details.reduce((s,d)=>s+d.correctedPrice,0);
  const declared=Number(json.estimatedCost)||0;
  if(Math.abs(rawSum-declared)>100)issues.push(`COST_MISMATCH: raw=${rawSum} declared=${declared}`);
  const perPorsi=json.servings>0?Math.round(corrSum/json.servings):corrSum;
  if(perPorsi>scenario.budget*1.15)issues.push(`OVER_BUDGET: Rp${perPorsi} > Rp${scenario.budget}`);
  if(!json.steps||json.steps.length===0)issues.push("NO_STEPS");
  if(!json.nutritionHighlight?.title)issues.push("NO_NUTRITION");
  const noG=details.filter(d=>d.flags.includes("NO_GRAMASI"));
  if(noG.length>0)issues.push(`NO_GRAMASI(${noG.length})`);
  const fI=details.filter(d=>d.flags.includes("FLOOR")),cI=details.filter(d=>d.flags.includes("CEILING"));
  if(fI.length>0)issues.push(`FLOOR(${fI.length})`);
  if(cI.length>0)issues.push(`CEILING(${cI.length})`);
  return{pass:issues.length===0,issues,title:json.title,servings:json.servings,rawTotal:rawSum,correctedTotal:corrSum,perPorsi,ingCount:ings.length,stepCount:(json.steps||[]).length,details};
}

async function runOne(scenario,idx){
  const t0=Date.now();
  try{
    const raw=await callApi(makePrompt(scenario));
    const json=extractJson(raw);
    if(!json){const isRef=/tidak dapat|unpayload|ditolak/i.test(raw);return{idx:idx+1,name:scenario.name,status:isRef?"REFUSAL":"PARSE_FAIL",time:Date.now()-t0,issues:[],title:isRef?"(AI refused)":"(no JSON)"};}
    if(json.status==="unpayload")return{idx:idx+1,name:scenario.name,status:"REFUSAL",time:Date.now()-t0,issues:[],title:"(AI refused)"};
    const ev=evaluate(json,scenario);
    return{idx:idx+1,name:scenario.name,status:ev.pass?"PASS":"FAIL",time:Date.now()-t0,...ev};
  }catch(e){return{idx:idx+1,name:scenario.name,status:"ERROR",time:Date.now()-t0,issues:[e.message],title:""};}
}

async function main(){
  console.log("Running 5 LLM recipe tests...\n");
  const results=[];
  for(let i=0;i<SCENARIOS.length;i++){
    const r=await runOne(SCENARIOS[i],i);
    results.push(r);
    console.log(`[${r.status}] ${r.name} (${(r.time/1000).toFixed(0)}s) — ${r.title||""}`);
    if(r.details){
      for(const d of r.details){
        const flag=d.flags.length?d.flags.join(","):"OK";
        console.log(`  ${d.name.padEnd(28)}${(d.amount||"?").padEnd(22)}Rp${String(d.rawPrice).padEnd(10)}${flag}`);
      }
    }
    if(r.issues?.length>0){console.log("  Issues: "+r.issues.join(", "));}
    console.log();
  }
  const pass=results.filter(r=>r.status==="PASS").length,fail=results.filter(r=>r.status==="FAIL").length;
  console.log("=".repeat(60));
  console.log(`PASS: ${pass} | FAIL: ${fail} | Pass Rate: ${((pass/(pass+fail))*100).toFixed(0)}%`);
  console.log("=".repeat(60));
  for(const r of results){
    console.log(`${r.name.padEnd(20)} ${r.status.padEnd(6)} ${r.title||""}`);
    if(r.perPorsi)console.log(`  Porsi: ${r.servings} | Total: Rp${(r.correctedTotal||0).toLocaleString("id-ID")} | PerPorsi: Rp${(r.perPorsi||0).toLocaleString("id-ID")}`);
  }
  const fs=await import("fs");fs.writeFileSync("test_results_5.json",JSON.stringify(results,null,2));
  console.log("\nSaved to test_results_5.json");
}
main().catch(console.error);
