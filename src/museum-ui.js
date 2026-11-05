import { archiveFor, ARCHIVE } from './archive.js';
const $=id=>document.getElementById(id);
const display=(id,on)=>$(id)?.classList.toggle('hidden',!on);
const add=(parent,name,txt,cls='')=>{const n=document.createElement(name);n.textContent=txt||'';if(cls)n.className=cls;parent.appendChild(n);return n};
const category={intro:'Introduction',north:'Union medical services',south:'Confederate medical services',field:'Field hospital',modern:'Medicine today'};
export function mountExhibitUI(){let currentId=null;
 function renderExhibit(item,museum){if(!item)return;currentId=item.id;$('exhibit-eyebrow').textContent=item.category||'Museum exhibit';$('exhibit-wing').textContent=category[item.wing]||'The exhibition';$('exhibit-category').textContent=item.category||'Historical interpretation';$('exhibit-title').textContent=item.title||'';$('exhibit-subtitle').textContent=item.subtitle||'';
 const body=$('exhibit-body');body.replaceChildren();for(const text of item.body||[])add(body,'p',text);
 $('exhibit-cite').textContent=item.citation||'Source reference pending';const l=$('exhibit-link');l.href=item.sourceUrl||'#';display('exhibit-link',!!item.sourceUrl);
 const i=museum.exhibits.findIndex(e=>e.id===item.id);$('exhibit-index').textContent=`${i+1} / ${museum.exhibits.length}`;
 const images=archiveFor(item.id),img=$('exhibit-img'),credit=$('image-credit');
 let nav=document.getElementById('archive-image-controls');
 if(!nav){nav=document.createElement('div');nav.id='archive-image-controls';nav.className='archive-image-controls';credit.insertAdjacentElement('afterend',nav)}
 nav.replaceChildren();
 function selectPhoto(index){
   const record=images[index];display('exhibit-img',false);display('media-fallback',true);
   if(!record){img.removeAttribute('src');credit.textContent='No archival image selected for this exhibit. Original documents are linked in the source reference.';return}
   img.alt=record.title+', '+record.date;
   img.onload=()=>{display('exhibit-img',true);display('media-fallback',false)};
   img.onerror=()=>{display('exhibit-img',false);display('media-fallback',true);$('media-fallback').textContent='IMAGE UNAVAILABLE\nOPEN ORIGINAL ARCHIVAL RECORD BELOW'};
   $('media-fallback').textContent='LOADING ARCHIVAL PHOTOGRAPH';
   img.src=record.url;
   credit.replaceChildren();
   const title=add(credit,'strong',record.title+' ('+record.date+'). ');
   add(credit,'span',record.credit+' '+record.note+' ');
   const link=add(credit,'a','Open archival record ↗');link.href=record.record;link.target='_blank';link.rel='noopener noreferrer';
   nav.querySelectorAll('button').forEach((button,i)=>button.classList.toggle('selected',i===index));
 }
 if(images.length){
   images.forEach((record,i)=>{
     const button=add(nav,'button',String(i+1).padStart(2,'0')+' · '+record.title);
     button.type='button';button.title=record.title;button.addEventListener('click',()=>selectPhoto(i));
   });
   selectPhoto(0);
 }else{
   img.removeAttribute('src');display('exhibit-img',false);display('media-fallback',true);
   $('media-fallback').textContent='HISTORICAL DOCUMENTATION';
   credit.textContent='The archival source link appears in this exhibit.';
 }
 const trans=item.transcription;display('source-quote',!!trans);if(trans){$('quote-meta').textContent=trans.meta||'Historical record';$('quote-text').textContent=trans.quote||'';$('quote-note').textContent=trans.note||''}
 const roles=item.staffRoles||[];display('staff-area',roles.length>0);const buttons=$('staff-buttons');buttons.replaceChildren();$('staff-description').textContent='';roles.forEach((role,index)=>{const button=add(buttons,'button',role.role);button.addEventListener('click',()=>{$('staff-description').textContent=role.duties;buttons.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));button.classList.add('selected')});if(!index)button.click()});
 }
 return {get currentId(){return currentId},renderExhibit};
}
export function prepareReader(museum){const content=$('reader-content');content.replaceChildren();add(content,'p','THE CIVIL WAR, 1861–1865','eyebrow');add(content,'h1',museum.title);add(content,'p',museum.historicalThesis);
 for(const wing of ['intro','north','south','field','modern']){const section=add(content,'section','', 'reader-section');add(section,'p',category[wing].toUpperCase(),'eyebrow');add(section,'h2',museum.wings[wing].name);add(section,'p',museum.wings[wing].description);
 for(const item of museum.exhibits.filter(e=>e.wing===wing)){const entry=add(section,'article','', 'reader-entry');add(entry,'small',item.category);add(entry,'h3',item.title);add(entry,'p',item.subtitle);
 for(const picture of archiveFor(item.id)){
  const fig=add(entry,'figure','','archive-figure');
  const img=add(fig,'img');img.src=picture.url;img.alt=picture.title+', '+picture.date;img.loading='lazy';img.onerror=()=>{img.remove();add(fig,'p','Preview unavailable. The original archival record remains available.')};
  add(fig,'figcaption',picture.title+' ('+picture.date+'). '+picture.credit);
  const link=add(fig,'a','View record ↗');link.href=picture.record;link.target='_blank';link.rel='noopener noreferrer';
 }
 for(let paragraph of item.body||[])add(entry,'p',paragraph);
 if(item.transcription){add(entry,'small',item.transcription.meta);add(entry,'blockquote',item.transcription.quote);add(entry,'p',item.transcription.note)}
 if(item.staffRoles){add(entry,'h4','Documented hospital roles');for(let role of item.staffRoles){add(entry,'p',role.role+' — '+role.duties)}}
 add(entry,'small','SOURCE: '+item.citation);if(item.sourceUrl){const p=add(entry,'p');const a=add(p,'a','View original source ↗');a.href=item.sourceUrl;a.target='_blank';a.rel='noopener noreferrer'}
 }}
 const archive=add(content,'section','','reader-sources');add(archive,'p','PRIMARY SOURCE IMAGE COLLECTION','eyebrow');add(archive,'h2','Historic photographs and lithographs');add(archive,'p','These original records document real hospitals and medical personnel. Image labels distinguish the locations shown from the exhibit case studies.');
 const grid=add(archive,'div','','archive-index');
 for(const picture of ARCHIVE){const fig=add(grid,'figure','','archive-figure');const im=add(fig,'img');im.src=picture.url;im.alt=picture.title;im.loading='lazy';im.onerror=()=>{im.remove();add(fig,'p','Image preview unavailable')};add(fig,'figcaption',picture.title+' · '+picture.date);const a=add(fig,'a','Source & rights ↗');a.href=picture.record;a.rel='noopener noreferrer';a.target='_blank';}
 const bib=add(content,'section','','reader-sources');add(bib,'h2','Works cited and historical records');const ol=add(bib,'ol');for(const b of museum.bibliography){const li=add(ol,'li',b.citation+'. ');if(b.url){const a=add(li,'a','Original publication ↗');a.href=b.url;a.target='_blank';a.rel='noopener noreferrer'}}
 add(content,'p','Curatorial note: Museum environments and staff figures are historical interpretations, not photographic reconstructions of actual individuals. The primary sources are linked to archives; secondary summaries are identified as summaries. This exhibit is educational and does not portray medical procedures graphically.');
}
