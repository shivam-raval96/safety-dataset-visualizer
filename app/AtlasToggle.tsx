'use client';

export type AtlasKind='dataset'|'organism';

export default function AtlasToggle({active,onChange}:{active:AtlasKind;onChange:(atlas:AtlasKind)=>void}){
  return <div className="atlas-title-toggle" aria-label="Choose atlas">
    <span className={`brandmark ${active==='organism'?'organism-mark':''}`} aria-hidden="true"><i/><i/><i/></span>
    <div className="atlas-title-options">
      <button className={active==='dataset'?'active':''} aria-pressed={active==='dataset'} onClick={()=>onChange('dataset')}>Dataset Atlas</button>
      <span aria-hidden="true">/</span>
      <button className={active==='organism'?'active':''} aria-pressed={active==='organism'} onClick={()=>onChange('organism')}>Organism Atlas</button>
    </div>
    <em>beta</em>
  </div>;
}
