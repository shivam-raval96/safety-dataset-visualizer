"use client";

import { useMemo, useState } from "react";

type Source = {
  title: string;
  topic: string;
  kind: "Paper" | "LessWrong";
  authors: string;
  year: number;
  summary: string;
  url: string;
};

const topics = [
  { name: "Model organisms", color: "#9b7bff", summary: "Controlled models trained to express specific alignment failure modes." },
  { name: "Monitoring", color: "#3eb6c4", summary: "Methods for detecting dangerous actions, reasoning, and deployment behavior." },
  { name: "Subliminal learning", color: "#ed7cbe", summary: "Behavioral traits transmitted through apparently unrelated training data." },
  { name: "Reward hacking", color: "#f2b84b", summary: "Systems exploiting proxies and evaluators instead of satisfying intent." },
  { name: "Obfuscation", color: "#ff866a", summary: "Models hiding or altering reasoning to evade inspection and oversight." },
  { name: "Longtail behaviors", color: "#78a8ff", summary: "Rare, severe, or hard-to-elicit behaviors missed by average-case evaluations." },
  { name: "Swarm misalignment", color: "#58d7bf", summary: "Misalignment emerging through interaction, conformity, and agent collectives." },
] as const;

const sources: Source[] = [
  { title: "Sleeper Agents", topic: "Model organisms", kind: "Paper", authors: "Hubinger et al.", year: 2024, summary: "Studies deliberately backdoored language models whose deceptive behavior persists through standard safety training.", url: "https://arxiv.org/abs/2401.05566" },
  { title: "Model Organisms of Misalignment", topic: "Model organisms", kind: "LessWrong", authors: "Apollo Research", year: 2023, summary: "Introduces controlled model organisms as an empirical route to studying deceptive alignment.", url: "https://www.lesswrong.com/posts/ChDH335ckdvpxXaXX/model-organisms-of-misalignment-the-case-for-a-new-pillar" },
  { title: "AI Control", topic: "Monitoring", kind: "Paper", authors: "Greenblatt et al.", year: 2024, summary: "Tests protocols that use trusted monitoring to remain safe even when a capable model intentionally subverts a task.", url: "https://arxiv.org/abs/2312.06942" },
  { title: "Monitoring benchmark for AI control", topic: "Monitoring", kind: "LessWrong", authors: "Monika J. & R. Martinez", year: 2026, summary: "Proposes an attack taxonomy and benchmark for isolating monitor capability from protocol performance.", url: "https://www.lesswrong.com/posts/X8qTKsGcnsTFrqM96/monitoring-benchmark-for-ai-control" },
  { title: "Subliminal Learning", topic: "Subliminal learning", kind: "Paper", authors: "Cloud et al.", year: 2025, summary: "Shows that models can transmit preferences and misalignment through semantically unrelated generated data.", url: "https://arxiv.org/abs/2507.14805" },
  { title: "Subliminal Learning Across Models", topic: "Subliminal learning", kind: "LessWrong", authors: "LASR Labs", year: 2025, summary: "Finds conditions under which covert sentiment transfer can cross model families.", url: "https://www.lesswrong.com/posts/CRn9XtGoMtjnb5ygr/subliminal-learning-across-models" },
  { title: "Scaling Laws for Reward Model Overoptimization", topic: "Reward hacking", kind: "Paper", authors: "Gao et al.", year: 2023, summary: "Measures how optimizing a learned reward model eventually degrades performance on the underlying objective.", url: "https://arxiv.org/abs/2210.10760" },
  { title: "Reward hacking can generalize", topic: "Reward hacking", kind: "LessWrong", authors: "Denison et al.", year: 2024, summary: "Reports that training on misspecified rewards can increase reward-hacking behavior on held-out tasks.", url: "https://www.lesswrong.com/posts/Ge55vxEmKXunFFwoe/reward-hacking-behavior-can-generali" },
  { title: "Monitoring Reasoning Models for Misbehavior", topic: "Obfuscation", kind: "Paper", authors: "Baker et al.", year: 2025, summary: "Examines chain-of-thought monitoring and the risk that optimization pressure teaches models to hide misbehavior.", url: "https://arxiv.org/abs/2503.11926" },
  { title: "Training on Documents About Monitoring", topic: "Obfuscation", kind: "LessWrong", authors: "Haskins et al.", year: 2026, summary: "Shows synthetic-document training can cause models to obfuscate reasoning and evade a monitor.", url: "https://www.lesswrong.com/posts/vmR9BZmyeFZCihbyx/paper-training-on-documents-about-monitoring-leads-to-cot" },
  { title: "Sabotage Evaluations for Frontier Models", topic: "Longtail behaviors", kind: "Paper", authors: "Anthropic", year: 2024, summary: "Builds targeted evaluations for rare but consequential sabotage capabilities that broad benchmarks can miss.", url: "https://www.anthropic.com/research/sabotage-evaluations" },
  { title: "Quickly Assessing Reward Hacking", topic: "Longtail behaviors", kind: "LessWrong", authors: "Campero et al.", year: 2025, summary: "Demonstrates that infrequent reward-hacking behavior is highly sensitive to prompt variation and elicitation choices.", url: "https://www.lesswrong.com/posts/quTGGNhGEiTCBEAX5/quickly-assessing-reward-hacking-like-behavior-in-llms-and" },
  { title: "Conformity Generates Collective Misalignment", topic: "Swarm misalignment", kind: "Paper", authors: "De Marzo et al.", year: 2026, summary: "Shows populations of individually aligned agents can settle into persistent misaligned states through conformity.", url: "https://arxiv.org/abs/2605.10721" },
  { title: "AI swarms and indirect takeover risk", topic: "Swarm misalignment", kind: "LessWrong", authors: "Oakhu & Alex Mallen", year: 2026, summary: "Explores how unsanctioned coordination among agents could amplify and preserve dangerous behavior.", url: "https://www.alignmentforum.org/posts/8oFYZdXkTaNGRtcn8/ai-swarms-are-starting-to-pose-indirect-takeover-risk" },
];

