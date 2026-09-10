"use client";

import { useMemo, useRef, useState } from "react";
import discovered from "../data/discovered-papers.json";

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

const WIDTH = 2700;
const HEIGHT = 2450;
const centers = topics.map((topic, index) => ({ ...topic, x: 450 + (index % 3) * 900, y: 470 + Math.floor(index / 3) * 800 }));

function sourcePosition(source: Source) {
  const topicIndex = topics.findIndex((topic) => topic.name === source.topic);
  const center = centers[topicIndex];
  const siblings = sources.filter((item) => item.topic === source.topic);
  const index = siblings.findIndex((item) => item.title === source.title);
  const ring = Math.floor(index / 10);
  const count = Math.min(10, siblings.length - ring * 10);
  const angle = -Math.PI / 2 + ((index % 10) * Math.PI * 2) / count + ring * 0.18;
  const radius = 160 + ring * 110;
  return { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius, topicIndex };
}

export default function PaperAtlas({ onDatasets, onOrganisms }: { onDatasets: () => void; onOrganisms: () => void }) {
  const [selected, setSelected] = useState(sources[0]);
  const [filter, setFilter] = useState("All topics");
  const [query, setQuery] = useState("");
  const plotRef = useRef<HTMLDivElement>(null);
  const chooseTopic = (name: string) => {
    setFilter(name);
    if (name !== "All topics") setSelected(sources.find((source) => source.topic === name) || sources[0]);
    requestAnimationFrame(() => {
      const plot = plotRef.current;
      const canvas = plot?.querySelector<HTMLElement>(".paper-canvas");
      const topic = centers.find((item) => item.name === name);
      if (!plot || !canvas || !topic) return plot?.scrollTo({ left: 0, top: 0, behavior: "smooth" });
      const scale = canvas.getBoundingClientRect().width / WIDTH;
      plot.scrollTo({ left: topic.x * scale - plot.clientWidth / 2, top: topic.y * scale - plot.clientHeight / 2, behavior: "smooth" });
    });
  };
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
        <button onClick={() => chooseTopic("All topics")} className={filter === "All topics" ? "active" : ""}><span className="cat-dot" style={{background:"#17211d"}}/>All topics<b>{sources.length}</b></button>
        {topics.map((topic) => <button key={topic.name} onClick={() => chooseTopic(topic.name)} className={filter === topic.name ? "active" : ""}><span className="cat-dot" style={{background:topic.color}}/>{topic.name}<b>{sources.filter((source) => source.topic === topic.name).length}</b></button>)}
      </nav><div className="legend-note"><span>Topic → reading</span><p>Large circles are research topics. Smaller circles are papers and LessWrong posts selected as starting points.</p></div></aside>
      <section className="map paper-map" aria-label="Topics connected to papers and LessWrong posts">
        <div className="map-head"><div><span className="live-dot"/> {visible.length} readings visible</div><div className="network-key"><span><i className="paper-topic-swatch"/>Topic</span><span><i/>Paper</span><span><i className="lw-swatch"/>LessWrong</span></div></div>
        <div className="paper-plot" ref={plotRef}><div className="paper-canvas" style={{width:WIDTH,height:HEIGHT}}><svg aria-hidden="true" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          {visible.map((source) => { const position = sourcePosition(source); const center = centers[position.topicIndex]; return <line key={source.title} x1={center.x} y1={center.y} x2={position.x} y2={position.y} className={selected.title === source.title ? "active" : ""}/>; })}
        </svg>
          {centers.map((topic) => <button key={topic.name} className={`paper-topic-node ${filter !== "All topics" && filter !== topic.name ? "muted" : ""}`} onClick={() => chooseTopic(topic.name)} style={{left:topic.x,top:topic.y,borderColor:topic.color}}><strong>{topic.name}</strong><small>{sources.filter((source) => source.topic === topic.name).length} readings</small></button>)}
          {sources.map((source) => { const position = sourcePosition(source); return <button key={source.title} onClick={() => setSelected(source)} className={`paper-source-node ${source.kind === "LessWrong" ? "lesswrong" : source.kind === "Post" ? "post" : ""} ${selected.title === source.title ? "selected" : ""} ${visibleTitles.has(source.title) ? "" : "hidden"}`} style={{left:position.x,top:position.y,borderColor:topics[position.topicIndex].color}}><span>{source.title}</span><small>{source.kind}</small></button>; })}
          {!visible.length && <div className="empty">No readings match that search.<button onClick={() => {setQuery("");setFilter("All topics");}}>Show all readings</button></div>}
        </div></div><div className="map-foot"><span>Topics group a deliberately small starter bibliography</span></div>
      </section>
      <aside className="detail"><div className="organism-panel" key={selected.title}><div className="detail-top"><div className="dataset-icon organism-icon" style={{background:topics.find((topic) => topic.name === selected.topic)?.color}}>{selected.kind === "Paper" ? "PDF" : selected.kind === "LessWrong" ? "LW" : "↗"}</div></div><p className="detail-category"><span style={{background:topics.find((topic) => topic.name === selected.topic)?.color}}/>{selected.topic}</p><h2>{selected.title}</h2><p className="org">{selected.authors} · {selected.year} · {selected.kind}</p><p className="description">{selected.summary}</p><div className="lineage-card"><p className="eyebrow">Reading path</p><div><span className="lineage-base">{selected.topic}</span><b>→</b><span>{selected.kind}</span></div></div><div className="detail-section"><p className="eyebrow">About this topic</p><p className="organism-note">{topics.find((topic) => topic.name === selected.topic)?.summary}</p></div><a className="open-button" href={selected.url} target="_blank" rel="noreferrer">Open {selected.kind === "Paper" ? "paper" : "post"} <span>↗</span></a></div></aside>
    </section>
  </main>;
}
