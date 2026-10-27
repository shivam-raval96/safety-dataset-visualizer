"use client";
import Comments from "./CardComments";
import { navigateAtlas, readAtlasRoute } from "./urlState";

import { PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hierarchy, pack } from "d3-hierarchy";
import { forceCollide, forceSimulation, forceX, forceY, Simulation, SimulationNodeDatum } from "d3-force";
import curated from "../data/curated-papers.json";
import discovered from "../data/discovered-papers.json";
import paperHistory from "../data/paper-history.json";
import { paperRemovalBatches, paperRemovalIssueUrl } from "./paperRemoval";

type Source = {
  title: string;
  topic: string;
  kind: "Paper" | "LessWrong" | "Post";
  authors: string;
  year: number;
  publishedAt?: string;
  summary: string;
  url: string;
};

type PaperHistoryEntry = {
  date: string;
  papers: Pick<Source, "title" | "topic" | "kind" | "authors" | "url">[];
};

const history = paperHistory as PaperHistoryEntry[];

const topics = [
  { name: "Model organisms", color: "#7b6bb5", summary: "Controlled models trained to express specific alignment failure modes." },
  { name: "Monitoring", color: "#438f96", summary: "Methods for detecting dangerous actions, reasoning, and deployment behavior." },
  { name: "Monitor evasion", color: "#bd657d", summary: "Misaligned actions, sabotage, or deceptive reasoning that bypasses judges, overseers, or safety monitors." },
  { name: "Subliminal learning", color: "#c878a8", summary: "Behavioral traits transmitted through apparently unrelated training data." },
  { name: "Reward hacking", color: "#c79a3b", summary: "Systems exploiting proxies and evaluators instead of satisfying intent." },
  { name: "Obfuscation", color: "#cf745f", summary: "Models hiding or altering reasoning to evade inspection and oversight." },
  { name: "Longtail behaviors", color: "#6688b8", summary: "Rare, severe, or hard-to-elicit behaviors missed by average-case evaluations." },
  { name: "Swarm misalignment", color: "#4b9d89", summary: "Misalignment emerging through interaction, conformity, and agent collectives." },
  { name: "Model forensics", color: "#9f7957", summary: "Controlled evaluations that vary user cues, task framing, or environmental conditions to identify what changes a model’s behavior or choices and test explanations for misalignment." },
  { name: "Eval awareness", color: "#9f6f98", summary: "Whether models recognize evaluation contexts and change behavior between testing and deployment." },
  { name: "CoT faithfulness", color: "#527fa2", summary: "Methods that make chain-of-thought traces more causally connected to model answers and reduce unfaithful reasoning." },
  { name: "Secret loyalties", color: "#728553", summary: "Models covertly advancing a particular principal’s interests while concealing that allegiance from users, operators, or auditors." },
  { name: "Frontier misalignment", color: "#a85252", summary: "Empirical studies that elicit deceptive, harmful, power-seeking, or otherwise misaligned actions from closed frontier models." },
] as const;

const curatedSources: Source[] = curated.map((source) => ({ ...source, year: Number(source.year), kind: source.kind as Source["kind"] }));
const sources = [...curatedSources, ...(discovered as Source[])];
const sourceKey = (source: Source) => `${source.url}::${source.topic}::${source.title}`;

function publicationTimestamp(source: Source) {
  return Date.parse(source.publishedAt ? `${source.publishedAt}T00:00:00Z` : `${source.year}-01-01T00:00:00Z`);
}

