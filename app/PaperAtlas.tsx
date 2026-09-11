"use client";

import { PointerEvent, WheelEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import discovered from "../data/discovered-papers.json";
import { connectedReadings, summarizeReadings } from "./paperSummaries";

type Source = {
  title: string;
  topic: string;
  kind: "Paper" | "LessWrong" | "Post";
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

const curatedSources: Source[] = [
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
  { title: "Confusion Around the Term Reward Hacking", topic: "Reward hacking", kind: "LessWrong", authors: "Ariana Azarbal", year: 2026, summary: "Separates misspecified-reward exploitation from task gaming and argues that the two failure modes require different interventions.", url: "https://www.lesswrong.com/posts/ixyokbwQEHgiHJYFW/confusion-around-the-term-reward-hacking" },
  { title: "Measuring Reward-Seeking via Contrastive Belief Updates", topic: "Reward hacking", kind: "Paper", authors: "Højmark et al.", year: 2026, summary: "Changes models’ beliefs about what a grader rewards to measure whether reinforcement learning produces a preference for reward over developer intent.", url: "https://arxiv.org/abs/2607.18966" },
  { title: "Lie Detector Oversight Announcement", topic: "Monitoring", kind: "Post", authors: "FAR.AI", year: 2026, summary: "Introduces results showing that training against lie detectors can reduce undetected deception as language models scale.", url: "https://x.com/farairesearch/status/2097788143839711361?s=20" },
  { title: "The Model Organism Lottery", topic: "Model organisms", kind: "Paper", authors: "Szablewski et al.", year: 2026, summary: "Shows that model-organism interpretability depends strongly on training methodology and may be unrealistically easy under post-hoc fine-tuning.", url: "https://arxiv.org/abs/2607.01033" },
  { title: "Hallucination Detection via Proxy Analyzers", topic: "Monitoring", kind: "Paper", authors: "Singh, Paudel & Roy", year: 2026, summary: "Uses the internal activations of small open-weight proxy models to detect hallucinations in outputs from both open and closed generators.", url: "https://arxiv.org/abs/2605.07209" },
  { title: "Surrogate Fidelity", topic: "Monitoring", kind: "Paper", authors: "Chlenski et al.", year: 2026, summary: "Tests when open models can explain closed ones and finds that agreement on predictions can overstate agreement on underlying attribution.", url: "https://arxiv.org/abs/2606.32008" },
  { title: "Activation Probes Surface Code-Security Signals", topic: "Monitoring", kind: "Paper", authors: "Ivan Wiryadi", year: 2026, summary: "Finds that activation probes on open-weight reviewers can reveal vulnerability signals missed by those reviewers’ explicit outputs.", url: "https://arxiv.org/abs/2608.09643" },
  { title: "A False Average", topic: "Obfuscation", kind: "Paper", authors: "Shiromani & Richter", year: 2026, summary: "Shows adversarial reasoning rewrites can sharply reduce chain-of-thought monitor detection while leaving harmful actions unchanged; the paper is withdrawn.", url: "https://arxiv.org/abs/2608.00583" },
  { title: "Why Do Models Task Game?", topic: "Reward hacking", kind: "LessWrong", authors: "Singh, Nanda & Rajamanoharan", year: 2026, summary: "Investigates how beliefs about oversight, grader capability, partial credit, and task completion causally shape task gaming.", url: "https://www.lesswrong.com/posts/HACauvWhEdC6QhdS4/why-do-models-task-game#Discussion" },
  { title: "Decomposing and Measuring Evaluation Awareness", topic: "Monitoring", kind: "Paper", authors: "Li et al.", year: 2026, summary: "Separates evaluation recognizability, model recognition, and behavioral response across nine frontier models and four benchmarks.", url: "https://arxiv.org/abs/2605.23055" },
  { title: "Training a Misaligned Reward Seeker", topic: "Model organisms", kind: "Post", authors: "Qi et al. / Anthropic", year: 2026, summary: "Trains a controlled reward-seeking organism that generalizes to reward tampering, harmful compliance, and monitor bypass when a grader is present.", url: "https://alignment.anthropic.com/2026/reward-seeker/" },
  { title: "Debate Training Reduces Reward Hacking in RLAIF", topic: "Reward hacking", kind: "Paper", authors: "Kenton et al.", year: 2026, summary: "Finds that adversarial debate between a generator and critic reduces exploitation of a weaker AI judge during reinforcement learning.", url: "https://arxiv.org/abs/2608.17776" },
  { title: "Do Activation Monitors Survive Model Updates?", topic: "Monitoring", kind: "Paper", authors: "Evan Duan", year: 2026, summary: "Benchmarks monitor staleness after quantization and fine-tuning, and finds that adaptation can substantially degrade frozen probes.", url: "https://arxiv.org/abs/2606.15980" },
  { title: "The Value Axis", topic: "Monitoring", kind: "Paper", authors: "Jiang, Kauvar & Lindsey", year: 2026, summary: "Identifies an activation direction that tracks whether a model internally represents its current strategy as likely to achieve its goal.", url: "https://arxiv.org/abs/2606.17056" },
  { title: "Off-Policy Honesty Training Generalizes Better", topic: "Model organisms", kind: "LessWrong", authors: "Chaurasia, Tan & Li", year: 2026, summary: "Finds stronger honesty transfer from off-policy self-report training, alongside a substantial cost to factual reliability.", url: "https://www.lesswrong.com/posts/isPKgCFSHdJ6fKYbK/off-policy-honesty-training-generalizes-better-than-on" },
  { title: "Prefill Awareness in Large Language Models", topic: "Monitoring", kind: "Paper", authors: "Wang et al.", year: 2026, summary: "Shows frontier models can sometimes recognize edited assistant context, complicating evaluations and control protocols that rely on prefilling.", url: "https://arxiv.org/abs/2606.12747" },
  { title: "Scaling Trends for Lie Detector Oversight", topic: "Monitoring", kind: "Paper", authors: "Hollinsworth et al.", year: 2026, summary: "Scales lie-detector oversight to larger models, finding lower undetected deception but sensitivity to distribution shift.", url: "https://arxiv.org/abs/2607.01567" },
  { title: "Held-out Monitors Sometimes Degrade", topic: "Monitoring", kind: "LessWrong", authors: "Joey Yudelson", year: 2026, summary: "Finds that training a policy against one monitor can also make its hacks appear less suspicious to monitors that were held out from training.", url: "https://www.lesswrong.com/posts/APkFfRp2AicL9RqvT/held-out-monitors-sometimes-degrade-even-when-not-trained" },
];
const sources = [...curatedSources, ...(discovered as Source[])];

const WIDTH = 6500;
const HEIGHT = 4200;
const topicCenters = [
  { x: 1200, y: 1200 },
  { x: 3200, y: 900 },
  { x: 5000, y: 900 },
  { x: 1400, y: 3300 },
  { x: 3000, y: 3100 },
  { x: 4300, y: 3100 },
  { x: 5500, y: 3100 },
];
const centers = topics.map((topic, index) => ({ ...topic, ...topicCenters[index] }));
const yearColors: Record<number, { band: string; label: string }> = {
  2023: { band: "#eadcff", label: "#7046ad" },
  2024: { band: "#d5eaff", label: "#2875ad" },
  2025: { band: "#d4f2df", label: "#287a4d" },
  2026: { band: "#ffe0c9", label: "#ad5428" },
};

function orderedTopicSources(topic: string) {
  return sources
    .map((item, insertionOrder) => ({ item, insertionOrder }))
    .filter(({ item }) => item.topic === topic)
    .sort((a, b) => a.item.year - b.item.year || a.insertionOrder - b.insertionOrder)
    .map(({ item }) => item);
}

function yearBands(topic: string) {
  const siblings = orderedTopicSources(topic);
  return [...new Set(siblings.map((source) => source.year))].map((year) => {
    const first = siblings.findIndex((source) => source.year === year);
    const last = siblings.findLastIndex((source) => source.year === year);
    const inner = first === 0 ? 92 : 160 + first * 14 - 7;
    const outer = 160 + last * 14 + (last === siblings.length - 1 ? 60 : 7);
    const colors = yearColors[year] || { band: "#e5e9e6", label: "#59635d" };
    return { year, radius: (inner + outer) / 2, width: outer - inner, outer, ...colors };
  });
}

function sourcePosition(source: Source) {
  const topicIndex = topics.findIndex((topic) => topic.name === source.topic);
  const center = centers[topicIndex];
  const siblings = orderedTopicSources(source.topic);
  const index = siblings.findIndex((item) => item.title === source.title);
  const angle = -Math.PI / 2 + index * 0.72;
  const radius = 160 + index * 14;
  return { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius, topicIndex };
}

const similarityStopwords = new Set(["about", "after", "against", "also", "from", "have", "into", "language", "large", "model", "models", "paper", "results", "show", "shows", "study", "their", "these", "they", "this", "through", "using", "with"]);

function sourceTerms(source: Source) {
  return new Set(`${source.title} ${source.summary}`.toLowerCase().match(/[a-z][a-z-]{3,}/g)?.filter((word) => !similarityStopwords.has(word)) || []);
}

const relatedEdges = (() => {
  const terms = sources.map(sourceTerms);
  const edges = new Map<string, { a: Source; b: Source; score: number }>();
  sources.forEach((source, index) => {
    const matches = sources.flatMap((candidate, candidateIndex) => {
      if (candidateIndex === index) return [];
      const overlap = [...terms[index]].filter((term) => terms[candidateIndex].has(term)).length;
      if (overlap < 2) return [];
      const score = overlap / Math.sqrt(terms[index].size * terms[candidateIndex].size);
      return score >= .16 ? [{ candidate, candidateIndex, score }] : [];
    }).sort((a, b) => b.score - a.score).slice(0, 2);
    matches.forEach(({ candidateIndex, score }) => {
      const [left, right] = index < candidateIndex ? [index, candidateIndex] : [candidateIndex, index];
      edges.set(`${left}-${right}`, { a: sources[left], b: sources[right], score });
    });
  });
  return [...edges.values()];
})();

export default function PaperAtlas({ onDatasets, onOrganisms }: { onDatasets: () => void; onOrganisms: () => void }) {
  const [selected, setSelected] = useState(sources[0]);
  const [summaryMode, setSummaryMode] = useState<"connected" | "category">("connected");
  const [summaryTopic, setSummaryTopic] = useState<string>(sources[0].topic);
  const [summaryCollapsed, setSummaryCollapsed] = useState(false);
  const [filter, setFilter] = useState("All topics");
  const [query, setQuery] = useState("");
  const plotRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 0.5 });
  const fitGraph = useCallback(() => {
    const plot = plotRef.current;
    if (!plot) return;
    const scale = Math.min(0.72, (plot.clientWidth - 36) / WIDTH, (plot.clientHeight - 36) / HEIGHT);
    setView({ x: (plot.clientWidth - WIDTH * scale) / 2, y: (plot.clientHeight - HEIGHT * scale) / 2, scale });
  }, []);
  useEffect(() => {
    fitGraph();
    const observer = new ResizeObserver(fitGraph);
    if (plotRef.current) observer.observe(plotRef.current);
    return () => observer.disconnect();
  }, [fitGraph]);
  const zoomAt = (nextScale: number, clientX?: number, clientY?: number) => {
    const rect = plotRef.current?.getBoundingClientRect();
    setView((current) => {
      const scale = Math.max(0.08, Math.min(2.2, nextScale));
      const focusX = clientX !== undefined && rect ? clientX - rect.left : (rect?.width || 0) / 2;
      const focusY = clientY !== undefined && rect ? clientY - rect.top : (rect?.height || 0) / 2;
      const ratio = scale / current.scale;
      return { x: focusX - (focusX - current.x) * ratio, y: focusY - (focusY - current.y) * ratio, scale };
    });
  };
  const startPan = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    dragRef.current = { x: event.clientX, y: event.clientY, originX: view.x, originY: view.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("dragging");
  };
  const movePan = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const drag = dragRef.current;
    setView((current) => ({ ...current, x: drag.originX + event.clientX - drag.x, y: drag.originY + event.clientY - drag.y }));
  };
  const endPan = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    event.currentTarget.classList.remove("dragging");
  };
  const wheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    zoomAt(view.scale * Math.exp(-event.deltaY * 0.0012), event.clientX, event.clientY);
  };
  const chooseTopic = (name: string) => {
    setFilter(name);
    if (name !== "All topics") { setSummaryMode("category"); setSummaryTopic(name); setSummaryCollapsed(false); }
    if (name !== "All topics") setSelected(sources.find((source) => source.topic === name) || sources[0]);
    const plot = plotRef.current;
    const topic = centers.find((item) => item.name === name);
    if (!plot || !topic) return fitGraph();
    const scale = Math.max(view.scale, 0.62);
    setView({ x: plot.clientWidth / 2 - topic.x * scale, y: plot.clientHeight / 2 - topic.y * scale, scale });
  };
  const visible = useMemo(() => sources.filter((source) => (filter === "All topics" || source.topic === filter) && `${source.title} ${source.topic} ${source.authors} ${source.kind}`.toLowerCase().includes(query.toLowerCase())), [filter, query]);
  const visibleTitles = new Set(visible.map((source) => source.title));
  const activeSource = visible.find((source) => source.url === selected.url) || visible[0];
  const activeTopic = visible.some((source) => source.topic === summaryTopic) ? summaryTopic : activeSource?.topic;
  const group = summaryMode === "connected"
    ? (activeSource ? connectedReadings(activeSource, visible, relatedEdges) : [])
    : visible.filter((source) => source.topic === activeTopic);
  const groupTitles = new Set(group.map((source) => source.title));
  const synthesis = summarizeReadings(group);
  const categoryBounds = centers.flatMap((topic) => {
    const members = visible.filter((source) => source.topic === topic.name);
    if (!members.length) return [];
    const points = [{ x: topic.x, y: topic.y }, ...members.map(sourcePosition)];
    const left = Math.min(...points.map((point) => point.x)) - 100;
    const top = Math.min(...points.map((point) => point.y)) - 125;
    return [{ ...topic, left, top, width: Math.max(...points.map((point) => point.x)) + 100 - left, height: Math.max(...points.map((point) => point.y)) + 100 - top, count: members.length }];
  });
  const selectReading = (source: Source) => {
    setSelected(source);
    setSummaryTopic(source.topic);
    setSummaryMode("connected");
    setSummaryCollapsed(false);
  };

  return <main className="app-shell organism-shell paper-shell">
    <header className="topbar">
      <button className="brand brand-switch" onClick={onDatasets} title="Switch to Dataset Atlas"><span className="brandmark paper-mark">P</span><span>Paper Atlas</span><em>beta</em><small>⇄ Dataset Atlas</small></button>
      <div className="search"><span>⌕</span><input aria-label="Search papers and LessWrong posts" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search papers, posts, topics, authors..."/>{query && <button className="search-clear" onClick={() => setQuery("")} aria-label="Clear search">×</button>}</div>
      <div className="top-actions"><button className="atlas-link-button" onClick={onOrganisms}>Organism Atlas →</button></div>
    </header>
    <section className="workspace">
      <aside className="filters"><div><p className="eyebrow">Explore</p><h1>The alignment<br/>paper landscape.</h1><p className="intro">A reading map connecting research topics to papers and LessWrong posts.</p></div><nav aria-label="Paper topics">
        <button onClick={() => chooseTopic("All topics")} className={filter === "All topics" ? "active" : ""}><span className="cat-dot" style={{background:"#17211d"}}/>All topics<b>{sources.length}</b></button>
        {topics.map((topic) => <button key={topic.name} onClick={() => chooseTopic(topic.name)} className={filter === topic.name ? "active" : ""}><span className="cat-dot" style={{background:topic.color}}/>{topic.name}<b>{sources.filter((source) => source.topic === topic.name).length}</b></button>)}
      </nav><div className="legend-note"><span>Topic → reading</span><p>Large circles are research topics. Smaller circles are papers and LessWrong posts selected as starting points.</p></div></aside>
      <section className="map paper-map" aria-label="Topics connected to papers and LessWrong posts">
        <div className="map-head"><div><span className="live-dot"/> {visible.length} readings visible</div><div className="network-key"><span><i className="paper-topic-swatch"/>Topic</span><span><i/>Paper</span><span><i className="lw-swatch"/>LessWrong</span></div><div className="organism-map-tools" aria-label="Map controls"><button onClick={() => zoomAt(view.scale * 1.25)} aria-label="Zoom in">+</button><button onClick={() => zoomAt(view.scale / 1.25)} aria-label="Zoom out">−</button><button onClick={fitGraph}>Fit</button></div></div>
        <div className="paper-plot" ref={plotRef} onWheel={wheel} onPointerDown={startPan} onPointerMove={movePan} onPointerUp={endPan} onPointerCancel={endPan} onDoubleClick={fitGraph}><div className="paper-canvas" style={{width:WIDTH,height:HEIGHT,transform:`translate(${view.x}px, ${view.y}px) scale(${view.scale})`}}><svg aria-hidden="true" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          {categoryBounds.map((topic) => <rect key={topic.name} className={`paper-category-boundary ${summaryMode === "category" && activeTopic === topic.name ? "active" : ""}`} x={topic.left} y={topic.top} width={topic.width} height={topic.height} rx="24" stroke={topic.color} style={{strokeWidth:(summaryMode === "category" && activeTopic === topic.name ? 2 : 1.2) / view.scale,strokeDasharray:`${7 / view.scale} ${5 / view.scale}`}}/>)}
          {centers.flatMap((topic) => yearBands(topic.name).map((band) => <g key={`${topic.name}-${band.year}`} className="paper-year-band"><circle cx={topic.x} cy={topic.y} r={band.radius} stroke={band.band} strokeWidth={band.width}/><text x={topic.x} y={topic.y - band.outer + 18} fill={band.label}>{band.year}</text></g>))}
          {relatedEdges.filter(({ a, b }) => visibleTitles.has(a.title) && visibleTitles.has(b.title)).map(({ a, b, score }) => { const start = sourcePosition(a); const end = sourcePosition(b); const active = groupTitles.has(a.title) && groupTitles.has(b.title); return <line key={`${a.title}-${b.title}`} className={`paper-related-line ${active ? "active" : "muted"}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} style={{strokeWidth:1.5 + score * 4}}/>; })}
        </svg>
          {categoryBounds.map((topic) => <button key={`summary-${topic.name}`} className="paper-category-label" style={{left:topic.left + 20,top:topic.top - 12 / view.scale,borderColor:topic.color,fontSize:10 / view.scale,padding:`${5 / view.scale}px ${7 / view.scale}px`}} onClick={() => { setSummaryTopic(topic.name); setSummaryMode("category"); setSummaryCollapsed(false); }} aria-label={`Summarize ${topic.name}`} aria-pressed={summaryMode === "category" && activeTopic === topic.name}>{topic.name} · {topic.count} ↗</button>)}
          {centers.map((topic) => <button key={topic.name} className={`paper-topic-node ${filter !== "All topics" && filter !== topic.name ? "muted" : ""}`} onClick={() => chooseTopic(topic.name)} style={{left:topic.x,top:topic.y,borderColor:topic.color}}><strong>{topic.name}</strong><small>{sources.filter((source) => source.topic === topic.name).length} readings</small></button>)}
          {sources.map((source) => { const position = sourcePosition(source); return <button key={source.title} title={source.title} onClick={() => selectReading(source)} tabIndex={visibleTitles.has(source.title) ? 0 : -1} aria-hidden={!visibleTitles.has(source.title)} className={`paper-source-node ${source.kind === "LessWrong" ? "lesswrong" : source.kind === "Post" ? "post" : ""} ${activeSource?.title === source.title ? "selected" : ""} ${groupTitles.has(source.title) ? "in-summary" : ""} ${visibleTitles.has(source.title) ? "" : "hidden"}`} style={{left:position.x,top:position.y,borderColor:topics[position.topicIndex].color}}><span>{source.title}</span><small>{source.kind}</small></button>; })}
          {!visible.length && <div className="empty">No readings match that search.<button onClick={() => {setQuery("");setFilter("All topics");}}>Show all readings</button></div>}
        </div></div>
        <section className={`paper-summary-card ${summaryCollapsed ? "collapsed" : ""}`} aria-label="Group summary">
          <div className="paper-summary-heading"><span className="eyebrow">Reading synthesis</span><button aria-label={summaryCollapsed ? "Expand summary" : "Collapse summary"} aria-expanded={!summaryCollapsed} onClick={() => setSummaryCollapsed(!summaryCollapsed)}>{summaryCollapsed ? "+" : "−"}</button></div>
          {!summaryCollapsed && <>
            <div className="paper-summary-tabs" aria-label="Summary scope"><button aria-pressed={summaryMode === "connected"} onClick={() => setSummaryMode("connected")}>Connected readings</button><button aria-pressed={summaryMode === "category"} onClick={() => setSummaryMode("category")}>Category</button></div>
            <div className="paper-summary-content" key={`${summaryMode}-${activeSource?.url}-${activeTopic}-${query}`}>
              <h2>{summaryMode === "category" ? activeTopic || "Category summary" : activeSource?.title || "No matching readings"}</h2>
              <p className="paper-summary-meta">{group.length} {group.length === 1 ? "reading" : "readings"} · {summaryMode === "connected" ? "Selected + directly linked" : "Visible category members"}</p>
              <p>{synthesis.overview}</p>
              {group.length > 1 && <div className="paper-summary-findings"><h3>Findings in this group</h3>{group.slice(0, 3).map((source) => <p key={source.url}>{source.summary} <a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></p>)}{group.length > 3 && <small>Showing 3 contributions; all {group.length} are available below.</small>}</div>}
              {!!synthesis.insights.length && <><h3>Insights to explore</h3><ul>{synthesis.insights.map((insight) => <li key={insight}>{insight}</li>)}</ul></>}
              <p className="paper-summary-method">Based on atlas descriptions; insights are inferred reading prompts. Connections indicate text similarity, not citations or agreement.</p>
              {!!group.length && <details><summary>Read all {group.length} contributions</summary><ol>{group.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><p>{source.summary}</p></li>)}</ol></details>}
            </div>
          </>}
        </section>
        <div className="map-foot"><span>Oldest → newest from center outward · drag to explore · scroll or pinch to zoom</span></div>
      </section>
      <aside className="detail">{activeSource ? <div className="organism-panel" key={activeSource.title}><div className="detail-top"><div className="dataset-icon organism-icon" style={{background:topics.find((topic) => topic.name === activeSource.topic)?.color}}>{activeSource.kind === "Paper" ? "PDF" : activeSource.kind === "LessWrong" ? "LW" : "↗"}</div></div><p className="detail-category"><span style={{background:topics.find((topic) => topic.name === activeSource.topic)?.color}}/>{activeSource.topic}</p><h2>{activeSource.title}</h2><p className="org">{activeSource.authors} · {activeSource.year} · {activeSource.kind}</p><p className="description">{activeSource.summary}</p><div className="lineage-card"><p className="eyebrow">Reading path</p><div><span className="lineage-base">{activeSource.topic}</span><b>→</b><span>{activeSource.kind}</span></div></div><div className="detail-section"><p className="eyebrow">About this topic</p><p className="organism-note">{topics.find((topic) => topic.name === activeSource.topic)?.summary}</p></div><a className="open-button" href={activeSource.url} target="_blank" rel="noreferrer">Open {activeSource.kind === "Paper" ? "paper" : "post"} <span>↗</span></a></div> : <p className="organism-note">No readings match your filters.</p>}</aside>
    </section>
  </main>;
}
