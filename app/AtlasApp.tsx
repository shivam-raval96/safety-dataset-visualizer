'use client';
import { useEffect, useState } from 'react';
import DatasetAtlas, { type Dataset, type HistoryEntry } from './DatasetAtlas';
import OrganismAtlas from './OrganismAtlas';
import './organism.css';
import { navigateAtlas, readAtlasRoute, type AtlasRoute } from './urlState';

export default function AtlasApp({datasets,history}:{datasets:Dataset[];history:HistoryEntry[]}){
  const [atlas,setAtlas]=useState<AtlasRoute>('datasets');
  useEffect(()=>{const sync=()=>setAtlas(readAtlasRoute().atlas);sync();window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync)},[]);
  if(atlas!=='datasets') return <OrganismAtlas initialView={atlas} onSwitch={()=>navigateAtlas('datasets',readAtlasRoute().view)}/>;
  return <div className="atlas-container"><DatasetAtlas datasets={datasets} history={history}/><button className="dataset-atlas-switch" onClick={()=>navigateAtlas('organisms')} aria-label="Switch to Organism Atlas" title="Switch to Organism Atlas"><span className="brandmark"><i/><i/><i/></span><span>Dataset Atlas</span><em>beta</em><small>⇄ Organism Atlas</small></button></div>;
}