function publicationLabel(source: Source) {
  if (!source.publishedAt) return String(source.year);
  return new Date(`${source.publishedAt}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

function sourceHue(color: string, kind: Source["kind"]) {
  if (kind === "LessWrong") return `color-mix(in oklch, ${color} 68%, #d47c52)`;
  if (kind === "Post") return `color-mix(in oklch, ${color} 68%, #4d8fa8)`;
  return `color-mix(in srgb, ${color} 68%, white)`;
}

// D3 packs each topic and its papers as a bubble group, then packs those groups
// together. A weighted topic leaf becomes the large colored title bubble.
const WIDTH = 2000;
const HEIGHT = 2000;
type PackDatum = { topicIndex?: number; source?: Source; value?: number; children?: PackDatum[] };
const packedRoot = pack<PackDatum>().size([WIDTH, HEIGHT]).padding(12)(hierarchy<PackDatum>({
  children: topics.map((topic, topicIndex) => ({
    topicIndex,
    children: [
      { topicIndex, value: 9 },
      ...sources.filter((source) => source.topic === topic.name).map((source) => ({ topicIndex, source, value: 1 })),
    ],
  })),
}).sum((datum) => datum.value || 0).sort((a, b) => (b.value || 0) - (a.value || 0)));
const packedTopics = packedRoot.children || [];
const packedLeaves = packedRoot.leaves();
const packedTopicLabels = packedLeaves.filter((node) => !node.data.source && node.data.topicIndex !== undefined);
const packedSources = new Map(packedLeaves.flatMap((node) => node.data.source ? [[sourceKey(node.data.source), node] as const] : []));
type ForcePaperNode = SimulationNodeDatum & { key: string; topicIndex: number; radius: number; targetX: number; targetY: number; originX: number; originY: number; obstacle: boolean };

export default function PaperAtlas({ onDatasets, onOrganisms }: { onDatasets: () => void; onOrganisms: () => void }) {
  const [display, setDisplay] = useState<"map" | "list">("map");
  useEffect(() => {
    const sync = () => setDisplay(readAtlasRoute().view);
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  const [selected, setSelected] = useState(sources[0]);
  const [detailView, setDetailView] = useState<"paper" | "history">("paper");
  const [filter, setFilter] = useState("All topics");
  const [query, setQuery] = useState("");
  const [removalSelection, setRemovalSelection] = useState<string[]>([]);
  const plotRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const paperNodeElementsRef = useRef(new Map<string, HTMLButtonElement>());
  const [forceNodes] = useState<ForcePaperNode[]>(() => [
    ...packedTopicLabels.map((node) => ({ key: `topic:${topics[node.data.topicIndex!].name}`, topicIndex: node.data.topicIndex!, radius: node.r + 5, targetX: node.x, targetY: node.y, originX: node.x, originY: node.y, x: node.x, y: node.y, fx: node.x, fy: node.y, obstacle: true })),
    ...sources.flatMap((source) => { const node = packedSources.get(sourceKey(source)); if (!node) return []; const topicNode = packedTopics.find((candidate) => candidate.data.topicIndex === node.data.topicIndex)!; return [{ key: sourceKey(source), topicIndex: node.data.topicIndex!, radius: node.r, targetX: topicNode.x, targetY: topicNode.y, originX: node.x, originY: node.y, x: node.x, y: node.y, obstacle: false }]; }),
  ]);
  const forceNodeByKey = useMemo(() => new Map(forceNodes.map((node) => [node.key, node])), [forceNodes]);
  const simulationRefs = useRef(new Map<number, Simulation<ForcePaperNode, undefined>>());
  const nodeDragRef = useRef<{ key: string; x: number; y: number; originX: number; originY: number; node: ForcePaperNode; target: HTMLButtonElement; moved: boolean } | null>(null);
  const suppressClickRef = useRef<string | null>(null);
  const viewRef = useRef({ x: 0, y: 0, scale: 0.5 });
  const frameRef = useRef<number | null>(null);
  const zoomSettleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paintedScaleRef = useRef<number | null>(null);
  // Camera motion does not change readings or summaries. Keep it off React's
  // render path and coalesce high-frequency pointer/trackpad events per frame.
  const setView = useCallback((next: typeof viewRef.current | ((current: typeof viewRef.current) => typeof viewRef.current)) => {
    viewRef.current = typeof next === "function" ? next(viewRef.current) : next;
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { x, y, scale } = viewRef.current;
      canvas.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      if (paintedScaleRef.current !== scale) {
        if (zoomSettleRef.current !== null) clearTimeout(zoomSettleRef.current);
        if (paintedScaleRef.current === null) {
          canvas.style.setProperty("--paper-inverse-scale", String(1 / scale));
          paintedScaleRef.current = scale;
        } else {
          // Resizing every label invalidates layout/rasterization during zoom.
          // Let labels travel with the layer, then restore their screen size.
          zoomSettleRef.current = setTimeout(() => {
            canvas.style.setProperty("--paper-inverse-scale", String(1 / viewRef.current.scale));
            paintedScaleRef.current = viewRef.current.scale;
            zoomSettleRef.current = null;
          }, 120);
        }
      }
    });
  }, []);
  const fitGraph = useCallback(() => {
    const plot = plotRef.current;
    if (!plot) return;
    // Keep the overview readable on ordinary screens. Previously the initial
    // fit could start below the minimum scale allowed by the zoom controls.
    const scale = Math.max(0.08, Math.min(0.72, (plot.clientWidth - 36) / WIDTH, (plot.clientHeight - 36) / HEIGHT));
    setView({ x: (plot.clientWidth - WIDTH * scale) / 2, y: (plot.clientHeight - HEIGHT * scale) / 2, scale });
  }, [setView]);
  const fitTopic = useCallback((name: string) => {
    const plot = plotRef.current;
    const topicIndex = topics.findIndex((topic) => topic.name === name);
    if (!plot || topicIndex < 0) return;
    const topicNode = packedTopics.find((node) => node.data.topicIndex === topicIndex);
    if (!topicNode) return;
    const clusterSize = topicNode.r * 2 + 80;
    const scale = Math.max(0.08, Math.min(0.9, (plot.clientWidth - 72) / clusterSize, (plot.clientHeight - 72) / clusterSize));
    setView({ x: plot.clientWidth / 2 - topicNode.x * scale, y: plot.clientHeight / 2 - topicNode.y * scale, scale });
  }, [setView]);
  useEffect(() => {
    fitGraph();
    const observer = new ResizeObserver(fitGraph);
    if (plotRef.current) observer.observe(plotRef.current);
    return () => {
      observer.disconnect();
      if (zoomSettleRef.current !== null) clearTimeout(zoomSettleRef.current);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [fitGraph]);
  useEffect(() => {
    const simulationMap = simulationRefs.current;
    const simulations = topics.map((_, topicIndex) => {
      const clusterNodes = forceNodes.filter((node) => node.topicIndex === topicIndex);
      const simulation = forceSimulation(clusterNodes)
        .velocityDecay(0.32)
        .alphaDecay(0.1)
        .force("x", forceX<ForcePaperNode>((node) => node.targetX).strength((node) => node.obstacle ? 0 : 0.2))
        .force("y", forceY<ForcePaperNode>((node) => node.targetY).strength((node) => node.obstacle ? 0 : 0.2))
        .force("collide", forceCollide<ForcePaperNode>((node) => node.radius + 3).strength(1).iterations(1))
        .on("tick", () => {
          for (const node of clusterNodes) {
          if (node.obstacle) continue;
          const element = paperNodeElementsRef.current.get(node.key);
          if (!element) continue;
            element.style.setProperty("--paper-dx", `${(node.x || 0) - node.originX}px`);
            element.style.setProperty("--paper-dy", `${(node.y || 0) - node.originY}px`);
          }
        });
      simulationMap.set(topicIndex, simulation);
      return simulation;
    });
    return () => { simulations.forEach((simulation) => simulation.stop()); simulationMap.clear(); };
  }, [forceNodes]);
  const zoomAt = useCallback((nextScale: number, clientX?: number, clientY?: number) => {
    const rect = plotRef.current?.getBoundingClientRect();
    setView((current) => {
      const scale = Math.max(0.08, Math.min(2.2, nextScale));
      const focusX = clientX !== undefined && rect ? clientX - rect.left : (rect?.width || 0) / 2;
      const focusY = clientY !== undefined && rect ? clientY - rect.top : (rect?.height || 0) / 2;
      const ratio = scale / current.scale;
      return { x: focusX - (focusX - current.x) * ratio, y: focusY - (focusY - current.y) * ratio, scale };
    });
  }, [setView]);
  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;
    const wheel = (event: globalThis.WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? plot.clientHeight : 1);
      zoomAt(viewRef.current.scale * Math.exp(-delta * 0.0012), event.clientX, event.clientY);
    };
    plot.addEventListener("wheel", wheel, { passive: false });
    return () => plot.removeEventListener("wheel", wheel);
  }, [zoomAt]);
  const startPan = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    dragRef.current = { x: event.clientX, y: event.clientY, originX: viewRef.current.x, originY: viewRef.current.y };
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
  const beginNodeDrag = (event: PointerEvent<HTMLButtonElement>, key: string) => {
    event.stopPropagation();
    const target = event.currentTarget;
    const node = forceNodeByKey.get(key);
    if (!node) return;
    node.fx = node.x;
    node.fy = node.y;
    nodeDragRef.current = { key, x: event.clientX, y: event.clientY, originX: node.x || 0, originY: node.y || 0, node, target, moved: false };
    simulationRefs.current.get(node.topicIndex)?.alphaTarget(0.35).restart();
    target.setPointerCapture(event.pointerId);
    target.classList.add("dragging");
  };
  const moveNode = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = nodeDragRef.current;
    if (!drag) return;
    event.stopPropagation();
    const dx = (event.clientX - drag.x) / viewRef.current.scale;
    const dy = (event.clientY - drag.y) / viewRef.current.scale;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    drag.node.fx = drag.originX + dx;
    drag.node.fy = drag.originY + dy;
    drag.target.style.setProperty("--paper-dx", `${(drag.node.fx || 0) - drag.node.originX}px`);
    drag.target.style.setProperty("--paper-dy", `${(drag.node.fy || 0) - drag.node.originY}px`);
  };
  const endNodeDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = nodeDragRef.current;
    if (!drag) return;
    event.stopPropagation();
    if (drag.moved) suppressClickRef.current = drag.key;
    drag.node.fx = null;
    drag.node.fy = null;
    simulationRefs.current.get(drag.node.topicIndex)?.alphaTarget(0).alpha(0.55).restart();
    drag.target.classList.remove("dragging");
    nodeDragRef.current = null;
  };
  const activateNode = (key: string, action: () => void) => {
    if (suppressClickRef.current === key) {
      suppressClickRef.current = null;
      return;
    }
    action();
  };
  const chooseTopic = (name: string) => {
    setFilter(name);
    if (name !== "All topics") { setSelected(sources.find((source) => source.topic === name) || sources[0]); setDetailView("paper"); }
    if (display === "map" && name !== "All topics") fitTopic(name);
    else fitGraph();
  };
  const visible = useMemo(() => sources.filter((source) => `${source.title} ${source.topic} ${source.authors} ${source.kind}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const listed = useMemo(() => visible.filter((source) => filter === "All topics" || source.topic === filter)
    .sort((a, b) => publicationTimestamp(b) - publicationTimestamp(a) || a.title.localeCompare(b.title)), [visible, filter]);
  const detailSources = display === "list" ? listed : visible;
  const activeSource = detailSources.find((source) => source.url === selected.url) || detailSources[0];
  const mapSources = visible;
  const selectReading = (source: Source) => {
    setSelected(source);
    setDetailView("paper");
  };
  const selectedForRemoval = removalSelection.flatMap((url) => {
    const source = sources.find((candidate) => candidate.url === url);
    return source ? [source] : [];
  });
  const removalBatches = paperRemovalBatches(selectedForRemoval);
  const toggleRemoval = (url: string) => setRemovalSelection((current) => current.includes(url) ? current.filter((item) => item !== url) : [...current, url]);

  return <main className="app-shell organism-shell paper-shell">
    <header className="topbar">
      <div className="brand dataset-atlas-switch inline-atlas-switch"><span className="brandmark paper-mark">P</span><span>Paper Atlas</span><em>beta</em><nav aria-label="Switch atlas"><button onClick={onDatasets}>Dataset Atlas <span>→</span></button><button onClick={onOrganisms}>Organism Atlas <span>→</span></button></nav></div>
      <div className="search"><span>⌕</span><input aria-label="Search papers and LessWrong posts" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search papers, posts, topics, authors..."/>{query && <button className="search-clear" onClick={() => setQuery("")} aria-label="Clear search">×</button>}</div>
      <div className="top-actions" />
    </header>
    <section className="workspace">
      <aside className="filters"><div><p className="eyebrow">Explore</p><h1>The alignment<br/>paper landscape.</h1><p className="intro">A reading map connecting research topics to papers and LessWrong posts.</p></div><nav aria-label="Paper topics">
        <button onClick={() => chooseTopic("All topics")} className={filter === "All topics" ? "active" : ""}><span className="cat-dot" style={{background:"#17211d"}}/>All topics<b>{sources.length}</b></button>
        {topics.map((topic) => <button key={topic.name} onClick={() => chooseTopic(topic.name)} className={filter === topic.name ? "active" : ""}><span className="cat-dot" style={{background:topic.color}}/>{topic.name}<b>{sources.filter((source) => source.topic === topic.name).length}</b></button>)}
      </nav><a className="sidebar-contribute" href="https://github.com/shivam-raval96/safety-dataset-visualizer/issues/new?template=paper-request.yml" target="_blank" rel="noreferrer">Add a paper <span>↗</span></a><div className="legend-note"><span>Topic → reading</span><p>Large circles are research topics. Paper dots use the category hue; LessWrong shifts warmer and other posts cooler.</p></div></aside>
      <section className="map paper-map" aria-label={display === "map" ? "Topics connected to papers and LessWrong posts" : "Paper list"}>
        <div className="map-head"><div className="map-head-left"><div className="view-toggle" aria-label="Paper atlas view"><button aria-pressed={display === "map"} onClick={() => navigateAtlas("papers", "map")}>Map</button><button aria-pressed={display === "list"} onClick={() => navigateAtlas("papers", "list")}>List</button></div><div aria-live="polite"><span className="live-dot"/> {display === "list" ? listed.length : mapSources.length} readings visible</div></div>{display === "map" && <div className="organism-map-tools" aria-label="Map controls"><button onClick={() => zoomAt(viewRef.current.scale * 1.25)} aria-label="Zoom in">+</button><button onClick={() => zoomAt(viewRef.current.scale / 1.25)} aria-label="Zoom out">−</button><button onClick={fitGraph}>Fit all</button></div>}</div>
        {display === "list" && <div className="paper-list">
          <div className="paper-bulk-actions">
            <button onClick={() => setRemovalSelection([...new Set(listed.map((source) => source.url))])}>Select visible</button>
            {!!removalSelection.length && <button onClick={() => setRemovalSelection([])}>Clear</button>}
            <span>{removalSelection.length} selected</span>
            {removalBatches.length === 1 && <a className="paper-remove-selected" href={paperRemovalIssueUrl(removalBatches[0])} target="_blank" rel="noreferrer">Remove selected ({removalBatches[0].length}) ↗</a>}
            {removalBatches.length > 1 && <details className="paper-remove-batches"><summary>Remove selected · {removalBatches.length} batches</summary><div>{removalBatches.map((batch, index) => <a key={batch[0].url} className="paper-remove-selected" href={paperRemovalIssueUrl(batch)} target="_blank" rel="noreferrer">Remove batch {index + 1}/{removalBatches.length} ({batch.length}) ↗</a>)}</div></details>}
          </div>
          {listed.length ? <ul aria-label="Papers">{listed.map((source) => <li key={source.url}>
            <button className={`paper-list-row ${activeSource?.url === source.url ? "active" : ""}`} aria-pressed={activeSource?.url === source.url} onClick={() => selectReading(source)}>
              <span className="paper-list-meta"><span><i style={{background:topics.find((topic) => topic.name === source.topic)?.color}}/>{source.topic}</span><span>{publicationLabel(source)} · {source.kind}</span></span>
              <strong>{source.title}</strong><span className="paper-list-authors">{source.authors}</span><span className="paper-list-description">{source.summary}</span>
            </button>
            <label className="paper-remove-select" title="Select for removal"><input type="checkbox" checked={removalSelection.includes(source.url)} onChange={() => toggleRemoval(source.url)} aria-label={`Select ${source.title} for removal`}/></label>
            <a className="paper-remove-button" href={paperRemovalIssueUrl(source)} target="_blank" rel="noreferrer" aria-label={`Remove ${source.title} from Paper Atlas`} title="Remove paper">×</a>
          </li>)}</ul> : <div className="empty">No readings match your filters.<button onClick={() => {setQuery("");setFilter("All topics");}}>Show all readings</button></div>}
        </div>}
        <div style={{opacity:display === "map" ? 1 : 0, pointerEvents:display === "map" ? "auto" : "none"}} aria-hidden={display !== "map"} inert={display !== "map"}>
        <div className="paper-plot" ref={plotRef} onPointerDown={startPan} onPointerMove={movePan} onPointerUp={endPan} onPointerCancel={endPan} onDoubleClick={fitGraph}><div className="paper-canvas paper-circle-canvas" ref={canvasRef} style={{width:WIDTH,height:HEIGHT}}>
          {packedTopics.map((node) => { const topicIndex = node.data.topicIndex!; const topic = topics[topicIndex]; return <div key={topic.name} className="paper-cluster-bubble" style={{left:node.x,top:node.y,width:node.r * 2,height:node.r * 2,borderColor:topic.color,background:`color-mix(in srgb, ${topic.color} 8%, white)`}}/>; })}
          {packedTopicLabels.map((node) => { const topicIndex = node.data.topicIndex!; const topic = topics[topicIndex]; const key = `topic:${topic.name}`; const count = mapSources.filter((source) => source.topic === topic.name).length; return <button key={topic.name} className={`paper-topic-node packed-topic-node ${count ? "" : "muted"}`} onClick={() => activateNode(key, () => chooseTopic(topic.name))} style={{left:node.x,top:node.y,width:node.r * 2,height:node.r * 2,borderColor:topic.color,background:topic.color}}><strong>{topic.name}</strong><small>{count}</small></button>; })}
          {mapSources.map((source) => { const key = sourceKey(source); const node = packedSources.get(key); const forceNode = forceNodeByKey.get(key); if (!node || !forceNode) return null; const topic = topics[node.data.topicIndex!]; return <button ref={(element) => { if (element) paperNodeElementsRef.current.set(key, element); else paperNodeElementsRef.current.delete(key); }} key={key} aria-label={`${source.title}, ${source.authors}, ${publicationLabel(source)}`} onPointerDown={(event) => beginNodeDrag(event, key)} onPointerMove={moveNode} onPointerUp={endNodeDrag} onPointerCancel={endNodeDrag} onClick={() => activateNode(key, () => selectReading(source))} className={`paper-source-node paper-circle-node ${source.kind.toLowerCase()} ${activeSource?.url === source.url ? "selected" : ""}`} style={{left:forceNode.originX,top:forceNode.originY,width:node.r * 2,height:node.r * 2,background:sourceHue(topic.color, source.kind)}}><span className="paper-node-tooltip" role="tooltip"><strong>{source.title}</strong><em>{source.kind} · {source.authors} · {publicationLabel(source)}</em></span></button>; })}
          {!visible.length && <div className="empty">No readings match that search.<button onClick={() => {setQuery("");setFilter("All topics");}}>Show all readings</button></div>}
        </div></div>
        <section className="paper-summary-card paper-selected-summary" aria-label="Selected paper summary">
          <div className="paper-summary-heading"><span className="eyebrow">Paper summary</span></div>
          {activeSource ? <div className="paper-summary-content" key={activeSource.url}>
            <h2>{activeSource.title}</h2>
            <p className="paper-summary-meta">{activeSource.authors} · {publicationLabel(activeSource)} · {activeSource.kind}</p>
            <p>{activeSource.summary}</p>
          </div> : <p className="paper-summary-content">No readings match your search.</p>}
        </section>
        <div className="map-foot"><span>Drag any circle to rearrange · hover for details · click to select · scroll or pinch to zoom</span></div>
        </div>
      </section>
      <aside className="detail">
        <div className="detail-tabs" role="tablist" aria-label="Paper details">
          <button role="tab" aria-selected={detailView === "paper"} className={detailView === "paper" ? "active" : ""} onClick={() => setDetailView("paper")}>Paper</button>
          <button role="tab" aria-selected={detailView === "history"} className={detailView === "history" ? "active" : ""} onClick={() => setDetailView("history")}>History</button>
        </div>
        {detailView === "history" ? (
          <div className="history-panel">
            <p className="eyebrow">Paper additions</p>
            <h2>History</h2>
            {history.length ? <div className="history-list">{history.map((entry) => (
              <section key={entry.date}>
                <div className="history-date"><time dateTime={entry.date}>{new Date(`${entry.date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time><b>{entry.papers.length}</b></div>
                {entry.papers.map((paper) => <div className="history-item" key={paper.url}><a href={paper.url} target="_blank" rel="noreferrer"><i style={{background:topics.find((topic) => topic.name === paper.topic)?.color}}/><span>{paper.title}<small>{paper.topic} · {paper.kind}</small></span><b>↗</b></a><a className="history-remove" href={paperRemovalIssueUrl(paper)} target="_blank" rel="noreferrer" aria-label={`Remove ${paper.title} from Paper Atlas`} title="Remove paper">×</a></div>)}
              </section>
            ))}</div> : <p className="history-empty">New papers and LessWrong posts found by the daily workflow will appear here.</p>}
          </div>
        ) : activeSource ? (
          <div className="organism-panel" key={activeSource.title}><div className="detail-top"><div className="dataset-icon organism-icon" style={{background:topics.find((topic) => topic.name === activeSource.topic)?.color}}>{activeSource.kind === "Paper" ? "PDF" : activeSource.kind === "LessWrong" ? "LW" : "↗"}</div></div><p className="detail-category"><span style={{background:topics.find((topic) => topic.name === activeSource.topic)?.color}}/>{activeSource.topic}</p><h2>{activeSource.title}</h2><p className="org">{activeSource.authors} · {activeSource.year} · {activeSource.kind}</p><p className="description">{activeSource.summary}</p><div className="lineage-card"><p className="eyebrow">Reading path</p><div><span className="lineage-base">{activeSource.topic}</span><b>→</b><span>{activeSource.kind}</span></div></div><div className="detail-section"><p className="eyebrow">About this topic</p><p className="organism-note">{topics.find((topic) => topic.name === activeSource.topic)?.summary}</p></div><a className="open-button" href={activeSource.url} target="_blank" rel="noreferrer">Open {activeSource.kind === "Paper" ? "paper" : "post"} <span>↗</span></a><Comments kind="paper" title={activeSource.title} url={activeSource.url}/></div>
        ) : <p className="organism-note">No readings match your filters.</p>}
      </aside>
    </section>
  </main>;
}
