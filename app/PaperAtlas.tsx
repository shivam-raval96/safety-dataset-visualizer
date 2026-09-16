"use client";
import Comments from "./CardComments";
import { navigateAtlas, readAtlasRoute } from "./urlState";

import { PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import curated from "../data/curated-papers.json";
import discovered from "../data/discovered-papers.json";
import paperHistory from "../data/paper-history.json";
import { connectedReadings, partitionReadings, summarizeReadings } from "./paperSummaries";
import { BULK_REMOVAL_LIMIT, paperRemovalIssueUrl } from "./paperRemoval";

type Source = {
  title: string;
  topic: string;
  kind: "Paper" | "LessWrong" | "Post";
  authors: string;
  year: number;
  summary: string;
  url: string;
};

type PaperHistoryEntry = {
  date: string;
  papers: Pick<Source, "title" | "topic" | "kind" | "authors" | "url">[];
};

const history = paperHistory as PaperHistoryEntry[];

const topics = [
  { name: "Model organisms", color: "#9b7bff", summary: "Controlled models trained to express specific alignment failure modes." },
  { name: "Monitoring", color: "#3eb6c4", summary: "Methods for detecting dangerous actions, reasoning, and deployment behavior." },
  { name: "Subliminal learning", color: "#ed7cbe", summary: "Behavioral traits transmitted through apparently unrelated training data." },
  { name: "Reward hacking", color: "#f2b84b", summary: "Systems exploiting proxies and evaluators instead of satisfying intent." },
  { name: "Obfuscation", color: "#ff866a", summary: "Models hiding or altering reasoning to evade inspection and oversight." },
  { name: "Longtail behaviors", color: "#78a8ff", summary: "Rare, severe, or hard-to-elicit behaviors missed by average-case evaluations." },
  { name: "Swarm misalignment", color: "#58d7bf", summary: "Misalignment emerging through interaction, conformity, and agent collectives." },
  { name: "Model forensics", color: "#bd854f", summary: "Controlled evaluations that vary user cues, task framing, or environmental conditions to identify what changes a model’s behavior or choices and test explanations for misalignment." },
] as const;

const curatedSources: Source[] = curated.map((source) => ({ ...source, year: Number(source.year), kind: source.kind as Source["kind"] }));
const sources = [...curatedSources, ...(discovered as Source[])];

// The review backlog contains several hundred readings. Keep the original
// single temporal spiral per topic, but give the three large clusters enough
// room that their outer years do not collide with neighboring topics.
const WIDTH = 15000;
const HEIGHT = 16000;
const topicCenters = [
  { x: 4500, y: 4500 },
  { x: 10500, y: 3000 },
  { x: 5000, y: 11500 },
  { x: 10500, y: 9000 },
  { x: 10000, y: 13500 },
  { x: 12500, y: 14500 },
  { x: 7500, y: 12500 },
  { x: 2500, y: 10500 },
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

const readingGroups = centers.flatMap((topic) => partitionReadings(orderedTopicSources(topic.name), sourcePosition).map((group, index) => ({
  ...group, id: `${topic.name}-${index}`, name: `${topic.name} · Group ${index + 1}`, color: topic.color,
})));

export default function PaperAtlas({ onDatasets, onOrganisms }: { onDatasets: () => void; onOrganisms: () => void }) {
  const [display, setDisplay] = useState<"map" | "list">("map");
  useEffect(() => {
    const sync = () => setDisplay(readAtlasRoute().view);
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  const [selected, setSelected] = useState(sources[0]);
  const [summaryMode, setSummaryMode] = useState<"connected" | "group">("connected");
  const [summaryGroup, setSummaryGroup] = useState(readingGroups[0].id);
  const [summaryCollapsed, setSummaryCollapsed] = useState(false);
  const [detailView, setDetailView] = useState<"paper" | "history">("paper");
  const [filter, setFilter] = useState("All topics");
  const [query, setQuery] = useState("");
  const [removalSelection, setRemovalSelection] = useState<string[]>([]);
  const plotRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
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
    const scale = Math.min(0.72, (plot.clientWidth - 36) / WIDTH, (plot.clientHeight - 36) / HEIGHT);
    setView({ x: (plot.clientWidth - WIDTH * scale) / 2, y: (plot.clientHeight - HEIGHT * scale) / 2, scale });
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
  const chooseTopic = (name: string) => {
    setFilter(name);
    if (name !== "All topics") { setSummaryMode("group"); setSummaryGroup(readingGroups.find((group) => group.members[0].topic === name)?.id || readingGroups[0].id); setSummaryCollapsed(false); }
    if (name !== "All topics") { setSelected(sources.find((source) => source.topic === name) || sources[0]); setDetailView("paper"); }
    const plot = plotRef.current;
    const topic = centers.find((item) => item.name === name);
    if (!plot || !topic) return fitGraph();
    const scale = Math.max(viewRef.current.scale, 0.62);
    setView({ x: plot.clientWidth / 2 - topic.x * scale, y: plot.clientHeight / 2 - topic.y * scale, scale });
  };
  const visible = useMemo(() => sources.filter((source) => `${source.title} ${source.topic} ${source.authors} ${source.kind}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const listed = useMemo(() => visible.filter((source) => filter === "All topics" || source.topic === filter)
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title)), [visible, filter]);
  const detailSources = display === "list" ? listed : visible;
  const visibleTitles = new Set(visible.map((source) => source.title));
  const activeSource = detailSources.find((source) => source.url === selected.url) || detailSources[0];
  const visibleGroups = readingGroups.map((group) => ({ ...group, members: group.members.filter((source) => visibleTitles.has(source.title)) })).filter((group) => group.members.length);
  const activeGroup = visibleGroups.find((group) => group.id === summaryGroup) || visibleGroups.find((group) => group.members.includes(activeSource)) || visibleGroups[0];
  const group = summaryMode === "connected"
    ? (activeSource ? connectedReadings(activeSource, visible, relatedEdges) : [])
    : activeGroup?.members || [];
  const groupTitles = new Set(group.map((source) => source.title));
  const synthesis = summarizeReadings(group);
  const selectReading = (source: Source) => {
    setSelected(source);
    setDetailView("paper");
    setSummaryGroup(readingGroups.find((group) => group.members.includes(source))?.id || readingGroups[0].id);
    setSummaryMode("connected");
    setSummaryCollapsed(false);
  };
  const selectedForRemoval = removalSelection.flatMap((url) => {
    const source = sources.find((candidate) => candidate.url === url);
    return source ? [source] : [];
  });
  const toggleRemoval = (url: string) => setRemovalSelection((current) => current.includes(url) ? current.filter((item) => item !== url) : current.length < BULK_REMOVAL_LIMIT ? [...current, url] : current);

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
      </nav><a className="sidebar-contribute" href="https://github.com/shivam-raval96/safety-dataset-visualizer/issues/new?template=paper-request.yml" target="_blank" rel="noreferrer">Add a paper <span>↗</span></a><div className="legend-note"><span>Topic → reading</span><p>Large circles are research topics. Smaller circles are papers and LessWrong posts selected as starting points.</p></div></aside>
      <section className="map paper-map" aria-label={display === "map" ? "Topics connected to papers and LessWrong posts" : "Paper list"}>
        <div className="map-head"><div className="map-head-left"><div className="view-toggle" aria-label="Paper atlas view"><button aria-pressed={display === "map"} onClick={() => navigateAtlas("papers", "map")}>Map</button><button aria-pressed={display === "list"} onClick={() => navigateAtlas("papers", "list")}>List</button></div><div aria-live="polite"><span className="live-dot"/> {display === "list" ? listed.length : visible.length} readings visible</div></div>{display === "map" && <><div className="network-key"><span><i className="paper-topic-swatch"/>Topic</span><span><i/>Paper</span><span><i className="lw-swatch"/>LessWrong</span></div><div className="organism-map-tools" aria-label="Map controls"><button onClick={() => zoomAt(viewRef.current.scale * 1.25)} aria-label="Zoom in">+</button><button onClick={() => zoomAt(viewRef.current.scale / 1.25)} aria-label="Zoom out">−</button><button onClick={fitGraph}>Fit</button></div></>}</div>
        {display === "list" && <div className="paper-list">
          <div className="paper-bulk-actions">
            <button onClick={() => setRemovalSelection(listed.slice(0, BULK_REMOVAL_LIMIT).map((source) => source.url))}>Select visible{listed.length > BULK_REMOVAL_LIMIT ? ` (first ${BULK_REMOVAL_LIMIT})` : ""}</button>
            {!!removalSelection.length && <button onClick={() => setRemovalSelection([])}>Clear</button>}
            <span>{removalSelection.length} selected · max {BULK_REMOVAL_LIMIT}</span>
            {selectedForRemoval.length > 0 && <a className="paper-remove-selected" href={paperRemovalIssueUrl(selectedForRemoval)} target="_blank" rel="noreferrer">Remove selected ({selectedForRemoval.length}) ↗</a>}
          </div>
          {listed.length ? <ul aria-label="Papers">{listed.map((source) => <li key={source.url}>
            <button className={`paper-list-row ${activeSource?.url === source.url ? "active" : ""}`} aria-pressed={activeSource?.url === source.url} onClick={() => selectReading(source)}>
              <span className="paper-list-meta"><span><i style={{background:topics.find((topic) => topic.name === source.topic)?.color}}/>{source.topic}</span><span>{source.year} · {source.kind}</span></span>
              <strong>{source.title}</strong><span className="paper-list-authors">{source.authors}</span><span className="paper-list-description">{source.summary}</span>
            </button>
            <label className="paper-remove-select" title="Select for removal"><input type="checkbox" checked={removalSelection.includes(source.url)} disabled={!removalSelection.includes(source.url) && removalSelection.length >= BULK_REMOVAL_LIMIT} onChange={() => toggleRemoval(source.url)} aria-label={`Select ${source.title} for removal`}/></label>
            <a className="paper-remove-button" href={paperRemovalIssueUrl(source)} target="_blank" rel="noreferrer" aria-label={`Remove ${source.title} from Paper Atlas`} title="Remove paper">×</a>
          </li>)}</ul> : <div className="empty">No readings match your filters.<button onClick={() => {setQuery("");setFilter("All topics");}}>Show all readings</button></div>}
        </div>}
        <div style={{opacity:display === "map" ? 1 : 0, pointerEvents:display === "map" ? "auto" : "none"}} aria-hidden={display !== "map"} inert={display !== "map"}>
        <div className="paper-plot" ref={plotRef} onPointerDown={startPan} onPointerMove={movePan} onPointerUp={endPan} onPointerCancel={endPan} onDoubleClick={fitGraph}><div className="paper-canvas" ref={canvasRef} style={{width:WIDTH,height:HEIGHT}}><svg aria-hidden="true" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          {centers.flatMap((topic) => yearBands(topic.name).map((band) => <g key={`${topic.name}-${band.year}`} className="paper-year-band"><circle cx={topic.x} cy={topic.y} r={band.radius} stroke={band.band} strokeWidth={band.width}/><text x={topic.x} y={topic.y - band.outer + 18} fill={band.label}>{band.year}</text></g>))}
          {visibleGroups.map((topic) => <rect key={topic.id} data-group-id={topic.id} data-count={topic.members.length} className={`paper-category-boundary ${summaryMode === "group" && activeGroup?.id === topic.id ? "active" : ""}`} x={topic.left} y={topic.top} width={topic.right - topic.left} height={topic.bottom - topic.top} rx="24" stroke={topic.color}/>)}
          {relatedEdges.filter(({ a, b }) => visibleTitles.has(a.title) && visibleTitles.has(b.title)).map(({ a, b, score }) => { const start = sourcePosition(a); const end = sourcePosition(b); const active = groupTitles.has(a.title) && groupTitles.has(b.title); return <line key={`${a.title}-${b.title}`} className={`paper-related-line ${active ? "active" : "muted"}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} style={{strokeWidth:1.5 + score * 4}}/>; })}
        </svg>
          {visibleGroups.map((topic) => <button key={`summary-${topic.id}`} className="paper-category-label" style={{left:topic.left + 20,top:topic.top - 10,borderColor:topic.color}} onClick={() => { setSummaryGroup(topic.id); setSummaryMode("group"); setSummaryCollapsed(false); }} aria-label={`Summarize ${topic.name}`} aria-pressed={summaryMode === "group" && activeGroup?.id === topic.id} title={`${topic.name} · ${topic.members.length} papers`}>{topic.members.length} ↗</button>)}
          {centers.map((topic) => <button key={topic.name} className={`paper-topic-node ${filter !== "All topics" && filter !== topic.name ? "muted" : ""}`} onClick={() => chooseTopic(topic.name)} style={{left:topic.x,top:topic.y,borderColor:topic.color}}><strong>{topic.name}</strong><small>{sources.filter((source) => source.topic === topic.name).length} readings</small></button>)}
          {sources.map((source) => { const position = sourcePosition(source); return <button key={source.title} title={source.title} onClick={() => selectReading(source)} tabIndex={visibleTitles.has(source.title) ? 0 : -1} aria-hidden={!visibleTitles.has(source.title)} className={`paper-source-node ${source.kind === "LessWrong" ? "lesswrong" : source.kind === "Post" ? "post" : ""} ${activeSource?.title === source.title ? "selected" : ""} ${groupTitles.has(source.title) ? "in-summary" : ""} ${visibleTitles.has(source.title) ? "" : "hidden"}`} style={{left:position.x,top:position.y,borderColor:topics[position.topicIndex].color}}><span>{source.title}</span><small>{source.kind}</small></button>; })}
          {!visible.length && <div className="empty">No readings match that search.<button onClick={() => {setQuery("");setFilter("All topics");}}>Show all readings</button></div>}
        </div></div>
        <section className={`paper-summary-card ${summaryCollapsed ? "collapsed" : ""}`} aria-label="Group summary">
          <div className="paper-summary-heading"><span className="eyebrow">Reading synthesis</span><button aria-label={summaryCollapsed ? "Expand summary" : "Collapse summary"} aria-expanded={!summaryCollapsed} onClick={() => setSummaryCollapsed(!summaryCollapsed)}>{summaryCollapsed ? "+" : "−"}</button></div>
          {!summaryCollapsed && <>
            <div className="paper-summary-tabs" aria-label="Summary scope"><button aria-pressed={summaryMode === "connected"} onClick={() => setSummaryMode("connected")}>Connected readings</button><button aria-pressed={summaryMode === "group"} onClick={() => setSummaryMode("group")}>Paper group</button></div>
            <div className="paper-summary-content" key={`${summaryMode}-${activeSource?.url}-${activeGroup?.id}-${query}`}>
              <h2>{summaryMode === "group" ? activeGroup?.name || "Group summary" : activeSource?.title || "No matching readings"}</h2>
              <p className="paper-summary-meta">{group.length} {group.length === 1 ? "reading" : "readings"} · {summaryMode === "connected" ? "Selected + directly linked" : "Inside this rectangle"}</p>
              <p>{synthesis.overview}</p>
              {group.length > 1 && <div className="paper-summary-findings"><h3>Findings in this group</h3>{group.slice(0, 3).map((source) => <p key={source.url}>{source.summary} <a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></p>)}{group.length > 3 && <small>Showing 3 contributions; all {group.length} are available below.</small>}</div>}
              {!!synthesis.insights.length && <><h3>Insights to explore</h3><ul>{synthesis.insights.map((insight) => <li key={insight}>{insight}</li>)}</ul></>}
              <p className="paper-summary-method">Based on atlas descriptions; insights are inferred reading prompts. Connections indicate text similarity, not citations or agreement.</p>
              {!!group.length && <details><summary>Read all {group.length} contributions</summary><ol>{group.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><p>{source.summary}</p></li>)}</ol></details>}
            </div>
          </>}
        </section>
        <div className="map-foot"><span>Oldest → newest from center outward · drag to explore · scroll or pinch to zoom</span></div>
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
                {entry.papers.map((paper) => <a key={paper.url} href={paper.url} target="_blank" rel="noreferrer"><i style={{background:topics.find((topic) => topic.name === paper.topic)?.color}}/><span>{paper.title}<small>{paper.topic} · {paper.kind}</small></span><b>↗</b></a>)}
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
