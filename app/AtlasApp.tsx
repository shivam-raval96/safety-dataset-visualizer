'use client';
import { useState } from 'react';
import DatasetAtlas, { type Dataset, type HistoryEntry } from './DatasetAtlas';
import OrganismAtlas from './OrganismAtlas';
import AtlasToggle, { type AtlasKind } from './AtlasToggle';
import './organism.css';

export default function AtlasApp({datasets,history}:{datasets:Dataset[];history:HistoryEntry[]}){
  const [atlas,setAtlas]=useState<AtlasKind>('dataset');
  if(atlas==='organism') return <OrganismAtlas onSwitch={setAtlas}/>;
  return <div className="atlas-container"><DatasetAtlas datasets={datasets} history={history}/><div className="dataset-atlas-switch"><AtlasToggle active="dataset" onChange={setAtlas}/></div></div>;
}
