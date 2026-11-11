/* Public repository catalog: pure filter/search helpers + page mount. */

export function normalizeQuery(q){
  return String(q||'').trim().toLowerCase().replace(/\s+/g,' ');
}

function haystack(entry){
  const up=entry.upstream||{};
  const signals=(entry.contribution_signals||[]).map(s=>s.repo).join(' ');
  return [
    entry.name, entry.full_name, entry.canonical_full_name, entry.canonical_url,
    entry.url, entry.description, entry.highlight, entry.language,
    (entry.topics||[]).join(' '), up.full_name, up.url, up.description, signals
  ].filter(Boolean).join(' ').toLowerCase();
}

export function entryMatches(entry, query){
  const q=normalizeQuery(query);
  if(!q) return true;
  return haystack(entry).includes(q);
}

export function facetOf(entry){
  if(!entry.is_owned) return 'org';
  if(entry.is_fork) return 'fork';
  return 'original';
}

export function filterCatalog(entries, {query='', facet='all'}={}){
  const list=Array.isArray(entries)?entries:[];
  return list.filter(e=>{
    if(!entryMatches(e, query)) return false;
    if(facet==='all'||!facet) return true;
    if(facet==='original') return e.is_owned && !e.is_fork;
    if(facet==='fork') return e.is_owned && !!e.is_fork;
    if(facet==='org') return !!e.is_org_contribution;
    if(facet==='archived') return !!e.is_archived;
    if(facet==='active') return !e.is_archived;
    return true;
  });
}

export function sortCatalog(entries, sort='updated'){
  const list=entries.slice();
  const keyTime=e=>Date.parse(e.pushed_at||e.updated_at||0)||0;
  if(sort==='name'){
    list.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''), 'en', {sensitivity:'base'}));
  }else if(sort==='stars'){
    list.sort((a,b)=>(b.canonical_stars||b.stars||0)-(a.canonical_stars||a.stars||0) || String(a.name).localeCompare(String(b.name)));
  }else{
    list.sort((a,b)=>keyTime(b)-keyTime(a) || String(a.name).localeCompare(String(b.name)));
  }
  return list;
}

export function catalogStats(entries){
  const list=entries||[];
  return {
    total:list.length,
    owned:list.filter(e=>e.is_owned).length,
    originals:list.filter(e=>e.is_owned && !e.is_fork).length,
    forks:list.filter(e=>e.is_owned && e.is_fork).length,
    archived:list.filter(e=>e.is_archived).length,
    org:list.filter(e=>e.is_org_contribution).length,
    orgOnly:list.filter(e=>e.group==='org_contribution_only').length
  };
}

