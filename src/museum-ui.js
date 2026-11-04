const IMAGES={
 'north-lithograph-1864':{src:'https://collaborativehistory.gse.upenn.edu/sites/default/files/Satterlee%20General%20Hospital%201864%20LCOP.jpg',credit:'Satterlee General Hospital, 1864. Charles Magnus lithograph. Free Library of Philadelphia.'},
 'south-mccaw-organization':{src:'https://cdn.loc.gov/service/pnp/ppmsca/33600/33629v.jpg',credit:'Chimborazo Hospital, Richmond, Virginia. Library of Congress, item 2012650183.'},
 'field-petersburg-surgeons-1864':{src:'https://cdn.loc.gov/service/pnp/cwpb/03600/03662r.jpg',credit:'Union surgeons near Petersburg, August 1864. Library of Congress, item 2018666674.'}
};
const $=id=>document.getElementById(id);
const display=(id,on)=>$(id)?.classList.toggle('hidden',!on);
const add=(parent,name,txt,cls='')=>{const n=document.createElement(name);n.textContent=txt||'';if(cls)n.className=cls;parent.appendChild(n);return n};
const category={intro:'Introduction',north:'Union medical services',south:'Confederate medical services',field:'Field hospital',modern:'Medicine today'};
export function mountExhibitUI(){let currentId=null;
 function renderExhibit(item,museum){if(!item)return;currentId=item.id;$('exhibit-eyebrow').textContent=item.category||'Museum exhibit';$('exhibit-wing').textContent=category[item.wing]||'The exhibition';$('exhibit-category').textContent=item.category||'Historical interpretation';$('exhibit-title').textContent=item.title||'';$('exhibit-subtitle').textContent=item.subtitle||'';
 const body=$('exhibit-body');body.replaceChildren();for(const text of item.body||[])add(body,'p',text);
 $('exhibit-cite').textContent=item.citation||'Source reference pending';const l=$('exhibit-link');l.href=item.sourceUrl||'#';display('exhibit-link',!!item.sourceUrl);
 const i=museum.exhibits.findIndex(e=>e.id===item.id);$('exhibit-index').textContent=`${i+1} / ${museum.exhibits.length}`;
 const info=IMAGES[item.id],img=$('exhibit-img');img.onload=()=>{display('exhibit-img',true);display('media-fallback',false)};img.onerror=()=>{display('exhibit-img',false);display('media-fallback',true)};
 display('exhibit-img',false);display('media-fallback',true);$('media-fallback').textContent=item.category.toUpperCase()+'\n1861–1865';$('image-credit').textContent=info?.credit||'A three-dimensional interpretive artifact. Source links and historical details appear at right.';if(info)img.src=info.src;else img.removeAttribute('src');
 const trans=item.transcription;display('source-quote',!!trans);if(trans){$('quote-meta').textContent=trans.meta||'Historical record';$('quote-text').textContent=trans.quote||'';$('quote-note').textContent=trans.note||''}
 const roles=item.staffRoles||[];display('staff-area',roles.length>0);const buttons=$('staff-buttons');buttons.replaceChildren();$('staff-description').textContent='';roles.forEach((role,index)=>{const button=add(buttons,'button',role.role);button.addEventListener('click',()=>{$('staff-description').textContent=role.duties;buttons.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));button.classList.add('selected')});if(!index)button.click()});
 }
 return {get currentId(){return currentId},renderExhibit};
}
export function prepareReader(museum){const content=$('reader-content');content.replaceChildren();add(content,'p','THE CIVIL WAR, 1861–1865','eyebrow');add(content,'h1',museum.title);add(content,'p',museum.historicalThesis);
 for(const wing of ['intro','north','south','field','modern']){const section=add(content,'section','', 'reader-section');add(section,'p',category[wing].toUpperCase(),'eyebrow');add(section,'h2',museum.wings[wing].name);add(section,'p',museum.wings[wing].description);
 for(const item of museum.exhibits.filter(e=>e.wing===wing)){const entry=add(section,'article','', 'reader-entry');add(entry,'small',item.category);add(entry,'h3',item.title);add(entry,'p',item.subtitle);
 const image=IMAGES[item.id];if(image){let fig=add(entry,'figure');let img=add(fig,'img');img.src=image.src;img.alt=item.title+', archival image';img.loading='lazy';img.onerror=()=>fig.remove();add(fig,'figcaption',image.credit)}
 for(let paragraph of item.body||[])add(entry,'p',paragraph);
 if(item.transcription){add(entry,'small',item.transcription.meta);add(entry,'blockquote',item.transcription.quote);add(entry,'p',item.transcription.note)}
 if(item.staffRoles){add(entry,'h4','Documented hospital roles');for(let role of item.staffRoles){add(entry,'p',role.role+' — '+role.duties)}}
 add(entry,'small','SOURCE: '+item.citation);if(item.sourceUrl){const p=add(entry,'p');const a=add(p,'a','View original source ↗');a.href=item.sourceUrl;a.target='_blank';a.rel='noopener noreferrer'}
 }}
 const bib=add(content,'section','','reader-sources');add(bib,'h2','Works cited and historical records');const ol=add(bib,'ol');for(const b of museum.bibliography){const li=add(ol,'li',b.citation+'. ');if(b.url){const a=add(li,'a','Original publication ↗');a.href=b.url;a.target='_blank';a.rel='noopener noreferrer'}}
 add(content,'p','Curatorial note: Museum environments and staff figures are historical interpretations, not photographic reconstructions of actual individuals. The primary sources are linked to archives; secondary summaries are identified as summaries. This exhibit is educational and does not portray medical procedures graphically.');
}
