'use client';
import { useState } from 'react';
import DatasetAtlas, { type Dataset, type HistoryEntry } from './DatasetAtlas';
import OrganismAtlas from './OrganismAtlas';
import './organism.css';

export default function AtlasApp({datasets,history}:{datasets:Dataset[];history:HistoryEntry[]}){
  const [atlas,setAtlas]=useState<'dataset'|'organism'>('dataset');
  if(atlas==='organism') return <OrganismAtlas onSwitch={()=>setAtlas('dataset')}/>;
  return <div className="atlas-container"><DatasetAtlas datasets={datasets} history={history}/><button className="dataset-atlas-switch" onClick={()=>setAtlas('organism')} aria-label="Switch to Organism Atlas" title="Switch to Organism Atlas"><span className="brandmark"><i/><i/><i/></span><span>Dataset Atlas</span><em>beta</em><small>⇄ Organism Atlas</small></button></div>;
}