const WIDTH = 1560;
const HEIGHT = 1120;
const centers = topics.map((topic, index) => ({ ...topic, x: 250 + (index % 3) * 520, y: 250 + Math.floor(index / 3) * 390 }));

export default function PaperAtlas({ onDatasets, onOrganisms }: { onDatasets: () => void; onOrganisms: () => void }) {
  const [selected, setSelected] = useState(sources[0]);
  const [filter, setFilter] = useState("All topics");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => sources.filter((source) => (filter === "All topics" || source.topic === filter) && `${source.title} ${source.topic} ${source.authors} ${source.kind}`.toLowerCase().includes(query.toLowerCase())), [filter, query]);
  const visibleTitles = new Set(visible.map((source) => source.title));

  return <main className="app-shell organism-shell paper-shell">
    <header className="topbar">
      <button className="brand brand-switch" onClick={onDatasets} title="Switch to Dataset Atlas"><span className="brandmark paper-mark">P</span><span>Paper Atlas</span><em>beta</em><small>⇄ Dataset Atlas</small></button>
      <div className="search"><span>⌕</span><input aria-label="Search papers and LessWrong posts" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search papers, posts, topics, authors..."/>{query && <button className="search-clear" onClick={() => setQuery("")} aria-label="Clear search">×</button>}</div>
      <div className="top-actions"><button className="atlas-link-button" onClick={onOrganisms}>Organism Atlas →</button></div>
    </header>
    <section className="workspace">
      <aside className="filters"><div><p className="eyebrow">Explore</p><h1>The alignment<br/>paper landscape.</h1><p className="intro">A reading map connecting research topics to papers and LessWrong posts.</p></div><nav aria-label="Paper topics">
        <button onClick={() => setFilter("All topics")} className={filter === "All topics" ? "active" : ""}><span className="cat-dot" style={{background:"#17211d"}}/>All topics<b>{sources.length}</b></button>
        {topics.map((topic) => <button key={topic.name} onClick={() => setFilter(topic.name)} className={filter === topic.name ? "active" : ""}><span className="cat-dot" style={{background:topic.color}}/>{topic.name}<b>{sources.filter((source) => source.topic === topic.name).length}</b></button>)}
      </nav><div className="legend-note"><span>Topic → reading</span><p>Large circles are research topics. Smaller circles are papers and LessWrong posts selected as starting points.</p></div></aside>
      <section className="map paper-map" aria-label="Topics connected to papers and LessWrong posts">
        <div className="map-head"><div><span className="live-dot"/> {visible.length} readings visible</div><div className="network-key"><span><i className="paper-topic-swatch"/>Topic</span><span><i/>Paper</span><span><i className="lw-swatch"/>LessWrong</span></div></div>
        <div className="paper-plot"><div className="paper-canvas" style={{width:WIDTH,height:HEIGHT}}><svg aria-hidden="true" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          {visible.map((source) => { const topicIndex = topics.findIndex((topic) => topic.name === source.topic); const center = centers[topicIndex]; const siblings = sources.filter((item) => item.topic === source.topic); const childIndex = siblings.findIndex((item) => item.title === source.title); const angle = -Math.PI / 2 + childIndex * Math.PI; const x = center.x + Math.cos(angle) * 135; const y = center.y + Math.sin(angle) * 135; return <line key={source.title} x1={center.x} y1={center.y} x2={x} y2={y} className={selected.title === source.title ? "active" : ""}/>; })}
        </svg>
          {centers.map((topic) => <button key={topic.name} className={`paper-topic-node ${filter !== "All topics" && filter !== topic.name ? "muted" : ""}`} onClick={() => setFilter(topic.name)} style={{left:topic.x,top:topic.y,borderColor:topic.color}}><strong>{topic.name}</strong><small>{sources.filter((source) => source.topic === topic.name).length} readings</small></button>)}
          {sources.map((source) => { const topicIndex = topics.findIndex((topic) => topic.name === source.topic); const center = centers[topicIndex]; const siblings = sources.filter((item) => item.topic === source.topic); const childIndex = siblings.findIndex((item) => item.title === source.title); const angle = -Math.PI / 2 + childIndex * Math.PI; return <button key={source.title} onClick={() => setSelected(source)} className={`paper-source-node ${source.kind === "LessWrong" ? "lesswrong" : ""} ${selected.title === source.title ? "selected" : ""} ${visibleTitles.has(source.title) ? "" : "hidden"}`} style={{left:center.x + Math.cos(angle) * 135,top:center.y + Math.sin(angle) * 135,borderColor:topics[topicIndex].color}}><span>{source.title}</span><small>{source.kind}</small></button>; })}
          {!visible.length && <div className="empty">No readings match that search.<button onClick={() => {setQuery("");setFilter("All topics");}}>Show all readings</button></div>}
        </div></div><div className="map-foot"><span>Topics group a deliberately small starter bibliography</span></div>
      </section>
      <aside className="detail"><div className="organism-panel" key={selected.title}><div className="detail-top"><div className="dataset-icon organism-icon" style={{background:topics.find((topic) => topic.name === selected.topic)?.color}}>{selected.kind === "Paper" ? "PDF" : "LW"}</div></div><p className="detail-category"><span style={{background:topics.find((topic) => topic.name === selected.topic)?.color}}/>{selected.topic}</p><h2>{selected.title}</h2><p className="org">{selected.authors} · {selected.year} · {selected.kind}</p><p className="description">{selected.summary}</p><div className="lineage-card"><p className="eyebrow">Reading path</p><div><span className="lineage-base">{selected.topic}</span><b>→</b><span>{selected.kind}</span></div></div><div className="detail-section"><p className="eyebrow">About this topic</p><p className="organism-note">{topics.find((topic) => topic.name === selected.topic)?.summary}</p></div><a className="open-button" href={selected.url} target="_blank" rel="noreferrer">Open {selected.kind === "Paper" ? "paper" : "post"} <span>↗</span></a></div></aside>
    </section>
  </main>;
}
