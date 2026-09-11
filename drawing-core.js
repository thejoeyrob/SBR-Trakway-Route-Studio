/* Drawing geometry: metre units; full footprints; no guessed map features. */
(function(root){
'use strict';
const C=root.TrakwayCore||(typeof require==='function'?require('./core.js'):null);
const copy=p=>({x:p.x,y:p.y});
function simplify(points,tolerance=.35){
 if(points.length<3)return points.map(copy);
 const keep=new Set([0,points.length-1]),stack=[[0,points.length-1]];
 while(stack.length){const [a,b]=stack.pop();let max=tolerance,index=-1;for(let i=a+1;i<b;i++){const d=C.segmentDistance(points[i],points[a],points[b]);if(d>max){max=d;index=i}}if(index>=0){keep.add(index);stack.push([a,index],[index,b])}}
 return [...keep].sort((a,b)=>a-b).map(i=>copy(points[i]));
}
function overlaps(a,b){ // SAT: touching edges are not overlaps.
 const A=C.corners(a),B=C.corners(b);
 for(const poly of [A,B])for(let i=0;i<4;i++){const p=poly[i],q=poly[(i+1)%4],axis={x:-(q.y-p.y),y:q.x-p.x},len=Math.hypot(axis.x,axis.y);const aa=A.map(p=>(p.x*axis.x+p.y*axis.y)/len),bb=B.map(p=>(p.x*axis.x+p.y*axis.y)/len);if(Math.min(...aa)>=Math.max(...bb)-.00001||Math.min(...bb)>=Math.max(...aa)-.00001)return false}
 return true;
}
function spatialIndex(){const grid=new Map(),size=20;const keys=q=>{const b=C.bounds([q]),out=[];for(let x=Math.floor(b.minX/size);x<=Math.floor(b.maxX/size);x++)for(let y=Math.floor(b.minY/size);y<=Math.floor(b.maxY/size);y++)out.push(x+':'+y);return out};return{add(q){keys(q).forEach(k=>{if(!grid.has(k))grid.set(k,[]);grid.get(k).push(q)})},collides(q){const seen=new Set();return keys(q).some(k=>(grid.get(k)||[]).some(z=>{if(seen.has(z))return false;seen.add(z);return overlaps(q,z)}))}}}
function route(points,k,lanes,catalog,options={}){
 const t=catalog[k];if(!t||![1,2].includes(lanes)||points.length<2)throw Error('Add at least two route points.');
 const g=options.freehand?simplify(points,Math.max(.25,t.l*.22)):simplify(points,.015);
 if(C.pathLength(g)<t.l*.25)throw Error('Draw a longer route to place full panels.');
 const expected=g.slice(1).reduce((n,p,i)=>n+Math.ceil(C.distance(g[i],p)/t.l)*lanes,0);if(expected>C.MAX_ITEMS)throw Error('Split this route into smaller sections.');
 const items=[],group=C.id(),index=spatialIndex(),joints=[];let omitted=0,staggered=0;
 const maxStagger=k==='sabre'?Math.max(0,Math.min(.3,Number(options.stagger)||0)):0;
 for(let i=1;i<g.length;i++){
  const start=g[i-1],end=g[i],d=C.distance(start,end);if(d<.05)continue;
  const a=Math.atan2(end.y-start.y,end.x-start.x),rows=Math.ceil(d/t.l);let segmentSkipped=0;
  for(let row=0;row<rows;row++){
   const candidates=Array.from({length:lanes},(_,lane)=>{const u=(row+.5)*t.l,v=(lane-(lanes-1)/2)*t.w;return{id:C.id(),kind:'panel',product:k,name:t.name,colour:t.colour,l:t.l,w:t.w,a,x:start.x+Math.cos(a)*u-Math.sin(a)*v,y:start.y+Math.sin(a)*u+Math.cos(a)*v,group}});
   let placed=candidates;
   if(candidates.some(q=>index.collides(q))){
    placed=null;
    // A whole row may shift laterally at a bend; never more than 300 mm.
    if(row===0&&i>1&&maxStagger)for(const offset of [.1,-.1,.2,-.2,.3,-.3].filter(v=>Math.abs(v)<=maxStagger+1e-8)){
     const shifted=candidates.map(q=>({...q,x:q.x-Math.sin(a)*offset,y:q.y+Math.cos(a)*offset,stagger:offset}));
     if(!shifted.some(q=>index.collides(q))){placed=shifted;staggered++;break}
    }
   }
   if(placed){placed.forEach(q=>{items.push(q);index.add(q)})}else{omitted+=lanes;segmentSkipped+=lanes}
  }
  if(i>1){const prev=Math.atan2(g[i-1].y-g[i-2].y,g[i-1].x-g[i-2].x),turn=Math.abs(Math.atan2(Math.sin(a-prev),Math.cos(a-prev)));if(turn>.01)joints.push({...copy(start),angle:turn/C.DEG,omitted:segmentSkipped})}
 }
 return{items,points:g,joints,omitted,staggered};
}
function pad(points,k,catalog,angle){
 const clean=points.filter((p,i)=>!i||C.distance(p,points[i-1])>.02).map(copy);
 if(clean.length>3&&C.distance(clean[0],clean[clean.length-1])<.05)clean.pop();
 if(clean.length>1000)throw Error('This boundary is too detailed. Draw a simpler outline.');
 let a=angle;
 if(!Number.isFinite(a)){let longest=0;a=0;clean.forEach((p,i)=>{const q=clean[(i+1)%clean.length],d=C.distance(p,q);if(d>longest){longest=d;a=Math.atan2(q.y-p.y,q.x-p.x)}})}
 return C.buildPad(clean,k,catalog,a);
}
function paperRect(width,height,orientation='landscape'){
 const ratio=orientation==='portrait'?1/Math.SQRT2:Math.SQRT2,availableW=Math.max(50,width-48),availableH=Math.max(50,height-220);
 const w=Math.min(availableW,availableH*ratio),h=w/ratio;return{x:(width-w)/2,y:150+(availableH-h)/2,w,h};
}
const SYMBOLS={truck:{name:'Articulated truck',l:16.5,w:2.55},rigid:{name:'Rigid delivery truck',l:10,w:2.55},crane:{name:'Mobile crane',l:12,w:6},excavator:{name:'Excavator',l:7,w:3},goalposts:{name:'OHL goalposts',l:1,w:6},barrier:{name:'Barrier',l:2.5,w:.4}};
const api={simplify,overlaps,spatialIndex,route,pad,paperRect,SYMBOLS};root.TrakwayDrawing=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
