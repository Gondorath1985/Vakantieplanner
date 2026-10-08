const current=document.querySelector('meta[name="app-version"]')?.content;
let pending=null,checking=false;
const notice=document.getElementById('updateNotice');
function apply(){
 if(!pending)return;
 window.dispatchEvent(new Event('vakantiekompas:before-update'));
 try{if(sessionStorage.getItem('vakantiekompas:last-update')===pending){show('De publicatie is onderweg. Je voorkeuren blijven bewaard; probeer het zo opnieuw.',false);return;}sessionStorage.setItem('vakantiekompas:last-update',pending);}catch{}
 const next=new URL(location.href);next.searchParams.set('release',pending);location.replace(next.href);
}
function show(message,button=true){
 notice.hidden=false;notice.replaceChildren(document.createTextNode(message));
 if(button){const b=document.createElement('button');b.textContent='Nu bijwerken';b.addEventListener('click',apply);notice.append(b);}
}
async function check(){
 if(!current || checking || document.hidden)return;checking=true;
 try{
  const url=new URL('version.json',document.baseURI);url.searchParams.set('check',String(Date.now()));
  const response=await fetch(url,{cache:'no-store'});if(!response.ok)return;
  const latest=await response.json();if(!/^[a-f0-9]{12}$/.test(latest.version) || latest.version===current)return;
  pending=latest.version;
  const editing=document.activeElement?.matches('input,select,textarea')||document.querySelector('dialog[open]');
  if(editing)show('Er is een nieuwe versie. Werk bij wanneer je klaar bent; je voorkeuren blijven bewaard.');else apply();
 }catch{/* Offline or unavailable deployment: keep the current usable page. */}finally{checking=false;}
}
check();setInterval(check,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