function esc(s){
  return String(s??'').replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function fmtDate(iso){
  if(!iso) return '';
  const d=new Date(iso);
  if(Number.isNaN(+d)) return '';
  const parts=new Intl.DateTimeFormat('en-GB',{
    timeZone:'Asia/Shanghai', year:'numeric', month:'short', day:'2-digit'
  }).formatToParts(d);
  const g=t=>parts.find(p=>p.type===t)?.value||'';
  return `${g('day')} ${g('month')} ${g('year')}`;
}

function fmtStars(n){
  const v=Number(n)||0;
  return v.toLocaleString('en-US');
}

function signalText(entry){
  const sigs=entry.contribution_signals||[];
  const pub=sigs.find(s=>s.repo && !s.repo.startsWith('Birfy/'))||sigs[0];
  if(!pub) return '';
  const bits=[];
  if(pub.total_authored!=null) bits.push(`${pub.total_authored} authored PRs`);
  if(pub.merged) bits.push(`${pub.merged} merged`);
  if(pub.open) bits.push(`${pub.open} open`);
  if(!bits.length) return '';
  const note=pub.completeness==='repo_search_total_count'?'':' (partial listing)';
  return bits.join(' · ')+note;
}

export function renderEntries(entries){
  if(!entries.length){
    return '<p class="rcat-empty">No public repositories match these filters.</p>';
  }
  return '<ul class="rcat-list">'+entries.map(e=>{
    const canonName=e.canonical_full_name||e.full_name;
    const isFork=e.is_owned && e.is_fork;
    const upMissing=isFork && !(e.upstream&&e.upstream.full_name);
    const badge=e.is_archived?'Archived':(e.group==='org_contribution_only'?'Org contribution':(isFork?'Fork':'Original'));
    const stars=e.is_fork && e.canonical_stars!=null
      ? `<span class="rcat-stars" title="Stars on the canonical repository">${fmtStars(e.canonical_stars)}★ canonical</span>`
        + (e.stars?` <span class="rcat-stars dim">${fmtStars(e.stars)}★ on fork</span>`:'')
      : `<span class="rcat-stars">${fmtStars(e.stars)}★</span>`;
    const desc=e.highlight||e.description||'';
    const sig=signalText(e);
    const meta=[];
    if(e.language) meta.push(esc(e.language));
    if(isFork && e.upstream&&e.upstream.full_name){
      meta.push(`fork of <a href="${esc(e.canonical_url)}">${esc(e.upstream.full_name)}</a>`);
      meta.push(`<a href="${esc(e.url)}">my fork</a>`);
    }else if(upMissing){
      meta.push('fork · upstream unavailable');
      meta.push(`<a href="${esc(e.url)}">${esc(e.full_name)}</a>`);
    }else if(!e.is_owned){
      meta.push(`<a href="${esc(e.canonical_url)}">${esc(canonName)}</a>`);
    }else{
      meta.push(`<a href="${esc(e.url)}">${esc(e.full_name)}</a>`);
    }
    if(sig) meta.push(esc(sig));
    const when=fmtDate(e.pushed_at||e.updated_at);
    return `<li class="rcat-row" data-id="${esc(e.id)}" data-facet="${facetOf(e)}" data-org="${e.is_org_contribution?'1':'0'}" data-archived="${e.is_archived?'1':'0'}">
      <div class="rcat-top">
        <a class="rcat-name" href="${esc(e.canonical_url||e.url)}">${esc(e.name)}</a>
        <span class="badge">${badge}</span>
        ${stars}
        ${when?`<time datetime="${esc(e.pushed_at||e.updated_at)}">${esc(when)}</time>`:''}
      </div>
      ${desc?`<p class="rcat-desc">${esc(desc)}</p>`:''}
      <p class="rcat-meta">${meta.join(' · ')}</p>
    </li>`;
  }).join('')+'</ul>';
}

export function applyView(entries, opts){
  return sortCatalog(filterCatalog(entries, opts), opts.sort||'updated');
}

export function mountCatalog(root, inventory){
  if(!root) return;
  const entries=inventory.catalog_entries||[];
  const scope=inventory.snapshot_label||'Public snapshot';
  root.innerHTML=`
    <p class="scope">Search and filter the snapshot (${esc(scope)}). Inventory file and audit links are at the bottom of this panel.</p>
    <div class="rcat-bar">
      <label class="rcat-search"><span class="sr">Search repositories</span>
        <input type="search" id="rcat-q" placeholder="Search name, language, description, upstream…" autocomplete="off">
      </label>
      <div class="filters" id="rcat-facets" role="tablist" aria-label="Repository filters">
        <button type="button" class="on" data-facet="all" aria-selected="true">All</button>
        <button type="button" data-facet="original" aria-selected="false">Originals</button>
        <button type="button" data-facet="fork" aria-selected="false">Forks</button>
        <button type="button" data-facet="org" aria-selected="false">Org contributions</button>
        <button type="button" data-facet="archived" aria-selected="false">Archived</button>
      </div>
      <label class="rcat-sort">Sort
        <select id="rcat-sort">
          <option value="updated">Updated</option>
          <option value="stars">Stars</option>
          <option value="name">Name</option>
        </select>
      </label>
    </div>
    <p class="rcat-count" id="rcat-count"></p>
    <div id="rcat-list"></div>
    <p class="src">Inventory: <a href="data/repos.json">data/repos.json</a>. Star counts and dates are from the 11 Nov 2026 21:30 Asia/Shanghai snapshot. Dates below are shown in Asia/Shanghai.</p>
  `;

  const q=root.querySelector('#rcat-q');
  const sort=root.querySelector('#rcat-sort');
  const list=root.querySelector('#rcat-list');
  const count=root.querySelector('#rcat-count');
  let facet='all';
  function paint(){
    const shown=applyView(entries, {query:q.value, facet, sort:sort.value});
    count.textContent=`Showing ${shown.length} of ${entries.length}`;
    list.innerHTML=renderEntries(shown);
  }
  root.querySelector('#rcat-facets').addEventListener('click',e=>{
    const b=e.target.closest('button[data-facet]'); if(!b) return;
    facet=b.dataset.facet;
    root.querySelectorAll('#rcat-facets button').forEach(x=>{
      const on=x===b; x.classList.toggle('on',on); x.setAttribute('aria-selected',on?'true':'false');
    });
    paint();
  });
  q.addEventListener('input',paint);
  sort.addEventListener('change',paint);
  paint();
  return {paint, get facet(){return facet}};
}

if(typeof document!=='undefined' && document.getElementById('rcat')){
  const root=document.getElementById('rcat');
  fetch('data/repos.json').then(r=>{
    if(!r.ok) throw new Error('repos.json '+r.status);
    return r.json();
  }).then(inv=>{
    mountCatalog(root, inv);
  }).catch(err=>{
    root.innerHTML='<p class="scope">The public repository catalog could not be loaded ('+esc(err.message)+'). This panel fetches data/repos.json and will not load if the page is opened as a local file.</p>';
  });
}
