'use client';
import { useEffect, useState } from 'react';
import DatasetAtlas, { type Dataset, type HistoryEntry } from './DatasetAtlas';
import OrganismAtlas from './OrganismAtlas';
import PaperAtlas from './PaperAtlas';
import './organism.css';
import { CommentsContext } from './CardComments';
import type { AtlasComment } from './comments';
import { navigateAtlas, readAtlasRoute, type AtlasRoute } from './urlState';

export default function AtlasApp({datasets,history,comments}:{datasets:Dataset[];history:HistoryEntry[];comments:AtlasComment[]}){
  return <CommentsContext.Provider value={comments}><AtlasContent datasets={datasets} history={history}/></CommentsContext.Provider>;
}

function AtlasContent({datasets,history}:{datasets:Dataset[];history:HistoryEntry[]}){
  const [atlas,setAtlas]=useState<AtlasRoute>('datasets');
  useEffect(()=>{const sync=()=>setAtlas(readAtlasRoute().atlas);sync();window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync)},[]);
  if(atlas==='papers') return <PaperAtlas onDatasets={()=>navigateAtlas('datasets')} onOrganisms={()=>navigateAtlas('organisms')}/>;
  if(atlas==='organisms'||atlas==='distills') return <OrganismAtlas initialView={atlas} onSwitch={()=>navigateAtlas('datasets',readAtlasRoute().view)} onPapers={()=>navigateAtlas('papers')}/>;
  return <div className="atlas-container"><DatasetAtlas datasets={datasets} history={history}/><div className="dataset-atlas-switch"><span className="brandmark"><i/><i/><i/></span><span>Dataset Atlas</span><em>beta</em><nav aria-label="Switch atlas"><button onClick={()=>navigateAtlas('organisms')}>Organism Atlas <span>→</span></button><button onClick={()=>navigateAtlas('papers')}>Paper Atlas <span>→</span></button></nav></div></div>;
}
