/* Explicit local requests only. OSM is incomplete reference data, never a clearance check. */
(function(root){
'use strict';
const ENDPOINT='https://overpass.private.coffee/api/interpreter',MILE=1609.344,LIMIT=1800;
let lastRequest=0,controller=null;
const cache=new Map();
function abort(){controller?.abort();controller=null}
async function load(kind,centre,radius,endpoint=ENDPOINT){
 if(!['power','plan'].includes(kind)||!Number.isFinite(centre.lat)||!Number.isFinite(centre.lng))throw Error('Choose a mapped site first.');
 radius=kind==='power'?MILE:Math.max(100,Math.min(800,radius));
 const key=[kind,centre.lat.toFixed(4),centre.lng.toFixed(4),Math.round(radius)].join(':');
 const saved=cache.get(key);if(saved&&Date.now()-saved.fetched<3600000)return saved;
 if(controller)throw Error('A local map layer is still loading. Please wait.');
 if(Date.now()-lastRequest<30000)throw Error('Please wait 30 seconds between local map requests.');
 const around=`(around:${radius.toFixed(1)},${centre.lat.toFixed(6)},${centre.lng.toFixed(6)})`;
 const queries=kind==='power'?`node[power~"^(tower|pole)$"]${around};way[power~"^(line|minor_line)$"]${around};`:
 `way[building]${around};way[highway]${around};way[waterway]${around};way[natural~"^(water|wood)$"]${around};way[landuse~"^(forest|grass)$"]${around};node[natural=tree]${around};`;
 const query=`[out:json][timeout:20][maxsize:12000000];(${queries});out body geom ${LIMIT+1};`;
 const ownController=new AbortController();controller=ownController;lastRequest=Date.now();const timeout=setTimeout(()=>ownController.abort(),25000);
 try{
  const url=new URL(endpoint);if(url.protocol!=='https:')throw Error('Map-data endpoint must use HTTPS.');
  const response=await fetch(url,{method:'POST',body:new URLSearchParams({data:query}),signal:ownController.signal,credentials:'omit'});
  if(!response.ok)throw Error('The map-data service is busy or unavailable. Try again later.');
  let raw='';if(response.body?.getReader){const reader=response.body.getReader(),decoder=new TextDecoder();let bytes=0;while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>4000000){await reader.cancel();throw Error('This area has too much map detail. Choose a smaller site.')}raw+=decoder.decode(value,{stream:true})}raw+=decoder.decode()}else raw=await response.text();
  if(raw.length>4000000)throw Error('This area has too much map detail. Choose a smaller site.');
  const data=JSON.parse(raw);if(data.remark)throw Error('The local map request was incomplete. Please try again later.');
  if(!Array.isArray(data.elements))throw Error('No usable map data was returned.');
  const result={kind,centre:{...centre},radius,fetched:Date.now(),timestamp:data.osm3s?.timestamp_osm_base||null,truncated:data.elements.length>LIMIT,elements:data.elements.slice(0,LIMIT).filter(e=>(e.type==='node'&&Number.isFinite(e.lat)&&Number.isFinite(e.lon))||(e.type==='way'&&Array.isArray(e.geometry)&&e.geometry.length<=6000))};
  cache.set(key,result);if(cache.size>6)cache.delete(cache.keys().next().value);return result;
 }catch(e){if(e.name==='AbortError')throw Error('Local map loading was cancelled or timed out.');throw e}finally{clearTimeout(timeout);if(controller===ownController)controller=null}
}
root.TrakwayReferences={load,abort,MILE,ENDPOINT};
})(window);
