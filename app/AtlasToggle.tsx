'use client';

export type AtlasKind='dataset'|'organism';

export default function AtlasToggle({active,onChange}:{active:AtlasKind;onChange:(atlas:AtlasKind)=>void}){
  return <div className="atlas-title-toggle">
    <div className={`atlas-title-options ${active}`} role="group" aria-label="Choose atlas">
      <button className={active==='dataset'?'active':''} aria-pressed={active==='dataset'} onClick={()=>onChange('dataset')}>
        <span className="brandmark dataset-mark" aria-hidden="true"><i/><i/><i/></span><span>Dataset Atlas</span>
      </button>
      <button className={active==='organism'?'active':''} aria-pressed={active==='organism'} onClick={()=>onChange('organism')}>
        <span>Organism Atlas</span><span className="brandmark organism-mark" aria-hidden="true"><i/><i/><i/></span>
      </button>
    </div>
    <em>beta</em>
  </div>;
}
