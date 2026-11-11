/* Publications only. Content is visible without this file except paper filters. */
const PUB=[
[2026,"journal","OMC-bench and AtomBit-OMC: task-aligned benchmarks and robust, interpretable machine-learned interatomic potentials for organic molecular crystals","Equal-contribution coauthor, not a corresponding author. Affiliation on the paper: MindSpore Open-source Project, Huawei, Shenzhen. Team result.","npj Comput. Mater.","https://doi.org/10.1038/s41524-026-02315-3"],
[2026,"journal","Agentic, Autonomous Design Evolution of Machine-Learned Interatomic Potentials","Second author (Muyu Lu first). Affiliation on the paper: Huawei, Shenzhen. AutoResearch-MLIP; the paper reports the final G40 model as competitive with established baselines, not as a new state of the art.","Precision Chemistry","https://doi.org/10.1021/prechem.6c00099"],
[2026,"preprint","AgentDescent: Asynchronous Parallel Self-Evolution of LLM Agents by Merging Conflicting Edits","Sole-author preprint. See the project entry for the one reported setting I quote there.","Zenodo","https://doi.org/10.5281/zenodo.22348026"],
[2025,"journal","Tuning the ultimate strain of single and double network gels through reactive strand extension","Coauthor, 8th of 13 (Xujun Zheng first). Team result.","ACS Cent. Sci. · 12 cited","https://doi.org/10.1021/acscentsci.5c00932"],
[2025,"journal","Reduction of Kuhn Length upon Chain Extension","Coauthor, 2nd (Liel Sapir first). Venue is ACS Macro Letters, not Macromolecules.","ACS Macro Lett. · 6 cited","https://doi.org/10.1021/acsmacrolett.5c00550"],
[2024,"journal","Light-Induced Living Polymer Networks With Adaptive Functional Properties","Coauthor, 5th (Shixuan Wei first). Team result.","Adv. Mater. · 23 cited","https://doi.org/10.1002/adma.202313961"],
[2024,"thesis","Elasticity and Fracture of Polymer Networks with Entanglements and Weak Crosslinkers","Ph.D. dissertation, Duke (advisor Michael Rubinstein).","Thesis","https://search.proquest.com/openview/a7b88d838817b336a4bf31e938b5bd2c/1?pq-origsite=gscholar&cbl=18750&diss=y"],
[2023,"journal","Facile mechanochemical cycloreversion of polymer cross-linkers enhances tear resistance","Coauthor, 5th of 9 (Shu Wang first). Team result.","Science · 186 cited","https://doi.org/10.1126/science.adg3229"],
[2023,"journal","Elasticity of slide-ring gels","First author.","ACS Macro Lett. · 26 cited","https://doi.org/10.1021/acsmacrolett.3c00010"],
[2023,"journal","How a Chain Can Be Extended While Its Bonds Are Compressed","Coauthor, 3rd (Liel Sapir first).","ACS Macro Lett. · 2 cited","https://doi.org/10.1021/acsmacrolett.3c00097"],
[2023,"preprint","Strain Stiffening of Flexible Polymer Chains","ChemRxiv preprint of the 2025 Kuhn-length paper, not a separate journal article.","ChemRxiv","https://chemrxiv.org/doi/abs/10.26434/chemrxiv-2023-fllc8"]];

const APS=[
["Three Faces of Polymer Entanglements","APS March Meeting 2023 · 2 cited","https://ui.adsabs.harvard.edu/abs/2023APS..MARF12003R/abstract"],
["Unveiling the fracture mechanism for entangled polymer melts under extensional flow","APS March Meeting 2024","https://ui.adsabs.harvard.edu/abs/2024APS..MARQ26005C/abstract"],
["Transition from collective to pairwise entanglements","APS March Meeting 2023","https://ui.adsabs.harvard.edu/abs/2023APS..MARF15006C/abstract"],
["Bond Compression upon Chain Extension","APS / Bulletin of the APS 2023","https://ui.adsabs.harvard.edu/abs/2023APS..MARM15004S/abstract"],
["Chain Tension Dependence of the Kuhn Length","APS March Meeting 2022","https://ui.adsabs.harvard.edu/abs/2022APS..MARN18010S/abstract"],
["Theory and Simulation for elasticity of slide-ring gels","APS March Meeting 2022","https://ui.adsabs.harvard.edu/abs/2022APS..MARN17013C/abstract"]];

const KIND={journal:"Peer-reviewed",preprint:"Preprint",thesis:"Thesis"};

function renderPubs(f){
  const items=PUB.filter(p=>f==="all"||p[1]===f);
  plist.innerHTML=items.map(p=>`<li data-k="${p[1]}"><span class="y">${p[0]}</span><div><span class="kind">${KIND[p[1]]}</span><a class="t" href="${p[5]}">${p[2]}</a><div class="h">${p[3]}</div></div><span class="badge">${p[4]}</span></li>`).join('');
  document.getElementById('apsbox').hidden=!(f==="all"||f==="abstract");
}
renderPubs("all");
aps.innerHTML=APS.map(a=>`<a href="${a[2]}">${a[0]} · <b>${a[1]}</b></a>`).join("");
document.getElementById("pfilters").addEventListener("click",e=>{
  const b=e.target.closest("button[data-f]"); if(!b) return;
  document.querySelectorAll("#pfilters button").forEach(x=>{
    const on=x===b; x.classList.toggle("on",on); x.setAttribute("aria-selected",on?"true":"false");
  });
  renderPubs(b.dataset.f);
});
